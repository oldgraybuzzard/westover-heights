import React from 'react';
import Link from 'next/link';
import { FaVideo, FaFlask, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';

const WesternBlotPage: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Western Blot Testing & Video Consultation</h1>

      {/* Introduction */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            STD experts agree that the herpes western blot is by far the best confirmatory antibody test. The <a className="text-blue-500" href='https://www.cdc.gov/std/treatment-guidelines/herpes.htm'>CDC</a> and FDA recommend confirmatory testing for people who get low positive <a className='text-blue-500' href='https://www.webmd.com/a-to-z-guides/immunoglobulin-test'>IgG</a> results.  People with low positive 'IgG results and people who test positive but have no symptoms should consider a confirmatory test as well. We can assist you to get the western blot if you are willing to be part of a research study we are doing. The study compares the accuracy of IgG test results with gold standard western blot results.  Participating would simply mean allowing us to include IgG and western blot results in our research study data base, anonymously.  No names,
          </p>
          <p>
            Do you have questions about genital herpes? Many people do! It can be a confusing topic, and
            sometimes, clinicians do not have up-to-date information. Are you confused about how to interpret
            an antibody test that you've taken? I can help with that, too. Do you live in Oregon and need
            to obtain a prescription for herpes medication? I can help you with that as well.
          </p>
        </div>
      </section>

      {/* Services */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Video Consultation */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <FaVideo className="text-2xl text-primary" />
            <h2 className="text-2xl font-semibold text-gray-900">Video Consultation</h2>
          </div>
          <div className="prose max-w-none text-gray-700 mb-6">
            <p>
              Would you like to talk about your situation and ask some questions? We can do that.
              Lots of people prefer to talk to an expert in addition to their regular healthcare provider.
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <FaDollarSign className="text-primary" />
              20-minute consult: $125
            </p>
          </div>
        </section>

        {/* Western Blot */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <FaFlask className="text-2xl text-primary" />
            <h2 className="text-2xl font-semibold text-gray-900">Herpes Western Blot</h2>
          </div>
          <div className="prose max-w-none text-gray-700 mb-6">
            <p>
              Herpes experts agree that the herpes western blot is by far the best confirmatory
              antibody test. The CDC recommends confirmatory testing for low positive IgG results.
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <FaDollarSign className="text-primary" />
              Complete service: $325
            </p>
          </div>
        </section>
      </div>

      {/* Process Steps */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Steps for Western Blot Testing</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Schedule a Consultation</h3>
              <p className="text-gray-700">
                Set up an appointment via <a className="text-blue-500" href="https://evisit.com/...">eVisit</a> to discuss your situation and receive a prescription for the herpes western blot test. You'll need to create a new account on eVisit. This initial consultation is required as part of
                nursing standard of care guidelines.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Request Test Kit</h3>
              <p className="text-gray-700">
                Contact the <a className="text-blue-500" href="https://dlmp.uw.edu/patient-care/client-patient-services">University of Washington</a> at 206-520-4600 to request your herpes westernblot kit.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Blood Draw & Shipping</h3>
              <p className="text-gray-700">
                Visit an <a className="text-blue-500" href="https://www.anylabtestnow.com/">AnyLabTestNow</a> location or an  AnyLabTestNow location for blood draw and shipping services. Fees typically
                range from $40-50 plus shipping costs.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Results & Follow-up</h3>
              <p className="text-gray-700">
                Receive your results within 1-3 weeks, with follow-up support available for any questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary/10 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Get Started?</h2>
        <a
          href="https://evisit.com/..."  // Add actual eVisit URL
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2"
        >
          <FaCalendarAlt /> Schedule Appointment
        </a>
        <p className="mt-4 text-sm text-gray-600">
          Note: You'll need to create a new account on eVisit, separate from any forum account.
        </p>
      </section>
    </main>
  );
};

export default WesternBlotPage; 