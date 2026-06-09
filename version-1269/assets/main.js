(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function updateMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var next = !panel.classList.contains('is-open');
      panel.classList.toggle('is-open', next);
      document.body.classList.toggle('is-menu-open', next);
      button.setAttribute('aria-expanded', String(next));
    });
  }

  function updateHero() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    show(0);
    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  function getCardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-tags') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function updateFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var buttons = selectAll('[data-filter-value]', scope);
      var cards = selectAll('.movie-card', scope);
      var empty = scope.querySelector('[data-empty-result]');
      var activeFilter = 'all';

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = getCardText(card);
          var filterText = activeFilter === 'all' || text.indexOf(activeFilter) !== -1;
          var keywordText = !keyword || text.indexOf(keyword) !== -1;
          var matched = filterText && keywordText;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = (button.getAttribute('data-filter-value') || 'all').toLowerCase();
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
      return;
    }
    fn();
  }

  ready(function () {
    updateMenu();
    updateHero();
    updateFilters();
  });

  window.setupVideoPlayer = function (videoUrl) {
    ready(function () {
      var video = document.querySelector('[data-player-video]');
      var cover = document.querySelector('[data-player-cover]');
      var start = document.querySelector('[data-player-start]');
      var hlsInstance = null;
      var loaded = false;

      if (!video || !videoUrl) {
        return;
      }

      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {});
        }
      }

      if (start) {
        start.addEventListener('click', play);
      }
      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
