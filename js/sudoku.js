// Constant
const cblank = "#ffffff";
const chighlight = "#ced8ef";
const cselect = "#aec5f8";
const cemphasize = "#000099";
const cwrong = "#ffbfbf";

function Sudoku () {
	// Attributes
	//   Arrays
	this.tabPuzzle = new Array(9);
	for (var i = 0; i < this.tabPuzzle.length; i++)
		this.tabPuzzle[i] = new Array(9);
	this.tabSolution = new Array(9);
	for (var i = 0; i < this.tabSolution.length; i++)
		this.tabSolution[i] = new Array(9);
	this.tabCurrent = new Array(9);
	for (var i = 0; i < this.tabCurrent.length; i++)
		this.tabCurrent[i] = new Array(9);
	this.tabError = new Array(9);
	for (var i = 0; i < this.tabError.length; i++)
		this.tabError[i] = new Array(9); 

	//   Position
	this.curPosi = -1;
	this.curPosj = -1;

	//   State
	this.state = 0;				// 0: No sudoku created
								// 1: Sudoku has been created

	//   Nodes
	this.grid;					// The grid
	this.prompt;				// The prompt

	// Methods
	this.initSudoku = initSudoku;
	this.createSudoku = createSudoku;
	this.clearSudoku = clearSudoku;
	this.checkSudoku = checkSudoku;
	this.updateGrid = updateGrid;
	this.updatePos = updatePos;
	this.updateTab = updateTab;
	this.updatePrompt = updatePrompt;
}

function initSudoku(node, objsudoku) {
	// Initialize arrays
	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++) {
			this.tabPuzzle[i][j] = 0;
			this.tabSolution[i][j] = 0;
			this.tabCurrent[i][j] = 0;
			this.tabError[i][j] = 0;
		}

	// Create gird
	this.grid = createGrid(node, this.tabCurrent, objsudoku);

	// Create UI
	this.prompt = createSudokuUI(node, objsudoku);
}

function createSudoku (type) {
	// clear the last sudoku, if existed
	if (this.state == 1) this.clearSudoku();

	// Create a very hard sudoku
	switch (type) {
		case "veryHardSudoku":
			this.updatePrompt("vHS");
			veryHardSudoku(this.tabPuzzle, this.tabSolution, this.tabCurrent);
			break;
		case "verySimpleSudoku":
			this.updatePrompt("vSS");
			verySimpleSudoku(this.tabPuzzle, this.tabSolution, this.tabCurrent);
			break;
	}

	// Change the style of the grid
	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++)
			if (this.tabPuzzle[i][j] > 0) {
				var objtd = this.grid.childNodes[i].childNodes[j];
				objtd.style.fontWeight = "bold";
				objtd.style.color = cemphasize;
			}

	// Update the grid
	this.updateGrid();

	// Change the state
	this.state = 1;
}

function clearSudoku () {
	// clear the arrays
	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++) {
			this.tabPuzzle[i][j] = 0;
			this.tabSolution[i][j] = 0;
			this.tabCurrent[i][j] = 0;
			this.tabError[i][j] = 0;
		}

	// Change the style of the grid
	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++) {
			var objtd = this.grid.childNodes[i].childNodes[j];
			objtd.style.fontWeight = "";
			objtd.style.color = "";
			objtd.style.backgroundColor = "";
		}

	// Update the grid
	this.updateGrid();

	// Change the state
	this.state = 0;

	// Default prompt
	this.prompt.innerHTML = "Have fun!";
}

function checkSudoku () {
	// Check the error of the table
	var flag = 1;
	if (this.state == 1) {
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				this.tabError[i][j] = 0;
				var objtd = this.grid.childNodes[i].childNodes[j];
				objtd.style.backgroundColor = cblank;
				objtd.onmouseover = gridHighlight;
				objtd.onmouseout = gridHighlight;
				if ((this.tabCurrent[i][j] != 0) && (this.tabPuzzle[i][j] == 0))
					if (this.tabCurrent[i][j] != this.tabSolution[i][j]) {
						this.tabError[i][j] = 1;
						flag = 0;
						objtd.style.backgroundColor = cwrong;
						objtd.onmouseover = function(){};
						objtd.onmouseout = function(){};
					}
			}
		}
		this.updatePos([-1,-1]);
		if (flag == 1)
			this.updatePrompt("progress");
		else
			this.updatePrompt("wrong");
	}
}

