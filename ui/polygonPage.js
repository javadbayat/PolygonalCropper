var imagePath = "";
var imageWidth = 0, imageHeight = 0;
var imageViewWidth = 0, imageViewHeight = 0;

var points = [];
var pointSelection = [];
var isEditing = false;

var jumpMode = false;
var drawingMode = 0;
var chunk = "";
var lastPointX = 0, lastPointY = 0;
var joint = null;

var keyLeft = 37, keyRight = 39, keyUp = 38, keyDown = 40;
var acute = Math.PI / 4;

Array.prototype.clear = function() {
    this.splice(0, this.length);
};

Array.prototype.remove = function(elem) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === elem) {
            this.splice(i, 1);
            return true;
        }
    }
    
    return false;
};

onload = function() {
    btnOpenImage.onclick = openImage;
    
    var args = parseCommandLine(app.commandLine);
    if ((args.length > 1) && (args[1] != "")) {
        imagePath = args[1];
        initPolygonPage();
    }
};

document.onselectstart = document.oncontextmenu = function() {
    var srcElem = event.srcElement;
    
    if ((srcElem.tagName.toLowerCase() == "input") && (srcElem.type.toLowerCase() == "text"))
        return true;
    
    if (srcElem.tagName.toLowerCase() == "textarea")
        return true;
    
    if (srcElem.tagName.toLowerCase() == "intbox")
        return true;
    
    return false;
};

function parseCommandLine(cl) {
    var power = false, temp = "";
    for (var i = 0; i < cl.length; i++) {
        var c = cl.charAt(i);

        if (c == '"')
            power = !power;
        else if (power && (c == " "))
            temp += "\0";
        else
            temp += c;
    }

    var result = temp.split(" ");
    for (var i = 0; i < result.length; i++)
        result[i] = result[i].replace(/\0/g, " ");

    return result;
}

function openImage() {
    imagePath = objDialogHelper.openfiledlgex("", "", "Images|*.gif;*.jpg;*.jpeg;*.jpe;*.jfif;*.png;*.tif;*.tiff;*.bmp;*.dib|All Files|*.*|", 0, "Select an image file");
    if (!imagePath)
        return;
    imagePath = imagePath.substr(0, imagePath.indexOf("\0"));
    
    initPolygonPage();
}

function initPolygonPage() {
    var imageFile = new ActiveXObject("WIA.ImageFile");
    imageFile.LoadFile(imagePath);
    imageWidth = imageViewWidth = imageFile.Width;
    imageHeight = imageViewHeight = imageFile.Height;
    
    startingPage.style.display = "none";
    polygonPage.style.display = "";
    
    onresize = adjustLayout;
    adjustLayout();
    
    userImage.src = imagePath;
    userImage.style.width = imageWidth + "px";
    userImage.style.height = imageHeight + "px";
    polygonCanvas.style.width = imageWidth + "px";
    polygonCanvas.style.height = imageHeight + "px";
    polygonCanvas.coordsize.X = imageWidth;
    polygonCanvas.coordsize.Y = imageHeight;
    
    document.onkeyup = keyHandler;
    document.onkeydown = nudgePoint;
    
    intImageZoom.onpropertychange = changeImageSize;
    intImageOpacity.onpropertychange = changeImageOpacity;
    btnFitImage.onclick = fitToWindow;
    
    divImageContainer.attachEvent("onmouseenter", showCursorPosition);
    divImageContainer.attachEvent("onmousemove", showCursorPosition);
    divImageContainer.attachEvent("onmouseleave", clearCursorPosition);
    
    btnAddPoint.onclick = addPoint;
    btnRemovePoint.onclick = removePoint;
    btnClearPolygon.onclick = clearPolygon;
    
    tblPolygonPoints.attachEvent("onclick", selectPoint);
    tblPolygonPoints.attachEvent("ondblclick", editCoordinate);
    cropPanel.attachEvent("onclick", clearPointSelection);
    statusBar.attachEvent("onclick", clearPointSelection);
    
    btnCrop.onclick = cropImage;
    
    canvasEnableDrawing();
}

