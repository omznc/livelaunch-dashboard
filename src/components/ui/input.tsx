import { ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';

import { cn } from '@lib/utils';

// The number input has its own steppers. They call the native stepUp and
// stepDown, which respect min, max and step. The input event makes React
// run onChange.
const NumberInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type: _type, ...props }, forwardedRef) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

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

    const adjustValue = (direction: 1 | -1) => {
      const node = inputRef.current;
      if (!node || props.disabled || props.readOnly) return;
      if (direction === 1) node.stepUp();
      else node.stepDown();
      node.dispatchEvent(new Event('input', { bubbles: true }));
      node.focus();
    };

    const locked = props.disabled || props.readOnly;
    const stepButton =
      'flex items-center justify-center text-fg2 hover:bg-raised hover:text-fg disabled:cursor-not-allowed disabled:opacity-40';

    return (
      <div
        className={cn(
          'group flex h-10 w-full items-stretch overflow-hidden border border-line2 bg-bg focus-within:outline-2 focus-within:outline-brand focus-within:outline-offset-2',
          className
        )}
      >
        <input
          type="number"
          className="min-w-0 flex-1 appearance-none bg-transparent px-3 font-mono text-base tabular-nums outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]"
          ref={setRef}
          {...props}
        />
        <div className="grid w-10 grid-rows-2 border-l border-line2 bg-panel">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increase"
            disabled={locked}
            onClick={() => adjustValue(1)}
            className={stepButton}
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrease"
            disabled={locked}
            onClick={() => adjustValue(-1)}
            className={stepButton}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, forwardedRef) => {
    if (type === 'number') {
      return <NumberInput className={className} ref={forwardedRef} {...props} />;
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full border border-line2 bg-bg px-3 text-base file:border-0 file:bg-transparent file:font-medium file:text-fg file:text-sm hover:border-fg3 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]',
          className
        )}
        ref={forwardedRef}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
