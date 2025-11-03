'use client';

import { useState } from 'react';
import { Button } from '@ecommerce/ui';
import { ArrowLeft, Mail, Phone, MessageCircle, Clock, Send, CheckCircle, AlertCircle, HelpCircle, Package, CreditCard, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface SupportTicket {
  subject: string;
  category: string;
  priority: string;
  message: string;
}

export default function ContactSupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState<SupportTicket>({
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { data: settingsData } = useSiteSettings();
  const settings = settingsData?.data;

  const supportCategories = [
    { id: 'orders', name: 'Order Issues', icon: Package, description: 'Problems with your orders, shipping, or delivery' },
    { id: 'payments', name: 'Payment & Billing', icon: CreditCard, description: 'Payment issues, refunds, or billing questions' },
    { id: 'returns', name: 'Returns & Exchanges', icon: RotateCcw, description: 'Return requests, exchanges, or refund status' },
    { id: 'technical', name: 'Technical Issues', icon: AlertCircle, description: 'Website problems, account access, or app issues' },
    { id: 'general', name: 'General Inquiry', icon: HelpCircle, description: 'General questions about products or services' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if available
          ...(localStorage.getItem('accessToken') && {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          })
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Support ticket submitted successfully:', result.data);
        setIsSubmitted(true);
      } else {
        throw new Error(result.error || 'Failed to submit support request');
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      alert('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SupportTicket, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tight mb-4">
                Support Request Submitted
              </h1>
              <p className="text-gray-600 text-lg font-bold">
                Thank you for contacting us. We've received your support request and will respond within 24 hours.
              </p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-lg mb-8">
              <h3 className="font-black uppercase tracking-wide mb-2">Ticket Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Ticket ID:</span> #SUP-{Date.now().toString().slice(-6)}</p>
                <p><span className="font-bold">Category:</span> {formData.category}</p>
                <p><span className="font-bold">Priority:</span> {formData.priority}</p>
                <p><span className="font-bold">Subject:</span> {formData.subject}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/orders">
                <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
                  View My Orders
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Contact Support
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Get help with your orders, account, or any other questions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border-2 border-black p-6 mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Get in Touch</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-black p-2 rounded">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black uppercase tracking-wide text-sm">Email Support</h3>
                    <p className="text-gray-600 mb-2">Response within 24 hours</p>
                    <a
                      href={`mailto:${settings?.support_email || 'support@vellapanti.com'}`}
                    >
                      <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider text-xs py-2">
                        <Mail className="h-3 w-3 mr-2" />
                        Email Us
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-black p-2 rounded">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-wide text-sm">Phone Support</h3>
                    <p className="text-gray-600">{settings?.support_phone || '+1 (555) 123-4567'}</p>
                    <p className="text-xs text-gray-500 mt-1">{settings?.business_hours || 'Mon-Fri 9AM-6PM EST'}</p>
                  </div>
                </div>

{settings?.whatsapp_enabled && settings?.whatsapp_number && (
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500 p-2 rounded">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black uppercase tracking-wide text-sm">WhatsApp Support</h3>
                      <p className="text-gray-600 mb-2">Instant messaging support</p>
                      <a
                        href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi, I need support with VellaPanti`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-green-500 text-white hover:bg-green-600 font-black uppercase tracking-wider text-xs py-2">
                          <MessageCircle className="h-3 w-3 mr-2" />
                          Chat Now
                        </Button>
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="bg-black p-2 rounded">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-wide text-sm">Response Time</h3>
                    <p className="text-gray-600">Average: 4-6 hours</p>
                    <p className="text-xs text-gray-500 mt-1">Priority cases: 1-2 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-white border-2 border-black p-6">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Quick Help</h3>
              <div className="space-y-3">
                <Link href="/faq" className="block text-sm font-bold text-black hover:text-gray-600 border-b border-gray-200 pb-2">
                  → Frequently Asked Questions
                </Link>
                <Link href="/orders" className="block text-sm font-bold text-black hover:text-gray-600 border-b border-gray-200 pb-2">
                  → Track Your Order
                </Link>
                <Link href="/returns" className="block text-sm font-bold text-black hover:text-gray-600 border-b border-gray-200 pb-2">
                  → Return & Exchange Policy
                </Link>
                <Link href="/shipping" className="block text-sm font-bold text-black hover:text-gray-600">
                  → Shipping Information
                </Link>
              </div>
            </div>
          </div>

          {/* Support Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-black p-8">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Submit a Support Request</h2>

              {/* Category Selection */}
              <div className="mb-8">
                <h3 className="font-black uppercase tracking-wide text-sm mb-4">What can we help you with?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supportCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          handleInputChange('category', category.name);
                        }}
                        className={`p-4 text-left border-2 transition-all ${
                          selectedCategory === category.id
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-1 ${selectedCategory === category.id ? 'text-white' : 'text-black'}`} />
                          <div>
                            <h4 className="font-bold text-sm">{category.name}</h4>
                            <p className={`text-xs mt-1 ${selectedCategory === category.id ? 'text-gray-200' : 'text-gray-600'}`}>
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Support Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 focus:border-black"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 focus:border-black"
                    placeholder="Please describe your issue in detail. Include any relevant order numbers, error messages, or steps you've already tried."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedCategory || !formData.subject || !formData.message}
                    className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider disabled:bg-gray-400"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500">
                    * Required fields
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}