function adjustLayout() {
    polygonPage.style.width = document.body.clientWidth;
    polygonPage.style.height = document.body.clientHeight;
    divImageContainer.parentNode.width = document.body.clientWidth - 260;
    divPolygonPointsContainer.style.height = cropPanel.offsetHeight - tblPolygonPointsActions.offsetHeight - btnCrop.offsetHeight - 20;
}

function changeImageSize() {
    if (event.propertyName != "value")
        return;
    
    var percent = this.value / 100;
    imageViewWidth = Math.floor(imageWidth * percent);
    imageViewHeight = Math.floor(imageHeight * percent);
    userImage.style.width = imageViewWidth + "px";
    userImage.style.height = imageViewHeight + "px";
    
    polygonCanvas.style.width = imageViewWidth + "px";
    polygonCanvas.style.height = imageViewHeight + "px";
    polygonCanvas.coordsize.X = imageViewWidth;
    polygonCanvas.coordsize.Y = imageViewHeight;
    canvasDisplayPolygon();
}

function changeImageOpacity() {
    if (event.propertyName != "value")
        return;
    
    userImage.filters[0].Opacity = this.value / 100;
}

function fitToWindow() {
    var maxWidth = divImageContainer.offsetWidth - 30;
    if (imageWidth > maxWidth)
        intImageZoom.value = Math.floor(maxWidth / imageWidth * 100);
    else
        intImageZoom.value = 100;
}

function realX(x) {
    return Math.floor(x * imageWidth / imageViewWidth);
}

function realY(y) {
    return Math.floor(y * imageHeight / imageViewHeight);
}

function viewX(x) {
    return Math.floor(x * imageViewWidth / imageWidth);
}

function viewY(y) {
    return Math.floor(y * imageViewHeight / imageHeight);
}

function showCursorPosition() {
    if (event.srcElement === divImageContainer) {
        clearCursorPosition();
        return;
    }
    
    var rect = userImage.getBoundingClientRect();
    var cursorX = realX(event.x - rect.left);
    var cursorY = realY(event.y - rect.top);
    spnCursorPosition.innerText = cursorX + ", " + cursorY + "px";
}

function clearCursorPosition() {
    spnCursorPosition.innerText = "";
}

function addPoint() {
    if (drawingMode == 2)
        return;
    
    var point = new Object;
    point.x = Math.floor(imageWidth / 2);
    point.y = Math.floor(imageHeight / 2);
    points.push(point);
    
    var row = tblPolygonPoints.insertRow();
    var cell = row.insertCell();
    cell.innerText = points.length;
    cell = row.insertCell();
    cell.innerText = point.x;
    cell = row.insertCell();
    cell.innerText = point.y;
    
    btnClearPolygon.disabled = false;
    canvasDisplayPolygon();
    canvasDisableDrawing();
    
    if (!event.ctrlKey) {
        row.click();
        row.scrollIntoView();
    }
    event.cancelBubble = true;
}

function clearPointSelection() {
    for (var i = 0; i < pointSelection.length; i++) {
        pointSelection[i].bgColor = "";
        pointSelection[i].exp_selected = false;
        pointSelection[i].exp_dot.removeNode();
        pointSelection[i].exp_dot = null;
    }
    
    pointSelection.clear();
    btnRemovePoint.disabled = true;
    canvasDisableJump();
}

function selectPoint() {
    if (drawingMode == 2)
        return;
    
    var row = event.srcElement;
    if (row.tagName.toLowerCase() == "td")
        row = row.parentElement;
    
    if (row.tagName.toLowerCase() != "tr")
        return;
    
    if (!row.rowIndex)
        return;
    
    if (event.ctrlKey) {
        if (row.exp_selected) {
            row.bgColor = "";
            row.exp_selected = false;
            row.exp_dot.removeNode();
            row.exp_dot = null;
            pointSelection.remove(row);
            
            if (!pointSelection.length)
                btnRemovePoint.disabled = true;
        }
        else {
            row.bgColor = "highlight";
            row.exp_selected = true;
            pointSelection.push(row);
            canvasPutDot(row);
            btnRemovePoint.disabled = false;
        }
        
        if (pointSelection.length == 1)
            canvasEnableJump();
        else
            canvasDisableJump();
    }
    else {
        clearPointSelection();
        row.bgColor = "highlight";
        row.exp_selected = true;
        pointSelection.push(row);
        canvasPutDot(row);
        canvasEnableJump();
        btnRemovePoint.disabled = false;
    }
    
    event.cancelBubble = true;
}

