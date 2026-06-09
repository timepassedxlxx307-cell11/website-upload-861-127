(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dot', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupLocalFilter() {
        selectAll('.js-local-search').forEach(function (input) {
            var section = input.closest('.content-section') || document;
            var cards = selectAll('.movie-card', section);
            input.addEventListener('input', function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
                });
            });
        });
    }

    function setupSearchPage() {
        var input = document.querySelector('[data-search-input]');
        var results = document.getElementById('searchResults');
        var status = document.getElementById('searchStatus');
        var form = document.querySelector('[data-search-form]');
        if (!input || !results || !window.movieSearchData) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;

        function render(query) {
            var term = query.trim().toLowerCase();
            var data = window.movieSearchData;
            var matches;
            if (!term) {
                matches = data.slice(0, 36);
                status.textContent = '精选推荐影片';
            } else {
                matches = data.filter(function (item) {
                    return String(item.search || '').toLowerCase().indexOf(term) !== -1;
                }).slice(0, 80);
                status.textContent = matches.length ? '找到相关影片' : '没有找到匹配影片';
            }
            results.innerHTML = matches.map(function (item) {
                var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');
                return '<article class="movie-card">' +
                    '<a class="poster-wrap" href="' + escapeHtml(item.href) + '">' +
                    '<img src="' + escapeHtml(item.poster) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="score">' + escapeHtml(item.score) + '</span>' +
                    '</a>' +
                    '<div class="card-body">' +
                    '<h3><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p class="card-meta">' + escapeHtml(item.meta) + '</p>' +
                    '<p class="card-desc">' + escapeHtml(item.summary) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        }

        input.addEventListener('input', function () {
            render(input.value);
        });

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var url = new URL(window.location.href);
                if (input.value.trim()) {
                    url.searchParams.set('q', input.value.trim());
                } else {
                    url.searchParams.delete('q');
                }
                window.history.replaceState({}, '', url.toString());
                render(input.value);
            });
        }

        render(initialQuery);
    }

    function setupPlayers() {
        selectAll('.player-frame').forEach(function (frame) {
            var video = frame.querySelector('video');
            var overlay = frame.querySelector('.play-overlay');
            var streamUrl = frame.getAttribute('data-stream-url');
            var hlsInstance = null;
            var attached = false;

            if (!video || !overlay || !streamUrl) {
                return;
            }

            function attachStream() {
                if (attached) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                attached = true;
            }

            function playVideo() {
                attachStream();
                frame.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        frame.classList.remove('is-playing');
                    });
                }
            }

            overlay.addEventListener('click', playVideo);
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                frame.classList.add('is-playing');
            });
            video.addEventListener('ended', function () {
                frame.classList.remove('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupLocalFilter();
        setupSearchPage();
        setupPlayers();
    });
})();
