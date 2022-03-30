const params = new URLSearchParams(window.location.search)

// dynamic image meta
document.querySelector('meta[property="og:image"]').setAttribute("content", params.get('image'))

// disable scroll
document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, { passive: false });

// disable zoom
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
})

// urls
function setupLinks() {

    // again
    const again = document.querySelector('#again')
    const url = new URL(window.location.href)
    url.searchParams.set('cols', cols * 2)
    url.searchParams.set('rows', rows * 2)
    again.href = url.toString()

    // share
    const share = document.querySelector('#share')
    const text = encodeURIComponent(`I made this puzzle with @Puzzle_fy: ${window.location.href}`)
    const shareURL = `https://twitter.com/intent/tweet?text=${text}`
    share.href = shareURL
}

function isEncoded(uri) {
    uri = uri || ''
    return uri !== decodeURIComponent(uri)
}