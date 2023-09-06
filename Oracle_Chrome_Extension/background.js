
chrome.runtime.onInstalled.addListener( () => {
    // Defining the item in the right-click menu
    chrome.contextMenus.create({
        "id": "sendToCaspar",
        "title": "Send To Caspar",
        "contexts": ["image", "selection"] // Context Menu item will appear when right-clicking images and highlighted text
    });
})

function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g,
        "&#039;");
}

// A listener for when 'send to caspar' is clicked
chrome.contextMenus.onClicked.addListener( (info, tab) => {
    console.log(info)
    if(info.menuItemId !== "sendToCaspar") return

    if(info.srcUrl) {
        handleData('image', info.srcUrl) // Data is sent to another function for processing/ handling
    }

    if(info.selectionText) {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: (selectedText) => {
                // Gets the selected HTML
                const range = document.getSelection().getRangeAt(0);
                const div = document.createElement('div');
                div.appendChild(range.cloneContents())

                // Removes all the unnecessary HTML that isn't need for the definition
                div.querySelector('sup') ? div.querySelector('sup').remove() : div ;
                div.querySelectorAll('[role="list"]').forEach(junkElement => junkElement.parentElement.parentElement.remove())
                div.querySelectorAll('a[tabIndex="-1"]').forEach(junkElement => junkElement.parentElement.parentElement.remove())
                div.querySelectorAll('span.kqEaA').forEach(junkElement => junkElement.parentElement.parentElement.remove())
                div.querySelectorAll('a').forEach(link => {link.outerHTML = link.innerText})

                return div.innerHTML;
            },
            args: [info.selectionText],
        }, (result) => {
            console.log(result[0].result)
            handleData('text', escapeHtml(result[0].result)) // Data is sent to another function for processing/ handling
        })
    }
})

// Handles the data that is being sent
async function handleData(type, data) {
    try {
        const response = await fetch(`http://192.168.1.58:8080/casparcg2/api/showSelection?type=${type}`,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"data": data})
        })
    } catch (error) {
        console.error('THERE WAS AN ERROR:\n',error)
    }
}