function addVisualizationLayouts() {
    if(isPrintMode()) {
        document.body.style.width = '595px';
        setTimeout(function () { window.print(); }, 100);
    }
    applySplits();
    applyJoins();
    //applyEqualCells();
    applyRenumbering();
}

function isPrintMode() {
    return !window.frameElement;
}

function applyRenumbering() {
    var equalCells = document.querySelectorAll("*[renumberingfrom]");
    for(var i = 0; i < equalCells.length; i++) {
        var firstCell = equalCells.item(i),
            equalId = firstCell.getAttribute("renumberingfrom");
            secondCell = document.querySelectorAll("*[renumberingto='"+equalId+"']").item(0);
        if(secondCell) {
            try {
                createWrapper(firstCell);
                createWrapper(secondCell);
                if(getPosInParent(firstCell) > getPosInParent(secondCell)) {
                    createRenumberingCellBox(secondCell, firstCell);    
                } else {
                    createRenumberingCellBox(firstCell, secondCell, true);
                }
                
            }catch(e){};
        }
    }
}

function applyEqualCells() {
    var equalCells = document.querySelectorAll("*[equalcell]:first-child");
    for(var i = 0; i < equalCells.length; i++) {
        var firstCell = equalCells.item(i),
            equalId = firstCell.getAttribute("equalcell");
            secondCell = document.querySelectorAll("*[equalcell='"+equalId+"']:last-of-type").item(0);
        if(secondCell) {
            try {
                createEqualCellBox(firstCell, secondCell);    
            }catch(e){};
        }
    }
}

function createWrapper(element) {
    if (element.childNodes.length > 1 || element.firstChild.nodeName == "SPAN") {
        var p = document.createElement("p");
        while(element.firstChild) {
            p.appendChild(element.firstChild);
        }
        element.appendChild(p);
    }
}

function createRenumberingCellBox(firstCell, secondCell, leftToRight) {
    var firstEl = firstCell.firstChild || firstCell,
        secondEl = secondCell.firstChild || secondCell,
        styleFist = window.getComputedStyle(firstEl), 
        widthF = parseInt(styleFist.getPropertyValue("width")), 
        heightF = parseInt(styleFist.getPropertyValue("height")), 
        styleSecond = window.getComputedStyle(secondEl), 
        widthS = parseInt(styleSecond.getPropertyValue("width")), 
        heightS = parseInt(styleSecond.getPropertyValue("height")), 
        firstPos = getPos(firstEl),
        secondPos = getPos(secondEl),
        boxX = firstPos.x+widthF,
        boxH = Math.max(heightS, heightF);

     var svgBoxSettings = {
        pos : {
            x : boxX,
            y : firstPos.y
        },
        size : {
            w : secondPos.x-boxX,
            h : boxH
        }
    };
    
    if(!isNaN(svgBoxSettings.pos.x) &&
        !isNaN(svgBoxSettings.pos.y) && 
        !isNaN(svgBoxSettings.size.w) && !isNaN(svgBoxSettings.size.h)) {
        var svgBox = createArrowsBox(svgBoxSettings);
        createRenumberingArrows(svgBox, svgBoxSettings, {
            pos : firstPos,
            size : {
                w : widthF,
                h : heightF
            }
        },{
            pos : secondPos,
            size : {
                w : widthS,
                h : heightS
            }
        }, leftToRight); 
    
        document.body.appendChild(svgBox);
    }
}

function createEqualCellBox(firstCell, secondCell) {
    var firstEl = firstCell.firstChild || firstCell,
        secondEl = secondCell.firstChild || secondCell,
        styleFist = window.getComputedStyle(firstEl), 
        widthF = parseInt(styleFist.getPropertyValue("width")), 
        heightF = parseInt(styleFist.getPropertyValue("height")), 
        styleSecond = window.getComputedStyle(secondEl), 
        widthS = parseInt(styleSecond.getPropertyValue("width")), 
        heightS = parseInt(styleSecond.getPropertyValue("height")), 
        firstPos = getPos(firstEl),
        secondPos = getPos(secondEl),
        boxX = firstPos.x+widthF,
        boxH = Math.max(heightS, heightF);
        
     var svgBoxSettings = {
        pos : {
            x : boxX,
            y : firstPos.y
        },
        size : {
            w : secondPos.x-boxX,
            h : boxH
        }
    };
    
    if(!isNaN(svgBoxSettings.pos.x) && 
        !isNaN(svgBoxSettings.pos.y) && 
        !isNaN(svgBoxSettings.size.w) && !isNaN(svgBoxSettings.size.h)) {
        var svgBox = createArrowsBox(svgBoxSettings);
        createEqualArrows(svgBox, svgBoxSettings, {
            pos : firstPos,
            size : {
                w : widthF,
                h : heightF
            }
        },{
            pos : secondPos,
            size : {
                w : widthS,
                h : heightS
            }
        }); 
    
        document.body.appendChild(svgBox);
    }
}

