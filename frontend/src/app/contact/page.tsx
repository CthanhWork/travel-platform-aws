import { StaticPage } from '@/components/StaticPage';

export default function ContactPage() {
  return <StaticPage eyebrow="Contact" title="How can we help?" intro="Use the appropriate channel below and include the relevant place, trip, or booking identifier." sections={[{ title: 'General support', body: 'Email: hcthanh.work@gmail.com\nWe aim to respond within two business days.' }, { title: 'Business claims', body: 'Business owners can submit a verification request from the Claim a Place page after signing in.' }]} />;
}
