import React from 'react';
import { cn } from '@/lib/utils';

export default function Logo({ className, variant = 'dark' }) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#1D4E4A]';
  return (
    <span className={cn('font-display font-bold tracking-tight leading-none inline-flex items-baseline', textColor, className)}>
      INAYA
      <span className="text-emerald-500 ml-0.5">+</span>
    </span>
  );
}