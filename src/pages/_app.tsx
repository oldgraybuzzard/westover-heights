import type { AppProps } from 'next/app';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import MainLayout from '@/components/layout/MainLayout';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default MyApp; 