function updateGrid () {
	// Update the content of each grid
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			var objtx = document.createTextNode(this.tabCurrent[i][j]==0?"":this.tabCurrent[i][j]);
			var objtd = this.grid.childNodes[i].childNodes[j];
			if (objtd.hasChildNodes())
				objtd.replaceChild(objtx,objtd.childNodes[0]);
			else
				objtd.appendChild(objtx);
		}
	}
}

function updatePos (posij) {
	// Restore the last grid
	if ((this.curPosi != -1) && (this.curPosj != -1)) {
		var objtd = this.grid.childNodes[this.curPosi].childNodes[this.curPosj];
		if (this.tabError[this.curPosi][this.curPosj] == 1) {
			objtd.style.backgroundColor = cwrong;
			objtd.onmouseover = function(){};
			objtd.onmouseout = function(){};
		}
		else {
			objtd.style.backgroundColor = cblank;
			objtd.onmouseover = gridHighlight;
			objtd.onmouseout = gridHighlight;
		}
	}

	// Update the position of current selected grid
	if ((this.curPosi == posij[0]) && (this.curPosj == posij[1])) {
		this.curPosi = -1;
		this.curPosj = -1;
	} else {
		this.curPosi = posij[0];
		this.curPosj = posij[1];
	}

	// Fill the selected grid
	if ((this.curPosi != -1) && (this.curPosj != -1)) {
		var objtd = this.grid.childNodes[this.curPosi].childNodes[this.curPosj];
		objtd.style.backgroundColor = cselect;
		objtd.onmouseover = function(){};
		objtd.onmouseout = function(){};
	}
}

function updateTab (number) {
	if ((this.state == 1) && (number != -1))
		if ((this.curPosi != -1) && (this.curPosj != -1))
			if (this.tabPuzzle[this.curPosi][this.curPosj] == 0) {
				this.tabCurrent[this.curPosi][this.curPosj] = number;
				this.updateGrid();
			}
}

function updatePrompt (option) {
	switch (option) {
		// Tells the number of unfilled grids
		case "progress":
			var count = 0;
			for (var i = 0; i < 9; i++)
				for (var j = 0; j < 9; j++)
					if (this.tabCurrent[i][j] == 0) count++;
			this.prompt.innerHTML = "You have " + count + " more numbers to fill!";
			break;
		case "wrong":
			this.prompt.innerHTML = "Something is wrong!";
			break;
		case "vHS":
			this.prompt.innerHTML = "One of the most difficult sudoku in the world!";
			break;
		case "vSS":
			this.prompt.innerHTML = "Maybe you want to try this simpler one";
			break;
		default:
			break;
	}
}

function createGrid (node, table, objsudoku) {
	// Create the grid for sudoku
	var objnode = document.getElementById(node);

	var objtable = document.createElement("table");
	objnode.appendChild(objtable);

	objtable.style.fontFamily = "Arial";
	objtable.style.fontSize = "16pt";
	objtable.style.fontWeight = "medium";
	objtable.style.color = "#000000";
	objtable.style.border = "2px solid #555555";
	objtable.style.margin = "0px";
	objtable.style.width = "482px";
	objtable.style.textAlign = "center";
	objtable.style.verticalAlign = "middle";
	objtable.style.cursor = "default";
	objtable.style.userSelect = "none";
	objtable.cellSpacing = "0";
	objtable.onselectstart = "return false;";
	objtable.oncontextmenu = "return false;";
	objtable.oncopy = "return false;";

	for (var i = 0; i < 9; i++) {
		var objtr = document.createElement("tr");
		objtable.appendChild(objtr);

		for (var j = 0; j < 9; j++) {
			var objtd = document.createElement("td");
			objtr.appendChild(objtd);

			if (i < 8)
				objtd.style.borderBottom = "1px solid #999999";
			if ((i == 2) || (i == 5))
				objtd.style.borderBottom = "2px solid #555555";
			if (j < 8)
				objtd.style.borderRight = "1px solid #999999";
			if ((j == 2) || (j == 5))
				objtd.style.borderRight = "2px solid #555555";

			objtd.style.width = "50px";
			objtd.style.height = "50px";
			objtd.style.margin = "0px";
			objtd.style.padding = "1px";
			objtd.style.textAlign = "center";
			objtd.style.verticalAlign = "middle";
			objtd.onmouseover = gridHighlight;
			objtd.onmouseout = gridHighlight;
			objtd.onclick = function () {var posij = gridSelect(event); objsudoku.updatePos(posij);};
		}
	}

	document.onkeypress = function () {var innum = inputNumber(event); objsudoku.updateTab(innum);};

	return objtable;
}

