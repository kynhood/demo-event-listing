'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  name?: string;
  value?: string;
  'aria-label'?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'filled' | 'outlined' | 'text' | 'tonal';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'filled',
  size = 'md',
  loading,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants = {
    filled:
      'bg-primary text-on-primary hover:shadow-md active:shadow-sm disabled:bg-on-surface/12 disabled:text-on-surface/38 focus-visible:ring-primary',
    outlined:
      'border border-outline text-primary hover:bg-primary/8 active:bg-primary/12 disabled:border-on-surface/12 disabled:text-on-surface/38 focus-visible:ring-primary',
    text: 'text-primary hover:bg-primary/8 active:bg-primary/12 disabled:text-on-surface/38 focus-visible:ring-primary',
    tonal:
      'bg-secondary-container text-on-secondary-container hover:shadow-md active:shadow-sm disabled:bg-on-surface/12 disabled:text-on-surface/38 focus-visible:ring-secondary',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm h-8',
    md: 'px-6 py-2.5 text-sm h-10',
    lg: 'px-8 py-3 text-base h-12',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      onClick={props.onClick as React.MouseEventHandler<HTMLButtonElement>}
      type={props.type}
      form={props.form}
      name={props.name}
      value={props.value as string | undefined}
      aria-label={props['aria-label']}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </motion.button>
  );
}
