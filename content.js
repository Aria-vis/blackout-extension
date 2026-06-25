const blackoutState =
{
    active: false,

    canvas: null,

    boxes: [],

    drawing: false,

    startX: 0,
    startY: 0,

    preview: null
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

function createPreview()
{
    if (blackoutState.preview)
    {
        return;
    }

    const preview = document.createElement("div");

    preview.id = "blackout-preview";

    blackoutState.canvas.appendChild(preview);

    blackoutState.preview = preview;
}

function removePreview()
{
    if (!blackoutState.preview)
    {
        return;
    }

    blackoutState.preview.remove();

    blackoutState.preview = null;
}

function createBlackoutBox(x, y, width, height)
{
    const box = document.createElement("div");

    box.className = "blackout-box";

    box.style.left = x + "px";
    box.style.top = y + "px";

    box.style.width = width + "px";
    box.style.height = height + "px";

    const deleteButton = document.createElement("div");

    deleteButton.className = "blackout-delete";

    deleteButton.textContent = "✕";

    deleteButton.addEventListener("click", (event) =>
    {
        event.stopPropagation();

        box.remove();

        blackoutState.boxes =
            blackoutState.boxes.filter(item => item !== box);
    });

    box.appendChild(deleteButton);

    blackoutState.canvas.appendChild(box);

    blackoutState.boxes.push(box);
}

function handleMouseDown(event)
{
    if (!blackoutState.active)
    {
        return;
    }

    if (event.button !== 0)
    {
        return;
    }

    event.preventDefault();

    blackoutState.drawing = true;

    blackoutState.startX = event.clientX;
    blackoutState.startY = event.clientY;

    createPreview();
}

function handleMouseMove(event)
{
    if (!blackoutState.drawing)
    {
        return;
    }

    event.preventDefault();

    const x = Math.min(event.clientX, blackoutState.startX);

    const y = Math.min(event.clientY, blackoutState.startY);

    const width = Math.abs(event.clientX - blackoutState.startX);

    const height = Math.abs(event.clientY - blackoutState.startY);

    blackoutState.preview.style.left = x + "px";

    blackoutState.preview.style.top = y + "px";

    blackoutState.preview.style.width = width + "px";

    blackoutState.preview.style.height = height + "px";
}

function handleMouseUp(event)
{
    if (!blackoutState.drawing)
    {
        return;
    }

    blackoutState.drawing = false;

    const x = Math.min(event.clientX, blackoutState.startX);

    const y = Math.min(event.clientY, blackoutState.startY);

    const width = Math.abs(event.clientX - blackoutState.startX);

    const height = Math.abs(event.clientY - blackoutState.startY);

    removePreview();

    if (width > 0 && height > 0)
    {
        createBlackoutBox(x, y, width, height);
    }
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

    document.documentElement.classList.add("blackout-active");

    createCanvas();

    document.addEventListener("mousedown", handleMouseDown);

    document.addEventListener("mousemove", handleMouseMove);

    document.addEventListener("mouseup", handleMouseUp);

    document.addEventListener("dragstart", preventDefaultDrag);
}

function deactivateBlackout() {
    blackoutState.active = false;

    document.body.style.cursor = "";

    document.documentElement.classList.remove("blackout-active");

    removePreview();

    blackoutState.drawing = false;

    document.removeEventListener("mousedown", handleMouseDown);

    document.removeEventListener("mousemove", handleMouseMove);

    document.removeEventListener("mouseup", handleMouseUp);

    document.removeEventListener("dragstart", preventDefaultDrag);

    removeCanvas();
}

function preventDefaultDrag(event)
{
    if (!blackoutState.active)
    {
        return;
    }

    event.preventDefault();
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