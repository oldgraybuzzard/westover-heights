import React from 'react';
import Link from 'next/link';

const ThankYouPage: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 pt-[120px]">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Your message has been sent successfully. We'll get back to you as soon as possible.
        </p>
        <Link href="/" className="btn-primary">
          Return to Homepage
        </Link>
      </div>
    </main>
  );
};

export default ThankYouPage; 