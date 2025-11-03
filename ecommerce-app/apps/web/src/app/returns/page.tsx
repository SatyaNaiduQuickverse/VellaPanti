'use client';

import Link from 'next/link';
import { ArrowLeft, Package, CheckCircle, XCircle, AlertCircle, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function ReturnsPage() {
  const { data: settingsData } = useSiteSettings();
  const settings = settingsData?.data;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Returns & Exchange Policy
          </h1>
          <p className="text-gray-600 text-lg font-bold">
            Returns and exchanges only for defective products
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-2 border-yellow-400 p-8 mb-12">
          <div className="flex items-start">
            <AlertCircle className="h-8 w-8 mr-4 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-black uppercase text-2xl mb-4">Important Notice</h2>
              <p className="text-gray-700 text-lg mb-4">
                <strong>We do not have a general return or exchange policy.</strong>
              </p>
              <p className="text-gray-700">
                Returns and exchanges are <strong>only accepted for defective products</strong>, and only when certain conditions are fulfilled as mentioned in our FAQs.
              </p>
            </div>
          </div>
        </div>

        {/* Defective Products Policy */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Defective Products Policy</h2>

          <div className="border-2 border-black p-8 bg-gray-50">
            <Package className="h-12 w-12 mb-4" />
            <p className="text-gray-700 text-lg mb-6">
              We stand behind the quality of our products. If you receive a defective item, we will assist you with a return or exchange, subject to the conditions outlined in our FAQs.
            </p>

            <div className="space-y-4">
              <h3 className="font-black uppercase text-xl mb-3">What Qualifies as Defective?</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span><strong>Manufacturing defects:</strong> Stitching issues, fabric tears, or material flaws present at the time of delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span><strong>Wrong item received:</strong> You received a different product than what you ordered</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span><strong>Damaged during shipping:</strong> Item arrived damaged due to shipping conditions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span><strong>Missing parts or accessories:</strong> Items that came incomplete</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How to Report a Defective Product */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">How to Report a Defective Product</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-black text-white p-6">
              <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4">
                1
              </div>
              <h3 className="font-black uppercase text-lg mb-3">Contact Support</h3>
              <p className="text-gray-300 text-sm">
                Reach out to our customer support team immediately with photos of the defect
              </p>
            </div>

            <div className="bg-black text-white p-6">
              <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4">
                2
              </div>
              <h3 className="font-black uppercase text-lg mb-3">Review Process</h3>
              <p className="text-gray-300 text-sm">
                Our team will review your case and verify if it meets defective product criteria
              </p>
            </div>

            <div className="bg-black text-white p-6">
              <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4">
                3
              </div>
              <h3 className="font-black uppercase text-lg mb-3">Resolution</h3>
              <p className="text-gray-300 text-sm">
                If approved, we'll arrange a return/exchange as per conditions in FAQs
              </p>
            </div>
          </div>
        </div>

        {/* Required Documentation */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Required Documentation</h2>

          <div className="border-2 border-black p-8 bg-gray-50">
            <h3 className="font-black uppercase text-lg mb-4">To Process Your Claim, Please Provide:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-600 flex-shrink-0" />
                <span><strong>Clear photos</strong> of the defect from multiple angles</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-600 flex-shrink-0" />
                <span><strong>Order number</strong> and purchase details</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-600 flex-shrink-0" />
                <span><strong>Detailed description</strong> of the issue</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-600 flex-shrink-0" />
                <span><strong>Proof of delivery</strong> (if applicable)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Important Conditions */}
        <div className="mb-12">
          <div className="bg-red-50 border-2 border-red-400 p-8">
            <div className="flex items-start">
              <XCircle className="h-8 w-8 mr-4 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-black uppercase text-xl mb-4">Not Covered Under Defective Policy</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Change of mind</strong> - We do not accept returns if you simply changed your mind about the purchase</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Size or fit issues</strong> - Returns due to incorrect size selection are not accepted</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Color differences</strong> - Minor variations in color due to screen displays are not considered defects</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Damage after use</strong> - Damage caused by wear, washing, or improper care</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Missing tags</strong> - Items with removed or damaged tags will not be accepted</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & FAQ Section */}
        <div className="bg-black text-white p-8 border-2 border-black">
          <div className="max-w-3xl mx-auto text-center">
            <Mail className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
              Questions About Defective Products?
            </h2>
            <p className="text-gray-300 mb-4">
              Please review our FAQs for detailed conditions and requirements for returns and exchanges of defective products.
            </p>
            <p className="text-gray-300 mb-6">
              If you have a defective product claim, contact our customer support team with documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/faq" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-black uppercase tracking-wider">
                  View FAQs
                </Button>
              </Link>
              {settings?.whatsapp_enabled && settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi, I have received a defective product and would like to report it`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-auto bg-green-500 text-white hover:bg-green-600 font-black uppercase tracking-wider">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </a>
              )}
              <Link href="/support" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 border-2 border-white font-black uppercase tracking-wider">
                  Contact Support
                </Button>
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                <strong>Email:</strong> {settings?.support_email || 'support@vellapanti.com'} | <strong>Phone:</strong> {settings?.support_phone || '+1 (555) 123-4567'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {settings?.business_hours || 'Monday - Friday: 9AM - 6PM EST'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
