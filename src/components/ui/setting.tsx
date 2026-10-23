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
        'flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3.5 hover:bg-hover data-[active]:bg-primary/[0.07]',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      onClick={handleSettingClick}
    >
      <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
        {image && (
          <Image
            src={image}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 border border-line bg-bg object-contain"
          />
        )}
        <div className="flex min-w-0 flex-col gap-0.5">
          <span id={labelId} className="font-medium text-sm leading-5">
            {label}
          </span>
          <p className="select-none text-fg2 text-sm leading-5">{description}</p>
          {disabled && (
            <p className="mt-1 inline-flex select-none items-center gap-1.5 text-amber text-xs">
              <Lock className="h-4 w-4 shrink-0" />
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

// A section: a small uppercase label, then the rows divided by hairlines.
export function SettingGroup({ title, description, children }: SettingGroupProps) {
  const id = title.toLowerCase().replaceAll(' ', '-');
  const hash = useHash();

  if (Children.count(children) === 0) return null;

  return (
    <section className="flex flex-col gap-2" key={hash}>
      <div className="flex flex-col gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className={'w-fit'}>
              <button
                type="button"
                className={cn('group inline-flex w-fit scroll-m-20 items-center gap-1 font-semibold text-sm hover:text-brand', {
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
                <Hash className="h-4 w-4" />
                {title}
              </button>
            </TooltipTrigger>
            <TooltipContent>Copy link to this section</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {description && (
          <p className="inline-flex select-none flex-wrap items-center gap-x-2 text-fg2 text-sm">{description}</p>
        )}
      </div>
      <div className="flex flex-col divide-y divide-line border border-line bg-panel">{children}</div>
    </section>
  );
}
