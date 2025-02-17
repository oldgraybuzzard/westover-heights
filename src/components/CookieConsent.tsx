import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setShowConsent(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            <p>
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
              By clicking "Accept All", you consent to our use of cookies.{' '}
              <Link href="/privacy-policy#cookies" className="text-primary hover:text-primary-dark">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={acceptEssential}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border rounded-md hover:bg-gray-50"
            >
              Essential Only
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dark rounded-md"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}