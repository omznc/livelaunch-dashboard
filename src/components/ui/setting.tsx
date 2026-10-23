import { Children, type ReactNode, useId, useRef } from 'react';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { Hash, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { useHash } from '@lib/hooks';

interface SettingProps {
  label: string;
  description: string;
  active: boolean;
  children: ReactNode;
  image?: string;
  className?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

// One settings row: label and description on the left, the control on the right.
export function Setting({
  label,
  description,
  active,
  children,
  image,
  className,
  disabled,
  disabledMessage,
}: SettingProps) {
  const childRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const handleSettingClick = (e: React.MouseEvent) => {
    if (disabled) return;

    const target = e.target as HTMLElement;

    // Don't trigger if clicking on dialog, popover, overlay, or their children
    if (
      target.closest(
        '[role="dialog"], [data-radix-popper-content-wrapper], [data-radix-dialog-overlay], [data-state], .radix-dialog-overlay, .radix-popover-content'
      ) ||
      target.hasAttribute('data-radix-dialog-overlay') ||
      target.classList.contains('radix-dialog-overlay')
    ) {
      return;
    }

    const childElement = childRef.current?.querySelector('button, input, [role="switch"]');
    if (childElement && !childElement.contains(target)) {
      (childElement as HTMLElement).click();
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Works as expected
    // biome-ignore lint/a11y/useKeyWithClickEvents: Works as expected
    <div
      role="group"
      aria-labelledby={labelId}
      data-active={active || undefined}
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 sm:px-6 sm:py-5',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-hover',
        className
      )}
      onClick={handleSettingClick}
    >
      <div className="flex min-w-0 flex-1 basis-60 items-center gap-4">
        {image && (
          <Image
            src={image}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 border border-line bg-bg object-contain"
          />
        )}
        <div className="flex min-w-0 flex-col gap-0.5">
          <span id={labelId} className="font-medium text-[15px] leading-6">
            {label}
          </span>
          <p className="select-none text-fg2 text-sm leading-[22px]">{description}</p>
          {disabled && (
            <p className="mt-1 inline-flex select-none items-center gap-1.5 text-amber text-sm">
              <Lock className="h-[18px] w-[18px] shrink-0" />
              {disabledMessage ?? 'This setting is disabled'}
            </p>
          )}
        </div>
      </div>
      <div
        ref={childRef}
        className={cn('shrink-0', {
          'pointer-events-none select-none opacity-40': disabled,
        })}
      >
        {children}
      </div>
    </div>
  );
}

interface SettingGroupProps {
  title: string;
  description?: string | ReactNode;
  children?: ReactNode;
}

// A section: a heading band with a hairline above it, then full-width rows split by hairlines.
export function SettingGroup({ title, description, children }: SettingGroupProps) {
  const id = title.toLowerCase().replaceAll(' ', '-');
  const hash = useHash();

  if (Children.count(children) === 0) return null;

  return (
    <section className="flex flex-col border-line border-t first:border-t-0 last:border-b" key={hash}>
      <div className="flex flex-col gap-1 px-4 pt-6 pb-4 sm:px-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className={'w-fit'}>
              <button
                type="button"
                className={cn('group inline-flex w-fit scroll-m-20 items-center gap-1.5 font-semibold text-lg leading-7 tracking-head hover:text-brand', {
                  'text-brand': id === hash.slice(1),
                })}
                id={id}
                onClick={() => {
                  const url = window.location.href.split('#')[0];
                  navigator.clipboard
                    .writeText(`${url}#${id}`)
                    .then(() => {
                      toast.success('Copied link');
                    })
                    .catch(() => {
                      toast.error('Failed to copy to clipboard!');
                    });
                  window.location.hash = id;
                }}
              >
                <Hash className="h-[18px] w-[18px] text-fg3" />
                {title}
              </button>
            </TooltipTrigger>
            <TooltipContent>Copy link to this section</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {description && (
          <p className="inline-flex select-none flex-wrap items-center gap-x-2 text-fg2 text-sm leading-[22px]">{description}</p>
        )}
      </div>
      <div className="flex flex-col divide-y divide-line border-line border-t">{children}</div>
    </section>
  );
}
