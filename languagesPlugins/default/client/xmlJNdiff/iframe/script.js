
var JNDiff = {
    start: start,
    save: save,
    getCount: getCount,
    accept: accept,
    reject: reject,
    reset: reset,
    getStatus: getStatus,
    focus: focus
};

function start (original, modified) {
    JNDiff.originalDom = $('.document.original')[0];
    JNDiff.modifiedDom = $('.document.modified')[0];

    var parser = new DOMParser();

    transform(parser.parseFromString(original, "text/xml"), JNDiff.originalDom);
        
    $.post('/lime-dev/php/JNxmlDiff/', {
        source1: original,
        source2: modified
    }, function (xmlDiff) {
        // Hack alert: namespaces are hard/impossible to use from Css/Js
        // we brutally replace them with a prefix.
        xmlDiff = xmlDiff.replace(/ndiff:/g, 'ndiff_');
        transform(parser.parseFromString(xmlDiff, "text/xml"), JNDiff.modifiedDom);
        setupModifications();
    }, 'text');
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
            output.appendChild(document.createTextNode(text));
        }
        break;

    case 9: // Document
    case 1: // Element
        var el = document.createElement('div');
        output.appendChild(el);
        el.className = input.nodeName;
        if (input.hasAttributes && input.hasAttributes())
            for (var i = 0; i < input.attributes.length; i++) {
                var name = input.attributes[i].name;
                el.dataset[name] = input.attributes[i].value;
            }

        var children = input.childNodes;
        for (var i = 0; i < children.length; i++)
            transform(children[i], el);
        break;

    default:
        console.log('Unknown node type:', input.nodeType);
    }
}

function setupModifications () {
    // console.log('setupModifications', JNDiff, modified);
    JNDiff.count = 0;
    console.info('Searching for modifications..')
    $(JNDiff.modifiedDom)
        .find('.body')
        .find('.ndiff_editing, *[data-ndiff_status]:not([data-ndiff_status="modified"])')
        .each(function (i, el) {
            JNDiff.count++;
            el.dataset.jndiff_id = i;
        });
}

// Output Xml string of AkomaNtoso with passive modifications for accepted
// modifications
function save () {
    var output = '';
    console.log('SAVE');
    return output;
}

function getCount () {
    return JNDiff.count || 16;
}

// Accept the -nth modification
function accept (n) {
    console.info('accepting', n)
    getModification(n).dataset.jndiff_status = 'accepted';
}

// Reject the -nth modification
function reject (n) {
    console.info('rejecting', n)
    getModification(n).dataset.jndiff_status = 'rejected';
}

// Set the -nth modification as pending
function reset (n) {
    console.info('resetting', n)
    getModification(n).dataset.jndiff_status = '';
}

// Get the -nth modification status ('accepted'/'rejected'/'pending')
function getStatus (n) {
    return getModification(n).dataset.jndiff_status || 'pending';    
}

// Get the n-th modification node
function getModification (n) {
    return $(JNDiff.modifiedDom).find('*[data-jndiff_id="' + n + '"]')[0];
}

// Select -nth modification and scroll to it.
function focus (n) {
    var node = $(JNDiff.modifiedDom).find('*[data-jndiff_id="' + n + '"]')[0];
    if (node) {
        var range = document.createRange();
        range.selectNodeContents(node);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);


        // Scroll to node
        var offset = $(node).offset().top,
            wOffset = $(window).scrollTop(),
            wHeight = window.innerHeight;
        if(offset < wOffset || offset > wOffset + wHeight)
            $(window).scrollTop($(node).offset().top);

    }
}

window.JNDiff = JNDiff;
