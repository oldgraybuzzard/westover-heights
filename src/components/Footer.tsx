import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaEnvelope } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Us</h3>
            <p className="text-gray-600 text-sm">
              Westover Research Group (formerly the Westover Heights Clinic) specializes in the diagnosis and treatment of herpes
              and other STIs, providing expert care and consultation services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about-terri" className="text-gray-600 hover:text-primary text-sm">
                  About Terri Warren
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-600 hover:text-primary text-sm">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-gray-600 hover:text-primary text-sm">
                  Herpes Forum
                </Link>
              </li>
              <li>
                <Link href="/western-blot" className="text-gray-600 hover:text-primary text-sm">
                  Western Blot Testing
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/forum" className="text-gray-600 hover:text-primary text-sm">
                  Ask a Question
                </Link>
              </li>
              <li>
                <Link href="/western-blot" className="text-gray-600 hover:text-primary text-sm">
                  Video Consultation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Portland, Oregon</p>
              <Link
                href="/contact"
                className="hover:text-primary flex items-center gap-2"
              >
                <FaEnvelope className="text-primary" />
                Contact Us
              </Link>
              <div className="flex gap-4 mt-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebook size={20} />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-12 pt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Westover Heights. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy-policy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center mt-4">
          <p>© {new Date().getFullYear()} Westover Heights Clinic. All rights reserved.</p>
          <p className="mt-1">
            Developed by {''}
            <a
              href="https://github.com/oldgraybuzzard?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              Melken Tech Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 