import React from 'react';
import Head from 'next/head';
import Image from 'next/image';

const MaintenancePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Under Maintenance | Westover Heights</title>
        <meta name="description" content="Our website is currently under maintenance. We'll be back soon!" />
      </Head>
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <Image 
              src="/logo.png" 
              alt="Westover Heights Logo" 
              width={200} 
              height={80} 
              className="mx-auto"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            We're Making Improvements
          </h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <p className="text-gray-600 mb-4">
              Our website is currently undergoing scheduled maintenance and upgrades.
            </p>
            <p className="text-gray-600 mb-4">
              We apologize for any inconvenience and appreciate your patience.
            </p>
            <p className="text-gray-600">
              Please check back soon!
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>For urgent matters, please email: <a href="mailto:terri@westoverheights.com" className="text-blue-600 hover:underline">terri@westoverheights.com</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MaintenancePage;