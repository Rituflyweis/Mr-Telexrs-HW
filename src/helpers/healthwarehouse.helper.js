const HW = require('./../services/healthwarehouse.api');

const createPatient = async (user, patient, hwCustomerId) => {
  const payload = {
    patient: {
      customer_id: hwCustomerId,
      prefix: user.prefix || '',
      first_name: user.firstName,
      middle_name: user.middleName || '',
      last_name: user.lastName,
      suffix: user.suffix || '',
      gender: patient.gender || '',
      dob: patient.dateOfBirth || '',
      drug_allergy: patient.drugAllergy || 'none',
      other_medications: patient.otherMedications || 'none',
      medical_conditions: patient.medicalConditions || 'none',
      safety_cap: patient.safetyCap || false,
      // metadata: {
      //   partner_patient_id: patient._id.toString()
      // }
    }
  };

  const response = await HW.createPatient(payload);

  return {
    hw_patient_id: response.patient.id
  };
};

const createCustomerAndPatient = async (user, patient, addressData) => {
  const hwAddress = {
    prefix: addressData.prefix || '',
    first_name: addressData.firstName,
    middle_name: addressData.middleName || '',
    last_name: addressData.lastName,
    suffix: addressData.suffix || '',
    company: addressData.company || '',
    address1: addressData.addressLine1,
    address2: addressData.addressLine2 || '',
    city: addressData.city,
    state: addressData.state,
    country: addressData.country || 'US',
    postal_code: addressData.postalCode,
    phone: addressData.phone,
    phone_evening: addressData.phoneEvening || '',
    fax: addressData.fax || '',
    label: 'home'
  };

  const payload = {
    patient: {
      customer: {
        prefix: user.prefix || '',
        first_name: user.firstName,
        middle_name: user.middleName || '',
        last_name: user.lastName,
        suffix: user.suffix || '',
        email: user.email,
        gender: user.gender || 'male',
        dob: user.dob || "1990-01-01",
        billing_addresses: [hwAddress] || [],
        shipping_addresses: [hwAddress] || [],
        metadata: {
          partner_customer_id: user._id.toString()
        }
      },
      prefix: user.prefix || '',
      first_name: user.firstName,
      middle_name: user.middleName || '',
      last_name: user.lastName,
      suffix: user.suffix || '',
      gender: user.gender || 'male',
      dob: user.dob || "1990-01-01",
      drug_allergy: patient.drugAllergy || 'none',
      other_medications: patient.otherMedications || 'none',
      medical_conditions: patient.medicalConditions || 'none',
      safety_cap: patient.safetyCap || false,
      metadata: {
        partner_patient_id: patient._id.toString()
      }
    }
  };

  const minimalPayload = {
    "patient": {
      "first_name": user.firstName,
      "last_name": user.lastName,
      "gender": "male",
      "dob": patient.dateOfBirth,
      "drug_allergy": "none",
      "other_medications": "none",
      "medical_conditions": "none",
      "customer": {
        "first_name": user.firstName,
        "last_name": user.lastName,
        "email": user.email,
        "gender": "male",
        "dob": "1985-06-15",
        "billing_addresses": [
          {
            "first_name": user.firstName,
            "last_name": user.lastName,
            "address1": addressData.addressLine1,
            "city": addressData.city,
            "state": addressData.state,
            "country": addressData.country,
            "postal_code": addressData.postalCode,
            "phone": addressData.phoneNumber
          }
        ],
        "shipping_addresses": [
          {
            "first_name": user.firstName,
            "last_name": user.lastName,
            "address1": addressData.addressLine1,
            "city": addressData.city,
            "state": addressData.state,
            "country": addressData.country,
            "postal_code": addressData.postalCode,
            "phone": addressData.phoneNumber
          }
        ]
      }
    }
  };

  const response = await HW.createPatient(minimalPayload);

  return {
    hw_customer_id: response.patient.customer_id,
    hw_patient_id: response.patient.id,
    hw_address_id: response.customer?.billing_addresses?.[0]?.address_id
  };
};

