# Puzzlefy
Generate a puzzle from any image. Made with [p5.js](https://p5js.org/).

|<img src=https://github.com/Rush/Font-Awesome-SVG-PNG/blob/master/black/svg/globe.svg height=14> [Website](https://puzzlefy.netlify.app) | <img src=https://github.com/Rush/Font-Awesome-SVG-PNG/blob/master/black/svg/twitter.svg height=14> [Twitter](https://twitter.com/Puzzle_fy)|
|---|---|

### Usage
`https://puzzlefy.netlify.app/?image=<url>&cols=<number>&rows=<number>`
- **image**: link to an image url `.jpg`, `.png`... and also certain `.gif`s!
- **cols**: width of puzzle in pieces
- **rows**: height of puzzle in pieces

### Examples
- [Abstract processing sketch capture](https://puzzlefy.netlify.app/?image=https://media.discordapp.net/attachments/216616558301151232/902992543376101386/sdfgh3453634.png&cols=5&rows=4)
- [Obama prism](https://puzzlefy.netlify.app/?image=https://c.tenor.com/1g50P-G_JicAAAAC/obama-triangle.gif&cols=4&rows=4)

### Ideas
* `.gif` corss origin fix
* `.gif` load time improvement
* Draw placed pieces in separate graphics for performance
* Random image if `image=` url parameter is not set
* Auto solve functionality
* Reset functionality
