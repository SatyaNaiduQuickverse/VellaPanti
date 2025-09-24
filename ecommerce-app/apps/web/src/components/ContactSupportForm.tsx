'use client';

import { useState } from 'react';
import { Button } from '@ecommerce/ui';
import { Mail, Phone, MessageCircle, Send, CheckCircle, AlertTriangle, HelpCircle, Package, CreditCard, RotateCcw, X } from 'lucide-react';

interface SupportTicket {
  subject: string;
  category: string;
  priority: string;
  message: string;
}

interface ContactSupportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSupportForm({ isOpen, onClose }: ContactSupportFormProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState<SupportTicket>({
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const supportCategories = [
    { id: 'orders', name: 'Order Issues', icon: Package, description: 'Problems with orders, shipping, or delivery' },
    { id: 'payments', name: 'Payment & Billing', icon: CreditCard, description: 'Payment issues, refunds, or billing questions' },
    { id: 'returns', name: 'Returns & Exchanges', icon: RotateCcw, description: 'Return requests, exchanges, or refund status' },
    { id: 'technical', name: 'Technical Issues', icon: AlertTriangle, description: 'Website problems, account access, or app issues' },
    { id: 'general', name: 'General Inquiry', icon: HelpCircle, description: 'General questions about products or services' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/ticket', {
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

  const resetForm = () => {
    setFormData({
      subject: '',
      category: '',
      priority: 'medium',
      message: '',
    });
    setSelectedCategory('');
    setIsSubmitted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-2 border-black max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">
              Support Request Submitted
            </h3>
            <p className="text-gray-600 mb-4">
              We've received your support request and will respond within 24 hours.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-4 mb-4 text-left">
              <h4 className="font-black uppercase tracking-wide text-sm mb-2">Ticket Details</h4>
              <div className="space-y-1 text-xs">
                <p><span className="font-bold">Ticket ID:</span> #SUP-{Date.now().toString().slice(-6)}</p>
                <p><span className="font-bold">Category:</span> {formData.category}</p>
                <p><span className="font-bold">Priority:</span> {formData.priority}</p>
                <p><span className="font-bold">Subject:</span> {formData.subject}</p>
              </div>
            </div>

            <Button
              onClick={handleClose}
              className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-black max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <h2 className="text-2xl font-black uppercase tracking-tight">Contact Support</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="border-2 border-gray-400 text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
              <h3 className="text-lg font-black uppercase tracking-tight mb-4">Get in Touch</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-black p-2 rounded">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-wide text-xs">Email Support</h4>
                    <p className="text-sm text-gray-600">support@vellapanti.com</p>
                    <p className="text-xs text-gray-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-black p-2 rounded">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-wide text-xs">Phone Support</h4>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-black p-2 rounded">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-wide text-xs">Live Chat</h4>
                    <p className="text-sm text-gray-600">Available on website</p>
                    <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Form */}
          <div className="lg:col-span-2">
            {/* Category Selection */}
            <div className="mb-6">
              <h3 className="font-black uppercase tracking-wide text-sm mb-3">What can we help you with?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {supportCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        handleInputChange('category', category.name);
                      }}
                      className={`p-3 text-left border transition-all text-sm ${
                        selectedCategory === category.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={`h-4 w-4 mt-0.5 ${selectedCategory === category.id ? 'text-white' : 'text-black'}`} />
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2 uppercase tracking-wide text-xs text-gray-600">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full p-2 text-sm border-2 border-gray-300 focus:border-black"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2 uppercase tracking-wide text-xs text-gray-600">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full p-2 text-sm border-2 border-gray-300 focus:border-black"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - Standard issue</option>
                    <option value="high">High - Urgent issue</option>
                    <option value="critical">Critical - Order problem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-xs text-gray-600">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full p-2 text-sm border-2 border-gray-300 focus:border-black"
                  placeholder="Please describe your issue in detail..."
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-bold uppercase tracking-wide"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}