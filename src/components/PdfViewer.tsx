import { useState } from 'react';
import { Viewer, Worker, LoadError } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

const PDFViewer = ({ pdfUrl, title }: PDFViewerProps) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="h-[600px] border rounded-lg overflow-hidden">
        <Worker workerUrl="/pdf-worker/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
            defaultScale={1}
            renderError={(error: LoadError) => (
              <div className="text-center py-4 text-red-500">
                <p>Failed to load PDF. Please try downloading instead.</p>
                <a
                  href={pdfUrl}
                  download
                  className="mt-2 inline-block text-primary hover:underline"
                >
                  Download PDF
                </a>
              </div>
            )}
          />
        </Worker>
      </div>
    </div>
  );
};

export default PDFViewer; 