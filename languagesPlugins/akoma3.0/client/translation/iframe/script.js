
var Translator = {
    start: start,
    setTranslations: setTranslations,
    getTranslations: getTranslations,
    originalDom: undefined,
    translatedDom: undefined,
    contextMenuCallback: undefined
};

function start (xml, translations, dict) {
    cloneDocs(xml);
    setupTranslator();
    setTranslations(translations)
}

function setTranslations (translations) {
    $(Translator.translatedDom).find('.fragment').each(function () {
        var id = this.dataset.id,
            status = (translations[id] && translations[id].status) || 'todo';
        if (status == 'translated') {
            this.dataset.status = 'translated';
            this.textContent = translations[id].value;
        } else if (status == 'pending') {
            this.dataset.status = 'pending';
        } else {
            this.dataset.status = 'todo';
        }
    });
}

function getTranslations () {
    var translations = {};
    $(Translator.translatedDom).find('.fragment').each(function () {
        var id = this.dataset.id;
        translations[id] = {
            status: this.dataset.status,
            value: this.textContent
        }
    });
    return translations;
}

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
        splitFragments(text).forEach(function (fragment) {
            var el = document.createElement('span');
            el.className = 'fragment';
            el.appendChild(document.createTextNode(fragment));
            el.dataset.id = counter++;
            output.appendChild(el);
        });
      }
      break;

    case 9: // Document
    case 1: // Element
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


function splitFragments (text) {
    var SEPARATOR = '.',
        fragments = [],
        last = 0;
    for (var i = 0; i < text.length; i++) {
        if ((text[i] == SEPARATOR) || (i == text.length-1)) {
            if (i+1<text.length && text[i+1] == ' ') i++;
            fragments.push(text.substring(last, i+1));
            last = i+1;
        }
    }
    return fragments;
}

function setupTranslator () {
    $(Translator.translatedDom).find('.fragment').each(function () {
        this.setAttribute("contentEditable", true);
        $(this).on('input', function() {
            this.dataset.status = 'pending';
        });

        $(this).on('contextmenu', function(e) {
            if (Translator.contextMenuCallback) {
                e.preventDefault();
                Translator.contextMenuCallback(this.dataset.id, e.clientX, e.clientY);
            }
        });
    });
}

window.Translator = Translator;


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
            Translator.start(value, {
                0: {status:'todo'},
                1: {status:'pending'},
                2: {status:'translated', value: 'Titolo 3'}
            }, {});
        }, 'text');
});