<claude-mem-context>
# Memory Context

# [Mr-Telerxs-N-Backend-HW_APIs_Integration] recent context, 2026-04-30 10:27pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (19,733t read) | 594,819t work | 97% savings

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
### Apr 30, 2026
154 5:37p 🔴 Schema Paths Verified — badge/caption Confirmed in Both Category and Types Subdocument
155 " 🟣 health.helper.js Updated to Explicitly Surface badge/caption in GET Responses
156 " 🔴 Full badge/caption Fix Verified and Ready — 3 Files Changed, Runtime Test Passed
160 " ⚖️ Frontend API Contract Documented — PUT /categories/:id Request Body Shape
157 5:54p 🔵 Medicine Rating Field — Data Type and Update Behavior Investigation
158 " 🔵 Medicine Rating Bug Root Cause — Missing from Create Payload, No parseFloat on Update
159 " 🔴 Medicine Rating Always Zero on Create — buildMedicineData Omits Rating Field
161 5:55p 🔵 Medicine Module Architecture — All Routes Public, Full Create/Update Flow Confirmed
173 " 🔵 Production GET /categories Confirmed Working — 7 Categories, badge/caption Returning null
174 " 🔐 Admin JWT Token Shared in Session for API Testing
162 6:17p ⚖️ Rating Field Fix Approach — Include in buildMedicineData Using Sent Value
163 " 🔴 Medicine Rating Create Bug Fixed — Added rating to buildMedicineData
164 6:18p 🔵 Doctor Panel Recent Consultations API Investigation
165 " 🔵 Mr-Telerxs Backend: Recent Consultations Code Architecture
166 " 🔵 Recent Consultations Filter Logic: Status Gate and Pagination Strategy Differences
167 " 🔵 formatConsultation Helper Uses createdAt Only; Patient Name Hardcoded from basicInformation
168 6:19p 🔵 Root Cause Confirmed: Missing April 28 Consultations Have status='draft', Not 'submitted'
169 " 🔵 Full Consultation Status Breakdown Confirms 4 Submitted vs 7 Draft for Doctor
170 " 🔵 Recent Consultations updatedAt Display Confirmed: Jan-Created Record Shows Apr 29 Date
171 " 🔵 Uncommitted Working Tree Changes in Health/Medicine Modules
172 " 🔵 Doctor Name Empty String Bug: doctor.user Not Populated in getConsultationsByDoctorId
179 9:01p 🔵 Patient Orders API Investigation — Status Stuck at "processing"
180 " 🔵 Dr Excuse Order Flow — productType "doctors_note" and Initial Status "processing"
181 " 🔵 Root Cause Found: Order Status Stays "processing" Due to Inconsistent Payment Service Logic
182 " 🔴 Confirmed Bug: verifyPayment Sets order.status = "pending" Instead of "confirmed" After Successful Payment
184 " 🔵 Production Server flyweisgroup.in Not Responding to API Calls
183 9:02p 🔵 Admin JWT Token Valid Until 2026-05-06 — Live API Test Initiated
185 9:03p 🔵 Production flyweisgroup.in Confirmed Down — curl exit code 28
186 " 🔵 Production Server IS Up — Previous Timeouts Were Token-Related, Not Server Down
187 " 🔵 Admin Token Accepted by GET /patient/orders — Returns Empty Orders Array
188 9:04p 🔵 Order Model Schema: "processing" Valid for status but NOT for paymentStatus
189 " 🔵 Order Routes Shared Between Patient and Doctor — Same Router Mounted at Both Prefixes
190 " 🔵 POST /patient/orders for Dr Excuse Order Timed Out on First Attempt
191 " 🔵 POST /patient/orders Times Out at 30s — Admin Token Has No Patient Profile
192 " 🔴 Validation Bug Confirmed on Production: Shipping Address Required Even for doctors_note Orders
193 9:05p 🔵 Live Test Confirms: Payment Intent Returns "processing" Status — Root Cause of Reported Bug Identified
194 " 🔵 Server Path Revealed + Dedicated doctors-note Module Exists + confirmPayment Broken on Production
195 9:06p 🔵 Admin Reports mapStatus Maps "confirmed" to "Processing" Display Label
196 " 🔵 Patient List Retrieved — Dipesh Joshi Patient Profile Found with HealthWarehouse IDs
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

Access 595k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>