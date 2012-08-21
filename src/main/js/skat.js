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
define("Skat",
    [ "jquery", "jqm-init", "jquery.mobile", "Class", "SkatForm", "SkatGame", "SkatGames", "SkatSettings" ],
    function(jQuery, jqmInit, jqm, Class, SkatForm, SkatGame, SkatGames, SkatSettings) {
      "use strict";
      var Skat = Class
          .extend(
          /** @lends Skat.prototype */
          {
            /** @constructs */
            init : function() {
              this.form = new SkatForm(this);
              this.games = new SkatGames(this);
              this.settings = new SkatSettings(this);
            },
            /**
             * @memberOf Skat#
             * @description current game from localStore or '-1' for new game
             */
            currentGame : -1,
            /**
             * @memberOf Skat#
             * @description logic for form page
             * @type SkatForm
             */
            form : null,
            /**
             * @memberOf Skat#
             * @description logic for games page
             * @type SkatGames
             */
            games : null,
            /**
             * @memberOf Skat#
             * @description logic for settings page
             * @type SkatSettings
             */
            settings : null,
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
            /**
             * @memberOf Skat#
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
            api : {
              groups : "JSON/groups",
              players : "JSON/players",
              games : "JSON/games"
            },
            prepareGameHandler : function(e) {
              var game = parseInt(jQuery(e.currentTarget).attr("data-preparegame"), 10);
              this.prepareGame(game);
            },
            onUpdateReady : function() {
              window.alert("SkatApp aktualisiert");
            },
            prepareGame : function(gameNumber) {
              this.currentGame = typeof gameNumber === 'number' ? gameNumber : -1;
              return false;
            },
            getExport : function() {
              var games = this.load("games") || [];
              jQuery.each(games, jQuery.proxy(function(i, game) {
                var value = new SkatGame(game).getPoints();
                game.value = value;
              }, this));
              return games;
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
              games.splice(gameNumber, 1);
              this.store("games", games);
              return true;
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
            downloadPlayer : function() {
              this.apiCall(this.api.players, function(players) {
                players.sort();
                this.store("players", players);
                window.alert(players.length + " Spieler geladen.");
              });
            },
            downloadGroups : function() {
              this.apiCall(this.api.groups, function(groups) {
                groups.sort();
                this.store("groups", groups);
                window.alert(groups.length + " Gruppen geladen.");
              });
            },
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
                url : dbURL + this.api.games,
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
                    that.store("games", failedGames);
                    uploaded -= failedGames.length;
                  } else {
                    that.removeGames();
                  }
                  window.alert(uploaded + " von " + games.length + " Spielen hochgeladen:\n" + json.msg);
                }
              });
            }
          });
      return Skat;
    });
