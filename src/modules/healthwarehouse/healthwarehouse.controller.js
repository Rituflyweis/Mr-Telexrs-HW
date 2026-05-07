const Order = require('../../models/Order.model');
const AppError = require('../../utils/AppError');
const HW = require('../../services/healthwarehouse.api');
const HWHelper = require('../../helpers/healthwarehouse.helper');
const config = require('../../config/healthwarehouse');

const VALID_HW_STATUSES = new Set([
  'processing',
  'transfer_success',
  'transfer_failure',
  'dispensed',
  'complete',
  'canceled'
]);
const VALID_TEST_JOURNEY_STATUSES = new Set([
  ...VALID_HW_STATUSES,
  'delivered',
  'refunded'
]);

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
};

const verifyWebhookToken = (req, res) => {
  const expectedToken = process.env.HW_WEBHOOK_TOKEN;

  if (!expectedToken && process.env.NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      message: 'HealthWarehouse webhook token is not configured'
    });
    return false;
  }

  if (expectedToken && getBearerToken(req) !== expectedToken) {
    res.status(401).json({
      success: false,
      message: 'Invalid HealthWarehouse webhook token'
    });
    return false;
  }

  return true;
};

const parseHWOrderId = (value) => {
  const hwOrderId = Number(value);
  return Number.isFinite(hwOrderId) && hwOrderId > 0 ? hwOrderId : null;
};

const assertValidStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();

  if (!VALID_HW_STATUSES.has(normalized)) {
    throw new AppError('Invalid HealthWarehouse status', 400);
  }

  return normalized;
};

const assertValidJourneyStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();

  if (!VALID_TEST_JOURNEY_STATUSES.has(normalized)) {
    throw new AppError('Invalid HealthWarehouse test journey status', 400);
  }

  return normalized;
};

