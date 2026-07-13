import { StaticPage } from '@/components/StaticPage';

export default function TermsPage() {
  return <StaticPage eyebrow="Legal" title="Terms of Service" intro="By using TravelPlatform, you agree to use the service lawfully and provide accurate information." sections={[{ title: 'Platform content', body: 'Place information may come from third-party or open-data sources and should be confirmed before making travel decisions.' }, { title: 'User content', body: 'You are responsible for reviews, claims, booking details, and other content submitted through your account.' }, { title: 'Availability', body: 'Features may change as the platform evolves. We work to keep the service available but do not guarantee uninterrupted access.' }]} />;
}
