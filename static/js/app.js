/* ============================================================================
   app.js — global, dependency-free site behaviors.
   ----------------------------------------------------------------------------
   Responsibilities:
     1. Mobile hamburger toggle.
     2. Tap-to-open submenus on touch devices (CSS hover handles desktop).
     3. Light/Dark mode toggle persisted in localStorage.
     4. "Recently viewed" sidebar list backed by localStorage.
     5. Chapter code-block enhancements (copy button + line numbers).
     6. Lazy-load any non-explicit images (loading="lazy" applied to all <img>
        in the prose area as a safety net).
   No frameworks. Use modern ES5+ — runs everywhere down to Edge 16.
   ========================================================================== */

(function () {
  'use strict';

  // ---------- 1. Mobile menu toggle --------------------------------------
  var navToggle = document.querySelector('.nav-toggle');
  var nav       = document.getElementById('primary-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  // ---------- 2. Submenu tap-to-open on touch ----------------------------
  // CSS handles hover on pointer:fine devices. On touch devices we toggle
  // an .is-open class on the parent <li>. Clicking the link itself still
  // navigates to its href, but on the first tap (when submenu is hidden)
  // we open the submenu instead — only on coarse pointers.
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var hasChildren = document.querySelectorAll('.menu-l1 > .menu-item.has-children');

  hasChildren.forEach(function (li) {
    var link = li.querySelector(':scope > .menu-link');
    if (!link) return;

    link.addEventListener('click', function (e) {
      // On desktop with hover, do nothing — let the link navigate.
      // On mobile (or when nav-toggle is visible), tap toggles the submenu.
      var navIsHorizontal = !nav.classList.contains('is-open') && !coarse;
      if (navIsHorizontal) return;

      // First tap opens; second tap (when already open) lets the link work.
      if (!li.classList.contains('is-open')) {
        e.preventDefault();
        // Close any siblings.
        hasChildren.forEach(function (other) {
          if (other !== li) other.classList.remove('is-open');
        });
        li.classList.add('is-open');
        link.setAttribute('aria-expanded', 'true');
      } else {
        li.classList.remove('is-open');
        link.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close any open menu when clicking outside.
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.primary-nav')) {
      hasChildren.forEach(function (li) { li.classList.remove('is-open'); });
    }
  });

  // ---------- 3. Light/Dark theme toggle ---------------------------------
  var MODE_KEY = 'ttsDarkMode';
  var themeToggle = document.querySelector('[data-theme-toggle]');

  function getActiveMode() {
    var mode = document.documentElement.getAttribute('data-theme');
    return (mode === 'dark' || mode === 'light') ? mode : 'light';
  }

  function applyMode(mode) {
    var nextMode = (mode === 'dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextMode);
    try { localStorage.setItem(MODE_KEY, nextMode); } catch (e) { /* noop */ }

    if (themeToggle) {
      var toDark = nextMode !== 'dark';
      themeToggle.setAttribute('aria-label', toDark ? 'Switch to dark mode' : 'Switch to light mode');
      themeToggle.setAttribute('aria-pressed', nextMode === 'dark' ? 'true' : 'false');
      var icon = themeToggle.querySelector('[data-theme-icon]');
      if (icon) icon.textContent = nextMode === 'dark' ? '☀' : '◐';
    }
  }

  if (themeToggle) {
    applyMode(getActiveMode());
    themeToggle.addEventListener('click', function () {
      applyMode(getActiveMode() === 'dark' ? 'light' : 'dark');
    });
  }

  // ---------- 4. Recently viewed (localStorage) --------------------------
  var RV_KEY = 'ttsRecentlyViewed';
  var RV_LIMIT = 5;

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* noop */ }
  }

  // Track this page if it's a chapter (has the data attribute on <article>).
  var article = document.querySelector('article[data-page-path]');
  if (article) {
    var path  = article.getAttribute('data-page-path');
    var title = (document.querySelector('.page-title') || {}).textContent || document.title;
    if (path) {
      var list = readJSON(RV_KEY, []);
      // Drop any existing entry for this path, then unshift.
      list = list.filter(function (e) { return e.path !== path; });
      list.unshift({ path: path, title: (title || '').trim() });
      if (list.length > RV_LIMIT) list = list.slice(0, RV_LIMIT);
      writeJSON(RV_KEY, list);
    }
  }

  // Render the recently-viewed widget if its container is present.
  var rvWidget = document.querySelector('[data-recently-viewed]');
  var rvList   = document.querySelector('[data-recently-viewed-list]');
  if (rvWidget && rvList) {
    var entries = readJSON(RV_KEY, []);
    if (entries.length) {
      rvWidget.hidden = false;
      rvList.innerHTML = entries.map(function (e) {
        return '<li><a href="' + e.path + '">' + escapeHtml(e.title) + '</a></li>';
      }).join('');
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---------- 5. Code blocks (copy + line numbers) -----------------------
  function addLineNumbers(codeEl) {
    if (!codeEl || codeEl.getAttribute('data-has-line-numbers') === 'true') return;

    var html = codeEl.innerHTML.replace(/\n$/, '');
    var lines = html.split('\n');

    codeEl.innerHTML = lines.map(function (line, index) {
      var content = line.length ? line : '&nbsp;';
      return '<span class="code-line">'
        + '<span class="code-line-number" aria-hidden="true">' + (index + 1) + '</span>'
        + '<span class="code-line-content">' + content + '</span>'
        + '</span>';
    }).join('');

    codeEl.classList.add('has-line-numbers');
    codeEl.setAttribute('data-has-line-numbers', 'true');
  }

  function copyCodeToClipboard(text, btn) {
    function markCopied() {
      var original = btn.textContent;
      btn.textContent = 'Copied';
      btn.setAttribute('data-copied', 'true');
      setTimeout(function () {
        btn.textContent = original;
        btn.removeAttribute('data-copied');
      }, 1200);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(markCopied).catch(function () { /* fallback below */
        legacyCopy();
      });
      return;
    }

    legacyCopy();

    function legacyCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'readonly');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); markCopied(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  // document.querySelectorAll('.prose-body pre').forEach(function (pre) {
  //   if (pre.getAttribute('data-code-enhanced') === 'true') return;
  //   var code = pre.querySelector('code');
  //   if (!code) return;

  //   pre.setAttribute('data-code-enhanced', 'true');

  //   var wrap = document.createElement('div');
  //   wrap.className = 'code-block-wrap';
  //   pre.parentNode.insertBefore(wrap, pre);
  //   wrap.appendChild(pre);

  //   var copyBtn = document.createElement('button');
  //   copyBtn.type = 'button';
  //   copyBtn.className = 'code-copy-btn';
  //   copyBtn.textContent = 'Copy';
  //   copyBtn.setAttribute('aria-label', 'Copy code block');
  //   wrap.appendChild(copyBtn);

  //   copyBtn.addEventListener('click', function () {
  //     copyCodeToClipboard(code.textContent || '', copyBtn);
  //   });

  //   //addLineNumbers(code);
  // });


  document.querySelectorAll('.prose-body .highlight').forEach(function (highlight) {
    if (highlight.getAttribute('data-code-enhanced') === 'true') return;
    
    var pre = highlight.querySelector('pre');
    var code = highlight.querySelector('code');
    if (!pre) return;

    highlight.setAttribute('data-code-enhanced', 'true');

    var wrap = document.createElement('div');
    wrap.className = 'code-block-wrap';
    highlight.parentNode.insertBefore(wrap, highlight);
    wrap.appendChild(highlight);

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'code-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.setAttribute('aria-label', 'Copy code block');
    wrap.appendChild(copyBtn);

    copyBtn.addEventListener('click', function () {
      // If table is used, Hugo puts code in the second <td>
      var codeCell = highlight.querySelector('td:last-child pre code');
      var textToCopy = codeCell ? codeCell.textContent : (code ? code.textContent : pre.textContent);
      copyCodeToClipboard(textToCopy || '', copyBtn);
    });
  });


  // ---------- 6. Lazy images safety net ----------------------------------
  document.querySelectorAll('.prose-body img').forEach(function (img) {
    if (!img.hasAttribute('loading'))  img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });

  // ---------- 7. Chapter back-to-top button ------------------------------
  var chapterPage = document.querySelector('.chapter-page');
  if (chapterPage) {
    var topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'back-to-top';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.setAttribute('title', 'Back to top');
    topBtn.innerHTML = '↑';
    document.body.appendChild(topBtn);

    function syncTopButtonVisibility() {
      var y = window.scrollY || window.pageYOffset || 0;
      topBtn.classList.toggle('is-visible', y > 300);
    }

    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', syncTopButtonVisibility, { passive: true });
    syncTopButtonVisibility();
  }
})();
