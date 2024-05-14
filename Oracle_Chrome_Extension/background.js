import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.7.5/+esm";

/* ----------------------------- EXTENSION INIT -----------------------------  */
chrome.runtime.onInstalled.addListener(() => {
  // Context menu to add to the CG
  chrome.contextMenus.create({
    id: "addCG",
    title: "Send Image To CG",
    contexts: ["image"], // Context Menu item will appear when right-clicking images and highlighted text
  });

  // Context menu to clear the CG
  chrome.contextMenus.create({
    id: "clearCG",
    title: "Clear CG Layer",
    contexts: ["image"], // Context Menu item will appear when right-clicking images and highlighted text
  });

  // Content menu to send youtube comments to CG
  chrome.contextMenus.create({
    id: "sendYTmsg",
    title: "Send YT Comment to CG",
    contexts: ["all"],
  });
});

/*   --------------------- WEBSOCKET SETUP & SOCKET LISTENERS ---------------------   */

const oracleSocket = io(`https://oracle-connector.alratv.studio/cg1`, {
  transports: ["websocket"],
});

oracleSocket.on("connect", () => {
  console.log("CONNECTED TO SOCKET: ", oracleSocket.id);
  connectionStatus.socket = "online";
});

// What to do when extension cannot connect to oracle socket
oracleSocket.on("connect_error", () => {
  console.error("CANNOT CONNECT TO SOCKET");
  connectionStatus.socket = "offline";
});

// What to do when disconnects from oracle
oracleSocket.on("disconnect", () => {
  console.log("DISCONNECTED FROM SOCKET");
  connectionStatus.socket = "offline";
});

oracleSocket.on("ccg-connected", async () => {
  console.log("CONNECTED TO ORACLE-CCG");
  connectionStatus.ccg1 = "online";
});

oracleSocket.on("ccg-disconnected", () => {
  console.log("DISCONNECTED FROM ORACLE-CCG");
  connectionStatus.ccg1 = "offline";
});

/*   --------------------- SERVICE WORKER & CONTENT-SCRIPT COMMUNICATION ---------------------   */

chrome.runtime.onConnect.addListener((port) => {
  console.log(port);

  if (port) {
    if (port.name === "ytchat") {
      port.onMessage.addListener((comment, evt) => {
        console.log("evt: ", evt);
        console.log(comment);
        ytComment = Object.assign({}, comment);
      });
    } else if (port.name === "popup-manipulation") {
      port.onMessage.addListener((msg, evt) => {
        if (!msg.status) console.log("THERE IS NO STATUS");
        else console.log(msg.status);
      });
      port.postMessage({ update: connectionStatus });
    }
  }
});

const connectionStatus = {
  socket: "offline",
  ccg1: "offline",
  ccg2: "offline",
};

var ytComment = {};

/* -----------------------------  OnClicked Function  ----------------------------- */

// A listener for when 'send to caspar' is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // If the clicked dropdown item isn't the extension just exit
  if (info.menuItemId === "addCG") {
    console.log("CG ADD");

    // Retrieves saved extension settings to process the data
    chrome.storage.sync.get(
      // Dummy data values, just need the names to retrieve their data from storage
      { cgChannel: 7, cgLayer: 60 },
      async (items) => {
        // console.log({"url": info.srcUrl, "channel": items.cgChannel,"layer": items.cgLayer})

        if (oracleSocket.connected === false) {
          console.log("CANNOT COMMUNICATE WITH ORACLE");
        } else {
          console.log({
            channel: items.cgChannel,
            layer: items.cgLayer,
            template: `https://alratv.live/template/Image/showImage.html`,
            data: JSON.stringify({ f0: info.srcUrl }),
          });
          oracleSocket.emit("ccg-add", {
            channel: items.cgChannel,
            layer: items.cgLayer,
            template: `https://alratv.live/template/Image/showImage.html`,
            data: JSON.stringify({ f0: info.srcUrl }),
          });
        }
      }
    );
  } else if (info.menuItemId === "clearCG") {
    console.log("CG CLEAR");

    chrome.storage.sync.get({ cgChannel: 2, cgLayer: 60 }, async (items) => {
      if (oracleSocket.connected === false) {
        console.log("CANNOT SEND MESSAGE TO ORACLE");
      } else {
        oracleSocket.emit("ccg-clear", {
          channel: items.cgChannel,
          layer: items.cgLayer,
        });
      }
    });
  } else if (info.menuItemId === "sendYTmsg") {
    console.log("SENDING YT COMMENT");

    if (Object.keys(ytComment).length == 4) {
      chrome.storage.sync.get({ cgChannel: 7, cgLayer: 60 }, async (items) => {
        console.log("ytComment: ", ytComment);
        if (oracleSocket.connected === false) {
          console.log("CANNOT COMMUNICATE WITH ORACLE");
        } else {
          oracleSocket.emit("ccg-add", {
            channel: items.cgChannel,
            layer: items.cgLayer,
            template: `https://alratv.live/template/Comments/showYTComment.html`,
            data: JSON.stringify({
              f0: ytComment.picUrl,
              f1: ytComment.usrname,
              f2: ytComment.msg,
              f3: ytComment.timestamp,
            }),
          });
        }
      });
    } else {
      console.log("NO YT COMMENT");
    }
  }
});
