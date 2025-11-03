'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@ecommerce/ui';
import { User, Mail, Calendar, ShoppingBag, Package, ArrowLeft, Settings, Info } from 'lucide-react';
import Link from 'next/link';
import ContactSupportForm from '@/components/ContactSupportForm';

export default function ProfilePage() {
  const { user, isAuthenticated, accessToken, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [accountStats, setAccountStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    // Fetch account stats
    const fetchAccountStats = async () => {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch('/api/users/stats', {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAccountStats(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch account stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountStats();
  }, [hasHydrated, isAuthenticated, accessToken, router]);

  if (!isAuthenticated()) {
    return null;
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
            My Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-black p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight">Personal Information</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowEditProfile(true)}
                  className="border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-gray-600 mb-2">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 p-3 border-2 border-gray-200 bg-gray-50">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="font-bold">{user?.name || 'Not provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-gray-600 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 p-3 border-2 border-gray-200 bg-gray-50">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <span className="font-bold">{user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-gray-600 mb-2">
                      Account Type
                    </label>
                    <div className="flex items-center gap-3 p-3 border-2 border-gray-200 bg-gray-50">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded uppercase ${
                        user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user?.role || 'USER'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-gray-600 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center gap-3 p-3 border-2 border-gray-200 bg-gray-50">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <span className="font-bold">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/orders">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide justify-start"
                  >
                    <Package className="h-5 w-5 mr-3" />
                    View My Orders
                  </Button>
                </Link>

                <Link href="/cart">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide justify-start"
                  >
                    <ShoppingBag className="h-5 w-5 mr-3" />
                    View My Cart
                  </Button>
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-bold uppercase tracking-wide justify-start"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowAccountSettings(true)}
                  className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide justify-start"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Account Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <div className="bg-black text-white p-6">
              <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Account Stats</h3>
              <p className="text-xs text-gray-400 mb-4">Track your shopping activity and rewards</p>
              <div className="space-y-4">
                <div className="border-b border-gray-700 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">Total Orders:</span>
                    <span className="text-2xl font-black">
                      {loading ? '...' : accountStats.totalOrders}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Number of orders you've placed with us</p>
                </div>
                <div className="border-b border-gray-700 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">Total Spent:</span>
                    <span className="text-2xl font-black">
                      {loading ? '...' : `₹${accountStats.totalSpent.toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Your lifetime spending with VellaPanti</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">Loyalty Points:</span>
                    <span className="text-2xl font-black">
                      {loading ? '...' : accountStats.loyaltyPoints}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Earn 1 point per ₹100 spent • Redeemable on next order</p>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white border-2 border-black p-6">
              <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Account Security</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                  className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide"
                >
                  Two-Factor Auth
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase tracking-wide"
                >
                  Delete Account
                </Button>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-gray-50 border-2 border-gray-200 p-6">
              <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Help & Support</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Need help with your account or have questions about our products?
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowContactSupport(true)}
                  className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support Modal */}
        <ContactSupportForm
          isOpen={showContactSupport}
          onClose={() => setShowContactSupport(false)}
        />

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black max-w-md w-full p-6">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Edit Profile</h3>
              <p className="text-gray-600 mb-4">Profile editing functionality coming soon!</p>
              <Button
                onClick={() => setShowEditProfile(false)}
                className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Account Settings Modal */}
        {showAccountSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black max-w-md w-full p-6">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Account Settings</h3>
              <div className="space-y-3 mb-4">
                <p className="text-gray-600">Manage your account preferences:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Email notifications</li>
                  <li>Privacy settings</li>
                  <li>Communication preferences</li>
                  <li>Data export</li>
                </ul>
                <p className="text-gray-600 text-sm">Full settings panel coming soon!</p>
              </div>
              <Button
                onClick={() => setShowAccountSettings(false)}
                className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black max-w-md w-full p-6">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Change Password</h3>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Current Password</label>
                  <input type="password" className="w-full p-2 border-2 border-gray-300 focus:border-black" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">New Password</label>
                  <input type="password" className="w-full p-2 border-2 border-gray-300 focus:border-black" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Confirm New Password</label>
                  <input type="password" className="w-full p-2 border-2 border-gray-300 focus:border-black" placeholder="Confirm new password" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
                >
                  Update Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(false)}
                  className="border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-bold uppercase tracking-wide"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}