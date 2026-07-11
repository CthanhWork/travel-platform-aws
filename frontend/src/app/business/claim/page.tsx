'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { placesService } from '@/services/places.service';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ClaimPlacePage() {
  return (
    <ProtectedRoute>
      <ClaimPlaceContent />
    </ProtectedRoute>
  );
}

function ClaimPlaceContent() {
  const router = useRouter();
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: places } = useQuery({
    queryKey: ['places', { search: searchQuery, limit: 50 }],
    queryFn: () => placesService.getPlaces({ search: searchQuery, limit: 50 }),
    enabled: searchQuery.length > 2,
  });

  const claimMutation = useMutation({
    mutationFn: () => businessService.claimPlace(selectedPlaceId, claimReason),
    onSuccess: () => {
      router.push('/business');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlaceId && claimReason) {
      claimMutation.mutate();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">
            Claim Your <em className="text-terracotta not-italic">Business</em>
          </h1>
          <p className="mt-2 text-muted font-light">
            Verify ownership to manage your place and respond to reviews
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search Place */}
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Search for your place *
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink placeholder:text-muted/50 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                placeholder="Enter place name, city..."
              />
              <p className="mt-1 text-xs text-muted">
                Type at least 3 characters to search
              </p>
            </div>

            {/* Place Results */}
            {places && places.places.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Select your place *
                </label>
                <div className="max-h-60 overflow-y-auto space-y-2 rounded-lg border border-border bg-surface p-3">
                  {places.places.map((place) => (
                    <label
                      key={place.id}
                      className={`block cursor-pointer rounded-lg border p-4 transition ${
                        selectedPlaceId === place.id
                          ? 'border-terracotta bg-terracotta-tint'
                          : 'border-border bg-white hover:border-terracotta'
                      }`}
                    >
                      <input
                        type="radio"
                        name="place"
                        value={place.id}
                        checked={selectedPlaceId === place.id}
                        onChange={(e) => setSelectedPlaceId(e.target.value)}
                        className="sr-only"
                      />
                      <div className="font-semibold text-ink">{place.name}</div>
                      <div className="text-sm text-muted">
                        {place.category} • {place.city}, {place.country}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Claim Reason */}
            {selectedPlaceId && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Why are you claiming this place? *
                </label>
                <textarea
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink placeholder:text-muted/50 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                  placeholder="Please provide proof of ownership (business registration, official documents, website, etc.)"
                  required
                />
                <p className="mt-1 text-xs text-muted">
                  Provide detailed information to help us verify your claim
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!selectedPlaceId || !claimReason || claimMutation.isPending}
                className="rounded-full bg-terracotta px-8 py-3 text-sm font-medium text-white transition hover:bg-terracotta-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {claimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full border border-border bg-white px-8 py-3 text-sm font-medium text-ink transition hover:border-terracotta"
              >
                Cancel
              </button>
            </div>

            {claimMutation.isError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                Failed to submit claim. Please try again.
              </div>
            )}
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-2xl border border-border bg-white p-6">
          <h3 className="font-serif text-lg font-semibold text-ink mb-3">
            What happens after I claim?
          </h3>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="text-terracotta">✓</span>
              <span>Your claim will be reviewed by our team within 2-3 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terracotta">✓</span>
              <span>Once approved, you'll get business owner access to manage the place</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terracotta">✓</span>
              <span>You can respond to reviews and update place information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terracotta">✓</span>
              <span>View and manage bookings from customers</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
