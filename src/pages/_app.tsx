import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import Layout from '@/components/Layout';
import '@/styles/globals.css';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import CookieConsent from '@/components/CookieConsent';
import MaintenancePage from './maintenance';

// Set to true to enable maintenance mode in production
const MAINTENANCE_MODE = true;

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  
  // Check if we're in maintenance mode and not in development
  const isMaintenanceMode = MAINTENANCE_MODE && process.env.NODE_ENV === 'production';
  
  // Allow access to specific paths even in maintenance mode
  const allowedPaths = ['/maintenance', '/api', '/_next'];
  const isAllowedPath = allowedPaths.some(path => router.pathname.startsWith(path));
  
  // Show maintenance page if in maintenance mode and not an allowed path
  if (isMaintenanceMode && !isAllowedPath) {
    return <MaintenancePage />;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          <Footer />
          <CookieConsent />
        </div>
        <Toaster />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default MyApp; 
