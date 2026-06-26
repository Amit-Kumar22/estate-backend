import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    replyTo: process.env.FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
    },
  });
};

export const sendLeadNotification = async (lead: {
  name: string;
  email: string;
  mobile: string;
  source: string;
  projectName?: string;
  message?: string;
}): Promise<void> => {
  const adminEmail = process.env.SMTP_USER || process.env.FROM_EMAIL;
  if (!adminEmail) return;

  const text = `New Lead Received

Name:    ${lead.name}
Email:   ${lead.email}
Mobile:  ${lead.mobile}
Source:  ${lead.source.replace(/_/g, ' ')}
${lead.projectName ? `Project: ${lead.projectName}\n` : ''}${lead.message ? `Message: ${lead.message}\n` : ''}
Received at: ${new Date().toLocaleString('en-IN')}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Lead Received!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; width: 40%;"><strong>Name:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.name}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Email:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.email}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Mobile:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.mobile}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Source:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-transform: capitalize;">${lead.source.replace(/_/g, ' ')}</td></tr>
          ${lead.projectName ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;"><strong>Project:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.projectName}</td></tr>` : ''}
          ${lead.message ? `<tr><td style="padding: 10px 0; color: #666;"><strong>Message:</strong></td>
              <td style="padding: 10px 0;">${lead.message}</td></tr>` : ''}
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">Received at: ${new Date().toLocaleString('en-IN')}</p>
      </div>
    </div>
  `;

  await sendEmail({ to: adminEmail, subject: `New Lead from ${lead.name}`, html, text });
};

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const siteName = process.env.FROM_NAME || 'Real Estate Platform';

  const text = `Hi,

Here is your verification code for ${siteName}:

  ${otp}

This code is valid for 10 minutes. Do not share it with anyone.

If you did not request this, please ignore this email.

— ${siteName} Team`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#16a34a;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">${siteName}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#d1fae5;">Email Verification</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:15px;color:#111827;font-weight:600;">Hello,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;">
            Use the code below to verify your email address. This code expires in <strong>10 minutes</strong>.
          </p>

          <!-- Code box -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:4px 0 28px;">
              <div style="display:inline-block;background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:18px 40px;">
                <span style="font-size:38px;font-weight:bold;letter-spacing:10px;color:#15803d;font-family:monospace;">${otp}</span>
              </div>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
            If you did not request this code, you can safely ignore this email. Someone may have entered your address by mistake.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to: email,
    subject: `${otp} is your verification code`,
    html,
    text,
  });
};

export const sendReviewNotification = async (review: {
  name: string;
  email: string;
  city?: string;
  rating: number;
  review: string;
}): Promise<void> => {
  const adminEmail = process.env.SMTP_USER || process.env.FROM_EMAIL;
  if (!adminEmail) return;

  const siteName = process.env.FROM_NAME || 'Real Estate Platform';
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const adminPanelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reviews`;

  const text = `New Review Submitted — Awaiting Approval

Name:   ${review.name}
Email:  ${review.email}
${review.city ? `City:   ${review.city}\n` : ''}Rating: ${stars} (${review.rating}/5)

"${review.review}"

Approve or reject here: ${adminPanelUrl}

Received at: ${new Date().toLocaleString('en-IN')}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <tr><td style="background:#16a34a;padding:24px 32px;">
          <p style="margin:0;font-size:18px;font-weight:bold;color:#fff;">New Review Submitted</p>
          <p style="margin:4px 0 0;font-size:13px;color:#d1fae5;">Awaiting your approval before it goes live</p>
        </td></tr>

        <tr><td style="padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:30%;"><strong>Name</strong></td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;">${review.name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;"><strong>Email</strong></td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;">${review.email}</td>
            </tr>
            ${review.city ? `<tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;"><strong>City</strong></td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;">${review.city}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;"><strong>Rating</strong></td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#f59e0b;">${stars} &nbsp;<span style="color:#6b7280;font-size:12px;">(${review.rating}/5)</span></td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#6b7280;font-size:13px;vertical-align:top;"><strong>Review</strong></td>
              <td style="padding:12px 0;font-size:13px;color:#374151;font-style:italic;line-height:1.6;">&ldquo;${review.review}&rdquo;</td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr><td align="center">
              <a href="${adminPanelUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:bold;">
                Open Admin Panel
              </a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background:#f9fafb;padding:14px 32px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${siteName}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to: adminEmail,
    subject: `Review from ${review.name} — ${review.rating}/5 stars`,
    html,
    text,
  });
};
