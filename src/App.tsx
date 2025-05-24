import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PdfLibrary from './components/PdfLibrary';
import PdfUploader from './components/PdfUploader';
import PdfViewer from './components/PdfViewer';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PdfLibrary />} />
          <Route path="/upload" element={<PdfUploader />} />
          <Route path="/view/:id" element={<PdfViewer />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;