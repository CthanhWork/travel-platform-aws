'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth.service';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  const handleSave = () => {
    updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
    });
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">
            Your <em className="text-terracotta not-italic">Profile</em>
          </h1>
          <p className="mt-2 text-muted font-light">
            Manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {/* Avatar Section */}
          <div className="mb-8 flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-terracotta-tint text-3xl font-serif font-semibold text-terracotta">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                {user.role === 'ADMIN' && '👑 Admin'}
                {user.role === 'BUSINESS_OWNER' && '🏢 Business Owner'}
                {user.role === 'USER' && '✈️ Traveler'}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink disabled:opacity-60 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink disabled:opacity-60 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-lg border border-border bg-gray-100 px-4 py-3 text-ink opacity-60"
              />
              <p className="mt-1 text-xs text-muted">Email cannot be changed</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-terracotta-hover"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                      });
                    }}
                    className="rounded-full border border-border bg-white px-6 py-2.5 text-sm font-medium text-ink transition hover:border-terracotta"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-terracotta-hover"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="text-3xl mb-2">📍</div>
            <div className="font-serif text-2xl font-semibold text-ink">0</div>
            <div className="text-sm text-muted">Places Saved</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="text-3xl mb-2">⭐</div>
            <div className="font-serif text-2xl font-semibold text-ink">0</div>
            <div className="text-sm text-muted">Reviews Written</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="text-3xl mb-2">✈️</div>
            <div className="font-serif text-2xl font-semibold text-ink">0</div>
            <div className="text-sm text-muted">Trips Planned</div>
          </div>
        </div>
      </div>
    </div>
  );
}
