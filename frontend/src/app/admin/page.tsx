'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/business.service';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate } from '@/lib/utils';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ['admin-claims'],
    queryFn: () => adminService.getAllClaims(),
  });

  const reviewClaimMutation = useMutation({
    mutationFn: ({ claimId, approved }: { claimId: string; approved: boolean }) =>
      adminService.reviewClaim(claimId, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const pendingClaims = claims?.filter((c) => c.status === 'PENDING') || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">
            Admin <em className="text-terracotta not-italic">Dashboard</em>
          </h1>
          <p className="mt-2 text-muted font-light">
            Manage platform operations and review claims
          </p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-6">
                <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="text-3xl mb-2">👥</div>
              <div className="font-serif text-2xl font-semibold text-ink">
                {stats.totalUsers || 0}
              </div>
              <div className="text-sm text-muted">Total Users</div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="text-3xl mb-2">📍</div>
              <div className="font-serif text-2xl font-semibold text-ink">
                {stats.totalPlaces || 0}
              </div>
              <div className="text-sm text-muted">Total Places</div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-serif text-2xl font-semibold text-ink">
                {stats.totalReviews || 0}
              </div>
              <div className="text-sm text-muted">Total Reviews</div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="text-3xl mb-2">📋</div>
              <div className="font-serif text-2xl font-semibold text-ink">
                {stats.totalBookings || 0}
              </div>
              <div className="text-sm text-muted">Total Bookings</div>
            </div>
          </div>
        ) : null}

        {/* Pending Claims */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-ink mb-6">
            Pending Claims ({pendingClaims.length})
          </h2>

          {claimsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          ) : pendingClaims.length > 0 ? (
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-ink">
                        {claim.place.name}
                      </h3>
                      <p className="text-sm text-muted">
                        {claim.place.category} • {claim.place.city}, {claim.place.country}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Submitted: {formatDate(claim.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-600">
                      PENDING
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg bg-white p-4 border-l-4 border-terracotta">
                    <div className="text-sm font-medium text-ink mb-1">Claim Reason:</div>
                    <p className="text-sm text-muted">{claim.claimReason}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        reviewClaimMutation.mutate({ claimId: claim.id, approved: true })
                      }
                      disabled={reviewClaimMutation.isPending}
                      className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() =>
                        reviewClaimMutation.mutate({ claimId: claim.id, approved: false })
                      }
                      disabled={reviewClaimMutation.isPending}
                      className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              No pending claims to review
            </div>
          )}
        </div>

        {/* All Claims History */}
        {claims && claims.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-ink mb-6">
              All Claims History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted">
                    <th className="pb-3 font-medium">Place</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <div className="font-semibold text-ink">{claim.place.name}</div>
                        <div className="text-sm text-muted">
                          {claim.place.city}, {claim.place.country}
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            claim.status === 'APPROVED'
                              ? 'bg-green-50 text-green-600'
                              : claim.status === 'PENDING'
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-muted">
                        {formatDate(claim.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
