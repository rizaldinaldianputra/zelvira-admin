'use client';

import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function DateTimePicker({ value, onChange, className, placeholder }: DateTimePickerProps) {
  const selectedDate = value ? new Date(value) : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn('relative w-full z-30', className)}>
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => {
          if (date) {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - offset * 60 * 1000);
            onChange(localDate.toISOString().substring(0, 16));
          } else {
            onChange('');
          }
        }}
        showTimeSelect
        dateFormat="Pp"
        placeholderText={placeholder || 'Pilih tanggal & waktu'}
        popperPlacement="bottom-start"
        popperClassName="!z-[99999]"
        popperProps={{
          strategy: 'fixed',
        }}
        customInput={
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full h-12 justify-start text-left font-bold rounded-2xl border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/40 px-4 hover:bg-white dark:hover:bg-black/60 transition-all',
              !value && 'text-slate-400 font-normal'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-pink-600 shrink-0" />
            <span className="truncate">
              {value && selectedDate ? selectedDate.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : placeholder || 'Pilih tanggal & waktu'}
            </span>
          </Button>
        }
        calendarClassName="!rounded-2xl !border-slate-200 dark:!border-slate-700 !shadow-2xl !font-sans bg-white dark:bg-slate-900"
        wrapperClassName="w-full"
      />
      <style jsx global>{`
        .react-datepicker-popper {
          z-index: 99999 !important;
        }
        .react-datepicker {
          font-family: inherit;
          border-radius: 1.5rem !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25) !important;
          background-color: #ffffff !important;
          overflow: hidden;
          z-index: 99999 !important;
        }
        .dark .react-datepicker {
          background-color: #0f172a !important;
          border-color: #334155 !important;
          color: #f8fafc !important;
        }
        .react-datepicker__header {
          background-color: #fff !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding-top: 1rem !important;
        }
        .dark .react-datepicker__header {
          background-color: #1e293b !important;
          border-bottom-color: #334155 !important;
        }
        .dark .react-datepicker__current-month,
        .dark .react-datepicker-time__header,
        .dark .react-datepicker__day-name {
          color: #f8fafc !important;
        }
        .dark .react-datepicker__day {
          color: #cbd5e1 !important;
        }
        .dark .react-datepicker__day:hover {
          background-color: #334155 !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #ec4899 !important;
          color: #fff !important;
          border-radius: 0.5rem !important;
        }
        .react-datepicker__time-container {
          border-left: 1px solid #f1f5f9 !important;
        }
        .dark .react-datepicker__time-container {
          border-left-color: #334155 !important;
          background-color: #0f172a !important;
        }
        .dark .react-datepicker__time-box {
          background-color: #0f172a !important;
        }
        .dark .react-datepicker__time-list-item {
          color: #cbd5e1 !important;
        }
        .dark .react-datepicker__time-list-item:hover {
          background-color: #334155 !important;
        }
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
          background-color: #ec4899 !important;
          color: #fff !important;
        }
        .react-datepicker__navigation {
          top: 1rem !important;
        }
      `}</style>
    </div>
  );
}
