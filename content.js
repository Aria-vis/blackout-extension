let isBlackoutActive = false;

function activateBlackout()
{
    document.body.style.cursor = "crosshair";
}

function deactivateBlackout()
{
    document.body.style.cursor = "";
}

chrome.runtime.onMessage.addListener((message) =>
{
    if (message.type !== "BLACKOUT_TOGGLE")
    {
        return;
    }

    isBlackoutActive = message.active;

    if (isBlackoutActive)
    {
        activateBlackout();
    }
    else
    {
        deactivateBlackout();
    }

    console.log("BlackOut active:", isBlackoutActive);
});