(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("is-open");
      });
    }

    setupHero();
    setupSearch();
  });

  function setupHero() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function move(step) {
      show(current + step);
      restart();
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));

    inputs.forEach(function (input) {
      var container = input.closest("section") || document;
      var scope = container.querySelector("[data-filter-scope]") || document.querySelector("[data-filter-scope]");
      var clear = container.querySelector("[data-clear-search]");

      function filter() {
        if (!scope) {
          return;
        }

        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-tags") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();

          card.classList.toggle("is-hidden-by-search", query && text.indexOf(query) === -1);
        });
      }

      input.addEventListener("input", filter);

      if (clear) {
        clear.addEventListener("click", function () {
          input.value = "";
          filter();
          input.focus();
        });
      }
    });
  }
})();