function gridHighlight (e) {
	// Highlight the grid when mouse moves
	if (!e) e = window.event;
	if (e.target) target = e.target;
	else target = e.srcElement;
	switch (e.type) {
		case "mouseover":
			e.target.style.backgroundColor = chighlight;
			break;
		case "mouseout":
			e.target.style.backgroundColor = cblank;
			break;
		default:
			break;
	}
}

function gridSelect(e) {
	// Highlight the grid when selected
	if (!e) e = window.event;
	if (e.target) target = e.target;
	else target = e.srcElement;

	var i = 0;
	var j = 0;

	var objtmp = target.parentNode;
	while(true) {
		if (objtmp.previousSibling) {
			objtmp = objtmp.previousSibling;
			i++;
		}
		else
			break;
	}

	var objtmp = target;
	while(true) {
		if (objtmp.previousSibling) {
			objtmp = objtmp.previousSibling;
			j++;
		}
		else
			break;
	}

	var posij = [i, j];
	return posij;
}

function inputNumber (e) {
	// Get the inputted number
	if (!e) e = window.event;
	if (e.target) target = e.target;
	else target = e.srcElement;

	if (e.which) keycode = e.which;
	else keycode = e.keyCode;

	if ((keycode >= 48) && (keycode <= 57))
		return keycode - 48;
	else
		return -1;
}

function veryHardSudoku (tabP, tabS, tabC) {
	// Create a very hard sudoku
	var vHStabPuz = [[8,0,0,0,0,0,0,0,0],
	                 [0,0,3,6,0,0,0,0,0],
	                 [0,7,0,0,9,0,2,0,0],
	                 [0,5,0,0,0,7,0,0,0],
	                 [0,0,0,0,4,5,7,0,0],
	                 [0,0,0,1,0,0,0,3,0],
	                 [0,0,1,0,0,0,0,6,8],
	                 [0,0,8,5,0,0,0,1,0],
	                 [0,9,0,0,0,0,4,0,0]];
	var vHStabSol = [[8,1,2,7,5,3,6,4,9],
	                 [9,4,3,6,8,2,1,7,5],
	                 [6,7,5,4,9,1,2,8,3],
	                 [1,5,4,2,3,7,8,9,6],
	                 [3,6,9,8,4,5,7,2,1],
	                 [2,8,7,1,6,9,5,3,4],
	                 [5,2,1,9,7,4,3,6,8],
	                 [4,3,8,5,2,6,9,1,7],
	                 [7,9,6,3,1,8,4,5,2]];

	// Initialize the tabPuzzle, tabSolution and tabCurrent
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			tabP[i][j] = vHStabPuz[i][j];
			tabS[i][j] = vHStabSol[i][j];
			tabC[i][j] = vHStabPuz[i][j];
		}
	}
}

function verySimpleSudoku (tabP, tabS, tabC) {
	// Create a very simple sudoku
	var vHStabPuz = [[0,0,0,0,0,8,5,0,0],
	                 [0,2,1,9,4,5,0,0,0],
	                 [3,5,4,0,0,0,9,0,8],
	                 [0,1,7,5,0,0,8,0,0],
	                 [0,0,0,8,2,4,0,0,0],
	                 [0,0,8,0,0,1,2,9,0],
	                 [7,0,6,0,0,0,1,3,5],
	                 [0,0,0,1,5,3,6,8,0],
	                 [0,0,5,7,0,0,0,0,0]];
	var vHStabSol = [[6,7,9,3,1,8,5,4,2],
	                 [8,2,1,9,4,5,3,7,6],
	                 [3,5,4,2,6,7,9,1,8],
	                 [2,1,7,5,3,9,8,6,4],
	                 [9,6,3,8,2,4,7,5,1],
	                 [5,4,8,6,7,1,2,9,3],
	                 [7,8,6,4,9,2,1,3,5],
	                 [4,9,2,1,5,3,6,8,7],
	                 [1,3,5,7,8,6,4,2,9]];

	// Initialize the tabPuzzle, tabSolution and tabCurrent
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			tabP[i][j] = vHStabPuz[i][j];
			tabS[i][j] = vHStabSol[i][j];
			tabC[i][j] = vHStabPuz[i][j];
		}
	}
}

