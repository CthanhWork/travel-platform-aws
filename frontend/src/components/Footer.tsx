import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-[#1F2421] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✈️</span>
              <span className="text-lg font-semibold">TravelPlatform</span>
            </div>
            <p className="text-sm text-gray-400">
              Discover amazing places and plan your perfect trip
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/places?category=HOTEL" className="hover:text-white transition">
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="/places?category=RESTAURANT" className="hover:text-white transition">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/places?category=ATTRACTION" className="hover:text-white transition">
                  Attractions
                </Link>
              </li>
              <li>
                <Link href="/places?category=TOUR" className="hover:text-white transition">
                  Tours
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/business/claim" className="hover:text-white transition">
                  Business Owners
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 TravelPlatform. All rights reserved.</p>
          <p className="mt-2">
            Place data &copy;{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-gray-600 underline-offset-2 hover:text-white"
            >
              OpenStreetMap contributors
            </a>{' '}
            under ODbL.
          </p>
        </div>
      </div>
    </footer>
  );
}
