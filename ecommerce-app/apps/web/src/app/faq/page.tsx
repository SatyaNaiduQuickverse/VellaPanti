'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, Package, CreditCard, RotateCcw, Truck, Shield, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { data: settingsData } = useSiteSettings();
  const settings = settingsData?.data;

  const faqData: FAQItem[] = [
    // General & Brand Identity
    {
      category: 'general',
      question: 'What does "Vellapanti" mean?',
      answer: 'VELLAPANTI — converting its initial interpretation of being lazy or unproductive to something that is COOL & POSITIVE, getting you close to the VIBE & the LIFE that has been a dream to many.',
    },
    {
      category: 'general',
      question: 'What is the Vellapanti mission?',
      answer: 'To give you the comfiest canvas for your creative slacking. We design threads for the dreamer, the schemer, and the master of procrastination. Wear the mood.',
    },
    {
      category: 'general',
      question: 'What kind of products do you sell?',
      answer: 'Right now, we are focused on the ultimate staple: premium, high-quality t-shirts in our signature collections: Deepest Black Tees (Black Tees) and Purest White Tees (White Tees). We plan to expand our range to other essentials soon!',
    },

    // Products & Sizing
    {
      category: 'products',
      question: 'What material are the t-shirts made of?',
      answer: 'Our t-shirts are typically made from 100% premium combed cotton (or a high-quality cotton blend for specific styles) to ensure they\'re soft, breathable, and perfect for a long session of vellapanti.',
    },
    {
      category: 'products',
      question: 'How do I find the right size?',
      answer: 'You should see a detailed Size Chart on every product page. We generally offer a comfortable, true-to-size fit. Pro Tip: If you\'re debating between two sizes for maximum chill, size up!',
    },
    {
      category: 'products',
      question: 'How should I care for my Vellapanti tee?',
      answer: 'To keep your tee looking fresh for all your idle moments:\n• Wash inside out with cold water.\n• Do not bleach or dry clean.\n• Tumble dry low or, better yet, hang dry (it\'s less effort).\n• Iron inside out, and never directly on the print.',
    },

    // Orders, Shipping, & Payment
    {
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Once your order ships (usually within 1-2 business days), you will receive a shipping confirmation email that includes a tracking number and a link to the carrier\'s website.',
    },
    {
      category: 'orders',
      question: 'How long will it take for my order to arrive?',
      answer: 'Our standard delivery time is typically 5-7 business days after the order has been shipped, depending on your location. You\'ll be notified if there are any vellapanti-related delays.',
    },
    {
      category: 'orders',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI Payments and Net Banking.',
    },

    // Returns & Exchanges
    {
      category: 'returns',
      question: 'What is your return and exchange policy?',
      answer: 'We maintain a strict NO RETURN and NO EXCHANGE policy for all items sold. All sales are considered final once the purchase is complete.',
    },
    {
      category: 'returns',
      question: 'Is there any exception to the No Exchange policy?',
      answer: 'Yes, but only in the case of a verified manufacturing defect.',
    },
    {
      category: 'returns',
      question: 'How do I qualify for an exchange due to a manufacturing defect?',
      answer: 'You must meet these two non-negotiable conditions:\n1. You must provide a continuous, unedited, start-to-finish UNBOXING VIDEO that clearly shows the sealed package and the defect as the item is removed.\n2. You must notify us of the defect within 48 hours of the delivery date.',
    },
    {
      category: 'returns',
      question: 'What if the t-shirt doesn\'t fit? Can I exchange it?',
      answer: 'No. We cannot accept exchanges for issues related to fit, size preference, or buyer\'s remorse. Please double-check our detailed size chart before placing your order.',
    },
    {
      category: 'returns',
      question: 'What constitutes a manufacturing defect?',
      answer: 'This includes things like holes, broken seams, or major print errors that occurred during the production process. Normal wear and tear, or damage caused after opening, will not qualify.',
    },

    // Shipping Information
    {
      category: 'shipping',
      question: 'What is your order processing time?',
      answer: 'All orders are typically processed and dispatched from our warehouse within 1-2 business days (Monday to Friday, excluding public holidays).',
    },
    {
      category: 'shipping',
      question: 'How do I track my shipment?',
      answer: 'Once your order is dispatched, you will receive a confirmation email and/or SMS containing your unique Tracking Number and a link to monitor your shipment\'s journey.',
    },
    {
      category: 'shipping',
      question: 'What are the delivery timelines?',
      answer: 'Metro Cities (Mumbai, Delhi, Bangalore, etc.): 2-4 Business Days\nNon-Metro / Rest of India: 4-7 Business Days\n\nNote: Delivery to remote locations or during peak festive/sale periods may take an additional 2-3 days. Your tracking link will always provide the most current ETA.',
    },
    {
      category: 'shipping',
      question: 'Where do you ship?',
      answer: 'We currently ship across all major cities and towns within India.',
    },
    {
      category: 'shipping',
      question: 'What should I know about my shipping address?',
      answer: 'Please ensure your shipping address, pincode, and contact number are complete and accurate at the time of checkout. We cannot change the address once the order has been dispatched.',
    },
    {
      category: 'shipping',
      question: 'Can my order arrive in multiple packages?',
      answer: 'In rare cases, if you order multiple items, they may arrive in separate packages with separate tracking numbers, at no extra cost to you.',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'orders', name: 'Orders & Shopping', icon: Package },
    { id: 'shipping', name: 'Shipping & Delivery', icon: Truck },
    { id: 'returns', name: 'Returns & Exchanges', icon: RotateCcw },
    { id: 'products', name: 'Products & Sizing', icon: Shield },
    { id: 'account', name: 'Account & General', icon: CreditCard },
    { id: 'promotions', name: 'Promotions & Discounts', icon: Mail },
  ];

  const filteredFAQs = activeCategory === 'all'
    ? faqData
    : faqData.filter(faq => faq.category === activeCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-lg font-bold">
            Find answers to common questions about VellaPanti
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 border-2 border-black p-6 bg-gray-50">
          <h2 className="font-black uppercase tracking-wide text-sm mb-4">Filter by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`p-3 border-2 transition-all text-left ${
                    activeCategory === category.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${activeCategory === category.id ? 'text-white' : 'text-black'}`} />
                  <p className="text-xs font-bold">{category.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.map((faq, index) => (
            <div key={index} className="border-2 border-black">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-black text-lg pr-4">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-6 w-6 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Need Help Section */}
        <div className="bg-black text-white p-4 sm:p-8 border-2 border-black">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-300 mb-6 text-sm sm:text-base px-2">
              Can't find the answer you're looking for? Our customer support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              {settings?.whatsapp_enabled && settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi, I need help with VellaPanti`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto max-w-full"
                >
                  <Button className="w-full sm:w-auto bg-green-500 text-white hover:bg-green-600 font-black uppercase text-xs sm:text-sm px-4 py-3 inline-flex items-center justify-center gap-2">
                    <MessageCircle className="h-4 w-4 flex-shrink-0" />
                    <span>WhatsApp</span>
                  </Button>
                </a>
              )}
              <Link href="/support" className="w-full sm:w-auto max-w-full">
                <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-black uppercase text-xs sm:text-sm px-4 py-3">
                  Contact Support
                </Button>
              </Link>
              <Link href="/returns" className="w-full sm:w-auto max-w-full">
                <Button className="w-full sm:w-auto bg-transparent border-2 border-white text-white font-bold uppercase text-xs sm:text-sm px-4 py-3">
                  Return Policy
                </Button>
              </Link>
            </div>
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
              <p className="text-xs sm:text-sm text-gray-400 break-words px-2">
                <strong>Email:</strong> {settings?.support_email || 'support@vellapanti.com'} | <strong>Phone:</strong> {settings?.support_phone || '+1 (555) 123-4567'}
              </p>
              <p className="text-xs text-gray-500 mt-2 px-2">
                {settings?.business_hours || 'Monday - Friday: 9AM - 6PM EST'} | Response time: 4-6 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
