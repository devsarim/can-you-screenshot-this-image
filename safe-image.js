const devtools = {
  isOpen: false,
  orientation: undefined,
};

const threshold = 160;

const emitEvent = (isOpen, orientation) => {
  globalThis.dispatchEvent(
    new globalThis.CustomEvent("devtoolschange", {
      detail: {
        isOpen,
        orientation,
      },
    })
  );
};

const main = ({ emitEvents = true } = {}) => {
  const widthThreshold =
    globalThis.outerWidth - globalThis.innerWidth > threshold;
  const heightThreshold =
    globalThis.outerHeight - globalThis.innerHeight > threshold;
  const orientation = widthThreshold ? "vertical" : "horizontal";

  if (
    !(heightThreshold && widthThreshold) &&
    ((globalThis.Firebug &&
      globalThis.Firebug.chrome &&
      globalThis.Firebug.chrome.isInitialized) ||
      widthThreshold ||
      heightThreshold)
  ) {
    if (
      (!devtools.isOpen || devtools.orientation !== orientation) &&
      emitEvents
    ) {
      emitEvent(true, orientation);
    }

    devtools.isOpen = true;
    devtools.orientation = orientation;
  } else {
    if (devtools.isOpen && emitEvents) {
      emitEvent(false, undefined);
    }

    devtools.isOpen = false;
    devtools.orientation = undefined;
  }
};

main({ emitEvents: false });
setInterval(main, 500);

window.addEventListener("load", () => {
  let imageSourceCache = [];
  let potentiallyInspecting = false;

  function setupIds() {
    document.querySelectorAll("img.safe-image").forEach((img, idx) => {
      img.setAttribute("src-cache-id", idx);
      imageSourceCache[idx] = img.getAttribute("src");
    });
  }

  function hideImages() {
    document.querySelectorAll("img.safe-image").forEach((img) => {
      img.setAttribute("src", "images/hidden_image.jpg");
    });
  }

  function showImages() {
    document.querySelectorAll("img.safe-image").forEach((img) => {
      img.setAttribute(
        "src",
        imageSourceCache[img.getAttribute("src-cache-id")]
      );
    });
  }

  window.addEventListener("contextmenu", () => {
    hideImages();
    potentiallyInspecting = true;
  });

  window.addEventListener("focus", () => {
    if (!devtools.isOpen) {
      showImages();
    }
  });

  window.addEventListener("blur", () => {
    hideImages();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "OS") {
      hideImages();
    }
  });

  setupIds();
  if (!document.hasFocus() || devtools.isOpen) {
    hideImages();
  }
});
