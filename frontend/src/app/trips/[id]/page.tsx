'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { tripsService, type TripPlace } from '@/services/trips.service';
import { placesService } from '@/services/places.service';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate } from '@/lib/utils';

export default function TripDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <TripDetailContent tripId={params.id} />
    </ProtectedRoute>
  );
}

function TripDetailContent({ tripId }: { tripId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [placeData, setPlaceData] = useState({ day: 1, orderInDay: 1, notes: '' });
  const [shareUrl, setShareUrl] = useState('');

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsService.getTrip(tripId),
  });

  const { data: savedPlaces } = useQuery({
    queryKey: ['saved-places'],
    queryFn: () => placesService.getSavedPlaces(),
  });

  const addPlaceMutation = useMutation({
    mutationFn: () =>
      tripsService.addPlaceToTrip(
        tripId,
        selectedPlaceId,
        placeData.day,
        placeData.orderInDay,
        placeData.notes
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAddPlace(false);
      setSelectedPlaceId('');
      setPlaceData({ day: 1, orderInDay: 1, notes: '' });
    },
  });

  const removePlaceMutation = useMutation({
    mutationFn: (placeId: string) => tripsService.removePlaceFromTrip(tripId, placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });

  const handleCopyShareLink = () => {
    if (trip?.shareToken) {
      const url = `${window.location.origin}/trips/share/${trip.shareToken}`;
      setShareUrl(url);
      navigator.clipboard.writeText(url);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-muted">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Trip not found</h2>
          <Link href="/trips" className="text-terracotta hover:text-terracotta-hover">
            Back to trips
          </Link>
        </div>
      </div>
    );
  }

  // Group places by day
  const placesByDay = (trip.places || []).reduce((acc, place) => {
    if (!acc[place.day]) {
      acc[place.day] = [];
    }
    acc[place.day].push(place);
    return acc;
  }, {} as Record<number, TripPlace[]>);

  // Sort places within each day
  Object.keys(placesByDay).forEach((day) => {
    placesByDay[Number(day)].sort((a, b) => a.orderInDay - b.orderInDay);
  });

  const days = Object.keys(placesByDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/trips" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-terracotta">
            ← Back to trips
          </Link>

          <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">
            {trip.name}
          </h1>

          {trip.description && (
            <p className="mt-2 text-muted font-light">{trip.description}</p>
          )}

          {/* Trip Info */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
            {(trip.startDate || trip.endDate) && (
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>
                  {trip.startDate && formatDate(trip.startDate)}
                  {trip.startDate && trip.endDate && ' - '}
                  {trip.endDate && formatDate(trip.endDate)}
                </span>
              </div>
            )}

            <div>📍 {trip.places?.length || 0} places</div>

            {trip.isPublic && (
              <div className="rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                🔗 Public
              </div>
            )}
          </div>

          {/* Share Link */}
          {trip.isPublic && trip.shareToken && (
            <div className="mt-4">
              <button
                onClick={handleCopyShareLink}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-terracotta"
              >
                📋 Copy Share Link
              </button>
              {shareUrl && (
                <p className="mt-2 text-xs text-green-600">Link copied to clipboard!</p>
              )}
            </div>
          )}

          {/* Add Place Button */}
          <div className="mt-6">
            <button
              onClick={() => setShowAddPlace(true)}
              className="rounded-full bg-terracotta px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-terracotta-hover"
            >
              + Add Place to Trip
            </button>
          </div>
        </div>

        {/* Add Place Form */}
        {showAddPlace && (
          <div className="mb-8 rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h3 className="font-serif text-xl font-semibold text-ink mb-4">Add Place to Trip</h3>

            <div className="space-y-4">
              {/* Select Place */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Select Place</label>
                <select
                  value={selectedPlaceId}
                  onChange={(e) => setSelectedPlaceId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink focus:border-terracotta focus:outline-none"
                  required
                >
                  <option value="">Choose a place...</option>
                  {savedPlaces?.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name} - {place.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Day</label>
                  <input
                    type="number"
                    min="1"
                    value={placeData.day}
                    onChange={(e) => setPlaceData({ ...placeData, day: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink focus:border-terracotta focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Order</label>
                  <input
                    type="number"
                    min="1"
                    value={placeData.orderInDay}
                    onChange={(e) => setPlaceData({ ...placeData, orderInDay: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink focus:border-terracotta focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Notes (optional)</label>
                <textarea
                  value={placeData.notes}
                  onChange={(e) => setPlaceData({ ...placeData, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink focus:border-terracotta focus:outline-none"
                  placeholder="Any special notes about this place..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => addPlaceMutation.mutate()}
                  disabled={!selectedPlaceId || addPlaceMutation.isPending}
                  className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:bg-terracotta-hover disabled:opacity-50"
                >
                  {addPlaceMutation.isPending ? 'Adding...' : 'Add Place'}
                </button>
                <button
                  onClick={() => setShowAddPlace(false)}
                  className="rounded-full border border-border bg-white px-6 py-2.5 text-sm font-medium text-ink transition hover:border-terracotta"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Itinerary by Day */}
        {days.length > 0 ? (
          <div className="space-y-8">
            {days.map((day) => (
              <div key={day} className="rounded-2xl border border-border bg-white p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-semibold text-ink mb-6">
                  Day {day}
                </h2>

                <div className="space-y-4">
                  {placesByDay[day].map((tripPlace, index) => (
                    <div
                      key={tripPlace.id}
                      className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4"
                    >
                      {/* Order Number */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-terracotta text-white font-semibold">
                        {index + 1}
                      </div>

                      {/* Place Info */}
                      <div className="flex-1">
                        <Link
                          href={`/places/${tripPlace.place.id}`}
                          className="font-serif text-lg font-semibold text-ink hover:text-terracotta"
                        >
                          {tripPlace.place.name}
                        </Link>

                        <div className="mt-1 text-sm text-muted">
                          📍 {tripPlace.place.city}, {tripPlace.place.country}
                        </div>

                        {tripPlace.place.rating && (
                          <div className="mt-1 flex items-center gap-1 text-sm">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold text-ink">{tripPlace.place.rating.toFixed(1)}</span>
                          </div>
                        )}

                        {tripPlace.notes && (
                          <div className="mt-2 text-sm text-muted italic">
                            💭 {tripPlace.notes}
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          if (confirm('Remove this place from trip?')) {
                            removePlaceMutation.mutate(tripPlace.placeId);
                          }
                        }}
                        className="flex-shrink-0 rounded-full p-2 text-red-600 transition hover:bg-red-50"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white p-12 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="font-serif text-2xl font-semibold text-ink mb-2">No places added yet</h3>
            <p className="text-muted mb-6">Start building your itinerary by adding places</p>
            <button
              onClick={() => setShowAddPlace(true)}
              className="inline-block rounded-full bg-terracotta px-8 py-3 text-sm font-medium text-white transition hover:bg-terracotta-hover"
            >
              Add Your First Place
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
