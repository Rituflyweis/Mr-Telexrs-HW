# Frontend HealthWarehouse Order Flow

Share this with FE for HealthWarehouse prescription order tracking and dashboard testing.

## Base URL

```txt
https://mr-telexrs-hw.vercel.app/api/v1
```

## Main FE APIs

### Doctor Order List

Use this for the medicine-order dashboard cards and list.

```http
GET /doctor/order/getOrdersForDoctor?page=1&limit=10&status=<status>
Authorization: Bearer <doctor_or_admin_token>
```

Supported status filters:

```txt
pending
confirmed
processing
shipped
delivered
cancelled
refunded
```

Dashboard mapping:

```txt
pending     -> Pending
confirmed   -> Processing / Sent to pharmacy
processing  -> Error
shipped     -> Shipped
delivered   -> Delivered
cancelled   -> Cancelled
refunded    -> Refunded
```

### Doctor Order Detail

Use this when opening an order from the doctor dashboard.

```http
GET /doctor/order/orders/:mongo_order_id
Authorization: Bearer <doctor_or_admin_token>
```

### Patient Tracking

Use this for the patient-facing tracking screen.

```http
GET /patient/orders/:mongo_order_id/tracking
Authorization: Bearer <patient_token>
```

The patient token must belong to the patient who owns the order.

## Important Response Fields

```txt
status              Local FE status
hw_status           Raw HealthWarehouse status
trackingNumber      Primary tracking number
shipments           Shipment list
has_tracking        true when tracking is available
last_tracking_sync  Last backend sync/update time
deliveryTimeline    UI-ready timeline array
tracking_events     Normalized event history
events              Raw stored HW events
```

## deliveryTimeline Shape

```json
[
  {
    "key": "order_placed",
    "label": "Order placed",
    "status": "completed",
    "completed": true,
    "timestamp": "2026-05-07T12:00:00.000Z",
    "message": "Order was created in TeleRxs."
  },
  {
    "key": "sent_to_pharmacy",
    "label": "Sent to pharmacy",
    "status": "completed",
    "completed": true,
    "timestamp": "2026-05-07T12:05:00.000Z",
    "message": "Prescription order was sent to HealthWarehouse."
  }
]
```

Timeline step `status` can be:

```txt
completed
current
pending
```

Common timeline keys:

```txt
order_placed
sent_to_pharmacy
pharmacy_processing
dispensed
shipped
delivered
transfer_failure
cancelled
refunded
```

## Testing Flow In Postman

Use the collection:

```txt
TeleRxs HW APIs.postman_collection.json
```

Use the folder:

```txt
HealthWarehouse Order Journey Testing
```

Set these variables:

```txt
base_url          https://mr-telexrs-hw.vercel.app/api/v1
admin_token       Admin/sub-admin JWT
patient_token     Patient JWT, only needed for patient tracking verification
mongo_order_id    Mongo _id of an order already sent to HealthWarehouse
tracking_number   Any test tracking number
shipment_id       Any test shipment id
order_status      Status filter for doctor list verification
```

Important: the order must first be sent to HealthWarehouse through:

```http
POST /doctor/order/ordersByDoctorWithPrescription
```

After that, use the Postman journey requests:

```txt
1. Set Status - Processing
2. Set Status - Transfer Success
3. Set Status - Transfer Failure
4. Set Status - Dispensed
5. Set Status - Complete With Tracking
6. Set Status - Delivered With Tracking
7. Set Status - Canceled
8. Set Status - Refunded
9. Verify Doctor Order Detail + Timeline
10. Verify Patient Tracking + Timeline
11. Verify Doctor Orders List By Status
```

## Production Behavior

In production, FE should not call the admin test journey API.

Production updates come from HealthWarehouse webhooks and backend polling fallback. FE should only read the doctor list/detail or patient tracking APIs.

## Testing Notes

`delivered` and `refunded` are test-only local UI states in the journey endpoint. They are included so FE can verify every dashboard card without manually editing MongoDB.

`complete` maps to local `shipped` and should show tracking data.

`transfer_failure` maps to local `processing`, which the current doctor dashboard uses for the Error bucket.
