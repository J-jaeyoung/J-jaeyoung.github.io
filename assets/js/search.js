/*
 * Ctrl+K fuzzy search for About & Blog.
 * Loads /search.json once (lazily, on first open), runs Fuse.js over it,
 * and drives a centered modal with keyboard navigation.
 */
(function () {
  'use strict';

  var INDEX_URL = window.SEARCH_INDEX_URL || '/search.json';
  var MAX_RESULTS = 8;

  var fuse = null;
  var loaded = false;
  var loadingPromise = null;
  var lastFocused = null;
  var results = [];
  var activeIndex = -1;

  var overlay, modal, input, list, trigger;

  /* ---------- helpers ---------- */

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function findMatch(matches, key) {
    if (!matches) return null;
    for (var i = 0; i < matches.length; i++) {
      if (matches[i].key === key && matches[i].indices && matches[i].indices.length) {
        return matches[i];
      }
    }
    return null;
  }

  // Build HTML for value, wrapping Fuse index ranges (inclusive) in <mark>,
  // restricted to the [winStart, winEnd) window. All text is HTML-escaped.
  function highlightRanges(value, indices, winStart, winEnd) {
    value = value == null ? '' : String(value);
    winStart = winStart || 0;
    winEnd = (winEnd == null) ? value.length : winEnd;
    var ranges = (indices || [])
      .filter(function (r) { return r[1] >= winStart && r[0] < winEnd; })
      .sort(function (a, b) { return a[0] - b[0]; });
    var out = '';
    var pos = winStart;
    for (var i = 0; i < ranges.length; i++) {
      var s = Math.max(ranges[i][0], winStart);
      var e = Math.min(ranges[i][1], winEnd - 1);
      if (e < s || s < pos) continue;
      if (s > pos) out += escapeHtml(value.slice(pos, s));
      out += '<mark>' + escapeHtml(value.slice(s, e + 1)) + '</mark>';
      pos = e + 1;
    }
    if (pos < winEnd) out += escapeHtml(value.slice(pos, winEnd));
    return out;
  }

  function highlightTitle(title, matches) {
    var m = findMatch(matches, 'title');
    if (!m) return escapeHtml(title);
    return highlightRanges(title, m.indices, 0, title.length);
  }

  function buildSnippet(content, matches) {
    content = content || '';
    var m = findMatch(matches, 'content');
    if (!m) {
      var head = content.slice(0, 150);
      return escapeHtml(head) + (content.length > 150 ? '…' : '');
    }
    // Center the window on the longest matched range.
    var longest = m.indices.slice().sort(function (a, b) {
      return (b[1] - b[0]) - (a[1] - a[0]);
    })[0];
    var WIN = 150;
    var start = Math.max(0, longest[0] - 50);
    var end = Math.min(content.length, start + WIN);
    var prefix = start > 0 ? '…' : '';
    var suffix = end < content.length ? '…' : '';
    return prefix + highlightRanges(content, m.indices, start, end) + suffix;
  }

  /* ---------- index loading ---------- */

  function loadIndex() {
    if (loaded) return Promise.resolve();
    if (loadingPromise) return loadingPromise;
    loadingPromise = fetch(INDEX_URL, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (docs) {
        fuse = new Fuse(docs || [], {
          keys: [
            { name: 'title', weight: 0.7 },
            { name: 'content', weight: 0.3 }
          ],
          includeMatches: true,
          includeScore: true,
          ignoreLocation: true,
          threshold: 0.4,
          minMatchCharLength: 2
        });
        loaded = true;
      })
      .catch(function (err) {
        loadingPromise = null; // allow retry on next open
        throw err;
      });
    return loadingPromise;
  }

  /* ---------- rendering ---------- */

  function setStatus(msg) {
    list.innerHTML = '';
    var li = document.createElement('li');
    li.className = 'search-status';
    li.textContent = msg;
    list.appendChild(li);
  }

  function runSearch(q) {
    q = (q || '').trim();
    if (!q) {
      results = [];
      activeIndex = -1;
      setStatus('Type to search About & Blog…');
      return;
    }
    if (!fuse) {
      setStatus('Loading…');
      return;
    }
    results = fuse.search(q, { limit: MAX_RESULTS });
    activeIndex = results.length ? 0 : -1;
    renderResults(q);
  }

  function renderResults(q) {
    if (!results.length) {
      setStatus('No results for “' + q + '”');
      return;
    }
    list.innerHTML = '';
    results.forEach(function (res, i) {
      var item = res.item;
      var isBlog = item.type === 'Blog';
      var meta = isBlog && item.date ? (item.type + ' · ' + item.date) : item.type;

      var li = document.createElement('li');
      li.className = 'search-result' + (i === activeIndex ? ' is-selected' : '');
      li.id = 'search-result-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
      li.dataset.index = i;
      li.dataset.url = item.url;
      li.innerHTML =
        '<span class="search-result-badge ' + (isBlog ? 'is-blog' : 'is-about') + '">' +
          escapeHtml(meta) +
        '</span>' +
        '<span class="search-result-body">' +
          '<span class="search-result-title">' + highlightTitle(item.title, res.matches) + '</span>' +
          '<span class="search-result-snippet">' + buildSnippet(item.content, res.matches) + '</span>' +
        '</span>';
      list.appendChild(li);
    });
    updateActiveDescendant();
  }

  function updateSelection() {
    var nodes = list.querySelectorAll('.search-result');
    for (var i = 0; i < nodes.length; i++) {
      var on = (i === activeIndex);
      nodes[i].classList.toggle('is-selected', on);
      nodes[i].setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) nodes[i].scrollIntoView({ block: 'nearest' });
    }
    updateActiveDescendant();
  }

  function updateActiveDescendant() {
    if (activeIndex >= 0) {
      input.setAttribute('aria-activedescendant', 'search-result-' + activeIndex);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function move(delta) {
    if (!results.length) return;
    activeIndex = (activeIndex + delta + results.length) % results.length;
    updateSelection();
  }

  function selectActive() {
    if (activeIndex < 0 || !results[activeIndex]) return;
    var url = results[activeIndex].item.url;
    closeModal();
    if (url) window.location.href = url;
  }

  /* ---------- open / close ---------- */

  function isOpen() {
    return overlay.classList.contains('is-open');
  }

  function openModal() {
    if (isOpen()) return;
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-open');
    input.value = '';
    runSearch('');
    input.focus();
    loadIndex()
      .then(function () { if (isOpen()) runSearch(input.value); })
      .catch(function () { if (isOpen()) setStatus('Search index failed to load.'); });
  }

  function closeModal() {
    if (!isOpen()) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-open');
    results = [];
    activeIndex = -1;
    updateActiveDescendant();
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  /* ---------- wiring ---------- */

  function init() {
    overlay = document.getElementById('search-overlay');
    modal = document.getElementById('search-modal');
    input = document.getElementById('search-input');
    list = document.getElementById('search-results');
    trigger = document.getElementById('search-trigger');
    if (!overlay || !modal || !input || !list) return;

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }

    input.addEventListener('input', function () { runSearch(input.value); });

    // Close when clicking the dimmed backdrop (but not the modal itself).
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) closeModal();
    });

    list.addEventListener('click', function (e) {
      var li = e.target.closest('.search-result');
      if (!li) return;
      activeIndex = parseInt(li.dataset.index, 10);
      selectActive();
    });

    list.addEventListener('mousemove', function (e) {
      var li = e.target.closest('.search-result');
      if (!li) return;
      var i = parseInt(li.dataset.index, 10);
      if (i !== activeIndex) { activeIndex = i; updateSelection(); }
    });

    document.addEventListener('keydown', function (e) {
      var k = e.key;
      if ((e.ctrlKey || e.metaKey) && (k === 'k' || k === 'K')) {
        e.preventDefault();
        if (isOpen()) closeModal(); else openModal();
        return;
      }
      if (!isOpen()) return;
      if (k === 'Escape') { e.preventDefault(); closeModal(); }
      else if (k === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (k === 'Enter') { e.preventDefault(); selectActive(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
