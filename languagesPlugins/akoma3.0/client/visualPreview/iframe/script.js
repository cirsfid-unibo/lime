
var Preview = {
    start: start
};

function start (xml) {
    cloneDoc(xml);
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

window.Preview = Preview;
