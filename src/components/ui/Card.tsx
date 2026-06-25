'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  elevated?: boolean;
}

export function Card({ children, className, onClick, selected, elevated }: CardProps) {
  const isClickable = !!onClick;

  return (
    <motion.div
      whileHover={isClickable ? { y: -2, scale: 1.01 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        'rounded-3xl transition-all duration-200',
        elevated ? 'shadow-md' : 'shadow-sm',
        selected
          ? 'bg-secondary-container border-2 border-secondary ring-2 ring-secondary/30'
          : 'bg-surface-container border border-outline-variant',
        isClickable && 'cursor-pointer hover:shadow-lg',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
