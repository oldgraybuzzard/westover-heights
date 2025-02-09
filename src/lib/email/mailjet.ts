import Mailjet from 'node-mailjet';

if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
  throw new Error('Mailjet credentials are not set in environment variables');
}

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});

export const sendEmail = async (data: {
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

  const emailData = {
    Messages: [
      {
        From: {
          Email: process.env.CONTACT_EMAIL_FROM || 'noreply@westoverheights.com',
          Name: 'Westover Heights Contact Form',
        },
        To: [
          {
            Email: process.env.CONTACT_EMAIL_TO || 'contact@westoverheights.com',
            Name: 'Westover Heights Clinic',
          },
        ],
        Subject: `New Contact Form Submission: ${reason}`,
        TextPart: emailContent,
        HTMLPart: emailContent.replace(/\n/g, '<br>'),
        CustomID: 'ContactForm',
      },
    ],
  };

  return mailjet.post('send', { version: 'v3.1' }).request(emailData);
}; 