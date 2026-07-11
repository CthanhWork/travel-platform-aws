'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { placesService } from '@/services/places.service';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function SavedPlacesPage() {
  return (
    <ProtectedRoute>
      <SavedPlacesContent />
    </ProtectedRoute>
  );
}

function SavedPlacesContent() {
  const { data: places, isLoading } = useQuery({
    queryKey: ['saved-places'],
    queryFn: () => placesService.getSavedPlaces(),
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">
            Your <em className="text-terracotta not-italic">Saved</em> Places
          </h1>
          <p className="mt-2 text-muted font-light">
            Places you want to visit
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-gray-200" />
                <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Places Grid */}
        {places && places.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <Link
                key={place.id}
                href={`/places/${place.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:border-terracotta hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {place.imageUrls && place.imageUrls.length > 0 ? (
                    <img
                      src={place.imageUrls[0]}
                      alt={place.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      📍
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-ink">
                    {place.category}
                  </div>

                  {/* Saved Badge */}
                  <div className="absolute top-3 right-3 text-2xl">
                    ❤️
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-serif text-xl font-semibold text-ink line-clamp-1">
                    {place.name}
                  </h3>

                  <p className="mt-1 text-sm text-muted line-clamp-2">
                    {place.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted">
                      <span>📍</span>
                      <span>{place.city}, {place.country}</span>
                    </div>

                    {place.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold text-ink">{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {places && places.length === 0 && (
          <div className="rounded-2xl border border-border bg-white p-12 text-center">
            <div className="text-6xl mb-4">🤍</div>
            <h3 className="font-serif text-2xl font-semibold text-ink mb-2">No saved places yet</h3>
            <p className="text-muted mb-6">Start exploring and save places you want to visit</p>
            <Link
              href="/places"
              className="inline-block rounded-full bg-terracotta px-8 py-3 text-sm font-medium text-white transition hover:bg-terracotta-hover"
            >
              Explore Places
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
