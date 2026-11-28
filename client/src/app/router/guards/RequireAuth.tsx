import { Navigate, Outlet, useLocation } from 'react-router';
import { useGetMeQuery } from '@/entities/viewer';
import { ROUTES } from '@/shared/config';
import { Spinner } from '@/shared/ui';

export function RequireAuth() {
  const { data: me, isLoading } = useGetMeQuery();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!me) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }
  return <Outlet />;
}
