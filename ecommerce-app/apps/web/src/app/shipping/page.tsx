'use client';

import Link from 'next/link';
import { ArrowLeft, Truck, Clock, Package, MapPin, CreditCard, Shield, AlertCircle, MessageCircle } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function ShippingPage() {
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
            Shipping Information
          </h1>
          <p className="text-gray-600 text-lg font-bold">
            Fast, reliable shipping to your doorstep
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 border-2 border-black p-6 text-center">
            <Truck className="h-10 w-10 mx-auto mb-3" />
            <h3 className="font-black uppercase text-sm mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-xs">2-7 business days</p>
          </div>
          <div className="bg-gray-50 border-2 border-black p-6 text-center">
            <Package className="h-10 w-10 mx-auto mb-3" />
            <h3 className="font-black uppercase text-sm mb-2">Free Shipping</h3>
            <p className="text-gray-600 text-xs">On orders above ₹699</p>
          </div>
          <div className="bg-gray-50 border-2 border-black p-6 text-center">
            <Shield className="h-10 w-10 mx-auto mb-3" />
            <h3 className="font-black uppercase text-sm mb-2">Secure Packaging</h3>
            <p className="text-gray-600 text-xs">Protected delivery</p>
          </div>
        </div>

        {/* Domestic Shipping */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Domestic Shipping (India)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-black p-8 bg-gray-50">
              <div className="flex items-center mb-4">
                <Truck className="h-8 w-8 mr-3" />
                <h3 className="font-black uppercase text-xl">Standard Shipping</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-lg mb-1">₹99</p>
                  <p className="text-gray-600 text-sm">Flat rate shipping</p>
                </div>
                <div className="border-t-2 border-gray-300 pt-4">
                  <p className="font-bold mb-2">Delivery Time:</p>
                  <p className="text-gray-600">5-7 business days</p>
                </div>
                <div className="border-t-2 border-gray-300 pt-4">
                  <p className="font-bold mb-2">Tracking:</p>
                  <p className="text-gray-600">Real-time tracking available</p>
                </div>
                <div className="border-t-2 border-gray-300 pt-4">
                  <p className="font-bold mb-2">Best For:</p>
                  <p className="text-gray-600">Regular orders, cost-effective delivery</p>
                </div>
              </div>
            </div>

            <div className="border-2 border-black p-8 bg-black text-white">
              <div className="flex items-center mb-4">
                <Truck className="h-8 w-8 mr-3 text-white" />
                <h3 className="font-black uppercase text-xl">Express Shipping</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-lg mb-1">₹199</p>
                  <p className="text-gray-300 text-sm">Priority shipping</p>
                </div>
                <div className="border-t-2 border-gray-700 pt-4">
                  <p className="font-bold mb-2">Delivery Time:</p>
                  <p className="text-gray-300">2-3 business days</p>
                </div>
                <div className="border-t-2 border-gray-700 pt-4">
                  <p className="font-bold mb-2">Tracking:</p>
                  <p className="text-gray-300">Priority tracking with updates</p>
                </div>
                <div className="border-t-2 border-gray-700 pt-4">
                  <p className="font-bold mb-2">Best For:</p>
                  <p className="text-gray-300">Urgent orders, special occasions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border-2 border-green-500 p-6">
            <div className="flex items-start">
              <Package className="h-6 w-6 mr-4 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-black uppercase text-lg mb-2">Free Shipping Offer</h4>
                <p className="text-gray-700">
                  FREE SHIPPING ON ORDERS ABOVE 699 FOR STANDARD SHIPPING FREE SHIPPING INSTEAD OF RS. 99
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Processing */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Order Processing</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border-2 border-black p-6 text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4 mx-auto">
                1
              </div>
              <h4 className="font-black uppercase text-sm mb-2">Order Placed</h4>
              <p className="text-gray-600 text-xs">Confirmation email sent immediately</p>
            </div>

            <div className="border-2 border-black p-6 text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4 mx-auto">
                2
              </div>
              <h4 className="font-black uppercase text-sm mb-2">Processing</h4>
              <p className="text-gray-600 text-xs">1-2 business days to prepare</p>
            </div>

            <div className="border-2 border-black p-6 text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4 mx-auto">
                3
              </div>
              <h4 className="font-black uppercase text-sm mb-2">Shipped</h4>
              <p className="text-gray-600 text-xs">Tracking number provided</p>
            </div>

            <div className="border-2 border-black p-6 text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-xl mb-4 mx-auto">
                4
              </div>
              <h4 className="font-black uppercase text-sm mb-2">Delivered</h4>
              <p className="text-gray-600 text-xs">Signature may be required</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border-2 border-blue-500 p-6">
            <Clock className="h-6 w-6 mb-3 text-blue-600" />
            <p className="text-gray-700">
              <strong>Processing Time:</strong> All orders are processed within 1-2 business days (Monday-Friday,
              excluding holidays). Orders placed after 2 PM EST will be processed the next business day.
            </p>
          </div>
        </div>

        {/* Tracking Your Order */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Tracking Your Order</h2>

          <div className="border-2 border-black p-8 bg-gray-50">
            <MapPin className="h-10 w-10 mb-4" />
            <p className="text-gray-600 mb-6">
              Once your order ships, you'll receive a tracking number via email. You can track your package in real-time.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  1
                </div>
                <div>
                  <strong className="block mb-1">Via Email Link</strong>
                  <p className="text-gray-600 text-sm">Click the tracking link in your shipping confirmation email</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  2
                </div>
                <div>
                  <strong className="block mb-1">Via Your Account</strong>
                  <p className="text-gray-600 text-sm">Log in and go to "My Orders" to view all tracking information</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  3
                </div>
                <div>
                  <strong className="block mb-1">Via Courier Website</strong>
                  <p className="text-gray-600 text-sm">Enter your tracking number directly on the courier's website</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Restrictions */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Shipping Restrictions</h2>

          <div className="bg-yellow-50 border-2 border-yellow-400 p-8">
            <AlertCircle className="h-10 w-10 mb-4 text-yellow-600" />
            <h3 className="font-black uppercase text-lg mb-4">Please Note</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>We cannot ship to PO Box addresses for certain courier services</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>APO/FPO addresses have specific delivery timelines</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Some remote locations may experience longer delivery times</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>We are not responsible for delays caused by courier services or customs</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Incorrect addresses may result in delivery delays or return to sender</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Packaging */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Secure Packaging</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-black p-6 text-center">
              <Package className="h-10 w-10 mx-auto mb-3" />
              <h4 className="font-black uppercase text-sm mb-2">Quality Materials</h4>
              <p className="text-gray-600 text-xs">Durable boxes and protective wrapping</p>
            </div>

            <div className="border-2 border-black p-6 text-center">
              <Shield className="h-10 w-10 mx-auto mb-3" />
              <h4 className="font-black uppercase text-sm mb-2">Weather Protected</h4>
              <p className="text-gray-600 text-xs">Waterproof bags for extra protection</p>
            </div>

            <div className="border-2 border-black p-6 text-center">
              <CreditCard className="h-10 w-10 mx-auto mb-3" />
              <h4 className="font-black uppercase text-sm mb-2">Discreet Packaging</h4>
              <p className="text-gray-600 text-xs">Plain packaging for privacy</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-black text-white p-8 border-2 border-black">
          <div className="max-w-3xl mx-auto text-center">
            <Truck className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
              Shipping Questions?
            </h2>
            <p className="text-gray-300 mb-6">
              Need help with shipping or tracking? Our customer support team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {settings?.whatsapp_enabled && settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi, I need help with shipping and tracking`}
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
              <Link href="/orders" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-black uppercase tracking-wider">
                  Track My Order
                </Button>
              </Link>
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
