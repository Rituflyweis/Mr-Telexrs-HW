<claude-mem-context>
# Memory Context

# [Mr-Telerxs-N-Backend-HW_APIs_Integration] recent context, 2026-05-07 3:28pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (19,410t read) | 625,009t work | 97% savings

### Apr 30, 2026
196 9:06p 🔵 Patient List Retrieved — Dipesh Joshi Patient Profile Found with HealthWarehouse IDs
197 " 🔴 admin-patient-transaction.service.js Selects Non-Existent Field "orderStatus" — Should Be "status"
198 9:07p 🔵 Production Database Has 41 Total Patients — Small Deployment
199 " 🔵 Admin Patient Transactions API Returns Different Response Shape Than Expected
200 " 🔵 Real Dr Excuse Order Found with Successful Payment — order.status Not Visible Due to Wrong Field Select
201 9:08p 🔴 BUG CONFIRMED ON PRODUCTION: Dr Excuse Order Status Stays "pending" After Successful Payment
202 " 🔵 Bulk Excuse Order Status Scan Blocked by Shell Variable Expansion Bug
203 9:28p 🔵 Footer "Stay Up To Date" Bug Investigation — Newsletter + Footer Module Structure
204 9:29p 🔵 Footer getSectionByNameOptimized Missing Public Status Filter
205 " 🔵 DB State: Several Footer Sections in Draft — Contact, Address, Social-Media All Draft
206 9:30p 🔵 Footer/Newsletter Bug Investigation Conclusion — Backend Newsletter Code Is Correct
207 " 🔵 Two TeleRxs Backend Repos Exist — Mr-Telerxs-Backend is a Separate Project
### May 4, 2026
284 3:13p 🔵 HealthWarehouse API Rejects Indian Address in "Send to Pharmacy" Flow
352 11:29p 🔵 Notes API Fetches All Notes Across All Consultations
353 " 🔵 getNotes Controller Fetches All Notes When intakeFormId Query Param Omitted
### May 5, 2026
424 4:26p 🔵 409 Conflict on Health Category PUT — Slug Collision Root Cause
425 " 🔵 checkDuplicateCategory Supports excludeId But Caller May Not Pass It
426 " 🔵 updateHealthCategory Correctly Passes excludeId — 409 Is a Genuine DB Duplicate
427 4:30p 🔵 Health Category Update Failing with 409 Conflict on Duplicate Name/Slug
S57 Explain isActive flag behavior and fix options for 409 conflict on health category PUT update (May 5 at 4:30 PM)
S58 Pinpoint exact conflicting document causing 409 — slug "weight-loss-metabolic-health" collision with inactive DB record (May 5 at 4:31 PM)
S59 Fix 409 conflict on health category PUT — removed duplicate check from updateHealthCategory (May 5 at 4:34 PM)
428 4:35p 🔵 updateHealthCategory Excludes Current Doc from Duplicate Check But checkDuplicateCategory Has No isActive Filter
S60 Fix 409 on health category PUT — removed schema unique constraints and flagged required MongoDB index drops (May 5 at 4:35 PM)
429 4:38p 🔵 409 Error Source Located: checkDuplicateCategory in health.helper.js Line 406
430 " 🔵 HealthCategory Model Has MongoDB-Level unique:true on name AND slug Fields
431 " 🔴 Removed unique:true from name and slug Fields in HealthCategory Model
S61 Persistent 409 conflict error on healthcategories collection — duplicate key index issue (May 5 at 4:39 PM)
S62 Fix 409 conflict error on healthcategories PUT endpoint — drop stale unique MongoDB indexes (May 5 at 4:48 PM)
432 4:49p 🔵 MongoDB Atlas connection string found in .env
433 " 🔵 No local mongo/mongosh CLI available; Node.js v24.12.0 present
434 " 🔴 Dropped stale unique indexes `name_1` and `slug_1` from `healthcategories` collection
S65 Healthware API order tracking flow after prescription order creation — how is an order tracked post "Send to prescription → Create order by doctor with prescription" on HW side? (May 5 at 4:50 PM)
### May 7, 2026
534 12:42a 🔵 Healthware API Order Tracking Flow Post-Prescription
535 " 🔵 Healthware API Complete Order Tracking & Notification System
S66 Simulating tracking ID, shipment ID, and address in the Healthwarehouse test environment (May 7 at 12:42 AM)
536 9:59a 🔵 Healthwarehouse Test Environment: Order Status Simulation API
S67 Healthware API Order Tracking Flow — How is the order tracked after doctor creates prescription order on HW side? (May 7 at 9:59 AM)
537 10:02a 🔵 Healthware API Order Tracking Flow Post-Prescription
538 10:03a 🔵 Healthware Order Tracking Architecture Traced End-to-End
539 10:06a 🔵 Healthware-to-Local Order Status Mapping Confirmed
540 " 🔵 No Healthwarehouse Webhook Receiver Exists — Tracking is Pull-Only
S68 Healthware API Order Tracking Flow — Full investigation of how orders are tracked after doctor prescription creation, including status transitions, shipment data, and webhook architecture (May 7 at 10:06 AM)
541 10:08a 🔵 Critical Bug: All HW Order Line Items Use Hardcoded product_id = 101
542 " 🔵 Bug: cancelOrder Sets DB Status Before Checking hw_order_id
543 " 🔵 N+1 Performance Issue: getPatientOrders Fetches HW Tracking Per Order
544 " 🔵 createPrescriptionOrderByDoctor Full Flow Confirmed
602 3:10p 🟣 FE Communication Message: API Integration Specification Drafted
603 3:14p 🟣 Status Update API Endpoint Requested for Frontend Integration
604 " 🔵 HealthWarehouse Integration Work-in-Progress State
605 " 🟣 HealthWarehouse Controller: Webhook Handlers and Status Simulation
606 " 🟣 updateTestOrderJourney Endpoint Added for Frontend Status Simulation
607 3:19p ✅ Postman Collection Update + API Status Testing Documentation Requested
608 " 🔵 Existing Postman Collection Structure for TeleRxs HW APIs
609 " 🔵 Postman Collection Variables and Hardcoded Order ID Details
610 " 🔵 Order Status Lifecycle and Simulate-Status API Documented in Frontend_changes.md
611 3:20p 🔵 Collection-Level Auth Uses Hardcoded JWT Instead of Variable Reference
612 " 🟣 Added "HealthWarehouse Order Journey Testing" Folder to Postman Collection
613 " 🟣 Created HW_ORDER_JOURNEY_TESTING.md — Order Status Testing Guide
614 3:21p 🔵 Broader HW Integration Branch Scope Revealed by Git Status

Access 625k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>