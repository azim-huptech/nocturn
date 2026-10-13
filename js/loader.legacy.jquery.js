/*
 * Legacy jQuery equivalent of js/loader.js — kept for reference / comparison.
 *
 * To actually run this snippet, add in the HTML head BEFORE this file:
 *   <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
 *   <script src="js/loader.legacy.jquery.js"></script>
 *
 * It is NOT loaded by the app today; the ES module version is the real path.
 */

(function ($) {
  if (!$) {
    console.warn('[legacy loader] jQuery not loaded — skipping.');
    return;
  }

  var SOURCES = {
    collections: 'data/collections.json',
    testimonials: 'data/testimonials.json',
    stats: 'data/stats.json',
  };

  // $.when is jQuery's Promise.all. Each getJSON resolves with a 3-tuple
  // [data, statusText, jqXHR] — unlike native fetch which resolves to the body.
  $.when(
    $.getJSON(SOURCES.collections),
    $.getJSON(SOURCES.testimonials),
    $.getJSON(SOURCES.stats)
  ).done(function (collectionsRes, testimonialsRes, statsRes) {
    var collections = collectionsRes[0];
    var testimonials = testimonialsRes[0];
    var stats = statsRes[0];
    window.__nocturnLegacy = { collections: collections, testimonials: testimonials, stats: stats };
    console.log('[jQuery loader] loaded', window.__nocturnLegacy);
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error('[jQuery loader] failed', textStatus, errorThrown);
  });
})(window.jQuery);
