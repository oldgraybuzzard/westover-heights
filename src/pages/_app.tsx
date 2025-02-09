import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Layout from '@/components/Layout';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  return (
    <AuthProvider>
      <NotificationProvider>
        <Layout isHomePage={isHomePage}>
          <Component {...pageProps} />
          <Toaster position="bottom-right" />
        </Layout>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default MyApp; 