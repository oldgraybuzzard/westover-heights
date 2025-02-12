import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const isActive = (path: string) => router.pathname === path;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About Terri', href: '/about-terri' },
    { name: 'Resources', href: '/resources' },
    { name: 'Forum', href: '/forum' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

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

          {/* Auth button - desktop */}
          <div className="hidden sm:flex items-center">
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Log Out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary focus:outline-none"
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
      {isOpen && (
        <div className="hidden md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/about-terri"
              className="block px-3 py-2 text-gray-600 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              About Terri
            </Link>
            <Link
              href="/resources"
              className="block px-3 py-2 text-gray-600 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Resources
            </Link>
            <Link
              href="/forum"
              className="block px-3 py-2 text-gray-600 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Forum
            </Link>
            <Link
              href="/western-blot"
              className="block px-3 py-2 text-gray-600 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Western Blot
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-gray-600 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="mobile-nav-link w-full text-left"
              >
                Log Out
              </button>
            ) : (
              <Link
                href="/login"
                className="mobile-nav-link"
                onClick={() => setIsOpen(false)}
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 