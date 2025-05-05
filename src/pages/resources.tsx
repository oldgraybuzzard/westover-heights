import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFileDownload, FaVideo, FaExternalLinkAlt } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Dynamically import PdfViewer with no SSR
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 rounded-lg animate-pulse" />
});

const ResourcesPage: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in bg-gradient-to-b from-gray-200 to-gray-100">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Free Resources</h1>

      {/* Herpes Handbook Section */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8 border border-primary/10 hover:shadow-lg transition-shadow duration-300">
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
            pdfUrl="/pdf/Herpes-Handbook-ESP.pdf"
            title="Manual de Herpes (Español)"
          />
        </div>
      </section>

      {/* The Good News About The Bad News Book Section */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8 border border-primary/10 hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Good News About The Bad News</h2>
        <div className="md:flex gap-8">
          <div className="md:w-1/4 mb-6 md:mb-0">
            <Image
              src="/images/book-cover.jpg"
              alt="The Good News About The Bad News book cover"
              width={240}
              height={360}
              priority
              className="rounded-lg shadow-md mx-auto"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '240px'
              }}
            />
            <div className="mt-4 flex flex-col gap-3">
              <a
                href="#paypal-link"
                className="btn-primary block text-center text-sm py-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy from Us via PayPal
              </a>
              <a
                href="https://www.amazon.com/Good-News-About-Bad-Herpes/dp/1572246189"
                className="btn-secondary block text-center text-sm py-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy on Amazon
              </a>
            </div>
          </div>
          <div className="md:w-3/4">
            <div className="prose max-w-none text-gray-700">
              <p className="mb-4">
                Terri Warren is the author of the best-selling book on Herpes on Amazon.com.
                <span className="font-semibold italic">The Good News About the Bad News – Herpes: Everything You Need to Know</span>
                is a complete guide to living and loving with genital herpes with this core message:
                a herpes diagnosis is not the end of the world.
              </p>
              <p className="mb-4">
                Written in a positive, honest, and straightforward style, this book shows readers how they
                can live fulfilling and sexually active lives with the virus. The author offers information on:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Understanding herpes symptoms and triggers</li>
                <li>Treatment options and latest research</li>
                <li>Reducing transmission to future partners</li>
                <li>Breaking the news to potential partners</li>
                <li>Coping with herpes in relationships</li>
                <li>Finding support groups and resources</li>
              </ul>
              <p>
                Each chapter addresses the most common questions and concerns people with herpes have,
                based on Terri's experiences counseling thousands of people with genital herpes in her
                sexual health clinic and online as the herpes expert at WebMD.com.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Living with Herpes Video Section */}
      <section className="bg-white rounded-lg shadow-md p-8 mb-8 border border-primary/10 hover:shadow-lg transition-shadow duration-300">
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
      <section className="bg-white rounded-lg shadow-md p-8 border border-primary/10 hover:shadow-lg transition-shadow duration-300">
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
