/*global define,window */
define("Skat",
    [ "jquery", "jqm-init", "jquery.mobile", "Class" ],
    function(jQuery, jqmInit, jqm, Class) {
      "use strict";
      var Skat = Class
          .extend(
          /** @lends Skat.prototype */
          {
            /** @constructs */
            init : function() {
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
             * @constant
             * @description all valid bids
             */
            bids : [ 18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54, 55, 59, 60, 63, 66, 70, 72, 77, 80, 81, 84, 88,
                90, 96, 99, 100, 108, 110, 117, 120, 121, 126, 130, 132, 135, 140, 143, 144, 150, 153, 154, 156, 160, 162, 165, 168, 170,
                176, 180, 187, 192, 198, 204, 216, 240, 264 ],
            /**
             * @memberOf Skat#
             * @description current game from localStore or '-1' for new game
             */
            currentGame : -1,
            form : {
              createComplete : false
            },
            /**
             * @memberOf Skat#
             * @constant
             * @description storage keys for localStorage <dl>
             *  <dt>games:</dt>
             *  <dd>uncommitted games</dd>
             *  <dt>players:</dt>
             *  <dd>all player names</dd>
             *  <dt>groups:</dt>
             *  <dd>all group names</dd>
             *  <dt>dbURL:</dt>
             *  <dd>URL do SkatDB server</dd>
             * </dl>
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
             * @description URIs relative to storage.dbURL for syncing with SkatDB server <dl>
             *  <dt>players:</dt>
             *  <dd>get player from SkatDB</dd>
             *  <dt>groups:</dt>
             *  <dd>get groups from SkatDB</dd>
             *  <dt>games:</dt>
             *  <dd>post games to SkatDB</dd>
             * </dl>
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
            initGames : function() {
              var list = jQuery("#gameList"), games = (this.load("games") || []), date = null;
              list.empty();
              jQuery.each(games, function(i, value) {
                var curDate = this.gameDate(value), li, link;
                if (curDate !== date) {
                  date = curDate;
                  // <li data-role="list-divider">Friday, October 8, 2010 <span class="ui-li-count">2</span></li>
                  list.append('<li data-role="list-divider">' + curDate + '</li>');
                }
                li = jQuery('<li/>');
                li.addClass(value.won ? "won" : "lost");
                link = jQuery('<a href="form.html" data-transition="slide" data-prepareGame="' + i + '"/>');
                li.append(link);
                this.gameInfo(value, link);
                list.append(li);
              });
              list.listview('refresh');
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
            prepareGame : function(gameNumber) {
              this.currentGame = typeof gameNumber === 'number' ? gameNumber : -1;
              return false;
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
            clearStorage : function() {
              window.localStorage.clear();
            },
            updateScore : function() {
              var game = this.getGame(), gamePoints = this.gamePoints(game);
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
              if (this.form.createComplete) {
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
              return json;
            },
            getExport : function() {
              var games = this.load("games") || [];
              jQuery.each(games, function(i, game) {
                var value = this.gamePoints(game);
                game.value = value;
              });
              return games;
            },
            load : function(storeKey, value) {
              return JSON.parse(window.localStorage.getItem(this.storage[storeKey]));
            },
            store : function(storeKey, value) {
              window.localStorage.setItem(this.storage[storeKey], JSON.stringify(value));
            },
            storeGame : function() {
              var game = this.getGame(), games;
              if (game.player.length === 0) {
                window.alert("Kein Spieler ausgewählt");
                jQuery.mobile.silentScroll(0);
                return;
              }
              games = this.load("games") || [];
              if (this.currentGame === -1) {
                games.push(game);
                this.resetForm();
                this.refreshForm();
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
              this.updateForm(game);
              this.currentGame = gameNumber;
              return true;
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
            },
            gameTypeName : function(gameType) {
              switch (gameType) {
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
            gamePoints : function(game) {
              var gamePoints, gameType = game.gameType;
              if (game.bid === 0) {
                if (game.gameLevel === 2) {
                  // Durchmarsch
                  return 240;
                }
                return game.points * game.gameLevel;
              } else if (gameType === 23 || gameType === 35 || gameType === 46 || gameType === 59) {
                gamePoints = gameType;
              } else {
                gamePoints = gameType * (game.jacks + game.gameLevel) * game.announcement;
              }
              if (!game.won) {
                gamePoints *= -2;
              }
              return gamePoints;
            },
            gameClock : function(game) {
              var date = new Date(game.createDate);
              return (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
            },
            gameDate : function(game) {
              var date = new Date(game.createDate);
              return this.day[date.getDay()] + ", " + date.getDate() + ". " + this.month[date.getMonth()] + " " + date.getFullYear();
            },
            gameInfo : function(game, insert) {
              insert.append("<h3>" + game.player + "</h3>");
              insert.append("<p><strong>" + (game.won ? "Gewonnen" : "Verloren") + "</strong></p>");
              insert.append("<p>" + (game.bid ? this.gameTypeName(game.gameType) : "Ramsch") + " Punkte:" + this.gamePoints(game) + "</p>");
              insert.append('<p class="ui-li-aside"><strong>' + this.gameClock(game) + "</strong></p>");
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
              var dbURL = this.load("dbURL"), url;
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
                  success(json);
                }
              });
            },
            uploadGames : function() {
              var dbURL = this.load("dbURL"), games;
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
                    this.store("games", failedGames);
                    uploaded -= failedGames.length;
                  } else {
                    this.removeGames();
                  }
                  window.alert(uploaded + " von " + games.length + " Spielen hochgeladen:\n" + json.msg);
                }
              });
            }
          });
      return Skat;
    });
