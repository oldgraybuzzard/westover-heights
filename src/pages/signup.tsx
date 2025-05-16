'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { FaDice, FaCheck, FaTimes } from 'react-icons/fa';
import { generateDisplayName } from '@/utils/nameGenerator';
import debounce from 'lodash/debounce';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const router = useRouter();
  const { signUp } = useAuth();

  // Debounced function to check display name availability
  const checkDisplayName = useCallback(
    debounce(async (name: string) => {
      if (!name.trim()) {
        setIsNameAvailable(null);
        return;
      }

      setIsCheckingName(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('display_name', name.trim())
        .maybeSingle();

      setIsNameAvailable(!data);
      setIsCheckingName(false);
    }, 500),
    []
  );

  // Check availability when display name changes
  useEffect(() => {
    checkDisplayName(displayName);
  }, [displayName, checkDisplayName]);

  const handleGenerateDisplayName = async () => {
    let newName;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      newName = generateDisplayName();
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('display_name', newName.trim())
        .maybeSingle();

      if (!data) {
        setDisplayName(newName);
        setIsNameAvailable(true);
        break;
      }
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      toast.error('Unable to generate a unique name. Please try again or enter your own.');
    }
  };

  // Update the display name input section to show availability
  const getDisplayNameStatus = () => {
    if (!displayName) return null;

    if (isCheckingName) {
      return <span className="text-gray-400">Checking...</span>;
    }

    if (isNameAvailable) {
      return (
        <span className="text-green-600 flex items-center">
          <FaCheck className="mr-1" /> Available
        </span>
      );
    }

    return (
      <span className="text-red-600 flex items-center">
        <FaTimes className="mr-1" /> Already taken
      </span>
    );
  };

  // Update the email validation function
  const validateEmail = (email: string) => {
    // Basic format check
    const basicFormatRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,63}$/;
    if (!basicFormatRegex.test(email)) return false;

    // Get the domain part (after @)
    const domain = email.split('@')[1].toLowerCase();

    // List of common email providers - they must have their correct TLD
    const commonProviders: { [key: string]: string[] } = {
      'gmail': ['com'],
      'yahoo': ['com', 'co.uk', 'co.jp'],
      'hotmail': ['com', 'co.uk'],
      'outlook': ['com'],
      'aol': ['com'],
      'proton': ['me', 'com'],
      'icloud': ['com']
    };

    // Check if it's a common provider
    for (const [provider, validTlds] of Object.entries(commonProviders)) {
      if (domain.startsWith(provider + '.')) {
        return validTlds.some(tld => domain === `${provider}.${tld}`);
      }
    }

    // For other domains, check against valid TLDs
    const validTlds = [
      'com', 'org', 'net', 'edu', 'gov', 'mil',
      'io', 'co', 'ai', 'app', 'dev', 'tech',
      'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp',
      // Add more valid TLDs as needed
    ];

    return validTlds.some(tld => domain.endsWith(`.${tld}`));
  };

  // Update the email status function to include format validation
  const getEmailStatus = () => {
    if (!email) return null;

    if (!validateEmail(email)) {
      return (
        <span className="text-red-600 flex items-center">
          <FaTimes className="mr-1" /> Invalid email format
        </span>
      );
    }

    if (isCheckingEmail) {
      return <span className="text-gray-400">Checking...</span>;
    }

    if (isEmailAvailable) {
      return (
        <span className="text-green-600 flex items-center">
          <FaCheck className="mr-1" /> Available
        </span>
      );
    }

    return (
      <span className="text-red-600 flex items-center">
        <FaTimes className="mr-1" /> Already registered
      </span>
    );
  };

  // Update the email availability check to include format validation
  const checkEmailAvailability = useCallback(
    debounce(async (email: string) => {
      if (!email.trim()) {
        setIsEmailAvailable(null);
        setIsEmailValid(null);
        return;
      }

      // First check email format
      const isValid = validateEmail(email);
      setIsEmailValid(isValid);

      if (!isValid) {
        setIsEmailAvailable(false);
        return;
      }

      setIsCheckingEmail(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      setIsEmailAvailable(!data);
      setIsCheckingEmail(false);
    }, 500),
    []
  );

  // Add this with your other useEffect hooks
  useEffect(() => {
    checkEmailAvailability(email);
  }, [email, checkEmailAvailability]);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isNameAvailable) {
      toast.error('Please choose an available display name');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!isEmailAvailable) {
      toast.error('This email is already registered');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating your account...');

    try {
      // Basic signup without any options
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName.trim(),
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user returned from signup');

      // Create profile using RPC
      const { error: profileError } = await supabase.rpc('create_profile', {
        p_user_id: authData.user.id,
        p_display_name: displayName.trim(),
        p_email: email.toLowerCase()
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      // Show success message with clear instructions
      toast.success('Account created! Please check your email to verify your account.', {
        id: toastId,
        duration: 5000
      });

      // Don't attempt auto-login, wait for email verification
      router.push('/signup/check-email');
    } catch (error) {
      console.error('Full error object:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create account',
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <div className="space-y-2">
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="display-name"
                    name="display-name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${displayName && (isNameAvailable ? 'border-green-500' : 'border-red-500')
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                    placeholder="Choose a display name"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    {getDisplayNameStatus()}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleGenerateDisplayName}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <FaDice className="h-5 w-5 mr-2 text-primary" />
                    Generate Random Name
                  </button>
                  <span className="text-sm text-gray-500">
                    Not sure what to use? Click to generate a random name
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${email
                    ? validateEmail(email)
                      ? isEmailAvailable
                        ? 'border-green-500'
                        : 'border-red-500'
                      : 'border-red-500'
                    : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="you@example.com"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getEmailStatus()}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordStrength(checkPasswordStrength(e.target.value));
                }}
                className={`appearance-none block w-full px-3 py-2 border ${password
                  ? passwordStrength >= 5 ? 'border-green-500' : 'border-red-500'
                  : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                placeholder="••••••••"
              />
              <div className="mt-1 text-sm">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-full rounded ${i < passwordStrength ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                    />
                  ))}
                </div>
                <ul className="mt-2 text-gray-600 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-600' : ''}>
                    • At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                    • One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                    • One number
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>
                    • One special character
                  </li>
                </ul>
              </div>
            </div>

            <input
              type="text"
              name="username"
              autoComplete="off"
              style={{ display: 'none' }}
              tabIndex={-1}
              onChange={(e) => {
                if (e.target.value) {
                  throw new Error('Bot detected');
                }
              }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
