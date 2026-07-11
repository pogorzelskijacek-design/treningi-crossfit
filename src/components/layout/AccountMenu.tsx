import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function AccountMenu({ showEmail = false }: { showEmail?: boolean }) {
  const { user, signOut } = useAuth();
  const email = user?.email ?? '';
  const initial = email.charAt(0).toUpperCase() || '?';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2 rounded-lg text-sm outline-none transition-colors',
          showEmail ? 'w-full px-2 py-1.5 hover:bg-muted' : 'p-0.5'
        )}
        aria-label="Account menu"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initial}
        </span>
        {showEmail && <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">{email}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
