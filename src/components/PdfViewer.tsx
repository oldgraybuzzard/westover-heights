import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaDownload, FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import { pdfjs } from 'react-pdf';

// Set worker source path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Dynamically import components
const PDFDocument = dynamic(() => import('react-pdf').then(mod => mod.Document), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const PDFPage = dynamic(() => import('react-pdf').then(mod => mod.Page), {
  ssr: false
});

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

interface PdfViewerProps {
  pdfUrl: string;
  title: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, title }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(Math.min(600, window.innerWidth - 48));
    };

    if (isViewerOpen) {
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [isViewerOpen]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const downloadPdf = () => {
    window.open(pdfUrl, '_blank');
  };

  if (!isViewerOpen) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsViewerOpen(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <FaEye /> View PDF
            </button>
            <button
              onClick={downloadPdf}
              className="btn-primary flex items-center gap-2"
            >
              <FaDownload /> Download
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsViewerOpen(false)}
            className="btn-secondary flex items-center gap-2"
          >
            Close Viewer
          </button>
          <button
            onClick={downloadPdf}
            className="btn-primary flex items-center gap-2"
          >
            <FaDownload /> Download
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <PDFDocument
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<LoadingSpinner />}
          error={
            <div className="text-red-500 p-4">
              Failed to load PDF. Please try again later.
            </div>
          }
        >
          <PDFPage pageNumber={pageNumber} width={width} />
        </PDFDocument>

        {numPages && (
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
              className="btn-secondary btn-sm flex items-center gap-2"
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="text-gray-600">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => changePage(1)}
              disabled={pageNumber >= numPages}
              className="btn-secondary btn-sm flex items-center gap-2"
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer; 