const createCustomer = async (user, patient, addressData) => {
  const hwAddress = {
    prefix: addressData.prefix || '',
    first_name: addressData.firstName,
    middle_name: addressData.middleName || '',
    last_name: addressData.lastName,
    suffix: addressData.suffix || '',
    company: addressData.company || '',
    address1: addressData.addressLine1,
    address2: addressData.addressLine2 || '',
    city: addressData.city,
    state: addressData.state,
    country: (addressData.country || 'US').replace(/^USA$/i, 'US'),
    postal_code: addressData.postalCode,
    phone: addressData.phone || addressData.phoneNumber || '',
    phone_evening: addressData.phoneEvening || '',
    fax: addressData.fax || '',
    label: 'Home Address'
  };

  const payload = {
    customer: {
      prefix: user.prefix || '',
      first_name: user.firstName,
      middle_name: user.middleName || '',
      last_name: user.lastName,
      suffix: user.suffix || '',
      email: user.email,
      //  gender: patient.gender || '',
      //  dob: patient.dob || '',
      billing_addresses: [hwAddress] || [],
      shipping_addresses: [hwAddress] || [],
      // metadata: {
      //   partner_customer_id: user._id.toString()
      // }
    }
  };

  const addr = payload.customer.billing_addresses[0];
  console.log('[HW createCustomer] payload:', JSON.stringify(payload, null, 2));
  console.log('[HW createCustomer] address state value:', JSON.stringify(addr?.state), '| city:', addr?.city, '| postal_code:', addr?.postal_code, '| country:', addr?.country);

  if (!addr?.state) {
    throw new Error(`HW createCustomer aborted: state is missing in address (got: ${JSON.stringify(addr?.state)})`);
  }

  const response = await HW.createCustomer(payload);

  return {
    hw_customer_id: response.customer.id,
    hw_address_id: response.customer.shipping_addresses?.[0]?.address_id
  };
};

const addAddressToCustomer = async (hwCustomerId, addressId, addressData) => {
  const hwAddress = {
    address: {
      prefix: addressData.prefix || '',
      first_name: addressData.firstName,
      middle_name: addressData.middleName || '',
      last_name: addressData.lastName,
      suffix: addressData.suffix || '',
      company: addressData.company || '',
      address1: addressData.addressLine1,
      address2: addressData.addressLine2 || '',
      city: addressData.city,
      state: addressData.state,
      country: addressData.country || 'US',
      postal_code: addressData.postalCode,
      phone: addressData.phone,
      phone_evening: addressData.phoneEvening || '',
      fax: addressData.fax || '',
      label: 'Home Address'
    }
  };

  const response = await HW.updateCustomerAddress(
    hwCustomerId,
    addressId,
    hwAddress,
    'shipping'
  );

  return {
    hw_address_id: response.address?.address_id
  };
};

const getCustomer = async (customerId) => {
  const response = await HW.getCustomer(customerId);

  console.log(`Retrieved customer ${customerId} from HealthWarehouse`);

  return {
    hw_customer_id: response.customer.id,
    hw_customer: response.customer,
    billing_address_id: response.customer.billing_addresses?.[0]?.address_id,
    shipping_address_id: response.customer.shipping_addresses?.[0]?.address_id
  };
};

const updateCustomer = async (hwCustomerId, user, patient) => {
  const payload = {
    customer: {
      prefix: user.prefix || '',
      first_name: user.firstName,
      middle_name: user.middleName || '',
      last_name: user.lastName,
      suffix: user.suffix || '',
      email: user.email,
      gender: patient.gender || '',
      dob: patient.dateOfBirth || ''
    }
  };

  console.log('Updating HW Customer:', JSON.stringify(payload, null, 2));

  const response = await HW.updateCustomer(hwCustomerId, payload);

  return {
    hw_customer_id: response.customer.id,
    updated: true
  };
};

