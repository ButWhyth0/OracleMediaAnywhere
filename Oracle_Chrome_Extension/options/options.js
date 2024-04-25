// Saves options to chrome.storage
const saveOptions = () => {
    const channel = document.getElementById("cg_channel").value;
    const layer = document.getElementById("cg_layer").value;
    const selection = document.getElementById("cg_selection").value;

    chrome.storage.sync.set(
        {cgLayer: layer, cgSelection: selection},
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
        {cgLayer: 60, cgSelection: 1},
        (items) => {
            console.log('OPTIONS RESTORED')
            document.getElementById("cg_layer").value = items.cgLayer;
            document.getElementById("cg_selection").value = items.cgSelection;
        }
    )
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);