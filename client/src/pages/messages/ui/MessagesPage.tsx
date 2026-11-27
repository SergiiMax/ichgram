import { useParams } from 'react-router';

export function MessagesPage() {
  const { conversationId } = useParams();
  return (
    <h1 className="text-xl font-semibold">Messages{conversationId ? `: ${conversationId}` : ''}</h1>
  );
}
