'use client';

import { 
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import ContentUnifiedList from '@/components/admin/ContentUnifiedList';

export default function ContentManagementPage() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner flex-shrink-0">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Content Storefront Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola seluruh banner promosi, kurasi produk, dan konten visual untuk Website & Aplikasi Mobile.</p>
          </div>
        </div>
      </div>

      {/* Unified List */}
      <div className="px-4 pb-20">
        <ContentUnifiedList />
      </div>
    </div>
  );
}
