import { redirect } from 'next/navigation';

export default function SocialStatusPage() {
  redirect('/admin/social/posts?type=STORY');
}

