// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelectedHTML") {
    const selectedRange = window.getSelection().getRangeAt(0); // Get the selected range
    const selectedHTML = rangeToHTML(selectedRange);
    sendResponse({ selectedHTML });
  }
});

// Helper function to convert a range to HTML
function rangeToHTML(range) {
  const div = document.createElement("div");
  div.appendChild(range.cloneContents());
  return div.innerHTML;
}