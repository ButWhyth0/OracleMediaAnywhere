
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
    // console.log(info)
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

// // Default values for ip, port, channel, and layer
// var cg_ip = '192.168.70.9';
// var cg_port = 8080;
// var cg_channel = 2;
// var cg_layer = 60;

// // Restores previously saved options
// const restoreOptions = () => {
//     chrome.storage.sync.get(
//         // default values, needed otherwise these variables will be undefined
//         {cgIP: "192.168.70.9", cgPort: 8080, cgChannel: 2, cgLayer: 60},
//         (items) => {
//             console.log('OPTIONS RESTORED')
//             cg_ip = items.cgIP;
//             cg_port = items.cgPort;
//             cg_channel = items.cgChannel;
//             cg_layer = items.cgLayer;
//             console.log('cgIP: ',cg_ip)
//             console.log('cgPORT: ',cg_port)
//             console.log('cgCHANNEL: ',cg_channel)
//             console.log('cgLAYER: ',cg_layer)
//         }
//     )
// }


// // Handles the data that is being sent
// async function handleData(type, data) {
//     try {
//         await restoreOptions()
//         const response = await fetch(`http://192.168.1.58:8080/casparcg2/api/showSelection?type=${type}`,{
//             method: 'POST',
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({"data": data,"channel": 2, "layer": 60})
//         })
//     } catch (error) {
//         console.error('THERE WAS AN ERROR:\n',error)
//     }
// }


// Handles the data that is being sent
const handleData = async(type,data) => {
    chrome.storage.sync.get(
        {cgIP: "", cgPort: 0, cgChannel: 0, cgLayer: 0},
        async (items) => {
            var cg_ip= items.cgIP;
            var cg_port = items.cgPort;
            var cg_channel = items.cgChannel;
            var cg_layer = items.cgLayer;

            // Try-catch block is inside the storage-get block so that the updated information is sent
            try {
                console.log('cgIP: ',cg_ip)
                console.log('cgPORT: ',cg_port)
                console.log('cgCHANNEL: ',cg_channel)
                console.log('cgLAYER: ',cg_layer)
                const response = await fetch(`https://${cg_ip}:${cg_port}/casparcg2/api/showSelection?type=${type}`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({"data": data, "channel": cg_channel, "layer": cg_layer})
                }
            )
            } catch (error) {
                console.error('THERE WAS AN ERROR CALLING THE API:\n',error)
                
            }
        }
    )
}