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


// the colorkey (might be better in external file...)
var colorkey = {
"255-0-0":null,
"255-172-255":712.129,
"255-172-254":719.255,
"255-172-253":726.381,
"255-172-252":733.507,
"255-172-251":740.633,
"255-172-250":747.759,
"255-172-249":754.885,
"255-172-248":762.011,
"255-172-247":769.137,
"255-172-246":776.263,
"255-172-245":783.389,
"255-172-244":790.515,
"255-172-243":797.641,
"255-172-242":804.767,
"255-172-241":811.893,
"255-172-240":819.019,
"255-172-239":826.145,
"255-172-238":833.271,
"255-172-237":840.397,
"255-172-236":847.523,
"255-172-235":854.649,
"255-172-234":861.775,
"255-172-233":868.901,
"255-172-232":876.026,
"255-172-231":883.152,
"255-172-230":890.278,
"255-172-229":897.404,
"255-172-228":904.53,
"255-172-227":911.656,
"255-172-226":918.782,
"255-172-225":925.908,
"255-172-224":933.034,
"255-172-223":940.16,
"255-172-222":947.286,
"255-172-221":954.412,
"255-172-220":961.538,
"255-172-219":968.664,
"255-172-218":975.79,
"255-172-217":982.916,
"255-172-216":990.042,
"255-172-215":997.168,
"255-172-214":1004.29,
"255-172-213":1011.42,
"255-172-212":1018.55,
"255-172-211":1025.67,
"255-172-210":1032.8,
"255-172-209":1039.92,
"255-172-208":1047.05,
"255-172-207":1054.18,
"255-172-206":1061.3,
"255-172-205":1068.43,
"255-172-204":1075.55,
"255-172-203":1082.68,
"255-172-202":1089.81,
"255-172-201":1096.93,
"255-172-200":1104.06,
"255-172-199":1111.18,
"255-172-198":1118.31,
"255-172-197":1125.44,
"255-172-196":1132.56,
"255-172-195":1139.69,
"255-172-194":1146.81,
"255-172-193":1153.94,
"255-172-192":1161.07,
"255-172-191":1168.19,
"255-172-190":1175.32,
"255-172-189":1182.44,
"255-172-188":1189.57,
"255-172-187":1196.7,
"255-172-186":1203.82,
"255-172-185":1210.95,
"255-172-184":1218.07,
"255-172-183":1225.2,
"255-172-182":1232.33,
"255-172-181":1239.45,
"255-172-180":1246.58,
"255-172-179":1253.7,
"255-172-178":1260.83,
"255-172-177":1267.96,
"255-172-176":1275.08,
"255-172-175":1282.21,
"255-172-174":1289.33,
"255-172-173":1296.46,
"255-172-172":1303.59,
"255-172-171":1310.71,
"255-172-170":1317.84,
"255-172-169":1324.96,
"255-172-168":1332.09,
"255-172-167":1339.21,
"255-172-166":1346.34,
"255-172-165":1353.47,
"255-172-164":1360.59,
"255-172-163":1367.72,
"255-172-162":1374.84,
"255-172-161":1381.97,
"255-172-160":1389.1,
"255-172-159":1396.22,
"255-172-158":1403.35,
"255-172-157":1410.47,
"255-172-156":1417.6,
"255-172-155":1424.73,
"255-172-154":1431.85,
"255-172-153":1438.98,
"255-172-152":1446.1,
"255-172-151":1453.23,
"255-172-150":1460.36,
"255-172-149":1467.48,
"255-172-148":1474.61,
"255-172-147":1481.73,
"255-172-146":1488.86,
"255-172-145":1495.99,
"255-172-144":1503.11,
"255-172-143":1510.24,
"255-172-142":1517.36,
"255-172-141":1524.49,
"255-172-140":1531.62,
"255-172-139":1538.74,
"255-172-138":1545.87,
"255-172-137":1552.99,
"255-172-136":1560.12,
"255-172-135":1567.25,
"255-172-134":1574.37,
"255-172-133":1581.5,
"255-172-132":1588.62,
"255-172-131":1595.75,
"255-172-130":1602.88,
"255-172-129":1610,
"255-172-128":1617.13,
"255-172-127":1624.25,
"255-172-126":1631.38,
"255-172-125":1638.51,
"255-172-124":1645.63,
"255-172-123":1652.76,
"255-172-122":1659.88,
"255-172-121":1667.01,
"255-172-120":1674.14,
"255-172-119":1681.26,
"255-172-118":1688.39,
"255-172-117":1695.51,
"255-172-116":1702.64,
"255-172-115":1709.77,
"255-172-114":1716.89,
"255-172-113":1724.02,
"255-172-112":1731.14,
"255-172-111":1738.27,
"255-172-110":1745.4,
"255-172-109":1752.52,
"255-172-108":1759.65,
"255-172-107":1766.77,
"255-172-106":1773.9,
"255-172-105":1781.03,
"255-172-104":1788.15,
"255-172-103":1795.28,
"255-172-102":1802.4,
"255-172-101":1809.53,
"255-172-100":1816.66,
"255-172-99":1823.78,
"255-172-98":1830.91,
"255-172-97":1838.03,
"255-172-96":1845.16,
"255-172-95":1852.29,
"255-172-94":1859.41,
"255-172-93":1866.54,
"255-172-92":1873.66,
"255-172-91":1880.79,
"255-172-90":1887.92,
"255-172-89":1895.04,
"255-172-88":1902.17,
"255-172-87":1909.29,
"255-172-86":1916.42,
"255-172-85":1923.54,
"255-172-84":1930.67,
"255-172-83":1937.8,
"255-172-82":1944.92,
"255-172-81":1952.05,
"255-172-80":1959.17,
"255-172-79":1966.3,
"255-172-78":1973.43,
"255-172-77":1980.55,
"255-172-76":1987.68,
"255-172-75":1994.8,
"255-172-74":2001.93,
"255-172-73":2009.06,
"255-172-72":2016.18,
"255-172-71":2023.31,
"255-172-70":2030.43,
"255-172-69":2037.56,
"255-172-68":2044.69,
"255-172-67":2051.81,
"255-172-66":2058.94,
"255-172-65":2066.06,
"255-172-64":2073.19,
"255-172-63":2080.32,
"255-172-62":2087.44,
"255-172-61":2094.57,
"255-172-60":2101.69,
"255-172-59":2108.82,
"255-172-58":2115.95,
"255-172-57":2123.07,
"255-172-56":2130.2,
"255-172-55":2137.32,
"255-172-54":2144.45,
"255-172-53":2151.58,
"255-172-52":2158.7,
"255-172-51":2165.83,
"255-172-50":2172.95,
"255-172-49":2180.08,
"255-172-48":2187.21,
"255-172-47":2194.33,
"255-172-46":2201.46,
"255-172-45":2208.58,
"255-172-44":2215.71,
"255-172-43":2222.84,
"255-172-42":2229.96,
"255-172-41":2237.09,
"255-172-40":2244.21,
"255-172-39":2251.34,
"255-172-38":2258.47,
"255-172-37":2265.59,
"255-172-36":2272.72,
"255-172-35":2279.84,
"255-172-34":2286.97,
"255-172-33":2294.1,
"255-172-32":2301.22,
"255-172-31":2308.35,
"255-172-30":2315.47,
"255-172-29":2322.6,
"255-172-28":2329.73,
"255-172-27":2336.85,
"255-172-26":2343.98,
"255-172-25":2351.1,
"255-172-24":2358.23,
"255-172-23":2365.36,
"255-172-22":2372.48,
"255-172-21":2379.61,
"255-172-20":2386.73,
"255-172-19":2393.86,
"255-172-18":2400.99,
"255-172-17":2408.11,
"255-172-16":2415.24,
"255-172-15":2422.36,
"255-172-14":2429.49,
"255-172-13":2436.62,
"255-172-12":2443.74,
"255-172-11":2450.87,
"255-172-10":2457.99,
"255-172-9":2465.12,
"255-172-8":2472.25,
"255-172-7":2479.37,
"255-172-6":2486.5,
"255-172-5":2493.62,
"255-172-4":2500.75,
"255-172-3":2507.88,
"255-172-2":2515,
"255-172-1":2522.13,
"255-172-0":2529.25
}

