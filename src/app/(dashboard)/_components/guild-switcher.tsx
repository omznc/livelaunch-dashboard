'use client';

import * as React from 'react';
import { useEffect, useTransition } from 'react';
import { cn } from '@lib/utils';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Button, buttonVariants } from '@components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@components/ui/command';
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '@components/ui/credenza';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { CheckIcon, PlusCircle, ChevronsUpDown, RefreshCw, Plus } from 'lucide-react';
import type { GuildsResponse } from '@app/(dashboard)/layout';
import { revalidateGuilds } from '@app/(dashboard)/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import env from '@env';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface GuildSwitcherProps extends PopoverTriggerProps {
  guilds: GuildsResponse[];
}

export default function GuildSwitcher({ className, guilds }: GuildSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [showNewGuildDialog, setShowNewGuildDialog] = React.useState(false);
  const [revalidating, setRevalidating] = React.useState(false);
  const [revalidationCooldown, setRevalidationCooldown] = React.useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const selectedGuild = guilds.find(guild => guild.id === params.get('g'));
  const [pending, _startTransition] = useTransition();

  useEffect(() => {
    if (!selectedGuild && guilds.length !== 0) {
      router.push(`?g=${guilds[0].id}`);
    }
  }, [guilds, router, selectedGuild]);

  return (
    <Credenza open={showNewGuildDialog} onOpenChange={setShowNewGuildDialog}>
      {guilds.length !== 0 && (
        <>
          <Button
            variant={'outline'}
            className={'mr-2 border-0 bg-black/50 p-3'}
            onClick={() => {
              setShowNewGuildDialog(true);
            }}
          >
            <Plus />
          </Button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-label="Select a Guild"
                className={cn('w-[200px] justify-between border-0 bg-black/50', className, {
                  'animate-pulse': pending,
                })}
              >
                {selectedGuild ? (
                  <>
                    <Avatar className="mr-2 h-5 w-5">
                      {selectedGuild.icon ? (
                        <Image
                          width={50}
                          height={50}
                          src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
                          alt={selectedGuild.name}
                        />
                      ) : (
                        <AvatarFallback>{selectedGuild.name[0] || 'LL'}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="truncate">{selectedGuild.name}</span>
                  </>
                ) : (
                  <span className="animate-pulse truncate">Just a moment...</span>
                )}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandList>
                  <CommandInput placeholder="Search for a server..." />
                  <CommandEmpty>No guild found.</CommandEmpty>
                  <CommandGroup heading={'Your Guilds'}>
                    {guilds.map(guild => (
                      <CommandItem
                        key={guild.id}
                        onSelect={async () => {
                          if (guild.botAccess) {
                            setOpen(false);
                            router.push(`?g=${guild.id}`);
                          } else {
                            setShowNewGuildDialog(true);
                          }
                        }}
                        className="text-sm"
                      >
                        <Avatar className="mr-2 h-5 w-5">
                          {guild.icon ? (
                            <Image
                              width={50}
                              height={50}
                              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                              alt={guild.name}
                            />
                          ) : (
                            <AvatarFallback>{guild.name[0] || 'LL'}</AvatarFallback>
                          )}
                        </Avatar>
                        {guild.name}
                        <CheckIcon
                          className={cn(
                            'ml-auto h-4 w-4',
                            selectedGuild?.id === guild.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                <CommandSeparator />
                <CommandList>
                  <CommandGroup>
                    <CredenzaTrigger asChild>
                      <CommandItem
                        onSelect={() => {
                          setOpen(false);
                          setShowNewGuildDialog(true);
                        }}
                      >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add a Server
                      </CommandItem>
                    </CredenzaTrigger>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </>
      )}
      {guilds.length === 0 && (
        <Button
          onClick={() => {
            setShowNewGuildDialog(true);
          }}
        >
          Add a Guild
        </Button>
      )}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Add a Guild</CredenzaTitle>
          <CredenzaDescription>To add a server, you must be an administrator.</CredenzaDescription>
        </CredenzaHeader>
        <div className="inline-flex justify-center gap-1 sm:justify-start">
          {revalidationCooldown ? (
            `You've refreshed the servers recently, please wait a few seconds.`
          ) : (
            <>
              Is LiveLaunch already in your server?
              <button
                type="button"
                className="cursor-pointer font-medium text-primary underline underline-offset-4 transition-all hover:brightness-125"
                onClick={async _e => {
                  setRevalidating(true);
                  await revalidateGuilds({}).then(() => {
                    setRevalidating(false);
                    setRevalidationCooldown(true);
                    setTimeout(() => {
                      setRevalidationCooldown(false);
                    }, 10000);
                  });
                }}
              >
                {revalidating ? <RefreshCw className="h-5 w-5 animate-spin-reverse" /> : 'Refresh'}
              </button>
            </>
          )}
        </div>
        <CredenzaFooter className="gap-2 md:gap-1">
          <Button variant="outline" onClick={() => setShowNewGuildDialog(false)}>
            Cancel
          </Button>
          <Link
            className={buttonVariants({
              variant: 'secondary',
            })}
            href={`https://discord.com/api/oauth2/authorize?client_id=${env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=9126823936&scope=bot%20applications.commands`}
            target={'_blank'}
          >
            Open in Browser
          </Link>
          <Link
            className={buttonVariants({
              variant: 'default',
            })}
            href={`discord://-/application-directory/${env.NEXT_PUBLIC_DISCORD_CLIENT_ID}`}
            onClick={() => toast.success('Check your Discord app.')}
          >
            Open in Discord
          </Link>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
