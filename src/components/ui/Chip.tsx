'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Chip({ children, selected, onClick, disabled, className }: ChipProps) {
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border select-none',
        selected
          ? 'bg-secondary-container border-secondary text-on-secondary-container shadow-sm'
          : 'bg-surface border-outline text-on-surface-variant hover:bg-secondary-container/30 hover:border-secondary/50',
        disabled && 'opacity-38 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {children}
    </motion.button>
  );
}
