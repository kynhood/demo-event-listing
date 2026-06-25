'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SnackbarProps {
  message: string;
  open: boolean;
  onClose: () => void;
  variant?: 'default' | 'error' | 'success';
  duration?: number;
}

export function Snackbar({ message, open, onClose, variant = 'default', duration = 4000 }: SnackbarProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, onClose, duration]);

  const bg = {
    default: 'bg-inverse-surface text-inverse-on-surface',
    error: 'bg-error-container text-on-error-container border border-error/30',
    success: 'bg-tertiary-container text-on-tertiary-container border border-tertiary/30',
  }[variant];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`${bg} px-6 py-3 rounded-full shadow-xl text-sm font-medium max-w-sm text-center`}>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
