var canvas

var img, preview, frame
var tiles, pieces, placed, unplaced, puzzle, board

var cols, rows, aspect
var cropX, cropY
var scl, s

var loading = true, verifying = false, solved = false, error = false, previewing = -1, progress, o

const Theme = {
    background: [ 255 ],
    board: [ 240 ],
    board_fill: [ 235 ],
    board_outline: [ 220 ]
}

const Settings = {
    allowIncorectPlacements: true,
    hintIncorectPlacements: true
}

const NONE = 0
const IN = -1
const OUT = 1

const HORIZONTAL = 'horizontal'
const VERTICAL = 'vertical'

var prev

function setup() {
    const imageParam = params.get('image') || 'https://i.imgur.com/KY2fucv.jpg'
    const imageURL = isEncoded(imageParam) ? decodeURIComponent(imageParam) : imageParam

    canvas = createCanvas(windowWidth, windowHeight)

    // p5*js plugins
    // addCORSLoadImageFunction()
    addScreenPositionFunction()

    prev = millis()
    
    // gif
    if(imageURL.endsWith('.gif')) {
        
        // load gif
        img = loadImage(imageURL, img2 => {
            img.resize(img.width * 2, img.height * 2)
            console.log('load: ', millis() - prev)
            document.querySelector('.ui').classList.remove('disabled')
            loading = false
            start()
        }, failure => error = true)
    }

    // image
    else {

        // solution for any image to load
        createImg(imageURL, 'puzzle', null, event => {
            var element = event.elt
            img = new p5.Image(element.width, element.height, p5.instance)
            img.drawingContext.drawImage(element, 0, 0)
            img.modified = true
    
            document.querySelector('.ui').classList.remove('disabled')
            loading = false
            start()
        })
    }

    // 10 sec timeout
    setTimeout(() => loading ? (error = true) : false, 5000)
}

function start() {
    aspect = aspectRatio(round(img.width/100)*100, round(img.height/100)*100)

    // simplify aspect for undefined cols & rows
    if(aspect.x == 1 && aspect.y == 1)
        aspect = { x: 4, y: 4 }
    while(aspect.x * aspect.y >= 50)
        aspect = { x: parseInt(aspect.x/2), y: parseInt(aspect.y/2) }
    while(aspect.x * aspect.y <= 9)
        aspect = { x: parseInt(aspect.x*2), y: parseInt(aspect.y*2) }

    cols = params.get('cols') > 0 ? params.get('cols') : aspect.x
    rows = params.get('rows') > 0 ? params.get('rows') : aspect.y
    scl = params.get('scale') > 0 ? params.get('scale') : 0.5

    progress = o = numFrames(img) * 2

    prev = millis()

    // puzzle generation
    tiles = []
    for(var i=0; i<numFrames(img); i++) {
        img.setFrame(i)
        tiles.push(cut(img, cols, rows, CENTER, CENTER))
        progress--
    }

    console.log('cut: ', millis() - prev)

    prev = millis()

    // puzzle tiles generation
    tiles = puzzleify(tiles)

    console.log('puzzleify: ', millis() - prev)

    // preview image
    preview = img.get(cropX/2, cropY/2, img.width - cropX, img.height - cropY)

    prev = millis()

    // pieces
    placed = []
    unplaced = []
    pieces = []
    for(var x=0; x<cols; x++) {
        for(var y=0; y<rows; y++) {
            var orientation = Math.random() < 0.5 ? HORIZONTAL : VERTICAL
            var side = Math.random() < 0.5 ? -1 : 1

            switch(orientation) {
                case HORIZONTAL:
                    positionX = side * preview.width/2 * random(1.15, 1.90)
                    positionY = random(-preview.height/2 * 1.15, preview.height/2 * 1.15)
                    break;
                case VERTICAL:
                    positionX = random(-preview.width/2 * 1.90, preview.width/2 * 1.90)
                    positionY = side * preview.height/2 * random(1.15, 1.45)
                    break;
            }

            const piece = new Piece(x, y, positionX, positionY)
            pieces.push(piece)
            unplaced.push(piece)
        }
    }

    // board
    board = (() => {
        var pg = createGraphics(parseInt(cols * tiles.sizeX + tiles.sizeX/2 + 1), parseInt(rows * tiles.sizeY + tiles.sizeY/2 + 1))
        for(var x=0; x<cols; x++) {
            for(var y=0; y<rows; y++) {
                var tile = tiles[0][x][y]
    
                pg.image(tile.jigsaw, x * tiles.sizeX, y * tiles.sizeY)
            }
        }
        return imagify(pg)
    })()

    console.log('pieces: ', millis() - prev)

    // puzzle data
    puzzle = {
        width: preview.width,
        height: preview.height,
        ratio: { original: aspectRatio(img.width, img.height), simplified: aspect },
        count: pieces.length,
        pieces: new Map()
    }

    setupLinks()

    // @event
    window.parent.document.dispatchEvent(new CustomEvent('puzzleLoaded', { puzzle }))
}

