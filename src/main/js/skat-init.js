/*global define,window */
define([ "jquery", "jqm-init", "jquery.mobile", "Skat" ], function(jQuery, jqmInit, jqm, Skat) {
  "use strict";
  var skat = new Skat();
  window.skat = skat;
  // global init
  window.addEventListener('load', function(e) {
    if (window.applicationCache) {
      window.applicationCache.addEventListener('updateready', function(e) {
        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
          // Browser downloaded a new app cache.
          // Swap it in and reload the page to get the new hotness.
          window.applicationCache.swapCache();
          if (window.confirm('Neue Version von SkatApp verfügbar. Neu Laden?')) {
            window.location.reload();
          }
        }
      }, false);
    }
  }, false);
  jQuery(document).ready(function() {
    jQuery("*[data-preparegame]").live("vclick", function(e) {
      skat.prepareGameHandler(e);
    });
  });
  jQuery(document).bind("pageinit", function() {});
  jQuery(document).delegate("#formPage", "pagebeforecreate", function() {
    skat.form.createComplete = false;
    skat.form.initBiddingValues();
    skat.form.initJacks();
    skat.form.initPlayers();
    skat.form.initGroups();
    skat.form.resetForm();
    skat.form.createComplete = true;
  });
  jQuery(document).delegate("#formPage", "pagebeforeshow", function(event, data) {
    skat.form.initPlayers();
    skat.form.initGroups();
    skat.form.fillForm(skat.currentGame);
    skat.form.refreshForm();
    skat.form.updateScore();
  });
  jQuery(document).delegate("#gamesPage", "pagebeforeshow", function() {
    skat.games.initGames();
  });
  jQuery(document).delegate("#settingsPage", "pagebeforeshow", function() {
    skat.settings.initSettings();
  });
  jQuery(document).change(function() {
    skat.form.updateScore();
  });

});
