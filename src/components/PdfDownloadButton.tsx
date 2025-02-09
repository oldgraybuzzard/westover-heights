import React from 'react';
import { FaFileDownload } from 'react-icons/fa';

interface PdfDownloadButtonProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({ href, className, children }) => {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error('PDF not found');

      // If PDF exists, trigger download
      const link = document.createElement('a');
      link.href = href;
      link.download = href.split('/').pop() || 'handbook.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Sorry, the PDF is currently unavailable. Please try again later.');
    }
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
    >
      <FaFileDownload />
      {children}
    </a>
  );
};

export default PdfDownloadButton; 