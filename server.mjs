#!/usr/local/bin/node

import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 6200, host: "0.0.0.0" });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", (data) => {
    let s = data.toString();
    let op = JSON.parse(s);
    if (op.action === "sender") {
      // mark client as sender
      ws.controlSender = true;
    } else if (op.action === "control") {
      // console.log("control clients:", wss.clients.size);
      wss.clients.forEach((client) => {
        if (client !== ws && !client.controlSender) {
          client.send(s);
        }
      });
    } else {
      console.warn("unknown data:", op.action);
    }
  });
});

console.log("started at 6200");
