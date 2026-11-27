import { ROUTES } from '@/shared/config';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Oops! Page Not Found (404 Error)</h1>
      <Link to={ROUTES.homepage} className="text-link">
        Go to the home page
      </Link>
    </div>
  );
}
