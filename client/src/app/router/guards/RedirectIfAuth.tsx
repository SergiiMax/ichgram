import { Navigate, Outlet } from 'react-router';
import { useGetMeQuery } from '@/entities/viewer';
import { ROUTES } from '@/shared/config';

export function RedirectIfAuth() {
  const { data: me, isLoading } = useGetMeQuery();

  if (isLoading) {
    return <p className="p-4 text-secondary">Loading…</p>;
  }
  if (me) {
    return <Navigate to={ROUTES.homepage} replace />;
  }
  return <Outlet />;
}
