// Saves options to chrome.storage
const saveOptions = () => {
    const channel = document.getElementById("cg_channel").value = items.cgChannel;
    const layer = document.getElementById("cg_layer").value;

    chrome.storage.sync.set(
        {cgChannel: channel, cgLayer: layer},
        () => {
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
        {cgChannel: 2, cgLayer: 60},
        (items) => {
            console.log('OPTIONS RESTORED')
            document.getElementById("cg_channel").value = items.cgChannel;
            document.getElementById("cg_layer").value = items.cgLayer;
        }
    )
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);