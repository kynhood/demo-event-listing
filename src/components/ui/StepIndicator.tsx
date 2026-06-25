'use client';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  current: number;
  total: number;
  labels?: string[];
}

export function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-on-surface-variant font-medium">Step {current} of {total}</span>
        {labels && <span className="text-xs text-on-surface-variant">{labels[current - 1]}</span>}
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 rounded-full flex-1 transition-all duration-300',
              i + 1 <= current ? 'bg-primary' : 'bg-outline-variant'
            )}
          />
        ))}
      </div>
    </div>
  );
}
