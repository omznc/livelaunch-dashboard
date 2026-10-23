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
            'group flex h-9 w-full items-stretch overflow-hidden border border-line2 bg-bg focus-within:outline-2 focus-within:outline-brand focus-within:outline-offset-2',
            className
          )}
        >
          <input
            type="number"
            className="min-w-0 flex-1 appearance-none bg-transparent px-3 font-mono text-base tabular-nums outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            ref={setRef}
            {...props}
          />
          <div className="grid w-9 grid-rows-2 border-l border-line2 bg-panel">
            <button
              type="button"
              tabIndex={-1}
              disabled={props.disabled || props.readOnly}
              onClick={() => adjustValue(1)}
              className="flex items-center justify-center text-fg2 hover:bg-raised hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              disabled={props.disabled || props.readOnly}
              onClick={() => adjustValue(-1)}
              className="flex items-center justify-center text-fg2 hover:bg-raised hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
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
          'flex h-9 w-full border border-line2 bg-bg px-3 text-base file:border-0 file:bg-transparent file:font-medium file:text-fg file:text-sm hover:border-fg3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
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
