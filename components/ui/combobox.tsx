'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ComboboxProps {
  options: { label: string; value: string | number }[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  emptyText = 'No option found.',
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => String(option.value) === String(value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between h-12 rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/50 hover:bg-white/80 dark:hover:bg-black/80 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden text-left px-4 min-w-0',
            className
          )}
        >
          <span className="truncate text-left flex-1 min-w-0 pr-2 block">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[280px] max-w-[90vw] p-0 rounded-2xl border border-slate-200 dark:border-white/20 bg-white/95 backdrop-blur-xl dark:bg-slate-900/95 shadow-2xl z-[99999]"
        align="start"
      >
        <Command className="bg-transparent">
          <CommandInput placeholder={placeholder} className="h-12 border-none focus:ring-0 text-xs" />
          <CommandList className="max-h-60 overflow-y-auto scrollbar-thin">
            <CommandEmpty className="p-4 text-xs text-slate-400 text-center">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = String(value) === String(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="rounded-xl cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/30 flex items-center justify-between py-2.5 px-3 text-xs"
                  >
                    <div className="flex items-center min-w-0 flex-1 pr-2">
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          isSelected ? 'opacity-100 text-pink-600' : 'opacity-0'
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
