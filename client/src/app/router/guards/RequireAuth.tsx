import { Navigate, Outlet, useLocation } from 'react-router';
import { useGetMeQuery } from '@/entities/viewer';
import { ROUTES } from '@/shared/config';

export function RequireAuth() {
  const { data: me, isLoading } = useGetMeQuery();
  const location = useLocation();

  if (isLoading) {
    return <p className="p-4 text-secondary">Loading…</p>;
  }
  if (!me) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }
  return <Outlet />;
}
