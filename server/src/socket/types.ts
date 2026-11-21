import type { DefaultEventsMap, Server, Socket } from 'socket.io';

type SocketData = { userId: string };

export type AppServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;
export type AppSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;
