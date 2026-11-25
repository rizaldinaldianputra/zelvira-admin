'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileJson, ArrowLeft, Smartphone, Plus } from 'lucide-react';
import { ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useMobileContentItems } from '@/hooks/use-mobile-content-items';

interface PageProps {
  params: Promise<{ type: string }>;
}

export default function MobileContentTypeListPage({ params }: PageProps) {
  const { type } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (type === 'NEWS') {
      router.replace('/admin/news');
    } else if (type === 'FEATURED_MOBILE') {
      router.replace('/admin/products');
    }
  }, [type, router]);

  const {
    items,
    isLoading,
    typeInfo,
    handleAdd,
    handleEdit,
    handleDelete,
  } = useMobileContentItems(type);

  const columns: ColumnDef<ContentItem>[] = [
    {
      accessorKey: 'title',
      header: 'Item Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imageUrl ? (
            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
              <img src={row.original.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <FileJson size={14} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">{row.original.title || 'Untitled'}</span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{row.original.subtitle}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Created',
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-500">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'pink' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/mobile">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-white/10">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{typeInfo.label}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{typeInfo.description}</p>
          </div>
        </div>

        <Button onClick={handleAdd} className="rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold gap-2">
          <Plus size={16} /> Tambah Item
        </Button>
      </div>

      <CrudTable
        data={items}
        columns={columns}
        searchKey="title"
        onEdit={handleEdit}
        onDelete={(item) => item.id && handleDelete(item.id)}
        isLoading={isLoading}
      />
    </div>
  );
}
