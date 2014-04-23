d3.csv("data/pensgoals.csv").get(setup);

function setup(error, rows) {
    if (!error) {
        var lastUpdateElement = document.querySelectorAll("figure span.last")[0];
        var goalTotalElement = document.querySelectorAll("figure span.total")[0];

        dataMapper.setSource(rows);

        if (document.createElement('svg').getAttributeNS) {
            // proceed if the browser supports the SVG element
            var matrix = dataMapper.getPlayerMatrix();
            dataVisualizer.drawChordDiagram(matrix);
        } else {
            // otherwise render a png fallback
            var diagramElement = document.getElementById("diagram");
            var altTextBuilder = ["A chord diagram visualizing ",
                    "the frequency with which players work together for goals."
                ];
            var noticeBuilder = ["This is an image of the visualization, ",
                    "since your browser does not support svg. ",
                    "It means the visualization is static and no interaction is possible."
                ];

            var imageFallback = document.createElement("img");
            imageFallback.src = "assets/img/chordDiagramFallback.png";
            imageFallback.alt = altTextBuilder.join("");

            var notice = document.createElement("p");
            notice.innerText = noticeBuilder.join("");

            diagramElement.appendChild(imageFallback);
            diagramElement.appendChild(notice);
        }

        lastUpdateElement.innerText = dataMapper.lastUpdate();
        goalTotalElement.innerText = dataMapper.getTotalGoalCount();
    }
}