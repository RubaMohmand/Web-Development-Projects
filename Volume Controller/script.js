const trackContainer = document.getElementById("trackCore");
const fluidFill = document.getElementById("fluidFill");
const thumbNode = document.getElementById("thumbNode");
const bubbleTooltip = document.getElementById("bubbleTooltip");
const valueOutput = document.getElementById("valueOutput");
const iconMin = document.getElementById("iconMin");
const iconMax = document.getElementById("iconMax");

let runtimeActiveState = false;
let globalSliderPercentageValue = 50;

/* ==============================
   CALCULATE SLIDER POSITION
   ============================== */

function evaluateCoordinateInput(positionX) {
  const trackBounds = trackContainer.getBoundingClientRect();

  let currentOffsetValue = positionX - trackBounds.left;

  let precisionPercentage = (currentOffsetValue / trackBounds.width) * 100;

  precisionPercentage = Math.max(0, Math.min(precisionPercentage, 100));

  globalSliderPercentageValue = Math.round(precisionPercentage);

  renderComponentStates(trackBounds.width);
}

/* ==============================
   RENDER COMPONENT
   ============================== */

function renderComponentStates(trackWidthValue) {
  const calculatedWidth =
    trackWidthValue || trackContainer.getBoundingClientRect().width;

  const absoluteThumbWidth = 34;
  const absoluteTooltipWidth = 48;

  /* Liquid width */

  fluidFill.style.width = `${globalSliderPercentageValue}%`;

  /* Thumb position */

  const horizontalThumbMapPosition =
    (globalSliderPercentageValue / 100) *
    (calculatedWidth - absoluteThumbWidth);

  thumbNode.style.left = `${horizontalThumbMapPosition}px`;

  /* Tooltip position */

  const horizontalTooltipMapPosition =
    (globalSliderPercentageValue / 100) *
    (calculatedWidth - absoluteTooltipWidth);

  bubbleTooltip.style.left = `${horizontalTooltipMapPosition}px`;

  /* Percentage text */

  const parsedStringOutput = `${globalSliderPercentageValue}%`;

  valueOutput.textContent = parsedStringOutput;

  bubbleTooltip.textContent = parsedStringOutput;

  /* ==============================
       ICON STATES
       ============================== */

  if (globalSliderPercentageValue <= 15) {
    iconMin.classList.add("active-zone");
    iconMax.classList.remove("active-zone");
  } else if (globalSliderPercentageValue >= 85) {
    iconMax.classList.add("active-zone");
    iconMin.classList.remove("active-zone");
  } else {
    iconMin.classList.remove("active-zone");
    iconMax.classList.remove("active-zone");
  }
}

/* ==============================
   START DRAGGING
   ============================== */

function triggerExecutionStart(event) {
  runtimeActiveState = true;

  trackContainer.classList.add("is-dragging");

  const standardCoordinatePointX = event.type.startsWith("touch")
    ? event.touches[0].clientX
    : event.clientX;

  evaluateCoordinateInput(standardCoordinatePointX);

  /* Haptic feedback */

  if (window.navigator.vibrate) {
    window.navigator.vibrate(6);
  }
}

/* ==============================
   MOVE SLIDER
   ============================== */

function triggerExecutionMove(event) {
  if (!runtimeActiveState) {
    return;
  }

  if (event.cancelable) {
    event.preventDefault();
  }

  const standardCoordinatePointX = event.type.startsWith("touch")
    ? event.touches[0].clientX
    : event.clientX;

  evaluateCoordinateInput(standardCoordinatePointX);
}

/* ==============================
   END DRAGGING
   ============================== */

function triggerExecutionEnd() {
  if (!runtimeActiveState) {
    return;
  }

  runtimeActiveState = false;

  trackContainer.classList.remove("is-dragging");
}

/* ==============================
   MOUSE EVENTS
   ============================== */

trackContainer.addEventListener("mousedown", triggerExecutionStart);

window.addEventListener("mousemove", triggerExecutionMove, {
  passive: false,
});

window.addEventListener("mouseup", triggerExecutionEnd);

/* ==============================
   TOUCH EVENTS
   ============================== */

trackContainer.addEventListener("touchstart", triggerExecutionStart, {
  passive: true,
});

window.addEventListener("touchmove", triggerExecutionMove, {
  passive: false,
});

window.addEventListener("touchend", triggerExecutionEnd);

/* ==============================
   RESPONSIVE RESIZE
   ============================== */

window.addEventListener("resize", () => {
  renderComponentStates();
});

/* ==============================
   INITIALIZE
   ============================== */

renderComponentStates();