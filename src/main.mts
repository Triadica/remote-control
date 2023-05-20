import queryString from "query-string";
import {
  type ControlStates,
  renderControl,
  startControlLoop,
} from "@triadica/touch-control";

const parsed = queryString.parse(location.search);

let host = (parsed.host as string) || location.hostname;
let port = parseInt((parsed.port as string) || "6200");

let ws = new WebSocket(`ws://${host}:${port}`);
let connected = false;

ws.onopen = (event) => {
  connected = true;

  ws.send(JSON.stringify({ action: "sender" }));
};

ws.onclose = (event) => {
  connected = false;
};

ws.onerror = (error) => {
  console.error("error", error);
};

ws.onmessage = (event) => {
  console.log("message event");
};

let showData = (
  elapsed: number,
  states: ControlStates,
  delta: ControlStates
) => {
  // console.log(
  //   "showing",
  //   elapsed,
  //   states.leftMove,
  //   states.rightMove,
  //   states.leftA,
  //   states.rightA
  // );
  let target = document.querySelector("pre");
  if (target) {
    target.innerText = JSON.stringify(
      { states: states, delta: delta },
      null,
      2
    );
  }
};

let allZero = (xs: number[]): boolean => {
  for (let idx = 0; idx < xs.length; idx++) {
    if (xs[idx] !== 0) {
      return false;
    }
  }
  return true;
};
let main = () => {
  renderControl();
  startControlLoop(10, (elapsed, states, delta) => {
    if (connected) {
      if (
        allZero(delta.leftMove) &&
        allZero(delta.rightMove) &&
        allZero(states.leftMove) &&
        allZero(states.rightMove)
      ) {
        return;
      }
      ws.send(
        JSON.stringify({
          action: "control",
          elapsed,
          states,
          delta,
        })
      );
    }
    showData(elapsed, states, delta);
  });
};

main();
