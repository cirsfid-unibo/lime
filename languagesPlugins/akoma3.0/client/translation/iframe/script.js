
var Translator = {};

Translator.start = function (xml, states, dict) {
    cloneDocs(xml);
    setupTranslator();
};

function cloneDocs (xml) {
    Translator.originalDom = $('.document.original')[0];
    Translator.translatedDom = $('.document.translated')[0];

    var parser = new DOMParser();
    var dom = parser.parseFromString(xml, "text/xml");
    transform(dom, Translator.originalDom);

    Translator.translatedDom.appendChild(
        Translator.originalDom.querySelector('.akomaNtoso').cloneNode(true)
    );
}

var counter = 0;

// Transform the input XML DOM in HTML and copy it to output. 
function transform (input, output) {
  switch (input.nodeType) {
    case 3: // Text
      var text = input.wholeText.trim()
      if(text) {
        var el = document.createElement('span');
        el.className = 'fragment';
        el.appendChild(document.createTextNode(text));
        el.dataset._id = counter++;
        output.appendChild(el);
      }
      break;

    case 1: // Element
    case 9: // Document
      var el = document.createElement('div');
      output.appendChild(el);
      el.className = input.nodeName;
      var children = input.childNodes;
      for (var i = 0; i < children.length; i++)
        transform(children[i], el);
      break;

    default:
      console.log('Unknown node type:', input.nodeType);
  }
};

function setupTranslator () {
    $(Translator.translatedDom).find('.fragment').each(function () {
        this.setAttribute("contentEditable", true);
        $(this).addClass("todo");
        $(this).on('input', function() {
            console.log(this.textContent);
            $(this).removeClass("todo");
            $(this).addClass("toreview");
        })
    })
}

// window.Translator = Translator;
// $(document).ready(function () {
//     $.get('./example.xml', undefined, function (value) {
//         Translator.start(value, {}, {});
//     }, 'text');
// });