function removePoint() {
    if (drawingMode == 2)
        return;
    
    for (var i = 0; i < pointSelection.length; i++) {
        points.splice(pointSelection[i].rowIndex - 1, 1);
        pointSelection[i].exp_dot.removeNode();
        pointSelection[i].removeNode(true);
    }
    
    for (var i = 1; i <= points.length; i++)
        tblPolygonPoints.rows[i].cells[0].innerText = i;
    
    pointSelection.clear();
    this.disabled = true;
    canvasDisplayPolygon();
    canvasDisableJump();
    
    if (!points.length) {
        btnClearPolygon.disabled = true;
        canvasEnableDrawing();
    }
    
    event.cancelBubble = true;
}

function clearPolygon() {
    if (drawingMode == 2)
        return;
    
    for (var i = 0; i < pointSelection.length; i++)
        pointSelection[i].exp_dot.removeNode();
    
    while (tblPolygonPoints.rows.length != 1)
        tblPolygonPoints.deleteRow();
    
    points.clear();
    pointSelection.clear();
    canvasDisplayPolygon();
    
    this.disabled = true;
    btnRemovePoint.disabled = true;
    canvasDisableJump();
    canvasEnableDrawing();
    
    event.cancelBubble = true;
}

function editCoordinate() {
    if (drawingMode == 2)
        return;
    
    var cell = event.srcElement;
    if (cell.tagName.toLowerCase() != "td")
        return;
    
    if (!cell.cellIndex)
        return;
    
    var row = cell.parentElement;
    clearPointSelection();
    row.bgColor = "highlight";
    row.exp_selected = true;
    pointSelection.push(row);
    canvasPutDot(row);
    btnRemovePoint.disabled = false;
    
    var field = document.createElement("input");
    field.type = "text";
    field.value = cell.innerText;
    field.style.width = 60;
    field.onblur = field.onkeyup = applyCoordinate;
    field.onclick = new Function("event.cancelBubble = true;");
    field.exp_point = points[row.rowIndex - 1];
    
    cell.innerText = "";
    cell.appendChild(field);
    field.select();
    
    isEditing = true;
}

function applyCoordinate() {
    if ((event.type == "keyup") && (event.keyCode != 13))
        return;
    
    var cell = this.parentElement;
    var point = this.exp_point;
    var oldValue = (cell.cellIndex == 1) ? point.x : point.y;
    
    var newValue = Number(this.value);
    if (isNaN(newValue) || (newValue < 0))
        newValue = oldValue;
    else if ((cell.cellIndex == 1) && (newValue > imageWidth))
        newValue = oldValue;
    else if (newValue > imageHeight)
        newValue = oldValue;
    
    if (cell.cellIndex == 1)
        point.x = newValue;
    else
        point.y = newValue;
    
    cell.innerText = newValue;
    
    if (newValue != oldValue) {
        canvasDisplayPolygon();
        canvasSetDotPosition(cell.parentElement.exp_dot, point);
    }
    
    canvasEnableJump();
    isEditing = false;
}

function canvasDisplayPolygon() {
    if (!points.length) {
        polygonCanvas.path = "m 0,0 e";
        return;
    }
    
    var polygonPath = "m ";
    polygonPath += viewX(points[0].x);
    polygonPath += "," + viewY(points[0].y);
    
    for (var i = 1; i < points.length; i++) {
        polygonPath += (i == 1) ? " l " : ", ";
        polygonPath += viewX(points[i].x);
        polygonPath += "," + viewY(points[i].y);
    }
    
    polygonPath += " x e";
    polygonCanvas.path = polygonPath;
}

