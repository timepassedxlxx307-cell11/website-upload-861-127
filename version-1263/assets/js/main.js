(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileNavigation() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-thumb]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("active", thumbIndex === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        show(Number(thumb.getAttribute("data-hero-thumb")) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        play();
      }
    });

    show(0);
    play();
  }

  function initLocalFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-local-search]");
      var type = scope.querySelector("[data-type-filter]");
      var year = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");

      function apply() {
        var query = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var visible = matchesQuery && matchesType && matchesYear;

          card.hidden = !visible;

          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [input, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">",
      "  <div class=\"poster-shell\" data-title=\"" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('is-hidden'); this.closest('.poster-shell').classList.add('image-missing');\">",
      "    <span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>",
      "    <span class=\"poster-play\">▶</span>",
      "  </div>",
      "  <div class=\"movie-card-body\">",
      "    <span class=\"card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</span>",
      "    <h3>" + escapeHtml(movie.title) + "</h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</a>"
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");

    if (!page || !window.MOVIE_INDEX) {
      return;
    }

    var form = page.querySelector("[data-search-form]");
    var input = page.querySelector("[data-search-input]");
    var title = page.querySelector("[data-search-title]");
    var summary = page.querySelector("[data-search-summary]");
    var results = page.querySelector("[data-search-results]");
    var empty = page.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    function render(query) {
      var normalized = normalize(query);
      var list = window.MOVIE_INDEX.filter(function (movie) {
        if (!normalized) {
          return movie.index <= 80;
        }

        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ")).indexOf(normalized) !== -1;
      }).slice(0, 240);

      if (title) {
        title.textContent = normalized ? "搜索：“" + query + "”" : "片库推荐";
      }

      if (summary) {
        summary.textContent = normalized ? "以下为匹配关键词的影片。" : "可通过顶部搜索框或本页搜索框检索全部影片。";
      }

      if (results) {
        results.innerHTML = list.map(movieCard).join("\n");
      }

      if (empty) {
        empty.hidden = list.length !== 0;
      }
    }

    if (input) {
      input.value = initialQuery;
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : "";
        var url = query ? "?q=" + encodeURIComponent(query) : window.location.pathname;
        window.history.replaceState(null, "", url);
        render(query);
      });
    }

    render(initialQuery);
  }

  ready(function () {
    initMobileNavigation();
    initHeroSlider();
    initLocalFilters();
    initSearchPage();
  });
})();
