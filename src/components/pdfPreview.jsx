import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { convertBase64ToBlob } from "../utils/fileupload";
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

const PdfPreview = ({ base64Data }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    try {
      if (!base64Data || typeof base64Data !== 'string') {
        throw new Error('Invalid or missing base64 data');
      }

      const blob = convertBase64ToBlob(base64Data);
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);

      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    } catch (error) {
      console.error('Error in creating PDF preview: ', error);
    }
  }, [base64Data]);

  if (!url) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3>PDF Preview:</h3>
      <Document file={url} onLoadError={(error) => console.error("Error loading PDF: ", error)}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
};

export default PdfPreview;