function applyJoins() {
    var joins = document.querySelectorAll("*[joined]");

    for (var i = 0; i < joins.length; i++) {
        var el = joins[i], td = getParentByName(el, "td");

        if (el.textContent == td.textContent)
            drawTdJoin(td);
        else
            drawElJoin(el, td);
    }
}

function drawTdJoin(td) {
    var targetElement = td.querySelector("*"),
        oppositeTdsBBox = getOppositeTdsBBox(td);

    drawArrows(targetElement, td, oppositeTdsBBox, createArrowsJoin);
}

function getOppositeTdsBBox(td) {
    var tds = getOppositeTds(td);

    return getNodesBBox(tds);
}

function drawElJoin(el, td) {
    var joinId = el.getAttribute('joined'),
        nodesToJoin = document.querySelectorAll("*[joininto='"+joinId+"']"),
        oppositeTdsBBox = getNodesBBox(nodesToJoin);

    drawArrows(el, td, oppositeTdsBBox, createArrowsJoin);
}

function drawTdSplit(td) {
    var targetElement = td.querySelector("*"),
    oppositeTdsBBox = getOppositeTdsBBox(td);

    drawArrows(targetElement, td, oppositeTdsBBox, createArrows);
}

function drawElSplit(el, td) {
    var splitId = el.getAttribute('tosplit'),
        nodesSplitted = document.querySelectorAll("*[splittedby='"+splitId+"']"),
        oppositeTdsBBox = getNodesBBox(nodesSplitted);

    drawArrows(el, td, oppositeTdsBBox, createArrows);
}

function drawArrows(el, td, oppositeTdsBBox, createArrowsFn) {
    var style = window.getComputedStyle(el), 
        width = parseInt(style.getPropertyValue("width")), 
        height = parseInt(style.getPropertyValue("height")), 
        pos = getPos(el),
        tdPosInParent = getPosInParent(td);

    if ( oppositeTdsBBox.size.h > height ) {
        el.style.height = oppositeTdsBBox.size.h;
    }

    var svgBoxSettings = {
        pos : {
            x : (tdPosInParent) ? oppositeTdsBBox.pos.x + oppositeTdsBBox.size.w: (pos.x + width),
            y : oppositeTdsBBox.pos.y
        },
        size : {
            w : (tdPosInParent) ? (pos.x - (oppositeTdsBBox.pos.x + oppositeTdsBBox.size.w)) : (oppositeTdsBBox.pos.x - (pos.x + width)),
            h : oppositeTdsBBox.size.h
        }
    };

    var svgBox = createArrowsBox(svgBoxSettings);
    createArrowsFn(svgBox, svgBoxSettings, {
        pos : pos,
        size : {
            w : width,
            h : height
        },
        direction: tdPosInParent
    }, oppositeTdsBBox);
    document.body.appendChild(svgBox);
}

function getNodesBBox(nodes) {
    var result = {}, sizesAndPos = [], minX, minY, totW = 0, totH = 0, prevYH;

    for (var i = 0; i < nodes.length; i++) {
        var targetEl = nodes[i];
        targetEl = (targetEl.nodeName.toLowerCase() == 'td' && targetEl.firstElementChild) ?
                        targetEl.firstElementChild : targetEl;

        var pos = getPos(targetEl),
            style = window.getComputedStyle(nodes[i]),
            size = {
                w : parseInt(style.getPropertyValue("width")),
                h : parseInt(style.getPropertyValue("height"))
            };

        minX = (!minX || pos.x < minX) ? pos.x : minX;
        minY = (!minY || pos.y < minY) ? pos.y : minY;

        totW = (!totW || size.w > totW) ? size.w : totW;

        totH += size.h;
        totH = (prevYH) ? totH + pos.y - prevYH : totH;
        sizesAndPos.push({
            node : nodes[i],
            pos : pos,
            size : size
        });
        prevYH = pos.y + size.h;
    }

    result.pos = {
        x : minX,
        y : minY
    };
    result.size = {
        w : totW,
        h : totH
    };
    result.elements = sizesAndPos;
    return result;
}

function applySplits() {
    var splitted = document.querySelectorAll("*[tosplit]");
    for (var i = 0; i < splitted.length; i++) {
        var el = splitted[i], td = getParentByName(el, "td");

        if (el.textContent == td.textContent)
            drawTdSplit(td);
        else
            drawElSplit(el, td);
    }
}

function getPos(el) {
    for (var lx = 0, ly = 0; el != null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {
        x : lx,
        y : ly
    };
}

function createSvg(width, height, style) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('style', style);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    return svg;
}