function draw() {

    // loading screen
    if(loading) {
        background(255)

        noStroke()
        textAlign(CENTER, CENTER)
        textSize(50)

        if(error) {
            fill(255, 0, 0)
            text("Failed to load puzzle", width/2, height/2)
            return
        }
        else {
            fill(0)
            text("Loading puzzle", width/2, height/2)
        }

        stroke(0)
        strokeWeight(1)
        line(width*0.25, height*0.75, map(progress, 0, o, width*0.25, width*0.75), height*0.75)
        
        return
    }

    // scale and frame
    s = Math.min(width / img.width, height / img.height) * scl
    frame = parseInt((0.5 * frameCount) % numFrames(img))

    background(Theme.background)

    // transform
    translate(width/2, height/2)
    scale(s)

    // preview animation
    var deltaPreviewing = millis() - previewing
    var previewAlpha = map(sin((-(deltaPreviewing)*0.002 + 1.5)), -1, 1, 0, 255)

    if(deltaPreviewing > 3000 || previewing == -1)
        previewAlpha = 255

    if(solved) previewAlpha = 0

    // preview background
    img.setFrame(frame)
    image(img, -preview.width /2, -preview.height /2, preview.width, preview.height, cropX/2, cropY/2, img.width - cropX, img.height - cropY)

    // board background
    rectMode(CENTER)
    noStroke()
    fill(...Theme.board, previewAlpha)
    rect(0, 0, puzzle.width, puzzle.height)

    // puzzle board
    if(!solved) {
        push()
        translate(-tiles.sizeX/2 -img.width/2 + cropX/2, -tiles.sizeY/2 -img.height/2 + cropY/2)
        for(var x=0; x<cols; x++) {
            for(var y=0; y<rows; y++) {
                var tile = tiles[frame][x][y]
                
                // realtime board
                // image(tile.jigsaw, x * tiles.sizeX, y * tiles.sizeY)
                
                var min = screenPosition(x * tiles.sizeX + tiles.sizeX*0.5, y * tiles.sizeY + tiles.sizeY*0.5)
                var max = screenPosition(x * tiles.sizeX + tiles.sizeX*1.5, y * tiles.sizeY + tiles.sizeY*1.5)
    
                // over
                if(
                    mouseIsPressed &&
                    mouseX > min.x && mouseX < max.x &&
                    mouseY > min.y && mouseY < max.y
                    ) {
                        image(tile.jigsawFill, x * tiles.sizeX, y * tiles.sizeY)
                    }
            }
        }
        image(board, 0, 0)
        pop()
    }

    // placed pieces
    for(var i=placed.length-1; i>=0; i--) {
        var piece = placed[i]
        piece.update()
        piece.draw()
    }
    
    // placed pieces
    for(var i=placed.length-1; i>=0; i--) {
        var piece = placed[i]
        piece.drawPost()
    }

    // unplaced pieces
    for(var i=unplaced.length-1; i>=0; i--) {
        var piece = unplaced[i]
        piece.update()
        piece.draw()
    }
}

function mousePressed() {
    if(!error && !solved)
    for(var piece of pieces) {
        if(piece.pressed()) {

            // bring to front
            var index = pieces.indexOf(piece)
            pieces.splice(index, 1)
            pieces.splice(0, 0, piece)

            var index = unplaced.indexOf(piece)
            unplaced.splice(index, 1)
            unplaced.splice(0, 0, piece)

            // grab one at a time
            break
        }
    }
}
  
function mouseReleased() {
    if(!error && !solved)
    for(var piece of pieces) {
        piece.released()
    }
}

// --- events ---

