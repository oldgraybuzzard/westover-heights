import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <main className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center -mt-16">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Westover Heights Clinic"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-white">
          <div className="text-xl text-primary-100 mb-2">
            Support You Can Trust, Relief You Deserve
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Expert Care for Herpes Management
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Empower Yourself—Get the Guidance You Need. With over 35 years of specialized
            experience, we provide comprehensive care, testing, and consultation services
            for herpes and other STIs.
          </p>
          <div className="flex gap-4">
            <Link href="/western-blot" className="btn-primary">
              Get Western Blot Testing
            </Link>
            <Link href="/forum" className="btn-secondary">
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
            Get personalized answers from Terri Warren at Westover Heights Clinic. Each question includes
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
            Schedule a private video consultation with Terri Warren through Westover Heights Clinic's
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
            Join Westover Heights Clinic's research study comparing traditional screening tests
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

      {/* Add new Portland STD Care Section */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Need STD Care in Portland, OR?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card hover-lift">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              NW Dermatology Institute
            </h3>
            <p className="text-gray-600 mb-4">
              Comprehensive STI testing and treatment services available with Sheryl Horwitz, NP.
              All visits are confidential and patients are treated with respect.
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Complete STI screening and treatment</li>
              <li>• Herpes consultations and prescriptions</li>
              <li>• Sexual health counseling</li>
              <li>• Most insurances accepted</li>
            </ul>
            <div className="text-sm text-gray-500">
              2525 NW Lovejoy St, Suite 400, Portland, OR 97210
            </div>
            <a
              href="https://pdxderm.com/dermatology/sti-diagnosis-and-treatment/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 inline-block"
            >
              Learn More at PDX Derm
            </a>
          </div>

          <div className="card hover-lift">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Synergy Women's Health Care
            </h3>
            <p className="text-gray-600 mb-4">
              Personalized, integrative women's health care in a unique environment.
              Services provided by Sheryl Horwitz, WHNP and team.
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Women's health specialists</li>
              <li>• Comprehensive gynecological care</li>
              <li>• Personalized treatment plans</li>
              <li>• Integrative healthcare approach</li>
            </ul>
            <div className="text-sm text-gray-500">
              2525 NW Lovejoy St, Suite 300, Portland, OR 97210
            </div>
            <a
              href="https://synergypdx.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 inline-block"
            >
              Visit Synergy Women's Health
            </a>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-16 text-center">
        <p className="text-gray-500 mb-4">Westover Heights Clinic Excellence</p>
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