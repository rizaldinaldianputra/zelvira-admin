import { Suspense } from 'react';
import ContentSectionForm from '@/components/admin/ContentSectionForm';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="py-8 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ContentSectionForm id={id} />
      </Suspense>
    </div>
  );
}

