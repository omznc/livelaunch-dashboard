import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 border px-2 py-0.5 font-medium font-mono text-xs', {
  variants: {
    variant: {
      default: 'border-primary/50 bg-primary/15 text-brand',
      secondary: 'border-line2 bg-raised text-fg2',
      destructive: 'tint-red border-red/40',
      outline: 'border-line2 text-fg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