const updatePatient = async (hwPatientId, patient, user) => {
  const payload = {
    patient: {
      customer_id: patient.hw_customer_id,
      prefix: user.prefix || '',
      first_name: user.firstName,
      middle_name: user.middleName || '',
      last_name: user.lastName,
      suffix: user.suffix || '',
      gender: patient.gender || user.gender || '',
      dob: patient.dateOfBirth || user.dob || '',
      drug_allergy: patient.drugAllergy || 'none',
      other_medications: patient.otherMedications || 'none',
      medical_conditions: patient.medicalConditions || 'none',
      safety_cap: patient.safetyCap || false
    }
  };

  try {
    const response = await HW.updatePatient(hwPatientId, payload);
    console.log(`HW Patient ${hwPatientId} updated successfully`);
    return {
      hw_patient_id: response.patient.id,
      updated: true,
      updated_at: response.patient.updated_at
    };
  } catch (error) {
    console.error('Failed to update HW patient:', error);
    throw error;
  }
};

const mapShippingMethod = (method) => {
  const mapping = {
    'free': 'free',
    'standard': 'standard',
    'express': 'ups_2day',
    'overnight': 'ups_nextday'
  };
  return mapping[method] || 'standard';
};

const buildHWOrderPayload = (order, patient, addresses) => {
  // Get shipping address
  const shippingAddress = addresses.shippingAddress || order.shippingAddress;
  const billingAddress = addresses.billingAddress || order.billingAddress;

  console.log(order.items, 'ITEMS')

  // Map line items to HW format
  const lineItems = order.items.map(item => {
    // Get HW product ID - you need to store this mapping in your Medicine model
    // const hwProductId = parseInt(item.productId);
    const hwProductId = 101 || 102 || 103;

    if (!hwProductId) {
      console.warn(`No HW product ID mapping found for product: ${item.medicationName || item.productId}`);
    }

    return {
      product_id: hwProductId,
      qty: item.quantity
    };
  });

  return {
    order: {
      customer_id: patient.hw_customer_id,
      patient_id: patient.hw_patient_id,
      billing_address_id: shippingAddress?.hw_address_id,
      shipping_address_id: shippingAddress?.hw_address_id,
      order_comment: order.notes || `TelRxs Order #${order.orderNumber || order._id}`,
      shipping_method: mapShippingMethod(order.shippingMethod || 'standard'),
      line_items: lineItems,
      // metadata: {
      //   partner_order_id: order._id.toString(),
      //   telrxs_order_number: order.orderNumber,
      //   telrxs_patient_id: patient._id.toString()
      // }
    }
  };
};

const createOrder = async (order, patient, addresses) => {
  // Validate required data
  if (!patient.hw_customer_id) {
    throw new Error('Customer not synced with pharmacy. Please add address first.');
  }

  if (!patient.hw_patient_id) {
    throw new Error('Patient not synced with pharmacy. Please update profile first.');
  }

  if (!addresses.shippingAddress?.hw_address_id) {
    throw new Error('Shipping address not synced with pharmacy.');
  }

  // Build payload
  const payload = buildHWOrderPayload(order, patient, addresses);

  console.log('Sending order to HealthWarehouse:', JSON.stringify(payload, null, 2));

  // Send to HealthWarehouse
  const response = await HW.createOrder(payload);

  const result = {
    hw_order_id: response.order?.id,
    hw_status: response.order?.status,
    success: true
  };

  // Handle split orders (when order has both RX and OTC items)
  if (response.split_order) {
    result.hw_split_order_id = response.split_order.id;
    result.split_order_status = response.split_order.status;
    console.log(`Order split: Main HW Order: ${response.order.id}, Split HW Order: ${response.split_order.id}`);
  }

  return result;
};

