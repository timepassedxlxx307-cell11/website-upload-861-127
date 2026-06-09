(function () {
  window.initializeMoviePlayer = function (url) {
    var video = document.getElementById('movie-video');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.getElementById('movie-play-button');
    var prepared = false;
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      prepare();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!prepared) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
