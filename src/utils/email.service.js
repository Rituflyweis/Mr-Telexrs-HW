const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send OTP via email
 * @param {string} email - Recipient email address
 * @param {string} otpCode - OTP code to send
 * @param {string} type - Type of OTP: 'login' or 'password-reset' (default: 'login')
 */
exports.sendOtpEmail = async (email, otpCode, type = 'login') => {
  try {
    // If SMTP not configured, log to console (for development)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`📧 OTP Email to ${email} (${type}): ${otpCode}`);
      return { success: true, message: 'OTP logged to console (SMTP not configured)' };
    }

    const transporter = createTransporter();

    const isPasswordReset = type === 'password-reset';
    const subject = isPasswordReset
      ? 'Your Password Reset OTP - Telerxs'
      : 'Your Login OTP - Telerxs';
    const title = isPasswordReset
      ? 'Your Password Reset OTP'
      : 'Your Login OTP';
    const description = isPasswordReset
      ? 'Your One-Time Password (OTP) for password reset is:'
      : 'Your One-Time Password (OTP) for login is:';

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'no-reply@telerxs.com',
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <p>Hello,</p>
          <p>${description}</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
          </div>
          <p>This OTP is valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email from Telerxs. Please do not reply.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 OTP Email sent to ${email} (${type}): ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};
