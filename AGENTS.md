<claude-mem-context>
# Memory Context

# [Mr-Telerxs-N-Backend-HW_APIs_Integration] recent context, 2026-05-18 6:51pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (19,713t read) | 195,349t work | 90% savings

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
1476 5:05p 🔵 Footer Address API Rejects "address-section" as Section Name
1477 " 🔵 Footer API Valid Section Names Are Short Kebab-Case, Not "-section" Suffixed
1478 5:06p 🔵 Footer Model Schema: One Document Per Section, Polymorphic Fields, Commented-Out Auth Check
1479 " 🔴 setSectionParam Middleware Now Overrides req.body.section to Prevent Enum Validation Failure
1502 6:23p 🔵 Footer Address API Returns Incomplete Address Data
1503 " 🔵 Footer Helper Structure Traced in Mr-Telerxs Backend
1504 6:24p 🔵 Footer Address Fix Path: Use updateFooterSectionBySection via PUT/PATCH
1505 " 🔵 Footer Model Schema Has Hardcoded Default: address.country = "United States"
1506 6:41p 🔵 Footer Helper Section Query Functions Inspected for Incomplete Response Bug
1507 " 🔵 Footer Model Schema Contains Rich Nested Contact, Address, and Social Media Fields
1508 6:43p 🔵 MongoDB Atlas Connection Confirmed for telerxs_db Database
1509 6:44p 🔵 Root Cause Confirmed: Address Section Stuck in Draft Status, Missing Data in DB
1510 6:50p 🔵 Footer Module Route Architecture in Mr-Telerxs-N-Backend
1511 " 🔵 Footer Service Layer Uses Thin Delegation Pattern
1512 " 🔵 Footer Helper Centralizes All Optimized MongoDB Query Logic
1513 " 🟣 GET /footer/full Endpoint Returns All Sections as List + Section-Keyed Map
1514 " 🔵 Live Smoke Test of getFullFooter Fails Due to Unregistered User Mongoose Model
1515 6:51p 🔵 getFullFooter Smoke Test Passed Against Live Database — 14 Sections Returned

Access 195k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>