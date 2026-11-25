// scripts/generators/crud-list-hooks.js
const path = require('path');

const crudListGenerators = [
  // 1. BRANDS LIST
  {
    name: 'useBrands',
    hookFile: 'hooks/use-brands.tsx',
    pageFile: 'app/admin/brands/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { BrandService } from '@/services/brand.service';
import { Brand } from '@/types/brand';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatImageUrl } from '@/lib/url-utils';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const res = await BrandService.getAll();
      setBrands(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch brands', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchBrands();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const columns: ColumnDef<Brand>[] = [
    {
      header: 'Brand',
      accessorKey: 'name',
      cell: ({ row }) => {
        const brand = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-100">
              <AvatarImage src={formatImageUrl(brand.logoUrl)} alt={brand.name} />
              <AvatarFallback>{brand.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100">{brand.name}</span>
              <span className="text-xs text-slate-500">{brand.slug}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-slate-500 text-sm">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/brands/new');
  const handleEdit = (brand: Brand) => router.push(\`/admin/brands/\${brand.id}\`);
  const handleDelete = async (brand: Brand) => {
    if (confirm(\`Are you sure you want to delete \${brand.name}?\`)) {
      try {
        await BrandService.delete(brand.id);
        toast({ title: 'Success', description: 'Brand deleted' });
        fetchBrands();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete brand', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (brand: Brand) => {
    try {
      await BrandService.update(brand.id, { ...brand, isActive: !brand.isActive });
      toast({ title: 'Success', description: 'Brand status updated' });
      fetchBrands();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update brand status', variant: 'destructive' });
    }
  };

  return {
    brands,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchBrands,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useBrands } from '@/hooks/use-brands';

export default function BrandsPage() {
  const {
    brands,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useBrands();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Official Brands</h1>
          <p className="text-slate-500 text-sm mt-1">Manage partner brands and their logos.</p>
        </div>
      </div>

      <CrudTable
        data={brands}
        columns={columns}
        searchKey="brands"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 2. CATEGORIES LIST
  {
    name: 'useCategories',
    hookFile: 'hooks/use-categories.tsx',
    pageFile: 'app/admin/categories/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { CategoryService } from '@/services/category.service';
import { Category } from '@/types/category';
import { useToast } from '@/hooks/use-toast';
import { formatImageUrl } from '@/lib/url-utils';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await CategoryService.getAll();
      setCategories(res.content || (Array.isArray(res) ? res : []));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 group">
              {imageUrl ? (
                <img 
                  src={formatImageUrl(imageUrl)} 
                  alt="" 
                  className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase">No Img</div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{row.original.name}</span>
              <span className="text-[10px] text-slate-500 font-medium">Category ID: {row.original.id}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Name',
      cell: ({ row }) => <span className="font-bold">{row.original.name}</span>,
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={\`px-2.5 py-1 rounded-full text-xs font-bold \${
          row.original.isActive 
            ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' 
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }\`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/categories/new');
  const handleEdit = (category: Category) => router.push(\`/admin/categories/\${category.id}\`);
  
  const handleDelete = async (category: Category) => {
    if (confirm(\`Are you sure you want to delete \${category.name}?\`)) {
      try {
        await CategoryService.delete(category.id);
        toast({ title: 'Success', description: 'Category deleted' });
        fetchCategories();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await CategoryService.update(category.id, { ...category, isActive: !category.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchCategories();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    categories,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchCategories,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useCategories } from '@/hooks/use-categories';

export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Categories</h1>
          <p className="text-slate-500 text-sm mt-1">Manage product categories and filtering.</p>
        </div>
      </div>

      <CrudTable
        data={categories}
        columns={columns}
        searchKey="categories"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 3. VOUCHERS LIST
  {
    name: 'useVouchers',
    hookFile: 'hooks/use-vouchers.tsx',
    pageFile: 'app/admin/vouchers/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { VoucherService } from '@/services/voucher.service';
import { Voucher } from '@/types/voucher';
import { useToast } from '@/hooks/use-toast';

export function useVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const res = await VoucherService.getAll();
      setVouchers(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch vouchers', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchVouchers();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const columns: ColumnDef<Voucher>[] = [
    {
      accessorKey: 'code',
      header: 'Voucher Code',
      cell: ({ row }) => <span className="font-bold tracking-wider text-pink-600 dark:text-pink-400">{row.original.code}</span>,
    },
    {
      accessorKey: 'discountAmount',
      header: 'Discount',
      cell: ({ row }) => <span>Rp {row.original.discountAmount.toLocaleString()}</span>,
    },
    {
      accessorKey: 'minPurchase',
      header: 'Min. Purchase',
      cell: ({ row }) => <span>Rp {row.original.minPurchase.toLocaleString()}</span>,
    },
    {
      accessorKey: 'validUntil',
      header: 'Expiry Date',
      cell: ({ row }) => <span>{row.original.validUntil ? new Date(row.original.validUntil).toLocaleDateString() : '-'}</span>,
    },
    {
      accessorKey: 'targetMembership',
      header: 'Target Membership',
      cell: ({ row }) => {
        const tier = row.original.targetMembership || 'ALL';
        let bg = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        if (tier === 'GOLD') {
          bg = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        } else if (tier === 'PLATINUM') {
          bg = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        } else if (tier === 'BRONZE') {
          bg = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        }
        return (
          <span className={\`px-2.5 py-1 rounded-full text-xs font-bold \${bg}\`}>
            {tier}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={\`px-2.5 py-1 rounded-full text-xs font-bold \${
          row.original.isActive 
            ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' 
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }\`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/vouchers/new');
  const handleEdit = (voucher: Voucher) => router.push(\`/admin/vouchers/\${voucher.id}\`);
  
  const handleDelete = async (voucher: Voucher) => {
    if (confirm(\`Are you sure you want to delete voucher \${voucher.code}?\`)) {
      try {
        await VoucherService.delete(voucher.id);
        toast({ title: 'Success', description: 'Voucher deleted' });
        fetchVouchers();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete voucher', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      await VoucherService.update(voucher.id, { ...voucher, isActive: !voucher.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchVouchers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    vouchers,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchVouchers,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useVouchers } from '@/hooks/use-vouchers';

export default function VouchersPage() {
  const {
    vouchers,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useVouchers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Vouchers & Promos</h1>
          <p className="text-slate-500 text-sm mt-1">Manage discount coupons and promotional offers.</p>
        </div>
      </div>

      <CrudTable
        data={vouchers}
        columns={columns}
        searchKey="vouchers"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 4. NEWS LIST
  {
    name: 'useNews',
    hookFile: 'hooks/use-news.tsx',
    pageFile: 'app/admin/news/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { NewsService, News } from '@/services/news.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useNews() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(false);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await NewsService.getAll();
      setNews((response as any).content || response);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch news', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchNews();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await NewsService.delete(id);
      toast({ title: 'Success', description: 'Article deleted' });
      fetchNews();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete article', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<News>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors uppercase">{row.original.title}</span>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight">/{row.original.slug}</span>
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Published At',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <Calendar className="h-3.5 w-3.5" />
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'Draft'}
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'pink' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.isActive ? 'Published' : 'Hidden'}
        </Badge>
      )
    }
  ];

  const handleToggleStatus = async (item: News) => {
    try {
      await NewsService.update(item.id!, { ...item, isActive: !item.isActive });
      toast({ title: 'Success', description: 'Article status updated' });
      fetchNews();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleAdd = () => router.push('/admin/news/new');
  const handleEdit = (item: News) => router.push(\`/admin/news/\${item.id}\`);

  return {
    news,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete: (item: News) => handleDelete(item.id!),
    handleToggleStatus,
    fetchNews,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Newspaper } from 'lucide-react';
import { useNews } from '@/hooks/use-news';

export default function NewsManagementPage() {
  const {
    news,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useNews();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">News & Fashion Articles</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage style guides, fashion updates, and company news.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={news}
        columns={columns}
        searchKey="news"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 5. REVIEWS LIST
  {
    name: 'useReviews',
    hookFile: 'hooks/use-reviews.tsx',
    pageFile: 'app/admin/reviews/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ReviewService } from '@/services/review.service';
import { Review } from '@/types/review';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await ReviewService.getAll();
      setReviews(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch reviews', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchReviews();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleToggleStatus = async (review: Review) => {
    try {
      await ReviewService.updateStatus(review.id, !review.isActive);
      toast({ title: 'Success', description: \`Review \${!review.isActive ? 'approved' : 'hidden'}\` });
      fetchReviews();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update review status', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Review>[] = [
    {
      header: 'Product',
      accessorKey: 'productName',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.productName || \`ID: \${row.original.productId}\`}</span>
      ),
    },
    {
      header: 'User',
      accessorKey: 'userName',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{row.original.userName || 'Anonymous'}</span>
          <span className="text-xs text-slate-500">ID: {row.original.userId}</span>
        </div>
      ),
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < row.original.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
            />
          ))}
        </div>
      ),
    },
    {
      header: 'Comment',
      accessorKey: 'comment',
      cell: ({ row }) => (
        <p className="max-w-[300px] truncate text-sm text-slate-600 italic">"{row.original.comment}"</p>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.isActive ? 'Public' : 'Hidden'}
        </Badge>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-slate-500 text-xs">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  return {
    reviews,
    isLoading,
    columns,
    handleToggleStatus,
    fetchReviews,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useReviews } from '@/hooks/use-reviews';

export default function ReviewsPage() {
  const {
    reviews,
    isLoading,
    columns,
    handleToggleStatus,
  } = useReviews();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Product Reviews</h1>
          <p className="text-slate-500 text-sm mt-1">Moderate and manage user feedback & ratings.</p>
        </div>
      </div>

      <CrudTable
        data={reviews}
        columns={columns}
        searchKey="reviews"
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 6. SUPPORT FAQ LIST
  {
    name: 'useSupportFaq',
    hookFile: 'hooks/use-support-faq.tsx',
    pageFile: 'app/admin/support/faq/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { FaqService, Faq } from '@/services/faq.service';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function useSupportFaq() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const res = await FaqService.getAll(0, 100);
      const content = res.content || [];
      setFaqs(content.sort((a: any, b: any) => (a.id || 0) - (b.id || 0)));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch FAQs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const columns: ColumnDef<Faq>[] = [
    {
      accessorKey: 'question',
      header: 'Question & Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className={\`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border border-white/20 \${row.original.isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}\`}>
            <HelpCircle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic line-clamp-1">{row.original.question}</span>
            <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{row.original.category || 'General'}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'} className="rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest">
          {row.original.isActive ? 'Active' : 'Draft'}
        </Badge>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/support/faq/new');
  const handleEdit = (faq: Faq) => router.push(\`/admin/support/faq/\${faq.id}\`);
  
  const handleDelete = async (faq: Faq) => {
    if (confirm(\`Are you sure you want to delete this FAQ?\`)) {
      try {
        await FaqService.delete(faq.id!);
        toast({ title: 'Success', description: 'FAQ deleted' });
        fetchFaqs();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete FAQ', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (faq: Faq) => {
    try {
      await FaqService.update(faq.id!, { ...faq, isActive: !faq.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchFaqs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    faqs,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchFaqs,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { MessageCircle } from 'lucide-react';
import { useSupportFaq } from '@/hooks/use-support-faq';

export default function FaqPage() {
  const {
    faqs,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useSupportFaq();

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-indigo-500/10 text-indigo-500 shadow-inner mb-2">
            <MessageCircle className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none">
              FAQ <span className="text-indigo-600">Database</span>
            </h1>
            <p className="text-slate-400 font-bold mt-2 text-sm max-w-md">
              Kelola daftar tanya-jawab umum untuk mempermudah bantuan kepada customer secara instan.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <CrudTable
          data={faqs}
          columns={columns}
          searchKey="faq"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
`
  },

  // 7. SUPPORT HELP LIST
  {
    name: 'useSupportHelp',
    hookFile: 'hooks/use-support-help.tsx',
    pageFile: 'app/admin/support/help/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { HelpService, HelpArticle } from '@/services/help.service';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Hash } from 'lucide-react';
import { formatImageUrl } from '@/lib/url-utils';
import { Badge } from '@/components/ui/badge';

export function useSupportHelp() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const res = await HelpService.getAll(0, 100);
      setArticles(res.content || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch help articles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const columns: ColumnDef<HelpArticle>[] = [
    {
      accessorKey: 'title',
      header: 'Article Details',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-white/10 shadow-sm shrink-0 group">
            {row.original.imageUrl ? (
              <img src={formatImageUrl(row.original.imageUrl)} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                <BookOpen size={20} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic line-clamp-1">{row.original.title}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic line-clamp-1">{row.original.subtitle}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-full px-3 py-0.5 font-bold text-[9px] uppercase tracking-widest border-blue-200 text-blue-600 bg-blue-50/50">
          {row.original.category || 'Support'}
        </Badge>
      ),
    },
    {
      accessorKey: 'displayOrder',
      header: 'Order',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-black text-xs italic">
          <Hash size={12} className="text-blue-500" />
          {row.original.displayOrder}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'} className="rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest">
          {row.original.isActive ? 'Active' : 'Draft'}
        </Badge>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/support/help/new');
  const handleEdit = (article: HelpArticle) => router.push(\`/admin/support/help/\${article.id}\`);
  
  const handleDelete = async (article: HelpArticle) => {
    if (confirm(\`Are you sure you want to delete "\${article.title}"?\`)) {
      try {
        await HelpService.delete(article.id!);
        toast({ title: 'Success', description: 'Article deleted' });
        fetchArticles();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete article', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (article: HelpArticle) => {
    try {
      await HelpService.update(article.id!, { ...article, isActive: !article.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchArticles();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    articles,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchArticles,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { BookOpen } from 'lucide-react';
import { useSupportHelp } from '@/hooks/use-support-help';

export default function HelpCenterPage() {
  const {
    articles,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useSupportHelp();

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-blue-500/10 text-blue-500 shadow-inner mb-2">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none">
              Help Center <span className="text-blue-600">Articles</span>
            </h1>
            <p className="text-slate-400 font-bold mt-2 text-sm max-w-md">
              Panduan lengkap, tutorial penggunaan, dan dokumentasi bantuan untuk customer setia.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <CrudTable
          data={articles}
          columns={columns}
          searchKey="help"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
`
  },

  // 8. SUPPORT PRIVACY LIST
  {
    name: 'useSupportPrivacy',
    hookFile: 'hooks/use-support-privacy.tsx',
    pageFile: 'app/admin/support/privacy/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { PrivacyPolicyService, PrivacyPolicy } from '@/services/privacy.service';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function useSupportPrivacy() {
  const [policies, setPolicies] = useState<PrivacyPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const res = await PrivacyPolicyService.getAll(0, 100);
      setPolicies(res.content || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch privacy policies',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const columns: ColumnDef<PrivacyPolicy>[] = [
    {
      accessorKey: 'title',
      header: 'Policy Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className={\`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border border-white/20 \${row.original.isActive ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-400'}\`}>
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic">{row.original.title}</span>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Version: {row.original.id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest">
          <Calendar size={12} className="text-pink-500" />
          {row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString() : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'pink' : 'secondary'} className="rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest">
          {row.original.isActive ? 'Active' : 'Draft'}
        </Badge>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/support/privacy/new');
  const handleEdit = (policy: PrivacyPolicy) => router.push(\`/admin/support/privacy/\${policy.id}\`);
  
  const handleDelete = async (policy: PrivacyPolicy) => {
    if (confirm(\`Are you sure you want to delete "\${policy.title}"?\`)) {
      try {
        await PrivacyPolicyService.delete(policy.id!);
        toast({ title: 'Success', description: 'Policy deleted' });
        fetchPolicies();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete policy', variant: 'destructive' });
      }
    }
  };

  const handleToggleStatus = async (policy: PrivacyPolicy) => {
    try {
      await PrivacyPolicyService.update(policy.id!, { ...policy, isActive: !policy.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchPolicies();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    policies,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    fetchPolicies,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { ShieldCheck } from 'lucide-react';
import { useSupportPrivacy } from '@/hooks/use-support-privacy';

export default function PrivacyPolicyPage() {
  const {
    policies,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useSupportPrivacy();

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-pink-500/10 text-pink-500 shadow-inner mb-2">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none">
              Privacy <span className="text-pink-600">Policy</span>
            </h1>
            <p className="text-slate-400 font-bold mt-2 text-sm max-w-md">
              Atur kebijakan privasi dan kepatuhan hukum untuk perlindungan data pengguna Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <CrudTable
          data={policies}
          columns={columns}
          searchKey="privacy"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
`
  },

  // 9. SEO SETTINGS LIST
  {
    name: 'useSeoConfigs',
    hookFile: 'hooks/use-seo-configs.tsx',
    pageFile: 'app/admin/settings/seo/page.tsx',
    hookCode: `'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SeoService, SeoConfig } from '@/services/seo.service';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';

export function useSeoConfigs() {
  const [configs, setConfigs] = useState<SeoConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const data = await SeoService.getAll();
      const allConfigs = Array.isArray(data) ? data : (data as any)?.content || [];
      setConfigs(allConfigs);
    } catch {
      toast({ title: 'Error', description: 'Failed to load SEO configs', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleAdd = () => {
    router.push('/admin/settings/seo/new');
  };

  const handleEdit = (config: SeoConfig) => {
    if (config.id) {
      router.push(\`/admin/settings/seo/\${config.id}\`);
    }
  };

  const handleDelete = async (config: SeoConfig) => {
    if (!config.id) return;
    if (!confirm('Are you sure you want to delete this SEO config?')) return;
    try {
      await SeoService.delete(config.id);
      toast({ title: 'Success', description: 'SEO config deleted' });
      loadConfigs();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete config', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<SeoConfig>[] = [
    {
      accessorKey: 'pageName',
      header: 'Target Page Name',
      cell: ({ row }) => (
        <span className="text-xs font-black uppercase tracking-widest text-pink-700 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400 px-2.5 py-1 rounded-full">
          {row.original.pageName}
        </span>
      ),
    },
    {
      accessorKey: 'scriptCode',
      header: 'Script Content',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-mono italic truncate max-w-[500px] block">
          {row.original.scriptCode ? \`\${row.original.scriptCode.substring(0, 80)}...\` : 'No script'}
        </span>
      ),
    },
  ];

  return {
    configs,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    loadConfigs,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useSeoConfigs } from '@/hooks/use-seo-configs';

export default function SeoSettingsPage() {
  const {
    configs,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
  } = useSeoConfigs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">SEO Management</h1>
          <p className="text-slate-500 text-sm mt-1">Configure header scripts and tracking pixels per page.</p>
        </div>
      </div>

      <CrudTable
        data={configs}
        columns={columns}
        searchKey="seo"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
`
  },

  // 10. FLASH SALES LIST
  {
    name: 'useFlashSales',
    hookFile: 'hooks/use-flash-sales.tsx',
    pageFile: 'app/admin/flash-sales/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { FlashSaleService, FlashSale } from '@/services/flash-sale.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useFlashSales() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(false);

  const fetchFlashSales = async () => {
    try {
      setIsLoading(true);
      const response = await FlashSaleService.getAll();
      setFlashSales((response as any).content || response);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch flash sales', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchFlashSales();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this flash sale?')) return;
    try {
      await FlashSaleService.delete(id);
      toast({ title: 'Success', description: 'Flash sale deleted' });
      fetchFlashSales();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete flash sale', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<FlashSale>[] = [
    {
      accessorKey: 'name',
      header: 'Campaign Name',
      cell: ({ row }) => <span className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors uppercase">{row.original.name}</span>
    },
    {
      accessorKey: 'startTime',
      header: 'Start Time',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.startTime).toLocaleString()}
        </div>
      )
    },
    {
      accessorKey: 'endTime',
      header: 'End Time',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.endTime).toLocaleString()}
        </div>
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

  const handleToggleStatus = async (flashSale: FlashSale) => {
    try {
      await FlashSaleService.update(flashSale.id!, { ...flashSale, isActive: !flashSale.isActive });
      toast({ title: 'Success', description: 'Flash sale status updated' });
      fetchFlashSales();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleAdd = () => router.push('/admin/flash-sales/new');
  const handleEdit = (item: FlashSale) => router.push(\`/admin/flash-sales/\${item.id}\`);

  return {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete: (item: FlashSale) => handleDelete(item.id!),
    handleToggleStatus,
    fetchFlashSales,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Zap } from 'lucide-react';
import { useFlashSales } from '@/hooks/use-flash-sales';

export default function FlashSalesPage() {
  const {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useFlashSales();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Flash Sale Campaigns</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage time-limited discounts and stock counters.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={flashSales}
        columns={columns}
        searchKey="flash-sales"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 11. FLASH SALES MOBILE LIST
  {
    name: 'useMobileFlashSales',
    hookFile: 'hooks/use-mobile-flash-sales.tsx',
    pageFile: 'app/admin/flash-sales/mobile/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { FlashSaleService } from '@/services/flash-sale.service';
import { FlashSale } from '@/types/flash-sale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useMobileFlashSales() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(false);

  const fetchFlashSales = async () => {
    try {
      setIsLoading(true);
      const response = await FlashSaleService.getByPlatform('MOBILE');
      setFlashSales(Array.isArray(response) ? response : (response as any).content || []);
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data flash sale', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchFlashSales();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus flash sale ini?')) return;
    try {
      await FlashSaleService.delete(id);
      toast({ title: 'Berhasil', description: 'Flash sale dihapus' });
      fetchFlashSales();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (flashSale: FlashSale) => {
    try {
      await FlashSaleService.update(flashSale.id!, { ...flashSale, isActive: !flashSale.isActive });
      toast({ title: 'Berhasil', description: 'Status diupdate' });
      fetchFlashSales();
    } catch {
      toast({ title: 'Error', description: 'Gagal update status', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<FlashSale>[] = [
    {
      accessorKey: 'name',
      header: 'Campaign Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white uppercase">{row.original.name}</span>
          <span className="text-[10px] text-slate-400">{row.original.items?.length || 0} produk terdaftar</span>
        </div>
      )
    },
    {
      accessorKey: 'startTime',
      header: 'Periode Mulai',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <Calendar className="h-3.5 w-3.5 text-pink-500" />
          {row.original.startTime ? new Date(row.original.startTime).toLocaleString('id-ID') : '-'}
        </div>
      )
    },
    {
      accessorKey: 'endTime',
      header: 'Periode Berakhir',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <Calendar className="h-3.5 w-3.5 text-rose-500" />
          {row.original.endTime ? new Date(row.original.endTime).toLocaleString('id-ID') : '-'}
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'pink' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      )
    }
  ];

  const handleAdd = () => router.push('/admin/flash-sales/new?platform=MOBILE');
  const handleEdit = (item: FlashSale) => router.push(\`/admin/flash-sales/mobile/\${item.id}\`);

  return {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete: (item: FlashSale) => handleDelete(item.id!),
    handleToggleStatus,
    fetchFlashSales,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Smartphone } from 'lucide-react';
import { useMobileFlashSales } from '@/hooks/use-mobile-flash-sales';

export default function FlashSaleMobilePage() {
  const {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useMobileFlashSales();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Flash Sale — Aplikasi Mobile</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola kampanye flash sale yang tampil di strip horizontal home aplikasi mobile.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={flashSales}
        columns={columns}
        searchKey="flash-sales-mobile"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 12. FLASH SALES WEB LIST
  {
    name: 'useWebFlashSales',
    hookFile: 'hooks/use-web-flash-sales.tsx',
    pageFile: 'app/admin/flash-sales/web/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { FlashSaleService } from '@/services/flash-sale.service';
import { FlashSale } from '@/types/flash-sale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useWebFlashSales() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(false);

  const fetchFlashSales = async () => {
    try {
      setIsLoading(true);
      const response = await FlashSaleService.getByPlatform('WEB');
      setFlashSales(Array.isArray(response) ? response : (response as any).content || []);
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data flash sale', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchFlashSales();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus flash sale ini?')) return;
    try {
      await FlashSaleService.delete(id);
      toast({ title: 'Berhasil', description: 'Flash sale dihapus' });
      fetchFlashSales();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (flashSale: FlashSale) => {
    try {
      await FlashSaleService.update(flashSale.id!, { ...flashSale, isActive: !flashSale.isActive });
      toast({ title: 'Berhasil', description: 'Status diupdate' });
      fetchFlashSales();
    } catch {
      toast({ title: 'Error', description: 'Gagal update status', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<FlashSale>[] = [
    {
      accessorKey: 'name',
      header: 'Campaign Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white uppercase">{row.original.name}</span>
          <span className="text-[10px] text-slate-400">{row.original.items?.length || 0} produk terdaftar</span>
        </div>
      )
    },
    {
      accessorKey: 'startTime',
      header: 'Periode Mulai',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <Calendar className="h-3.5 w-3.5 text-pink-500" />
          {row.original.startTime ? new Date(row.original.startTime).toLocaleString('id-ID') : '-'}
        </div>
      )
    },
    {
      accessorKey: 'endTime',
      header: 'Periode Berakhir',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <Calendar className="h-3.5 w-3.5 text-rose-500" />
          {row.original.endTime ? new Date(row.original.endTime).toLocaleString('id-ID') : '-'}
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'pink' : 'secondary'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-widest">
          {row.original.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      )
    }
  ];

  const handleAdd = () => router.push('/admin/flash-sales/new?platform=WEB');
  const handleEdit = (item: FlashSale) => router.push(\`/admin/flash-sales/web/\${item.id}\`);

  return {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete: (item: FlashSale) => handleDelete(item.id!),
    handleToggleStatus,
    fetchFlashSales,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Monitor } from 'lucide-react';
import { useWebFlashSales } from '@/hooks/use-web-flash-sales';

export default function FlashSaleWebPage() {
  const {
    flashSales,
    isLoading,
    columns,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useWebFlashSales();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Monitor className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Flash Sale — Website Storefront</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola kampanye flash sale yang tampil di homepage website lengkap dengan countdown timer.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={flashSales}
        columns={columns}
        searchKey="flash-sales-web"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 13. CUSTOMERS LIST
  {
    name: 'useCustomers',
    hookFile: 'hooks/use-customers.tsx',
    pageFile: 'app/admin/customers/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { UserService, User } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Mail, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function useCustomers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await UserService.getAll(0, 100);
      setUsers(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch customers', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const customers = users.filter(u => 
    (u.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())) &&
    u.roles.some((r: any) => r.name === 'ROLE_USER')
  );

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'fullName',
      header: 'Customer Profile',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold shrink-0">
            {row.original.fullName?.charAt(0) || <UserCircle className="h-5 w-5" />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.fullName || 'Anonymous'}</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
              <Mail className="h-3 w-3" /> {row.original.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
          <Calendar size={14} className="text-slate-400" />
          {row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy') : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          className={row.original.isActive 
            ? 'bg-emerald-100 text-emerald-600 border-emerald-200 font-bold text-[9px] py-0.5 px-2.5 rounded-full uppercase' 
            : 'bg-slate-100 text-slate-600 border-slate-200 font-bold text-[9px] py-0.5 px-2.5 rounded-full uppercase'
          }
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Access Level',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role: any) => (
            <Badge key={role.id} variant="secondary" className="rounded-lg px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-slate-50 border-slate-100">
               {role.name}
            </Badge>
          ))}
        </div>
      )
    }
  ];

  return {
    users,
    customers,
    isLoading,
    search,
    setSearch,
    columns,
    fetchUsers,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { UserCircle, Users } from 'lucide-react';
import { useCustomers } from '@/hooks/use-customers';

export default function CustomersPage() {
  const {
    customers,
    isLoading,
    columns,
  } = useCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Customer Database</h1>
          <p className="text-slate-500 text-sm mt-0.5">Explore active users and buyer profiles registered on your platform.</p>
        </div>
      </div>

      <CrudTable
        data={customers}
        columns={columns}
        searchKey="customers"
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 14. ORDERS LIST
  {
    name: 'useOrders',
    hookFile: 'hooks/use-orders.tsx',
    pageFile: 'app/admin/orders/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { OrderService } from '@/services/order.service';
import { Order, OrderStatus } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, Truck, XCircle, Package, AlertCircle, RefreshCcw } from 'lucide-react';

const STATUS_CONFIG: Partial<Record<OrderStatus, { label: string, color: string, icon: any }>> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  PAID: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  PROCESSING: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Clock },
  DELIVERING: { label: 'Delivering', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  COMPLETED: { label: 'Completed', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', icon: Package },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
  COMPLAINT: { label: 'Complaint', color: 'bg-amber-50 text-amber-600', icon: AlertCircle },
  RETURNED: { label: 'Returned', color: 'bg-slate-100 text-slate-600', icon: RefreshCcw },
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await OrderService.getAll();
      setOrders(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch orders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchOrders();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.orderNumber}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => <span>{row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => <span className="font-bold">Rp {(row.original.totalAmount || row.original.total || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const config = STATUS_CONFIG[row.original.status] || STATUS_CONFIG.PENDING || { 
          label: 'Pending', 
          color: 'bg-amber-100 text-amber-700', 
          icon: Clock 
        };
        return (
          <span className={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold \${config.color}\`}>
            <config.icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        );
      },
    },
  ];

  const handleView = (order: Order) => router.push(\`/admin/orders/\${order.id}\`);

  return {
    orders,
    isLoading,
    columns,
    handleView,
    fetchOrders,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { useOrders } from '@/hooks/use-orders';

export default function OrdersPage() {
  const {
    orders,
    isLoading,
    columns,
    handleView,
  } = useOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and manage customer transactions.</p>
        </div>
      </div>

      <CrudTable
        data={orders}
        columns={columns}
        searchKey="orders"
        onView={handleView}
        hasActions={true}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 15. PRODUCTS LIST
  {
    name: 'useProducts',
    hookFile: 'hooks/use-products.tsx',
    pageFile: 'app/admin/products/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { useToast } from '@/hooks/use-toast';
import { formatImageUrl } from '@/lib/url-utils';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [selectedProductToPush, setSelectedProductToPush] = useState<Product | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await ProductService.getAll();
      setProducts(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchProducts();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleToggleStatus = async (product: Product) => {
    try {
      const updatedProduct = { 
        ...product, 
        isActive: !product.isActive 
      };
      
      await ProductService.update(product.id, updatedProduct as any);
      
      toast({ 
        title: 'Status Updated', 
        description: \`\${product.name} is now \${!product.isActive ? 'Active' : 'Inactive'}\` 
      });
      fetchProducts();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl || (row.original.images && row.original.images.length > 0 ? row.original.images[0] : null);
        
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 group">
              {imageUrl ? (
                <img src={formatImageUrl(imageUrl)} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 text-[10px] font-bold">No Img</div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.name}</span>
              <span className="text-xs text-slate-500">{row.original.category?.name || 'Uncategorized'}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.original.variants?.[0]?.price || row.original.price || 0;
        return <span className="font-bold">Rp {price.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: 'qty',
      header: 'Stock',
      cell: ({ row }) => {
        const stock = row.original.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || row.original.qty || 0;
        return (
          <span className={\`font-bold \${stock < 10 ? 'text-red-500' : 'text-slate-600'}\`}>
            {stock} units
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={\`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider \${row.original.isActive
            ? 'bg-pink-100 text-pink-700'
            : 'bg-slate-100 text-slate-700'
          }\`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleAdd = () => router.push('/admin/products/new');
  const handleEdit = (product: Product) => router.push(\`/admin/products/\${product.id}\`);

  const handleDelete = async (product: Product) => {
    if (confirm(\`Are you sure you want to delete \${product.name}?\`)) {
      try {
        await ProductService.delete(product.id);
        toast({ title: 'Success', description: 'Product deleted' });
        fetchProducts();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
      }
    }
  };

  const handlePushToMarketplace = (product: Product) => {
    setSelectedProductToPush(product);
    setPushModalOpen(true);
  };

  const handleHistory = (product: Product) => {
    router.push(\`/admin/stock?search=\${encodeURIComponent(product.name)}\`);
  };

  return {
    products,
    categories,
    isLoading,
    columns,
    pushModalOpen,
    setPushModalOpen,
    selectedProductToPush,
    handleAdd,
    handleEdit,
    handleToggleStatus,
    handleDelete,
    handlePushToMarketplace,
    handleHistory,
    fetchProducts,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { PushMarketplaceModal } from '@/components/admin/PushMarketplaceModal';
import { useProducts } from '@/hooks/use-products';

export default function ProductsPage() {
  const {
    products,
    isLoading,
    columns,
    pushModalOpen,
    setPushModalOpen,
    selectedProductToPush,
    handleAdd,
    handleEdit,
    handleToggleStatus,
    handleDelete,
    handlePushToMarketplace,
    handleHistory,
  } = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your inventory, prices and variants.</p>
        </div>
      </div>

      <CrudTable
        data={products}
        columns={columns}
        searchKey="products"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        onPush={handlePushToMarketplace}
        onHistory={handleHistory}
        isLoading={isLoading}
      />
      <PushMarketplaceModal
        isOpen={pushModalOpen}
        onClose={() => setPushModalOpen(false)}
        product={selectedProductToPush}
      />
    </div>
  );
}
`
  },

  // 16. DIGITAL PRODUCTS LIST
  {
    name: 'useDigitalProducts',
    hookFile: 'hooks/use-digital-products.tsx',
    pageFile: 'app/admin/products/digital/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { digitalProductService, DigitalProduct } from '@/services/digital-product.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Zap, Gamepad, CreditCard } from 'lucide-react';

export function useDigitalProducts() {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const { toast } = useToast();
  const isMounted = useRef(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await digitalProductService.getAllProducts();
      setProducts(res);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch digital products', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchProducts();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleSyncProducts = async (type: 'prepaid' | 'pasca') => {
    setIsSyncing(type);
    toast({ title: 'Syncing', description: \`Syncing \${type} products from Digiflazz...\` });
    try {
      await digitalProductService.syncProducts(type);
      toast({ title: 'Success', description: \`Successfully triggered \${type} product sync. Please wait a moment and refresh.\` });
      setTimeout(fetchProducts, 3000);
    } catch (error) {
      toast({ title: 'Error', description: \`Failed to sync \${type} products\`, variant: 'destructive' });
    } finally {
      setIsSyncing(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('pulsa') || cat.includes('data')) return <Smartphone className="h-4 w-4" />;
    if (cat.includes('pln') || cat.includes('listrik')) return <Zap className="h-4 w-4" />;
    if (cat.includes('game') || cat.includes('voucher')) return <Gamepad className="h-4 w-4" />;
    return <CreditCard className="h-4 w-4" />;
  };

  const columns: ColumnDef<DigitalProduct>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {row.original.sku}
        </span>
      ),
    },
    {
      accessorKey: 'productName',
      header: 'Product Name',
      cell: ({ row }) => (
        <div className="font-medium max-w-xs truncate" title={row.original.productName}>
          {row.original.productName}
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          {getCategoryIcon(row.original.category)}
          <span>{row.original.category}</span>
        </div>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => <span>{row.original.brand}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price / Fee',
      cell: ({ row }) => (
        <div className="font-medium text-emerald-600 dark:text-emerald-400">
          Rp {row.original.price?.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'buyerSkuCode',
      header: 'Digiflazz SKU',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-mono">
          {row.original.buyerSkuCode}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = (row.original as any).status || 'Active';
        return (
          <Badge variant={status === 'active' ? 'success' : 'secondary'}>
            {status}
          </Badge>
        );
      },
    },
  ];

  return {
    products,
    isLoading,
    isSyncing,
    columns,
    handleSyncProducts,
    fetchProducts,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Button } from '@/components/ui/button';
import { Smartphone, RefreshCw } from 'lucide-react';
import { useDigitalProducts } from '@/hooks/use-digital-products';

export default function DigitalProductsPage() {
  const {
    products,
    isLoading,
    isSyncing,
    columns,
    handleSyncProducts,
  } = useDigitalProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-pink-600" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Digital Products (PPOB)</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">Manage Pulsa, Data, PLN Tokens, Game Vouchers synced from Digiflazz.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSyncProducts('prepaid')}
            disabled={isSyncing !== null}
            className="flex items-center gap-2 border-slate-200"
          >
            <RefreshCw className={\`h-4 w-4 \${isSyncing === 'prepaid' ? 'animate-spin' : ''}\`} />
            Sync Prepaid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSyncProducts('pasca')}
            disabled={isSyncing !== null}
            className="flex items-center gap-2 border-slate-200"
          >
            <RefreshCw className={\`h-4 w-4 \${isSyncing === 'pasca' ? 'animate-spin' : ''}\`} />
            Sync Postpaid
          </Button>
        </div>
      </div>

      <CrudTable
        data={products}
        columns={columns}
        searchKey="sku"
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 17. STOCK MASTER LIST
  {
    name: 'useStock',
    hookFile: 'hooks/use-stock.tsx',
    pageFile: 'app/admin/stock/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { formatImageUrl } from '@/lib/url-utils';

export function useStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await ProductService.getAll(0, 100);
      setProducts(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch stock data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Master Product',
      cell: ({ row }) => {
        const product = row.original;
        const imageUrl = product.imageUrl || (product.images?.[0]);
        const fullImageUrl = formatImageUrl(imageUrl);
        
        return (
          <div className="flex items-center gap-4 py-1">
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
              {fullImageUrl ? (
                <img src={fullImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-300"><Package size={20} /></div>
              )}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{product.name}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">{product.category?.name || 'Category'}</div>
            </div>
          </div>
        );
      }
    },
    {
      id: 'variants_count',
      header: 'Variants',
      cell: ({ row }) => <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{row.original.variants?.length || 0} Variants</span>
    },
    {
      id: 'total_stock',
      header: 'Total Stock',
      cell: ({ row }) => {
        const totalStock = row.original.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
        return (
          <div className="flex flex-col">
            <span className={\`text-lg font-bold \${totalStock < 10 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}\`}>
              {totalStock}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={\`px-3 py-1 rounded-full text-[10px] font-bold uppercase \${row.original.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}\`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const handleManage = (product: Product) => {
    router.push(\`/admin/stock/\${product.id}\`);
  };

  return {
    products,
    isLoading,
    columns,
    handleManage,
    fetchProducts,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Button } from '@/components/ui/button';
import { Package, History } from 'lucide-react';
import Link from 'next/link';
import { useStock } from '@/hooks/use-stock';

export default function StockManagementPage() {
  const {
    products,
    isLoading,
    columns,
    handleManage,
  } = useStock();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <Package className="h-8 w-8 text-pink-500" />
            Inventory & Stock
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time overview of current warehouse inventory and variant counts.</p>
        </div>

        <Link href="/admin/stock/history">
          <Button variant="outline" className="rounded-2xl border-slate-200 font-bold gap-2">
            <History className="h-4 w-4" /> View Transaction Logs
          </Button>
        </Link>
      </div>

      <CrudTable
        data={products}
        columns={columns}
        searchKey="name"
        onEdit={handleManage}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 18. STOCK HISTORY LIST
  {
    name: 'useStockHistory',
    hookFile: 'hooks/use-stock-history.tsx',
    pageFile: 'app/admin/stock/history/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StockTransactionService, StockTransaction } from '@/services/stock-transaction.service';

export function useStockHistory() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [history, setHistory] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const page = parseInt(searchParams.get('page') || '0');
  const query = searchParams.get('query') || '';

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await StockTransactionService.getHistory(query, page, 10);
      setHistory(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, query]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('query') as string;
    const params = new URLSearchParams(searchParams);
    params.set('query', q);
    params.set('page', '0');
    router.push(\`?\${params.toString()}\`);
  };

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(\`?\${params.toString()}\`);
  };

  return {
    history,
    isLoading,
    totalElements,
    totalPages,
    page,
    query,
    handleSearch,
    setPage,
    fetchHistory,
  };
}
`,
    pageCode: `'use client';

import { Suspense } from 'react';
import { History, Search, ArrowLeft, Calendar, User, Tag, FileText, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useStockHistory } from '@/hooks/use-stock-history';

function StockHistoryContent() {
  const {
    history,
    isLoading,
    totalElements,
    totalPages,
    page,
    query,
    handleSearch,
    setPage,
  } = useStockHistory();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/stock" className="text-pink-500 hover:text-pink-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Inventory Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
            <History className="h-10 w-10 text-pink-500" />
            Transaction Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Audit trail of every stock addition, adjustment, and movement.</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              name="query"
              defaultValue={query}
              placeholder="Search by SKU or Product..." 
              className="pl-12 h-12 rounded-2xl bg-white shadow-sm border-slate-200 focus:ring-pink-500"
            />
          </div>
          <Button type="submit" className="h-12 px-6 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 font-bold shadow-lg shadow-pink-500/20">
            Search
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Date & Time</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">SKU / Product</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Type</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Change</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Balance</th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400">Notes & Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">No stock movement recorded yet.</td>
                    </tr>
                  ) : (
                    history.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-xs">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(tx.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{tx.variant?.product?.name || 'Product'}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Tag size={12} className="text-pink-500" />
                              <span className="text-xs font-mono font-semibold text-slate-500">{tx.variant?.sku}</span>
                              <span className="text-xs text-slate-400">• {tx.variant?.size || '-'} / {tx.variant?.color || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="font-black text-[10px] tracking-wider uppercase rounded-lg px-2.5 py-1">
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className={\`font-black flex items-center gap-1 \${tx.quantityChange > 0 ? 'text-emerald-500' : 'text-rose-500'}\`}>
                            {tx.quantityChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {tx.quantityChange > 0 ? \`+\${tx.quantityChange}\` : tx.quantityChange}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">
                          {tx.finalStock}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {tx.notes && <div className="flex items-center gap-1 italic mb-0.5"><FileText size={12} /> {tx.notes}</div>}
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <User size={10} /> Operator ID: {tx.operatorId || 'System'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <span className="text-xs text-slate-500 font-medium">Total {totalElements} movements logged</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 0}
                className="h-9 rounded-xl border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold text-slate-600">Page {page + 1} of {Math.max(totalPages, 1)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="h-9 rounded-xl border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StockHistoryPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading history...</div>}>
      <StockHistoryContent />
    </Suspense>
  );
}
`
  },

  // 19. NOTIFICATIONS LIST
  {
    name: 'useNotifications',
    hookFile: 'hooks/use-notifications.tsx',
    pageFile: 'app/admin/notifications/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, User, Globe } from 'lucide-react';
import { NotificationService, NotificationHistory } from '@/services/notification.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await NotificationService.getAll();
      setNotifications(response.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch notifications', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear your notification history?')) return;
    try {
      await NotificationService.clearAll();
      toast({ title: 'Success', description: 'Notification history cleared' });
      fetchNotifications();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear history', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<NotificationHistory>[] = [
    {
      accessorKey: 'title',
      header: 'Notification',
      cell: ({ row }) => (
        <div className="flex flex-col max-w-[300px]">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{row.original.title}</span>
          <span className="text-xs text-slate-500 line-clamp-1">{row.original.body}</span>
        </div>
      )
    },
    {
      accessorKey: 'userId',
      header: 'Target',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.userId ? (
            <Badge variant="secondary" className="gap-1 rounded-full font-bold uppercase text-[10px]">
              <User className="h-3 w-3" />
              UID: {row.original.userId}
            </Badge>
          ) : (
            <Badge variant="pink" className="gap-1 rounded-full font-bold uppercase text-[10px]">
              <Globe className="h-3 w-3" />
              GLOBAL
            </Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Sent At',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.createdAt).toLocaleString()}
        </div>
      )
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-full font-black uppercase text-[9px] tracking-widest px-2">
          {row.original.type || 'SYSTEM'}
        </Badge>
      )
    }
  ];

  const handleAdd = () => {
    router.push('/admin/notifications/new');
  };

  return {
    notifications,
    isLoading,
    columns,
    handleAdd,
    handleClear,
    fetchNotifications,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Button } from '@/components/ui/button';
import { Bell, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    columns,
    handleAdd,
    handleClear,
  } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Push Notifications</h1>
            <p className="text-slate-500 text-sm mt-0.5">Send targeted or broadcast push alerts directly to your mobile users.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleClear} 
            variant="outline" 
            className="rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest gap-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          >
            <Trash2 className="h-4 w-4" />
            Clear Log
          </Button>
        </div>
      </div>

      <CrudTable
        data={notifications}
        columns={columns}
        searchKey="notifications"
        onAdd={handleAdd}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 20. USERS MANAGEMENT LIST
  {
    name: 'useUsers',
    hookFile: 'hooks/use-users.tsx',
    pageFile: 'app/admin/users/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState, useRef } from 'react';
import { UserCircle, Mail } from 'lucide-react';
import { UserService, User } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(false);

  // Edit State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [taskGroup, setTaskGroup] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await UserService.getAll(0, 50);
      setUsers(res.content || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    fetchUsers();
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await UserService.updateRolesAndGroups(selectedUser.id, { 
        taskGroup, 
        roleNames: selectedUser.roles.map((r: any) => r.name) 
      });
      toast({ title: 'Success', description: 'User permissions updated' });
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())) &&
    !u.roles.some((r: any) => r.name === 'ROLE_USER')
  );

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'fullName',
      header: 'User Profile',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
            <UserCircle size={20} className="text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
              {row.original.fullName || 'Anonymous'}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
              <Mail className="h-3 w-3" /> {row.original.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'taskGroup',
      header: 'Assigned Role',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs uppercase px-2.5 py-1 rounded-full">
          {row.original.taskGroup || 'General Staff'}
        </Badge>
      )
    },
    {
      accessorKey: 'roles',
      header: 'System Roles',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role: any) => (
            <Badge key={role.id} variant="secondary" className="rounded-lg px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-slate-50 border-slate-100">
               {role.name}
            </Badge>
          ))}
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          className={row.original.isActive 
            ? 'bg-emerald-100 text-emerald-600 border-emerald-200 font-bold text-[9px] py-0.5 px-2.5 rounded-full uppercase' 
            : 'bg-slate-100 text-slate-600 border-slate-200 font-bold text-[9px] py-0.5 px-2.5 rounded-full uppercase'
          }
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    }
  ];

  const handleEdit = (user: User) => {
    router.push(\`/admin/users/\${user.id}\`);
  };

  const handleAdd = () => {
    router.push('/admin/users/new');
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await UserService.update(user.id, { ...user, isActive: !user.isActive });
      toast({ title: 'Success', description: 'Status updated' });
      fetchUsers();
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return {
    users,
    filteredUsers,
    isLoading,
    search,
    setSearch,
    columns,
    selectedUser,
    setSelectedUser,
    taskGroup,
    setTaskGroup,
    isSaving,
    handleUpdateUser,
    handleEdit,
    handleAdd,
    handleToggleStatus,
    fetchUsers,
  };
}
`,
    pageCode: `'use client';

import { CrudTable } from '@/components/admin/crud-table';
import { Users } from 'lucide-react';
import { useUsers } from '@/hooks/use-users';

export default function UserManagementPage() {
  const {
    filteredUsers,
    isLoading,
    columns,
    handleEdit,
    handleAdd,
    handleToggleStatus,
  } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Staff & Administrative Roles</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage permissions and assign operational tasks to administrators.</p>
          </div>
        </div>
      </div>

      <CrudTable
        data={filteredUsers}
        columns={columns}
        searchKey="users"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
}
`
  },

  // 21. CONTENT MOBILE [TYPE] LIST
  {
    name: 'useMobileContentItems',
    hookFile: 'hooks/use-mobile-content-items.ts',
    pageFile: 'app/admin/content/mobile/[type]/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentService } from '@/services/content.service';
import { ContentItem } from '@/types/content';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';

const TYPE_LABELS: Record<string, { label: string; description: string }> = {
  MOBILE_PROMO:     { label: 'Promo Carousel',       description: 'Banner slideshow gradient di home app mobile' },
  FLASH_SALE_MOBILE:{ label: 'Flash Sale Mobile',     description: 'Strip ProductCard diskon di home mobile' },
  TRENDING_LIST:    { label: 'Trending Now',          description: 'Kartu trending horizontal dengan foto & kategori' },
  FEATURED_MOBILE:  { label: 'Featured Products',     description: '2-column grid produk unggulan di mobile' },
};

export function useMobileContentItems(type: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const typeInfo = TYPE_LABELS[type] || { label: type, description: 'Mobile storefront items' };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await ContentService.getItemsByType(type, 'MOBILE', false);
      setItems(data);
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data item', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus item ini?')) return;
    try {
      await ContentService.deleteItem(id);
      toast({ title: 'Berhasil', description: 'Item dihapus' });
      fetchItems();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus item', variant: 'destructive' });
    }
  };

  const handleAdd = () => {
    router.push(\`/admin/content/mobile/\${type}/new\`);
  };

  const handleEdit = (item: ContentItem) => {
    router.push(\`/admin/content/mobile/\${type}/\${item.id}\`);
  };

  return {
    items,
    isLoading,
    typeInfo,
    handleAdd,
    handleEdit,
    handleDelete,
    fetchItems,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
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
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/mobile">
            <Button variant="ghost" size="icon" className="rounded-2xl border border-slate-200">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-black uppercase text-pink-600 border-pink-200 bg-pink-50">
                <Smartphone size={10} className="mr-1" /> Mobile
              </Badge>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{typeInfo.label}</h1>
            </div>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">{typeInfo.description}</p>
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
`
  },

  // 22. CONTENT WEB [TYPE] LIST
  {
    name: 'useWebContentItems',
    hookFile: 'hooks/use-web-content-items.ts',
    pageFile: 'app/admin/content/web/[type]/page.tsx',
    hookCode: `'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentService } from '@/services/content.service';
import { ContentItem } from '@/types/content';
import { useToast } from '@/hooks/use-toast';

const TYPE_LABELS: Record<string, { label: string; description: string }> = {
  HERO_CAROUSEL:       { label: 'Hero Carousel',         description: 'Banner slideshow utama homepage web' },
  FLASH_SALE_WEB:      { label: 'Flash Sale Web',         description: 'Promo kilat dengan countdown timer di web' },
  FEATURED_PRODUCTS:   { label: 'Featured Products Web',  description: 'Grid produk unggulan dengan tab filter' },
  RECOMMENDED_PRODUCTS:{ label: 'Recommendations Web',    description: 'Carousel rekomendasi produk horizontal' },
  SHOP_THE_LOOK:       { label: 'Shop the Look',          description: 'Grid foto social-style hover produk' },
  BRANDS_SECTION:      { label: 'Brands Section',         description: 'Marquee logo brand partner di web' },
  TESTIMONIALS:        { label: 'Testimonials',           description: 'Grid ulasan pelanggan di homepage' },
  DEALS:               { label: 'Exclusive Deals',        description: 'Banner penawaran khusus atau diskon musiman' },
  NEWSLETTER:          { label: 'Newsletter',             description: 'Item konfigurasi newsletter' },
};

export function useWebContentItems(type: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const typeInfo = TYPE_LABELS[type] || { label: type, description: 'Web storefront items' };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await ContentService.getItemsByType(type, 'WEB', false);
      setItems(data);
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data item', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus item ini?')) return;
    try {
      await ContentService.deleteItem(id);
      toast({ title: 'Berhasil', description: 'Item dihapus' });
      fetchItems();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus item', variant: 'destructive' });
    }
  };

  const handleAdd = () => {
    router.push(\`/admin/content/web/\${type}/new\`);
  };

  const handleEdit = (item: ContentItem) => {
    router.push(\`/admin/content/web/\${type}/\${item.id}\`);
  };

  return {
    items,
    isLoading,
    typeInfo,
    handleAdd,
    handleEdit,
    handleDelete,
    fetchItems,
  };
}
`,
    pageCode: `'use client';

import { use } from 'react';
import { FileJson, ArrowLeft, Layout, Plus, Monitor } from 'lucide-react';
import { ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useWebContentItems } from '@/hooks/use-web-content-items';

interface PageProps {
  params: Promise<{ type: string }>;
}

export default function WebContentTypeListPage({ params }: PageProps) {
  const { type } = use(params);
  const {
    items,
    isLoading,
    typeInfo,
    handleAdd,
    handleEdit,
    handleDelete,
  } = useWebContentItems(type);

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
            <div className="h-10 w-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 flex-shrink-0">
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
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/web">
            <Button variant="ghost" size="icon" className="rounded-2xl border border-slate-200">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-black uppercase text-blue-600 border-blue-200 bg-blue-50">
                <Monitor size={10} className="mr-1" /> Web Storefront
              </Badge>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{typeInfo.label}</h1>
            </div>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">{typeInfo.description}</p>
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
`
  }
];

module.exports = { crudListGenerators };
