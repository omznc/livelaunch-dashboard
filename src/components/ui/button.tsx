import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utils';

// default is the one primary action. outline and secondary are the quiet action.
// A disabled button drops its border and fill, so a gray secondary never looks disabled.
const secondary = 'border border-line2 bg-transparent font-medium text-fg hover:bg-raised';

const buttonVariants = cva(
  'press inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-mono text-[13.5px] disabled:pointer-events-none disabled:border-transparent disabled:bg-raised disabled:font-semibold disabled:text-fg3 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-primary font-semibold text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary)_82%,white)]',
        destructive:
          'border border-transparent bg-destructive font-semibold text-destructive-foreground hover:bg-[color-mix(in_oklch,var(--red)_85%,var(--fg))]',
        outline: secondary,
        secondary: secondary,
        ghost: 'border border-transparent bg-transparent font-medium text-fg2 hover:bg-raised hover:text-fg',
        link: 'text-brand underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3.5 text-[13px]',
        lg: 'h-11 px-5 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
