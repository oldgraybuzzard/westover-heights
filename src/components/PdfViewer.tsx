import React, { useEffect, useState } from 'react';
import { FaDownload, FaEye } from 'react-icons/fa';

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, title }) => {
  const [needsViewOption, setNeedsViewOption] = useState(false);

  useEffect(() => {
    // Check if browser supports download attribute
    const link = document.createElement('a');
    setNeedsViewOption(!('download' in link));
  }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = title || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}
      <div className="w-full h-[600px] relative border border-gray-200 rounded-lg">
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full rounded-lg"
        >
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg h-full">
            <p className="text-gray-600 mb-4 text-center">
              Unable to display PDF directly.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                <FaDownload />
                Download PDF
              </button>
              {needsViewOption && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark transition-colors"
                >
                  <FaEye />
                  View PDF
                </a>
              )}
            </div>
          </div>
        </object>
      </div>
    </div>
  );
};

export default PdfViewer; 