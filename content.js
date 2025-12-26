(() => {
  const STEP = 0.05;
  const MIN = 0.25;
  const MAX = 4.0;

  let overlay = null;
  let currentVideo = null;

  /* =========================
   * Overlay
   * ========================= */

  function createOverlay() {
    overlay = document.createElement("div");
    overlay.id = "video-speed-overlay";
    overlay.style.cssText = `
      position: fixed;
      display: none;
      z-index: 100000;
    `;
    overlay.innerHTML = `
      <span class="wheel-space"></span>
      <span class="speed-label">1.0x</span>
    `;

    /* wheel on icon ONLY */
    overlay.addEventListener("wheel", onWheel, { passive: false });

    /* reset on dblclick */
    overlay.addEventListener("dblclick", () => {
      if (!currentVideo) return;
      currentVideo.playbackRate = 1.0;
      updateOverlay();
    });

    overlay.addEventListener("mouseenter", () => {
      overlay.querySelector(".wheel-space").textContent = "◎";
    });

    overlay.addEventListener("mouseleave", () => {
      overlay.querySelector(".wheel-space").textContent = "";
    });

    document.body.appendChild(overlay);
  }

  const style = document.createElement("style");
  style.textContent = `
    #video-speed-overlay {
      width: 50px;
      height: 40px;
      box-sizing: border-box;
      overflow: hidden;
      border-radius: 10%;
      background: rgba(0, 0, 0, 0.65);
      color: white;
      font-size: 13px;
      cursor: ns-resize;
      user-select: none;
      display: flex;
      align-items: center;
      transform-origin: left center;
      transition:
        width 0.15s ease-out,
        border-radius 0.15s ease-out;
    }

    #video-speed-overlay .speed-label {
      width: 100%;
      line-height: 40px;
      text-align: center;
      transition:
        padding 0.15s ease-out;
      pointer-events: none;
    }

    #video-speed-overlay .wheel-space {
      width: 0%;
      line-height: 40px;
      text-align: center;
      transition:
        padding 0.15s ease-out;
      pointer-events: none;
    }


    #video-speed-overlay:hover {
      width: 100px;
    }

    #video-speed-overlay:hover .wheel-space {
      width: 100%;
    }
  `;
  document.head.appendChild(style);

  function updateOverlay() {
    if (!currentVideo) return;
    overlay.querySelector(".speed-label").textContent =
      currentVideo.playbackRate.toFixed(2) + "x";
  }

  function positionOverlay(video) {
    const r = video.getBoundingClientRect();
    overlay.style.left = `${r.left + 10}px`;
    overlay.style.top  = `${r.top + 10}px`;
  }

  /* =========================
   * Wheel handler
   * ========================= */

  function onWheel(e) {
    if (!currentVideo) return;
    e.preventDefault();

    let rate = currentVideo.playbackRate;
    rate += (e.deltaY < 0 ? STEP : -STEP);
    rate = Math.min(MAX, Math.max(MIN, rate));

    currentVideo.playbackRate = rate;
    currentVideo.preservesPitch = true;

    updateOverlay();
  }

  /* =========================
   * Video hover handling
   * ========================= */

  function attachToVideo(video) {
    if (video._wheelSpeedAttached) return;
    video._wheelSpeedAttached = true;

    video.addEventListener("mouseenter", () => {
      currentVideo = video;
      positionOverlay(video);
      updateOverlay();
      overlay.style.display = "flex";
    });

    video.addEventListener("mouseleave", () => {
      // overlayにマウスが移った場合は消さない
      setTimeout(() => {
        if (!overlay.matches(":hover")) {
          overlay.style.display = "none";
          currentVideo = null;
        }
      }, 100);
    });
  }

  /* =========================
   * Video discovery (SPA対応)
   * ========================= */

  function scanVideos() {
    document.querySelectorAll("video").forEach(attachToVideo);
  }

  /* =========================
   * Init
   * ========================= */

  createOverlay();
  scanVideos();

  new MutationObserver(scanVideos).observe(document.body, {
    childList: true,
    subtree: true
  });

})();
