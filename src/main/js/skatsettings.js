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
    [ "jquery", "jqm-init", "jquery.mobile", "SkatStorage" ],
    function(jQuery, jqmInit, jqm, SkatStorage) {
      "use strict";
      var SkatSettings = SkatStorage
          .extend(
          /** @lends SkatSettings.prototype */
          {
            /** 
             * @constructs
             * @extends SkatStorage 
             */
            init : function() {
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
            }
          });
      return SkatSettings;
    });
