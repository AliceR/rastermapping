//https://github.com/mlevans/leaflet-hash/blob/master/LICENSE.md
// adapted
(function(window) {
	var HAS_HASHCHANGE = (function() {
		var doc_mode = window.documentMode;
		return ('onhashchange' in window) &&
		(doc_mode === undefined || doc_mode > 7);
	})();

	L.Hash = function(map) {
		this.onHashChange = L.Util.bind(this.onHashChange, this);

		if (map) {
			this.init(map);
		}
	};

	// this is where the slider and map information is connected to the URL
	// parse (read)
	L.Hash.parseHash = function(hash) {
		if(hash.indexOf('#') === 0) {
			hash = hash.substr(1);
		}
		var args = hash.split("/");
		if (args.length == 4) {
			var zoom = parseInt(args[0], 10),
			lat = parseFloat(args[1]),
			lon = parseFloat(args[2]);
			lvl = parseInt(args[3]);
			if (isNaN(zoom) || isNaN(lat) || isNaN(lon)|| isNaN(lvl)) {
				return false;
			} else {
				// read the URL values and change the color according to slider position
				$( "#slider" ).slider("option", "value", lvl);
				$( "#sliderlabel" ).val( lvl );
				changeColor(lvl);
				// also change map position accordingly
				return {
					center: new L.LatLng(lat, lon),
					zoom: zoom
				};
			}
		} else {
			return false;
		}
	};
	// format (write)
	L.Hash.formatHash = function(map) {
		var center = map.getCenter(),
		zoom = map.getZoom(),
		precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));

		// write the value from the slider position to the URL
		lvl = parseInt($( "#sliderlabel" ).val());

		// create the URL from all these infos
		return "#" + [zoom,
		center.lat.toFixed(precision),
		center.lng.toFixed(precision),
		lvl
		].join("/");
	},

	L.Hash.prototype = {
		map: null,
		lastHash: null,

		parseHash: L.Hash.parseHash,
		formatHash: L.Hash.formatHash,

		init: function(map) {
			this.map = map;

			// reset the hash
			this.lastHash = null;
			this.onHashChange();

			if (!this.isListening) {
				this.startListening();
			}
		},

		removeFrom: function(map) {
			if (this.changeTimeout) {
				clearTimeout(this.changeTimeout);
			}

			if (this.isListening) {
				this.stopListening();
			}

			this.map = null;
		},

		onMapMove: function() {
			// bail if we're moving the map (updating from a hash),
			// or if the map is not yet loaded

			if (this.movingMap || !this.map._loaded) {
				return false;
			}

			var hash = this.formatHash(this.map);
			if (this.lastHash != hash) {
				location.replace(hash);
				this.lastHash = hash;
			}
		},

		movingMap: false,
		update: function() {
			var hash = location.hash;
			if (hash === this.lastHash) {
				return;
			}
			var parsed = this.parseHash(hash);
			if (parsed) {
				this.movingMap = true;

				this.map.setView(parsed.center, parsed.zoom);

				this.movingMap = false;
			} else {
				this.onMapMove(this.map);
			}
		},

		// defer hash change updates every 100ms
		changeDefer: 100,
		changeTimeout: null,
		onHashChange: function() {
			// throttle calls to update() so that they only happen every
			// `changeDefer` ms
			if (!this.changeTimeout) {
				var that = this;
				this.changeTimeout = setTimeout(function() {
					that.update();
					that.changeTimeout = null;
				}, this.changeDefer);
			}
		},

		isListening: false,
		hashChangeInterval: null,
		startListening: function() {
			this.map.on("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.addListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
				this.hashChangeInterval = setInterval(this.onHashChange, 50);
			}
			this.isListening = true;
		},

		stopListening: function() {
			this.map.off("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.removeListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
			}
			this.isListening = false;
		}
	};
	L.hash = function(map) {
		return new L.Hash(map);
	};
	L.Map.prototype.addHash = function() {
		this._hash = L.hash(this);
	};
	L.Map.prototype.removeHash = function() {
		this._hash.removeFrom();
	};
})(window);
//end of leaflet-hash

// create the map
var map = new L.Map('map',{maxZoom:16});	
// background map tiles from external source
var layer = new L.StamenTileLayer("toner");
layer.setOpacity(0.4);

map.setView(new L.LatLng(16.0857,108.2023), 11).addLayer(layer);
atttr = 'DEM: test data, internal use only';	

// create a canvas layer on which to draw the data
var canvasTiles = new L.TileLayer.Canvas( {tms: false, minZoom: 6, maxZoom: 11, attribution: atttr});
var hash = new L.Hash(map);
/*
On initialising a canvas tile, use the drawTile function to loop through each pixel and assign color and alpha values based on the current height and the value of the data.
*/     
getLevel = function() {
	// read level value from slider
	var level = parseInt($( "#sliderlabel" ).val());
	// default to 50
	if (level == 'NaN') level = 150;
	
	// dem is the pixel value of the pngs, the encoded height
	// translation from height (slider range -15 to 1656) to pixel value 0 to 255
	var dem = level / ((15+1656)/255);

	if (dem < 0) dem = 0;
	if (dem > 255) dem = 255;

	return dem;
};

