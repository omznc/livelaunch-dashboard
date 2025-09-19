import { Children, type ReactNode, useRef } from 'react';
import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { Hash, Copy } from 'lucide-react';
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
      className={cn(
        `relative flex w-full items-center justify-center justify-center rounded-md border bg-black/50 p-4 transition-all`,
        {
          'bg-primary/10': active,
          'space-x-2 overflow-auto': !disabled,
          'cursor-not-allowed overflow-hidden': disabled,
          'cursor-pointer': !disabled,
        },
        className
      )}
      onClick={handleSettingClick}
    >
      {disabled && (
        <p className="absolute select-none text-center font-semibold text-sm">
          {disabledMessage ?? 'This setting is disabled'}
        </p>
      )}
      <div
        className={cn(
          'flex w-full flex-col items-center justify-between gap-4 rounded-md transition-all md:flex-row md:gap-0',
          {
            'pointer-events-none select-none blur-sm': disabled,
          }
        )}
      >
        <div className={cn('flex h-full flex-1 gap-4 transition-all')}>
          {image && (
            <Image
              src={image}
              alt={label}
              width={42}
              height={42}
              className="h-full max-h-[42px] w-auto rounded-full bg-black"
            />
          )}
          <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <p className="select-none text-sm opacity-50">{description}</p>
          </div>
        </div>
        <div ref={childRef}>{children}</div>
      </div>
    </div>
  );
}

interface SettingGroupProps {
  title: string;
  description?: string | ReactNode;
  children?: ReactNode;
}

export function SettingGroup({ title, description, children }: SettingGroupProps) {
  const id = title.toLowerCase().replaceAll(' ', '-');
  const hash = useHash();

  if (Children.count(children) === 0) return null;

  return (
    <div className="flex flex-col gap-2" key={hash}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className={'w-fit'}>
            <button
              type="button"
              className={cn(
                'group inline-flex w-fit cursor-pointer scroll-m-20 items-center gap-1 text-xl tracking-tight',
                {
                  'font-bold': id === hash.slice(1),
                }
              )}
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
              <Hash
                className={cn('opacity-50 transition-all group-hover:opacity-100', {
                  'opacity-100': id === hash.slice(1),
                })}
              />
              {title}
              <Copy className="h-4 w-4 opacity-0 transition-all group-hover:opacity-50" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Copy link to this section</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {description && <p className="inline-flex select-none items-center gap-1 text-sm opacity-50">{description}</p>}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
