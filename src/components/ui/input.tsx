import * as React from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, forwardedRef) => {
    if (type === 'number') {
      const inputRef = React.useRef<HTMLInputElement>(null);

      const setRef = React.useCallback(
        (node: HTMLInputElement | null) => {
          inputRef.current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        },
        [forwardedRef]
      );

      const adjustValue = React.useCallback(
        (direction: 1 | -1) => {
          const node = inputRef.current;
          if (!node || props.disabled || props.readOnly) return;
          const step = Number(props.step ?? 1) || 1;
          const min = props.min !== undefined ? Number(props.min) : -Infinity;
          const max = props.max !== undefined ? Number(props.max) : Infinity;
          const current = Number.isFinite(node.valueAsNumber) ? node.valueAsNumber : 0;
          const next = clampNumber(current + direction * step, min, max);
          node.value = Number.isFinite(next) ? String(next) : '';
          node.dispatchEvent(new Event('input', { bubbles: true }));
          node.dispatchEvent(new Event('change', { bubbles: true }));
          node.focus();
        },
        [props.disabled, props.max, props.min, props.readOnly, props.step]
      );

      return (
        <div
          className={cn(
            'group flex h-10 w-full items-stretch overflow-hidden rounded-md border border-normal bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            className
          )}
        >
          <input
            type="number"
            className="flex-1 bg-transparent px-3 py-2 text-base outline-none ring-0 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm appearance-none"
            ref={setRef}
            {...props}
          />
          <div className="grid w-11 grid-rows-2 border-l border-border/60 bg-secondary/40">
            <button
              type="button"
              tabIndex={-1}
              disabled={props.disabled || props.readOnly}
              onClick={() => adjustValue(1)}
              className="flex items-center justify-center text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              disabled={props.disabled || props.readOnly}
              onClick={() => adjustValue(-1)}
              className="flex items-center justify-center text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-normal bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={forwardedRef}
        {...props}
      />
    );
  }
);

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
Input.displayName = 'Input';

export { Input };
