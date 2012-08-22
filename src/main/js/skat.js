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
    [ "jquery", "jqm-init", "jquery.mobile", "Class", "SkatForm", "SkatGame", "SkatGames", "SkatSettings", "SkatSync" ],
    function(jQuery, jqmInit, jqm, Class, SkatForm, SkatGame, SkatGames, SkatSettings, SkatSync) {
      "use strict";
      var Skat = Class
          .extend(
          /** @lends Skat.prototype */
          {
            /** 
             * @constructs
             * @extends Class 
             */
            init : function() {
              this.form = new SkatForm();
              this.games = new SkatGames();
              this.settings = new SkatSettings();
              this.sync = new SkatSync();
            },
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
             * @description logic for sync page
             * @type SkatSync
             */
            sync : null,
            prepareGameHandler : function(e) {
              var game = parseInt(jQuery(e.currentTarget).attr("data-preparegame"), 10);
              this.form.prepareGame(game);
            }
          });
      return Skat;
    });
