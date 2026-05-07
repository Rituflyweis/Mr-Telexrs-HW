# HealthWarehouse Order Journey Testing

Use this guide to test the frontend order tracking UI without waiting for real HealthWarehouse production webhooks.

## Backend API

```http
POST /api/v1/admin/healthwarehouse/test-orders/:orderId/journey
Authorization: Bearer <admin_or_subadmin_token>
Content-Type: application/json
```

`orderId` is the Mongo order `_id`, not the HealthWarehouse `hw_order_id`.

This endpoint works only in test/dev mode. Production tracking still comes from HealthWarehouse webhooks.

## Postman Setup

Open `TeleRxs HW APIs.postman_collection.json` and use the folder:

```txt
HealthWarehouse Order Journey Testing
```

Set these collection variables:

```txt
admin_token      Admin or sub-admin JWT
mongo_order_id   Mongo _id of the order to test
tracking_number  Test tracking number, for example TESTTRACK123456
shipment_id      Test shipment ID, for example TEST-SHIP-001
```

## Status Test Requests

### Processing

Use this when HealthWarehouse has received the order but no shipment exists.

```json
{
  "status": "processing",
  "message": "Test: order received by HealthWarehouse."
}
```

Expected local order status: `confirmed`

### Transfer Success

Use this for prescription-transfer test orders when the transfer succeeds.

```json
{
  "status": "transfer_success",
  "message": "Test: prescription transfer succeeded."
}
```

Expected local order status: `confirmed`

### Transfer Failure

Use this for prescription-transfer test orders when the transfer fails.

```json
{
  "status": "transfer_failure",
  "message": "Test: prescription transfer failed."
}
```

Expected local order status: `processing`

### Dispensed

Use this when the pharmacy has dispensed the medication but tracking is not ready yet.

```json
{
  "status": "dispensed",
  "message": "Test: medication dispensed."
}
```

Expected local order status: `dispensed`

### Complete With Tracking

Use this to test the shipped state and populate tracking data.

```json
{
  "status": "complete",
  "tracking_number": "TESTTRACK123456",
  "shipment_id": "TEST-SHIP-001",
  "carrier_code": "usps",
  "carrier_title": "United States Postal Service",
  "items_shipped": 1,
  "message": "Test: order shipped with tracking."
}
```

Expected local order status: `shipped`

### Canceled

Use this to test cancellation UI.

```json
{
  "status": "canceled",
  "message": "Test: order canceled."
}
```

Expected local order status: `cancelled`

## Frontend Verification

After each update, FE should call:

```http
GET /api/v1/patient/orders/:orderId/tracking
Authorization: Bearer <patient_token>
```

Check these response fields:

```txt
status              User-facing local status
hw_status           Raw HealthWarehouse status
trackingNumber      Primary tracking number
shipments           Shipment list
has_tracking        true after tracking is added
last_tracking_sync  Last backend update time
events              Latest tracking/status history
```

For `complete`, FE should show the tracking number and shipment details. For earlier statuses, FE should show that tracking is not available yet.