// background map tiles from external source
var accessToken = 'pk.eyJ1IjoiY2FydG9saWNlIiwiYSI6ImNpZmR3cGExeDAwZXJ0amx5ZTZpbDR6bjYifQ.dhipV0B_b9422-ArK5e04Q';
var baselayer = L.tileLayer('https://api.mapbox.com/v4/mapbox.emerald/{z}/{x}/{y}.png?access_token=' + accessToken, {
    attribution: 'Basemap tiles: Mapbox emerald, <a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
});

var baseMaps = {
	"Basemap": baselayer,
};

// create a canvas layer on which to draw the data
var canvasTiles = new L.TileLayer.Canvas( {tms: false, minZoom: 6, maxZoom: 11, attribution: 'DEM: SRTM data'});
var hash = new L.Hash(map);
/*
On initialising a canvas tile, use the drawTile function to loop through each pixel and assign color and alpha values based on the current height and the value of the data.
*/     
getLevel = function() {
	// read level value from slider
	var level = parseInt($( "#sliderlabel" ).val());
	// default to 50
	if (level == 'NaN') level = 50;

	return level;
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
	var lvl = getLevel();
	var ctx = canvas.getContext('2d');
	var img = new Image();
	//The tiles need to come from a local source to prevent cross-origin problems
	var url = 'tiles-makuyuni/'+zoom+'/'+tilePoint.x+'/'+tilePoint.y+'.png';
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

canvasTiles.setOpacity(0.4);

var overlayMaps = {
	"DEM": canvasTiles
};

// create the map
var map = new L.Map('map',{
	maxZoom:16,
	layers: [baselayer, canvasTiles]
});
map.setView(new L.LatLng(-2.696,36.705), 7);


L.control.layers(baseMaps, overlayMaps).addTo(map);


// the legend
var legend = L.control({position: 'topright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1000,1300,1500,1800,2200,2500],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColorscheme(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' m &ndash; ' + grades[i + 1] + ' m<br>' : ' m +');
    }

    return div;
};

legend.addTo(map);


//function to color the pixels of the canvas based on the pixel value and the current selected height
colorPixels = function(canvas) {

	var lvl = getLevel();
	var ctx = canvas.getContext('2d');
	var imageData = ctx.createImageData(256,256);
	if($(canvas).data('iData')) {
		oImageData = $(canvas).data('iData');
		for (y = 0; y < 256; y++) {		
     		inpos = y * 256 * 4; // *4 for 4 ints per pixel
     		outpos = inpos ;
     		for (x = 0; x < 256; x++) {
      			var r = oImageData.data[inpos++];
      			var g = oImageData.data[inpos++];
      			var b = oImageData.data[inpos++];
      			var a = oImageData.data[inpos++];
				var bn = b; //store the original value

				// the nodata pixels should stay invisible
				if(g == 0 && b == 0) a = 0;

				// if pixel value below encoded hight (slider value translated to 255 pixel range), show it blue
				else if((colorkey[r+"-"+g+"-"+b]) < lvl) { r = 0; g = 0; bn = 255; a = 255;}
				// else, show and color the pixel depending on the pixel value
				else {

					// classification based on streched pixel value (range from 0 to 255) // 
					if ((colorkey[r+"-"+g+"-"+b])> 2500)											{r = 224; g = 177; bn = 184;} // 2500m - 3000m
					else if ((colorkey[r+"-"+g+"-"+b])<= 2500 && (colorkey[r+"-"+g+"-"+b])> 2200) 	{r = 199; g = 146; bn = 125;} // 2200m - 2500m
					else if ((colorkey[r+"-"+g+"-"+b])<= 2200 && (colorkey[r+"-"+g+"-"+b])> 1800) 	{r = 227; g = 182; bn = 132;} // 1800m - 2200m
					else if ((colorkey[r+"-"+g+"-"+b])<= 1800 && (colorkey[r+"-"+g+"-"+b])> 1500) 	{r = 242; g = 216; bn = 143;} // 1500m - 1800m
					else if ((colorkey[r+"-"+g+"-"+b])<= 1500 && (colorkey[r+"-"+g+"-"+b])> 1300) 	{r = 242; g = 234; bn = 160;} // 1300m - 1500m
					else if ((colorkey[r+"-"+g+"-"+b])<= 1300 && (colorkey[r+"-"+g+"-"+b])> 1000) 	{r = 187; g = 204; bn = 131;} // 1000m - 1300m
					else if ((colorkey[r+"-"+g+"-"+b])<= 1000 ) 									{r = 112; g = 153; bn =  89;} // < 1000m 

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

	if(uivalue < 1000) {
		sv.removeClass('cl2').removeClass('cl3').removeClass('cl4').removeClass('cl5').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl1');
	}
	if(uivalue >= 1000 && uivalue < 1300) {
		sv.removeClass('cl1').removeClass('cl3').removeClass('cl4').removeClass('cl5').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl2');
	}
	if(uivalue >= 1300 && uivalue < 1500) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl4').removeClass('cl5').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl3');
	}
	if(uivalue >= 1500 && uivalue < 1800) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl3').removeClass('cl5').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl4');
	}
	if(uivalue >= 1800 && uivalue < 2200) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl3').removeClass('cl4').removeClass('cl6').removeClass('cl7').removeClass('cl8')
		.addClass('cl5');
	}
	if(uivalue >= 2200 && uivalue < 2500) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl3').removeClass('cl4').removeClass('cl5').removeClass('cl7').removeClass('cl8')
		.addClass('cl6');
	}
	if(uivalue >= 2500 ) {
		sv.removeClass('cl1').removeClass('cl2').removeClass('cl3').removeClass('cl4').removeClass('cl5').removeClass('cl6').removeClass('cl8')
		.addClass('cl7');
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
	canvasTiles.setOpacity(opac);
}

