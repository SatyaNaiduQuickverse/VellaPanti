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
    // Orders & Shopping
    {
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'Browse our collections, select your desired products, choose your size and color, and click "Add to Cart". Once you\'re ready, go to your cart, review your items, and proceed to checkout. You\'ll need to provide shipping information and payment details to complete your order.',
    },
    {
      category: 'orders',
      question: 'Can I modify or cancel my order after placing it?',
      answer: 'You can modify or cancel your order within 1 hour of placement. After that, your order enters our fulfillment process and cannot be changed. Contact our support team immediately at support@vellapanti.com if you need to make changes.',
    },
    {
      category: 'orders',
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order by logging into your account and visiting the "My Orders" section. Click on any order to view its current status and tracking information.',
    },
    {
      category: 'orders',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our encrypted payment gateway.',
    },

    // Shipping & Delivery
    {
      category: 'shipping',
      question: 'What are your shipping options and costs?',
      answer: 'We offer Standard Shipping (5-7 business days) for ₹99 and Express Shipping (2-3 business days) for ₹199. Free standard shipping is available on orders above ₹999. International shipping is available to select countries with rates calculated at checkout.',
    },
    {
      category: 'shipping',
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days, while Express shipping takes 2-3 business days. International orders typically arrive within 10-15 business days. Processing time is 1-2 business days before shipment.',
    },
    {
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship to select international destinations. International shipping costs and delivery times vary by location and are calculated at checkout. Please note that customs duties and import taxes are the responsibility of the recipient.',
    },
    {
      category: 'shipping',
      question: 'What if my package is lost or damaged?',
      answer: 'If your package is lost in transit or arrives damaged, please contact us immediately at support@vellapanti.com with your order number and photos of any damage. We\'ll work with you to resolve the issue quickly, either by reshipping or providing a full refund.',
    },

    // Returns & Exchanges
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy from the date of delivery. Items must be unworn, unwashed, and in original condition with all tags attached. To initiate a return, visit your order history and select "Request Return". We\'ll provide a prepaid return label for eligible returns.',
    },
    {
      category: 'returns',
      question: 'How do I return or exchange an item?',
      answer: 'Log into your account, go to "My Orders", select the order containing the item you want to return, and click "Request Return/Exchange". Choose your reason, select the items, and we\'ll email you a prepaid return label. Pack the items securely and drop them off at any authorized courier location.',
    },
    {
      category: 'returns',
      question: 'When will I receive my refund?',
      answer: 'Refunds are processed within 5-7 business days after we receive and inspect your returned items. The refund will be credited to your original payment method. Please allow an additional 3-5 business days for the amount to reflect in your account.',
    },
    {
      category: 'returns',
      question: 'What items are not eligible for return?',
      answer: 'Sale items marked as "Final Sale", intimate apparel, earrings, and personalized items cannot be returned. Items that are worn, washed, damaged, or missing tags are also not eligible for return.',
    },
    {
      category: 'returns',
      question: 'Do you offer exchanges?',
      answer: 'Yes! We offer exchanges for different sizes or colors. Select "Exchange" when initiating your return request. The replacement item will be shipped once we receive your original item. If the new item has a different price, we\'ll charge or refund the difference.',
    },

    // Products & Sizing
    {
      category: 'products',
      question: 'How do I know what size to order?',
      answer: 'Refer to our detailed size guide available on each product page. Measurements are provided for chest, waist, length, and sleeves. If you\'re between sizes, we recommend sizing up for a relaxed fit or sizing down for a fitted look. Our customer support team can also help with size recommendations.',
    },
    {
      category: 'products',
      question: 'How do I care for my VellaPanti products?',
      answer: 'Most items are machine washable in cold water with like colors. Turn garments inside out before washing and avoid bleach. Tumble dry on low heat or hang to dry. Iron on low heat if needed. Check individual product care labels for specific instructions.',
    },
    {
      category: 'products',
      question: 'Are your products true to size?',
      answer: 'Our products generally run true to size, but fits may vary slightly by collection. The BLACK collection tends to have a slightly oversized/street fit, while the WHITE collection has a more fitted/premium cut. Check the size guide and product reviews for specific fitting information.',
    },
    {
      category: 'products',
      question: 'When will sold-out items be restocked?',
      answer: 'Restocks depend on product demand and availability. Sign up for restock notifications on product pages to be alerted when items are back in stock. Popular items typically restock within 4-6 weeks.',
    },

    // Account & General
    {
      category: 'account',
      question: 'Do I need an account to place an order?',
      answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, store payment methods, view order history, and receive exclusive member benefits and early access to new collections.',
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password. If you don\'t receive the email, check your spam folder.',
    },
    {
      category: 'account',
      question: 'How can I update my account information?',
      answer: 'Log into your account and click on "Profile" or "Account Settings". From there, you can update your personal information, email address, phone number, and saved addresses. Changes are saved automatically.',
    },
    {
      category: 'account',
      question: 'Is my personal information secure?',
      answer: 'Absolutely. We use industry-standard SSL encryption to protect your personal and payment information. We never store complete credit card details on our servers, and we comply with all data protection regulations. Read our Privacy Policy for more details.',
    },

    // Promotions & Discounts
    {
      category: 'promotions',
      question: 'How do I use a promo code?',
      answer: 'Enter your promo code in the "Promo Code" field during checkout and click "Apply". The discount will be reflected in your order total. Promo codes cannot be combined with other offers unless specified and may have minimum purchase requirements.',
    },
    {
      category: 'promotions',
      question: 'Can I use multiple discount codes on one order?',
      answer: 'Generally, only one promo code can be used per order. However, some site-wide automatic discounts may apply in addition to your promo code. The best available discount will be automatically applied at checkout.',
    },
    {
      category: 'promotions',
      question: 'Do you offer student or military discounts?',
      answer: 'Yes! We offer a 15% student discount and 10% military discount year-round. Verify your status through our partner verification service during checkout to receive your discount. Contact support@vellapanti.com for assistance.',
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
        <div className="bg-black text-white p-8 border-2 border-black">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-300 mb-6">
              Can't find the answer you're looking for? Our customer support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {settings?.whatsapp_enabled && settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi, I need help with VellaPanti`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-green-500 text-white hover:bg-green-600 font-black uppercase tracking-wider">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </a>
              )}
              <Link href="/support">
                <Button className="bg-white text-black hover:bg-gray-200 font-black uppercase tracking-wider">
                  Contact Support
                </Button>
              </Link>
              <Link href="/returns">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black font-bold uppercase tracking-wide">
                  View Return Policy
                </Button>
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                <strong>Email:</strong> {settings?.support_email || 'support@vellapanti.com'} | <strong>Phone:</strong> {settings?.support_phone || '+1 (555) 123-4567'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {settings?.business_hours || 'Monday - Friday: 9AM - 6PM EST'} | Response time: 4-6 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
