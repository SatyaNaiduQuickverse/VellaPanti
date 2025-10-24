'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ecommerce/ui';
import { Tag, Save, ArrowLeft, Gift } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { api } from '@/lib/api';

interface OfferPopup {
  id?: string;
  isActive: boolean;
  imageUrl?: string;
  title: string;
  subtitle: string;
  offer1Type: string;
  offer1Title: string;
  offer1Subtitle: string;
  offer1Code: string;
  offer1Badge: string;
  offer1BgColor: string;
  offer2Type: string;
  offer2Title: string;
  offer2Subtitle: string;
  offer2Code: string;
  offer2Badge: string;
  offer2BgColor: string;
  delaySeconds: number;
}

export default function OfferPopupManagement() {
  const [popup, setPopup] = useState<OfferPopup>({
    isActive: true,
    imageUrl: '',
    title: 'EXCLUSIVE OFFERS!',
    subtitle: 'Limited Time Only',
    offer1Type: 'PERCENTAGE',
    offer1Title: '50% OFF',
    offer1Subtitle: 'On All Products',
    offer1Code: 'SAVE50',
    offer1Badge: 'HOT',
    offer1BgColor: 'red',
    offer2Type: 'BOGO',
    offer2Title: 'BUY 1 GET 1 FREE!',
    offer2Subtitle: 'Double Your Purchase',
    offer2Code: 'BOGO2024',
    offer2Badge: 'NEW',
    offer2BgColor: 'green',
    delaySeconds: 2,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { accessToken } = useAuthStore();

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) return;

      setLoading(true);
      try {
        const response = await api.get('/admin/offer-popup');
        if (response.data.success && response.data.data) {
          setPopup(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load offer popup:', error);
        toast.error('Failed to load offer popup');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accessToken]);

  const handleSave = async () => {
    if (!accessToken) {
      toast.error('You must be logged in to save');
      return;
    }

    setSaving(true);
    try {
      let response;
      if (popup.id) {
        // Update existing
        response = await api.put('/admin/offer-popup', popup);
      } else {
        // Create new
        response = await api.post('/admin/offer-popup', popup);
      }

      if (response.data.success) {
        toast.success('Offer popup saved successfully!');
        setPopup(response.data.data);
      } else {
        toast.error('Failed to save offer popup');
      }
    } catch (error: any) {
      console.error('Failed to save offer popup:', error);
      toast.error(error.response?.data?.error || 'Failed to save offer popup');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof OfferPopup, value: any) => {
    setPopup({ ...popup, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
          <p className="mt-4 text-lg font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
            Offer Popup Management
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Manage the promotional popup that appears on the homepage
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white border-2 border-black p-6 mb-6">
          {/* Active Toggle */}
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={popup.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-black uppercase">Popup Active</span>
            </label>
            <p className="text-sm text-gray-600 mt-2">
              Toggle to show/hide the popup on the website
            </p>
          </div>

          {/* General Settings */}
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-black mb-4 uppercase">General Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Main Title</label>
                <input
                  type="text"
                  value={popup.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  placeholder="EXCLUSIVE OFFERS!"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Subtitle</label>
                <input
                  type="text"
                  value={popup.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  placeholder="Limited Time Only"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Delay (seconds)</label>
                <input
                  type="number"
                  value={popup.delaySeconds}
                  onChange={(e) => updateField('delaySeconds', parseInt(e.target.value))}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  min="0"
                  max="10"
                />
                <p className="text-xs text-gray-600 mt-1">Time before popup appears</p>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Background Image URL (Optional)</label>
                <input
                  type="text"
                  value={popup.imageUrl || ''}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Offer 1 */}
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-black mb-4 uppercase flex items-center">
              <Tag className="h-6 w-6 mr-2" />
              First Offer (50% OFF)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Offer Type</label>
                <select
                  value={popup.offer1Type}
                  onChange={(e) => updateField('offer1Type', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                  <option value="BOGO">Buy One Get One</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Badge Text</label>
                <input
                  type="text"
                  value={popup.offer1Badge}
                  onChange={(e) => updateField('offer1Badge', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  placeholder="HOT"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Main Title</label>
                <input
                  type="text"
                  value={popup.offer1Title}
                  onChange={(e) => updateField('offer1Title', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  placeholder="50% OFF"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Subtitle</label>
                <input
                  type="text"
                  value={popup.offer1Subtitle}
                  onChange={(e) => updateField('offer1Subtitle', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  placeholder="On All Products"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={popup.offer1Code}
                  onChange={(e) => updateField('offer1Code', e.target.value.toUpperCase())}
                  className="w-full border-2 border-black px-4 py-2 font-bold uppercase"
                  placeholder="SAVE50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Background Color</label>
                <select
                  value={popup.offer1BgColor}
                  onChange={(e) => updateField('offer1BgColor', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                >
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                </select>
              </div>
            </div>
          </div>

          {/* Offer 2 */}
          <div className="mb-6">
            <h2 className="text-2xl font-black mb-4 uppercase flex items-center">
              <Gift className="h-6 w-6 mr-2" />
              Second Offer (BOGO)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Offer Type</label>
                <select
                  value={popup.offer2Type}
                  onChange={(e) => updateField('offer2Type', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                  <option value="BOGO">Buy One Get One</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Badge Text</label>
                <input
                  type="text"
                  value={popup.offer2Badge}
                  onChange={(e) => updateField('offer2Badge', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  placeholder="NEW"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Main Title</label>
                <input
                  type="text"
                  value={popup.offer2Title}
                  onChange={(e) => updateField('offer2Title', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  placeholder="BUY 1 GET 1 FREE!"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Subtitle</label>
                <input
                  type="text"
                  value={popup.offer2Subtitle}
                  onChange={(e) => updateField('offer2Subtitle', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                  placeholder="Double Your Purchase"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={popup.offer2Code}
                  onChange={(e) => updateField('offer2Code', e.target.value.toUpperCase())}
                  className="w-full border-2 border-black px-4 py-2 font-bold uppercase"
                  placeholder="BOGO2024"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Background Color</label>
                <select
                  value={popup.offer2BgColor}
                  onChange={(e) => updateField('offer2BgColor', e.target.value)}
                  className="w-full border-2 border-black px-4 py-2 font-bold"
                >
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-8 py-3"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
