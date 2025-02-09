import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { NavigationItem } from '@/types';
import NotificationBell from '@/components/notifications/NotificationBell';
import DropdownMenu from '@/components/navigation/DropdownMenu';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const mainNavItems: NavigationItem[] = [
  { label: 'Herpes Forum', href: '/forum' },
  { label: 'Free Resources', href: '/resources' },
  { label: 'Contact', href: '/contact' },
  { label: 'About Terri', href: '/about-terri' },
];

const resourcesMenu: NavigationItem[] = [
  { label: 'Articles', href: '/resources/articles' },
  { label: 'FAQ', href: '/resources/faq' },
  { label: 'Research Papers', href: '/resources/research' },
  { label: 'Videos', href: '/resources/videos' },
];

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [logoError, setLogoError] = React.useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActivePath = (path: string) => router.pathname === path;

  return (
    <header className={`fixed w-full top-0 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/95'}`}>
      {/* Top bar */}
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4 group">
              {!logoError && (
                <div className="w-12 h-12 relative shrink-0">
                  <Image
                    src="/images/logo.jpg"
                    alt="Westover Heights Clinic"
                    width={48}
                    height={48}
                    style={{ width: '48px', height: '48px' }}
                    className="rounded-md"
                    onError={() => setLogoError(true)}
                  />
                </div>
              )}
              <div>
                <div className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-200">
                  Westover Heights Clinic
                </div>
                <div className="text-sm text-gray-600">
                  Expert Herpes Care & Research
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <NotificationBell />
                  <button
                    onClick={logout}
                    className="btn-secondary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary">
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <div className="hidden md:block border-b bg-white">
        <nav className="container">
          <ul className="flex justify-center space-x-12 py-4">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActivePath(item.href)
                    ? 'text-primary font-semibold'
                    : ''
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute w-full bg-white border-b transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <nav className="container py-4">
          <ul className="space-y-4">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block py-2 nav-link ${isActivePath(item.href)
                    ? 'text-primary font-semibold'
                    : ''
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {!user ? (
              <>
                <li>
                  <Link
                    href="/login"
                    className="block py-2 text-primary hover:text-primary/80 font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="block py-2 text-primary hover:text-primary/80 font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-primary hover:text-primary/80 font-semibold"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <Breadcrumbs />
    </header>
  );
};

export default Header; 