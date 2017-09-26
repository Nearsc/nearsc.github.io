function nc_typhoon_nmc_cn () {
	// Properties
	this.years = new Array();
	this.typhoons = new Array();

	this.year;
	this.typhoon;

	// Methods
	this.initCrawler = initCrawler;
}

function initCrawler (node) {
	// Create UI
	createCrawlerUI(node, this);
}

function getTyphoonList (objseltyp, objcrawler) {
	// Clear the drop-down list for typhoons
	while (objseltyp.hasChildNodes())
		objseltyp.removeChild(objseltyp.firstChild);

	// Clear the identifiers for typhoons
	objcrawler.typhoons = new Array();

	// Request for information
	var recv = {};
	getFileContent("http://typhoon.nmc.cn/weatherservice/typhoon/jsons/list_"+objcrawler.year, recv);
	recv.content = recv.content.replace("typhoon_jsons_list_"+objcrawler.year, "").slice(1,-1);
	recv.info = JSON.parse(recv.content);

	// Extract needed information
	objcrawler.typhoon = recv.info.typhoonList[0][0];
	for (var i = 0; i < recv.info.typhoonList.length; i++) {
		objoption = document.createElement("option");
		objseltyp.add(objoption);

		objoption.value = recv.info.typhoonList[i][4]+" "+recv.info.typhoonList[i][2]+" "+recv.info.typhoonList[i][1];
		objoption.innerHTML = objoption.value;
		objcrawler.typhoons.push(recv.info.typhoonList[i][0]);
	}
}

function getTyphoonRecord (objtext, objcrawler) {
	// Clear the text
	objtext.innerHTML = "";

	// Request for information
	var recv = {};
	getFileContent("http://typhoon.nmc.cn/weatherservice/typhoon/jsons/view_"+objcrawler.typhoon, recv);
	recv.content = recv.content.replace("typhoon_jsons_view_"+objcrawler.typhoon, "").slice(1,-1);
	recv.info = JSON.parse(recv.content);

	// Extract needed information
	objtext.innerHTML += recv.info.typhoon[4]+" "+recv.info.typhoon[2]+" "+recv.info.typhoon[1]+"\n\n";
	objtext.innerHTML += "Number,UTC_Time,Longitude,Latitude,Pressure,Level\n";
	for (i=0; i<recv.info.typhoon[8].length; i++) {
		objtext.innerHTML += (i+1)+","+
			recv.info.typhoon[8][i][1]+","+
			recv.info.typhoon[8][i][4]+","+
			recv.info.typhoon[8][i][5]+","+
			recv.info.typhoon[8][i][6]+","+
			recv.info.typhoon[8][i][7]+"\n";
	}
}

function createCrawlerUI (node, objcrawler) {
	// Get the object of parent node
	var objnode = document.getElementById(node);

	// Create div 1
	var objdiv1 = document.createElement("div");
	objnode.appendChild(objdiv1);

	objdiv1.style.userSelect = "none";
	objdiv1.style.height = "40px";

	// Create the drop-down list for years
	var objselyear = document.createElement("select");
	objdiv1.appendChild(objselyear);

	objselyear.style.margin = "5px 5px 5px 5px";
	objselyear.style.height = "28px";
	objselyear.style.width = "60px";

	now = new Date();
	var thisyear = now.getFullYear();
	objcrawler.year = thisyear;
	for (var i = thisyear; i >= 1949; i--)
		objcrawler.years.push(i);
	
	for (var i = 0; i < objcrawler.years.length; i++) {
		objoption = document.createElement("option");
		objselyear.add(objoption);

		objoption.value = "" + objcrawler.years[i];
		objoption.innerHTML = objoption.value;
	}

	objselyear.onchange = function () {
		objcrawler.year = objcrawler.years[objselyear.selectedIndex];
		getTyphoonList(objseltyp, objcrawler);
	}

	// Create the drop-down list for typhoons
	var objseltyp = document.createElement("select");
	objdiv1.appendChild(objseltyp);

	objseltyp.style.margin = "5px 5px 5px 5px";
	objseltyp.style.height = "28px";
	objseltyp.style.width = "200px";
	objseltyp.style.position = "absolute";

	getTyphoonList(objseltyp, objcrawler);

	objseltyp.onchange = function () {
		objcrawler.typhoon = objcrawler.typhoons[objseltyp.selectedIndex];
	}

	// Create the submit button
	var objbuttsub = document.createElement("input");
	objdiv1.appendChild(objbuttsub);

	objbuttsub.style.margin = "5px 5px 5px 5px";
	objbuttsub.style.height = "28px";
	objbuttsub.style.position = "relative";
	objbuttsub.style.left = "210px";
	objbuttsub.style.textAlign = "center";
	objbuttsub.style.verticalAlign = "middle";
	objbuttsub.style.fontFamily = "Segoe Print, Arial";
	objbuttsub.style.fontWeight = "bold";
	objbuttsub.style.fontSize = "8pt";
	objbuttsub.type = "button";
	objbuttsub.value = "Submit";

	// Create div 2
	var objdiv2 = document.createElement("div");
	objnode.appendChild(objdiv2);

	// Create textarea
	var objtextarea = document.createElement("textarea");
	objdiv2.appendChild(objtextarea);

	objtextarea.style.margin = "5px 5px 5px 5px";
	objtextarea.style.width = "600px";
	objtextarea.style.height = "500px";
	objtextarea.readOnly = "readonly";
	objtextarea.style.resize = "none";
	objtextarea.wrap = "off";

	objbuttsub.onclick = function () {getTyphoonRecord(objtextarea, objcrawler);}
}

function getFileContent (url, objrecv) {
	// Check the explorer
	if (window.XMLHttpRequest)
	  var xmlhttp = new XMLHttpRequest();
	else
	  var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

	xmlhttp.onreadystatechange = function() {
	  if (this.readyState == 4 && this.status == 200) {
	    objrecv.content = this.responseText;
	  }
	};
	xmlhttp.open("GET", url, false);
	xmlhttp.send();
}