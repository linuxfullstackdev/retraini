/* ============================================================================
   progress.js — completion tracking via localStorage.
   ----------------------------------------------------------------------------
   Storage shape:
     localStorage['ttsProgress'] = JSON.stringify({
       "/tracks/<track>/<course>/<chapter>/": true,
       ...
     })

   Public API:
     window.ttsMarkComplete(path)    — mark a chapter complete
     window.ttsMarkIncomplete(path)  — undo
     window.ttsIsComplete(path)      — boolean
     window.ttsResetProgress()       — wipes everything

   The file is also responsible for:
     • Hooking up [data-mark-complete] buttons.
     • Updating chapter-list status icons on the course page.
     • Computing & rendering progress bars on the profile page.
   ========================================================================== */

(function () {
  'use strict';

  var KEY = 'ttsProgress';
  var NAME_KEY = 'ttsProfileName';

  function readProfileName() {
    try { return (localStorage.getItem(NAME_KEY) || '').trim(); }
    catch (e) { return ''; }
  }

  function writeProfileName(name) {
    var cleaned = (name || '').replace(/\s+/g, ' ').trim().slice(0, 32);
    try { localStorage.setItem(NAME_KEY, cleaned); } catch (e) { /* noop */ }
    return cleaned;
  }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function write(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* quota etc. */ }
  }

  function normalize(p) {
    if (!p) return p;
    p = String(p).trim();

    // Support absolute URLs and strip query/hash so keys stay stable.
    p = p.replace(/^https?:\/\/[^/]+/i, '');
    p = p.split('#')[0].split('?')[0];

    if (p.charAt(0) !== '/') p = '/' + p;
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }

  // ---------- Public API -------------------------------------------------
  window.ttsMarkComplete = function (path) {
    if (!path) return;
    var data = read();
    data[normalize(path)] = true;
    write(data);
    document.dispatchEvent(new CustomEvent('tts:progress-changed', { detail: { path: path } }));
  };
  window.ttsMarkIncomplete = function (path) {
    if (!path) return;
    var data = read();
    delete data[normalize(path)];
    write(data);
    document.dispatchEvent(new CustomEvent('tts:progress-changed', { detail: { path: path } }));
  };
  window.ttsIsComplete = function (path) {
    return !!read()[normalize(path)];
  };
  window.ttsResetProgress = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    document.dispatchEvent(new CustomEvent('tts:progress-changed', { detail: { path: null } }));
  };

  function showCelebration() {
    var existing = document.querySelector('.celebration-overlay');
    if (existing) existing.remove();

    var name = readProfileName();
    var text = name ? ('Great job, ' + name + '! 🎉') : 'Great job! 🎉';

    var overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';

    var toast = document.createElement('div');
    toast.className = 'celebration-toast';

    var particles = document.createElement('div');
    particles.className = 'celebration-particles';
    for (var i = 1; i <= 16; i++) {
      var piece = document.createElement('span');
      piece.className = 'celebration-particle';
      piece.style.setProperty('--i', i);
      particles.appendChild(piece);
    }

    var p = document.createElement('p');
    p.className = 'celebration-text';
    p.textContent = text + ' Chapter complete!';

    toast.appendChild(particles);
    toast.appendChild(p);
    overlay.appendChild(toast);
    document.body.appendChild(overlay);

    setTimeout(function () {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 2600);
  }

  function initProfileNameField() {
    var input = document.querySelector('[data-profile-name-input]');
    if (!input) return;

    input.value = readProfileName();
    input.addEventListener('input', function () {
      var cleaned = writeProfileName(input.value);
      if (cleaned !== input.value) input.value = cleaned;
    });
    input.addEventListener('blur', function () {
      input.value = writeProfileName(input.value);
    });
  }

  // ---------- Mark-as-complete buttons ----------------------------------
  document.querySelectorAll('[data-mark-complete]').forEach(function (btn) {
    var path = btn.getAttribute('data-page-path');
    syncButton(btn, path);
    btn.addEventListener('click', function () {
      if (window.ttsIsComplete(path)) {
        window.ttsMarkIncomplete(path);
      } else {
        window.ttsMarkComplete(path);
        showCelebration();
      }
    });
  });

  function syncButton(btn, path) {
    var done = window.ttsIsComplete(path);
    btn.textContent = done ? '✓ Completed — click to undo' : '✓ Mark as complete';
    var cta = btn.closest('.chapter-complete-cta');
    if (cta) cta.classList.toggle('is-complete', done);
    var status = btn.parentNode && btn.parentNode.querySelector('[data-progress-status]');
    if (status) status.textContent = done ? 'Marked complete on this device.' : 'Saved locally to your browser.';
  }

  // ---------- Chapter list (course page) status icons -------------------
  function syncChapterListItems() {
    var data = read();
    document.querySelectorAll('[data-page-path]').forEach(function (el) {
      var path = normalize(el.getAttribute('data-page-path'));
      var icon = el.querySelector('[data-progress-status]');
      if (!icon) return;
      // Skip the chapter article + sidebar widget which have their own copy.
      if (el.tagName === 'ARTICLE') return;
      if (data[path]) {
        icon.textContent = '●';
        icon.classList.add('is-complete');
      } else {
        icon.textContent = '○';
        icon.classList.remove('is-complete');
      }
    });

    // Profile page chapter list items use a different marker.
    document.querySelectorAll('[data-chapter-path]').forEach(function (el) {
      var path = normalize(el.getAttribute('data-chapter-path'));
      var icon = el.querySelector('[data-progress-status]');
      if (!icon) return;
      var done = !!data[path];
      icon.textContent = done ? '●' : '○';
      icon.classList.toggle('is-complete', done);
    });
  }

  // ---------- Progress bars (profile + sidebar widget) ------------------
  function paintProgressBar(el, current, total) {
    var pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    var fill   = el.querySelector('[data-progress-fill]');
    var label  = el.querySelector('[data-progress-current]');
    var track  = el.querySelector('.progress-track');
    if (fill)  fill.style.width = pct + '%';
    if (label) label.textContent = current;
    if (track) track.setAttribute('aria-valuenow', current);
  }

  function recomputeProgress() {
    var data = read();

    // Per-course progress on the profile page.
    document.querySelectorAll('.profile-course[data-course-id]').forEach(function (el) {
      var paths = (el.getAttribute('data-course-chapters') || '')
        .split('|').filter(Boolean);
      var done = 0;
      paths.forEach(function (p) { if (data[normalize(p)]) done++; });
      var bar = el.querySelector('.progress');
      if (bar) paintProgressBar(bar, done, paths.length);
    });

    // Overall site-wide progress bar (id="overall").
    var overallBar = document.querySelector('[data-progress-id="overall"]');
    if (overallBar) {
      var allPaths = [];
      document.querySelectorAll('.profile-course[data-course-id]').forEach(function (el) {
        var paths = (el.getAttribute('data-course-chapters') || '').split('|').filter(Boolean);
        paths.forEach(function (p) { allPaths.push(normalize(p)); });
      });
      var done = 0;
      allPaths.forEach(function (p) { if (data[p]) done++; });
      paintProgressBar(overallBar, done, allPaths.length);
    }

    syncChapterListItems();
  }

  // ---------- Reset button on profile page ------------------------------
  document.querySelectorAll('[data-progress-clear]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (confirm('Reset all reading progress on this device? This cannot be undone.')) {
        window.ttsResetProgress();
      }
    });
  });

  // ---------- Initial paint + listeners ---------------------------------
  document.addEventListener('tts:progress-changed', function () {
    document.querySelectorAll('[data-mark-complete]').forEach(function (btn) {
      syncButton(btn, btn.getAttribute('data-page-path'));
    });
    recomputeProgress();
  });

  initProfileNameField();
  recomputeProgress();
})();
