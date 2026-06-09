(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var header = document.querySelector("[data-header]");
        var menuButton = document.querySelector("[data-menu-button]");
        var navLinks = document.querySelector("[data-nav-links]");

        function setHeaderState() {
            if (!header) {
                return;
            }
            if (window.scrollY > 20) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }

        setHeaderState();
        window.addEventListener("scroll", setHeaderState, { passive: true });

        if (menuButton && navLinks && header) {
            menuButton.addEventListener("click", function () {
                navLinks.classList.toggle("open");
                header.classList.toggle("menu-open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    restart();
                });
            });

            show(0);
            restart();
        });

        document.querySelectorAll("[data-filter]").forEach(function (toolbar) {
            var section = toolbar.parentElement;
            var search = toolbar.querySelector("[data-search]");
            var year = toolbar.querySelector("[data-year-filter]");
            var region = toolbar.querySelector("[data-region-filter]");
            var items = Array.prototype.slice.call(section.querySelectorAll(".filter-item"));

            function applyFilter() {
                var q = search ? search.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedRegion = region ? region.value : "";

                items.forEach(function (item) {
                    var text = [
                        item.getAttribute("data-title") || "",
                        item.getAttribute("data-tags") || "",
                        item.getAttribute("data-region") || "",
                        item.getAttribute("data-year") || ""
                    ].join(" ").toLowerCase();
                    var matchText = !q || text.indexOf(q) !== -1;
                    var matchYear = !selectedYear || item.getAttribute("data-year") === selectedYear;
                    var matchRegion = !selectedRegion || item.getAttribute("data-region") === selectedRegion;
                    item.classList.toggle("is-hidden", !(matchText && matchYear && matchRegion));
                });
            }

            [search, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
        });

        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var startButton = player.querySelector(".player-start");
            if (!video) {
                return;
            }
            var source = video.querySelector("source");
            var stream = source ? source.getAttribute("src") : video.getAttribute("src");
            var attached = false;

            function attachStream() {
                if (attached || !stream) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function startPlayback() {
                attachStream();
                player.classList.add("is-playing");
                video.play().catch(function () {
                    player.classList.remove("is-playing");
                });
            }

            if (overlay) {
                overlay.addEventListener("click", startPlayback);
            }
            if (startButton) {
                startButton.addEventListener("click", function (event) {
                    event.stopPropagation();
                    startPlayback();
                });
            }
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("click", function () {
                if (!attached) {
                    startPlayback();
                }
            });
        });
    });
})();