function canvasPutDot(row) {
    var dot = document.createElement("v:rect");
    dot.fillcolor = "blue";
    dot.stroked = 0;
    dot.style.position = "absolute";
    dot.style.width = dot.style.height = "4px";
    row.exp_dot = divImageContainer.appendChild(dot);
    
    var point = points[row.rowIndex - 1];
    canvasSetDotPosition(dot, point);
}

function canvasSetDotPosition(dot, point) {
    dot.style.left = viewX(point.x) - 2 + "px";
    dot.style.top = viewY(point.y) - 2 + "px";
}

function keyHandler() {
    if (isEditing)
        return;
    
    switch (event.keyCode) {
    case 68 :
        if (event.shiftKey)
            btnAddPoint.click();
        break;
    case 46 :
        btnRemovePoint.click();
        break;
    case 67 :
        if (event.ctrlKey)
            btnClearPolygon.click();
        break;
    case 65 :
        if (event.ctrlKey)
            selectAllPoints();
        break;
    case 73 :
        if (event.ctrlKey)
            inversePointSelection();
        break;
    }
}

function selectAllPoints() {
    for (var i = 1; i <= points.length; i++) {
        var row = tblPolygonPoints.rows[i];
        if (!row.exp_selected) {
            row.bgColor = "highlight";
            row.exp_selected = true;
            pointSelection.push(row);
            canvasPutDot(row);
        }
    }
    
    if (points.length)
        btnRemovePoint.disabled = false;
    
    if (points.length == 1)
        canvasEnableJump();
    else
        canvasDisableJump();
    
    tblPolygonPoints.focus();
}

function inversePointSelection() {
    pointSelection.clear();
    
    for (var i = 1; i <= points.length; i++) {
        var row = tblPolygonPoints.rows[i];
        if (row.exp_selected) {
            row.bgColor = "";
            row.exp_selected = false;
            row.exp_dot.removeNode();
            row.exp_dot = null;
        }
        else {
            row.bgColor = "highlight";
            row.exp_selected = true;
            pointSelection.push(row);
            canvasPutDot(row);
        }
    }
    
    btnRemovePoint.disabled = !pointSelection.length;
    
    if (pointSelection.length == 1)
        canvasEnableJump();
    else
        canvasDisableJump();
    
    tblPolygonPoints.focus();
}

function nudgePoint() {
    if (isEditing)
        return;
    
    switch (event.keyCode) {
    case keyLeft :
        nudgePointLeft();
        break;
    case keyRight :
        nudgePointRight();
        break;
    case keyUp :
        nudgePointUp();
        break;
    case keyDown :
        nudgePointDown();
        break;
    default :
        return;
    }
    
    if (pointSelection.length)
        canvasDisplayPolygon();
}

function nudgePointLeft() {
    for (var i = 0; i < pointSelection.length; i++) {
        var row = pointSelection[i];
        var point = points[row.rowIndex - 1];
        if (!point.x)
            return;
    }
    
    for (var i = 0; i < pointSelection.length; i++) {
        var row = pointSelection[i];
        var point = points[row.rowIndex - 1];
        row.cells[1].innerText = --point.x;
        canvasSetDotPosition(row.exp_dot, point);
    }
}

function nudgePointUp() {
    for (var i = 0; i < pointSelection.length; i++) {
        var row = pointSelection[i];
        var point = points[row.rowIndex - 1];
        if (!point.y)
            return;
    }
    
    for (var i = 0; i < pointSelection.length; i++) {
        var row = pointSelection[i];
        var point = points[row.rowIndex - 1];
        row.cells[2].innerText = --point.y;
        canvasSetDotPosition(row.exp_dot, point);
    }
}

