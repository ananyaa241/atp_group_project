import cron from "node-cron";
import { AppointmentModel } from "../models/AppointmentModel.js";
import { transporter } from "../config/nodemailer.js";

// ─── Build a polished HTML reminder email ──────────────────────────────────────
function buildReminderEmail({ patientName, doctorName, appointmentDate, hoursAway }) {
  const formatted = new Date(appointmentDate).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const timeLabel = hoursAway <= 2 ? "in a few hours" : "tomorrow";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
      .wrapper { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); padding: 40px 32px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
      .header p  { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
      .body { padding: 36px 32px; }
      .greeting { font-size: 18px; color: #1e293b; font-weight: 600; margin-bottom: 16px; }
      .message  { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 24px; }
      .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }
      .info-row  { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
      .info-row:last-child { margin-bottom: 0; }
      .label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; width: 90px; flex-shrink: 0; }
      .value { font-size: 15px; font-weight: 600; color: #1e293b; }
      .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; }
      .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 13px; color: #94a3b8; }
      .cta { display: inline-block; background: #1e40af; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 8px 0 24px; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>🏥 MediCare+</h1>
        <p>Appointment Reminder</p>
      </div>
      <div class="body">
        <p class="greeting">Hello, ${patientName} 👋</p>
        <p class="message">
          This is a friendly reminder that you have an upcoming appointment <strong>${timeLabel}</strong>.
          Please be ready at least <strong>10 minutes early</strong> and carry any relevant medical reports.
        </p>
        <div class="info-card">
          <div class="info-row">
            <span class="label">Doctor</span>
            <span class="value">Dr. ${doctorName}</span>
          </div>
          <div class="info-row">
            <span class="label">Date & Time</span>
            <span class="value">${formatted}</span>
          </div>
          <div class="info-row">
            <span class="label">Status</span>
            <span class="badge">Confirmed</span>
          </div>
        </div>
        <p class="message" style="font-size:14px; color:#64748b;">
          If you need to reschedule or cancel, please contact the hospital at least 2 hours before your appointment.
        </p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} MediCare+ Hospital Management System. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

// ─── Core reminder logic ────────────────────────────────────────────────────────
async function sendReminders() {
  const now = new Date();

  // Find appointments in the next 25 hours that haven't been reminded
  const upcoming = await AppointmentModel.find({
    appointmentDate: {
      $gte: now,
      $lte: new Date(now.getTime() + 25 * 60 * 60 * 1000),
    },
    status: { $in: ["Pending", "Approved"] },
    reminderSent: false,
  })
    .populate("patientId", "name email")
    .populate("doctorId", "name");

  if (upcoming.length === 0) return;

  console.log(`[Reminder] Found ${upcoming.length} upcoming appointment(s) to notify.`);

  for (const appt of upcoming) {
    const patient = appt.patientId;
    const doctor  = appt.doctorId;

    if (!patient?.email) continue;

    const hoursAway = Math.round(
      (new Date(appt.appointmentDate) - now) / (60 * 60 * 1000)
    );

    try {
      await transporter.sendMail({
        from: `"MediCare+ 🏥" <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: `⏰ Appointment Reminder — Dr. ${doctor?.name} ${hoursAway <= 2 ? "in a few hours" : "tomorrow"}`,
        html: buildReminderEmail({
          patientName:     patient.name,
          doctorName:      doctor?.name || "your doctor",
          appointmentDate: appt.appointmentDate,
          hoursAway,
        }),
      });

      // Mark reminder sent so we don't spam
      await AppointmentModel.findByIdAndUpdate(appt._id, { reminderSent: true });

      console.log(`[Reminder] ✅ Sent to ${patient.email} for appointment on ${appt.appointmentDate}`);
    } catch (err) {
      console.error(`[Reminder] ❌ Failed to send to ${patient.email}:`, err.message);
    }
  }
}

// ─── Schedule: runs every hour ─────────────────────────────────────────────────
export function startReminderScheduler() {
  // Run immediately on boot (catches any missed reminders)
  sendReminders().catch(console.error);

  // Then run every hour at :00
  cron.schedule("0 * * * *", () => {
    console.log("[Reminder] Running hourly reminder check...");
    sendReminders().catch(console.error);
  });

  console.log("[Reminder] Appointment reminder scheduler started ✅");
}
