import { StaticPage } from '@/components/StaticPage';

export default function AboutPage() {
  return <StaticPage eyebrow="Our story" title="Travel planning, made practical" intro="TravelPlatform helps travelers discover places, save ideas, and turn them into day-by-day itineraries." sections={[{ title: 'What we build', body: 'A single place to explore destinations, compare useful details, plan trips, and manage bookings.' }, { title: 'Our data', body: 'Place information combines community-maintained open data with operational data created inside the platform.' }]} />;
}
