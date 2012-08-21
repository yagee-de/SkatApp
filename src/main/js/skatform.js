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
define("SkatForm",
    [ "jquery", "jqm-init", "jquery.mobile", "Class", "SkatGame" ],
    function(jQuery, jqmInit, jqm, Class, SkatGame) {
      "use strict";
      var SkatForm = Class
          .extend(
          /** @lends SkatForm.prototype */
          {
            _skat : null,
            /** @constructs */
            init : function(skatInstance) {
              this._skat = skatInstance;
            },
            bids : [ 18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54, 55, 59, 60, 63, 66, 70, 72, 77, 80, 81, 84, 88,
                90, 96, 99, 100, 108, 110, 117, 120, 121, 126, 130, 132, 135, 140, 143, 144, 150, 153, 154, 156, 160, 162, 165, 168, 170,
                176, 180, 187, 192, 198, 204, 216, 240, 264 ],
            /**
             * @memberOf Skat#
             * @description current game from localStore or '-1' for new game
             */
            currentGame : -1,
            createComplete : false,
            initBiddingValues : function() {
              var biddingSelector = '#bid';
              jQuery(biddingSelector).empty();
              jQuery(biddingSelector).append('<option value="0">Ramsch</option>');
              jQuery.each(this.bids, function(i, value) {
                var option = jQuery('<option>').text(value).attr('value', value);
                if (i === 0) {
                  option.attr('selected', true);
                }
                jQuery(biddingSelector).append(option);
              });
            },
            initPlayers : function() {
              var players = (this._skat.load("players") || []), playersSelector = "#player", option;
              jQuery(playersSelector).empty();
              option = jQuery('<option>').attr('selected', true);
              jQuery(playersSelector).append(option);
              jQuery.each(players, function(i, player) {
                option = jQuery('<option>').text(player).attr('value', player);
                jQuery(playersSelector).append(option);
              });
            },
            initGroups : function() {
              var groups = (this._skat.load("groups") || []), groupsSelector = "#group";
              jQuery(groupsSelector).empty();
              jQuery.each(groups, function(i, group) {
                var option = jQuery('<option>').text(group).attr('value', group);
                if (i === 0) {
                  option.attr('selected', true);
                }
                jQuery(groupsSelector).append(option);
              });
            },
            initJacks : function() {
              var jacksSelector = "#jacks", i, option;
              jQuery(jacksSelector).empty();
              for (i = 1; i < 12; i++) {
                option = jQuery('<option>').text(i).attr('value', i);
                if (i === 0) {
                  option.attr('selected', true);
                }
                jQuery(jacksSelector).append(option);
              }
            },
            fillForm : function(gameNumber) {
              if (gameNumber < 0) {
                jQuery("#deleteButton").parentsUntil("#inputForm", "div.ui-btn").hide();
                jQuery("#formPage").children(":jqmData(role=header)").children("h1").text("Spiel anlegen");
                return;
              }
              var games = this._skat.load("games") || [], game;
              if (gameNumber >= games.length) {
                return;
              }
              game = games[gameNumber];
              jQuery("#formPage").children(":jqmData(role=header)").children("h1").text("Spiel Nr. " + (gameNumber + 1) + " bearbeiten");
              jQuery("#won").attr("checked", game.won ? true : false);
              jQuery("#hand").attr("checked", game.hand ? true : false);
              this.updateGameLevel();
              jQuery("#group").val(game.group);
              jQuery("#player").val(game.player);
              jQuery("#bid").val(game.bid).trigger('onchange');
              jQuery("#jacks").val(game.jacks);
              jQuery("#gameType").val(game.gameType);
              jQuery("#gameLevel").val(game.gameLevel);
              jQuery("#announcement").val(game.announcement);
              jQuery("#timeCreated").val((new Date(game.createDate)).toISOString());
              jQuery("#points").val(game.points ? game.points : 40);
              jQuery("#deleteButton").parentsUntil("#inputForm", "div.ui-btn").show();
            },
            resetForm : function() {
              jQuery("#won").attr("checked", true);
              jQuery("#hand").attr("checked", false);
              this.updateGameLevel();
              jQuery("#player").val(jQuery(this).prop("defaultSelected"));
              jQuery("#bid").val(18).trigger('onchange');
              jQuery("#jacks").val(1);
              jQuery("#gameType").val(9);
              jQuery("#gameLevel").val(1);
              jQuery("#announcement").val(1);
              if (jQuery("#timeCreated").val().length === 0) {
                jQuery("#timeCreated").val((new Date()).toISOString());
              }
              jQuery("#points").val(40);
            },
            refreshForm : function() {
              jQuery("#won").checkboxradio("refresh");
              jQuery("#hand").checkboxradio("refresh");
              jQuery("#player").selectmenu("refresh");
              jQuery("#group").selectmenu("refresh");
              jQuery("#bid").selectmenu("refresh");
              jQuery("#jacks").selectmenu("refresh");
              jQuery("#gameType").selectmenu("refresh");
              jQuery("#gameLevel").selectmenu("refresh");
              jQuery("#announcement").selectmenu("refresh");
              jQuery("#points").slider("refresh");
            },
            updateScore : function() {
              var game = this.getGame(), gamePoints = game.getPoints();
              document.getElementById("p1").innerHTML = "Punkte: " + gamePoints;
            },
            bidChange : function(source) {
              var bid = parseInt(source.value, 10);
              source.old = source.recent;
              source.recent = bid;
              // console.log("bid: " + bid + ", old value: " + source.old);
              if ((bid === 0 && source.old !== 0) || (source.old === 0 && bid !== 0)) {
                jQuery("#points").parentsUntil("#inputForm", "div.ui-field-contain").toggle();
                jQuery("#hand").parentsUntil("#inputForm", "div.ui-field-contain").toggle();
                jQuery("#gameType").parentsUntil("#inputForm", "div.ui-field-contain").toggle();
                jQuery("#announcement").parentsUntil("#inputForm", "div.ui-field-contain").toggle();
                jQuery("#jacks").parentsUntil("#inputForm", "div.ui-field-contain").toggle();
                jQuery("#won").parentsUntil("#inputForm", "div.ui-field-contain").toggle();
                this.updateGameLevel();
              }
            },
            updateGameLevel : function() {
              if (parseInt(jQuery("#bid").val(), 10) === 0) {
                document.getElementById("gameLevel").innerHTML = "<option value=-1>Normal</option><option value=-2>Jungfer (*-2)</option><option value=2>Durchmarsch (*2)</option>";
              } else if (jQuery("#hand").attr('checked')) {
                document.getElementById("gameLevel").innerHTML = "<option value=2>Hand (+2)</option><option value=3>Schneider (+3)</option><option value=4>Schneider angesagt (+4)</option><option value=5>Schwarz (+5)</option><option value=6>Schwarz angesagt (+6)</option><option value=7>Ouvert (+7)</option>";
              } else {
                document.getElementById("gameLevel").innerHTML = "<option value=1>Normal (+1)</option><option value=2>Schneider (+2)</option><option value=3>Schwarz (+3)</option>";
              }
              if (this.createComplete) {
                jQuery("#gameLevel").selectmenu("refresh");
              }
            },
            getGame : function() {
              var group = jQuery("#group").val(), player = jQuery("#player").val(), bid = parseInt(jQuery("#bid").val(), 10), gamelevel = parseInt(jQuery("#gameLevel")
                  .val(),
                  10), modified = new Date().getTime(), created = modified, timeCreated, json, points;
              try {
                timeCreated = jQuery("#timeCreated").val();
                if (timeCreated.length > 0) {
                  timeCreated = new Date(timeCreated);
                  created = timeCreated.getTime();
                }
              } catch (e) {
                window.alert(e);
              }
              json = {
                "group" : group,
                "player" : player,
                "bid" : bid,
                "gameLevel" : gamelevel,
                "createDate" : created,
                "modifyDate" : modified
              };
              if (bid === 0) {
                // Ramsch
                points = parseInt(jQuery("#points").val(), 10);
                json.points = (gamelevel === 2) ? 120 : points;
                json.won = (gamelevel === 2);
              } else {
                json.jacks = parseInt(jQuery("#jacks").val(), 10);
                json.gameType = parseInt(jQuery("#gameType").val(), 10);
                json.hand = jQuery("#hand").attr('checked') ? true : false;
                json.announcement = parseInt(jQuery("#announcement").val(), 10);
                json.won = jQuery("#won").attr('checked') ? true : false;

              }
              return new SkatGame(json);
            },
            updateForm : function(game) {
              jQuery("#group").val(game.group).selectmenu("refresh");
              jQuery("#player").val(game.player).selectmenu("refresh");
              jQuery("#bid").val(game.bid).selectmenu("refresh");
              jQuery("#jacks").val(game.jacks).selectmenu("refresh");
              jQuery("#gameType").val(game.gameType).selectmenu("refresh");
              jQuery("#hand").attr('checked', game.hand).checkboxradio("refresh");
              jQuery("#gameLevel").val(game.gameLevel).selectmenu("refresh");
              jQuery("#announcement").val(game.announcement).selectmenu("refresh");
              jQuery("#won").attr('checked', game.won).checkboxradio("refresh");
            }
          });
      return SkatForm;
    });
