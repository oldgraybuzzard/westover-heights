import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is not set');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendContactEmail = async (data: {
  name: string;
  email: string;
  reason: string;
  message: string;
  phone?: string;
  referralSource?: string;
}) => {
  const { name, email, reason, message, phone, referralSource } = data;

  const emailContent = `
    New Contact Form Submission
    
    Reason: ${reason}
    Name: ${name}
    Email: ${email}
    Phone: ${phone || 'Not provided'}
    Referral Source: ${referralSource || 'Not provided'}
    
    Message:
    ${message}
  `;

  const msg = {
    to: process.env.CONTACT_EMAIL_TO || 'your-email@example.com',
    from: process.env.CONTACT_EMAIL_FROM || 'noreply@your-domain.com',
    subject: `New Contact Form Submission: ${reason}`,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>'),
  };

  await sgMail.send(msg);
}; 