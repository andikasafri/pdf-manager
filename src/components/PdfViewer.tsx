import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { getPdfFile, getPdfUrl } from '../lib/api';
import type { PdfFile } from '../lib/supabase';

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    async function loadPdfFile() {
      if (!id) return;
      
      try {
        setLoading(true);
        const file = await getPdfFile(id);
        
        if (!file) {
          setError('PDF file not found');
          return;
        }
        
        setPdfFile(file);
        
        const url = await getPdfUrl(file.storage_path);
        if (!url) {
          setError('Could not retrieve PDF file');
          return;
        }
        
        setFileUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF file');
      } finally {
        setLoading(false);
      }
    }
    
    loadPdfFile();
  }, [id]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    if (!numPages) return;
    
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function adjustScale(amount: number) {
    setScale(prevScale => {
      const newScale = prevScale + amount;
      return newScale >= 0.5 && newScale <= 2.5 ? newScale : prevScale;
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading PDF...</p>
      </div>
    );
  }

  if (error || !fileUrl || !pdfFile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2">Error</p>
        <p className="text-gray-600 mb-6">{error || 'Failed to load PDF'}</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        
        <h1 className="text-xl font-medium text-gray-900 truncate max-w-md">
          {pdfFile.name}
        </h1>
        
        <a
          href={fileUrl}
          download={pdfFile.name}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </a>
      </div>
      
      <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col items-center py-6 mb-4">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-300">Loading document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
              <p className="text-red-400">Failed to load PDF document</p>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-xl"
          />
        </Document>
      </div>
      
      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => adjustScale(-0.1)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
            aria-label="Zoom out"
            disabled={scale <= 0.5}
          >
            -
          </button>
          <span className="text-sm text-gray-700">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => adjustScale(0.1)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
            aria-label="Zoom in"
            disabled={scale >= 2.5}
          >
            +
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={previousPage}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-700">
            {pageNumber} / {numPages || '?'}
          </span>
          <button
            onClick={nextPage}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
            disabled={!numPages || pageNumber >= numPages}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;