import { useParams } from 'react-router';

export function ProfilePage() {
  const { username } = useParams();
  return <h1 className="text-xl font-semibold">Profile: {username}</h1>;
}
