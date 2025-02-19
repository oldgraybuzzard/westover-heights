import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

const AuthContent = dynamic(() => import('@/components/AuthContent'), {
  ssr: false
});

const HomePage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything auth-related during SSR
  if (!mounted) {
    return <div>Loading...</div>; // Or your initial loading state
  }

  return (
    <main className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center -mt-16">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Westover Research Group"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-white">
          <div className="text-4xl text-primary-100 mb-2">
            Support You Can Trust, Relief You Deserve
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Expert Care for Herpes Management
          </h1>
          <p className="text-xl mb-8 max-w-2xl font-semibold">
            Empower Yourself—Get the Guidance You Need. With over 35 years of specialized
            experience, we provide comprehensive care, testing, and consultation services
            for herpes and other STIs.
          </p>
          <div className="flex gap-4">
            <Link href="/western-blot" className="btn-primary bg-white text-primary-500">
              Get Western Blot Testing
            </Link>
            <Link href="/forum" className="btn-secondary bg-white text-primary-500">
              Ask a Question
            </Link>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Q&A Forum Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Q&A Forum
          </h2>
          <p className="text-gray-600 mb-6">
            Get personalized answers from Terri Warren at Westover Research Group. Each question includes
            two follow-up opportunities to ensure all your concerns are addressed.
          </p>
          <div className="text-lg font-semibold text-gray-900 mb-6">
            $25 per question
          </div>
          <Link
            href="/ask"
            className="btn-primary w-full"
          >
            Ask a Question
          </Link>
        </div>

        {/* Video Consultation Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Video Consultation
          </h2>
          <p className="text-gray-600 mb-6">
            Schedule a private video consultation with Terri Warren through Westover Research Group's
            secure telemedicine portal for in-depth discussion of your specific situation.
          </p>
          <div className="text-lg font-semibold text-gray-900 mb-6">
            $125 for 20 minutes
          </div>
          <Link
            href="/consultation"
            className="btn-primary w-full"
          >
            Book Consultation
          </Link>
        </div>

        {/* Research Study Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Western Blot Study
          </h2>
          <p className="text-gray-600 mb-6">
            Join Westover Research Group's research study comparing traditional screening tests
            to the gold standard herpes Western blot. Get access to the most accurate herpes testing available.
          </p>
          <div className="text-lg font-semibold text-gray-900 mb-6">
            Contact for details
          </div>
          <Link
            href="/research"
            className="btn-primary w-full"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-16 text-center">
        <p className="text-gray-500 mb-4">Westover Research Group Excellence</p>
        <div className="flex justify-center space-x-8">
          <div className="text-gray-600">Clinical Expertise</div>
          <div className="text-gray-600">Research Leadership</div>
          <div className="text-gray-600">Specialized Care</div>
        </div>
      </div>
    </main>
  );
};

export default HomePage; 