function createSudokuUI (node, objsudoku) {
	// Create the buttons for UISudoku
	var objnode = document.getElementById(node);
	var objdiv = document.createElement("div");
	objnode.appendChild(objdiv);

	objdiv.style.margin = "0px";
	objdiv.style.position = "relative";
	objdiv.style.left = "485px";
	objdiv.style.top = "-150px";

	// Button for very hard sudoku
	var objbuttvHS = document.createElement("input");
	objdiv.appendChild(objbuttvHS);

	objbuttvHS.style.margin = "5px 0px 5px 0px";
	objbuttvHS.style.display = "block";
	objbuttvHS.style.width = "150px";
	objbuttvHS.style.height = "25px";
	objbuttvHS.style.textAlign = "center";
	objbuttvHS.style.verticalAlign = "middle";
	objbuttvHS.style.fontFamily = "Segoe Print, Arial";
	objbuttvHS.style.fontWeight = "bold";
	objbuttvHS.style.fontSize = "10pt";
	objbuttvHS.type = "button";
	objbuttvHS.value = "Super hard sudoku";
	objbuttvHS.onclick = function () {objsudoku.createSudoku("veryHardSudoku");};

	// Button for very simple sudoku
	var objbuttvSS = document.createElement("input");
	objdiv.appendChild(objbuttvSS);

	objbuttvSS.style.margin = "5px 0px 5px 0px";
	objbuttvSS.style.display = "block";
	objbuttvSS.style.width = "150px";
	objbuttvSS.style.height = "25px";
	objbuttvSS.style.textAlign = "center";
	objbuttvSS.style.verticalAlign = "middle";
	objbuttvSS.style.fontFamily = "Segoe Print, Arial";
	objbuttvSS.style.fontWeight = "bold";
	objbuttvSS.style.fontSize = "10pt";
	objbuttvSS.type = "button";
	objbuttvSS.value = "Super simple sudoku";
	objbuttvSS.onclick = function () {objsudoku.createSudoku("verySimpleSudoku");};

	// Button for random sudoku
	var objbuttrandS = document.createElement("input");
	objdiv.appendChild(objbuttrandS);

	objbuttrandS.style.margin = "5px 0px 5px 0px";
	objbuttrandS.style.display = "block";
	objbuttrandS.style.width = "150px";
	objbuttrandS.style.height = "25px";
	objbuttrandS.style.textAlign = "center";
	objbuttrandS.style.verticalAlign = "middle";
	objbuttrandS.style.fontFamily = "Segoe Print, Arial";
	objbuttrandS.style.fontWeight = "bold";
	objbuttrandS.style.fontSize = "10pt";
	objbuttrandS.type = "button";
	objbuttrandS.value = "Random sudoku";

	// Button for checking
	var objbuttcheck = document.createElement("input");
	objdiv.appendChild(objbuttcheck);

	objbuttcheck.style.margin = "5px 0px 5px 0px";
	objbuttcheck.style.display = "block";
	objbuttcheck.style.width = "150px";
	objbuttcheck.style.height = "25px";
	objbuttcheck.style.textAlign = "center";
	objbuttcheck.style.verticalAlign = "middle";
	objbuttcheck.style.fontFamily = "Segoe Print, Arial";
	objbuttcheck.style.fontWeight = "bold";
	objbuttcheck.style.fontSize = "10pt";
	objbuttcheck.type = "button";
	objbuttcheck.value = "Check";
	objbuttcheck.onclick = function () {objsudoku.checkSudoku();};

	// Button for clearing
	var objbuttclear = document.createElement("input");
	objdiv.appendChild(objbuttclear);

	objbuttclear.style.margin = "5px 0px 5px 0px";
	objbuttclear.style.display = "block";
	objbuttclear.style.width = "150px";
	objbuttclear.style.height = "25px";
	objbuttclear.style.textAlign = "center";
	objbuttclear.style.verticalAlign = "middle";
	objbuttclear.style.fontFamily = "Segoe Print, Arial";
	objbuttclear.style.fontWeight = "bold";
	objbuttclear.style.fontSize = "10pt";
	objbuttclear.type = "button";
	objbuttclear.value = "Clear";
	objbuttclear.onclick = function () {objsudoku.clearSudoku();};

	// Prompt
	var objtextprompt = document.createElement("p");
	objnode.appendChild(objtextprompt);
	objtextprompt.innerHTML = "Have fun!";

	objtextprompt.style.position = "relative";
	objtextprompt.style.top = "-150px";
	objtextprompt.style.color = "blue";
	objtextprompt.style.fontFamily = "Segoe Print, Arial";
	objtextprompt.style.fontSize = "16pt";
	objtextprompt.style.margin = "0px";

	return objtextprompt;
}
