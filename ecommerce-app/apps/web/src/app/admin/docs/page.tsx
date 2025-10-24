'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Book, FileSpreadsheet, Upload, AlertCircle, CheckCircle, Info, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@ecommerce/ui';

export default function DocsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated() || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight flex items-center">
            <Book className="h-10 w-10 mr-4" />
            DOCUMENTATION
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Guides and tutorials for managing your VellaPanti store
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white border-2 border-black p-6 mb-8">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/bulk-upload">
              <Button className="w-full bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider">
                <Book className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </Link>
          </div>
        </div>

        {/* Bulk Upload Guide */}
        <div className="bg-white border-2 border-black p-8 mb-8">
          <div className="flex items-center mb-6">
            <FileSpreadsheet className="h-8 w-8 mr-3 text-black" />
            <h2 className="text-3xl font-black text-black uppercase tracking-tight">Bulk Product Upload Guide</h2>
          </div>

          <div className="prose max-w-none">
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-lg text-gray-700 font-semibold mb-4">
                This guide explains how to use the bulk product upload feature for VellaPanti ecommerce platform.
              </p>
            </div>

            {/* Excel Template Structure */}
            <section className="mb-8">
              <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                Excel Template Structure
              </h3>

              {/* Required Columns */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-black mb-3">Required Columns</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-2 border-black">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Column Name</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Type</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Required</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Description</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">name</td>
                        <td className="px-4 py-3">String</td>
                        <td className="px-4 py-3"><CheckCircle className="h-5 w-5 text-green-600" /></td>
                        <td className="px-4 py-3">Product name</td>
                        <td className="px-4 py-3 text-sm">Premium Cotton T-Shirt</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">categorySlug</td>
                        <td className="px-4 py-3">String</td>
                        <td className="px-4 py-3"><CheckCircle className="h-5 w-5 text-green-600" /></td>
                        <td className="px-4 py-3">Category slug (must exist)</td>
                        <td className="px-4 py-3 text-sm">mens-tshirts</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">basePrice</td>
                        <td className="px-4 py-3">Number</td>
                        <td className="px-4 py-3"><CheckCircle className="h-5 w-5 text-green-600" /></td>
                        <td className="px-4 py-3">Base price in rupees</td>
                        <td className="px-4 py-3 text-sm">999</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Optional Columns */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-black mb-3">Optional Product Columns</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-2 border-black">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Column Name</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Type</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Description</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">description</td>
                        <td className="px-4 py-3">String</td>
                        <td className="px-4 py-3">Product description</td>
                        <td className="px-4 py-3 text-sm">High-quality cotton...</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">baseSalePrice</td>
                        <td className="px-4 py-3">Number</td>
                        <td className="px-4 py-3">Sale price in rupees</td>
                        <td className="px-4 py-3 text-sm">799</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">images</td>
                        <td className="px-4 py-3">String</td>
                        <td className="px-4 py-3">Comma-separated URLs</td>
                        <td className="px-4 py-3 text-sm">https://img1.jpg,...</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">theme</td>
                        <td className="px-4 py-3">String</td>
                        <td className="px-4 py-3">BLACK or WHITE</td>
                        <td className="px-4 py-3 text-sm">BLACK</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">featured</td>
                        <td className="px-4 py-3">Boolean</td>
                        <td className="px-4 py-3">Is product featured</td>
                        <td className="px-4 py-3 text-sm">true</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">isActive</td>
                        <td className="px-4 py-3">Boolean</td>
                        <td className="px-4 py-3">Is product active</td>
                        <td className="px-4 py-3 text-sm">true</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Variant Columns */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-black mb-3">Variant Columns (Optional)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-2 border-black">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Column Name</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Type</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Description</th>
                        <th className="px-4 py-3 text-left font-black uppercase text-sm">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">variantSku</td>
                        <td className="px-4 py-3">String</td>
                        <td className="px-4 py-3">Unique variant SKU</td>
                        <td className="px-4 py-3 text-sm">TSH-001-S-BLK</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">variantSize</td>
                        <td className="px-4 py-3">String</td>
                        <td className="px-4 py-3">Size (S, M, L, XL)</td>
                        <td className="px-4 py-3 text-sm">M</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">variantColor</td>
                        <td className="px-4 py-3">String</td>
                        <td className="px-4 py-3">Color name</td>
                        <td className="px-4 py-3 text-sm">Black</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">variantPrice</td>
                        <td className="px-4 py-3">Number</td>
                        <td className="px-4 py-3">Variant price</td>
                        <td className="px-4 py-3 text-sm">999</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">variantStock</td>
                        <td className="px-4 py-3">Number</td>
                        <td className="px-4 py-3">Stock quantity</td>
                        <td className="px-4 py-3 text-sm">50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* How to Use */}
            <section className="mb-8">
              <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                How to Use
              </h3>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                  <div className="flex items-start">
                    <Download className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-black mb-2">Step 1: Download Template</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Login as admin</li>
                        <li>Go to Admin → Bulk Upload</li>
                        <li>Click "Download Template" to get the Excel file with sample data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-green-50 border-l-4 border-green-600 p-4">
                  <div className="flex items-start">
                    <FileSpreadsheet className="h-6 w-6 text-green-600 mr-3 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-black mb-2">Step 2: Prepare Your Data</h4>
                      <p className="text-gray-700 mb-2">Fill in the template with your product data:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li><strong>Single Product:</strong> Fill one row with product details, leave variant columns empty</li>
                        <li><strong>Product with Variants:</strong> First row has full product data + first variant, subsequent rows have same name + additional variants</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
                  <div className="flex items-start">
                    <Info className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-black mb-2">Step 3: Category Preparation</h4>
                      <p className="text-gray-700 mb-2">Before uploading products, ensure categories exist:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Go to Admin → Categories</li>
                        <li>Create all required categories manually</li>
                        <li>Note down the category slugs (e.g., "mens-tshirts")</li>
                        <li>Use these exact slugs in the categorySlug column</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-purple-50 border-l-4 border-purple-600 p-4">
                  <div className="flex items-start">
                    <Upload className="h-6 w-6 text-purple-600 mr-3 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-black mb-2">Step 4: Upload Process</h4>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700">
                        <li>Save your Excel file</li>
                        <li>Go to Admin → Bulk Upload</li>
                        <li>Click "Choose File" and select your Excel file</li>
                        <li>Click "Upload Products"</li>
                        <li>Review the results and error messages</li>
                        <li>Fix any errors and re-upload if needed</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Validation Rules */}
            <section className="mb-8">
              <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                Validation Rules
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-green-600 p-4">
                  <h4 className="text-lg font-bold text-green-700 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Product Level
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✅ Product name must be unique within the same category</li>
                    <li>✅ Category slug must exist in the database</li>
                    <li>✅ Base price must be a positive number</li>
                    <li>✅ Sale price should be less than base price</li>
                    <li>✅ Theme must be "BLACK" or "WHITE" (case-sensitive)</li>
                  </ul>
                </div>

                <div className="bg-white border-2 border-blue-600 p-4">
                  <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Variant Level
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✅ If any variant column is filled, variant will be created</li>
                    <li>✅ Variant SKU should be unique across all products</li>
                    <li>✅ Variant price defaults to base price if not provided</li>
                    <li>✅ Stock defaults to 0 if not provided</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Common Errors */}
            <section className="mb-8">
              <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                Common Errors and Solutions
              </h3>

              <div className="space-y-3">
                <div className="bg-red-50 border-l-4 border-red-600 p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-1" />
                    <div>
                      <p className="font-bold text-red-800">Category 'xyz' not found</p>
                      <p className="text-sm text-gray-700">Solution: Create the category first in Admin → Categories</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border-l-4 border-red-600 p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-1" />
                    <div>
                      <p className="font-bold text-red-800">Product 'ABC' already exists in this category</p>
                      <p className="text-sm text-gray-700">Solution: Use a different name or delete the existing product</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border-l-4 border-red-600 p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-1" />
                    <div>
                      <p className="font-bold text-red-800">Row X: Valid base price is required</p>
                      <p className="text-sm text-gray-700">Solution: Ensure basePrice column has a positive number (not text)</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tips */}
            <section className="mb-8">
              <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                Tips for Success
              </h3>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-600 p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Start Small:</strong> Test with 5-10 products first</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Use Template:</strong> Always start with the downloaded template</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Check Categories:</strong> Verify all category slugs exist before upload</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Validate Images:</strong> Test image URLs in browser before upload</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Backup:</strong> Keep a backup of your Excel file</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Review Results:</strong> Always check upload results for errors</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Details */}
            <section className="mb-8">
              <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                Technical Details
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 border border-gray-300">
                  <h4 className="font-bold text-black mb-2">API Endpoints</h4>
                  <ul className="space-y-1 text-sm font-mono text-gray-700">
                    <li>GET /api/bulk-upload/template</li>
                    <li>POST /api/bulk-upload/products</li>
                  </ul>
                </div>

                <div className="bg-gray-100 p-4 border border-gray-300">
                  <h4 className="font-bold text-black mb-2">File Limits</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>Maximum file size: 10MB</li>
                    <li>Formats: .xlsx, .xls</li>
                    <li>Max: 1000 products per upload</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-black text-white p-6 text-center">
          <h3 className="text-2xl font-black uppercase mb-4">Ready to Upload Products?</h3>
          <p className="text-gray-300 mb-6">Head over to the bulk upload page to get started</p>
          <Link href="/admin/bulk-upload">
            <Button className="bg-white text-black hover:bg-gray-200 font-black uppercase tracking-wider px-8 py-3">
              <Upload className="h-5 w-5 mr-2" />
              Go to Bulk Upload
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
