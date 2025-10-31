'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ecommerce/ui';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface StoryPageData {
  heroTitle: string;
  heroSubtitle: string;
  section1Title: string;
  section1Content: string;
  section1Quote: string | null;
  section2Title: string;
  section2Content: string;
  section3Title: string;
  section3Content: string;
  section4Title: string;
  section4Content: string;
  manifestoTitle: string;
  manifestoContent: string;
}

export default function AdminStoryPage() {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StoryPageData>({
    heroTitle: '',
    heroSubtitle: '',
    section1Title: '',
    section1Content: '',
    section1Quote: '',
    section2Title: '',
    section2Content: '',
    section3Title: '',
    section3Content: '',
    section4Title: '',
    section4Content: '',
    manifestoTitle: '',
    manifestoContent: '',
  });

  useEffect(() => {
    fetchStoryPage();
  }, []);

  const fetchStoryPage = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/story-page`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFormData(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch story page:', error);
      toast.error('Failed to load story page content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/story-page`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          hero_title: formData.heroTitle,
          hero_subtitle: formData.heroSubtitle,
          section1_title: formData.section1Title,
          section1_content: formData.section1Content,
          section1_quote: formData.section1Quote,
          section2_title: formData.section2Title,
          section2_content: formData.section2Content,
          section3_title: formData.section3Title,
          section3_content: formData.section3Content,
          section4_title: formData.section4Title,
          section4_content: formData.section4Content,
          manifesto_title: formData.manifestoTitle,
          manifesto_content: formData.manifestoContent,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Story page updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-lg font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Link>
            <h1 className="text-4xl font-black text-black uppercase tracking-tight">
              Edit Story Page
            </h1>
            <p className="text-gray-600 mt-2 font-bold">
              Update the About/Story page content
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Hero Title</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Hero Subtitle</label>
                <input
                  type="text"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Section 1 - The Beginning</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Section Title</label>
                <input
                  type="text"
                  value={formData.section1Title}
                  onChange={(e) => setFormData({ ...formData, section1Title: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Content</label>
                <textarea
                  rows={6}
                  value={formData.section1Content}
                  onChange={(e) => setFormData({ ...formData, section1Content: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Quote (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.section1Quote || ''}
                  onChange={(e) => setFormData({ ...formData, section1Quote: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Section 2 - The Revelation</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Section Title</label>
                <input
                  type="text"
                  value={formData.section2Title}
                  onChange={(e) => setFormData({ ...formData, section2Title: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Content</label>
                <textarea
                  rows={6}
                  value={formData.section2Content}
                  onChange={(e) => setFormData({ ...formData, section2Content: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Section 3 - What is Vellapanti?</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Section Title</label>
                <input
                  type="text"
                  value={formData.section3Title}
                  onChange={(e) => setFormData({ ...formData, section3Title: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Content</label>
                <textarea
                  rows={6}
                  value={formData.section3Content}
                  onChange={(e) => setFormData({ ...formData, section3Content: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Section 4 - Our Mission</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Section Title</label>
                <input
                  type="text"
                  value={formData.section4Title}
                  onChange={(e) => setFormData({ ...formData, section4Title: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Content</label>
                <textarea
                  rows={6}
                  value={formData.section4Content}
                  onChange={(e) => setFormData({ ...formData, section4Content: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Manifesto */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Manifesto - We Believe</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Manifesto Title</label>
                <input
                  type="text"
                  value={formData.manifestoTitle}
                  onChange={(e) => setFormData({ ...formData, manifestoTitle: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm">Manifesto Content</label>
                <textarea
                  rows={6}
                  value={formData.manifestoContent}
                  onChange={(e) => setFormData({ ...formData, manifestoContent: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="Use line breaks to separate lines"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
