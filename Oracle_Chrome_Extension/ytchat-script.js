// Opens a port connection with background.js
const port = chrome.runtime.connect({ name: "ytchat" });

// make a function here you pass it event it traverses it and gives you back object
const getYouTubeComment = (e) => {
  let picUrl;
  let usrname;
  let msg;
  let timestamp;

  if (!e) return {};
  else {
    //if found return filled object

    // If user click directly on the message
    if (e.target.id === "message") {
      picUrl = e.target.offsetParent
        .querySelector("#img")
        .src.replace("s32", "s900");
      usrname = e.target.offsetParent.querySelector("#author-name").innerText;
      msg = e.target.innerText;
      timestamp = e.target.offsetParent.querySelector("#timestamp").innerText;
      // If user rightclicks on the empty space next to the message             ---e.target.querySelector('#message').innerText---
    } else if (e.target.nodeName === "YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER") {
      picUrl = e.target.querySelector("#img").src.replace("s32", "s900");
      usrname = e.target.querySelector("#author-name").innerText;
      msg = e.target.querySelector("#message").innerText;
      timestamp = e.target.querySelector("#timestamp").innerText;
      // If the user rightclicks on the commenter name/ profile picture         ---e.target.offsetParent.querySelector('#message').innerText---
    } else {
      // If the right-clicked item is the image, then retrieve src, but if nametag clicked then has to retrieve parent and then queryselect
      picUrl =
      e.target.id === "img"
      ? e.target.src.replace("s32", "s900")
      : e.target.offsetParent
      .querySelector("#img")
      .src.replace("s32", "s900");
      usrname =
      e.target.id === "author-name"
      ? e.target.innerText
      : e.target.offsetParent.querySelector("#author-name").innerText;
      msg = e.target.offsetParent.querySelector("#message").innerText;
      timestamp = e.target.offsetParent.querySelector("#timestamp").innerText;
    }
    return { picUrl: picUrl, usrname: usrname, msg: msg, timestamp: timestamp };
  }
};

// When user rightclicks to select 'Send YT Comment to Oracle' button
window.oncontextmenu = (e) => {

  const messageObject = getYouTubeComment(e);

  if (Object.keys(messageObject).length) {
    port.postMessage(messageObject);
  } else {
    console.error("NO DATA WAS RETRIEVED");
  }
};
