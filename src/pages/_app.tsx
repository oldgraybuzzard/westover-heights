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

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHomePage = router.pathname === '/';

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