function onPieceRelease(piece) {
    if(piece.isInsidePuzzle()) {
        var coordX = Math.round((piece.x + (cols % 2 == 0 ? tiles.sizeX/2 : 0)) / tiles.sizeX)
        var coordY = Math.round((piece.y + (rows % 2 == 0 ? tiles.sizeY/2 : 0)) / tiles.sizeY)

        var x = Math.trunc(coordX + cols/2 + (cols % 2 == 0 ? -1 : 0))
        var y = Math.trunc(coordY + rows/2 + (rows % 2 == 0 ? -1 : 0))

        // snap to grid if matches and place available
        if(piece.matchesShape(x, y) && !puzzle.pieces.has(`${x},${y}`)) {
            piece.x = coordX * tiles.sizeX + (cols % 2 == 0 ? -1 : 0) * tiles.sizeX/2
            piece.y = coordY * tiles.sizeY + (rows % 2 == 0 ? -1 : 0) * tiles.sizeY/2
            piece.placement = { x, y }
            piece.placed = millis()
            
            // now placed: bring to back
            puzzle.pieces.set(`${x},${y}`, piece)
            unplaced.splice(unplaced.indexOf(piece), 1)
            placed.push(piece)

            // bring to back
            var index = pieces.indexOf(piece)
            pieces.splice(index, 1)
            pieces.push(piece)

            // all pieces placed
            if(puzzle.pieces.size == puzzle.count)
                onComplete()
        }
    }
}

function onComplete() {

    // solved?
    for (const [key, value] of puzzle.pieces) {
        var coords = key.split(',')
        var x = parseInt(coords[0])
        var y = parseInt(coords[1])

        // wrongly placed
        if(x != value.index.x || y != value.index.y)
            return
    }

    // solved!
    onSolve()
}

function onSolve() {
    console.log('solved!')

    solved = true
    previewing = millis()

    // @event
    window.parent.document.dispatchEvent(new CustomEvent('puzzleSolved', { puzzle }))

    // end form
    setTimeout(() => {
        document.querySelector('.ui-popup-container').classList.remove('disabled')
        document.querySelector('.ui-container').classList.add('disabled')
    }, 3000)
}

// --- functionalities ---

function solve() {

}

function reset() {

}

function hint() {
    previewing = millis()
}

function share() {
    const text = encodeURIComponent(`I made this puzzle with @Puzzle_fy: ${window.location.href}`)
    const shareURL = `https://twitter.com/intent/tweet?text=${text}`
    window.open(shareURL)
}

function toggleFullscreen(self) {
    const classList = self.querySelector('i').classList
    classList.toggle('fa-expand')
    classList.toggle('fa-compress')
    const tooltip = self.parentElement.querySelector('.tooltip-content')
    tooltip.innerText = tooltip.innerText == 'Fullscreen' ? 'Windowed' : 'Fullscreen'
    fullscreen(!fullscreen())
}

function verify() {
    verifying = true
    for(var piece of pieces)
        if(piece.placed != -1)
            piece.placed = millis()
    verifying = false
}

function generate() {
    const img = document.querySelector('#url').value
    const cols = document.querySelector('#cols').value
    const rows = document.querySelector('#rows').value

    const url = new URL(window.location.origin + window.location.pathname)
    if(img) url.searchParams.set('image', img)
    if(cols) url.searchParams.set('cols', cols)
    if(rows) url.searchParams.set('rows', rows)
    return url.toString()
}

function shareGenerate() {
    const text = encodeURIComponent(`I made this puzzle with @Puzzle_fy: ${generate()}`)
    const shareURL = `https://twitter.com/intent/tweet?text=${text}`
    window.open(shareURL)
}

function copyGenerate() {
    copyTextToClipboard(generate())
}

// --- piece ---

class Piece {

    constructor(x, y, posX, posY) {
        this.x = posX
        this.y = posY
        this.w = tiles.sizeX * 1.25
        this.h = tiles.sizeY * 1.25
        this.dragging = false
        this.rollover = false
        this.placed = -1

        this.tile = () => tiles[frame][x][y].tile
        this.jigsaw = () => tiles[frame][x][y].jigsaw
        this.index = { x, y }
        this.placement = { x: -1, y: -1 }
    }

