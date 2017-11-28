/*
* Copyright (c) 2014 - Copyright holders CIRSFID and Department of
* Computer Science and Engineering of the University of Bologna
*
* Authors:
* Monica Palmirani – CIRSFID of the University of Bologna
* Fabio Vitali – Department of Computer Science and Engineering of the University of Bologna
* Luca Cervone – CIRSFID of the University of Bologna
*
* Permission is hereby granted to any person obtaining a copy of this
* software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the
* rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following conditions:
*
* The Software can be used by anyone for purposes without commercial gain,
* including scientific, individual, and charity purposes. If it is used
* for purposes having commercial gains, an agreement with the copyright
* holders is required. The above copyright notice and this permission
* notice shall be included in all copies or substantial portions of the
* Software.
*
* Except as contained in this notice, the name(s) of the above copyright
* holders and authors shall not be used in advertising or otherwise to
* promote the sale, use or other dealings in this Software without prior
* written authorization.
*
* The end-user documentation included with the redistribution, if any,
* must include the following acknowledgment: "This product includes
* software developed by University of Bologna (CIRSFID and Department of
* Computer Science and Engineering) and its authors (Monica Palmirani,
* Fabio Vitali, Luca Cervone)", in the same place and form as other
* third-party acknowledgments. Alternatively, this acknowledgment may
* appear in the software itself, in the same form and location as other
* such third-party acknowledgments.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Generic dom utilities
 */
