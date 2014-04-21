var dataVisualizer = (function () {

    "use strict";

    /* PRIVATE */

    // stores the index of the player currently highlighted
    var highlightedPlayerIndex = null;


    /* 
     * Generates an array of rgb color values, we don't want the graph
     * to look like an acid trip, so we're limiting the spectrum.
     * Currently it creates all sorts of yellow-gold-beige-brown-ish tones.
     * so... roughly Penguins-esque. (yellow vs vegas gold, y'all!)
     */

    function generateColorArray(count) {
        var colors = [];

        for (var i = 0; i < count; i++) {
            var c = [];

            c.push( Math.floor( Math.random() * (225 - 90) + 90 ) );  // red
            c.push( Math.floor( c[0] - 10 ) ); // green
            c.push( Math.floor ( c[0] / (Math.random() * 3 + 1) ) ); // blue

            c = 'rgb(' + c.join(',') + ')';

            colors.push(c);
        }

        return colors;
    }


    // creates the d3 chord diagram and attaches it to the DOM tree
    // with handling of click events

    function drawChords(matrix) {
        var width = 980,
            height = 900,
            innerRadius = height / 2 - 120,
            outerRadius = innerRadius - 25;


        /* SETUP */

        // color management 
        var colorize = d3.scale.ordinal()
            .domain(d3.range(matrix.length))
            .range(generateColorArray(matrix.length));

        // creates the chord layout with basic paramenters
        // and passes the matrix data to the layout
        var chordDiagram = d3.layout.chord()
            .padding(.03)
            .sortSubgroups(d3.descending)
            .sortChords(d3.descending)
            .matrix(matrix);

        // arc path to create player arcs
        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        // creates the svg element and appends it to the DOM tree
        // translates the coordinate system to the center of the element instead of top left
        var svg = d3.select("#visualization .diagram").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("id", "circle")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


        /* ARC STYLING */

        // ever player is a svg group with the arc, text, label and a click handler
        // playerGroups is the array containing all player groups
        var playerGroups = svg.selectAll("g.player")
            .data(chordDiagram.groups())
            .enter().append("g")
            .attr("class", "player")
            .on("click", highlight);

        // each player has their own color
        playerGroups.append("path")
            .style("fill", function(d) { return colorize(d.index); })
            .attr("d", arc);

        // adds the player name, positioned in the middle of the arc
        playerGroups.append("text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".3em")
            .style("font-family", "'Helvetica Neue', Arial, sans-serif")
            .style("font-size", "16px")
            .style("fill", "#3b3939")
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (innerRadius + 15) + ")"
                    + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .text(function(d) { return dataMapper.getPlayerName(d); });

        // creates tooltip for player
        playerGroups.append("title").text(function(d) {
            return dataMapper.setPlayerInfo(d);
        });


        /* CHORD STYLING */

        // create chords between arcs
        var chordPaths = svg.selectAll("path.chord")
            .data(chordDiagram.chords())
            .enter().append("path")
            .attr("class", "chord")
            .style("fill", function (d) { return colorize(d.target.index); })
            .attr("d", d3.svg.chord().radius(outerRadius - 3));


        // create chord tooltip
        chordPaths.append("title").text(function(d) {
            return dataMapper.setChordInfo(d);
        });



        /* PLAYER GROUP CLICK HANDLER */

        function highlight(d, i) {
            if (highlightedPlayerIndex === i) {
                // if stored index is the same as clicked player
                chordPaths.classed({"fade": false });
                highlightedPlayerIndex = null;
            } else {
                // if no index is stored or the index isn't the stored one
                chordPaths.classed("fade", function(p) {
                   return p.source.index != i && p.target.index != i; 
                });
                highlightedPlayerIndex = i;
            }
        }
    }



    /* PUBLIC */

    return {
        drawChordDiagram: drawChords
    };
}());