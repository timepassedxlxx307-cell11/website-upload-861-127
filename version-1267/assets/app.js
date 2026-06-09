(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("open"));
      });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
          slide.classList.toggle("active", current === index);
        });
        dots.forEach(function (dot, current) {
          dot.classList.toggle("active", current === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var list = scope.parentElement.querySelector("[data-filter-list]");
      var input = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var result = scope.querySelector("[data-filter-result]");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matchedQuery = !query || text.indexOf(query) !== -1;
          var matchedYear = !selectedYear || cardYear.indexOf(selectedYear) !== -1;
          var matchedType = !selectedType || cardType.indexOf(selectedType) !== -1;
          var show = matchedQuery && matchedYear && matchedType;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = visible ? "当前结果：" + visible + " 部" : "没有匹配内容";
        }
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", applyFilter);
          element.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    });

    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var playButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-play]"));
    var hlsInstance = null;

    function getPlayerSource() {
      if (typeof playerConfig !== "undefined" && playerConfig && playerConfig.source) {
        return playerConfig.source;
      }
      return "";
    }

    function startPlayer() {
      if (!video) {
        return;
      }

      var source = getPlayerSource();
      if (!source) {
        return;
      }

      if (!video.getAttribute("data-ready")) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        video.setAttribute("data-ready", "true");
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      video.controls = true;
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        startPlayer();
      });
    });

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayer();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
