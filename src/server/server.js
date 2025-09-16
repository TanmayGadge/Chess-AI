import { WebSocketServer } from "ws";
import WebSocket from "ws";

const port = 8080;
const wss = new WebSocketServer({ port });

let clientId = 0;
let clients = new Map();

wss.on("connection", (ws) => {

  ws.id = ++clientId;
  clients.set(ws.id, ws);
  console.log(`Client connected: ${ws.id}`);

  ws.on("message", (message) => {

    console.log(`Received message from client ${ws.id}: ${message.toString()}`);

    if(ws.id === 1) {
        let client2 = clients.get(2);
        if(client2 && client2.readyState === WebSocket.OPEN){
          client2.send(message)
        }
    }else if (ws.id === 2){
      let client1 = clients.get(1);
      if(client1 && client1.readyState === WebSocket.OPEN){
        client1.send(message)
      }
    }
    console.log(message.toString());
  });
});

console.log(`Websocket Server running on port: ${port}`);
