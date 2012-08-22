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
    [ "jquery", "jqm-init", "jquery.mobile", "SkatGame", "SkatStorage" ],
    function(jQuery, jqmInit, jqm, SkatGame, SkatStorage) {
      "use strict";
      var SkatForm = SkatStorage
          .extend(
          /** @lends SkatForm.prototype */
          {
            /** 
             * @constructs
             * @extends SkatStorage 
             */
            init : function() {
            },
            /**
             * @memberOf SkatForm#
             * @description current game from localStore or '-1' for new game
             */
            currentGame : -1,
            createComplete : false,
            initBiddingValues : function() {
              var biddingSelector = '#bid';
              jQuery(biddingSelector).empty();
              jQuery(biddingSelector).append('<option value="0">Ramsch</option>');
              jQuery.each(SkatGame.bids, function(i, value) {
                var option = jQuery('<option>').text(value).attr('value', value);
                if (i === 0) {
                  option.attr('selected', true);
                }
                jQuery(biddingSelector).append(option);
              });
            },
            initPlayers : function() {
              var players = (this.load("players") || []), playersSelector = "#player", option;
              jQuery(playersSelector).empty();
              option = jQuery('<option>').attr('selected', true);
              jQuery(playersSelector).append(option);
              jQuery.each(players, function(i, player) {
                option = jQuery('<option>').text(player).attr('value', player);
                jQuery(playersSelector).append(option);
              });
            },
            initGroups : function() {
              var groups = (this.load("groups") || []), groupsSelector = "#group";
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
              var games = this.load("games") || [], game;
              if (gameNumber >= games.length) {
                return;
              }
              game = new SkatGame(games[gameNumber]);
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
              jQuery("#timeCreated").val(game.createDate.toISOString());
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
              switch (bid) {
              case 0:
                jQuery("#points").parentsUntil("#inputForm", "div.ui-field-contain").show();
                jQuery("#hand").parentsUntil("#inputForm", "div.ui-field-contain").hide();
                jQuery("#gameType").parentsUntil("#inputForm", "div.ui-field-contain").hide();
                jQuery("#announcement").parentsUntil("#inputForm", "div.ui-field-contain").hide();
                jQuery("#jacks").parentsUntil("#inputForm", "div.ui-field-contain").hide();
                jQuery("#won").parentsUntil("#inputForm", "div.ui-field-contain").hide();
                break;

              default:
                jQuery("#points").parentsUntil("#inputForm", "div.ui-field-contain").hide();
                jQuery("#hand").parentsUntil("#inputForm", "div.ui-field-contain").show();
                jQuery("#gameType").parentsUntil("#inputForm", "div.ui-field-contain").show();
                jQuery("#announcement").parentsUntil("#inputForm", "div.ui-field-contain").show();
                jQuery("#jacks").parentsUntil("#inputForm", "div.ui-field-contain").show();
                jQuery("#won").parentsUntil("#inputForm", "div.ui-field-contain").show();
                break;
              }
              this.updateGameLevel();
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
            storeGame : function() {
              var game = this.getGame().toJSON(), games;
              if (game.player.length === 0) {
                window.alert("Kein Spieler ausgewählt");
                jQuery.mobile.silentScroll(0);
                return;
              }
              games = this.load("games") || [];
              if (this.currentGame === -1) {
                games.push(game);
              } else {
                games[this.currentGame] = game;
              }
              this.store("games", games);
              window.alert("Spiel gespeichert");
              this.resetForm();
              this.refreshForm();
              if (this.currentGame === -1) {
                jQuery.mobile.silentScroll(0);
              } else {
                window.history.back();
              }
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
