<claude-mem-context>
# Memory Context

# [Mr-Telerxs-N-Backend-HW_APIs_Integration] recent context, 2026-04-30 6:17pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (20,363t read) | 632,799t work | 97% savings

### Apr 29, 2026
S13 Improve error handling for HealthWarehouse customer creation to surface better diagnostic info (Apr 29 at 1:41 PM)
S9 HealthWarehouse customer creation error — diagnosed "missing or invalid state in customer address" 400 causing prescription order 500 (Apr 29 at 2:11 PM)
S10 Add master OTP "000000" to bypass Twilio trial account SMS limitations across all auth flows (Apr 29 at 2:11 PM)
S11 Revert phone number validation regression from last commit that broke login screen phone submission (Apr 29 at 2:33 PM)
S12 Fix login-otp returning 500 due to both Twilio SMS and Gmail SMTP failing in production (Apr 29 at 2:37 PM)
S14 Improve error handling for HealthWarehouse customer creation — add detailed logging to diagnose state field issue (Apr 29 at 2:41 PM)
S15 Diagnosed HealthWarehouse "invalid state" error from production logs — root cause confirmed as Indian address with state "Delhi" sent to US-only pharmacy API (Apr 29 at 2:48 PM)
S16 Manually fix test patient address in production DB — delete duplicates and update to valid US address for HealthWarehouse compatibility (Apr 29 at 2:55 PM)
S17 Retire duplicate us-state module and consolidate US state management onto existing /patient/states endpoint with StateAvailability as single source of truth (Apr 29 at 3:00 PM)
S18 Consolidate US state management onto single /patient/states endpoint — retire us-state module, make StateAvailability DB the single source of truth, add DC, default all available (Apr 29 at 3:27 PM)
88 7:11p 🔵 Medicine PUT API Rejects Frontend Payload — Populated Objects Sent Back
91 10:00p 🔵 Production medicines list endpoint returns 422 — fix not deployed
92 11:12p 🔵 Production medicines list: limit capped at 100, pagination works, candidate found
93 11:13p 🔵 Production add/remove subcategory test passed — healthTypeSlug is a full replace operation
94 11:14p ✅ Fix committed to git — medicine validation fix on branch main
95 " 🔵 Medicine API architecture — full route, field alias, and filter map
### Apr 30, 2026
96 12:19a 🟣 Medicine Multi-HealthTypeSlug Test Runbook Created
97 12:29a 🔴 Runbook Step 8.1 Corrupted JWT Token Fixed
98 12:30a ✅ Runbook PUT Payloads Expanded to Full GET Response Mirror
99 12:31a ✅ Runbook Finalized: Full 483-Line File Verified
100 1:24a 🔵 Intake Form Submit API Returns 400 — Incomplete Sections Validation
101 1:25a 🔵 IntakeForm Submit Validation Logic — Three Boolean Flags Must All Be True
102 " 🔵 IntakeForm DB Snapshot — Patient 69eb6128 Has Incomplete Flags (draft, all false)
127 3:09p 🔴 PUT API fails to update medicine with multiple health type slugs
128 " 🔵 Mr-Telerxs Backend: active modifications across auth, order, checkout, and doctor modules
129 3:10p 🔵 Medicine PUT API: validateHealthCategory called once per request, may not handle multiple slugs
130 " 🔵 Medicine Tadalafil (ID: 69f1ce63bd3e913a947bebcd) confirmed working with multiple healthTypeSlug in DB
131 " 🔵 PUT medicine API works correctly when healthTypeSlug sent as JSON array — bug is in FE payload construction
132 3:11p 🔵 Minimal PUT payload with only healthCategory + healthTypeSlug array also succeeds
133 " 🔵 normalizeHealthTypeValues handles object arrays — backend accepts subCategory objects as input, not just slug strings
134 " 🔴 medicine.validation.js updated to support .value property in health type object normalization
135 " 🔴 medicine.helper.js updated to support .value property in health type and category normalization
136 3:12p 🔴 Committed fix for healthTypeSlug .value normalization — 2 files, 14 insertions
137 " 🔴 Full diff confirmed: 5 precise changes across 2 files for .value normalization fix
138 3:26p 🔵 FE PUT payload analysis: format correct but subCategory/healthTypeSlug count mismatch detected
139 3:27p 🔵 Sildenafil medicine PUT with 3 slugs only saved 2 — production Vercel not yet running committed fix
140 " 🔵 Production server confirmed dropping third slug — updatedAt unchanged proves Mongoose sees no diff
141 5:02p 🔵 Intake Form Submit API Returns 400 "Already Submitted" Error
142 " 🔵 Mr-TeleRxs Backend Project Structure Identified
143 5:03p 🔵 Root Cause Traced: submitConsultation Blocks Re-submission With Hard Guard
144 " 🔵 Live API Confirms Patient Intake Form Already Submitted in Production DB
145 " 🔴 submitConsultation Made Idempotent — No Longer Errors on Re-submission
146 5:04p 🔴 Idempotent Submit Fix Applied Locally — Syntax Verified, Awaiting Vercel Deploy
147 5:35p 🔵 Health Categories API — Missing badge/caption Fields and PUT Bug
148 " 🔵 Mr-Telerxs Backend — Health Categories Module Structure Mapped
149 " 🔵 PUT Category Bug Root Cause: badge/caption Missing from updateHealthCategoryValidation
150 " 🔵 Validate Middleware Does NOT Strip Unknown Fields — PUT Bug Root Cause Revised
151 " 🔵 Live Production API Confirms badge/caption Absent from All Category Documents
152 5:36p 🔴 Added badge and caption Fields to HealthCategory types Subdocument Schema
153 " 🟣 badge and caption Validators Added to All Health Category Validation Arrays
154 5:37p 🔴 Schema Paths Verified — badge/caption Confirmed in Both Category and Types Subdocument
155 " 🟣 health.helper.js Updated to Explicitly Surface badge/caption in GET Responses
156 " 🔴 Full badge/caption Fix Verified and Ready — 3 Files Changed, Runtime Test Passed
160 " ⚖️ Frontend API Contract Documented — PUT /categories/:id Request Body Shape
157 5:54p 🔵 Medicine Rating Field — Data Type and Update Behavior Investigation
158 " 🔵 Medicine Rating Bug Root Cause — Missing from Create Payload, No parseFloat on Update
159 " 🔴 Medicine Rating Always Zero on Create — buildMedicineData Omits Rating Field
161 5:55p 🔵 Medicine Module Architecture — All Routes Public, Full Create/Update Flow Confirmed
162 6:17p ⚖️ Rating Field Fix Approach — Include in buildMedicineData Using Sent Value
163 " 🔴 Medicine Rating Create Bug Fixed — Added rating to buildMedicineData

Access 633k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>