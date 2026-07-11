'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { placesService, type PlaceCategory, type PlaceFilters } from '@/services/places.service';

const categories: { value: PlaceCategory; label: string; icon: string }[] = [
  { value: 'HOTEL', label: 'Hotels', icon: '🏨' },
  { value: 'RESTAURANT', label: 'Restaurants', icon: '🍽️' },
  { value: 'ATTRACTION', label: 'Attractions', icon: '🏛️' },
  { value: 'TOUR', label: 'Tours', icon: '🎒' },
];

export default function PlacesPage() {
  const [filters, setFilters] = useState<PlaceFilters>({
    page: 1,
    limit: 12,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['places', filters],
    queryFn: () => placesService.getPlaces(filters),
  });
  const places = data?.places || [];

  const handleCategoryChange = (category: PlaceCategory | undefined) => {
    setFilters({ ...filters, category, page: 1 });
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">
            Discover <em className="text-terracotta not-italic">Amazing</em> Places
          </h1>
          <p className="mt-2 text-muted font-light">
            Explore hotels, restaurants, attractions and tours around the world
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search & Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search places..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-white px-6 py-4 pl-12 text-ink placeholder:text-muted/50 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${
                !filters.category
                  ? 'bg-terracotta text-white'
                  : 'border border-border bg-white text-ink hover:border-terracotta'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${
                  filters.category === cat.value
                    ? 'bg-terracotta text-white'
                    : 'border border-border bg-white text-ink hover:border-terracotta'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results Count */}
          {data && (
            <div className="text-sm text-muted">
              Found <span className="font-semibold text-ink">{data.total}</span> places
            </div>
          )}
        </div>

        {/* Loading State */}
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

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-600">Failed to load places. Please try again.</p>
          </div>
        )}

        {/* Places Grid */}
        {data && places.length > 0 && (
          <>
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
                        {categories.find((c) => c.value === place.category)?.icon || '📍'}
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-ink">
                      {place.category}
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
                        <span>{[place.city, place.country].filter(Boolean).join(', ')}</span>
                      </div>

                      {place.rating !== undefined && place.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-ink">{place.rating.toFixed(1)}</span>
                          <span className="text-muted">({place.reviewCount})</span>
                        </div>
                      )}
                    </div>

                    {place.priceLevel && (
                      <div className="mt-2 text-sm text-terracotta">
                        {'$'.repeat(place.priceLevel)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={filters.page === 1}
                  className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-terracotta disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(data.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters({ ...filters, page: i + 1 })}
                      className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                        filters.page === i + 1
                          ? 'bg-terracotta text-white'
                          : 'border border-border bg-white text-ink hover:border-terracotta'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={filters.page === data.totalPages}
                  className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-terracotta disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {data && places.length === 0 && (
          <div className="rounded-2xl border border-border bg-white p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-serif text-2xl font-semibold text-ink mb-2">No places found</h3>
            <p className="text-muted">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
