# HealthWarehouse Order Journey cURL Runbook

Use this runbook when you want the test journey to update HealthWarehouse test first, then verify what the frontend will see.

## IDs Used Below

Mongo order ID:

```txt
69fc54d9dcb69c5953aef89f
```

HealthWarehouse order ID:

```txt
61491
```

Replace `paste_admin_or_subadmin_jwt_here` and `paste_patient_jwt_here` with real tokens before sending.

## 1. Confirm Current Tracking State

```bash
curl --location "https://mr-telerxs-n-backend.onrender.com/api/v1/patient/orders/69fc54d9dcb69c5953aef89f/tracking" \
  --header "Authorization: Bearer paste_patient_jwt_here"
```

Expected result before shipment: `has_tracking` is `false`, and `trackingNumber` is `null`.

## 2. Simulate Processing on HealthWarehouse Test

```bash
curl --location --request POST "https://mr-telerxs-n-backend.onrender.com/api/v1/admin/healthwarehouse/orders/61491/simulate-status" \
  --header "Authorization: Bearer paste_admin_or_subadmin_jwt_here" \
  --header "Content-Type: application/json" \
  --data '{
    "status": "processing"
  }'
```

Verify:

```bash
curl --location "https://mr-telerxs-n-backend.onrender.com/api/v1/patient/orders/69fc54d9dcb69c5953aef89f/tracking" \
  --header "Authorization: Bearer paste_patient_jwt_here"
```

Expected local status: `confirmed`

Expected HW status: `processing`

## 3. Simulate Dispensed on HealthWarehouse Test

```bash
curl --location --request POST "https://mr-telerxs-n-backend.onrender.com/api/v1/admin/healthwarehouse/orders/61491/simulate-status" \
  --header "Authorization: Bearer paste_admin_or_subadmin_jwt_here" \
  --header "Content-Type: application/json" \
  --data '{
    "status": "dispensed"
  }'
```

Verify:

```bash
curl --location "https://mr-telerxs-n-backend.onrender.com/api/v1/patient/orders/69fc54d9dcb69c5953aef89f/tracking" \
  --header "Authorization: Bearer paste_patient_jwt_here"
```

Expected local status: `dispensed`

Expected HW status: `dispensed`

Tracking may still be empty at this stage.

## 4. Simulate Complete on HealthWarehouse Test

```bash
curl --location --request POST "https://mr-telerxs-n-backend.onrender.com/api/v1/admin/healthwarehouse/orders/61491/simulate-status" \
  --header "Authorization: Bearer paste_admin_or_subadmin_jwt_here" \
  --header "Content-Type: application/json" \
  --data '{
    "status": "complete"
  }'
```

Verify:

```bash
curl --location "https://mr-telerxs-n-backend.onrender.com/api/v1/patient/orders/69fc54d9dcb69c5953aef89f/tracking" \
  --header "Authorization: Bearer paste_patient_jwt_here"
```

Expected local status: `shipped`

Expected HW status: `complete`

## 5. Add Test Tracking Number Locally

HealthWarehouse test status simulation changes the order status. If you also need a fake tracking number for frontend UI testing, use the local test journey API after the order is complete.

```bash
curl --location --request POST "https://mr-telerxs-n-backend.onrender.com/api/v1/admin/healthwarehouse/test-orders/69fc54d9dcb69c5953aef89f/journey" \
  --header "Authorization: Bearer paste_admin_or_subadmin_jwt_here" \
  --header "Content-Type: application/json" \
  --data '{
    "status": "complete",
    "tracking_number": "TESTTRACK123456",
    "shipment_id": "TEST-SHIP-001",
    "carrier_code": "usps",
    "carrier_title": "United States Postal Service",
    "items_shipped": 1,
    "message": "Test: order shipped with tracking."
  }'
```

Verify:

```bash
curl --location "https://mr-telerxs-n-backend.onrender.com/api/v1/patient/orders/69fc54d9dcb69c5953aef89f/tracking" \
  --header "Authorization: Bearer paste_patient_jwt_here"
```

Expected tracking fields:

```txt
has_tracking: true
trackingNumber: TESTTRACK123456
shipments[0].tracking_number: TESTTRACK123456
status: shipped
hw_status: complete
```

## 6. Simulate Canceled on HealthWarehouse Test

Only use this if you want to test cancellation UI. This may be terminal depending on the HealthWarehouse test workflow.

```bash
curl --location --request POST "https://mr-telerxs-n-backend.onrender.com/api/v1/admin/healthwarehouse/orders/61491/simulate-status" \
  --header "Authorization: Bearer paste_admin_or_subadmin_jwt_here" \
  --header "Content-Type: application/json" \
  --data '{
    "status": "canceled"
  }'
```

Verify:

```bash
curl --location "https://mr-telerxs-n-backend.onrender.com/api/v1/patient/orders/69fc54d9dcb69c5953aef89f/tracking" \
  --header "Authorization: Bearer paste_patient_jwt_here"
```

Expected local status: `cancelled`

Expected HW status: `canceled`

## Valid Statuses

```txt
processing
transfer_success
transfer_failure
dispensed
complete
canceled
```

## Important Notes

Use `/admin/healthwarehouse/orders/:HW_ORDER_ID/simulate-status` to update HealthWarehouse test status.

Use `/admin/healthwarehouse/test-orders/:MONGO_ORDER_ID/journey` only to inject frontend test tracking data locally.

Use `/patient/orders/:MONGO_ORDER_ID/tracking` to verify what the frontend will receive.

If the simulate endpoint returns `403`, the backend deployment must allow test simulation. Set one of these and redeploy:

```txt
HW_API_URL=https://partners-test.healthwarehouse.com/v1
HW_TEST_JOURNEY_ENABLED=true
```
