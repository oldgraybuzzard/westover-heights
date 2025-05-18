import { z } from 'zod';

export const contactFormSchema = z.object({
  reason: z.enum(['consultation', 'western_blot', 'forum', 'other']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA verification is required')
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
