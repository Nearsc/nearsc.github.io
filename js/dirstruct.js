const cvmglr = 20;
const cvmgtb = 10;
const cvwidth = 650;
const cvheight = 40;
const stlinew = 10;
const textintx = 40;
const textinty = 20;
const tlint = 5;
var lastClick = 0;

function DirStruct () {
	// Properties
	this.dirs;					// Strings of directories
	this.ipdirs;				// Parent directory
	this.ncdirs;				// Number of child directories
	this.icdirh;				// Index of first child directory
	this.dpos;					// Position of each directory
	this.pdpos;
	this.dirlen;				// Text length of each directory in particular canvas
	this.uflev;					// Index of unfolding directories for each level

	// Methods
	this.initDirStruct = initDirStruct;
}

function initDirStruct (dsinfo, node) {
	// Read the directory structure information
	readDSInfo(dsinfo, this);

	// Show the directory structure through the chart
	createChart(node, this);
}

function readDSInfo (dsinfo, objds) {
	// Read the directory structure information through 'dsinfo'
	objdsinfo = document.getElementById(dsinfo);
	var fullstr = objdsinfo.innerHTML;
	var lines = fullstr.split("\n");

	// Arrange these directories
	var nlevel = 0;
	objds.dirs = new Array();
	objds.ipdirs = new Array();
	objds.dpos = new Array(2);
	objds.dpos[0] = new Array();
	objds.dpos[1] = new Array();
	objds.pdpos = new Array(2);
	objds.pdpos[0] = new Array();
	objds.pdpos[1] = new Array();
	objds.uflev = new Array();
	var lcount = new Array();
	for (var i = 0; i < lines.length; i++) {
		var trimline = lines[i].replace(/(^\s*)|(\s*$)/g, "");
		if (trimline !== "") {
			var clevel = trimline.slice(0, trimline.indexOf(":"));
			var content = trimline.slice(trimline.indexOf(":")+1);
			if (nlevel <= clevel) {
				objds.dirs[nlevel] = new Array();
				objds.ipdirs[nlevel] = new Array();
				objds.dpos[0][nlevel] = new Array();
				objds.dpos[1][nlevel] = new Array();
				objds.pdpos[0][nlevel] = new Array();
				objds.pdpos[1][nlevel] = new Array();
				lcount[nlevel] = 0;
				nlevel++;
			}
			objds.dirs[clevel][lcount[clevel]] = content;
			objds.ipdirs[clevel][lcount[clevel]] = lcount[clevel-1]-1;
			objds.dpos[0][clevel][lcount[clevel]] = -1;
			objds.dpos[1][clevel][lcount[clevel]] = -1;
			objds.pdpos[0][clevel][lcount[clevel]] = -1;
			objds.pdpos[1][clevel][lcount[clevel]] = -1;
			lcount[clevel]++;
		}
	}

	objds.ncdirs = new Array();
	objds.icdirh = new Array();
	for (var i = 0; i < objds.dirs.length; i++) {
		objds.ncdirs[i] = new Array();
		objds.icdirh[i] = new Array();
		for (var j = 0; j < objds.dirs[i].length; j++) {
			objds.ncdirs[i][j] = 0;
			objds.icdirh[i][j] = -1;
			if (objds.ipdirs[i][j] >= 0) {
				if (objds.icdirh[i-1][objds.ipdirs[i][j]] === -1) objds.icdirh[i-1][objds.ipdirs[i][j]] = j;
				objds.ncdirs[i-1][objds.ipdirs[i][j]]++;
			}
		}
	}
}

