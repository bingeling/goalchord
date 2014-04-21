d3.csv("../data/pensgoals.csv").get(setup);

function setup(error, rows) {
    if (!error) {
        var lastUpdateElement = document.querySelectorAll("figure span.last")[0];
        var goalTotalElement = document.querySelectorAll("figure span.total")[0];

        dataMapper.setSource(rows);

        var matrix = dataMapper.getPlayerMatrix();
        dataVisualizer.drawChordDiagram(matrix);

        lastUpdateElement.innerText = dataMapper.lastUpdate();
        goalTotalElement.innerText = dataMapper.getTotalGoalCount();
    }
}