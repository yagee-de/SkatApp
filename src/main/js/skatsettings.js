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
define("SkatSettings",
    [ "jquery", "jqm-init", "jquery.mobile", "Class" ],
    function(jQuery, jqmInit, jqm, Class) {
      "use strict";
      var SkatSettings = Class
          .extend(
          /** @lends SkatSettings.prototype */
          {
            _skat : null,
            /** @constructs */
            init : function(skatInstance) {
              this._skat = skatInstance;
            },
            initSettings : function() {
              // dbURL
              var skatURL = this._skat.load("dbURL"), playerList = jQuery("#playerList"), players = (this._skat.load("players") || []), groupList = jQuery("#groupList"), groups = (this._skat
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
            addPlayer : function(playerName) {
              var players = (this._skat.load("players") || []), i;
              for (i = 0; i < players.lenght; i++) {
                if (players[i] === playerName) {
                  return;
                }
              }
              players.push(playerName);
              players.sort();
              this._skat.store("players", players);
            },
            addGroup : function(groupName) {
              var groups = (this._skat.load("groups") || []), i;
              for (i = 0; i < groups.lenght; i++) {
                if (groups[i] === groupName) {
                  return;
                }
              }
              groups.push(groupName);
              this._skat.store("groups", groups);
            },
            setDbURL : function(url) {
              this._skat.store("dbURL", url);
            },
            removeGames : function() {
              this._skat.store("games", []);
              return true;
            },
            clearStorage : function() {
              window.localStorage.clear();
            }
          });
      return SkatSettings;
    });
