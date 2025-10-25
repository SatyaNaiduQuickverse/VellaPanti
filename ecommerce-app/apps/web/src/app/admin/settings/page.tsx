'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ecommerce/ui';
import { Save, Settings, Phone, Mail, Clock, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface SiteSettings {
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  support_email: string;
  support_phone: string;
  business_hours: string;
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp_number: '',
    whatsapp_enabled: false,
    support_email: '',
    support_phone: '',
    business_hours: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { accessToken } = useAuthStore();

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load settings');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [accessToken]);

  const handleChange = (field: keyof SiteSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!accessToken) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(settings),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update settings');
      }

      if (responseData.success) {
        toast.success('Settings updated successfully!');
        setHasUnsavedChanges(false);
      } else {
        throw new Error(responseData.error || 'Update failed');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-lg font-bold">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-black uppercase tracking-tight">
              SITE SETTINGS
            </h1>
            <p className="text-gray-600 mt-2 font-bold">
              Configure contact information and WhatsApp integration
            </p>
            {hasUnsavedChanges && (
              <div className="mt-2 flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-bold">You have unsaved changes</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                SAVING...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                SAVE CHANGES
              </>
            )}
          </Button>
        </div>

        {/* Success indicator */}
        {!hasUnsavedChanges && !isSaving && (
          <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-bold">All changes saved</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WhatsApp Integration */}
          <div className="bg-white border-2 border-black p-6">
            <div className="flex items-center mb-6">
              <MessageCircle className="h-8 w-8 mr-3" />
              <h2 className="text-2xl font-black uppercase tracking-tight">
                WhatsApp Integration
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={settings.whatsapp_enabled}
                    onChange={(e) => handleChange('whatsapp_enabled', e.target.checked)}
                    className="w-5 h-5 border-2 border-black"
                  />
                  <span className="font-bold uppercase tracking-wide text-sm">
                    Enable WhatsApp Support
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">
                  WhatsApp Number *
                </label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                  placeholder="+919876543210"
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Include country code (e.g., +91 for India, +1 for US)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <h4 className="font-bold text-sm mb-2">WhatsApp Integration Preview</h4>
                <p className="text-gray-600 text-xs mb-3">
                  When enabled, customers will see a WhatsApp button on FAQ and Support pages
                </p>
                <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded font-bold text-sm">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border-2 border-black p-6">
            <div className="flex items-center mb-6">
              <Settings className="h-8 w-8 mr-3" />
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Contact Information
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Support Email *
                </label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => handleChange('support_email', e.target.value)}
                  placeholder="support@vellapanti.com"
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Support Phone *
                </label>
                <input
                  type="text"
                  value={settings.support_phone}
                  onChange={(e) => handleChange('support_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Business Hours *
                </label>
                <input
                  type="text"
                  value={settings.business_hours}
                  onChange={(e) => handleChange('business_hours', e.target.value)}
                  placeholder="Monday - Friday: 9AM - 6PM EST"
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white border-2 border-black p-6 mt-8">
          <h3 className="text-xl font-black uppercase tracking-wider mb-4">INSTRUCTIONS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-black uppercase mb-2">WhatsApp Number Format</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Start with country code including the + sign</li>
                <li>• Do not include spaces, dashes, or parentheses</li>
                <li>• Example for India: +919876543210</li>
                <li>• Example for US: +15551234567</li>
                <li>• Number must be active on WhatsApp Business</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase mb-2">Where WhatsApp Appears</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• FAQ page - "Still Need Help?" section</li>
                <li>• Support page - Contact options sidebar</li>
                <li>• Displayed only when WhatsApp is enabled</li>
                <li>• Click opens WhatsApp with pre-filled message</li>
                <li>• Works on mobile and desktop (web.whatsapp.com)</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 font-bold">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Make sure to verify your WhatsApp number is correct before saving. Incorrect numbers may lead to customer frustration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
