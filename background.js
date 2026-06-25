const activeTabs = new Set();

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) {
        return;
    }

    const tabId = tab.id;

    let isActive;

    if (activeTabs.has(tabId)) {
        activeTabs.delete(tabId);
        isActive = false;
    }
    else {
        activeTabs.add(tabId);
        isActive = true;
    }

    try {
        await chrome.tabs.sendMessage(tabId,
            {
                type: "BLACKOUT_TOGGLE",
                active: isActive
            });
    }
    catch (error) {
        console.warn("BlackOut cannot run on this page.", error);
        return;
    }
    if (isActive) {
        await chrome.action.setBadgeText(
            {
                tabId,
                text: "ON"
            });

        await chrome.action.setBadgeBackgroundColor(
            {
                tabId,
                color: "#ff0000"
            });
    }
    else {
        await chrome.action.setBadgeText(
            {
                tabId,
                text: ""
            });
    }
});