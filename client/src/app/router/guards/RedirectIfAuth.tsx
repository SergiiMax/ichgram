import { Navigate, Outlet } from 'react-router';
import { useGetMeQuery } from '@/entities/viewer';
import { ROUTES } from '@/shared/config';
import { Spinner } from '@/shared/ui';

export function RedirectIfAuth() {
  const { data: me, isLoading } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (me) {
    return <Navigate to={ROUTES.homepage} replace />;
  }
  return <Outlet />;
}