exports.sendEmailWithAttachment = async (email, noteData) => {
  try {
    console.log(`📧 Email with attachment to ${process.env.SMTP_USER}`, process.env.SMTP_PASS);
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`📧 Email with attachment to ${email}`);
      return { success: true, message: "SMTP not configured - logged only" };
    }
    const transporter = createTransporter();
    let logoBase641 = 'https://img.sanishtech.com/u/9c370d9fb9b6b578ae8fbfc4c189ac86.png'
    const mailOptions = {
      from: process.env.FROM_EMAIL || "no-reply@telerxs.com",
      to: email,
      subject: "Doctor Excuse",

      html: `
  <div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; border:1px solid #ddd; padding:20px">

    <div style="text-align:center; margin-bottom:20px;">
      <img src="${logoBase641}" alt="TeleRxs Logo" style="max-width:200px"/>
    </div>

    <h2 style="text-align:center">Work / School Excuse Form</h2>

    <p>
    This document serves as a medical excuse for the individual listed below,
    who was evaluated through TeleRxs telehealth services. Based on the medical
    assessment, the patient was advised to be excused from work and/or school
    responsibilities for medical reasons.
    </p>

    <p><strong>Patient Name:</strong> ${noteData.patientName}</p>

    <p><strong>Excused From:</strong> ${new Date(noteData.startDate).toDateString()}</p>

    <p><strong>Excused To:</strong> ${new Date(noteData.endDate).toDateString()}</p>

    <p><strong>Reason:</strong> Medical — Confidential</p>

    <p><strong>Additional Notes:</strong></p>
    <p>${noteData.purpose || "Patient advised rest and recovery."}</p>

    <br/>

    <p>
    If you have any questions or require verification, please contact TeleRxs.
    </p>

    <br/>

    <p>
    ___________________________<br/>
    <strong>Riliwanu Aliu, MD</strong><br/>
    TeleRxs
    </p>

    <p style="font-size:12px;color:#888">
    TeleRxs.com | Confidential Medical Document
    </p>

  </div>
  `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent with attachment to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {

    console.error("Attachment Email Error:", error);

    return {
      success: false,
      error: error.message
    };
  }
};
const check = (val) => (val ? "☑" : "☐");
exports.sendEmailWithTeleHealthAttachment = async (email, noteData) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("SMTP not configured");
      return { success: true };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL || "no-reply@telerxs.com",
      to: email,
      subject: "Telehealth Visit Summary",
      html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial; max-width:700px; margin:auto; border:1px solid #ccc; padding:20px;">
  
  <tr>
    <td align="center">
      <h2>Telehealth Visit Summary</h2>
    </td>
  </tr>

  <!-- Patient Info -->
  <tr><td><b>Patient Information</b></td></tr>
  <tr><td>Name: ${noteData.patientName || ""}</td></tr>
  <tr><td>DOB: ${noteData.dob || ""}</td></tr>
  <tr><td>Date of Visit: ${new Date(noteData.visitDate).toDateString()}</td></tr>
  <tr><td>State: ${noteData.state || ""}</td></tr>

  <tr>
    <td>
      Encounter Type:
      ${check(noteData.encounterType === "Async")} Async
      ${check(noteData.encounterType === "Video")} Video
      ${check(noteData.encounterType === "Phone")} Phone
    </td>
  </tr>

  <!-- Chief Complaint -->
  <tr><td style="padding-top:10px;"><b>Chief Complaint</b></td></tr>
  <tr><td>${noteData.chiefComplaint || ""}</td></tr>

  <!-- HPI -->
  <tr><td style="padding-top:10px;"><b>History of Present Illness</b></td></tr>
  <tr><td>Symptom Onset: ${noteData.symptomOnset || ""}</td></tr>

  <tr>
    <td>
      Symptoms:
      ${check(noteData.symptoms?.fever)} Fever
      ${check(noteData.symptoms?.cough)} Cough
      ${check(noteData.symptoms?.congestion)} Congestion
      ${check(noteData.symptoms?.soreThroat)} Sore throat
      ${check(noteData.symptoms?.dysuria)} Dysuria
      ${check(noteData.symptoms?.rash)} Rash
      ${check(noteData.symptoms?.pain)} Pain
    </td>
  </tr>

  <tr>
    <td>
      Severity:
      ${check(noteData.severity === "Mild")} Mild
      ${check(noteData.severity === "Moderate")} Moderate
      ${check(noteData.severity === "Severe")} Severe
    </td>
  </tr>

  <tr><td>Pertinent Negatives: ${noteData.pertinentNegatives || ""}</td></tr>

  <!-- Medical -->
  <tr><td style="padding-top:10px;"><b>Past Medical History</b></td></tr>
  <tr>
    <td>
      ${check(noteData.pastMedicalHistoryNone)} None reported
      ${check(noteData.pastMedicalHistoryReviewed)} Reviewed
    </td>
  </tr>

  <tr><td style="padding-top:10px;"><b>Medications</b></td></tr>
  <tr>
    <td>
      ${check(noteData.medicationsNone)} None reported
      ${check(noteData.medicationsReviewed)} Reviewed
    </td>
  </tr>

  <tr><td style="padding-top:10px;"><b>Allergies</b></td></tr>
  <tr>
    <td>
      ${check(noteData.allergiesNkda)} NKDA
      ${check(noteData.allergiesReviewed)} Reviewed
    </td>
  </tr>

  <!-- ROS -->
  <tr><td style="padding-top:10px;"><b>Review of Systems</b></td></tr>
  <tr><td>General: ${check(noteData.ros?.generalNegative)} Negative ${check(noteData.ros?.generalPositive)} Positive</td></tr>
  <tr><td>HEENT: ${check(noteData.ros?.heentNegative)} Negative ${check(noteData.ros?.heentPositive)} Positive</td></tr>
  <tr><td>Respiratory: ${check(noteData.ros?.respNegative)} Negative ${check(noteData.ros?.respPositive)} Positive</td></tr>
  <tr><td>GI: ${check(noteData.ros?.giNegative)} Negative ${check(noteData.ros?.giPositive)} Positive</td></tr>
  <tr><td>GU: ${check(noteData.ros?.guNegative)} Negative ${check(noteData.ros?.guPositive)} Positive</td></tr>

  <!-- Objective -->
  <tr><td style="padding-top:10px;"><b>Objective</b></td></tr>
  <tr>
    <td>
      ${check(noteData.objective?.wellAppearing)} Well appearing
      ${check(noteData.objective?.noDistress)} No acute distress
    </td>
  </tr>

  <tr>
    <td>
      Vitals:
      ${check(noteData.vitalsNotAvailable)} Not available
      ${check(noteData.vitalsReported)} Patient reported: ${noteData.vitalsValue || ""}
    </td>
  </tr>

  <!-- Assessment -->
  <tr><td style="padding-top:10px;"><b>Assessment</b></td></tr>
  <tr><td>Primary Diagnosis: ${noteData.diagnosis || ""}</td></tr>
  <tr><td>Differential: ${noteData.differential || ""}</td></tr>

  <!-- Plan -->
  <tr><td style="padding-top:10px;"><b>Plan</b></td></tr>
  <tr><td>Medications: ${noteData.planMedications || ""}</td></tr>
  <tr>
    <td>
      Treatment:
      ${check(noteData.treatment?.otc)} OTC meds
      ${check(noteData.treatment?.hydration)} Hydration
      ${check(noteData.treatment?.rest)} Rest
      ${check(noteData.treatment?.lifestyle)} Lifestyle
    </td>
  </tr>

  <tr><td>Tests Ordered: ${noteData.tests || ""}</td></tr>

  <!-- Footer -->
  <tr><td style="padding-top:10px;"><b>Follow-up</b>:${noteData.followUp || ""}</td></tr>

  <tr><td style="padding-top:10px;><b>Emergency Precautions:</b> ${noteData.EmergencyPrecautions}</td></tr>

  <tr><td style="padding-top:10px;><b>Telehealth Attestation:</b> ${check(noteData.consent)} Patient consented</td></tr>

  <tr><td style="padding-top:10px;"><b>Provider</b>: ${noteData.providerName || ""}</td></tr>

  <tr><td style="padding-top:10px;"><b>Signature</b>: ${noteData.Signature || ""}</td></tr>

</table>
`,

      // ✅ OPTIONAL PDF ATTACHMENT
      attachments: noteData.attachPdf
        ? [
          {
            filename: "telehealth-report.pdf",
            path: noteData.pdfPath // local or S3 URL
          }
        ]
        : []
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error: error.message };
  }
};
exports.sendEmailPassword = async (email, password) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`📧 Password Email to ${email}: ${password}`);
      return { success: true, message: 'Password logged to console (SMTP not configured)' };
    }
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'no-reply@telerxs.com',
      to: email,
      subject: 'Your Account Password - Telerxs',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Account Password</h2>
          <p>Hello,</p>
          <p>Your account password is provided below:</p>

          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 24px; margin: 0;">${password}</h1>
          </div>

          <p><b>Important:</b> Please change your password after logging in for security reasons.</p>

          <p>If you did not request this, please contact support immediately.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Telerxs. Please do not reply.
          </p>
        </div>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Password Email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    console.log(`📧 Password Email to ${email}: ${password}`);
    return { success: false, error: error.message };
  }
};