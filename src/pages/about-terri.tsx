import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutTerri: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 pt-[120px] animate-fade-in">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Terri</h1>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/3">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden">
              <Image
                src="/images/about.jpeg"
                alt="Terri Warren"
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
          </div>

          <div className="md:w-2/3">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 mb-4">
              Terri Warren, nurse practitioner, is the owner of the Westover Research Group (formerly the Westover Heights Clinic). She received her bachelor of arts degree from Tarkio College in Tarkio, Missouri; her master of science in education and counseling degree from Western Oregon University in Monmouth, Oregon; her registered nurse degree from Oregon Health and Sciences University in Portland; and her master of science degree as a nurse practitioner from the University of Portland in Portland, Oregon.
            </p>
            <p className="text-gray-700">
              Terri has served as principal investigator or sub-investigator on more than 120 clinical trials evaluating various testing mechanisms for sexually transmitted infections, the efficacy of experimental vaccines, and pharmacologic interventions for numerous human infections. Her area of special expertise is the herpes simplex virus.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Education</h2>
            <ul className="list-none space-y-2 text-gray-700">
              <li className="hover-list-item">1970 - Tarkio College, Tarkio, Missouri, B.A., Psychology</li>
              <li className="hover-list-item">1973 - Western Oregon University, Monmouth, OR, M.Ed. Education/Counseling</li>
              <li className="hover-list-item">1982 - Oregon Health Sciences University, Portland, OR, B.S.N., nursing</li>
              <li className="hover-list-item">1994 - University of Portland, Nurse Practitioner program, M.S., nursing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Licensure</h2>
            <ul className="list-none space-y-2 text-gray-700">
              <li className="hover-list-item">Registered Nurse, Oregon State Board of Nursing, License No. 82011212RN</li>
              <li className="hover-list-item">Adult Nurse Practitioner Oregon State Board of Nursing, License No. 82011212N3</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Professional Experience</h2>
            <ul className="list-none space-y-2 text-gray-700">
              <li className="hover-list-item">1982-2015 - Owner and Nurse Practitioner, Westover Heights Clinic</li>
              <li className="hover-list-item">1999-2012 - Expert and responder, WebMD Genital Herpes Message Board</li>
              <li className="hover-list-item">2009-2014 - Expert and Responder, MedHelp Genital Herpes Message Board</li>
              <li className="hover-list-item">2015-present - Expert and Responder, American Social Health Association board</li>
              <li className="hover-list-item">2013-present - Expert and Responder, Westover Heights Clinic Herpes Forum</li>
              <li className="hover-list-item">2015-present - Owner and Nurse Practitioner, Westover Research Group</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Professional Affiliations</h2>
            <ul className="list-none space-y-2 text-gray-700">
              <li className="hover-list-item">American Sexual Health Association</li>
              <li className="hover-list-item">Association of Reproductive Health Professionals</li>
            </ul>
          </section>

          <div className="mt-12 text-center">
            <Link href="/forum" className="btn-primary">
              Ask Terri a Question In the Forum
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutTerri; 