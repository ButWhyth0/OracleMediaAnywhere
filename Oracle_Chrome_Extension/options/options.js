// default values
const ip_default = "192.168.70.9";
const port_default = 5250;
const channel_default = 2;
const layer_default = 60;

// Saves options to chrome.storage
const saveOptions = () => {
    const ip = document.getElementById("cg_ip").value
    const port = document.getElementById("cg_port").value
    const channel = document.getElementById("cg_channel").value
    const layer = document.getElementById("cg_layer").value

    chrome.storage.sync.set(
        {cgIP: ip, cgPort: port, cgChannel: channel, cgLayer: layer},
        () => {
            console.log('OPTIONS SAVED')
            // Updates status to let user know that the changes have been saved
            const status = document.getElementById("status");
            status.textContent = "Options were saved.";
            setTimeout( () => {
                status.textContent = '';
            }, 750);
        }
    )
}

// Restores previously saved options
const restoreOptions = () => {
    chrome.storage.sync.get(
        {cgIP: "192.168.70.9", cgPort: 5250, cgChannel: 2, cgLayer: 60},
        (items) => {
            console.log('OPTIONS RESTORED')
            document.getElementById("cg_ip").value = items.cgIP;
            document.getElementById("cg_port").value = items.cgPort;
            document.getElementById("cg_channel").value = items.cgChannel;
            document.getElementById("cg_layer").value = items.cgLayer;
        }
    )
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);