function createChart (node, objds) {
	// Create the chart for dirstruct
	var objnode = document.getElementById(node);

	var objcanvas = document.createElement("canvas");
	objnode.appendChild(objcanvas);

	objcanvas.width = cvwidth;
	objcanvas.height = cvheight;
	objcanvas.style.border = "1px solid #d3d3d3";
	objcanvas.style.backgroundColor = "#f1f1f1";

	var objctx = objcanvas.getContext("2d");
	objctx.font = "16px Comic Sans MS";
	objctx.textBaseline="middle";

	objds.dirlen = new Array();
	for (var i = 0; i < objds.dirs.length; i++) {
		objds.dirlen[i] = new Array();
		for (var j = 0; j < objds.dirs[i].length; j++) {
			objds.dirlen[i][j] = objctx.measureText(objds.dirs[i][j]).width;
		}
	}

	objds.dpos[0][0][0] = cvmglr + stlinew + tlint;
	objds.dpos[1][0][0] = cvmgtb*2;

	clearPos(objds);
	recvcP = calcPos(objds);
	objcanvas.height = recvcP.bottom + cvmgtb*2;
	updateChart(objds, objcanvas, recvcP, objcanvas.height);

	objcanvas.onclick = function () {
		var cvabsLeft = getAbsLoc(objcanvas).absoluteLeft;
		var cvabsTop = getAbsLoc(objcanvas).absoluteTop;
		if(Date.now() - lastClick < 700)
			return;
		lastClick = Date.now();
		for (var i = 0; i < objds.dirs.length; i++) {
			for (var j = 0; j < objds.dirs[i].length; j++) {
				if ((objds.dpos[0][i][j] !== -1) && (objds.dpos[1][i][j] !== -1 && (objds.ncdirs[i][j] !== 0))) {
					if ((event.pageX-cvabsLeft>=objds.dpos[0][i][j])&&(event.pageX-cvabsLeft<=objds.dpos[0][i][j]+objds.dirlen[i][j])&&
						(event.pageY-cvabsTop>=objds.dpos[1][i][j]-6)&&(event.pageY-cvabsTop<=objds.dpos[1][i][j]+8)) {
						if (i === objds.uflev.length)
							objds.uflev[i] = j;
						else if (i < objds.uflev.length) {
							if (j === objds.uflev[i])
								objds.uflev.splice(i);
							else {
								objds.uflev.splice(i);
								objds.uflev[i] = j;
							}
						}
						clearPos(objds);
						var recvcP = calcPos(objds);
						updateChart(objds, objcanvas, recvcP, objcanvas.height);
						return;
					}
				}
			}
		}
	}
}

