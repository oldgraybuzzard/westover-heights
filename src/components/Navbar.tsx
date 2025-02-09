import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar: React.FC = () => {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-md fixed w-full z-50 top-0 -mt-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Westover Heights
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/about-terri"
              className={`${isActive('/about-terri')
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-primary'
                } transition-colors`}
            >
              About Terri
            </Link>
            <Link
              href="/resources"
              className={`${isActive('/resources')
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-primary'
                } transition-colors`}
            >
              Resources
            </Link>
            <Link
              href="/forum"
              className={`${isActive('/forum')
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-primary'
                } transition-colors`}
            >
              Forum
            </Link>
            <Link
              href="/western-blot"
              className={`${isActive('/western-blot')
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-primary'
                } transition-colors`}
            >
              Western Blot
            </Link>
            <Link
              href="/contact"
              className={`${isActive('/contact')
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-primary'
                } transition-colors`}
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-gray-600 hover:text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (hidden by default) */}
      <div className="hidden md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/about-terri"
            className="block px-3 py-2 text-gray-600 hover:text-primary"
          >
            About Terri
          </Link>
          <Link
            href="/resources"
            className="block px-3 py-2 text-gray-600 hover:text-primary"
          >
            Resources
          </Link>
          <Link
            href="/forum"
            className="block px-3 py-2 text-gray-600 hover:text-primary"
          >
            Forum
          </Link>
          <Link
            href="/western-blot"
            className="block px-3 py-2 text-gray-600 hover:text-primary"
          >
            Western Blot
          </Link>
          <Link
            href="/contact"
            className="block px-3 py-2 text-gray-600 hover:text-primary"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 