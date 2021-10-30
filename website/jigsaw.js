// https://www.codeproject.com/Articles/395453/Html5-Jigsaw-Puzzle

// defines the shape of the puzzle pieces
// this array contains the points to define one side facing up
// the shape is from x: 0 to x: 100
// array of bezier curves (x1, y1, x3, y3, x2, y2)
const shape = [
    [ 0, 0, 35, 15, 37, 5 ],
    [ 37, 5, 40, 0, 38, -5 ],
    [ 38, -5, 20, -20, 50, -20 ],
    [ 50, -20, 80, -20, 62, -5 ],
    [ 62, -5, 60, 0, 63, 5 ],
    [ 63, 5, 65, 15, 100, 0 ]
]

function drawPuzzleSideMask(pg, side, curve, w, h) {
    drawPuzzleSideShape(true, pg, side, curve , w, h, () => {
        pg.fill(0)
        pg.stroke(0)
        pg.strokeWeight(1)
    })
}

function drawPuzzleSide(pg, side, curve, w, h) {
    drawPuzzleSideShape(false, pg, side, curve , w, h, () => {
        pg.noFill()
        pg.stroke(Theme.board_outline)
        pg.strokeWeight(2)
    })
}

function drawPuzzleSideShape(shaped, pg, side, curve, size, h, style) {
    var s = size / 100

    pg.push()
    
    style()

    switch(side) {
        case BOTTOM:
            pg.translate(0, size)
            pg.rotate(PI)
            pg.translate(-size, 0)
            break;
        case LEFT:
            pg.rotate(-HALF_PI)
            pg.translate(-size, 0)
            break;
        case RIGHT:
            pg.rotate(HALF_PI)
            pg.translate(0, -size)
            break;
    }

    pg.beginShape()
    pg.vertex(0, 0)

    if(curve != NONE) {
        for(var bezier of shape) {
            pg.bezierVertex(...bezier.map((value, i) => (curve == IN && i%2 != 0 ? -value : value) * s))
        }
    }
    else pg.vertex(100 * s, 0)

    if(shaped) {
        pg.vertex(150 * s, -50 * s)
        pg.vertex(-50 * s, -50 * s)
    }

    if(shaped) pg.endShape(CLOSE)
    else pg.endShape()
    pg.pop()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function puzzleify(tiles) {
    var w = parseInt(tiles.sizeX), h = parseInt(tiles.sizeY)

    // cache, so we don't need to recreate same masks
    // pixel access is time consuming
    var cached = new Map()
    
    for(var i=0; i<numFrames(img); i++) {
        img.setFrame(i)

        progress--

        for(var x=0; x<cols; x++) {
            for(var y=0; y<rows; y++) {
    
                // in / out checkers pattern
                var xCurve = (x % 2 == 0 ? IN : OUT)
                var yCurve = (y % 2 != 0 ? IN : OUT)
    
                // corners and sides
                var topCurve    = y == 0 ? NONE : yCurve
                var bottomCurve = y == rows-1 ? NONE : yCurve
                var leftCurve   = x == 0 ? NONE : xCurve
                var rightCurve  = x == cols-1 ? NONE : xCurve
    
                var key = `${topCurve}, ${bottomCurve}, ${leftCurve}, ${rightCurve}`
                
                // mask
                if(!cached.has(key)) {
                    var mask = (() => {
                        var pg = createGraphics(w*2, h*2)
                        pg.background(255)
                        pg.translate(w*0.5, h*0.5)
                        drawPuzzleSideMask(pg, TOP, topCurve, w, h)
                        drawPuzzleSideMask(pg, BOTTOM, bottomCurve, w, h)
                        drawPuzzleSideMask(pg, LEFT, leftCurve, w, h)
                        drawPuzzleSideMask(pg, RIGHT, rightCurve, w, h)
                        return maskify(imagify(pg))
                    })()
    
                    // jigsaw outline
                    var jigsaw = (() => {
                        var pg = createGraphics(w*2, h*2)
                        pg.translate(w*0.5, h*0.5)
                        drawPuzzleSide(pg, TOP, topCurve, w, h)
                        drawPuzzleSide(pg, BOTTOM, bottomCurve, w, h)
                        drawPuzzleSide(pg, LEFT, leftCurve, w, h)
                        drawPuzzleSide(pg, RIGHT, rightCurve, w, h)
                        return imagify(pg)
                    })()
        
                    // jigsaw fill
                    var jigsawFill = (() => {
                        var pg = createGraphics(w*2, h*2)
                        pg.background(Theme.board_fill)
                        var img = imagify(pg)
                        img.mask(mask)
                        return img
                    })()
    
                    cached.set(key, { mask, jigsaw, jigsawFill })
                }

                var tile = tiles[i][x][y]
    
                // stuff is cached to avoid duplicate processing
                var { mask, jigsaw, jigsawFill } = cached.get(key)
                tile.mask(mask)
    
                tiles[i][x][y] = {
                    tile, jigsaw, jigsawFill,
                    topCurve, bottomCurve, leftCurve, rightCurve
                }
            }
        }
    }

    return tiles
}

function maskify(img) {
    img.loadPixels();

    // skip every 4 values (r, g, b, a)
    for(let i = 0 ; i < img.pixels.length; i+= 4){
        // transfer grayscale R, G, B into alpha (index + 3)
        img.pixels[i + 3] = (img.pixels[i + 0] + img.pixels[i + 0] + img.pixels[i + 0]) / 3;
    }
    img.updatePixels();

    return img
}

function imagify(pg) {
    var img = pg.get()
    pg.remove()
    return img
}

function cut(img, cols, rows, alignX, alignY) {
    var squared = (alignX || alignY)

    // size of image
    var w = img.width 
    var h = img.height
    
    // size of each tiles
    var sizeX = w / cols
    var sizeY = h / rows

    cropX = 0
    cropY = 0

    // tiles are squared and image will be cropped
    if(squared) {
        
        var ratio = aspectRatio(sizeX, sizeY)

        // reduce the size of the biggest dimension (width or height)
        // to make it aspect 1:1
        if(ratio.y > ratio.x)
            sizeY *= ratio.x / ratio.y
        else if(ratio.x > ratio.y)
            sizeX *= ratio.y / ratio.x

        // crop unused image space
        cropX = w - cols*sizeX
        cropY = h - rows*sizeY
    }

    var tiles = []

    // metadata
    window.tiles.sizeX = sizeX
    window.tiles.sizeY = sizeY

    // will need to capture beyond the image dimensions
    var pg = createGraphics(img.width + sizeX*2, img.height + sizeY*2)
    pg.image(img, sizeX, sizeY)
    img = imagify(pg)

    for(var x=0; x<cols; x++) {
        var col = []
        for(var y=0; y<rows; y++) {
            var offset = { x: 0, y: 0 }

            // aligned cropped
            if(squared) {
                switch(alignX) {
                    case LEFT: offset.x = 0; break;
                    case CENTER: offset.x = cropX/2; break;
                    case RIGHT: offset.x = cropX; break;
                }

                switch(alignX) {
                    case TOP: offset.y = 0; break;
                    case CENTER: offset.y = cropY/2; break;
                    case BOTTOM: offset.y = cropY; break;
                }
            }

            // image capture
            // var sliced = img.get(x * sizeX + offset.x, y * sizeY + offset.y, sizeX, sizeY)
            
            // image capture with buffer (doubled size)
            var sliced = img.get((x+1) * sizeX + offset.x -sizeX/2, (y+1) * sizeY + offset.y -sizeY/2, sizeX*2, sizeY*2)

            col.push(sliced)
        }
        tiles.push(col)
    }

    return tiles
}

function gcd(a, b) {
    if(b == 0) return a
    return gcd (b, a % b)
}

function aspectRatio(w, h) {
    var gcd = window.gcd(w, h)
    return { x: w/gcd, y: h/gcd }
}