import { NavLink, Outlet } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './navConfig';
import { ThemeToggle } from './ThemeToggle';

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Dumbbell className="size-4" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold">CrossFit Coach</span>
        <span className="text-xs text-muted-foreground">Hyrox &amp; strength</span>
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-card/40 p-4 md:flex">
        <Logo />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar — pads under the status bar / notch when installed */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur md:hidden">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:ml-60 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav — pads above the home indicator when installed */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
