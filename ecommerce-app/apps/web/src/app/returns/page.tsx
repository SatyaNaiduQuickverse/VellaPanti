'use client';

import Link from 'next/link';
import { ArrowLeft, RotateCcw, Package, Clock, CheckCircle, XCircle, AlertCircle, Mail, Truck } from 'lucide-react';
import { Button } from '@ecommerce/ui';

export default function ReturnsPage() {
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
            Easy returns and exchanges within 30 days
          </p>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 border-2 border-black p-6">
            <Clock className="h-10 w-10 mb-4" />
            <h3 className="font-black uppercase text-lg mb-2">30-Day Window</h3>
            <p className="text-gray-600">
              Return or exchange items within 30 days of delivery
            </p>
          </div>
          <div className="bg-gray-50 border-2 border-black p-6">
            <Truck className="h-10 w-10 mb-4" />
            <h3 className="font-black uppercase text-lg mb-2">Free Returns</h3>
            <p className="text-gray-600">
              We provide prepaid return labels for all eligible returns
            </p>
          </div>
          <div className="bg-gray-50 border-2 border-black p-6">
            <CheckCircle className="h-10 w-10 mb-4" />
            <h3 className="font-black uppercase text-lg mb-2">Easy Process</h3>
            <p className="text-gray-600">
              Simple online return process through your account
            </p>
          </div>
        </div>

        {/* Return Policy Details */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Return Policy Details</h2>

          <div className="space-y-6">
            <div className="border-2 border-black p-6">
              <h3 className="font-black uppercase text-xl mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
                Eligible for Return
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Items must be <strong>unworn, unwashed, and in original condition</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>All <strong>original tags must be attached</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Items must be returned in <strong>original packaging</strong> when possible</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Returns must be initiated <strong>within 30 days of delivery</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Items purchased at <strong>full price</strong> are eligible for return</span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-red-600 p-6 bg-red-50">
              <h3 className="font-black uppercase text-xl mb-4 flex items-center">
                <XCircle className="h-6 w-6 mr-3 text-red-600" />
                Not Eligible for Return
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span><strong>Sale items marked as "Final Sale"</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span><strong>Intimate apparel</strong> (underwear, socks, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span><strong>Earrings</strong> and piercing jewelry</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span><strong>Personalized or customized items</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Items that are <strong>worn, washed, damaged, or missing tags</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>Items purchased from <strong>third-party retailers</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How to Return */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">How to Return an Item</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black text-white p-6">
              <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4">
                1
              </div>
              <h3 className="font-black uppercase text-lg mb-3">Log Into Account</h3>
              <p className="text-gray-300 text-sm">
                Sign in to your VellaPanti account and go to "My Orders"
              </p>
            </div>

            <div className="bg-black text-white p-6">
              <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4">
                2
              </div>
              <h3 className="font-black uppercase text-lg mb-3">Select Items</h3>
              <p className="text-gray-300 text-sm">
                Choose the order and click "Request Return". Select items and reason
              </p>
            </div>

            <div className="bg-black text-white p-6">
              <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4">
                3
              </div>
              <h3 className="font-black uppercase text-lg mb-3">Print Label</h3>
              <p className="text-gray-300 text-sm">
                Receive a prepaid return label via email. Print and attach to package
              </p>
            </div>

            <div className="bg-black text-white p-6">
              <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4">
                4
              </div>
              <h3 className="font-black uppercase text-lg mb-3">Ship It Back</h3>
              <p className="text-gray-300 text-sm">
                Drop off at any courier location. Track your return online
              </p>
            </div>
          </div>
        </div>

        {/* Exchange Policy */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Exchange Policy</h2>

          <div className="border-2 border-black p-8 bg-gray-50">
            <div className="max-w-3xl">
              <RotateCcw className="h-12 w-12 mb-4" />
              <p className="text-gray-600 mb-6 leading-relaxed">
                We gladly accept exchanges for different sizes or colors. When initiating your return request, select "Exchange" and choose your replacement item. The new item will be shipped once we receive and process your original return.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-600 flex-shrink-0" />
                  <div>
                    <strong className="block mb-1">Same Price:</strong>
                    <span className="text-gray-600">No additional charge for exchanges of equal value</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-600 flex-shrink-0" />
                  <div>
                    <strong className="block mb-1">Higher Price:</strong>
                    <span className="text-gray-600">You'll be charged the price difference for more expensive items</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-600 flex-shrink-0" />
                  <div>
                    <strong className="block mb-1">Lower Price:</strong>
                    <span className="text-gray-600">You'll receive a partial refund for less expensive items</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-3 mt-1 text-orange-600 flex-shrink-0" />
                  <div>
                    <strong className="block mb-1">Out of Stock:</strong>
                    <span className="text-gray-600">If your exchange item is unavailable, we'll issue a full refund or offer an alternative</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Information */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Refund Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-black p-6">
              <Clock className="h-10 w-10 mb-4" />
              <h3 className="font-black uppercase text-lg mb-3">Processing Time</h3>
              <p className="text-gray-600 mb-4">
                Refunds are processed within <strong>5-7 business days</strong> after we receive and inspect your returned items.
              </p>
              <p className="text-sm text-gray-500">
                You'll receive an email confirmation once your refund is processed.
              </p>
            </div>

            <div className="border-2 border-black p-6">
              <CreditCard className="h-10 w-10 mb-4" />
              <h3 className="font-black uppercase text-lg mb-3">Refund Method</h3>
              <p className="text-gray-600 mb-4">
                Refunds are issued to your <strong>original payment method</strong>. Allow 3-5 additional business days for the amount to appear in your account.
              </p>
              <p className="text-sm text-gray-500">
                Credit card refunds may take longer depending on your bank.
              </p>
            </div>
          </div>
        </div>

        {/* Return Shipping */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Return Shipping</h2>

          <div className="border-2 border-black p-8 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Package className="h-10 w-10 mb-4" />
                <h3 className="font-black uppercase text-lg mb-3">Domestic Returns (India)</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Free return shipping</strong> with prepaid label</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Drop off at any authorized courier location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Typical transit time: 3-5 business days</span>
                  </li>
                </ul>
              </div>

              <div>
                <Truck className="h-10 w-10 mb-4" />
                <h3 className="font-black uppercase text-lg mb-3">International Returns</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Return shipping costs are <strong>customer's responsibility</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Use a trackable shipping method</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Customs fees are non-refundable</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mb-12">
          <div className="bg-yellow-50 border-2 border-yellow-400 p-8">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 mr-4 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-black uppercase text-lg mb-4">Important Notes</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Original shipping costs are <strong>non-refundable</strong> unless the item is defective or we made an error</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Items returned without authorization may be rejected</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>We reserve the right to refuse returns that don't meet our policy requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Sale/promotional items may have different return policies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Keep your tracking number until your refund is processed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-black text-white p-8 border-2 border-black">
          <div className="max-w-3xl mx-auto text-center">
            <Mail className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
              Questions About Returns?
            </h2>
            <p className="text-gray-300 mb-6">
              Our customer support team is here to help with any questions about returns or exchanges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/orders">
                <Button className="bg-white text-black hover:bg-gray-200 font-black uppercase tracking-wider">
                  View My Orders
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black font-bold uppercase tracking-wide">
                  Contact Support
                </Button>
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                <strong>Email:</strong> support@vellapanti.com | <strong>Phone:</strong> +1 (555) 123-4567
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Monday - Friday: 9AM - 6PM EST
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
