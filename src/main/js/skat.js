/*global define,window */
define([ "jquery", "jqm-init", "jquery.mobile" ],
    function(jQuery, jqmInit, jqm) {
      "use strict";
      var skat = {};
      window.skat = skat;
      skat.month = [ "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ];
      skat.day = [ "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Sonnabend" ];
      skat.bids = [ 18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54, 55, 59, 60, 63, 66, 70, 72, 77, 80, 81, 84, 88, 90,
          96, 99, 100, 108, 110, 117, 120, 121, 126, 130, 132, 135, 140, 143, 144, 150, 153, 154, 156, 160, 162, 165, 168, 170, 176, 180,
          187, 192, 198, 204, 216, 240, 264 ];
      skat.currentGame = -1;
      skat.form = skat.form || {};
      skat.form.createComplete = false;
      skat.storage = skat.storage || {};
      skat.storage.games = "games";
      skat.storage.players = "players";
      skat.storage.groups = "groups";
      skat.storage.dbURL = "dbURL";
      skat.api = skat.api || {};
      skat.REST_PATH = "JSON/";
      skat.api.groups = skat.REST_PATH + "groups";
      skat.api.players = skat.REST_PATH + "players";
      skat.api.games = skat.REST_PATH + "games";
      window.addEventListener('load', function(e) {
        if (window.applicationCache) {
          window.applicationCache.addEventListener('updateready', function(e) {
            if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
              // Browser downloaded a new app cache.
              // Swap it in and reload the page to get the new hotness.
              window.applicationCache.swapCache();
              if (window.confirm('Neue Version von SkatApp verfügbar. Neu Laden?')) {
                window.location.reload();
              }
            }
          }, false);
        }
      }, false);
      skat.prepareGameHandler = function(e) {
        var game = parseInt(jQuery(e.currentTarget).attr("data-preparegame"), 10);
        skat.prepareGame(game);
      };
      jQuery(document).ready(function() {
        jQuery("*[data-preparegame]").live("vclick", function(e) {
          skat.prepareGameHandler(e);
        });
      });
      jQuery(document).bind("pageinit", function() {
      });
      jQuery(document).delegate("#formPage", "pagebeforecreate", function() {
        skat.form.createComplete = false;
        skat.initBiddingValues();
        skat.initJacks();
        skat.initPlayers();
        skat.initGroups();
        skat.resetForm();
        skat.form.createComplete = true;
      });
      jQuery(document).delegate("#formPage", "pagebeforeshow", function(event, data) {
        skat.initPlayers();
        skat.initGroups();
        skat.fillForm(skat.currentGame);
        skat.refreshForm();
        skat.updateScore();
      });
      jQuery(document).delegate("#gamesPage", "pagebeforeshow", function() {
        skat.initGames();
      });
      jQuery(document).delegate("#settingsPage", "pagebeforeshow", function() {
        skat.initSettings();
      });
      jQuery(document).change(function() {
        skat.updateScore();
      });
      skat.onUpdateReady = function() {
        window.alert("SkatApp aktualisiert");
      };
      skat.initBiddingValues = function() {
        var biddingSelector = '#bid';
        jQuery(biddingSelector).empty();
        jQuery(biddingSelector).append('<option value="0">Ramsch</option>');
        jQuery.each(skat.bids, function(i, value) {
          var option = jQuery('<option>').text(value).attr('value', value);
          if (i === 0) {
            option.attr('selected', true);
          }
          jQuery(biddingSelector).append(option);
        });
      };
      skat.initPlayers = function() {
        var players = (skat.load("players") || []), playersSelector = "#player", option;
        jQuery(playersSelector).empty();
        option = jQuery('<option>').attr('selected', true);
        jQuery(playersSelector).append(option);
        jQuery.each(players, function(i, player) {
          option = jQuery('<option>').text(player).attr('value', player);
          jQuery(playersSelector).append(option);
        });
      };
      skat.initGroups = function() {
        var groups = (skat.load("groups") || []), groupsSelector = "#group";
        jQuery(groupsSelector).empty();
        jQuery.each(groups, function(i, group) {
          var option = jQuery('<option>').text(group).attr('value', group);
          if (i === 0) {
            option.attr('selected', true);
          }
          jQuery(groupsSelector).append(option);
        });
      };
      skat.initJacks = function() {
        var jacksSelector = "#jacks", i, option;
        jQuery(jacksSelector).empty();
        for (i = 1; i < 12; i++) {
          option = jQuery('<option>').text(i).attr('value', i);
          if (i === 0) {
            option.attr('selected', true);
          }
          jQuery(jacksSelector).append(option);
        }
      };
      skat.initGames = function() {
        var list = jQuery("#gameList"), games = (skat.load("games") || []), date = null;
        list.empty();
        jQuery.each(games, function(i, value) {
          var curDate = skat.gameDate(value), li, link;
          if (curDate !== date) {
            date = curDate;
            // <li data-role="list-divider">Friday, October 8, 2010 <span class="ui-li-count">2</span></li>
            list.append('<li data-role="list-divider">' + curDate + '</li>');
          }
          li = jQuery('<li/>');
          li.addClass(value.won ? "won" : "lost");
          link = jQuery('<a href="form.html" data-transition="slide" data-prepareGame="' + i + '"/>');
          li.append(link);
          skat.gameInfo(value, link);
          list.append(li);
        });
        list.listview('refresh');
      };
      skat.initSettings = function() {
        // dbURL
        var skatURL = skat.load("dbURL"), playerList = jQuery("#playerList"), players = (skat.load("players") || []), groupList = jQuery("#groupList"), groups = (skat
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
      };
      skat.prepareGame = function(gameNumber) {
        skat.currentGame = typeof gameNumber === 'number' ? gameNumber : -1;
        return false;
      };
      skat.fillForm = function(gameNumber) {
        if (gameNumber < 0) {
          jQuery("#deleteButton").parentsUntil("#inputForm", "div.ui-btn").hide();
          jQuery("#formPage").children(":jqmData(role=header)").children("h1").text("Spiel anlegen");
          return;
        }
        var games = skat.load("games") || [], game;
        if (gameNumber >= games.length) {
          return;
        }
        game = games[gameNumber];
        jQuery("#formPage").children(":jqmData(role=header)").children("h1").text("Spiel Nr. " + (gameNumber + 1) + " bearbeiten");
        jQuery("#won").attr("checked", game.won ? true : false);
        jQuery("#hand").attr("checked", game.hand ? true : false);
        skat.updateGameLevel();
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
      };
      skat.resetForm = function() {
        jQuery("#won").attr("checked", true);
        jQuery("#hand").attr("checked", false);
        skat.updateGameLevel();
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
      };
      skat.refreshForm = function() {
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
      };
      skat.clearStorage = function() {
        window.localStorage.clear();
      };
      skat.updateScore = function() {
        var game = skat.getGame(), gamePoints = skat.gamePoints(game);
        document.getElementById("p1").innerHTML = "Punkte: " + gamePoints;
      };
      skat.bidChange = function(source) {
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
          skat.updateGameLevel();
        }
      };
      skat.updateGameLevel = function() {
        if (parseInt(jQuery("#bid").val(), 10) === 0) {
          document.getElementById("gameLevel").innerHTML = "<option value=-1>Normal</option><option value=-2>Jungfer (*-2)</option><option value=2>Durchmarsch (*2)</option>";
        } else if (jQuery("#hand").attr('checked')) {
          document.getElementById("gameLevel").innerHTML = "<option value=2>Hand (+2)</option><option value=3>Schneider (+3)</option><option value=4>Schneider angesagt (+4)</option><option value=5>Schwarz (+5)</option><option value=6>Schwarz angesagt (+6)</option><option value=7>Ouvert (+7)</option>";
        } else {
          document.getElementById("gameLevel").innerHTML = "<option value=1>Normal (+1)</option><option value=2>Schneider (+2)</option><option value=3>Schwarz (+3)</option>";
        }
        if (skat.form.createComplete) {
          jQuery("#gameLevel").selectmenu("refresh");
        }
      };
      skat.getGame = function() {
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
      };
      skat.getExport = function() {
        var games = skat.load("games") || [];
        jQuery.each(games, function(i, game) {
          var value = skat.gamePoints(game);
          game.value = value;
        });
        return games;
      };
      skat.load = function(storeKey, value) {
        return JSON.parse(window.localStorage.getItem(skat.storage[storeKey]));
      };
      skat.store = function(storeKey, value) {
        window.localStorage.setItem(skat.storage[storeKey], JSON.stringify(value));
      };
      skat.storeGame = function() {
        var game = skat.getGame(), games;
        if (game.player.length === 0) {
          window.alert("Kein Spieler ausgewählt");
          jQuery.mobile.silentScroll(0);
          return;
        }
        games = skat.load("games") || [];
        if (skat.currentGame === -1) {
          games.push(game);
          skat.resetForm();
          skat.refreshForm();
        } else {
          games[skat.currentGame] = game;
        }
        skat.store("games", games);
        window.alert("Spiel gespeichert");
        if (skat.currentGame === -1) {
          jQuery.mobile.silentScroll(0);
        } else {
          location.back();
        }
      };
      skat.deleteGame = function(gameNumber) {
        var games = skat.load("games") || [];
        if (gameNumber < 0 || gameNumber >= games.length) {
          return false;
        }
        games.splice(gameNumber, 1);
        skat.store("games", games);
        return true;
      };
      skat.removeGames = function() {
        skat.store("games", []);
        return true;
      };
      skat.loadGame = function(gameNumber) {
        var games = (skat.load("games") || []), game;
        if (gameNumber < 0 || gameNumber >= games.length) {
          return false;
        }
        game = games[gameNumber];
        skat.updateForm(game);
        skat.currentGame = gameNumber;
        return true;
      };
      skat.updateForm = function(game) {
        jQuery("#group").val(game.group).selectmenu("refresh");
        jQuery("#player").val(game.player).selectmenu("refresh");
        jQuery("#bid").val(game.bid).selectmenu("refresh");
        jQuery("#jacks").val(game.jacks).selectmenu("refresh");
        jQuery("#gameType").val(game.gameType).selectmenu("refresh");
        jQuery("#hand").attr('checked', game.hand).checkboxradio("refresh");
        jQuery("#gameLevel").val(game.gameLevel).selectmenu("refresh");
        jQuery("#announcement").val(game.announcement).selectmenu("refresh");
        jQuery("#won").attr('checked', game.won).checkboxradio("refresh");
      };
      skat.gameTypeName = function(gameType) {
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
      };
      skat.gamePoints = function(game) {
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
      };
      skat.gameClock = function(game) {
        var date = new Date(game.createDate);
        return (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
      };
      skat.gameDate = function(game) {
        var date = new Date(game.createDate);
        return skat.day[date.getDay()] + ", " + date.getDate() + ". " + skat.month[date.getMonth()] + " " + date.getFullYear();
      };
      skat.gameInfo = function(game, insert) {
        insert.append("<h3>" + game.player + "</h3>");
        insert.append("<p><strong>" + (game.won ? "Gewonnen" : "Verloren") + "</strong></p>");
        insert.append("<p>" + (game.bid ? skat.gameTypeName(game.gameType) : "Ramsch") + " Punkte:" + skat.gamePoints(game) + "</p>");
        insert.append('<p class="ui-li-aside"><strong>' + skat.gameClock(game) + "</strong></p>");
      };
      skat.addPlayer = function(playerName) {
        var players = (skat.load("players") || []), i;
        for (i = 0; i < players.lenght; i++) {
          if (players[i] === playerName) {
            return;
          }
        }
        players.push(playerName);
        players.sort();
        skat.store("players", players);
      };
      skat.addGroup = function(groupName) {
        var groups = (skat.load("groups") || []), i;
        for (i = 0; i < groups.lenght; i++) {
          if (groups[i] === groupName) {
            return;
          }
        }
        groups.push(groupName);
        skat.store("groups", groups);
      };
      skat.setDbURL = function(url) {
        skat.store("dbURL", url);
      };
      skat.downloadPlayer = function() {
        skat.apiCall(skat.api.players, function(players) {
          players.sort();
          skat.store("players", players);
          window.alert(players.length + " Spieler geladen.");
        });
      };
      skat.downloadGroups = function() {
        skat.apiCall(skat.api.groups, function(groups) {
          groups.sort();
          skat.store("groups", groups);
          window.alert(groups.length + " Gruppen geladen.");
        });
      };
      skat.apiCall = function(path, success) {
        var dbURL = skat.load("dbURL"), url;
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
      };
      skat.uploadGames = function() {
        var dbURL = skat.load("dbURL"), games;
        if (dbURL === null || dbURL.length === 0) {
          window.alert("Keine SKatDB-URL definiert");
          return;
        }
        games = skat.getExport();
        if (games.length === 0) {
          window.alert("Keine lokalen Spiele zum Übertragen vorhanden.");
          return;
        }
        jQuery.ajax({
          url : dbURL + skat.api.games,
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
              skat.store("games", failedGames);
              uploaded -= failedGames.length;
            } else {
              skat.removeGames();
            }
            window.alert(uploaded + " von " + games.length + " Spielen hochgeladen:\n" + json.msg);
          }
        });
      };
    });
