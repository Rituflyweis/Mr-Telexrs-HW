<claude-mem-context>
# Memory Context

# [Mr-Telerxs-N-Backend-HW_APIs_Integration] recent context, 2026-05-18 5:05pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (19,846t read) | 229,695t work | 91% savings

### May 5, 2026
S57 Explain isActive flag behavior and fix options for 409 conflict on health category PUT update (May 5 at 4:30 PM)
S58 Pinpoint exact conflicting document causing 409 — slug "weight-loss-metabolic-health" collision with inactive DB record (May 5 at 4:31 PM)
S59 Fix 409 conflict on health category PUT — removed duplicate check from updateHealthCategory (May 5 at 4:34 PM)
S60 Fix 409 on health category PUT — removed schema unique constraints and flagged required MongoDB index drops (May 5 at 4:35 PM)
S61 Persistent 409 conflict error on healthcategories collection — duplicate key index issue (May 5 at 4:39 PM)
S62 Fix 409 conflict error on healthcategories PUT endpoint — drop stale unique MongoDB indexes (May 5 at 4:48 PM)
S65 Healthware API order tracking flow after prescription order creation — how is an order tracked post "Send to prescription → Create order by doctor with prescription" on HW side? (May 5 at 4:50 PM)
### May 7, 2026
S66 Simulating tracking ID, shipment ID, and address in the Healthwarehouse test environment (May 7 at 12:42 AM)
S67 Healthware API Order Tracking Flow — How is the order tracked after doctor creates prescription order on HW side? (May 7 at 9:59 AM)
S68 Healthware API Order Tracking Flow — Full investigation of how orders are tracked after doctor prescription creation, including status transitions, shipment data, and webhook architecture (May 7 at 10:06 AM)
661 6:20p 🔵 getOrderById Returns Tracking But getOrdersForDoctor Lacks Delivery Timeline
662 " 🔵 Order Model Has Embedded Shipments Array — Delivery Timeline Not Surfaced in Doctor Listing
663 6:21p 🔵 Delivery Timeline Tracking Block Commented Out in getPatientOrders; Absent in getOrdersForDoctor
664 " 🟣 Delivery Timeline Builder and Batch Event Fetcher Added to order.service.js
665 " 🟣 prescription_sent_at Field Added to Order Model
666 6:22p 🔴 Order.model.js prescription_sent_at Patch Context Mismatch Fixed
667 " 🟣 getOrders (Patient Order List) Wired to attachDeliveryTimelines
668 " 🟣 getOrderById Now Returns deliveryTimeline, tracking_events, and events
669 " 🟣 getOrderTracking Service Expanded with deliveryTimeline, tracking_events, and Full Select Fields
670 " 🟣 getOrdersForDoctor Now Includes Delivery Timeline — All Order Endpoints Complete
671 6:23p 🟣 getPatientOrders Enhanced Order Map Now Includes deliveryTimeline Using Pre-fetched Batch Events
672 " 🔴 trackingNumber Fallback Chain Fixed in getPatientOrders Enhanced Order Response
673 " 🔴 buildDeliveryTimeline Step Status Logic Corrected for Forward Progression
674 " 🟣 createOrderByDoctor and createPrescriptionOrderByDoctor Responses Include Initial deliveryTimeline
675 6:24p 🟣 Delivery Timeline Feature Complete — Syntax Verified, Full Diff Confirmed
676 " 🔵 Smoke Test Failed Due to Payment Model Not Registered in Isolated Script
677 " 🔵 Delivery Timeline Verified Against Real DB Data — All States Correct
678 " 🔵 False "Shipped/Delivered" Timeline Caused by Test trackingNumber on Processing Order
679 6:25p 🔵 Production Vercel API Returns 200 but Lacks deliveryTimeline — Changes Not Yet Deployed
680 " 🔵 updateTestOrderJourney Writes trackingNumber to Order Document — Source of TESTTRACK Artifact
681 " 🔴 mapHWStatusToLocalStatus Now Protects Terminal Local Statuses from Being Overwritten
682 6:26p ✅ Full Session Changeset Summary — Delivery Timeline Feature Complete Across 4 Files
683 " ✅ HW_ORDER_JOURNEY_TESTING.md Updated to Document deliveryTimeline and tracking_events Fields
684 " ✅ Delivery Timeline Feature Committed to main Branch
685 " 🔵 Final Integration Verification — All deliveryTimeline Touchpoints Confirmed in Source, Changes Still Uncommitted
686 6:31p 🔵 No Orders in "Delivered" Status — All Sit at "Confirmed"
687 " 🔵 Order 69f9c8d0a2148e8e8122903d Has Conflicting Delivered/Confirmed State
688 6:35p 🔵 Postman Collection & Frontend Flow Documentation Review
689 " 🔵 TeleRxs Postman Collection Structure Enumerated
690 " 🔵 HW_ORDER_JOURNEY_TESTING.md Is the Primary Frontend Handoff Document
691 " 🔵 Frontend_changes.md Does Not Exist
692 6:36p 🔵 Order Tracking & Detail API Endpoint URL Patterns Confirmed
693 " 🔵 Postman Collection Variables: base_url Points to Render Deployment, Auth Tokens Empty
694 6:37p 🟣 Added 'delivered' and 'refunded' Status Support to HW Test Journey Endpoint
695 " 🟣 Postman Collection Updated: 11-Step HW Journey Testing Folder with Delivered, Refunded & Verification Requests
696 6:38p 🟣 Created FE_HEALTHWAREHOUSE_ORDER_FLOW.md — Frontend Handoff Documentation
697 " ✅ HW_ORDER_JOURNEY_TESTING.md Updated to Match New Backend Statuses and Cross-Reference FE Doc
698 " 🔵 Git Status Confirms All Changed Files Before Commit
699 6:39p 🔵 Session Changeset: 367 Insertions Across 4 Files; order.service.js, helper, and Model Unchanged
700 " 🔵 deliveryTimeline Built by buildDeliveryTimeline() in order.service.js; 'delivered' and 'refunded' Already in terminalLocalStatuses
### May 18, 2026
1455 4:51p 🔴 Removed salePrice and originalPrice Validation from Medicines API
1456 " 🔵 salePrice/originalPrice Validation Located in medicine.validation.js
1457 4:52p 🔵 Medicine Model Has salePrice required: true at Schema Level
1458 " 🔵 Discount Calculation Is Safe When salePrice/originalPrice Are Absent
1459 " 🔴 rating Field Also Uses requiredOnCreateOrPresentOnUpdate in addMedicineValidation
1460 " 🔵 No Uncommitted Changes to Validation or Model Files Before Fix
1461 " 🔴 Removed salePrice and originalPrice Validators from addMedicineValidation
1462 4:53p 🔴 Fixed Price Field Fallback Logic in buildMedicineData and applyMedicineUpdates
1463 " 🔴 salePrice/originalPrice Validation Removal Confirmed Applied and Syntax-Valid
1464 " 🔴 Final State Verified: Two Files Modified, Price Validation Fully Removed

Access 230k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>