function createSvgElement(name, attributes) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attributes) {
        for (var i in attributes) {
            svg.setAttribute(i, attributes[i]);
        }
    }
    return svg;
}

function getPosInParent(node) {
    var parent = node.parentNode, iterNode = parent.firstElementChild, counter = 0;
    while (iterNode) {
        if (iterNode == node) {
            return counter;
        }
        iterNode = iterNode.nextElementSibling;
        counter++;
    }
    return null;
}

function getParentByName(node, name) {
    var iterNode = node.parentNode;
    name = name.toLowerCase();
    while (iterNode && iterNode.nodeName.toLowerCase() != name)
    iterNode = iterNode.parentNode;

    return (iterNode && iterNode.nodeName.toLowerCase() == name) ? iterNode : false;
}


function getOppositeTds(td) {
    var elements = [], trs = [], nTr = (td.getAttribute("rowspan")) ? parseInt(td.getAttribute("rowspan")) : 1, 
        iterTr = getParentByName(td, "tr"), tdPosInParent = getPosInParent(td);

    while (iterTr && trs.length < nTr) {
        trs.push(iterTr);
        iterTr = iterTr.nextElementSibling;
    }

    for (var i = 0; i < trs.length; i++) {
        var oppositeTd = trs[i].children.item(1 - tdPosInParent);
        if (oppositeTd) {
            elements.push(oppositeTd);
        } else if (trs[i].children.item(tdPosInParent)) {
            elements.push(trs[i].children.item(tdPosInParent));
        }
    }
    return elements;
}

function createArrowsBox(settings) {
    var svg = createSvg(settings.size.w, settings.size.h, "position:absolute; top: " + settings.pos.y + "; left: " + settings.pos.x + "; background-color:rgba(0,255,0,0);");
    var marker = createSvgElement("marker", {
        id : "triangle",
        viewBox : "0 0 10 10",
        refX : "0",
        refY : "5",
        markerUnits : "strokeWidth",
        markerWidth : "4",
        markerHeight : "3",
        orient : "auto"
    });
    var path = createSvgElement("path", {
        d : "M 0 0 L 10 5 L 0 10 z",
        style : "fill: #0000FF;"
    });

    marker.appendChild(path);
    svg.appendChild(marker);
    return svg;
}

function createArrows(box, boxSettings, td, oppositeTds) {
    var xPadding = 3, arrow,  tdLineY1, tdLineY2, middleTdY, tdLine, tdLineX;
    if(td.direction) {
        tdLineY1 = td.pos.y - boxSettings.pos.y; 
        tdLineY2 = tdLineY1 + td.size.h;
        middleTdY = tdLineY1 + td.size.h / 2;
        tdLineX = boxSettings.size.w - xPadding;
    } else {
        tdLineY1 = td.pos.y - boxSettings.pos.y; 
        tdLineY2 = tdLineY1 + td.size.h;
        middleTdY = tdLineY1 + td.size.h / 2;
        tdLineX = xPadding;
    }
    
    tdLine = createSvgElement("line", {
        x1 : tdLineX,
        y1 : tdLineY1,
        x2 : tdLineX,
        y2 : tdLineY2,
        stroke : "blue",
        "stroke-width" : "2"
    });
    box.appendChild(tdLine);
    
    for (var i = 0; i < oppositeTds.elements.length; i++) {
        var el = oppositeTds.elements[i], arrow, middleY, lineX;
        
        if(td.direction) {
            tdLineY1 = el.pos.y - boxSettings.pos.y;
            tdLineY2 = tdLineY1 + el.size.h;
            lineX =  xPadding;
        } else {
            tdLineY1 = el.pos.y - boxSettings.pos.y;
            tdLineY2 = tdLineY1 + el.size.h;   
            lineX =  boxSettings.size.w - xPadding;
        }
        
        tdLine = createSvgElement("line", {
            x1 : lineX,
            y1 : tdLineY1,
            x2 : lineX,
            y2 : tdLineY2,
            stroke : "blue",
            "stroke-width" : "2"
        });
        
        middleY = tdLineY1 + (el.size.h / 2);
        box.appendChild(tdLine);
        
        arrow = createSvgElement("line", {
            x1 : tdLineX,
            y1 : middleTdY,
            x2 : (td.direction) ? lineX + 5 : lineX - 5,
            y2 : middleY,
            stroke : "blue",
            "stroke-width" : "2",
            "marker-end" : "url(#triangle)"
        });
        box.appendChild(arrow);
    }
}


