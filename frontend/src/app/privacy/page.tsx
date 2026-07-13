import { StaticPage } from '@/components/StaticPage';

export default function PrivacyPage() {
  return <StaticPage eyebrow="Legal" title="Privacy Policy" intro="This policy explains the information TravelPlatform uses to operate accounts, trips, reviews, and bookings." sections={[{ title: 'Information we process', body: 'We process account details and content you submit, including saved places, trips, reviews, claims, and bookings.' }, { title: 'How it is used', body: 'Information is used to provide platform features, secure accounts, respond to support requests, and monitor reliability.' }, { title: 'Your choices', body: 'You may update profile information and request account-related assistance through the contact channel.' }]} />;
}
