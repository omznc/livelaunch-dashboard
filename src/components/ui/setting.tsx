import { Children, type ReactNode, useRef } from 'react';
import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { Hash, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { useHash } from '@lib/hooks';
import { useRouter } from 'next/navigation';

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
    <div
      className={cn(
        `relative w-full bg-black/50 flex justify-center items-center border rounded-md justify-center transition-all p-4`,
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
        <p className="text-sm absolute font-semibold text-center select-none">
          {disabledMessage ?? 'This setting is disabled'}
        </p>
      )}
      <div
        className={cn(
          'flex w-full md:flex-row flex-col md:gap-0 gap-4 rounded-md items-center transition-all justify-between',
          {
            'blur-sm pointer-events-none select-none': disabled,
          }
        )}
      >
        <div className={cn('flex h-full transition-all flex-1 gap-4')}>
          {image && (
            <Image
              src={image}
              alt={label}
              width={42}
              height={42}
              className="rounded-full h-full max-h-[42px] w-auto bg-black"
            />
          )}
          <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <p className="text-sm select-none opacity-50">{description}</p>
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
            <h4
              className={cn(
                'group scroll-m-20 w-fit inline-flex cursor-pointer items-center gap-1 text-xl tracking-tight',
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
              <Copy className="opacity-0 h-4 w-4 group-hover:opacity-50 transition-all" />
            </h4>
          </TooltipTrigger>
          <TooltipContent>Copy link to this section</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {description && <p className="text-sm inline-flex items-center gap-1 select-none opacity-50">{description}</p>}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
