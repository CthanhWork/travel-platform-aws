'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { businessService } from '@/services/business.service';
import { useAuthStore } from '@/stores/auth-store';

interface BookingCardProps {
  placeId: string;
  placeName: string;
}

const today = new Date().toISOString().slice(0, 10);

export function BookingCard({ placeId, placeName }: BookingCardProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [bookingDate, setBookingDate] = useState('');
  const [numGuests, setNumGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  const bookingMutation = useMutation({
    mutationFn: () => businessService.createBooking({
      placeId,
      bookingDate,
      numGuests,
      specialRequests: specialRequests.trim() || undefined,
    }),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?next=/places/${placeId}`);
      return;
    }
    bookingMutation.mutate();
  };

  if (bookingMutation.isSuccess) {
    return (
      <aside className="overflow-hidden rounded-3xl bg-ink text-white shadow-xl">
        <div className="h-2 bg-terracotta" />
        <div className="p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">✓</div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">Request received</p>
          <h2 className="mt-2 font-serif text-3xl">Your booking is pending</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            {placeName} will review your request. Track its status from My Bookings.
          </p>
          <button onClick={() => router.push('/bookings')} className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-orange-50">
            View My Bookings
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-3xl border border-border bg-white p-7 shadow-[0_20px_60px_-35px_rgba(48,37,31,0.55)] lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">Plan your visit</p>
      <h2 className="mt-2 font-serif text-3xl text-ink">Request a booking</h2>
      <p className="mt-2 text-sm leading-6 text-muted">No payment required. The business confirms availability after you submit.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Visit date</span>
          <input type="date" min={today} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} required className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/15" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Guests</span>
          <select value={numGuests} onChange={(event) => setNumGuests(Number(event.target.value))} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink outline-none focus:border-terracotta">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Special request <span className="font-normal text-muted">(optional)</span></span>
          <textarea rows={3} maxLength={500} value={specialRequests} onChange={(event) => setSpecialRequests(event.target.value)} placeholder="Accessibility, dietary needs, preferred time..." className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-ink outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/15" />
        </label>
        <button type="submit" disabled={bookingMutation.isPending || !bookingDate} className="w-full rounded-full bg-terracotta px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-terracotta/20 transition hover:bg-terracotta-hover disabled:cursor-not-allowed disabled:opacity-50">
          {bookingMutation.isPending ? 'Sending request...' : isAuthenticated ? 'Request booking' : 'Sign in to book'}
        </button>
        {bookingMutation.isError ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">We could not create this booking. Please check the details and try again.</p> : null}
      </form>
    </aside>
  );
}