async function updateChart (objds, objcanvas, recvcP, cvhBefore) {
	var objctx = objcanvas.getContext("2d");

	for (var r = 1; r <= 50; r++) {
		objctx.clearRect(0, 0, objcanvas.width, objcanvas.height);
		objcanvas.height = (recvcP.bottom+cvmgtb*2-cvhBefore)*r/50+cvhBefore;
		objctx.font = "16px Comic Sans MS";
		objctx.textBaseline="middle";
		objctx.fillStyle = "blue";
		objctx.lineWidth = 1;
		objctx.strokeStyle = "#CD5C5C";

		var newpos = new Array(2);
		newpos[0] = new Array();
		newpos[1] = new Array();

		// Print texts
		for (var i = 0; i < objds.dirs.length; i++) {
			newpos[0][i] = new Array();
			newpos[1][i] = new Array();
			for (var j = 0; j < objds.dirs[i].length; j++) {
				newpos[0][i][j] = -1;
				newpos[1][i][j] = -1;
				if ((objds.dpos[0][i][j] !== -1) && (objds.dpos[1][i][j] !== -1)) {
					if ((objds.pdpos[0][i][j] !== -1) && (objds.pdpos[1][i][j] !== -1)) {
						newpos[0][i][j] = (objds.dpos[0][i][j]-objds.pdpos[0][i][j])*r/50+objds.pdpos[0][i][j];
						newpos[1][i][j] = (objds.dpos[1][i][j]-objds.pdpos[1][i][j])*r/50+objds.pdpos[1][i][j];
						if (objds.ncdirs[i][j] === 0)
							objctx.fillStyle = "black";
						else
							objctx.fillStyle = "blue";
						objctx.fillText(objds.dirs[i][j], newpos[0][i][j], newpos[1][i][j]);
						objctx.beginPath();
						objctx.moveTo(newpos[0][i][j]-tlint, newpos[1][i][j]);
						objctx.lineTo(newpos[0][i][j]-stlinew-tlint, newpos[1][i][j]);
						objctx.stroke();
					}
				}
			}
		}

		// Draw branch lines
		if (objds.uflev.length > 0) {
			for (var i = 0; i < objds.uflev.length; i++) {
				if (objds.pdpos[0][i+1][objds.icdirh[i][objds.uflev[i]]] !== -1) {
					var p1x = newpos[0][i][objds.uflev[i]]+objds.dirlen[i][objds.uflev[i]]+tlint;
					var p1y = newpos[1][i][objds.uflev[i]];
					var p2x = newpos[0][i][objds.uflev[i]]+recvcP.maxlen[i]+textintx-tlint-stlinew;
					var p2y = newpos[1][i][objds.uflev[i]];
					objctx.beginPath();
					objctx.moveTo(p1x, p1y);
					objctx.lineTo(p2x, p2y);
					objctx.stroke();
		
					var p1x = newpos[0][i][objds.uflev[i]]+recvcP.maxlen[i]+textintx-tlint-stlinew;
					var p1y = newpos[1][i][objds.uflev[i]]-10*(objds.ncdirs[i][objds.uflev[i]]-1);
					var p2x = newpos[0][i][objds.uflev[i]]+recvcP.maxlen[i]+textintx-tlint-stlinew;
					var p2y = newpos[1][i][objds.uflev[i]]+(textinty-10)*(objds.ncdirs[i][objds.uflev[i]]-1);
					objctx.beginPath();
					objctx.moveTo(p1x, p1y);
					objctx.lineTo(p2x, p2y);
					objctx.stroke();
				}
			}
		}
		await sleep(5);
	}

	for (var r = 1; r <= 50; r++) {
		var ei = objds.uflev.length;
		if ((ei>0) && objds.pdpos[0][ei][objds.icdirh[ei-1][objds.uflev[ei-1]]] === -1)
			objctx.clearRect(objds.dpos[0][ei][objds.icdirh[ei-1][objds.uflev[ei-1]]]-stlinew-tlint-1, 0, recvcP.maxlen[i]+stlinew+tlint+1, objcanvas.height);
		objctx.globalAlpha = r/50;
		objctx.font = "16px Comic Sans MS";
		objctx.textBaseline="middle";
		objctx.fillStyle = "blue";
		objctx.lineWidth = 1;
		objctx.strokeStyle = "#CD5C5C";
		for (var i = 0; i < objds.dirs.length; i++) {
			for (var j = 0; j < objds.dirs[i].length; j++) {
				if ((objds.dpos[0][i][j] !== -1) && (objds.dpos[1][i][j] !== -1)) {
					if ((objds.pdpos[0][i][j] === -1) && (objds.pdpos[1][i][j] === -1)) {
						if (objds.ncdirs[i][j] === 0)
							objctx.fillStyle = "black";
						else
							objctx.fillStyle = "blue";
						objctx.fillText(objds.dirs[i][j], objds.dpos[0][i][j], objds.dpos[1][i][j]);
						objctx.beginPath();
						objctx.moveTo(objds.dpos[0][i][j]-tlint, objds.dpos[1][i][j]);
						objctx.lineTo(objds.dpos[0][i][j]-stlinew-tlint, objds.dpos[1][i][j]);
						objctx.stroke();
					}
				}
			}
		}

		if ((ei > 0) && (objds.pdpos[0][ei][objds.icdirh[ei-1][objds.uflev[ei-1]]] === -1))
			objctx.clearRect(objds.dpos[0][ei-1][objds.uflev[ei-1]]+objds.dirlen[ei-1][objds.uflev[ei-1]]+tlint-1, objds.dpos[1][ei-1][objds.uflev[ei-1]]-1, 
				recvcP.maxlen[ei-1]+textintx-objds.dirlen[ei-1][objds.uflev[ei-1]]-2*tlint-stlinew, 3);
		if (objds.uflev.length > 0) {
			for (var i = 0; i < objds.uflev.length; i++) {
				if (objds.pdpos[0][i+1][objds.icdirh[i][objds.uflev[i]]] === -1) {
					var p1x = objds.dpos[0][i][objds.uflev[i]]+objds.dirlen[i][objds.uflev[i]]+tlint;
					var p1y = objds.dpos[1][i][objds.uflev[i]];
					var p2x = objds.dpos[0][i][objds.uflev[i]]+recvcP.maxlen[i]+textintx-tlint-stlinew;
					var p2y = objds.dpos[1][i][objds.uflev[i]];
					objctx.beginPath();
					objctx.moveTo(p1x, p1y);
					objctx.lineTo(p2x, p2y);
					objctx.stroke();
		
					var p1x = objds.dpos[0][i][objds.uflev[i]]+recvcP.maxlen[i]+textintx-tlint-stlinew;
					var p1y = objds.dpos[1][i][objds.uflev[i]]-10*(objds.ncdirs[i][objds.uflev[i]]-1);
					var p2x = objds.dpos[0][i][objds.uflev[i]]+recvcP.maxlen[i]+textintx-tlint-stlinew;
					var p2y = objds.dpos[1][i][objds.uflev[i]]+(textinty-10)*(objds.ncdirs[i][objds.uflev[i]]-1);
					objctx.beginPath();
					objctx.moveTo(p1x, p1y);
					objctx.lineTo(p2x, p2y);
					objctx.stroke();
				}
			}
		}
		await sleep(5);
	}
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calcPos (objds) {
	// Initializing
	objds.dpos[0][0][0] = cvmglr + stlinew + tlint;
	objds.dpos[1][0][0] = cvmgtb*2;

	// Calculate position of each directory
	var maxlen = new Array(objds.uflev.length+1);
	var top = objds.dpos[1][0][0];
	var bottom = objds.dpos[1][0][0];
	var right = objds.dpos[0][0][0]+objds.dirlen[0][0];
	if (objds.uflev.length > 0) {
		for (var i = 0; i < objds.uflev.length; i++) {
			if (i === 0) maxlen[i] = objds.dirlen[i][objds.uflev[i]];
			maxlen[i+1] = 0;
			for (var j = objds.icdirh[i][objds.uflev[i]]; j < objds.icdirh[i][objds.uflev[i]]+objds.ncdirs[i][objds.uflev[i]]; j++) {
				objds.dpos[0][i+1][j] = objds.dpos[0][i][objds.uflev[i]] + maxlen[i] + textintx;
				objds.dpos[1][i+1][j] = objds.dpos[1][i][objds.uflev[i]] + textinty*(j-objds.icdirh[i][objds.uflev[i]])-10*(objds.ncdirs[i][objds.uflev[i]]-1);
				if (objds.dirlen[i+1][j] > maxlen[i+1]) maxlen[i+1] = objds.dirlen[i+1][j];
				if (objds.dpos[1][i+1][j] > bottom) bottom = objds.dpos[1][i+1][j];
				if (objds.dpos[1][i+1][j] < top) top = objds.dpos[1][i+1][j];
				if (objds.dpos[0][i+1][j]+objds.dirlen[i+1][j] > right) right = objds.dpos[0][i+1][j]+objds.dirlen[i+1][j];
			}
		}
	}

	// Position offset of each directory
	for (var i = 0; i < objds.dirs.length; i++) {
		for (var j = 0; j < objds.dirs[i].length; j++) {
			if ((objds.dpos[0][i][j] !== -1) && (objds.dpos[1][i][j] !== -1)) {
				objds.dpos[1][i][j] += (cvmgtb*2-top);
				if (right > cvwidth-cvmglr) objds.dpos[0][i][j] += (cvwidth-cvmglr-right);
				if (objds.dpos[1][i][j] > bottom) bottom = objds.dpos[1][i][j];
			}
		}
	}

	return {bottom: bottom, maxlen: maxlen};
}

function clearPos (objds) {
	// Store the last position of each directory
	for (var i = 0; i < objds.dirs.length; i++) {
		for (var j = 0; j < objds.dirs[i].length; j++) {
			objds.pdpos[0][i][j] = objds.dpos[0][i][j];
			objds.pdpos[1][i][j] = objds.dpos[1][i][j];
		}
	}

	// Clear the position of each directory
	for (var i = 0; i < objds.dirs.length; i++)
		for (var j = 0; j < objds.dirs[i].length; j++) {
			objds.dpos[0][i][j] = -1;
			objds.dpos[1][i][j] = -1;
		}
}

function getAbsLoc (element) {
	if (arguments.length !== 1 || element === null)
		return null;
	var elmt = element;
	var offsetTop = elmt.offsetTop;
	var offsetLeft = elmt.offsetLeft;
	var offsetWidth = elmt.offsetWidth;
	var offsetHeight = elmt.offsetHeight;
	while (elmt = elmt.offsetParent) {
		// add this judge
		if(elmt.style.position === 'absolute' || elmt.style.position === 'relative'
		||(elmt.style.overflow !== 'visible' && elmt.style.overflow !== '')) break;
		offsetTop += elmt.offsetTop;
		offsetLeft += elmt.offsetLeft;
	}
	return {absoluteTop: offsetTop, absoluteLeft: offsetLeft,
		offsetWidth: offsetWidth, offsetHeight: offsetHeight};
}
