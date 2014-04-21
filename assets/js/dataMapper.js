var dataMapper = (function () {

    "use strict";

    /* PRIVATE */

    var dataSource = null;
    var playerMap = {}; // contains all connections as an Object of Objects
    var totalGoalCount = 0;
    var percentage = d3.format(".2%");


    // pull all player names from the CSV data, remove duplicates and false values

    function collectPlayers() {
        var players = [];

        players = _.map(dataSource, function (row) {
            return [row.G, row.A1, row.A2];
        });

        return _.compact(_.uniq(_.flatten(players)));
    }


    /*
     * A connection between players is created when they appear on the score sheet together.
     * We loop through each goal in the data set and note which players contributed to the goal.
     * On one end of the connection is the player who scored the goal, on the other end is the 
     * players that got an assist. So a connection is drawn between the goal scorer and 
     * between 0 and 2 other players, depending on how many assists there were for the goal.
     * This also means there is always a connection between goal scorer and assist giver, but 
     * never between the assist givers directly. 
     * Below is the same function including the connection between assist givers.
     */

    function collectScoreAssistConnections(player) {
        // loop through each goal
        _.each(dataSource, function (goal) {
            var pointGetters = [goal.G, goal.A1, goal.A2];

            if (player.name === goal.G && !goal.A1 && !goal.A2) {
                // if goal scorer is this player
                // add 1 to the connection count to himself
                // meaning he scored the goal without help
                player["connections"][player.name]++;
            } else if (_.contains(pointGetters, player.name)) {
                // else if score sheet contains player name
                if (player.name === goal.G) {
                    // if player is goal scorer, add connection to the
                    // players who assisted, if present
                    player["connections"][goal.A1]++;
                    if (goal.A2) { player["connections"][goal.A2]++; }
                } else if (player.name === goal.A1 || player.name === goal.A2) {
                    // else if player assisted, only add connection to goal scorer
                    player["connections"][goal.G]++;
                }

            }
        });

        return player;
    }


    /*
     * The same function as above, but including the connection between assist givers.
     */

    function collectAllConnections(player) {
        // loop through each goal
        _.each(dataSource, function (goal) {
            var pointGetters = [goal.G, goal.A1, goal.A2];

            if (player.name === goal.G && !goal.A1 && !goal.A2) {
                // if goal scorer is this player
                // add 1 to the connection count to himself
                // meaning he scored the goal without help
                player["connections"][player.name]++;
            } else if (_.contains(pointGetters, player.name)) {
                // else if score sheet contains player name
                // add 1 to the connection count to the other
                // players credited on the score sheet
                var others = _.without(pointGetters, player.name);
                _.each(others, function (other) {
                    player["connections"][other]++;
                });
            }
        });

        return player;
    }


    /*
     * Create Object of Objects mapping all players to one another.
     * Every player is a new object with a 0-indexed number as key.
     * It's necessary to have a number as key, so that the player can
     * be traced back once the Object is reduced to an array of arrays.
     * The object has a name property and a connections property that
     * is yet another Object containing all player names as keys with
     * the connection count as values. Are you confused yet?
     */

    function buildPlayerMap() {
        var players = collectPlayers();

        // add an Object to playerMap for each player, the index is used as key
        _.each(players, function (player, i) {
            playerMap[i] = {};
            playerMap[i]["name"] = player;
            playerMap[i]["connections"] = {};

            // add an Object with all player names to the connections property
            // and set the value to 0 for all
            _.each(players, function (p) {
                playerMap[i]["connections"][p] = 0;
            });
        });

        // pass each player Object to the collectConnections function 
        // which counts all the connections between players
        _.each(playerMap, collectAllConnections);

        // pass each player Object to the collectPlayerInfo function
        // which adds some basic score stats to the player Object
        _.each(playerMap, collectPlayerInfo);
    }


    // reduce the playerMap Object to an array of arrays (square matrix)

    function reduceMapToArray() {
        var matrix = [];

        _.each(playerMap, function (player) {
            var connections = [];
            _.each(player.connections, function (connection) {
                connections.push(connection);
            });
            matrix.push(connections);
        });

        return matrix;
    }


    // some basic data mining, counting goals and points of a player
    // and calculating what percentage of the total goal count they make up

    function collectPlayerInfo(player) {
        player.goals = _.size(_.where(dataSource, { G: player.name }));
        player.points = _.size(_.filter(dataSource, function (el) { 
                return _.contains([el.G, el.A1, el.A2], player.name);
            }));
        player.goalPercentage = percentage(player.goals / totalGoalCount);
        player.involvement = percentage(player.points / totalGoalCount);
    }


    /* 
     * The connection count value stored on the chord only counts the times source
     * and target assisted on one another's goals. It doesn't count goals where they
     * both provided assists and another player was the goal scorer. This counts both
     * of those situations. Only applicable if only Scorer-Assist connections are counted.
     */

    function collectSourceTargetConnections(source, target) {
        var cons = _.reduce(dataSource, function (memo,goal) {
            var pointGetters = [goal.G, goal.A1, goal.A2];

            if (_.contains(pointGetters, source) && _.contains(pointGetters, target)) {
                return memo+1;
            } else {
                return memo+0;
            }
        }, 0);

        return cons;
    }


    // find the data objects for source and target of chord
    // and calculate what percentage of their point total it is

    function collectChordInfo(dataPoint) {
        var source = playerMap[dataPoint.source.index];
        var target = playerMap[dataPoint.target.index];

        if (source.name !== target.name) { // if source and target are different players

            //var connections = collectSourceTargetConnections(source.name, target.name);
            var connections = dataPoint.source.value;

            var shareForSource = (connections / source.points) || 0;
            var shareForTarget = (connections / target.points) || 0;

            return {
                source: {
                    name: source.name,
                    toTarget: percentage(shareForTarget)
                },
                target: {
                    name: target.name,
                    toSource: percentage(shareForSource)
                }
            };
        } else { // if source and target are the same (unassisted goals)
            var unassisted = (dataPoint.source.value / source.points) || 0;
            return {
                source: {
                    name: source.name,
                    toSource: percentage(unassisted)
                }
            };
        }
    }



    /* PUBLIC */

    return {

        setSource: function (csvData) {
            dataSource = csvData;
            totalGoalCount = dataSource.length;
        },

        lastUpdate: function () {
            var lastGoal =  _.last(dataSource);
            var stringBuilder = [lastGoal.Date, " against ", lastGoal.Opponent];
            return stringBuilder.join("");
        },

        getTotalGoalCount: function () {
            return totalGoalCount;
        },

        getPlayerMatrix: function () {
            if (dataSource) {
                buildPlayerMap();
                return reduceMapToArray();
            } else {
                throw "A data source must be set before any data manipulations can be made.";
            }
        },
        
        getPlayerName: function (dataPoint) {
            return playerMap[dataPoint.index].name;
        },

        setPlayerInfo: function (dataPoint) {
            var info = playerMap[dataPoint.index];
            var goalsText = info.goals === 1 ? "goal" : "goals";
            var pointsText = info.points === 1 ? "point" : "points";

            var text = [
                    info.goals,
                    " ",
                    goalsText,
                    " (scored ",
                    info.goalPercentage,
                    " of goals)\n",
                    info.points,
                    " ",
                    pointsText,
                    " (involved in ",
                    info.involvement,
                    " of goals)",
                ];

            return text.join("");
        },

        setChordInfo: function (dataPoint) {
            var text = [];
            var info = collectChordInfo(dataPoint);

            if (info.target) {
                text = [
                    info.source.name,
                    " scored ",
                    info.target.toSource,
                    " of his points with ",
                    info.target.name,
                    "\n",
                    info.target.name,
                    " scored ",
                    info.source.toTarget,
                    " of his points with ",
                    info.source.name
                ];
            } else {
                text = [
                    info.source.name,
                    " scored ",
                    info.source.toSource,
                    " of his points without assistance."
                ];
            }

            return text.join("");
        }
    };
}());