function getColorscheme(c) {
    return c < 1000 ? '#709959;' :
           c < 1300 ? '#bbcc83;' :
           c < 1500 ? '#f2eaa0;' :
           c < 1800 ? '#f2d88f;' :
           c < 2200 ? '#e3b684;' :
           c < 2500 ? '#c7927d;' :
           c < 3000 ? '#e0b1b8;' :
                   '#fff2ff;';
}


/*

// maybe I can use this some day for a continuous color ramp

var colorramp = makeColorGradient(0,.3,.3,0,0,2); //2*Math.PI/3

function makeColorGradient(frequency1, frequency2, frequency3,phase1, phase2, phase3,center, width, len) {
    if (len == undefined) len = 256;

    var ramp = [];
    for (var i = 0; i < len; ++i){
    	var red =  i *20 + 0;
		var grn = -i *20 + 220 ;
        var blu = 20;
// or:
//		var red = Math.sin(frequency1*i + phase1) * width + center;
//		var grn = Math.sin(frequency2*i + phase2) * width + center;
//		var blu = Math.sin(frequency3*i + phase3) * width + center;

   		var c = RGB2Color(red,grn,blu);

   		// Note that &#9608; is a unicode character that makes a solid block
    	document.write('<div style="color:' + c + ';">&#9608; '+ c.toString() +'</div>');

   		ramp.push(c);
    }

    return ramp;
}

function RGB2Color(r,g,b){
	return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
	//return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function byte2Hex(n){
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

*/
