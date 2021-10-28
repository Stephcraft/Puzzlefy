
function addCORSLoadImageFunction(p5Instance) {
	let p = p5Instance || this;

	p.loadImage = function(path, mode, successCallback, failureCallback) {
		p5._validateParameters('loadImage', arguments);
		const pImg = new p5.Image(1, 1, this);
		const self = this;
	  
		const req = new Request(path, {
		  method: 'GET',
		  mode: mode, // 'cors',
		  headers: new Headers({
			  'Access-Control-Allow-Origin': '*'
		  })
		});
	  
		fetch(path, req)
		  .then(response => {
			// GIF section
			const contentType = response.headers.get('content-type');
			if (contentType === null) {
			  console.warn(
				'The image you loaded does not have a Content-Type header. If you are using the online editor consider reuploading the asset.'
			  );
			}
			if (contentType && contentType.includes('image/gif')) {
			  response.arrayBuffer().then(
				arrayBuffer => {
				  if (arrayBuffer) {
					const byteArray = new Uint8Array(arrayBuffer);
					_createGif(
					  byteArray,
					  pImg,
					  successCallback,
					  failureCallback,
					  (pImg => {
						self._decrementPreload();
					  }).bind(self)
					);
				  }
				},
				e => {
				  if (typeof failureCallback === 'function') {
					failureCallback(e);
				  } else {
					console.error(e);
				  }
				}
			  );
			} else {
			  // Non-GIF Section
			  const img = new Image();
	  
			  img.onload = () => {
				pImg.width = pImg.canvas.width = img.width;
				pImg.height = pImg.canvas.height = img.height;
	  
				// Draw the image into the backing canvas of the p5.Image
				pImg.drawingContext.drawImage(img, 0, 0);
				pImg.modified = true;
				if (typeof successCallback === 'function') {
				  successCallback(pImg);
				}
				self._decrementPreload();
			  };
	  
			  img.onerror = e => {
				p5._friendlyFileLoadError(0, img.src);
				if (typeof failureCallback === 'function') {
				  failureCallback(e);
				} else {
				  console.error(e);
				}
			  };
	  
			  // Set crossOrigin in case image is served with CORS headers.
			  // This will let us draw to the canvas without tainting it.
			  // See https://developer.mozilla.org/en-US/docs/HTML/CORS_Enabled_Image
			  // When using data-uris the file will be loaded locally
			  // so we don't need to worry about crossOrigin with base64 file types.
			  if (path.indexOf('data:image/') !== 0) {
				img.crossOrigin = 'Anonymous';
			  }
			  // start loading the image
			  img.src = path;
			}
			pImg.modified = true;
		  })
		  .catch(e => {
			p5._friendlyFileLoadError(0, path);
			if (typeof failureCallback === 'function') {
			  failureCallback(e);
			} else {
			  console.error(e);
			}
		  });
		return pImg;
	  };
}
