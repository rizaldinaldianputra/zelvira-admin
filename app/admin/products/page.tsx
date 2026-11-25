'use client';

import React, { useState, useMemo } from 'react';
import { CrudTable } from '@/components/admin/crud-table';
import { PushMarketplaceModal } from '@/components/admin/PushMarketplaceModal';
import { useProducts } from '@/hooks/use-products';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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
    fetchProducts,
  } = useProducts();

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Extract unique categories for filter chips
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search by name or SKU
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.variants?.some((v) => v.sku && v.sku.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory =
        selectedCategory === 'ALL' ||
        (p.category?.name && p.category.name.toLowerCase() === selectedCategory.toLowerCase());

      // Status filter
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && p.isActive) ||
        (selectedStatus === 'INACTIVE' && !p.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-6 pb-28 relative min-h-screen">
      {/* Top Header & Visual Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Master Katalog Produk
              </h1>
              <Badge variant="outline" className="border-pink-300 text-pink-600 bg-pink-50 text-[10px] font-bold">
                {products.length} Master Produk
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola master katalog, harga varian, dan stok yang terhubung langsung ke API Zelvira.
            </p>
          </div>
        </div>

        {/* Action Controls */}
       
      </div>

      {/* Search & Category Chips Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk, kode SKU, atau varian..."
              className="pl-10 text-xs rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 font-bold h-11 w-full sm:w-auto shadow-xs"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Hanya Aktif</option>
            <option value="INACTIVE">Hanya Nonaktif</option>
          </select>
        </div>

        {/* Category Filter Chips */}
        {categoriesList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50'
                }`}
            >
              Semua ({products.length})
            </button>

            {categoriesList.map((catName) => {
              const count = products.filter((p) => p.category?.name === catName).length;
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${selectedCategory === catName
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50'
                    }`}
                >
                  {catName} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CRUD TABLE VIEW ONLY */}
      <CrudTable
        data={filteredProducts}
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

      {/* Push Marketplace Modal Dialog */}
      <PushMarketplaceModal
        isOpen={pushModalOpen}
        onClose={() => setPushModalOpen(false)}
        product={selectedProductToPush}
      />
    </div>
  );
}
