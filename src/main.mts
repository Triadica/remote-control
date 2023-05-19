import {
  type ControlStates,
  renderControl,
  startControlLoop,
} from "@triadica/touch-control";

let ws = new WebSocket(`ws://${location.hostname}:6200`);
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

let main = () => {
  renderControl();
  startControlLoop(10, (elapsed, states, delta) => {
    if (connected) {
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
