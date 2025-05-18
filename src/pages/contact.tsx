import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { contactFormSchema, type ContactFormData } from '@/lib/validations/contact';
import { z } from 'zod';
import { useNotification } from '@/contexts/NotificationContext';
import Head from 'next/head';

type ContactReason = 'consultation' | 'western_blot' | 'forum' | 'other';

interface ContactForm {
  reason: ContactReason;
  name: string;
  email: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    reason: 'consultation',
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // Load reCAPTCHA script
  useEffect(() => {
    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey) {
      console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not defined');
      showError('Configuration error. Please contact support.');
      return;
    }
    
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('reCAPTCHA script loaded');
      // Initialize reCAPTCHA after loading
      window.grecaptcha.ready(() => {
        console.log('reCAPTCHA ready');
        setRecaptchaLoaded(true);
        
        // Make the badge visible temporarily to comply with Google's terms
        const badge = document.querySelector('.grecaptcha-badge');
        if (badge) {
          badge.classList.add('show');
          setTimeout(() => {
            badge.classList.remove('show');
          }, 5000);
        }
      });
    };
    
    script.onerror = (e) => {
      console.error('Error loading reCAPTCHA script:', e);
      showError('Failed to load reCAPTCHA. Please try again later or contact support.');
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up script if component unmounts during loading
      if (!script.onload) {
        document.head.removeChild(script);
      }
    };
  }, [showError]);

  const validateForm = (): boolean => {
    try {
      // Create a validation object without the recaptchaToken since it's not in formData yet
      const validationData = {
        ...formData,
        // Add a placeholder for recaptchaToken that will be replaced later
        recaptchaToken: 'placeholder'
      };
      
      // Use a modified schema that doesn't validate recaptchaToken
      const formOnlySchema = z.object({
        reason: z.enum(['consultation', 'western_blot', 'forum', 'other']),
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Please enter a valid email address'),
        message: z.string().min(10, 'Message must be at least 10 characters'),
        recaptchaToken: z.string()
      });
      
      formOnlySchema.parse(validationData);
      setErrors({});
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(newErrors);
        console.log('Validation errors:', newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed');

    if (!recaptchaLoaded) {
      showError('reCAPTCHA is not loaded yet. Please try again in a moment.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA with action
      console.log('Executing reCAPTCHA...');
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      
      if (!siteKey) {
        throw new Error('reCAPTCHA site key is not configured');
      }
      
      const token = await new Promise<string>((resolve, reject) => {
        if (!window.grecaptcha) {
          reject(new Error('reCAPTCHA not loaded'));
          return;
        }
        
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action: 'contact_submit' })
            .then((token: string) => {
              console.log('reCAPTCHA token obtained');
              resolve(token);
            })
            .catch((error: any) => {
              console.error('reCAPTCHA execution error:', error);
              reject(new Error('Failed to verify you are not a robot. Please try again.'));
            });
        });
      });

      console.log('Submitting form to API...');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken: token }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API Response:', data);

      showSuccess('Message sent successfully!');
      router.push('/contact/thank-you');
    } catch (error) {
      console.error('Failed to submit form:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      showError(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | Westover Heights</title>
        <meta name="description" content="Contact Westover Heights for consultations, Western Blot testing, or other inquiries." />
      </Head>
      
      <main className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>

        {/* Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="prose max-w-none">
            <p className="mb-4">
              If you have general herpes questions, please{' '}
              <Link href="/forum" className="text-primary hover:text-primary/80">
                post them on our forum
              </Link>{' '}
              on this website.
            </p>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 my-6">
              <p className="font-medium text-yellow-800">
                Please note: We will not be able to respond to herpes questions sent through this contact form.
                For herpes-related questions, please use our forum instead.
              </p>
            </div>
            <p className="mb-4">
              For any questions about Westover Heights services, including private consultation
              and information about the Herpes Western Blot Test, please fill out the contact
              form below and we will get back to you.
            </p>
            <p className="mb-4">
              If you have something you want to fax us, our fax number is{' '}
              <span className="font-semibold">(503) 226-4307</span>
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Inquiries & Support</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Contacting Us*
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value as ContactReason })}
                className={`form-select w-full rounded-md border ${errors.reason ? 'border-red-500' : 'border-gray-300'} focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
                required
              >
                <option value="consultation">Private Consultation</option>
                <option value="western_blot">Western Blot Test</option>
                <option value="forum">Forum Concerns</option>
                <option value="other">Other</option>
              </select>
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`form-input w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`form-input w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message*
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`form-textarea w-full rounded-md border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 h-32`}
                required
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {/* reCAPTCHA notice */}
            <div className="text-xs text-gray-500 flex items-center">
              <div className="mr-2">
                <div className="g-recaptcha-badge-container"></div>
              </div>
              <p>
                This site is protected by reCAPTCHA and the Google{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary">
                  Terms of Service
                </a>{' '}
                apply.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !recaptchaLoaded}
              className="w-full bg-green-100 text-green-800 hover:bg-green-200 font-bold px-4 py-2 rounded-md shadow-sm hover:shadow transition-all duration-200 border border-green-300 disabled:opacity-70"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            
            {!recaptchaLoaded && (
              <p className="text-sm text-amber-600">Loading reCAPTCHA...</p>
            )}
          </form>
        </div>
      </main>
    </>
  );
};

// Add TypeScript declaration for window.grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default ContactPage;
