import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Breadcrumbs: React.FC = () => {
  const router = useRouter();
  const pathSegments = router.asPath.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  return (
    <nav className="container py-4">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link href="/" className="text-gray-500 hover:text-blue-600">
            Home
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

          return (
            <React.Fragment key={path}>
              <li className="text-gray-400">/</li>
              <li>
                {isLast ? (
                  <span className="text-blue-600 font-medium">{label}</span>
                ) : (
                  <Link href={path} className="text-gray-500 hover:text-blue-600">
                    {label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 