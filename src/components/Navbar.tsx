import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaBars, FaTimes, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';

const UserMenu = () => {
  const { user, userRoles, signOut, isAdmin, isExpert } = useAuth();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 text-gray-600 hover:text-primary">
        <FaUser />
        <span>{isAdmin() ? 'Admin' : isExpert() ? 'Expert' : 'Participant'}</span>
      </Menu.Button>

      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/account/settings"
                  className={`${active ? 'bg-gray-100' : ''
                    } flex items-center gap-2 px-4 py-2 text-sm text-gray-700`}
                >
                  <FaCog className="w-4 h-4" />
                  Account Settings
                </Link>
              )}
            </Menu.Item>

            {isAdmin() && (
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/admin/users"
                    className={`${active ? 'bg-gray-100' : ''
                      } flex items-center gap-2 px-4 py-2 text-sm text-gray-700`}
                  >
                    <FaUser className="w-4 h-4" />
                    Manage Users
                  </Link>
                )}
              </Menu.Item>
            )}

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={signOut}
                  className={`${active ? 'bg-gray-100' : ''
                    } flex items-center gap-2 px-4 py-2 text-sm text-gray-700 w-full`}
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Log Out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRoles, signOut, isAdmin, isExpert } = useAuth();

  const isActive = (path: string) => router.pathname === path;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About Terri', href: '/about-terri' },
    { name: 'Resources', href: '/resources' },
    { name: 'Forum', href: '/forum' },
    { name: 'Video Blog', href: '/video-blog' },
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
    <nav className="bg-white/90 backdrop-blur-sm shadow-md fixed w-full z-50 top-4 -mt-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Image
                src="/images/logo.jpg"
                alt="Westover Research Group"
                width={48}
                height={48}
                style={{ width: '48px', height: '48px' }}
              />
            </Link>
            <div className="flex flex-col">
              <Link href="/" className="text-xl font-bold text-primary">
                Westover Research Group
              </Link>
              <span className="text-xs text-gray-500">
                (Formerly the Westover Heights Clinic)
              </span>
            </div>
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
              {isExpert() ? 'Answer Questions' : 'Forum'}
            </Link>
            <Link
              href="/video-blog"
              className={`${isActive('/video-blog')
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-primary'
                } transition-colors`}
            >
              Video Blog
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

          {/* Auth section */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <UserMenu />
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
              href="/video-blog"
              className="block px-3 py-2 text-gray-600 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Video Blog
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
              <>
                <div className="px-3 py-2 text-sm text-gray-500">
                  Logged in as {isAdmin() ? 'Admin' : isExpert() ? 'Expert' : 'Participant'}
                </div>
                <Link
                  href="/account/settings"
                  className="block px-3 py-2 text-gray-600 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Account Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 text-gray-600 hover:text-primary"
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
