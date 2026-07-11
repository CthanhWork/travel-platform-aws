'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { tripsService } from '@/services/trips.service';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate } from '@/lib/utils';

export default function TripsPage() {
  return (
    <ProtectedRoute>
      <TripsContent />
    </ProtectedRoute>
  );
}

function TripsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isPublic: false,
  });

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsService.getTrips(),
  });

  const createTripMutation = useMutation({
    mutationFn: () => tripsService.createTrip(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      router.push(`/trips/${data.id}`);
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: (id: string) => tripsService.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTripMutation.mutate();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">
              Your <em className="text-terracotta not-italic">Trips</em>
            </h1>
            <p className="mt-2 text-muted font-light">
              Plan and organize your adventures
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-full bg-terracotta px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-terracotta-hover"
          >
            + Create Trip
          </button>
        </div>

        {/* Create Trip Form */}
        {showCreateForm && (
          <div className="mb-8 rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-ink mb-6">Create New Trip</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trip Name */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Trip Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                  placeholder="e.g., Tokyo Adventure 2026"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                  placeholder="What's this trip about?"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                  />
                </div>
              </div>

              {/* Public/Private */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-terracotta focus:ring-2 focus:ring-terracotta/20"
                />
                <label htmlFor="isPublic" className="text-sm text-ink">
                  Make this trip public (anyone with the link can view)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createTripMutation.isPending}
                  className="rounded-full bg-terracotta px-8 py-3 text-sm font-medium text-white transition hover:bg-terracotta-hover disabled:opacity-50"
                >
                  {createTripMutation.isPending ? 'Creating...' : 'Create Trip'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-full border border-border bg-white px-8 py-3 text-sm font-medium text-ink transition hover:border-terracotta"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Trips Grid */}
        {trips && trips.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:border-terracotta hover:shadow-lg"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-semibold text-ink line-clamp-1">
                        {trip.name}
                      </h3>
                      {trip.description && (
                        <p className="mt-1 text-sm text-muted line-clamp-2">
                          {trip.description}
                        </p>
                      )}
                    </div>

                    <div className="ml-2 text-2xl">✈️</div>
                  </div>

                  {/* Dates */}
                  {(trip.startDate || trip.endDate) && (
                    <div className="mb-4 text-sm text-muted">
                      📅 {trip.startDate && formatDate(trip.startDate)}
                      {trip.startDate && trip.endDate && ' - '}
                      {trip.endDate && formatDate(trip.endDate)}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mb-4 flex items-center gap-4 text-sm text-muted">
                    <div>📍 {trip.places?.length || 0} places</div>
                    {trip.isPublic && <div>🔗 Public</div>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/trips/${trip.id}`}
                      className="flex-1 rounded-full bg-terracotta px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-terracotta-hover"
                    >
                      View Trip
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this trip?')) {
                          deleteTripMutation.mutate(trip.id);
                        }
                      }}
                      className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:border-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {trips && trips.length === 0 && !showCreateForm && (
          <div className="rounded-2xl border border-border bg-white p-12 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="font-serif text-2xl font-semibold text-ink mb-2">No trips yet</h3>
            <p className="text-muted mb-6">Start planning your next adventure</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-block rounded-full bg-terracotta px-8 py-3 text-sm font-medium text-white transition hover:bg-terracotta-hover"
            >
              Create Your First Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
