import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { contactFormSchema, type ContactFormData } from '@/lib/validations/contact';
import { z } from 'zod';
import { useNotifications } from '@/context/NotificationContext';

type ContactReason = 'consultation' | 'western_blot' | 'forum' | 'other';

interface ContactForm {
  reason: ContactReason;
  name: string;
  phone: string;
  email: string;
  referralSource: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    reason: 'consultation',
    name: '',
    phone: '',
    email: '',
    referralSource: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const validateForm = (): boolean => {
    try {
      contactFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(newErrors);
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
      console.log('Validation errors:', errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA with action
      console.log('Executing reCAPTCHA...');
      const token = await new Promise<string>((resolve, reject) => {
        (window as any).grecaptcha.ready(() => {
          console.log('reCAPTCHA ready');
          (window as any).grecaptcha
            .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'contact_submit' })
            .then((token: string) => {
              console.log('reCAPTCHA token obtained:', token.substring(0, 10) + '...');
              resolve(token);
            })
            .catch(reject);
        });
      });

      console.log('Submitting form to API...');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken: token }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      showSuccess('Message sent successfully!');
      router.push('/contact/thank-you');
    } catch (error) {
      console.error('Failed to submit form:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        formData: { ...formData, recaptchaToken: '...' }
      });
      showError(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 pt-[120px]">
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
          <p className="mb-4">
            For any questions about Westover Heights services, including private consultation
            and information about the Herpes Western Blot Test, please fill out the contact
            form below and we will get back to you. Please note, we will not be able to
            respond to herpes questions sent through the contact form.
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
              className={`form-select ${errors.reason ? 'border-red-500' : ''}`}
              required
            >
              <option value="consultation">Private Consultation</option>
              <option value="western_blot">Western Blot Test</option>
              <option value="forum">Forum Questions</option>
              <option value="other">Other Services</option>
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
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
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
              className={`form-input ${errors.email ? 'border-red-500' : ''}`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How did you hear about us?
            </label>
            <input
              type="text"
              value={formData.referralSource}
              onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
              className={`form-input ${errors.referralSource ? 'border-red-500' : ''}`}
            />
            {errors.referralSource && (
              <p className="mt-1 text-sm text-red-600">{errors.referralSource}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message*
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className={`form-textarea ${errors.message ? 'border-red-500' : ''}`}
              required
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary w-full ${isSubmitting ? 'btn-disabled' : ''}`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ContactPage; 