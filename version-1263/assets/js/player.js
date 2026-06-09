import { H as Hls } from "./hls-vendor-dru42stk.js";

function initializePlayer(container) {
  var video = container.querySelector("video[data-src]");
  var overlay = container.querySelector(".play-overlay");

  if (!video) {
    return;
  }

  var source = video.getAttribute("data-src");
  var hls = null;

  function attachSource() {
    if (!source || video.getAttribute("data-ready") === "true") {
      return;
    }

    video.setAttribute("data-ready", "true");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playVideo() {
    attachSource();

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      overlay.classList.add("is-hidden");
      overlay.hidden = true;
      playVideo();
    });
  }

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
      overlay.hidden = true;
    }
  });

  video.addEventListener("error", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });

  video.addEventListener("mouseenter", attachSource, { once: true });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-video-player]").forEach(initializePlayer);
});
