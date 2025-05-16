import Header from './layout/Header';
import Footer from './layout/Footer';
import { Toaster } from 'react-hot-toast';
import TestModeIndicator from './TestModeIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Toaster position="top-right" />
      <TestModeIndicator />
    </div>
  );
} 
