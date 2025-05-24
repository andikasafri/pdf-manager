import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { File, Clock, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getPdfFiles } from '../lib/api';
import type { PdfFile } from '../lib/supabase';

const PdfLibrary: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPdfFiles() {
      try {
        const files = await getPdfFiles();
        setPdfFiles(files);
        setError(null);
      } catch (err) {
        console.error('Error loading PDF files:', err);
        setError('Failed to load PDF files. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadPdfFiles();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading PDF library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2">Error</p>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (pdfFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No PDFs found</h3>
        <p className="text-gray-600 mb-6">Upload your first PDF file to get started.</p>
        <Link 
          to="/upload" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload PDF
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">PDF Library</h1>
        <Link 
          to="/upload" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload PDF
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfFiles.map((file) => (
          <Link 
            key={file.id} 
            to={`/view/${file.id}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-4 border-b border-gray-100 flex items-center">
              <File className="h-8 w-8 text-blue-500 mr-3" />
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </h2>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {format(new Date(file.created_at), 'MMM d, yyyy')}
                </span>
                <span className="mx-2">•</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default PdfLibrary;