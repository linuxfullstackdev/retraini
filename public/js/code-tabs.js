/* Multi-language code tabs interactions */
(function () {
  'use strict';

  function initTabs(container) {
    if (!container || container.getAttribute('data-tabs-ready') === 'true') return;

    var tabs = Array.prototype.slice.call(container.querySelectorAll('.multi-code-tabs__tab'));
    var panels = Array.prototype.slice.call(container.querySelectorAll('.multi-code-tabs__panel'));
    var select = container.querySelector('[data-code-tabs-select]');

    if (!tabs.length || !panels.length) return;

    function activateTab(index, moveFocus) {
      tabs.forEach(function (tab, idx) {
        var isActive = idx === index;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
        if (isActive && moveFocus) tab.focus();
      });

      panels.forEach(function (panel, idx) {
        var isActive = idx === index;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });

      if (select && String(select.value) !== String(index)) {
        select.value = String(index);
      }
    }

    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () {
        activateTab(idx, false);
      });

      tab.addEventListener('keydown', function (event) {
        var key = event.key;
        var nextIndex = idx;

        if (key === 'ArrowRight') {
          nextIndex = (idx + 1) % tabs.length;
        } else if (key === 'ArrowLeft') {
          nextIndex = (idx - 1 + tabs.length) % tabs.length;
        } else if (key === 'Home') {
          nextIndex = 0;
        } else if (key === 'End') {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        activateTab(nextIndex, true);
      });
    });

    if (select) {
      select.addEventListener('change', function () {
        var selectedIndex = parseInt(select.value, 10);
        if (!isNaN(selectedIndex)) activateTab(selectedIndex, false);
      });
    }

    activateTab(0, false);
    container.setAttribute('data-tabs-ready', 'true');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var containers = document.querySelectorAll('[data-component="multi-code-tabs"]');
    containers.forEach(initTabs);
  });
})();
