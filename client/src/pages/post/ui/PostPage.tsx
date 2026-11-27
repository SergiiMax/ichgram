import { useParams } from 'react-router';

export function PostPage() {
  const { postId } = useParams();
  return <h1 className="text-xl font-semibold">Post: {postId}</h1>;
}
