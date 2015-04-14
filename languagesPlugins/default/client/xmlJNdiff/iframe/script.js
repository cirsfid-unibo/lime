
var JNDiff = {
    start: start,
    save: save,
    getCount: getCount,
    accept: accept
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
        console.log('INFINE:', xmlDiff)
        transform(xmlDiff, JNDiff.modifiedDom);
        setupModifications(original, modified);
    }, 'xml');
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


function setupModifications (original, modified) {
    console.log('setupModifications', JNDiff, modified);
    JNDiff.accepted = {};
}

// Output Xml string of AkomaNtoso with passive modifications for accepted
// modifications
function save () {
    var output = '';
    console.log(JNDiff.accepted);
    return output;
}

function getCount () {
    return JNDiff.count || 16;
}

// Accept the -nth modification
function accept (n) {
    console.info('accepting', n)
    JNDiff.accepted[n] = true;
}

window.JNDiff = JNDiff;
