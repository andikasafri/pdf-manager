import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { Upload, FileX, CheckCircle, Loader2 } from 'lucide-react';
import { uploadPdf } from '../lib/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const PdfUploader: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const result = await uploadPdf(file, (progress) => {
        setUploadProgress(progress);
      });
      
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError('Failed to upload PDF. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Upload PDF</h1>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-700">Uploading PDF...</p>
              <div className="w-full max-w-xs mt-4">
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{Math.round(uploadProgress)}%</p>
              </div>
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-gray-700">Upload successful!</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to library...</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-blue-500 mb-4" />
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                or click to select a file
              </p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <FileX className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <div className="mt-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h2>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>File must be in PDF format</li>
          <li>Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
};

export default PdfUploader;