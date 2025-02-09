import React from 'react';
import Link from 'next/link';
import { FaFileDownload, FaVideo, FaExternalLinkAlt } from 'react-icons/fa';
import PdfViewer from '@/components/PdfViewer';

const ResourcesPage: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Free Resources</h1>

      {/* Herpes Handbook Section */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Updated Herpes Handbook</h2>
        <div className="prose max-w-none text-gray-700 mb-6">
          <p className="mb-4">
            This book is updated frequently to provide you with the very latest information and research
            about genital and oral herpes. The Herpes Handbook allows partners to learn more about herpes
            in a non-threatening way and offers the words that a person with herpes may find difficult to speak.
          </p>
          <p>
            The book serves as a reference for reviewing facts or a resource when struggling with
            self-acceptance issues. Available as a free download or in print form by contacting us.
          </p>
        </div>
        <div className="space-y-8">
          <PdfViewer
            pdfUrl="/pdf/Updated-Herpes-Book.pdf"
            title="Herpes Handbook (English)"
          />
          <PdfViewer
            pdfUrl="/pdf/Herpes-Handbook-ESP-1.pdf"
            title="Manual de Herpes (Español)"
          />
        </div>
      </section>

      {/* Living with Herpes Video Section */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Living with Herpes Video</h2>
        <div className="prose max-w-none text-gray-700 mb-6">
          <p>
            The Living With Herpes video describes common psychological and emotional aspects
            associated with the diagnosis of genital herpes, presented by Terri Warren, RN NP.
          </p>
        </div>
        <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
          <iframe
            src="https://www.youtube.com/embed/YcIl-hclrLI"
            title="Living with Herpes Video"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Note: This video provides general information about living with herpes. For specific medical advice,
          please consult with a healthcare provider or ask a question in our forum.
        </div>
      </section>

      {/* Additional Resources */}
      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Resources</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/forum" className="card hover:no-underline">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Herpes Forum</h3>
            <p className="text-gray-700 mb-4">
              Get personalized answers to your questions from Terri Warren.
            </p>
            <span className="text-primary font-semibold flex items-center gap-2">
              Visit Forum <FaExternalLinkAlt className="text-sm" />
            </span>
          </Link>

          <Link href="/western-blot" className="card hover:no-underline">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Western Blot Testing</h3>
            <p className="text-gray-700 mb-4">
              Learn about getting the gold standard herpes test.
            </p>
            <span className="text-primary font-semibold flex items-center gap-2">
              Learn More <FaExternalLinkAlt className="text-sm" />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ResourcesPage; 