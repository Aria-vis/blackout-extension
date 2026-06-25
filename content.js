const blackoutState =
{
    active: false,
    canvas: null,
    boxes: []
};

function createCanvas() {
    if (blackoutState.canvas) {
        return;
    }

    const canvas = document.createElement("div");

    canvas.id = "blackout-canvas";

    document.body.appendChild(canvas);

    blackoutState.canvas = canvas;

    console.log("BlackOut canvas created");
}

function removeCanvas() {
    if (!blackoutState.canvas) {
        return;
    }

    blackoutState.canvas.remove();

    blackoutState.canvas = null;

    console.log("BlackOut canvas removed");
}

function activateBlackout() {
    blackoutState.active = true;

    document.body.style.cursor = "crosshair";

    createCanvas();
}

function deactivateBlackout() {
    blackoutState.active = false;

    document.body.style.cursor = "";

    removeCanvas();
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "BLACKOUT_TOGGLE") {
        return;
    }

    if (message.active) {
        activateBlackout();
    }
    else {
        deactivateBlackout();
    }
});