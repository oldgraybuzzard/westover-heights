import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUsers, FaChartBar, FaCog } from 'react-icons/fa';

export default function AdminNav() {
  const router = useRouter();
  const isActive = (path: string) => router.pathname.startsWith(path);

  const navItems = [
    { href: '/admin/users', label: 'Users', icon: FaUsers },
    { href: '/admin/activity', label: 'Activity', icon: FaChartBar },
    { href: '/admin/settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-4 text-sm font-medium ${
                isActive(href)
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="mr-2" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 