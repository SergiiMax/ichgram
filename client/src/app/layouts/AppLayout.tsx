import { ROUTES } from '@/shared/config';
import { generatePath, NavLink, Outlet } from 'react-router';

const NAV_ITEMS = [
  { to: ROUTES.homepage, label: 'Home' },
  { to: ROUTES.explore, label: 'Explore' },
  { to: ROUTES.messages, label: 'Messages' },
  { to: generatePath(ROUTES.profile, { username: 'demo' }), label: 'Profile' },
];

export function AppLayout() {
  return (
    <div className="flex min-h-dvh">
      <nav className="flex w-sidebar shrink-0 flex-col gap-2 border-r border-border p-6">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.homepage}
            className={({ isActive }) => (isActive ? 'font-bold' : '')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4">
          <Outlet />
        </main>
        <footer className="py-6 text-center text-xs text-secondary">© 2026 ICHgram</footer>
      </div>
    </div>
  );
}
