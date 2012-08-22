/*global define,window */
/*
 * SkatApp ${project.version}
 * 
 * Copyright 2012, Thomas Scheffler
 * SkatApp is free software: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 * 
 * SkatApp is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with SkatApp.  If not, see <http://www.gnu.org/licenses/>.
 */
define("SkatSync", [ "jquery", "jqm-init", "jquery.mobile", "SkatStorage", "SkatGame" ], function(jQuery, jqmInit, jqm, SkatStorage, SkatGame) {
  "use strict";
  /**
   * @memberOf SkatSync
   * @constant
   * @description URIs relative to storage.dbURL for syncing with SkatDB server
   *              <dl>
   *              <dt>players:</dt>
   *              <dd>get player from SkatDB</dd>
   *              <dt>groups:</dt>
   *              <dd>get groups from SkatDB</dd>
   *              <dt>games:</dt>
   *              <dd>post games to SkatDB</dd>
   *              </dl>
   */
  var api = {
    groups : "JSON/groups",
    players : "JSON/players",
    games : "JSON/games"
  }, SkatSync = SkatStorage.extend(
  /** @lends SkatSync.prototype */
  {
    /** 
     * @constructs
     * @extends SkatStorage 
     */
    init : function() {
    },
    /**
     * @description generated exportable JSON object of all stored games
     * @returns {Array} of games
     */
    getExport : function() {
      var games = this.load("games") || [];
      jQuery.each(games, function(i, game) {
        var value = new SkatGame(game).getPoints();
        game.value = value;
      });
      return games;
    },
    /**
     * @description downloads players from SkatDB and overwrites list in local storage
     */
    downloadPlayer : function() {
      this.apiCall(api.players, function(players) {
        players.sort();
        this.store("players", players);
        window.alert(players.length + " Spieler geladen.");
      });
    },
    /**
     * @description downloads groups from SkatDB and overwrites list in local storage
     */
    downloadGroups : function() {
      this.apiCall(api.groups, function(groups) {
        groups.sort();
        this.store("groups", groups);
        window.alert(groups.length + " Gruppen geladen.");
      });
    },
    /**
     * @description helper methods for GET requests to SkatDB
     * @param {String} path relative path to SkatDB url
     * @param {function} success function that should be called on success with requested json as parameter
     */
    apiCall : function(path, success) {
      var dbURL = this.load("dbURL"), url, that = this;
      if (dbURL === null || dbURL.length === 0) {
        window.alert("Keine SKatDB-URL definiert");
        return;
      }
      url = dbURL + path;
      jQuery.ajax({
        url : url,
        type : 'GET',
        crossDomain : true,
        dataType : 'json',
        error : function(xhr, status) {
          window.alert("Fehler: " + xhr.status + " (" + xhr.statusText + ")");
          if (window.confirm('URL "' + url + '" laden?')) {
            window.location.href = url;
          }
        },
        success : function(json) {
          success.apply(that, [ json ]);
        }
      });
    },
    /**
     * @description transmits all local stored games to SkatDB 
     */
    uploadGames : function() {
      var dbURL = this.load("dbURL"), games, that = this;
      if (dbURL === null || dbURL.length === 0) {
        window.alert("Keine SKatDB-URL definiert");
        return;
      }
      games = this.getExport();
      if (games.length === 0) {
        window.alert("Keine lokalen Spiele zum Übertragen vorhanden.");
        return;
      }
      jQuery.ajax({
        url : dbURL + api.games,
        type : 'POST',
        crossDomain : true,
        data : {
          games : JSON.stringify(games)
        },
        dataType : 'json',
        error : function(xhr, status) {
          window.alert("Fehler: " + xhr.status + " (" + xhr.statusText + "):\n" + xhr.responseText);
          // console.log(xhr);
        },
        success : function(json) {
          var uploaded = games.length, failedGames;
          if (json.handList) {
            failedGames = json.handList;
            that._skat.store("games", failedGames);
            uploaded -= failedGames.length;
          } else {
            that._skat.settings.removeGames();
          }
          window.alert(uploaded + " von " + games.length + " Spielen hochgeladen:\n" + json.msg);
        }
      });
    }
  });
  SkatSync.api = api;
  return SkatSync;
});
