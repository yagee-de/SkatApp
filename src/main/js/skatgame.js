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
define("SkatGame", [ "Class" ], function(Class) {
  "use strict";
  var bids = [ 18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54, 55, 59, 60, 63, 66, 70, 72, 77, 80, 81, 84, 88, 90, 96,
      99, 100, 108, 110, 117, 120, 121, 126, 130, 132, 135, 140, 143, 144, 150, 153, 154, 156, 160, 162, 165, 168, 170, 176, 180, 187, 192,
      198, 204, 216, 240, 264 ], SkatGame;
  SkatGame = Class.extend(
  /** @lends SkatGame.prototype */
  {
    /** @constructs */
    init : function(json) {
      var that = this, key;
      if (typeof json === "string") {
        JSON.parse(json, function(key, value) {
          that.reviver(key, value);
        });
      } else if (typeof json === "object") {
        for (key in json) {
          this.reviver(key, json[key]);
        }
      } else {
        this.created = new Date();
        this.modified = new Date();
      }
    },
    group : null,
    player : null,
    bid : 0,
    gameLevel : 0,
    created : 0,
    modified : 0,
    points : 0,
    jacks : 0,
    gameType : 0,
    hand : false,
    won : true,
    announcement : 1,
    /**
     * @description returns JSON representation of this game
     * @Type Object
     */
    toJSON : function() {
      var json = {
        "group" : this.group,
        "player" : this.player,
        "bid" : this.bid,
        "gameLevel" : this.gameLevel,
        "createDate" : this.created.getTime(),
        "modifyDate" : this.modified.getTime()
      };
      if (this.isRamsch()) {
        json.points = (this.gameLevel === 2) ? 120 : this.points;
        json.won = (this.gameLevel === 2);
      } else {
        json.jacks = this.jacks;
        json.gameType = this.gameType;
        json.hand = this.hand;
        json.announcement = this.announcement;
        json.won = this.won;
      }
    },
    /**
     * @description used by JSON.parse to fill this instance
     */
    reviver : function(key, value) {
      switch (key) {
      case "group":
      case "player":
        if (typeof value === 'string') {
          this[key] = value;
        } else {
          throw key + " is not a string";
        }
        break;
      case "bid":
        if (typeof value === 'number') {
          var valid = (value === 0), i;
          if (!valid) {
            for (i = 0; i < bids.length; i++) {
              if (bids[i] === value) {
                valid = true;
                break;
              }
            }
          }
          if (!valid) {
            throw "bid has not a valid value";
          }
          this.bid = value;
        } else {
          throw key + " is not a number";
        }
        break;
      case "gameLevel":
      case "jacks":
      case "gameType":
      case "announcement":
      case "points":
        if (typeof value === 'number') {
          this[key] = value;
        } else {
          throw key + " is not a number";
        }
        break;
      case "won":
      case "hand":
        if (typeof value === 'boolean') {
          this[key] = value;
        } else {
          throw key + " is not a boolean value";
        }
        break;
      case "created":
      case "modifed":
        if (typeof value === 'number' && value > new Date(2000, 0, 1, 0, 0, 0, 0).getTime()) {
          this[key] = new Date(value);
        } else {
          throw key + " is not a valid date value";
        }
        break;

      default:
        window.alert("Ignored unknown key: " + key + ", value: " + value);
        break;
      }
    },
    /**
     * @description returns true if this game is a Ramsch game (bid is 0)
     * @type boolean
     */
    isRamsch : function() {
      return this.bid === 0;
    },
    getGameTypeName : function() {
      switch (this.gameType) {
      case 9:
        return "Schellen";
      case 10:
        return "Herz";
      case 11:
        return "Grün";
      case 12:
        return "Eichel";
      case 23:
        return "Null";
      case 24:
        return "Grand";
      case 35:
        return "Null Hand";
      case 46:
        return "Null Ouvert";
      case 59:
        return "Null Ouvert Hand";
      default:
        return "unbekannt";
      }
    },
    getTimeString : function() {
      var date = new Date(this.createDate);
      return (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    },
    getDateString : function() {
      var date = new Date(this.createDate);
      return this.day[date.getDay()] + ", " + date.getDate() + ". " + this.month[date.getMonth()] + " " + date.getFullYear();
    },
    /**
     * @description add info about this game to DOM
     * @param {jQuery}
     *          insert append info to these jQuery selected nodes
     */
    appendInfo : function(insert) {
      insert.append("<h3>" + this.player + "</h3>");
      insert.append("<p><strong>" + (this.won ? "Gewonnen" : "Verloren") + "</strong></p>");
      insert.append("<p>" + (this.bid ? this.getGameTypeName() : "Ramsch") + " Punkte:" + this.getPoints() + "</p>");
      insert.append('<p class="ui-li-aside"><strong>' + this.getTimeString() + "</strong></p>");
    },
    /**
     * @description calucaltes the points of this game
     * @type int
     */
    getPoints : function() {
      var gamePoints, gameType = this.gameType;
      if (this.isRamsch()) {
        if (this.gameLevel === 2) {
          // Durchmarsch
          return 240;
        }
        return this.points * this.gameLevel;
      } else if (gameType === 23 || gameType === 35 || gameType === 46 || gameType === 59) {
        gamePoints = gameType;
      } else {
        gamePoints = gameType * (this.jacks + this.gameLevel);
      }
      gamePoints *= this.announcement;
      if (!this.won) {
        gamePoints *= -2;
      }
      return gamePoints;
    }
  });
  SkatGame.bids = bids;
  return SkatGame;
});
