// Defining the item in the right-click menu
chrome.contextMenus.create({
    "id": "sendToCaspar",
    "title": "Send To Caspar",
    "contexts": ["image", "selection"] // Context Menu item will appear when right-clicking images and highlighted text
});

// Class for the selected data to be sent
const Selection = class {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}

// A listener for when 'send to caspar' is clicked
chrome.contextMenus.onClicked.addListener( info => {
    console.log(info)
    if(info.srcUrl) var userSelection = new Selection('image', info.srcUrl); // If there is an image, then send data with image type
    if(info.selectionText) var userSelection = new Selection('text', info.selectionText); // If there is text, then send data with text type
    handleData(userSelection) // Data is sent to another function for processing/ handling
})

// Handles the data that is being sent
async function handleData(selection) {
    try {
        const response = await fetch(`http://192.168.1.58:8080/casparcg2/api/showSelection?type=${selection.type}&data=${selection.data}`,{
            method: 'POST',
        })
    } catch (error) {
        console.error('THERE WAS AN ERROR:\n',error)
    }
}