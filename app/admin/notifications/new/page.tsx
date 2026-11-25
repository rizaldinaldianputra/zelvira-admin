'use client';

import { Bell, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotificationNew } from '@/hooks/use-notification-new';

export default function NewNotificationPage() {
  const {
    formData,
    setFormData,
    isSubmitting,
    handlePush,
    router,
  } = useNotificationNew();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          className="rounded-2xl font-bold uppercase text-[10px] tracking-widest gap-2 text-slate-500 hover:text-pink-500 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="p-8 md:p-12 space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-3xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Create Alert & Notification</h1>
              <p className="text-slate-500 text-sm mt-0.5">Kirim pesan siaran notifikasi push ke perangkat pelanggan Zelvira.</p>
            </div>
          </div>

          <form onSubmit={handlePush} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Audience</label>
              <Select 
                value={formData.topic} 
                onValueChange={(val) => setFormData({ ...formData, topic: val })}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
                  <SelectValue placeholder="Select Target" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="all">All Devices (Broadcast / Global)</SelectItem>
                  <SelectItem value="promo">Promo Subscribers Only</SelectItem>
                  <SelectItem value="single">Specific User ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.topic === 'single' && (
              <div className="space-y-2 animate-in fade-in">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">User Identification (UID)</label>
                <Input 
                  value={formData.userId || ''} 
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="Enter User Database ID..." 
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-mono"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Notification Category</label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
                  <SelectValue placeholder="Notification Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="PROMOTION">PROMOTION</SelectItem>
                  <SelectItem value="TRANSACTION">TRANSACTION</SelectItem>
                  <SelectItem value="SYSTEM">SYSTEM ALERT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Alert Title</label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Flash Sale Alert! ⚡ 50% Off Today" 
                className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Notification Body Message</label>
              <Textarea 
                value={formData.body} 
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={4}
                placeholder="Write the message content displayed on customer mobile locks..." 
                className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-none p-4 font-medium"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold uppercase tracking-wider text-xs shadow-xl shadow-pink-500/20 gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending Alert...' : 'Dispatch Notification Now'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
