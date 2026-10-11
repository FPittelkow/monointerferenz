(function () {
  var input = document.getElementById('search-query');
  var results = document.getElementById('search-results');
  var count = document.getElementById('search-count');

  if (!input || !results || !count) {
    return;
  }

  var DEBOUNCE_MS = 150;
  var debounceTimer = null;
  var posts = [];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function postLink(post) {
    var title = escapeHtml(post.title);
    return '<a href="' + escapeHtml(post.url) + '" title="' + title + '">' + title + '</a>';
  }

  function buildSearchText(post) {
    return [
      post.title,
      post.description,
      post.content,
      (post.categories || []).join(' '),
      (post.tags || []).join(' ')
    ].join(' ').toLowerCase();
  }

  function render(list, query) {
    if (!query) {
      results.innerHTML = '';
      count.textContent = 'Type to search all posts.';
      return;
    }

    count.textContent = list.length + (list.length === 1 ? ' result' : ' results');

    if (!list.length) {
      results.innerHTML = '<p>No posts found.</p>';
      return;
    }

    results.innerHTML = list.map(function (post) {
      var tags = (post.tags || []).concat(post.categories || []).map(function (tag) {
        return '<span class="t-hackcss-post-tag">' + escapeHtml(tag) + '</span>';
      }).join(' ');

      return [
        '<div class="media t-hackcss-media">',
          '<div class="media-body">',
            '<div class="media-heading"><span>' + escapeHtml(post.date) + ' &raquo; ' + postLink(post) + '</span></div>',
            '<div class="media-content">' + escapeHtml(post.description) + '</div>',
            '<div class="t-hackcss-post-tags">' + tags + '</div>',
          '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  function matches(post, query) {
    return post.searchText.indexOf(query) !== -1;
  }

  function runSearch() {
    var query = input.value.trim().toLowerCase();

    if (!query) {
      render([], '');
      return;
    }

    render(posts.filter(function (post) {
      return matches(post, query);
    }), query);
  }

  fetch(window.searchDataUrl || '/search.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      posts = data.map(function (post) {
        post.searchText = buildSearchText(post);
        return post;
      });

      render([], '');

      input.addEventListener('input', function () {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(runSearch, DEBOUNCE_MS);
      });
    })
    .catch(function () {
      count.textContent = 'Search data could not be loaded.';
    });
})();
