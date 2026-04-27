/* ============================================================================
   settings.js — font scale persistence + settings page UI.
   ----------------------------------------------------------------------------
   The actual application of the scale happens via a tiny inline script in
   layouts/_default/baseof.html so that it runs *before* first paint and
   avoids any flicker. This file is responsible only for the settings page
   controls and writing back to localStorage.

   Storage:  localStorage['ttsFontScale'] = "1.15"   // string number
   CSS var:  --user-font-scale on :root, multiplied into html { font-size }
   ========================================================================== */

(function () {
  'use strict';

  var KEY = 'ttsFontScale';
  var DEFAULT_SCALE = 1.15; // Large

  function read() {
    try { return parseFloat(localStorage.getItem(KEY)) || DEFAULT_SCALE; }
    catch (e) { return DEFAULT_SCALE; }
  }
  function write(scale) {
    try { localStorage.setItem(KEY, String(scale)); }
    catch (e) { /* private mode etc. */ }
  }

  function apply(scale) {
    document.documentElement.style.setProperty('--user-font-scale', scale);
    var output = document.getElementById('font-output');
    if (output) output.textContent = Math.round(scale * 100) + '%';
    syncPresetButtons(scale);
  }

  function syncPresetButtons(scale) {
    document.querySelectorAll('[data-font-preset]').forEach(function (btn) {
      var v = parseFloat(btn.getAttribute('data-font-preset'));
      btn.setAttribute('aria-pressed', Math.abs(v - scale) < 0.001 ? 'true' : 'false');
    });
  }

  // ---------- Bootstrap on every page -----------------------------------
  // baseof.html already applied the saved scale; we just sync visible UI.
  apply(read());

  // ---------- Preset buttons --------------------------------------------
  document.querySelectorAll('[data-font-preset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = parseFloat(btn.getAttribute('data-font-preset'));
      if (isNaN(v)) return;
      write(v);
      apply(v);
      var slider = document.querySelector('[data-font-slider]');
      if (slider) slider.value = v;
    });
  });

  // ---------- Slider ----------------------------------------------------
  var slider = document.querySelector('[data-font-slider]');
  if (slider) {
    slider.value = read();
    slider.addEventListener('input', function () {
      var v = parseFloat(slider.value) || 1;
      write(v);
      apply(v);
    });
  }

  // ---------- Reset -----------------------------------------------------
  document.querySelectorAll('[data-font-reset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      write(DEFAULT_SCALE);
      apply(DEFAULT_SCALE);
      if (slider) slider.value = DEFAULT_SCALE;
    });
  });
})();
