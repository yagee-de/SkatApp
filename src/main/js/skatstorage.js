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
    /** 
     * @constructs
     * @extends Class 
     */
    init : function() {
    },
    /**
     * @memberOf SkatStorage#
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
    /**
     * @description load stored object from local storage
     * @param {String} storeKey key of object in local storage
     * @returns {Object}
     */
    load : function(storeKey) {
      return JSON.parse(window.localStorage.getItem(this.storage[storeKey]));
    },
    /**
     * @description save object to local storage
     * @param {String} storeKey key of object in local storage
     * @param {Object} value object to store
     */
    store : function(storeKey, value) {
      window.localStorage.setItem(this.storage[storeKey], JSON.stringify(value));
    },
    /**
     * @description deletes game with given number after user confirm
     * @param {int} gameNumber number of game (counting from 0)
     */
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
    /**
     * @description delete all stored games
     */
    removeGames : function() {
      this.store("games", []);
      return true;
    },
    /**
     * @description clear local storage (removing dbURL, games, players and groups)
     */
    clearStorage : function() {
      window.localStorage.clear();
    }
  });
  return SkatStorage;
});
