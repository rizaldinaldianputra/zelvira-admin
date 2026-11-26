'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProductService } from '@/services/product.service';
import { CategoryService } from '@/services/category.service';
import { BrandService } from '@/services/brand.service';
import { Category } from '@/types/category';
import { Brand } from '@/types/brand';
import { toast } from '@/hooks/use-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const variantDetailSchema = z.object({
  id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number().optional()
  ),
  sku: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  hexColor: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  discountPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional().nullable(),
});

export const variantGroupSchema = z.object({
  groupName: z.string().min(1, 'Group Name / Model is required'),
  details: z.array(variantDetailSchema).min(1, 'At least 1 variant item is required per group'),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  sku: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  brandId: z.coerce.number().min(1, 'Please select a brand'),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).default('UNISEX'),
  weight: z.coerce.number().min(1, 'Weight must be at least 1 gram').default(500),
  isActive: z.boolean().default(true),
  thumbnailUrl: z.string().optional(),
  banners: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).default([]),
  variantGroups: z.array(variantGroupSchema).min(1, 'At least one variant group is required'),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export function useProductForm(id: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const isNew = id === 'new';
  const loadedIdRef = useRef<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      description: '',
      categoryId: 1,
      brandId: 1,
      gender: 'UNISEX',
      weight: 500,
      isActive: true,
      thumbnailUrl: '',
      banners: [],
      imageUrl: '',
      images: [],
      variantGroups: [
        {
          groupName: 'Regular Style',
          details: [
            {
              sku: '',
              size: 'All Size',
              color: 'Standard',
              hexColor: '#1e293b',
              price: 150000,
              discountPrice: 0,
              stock: 10,
              isActive: true,
              imageUrl: '',
            },
          ],
        },
      ],
    },
  });

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control: form.control,
    name: 'variantGroups',
  });

  useEffect(() => {
    // Only load if not already loaded for this id
    if (loadedIdRef.current === id) return;
    loadedIdRef.current = id;

    let isMounted = true;

    const loadData = async () => {
      try {
        const [cats, brs] = await Promise.all([
          CategoryService.getAll(),
          BrandService.getAll(),
        ]);
        if (!isMounted) return;
        setCategories(cats.content || []);
        setBrands(brs.content || []);

        if (!isNew) {
          const product = await ProductService.getById(Number(id));
          if (!isMounted) return;
          if (product) {
            let loadedGroups: Array<{ groupName: string; details: any[] }> = [];

            if (product.variants && product.variants.length > 0) {
              const activeVariants = product.variants.filter((v: any) => v.isActive !== false);
              const groupMap = new Map<string, any[]>();
              for (const v of activeVariants) {
                const gName = v.groupName && v.groupName.trim() ? v.groupName.trim() : 'Default Style';
                if (!groupMap.has(gName)) {
                  groupMap.set(gName, []);
                }
                groupMap.get(gName)!.push({
                  id: v.id,
                  sku: v.sku || '',
                  size: v.size || '',
                  color: v.color || '',
                  hexColor: v.hexColor || '#1e293b',
                  price: v.price || 0,
                  discountPrice: v.discountPrice || 0,
                  stock: v.stock !== undefined && v.stock !== null ? v.stock : 0,
                  isActive: v.isActive !== false,
                  imageUrl: v.imageUrl || '',
                });
              }

              loadedGroups = Array.from(groupMap.entries()).map(([groupName, details]) => ({
                groupName,
                details,
              }));
            }

            if (loadedGroups.length === 0) {
              loadedGroups = [
                {
                  groupName: 'Default Style',
                  details: [
                    {
                      sku: `${product.slug ? product.slug.toUpperCase() : 'SKU'}-DEFAULT`,
                      size: 'All Size',
                      color: 'Default',
                      hexColor: '#1e293b',
                      price: product.price || 0,
                      discountPrice: 0,
                      stock: product.qty || 0,
                      isActive: true,
                      imageUrl: '',
                    },
                  ],
                },
              ];
            }

            const mainImg = product.thumbnailUrl || product.thumbnail || product.imageUrl || (product.banners && product.banners.length > 0 ? product.banners[0] : (product.images && product.images.length > 0 ? product.images[0] : ''));
            const bannerList = product.banners && product.banners.length > 0
              ? product.banners
              : (product.images && product.images.length > 0 ? product.images.filter((u) => u !== mainImg) : []);
            const productSku = product.sku || (product.variants && product.variants.length > 0 ? product.variants[0].sku : '');

            form.reset({
              name: product.name || '',
              slug: product.slug || '',
              sku: productSku || '',
              description: product.description || '',
              categoryId: product.categoryId || product.category?.id || 1,
              brandId: product.brandId || product.brand?.id || 1,
              gender: (product.gender as any) || 'UNISEX',
              weight: product.weight || 500,
              isActive: product.isActive !== undefined ? product.isActive : true,
              thumbnailUrl: mainImg,
              banners: bannerList,
              imageUrl: mainImg,
              images: bannerList,
              variantGroups: loadedGroups,
            });
          }
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load product form details', variant: 'destructive' });
      }
    };
    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isNew]);

  const name = form.watch('name');
  useEffect(() => {
    if (isNew || !form.getValues('slug')) {
      if (!name) return;
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      if (slug && form.getValues('slug') !== slug) {
        form.setValue('slug', slug, { shouldValidate: true });
        if (!form.getValues('sku')) {
          form.setValue('sku', `SKU-${slug.toUpperCase()}`, { shouldValidate: true });
        }
      }
    }
  }, [name, isNew, form]);

  const applyMasterSkuToVariants = () => {
    const rawSku = form.getValues('sku')?.trim() || '';
    const productSlug = (form.getValues('slug') || 'PRD').toUpperCase();
    const masterSku = (rawSku || `SKU-${productSlug}`).toUpperCase();

    const currentGroups = form.getValues('variantGroups') || [];
    const updatedGroups = currentGroups.map((group, gIdx) => ({
      ...group,
      details: group.details.map((detail, dIdx) => {
        const cleanGroupName = group.groupName.trim() || `Style ${gIdx + 1}`;
        const fallbackColor = detail.color?.trim() || 'DEF';
        const fallbackSize = detail.size?.trim() || 'ALL';
        const autoSku = `${masterSku}-${cleanGroupName.substring(0, 3).toUpperCase()}-${fallbackColor.substring(0, 3).toUpperCase()}-${fallbackSize.substring(0, 3).toUpperCase()}-${dIdx + 1}`.replace(/\s+/g, '');
        return {
          ...detail,
          sku: autoSku,
        };
      }),
    }));
    form.setValue('variantGroups', updatedGroups, { shouldDirty: true });
    toast({
      title: 'SKU Diperbarui',
      description: `SKU Varian diselaraskan dengan Master SKU (${masterSku})`,
    });
  };

  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    try {
      const productSlug = (values.slug || 'PRD').toUpperCase();
      const masterSku = (values.sku?.trim() || `SKU-${productSlug}`).toUpperCase();

      const flatVariants = values.variantGroups.flatMap((group, gIdx) =>
        group.details.map((detail, dIdx) => {
          const cleanGroupName = group.groupName.trim() || `Style ${gIdx + 1}`;
          const fallbackColor = detail.color?.trim() || 'DEF';
          const fallbackSize = detail.size?.trim() || 'ALL';
          const autoSku = `${masterSku}-${cleanGroupName.substring(0, 3).toUpperCase()}-${fallbackColor.substring(0, 3).toUpperCase()}-${fallbackSize.substring(0, 3).toUpperCase()}-${dIdx + 1}`.replace(/\s+/g, '');

          return {
            id: detail.id,
            groupName: cleanGroupName,
            sku: detail.sku?.trim() || autoSku,
            size: detail.size?.trim() || '',
            color: detail.color?.trim() || '',
            hexColor: detail.hexColor || '#1e293b',
            price: Number(detail.price) || 0,
            discountPrice: detail.discountPrice ? Number(detail.discountPrice) : undefined,
            stock: Number(detail.stock) || 0,
            isActive: detail.isActive !== false,
            imageUrl: detail.imageUrl || '',
          };
        })
      );

      const totalQty = flatVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const minPrice = flatVariants.length > 0
        ? Math.min(...flatVariants.map((v) => v.price))
        : 0;

      const mainThumb = values.thumbnailUrl || values.imageUrl || (values.banners && values.banners.length > 0 ? values.banners[0] : (values.images && values.images.length > 0 ? values.images[0] : ''));
      const bannerList = values.banners && values.banners.length > 0
        ? values.banners
        : (values.images && values.images.length > 0 ? values.images : (mainThumb ? [mainThumb] : []));

      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        sku: masterSku,
        description: values.description || '',
        categoryId: Number(values.categoryId),
        brandId: Number(values.brandId),
        gender: values.gender,
        weight: Number(values.weight) || 500,
        isActive: values.isActive,
        thumbnailUrl: mainThumb,
        banners: bannerList,
        imageUrl: mainThumb,
        images: bannerList,
        price: minPrice,
        qty: totalQty,
        variants: flatVariants,
      };

      if (isNew) {
        await ProductService.create(payload as any);
        toast({ title: 'Success', description: 'Product created successfully with variants' });
      } else {
        await ProductService.update(Number(id), payload as any);
        toast({ title: 'Success', description: 'Product updated successfully with variants' });
      }
      router.push('/admin/products');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    groupFields,
    appendGroup,
    removeGroup,
    categories,
    brands,
    isLoading,
    isNew,
    onSubmit,
    applyMasterSkuToVariants,
  };
}
