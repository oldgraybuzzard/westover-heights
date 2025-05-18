import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const ThankYouPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Thank You | Westover Heights</title>
        <meta name="description" content="Thank you for contacting Westover Heights." />
      </Head>
      
      <main className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          
          <p className="text-lg text-gray-700 mb-6">
            Your message has been received. We'll get back to you as soon as possible.
          </p>
          
          <Link href="/" className="inline-block bg-primary text-white font-medium px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
            Return to Home
          </Link>
        </div>
      </main>
    </>
  );
};

export default ThankYouPage;
