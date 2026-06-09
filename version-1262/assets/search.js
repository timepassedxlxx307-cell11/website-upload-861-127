(function () {
  var input = document.querySelector('[data-search-page-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var typeSelect = document.querySelector('[data-search-type]');
  var regionInput = document.querySelector('[data-search-region]');
  var yearInput = document.querySelector('[data-search-year]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (!results || !Array.isArray(window.SITE_MOVIES)) {
    return;
  }

  if (input) {
    input.value = query;
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="movie-card-link" href="' + escapeHtml(movie.href) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<div class="poster-frame">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<div class="poster-shade"></div>',
      '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '<span class="poster-score">' + escapeHtml(movie.score) + '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-card-meta">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '</div>',
      '<div class="movie-tags">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render() {
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var type = typeSelect ? typeSelect.value : '';
    var region = regionInput ? regionInput.value.trim().toLowerCase() : '';
    var year = yearInput ? yearInput.value.trim().toLowerCase() : '';

    var matched = window.SITE_MOVIES.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.oneLine,
        movie.region,
        movie.type,
        movie.year,
        movie.category,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okType = !type || movie.type === type;
      var okRegion = !region || String(movie.region).toLowerCase().indexOf(region) !== -1;
      var okYear = !year || String(movie.year).toLowerCase().indexOf(year) !== -1;
      return okKeyword && okType && okRegion && okYear;
    }).slice(0, 120);

    results.innerHTML = matched.map(card).join('');

    if (status) {
      status.textContent = matched.length ? '为你找到相关影片' : '没有找到匹配影片';
    }
  }

  [input, typeSelect, regionInput, yearInput].forEach(function (control) {
    if (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    }
  });

  render();
})();
