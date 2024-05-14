const channelValue = document.querySelector("#cg_channel");
const layerValue = document.querySelector("#cg_layer");
const container = document.querySelector(".container");
const status = document.querySelector("#status");

/* ------------------------- CHROME EXTENSION FUNCTIONS ------------------------- */

// Saves options to chrome.storage
const saveOptions = () => {
  const channel = document.getElementById("cg_channel").value;
  const layer = document.getElementById("cg_layer").value;

  chrome.storage.sync.set({ cgChannel: channel, cgLayer: layer }, () => {
    // Updates status to let user know that the changes have been saved
    status.style.animationName = "fade-in";
    setTimeout(() => {
      status.style.animationName = "fade-out";
    }, 1000);
  });
};

// Restores previously saved options
const restoreOptions = () => {
  chrome.storage.sync.get({ cgChannel: 2, cgLayer: 60 }, (items) => {
    console.log("OPTIONS RESTORED");
    document.getElementById("cg_channel").value = items.cgChannel;
    document.getElementById("cg_layer").value = items.cgLayer;
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);

/* ------------------------- OTHER FUNCTIONS ------------------------- */

var port = chrome.runtime.connect({ name: "popup-manipulation" });
port.postMessage({ status: "popup-loaded" });

port.onMessage.addListener((msg) => {
  console.log(msg);
  let { socket, ccg1, ccg2 } = msg.update;

  // ORACLE WEBSOCKET CONNECTION
  if (socket === "online") {
    document.querySelector("#icon").style.filter = "grayscale(0%)";
    port.postMessage({ status: "Popup-Status: Connected to Oracle Socket" });
  } else {
    document.querySelector("#icon").style.filter = "grayscale(100%)";
    port.postMessage({
      status: "Popup-Status: NOT Connected to Oracle Socket",
    });
  }

  // CCG1 CONNECTION
  if (ccg1 === "online") {
    document.querySelector("#ccg1").style.color = "var(--positive)";
    document.querySelector("#ccg1 div").style.backgroundColor =
      "var(--positive)";
    port.postMessage({ status: "Popup-Status: Connected to CCG1" });
  } else {
    document.querySelector("#ccg1").style.color = "var(--disconnected)";
    document.querySelector("#ccg1 div").style.backgroundColor =
      "var(--disconnected)";
    port.postMessage({ status: "Popup-Status: NOT Connected to CCG1" });
  }

  // CCG2 CONNECTION
  if (ccg2 === "online") {
    document.querySelector("#ccg2").style.color = "var(--positive)";
    document.querySelector("#ccg2 div").style.backgroundColor =
      "var(--positive)";
    port.postMessage({ status: "Popup-Status: Connected to CCG2" });
  } else {
    document.querySelector("#ccg2").style.color = "var(--disconnected)";
    document.querySelector("#ccg2 div").style.backgroundColor =
      "var(--disconnected)";
    port.postMessage({ status: "Popup-Status: NOT Connected to CCG2" });
  }
});
