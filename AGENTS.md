<claude-mem-context>
# Memory Context

# [Mr-Telerxs-N-Backend-HW_APIs_Integration] recent context, 2026-04-28 10:16pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 14 obs (4,813t read) | 124,208t work | 96% savings

### Apr 28, 2026
1 7:31p 🔵 IntakeForm preferredPharmacy field structure — single object not array
S2 Investigation of preferredPharmacy/preferredPharmacies handling in IntakeForm medical questions flow (Apr 28 at 7:31 PM)
S1 mem-search invoked to check for past session memory on Mr-Telerxs-N-Backend-HW_APIs_Integration project (Apr 28 at 7:31 PM)
S3 "Remove preferredPharmacy from all IntakeForm" — full pharmacy removal from model, service active code, and commented blocks (Apr 28 at 7:32 PM)
2 7:33p 🔵 saveMedicalQuestions full flow — HW sync + potential preferredPharmacies crash bug
3 7:34p ✅ Removed preferredPharmacy subdocument from IntakeForm Mongoose schema
4 7:36p 🔴 Removed entire preferredPharmacy handling block from saveMedicalQuestions service
5 7:37p 🔴 Removed orphaned preferredPharmacy key from medicalQuestionsData object in service
6 7:41p 🔄 preferredPharmacy fully removed from active service code — only commented block remains
S4 "OTP must be working on phone number login — ensure Twilio integration correctly configured" — full OTP/SMS audit and fix (Apr 28 at 7:42 PM)
7 7:56p 🔵 Twilio OTP system architecture — SMS + email dual delivery with hardcoded fallback bypass
8 " 🔵 auth.service.js exposes OTP code in forgotPassword response — security issue
9 " 🚨 Real production credentials committed in plaintext .env file
10 7:57p 🔵 User model phoneNumber schema — unique sparse index, required only for non-social logins
11 " 🔴 Added E.164 phone number formatter and countryCode fetch to fix Twilio SMS delivery
12 8:10p 🔴 E.164 phone formatting applied to sendOtp and sendLoginOtp SMS calls
13 " 🔴 E.164 formatting applied to sendLoginOtp; sendPasswordResetOtp user query extended for E.164
14 8:11p 🔴 verifyOtp bypass removed — real OTP code and expiry validation now enforced
S5 Build US states dropdown API returning country, state name, state code, isAvailable (default true) — confirm count before implementation (Apr 28 at 8:20 PM)
**Investigated**: Scope of "US states" — whether to include DC and/or 5 US territories (Puerto Rico, Guam, USVI, American Samoa, N. Mariana Islands)

**Learned**: Standard US state dropdown count is 50 states; most address/app forms include DC making it 51; full inclusion with territories = 56

**Completed**: Full Express.js API implemented with 51 entries (50 states + DC) in routes/states.js — GET /api/states returns { success, count, data[] } where each item has { country, state, code, isAvailable: true }. Sample registration in app.js provided.

**Next Steps**: Awaiting user confirmation to write files directly into project — need to know project structure/framework if user wants code written to disk. User may also want to adjust count (drop DC, or add territories).


Access 124k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>