function createArrowsJoin(box, boxSettings, td, oppositeTds) {
    var xPadding = 3, arrow,  tdLineY1, tdLineY2, middleTdY, tdLine, tdLineX;
    if(td.direction) {
        tdLineY1 = td.pos.y - boxSettings.pos.y; 
        tdLineY2 = tdLineY1 + td.size.h;
        middleTdY = tdLineY1 + td.size.h / 2;
        tdLineX = boxSettings.size.w - xPadding;
    } else {
        tdLineY1 = td.pos.y - boxSettings.pos.y; 
        tdLineY2 = tdLineY1 + td.size.h;
        middleTdY = tdLineY1 + td.size.h / 2;
        tdLineX = xPadding;
    }
    
    tdLine = createSvgElement("line", {
        x1 : tdLineX,
        y1 : tdLineY1,
        x2 : tdLineX,
        y2 : tdLineY2,
        stroke : "blue",
        "stroke-width" : "2"
    });
    box.appendChild(tdLine);
    
    for (var i = 0; i < oppositeTds.elements.length; i++) {
        var el = oppositeTds.elements[i], arrow, middleY, lineX;
        
        if(td.direction) {
            tdLineY1 = el.pos.y - boxSettings.pos.y;
            tdLineY2 = tdLineY1 + el.size.h;
            lineX =  xPadding;
        } else {
            tdLineY1 = el.pos.y - boxSettings.pos.y;
            tdLineY2 = tdLineY1 + el.size.h;   
            lineX =  boxSettings.size.w - xPadding;
        }
        
        tdLine = createSvgElement("line", {
            x1 : lineX,
            y1 : tdLineY1,
            x2 : lineX,
            y2 : tdLineY2,
            stroke : "blue",
            "stroke-width" : "2"
        });
        
        middleY = tdLineY1 + (el.size.h / 2);
        box.appendChild(tdLine);
        
        arrow = createSvgElement("line", {
            x1 : lineX,
            y1 : middleY,
            x2 : (td.direction) ? tdLineX - 5  : tdLineX + 5,
            y2 : middleTdY+(i*xPadding*3),
            stroke : "blue",
            "stroke-width" : "2",
            "marker-end" : "url(#triangle)"
        });
        box.appendChild(arrow);
    }
}

function createEqualArrows(box, boxSettings, first, second) {
    var xPadding = 5, arrowPadding = 7, middleY;
    
    tdLine = createSvgElement("line", {
        x1 : xPadding,
        y1 : 0,
        x2 : xPadding,
        y2 : boxSettings.size.h,
        stroke : "blue",
        "stroke-width" : "2"
    });
    middleY = boxSettings.size.h / 2;
    tdLine2 = createSvgElement("line", {
        x1 : boxSettings.size.w-xPadding,
        y1 : 0,
        x2 : boxSettings.size.w-xPadding,
        y2 : boxSettings.size.h,
        stroke : "blue",
        "stroke-width" : "2"
    });
    box.appendChild(tdLine);
    box.appendChild(tdLine2);
    arrow = createSvgElement("line", {
            x1 : xPadding+arrowPadding,
            y1 : middleY,
            x2 : boxSettings.size.w-xPadding-arrowPadding,
            y2 : middleY,
            stroke : "blue",
            "stroke-width" : "2",
            "marker-end" : "url(#triangle)"
    });
    box.appendChild(arrow);
    arrow = createSvgElement("line", {
            x1 : boxSettings.size.w-xPadding-arrowPadding,
            y1 : middleY,
            x2 : xPadding+arrowPadding,
            y2 : middleY,
            stroke : "blue",
            "stroke-width" : "2",
            "marker-end" : "url(#triangle)"
    });
    box.appendChild(arrow);   
}

function createRenumberingArrows(box, boxSettings, first, second, leftToRight) {
    var xPadding = 5, arrowPadding = 7, middleY, arrowX1, arrowX2;
    
    if (leftToRight) {
        arrowX1 = xPadding+arrowPadding/2;
        arrowX2 = boxSettings.size.w-xPadding-arrowPadding;
    } else {
        arrowX1 = boxSettings.size.w-xPadding-(arrowPadding/2);
        arrowX2 = xPadding+arrowPadding;
    }
    
    tdLine = createSvgElement("line", {
        x1 : xPadding,
        y1 : 0,
        x2 : xPadding,
        y2 : boxSettings.size.h,
        stroke : "blue",
        "stroke-width" : "2"
    });
    middleY = boxSettings.size.h / 2;
    tdLine2 = createSvgElement("line", {
        x1 : boxSettings.size.w-xPadding,
        y1 : 0,
        x2 : boxSettings.size.w-xPadding,
        y2 : boxSettings.size.h,
        stroke : "blue",
        "stroke-width" : "2"
    });
    box.appendChild(tdLine);
    box.appendChild(tdLine2);
    
    arrow = createSvgElement("line", {
            x1 : arrowX1,
            y1 : middleY,
            x2 : arrowX2,
            y2 : middleY,
            stroke : "blue",
            "stroke-width" : "2",
            "marker-end" : "url(#triangle)"
    });
    box.appendChild(arrow);  
}