canvasTiles._loadTile= function (tile, tilePoint) {
	tile._layer = this;
	tile._tilePoint = tilePoint;
	this._adjustTilePoint(tilePoint);
	this._redrawTile(tile);

	if (!this.options.async) {
		this.tileDrawn(tile);
	}
};

canvasTiles.drawTile = function(canvas, tilePoint, zoom) {
	var dem = getLevel();
	var ctx = canvas.getContext('2d');
	var img = new Image();
	//The tiles need to come from a local source to prevent cross-origin problems
	var url = 'tiles-vn-colormap/'+zoom+'/'+tilePoint.x+'/'+tilePoint.y+'.png';
	//On the img.onload store the original data of the png to the canvas element and loop through all the pixels.
	img.onload = function(){  
		var height = 256;
		var width = 256;
		ctx.drawImage(img,0,0);		
		imageData = ctx.getImageData(0, 0, 256, 256);
		$(canvas).data('iData',imageData);
		//color the pixels of the canvas
		colorPixels(canvas);
	}
	img.src= url;
}
map.addLayer(canvasTiles);

//function to color the pixels of the canvas based on the pixel value and the current selected height
colorPixels = function(canvas) {
	var dem = getLevel();
	var ctx = canvas.getContext('2d');
	var imageData = ctx.createImageData(256,256);
	if($(canvas).data('iData')) {
		oImageData = $(canvas).data('iData');
		for (y = 0; y < 256; y++) {		
     			inpos = y * 256 * 4; // *4 for 4 ints per pixel
     			outpos =inpos ;
     			for (x = 0; x < 256; x++) {
      				var r = oImageData.data[inpos++];
      				var g = oImageData.data[inpos++];
      				var b = oImageData.data[inpos++];
      				var a = oImageData.data[inpos++];
					var gn = g; //store the original value
					var bn = b; //store the original value

				// the nodata pixels should stay invisible
				if(g == 0 && b == 0) a = 0;

				// if pixel value below encoded hight (slider value translated to 255 pixel range), show it blue
				else if(g+b < dem) {r=0; gn=0; bn=255; a=200;}

				// else, show and color the pixel depending on the pixel value
				//  - this is the classification
				else {
					if(g=240){
						if(b>=240){		r=112; gn=153; bn=89; a=150;}
						else if(b<240&&b>=133){r=187; gn=204; bn= 131; a=150;}
						else{			r=242; gn=234; bn= 160; a=150;}
					}
					else if(g=200){
						if(b>=212){		r=242; gn=234; bn= 160; a=150;}
						else if(b<212&&b>=57){r=242; gn=216; bn= 143; a=150;}
						else{			r=227; gn=182; bn= 132; a=150;}
					}
					else if(g=160){
						if(b>=174){		r=227; gn=182; bn= 132; a=150;}
						else if(b<174&&b>=16){r=199; gn=146; bn= 125; a=150;}
						else{			r=224; gn=177; bn= 184; a=150;}
					}
					else if(g=120){
						if(b>=92){		r=224; gn=177; bn= 184; a=150;}
						else{			r=255; gn=242; bn= 255; a=150;}
					}
					else if(g=80){
						if(b>=134){		r=255; gn=242; bn= 255; a=150;}
						else {			r=255; gn=242; bn= 255; a=20;}
					}
					else if(g=0){		r=255; gn=242; bn= 255; a=20;}
					else{ r=0; gn=0; bn=0; a=255;}
				}

				imageData.data[outpos++] = r;
				imageData.data[outpos++] = g;
				imageData.data[outpos++] = bn;
				imageData.data[outpos++] = a;
			}
		}
	}
	ctx.putImageData(imageData, 0, 0);
}


changeColor = function(uivalue) {
	// update the color of the slider label
	var sv = $( "#sliderlabel" );
	if(uivalue < 20) {
		sv.removeClass('cl2').removeClass('cl3').removeClass('cl4').removeClass('cl5').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl1');
	}
	if(uivalue >= 20 && uivalue < 150) {
		sv.removeClass('cl1').removeClass('cl3').removeClass('cl4').removeClass('cl5').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl2');
	}
	if(uivalue >= 150 && uivalue < 300) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl4').removeClass('cl5').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl3');
	}
	if(uivalue >= 300 && uivalue < 500) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl3').removeClass('cl5').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl4');
	}
	if(uivalue >= 500 && uivalue < 700) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl3').removeClass('cl4').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl5');
	}
	if(uivalue >= 700 && uivalue < 900) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl3').removeClass('cl4').removeClass('cl5').removeClass('cl7').removeClass('cl8')
		.addClass('cl6');
	}
	if(uivalue >= 900 && uivalue < 1300) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl3').removeClass('cl4').removeClass('cl5').removeClass('cl6').removeClass('cl8')
		.addClass('cl7');
	}
	if(uivalue >= 1300) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl3').removeClass('cl4').removeClass('cl5').removeClass('cl6').removeClass('cl7')
		.addClass('cl8');
	}

	// update the canvas pixel color
	var canvi = $("canvas");
	for (i = 0; i < canvi.length; i++) {
		var canvas = canvi[i];
		colorPixels(canvas);
	}
}

// set the opacity of the background map
setOpacity = function(opac) {
	layer.setOpacity(opac);
}

