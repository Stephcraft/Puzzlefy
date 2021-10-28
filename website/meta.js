const params = new URLSearchParams(window.location.search)

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

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }
  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }