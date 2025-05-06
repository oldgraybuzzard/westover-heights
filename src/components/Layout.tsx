import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

interface LayoutProps {
  children: React.ReactNode;
  isHomePage: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isHomePage }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 