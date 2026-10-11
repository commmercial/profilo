(() => {
  if (window.__profiloExtrasLoaded) return;
  window.__profiloExtrasLoaded = true;

  const style = document.createElement("style");
  style.textContent = `
    .px-system {
      position: fixed;
      left: 22px;
      bottom: 20px;
      z-index: 9000;
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 10px 13px;
      color: rgba(255,255,255,.88);
      background: rgba(10,10,12,.46);
      border: 1px solid rgba(255,255,255,.13);
      border-radius: 12px;
      backdrop-filter: blur(18px) saturate(140%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
      font: 10px/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      letter-spacing: .09em;
      box-shadow: 0 8px 30px rgba(0,0,0,.16);
      user-select: none;
    }
    .px-dot {
      width: 6px;
      height: 6px;
      flex: 0 0 6px;
      border-radius: 50%;
      background: #d8d8d8;
      box-shadow: 0 0 10px rgba(255,255,255,.4);
    }
    .px-system button {
      border: 0;
      padding: 0;
      color: inherit;
      background: transparent;
      font: inherit;
      cursor: pointer !important;
    }
    .px-clock { color: rgba(255,255,255,.62); margin-top: 4px; }
    .px-palette-backdrop {
      position: fixed;
      inset: 0;
      z-index: 50000;
      display: grid;
      place-items: start center;
      padding: min(18vh, 130px) 16px 20px;
      background: rgba(0,0,0,.38);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity .18s ease, visibility .18s ease;
    }
    .px-palette-backdrop.px-open { opacity: 1; visibility: visible; pointer-events: auto; }
    .px-palette {
      width: min(420px, 100%);
      padding: 12px;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 16px;
      background: rgba(16,16,19,.88);
      box-shadow: 0 24px 90px rgba(0,0,0,.45);
      transform: translateY(-8px) scale(.98);
      transition: transform .18s ease;
      color: white;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    .px-open .px-palette { transform: translateY(0) scale(1); }
    .px-palette-head { padding: 8px 9px 12px; color: rgba(255,255,255,.48); font-size: 10px; letter-spacing: .14em; }
    .px-command {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 10px;
      border: 0;
      border-radius: 9px;
      background: transparent;
      color: rgba(255,255,255,.9);
      text-align: left;
      font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      cursor: pointer !important;
    }
    .px-command:hover, .px-command:focus-visible { outline: none; background: rgba(255,255,255,.09); }
    .px-command kbd { color: rgba(255,255,255,.38); font: inherit; }
    .px-visualizer { display: flex; align-items: center; gap: 3px; height: 19px; margin-top: 2px; opacity: .76; }
    .px-visualizer span { display: block; width: 3px; height: 4px; border-radius: 3px; background: rgba(255,255,255,.85); transform-origin: center; }
    .px-visualizer.px-playing span { animation: px-wave .72s ease-in-out infinite alternate; }
    .px-visualizer span:nth-child(3n) { animation-delay: -.4s; }
    .px-visualizer span:nth-child(3n + 1) { animation-delay: -.18s; }
    .px-visualizer span:nth-child(4n) { animation-duration: .95s; }
    @keyframes px-wave { from { transform: scaleY(.45); } to { transform: scaleY(3.5); } }
    @media (max-width: 600px) {
      .px-system { left: 10px; bottom: 10px; padding: 8px 10px; gap: 8px; font-size: 9px; }
      .px-system .px-hint { display: none; }
      .px-palette-backdrop { padding-top: 12vh; }
    }
    @media (prefers-reduced-motion: reduce) {
      .px-visualizer.px-playing span { animation: none; height: 7px; }
      .px-palette-backdrop, .px-palette { transition: none; }
    }
  `;
  document.head.appendChild(style);

  const system = document.createElement("aside");
  system.className = "px-system";
  system.innerHTML = '<span class="px-dot"></span><button type="button" class="px-open-button" aria-label="Open site command palette"><span>SYSTEM</span><div class="px-clock">--:--:--</div></button><span class="px-hint">CTRL K</span>';
  document.body.appendChild(system);

  const clock = system.querySelector(".px-clock");
  const updateClock = () => {
    clock.textContent = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(new Date());
  };
  updateClock();
  window.setInterval(updateClock, 1000);

  const musicContent = document.querySelector("#musicCard .music-content");
  let visualizer = null;
  if (musicContent) {
    visualizer = document.createElement("div");
    visualizer.className = "px-visualizer";
    visualizer.setAttribute("aria-label", "Music activity animation");
    visualizer.setAttribute("role", "img");
    visualizer.innerHTML = Array.from({ length: 23 }, () => "<span></span>").join("");
    const heading = musicContent.querySelector(".music-heading");
    if (heading) heading.insertAdjacentElement("afterend", visualizer);
    else musicContent.appendChild(visualizer);
  }

  const video = document.querySelector("#backgroundVideo");
  const syncVisualizer = () => {
    if (visualizer) visualizer.classList.toggle("px-playing", !!video && !video.paused && !video.ended);
  };
  if (video) {
    ["play", "playing", "pause", "ended", "waiting"].forEach(eventName => video.addEventListener(eventName, syncVisualizer));
    syncVisualizer();
  }

  const backdrop = document.createElement("div");
  backdrop.className = "px-palette-backdrop";
  backdrop.innerHTML = '<section class="px-palette" role="dialog" aria-modal="true" aria-label="Site command palette"><div class="px-palette-head">QUICK COMMANDS / ESC TO CLOSE</div><button class="px-command" data-command="visualizer"><span>Toggle music visualizer</span><kbd>VISUAL</kbd></button><button class="px-command" data-command="clock"><span>Toggle system clock</span><kbd>TIME</kbd></button><button class="px-command" data-command="music"><span>Play / pause background</span><kbd>AUDIO</kbd></button><button class="px-command" data-command="copy"><span>Copy site address</span><kbd>URL</kbd></button></section>';
  document.body.appendChild(backdrop);

  const openButton = system.querySelector(".px-open-button");
  const closePalette = () => {
    backdrop.classList.remove("px-open");
    openButton.focus({ preventScroll: true });
  };
  const openPalette = () => {
    backdrop.classList.add("px-open");
    const first = backdrop.querySelector(".px-command");
    if (first) first.focus({ preventScroll: true });
  };
  openButton.addEventListener("click", openPalette);
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closePalette();
  });
  backdrop.querySelectorAll(".px-command").forEach(button => {
    button.addEventListener("click", async () => {
      const command = button.dataset.command;
      if (command === "visualizer" && visualizer) {
        visualizer.hidden = !visualizer.hidden;
      } else if (command === "clock") {
        system.hidden = !system.hidden;
      } else if (command === "music" && video) {
        if (video.paused) {
          try { await video.play(); } catch {}
        } else {
          video.pause();
        }
        syncVisualizer();
      } else if (command === "copy") {
        try {
          await navigator.clipboard.writeText(window.location.href);
          button.querySelector("kbd").textContent = "COPIED";
        } catch {
          button.querySelector("kbd").textContent = "BLOCKED";
        }
      }
      if (command !== "copy") closePalette();
    });
  });
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      backdrop.classList.contains("px-open") ? closePalette() : openPalette();
    } else if (event.key === "Escape" && backdrop.classList.contains("px-open")) {
      closePalette();
    }
  });
})();