exports.handleOrderWebhook = async (req, res, next) => {
  try {
    if (!verifyWebhookToken(req, res)) return;

    const hwOrderId = parseHWOrderId(req.body.order_id);
    if (!hwOrderId) throw new AppError('order_id is required', 400);

    const status = assertValidStatus(req.body.status);
    const order = await HWHelper.applyOrderStatusUpdate(hwOrderId, status, {
      message: req.body.message,
      source: 'webhook',
      rawPayload: req.body
    });

    res.status(200).json({
      success: true,
      data: {
        order_id: order._id,
        hw_order_id: order.hw_order_id,
        hw_status: order.hw_status,
        status: order.status
      }
    });
  } catch (error) {
    if (/not found/i.test(error.message)) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.handleShipmentWebhook = async (req, res, next) => {
  try {
    if (!verifyWebhookToken(req, res)) return;

    const hwOrderId = parseHWOrderId(req.body.order_id);
    if (!hwOrderId) throw new AppError('order_id is required', 400);

    const status = req.body.status ? assertValidStatus(req.body.status) : undefined;
    const order = await HWHelper.applyShipmentUpdate(
      hwOrderId,
      {
        shipment_id: req.body.shipment_id,
        tracking_number: req.body.tracking_number,
        carrier_code: req.body.carrier_code,
        carrier_title: req.body.carrier_title,
        items_shipped: req.body.items_shipped,
        status
      },
      {
        source: 'webhook',
        rawPayload: req.body
      }
    );

    res.status(200).json({
      success: true,
      data: {
        order_id: order._id,
        hw_order_id: order.hw_order_id,
        hw_status: order.hw_status,
        status: order.status,
        trackingNumber: order.trackingNumber
      }
    });
  } catch (error) {
    if (/not found/i.test(error.message)) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.simulateOrderStatus = async (req, res, next) => {
  try {
    if (!config.allowTestJourneyUpdates) {
      throw new AppError('HealthWarehouse status simulation is only available in test mode', 403);
    }

    const hwOrderId = parseHWOrderId(req.params.orderId);
    if (!hwOrderId) throw new AppError('Valid HealthWarehouse order ID is required', 400);

    const status = assertValidStatus(req.body.status);
    const order = await Order.findOne({ hw_order_id: hwOrderId });
    if (!order) throw new AppError(`Order with HW order ID ${hwOrderId} not found`, 404);

    const simulation = await HW.simulateOrderStatus(hwOrderId, status);
    const tracking = await HWHelper.syncTrackingToOrder(order._id, hwOrderId, 'simulation');

    res.status(200).json({
      success: true,
      message: 'HealthWarehouse order status simulated successfully',
      data: {
        simulation,
        tracking
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTestOrderJourney = async (req, res, next) => {
  try {
    if (!config.allowTestJourneyUpdates) {
      throw new AppError('HealthWarehouse test order updates are only available in test mode', 403);
    }

    const status = assertValidJourneyStatus(req.body.status);
    const order = await Order.findById(req.params.orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (!order.hw_order_id) throw new AppError('Order has not been sent to HealthWarehouse yet', 400);

    if (status === 'refunded') {
      order.status = 'refunded';
      order.paymentStatus = 'refunded';
      order.hw_status_message = req.body.message || 'Test: order payment refunded.';
      order.last_tracking_sync = new Date();
      await order.save();

      await HWHelper.recordHealthWarehouseEvent({
        order,
        hwOrderId: order.hw_order_id,
        eventType: 'order',
        source: 'simulation',
        hwStatus: 'refunded',
        localStatus: 'refunded',
        message: order.hw_status_message,
        rawPayload: req.body,
        idempotencyKey: `simulation:order:${order.hw_order_id}:refunded`
      });

      return res.status(200).json({
        success: true,
        message: 'Test order journey updated successfully',
        data: {
          order_id: order._id,
          hw_order_id: order.hw_order_id,
          hw_status: order.hw_status,
          status: order.status,
          paymentStatus: order.paymentStatus,
          trackingNumber: order.trackingNumber || null,
          shipments: order.shipments || [],
          has_tracking: Boolean(order.trackingNumber || order.shipments?.length),
          last_tracking_sync: order.last_tracking_sync
        }
      });
    }

    if (status === 'delivered') {
      const trackingNumber = req.body.tracking_number || req.body.trackingNumber || order.trackingNumber || `TESTTRACK-${order.hw_order_id}`;
      const shipmentId = req.body.shipment_id || req.body.shipmentId || `TEST-SHIP-${order.hw_order_id}`;

      await HWHelper.applyOrderStatusUpdate(order.hw_order_id, 'complete', {
        message: req.body.message || 'Test: order shipped before delivery.',
        source: 'simulation',
        rawPayload: {
          ...req.body,
          status: 'complete',
          requested_status: 'delivered'
        }
      });

      const shipmentOrder = await HWHelper.applyShipmentUpdate(
        order.hw_order_id,
        {
          shipment_id: shipmentId,
          tracking_number: trackingNumber,
          carrier_code: req.body.carrier_code || req.body.carrierCode || 'usps',
          carrier_title: req.body.carrier_title || req.body.carrierTitle || 'United States Postal Service',
          items_shipped: req.body.items_shipped ?? req.body.itemsShipped ?? 1,
          status: 'complete'
        },
        {
          source: 'simulation',
          rawPayload: {
            ...req.body,
            status: 'complete',
            requested_status: 'delivered'
          }
        }
      );

      shipmentOrder.status = 'delivered';
      shipmentOrder.deliveredAt = req.body.delivered_at ? new Date(req.body.delivered_at) : new Date();
      shipmentOrder.hw_status = 'complete';
      shipmentOrder.hw_status_message = req.body.message || 'Test: order delivered.';
      shipmentOrder.last_tracking_sync = new Date();
      await shipmentOrder.save();

      await HWHelper.recordHealthWarehouseEvent({
        order: shipmentOrder,
        hwOrderId: shipmentOrder.hw_order_id,
        eventType: 'shipment',
        source: 'simulation',
        hwStatus: 'delivered',
        localStatus: 'delivered',
        message: shipmentOrder.hw_status_message,
        shipment: {
          shipment_id: shipmentId,
          tracking_number: trackingNumber,
          carrier_code: req.body.carrier_code || req.body.carrierCode || 'usps',
          carrier_title: req.body.carrier_title || req.body.carrierTitle || 'United States Postal Service',
          items_shipped: req.body.items_shipped ?? req.body.itemsShipped ?? 1,
          status: 'delivered'
        },
        rawPayload: req.body,
        idempotencyKey: `simulation:shipment:${shipmentOrder.hw_order_id}:${shipmentId}:${trackingNumber}:delivered`
      });

      return res.status(200).json({
        success: true,
        message: 'Test order journey updated successfully',
        data: {
          order_id: shipmentOrder._id,
          hw_order_id: shipmentOrder.hw_order_id,
          hw_status: shipmentOrder.hw_status,
          status: shipmentOrder.status,
          deliveredAt: shipmentOrder.deliveredAt,
          trackingNumber: shipmentOrder.trackingNumber || null,
          shipments: shipmentOrder.shipments || [],
          has_tracking: Boolean(shipmentOrder.trackingNumber || shipmentOrder.shipments?.length),
          last_tracking_sync: shipmentOrder.last_tracking_sync
        }
      });
    }

    const updatedOrder = await HWHelper.applyOrderStatusUpdate(order.hw_order_id, status, {
      message: req.body.message || `Test status updated to ${status}.`,
      source: 'simulation',
      rawPayload: req.body
    });

    const trackingNumber = req.body.tracking_number || req.body.trackingNumber;
    const hasShipmentPayload = Boolean(
      trackingNumber ||
      req.body.shipment_id ||
      req.body.shipmentId ||
      req.body.carrier_code ||
      req.body.carrier_title
    );

    let shipmentOrder = updatedOrder;

    if (hasShipmentPayload) {
      shipmentOrder = await HWHelper.applyShipmentUpdate(
        order.hw_order_id,
        {
          shipment_id: req.body.shipment_id || req.body.shipmentId || `TEST-SHIP-${order.hw_order_id}`,
          tracking_number: trackingNumber,
          carrier_code: req.body.carrier_code || req.body.carrierCode || 'usps',
          carrier_title: req.body.carrier_title || req.body.carrierTitle || 'United States Postal Service',
          items_shipped: req.body.items_shipped ?? req.body.itemsShipped ?? 1,
          status
        },
        {
          source: 'simulation',
          rawPayload: req.body
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Test order journey updated successfully',
      data: {
        order_id: shipmentOrder._id,
        hw_order_id: shipmentOrder.hw_order_id,
        hw_status: shipmentOrder.hw_status,
        status: shipmentOrder.status,
        trackingNumber: shipmentOrder.trackingNumber || null,
        shipments: shipmentOrder.shipments || [],
        has_tracking: Boolean(shipmentOrder.trackingNumber || shipmentOrder.shipments?.length),
        last_tracking_sync: shipmentOrder.last_tracking_sync
      }
    });
  } catch (error) {
    next(error);
  }
};
