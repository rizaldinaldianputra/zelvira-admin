import { redirect } from 'next/navigation';

export default function SocialCalendarRedirect() {
  redirect('/admin/social/posts');
}
