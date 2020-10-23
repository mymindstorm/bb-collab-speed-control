console.log("BB Collab Playback: Initializing");

let videoElement: HTMLVideoElement | null;
let menubarElement: HTMLDivElement | null;
let buttonDivElement: HTMLDivElement | null;

new MutationObserver((mutations, observer) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLVideoElement) {
        videoElement = node;
      } else if (
        node instanceof HTMLDivElement &&
        node.classList.contains("control-bar")
      ) {
        menubarElement = node.firstChild as HTMLDivElement | null;
      }

      if (videoElement && menubarElement && !buttonDivElement) {
        console.log("BB Collab Playback: Creating control button");

        try {
          buttonDivElement = menubarElement.insertBefore(
            createSpeedControlButton(),
            menubarElement.querySelector(".fullscreen-toggle")
          );
          console.log("BB Collab Playback: Control button created");
          observer.disconnect();
        } catch (e) {
          console.error("BB Collab Playback: ", e);
        }
      }
    });
  }
}).observe(document.body, { childList: true, subtree: true });

console.log("BB Collab Playback: Callback setup");

function createSpeedControlButton(): HTMLDivElement {
  const speedControlDiv = document.createElement("div");
  const speedControlButton = document.createElement("button");
  const speedControlTooltip = document.createElement("span");
  const speedControlTooltipContent = document.createElement("span");
  const speedControlContainer = document.createElement("div");

  // Add button to control bar
  speedControlDiv.appendChild(speedControlButton);
  speedControlButton.classList.add(
    "playback-controls__button",
    "button",
    "has-tooltip"
  );
  speedControlButton.innerText = "1x";
  speedControlButton.id = "speedControlButton";

  // Tooltip
  speedControlButton.appendChild(speedControlTooltip);
  speedControlTooltip.classList.add("tooltip", "tip-top-right");
  speedControlTooltip.appendChild(speedControlTooltipContent);
  speedControlTooltipContent.classList.add("tooltip-content");
  speedControlTooltipContent.innerText = "Playback Speed";

  // Popup menu
  speedControlDiv.appendChild(speedControlContainer);
  speedControlContainer.id = "speedControlContainer";
  speedControlContainer.classList.add("dropdown-pane");
  speedControlButton.onclick = () =>
    speedControlContainer.classList.contains("is-open")
      ? speedControlContainer.classList.remove("is-open")
      : speedControlContainer.classList.add("is-open");
  document.onclick = (e) => {
    const el = document.elementFromPoint(e.x, e.y);
    if (el && el.id !== "speedControlButton") {
      speedControlContainer.classList.remove("is-open");
    }
  };

  speedControlContainer.style.display = "flex";
  speedControlContainer.style.width = "4.8rem";
  speedControlContainer.style.paddingTop = "0.1rem";
  speedControlContainer.style.paddingBottom = "0.1rem";
  speedControlContainer.style.marginTop = "-197px";
  speedControlContainer.style.marginLeft = "-41px";
  speedControlContainer.style.flexDirection = "column-reverse";

  // Speed radio buttons
  const playbackSpeeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
  for (const speed of playbackSpeeds) {
    const speedRadioDiv = document.createElement("div");
    const speedRadioId = `bbCollabSpeedControl-${speed}`;
    const speedRadio = document.createElement("input");
    speedRadio.name = "playbackSpeed";
    speedRadio.type = "radio";
    speedRadio.value = speed.toString();
    speedRadio.checked = speed === 1;
    speedRadio.id = speedRadioId;

    const speedRadioLabel = document.createElement("label");
    speedRadioLabel.htmlFor = speedRadioId;
    speedRadioLabel.innerText = `${speed}x`;

    speedRadioLabel.style.margin = "0px";
    speedRadio.style.marginBottom = "0.60rem";
    speedRadioDiv.style.paddingLeft = "0.8rem";

    speedRadio.onchange = () => speedControlChangeHandler();
    speedRadioDiv.appendChild(speedRadio);
    speedRadioDiv.appendChild(speedRadioLabel);
    speedControlContainer.appendChild(speedRadioDiv);
  }
  // @ts-expect-error - this will work
  // eslint-disable-next-line
  speedControlContainer.firstChild.firstChild.style.marginBottom = "0px";

  return speedControlDiv;
}

function speedControlChangeHandler() {
  const radios = document.getElementsByName("playbackSpeed");
  let playbackSpeed: number | undefined;
  radios.forEach((node) => {
    if (node instanceof HTMLInputElement && node.checked) {
      playbackSpeed = Number(node.value);
    }
  });

  if (videoElement && buttonDivElement && playbackSpeed) {
    videoElement.playbackRate = playbackSpeed;
    if (buttonDivElement.firstChild instanceof HTMLButtonElement) {
      buttonDivElement.firstChild.innerText = `${playbackSpeed}x`;
    }
  }
}
