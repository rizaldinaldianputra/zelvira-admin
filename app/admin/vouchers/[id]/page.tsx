'use client';

import { CrudForm } from '@/components/admin/crud-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useVoucherForm } from '@/hooks/use-voucher-form';

export default function VoucherEditPage() {
  const { form, isLoading, isNew, onSubmit } = useVoucherForm();

  return (
    <CrudForm
      title={isNew ? 'New Voucher' : 'Edit Voucher'}
      subtitle={isNew ? 'Create a new discount code' : 'Update voucher details'}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Voucher Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. DISCOUNT50" className="rounded-xl border-slate-200 uppercase font-bold text-pink-600" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Discount Amount (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50000" className="rounded-xl border-slate-200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minPurchase"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Min. Purchase Amount (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100000" className="rounded-xl border-slate-200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Valid Until</FormLabel>
                <FormControl>
                  <Input type="date" className="rounded-xl border-slate-200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetMembership"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold uppercase tracking-tight">Target Membership</FormLabel>
                <FormControl>
                  <select 
                    {...field}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 text-sm font-bold uppercase tracking-wider"
                  >
                    <option value="ALL">All Members</option>
                    <option value="BRONZE">Bronze Only</option>
                    <option value="SILVER">Silver Only</option>
                    <option value="GOLD">Gold Only</option>
                    <option value="PLATINUM">Platinum Only</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="font-bold uppercase tracking-tight">Active Status</FormLabel>
                  <p className="text-xs text-slate-500">Allow customers to claim this voucher</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </CrudForm>
  );
}
