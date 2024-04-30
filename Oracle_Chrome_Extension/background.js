import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.7.5/+esm";

/* ----------------------------- EXTENSION INIT -----------------------------  */
chrome.runtime.onInstalled.addListener( () => {

    // Context menu to add to the CGs
    chrome.contextMenus.create({
        "id": "addCG",
        "title": "Send To CG",
        "contexts": ["image"] // Context Menu item will appear when right-clicking images and highlighted text
    });

    // Context menu to clear the CGs
    chrome.contextMenus.create({
        "id": "clearCG",
        "title": "Clear CG",
        "contexts": ["image"] // Context Menu item will appear when right-clicking images and highlighted text
    });
})


/*   --------------------- WEBSOCKET SETUP & SOCKET LISTENERS ---------------------   */

const oracleSocket = io(`https://oracle-connector.alratv.studio/cg1`, {
    transports: ['websocket'],
});

oracleSocket.on("connect", () => {
    console.log('CONNECTED TO ORACLE: ', oracleSocket.id)
})

// What to do when extension cannot connect to oracle socket
oracleSocket.on("connect_error", () => {
    console.error('CANNOT CONNECT TO ORACLE');
})

// What to do when disconnects from oracle
oracleSocket.on("disconnect", () => {
    console.log('DISCONNECTED FROM ORACLE')
})

oracleSocket.on("ccg-connected", () => {
    console.log('CONNECTED TO CCG')
})

oracleSocket.on("ccg-disconnected", () => {
    console.log('DISCONNECTED FROM CCG')
})




/* -----------------------------  OnClicked Function  ----------------------------- */


// A listener for when 'send to caspar' is clicked
chrome.contextMenus.onClicked.addListener( (info, tab) => {
    // If the clicked dropdown item isn't the extension just exit
    if(info.menuItemId === "addCG") {
        console.log('CG ADD')
        
        // Retrieves saved extension settings to process the data
        chrome.storage.sync.get(
            // Dummy data values, just need the names to retrieve their data from storage
            {cgChannel: 2, cgLayer: 60},
            async (items) => {
                // console.log({"url": info.srcUrl, "channel": items.cgChannel,"layer": items.cgLayer})
                
                if( oracleSocket.connected === false) {
                    console.log('CANNOT COMMUNICATE WITH ORACLE')
                }     
                else {
                    console.log({
                        channel: items.cgChannel,
                        layer: items.cgLayer,
                        template: `https://alratv.live/template/showImage.html`,
                        data: JSON.stringify({"f0": info.srcUrl})
                    });
                    oracleSocket.emit('ccg-add', {
                        channel: items.cgChannel,
                        layer: items.cgLayer,
                        template: `https://alratv.live/template/showImage.html`,
                        data: JSON.stringify({f0: info.srcUrl})
                    })    
                }    

            }    
        )    
    } else if(info.menuItemId === "clearCG") {
        console.log('CG CLEAR')

        chrome.storage.sync.get(
            {cgChannel: 2, cgLayer: 60},
            async (items) => {
                if(oracleSocket.connected === false) {
                    console.log('CANNOT SEND MESSAGE TO ORACLE');
                } else {
                    oracleSocket.emit('ccg-clear', {
                        channel: items.cgChannel,
                        layer: items.cgLayer
                    }) 
                }
            }
        )
    }
    
})    