const parseRefills = (refillsAllowed) => {
  if (!refillsAllowed) return 0;
  if (typeof refillsAllowed === 'number') return refillsAllowed;
  const lower = refillsAllowed.toLowerCase();
  if (lower.includes('no') || lower === '0') return 0;
  const match = lower.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const buildPrescriptionOrderPayload = (order, patient, user, addresses, prescriptionData, doctor) => {
  const shippingAddress = addresses?.shippingAddress || order.shippingAddress;

  const shippingAddressId = shippingAddress?.hw_address_id;
  const billingAddressId = shippingAddress?.hw_address_id;

  console.log('Shipping_address_id', shippingAddressId);

  if (!shippingAddressId) {
    throw new Error('Shipping address not synced with pharmacy');
  }

  const medicines = prescriptionData.medicines || [];
  const commonInstruction = prescriptionData.instruction || order.notes || 'As directed';
  const commonWarning = prescriptionData.warning || '';
  const commonSymptoms = Array.isArray(prescriptionData.symptoms) && prescriptionData.symptoms.length
    ? `Symptoms: ${prescriptionData.symptoms.join(', ')}`
    : '';
  const comments = [commonInstruction, commonWarning, commonSymptoms].filter(Boolean).join(' | ');

  const patientInfo = {
    prefix: prescriptionData.patientInfo?.prefix || '',
    first_name: user.firstName,
    middle_name: prescriptionData.patientInfo?.middleName || '',
    last_name: user.lastName,
    suffix: prescriptionData.patientInfo?.suffix || '',
    address1: prescriptionData.patientInfo?.address1 || shippingAddress.addressLine1,
    address2: prescriptionData.patientInfo?.address2 || shippingAddress.addressLine2 || '',
    city: prescriptionData.patientInfo?.city || shippingAddress.city,
    state: prescriptionData.patientInfo?.state || shippingAddress.state,
    country: prescriptionData.patientInfo?.country || 'US',
    postal_code: prescriptionData.patientInfo?.postalCode || shippingAddress.postalCode,
    dob: prescriptionData.patientInfo?.dob || patient.dateOfBirth
  };

  const prescriberInfo = {
    first_name: doctor?.firstName || '',
    last_name: doctor?.lastName || '',
    address: doctor?.address || '126',
    city: doctor?.city || 'New York',
    state: doctor?.state || 'NY',
    postal_code: doctor?.postalCode || '10004',
    phone: prescriptionData.prescriber?.phone || doctor?.phone,
    fax: doctor?.fax || '555-555-8888',
    npi_number: doctor?.npiNumber || '0000000000',
    license_number: doctor?.licenseNumber || '123456',
    dea_number: doctor?.deaNumber || 'AA1234560'
  };

  // Match each order item to its corresponding medicine by index
  const lineItems = order.items.map((item, index) => {
    const med = medicines[index] || {};

    const lineItem = {
      product_id: 101,
      qty: item.quantity,
      product_name: med.name || item.medicationName,
    };

    if (prescriptionData.isNewPrescription) {
      lineItem.prescription = {
        patient_info: patientInfo,
        medication: {
          name: med.name || item.medicationName,
          quantity: item.quantity,
          refills: parseRefills(med.refillsAllowed),
          directions: commonInstruction,
          sig_code: prescriptionData?.sigCode || '',
          daw: prescriptionData?.daw || false,
          units_dose: med.description || '',
          dose_frequency: med.frequency || '',
          duration: med.duration || ''
        },
        prescriber: prescriberInfo,
        comments_instructions: comments
      };
    }

    return lineItem;
  });

  return {
    order: {
      customer_id: patient.hw_customer_id,
      patient_id: patient.hw_patient_id,
      billing_address_id: billingAddressId,
      shipping_address_id: shippingAddressId,
      order_comment: order.notes || `TelRxs Prescription Order #${order.orderNumber}`,
      shipping_method: mapShippingMethod(order.shippingMethod || 'standard'),
      line_items: lineItems,
    }
  };
};

// Create order with new prescription
const createOrderWithNewPrescription = async (order, patient, user, addresses, prescriptionData, doctor) => {
  // Validate required data
  if (!patient.hw_customer_id) {
    throw new Error('Customer not synced with pharmacy');
  }

  if (!patient.hw_patient_id) {
    throw new Error('Patient not synced with pharmacy');
  }

  console.log('Addresses of create order by doctor', addresses, addresses?.shippingAddress?.hw_address_id);

  if (!addresses?.shippingAddress?.hw_address_id) {
    throw new Error('Shipping address not synced with pharmacy');
  }

  // Validate prescription data
  if (!prescriptionData) {
    throw new Error('Prescription data is required for new prescription order');
  }

  if (!prescriptionData.prescriber?.phone) {
    throw new Error('Prescriber phone number is required');
  }

  if (!prescriptionData.medicines || !Array.isArray(prescriptionData.medicines) || prescriptionData.medicines.length === 0) {
    throw new Error('At least one medication is required');
  }

  // Build payload with prescription
  const payload = buildPrescriptionOrderPayload(order, patient, user, addresses, prescriptionData, doctor);

  console.log('Sending new prescription order to HW:', JSON.stringify(payload, null, 2));

  // Send to HealthWarehouse
  const response = await HW.createOrder(payload);

  const result = {
    hw_order_id: response.order?.id,
    hw_status: response.order?.status,
    success: true,
    is_prescription_order: true
  };

  if (response.split_order) {
    result.hw_split_order_id = response.split_order.id;
    result.split_order_status = response.split_order.status;
  }

  return result;
};

// Get tracking information for an order
const getOrderTracking = async (hwOrderId) => {
  try {
    // First, get order status
    const orderData = await HW.getOrder(hwOrderId);
    const orderStatus = orderData?.order?.status;

    if (!orderStatus) {
      const details = orderData ? JSON.stringify(orderData) : null;
      throw new Error(
        details
          ? `Unable to fetch HealthWarehouse order status for order ${hwOrderId}: ${details}`
          : `Unable to fetch HealthWarehouse order status for order ${hwOrderId}`
      );
    }

    // Check if order is still processing (no shipment yet)
    const isProcessing = ['processing', 'transfer_success', 'transfer_failure'].includes(orderStatus);
    const isShipped = ['dispensed', 'complete'].includes(orderStatus);
    const isCancelled = orderStatus === 'canceled';

    let shipments = [];
    let trackingInfo = [];
    let trackingNumber = null;

    // Only fetch shipments if order has progressed beyond processing
    if (isShipped || orderStatus === 'complete') {
      try {
        const shipmentsData = await HW.getShipments(hwOrderId);
        shipments = shipmentsData?.shipments?.shipments || [];
        trackingNumber = shipments[0]?.tracking_number || null;

        trackingInfo = shipments.map(shipment => ({
          tracking_number: shipment.tracking_number,
          carrier_code: shipment.carrier_code,
          carrier_title: shipment.carrier_title,
          items_shipped: shipment.items_shipped,
          status: shipment.status
        }));
      } catch (error) {
        const statusCode = error?.statusCode || error?.status;
        if (statusCode === 404) {
          // It's okay if shipments not found - order might still be processing
          console.log(`No shipments found for order ${hwOrderId} (still processing)`);
        } else {
          throw error;
        }
      }
    }

    // Return appropriate response based on order status
    return {
      hw_order_id: hwOrderId,
      order_status: orderStatus,
      order_status_description: mapOrderStatusToText(orderStatus, isProcessing, isShipped),
      shipments: trackingInfo,
      total_shipments: trackingInfo.length,
      has_tracking: trackingInfo.length > 0,
      is_processing: isProcessing,
      is_shipped: isShipped,
      is_cancelled: isCancelled,
      estimated_message: getEstimatedMessage(orderStatus),
      last_updated: new Date(),
      tracking_number: trackingNumber
    };

  } catch (error) {
    console.error('Failed to get tracking info:', error);
    throw error;
  }
};

// Get estimated message based on status
const getEstimatedMessage = (status) => {
  switch (status) {
    case 'processing':
      return 'Estimated processing time: 1-2 business days';
    case 'transfer_success':
      return 'Estimated processing time: 1-2 business days';
    case 'dispensed':
      return 'Estimated shipping: within 24 hours';
    case 'complete':
      return 'Tracking available below';
    default:
      return null;
  }
};

// Map order status to user-friendly text with context
const mapOrderStatusToText = (status, isProcessing, isShipped) => {
  if (status === 'processing') {
    return 'Your order is being reviewed by the pharmacy. Shipment details will appear once available.';
  }
  if (status === 'transfer_success') {
    return 'Prescription has been transferred successfully. Pharmacy is processing your order.';
  }
  if (status === 'transfer_failure') {
    return 'Prescription transfer failed. Please contact support.';
  }
  if (status === 'dispensed') {
    return 'Your medication has been dispensed and is being prepared for shipment.';
  }
  if (status === 'complete') {
    return 'Your order has been shipped! Tracking details are available below.';
  }
  if (status === 'canceled') {
    return 'Your order was canceled.';
  }
  return `Order status: ${status || 'Unknown'}`;
};

// Map carrier status
const mapCarrierStatus = (status) => {
  const mapping = {
    'pre-transit': 'Label created, awaiting carrier pickup',
    'transit': 'In transit',
    'delivered': 'Delivered',
    'failure': 'Delivery failed'
  };
  return mapping[status] || status || 'Status unknown';
};

// Sync tracking info to your order
const syncTrackingToOrder = async (telRxsOrderId, hwOrderId) => {
  const trackingInfo = await getOrderTracking(hwOrderId);

  // Update your order with tracking info
  const order = await Order.findById(telRxsOrderId);

  if (!order) {
    throw new Error(`Order ${telRxsOrderId} not found`);
  }

  // Update order status based on HW status
  const statusMapping = {
    'processing': 'confirmed',
    'dispensed': 'processing',
    'complete': 'shipped',
    'canceled': 'cancelled'
  };

  order.hw_status = trackingInfo.order_status;
  order.status = statusMapping[trackingInfo.order_status] || order.status;

  // Store tracking information
  if (trackingInfo.shipments.length > 0) {
    // order.tracking_info = trackingInfo.shipments.map(s => ({
    //   tracking_number: s.tracking_number,
    //   carrier: s.carrier_title,
    //   carrier_code: s.carrier_code,
    //   status: s.status,
    //   items_shipped: s.items_shipped,
    //   last_checked: new Date()
    // }));

    // Set primary tracking number for easy access
    order.trackingNumber = trackingInfo.shipments[0]?.tracking_number;
    // order.carrier = trackingInfo.shipments[0]?.carrier_title;
  }

  order.last_tracking_sync = new Date();
  await order.save();

  return trackingInfo;
};

// Cancel Order
const cancelOrder = async (orderId) => {
  if (!orderId) {
    throw new Error('Order ID is required to cancel order');
  }

  console.log(`Cancelling order ${orderId} with HealthWarehouse`);

  const response = await HW.cancelOrder(orderId);

  console.log(`Order ${orderId} cancelled successfully from HealthWarehouse`);

  return {
    success: true,
    hw_order_id: response.order_id || orderId,
    status: response.status,
    message: response.message || `Order ${orderId} was canceled`,
    canceled_at: new Date()
  };
};


module.exports = {
  createPatient,
  createCustomerAndPatient,
  createCustomer,
  addAddressToCustomer,
  getCustomer,
  updateCustomer,
  updatePatient,
  buildHWOrderPayload,
  createOrder,
  mapShippingMethod,
  createOrderWithNewPrescription,
  getOrderTracking,
  cancelOrder,
  syncTrackingToOrder
};
