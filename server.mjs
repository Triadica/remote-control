#!/usr/local/bin/node

import { WebSocketServer } from "ws";

let port = parseInt(process.env.PORT || "6200");

let verbose = process.env.verbose;

const wss = new WebSocketServer({ port, host: "0.0.0.0" });

let lastTime = Date.now();

wss.on("connection", function connection(ws) {
  console.log(`new connection. (${wss.clients.size})`);

  ws.on("error", console.error);

  ws.on("message", (data) => {
    let s = data.toString();
    let op = JSON.parse(s);
    if (op.action === "sender") {
      // mark client as sender
      ws.controlSender = true;
      console.log("sender declared");
    } else if (op.action === "control" || op.action === "button") {
      let now = Date.now();
      if (verbose === "true") {
        console.debug("control time delta:", now - lastTime);
      }
      lastTime = now;
      wss.clients.forEach((client) => {
        if (client !== ws && !client.controlSender) {
          client.send(s);
        }
      });
    } else {
      console.warn("unknown data:", op.action);
    }
  });

  ws.on("close", () => {
    console.log(`connection closed. (${wss.clients.size})`);
  });
});

console.log("Started at 6200");
