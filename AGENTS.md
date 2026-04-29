<claude-mem-context>
# Memory Context

# [Mr-Telerxs-N-Backend-HW_APIs_Integration] recent context, 2026-04-29 6:52pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (18,586t read) | 536,451t work | 97% savings

### Apr 29, 2026
21 1:31p 🔵 SMS Service Silent Mock — Root Cause of OTP Not Delivered
22 1:32p 🔵 Debug console.log Left in verifyPassword + User Model Structure
23 " 🔴 Removed Silent OTP Fallback — sendLoginOtp Now Throws on Delivery Failure
24 1:33p 🔴 Registration OTP Fallback Also Replaced with AppError 500
25 1:34p 🔴 buildIdentifierOrQuery Enhanced to Match Phone Number Format Variants
26 1:39p 🔵 Email Service Has Same Silent-Success Anti-Pattern as SMS Service
27 1:40p 🔴 Email Service sendOtpEmail Now Throws on Failure Instead of Returning Silent Error
S13 Improve error handling for HealthWarehouse customer creation to surface better diagnostic info (Apr 29 at 1:41 PM)
28 2:11p 🔵 HealthWarehouse Customer Creation Failing — Invalid State in Address
S9 HealthWarehouse customer creation error — diagnosed "missing or invalid state in customer address" 400 causing prescription order 500 (Apr 29 at 2:11 PM)
S10 Add master OTP "000000" to bypass Twilio trial account SMS limitations across all auth flows (Apr 29 at 2:11 PM)
29 2:33p 🟣 Master OTP Bypass for Twilio Trial Account Limitation
30 " 🔵 OTP Service Architecture — Mr-Telerxs-N Backend
S11 Revert phone number validation regression from last commit that broke login screen phone submission (Apr 29 at 2:33 PM)
31 2:37p 🔵 Last Commit Includes Phone Identifier Query Changes That Break Login
32 " 🔵 buildIdentifierOrQuery Phone Variant Expansion — Exact Diff Found
S12 Fix login-otp returning 500 due to both Twilio SMS and Gmail SMTP failing in production (Apr 29 at 2:37 PM)
33 2:41p 🔵 Production OTP Delivery Fully Broken — Both Twilio SMS and Gmail SMTP Failing
34 " 🔴 sendLoginOtp No Longer Throws 500 When All Delivery Channels Fail
S14 Improve error handling for HealthWarehouse customer creation — add detailed logging to diagnose state field issue (Apr 29 at 2:41 PM)
35 2:47p 🔵 HealthWarehouse createCustomer Receives Raw Address Model — State Field Path Mismatch Confirmed
36 2:48p 🔵 Address Model Field Names Match — State Is Required But Value May Be Invalid Format
37 " ✅ Enhanced createCustomer Logging and Added Pre-flight State Validation
S15 Diagnosed HealthWarehouse "invalid state" error from production logs — root cause confirmed as Indian address with state "Delhi" sent to US-only pharmacy API (Apr 29 at 2:48 PM)
38 2:55p 🔵 Root Cause Confirmed — Patient Address Uses Indian Location with Non-US State "Delhi"
S16 Manually fix test patient address in production DB — delete duplicates and update to valid US address for HealthWarehouse compatibility (Apr 29 at 2:55 PM)
39 2:59p 🔵 Test Patient Has 5 Duplicate Indian Addresses — All Invalid for HealthWarehouse
40 " 🔵 Address Routes Located in Dedicated Module — Not Patient Module
42 " ✅ Deleted 4 Duplicate Indian Addresses for Test Patient
41 " 🔵 Address API Routes — DELETE and PUT Endpoints Confirmed Available
43 " ✅ Test Patient Address Updated to Valid US Address — New York NY 10001
S17 Retire duplicate us-state module and consolidate US state management onto existing /patient/states endpoint with StateAvailability as single source of truth (Apr 29 at 3:00 PM)
44 3:25p 🔵 Two Competing US State Systems Found — us-state Module vs availability Module
45 " 🔵 Full Architecture of Dual State Systems — StateAvailability vs UsState Models Compared
46 " ✅ StateAvailability Model Default Availability Changed from false to true
47 3:26p 🔄 availability.service.js Refactored — DB Is Now Single Source of Truth for US States
48 " ✅ us-state Module Retired — Consolidated onto Existing availability Module
49 3:27p 🔵 constants/states.js Contains Exactly 50 US States — DC Not Included
50 " ✅ District of Columbia (DC) Added to US States Constants
S18 Consolidate US state management onto single /patient/states endpoint — retire us-state module, make StateAvailability DB the single source of truth, add DC, default all available (Apr 29 at 3:27 PM)
68 5:10p 🔵 Doctor Panel Consultations: Condition & Symptoms Data Source Traced
69 " 🔵 Order Model Lacks Condition/Symptoms Fields — Only Cart Items Have Them
70 " 🔵 Cart-to-Order Conversion Drops Condition/Symptoms Fields
71 " 🔵 createOrder Cart-to-Order Item Mapping Confirmed: condition/symptoms Explicitly Absent
72 " 🔵 Doctor Dashboard getRecentConsultations Uses Symptoms as Primary Condition Source
73 5:11p 🔵 Doctor Panel — Order-Based Condition/Symptoms Visibility Scope
75 5:15p 🔵 Cart Item Drops `isConsented` Field — Not Persisted in Cart Model
74 5:21p 🟣 Order-Based Condition/Symptoms Now Surfaces in All Three Doctor Consultation Endpoints
76 5:25p 🔵 `isConsented` Missing from Cart Model Schema — Silently Dropped on Add-to-Cart
77 " 🔴 `isConsented` Added to Cart Item Schema
78 5:26p 🔴 `isConsented` Propagation — Cart Validation and Schema Patched
79 " 🔴 `isConsented` Wired Through cart.service.js — Plus Existing-Item Update Logic Improved
80 " 🔴 `isConsented` Now Persisted Through Full Order Pipeline — Schema and Snapshot Logic Updated
81 " 🔴 `isConsented` Wired Through `reorder` and `createRefillOrder` Paths
82 5:27p 🔴 `isConsented` Pipeline Complete — All Four Order Creation Paths Wired
83 " 🔴 `isConsented` Validation Added to Order Validation — Full Pipeline Now Complete
84 " 🔴 `isConsented` Added to Doctor Consultation MongoDB Projection
85 " 🔵 `isConsented` Implementation Verified — All 7 Files Pass Syntax and Whitespace Checks
86 " 🟣 Complete `isConsented` + Condition/Symptoms Feature — 8-File Change Set Finalized
87 " 🔵 Patient `medicalHistory` and `allergies` Return as Empty Arrays in Prescription Response

Access 536k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>