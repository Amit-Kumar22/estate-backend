import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
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
    to: options.to,
    subject: options.subject,
    html: options.html,
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
  await sendEmail({ to: adminEmail, subject: `New Lead: ${lead.name} - ${lead.source}`, html });
};
