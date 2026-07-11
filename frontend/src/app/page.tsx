import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F2E3D6] px-4 py-1.5 text-xs font-medium text-[#C4612F] w-fit">
                <span>✨</span>
                <span>Plan Your Perfect Trip</span>
              </div>

              <h1 className="font-serif text-5xl font-normal tracking-tight text-[#1F2421] lg:text-6xl">
                Discover <em className="text-[#C4612F] not-italic">Amazing</em> Places Around The World
              </h1>

              <p className="mt-6 text-lg font-light text-[#5C635D]">
                From luxurious hotels to hidden restaurants and breathtaking attractions.
                Plan your journey with confidence and explore the world like never before.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/places"
                  className="rounded-full bg-[#C4612F] px-8 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#A94E22] hover:shadow-md"
                >
                  Explore Places
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-[#E7E1D7] bg-white px-8 py-3.5 text-sm font-medium text-[#1F2421] transition hover:border-[#C4612F] hover:text-[#C4612F]"
                >
                  Create Account
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-[#E7E1D7] pt-8">
                <div>
                  <div className="font-serif text-3xl font-semibold text-[#C4612F]">1000+</div>
                  <div className="mt-1 text-sm text-[#5C635D]">Places</div>
                </div>
                <div>
                  <div className="font-serif text-3xl font-semibold text-[#C4612F]">5000+</div>
                  <div className="mt-1 text-sm text-[#5C635D]">Reviews</div>
                </div>
                <div>
                  <div className="font-serif text-3xl font-semibold text-[#C4612F]">100+</div>
                  <div className="mt-1 text-sm text-[#5C635D]">Cities</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-[500px] overflow-hidden rounded-3xl border border-[#E7E1D7] shadow-xl lg:h-[600px]">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80"
                alt="Beautiful travel destination"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-[#FBF9F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-normal tracking-tight text-[#1F2421]">
              Explore By <em className="text-[#C4612F] not-italic">Category</em>
            </h2>
            <p className="mt-4 text-lg font-light text-[#5C635D]">
              Find exactly what you're looking for
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🏨', name: 'Hotels', category: 'HOTEL', count: '200+' },
              { icon: '🍽️', name: 'Restaurants', category: 'RESTAURANT', count: '350+' },
              { icon: '🏛️', name: 'Attractions', category: 'ATTRACTION', count: '300+' },
              { icon: '🎒', name: 'Tours', category: 'TOUR', count: '150+' },
            ].map((cat) => (
              <Link
                key={cat.category}
                href={`/places?category=${cat.category}`}
                className="group relative overflow-hidden rounded-2xl border border-[#E7E1D7] bg-white p-8 transition hover:border-[#C4612F] hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2E3D6] text-3xl transition group-hover:scale-110">
                  {cat.icon}
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#1F2421]">{cat.name}</h3>
                <p className="mt-2 text-sm text-[#5C635D]">{cat.count} places</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-normal tracking-tight text-[#1F2421]">
              Why Choose <em className="text-[#C4612F] not-italic">Us</em>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: '⭐',
                title: 'Verified Reviews',
                description: 'Read authentic reviews from real travelers to make informed decisions.',
              },
              {
                icon: '📅',
                title: 'Trip Planner',
                description: 'Organize your itinerary with our easy-to-use trip planning tools.',
              },
              {
                icon: '💰',
                title: 'Best Prices',
                description: 'Compare prices and find the best deals for your perfect vacation.',
              },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F2E3D6] text-4xl">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F2421]">{feature.title}</h3>
                <p className="mt-2 text-[#5C635D] font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1F2421] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-normal tracking-tight text-white">
            Ready to Start Your <em className="text-[#C4612F] not-italic">Adventure</em>?
          </h2>
          <p className="mt-4 text-lg font-light text-gray-300">
            Join thousands of travelers discovering amazing places every day.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block rounded-full bg-[#C4612F] px-8 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#A94E22] hover:shadow-md"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
