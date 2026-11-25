import { Suspense } from 'react';
import ContentSectionForm from '@/components/admin/ContentSectionForm';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="py-8 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ContentSectionForm />
      </Suspense>
    </div>
  );
}

