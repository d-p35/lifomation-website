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
    ws.on('message', (message) => {
      const data = JSON.parse(message.toString());
      if (data.type === 'init' && data.userId ) {
        connections.push({ userId: data.userId, ws });
        console.log('New connection', data.userId);
      }
    });

    ws.on('close', () => {
      const index = connections.findIndex((conn) => conn.ws === ws);
      if (index !== -1) {
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
