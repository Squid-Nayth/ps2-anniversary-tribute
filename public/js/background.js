(function () {
  const vid = document.getElementById("bgVid");
  if (!vid) return;

  // BroadcastChannel name shared with player
  const playerChannelName = "ps2-player";
  let bc = null;
  let playerReady = false;
  try {
    bc = new BroadcastChannel(playerChannelName);
  } catch (e) {
    bc = null;
  }
  if (bc) {
    bc.onmessage = function (ev) {
      try {
        if (ev && ev.data && ev.data.type === "player-ready") playerReady = true;
      } catch (e) {}
    };
  }
  // Also listen for postMessage from player window (fallback if BroadcastChannel unavailable)
  window.addEventListener(
    "message",
    function (ev) {
      try {
        if (
          ev &&
          ev.data &&
          ev.data.type === "player-ready" &&
          ev.origin === location.origin
        ) {
          playerReady = true;
        }
      } catch (e) {}
    },
    false
  );

  // SFX paths (relative to `public/`)
  const sfxHover = "sounds/SCPH-10000_00021.wav";
  const sfxClick = "sounds/SCPH-10000_00022.wav";
  // Preload local audio instances (will be cloned to allow overlap)
  const hoverAudio = new Audio(sfxHover);
  hoverAudio.preload = "auto";
  const clickAudio = new Audio(sfxClick);
  clickAudio.preload = "auto";

  // Attempt to play the page background video (try unmuted then fallback to muted)
  try {
    // Disable Picture-in-Picture for this page's background video
    try {
      if (typeof vid.disablePictureInPicture !== "undefined") vid.disablePictureInPicture = true;
    } catch (e) {}
    // If the video somehow enters PiP, try to exit immediately to keep playback in-background only
    try {
      vid.addEventListener("enterpictureinpicture", function () {
        if (document.exitPictureInPicture) document.exitPictureInPicture().catch(() => {});
      });
    } catch (e) {}
    vid.muted = false;
    vid.volume = 0.85;
    const p = vid.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        vid.muted = true;
        vid.volume = 0;
        vid.play().catch(() => {});
      });
    }
  } catch (e) {
    /* ignore */
  }

  // Helper: ensure a persistent player window exists (opened by a user gesture)
  let playerWin = null;
  function ensurePlayerWindow() {
    if (playerWin && !playerWin.closed) return playerWin;
    try {
      playerWin = window.open(
        "/player.html",
        "ps2-player-window",
        "noopener,noreferrer,width=480,height=160"
      );
    } catch (e) {
      playerWin = null;
    }
    // re-create BroadcastChannel if needed
    try {
      if (!bc) bc = new BroadcastChannel(playerChannelName);
    } catch (e) {}
    return playerWin;
  }

  function sendToPlayer(message) {
    if (bc) {
      try {
        bc.postMessage(message);
      } catch (e) {}
    }
    if (playerWin && !playerWin.closed) {
      try {
        playerWin.postMessage(message, location.origin);
      } catch (e) {}
    }
  }

  // Play hover SFX: if persistent player is ready, play only there to avoid doubling.
  function playHoverSfx() {
    if (playerReady) {
      sendToPlayer({ type: "play-sfx", payload: { src: sfxHover, volume: 0.9 } });
    } else {
      try {
        const c = hoverAudio.cloneNode();
        c.play().catch(() => {});
      } catch (e) {}
    }
  }

  // Play click SFX: always play locally for immediate feedback; send to player only if ready
  function playClickSfx() {
    try {
      const c = clickAudio.cloneNode();
      c.play().catch(() => {});
    } catch (e) {}
    if (playerReady)
      sendToPlayer({ type: "play-sfx", payload: { src: sfxClick, volume: 1 } });
  }

  // Delegated handlers for icons
  // Use pointerover + relatedTarget to ensure the hover SFX fires only when
  // entering the anchor element itself (not when moving between the anchor
  // and its child elements which would cause duplicate sounds).
  document.addEventListener("pointerover", (e) => {
    const a =
      e.target.closest &&
      e.target.closest(".profile-card .icons a, .profile-card .about-link a");
    if (!a) return;
    const from = e.relatedTarget;
    // if we came from inside the same anchor, ignore (movement within)
    try {
      if (from && a.contains(from)) return;
    } catch (err) {}
    playHoverSfx();
  });

  // For touch devices, trigger only when the touched element belongs to an anchor
  document.addEventListener(
    "touchstart",
    (e) => {
      const a =
        e.target.closest &&
        e.target.closest(".profile-card .icons a, .profile-card .about-link a");
      if (!a) return;
      playHoverSfx();
    },
    { passive: true }
  );

  // Click: icons open their href; about-link opens the overlay instead
  const aboutOverlay = document.querySelector(".about-overlay");
  function openAbout() {
    if (!aboutOverlay) return;
    aboutOverlay.classList.add("visible");
    aboutOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeAbout() {
    if (!aboutOverlay) return;
    aboutOverlay.classList.remove("visible");
    aboutOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener(
    "click",
    (e) => {
      const a =
        e.target.closest &&
        e.target.closest(".profile-card .icons a, .profile-card .about-link a");
      if (!a) return;
      // If it's the about link, open the overlay instead of navigating
      if (a.matches(".profile-card .about-link a")) {
        e.preventDefault();
        playClickSfx();
        // open overlay after small delay so click SFX is heard
        setTimeout(() => openAbout(), 140);
        return;
      }
      // Otherwise it's an icon: play click SFX and open link in new tab
      e.preventDefault();
      playClickSfx();
      const href = a.getAttribute("href") || a.dataset.href || "#";
      setTimeout(() => {
        window.open(href, "_blank", "noopener");
      }, 140);
    },
    { capture: true }
  );

  // Close overlay on backdrop click or close button
  if (aboutOverlay) {
    aboutOverlay.addEventListener("click", (ev) => {
      // close if clicking backdrop (data-action="close") or the overlay itself
      if (ev.target === aboutOverlay || ev.target.dataset.action === "close") {
        playClickSfx();
        closeAbout();
      }
    });
    const closeBtn = aboutOverlay.querySelector(".close-btn");
    if (closeBtn)
      closeBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        playClickSfx();
        closeAbout();
      });
    // close on Escape
    window.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && aboutOverlay.classList.contains("visible")) {
        playClickSfx();
        closeAbout();
      }
    });
  }
})();
