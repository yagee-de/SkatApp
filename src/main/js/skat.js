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
    [ "jquery", "jqm-init", "jquery.mobile", "Class", "SkatForm", "SkatGame" ],
    function(jQuery, jqmInit, jqm, Class, SkatForm, SkatGame) {
      "use strict";
      var Skat = Class
          .extend(
          /** @lends Skat.prototype */
          {
            /** @constructs */
            init : function() {
              this.form = new SkatForm(this);
            },
            /**
             * @memberOf Skat#
             * @constant
             * @description maps javascript month to names
             */
            month : [ "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ],
            /**
             * @memberOf Skat#
             * @constant
             * @description maps javascript days to names
             */
            day : [ "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Sonnabend" ],
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
            initSettings : function() {
              // dbURL
              var skatURL = this.load("dbURL"), playerList = jQuery("#playerList"), players = (this.load("players") || []), groupList = jQuery("#groupList"), groups = (this
                  .load("groups") || []);
              jQuery("#dbURL").val(skatURL);
              // players
              jQuery("#playerList .player").remove();
              jQuery.each(players, function(i, player) {
                jQuery('<li class="player"/>').text(player).appendTo(playerList);
              });
              playerList.listview("refresh");
              // groups
              jQuery("#groupList .group").remove();
              jQuery.each(groups, function(i, group) {
                jQuery('<li class="group"/>').text(group).appendTo(groupList);
              });
              groupList.listview("refresh");
            },
            initGames : function() {
              var list = jQuery("#gameList"), games = (this.load("games") || []), date = null;
              list.empty();
              jQuery.each(games, jQuery.proxy(function(i, value) {
                var game = new SkatGame(value), curDate = game.getDateString(), li, link;
                if (curDate !== date) {
                  date = curDate;
                  // <li data-role="list-divider">Friday, October 8, 2010 <span class="ui-li-count">2</span></li>
                  list.append('<li data-role="list-divider">' + curDate + '</li>');
                }
                li = jQuery('<li/>');
                li.addClass(value.won ? "won" : "lost");
                link = jQuery('<a href="form.html" data-transition="slide" data-prepareGame="' + i + '"/>');
                li.append(link);
                game.appendInfo(link);
                list.append(li);
              }, this));
              list.listview("refresh");
            },
            prepareGame : function(gameNumber) {
              this.currentGame = typeof gameNumber === 'number' ? gameNumber : -1;
              return false;
            },
            clearStorage : function() {
              window.localStorage.clear();
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
            storeGame : function() {
              var game = this.form.getGame().toJSON(), games;
              if (game.player.length === 0) {
                window.alert("Kein Spieler ausgewählt");
                jQuery.mobile.silentScroll(0);
                return;
              }
              games = this.load("games") || [];
              if (this.currentGame === -1) {
                games.push(game);
                this.form.resetForm();
                this.form.refreshForm();
              } else {
                games[this.currentGame] = game;
              }
              this.store("games", games);
              window.alert("Spiel gespeichert");
              if (this.currentGame === -1) {
                jQuery.mobile.silentScroll(0);
              } else {
                location.back();
              }
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
            removeGames : function() {
              this.store("games", []);
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
            addPlayer : function(playerName) {
              var players = (this.load("players") || []), i;
              for (i = 0; i < players.lenght; i++) {
                if (players[i] === playerName) {
                  return;
                }
              }
              players.push(playerName);
              players.sort();
              this.store("players", players);
            },
            addGroup : function(groupName) {
              var groups = (this.load("groups") || []), i;
              for (i = 0; i < groups.lenght; i++) {
                if (groups[i] === groupName) {
                  return;
                }
              }
              groups.push(groupName);
              this.store("groups", groups);
            },
            setDbURL : function(url) {
              this.store("dbURL", url);
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
