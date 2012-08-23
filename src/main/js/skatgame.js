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
  var month, day, bids, SkatGame;
  /**
   * @memberOf SkatGame
   * @constant
   * @description maps javascript month to names
   */
  month = [ "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ];
  /**
   * @memberOf SkatGame
   * @constant
   * @description maps javascript days to names
   */
  day = [ "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Sonnabend" ];
  /**
   * @memberOf SkatGame
   * @constant
   * @description valid bid values
   */
  bids = [ 18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54, 55, 59, 60, 63, 66, 70, 72, 77, 80, 81, 84, 88, 90, 96, 99,
      100, 108, 110, 117, 120, 121, 126, 130, 132, 135, 140, 143, 144, 150, 153, 154, 156, 160, 162, 165, 168, 170, 176, 180, 187, 192,
      198, 204, 216, 240, 264 ];
  
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
    /**
     * @field
     * @type String
     */
    group : null,
    /**
     * @field
     * @type String
     */
    player : null,
    /**
     * @field
     * @type int
     */
    bid : 0,
    /**
     * @field
     * @type int
     */
    gameLevel : 0,
    /**
     * @field
     * @type Date
     */
    createDate : 0,
    /**
     * @field
     * @type Date
     */
    modifydDate : 0,
    /**
     * @field
     * @type int
     */
    points : 0,
    /**
     * @field
     * @type int
     */
    jacks : 0,
    /**
     * @field
     * @type int
     */
    gameType : 0,
    /**
     * @field
     * @type boolean
     */
    hand : false,
    /**
     * @field
     * @type boolean
     */
    won : true,
    /**
     * @field
     * @type int
     */
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
        "createDate" : this.createDate.getTime(),
        "modifyDate" : this.modifyDate.getTime()
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
      return json;
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
      case "createDate":
      case "modifyDate":
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
    /**
     * @returns {String} name of this game type
     */
    getGameTypeName : function() {
      switch (this.gameType) {
      case 9:
        return "Schellen";
      case 10:
        return "Rot";
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
    /**
     * @description translates {@link SkatGame#createDate} into human readable time
     * @see SkatGame#getDateString
     * @type String
     */
    getTimeString : function() {
      var date = new Date(this.createDate);
      return (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    },
    /**
     * @description translates {@link SkatGame#createDate} into human readable date
     * @see SkatGame#getTimeString
     * @type String
     */
    getDateString : function() {
      var date = new Date(this.createDate);
      return day[date.getDay()] + ", " + date.getDate() + ". " + month[date.getMonth()] + " " + date.getFullYear();
    },
    /**
     * @description calculates the points of this game
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
  SkatGame.month = month;
  SkatGame.day = day;
  return SkatGame;
});
