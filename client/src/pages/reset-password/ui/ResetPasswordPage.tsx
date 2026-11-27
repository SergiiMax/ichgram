import { useParams } from 'react-router';

export function ResetPasswordPage() {
  const { token } = useParams();
  return <h1 className="text-xl font-semibold">New password (token: {token})</h1>;
}
