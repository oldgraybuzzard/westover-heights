import type { NextApiRequest, NextApiResponse } from 'next';
import { contactFormSchema } from '@/lib/validations/contact';
import Mailjet from 'node-mailjet';
import rateLimit from 'express-rate-limit';

interface MailjetError {
  response: { data: unknown };
}

if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
  throw new Error('Mailjet credentials are not set in environment variables');
}

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});

const verifyRecaptcha = async (token: string) => {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const data = await response.json();
  
  // For v3, we also check the score
  if (!data.success || data.score < 0.5) {
    throw new Error('reCAPTCHA verification failed');
  }
  
  return data;
};

const sendEmail = async (data: {
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
          Email: process.env.CONTACT_EMAIL_FROM!,
          Name: 'Westover Heights Contact Form',
        },
        To: [
          {
            Email: process.env.CONTACT_EMAIL_TO!,
            Name: 'Westover Research Group',
          },
        ],
        Subject: `New Contact Form Submission: ${reason}`,
        TextPart: emailContent,
        HTMLPart: emailContent.replace(/\n/g, '<br>'),
        CustomID: 'ContactForm',
      },
    ],
  };

  try {
    console.log('Mailjet request data:', JSON.stringify(emailData, null, 2));
    const response = await mailjet
      .post('send', { version: 'v3.1' })
      .request(emailData);
    
    console.log('Mailjet response:', JSON.stringify(response.body, null, 2));
    return response;
  } catch (error) {
    console.error('Mailjet error:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const mailjetError = error as MailjetError;
      console.error('Mailjet error response:', mailjetError.response.data);
    }
    throw error;
  }
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply rate limiting
  await new Promise((resolve) => limiter(req, res, resolve));

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Received contact form submission');
    const validatedData = contactFormSchema.parse(req.body);
    console.log('Form data validated:', validatedData);
    
    // Verify reCAPTCHA
    console.log('Verifying reCAPTCHA token...');
    await verifyRecaptcha(validatedData.recaptchaToken);
    console.log('reCAPTCHA verified successfully');

    // Send email using Mailjet
    console.log('Sending email via Mailjet...');
    await sendEmail(validatedData);
    console.log('Email sent successfully');

    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Invalid form data' 
    });
  }
} 