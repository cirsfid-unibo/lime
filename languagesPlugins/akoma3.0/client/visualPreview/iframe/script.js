
var Preview = {
    start: start
};

function start (xml) {
    cloneDoc(xml);
    // Todo: test
    setTimeout(calculateLineNumbers, 0);
}

function cloneDoc (xml) {
    Preview.dom = $('.document')[0];
    var parser = new DOMParser();
    var dom = parser.parseFromString(xml, "text/xml");
    transform(dom, Preview.dom);
}

// Transform the input XML DOM in HTML and copy it to output. 
// Split text nodes in fragments.
function transform (input, output) {
    // Don't split in fragments inside the following tags
    var noSplitTags = ['num', 'heading', 'subheading'];
 
    switch (input.nodeType) {
    case 3: // Text
        var text = input.wholeText.trim();
        if(text) {
            var el = document.createElement('span');
            el.className = 'fragment';
            el.appendChild(document.createTextNode(text));
            output.appendChild(el);
        }
        break;
 
    case 9: // Document
    case 1: // Element
        var el = document.createElement('div');
        output.appendChild(el);
        el.className = input.nodeName;
        if (input.hasAttributes && input.hasAttributes())
            for (var i = 0; i < input.attributes.length; i++) {
                var name = input.attributes[i].name.replace('ndiff:', '');
                el.dataset[name] = input.attributes[i].value;
            }
 
        var children = input.childNodes;
        for (var i = 0; i < children.length; i++)
            transform(children[i], el);
        break;
 
    default:
        console.log('Unknown node type:', input.nodeType);
    }
};

function calculateLineNumbers () {
    getAllFragments()
        .sort(startingOrder)
        .filter(getOverlappingLinesFilter())
        .reduce(displayLineNumbers, 0);
}

function getAllFragments () {
    return $(Preview.dom).find('.body .fragment').map(function () {
        var top = $(this).offset().top,
            height = this.getBoundingClientRect().height;
        return {
            node: this,
            start: top,
            end: top + height,
            lines: countLines(this)
        }
    }).toArray();
}

function startingOrder (a, b) {
    return (a.start - b.start) || (b.end - a.end);
}

// Possible bug: this greedy algorithm assumes bigger elements are before
function getOverlappingLinesFilter () {
    var pos = 0;
    return function (fragment, index, fragments) {
        var res = fragment.start >= pos;
        pos = Math.max(pos, fragment.end);
        return res;
    }
}

// Return the number of lines the fragment spans.
function countLines (node) {
    var lineHeight = parseInt($(node).css('line-height'), 10),
        height = $(node).height();
    if (height != 0)
        return height/lineHeight + (height%lineHeight > 0);
    else
        return 1;
}

// Display line number every 5 lines
function displayLineNumbers (currentLine, fragment) {
    var N = 5;
    var step = $(fragment.node).height() / fragment.lines;

    for (var line = currentLine + 1; line <= currentLine + fragment.lines; line++) {
        if ((line % N) == 0) {
            var el = $('<div>' + line + '</div>');
            $('#lineNumbers').append(el);

            var offset = fragment.start + step * (line - currentLine -1);
            el.offset({
                top: offset
            });
        }
    }
    return currentLine + fragment.lines;
}

function highlight (fragment) {
    $(fragment.node).css('background-color', '#afa');
}

window.Preview = Preview;


$(document).ready(function () {
    function inIframe () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
    if (!inIframe())
        $.get('./example.xml', undefined, function (value) {
            Preview.start(value);
        }, 'text');
});