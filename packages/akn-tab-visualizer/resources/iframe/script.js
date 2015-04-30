
var Preview = {
    start: start,
    setSize: setSize
};

function start (xml) {
    $('.document').empty();
    cloneDoc(xml);
    addLinkHandlers();
    // Todo: test
    setTimeout(addPages, 500);
    setInterval(renderLineNumbers, 2000);
    setSize('A4');
}

function addLinkHandlers () {
    $('.document .ref').click(function () {
        console.info('Opening', this.dataset.href);
        if (this.dataset.href) {
            window.open('http://akresolver.cs.unibo.it/akn' + this.dataset.href);
        }
    });
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

// Add pages to the document: take the first fragment every PAGE_SIZE
// pixels and add a span.pageBreak before it.
// Add some computations to set its css to start relative to the page instead of
// the parent element.
// Set the data-page attribute of each fragment with the relative page.
// Move every page break exactly PAGE_SIZE pixels after the last one, 
// thus making pages seam of the same height.
// Force document height to be a multiple of pages.
function addPages () {
    var PAGE_SIZE = 842,
        PAGE_START = 25 + 25;
        PAGE_BREAK_HEIGHT = 50,
        PAGE_BREAK_MARGIN_TOP = 50,
        PAGE_BREAK_MARGIN_BOTTOM = 100;
    console.log('addPages', $(Preview.dom).height());

    var pagePos = Preview.dom.querySelector('.akomaNtoso').getBoundingClientRect();
    var page = 0;
    console.info('pagePos.top', pagePos.top);

    // Detect fragments before which we should insert a page break
    var breakingFragments = [];
    getAllFragments().forEach(function (fragment) {
        var expectedBreak = pagePos.top 
            + (page+1) * (PAGE_SIZE - PAGE_BREAK_MARGIN_BOTTOM)
            - (page) * (PAGE_BREAK_MARGIN_TOP);
        if (fragment.start > expectedBreak) {
            page++;
            breakingFragments.push(fragment);
        }
        fragment.node.dataset.page = page;
    });
    // Make sure the whole document height is a multiple of PAGE_SIZE
    var totalSize = page * (PAGE_SIZE + PAGE_BREAK_HEIGHT) + PAGE_SIZE;
    $(Preview.dom.querySelector('.akomaNtoso')).css('height', totalSize+'px');

    // Insert pageBreaks
    breakingFragments.forEach(function (fragment) {
        // console.log('Adding page at', fragment.start, fragment.node);
        var node = fragment.node;
        while (node == node.parentNode.firstChild) {
            node = node.parentNode;
        }
        var eop = $('<span class="pageBreak"><span class="inner"/></span>')
        eop.insertBefore($(node));
        var pos = eop[0].getBoundingClientRect();

        eop.css('left', (pagePos.left - pos.left)+'px');
    });

    // Adjust pageBreak top css
    var breaks = Preview.dom.querySelectorAll('.pageBreak');
    for (var page = 0; page < breaks.length; page++) {
        var el = breaks[page];
        var pos = el.getBoundingClientRect();
        
        var adjustment = pos.top - pagePos.top 
            - (page * PAGE_BREAK_HEIGHT)
            // - (page * PAGE_BREAK_MARGIN)
            // - ((page+1) * PAGE_BREAK_MARGIN)
            - ((page+1) * PAGE_SIZE);
        console.info(page, pos.top, adjustment);
        $(el).css('top', (-adjustment)+'px');
    }
}

function renderLineNumbers () {
    if (!isRenderingNeeded()) return;
    $('#lineNumbers').empty();

    getAllFragments()
        .filter(getAfterFormulaFilter())
        .sort(startingOrder)
        .filter(getOverlappingLinesFilter())
        // .forEach(highlight);
        .reduce(groupByPage, [])
        .forEach(function (fragments) {
            fragments.reduce(displayLineNumbers, 0);
        });
}

var lastHeight = 0;
function isRenderingNeeded () {
    return lastHeight != (lastHeight = $(Preview.dom).height());
}

function getAllFragments () {
    return $(Preview.dom).find('.fragment').map(function () {
        var top = $(this).offset().top,
            height = this.getBoundingClientRect().height;
        return {
            node: this,
            start: top,
            end: top + height,
            lines: countLines(this),
            page: this.dataset.page
        }
    }).toArray();
}

function getAfterFormulaFilter () {
    var firstFormula = Preview.dom.querySelector('.formula'),
        firstFragment = Preview.dom.querySelector('.fragment'),
        firstDom = firstFormula || firstFragment,
        start = $(firstDom).offset().top;
    return function (fragment) {
        return fragment.start >= start;
    }
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
        return Math.ceil(height/lineHeight);
    else
        return 1;
}


function groupByPage (output, fragment) {
    var page = Preview.dom.dataset.size == 'A4' ? fragment.page : 0;
    if (page != undefined) {
        output[page] = output[page] || [];
        output[page].push(fragment);
    }
    return output;
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

function setSize (size) {
    Preview.dom.dataset.size = size;
    setTimeout(renderLineNumbers, 0);
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