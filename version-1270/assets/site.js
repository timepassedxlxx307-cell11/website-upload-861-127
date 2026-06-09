(function () {
    "use strict";

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs("[data-menu-button]");
        if (!button) {
            return;
        }

        button.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    function setupHero() {
        var slides = qsa("[data-hero-slide]");
        var dots = qsa("[data-hero-dot]");
        if (!slides.length || !dots.length) {
            return;
        }

        var current = 0;
        var timer = null;

        function activate(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function next() {
            activate((current + 1) % slides.length);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(next, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                if (!Number.isNaN(index)) {
                    activate(index);
                    restart();
                }
            });
        });

        restart();
    }

    function setupFilters() {
        var filterPanels = qsa(".filter-panel");
        filterPanels.forEach(function (panel) {
            var section = panel.closest(".section-block") || document;
            var input = qs("[data-filter-input]", panel);
            var chips = qsa("[data-filter-chip]", panel);
            var cards = qsa("[data-card]", section);
            var emptyState = qs("[data-empty-state]", section);
            var activeChip = "";

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var chip = normalize(activeChip);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-filter-text"));
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesChip = !chip || text.indexOf(chip) !== -1;
                    var visible = matchesQuery && matchesChip;
                    card.hidden = !visible;
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("visible", visibleCount === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chipButton) {
                chipButton.addEventListener("click", function () {
                    activeChip = chipButton.getAttribute("data-filter-chip") || "";
                    chips.forEach(function (item) {
                        item.classList.toggle("active", item === chipButton);
                    });
                    apply();
                });
            });
        });
    }

    function setupPlayers() {
        var players = qsa("[data-player]");
        players.forEach(function (panel) {
            var video = qs("video", panel);
            var button = qs("[data-video-play]", panel);
            var hlsInstance = null;

            if (!video || !button) {
                return;
            }

            function startPlayer() {
                var source = video.getAttribute("data-src");
                button.classList.add("hidden");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (!hlsInstance) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.play().catch(function () {});
                    }
                    return;
                }

                video.src = source;
                video.play().catch(function () {});
            }

            button.addEventListener("click", startPlayer);
            video.addEventListener("play", function () {
                button.classList.add("hidden");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
