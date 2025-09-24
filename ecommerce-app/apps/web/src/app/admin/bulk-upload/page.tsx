'use client';

import { useState, useRef } from 'react';
import { Button } from '@ecommerce/ui';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useBulkUploadProducts, useDownloadTemplate, BulkUploadResult } from '@/hooks/useBulkUpload';

export default function BulkUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadProducts = useBulkUploadProducts();
  const downloadTemplate = useDownloadTemplate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Please select an Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadProducts.mutate(selectedFile, {
      onSuccess: (result) => {
        setUploadResult(result);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const handleDownloadTemplate = () => {
    downloadTemplate.mutate();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-2 border-black bg-white p-6">
        <h1 className="text-3xl font-black text-black uppercase tracking-wider mb-2">
          Bulk Product Upload
        </h1>
        <p className="text-gray-600 font-bold">
          Upload multiple products at once using an Excel file
        </p>
      </div>

      {/* Instructions */}
      <div className="border-2 border-black bg-gray-50 p-6">
        <h2 className="text-xl font-black text-black uppercase tracking-wider mb-4">
          How to Use
        </h2>
        <ol className="space-y-2 text-sm font-bold text-gray-700">
          <li className="flex items-start gap-2">
            <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">1</span>
            Download the Excel template below
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">2</span>
            Create your categories manually in the Categories section first
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">3</span>
            Fill in your product data following the template structure
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">4</span>
            Upload your completed Excel file
          </li>
        </ol>
      </div>

      {/* Download Template */}
      <div className="border-2 border-black bg-white p-6">
        <h2 className="text-xl font-black text-black uppercase tracking-wider mb-4">
          Step 1: Download Template
        </h2>
        <p className="text-gray-600 font-bold mb-4">
          Get the Excel template with sample data and category reference
        </p>
        <Button
          onClick={handleDownloadTemplate}
          disabled={downloadTemplate.isPending}
          className="bg-green-600 text-white hover:bg-green-700 border-2 border-green-600 font-black py-3 px-6 text-sm uppercase tracking-wider"
        >
          <Download className="h-4 w-4 mr-2" />
          {downloadTemplate.isPending ? 'DOWNLOADING...' : 'DOWNLOAD TEMPLATE'}
        </Button>
      </div>

      {/* File Upload */}
      <div className="border-2 border-black bg-white p-6">
        <h2 className="text-xl font-black text-black uppercase tracking-wider mb-4">
          Step 2: Upload Products
        </h2>

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
            Select Excel File
          </label>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-600 font-bold
                file:mr-4 file:py-2 file:px-4
                file:border-2 file:border-black
                file:text-sm file:font-black file:uppercase file:tracking-wider
                file:bg-black file:text-white
                hover:file:bg-white hover:file:text-black
                file:transition-all file:duration-300"
            />
            {selectedFile && (
              <Button
                onClick={clearFile}
                variant="outline"
                size="sm"
                className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="bg-blue-50 border-2 border-blue-200 p-4 mb-6">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-black text-blue-800 text-sm uppercase tracking-wider">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-blue-600 font-bold">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadProducts.isPending}
          className="bg-black text-white hover:bg-white hover:text-black border-2 border-black font-black py-3 px-6 text-sm uppercase tracking-wider"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploadProducts.isPending ? 'UPLOADING...' : 'UPLOAD PRODUCTS'}
        </Button>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className="border-2 border-black bg-white p-6">
          <h2 className="text-xl font-black text-black uppercase tracking-wider mb-4">
            Upload Results
          </h2>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border-2 border-green-200 p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-green-800">
                {uploadResult.data.createdProducts}
              </p>
              <p className="text-xs font-black text-green-600 uppercase tracking-wider">
                Products Created
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 p-4 text-center">
              <FileSpreadsheet className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-blue-800">
                {uploadResult.data.totalProcessed}
              </p>
              <p className="text-xs font-black text-blue-600 uppercase tracking-wider">
                Total Processed
              </p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 p-4 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-red-800">
                {uploadResult.data.errors.length}
              </p>
              <p className="text-xs font-black text-red-600 uppercase tracking-wider">
                Errors
              </p>
            </div>
          </div>

          {/* Success Message */}
          {uploadResult.success && (
            <div className="bg-green-50 border-2 border-green-200 p-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-black text-green-800 text-sm uppercase tracking-wider">
                  {uploadResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Errors */}
          {uploadResult.data.errors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-black text-red-800 text-sm uppercase tracking-wider">
                  Errors Found
                </p>
              </div>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {uploadResult.data.errors.map((error, index) => (
                  <li key={index} className="text-xs text-red-700 font-bold">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Created Products */}
          {uploadResult.products.length > 0 && (
            <div>
              <h3 className="font-black text-black text-lg uppercase tracking-wider mb-4">
                Created Products
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadResult.products.map((product) => (
                  <div key={product.id} className="bg-gray-50 border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-black text-sm uppercase tracking-wider">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600 font-bold">
                          Category: {product.category} • Variants: {product.variants}
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="border-2 border-black bg-yellow-50 p-6">
        <h2 className="text-xl font-black text-black uppercase tracking-wider mb-4">
          💡 Tips for Success
        </h2>
        <ul className="space-y-2 text-sm font-bold text-gray-700">
          <li>• Create all categories manually before uploading products</li>
          <li>• Start with a small batch (5-10 products) to test the process</li>
          <li>• Use direct image URLs that are publicly accessible</li>
          <li>• For products with variants, create multiple rows with the same product name</li>
          <li>• Check the template file for correct column names and data format</li>
          <li>• Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
}