'use client';

import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/business.service';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function BusinessPage() {
  return (
    <ProtectedRoute requiredRole="BUSINESS_OWNER">
      <BusinessContent />
    </ProtectedRoute>
  );
}

function BusinessContent() {
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['place-bookings'],
    queryFn: () => businessService.getPlaceBookings(),
  });

  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ['my-claims'],
    queryFn: () => businessService.getMyClaims(),
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">
            Business <em className="text-terracotta not-italic">Dashboard</em>
          </h1>
          <p className="mt-2 text-muted font-light">
            Manage your places and bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="text-3xl mb-2">📋</div>
            <div className="font-serif text-2xl font-semibold text-ink">
              {bookings?.length || 0}
            </div>
            <div className="text-sm text-muted">Total Bookings</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="text-3xl mb-2">⏳</div>
            <div className="font-serif text-2xl font-semibold text-ink">
              {bookings?.filter((b) => b.status === 'PENDING').length || 0}
            </div>
            <div className="text-sm text-muted">Pending Bookings</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="text-3xl mb-2">🏢</div>
            <div className="font-serif text-2xl font-semibold text-ink">
              {claims?.filter((c) => c.status === 'APPROVED').length || 0}
            </div>
            <div className="text-sm text-muted">Claimed Places</div>
          </div>
        </div>

        {/* Claims Section */}
        <div className="mb-8 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-ink">My Claims</h2>
            <Link
              href="/business/claim"
              className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:bg-terracotta-hover"
            >
              Claim a Place
            </Link>
          </div>

          {claimsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
          ) : claims && claims.length > 0 ? (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
                >
                  <div>
                    <h3 className="font-semibold text-ink">{claim.place.name}</h3>
                    <p className="text-sm text-muted">
                      {claim.place.city}, {claim.place.country}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Submitted: {formatDate(claim.createdAt)}
                    </p>
                  </div>

                  <div
                    className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                      claim.status === 'APPROVED'
                        ? 'bg-green-50 text-green-600'
                        : claim.status === 'PENDING'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {claim.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              You haven't claimed any places yet
            </div>
          )}
        </div>

        {/* Bookings Section */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-ink mb-6">Bookings</h2>

          {bookingsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted">
                    <th className="pb-3 font-medium">Place</th>
                    <th className="pb-3 font-medium">Dates</th>
                    <th className="pb-3 font-medium">Guests</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Booked</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <div className="font-semibold text-ink">{booking.place.name}</div>
                        <div className="text-sm text-muted">
                          {booking.place.city}, {booking.place.country}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-ink">
                        {formatDate(booking.checkInDate)}
                        {booking.checkOutDate && (
                          <>
                            <br />→ {formatDate(booking.checkOutDate)}
                          </>
                        )}
                      </td>
                      <td className="py-4 text-sm text-ink">{booking.guests}</td>
                      <td className="py-4 font-semibold text-ink">
                        {formatCurrency(booking.totalPrice)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-green-50 text-green-600'
                              : booking.status === 'PENDING'
                              ? 'bg-yellow-50 text-yellow-600'
                              : booking.status === 'COMPLETED'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-muted">
                        {formatDate(booking.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              No bookings yet for your places
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
