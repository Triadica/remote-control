import queryString from "query-string";
import {
  type ControlStates,
  renderControl,
  startControlLoop,
} from "@triadica/touch-control";

const parsed = queryString.parse(location.search);

let host = (parsed.host as string) || location.hostname;
let port = parseInt((parsed.port as string) || "6200");
let disableRaf = parsed["disable-raf"] === "true";

let connected = false;

let ws: WebSocket;

let connect = () => {
  ws = new WebSocket(`ws://${host}:${port}`);

  ws.onopen = (event) => {
    connected = true;
    document.querySelector(".status")!.innerHTML = "On";

    ws.send(JSON.stringify({ action: "sender" }));
  };

  ws.onclose = (event) => {
    connected = false;
    document.querySelector(".status")!.innerHTML = "Off";
  };

  ws.onerror = (error) => {
    console.error("error", error);
  };

  ws.onmessage = (event) => {
    console.log("message event");
  };
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
  let target = document.querySelector("pre.log");
  if (target) {
    target.innerHTML = JSON.stringify(
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
  connect();
  renderControl();
  startControlLoop(
    10,
    (elapsed, states, delta) => {
      showData(elapsed, states, delta);
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
    },
    { disableRaf }
  );

  console.log("hash:", __COMMIT_HASH__);
  document.querySelector(".hash")!.innerHTML = __COMMIT_HASH__;

  document.querySelector(".toggle")?.addEventListener("click", () => {
    ws.send(
      JSON.stringify({
        action: "button",
        button: "toggle",
      })
    );
  });
  document.querySelector(".switch")?.addEventListener("click", () => {
    ws.send(
      JSON.stringify({
        action: "button",
        button: "switch",
      })
    );
  });

  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      if (!connected) {
        connect();
      }
    }
  });
};

main();

declare const __COMMIT_HASH__: string;
