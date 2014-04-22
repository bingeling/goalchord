# goalchords
A chord diagram visualizing the frequency with which players work together for goals.

The circle on the outside are all players on the 2013/2014 roster of the Pittsburgh Penguins with at least one point in the regular season. Each chord (the lines inside the circle) connects two players who appeared together on the score sheet. The thickness of the chord is determined by the frequency of those connections. The size of a player's arc is determined by the player's number of connections.

The connections are counted as follows: If player A scores a goal assisted by player B and player C, it creates a connection between A and B, A and C and B and C.

Made with D3.js.

## The Code
The code has two parts, the first (dataMapper) is reading the goal data from a csv file, doing some data mapping/transformation tasks to get the info into the format (square matrix) required by D3. The second part (dataVisualizer) renders the chord diagram as svg.

I made this with goal data from the Pittsburgh Penguins, but the code will work for any team, given you provide a csv file formatted like the csv file in the data folder.
