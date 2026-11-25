import { redirect } from 'next/navigation';

export default function SocialConnectPage() {
  redirect('/admin/settings?tab=social');
}
