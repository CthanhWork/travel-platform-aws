'use client';

import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth.service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      clearAuth();
      router.push('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-semibold text-gray-900">TravelPlatform</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/places" className="text-gray-700 hover:text-gray-900 transition">
              Places
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/trips" className="text-gray-700 hover:text-gray-900 transition">
                  My Trips
                </Link>
                <Link href="/saved" className="text-gray-700 hover:text-gray-900 transition">
                  Saved
                </Link>
                <Link href="/bookings" className="text-gray-700 hover:text-gray-900 transition">
                  Bookings
                </Link>
                {user?.role === 'BUSINESS_OWNER' && (
                  <Link href="/business" className="text-gray-700 hover:text-gray-900 transition">
                    Business
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="text-gray-700 hover:text-gray-900 transition">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-gray-900 transition"
                >
                  {user?.firstName} {user?.lastName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#C4612F] px-4 py-2 text-sm font-medium text-white hover:bg-[#A94E22] transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
