// websocket.ts
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface Connection {
  userId: string;
  ws: WebSocket;
}

const connections: Connection[] = [];

const initWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      const data = JSON.parse(message.toString());
      if (data.type === 'init' && data.userId) {
        connections.push({ userId: data.userId, ws });
        console.log(`User ${data.userId} connected`);
      }
    });

    ws.on('close', () => {
      const index = connections.findIndex((conn) => conn.ws === ws);
      if (index !== -1) {
        console.log(`User ${connections[index].userId} disconnected`);
        connections.splice(index, 1);
      }
    });
  });

  return wss;
};

const notifyUser = (userId: string, message: any) => {
  const connection = connections.find((conn) => conn.userId === userId);
  if (connection) {
    connection.ws.send(JSON.stringify(message));

  }
};

export { initWebSocketServer, notifyUser };
