import { z } from 'zod';

const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

export const contactFormSchema = z.object({
  reason: z.enum(['consultation', 'western_blot', 'forum', 'other']),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters'),
  referralSource: z.string().optional(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  recaptchaToken: z.string(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>; 