import { CalendarCheck, Camera, ClipboardList, LogOut, Users, type LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, type NavLinkRenderProps } from 'react-router';

import { useAuth, useCurrentUser } from '../auth/auth-context';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';
import { paths } from '../lib/paths';
import { isHrdAdmin, ROLE_LABELS } from '../lib/roles';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const EMPLOYEE_NAV: NavItem[] = [
  { to: paths.checkIn, label: 'Check in', icon: Camera },
  { to: paths.myAttendance, label: 'My attendance', icon: CalendarCheck },
];

const HRD_NAV: NavItem[] = [
  { to: paths.employees, label: 'Employees', icon: Users },
  { to: paths.attendance, label: 'Attendance', icon: ClipboardList },
];

export function AppLayout() {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const nav = isHrdAdmin(user) ? [...HRD_NAV, ...EMPLOYEE_NAV] : EMPLOYEE_NAV;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <span className="flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-lg bg-accent text-accent-fg">
              <CalendarCheck aria-hidden className="size-4" />
            </span>
            <span className="hidden sm:inline">WFH Attendance</span>
          </span>

          <nav aria-label="Main" className="hidden flex-1 gap-1 md:flex">
            {nav.map((item) => (
              <NavItemLink key={item.to} item={item} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-fg-muted">{user.employeeCode}</p>
            </div>
            <Badge tone={isHrdAdmin(user) ? 'primary' : 'neutral'}>{ROLE_LABELS[user.role]}</Badge>
            <Button variant="ghost" size="sm" onClick={logout} aria-label="Log out">
              <LogOut aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>

        <MobileNav items={nav} />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

function MobileNav({ items }: { items: NavItem[] }) {
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // The strip scrolls sideways on small screens; keep the current page's tab visible.
  useEffect(() => {
    navRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="flex [scrollbar-width:none] gap-1 overflow-x-auto border-t px-4 py-2 md:hidden"
    >
      {items.map((item) => (
        <NavItemLink key={item.to} item={item} />
      ))}
    </nav>
  );
}

function NavItemLink({ item: { to, label, icon: Icon } }: { item: NavItem }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }: NavLinkRenderProps) =>
        cn(
          'flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-soft text-primary-ink'
            : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
        )
      }
    >
      <Icon aria-hidden className="size-4" />
      {label}
    </NavLink>
  );
}
