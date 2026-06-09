(function () {
  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId || "movieVideo");
    var button = document.getElementById(options.buttonId || "moviePlay");
    var shell = document.getElementById(options.shellId || "moviePlayer");
    var sourceUrl = options.sourceUrl;
    var loaded = false;
    var hls = null;

    if (!video || !button || !shell || !sourceUrl) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function playVideo() {
      loadVideo();
      shell.classList.add("is-ready");

      var playback = video.play();

      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {
          shell.classList.remove("is-ready");
        });
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      playVideo();
    });

    shell.addEventListener("click", function (event) {
      if (event.target === shell) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-ready");
    });

    video.addEventListener("pause", function () {
      if (!video.currentTime) {
        shell.classList.remove("is-ready");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