    draw() {
        push()
        imageMode(CENTER)

        // drop shadow
        if(this.placed == -1 && puzzle.count < 100) {
            drawingContext.shadowOffsetX = 0;
            drawingContext.shadowOffsetY = 0;
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = '#00000055';
        }
        
        // piece
        image(this.tile(), this.x, this.y)

        // placed outline
        if(this.placed != -1) {
            if(solved) {
                var deltaPreviewing = millis() - previewing
                if(deltaPreviewing < 1500) {
                    var fade = map(sin((-(deltaPreviewing)*0.002 + 1.5)), -1, 1, 0, 255)
                    translate(-tiles.sizeX/2 -img.width/2 + cropX/2, -tiles.sizeY/2 -img.height/2 + cropY/2)
                    drawJigsaw(this.placement.x, this.placement.y, 2, [ ...Theme.board_outline, fade ])
                }
            }
            else {
                image(this.jigsaw(), this.x, this.y)
            }
        }

        pop()
    }

    drawPost() {
        if(this.placed == -1) return
        
        push()
        imageMode(CENTER)
        
        var delta = millis() - this.placed

        // feedback
        if(delta < 1100) {
            var fade = map(sin(delta*0.01), -1, 1, 0, 255)
            translate(-tiles.sizeX/2 -img.width/2 + cropX/2, -tiles.sizeY/2 -img.height/2 + cropY/2)

            // incorrectly placed
            if(this.placement.x != this.index.x || this.placement.y != this.index.y)
                drawJigsaw(this.placement.x, this.placement.y, 6, [ 255, 0, 0, fade ])
        }

        pop()
    }

    update() {
        this.over()

        // Adjust location if being dragged
        if (this.dragging) {
            this.x = mouseX/s + this.offsetX
            this.y = mouseY/s + this.offsetY
        }
    }

    isOver() {
        var min = screenPosition(this.x - this.w/2, this.y - this.h/2)
        var max = screenPosition(this.x + this.w/2, this.y + this.h/2)

        return (
            mouseX > min.x && mouseX < max.x &&
            mouseY > min.y && mouseY < max.y
        )
    }

    isInsidePuzzle() {
        return (
            this.x > -puzzle.width/2 && this.x < puzzle.width/2 &&
            this.y > -puzzle.height/2 && this.y < puzzle.height/2
        )
    }

    matchesShape(x, y) {
        var other = tiles[frame][x][y]
        var tile = tiles[frame][this.index.x][this.index.y]

        if(other != null) {
            return (
                other.topCurve == tile.topCurve &&
                other.bottomCurve == tile.bottomCurve &&
                other.leftCurve == tile.leftCurve &&
                other.rightCurve == tile.rightCurve
            )
        }
    }

    over() {
        // Is mouse over object
        if (this.isOver()) {
            this.rollover = true;
            if(!solved) cursor(HAND)
        }
        else {
            if(this.rollover) cursor(ARROW)
            this.rollover = false;
        }
    }

    pressed() {
        // Did I click on the rectangle?
        if (this.isOver()) {

            // placed -> unplaced
            if(this.placed != -1) {
                puzzle.pieces.delete(`${this.placement.x},${this.placement.y}`)
                placed.splice(placed.indexOf(this), 1)
                unplaced.push(this)
            }

            this.dragging = true
            this.placed = -1

            // If so, keep track of relative location of click to corner of rectangle
            this.offsetX = this.x - mouseX/s
            this.offsetY = this.y - mouseY/s

            return true
        }
        return false
    }
    
    released() {
        if(this.dragging)
            onPieceRelease(this)

        // Quit dragging
        this.dragging = false
    }
}

// utility

function drawJigsaw(x, y, weight, stroke) {
    var tile = tiles[frame][x][y]
    var w = tiles.sizeX
    var h = tiles.sizeY
    var pg = canvas._pInst

    var drawPuzzleSide = (side, curve) => {
        drawPuzzleSideShape(false, pg, side, curve , w, h, () => {
            pg.noFill()
            pg.stroke(...stroke)
            pg.strokeWeight(weight)
        })
    }

    push()
    translate(x * w + w/2, y * h + h/2)
    drawPuzzleSide(TOP, tile.topCurve)
    drawPuzzleSide(BOTTOM, tile.bottomCurve)
    drawPuzzleSide(LEFT, tile.leftCurve)
    drawPuzzleSide(RIGHT, tile.rightCurve)
    pop()
}

function numFrames(img) {
    return img.numFrames() || 1
}