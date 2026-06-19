# Puzzlefy
[![X Follow](https://img.shields.io/static/v1?style=flat&logo=x&logoColor=ffffff&color=black&labelColor=black&message=Follow+@Puzzle_fy&label=)](https://x.com/Puzzle_fy)
[![p5.js](https://img.shields.io/static/v1?style=flat&logo=p5dotjs&label=&message=p5.js&logoColor=white&labelColor=333&color=444)](https://p5js.org)
[![Itch.io](https://img.shields.io/static/v1?style=flat&logo=itchdotio&label=&message=Available+on+Itch.io&logoColor=white&labelColor=FA5C5C&color=FA5C5C)](https://stephcraft.itch.io/puzzlefy)

Generate a puzzle from any image. Made with [p5.js](https://p5js.org/).

## 🕹️ [Play in browser](https://puzzlefy.stephcraft.net)

![](demo.gif)

### Make your own puzzle
`https://puzzlefy.netlify.app/?image=<url>&cols=<number>&rows=<number>`
- **image**: link to an image url `.jpg`, `.png`... and also certain `.gif`s!
- **cols**: width of puzzle in pieces
- **rows**: height of puzzle in pieces

> If the **cols** and **rows** parameters are not specified, the aspect ratio of the image will be used instead

### Example
- [Obama prism](https://puzzlefy.netlify.app/?image=https://c.tenor.com/1g50P-G_JicAAAAC/obama-triangle.gif&cols=4&rows=4)

<!--
|<img src=https://github.com/Rush/Font-Awesome-SVG-PNG/blob/master/black/svg/globe.svg height=14> [Website](https://puzzlefy.netlify.app) | <img src='https://i.imgur.com/J7kgFUd.png' height=14> [X/Twitter](https://twitter.com/Puzzle_fy)|
|---|---|
-->

## ⌨️ Edit the code
[<img height="48" alt="OpenP5Sketch" src="https://github.com/user-attachments/assets/69f7d662-1407-410b-9572-cb2c4ae6e79a" />](https://codesandbox.io/p/sandbox/github/Stephcraft/Puzzlefy/tree/main/website?file=/script.js)

### Feature ideas
* `.gif` cors origin fix ― [**Issue**](https://github.com/Stephcraft/Puzzlefy/issues/1)
* `.gif` load time improvement ― [**Issue**](https://github.com/Stephcraft/Puzzlefy/issues/3)
* Dynamic loading screen ― [**Issue**](https://github.com/Stephcraft/Puzzlefy/issues/2)
* Draw placed pieces in separate graphics for performance ― [**Issue**](https://github.com/Stephcraft/Puzzlefy/issues/4)
* Random image if `image=` url parameter is not set ― [**Issue**](https://github.com/Stephcraft/Puzzlefy/issues/5)
* Auto solve functionality ― [**Issue**](https://github.com/Stephcraft/Puzzlefy/issues/6)
* Reset functionality ― [**Issue**](https://github.com/Stephcraft/Puzzlefy/issues/7)
* Large puzzles do not fully utilize the screen space ― [**Issue**](https://github.com/Stephcraft/Puzzlefy/issues/8)
* Puzzles with the same exact visuals can be interchanged (usually solid colors) ― [**Issue**](https://github.com/Stephcraft/Puzzlefy/issues/9)
* Background clip area vs free pieces clip setting
* Customize puzzle pattern (jigsaw shapes and in/out directions)
* Customize settings (feedback when invalid placed, allow preview, ...)
* Zoom and moving around camera controls. Useful for large puzzles and mobile devices (pinch to zoom)
