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
define("SkatStorage", [ "jquery", "jqm-init", "jquery.mobile", "Class", "SkatGame" ], function(jQuery, jqmInit, jqm, Class, SkatGame) {
  "use strict";
  var SkatStorage = Class.extend(
  /** @lends SkatStorage.prototype */
  {
    /** @constructs */
    init : function() {
    },
    /**
     * @memberOf Skat#
     * @constant
     * @description storage keys for localStorage
     *              <dl>
     *              <dt>games:</dt>
     *              <dd>uncommitted games</dd>
     *              <dt>players:</dt>
     *              <dd>all player names</dd>
     *              <dt>groups:</dt>
     *              <dd>all group names</dd>
     *              <dt>dbURL:</dt>
     *              <dd>URL do SkatDB server</dd>
     *              </dl>
     */
    storage : {
      games : "games",
      players : "players",
      groups : "groups",
      dbURL : "dbURL"
    },
    load : function(storeKey, value) {
      return JSON.parse(window.localStorage.getItem(this.storage[storeKey]));
    },
    store : function(storeKey, value) {
      window.localStorage.setItem(this.storage[storeKey], JSON.stringify(value));
    },
    deleteGame : function(gameNumber) {
      var games = this.load("games") || [];
      if (gameNumber < 0 || gameNumber >= games.length) {
        return false;
      }
      if (window.confirm('Spiel Nr.' + (gameNumber + 1) + ' wirklich löschen?')) {
        games.splice(gameNumber, 1);
        this.store("games", games);
        return true;
      }
      return false;
    },
    loadGame : function(gameNumber) {
      var games = (this.load("games") || []), game;
      if (gameNumber < 0 || gameNumber >= games.length) {
        return false;
      }
      game = games[gameNumber];
      this.forms.updateForm(new SkatGame(game));
      this.currentGame = gameNumber;
      return true;
    },
    removeGames : function() {
      this._skat.store("games", []);
      return true;
    },
    clearStorage : function() {
      window.localStorage.clear();
    }
  });
  return SkatStorage;
});
