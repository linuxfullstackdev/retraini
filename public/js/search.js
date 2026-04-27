/* ============================================================================
   search.js — vanilla, dependency-free client-side search.
   ----------------------------------------------------------------------------
   • Fetches /index.json once on page load.
   • Tokenizes the query, scores each entry by simple substring + token hits
     across title (×3), description (×2), tags (×2) and content excerpt (×1).
   • Renders results as theme-tinted cards. Updates live as the user types,
     debounced ~120 ms.
   ========================================================================== */

(function () {
  'use strict';

  var input    = document.getElementById('search-input');
  var status   = document.getElementById('search-status');
  var results  = document.getElementById('search-results');
  if (!input || !results) return;

  var INDEX = null;
  var DEBOUNCE = 120;
  var timer    = null;

  function setStatus(msg) {
    if (status) status.textContent = msg;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function highlight(text, tokens) {
    if (!text) return '';
    var safe = escapeHtml(text);
    if (!tokens.length) return safe;
    // Build a single regex of all tokens joined with |, escaped.
    var rx = new RegExp(
      '(' + tokens.map(function (t) {
        return t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      }).join('|') + ')',
      'gi'
    );
    return safe.replace(rx, '<mark>$1</mark>');
  }

  function tokenize(q) {
    return q.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 0; });
  }

  function score(entry, tokens) {
    if (!tokens.length) return 0;
    var hay = {
      title:   (entry.title || '').toLowerCase(),
      desc:    (entry.description || entry.summary || '').toLowerCase(),
      tags:    (entry.tags || []).join(' ').toLowerCase(),
      content: (entry.content || '').toLowerCase()
    };
    var s = 0;
    var allHit = true;
    tokens.forEach(function (t) {
      var hit = false;
      if (hay.title.indexOf(t)   >= 0) { s += 30; hit = true; if (hay.title.indexOf(t) === 0) s += 10; }
      if (hay.desc.indexOf(t)    >= 0) { s += 12; hit = true; }
      if (hay.tags.indexOf(t)    >= 0) { s += 12; hit = true; }
      if (hay.content.indexOf(t) >= 0) { s += 4;  hit = true; }
      if (!hit) allHit = false;
    });
    // Reward results that match every token.
    return allHit ? s : Math.floor(s / 2);
  }

  function excerpt(entry, tokens) {
    var text = entry.content || entry.description || entry.summary || '';
    if (!tokens.length || !text) return text.slice(0, 180);
    var lower = text.toLowerCase();
    var pos = -1;
    for (var i = 0; i < tokens.length; i++) {
      var p = lower.indexOf(tokens[i]);
      if (p >= 0 && (pos < 0 || p < pos)) pos = p;
    }
    if (pos < 0) return text.slice(0, 180);
    var start = Math.max(0, pos - 60);
    var end   = Math.min(text.length, pos + 140);
    var pre   = start > 0 ? '… ' : '';
    var post  = end < text.length ? ' …' : '';
    return pre + text.slice(start, end) + post;
  }

  function render(matches, tokens) {
    if (!matches.length) {
      results.innerHTML = '';
      setStatus('No results.');
      return;
    }
    setStatus(matches.length + ' result' + (matches.length === 1 ? '' : 's'));
    results.innerHTML = matches.map(function (m) {
      return (
        '<a class="card card-link theme-' + escapeHtml(m.theme || 'sky') + '" href="' + escapeHtml(m.url) + '">' +
          '<div class="card-title-bar">' +
            '<h3 class="card-title">' + highlight(m.title, tokens) + '</h3>' +
          '</div>' +
          '<div class="card-body">' +
            '<p class="card-summary">' + highlight(excerpt(m, tokens), tokens) + '</p>' +
            '<p class="card-meta"><span>' + escapeHtml(m.section || m.type || 'page') + '</span>' +
              (m.date ? '<span> · ' + escapeHtml(m.date) + '</span>' : '') +
            '</p>' +
          '</div>' +
        '</a>'
      );
    }).join('');
  }

  function run() {
    var q = (input.value || '').trim();
    if (!q) {
      results.innerHTML = '';
      setStatus(INDEX ? 'Type to search ' + INDEX.length + ' pages.' : '');
      return;
    }
    if (!INDEX) { setStatus('Still loading…'); return; }
    var tokens = tokenize(q);
    var scored = [];
    for (var i = 0; i < INDEX.length; i++) {
      var s = score(INDEX[i], tokens);
      if (s > 0) scored.push({ s: s, item: INDEX[i] });
    }
    scored.sort(function (a, b) { return b.s - a.s; });
    var matches = scored.slice(0, 30).map(function (x) { return x.item; });
    render(matches, tokens);

    // Push the query into the URL hash for shareability.
    if (history.replaceState) {
      history.replaceState(null, '', '#q=' + encodeURIComponent(q));
    }
  }

  // ---------- Boot ------------------------------------------------------
  setStatus('Loading search index…');
  fetch('/index.json', { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('Failed to load /index.json (' + r.status + ')');
      return r.json();
    })
    .then(function (data) {
      INDEX = Array.isArray(data) ? data : [];
      setStatus('Type to search ' + INDEX.length + ' pages.');

      // Seed query from the URL hash (e.g. /search/#q=two-pointer).
      var m = (location.hash || '').match(/q=([^&]+)/);
      if (m) {
        input.value = decodeURIComponent(m[1].replace(/\+/g, ' '));
        run();
      }
    })
    .catch(function (err) {
      setStatus('Search index failed to load. ' + err.message);
    });

  // Input listener with debounce.
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(run, DEBOUNCE);
  });

  // Keep focus in the box on page load for fast searching.
  setTimeout(function () { input.focus(); }, 50);
})();