function nudgePointRight() {
    for (var i = 0; i < pointSelection.length; i++) {
        var row = pointSelection[i];
        var point = points[row.rowIndex - 1];
        if (point.x == imageWidth)
            return;
    }
    
    for (var i = 0; i < pointSelection.length; i++) {
        var row = pointSelection[i];
        var point = points[row.rowIndex - 1];
        row.cells[1].innerText = ++point.x;
        canvasSetDotPosition(row.exp_dot, point);
    }
}

function nudgePointDown() {
    for (var i = 0; i < pointSelection.length; i++) {
        var row = pointSelection[i];
        var point = points[row.rowIndex - 1];
        if (point.y == imageHeight)
            return;
    }
    
    for (var i = 0; i < pointSelection.length; i++) {
        var row = pointSelection[i];
        var point = points[row.rowIndex - 1];
        row.cells[2].innerText = ++point.y;
        canvasSetDotPosition(row.exp_dot, point);
    }
}

function canvasEnableJump() {
    if (!jumpMode) {
        divImageContainer.style.cursor = "crosshair";
        divImageContainer.attachEvent("onclick", canvasJumpPoint);
        jumpMode = true;
    }
}

function canvasDisableJump() {
    if (jumpMode) {
        divImageContainer.style.cursor = "";
        divImageContainer.detachEvent("onclick", canvasJumpPoint);
        jumpMode = false;
    }
}

function canvasJumpPoint() {
    if (isEditing)
        return;
    
    if (event.srcElement === divImageContainer)
        return;
    
    var rect = userImage.getBoundingClientRect();
    var cursorX = realX(event.x - rect.left);
    var cursorY = realY(event.y - rect.top);
    
    var row = pointSelection[0];
    var point = points[row.rowIndex - 1];
    row.cells[1].innerText = point.x = cursorX;
    row.cells[2].innerText = point.y = cursorY;
    canvasSetDotPosition(row.exp_dot, point);
    canvasDisplayPolygon();
}

function canvasEnableDrawing() {
    if (!drawingMode) {
        divImageContainer.style.cursor = "crosshair";
        divImageContainer.attachEvent("onclick", canvasPutFirstPoint);
        divImageContainer.attachEvent("ondblclick", canvasEndDrawing);
        drawingMode = 1;
    }
}

function canvasDisableDrawing() {
    if (drawingMode) {
        divImageContainer.detachEvent("onclick", canvasPutFirstPoint);
        divImageContainer.detachEvent("onclick", canvasPutNextPoint);
        divImageContainer.detachEvent("onmousemove", canvasDraw);
        divImageContainer.detachEvent("ondblclick", canvasEndDrawing);
        divImageContainer.style.cursor = "";
        document.onkeyup = keyHandler;
        drawingMode = 0;
    }
}

function canvasPutFirstPoint() {
    if (event.srcElement === divImageContainer)
        return;
    
    cropPanel.disabled = true;
    intImageZoom.cdisabled = true;
    btnFitImage.disabled = true;
    
    divImageContainer.detachEvent("onclick", canvasPutFirstPoint);
    divImageContainer.attachEvent("onclick", canvasPutNextPoint);
    divImageContainer.attachEvent("onmousemove", canvasDraw);
    document.onkeyup = canvasKeyHandler;
    
    var rect = userImage.getBoundingClientRect();
    var cursorX = event.x - rect.left;
    var cursorY = event.y - rect.top;
    
    polygonCanvas.path = "m " + cursorX + "," + cursorY + " e";
    chunk = "m " + cursorX + "," + cursorY + " l ";
    
    var point = new Object;
    point.x = realX(cursorX);
    point.y = realY(cursorY);
    points.push(point);
    
    var row = tblPolygonPoints.insertRow();
    var cell = row.insertCell();
    cell.innerText = points.length;
    cell = row.insertCell();
    cell.innerText = point.x;
    cell = row.insertCell();
    cell.innerText = point.y;
    
    drawingMode = 2;
    lastPointX = cursorX;
    lastPointY = cursorY;
}

