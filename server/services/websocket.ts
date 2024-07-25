import { WebSocketServer } from "ws"; // Import WebSocketServer

// Function to initialize WebSocket server
export function initializeWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server });

  // Event listener for new client connections
  wss.on('connection', (ws) => {
    console.log("Client connected");

    
    ws.on('message', (message) => {
      const data = JSON.parse(message.toString());
      if (data.type === 'edit') {
        // Broadcast the edit to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    });
    // Event listener for client disconnections
    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
}