Ext.define('LIME.DomUtils', {
    /* Since this is merely a utility class define it as a singleton (static members by default) */
    singleton : true,
    alternateClassName : 'DomUtils',
    /**
     * @property {String} markedElements
     * Temporary parsing element class for text fragments.
     */
    tempParsingClass : "tempParsing",
    /**
     * @property {String} toRemoveClass
     * Class given to the elements that have to be removed before the translation
     */
    toRemoveClass : "useless",
    /**
     * @property {String} tempSelectionClass
     * Temporary selection element class for text fragments.
     */
    tempSelectionClass : "tempSelection",
    /**
     * @property {String} elementIdAttribute
     * This is the name of the attribute that is used as internal id
     */
    elementIdAttribute : "internalId",
    toMarkNodeClass: "toMarkNode",
    /**
     * @property {String} elementIdSeparator
     * Separator string used in the element id attribute
     */
    elementIdSeparator : '_',
    /**
     * @property {RegExp} block\\s+
     * RegExp object used for recognise if a string is a block element
     */
    blockTagRegex : /<(address|blockquote|body|center|dir|div|dlfieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|pre|p|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)(\/)?>/i,
    /**
     * @property {RegExp} blockRegex
     * RegExp object used for recognise if tag is a block element
     */
    blockRegex : /^(address|blockquote|body|center|dir|div|dlfieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|pre|p|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i,
    /**
     * @property {RegExp} vowelsRegex
     * RegExp object used for vowels
     */
    vowelsRegex : /([a, e, i, o, u]|[0-9]+)/gi,

    tagRegex: /<(.|\n)*?>/g,

    // Matches tags including their content
    elementRegex: /<(.|\n)*?>(([^<\/]*)<\/(.|\n)*?>)?/g,

    /**
     * @property {Object} nodeType
     * This object is a traslation of numeric node type in string type
     */
    nodeType : {
        ELEMENT : 1,
        ATTRIBUTE : 2,
        TEXT : 3,
        CDATA_SECTION : 4,
        ENTITY_REFERENCE : 5,
        ENTITY : 6,
        PROCESSING_INSTRUCTION : 7,
        COMMENT : 8,
        DOCUMENT : 9,
        DOCUMENT_TYPE : 10,
        DOCUMENT_FRAGMENT : 11,
        NOTATION : 12
    },

    /**
     * This function take a @first node and a @last node
     * and append all their siblings (first and last included)
     * to the given @newParent
     * @first and @last MUST BE at the same nesting level of the
     * same element! No checking is performed by this function!
     * @param {HTMLElement} first
     * @param {HTMLElement} last
     * @param {HTMLElement} newParent
     */
    appendChildren : function(first, last, newParent) {
        var temp = first;
        /* iterator */
        last = last.nextSibling;
        var next;
        /* next node to visit */
        do {
            next = temp.nextSibling;
            newParent.appendChild(temp);
            temp = next;
        } while (temp != last);
    },

    /**
     * Return an ExtJS DomQuery compatible query that
     * will return all the useless elements that can be removed
     * before translating
     * @returns {String} The query
     */
    getTempClassesQuery : function() {
        // TODO rendere le classi iterabili
        return "." + this.tempSelectionClass + ", ." + this.toRemoveClass + ", ." + this.tempSelectionClass;
    },

    /**
     * This function returns a list of the siblings of the given name (e.g. p, div etc.)
     * of the startElement (if endElement is specified it stops once that is reached;
     * if the endElement is never found, e.g. out of the hierarchy, the computation
     * stops at the last sibling found).
     * WARNING: this function does NOT provide any check about the order of the nodes given,
     * it could not terminate if endElement is before/in/above startElement
     * @param {HTMLElement} startElement
     * @param {HTMLElement} [endElement]
     * @param {String/Regexp} [nodeName]
     * @returns {HTMLElement[]}
     */
    getSiblings : function(startElement, endElement, nodeName) {
        var siblings = [];
        if (startElement && endElement) {
            var iterator = startElement;
            // Include start and end
            while (iterator && iterator != endElement.nextSibling) {
                // Use the regex if available
                var condition = (!nodeName) ? false : (Utilities.toType(nodeName) == "regexp") ? nodeName.test(iterator.nodeName) : iterator.nodeName.toLowerCase() == nodeName;
                if (!nodeName || condition) {
                    siblings.push(iterator);
                }
                iterator = iterator.nextSibling;
            }
        }
        return siblings;
    },

    getSiblingsFromNode : function(node) {
        var iterator, siblings = [];
        if (node) {
            iterator = node.previousSibling;
            while (iterator) {
                siblings.push(iterator);
                iterator = iterator.previousSibling;
            }
            iterator = node.nextSibling;
            while (iterator) {
                siblings.push(iterator);
                iterator = iterator.nextSibling;
            }
        }
        return siblings;
    },

    getPreviousSiblingWithAttr: function(node, attr) {
        node = (node) ? node.previousSibling : null;
        while(node) {
            if ( node.getAttribute && node.getAttribute(attr) != undefined ) {
                return node;
            }
            node = node.previousSibling;
        }
    },

    /**
     * This function is a innerHTML replacement.
     * It allows to completely move all the children nodes from
     * a source to a destination.
     * @param {HTMLElement} from The source
     * @param {HTMLElement} to The destination
     */
    moveChildrenNodes : function(from, to, append) {
        if (!from || !to) return;
        if (!append) {
            while (to.firstChild) {
                to.removeChild(to.firstChild);
            }
        }
        while (from.firstChild) {
            to.appendChild(from.firstChild);
        }
    },

    /**
     * This function returns an HtmlElement of the given type
     * starting from the given root and going towards the given direction
     * NOTE/TODO: down direction not implemented yet!
     * @param {HTMLElement} root
     * @param {String/Regexp} name
     * @returns {HTMLElement}
     */
    getNodeByName : function(root, name) {
        // Once we reached the body element we stop
        var selectedNode = root;
        while (selectedNode.nodeName.toLowerCase() != 'body') {
            var nodeName = selectedNode.nodeName.toLowerCase();
            // name can be either be a string or a regexp object (useful in most cases, e.g. for sensitive case or multiple names)
            if ((Utilities.toType(name) == "regexp") ? name.test(nodeName) : (nodeName == name.toLowerCase())) {
                return selectedNode;
            }
            selectedNode = selectedNode.parentNode;
        }
        return null;
    },

    /**
     * Function which returns the level of nesting (from the root with level 1) of the given @node
     * @param {HTMLElement} node
     * @returns {Number}
     */
    nestingLevel : function(node) {
        var lv = 1;
        while (node != null) {
            node = node.parentNode;
            lv++;
        }
        return lv;
    },

    /**
     * This function converts a XML node into a JSON string
     * @param {HTMLElement} xml
     * @returns {Object}
     */
    xmlToJson : function(xml) {
        // Create the return object
        var obj;
        if (xml && xml.nodeType == DomUtils.nodeType.ELEMENT) {// element*/
            obj = {};
            obj.el = xml;
            // do children
            if (xml && xml.hasChildNodes()) {
                obj.children = [];
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i);
                    if (item) {
                        var nodeName = item.nodeName.toLowerCase();
                        var childObj = this.xmlToJson(item);
                        if (childObj)
                            obj.children.push(childObj);
                    }
                }
            }
        }
        return obj;
    },

    nodeToJson : function(xml) {
        var obj, i, attrib, nodeClass;
        if (xml && xml.nodeType == DomUtils.nodeType.ELEMENT) {// element*/
            obj = {};
            obj.el = xml;
            obj.attr = {};
            for ( i = 0; i < xml.attributes.length; i++) {
                attrib = xml.attributes[i];
                obj.attr[attrib.name] = attrib.value;
            }
            // do children
            if (xml && xml.hasChildNodes()) {
                obj.children = [];
                for ( i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i);
                    if (item) {
                        var nodeName = item.nodeName;
                        var childObj = this.nodeToJson(item);
                        if (childObj) {
                            nodeClass = childObj.attr["class"];
                            if (nodeClass) {
                                obj[nodeClass] = Utilities.pushOrValue(obj[nodeClass], childObj);
                            }
                            obj.children.push(childObj);
                        }
                    }
                }
            }
        }
        return obj;
    },

    setNodeInfoAttr : function(node, type, tpl) {
        var info = this.getNodeExtraInfo(node, type, 15).trim();
        tpl = new Ext.Template(tpl || "{data}");

        if ( info ) {
            node.setAttribute('data-labelinfo', tpl.apply({data: info}));
        } else {
            node.removeAttribute('data-labelinfo');
        }
    },

    /**
     * This function search extra information in a node that has a specific type and return it
     * @param {HTMLElement} node
     * @param {HTMLElement} type
     * @param {HTMLElement} [limit]
     * @returns {String}
     */
    getNodeExtraInfo : function(node, type, limit) {
        return '';
    },
    /**
     * This function retrieves the first marked ascendant
     * for the given node.
     * @param {HTMLElement} node
     * @returns {HTMLElement} a reference to the marked ascendant node, false if nothing was found
     */
    getFirstMarkedAncestor : function(node) {
        if (!node)
            return null;
        if (node && node.nodeType == DomUtils.nodeType.ELEMENT && node.getAttribute(DomUtils.elementIdAttribute) != null)
            return node;
        node = (node.parentNode) ? node.parentNode : null;
        // let's start from the parent, shall we?
        while (node && node.nodeType == DomUtils.nodeType.ELEMENT) {
            if (node.getAttribute(DomUtils.elementIdAttribute)) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    },

    getMarkedParents: function(node, filterFunction) {
        var parents = [], iterNode = node;

        while(iterNode) {
            var parent = DomUtils.getFirstMarkedAncestor(iterNode.parentNode);
            if(parent) {
                if(Ext.isFunction(filterFunction)) {
                    if(filterFunction(parent)) {
                        parents.push(parent);
                    }
                } else {
                    parents.push(parent);
                }
            }
            iterNode = parent;
        }

        return parents;
    },

    /**
     * This function returns a list of all the marked children's ids
     * found starting from node.
     *
     * @param {HTMLElement} node
     * @returns {String[]}
     */
    getMarkedChildrenId : function(node) {
        var childrenIds = [];
        Ext.each(node.querySelectorAll('[' + DomUtils.elementIdAttribute + ']'), function(child) {
            var id = child.getAttribute(DomUtils.elementIdAttribute);
            childrenIds.push(id);
        });
        return childrenIds;
    },

    /**
     * This function returns a reference to an existing button
     * which matches part of the given elementId.
     * @param {String} elementId
     * @returns {String}
     */
    getButtonIdByElementId : function(elementId) {
        if (!elementId)
            return null;
        return elementId.split(DomUtils.elementIdSeparator)[0];
    },

    /**
     * This function returns the marking button related to the passed element
     * @param {HTMLElement} element
     * returns {Object}
     */
    getButtonByElement : function(element) {
        var elementId, markingElement;
        if (element && element.getAttribute) {
            elementId = element.getAttribute(DomUtils.elementIdAttribute);
            markingElement = DocProperties.getMarkedElement(elementId);
            if (elementId && markingElement) {
                return markingElement.button;
            }

            return DocProperties.getFirstButtonByName(this.getNameByNode(element));
        }
        return null;
    },

    // Get the unique id of the given editor dom element.
    getElementId: function(element) {
        if (element && element.getAttribute)
            return element.getAttribute(DomUtils.elementIdAttribute);
        return null;
    },

    // Get the dom node with the given unique id which is contained in document.
    getElementById: function (id, document) {
        return document.querySelector('[' + DomUtils.elementIdAttribute + '="' +  id +  '"]');
    },

    // Get the concatenation of element id of the given dom element.
    getElementIdPath: function (element) {
        var path = '',
            id;
        while(id = this.getElementId(element)) {
            element = element.parentNode;
            path = path ? id + '/' + path : id;
        }
        return 'root/' + path;
    },

    getElementNameByNode: function(node) {
        var button = DomUtils.getButtonByElement(node);
        if(button && button.name) {
            return button.name;
        }
        return null;
    },

    /** This function search the Node that contains the passed string
     * @param {String} text
     * @param {HTMLElement} initNode
     * @param {HTMLElement[]} [rejectElements] Elements to reject
     * @returns {HTMLElement}
     */
    findNodeByText : function(text, initNode, rejectElements) {
        var containsText = function(node) {
            if (rejectElements && Ext.Array.indexOf(rejectElements, node) != -1) {
                return NodeFilter.FILTER_REJECT;
            } else if (node.innerHTML.indexOf(text) != -1)
                return NodeFilter.FILTER_ACCEPT;
            else
                return NodeFilter.FILTER_SKIP;
        };
        if (!initNode) return;
        var w = initNode.ownerDocument.createTreeWalker(initNode, NodeFilter.SHOW_ELEMENT, containsText, false);
        var node;
        while (w.nextNode()) {
            node = w.currentNode;
        }
        return node;
    },
    /** This function search the Text Nodes that contains the passed string
     * @param {String} text
     * @param {HTMLElement} initNode
     * @returns {HTMLElement[]} Array of text nodes
     */
    findTextNodes : function(text, initNode) {
        var containsText = function(node) {
            if (node.textContent.indexOf(text) != -1)
                return NodeFilter.FILTER_ACCEPT;
            else
                return NodeFilter.FILTER_SKIP;
        };
        var nodes = [];

        if (initNode) {
           var w = initNode.ownerDocument.createTreeWalker(initNode, NodeFilter.SHOW_TEXT, containsText, false);
            try {
                while (w.nextNode()) {
                    nodes.push(w.currentNode);
                }
            } catch(e) {
                Ext.log({
                    level : "error"
                }, e);
            };
        }
        return nodes;
    },

    // Find string inside node, string can be text (findText
    // will be used) or html (findHtml will be used).
    // Return list of ranges.
    find: function (string, node) {
        try {
            if (string.match(DomUtils.tagRegex))
                return DomUtils.findHtml(string, node);
            else
                return DomUtils.findText(string, node);
        } catch (e) {
            console.warn('Bug in range functions: find(string, node)', string, node);
            console.warn(e);
            return [];
        }
    },
    // Search inside node (HTML Node) for the given html string.
    // Return a list of matches (Range objects).
    // Note: This works only for simple tags like <br> and markers.
    findHtml: function (html, node) {
        return this.findTextIgnoringHtml(html, node).filter(function (range) {
            var content = DomUtils.range.getHtml(range);
            return content.indexOf(html) != -1;
        });
    },

    // Search inside node (HTML Node) for the given html string,
    // ignoring all html tags.
    // Return a list of matches (Range objects).
    // Note: This works only for simple tags like <br> and markers.
    findTextIgnoringHtml: function (html, node) {
        var text = DomUtils.stripHtmlTags(html);
        if (!text) throw Error ('findTextIgnoringHtml: empty string given', html);
        return DomUtils.findText(text, node);
    },

    // Search inside node (HTML Node) for the text string, ignoring
    // the html tags.
    // Return a list of matches (Range objects).
    findText: function (text, node) {
        if (!text) throw Error ('findText: empty string given');
        // Find matches in plain string
        var matches = [];
        var pos = -1;
        while ((pos = node.textContent.indexOf(text, pos+1)) >= 0)
            matches.unshift(pos);

        var textNodes = DomUtils.getTextNodes(node);
        // return the splitted text nodes before and after the given offset
        var indexToTextNode = function (index) {
            var pos = 0;
            for (var i = 0; i < textNodes.length; i++) {
                var node = textNodes[i];
                if (index - pos < node.length)
                    return {
                        left: node,
                        right: node.splitText(index - pos)
                    }
                pos += node.length;
            }
            return { left: node };
        }

        // Map plain string indexes to range objects
        return matches.map(function (index) {
            var range = node.ownerDocument.createRange();
            range.setEndAfter(indexToTextNode(index + text.length).left);
            range.setStartBefore(indexToTextNode(index).right);
            DomUtils.range.normalization.shrinkToTextNodes(range);
            DomUtils.range.normalization.enlargeToClosingTags(range);
            return range;
        });
    },

    range: {
        // Wrapper function to call all normalization functions
        normalize: function(range) {
            DomUtils.range.normalization.shrinkToTextNodes(range);
            DomUtils.range.normalization.enlargeToClosingTags(range);
        },

        normalization: {
            // Normalize range by making it start before the first non-empty text-node
            // and end after the last non-empty text-node.
            shrinkToTextNodes: function (range) {
                var nodes = DomUtils.range.getTextNodes(range).filter(function (node) {
                    return node.textContent.length > 0;
                });
                if (nodes.length) {
                    range.setStartBefore(nodes[0]);
                    range.setEndAfter(nodes[nodes.length - 1]);
                } else {
                    range.collapse(true);
                }
            },

            // Normalize range by enlarging it to include starting/closing tags around it.
            // This should make it easier to wrap it in new tags with surroundContents.
            enlargeToClosingTags: function (range) {
                // Include starting tag
                function normalizeStart () {
                    if (range.startContainer == range.commonAncestorContainer)
                        return;

                    var contentBefore = '';
                    for (var i = 0; i < range.startOffset; i++)
                        contentBefore += range.startContainer.childNodes[i].textContent;
                    if (!contentBefore) {
                        range.setStartBefore(range.startContainer);
                        normalizeStart();
                    }
                };
                // Include ending tag
                function normalizeEnd () {
                    if (range.endContainer == range.commonAncestorContainer)
                        return;

                    var contentAfter = '';
                    for (var i = range.endOffset; i < range.endContainer.childNodes.length; i++)
                        contentAfter += range.endContainer.childNodes[i].textContent;
                    if (!contentAfter) {
                        range.setEndAfter(range.endContainer);
                        normalizeEnd();
                    }
                };
                normalizeStart();
                normalizeEnd();
            },

            // Update range by splitting range nodes considering the range offsets
            splitRangeNodes: function(range) {
                if (range.startContainer.nodeType == DomUtils.nodeType.TEXT) {
                    range.setStartBefore(range.startContainer.splitText(range.startOffset));
                }
                if (range.endContainer.nodeType == DomUtils.nodeType.TEXT) {
                    range.setEndBefore(range.endContainer.splitText(range.endOffset));
                }
                return range;
            },

            // Update range by moving its start and end out of the fake LIME editor
            // dom elements
            getOutOfFakeEditorElements: function (range) {
                function isInFakeElement (el) {
                    if (el.nodeType == DomUtils.nodeType.TEXT)
                        el = el.parentNode;
                    return el.dataset['mceType'] == 'bookmark';
                }
                while (isInFakeElement(range.startContainer))
                    range.setStartBefore(range.startContainer);
                while (isInFakeElement(range.endContainer))
                    range.setEndAfter(range.endContainer);
            }
        },


        // Traverse range in DFS order and call callbacks.
        // {
        //   onText: function(textNode) {},
        //   onTagOpened: function(node) {},
        //   onTagClosed: function(node) {}
        // }
        traverse: function (range, callbacks) {
            var onText = callbacks.onText || function () {},
                onTagOpened = callbacks.onTagOpened || function () {},
                onTagClosed = callbacks.onTagClosed || function () {};

            DomUtils.range.normalization.splitRangeNodes(range);
            var container = range.startContainer,
                offset = range.startOffset;
            while (container != range.endContainer || offset != range.endOffset) {
                var node = container.childNodes[offset];
                if (!node) {
                    if (container == range.commonAncestorContainer)
                        return console.warn('warning: commonAncestorContainer found');
                    onTagClosed(container);
                    offset = 1 + Array.prototype.indexOf.call( // NodeLists.. <3
                        container.parentNode.childNodes, container);
                    container = container.parentNode;
                }
                else if (node.nodeType == DomUtils.nodeType.TEXT) {
                    onText(node);
                    offset++;
                }
                else if (node.nodeType == DomUtils.nodeType.ELEMENT) {
                    onTagOpened(node);
                    container = node;
                    offset = 0;
                }
            }
        },

        // Get all text nodes inside range
        getTextNodes: function (range) {
            var result = [];
            DomUtils.range.traverse(range, {
                onText: function (node) {
                    result.push(node)
                }
            });
            return result;
        },

        // Get the HTML string inside range.
        getHtml: function (range) {
            var output = '';
            DomUtils.range.traverse(range, {
                onText: function (node) {
                    output += node.textContent;
                },
                onTagOpened: function (node) {
                    output += '<' + node.tagName.toLowerCase();
                    var attrs = node.attributes;
                    for(var i = 0; i < attrs.length; i++) {
                        output += ' "'  + attrs[i].name  +
                                  '"="' + attrs[i].value + '"';
                    }
                    // Check if node is an auto-closed tag
                    if (!node.firstChild) output += '/';
                    output += '>';
                },
                onTagClosed: function (node) {
                    // If it was an auto-closed tag, don't close it again
                    if (!node.firstChild) return;
                    output += '</' + node.tagName.toLowerCase() + '>';
                }
            });
            return output;
        }
    },

    // Strip HTML tags from string.
    stripHtmlTags : function (string) {
        return string.replace(DomUtils.tagRegex, '');
    },

    smartFindTextNodes : function(text, node) {
        var me = this, textNodes = [], txtGroupNodes = [],
            tags = text.match(DomUtils.tagRegex);
        if (tags) {
            var re = new RegExp(tags.join("|"), "gi");
            var fragments = text.split(re);
            for (var i = 0; i < fragments.length; i++) {
                if ( fragments[i].length ) {
                    var tList = DomUtils.findTextNodes(fragments[i], node).filter(function(tnode) {
                        return (Ext.String.startsWith(tnode.data, fragments[i]) || Ext.String.endsWith(tnode.data, fragments[i]));
                    });
                    txtGroupNodes.push({
                        index: i,
                        str: fragments[i],
                        nodes: tList
                    });
                }
            }

            for (i = 0; i < txtGroupNodes.length; i++) {
                var group = txtGroupNodes[i];
                var nextGroup = txtGroupNodes[i+1];

                if ( group && nextGroup ) {
                    textNodes = me.fiterTextGroups(group, nextGroup, textNodes);
                } else if ( group ) {
                    Ext.each( group.nodes , function(txnode) {
                        // This may be the second occorence, check if is the correct string
                        if ( !textNodes.length || textNodes[0][0].str && textNodes[0][0].str == group.str ) {
                            textNodes.push([{str: group.str, node: txnode}]);
                        }
                    });
                }
            }
        } else {
            textNodes = DomUtils.findTextNodes(text, node).map(function(tnode) {
                return [{
                    str: text,
                    node: tnode
                }];
            });
        }
        return textNodes;
    },

    fiterTextGroups: function(g1, g2, groups) {
        var groups = groups || [];
        for(var i = 0; i < g1.nodes.length; i++) {
            var node1 = g1.nodes[i];
            for(var j = 0; j < g2.nodes.length; j++) {
                var node2 = g2.nodes[j];
                var siblings = this.getSiblings(node1, node2);
                var sLen = siblings.length;
                var firstNode = null;
                if ( sLen && sLen <= (g2.index-g1.index+2) &&
                     siblings[0] == node1 && siblings[sLen-1] == node2 ) {
                    var list = this.findNodeListInGroup(node1, groups);
                    if (list) {
                        list.push({str: g2.str, node: node2});
                    } else {
                        // This may be the second occorence, check if is the correct string
                        if ( !groups.length || groups[0][0].str && groups[0][0].str == g1.str ) {
                            groups.push([{str: g1.str, node: node1}, {str: g2.str, node: node2}]);
                        }
                    }
                }
            }
        }
        return groups;
    },

    findNodeListInGroup : function(node, groups) {
        var list = groups.filter(function(group) {
            return group.filter(function(obj) {
                return obj.node == node;
            }).length
        })[0];
        return list;
    },

    getTextOfNodeClassic: function(node) {
        var text = "";
        for(var i = 0; i < node.childNodes.length; i++) {
            if(node.childNodes[i].nodeType == this.nodeType.TEXT) {
                text+= node.childNodes[i].nodeValue+ " ";
            } else if(node.childNodes[i].nodeType == this.nodeType.ELEMENT) {
                text+= this.getTextOfNodeClassic(node.childNodes[i]);
            }
        }
        return text;
    },

    getTextOfNode : function(node) {
        var w = node.ownerDocument.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
            acceptNode : function(node) {
                return NodeFilter.FILTER_ACCEPT;
            }
        }, false);

        var text = "";
        if ( node.nodeType == this.nodeType.TEXT ) {
            text = node.data;
        } else {
            try {
                while (w.nextNode()) {
                    text += w.currentNode.nodeValue + " ";
                }
            } catch(e) {
                return this.getTextOfNodeClassic(node);
            };
        }
        return text;
    },

    // Get list of text nodes inside node.
    getTextNodes : function(node) {
        var textNodes = [];
        try {
            var w = node.ownerDocument.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            while (w.nextNode()) {
                textNodes.push(w.currentNode);
            }
        } catch(e) {
            // In case TreeWalker is not supported (IE)
            function textNodesUnder(node){
                var all = [];
                for (node=node.firstChild;node;node=node.nextSibling) {
                    if (node.nodeType==3) all.push(node);
                    else all = all.concat(textNodesUnder(node));
                }
                return all;
            }
            textNodes = textNodesUnder(node);
        };
        return textNodes;
    },

    /** This function search all occurences of subStr in str, and returns all accurences position
     * @param {String} str
     * @param {String} subStr
     * @returns {Number[]} Array of indexes
     */
    stringIndexesOf : function(str, subStr) {
        str += '';
        subStr += '';
        var pos = 0, indexes = [], sLength = subStr.length;

        while (pos != -1) {
            pos = str.indexOf(subStr, pos);
            if (pos != -1) {
                indexes.push(pos);
                pos += sLength;
            }
        }
        return indexes;
    },

    /**
     * Add the given style properties to the elements that match
     * the given css selector.
     * @param {String} selector The css selector
     * @param {String} styleText The string representing the property
     * @param {String} doc Document to apply the style
     * @param {String} styleId (Optional) id the style element you want to add to
     */
    addStyle : function(selector, styleText, doc, styleId) {
        // Create a style element and append it into the head element
        var head = doc.querySelector('head'),
            styleEl = head.querySelector('style');

        if (styleId)
            styleEl = head.querySelector('#' + styleId);

        if (!styleEl) {
            styleEl = doc.createElement('style');
            if (styleId)
                styleEl.setAttribute('id', styleId);
            head.insertBefore(styleEl, head.firstChild);
        }

        // Append all the style properties to the style element just created
        var styleTxt = selector + " {" + styleText + "}";
        var cssText = doc.createTextNode(styleTxt);
        styleEl.appendChild(cssText);
    },

    /**
     * Wrapper for DOMParser.parseFromString
     */
    parseFromString : function(string) {
        var parser = new DOMParser(), docDom;
        // IE exception
        try {
            docDom = parser.parseFromString(string, "application/xml");
            if (docDom.documentElement.tagName == "parsererror" || docDom.documentElement.querySelector("parseerror") || docDom.documentElement.querySelector("parsererror")) {
                docDom = null;
            }
        } catch(e) {
            docDom = null;
        }
        return docDom;
    },

    /**
     * Wrapper for XMLSerializer.serializeToString
     */
    serializeToString : function(dom) {
        var XMLS = new XMLSerializer();
        return XMLS.serializeToString(dom);
    },

    getDocTypeByNode : function(node) {
        var cls = node.getAttribute("class").split(' ');
        return Ext.Array.difference(cls, [DocProperties.documentBaseClass])[0];
    },

    markedNodeIsPattern : function(node, pattern) {
        var cls = node.getAttribute("class");
        if (cls && cls.match("\\b" + pattern + "\\b")) {
            return true;
        }
        return false;
    },

    getPatternByNode: function(node) {
        var cls = node.getAttribute("class");
        if(cls) {
            return cls.split(" ")[0];
        }
    },

    getNameByNode: function(node) {
        var cls = node.getAttribute("class");
        if(cls) {
            return cls.split(" ")[1];
        }
    },

    allNodesHaveClass : function(nodes, cls) {
        for (var i = 0; i < nodes.length; i++) {
            if (!nodes[i].getAttribute || nodes[i].getAttribute("class") != cls) {
                return false;
            }
        }
        return (nodes.length) ? true : false;
    },

    addSpacesInTextNode : function(textNode) {
        if (textNode.length) {
            textNode.appendData(" ");
        }
    },

    removeChildren: function(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    },

    replaceTextOfNode: function(node, newText) {
        var oldText = this.getTextOfNode(node);
        this.removeChildren(node);
        node.appendChild(node.ownerDocument.createTextNode(newText));
        return oldText;
    },

    isNodeBlock: function(node) {
        return this.blockRegex.test(node.nodeName);
    },

    isSameNodeWithHtml: function(node, html) {
        var re = new RegExp("^<"+node.nodeName+">", 'i');
        return re.test(html);
    },

    filterMarkedNodes: function(nodes) {
        return Ext.Array.toArray(nodes).filter(function(el) {
            return el.getAttribute(DomUtils.elementIdAttribute);
        });
    },

    isNodeFocused: function(node) {
        var cls = node.getAttribute(DocProperties.elementFocusedCls);
        if(cls && cls === "true") {
            return true;
        }
        return false;
    },

    insertAfter: function(node, target) {
        if(target.nextSibling) {
            target.parentNode.insertBefore(node, target.nextSibling);
        } else {
            target.parentNode.appendChild(node);
        }
    },

    getLastFromQuery: function(node, query) {
        var result = node.querySelectorAll(query);
        if(result && result.length) {
            return result[result.length-1];
        }
        return null;
    },

    wrapNode: function(node, tag) {
        var wrapper = node.ownerDocument.createElement(tag);
        node.parentNode.insertBefore(wrapper, node);
        wrapper.appendChild(node);
        return wrapper;
    },

    unwrapNode: function(node) {
        var iterNode;
        if(node.parentNode) {
            iterNode = node.firstChild;
            while (iterNode) {
                nextSibling = iterNode.nextSibling;
                node.parentNode.insertBefore(iterNode, node);
                iterNode = nextSibling;
            }
            node.parentNode.removeChild(node);
        }
    },

    isNodeSiblingOfNode: function(node1, node2) {
        if(node1 && node2) {
            var iterNode = node1.nextSibling;
            while(iterNode && iterNode != node2) {
                iterNode = iterNode.nextSibling;
            }
            return (iterNode == node2);
        }
        return false;
    },

    getAscendantNodes: function(node) {
        var nodes = [], parent = node.parentNode;
        while(parent && parent.nodeName.toLowerCase() != "body") {
            nodes.push(parent);
            parent = parent.parentNode;
        }
        return nodes;
    },

    getCommonAscendant: function(node1, node2) {
        var ascendants1 = Ext.Array.toArray(this.getAscendantNodes(node1)),
            ascendants2 = Ext.Array.toArray(this.getAscendantNodes(node2)),
            index1, index2;

        ascendant = ascendants1.filter(function(node) {
            return (ascendants2.indexOf(node) != -1);
        })[0];

        index1 = ascendants1.indexOf(ascendant);
        index2 = ascendants2.indexOf(ascendant);
        index1 = (index1 != 0) ? index1-1 : 0;
        index2 = (index2 != 0) ? index2-1 : 0;

        return {
            ascendant: ascendant,
            firstParent: ascendants1[index1],
            secondParent: ascendants2[index2]
        };
    },

    getPreviousTextNode : function(node, notEmpty) {
        while( node.previousSibling ) {
            if ( node.previousSibling.nodeType == DomUtils.nodeType.TEXT ) {
                if (!notEmpty || !Ext.isEmpty(node.previousSibling.data.trim()) ) {
                    return node.previousSibling;
                }
            }
            node = node.previousSibling;
        }
    },

    getNodeNameLower: function(node) {
        return (node) ? node.nodeName.toLowerCase() : "";
    },

    nodeHasClass: function(node, cls) {
        var reg = new RegExp("\\b"+cls+"\\b");
        return (node && node.getAttribute && reg.test(node.getAttribute('class')));
    },

    nodeHasTagName: function(node, tag) {
        return node && node.tagName && node.tagName.toLowerCase() === tag.toLowerCase();
    },

    convertNbsp: function(str) {
        return str.replace(/&nbsp;/g, '@nbsp@');
    },

    riconvertNbsp: function(str) {
        return str.replace(/@nbsp@/g, ' ');
    },

    normalizeBr: function(str) {
        return str.replace(/(<br\/>(\s*))+/g, '$1');
    },

    nodeListToArray: function (nodelist) {
        return Array.prototype.slice.call(nodelist);
    },

    // Execute "fn" in "after" milliseconds.
    // This is useful for delaying some evend handlers while
    // executing them once.
    delayedExec: function (after, fn) {
        var timer;
        return function() {
            if (timer) clearTimeout(timer);
            timer = setTimeout(fn, after);
        };
    },

    // Compute simple statistics for document passed
    // returns an object containing the number of total marked elements
    // and the number of marked elements for each tag with an extract of their content
    computeDocStatistics: function(node, textLimit) {
        textLimit = textLimit || 100;
        var markedElements = node.querySelectorAll("*[" + this.elementIdAttribute + "]");
        var statistics = {
            markedCount: markedElements.length,
            elements: {}
        };
        for(var i = 0; i < markedElements.length; i++) {
            var name = this.getNameByNode(markedElements[i]);
            statistics.elements[name] = statistics.elements[name] || {
                count: 0,
                elements: []
            };
            statistics.elements[name].elements.push({
                textLength: markedElements[i].textContent.length,
                textExtract: Ext.String.ellipsis(markedElements[i].textContent, textLimit)
            });
            statistics.elements[name].count++;
        }
        return statistics;
    },

    // Returns the parent node on which fn returns true
    findParentNode: function(node, fn) {
        var parent = node.parentNode;
        while(parent) {
            if(fn(parent)) return parent;
            parent = parent.parentNode;
        }
    }
});