function canvasDraw() {
    if (event.srcElement === divImageContainer)
        return;
    
    var rect = userImage.getBoundingClientRect();
    var cursorX = event.x - rect.left;
    var cursorY = event.y - rect.top;
    
    if (event.shiftKey) {
        var a = cursorX - lastPointX;
        var b = lastPointY - cursorY;
        var theta = Math.atan(b / a);
        if ((-acute < theta) && (theta < acute))
            cursorY = lastPointY;
        else
            cursorX = lastPointX;
    }
    
    polygonCanvas.path = chunk + cursorX + "," + cursorY + " e";
}

function canvasPutNextPoint() {
    if (event.srcElement === divImageContainer)
        return;
    
    var rect = userImage.getBoundingClientRect();
    var cursorX = event.x - rect.left;
    var cursorY = event.y - rect.top;
    
    if (event.shiftKey) {
        var a = cursorX - lastPointX;
        var b = lastPointY - cursorY;
        var theta = Math.atan(b / a);
        if ((-acute < theta) && (theta < acute))
            cursorY = lastPointY;
        else
            cursorX = lastPointX;
    }

    polygonCanvas.path = chunk + cursorX + "," + cursorY + " e";
    chunk += cursorX + "," + cursorY + ", ";
    
    var point = new Object;
    point.x = realX(cursorX);
    point.y = realY(cursorY);
    points.push(point);
    
    var row = tblPolygonPoints.insertRow();
    var cell = row.insertCell();
    cell.innerText = points.length;
    cell = row.insertCell();
    cell.innerText = point.x;
    cell = row.insertCell();
    cell.innerText = point.y;
    
    if (!joint) {
        joint = document.createElement("v:rect");
        joint.stroked = 0;
        joint.style.filter = "progid:DXImageTransform.Microsoft.BasicImage( opacity=0 )";
        joint.style.cursor = "url('ui\\joint.cur')";
        joint.style.position = "absolute";
        joint.style.width = joint.style.height = "10px";
        joint.style.left = lastPointX - 5 + "px";
        joint.style.top = lastPointY - 5 + "px";
        joint.onclick = function() {
            canvasEndDrawing();
            event.cancelBubble = true;
        };
        divImageContainer.appendChild(joint);
    }
    
    lastPointX = cursorX;
    lastPointY = cursorY;
}

function canvasEndDrawing() {
    if ((event.type == "dblclick") && (event.srcElement === divImageContainer))
        return;
    
    canvasDisplayPolygon();
    canvasDisableDrawing();
    
    if (joint) {
        joint.removeNode();
        joint = null;
    }
    
    btnFitImage.disabled = false;
    intImageZoom.cdisabled = false;
    cropPanel.disabled = false;
    btnClearPolygon.disabled = false;
    
    selectAllPoints();
}

function canvasKeyHandler() {
    switch (event.keyCode) {
    case 13 :
        canvasEndDrawing();
        break;
    case 27 :
        canvasDiscardDrawing();
        break;
    }
}

function canvasDiscardDrawing() {
    polygonCanvas.path = "m 0,0 e";
    
    while (tblPolygonPoints.rows.length != 1)
        tblPolygonPoints.deleteRow();
    
    points.clear();
    
    if (joint) {
        joint.removeNode();
        joint = null;
    }
    
    divImageContainer.detachEvent("onclick", canvasPutNextPoint);
    divImageContainer.attachEvent("onclick", canvasPutFirstPoint);
    divImageContainer.detachEvent("onmousemove", canvasDraw);
    document.onkeyup = keyHandler;
    
    btnFitImage.disabled = false;
    intImageZoom.cdisabled = false;
    cropPanel.disabled = false;
    
    drawingMode = 1;
}

function cropImage() {
    if (drawingMode == 2)
        return;
    
    event.cancelBubble = true;
    
    if (points.length < 3) {
        alert("Cropping requires a polygon with at least 3 vertices.");
        return;
    }
    
    onresize = null;
    document.onkeydown = null;
    document.onkeyup = null;
    polygonPage.style.display = "none";
    
    initiatePolygonalCrop(imagePath, points);
}