'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { placesService } from '@/services/places.service';
import { reviewsService } from '@/services/reviews.service';
import { useAuthStore } from '@/stores/auth-store';
import { formatDate } from '@/lib/utils';
import { BookingCard } from '@/components/BookingCard';

export default function PlaceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  // Fetch place details
  const { data: place, isLoading: placeLoading } = useQuery({
    queryKey: ['place', params.id],
    queryFn: () => placesService.getPlace(params.id),
  });

  // Fetch reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', params.id],
    queryFn: () => reviewsService.getReviews(params.id),
  });

  // Save/Unsave place
  const saveMutation = useMutation({
    mutationFn: (placeId: string) => placesService.savePlace(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place', params.id] });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (placeId: string) => placesService.unsavePlace(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place', params.id] });
    },
  });

  // Create review
  const createReviewMutation = useMutation({
    mutationFn: () => reviewsService.createReview(params.id, reviewData.rating, reviewData.comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', params.id] });
      queryClient.invalidateQueries({ queryKey: ['place', params.id] });
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
    },
  });

  // Vote helpful
  const voteMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsService.voteHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', params.id] });
    },
  });

  const handleSaveToggle = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (place?.isSaved) {
      unsaveMutation.mutate(params.id);
    } else {
      saveMutation.mutate(params.id);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    createReviewMutation.mutate();
  };

  if (placeLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-muted">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Place not found</h2>
          <Link href="/places" className="text-terracotta hover:text-terracotta-hover">
            Back to places
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Image */}
      <div className="relative h-[32rem] overflow-hidden bg-ink">
        {place.imageUrls && place.imageUrls.length > 0 ? (
          <img
            src={place.imageUrls[0]}
            alt={place.name}
            className="h-full w-full object-cover opacity-85"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-8xl">📍</div>
        )}

        {/* Overlay actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleSaveToggle}
            className="rounded-full bg-white/90 backdrop-blur-sm p-3 shadow-lg transition hover:bg-white"
          >
            {place.isSaved ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-white p-5"><p className="text-xs uppercase tracking-wider text-muted">Rating</p><p className="mt-2 font-serif text-2xl text-ink">{place.rating ? `${place.rating.toFixed(1)} / 5` : 'New'}</p><p className="mt-1 text-xs text-muted">{place.reviewCount} reviews</p></div>
          <div className="rounded-2xl border border-border bg-white p-5"><p className="text-xs uppercase tracking-wider text-muted">Price level</p><p className="mt-2 font-serif text-2xl text-ink">{place.priceLevel ? '$'.repeat(place.priceLevel) : 'Not listed'}</p><p className="mt-1 text-xs text-muted">Local range</p></div>
          <div className="rounded-2xl border border-border bg-white p-5"><p className="text-xs uppercase tracking-wider text-muted">Destination</p><p className="mt-2 font-serif text-2xl text-ink">{place.city}</p><p className="mt-1 text-xs text-muted">{place.country}</p></div>
          <div className="rounded-2xl border border-border bg-white p-5"><p className="text-xs uppercase tracking-wider text-muted">Booking</p><p className="mt-2 font-serif text-2xl text-ink">Request</p><p className="mt-1 text-xs text-muted">Confirmation required</p></div>
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-terracotta-tint px-4 py-1.5 text-sm font-medium text-terracotta">
            {place.category}
          </div>

          <h1 className="font-serif text-5xl font-normal tracking-tight text-ink">
            {place.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-muted">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{place.address}, {place.city}, {place.country}</span>
            </div>

            {place.rating && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold text-ink">{place.rating.toFixed(1)}</span>
                <span>({place.reviewCount} reviews)</span>
              </div>
            )}

            {place.priceLevel && (
              <div className="text-terracotta font-semibold">
                {'$'.repeat(place.priceLevel)}
              </div>
            )}
          </div>
        </div>

        <div className="mb-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Description */}
        <div className="overflow-hidden rounded-3xl border border-border bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">Discover</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">About this place</h2>
          <p className="mt-4 text-muted leading-8">{place.description}</p>

          {/* Contact Info */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {place.phone && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <div className="text-xs text-muted">Phone</div>
                  <div className="text-ink">{place.phone}</div>
                </div>
              </div>
            )}

            {place.email && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">✉️</span>
                <div>
                  <div className="text-xs text-muted">Email</div>
                  <div className="text-ink">{place.email}</div>
                </div>
              </div>
            )}

            {place.website && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                <div>
                  <div className="text-xs text-muted">Website</div>
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta hover:text-terracotta-hover"
                  >
                    Visit website
                  </a>
                </div>
              </div>
            )}

            {place.openingHours && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕒</span>
                <div>
                  <div className="text-xs text-muted">Hours</div>
                  <div className="text-ink">{place.openingHours}</div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div><p className="text-xs uppercase tracking-wider text-muted">Coordinates</p><p className="mt-2 font-medium text-ink">{place.latitude?.toFixed(5)}, {place.longitude?.toFixed(5)}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-muted">Data source</p><p className="mt-2 font-medium text-ink">{place.source === 'openstreetmap' ? 'OpenStreetMap contributors' : place.source || 'TravelPlatform'}</p>{place.sourceUrl ? <a href={place.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-terracotta hover:underline">View original listing ↗</a> : null}</div>
          </div>
        </div>
        <BookingCard placeId={place.id} placeName={place.name} />
        </div>

        {/* Reviews Section */}
        <div className="rounded-2xl border border-border bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Reviews ({reviews?.length || 0})
            </h2>

            {isAuthenticated && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:bg-terracotta-hover"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mb-8 rounded-xl border border-border bg-surface p-6">
              <h3 className="font-semibold text-ink mb-4">Share your experience</h3>

              {/* Star Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="text-3xl transition hover:scale-110"
                    >
                      {star <= reviewData.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink mb-2">Your Review</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-ink focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                  placeholder="Share your thoughts about this place..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createReviewMutation.isPending}
                  className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:bg-terracotta-hover disabled:opacity-50"
                >
                  {createReviewMutation.isPending ? 'Posting...' : 'Post Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="rounded-full border border-border bg-white px-6 py-2.5 text-sm font-medium text-ink transition hover:border-terracotta"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse border-b border-border pb-4">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-ink">{review.userName}</div>
                      <div className="text-sm text-muted">{formatDate(review.createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-ink mb-3">{review.comment}</p>

                  <button
                    onClick={() => voteMutation.mutate(review.id)}
                    disabled={review.hasVoted}
                    className="text-sm text-muted hover:text-terracotta transition disabled:opacity-50"
                  >
                    👍 Helpful ({review.helpfulCount})
                  </button>

                  {/* Business Reply */}
                  {review.reply && (
                    <div className="mt-4 ml-8 rounded-lg bg-surface p-4 border-l-4 border-terracotta">
                      <div className="text-sm font-semibold text-ink mb-1">
                        Response from business
                      </div>
                      <p className="text-sm text-muted">{review.reply.comment}</p>
                      <div className="text-xs text-muted mt-2">
                        {formatDate(review.reply.createdAt)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              No reviews yet. Be the first to review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
