'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { businessService } from '@/services/business.service';
import { formatDate } from '@/lib/utils';

const statusStyles = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-200',
  COMPLETED: 'bg-blue-50 text-blue-700 ring-blue-200',
};

function BookingsContent() {
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading, isError } = useQuery({ queryKey: ['my-bookings'], queryFn: () => businessService.getMyBookings() });
  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => businessService.cancelBooking(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-cream py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">Your travel desk</p><h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">My Bookings</h1><p className="mt-3 text-muted">Track requests and confirmations in one place.</p></div>
          <Link href="/places" className="rounded-full border border-border bg-white px-5 py-2.5 text-center text-sm font-semibold text-ink transition hover:border-terracotta">Explore more places</Link>
        </div>

        <div className="mt-10 space-y-4">
          {isLoading ? [1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-white" />) : null}
          {isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Bookings could not be loaded. Please refresh and try again.</div> : null}
          {!isLoading && !isError && bookings.length === 0 ? <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center"><div className="text-4xl">◎</div><h2 className="mt-4 font-serif text-2xl text-ink">No bookings yet</h2><p className="mt-2 text-muted">Open a place and choose a visit date to request your first booking.</p><Link href="/places" className="mt-6 inline-block rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white">Find a place</Link></div> : null}
          {bookings.map((booking) => (
            <article key={booking.id} className="grid gap-5 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
              <div><div className="flex flex-wrap items-center gap-3"><h2 className="font-serif text-2xl text-ink">{booking.place.name}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[booking.status]}`}>{booking.status}</span></div><p className="mt-1 text-sm text-muted">{booking.place.city}, {booking.place.country}</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink"><span><strong>Date:</strong> {formatDate(booking.bookingDate)}</span><span><strong>Guests:</strong> {booking.numGuests || 1}</span></div>{booking.specialRequests ? <p className="mt-3 text-sm text-muted">“{booking.specialRequests}”</p> : null}</div>
              <div className="flex gap-3 sm:flex-col"><Link href={`/places/${booking.placeId}`} className="flex-1 rounded-full border border-border px-4 py-2 text-center text-sm font-semibold text-ink">View place</Link>{booking.status === 'PENDING' ? <button onClick={() => cancelMutation.mutate(booking.id)} disabled={cancelMutation.isPending} className="flex-1 rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">Cancel request</button> : null}</div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function BookingsPage() { return <ProtectedRoute><BookingsContent /></ProtectedRoute>; }
