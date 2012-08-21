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
define("SkatGames", [ "jquery", "jqm-init", "jquery.mobile", "Class", "SkatGame" ], function(jQuery, jqmInit, jqm, Class, SkatGame) {
  "use strict";
  var SkatGames = Class.extend(
  /** @lends SkatGames.prototype */
  {
    _skat : null,
    /** @constructs */
    init : function(skatInstance) {
      this._skat = skatInstance;
    },
    /**
     * @description updates games site with a list of saved games
     */
    initGames : function() {
      var list = jQuery("#gameList"), games = (this._skat.load("games") || []), date = null;
      list.empty();
      jQuery.each(games, jQuery.proxy(function(i, value) {
        var game = new SkatGame(value), curDate = game.getDateString(), li, link;
        if (curDate !== date) {
          date = curDate;
          // <li data-role="list-divider">Friday, October 8, 2010 <span class="ui-li-count">2</span></li>
          list.append('<li data-role="list-divider">' + curDate + '</li>');
        }
        li = jQuery('<li/>');
        li.addClass(game.won ? "won" : "lost");
        link = jQuery('<a href="form.html" data-transition="slide" data-prepareGame="' + i + '"/>');
        li.append(link);
        this.appendInfo(game, link);
        list.append(li);
      }, this));
      list.listview("refresh");
    },
    /**
     * @description add info about this game to DOM
     * @param {SkatGame}
     *          game SkatGame instance
     * @param {jQuery}
     *          insert append info to these jQuery selected nodes
     */
    appendInfo : function(game, insert) {
      insert.append("<h3>" + game.player + "</h3>");
      insert.append("<p><strong>" + (game.won ? "Gewonnen" : "Verloren") + "</strong></p>");
      insert.append("<p>" + (game.bid ? game.getGameTypeName() : "Ramsch") + " Punkte:" + game.getPoints() + "</p>");
      insert.append('<p class="ui-li-aside"><strong>' + game.getTimeString() + "</strong></p>");
    }
  });
  return SkatGames;
});
