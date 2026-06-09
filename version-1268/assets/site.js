(function() {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            var isOpen = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                showSlide(index);
                startTimer();
            });
        });

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        startTimer();
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid"));

    grids.forEach(function(grid) {
        var section = grid.closest(".content-section") || document;
        var input = section.querySelector(".filter-input");
        var selects = Array.prototype.slice.call(section.querySelectorAll(".filter-select"));
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var empty = section.querySelector(".empty-state");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyQueryFromAddress() {
            if (!input) {
                return;
            }

            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");

            if (q) {
                input.value = q;
            }
        }

        function filterCards() {
            var query = normalize(input ? input.value : "");
            var filters = {};

            selects.forEach(function(select) {
                filters[select.getAttribute("data-filter")] = normalize(select.value);
            });

            var visibleCount = 0;

            cards.forEach(function(card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.textContent
                ].join(" "));

                var passQuery = !query || haystack.indexOf(query) !== -1;
                var passFilters = Object.keys(filters).every(function(key) {
                    return !filters[key] || normalize(card.dataset[key]).indexOf(filters[key]) !== -1;
                });
                var show = passQuery && passFilters;

                card.hidden = !show;

                if (show) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        applyQueryFromAddress();
        filterCards();

        if (input) {
            input.addEventListener("input", filterCards);
        }

        selects.forEach(function(select) {
            select.addEventListener("change", filterCards);
        });
    });
})();

function activateMoviePlayer(options) {
    var video = document.querySelector(options.videoSelector);
    var overlay = document.querySelector(options.overlaySelector);
    var button = document.querySelector(options.buttonSelector);
    var prepared = false;
    var hlsPlayer = null;
    var pendingPlay = false;

    if (!video || !overlay || !button || !options.streamUrl) {
        return;
    }

    function playVideo() {
        var result = video.play();

        if (result && typeof result.catch === "function") {
            result.catch(function() {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    function prepareVideo() {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.streamUrl;
            video.addEventListener("loadedmetadata", function() {
                if (pendingPlay) {
                    playVideo();
                }
            }, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsPlayer.attachMedia(video);
            hlsPlayer.on(window.Hls.Events.MEDIA_ATTACHED, function() {
                hlsPlayer.loadSource(options.streamUrl);
            });
            hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function() {
                if (pendingPlay) {
                    playVideo();
                }
            });
            return;
        }

        video.src = options.streamUrl;
        video.load();
    }

    function start() {
        pendingPlay = true;
        overlay.classList.add("is-hidden");
        video.controls = true;
        prepareVideo();

        if (video.readyState >= 2) {
            playVideo();
        } else if (!window.Hls || video.canPlayType("application/vnd.apple.mpegurl")) {
            window.setTimeout(playVideo, 120);
        }
    }

    overlay.addEventListener("click", start);

    button.addEventListener("click", function(event) {
        event.stopPropagation();
        start();
    });

    video.addEventListener("click", function() {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function() {
        overlay.classList.add("is-hidden");
    });

    video.addEventListener("error", function() {
        if (hlsPlayer) {
            hlsPlayer.destroy();
            hlsPlayer = null;
        }
        prepared = false;
    });
}
