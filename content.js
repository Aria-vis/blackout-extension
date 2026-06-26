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

function createPreview() {
    if (blackoutState.preview) {
        return;
    }

    const preview = document.createElement("div");

    preview.id = "blackout-preview";

    blackoutState.canvas.appendChild(preview);

    blackoutState.preview = preview;
}

function removePreview() {
    if (!blackoutState.preview) {
        return;
    }

    blackoutState.preview.remove();

    blackoutState.preview = null;
}

function getStorageKey() {
    return "blackout:" + window.location.href;
}

function serializeBoxes() {
    return blackoutState.boxes.map(boxData => {
        return {
            x: boxData.x,
            y: boxData.y,

            width: boxData.width,
            height: boxData.height,

            anchored: boxData.anchored,

            hidden: boxData.hidden
        };
    });
}

async function saveBoxes() {
    const key = getStorageKey();

    await chrome.storage.local.set(
        {
            [key]: serializeBoxes()
        });

    console.log("BlackOut saved");
}

async function loadBoxes() {
    const key = getStorageKey();

    const result = await chrome.storage.local.get(key);

    const savedBoxes = result[key] || [];

    for (const boxData of savedBoxes) {
        createBlackoutBox(boxData, false);
    }

    console.log("BlackOut loaded");
}

function createBlackoutBox(boxData, shouldSave = true) {
    const box = document.createElement("div");
    boxData.element = box;

    box.className = "blackout-box";

    box.style.left = boxData.x + "px";
    box.style.top = boxData.y + "px";

    box.style.width = boxData.width + "px";
    box.style.height = boxData.height + "px";

    const pinIndicator = document.createElement("div");

    pinIndicator.className = "blackout-pin-indicator";

    pinIndicator.textContent = "📍";

    box.appendChild(pinIndicator);

    const pinButton = document.createElement("div");

    pinButton.className = "blackout-pin";

    pinButton.textContent = "📌";

    pinButton.addEventListener("click", (event) => {
        event.stopPropagation();

        const rect = box.getBoundingClientRect();

        if (!boxData.anchored) {
            box.style.position = "fixed";

            box.style.left = rect.left + "px";
            box.style.top = rect.top + "px";

            boxData.anchored = true;

            pinButton.textContent = "📍";

            box.classList.add("pinned");
        }
        else {
            box.style.position = "absolute";

            box.style.left = window.scrollX + rect.left + "px";
            box.style.top = window.scrollY + rect.top + "px";

            boxData.anchored = false;

            pinButton.textContent = "📌";

            box.classList.remove("pinned");
        }

        saveBoxes();
    });

    const eyeButton = document.createElement("div");

    eyeButton.className = "blackout-eye";

    eyeButton.textContent = "👁";

    eyeButton.addEventListener("click", (event) => {
        event.stopPropagation();

        boxData.hidden = !boxData.hidden;

        box.classList.toggle("hidden", boxData.hidden);

        eyeButton.textContent = boxData.hidden ? "🙈" : "👁";

        saveBoxes();
    });

    const deleteButton = document.createElement("div");

    deleteButton.className = "blackout-delete";

    deleteButton.textContent = "✕";

    deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();

        box.remove();

        blackoutState.boxes =
            blackoutState.boxes.filter(item => item.element !== box);

        saveBoxes();
    });

    if (boxData.hidden) {
        eyeButton.textContent = "🙈";

        box.classList.add("hidden");
    }
    else {
        eyeButton.textContent = "👁";
    }

    if (boxData.anchored) {
        pinButton.textContent = "📍";

        box.classList.add("pinned");

        box.style.position = "fixed";
    }
    else {
        pinButton.textContent = "📌";
    }

    box.appendChild(pinButton);

    box.appendChild(eyeButton);

    box.appendChild(deleteButton);

    blackoutState.canvas.appendChild(box);

    blackoutState.boxes.push(boxData);

    if (shouldSave) {
        saveBoxes();
    }
}

function handleMouseDown(event) {
    if (!blackoutState.active) {
        return;
    }

    if (event.button !== 0) {
        return;
    }

    event.preventDefault();

    blackoutState.drawing = true;

    blackoutState.startX = event.clientX;
    blackoutState.startY = event.clientY;

    createPreview();
}

function handleMouseMove(event) {
    if (!blackoutState.drawing) {
        return;
    }

    event.preventDefault();

    const x = window.scrollX +
        Math.min(event.clientX, blackoutState.startX);

    const y = window.scrollY +
        Math.min(event.clientY, blackoutState.startY);

    const width = Math.abs(event.clientX - blackoutState.startX);

    const height = Math.abs(event.clientY - blackoutState.startY);

    blackoutState.preview.style.left = x + "px";

    blackoutState.preview.style.top = y + "px";

    blackoutState.preview.style.width = width + "px";

    blackoutState.preview.style.height = height + "px";
}

function handleMouseUp(event) {
    if (!blackoutState.drawing) {
        return;
    }

    blackoutState.drawing = false;

    const x = window.scrollX +
        Math.min(event.clientX, blackoutState.startX);

    const y = window.scrollY +
        Math.min(event.clientY, blackoutState.startY);

    const width = Math.abs(event.clientX - blackoutState.startX);

    const height = Math.abs(event.clientY - blackoutState.startY);

    removePreview();

    if (width > 0 && height > 0) {
        createBlackoutBox(
            {
                x,
                y,

                width,
                height,

                anchored: false,

                hidden: false
            });
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

async function activateBlackout() {
    blackoutState.active = true;

    document.body.style.cursor = "crosshair";

    document.documentElement.classList.add("blackout-active");

    createCanvas();

    blackoutState.boxes = [];

    await loadBoxes();

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

function preventDefaultDrag(event) {
    if (!blackoutState.active) {
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