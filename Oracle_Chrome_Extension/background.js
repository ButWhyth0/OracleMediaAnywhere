chrome.runtime.onInstalled.addListener( () => {
    // Defining the item in the right-click menu
    chrome.contextMenus.create({
        "id": "sendToCaspar",
        "title": "Send To Caspar",
        "contexts": ["image"] // Context Menu item will appear when right-clicking images and highlighted text
    });
})



function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g,
        "&#039;");
}




// A listener for when 'send to caspar' is clicked
chrome.contextMenus.onClicked.addListener( (info, tab) => {
    // If the clicked dropdown item isn't the extension just exit
    if(info.menuItemId !== "sendToCaspar") return

    // Retrieves saved extension settings to process the data
    chrome.storage.sync.get(
        // Dummy data values, just need the names to retrieve their data from storage
        {cgLayer: 60, cgSelection: 6},
        async (items) => {
            console.log('cgLayer: ',items.cgLayer,'\ncgSelection: ',items.cgSelection)

            // Calls the casparcg nodejs middleware
            try {
                const response = await fetch(`http://192.168.70.9:8080/casparcg/api/showImage?CG=${items.cgSelection? items.cgSelection : 6}`, // If there is no CG[Number], it will default to CG6
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({"url": info.srcUrl, layer: items.cgLayer})
                })
            } catch (error) {
                console.error('THERE WAS AN ERROR FETCHING API\n')
                console.error(error)
            }
        }
    )
})