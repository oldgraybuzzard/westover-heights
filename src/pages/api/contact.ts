import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
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
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.error('RECAPTCHA_SECRET_KEY is not defined');
    throw new Error('Server configuration error');
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    if (!response.ok) {
      console.error('reCAPTCHA verification failed with status:', response.status);
      throw new Error('reCAPTCHA verification failed');
    }

    const data = await response.json();
    console.log('reCAPTCHA verification response:', {
      success: data.success,
      score: data.score,
      action: data.action,
      hostname: data.hostname,
      timestamp: new Date().toISOString()
    });
    
    // For v3, we also check the score
    if (!data.success) {
      console.error('reCAPTCHA verification unsuccessful:', data);
      throw new Error('reCAPTCHA verification failed');
    }
    
    if (data.score < 0.5) {
      console.warn('reCAPTCHA score too low:', data.score);
      throw new Error('Suspicious activity detected. Please try again later.');
    }
    
    return data;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    throw new Error('Failed to verify you are not a robot. Please try again.');
  }
};

const sendEmail = async (data: {
  name: string;
  email: string;
  reason: string;
  message: string;
}) => {
  const { name, email, reason, message } = data;

  const emailContent = `
    New Contact Form Submission
    
    Reason: ${reason}
    Name: ${name}
    Email: ${email}
    
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
            Email: 'terri@westoverheights.com',
            Name: 'Terri Warren',
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
    
    // Validate the request body
    if (!req.body || !req.body.recaptchaToken) {
      console.error('Missing reCAPTCHA token');
      return res.status(400).json({ message: 'Missing reCAPTCHA token' });
    }
    
    const validatedData = contactFormSchema.parse(req.body);
    console.log('Form data validated');
    
    // Verify reCAPTCHA
    console.log('Verifying reCAPTCHA token...');
    try {
      await verifyRecaptcha(validatedData.recaptchaToken);
      console.log('reCAPTCHA verified successfully');
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return res.status(401).json({ 
        message: error instanceof Error 
          ? error.message 
          : 'reCAPTCHA verification failed'
      });
    }

    // Send email using Mailjet
    console.log('Sending email via Mailjet...');
    try {
      await sendEmail(validatedData);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Failed to send email:', error);
      return res.status(500).json({ 
        message: 'Failed to send your message. Please try again later.'
      });
    }

    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid form data', errors: error.errors });
    }
    
    return res.status(500).json({ 
      message: 'An error occurred while processing your request'
    });
  }
} 
