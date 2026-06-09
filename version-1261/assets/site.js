(function () {
  var navButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  if (slides.length > 1) {
    var active = 0;
    var show = function (index) {
      active = index;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === active);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === active);
      });
    };
    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        show(pos);
      });
    });
    setInterval(function () {
      show((active + 1) % slides.length);
    }, 5200);
  }

  var query = new URLSearchParams(location.search).get('q') || '';
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.js-search-input'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var empty = document.querySelector('.empty-state');
  var filter = function (value) {
    var keyword = String(value || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  };
  if (query) {
    searchInputs.forEach(function (input) {
      input.value = query;
    });
    filter(query);
  }
  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filter(input.value);
    });
  });
})();

function bootPlayer(streamUrl) {
  var video = document.querySelector('.js-video');
  var start = document.querySelector('.js-player-start');
  if (!video || !start || !streamUrl) {
    return;
  }
  var loaded = false;
  var load = function () {
    if (!loaded) {
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    start.classList.add('is-hidden');
    video.controls = true;
    var played = video.play();
    if (played && typeof played.catch === 'function') {
      played.catch(function () {});
    }
  };
  start.addEventListener('click', load);
  video.addEventListener('click', function () {
    if (!loaded) {
      load();
    }
  });
}
