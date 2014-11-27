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

Ext.define('LIME.controller.ParsersController', {
    extend : 'Ext.app.Controller',

    config : {
        pluginName : "parsers"
    },
    refs : [{
        selector : 'appViewport',
        ref : 'appViewport'
    }],

    /**
     * @property {Number} parserAjaxTimeOut
     */
    parserAjaxTimeOut : 40000,

    /**
     * @property {Object} parsersConfig
     * avaible parsers configuration
     */
    parsersConfig : {
        'date' : {
            'url' : 'php/parsers/date/index.php',
            'method' : 'POST'
        },
        'docNum' : {
            'url' : 'php/parsers/docNum/index.php',
            'method' : 'POST'
        },
        'list' : {
            'url' : 'php/parsers/list/index.php',
            'method' : 'POST'
        },
        'docDate' : {
            'url' : 'php/parsers/date/index.php',
            'method' : 'POST'
        },
        'body' : {
            'url' : 'php/parsers/body/index.php',
            'method' : 'POST'
        },
        'structure' : {
            'url' : 'php/parsers/structure/index.php',
            'method' : 'POST'
        },
        'reference' : {
            'url' : 'php/parsers/reference/index.php',
            'method' : 'POST'
        },
        'quote' : {
            'url' : 'php/parsers/quote/index.php',
            'method' : 'POST'
        },
        'docType': {
            'url' : 'php/parsers/doctype/index.php',
            'method' : 'POST'
        },
        'authority': {
            'url' : 'php/parsers/authority/index.php',
            'method' : 'POST'
        },
        'location': {
            'url' : 'php/parsers/location/index.php',
            'method' : 'POST'
        },
        'enactingFormula': {
            'url' : 'php/parsers/enactingFormula/index.php',
            'method' : 'POST'
        }
    },

    /**
     * @property {String[]} docNumImpossibleParents
     */
    docNumImpossibleParents : ["h1", "h2", "a"],

    onDocumentLoaded : function(docConfig) {
        var me = this;
        me.addParserMenuItem();
    },

    addParserMenuItem : function() {
        var me = this;
        menu = {
            text : Locale.getString("parseDocumentText", me.getPluginName()),
            tooltip : Locale.getString("parseDocumentTooltip", me.getPluginName()),
            icon : 'resources/images/icons/lightbulb.png',
            name : 'parseDocument',
            handler : Ext.bind(me.activateParsers, me)
        };
        me.application.fireEvent("addMenuItem", me, {
            menu : "editMenuButton"
        }, menu);
    },

    onNodeChanged: function(nodes, config, callback) {
        if(!config.unmark) {
            try {
                this.addChildWrapper(nodes, config);
                this.parseElements(nodes, config, callback);
            } catch(e) {
                Ext.callback(callback);
                Ext.log({level: "error"}, e);
            }
        } else {
            Ext.callback(callback);
        }
    },

    addChildWrapper: function(nodes, config) {
        var me = this, button, nodesToMark = [];
        Ext.each(nodes, function(node) {
            button = DomUtils.getButtonByElement(node);
            if(button && (button.name == 'preface' ||
                          button.name == 'preamble' ||
                          button.name == 'formula' ||
                          button.name == 'conclusions')) {
                var pButton = DocProperties.getChildConfigByName(button, 'p') || DocProperties.getFirstButtonByName("p", "common");
                
                var textGroups = me.getTextChildrenGroups(node);

                if ( textGroups.length ) {
                    Ext.each(textGroups, function(group) {
                        var beakingSpans = group.filter(function(el) {
                            return ( el.nodeType == DomUtils.nodeType.ELEMENT && 
                                    Ext.fly(el).is('.'+DomUtils.breakingElementClass) );
                        });
                        if ( beakingSpans.length != group.length ) {
                            var wrapper = me.wrapListOfNodes(group);
                            nodesToMark.push({
                                node: wrapper,
                                button: pButton
                            });
                        }
                    });
                }
            }
        });

        if(nodesToMark.length) {
            Ext.each(nodesToMark, function(el) {
                var button = el.button || DocProperties.getFirstButtonByName("p", "common");
                me.requestMarkup(button, {
                    silent : true,
                    noEvent : true,
                    nodes : el.node
                });    
            });
        }
    },
    
        wrapListOfNodes: function(nodes) {
        if ( !nodes.length ) return;

        var newWrapper = Ext.DomHelper.createDom({
            tag : 'div',
            cls : DomUtils.tempParsingClass
        });

        nodes[0].parentNode.insertBefore(newWrapper, nodes[0]);
        for ( var i in nodes) {
            newWrapper.appendChild(nodes[i]);
        }

        return newWrapper;
    },

    getTextChildrenGroups: function(node) {
        var textGroups = [], group = [];

        for ( var i = 0; i < node.childNodes.length; i++ ) {
            var child = node.childNodes[i];
            var fly = Ext.fly(child);
            if ( child.nodeType == DomUtils.nodeType.TEXT || 
                child.nodeName.toLowerCase() == 'br' || 
                (child.nodeName.toLowerCase() == 'span' && 
                !fly.is('.num') && !fly.is('.heading') && !fly.is('.subheading') ) ) {

                group.push(child);
            } else {
                textGroups.push(group.slice(0));
                group = [];
            }
        }
        if ( group.length ) {
            textGroups.push(group);
        }

        return textGroups;
    },

    parseElement: function(node, callback) {
        var me = this, button = DomUtils.getButtonByElement(node);
        if( button ) {
            switch(button.name) {
                case 'docDate':
                case 'date':
                    me.parseInsideDate(node, button, callback);
                    break;
                case 'preface':
                    me.parseInsidePreface(node, button, callback);
                    break;
                case 'preamble':
                    me.parseInsidePreamble(node, button, callback);
                    break;
                case 'conclusions':                     
                    me.parseInsideConclusions(node, button, callback);
                    break;
                case 'body':
                    me.parseInsideBody(node, button, callback);
                    break;
                default:
                    Ext.callback(callback);
            }
        } else {
            Ext.callback(callback);
        }
    },

    parseInsidePreamble: function(node, button, callback) {
        var me = this, contentToParse = Ext.fly(node).getHTML();

        var callDocType = function() {
            me.callParser("docType", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseDocTypes([jsonData.response[0]], node);
                }
                Ext.callback(callback);
            }, callback);
        };

        me.callParser("enactingFormula", contentToParse, function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData) {
                me.parseEnactingFormula(jsonData, node, button);
            }
            callDocType();
        }, callDocType);
    },

    parseInsideDate: function(node, button, callback) {
        var me = this, widgetConfig = DocProperties.getNodeWidget(node),
            contentToParse = Ext.fly(node).getHTML();
        me.callParser("date", Ext.util.Format.stripTags(contentToParse), function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData.response.dates) {
                var dateObj = Ext.Object.getValues(jsonData.response.dates)[0];
                if ( dateObj &&widgetConfig &&
                         widgetConfig.attributes && widgetConfig.attributes.date.name ) {
                    node.setAttribute(widgetConfig.attributes.date.name, dateObj.date);
                }
            }
            Ext.callback(callback);
        }, callback);
    },

    parseInsidePreface: function(node, button, callback) {
        var me = this, contentToParse = Ext.fly(node).getHTML();

        var callDate = function() {
            me.callParser("docDate", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseDocDate(jsonData, node, button);
                }
                Ext.callback(callback);
            }, callback);
        };

        me.callParser("docNum", contentToParse, function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData) {
                me.parseDocNum(jsonData, node, button);
            }
            callDate();
        }, callDate);

    },

    parseInsideConclusions: function(node, button, callback) {
        var me = this, contentToParse = Ext.fly(node).getHTML();

        var callDate = function() {
            me.callParser("docDate", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseDocDate(jsonData, node, button);
                }
                Ext.callback(callback);
            }, callback);
        };

        var callAutority = function() {
            me.callParser("authority", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseAuthorityElements(jsonData, node, button);
                }
                callDate();
            }, callDate);
        };

        me.callParser("location", contentToParse, function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData) {
                me.parseLocation(jsonData, node, button);
            }
            callAutority();
        }, callAutority);
    },

    parseInsideBody: function(node, button, callback) {
        var me = this, contentToParse = Ext.fly(node).getHTML();
        me.callParser("body", contentToParse, function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData) {
                try {
                    me.parseBodyParts(jsonData, node, button);    
                } catch(e) {
                    Ext.log({level: "error"}, e);
                };
            }
            Ext.callback(callback);
        }, callback);
    },

    /**
     * This function call parsers for passed elements
     * @param {HTMLElement[]} elements Elements to parse
     * @param {Object} [config]
     */
    parseElements : function(elements, config, callback) {
        var me = this, app = me.application;

        if (config.silent || !elements.length) {
            Ext.callback(callback);
        } else {
            var nums = elements.length,
                callCallback = function() {
                    if(!--nums) {
                        Ext.callback(callback);
                    }
                };
            Ext.each(elements, function(markedNode) {
                me.parseElement(markedNode, callCallback);
            });
        }
    },
    
    /**
     * This function marks the docDate
     * @param {Object} data An object with date result from parser
     * @param {HTMLELement} node
     * @param {Object} editor An istance of the editor controller
     * @param {Object} app A reference to the whole application object (to fire global events)
     * @param {Object} button A reference to the button used for marking
     */
        parseDocDate : function(data, node, button) {
        var me = this, dates = data.response.dates, app = me.application, 
            editor = me.getController("Editor"), markButton = DocProperties.getChildConfigByName(button,"docDate"), 
            attributeName = markButton.rules.askFor.date1.insert.attribute.name;
        config = {
            markButton : markButton
        };
        if (dates) {
            Ext.Object.each(dates, function(item) {
                var dateParsed = dates[item];
                config.marker = {
                    silent : true,
                    attribute : {
                        name : attributeName,
                        value : dateParsed.date
                    }
                };
                me.searchInlinesToMark(node, dateParsed.match, config);
            }, me);
        }
    },

    parseEnactingFormula: function(data, node, button) {
        var me = this, formulas = data.response,
            markButton = DocProperties.getChildConfigByName(button, "formula"),
            nodes = [],
            config = {
                wrapperTag: 'div',
                markButton : markButton,
                marker: {
                    attribute : {
                        name : 'name',
                        value : 'enactingFormula'
                    }
                }
            };

        if (formulas.length) {
            Ext.each(formulas, function(item) {
                if(!Ext.isEmpty(item.enactingFormula)) {
                    nodes = Ext.Array.push(nodes, me.searchInlinesToMark(node, item.enactingFormula, config));
                }
            }, me);

            Ext.each(nodes, function(item) {
                if ( Ext.fly(item.parentNode).is('.block') ) {
                    item.parentNode.parentNode.appendChild(item);
                }
            }, me);
            me.addChildWrapper(nodes);
        }
    },
    
    parseLocation: function(data, node, button) {
        var me = this, locations = data.response,
            markButton = DocProperties.getChildConfigByName(button, "location"),
            nodes = [];
        config = {
            markButton : markButton,
            marker: {
                silent : true
            }
        };
        if (locations.length) {
            Ext.each(locations, function(item) {
                if(!Ext.isEmpty(item.string)) {
                    me.searchInlinesToMark(node, item.string, config, null, function(location) {
                        nodes.push(location);
                    });
                }
            }, me);

            if (nodes.length) {
                me.addLocationMetadata(nodes);
                me.requestMarkup(markButton, {
                    silent : true,
                    noEvent : true,
                    nodes : nodes
                });
            }
        }
    },

    addLocationMetadata: function(nodes) {
        var me = this, prefix = Language.getAttributePrefix(),
            attr = prefix+"refersTo";
        Ext.each(nodes, function(node) {
            var text = DomUtils.getTextOfNode(node);
                id = text.replace(/\s/g, "").toLowerCase().trim();
            node.setAttribute(attr, "#"+id);
            me.addMetaItem("references", {
                name: "TLCLocation",
                attributes: [{
                    name: "showAs",
                    value: text
                },{
                    name: prefix+"href",
                    value: "/ontology/location/"+DocProperties.documentInfo.docLocale+"/"+id
                },{
                    name: "eId",
                    value: id
                }]
            });
        });
    },

    parseAuthorityElements: function(data, node, button) {
        var me = this, signatures = data.response, app = me.application, 
            editor = me.getController("Editor"), sigButton = DocProperties.getChildConfigByName(button, "signature"),
            roleNodes = [], personNodes = [], sigNodes = [];
        config = {
            app : app,
            editor : editor,
            markButton : sigButton,
            marker: {
                silent : true
            }
        };
        if (signatures.length) {
            Ext.each(signatures, function(item) {
                var roleNode = null, personNode = null, signature;
                if(!Ext.isEmpty(item.authority)) {
                    roleNode = me.detectRole(item.authority, node, Ext.clone(config));
                    if(roleNode) {
                        roleNodes.push(roleNode);
                    }
                }
                if(!Ext.isEmpty(item.signature)) {
                    personNode = me.detectPerson(item.signature, node, Ext.clone(config));
                    if(personNode) {
                        personNodes.push(personNode);
                    }
                }
                signature = me.wrapSignature(roleNode, personNode);
                if(signature) {
                    sigNodes.push(signature);
                }
            }, me);
            if (sigNodes.length) {
                me.requestMarkup(sigButton, {
                    silent : true,
                    noEvent : true,
                    nodes : sigNodes
                });
            }
            if (roleNodes.length) {
                var roleButton = DocProperties.getChildConfigByName(sigButton, "role");
                me.requestMarkup(roleButton, {
                    silent : true,
                    noEvent : true,
                    nodes : roleNodes
                });
            }
            if (personNodes.length) {
                var personButton = DocProperties.getChildConfigByName(sigButton, "person");
                me.requestMarkup(personButton, {
                    silent : true,
                    noEvent : true,
                    nodes : personNodes
                });
            }
            Ext.defer(function() {
                me.addRoleMetadata(roleNodes);
                me.addPersonMetadata(personNodes);
            }, 100);
        }
    },
    
    addMetaItem: function(parent, config) {
        var docMeta = this.getController("Editor").getDocumentMetadata(),
        langPrefix = Language.getAttributePrefix(),
        metaDom = docMeta.originalMetadata.metaDom,
        parent = metaDom.querySelector('[class~="'+parent+'"]'), metaNode;
        if(parent) {
            metaNode = this.objToDom(metaDom.ownerDocument, config);
            parent.appendChild(metaNode);
        }
    },

    addRoleMetadata: function(nodes) {
        var me = this, prefix = Language.getAttributePrefix(),
            attr = prefix+"refersTo";
        Ext.each(nodes, function(node) {
            var text = DomUtils.getTextOfNode(node);
                id = text.replace(/\s/g, "").toLowerCase().trim();
            node.setAttribute(attr, "#"+id);
            me.addMetaItem("references", {
                name: "TLCRole",
                attributes: [{
                    name: "showAs",
                    value: text
                },{
                    name: prefix+"href",
                    value: "/ontology/roles/"+DocProperties.documentInfo.docLocale+"/"+id
                },{
                    name: "eId",
                    value: id
                }]
            });
        });
    }, 

    addPersonMetadata: function(nodes) {
        var me = this, prefix = Language.getAttributePrefix(),
            attr = prefix+"refersTo";
        Ext.each(nodes, function(node) {
            var text = DomUtils.getTextOfNode(node);
                id = text.replace(/\s/g, "").toLowerCase().trim(),
                signature = Ext.fly(node).parent(".signature"),
                asAttribute = "", role = null;
            

            role = (signature) ? signature.down(".role", true) : null;
            asAttribute = (role) ? role.getAttribute(attr) : "";
            node.setAttribute(prefix+"as", asAttribute);
            node.setAttribute(attr, "#"+id);

            me.addMetaItem("references", {
                name: "TLCPerson",
                attributes: [{
                    name: "showAs",
                    value: text
                },{
                    name: prefix+"href",
                    value: "/ontology/roles/"+DocProperties.documentInfo.docLocale+"/"+id
                },{
                    name: "eId",
                    value: id
                }]
            });
        });
    },

    wrapSignature: function(roleNode, personNode) {
        var node = roleNode || personNode, parent, children,
            firstNode = personNode, secondNode = roleNode, fIndex, sIndex;

        if(node) {
            parent = node.parentNode;
            children = Ext.Array.toArray(parent.children);
            fIndex = children.indexOf(roleNode);
            sIndex = children.indexOf(personNode);
            if(fIndex < sIndex) {
                firstNode = roleNode;
                secondNode = personNode;
            } else if(fIndex == sIndex) {
                return;
            }
            firstNode = firstNode || secondNode;
            secondNode = secondNode || firstNode;
            if(firstNode.parentNode && secondNode.parentNode && 
                        firstNode.parentNode == secondNode.parentNode) {
                var newWrapper = Ext.DomHelper.createDom({
                    tag : 'span'
                });
                firstNode.parentNode.insertBefore(newWrapper, firstNode);
                this.wrapPartNodeSibling(newWrapper, null, function(sibling) {
                    if(sibling === secondNode) {
                        return true;
                    }
                    return false;
                });
                return newWrapper;
            }
        }
    },

    detectRole: function(matchStr, node, config) {
        var me = this, markButton = DocProperties.getChildConfigByName(config.markButton, "role");
        config.markButton = markButton, returnNode = null;
        var returnNode = me.textNodeToSpan(node, matchStr);
        return returnNode;
    },

    detectPerson: function(matchStr, node, config) {
        var me = this, markButton = DocProperties.getChildConfigByName(config.markButton, "person");
        config.markButton = markButton, returnNode = null;
        returnNode = me.textNodeToSpan(node, matchStr);
        return returnNode;
    },
    
    textNodeToSpan : function(node, matchStr) {
        if (!node | !matchStr) return;
        var me = this, resList = DomUtils.smartFindTextNodes(matchStr, node);
        var nodeToMark = null;
        //console.log(matchStr, resList);
        Ext.each(resList, function(res) {
            if ( nodeToMark || (res[0] && Ext.fly(res[0].node).is('.'+DomUtils.tempParsingClass)) ) return;
            var textNodes = [];
            Ext.each(res, function(obj) {
                var splittedNodes = me.splitNode(obj.node, obj.str);
                //console.log(obj.str, splittedNodes);
                textNodes.push(splittedNodes[0]);
            });
            if ( textNodes.length ) {
                var newWrapper = Ext.DomHelper.createDom({
                    tag : 'span',
                    cls : DomUtils.tempParsingClass
                });
                textNodes[0].parentNode.insertBefore(newWrapper, textNodes[0]);
                var lastNode = textNodes[textNodes.length-1];
                //console.log(lastNode, textNodes);
                me.wrapPartNodeSibling(newWrapper, null, function(sibling) {
                    return (sibling == lastNode);
                });
                nodeToMark = newWrapper;
            }
        }, this);
        return nodeToMark;
    },

    splitNode: function(tnode, str) {
        var index, nodes = [], newNode;
        while ((!index | index != -1) && tnode && ( index = tnode.data.indexOf(str)) != -1) {
            newNode = tnode;
            if (index > 0) {
                //TODO: fix bug, IndexSizeError: Index or size is negative or greater than the allowed amount
                newNode = newNode.splitText(index);
            }
            if (newNode.data.length > str.length) {
                tnode = newNode.splitText(str.length);
                newNode = tnode.previousSibling;
            } else {
                index = -1;
            }

            nodes.push(newNode);
        };
        return nodes;
    },

    objToDom: function(doc, obj) {
        var me = this, node, childNode;
        if(obj.name) {
            node = doc.createElement("div");
            node.setAttribute("class", obj.name);
            Ext.each(obj.attributes, function(attribute) {
                node.setAttribute(attribute.name, attribute.value);
            });
            if(!Ext.isEmpty(obj.text)) {
                childNode = doc.createTextNode(obj.text);
                node.appendChild(childNode);               
            } else {
                Ext.each(obj.children, function(child) {
                    childNode = me.objToDom(doc, child);
                    if(childNode) {
                        node.appendChild(childNode);
                    }
                });    
            }
        }
        return node;
    },
    
    parseDocTypes : function(docTypes, node) {
        var me = this, app = me.application, 
            editor = me.getController("Editor"),
             markButton = DocProperties.getFirstButtonByName('docType');
        config = {
            markButton : markButton
        };
        if (docTypes && docTypes.length) {
            Ext.each(docTypes, function(docType) {
                if(docType) {
                    var docString = docType.string;
                    config.marker = {
                        silent : true
                    };
                    me.searchInlinesToMark(node, docString, config);    
                }
            }, me);
        }
    },
    
    parseDocNum : function(data, node, button) {
        var me = this, response = data.response, markButton = DocProperties.getChildConfigByName(button, 'docNumber'), 
            app = me.application, editor = me.getController("Editor"), config = {
                markButton : markButton,
                marker : {
                    silent : true
                }
            };
        if (response) {
            Ext.each(response, function(item) {
                var docNumImpossible = me.docNumImpossibleParents;
                me.searchInlinesToMark(node, item.match.trim(), config, function(n) {
                    var extNode = Ext.get(n);
                    if(extNode) {
                        for (var i = 0; i < docNumImpossible.length; i++) {
                            if (extNode.up(docNumImpossible[i])) {
                                return false;
                            }
                        }    
                    }
                    
                    return true;
                });
            }, me);
        }

    },

    /**
     * This function all occurences of the matchStr in the node and fire mark event for
     * those text nodes that passed the filter function.
     * @param {HTMLElement} node Search in this node
     * @param {String} matchStr The string to search
     * @param {Object} config Configuration object that have the marker object inside
     * example: {
     *      app:app,
     *      editor:editor,
     *      markButton: markButton,
     *      marker:{silent:true}
     * }
     * @param {function} [filter] The text node will be passed to this function
     * if it returns false the node will be skipped
     */
    searchInlinesToMark : function(node, matchStr, config, filter, beforeMarking, noMarking) {
        if (!node | !matchStr | !(config && config.marker && config.markButton))
            return;
        var me = this, resList = DomUtils.smartFindTextNodes(matchStr, node);
        var nodesToMark = [];

        var wrapperTag = config.wrapperTag || 'span';

        Ext.each(resList, function(res) {
            if (res[0] && Ext.isFunction(filter)) {
                if (!filter(res[0].node))
                    return;
            }
            var textNodes = [];
            Ext.each(res, function(obj) {
                var splittedNodes = me.splitNode(obj.node, obj.str);
                if ( splittedNodes.length ) {
                    textNodes.push(splittedNodes[0]);
                }
            });
            if ( textNodes.length ) {
                var newWrapper = Ext.DomHelper.createDom({
                    tag : wrapperTag,
                    cls : DomUtils.tempParsingClass
                });
                textNodes[0].parentNode.insertBefore(newWrapper, textNodes[0]);
                var lastNode = textNodes[textNodes.length-1];
                me.wrapPartNodeSibling(newWrapper, null, function(sibling) {
                    return (sibling == lastNode);
                });

                if (Ext.isFunction(beforeMarking)) {
                    if(!beforeMarking(newWrapper)) {
                        return;
                    }
                }

                if (config.marker.attribute && config.marker.attribute.name && config.marker.attribute.value) {
                    newWrapper.setAttribute(Language.getAttributePrefix() + config.marker.attribute.name, config.marker.attribute.value);
                }

                nodesToMark.push(newWrapper);
            }
        }, this);

        if( nodesToMark.length && !noMarking) {
            me.requestMarkup(config.markButton, {
                silent : true,
                noEvent : true,
                nodes : nodesToMark
            });
        }
        return nodesToMark;
    },

    wrapPartNodeSibling : function(wrapNode, guardFunction, isLastNodeFunction) {
        var sibling = wrapNode.nextSibling;
        while (sibling) {
            if (Ext.isFunction(guardFunction)) {
                if (guardFunction(sibling)) {
                    break;
                }
            }
            wrapNode.appendChild(sibling);
            if (Ext.isFunction(isLastNodeFunction)) {
                if (isLastNodeFunction(sibling)) {
                    break;
                }
            }
            sibling = wrapNode.nextSibling;
        }
    },

    wrapPartNode : function(partNode, delimiterNode) {
        var newWrapper = Ext.DomHelper.createDom({
            tag : 'div',
            cls : DomUtils.tempParsingClass
        });
        while (partNode.parentNode && partNode.parentNode != delimiterNode) {
            partNode = partNode.parentNode;
        }
        if(partNode.parentNode) {
            partNode.parentNode.insertBefore(newWrapper, partNode);    
        }
        newWrapper.appendChild(partNode);
        return newWrapper;
    },
    
    wrapBlockList: function(partName, parts, node, button) {
        var me = this,
            blockButton = DocProperties.getChildConfigByName(button,'blockList') || DocProperties.getFirstButtonByName('blockList'),
            itemButton = DocProperties.getChildConfigByName(blockButton, partName),
            numButton = DocProperties.getChildConfigByName(itemButton, "num"),
            introButton = DocProperties.getChildConfigByName(blockButton, 'listIntroduction'),
            config = {
                marker: {},
                markButton: itemButton 
            }, items = [], nums = [];
            console.log('initBloc');
        Ext.each(parts, function(element) {
            if(!element.value.trim()) return; 
            me.searchInlinesToMark(node, element.value, config, null, function(node) {
                var wrapNode = Ext.DomHelper.createDom({
                    tag : 'div',
                    cls : DomUtils.tempParsingClass
                });
                DomUtils.moveChildrenNodes(node, wrapNode);
                node.parentNode.insertBefore(wrapNode, node);
                node.parentNode.removeChild(node);
                if ( element.numitem.trim() ) {
                    me.searchInlinesToMark(wrapNode, element.numitem, config, null, function(numNode) {
                        numNode.setAttribute('class', DomUtils.tempParsingClass);
                        nums.push(numNode);
                    });
                }
                me.wrapItemText(wrapNode);
                items.push(wrapNode);
            });
        }, this);
        if (items.length ) {
            var wrapBlocks = [];
            var listIntroductions = [];
            var itemsToInsert = Ext.Array.clone(items);

            while( itemsToInsert.length ) {
                var wrapNode = Ext.DomHelper.createDom({
                    tag : 'div',
                    cls : DomUtils.tempParsingClass
                });
                
                itemsToInsert[0].parentNode.insertBefore(wrapNode, itemsToInsert[0]);

                // List introduction
                var prevText = DomUtils.getPreviousTextNode(wrapNode, true);
                if ( prevText && DomUtils.getTextOfNode(prevText).trim().match(/:$/) ) {
                    var listWrapper = Ext.DomHelper.createDom({
                        tag : 'span'
                    });
                    // Include saved quote
                    var posList = Ext.fly(prevText).prev("[poslist]", true);
                    if( posList ) {
                        var prevPrev = DomUtils.getPreviousTextNode(posList, true);
                        if ( prevPrev ) {
                            listWrapper.appendChild(prevPrev);
                        }
                        listWrapper.appendChild(posList);
                    }
                    listWrapper.appendChild(prevText);
                    wrapNode.appendChild(listWrapper);
                    listIntroductions.push(listWrapper);
                }


                me.wrapPartNodeSibling(wrapNode, function(node) {
                    if ( itemsToInsert.length != Ext.Array.remove(itemsToInsert, node).length) {
                        return false;
                    }
                    if ( node.nodeType == DomUtils.nodeType.ELEMENT &&  
                                (node.nodeName.toLowerCase() == "br") || 
                                 Ext.fly(node).hasCls(DomUtils.breakingElementClass)) {
                        return false;
                    } else if ( node.nodeType == DomUtils.nodeType.TEXT && 
                                Ext.isEmpty(node.data.trim()) ) {
                        return false;
                    }
                    return true;
                });
                wrapBlocks.push(wrapNode);
            }
            
            me.requestMarkup(blockButton, {
                silent : true,
                noEvent : true,
                nodes : wrapBlocks
            });

            me.requestMarkup(introButton, {
                silent : true,
                noEvent : true,
                nodes : listIntroductions
            });

            me.requestMarkup(itemButton, {
                silent : true,
                noEvent : true,
                nodes : items
            });

            if ( nums.length ) {
                me.requestMarkup(numButton, {
                    silent : true,
                    noEvent : true,
                    nodes : nums
                });
            }
        }
    },
    
    wrapItemText: function(node) {
        var me = this,
            num = node.querySelector('.num, .'+DomUtils.tempParsingClass),
            initNode = (num) ? num.nextSibling : node.firstChild,
            newWrapper = me.wrapPartNode(initNode, node),
            button = DocProperties.getFirstButtonByName("p", "common");

        me.wrapPartNodeSibling(newWrapper);
        me.requestMarkup(button, {
            silent : true,
            noEvent : true,
            nodes : [newWrapper]
        });
    },
    
    markOlBlockList: function(node) {
        var me = this,
            blockButton = DocProperties.getFirstButtonByName('blockList'),
            itemButton = DocProperties.getChildConfigByName(blockButton, "item"),
            introButton = DocProperties.getChildConfigByName(blockButton, 'listIntroduction'),
            numButton = DocProperties.getChildConfigByName(itemButton, "num"),
            toMarkNodes = node.querySelectorAll("ol.toMark"),
            numSufix = ")";
        Ext.each(toMarkNodes, function(markNode) {
            var wrapNode = Ext.DomHelper.createDom({
                tag : 'div',
                cls : DomUtils.tempParsingClass
            }), items = [], listIntroductions = [], nums = [];
            DomUtils.moveChildrenNodes(markNode, wrapNode);
            markNode.parentNode.insertBefore(wrapNode, markNode);
            markNode.parentNode.removeChild(markNode);

            // List introduction
            var prevText = DomUtils.getPreviousTextNode(wrapNode, true);
            if ( prevText && DomUtils.getTextOfNode(prevText).trim().match(/:$/) ) {
                var listWrapper = Ext.DomHelper.createDom({
                    tag : 'span'
                });
                // Include saved quote
                var posList = Ext.fly(prevText).prev("[poslist]", true);
                if( posList ) {
                    var prevPrev = DomUtils.getPreviousTextNode(posList, true);
                    if ( prevPrev ) {
                        listWrapper.appendChild(prevPrev);
                    }
                    listWrapper.appendChild(posList);
                }
                listWrapper.appendChild(prevText);
                Ext.fly(wrapNode).insertFirst(listWrapper);
                listIntroductions.push(listWrapper);
            }

            Ext.each(wrapNode.querySelectorAll('li'), function(li, index) {
                var itemNode = Ext.DomHelper.createDom({
                    tag : 'div',
                    cls : DomUtils.tempParsingClass
                });
                var numNode = Ext.DomHelper.createDom({
                    tag : 'span',
                    cls : DomUtils.tempParsingClass,
                    html: (index+1)+numSufix
                });
                DomUtils.moveChildrenNodes(li, itemNode);
                li.parentNode.insertBefore(itemNode, li);
                li.parentNode.removeChild(li);

                Ext.fly(itemNode).insertFirst(numNode);
                me.wrapItemText(itemNode);
                items.push(itemNode);
                nums.push(numNode);
            });

            me.requestMarkup(blockButton, {
                silent : true,
                noEvent : true,
                nodes : wrapNode
            });

            me.requestMarkup(introButton, {
                silent : true,
                noEvent : true,
                nodes : listIntroductions
            });

            me.requestMarkup(itemButton, {
                silent : true,
                noEvent : true,
                nodes : items
            });

            me.requestMarkup(numButton, {
                silent : true,
                noEvent : true,
                nodes : nums
            });

        });

    },

    wrapBodyParts : function(partName, parts, node, button) {
        var me = this, app = me.application, 
            markButton, numButton, nodesToMark = [], numsToMark = [], 
            markButton = DocProperties.getChildConfigByName(button, partName) || DocProperties.getFirstButtonByName(partName), 
            numButton = DocProperties.getChildConfigByName(markButton,"num");

        if( partName == "item" ) {
            me.wrapBlockList(partName, parts, node, button);
            return;
        }

        Ext.each(parts, function(element) {
            if(!element.value.trim()) return; 
            var textNodesObj = DomUtils.smartFindTextNodes(element.value, node),
                parent, partNode;
            var txt = DomUtils.findTextNodes(element.value, node);
            if ( !textNodesObj.length ) return;

            var firstNode = textNodesObj[0][0].node;

            if ( Ext.fly(firstNode).parent("." + DomUtils.tempParsingClass, true) )  return;

            partNode = (firstNode.parentNode == node) ? firstNode: firstNode.parentNode;
            var newWrapper = me.wrapPartNode(partNode, node);
            element.wrapper = newWrapper;
            nodesToMark.push(newWrapper);

            numsToMark = Ext.Array.push(numsToMark, me.newTextNodeToSpans(textNodesObj[0], element.value));
        }, this);
        Ext.each(nodesToMark, function(node) {
            me.wrapPartNodeSibling(node, function(sibling) {
                var extSib = new Ext.Element(sibling), elButton = DomUtils.getButtonByElement(sibling);
                /* If sibling is marked with the same button or it is temp element then stop the loop */
                if ((elButton && (elButton.id === markButton.id)) || (extSib.is('.' + DomUtils.tempParsingClass))) {
                    return true;
                }
                return false;
            });
        }, this);
        if (numsToMark.length > 0) {
            me.requestMarkup(numButton, {
                silent : true,
                noEvent : true,
                nodes : numsToMark
            });
        }
        if (nodesToMark.length > 0) {
            me.requestMarkup(markButton, {
                silent : true,
                noEvent : true,
                nodes : nodesToMark
            });
        }
        // Do contains elements
        Ext.each(parts, function(element) {
            var contains = element.contains, containsPartName = Ext.Object.getKeys(contains)[0];
            if (containsPartName && contains[containsPartName]) {
                try {
                    me.wrapBodyParts(containsPartName, contains[containsPartName], element.wrapper, button);    
                } catch (e) {
                    Ext.log({level: "error"}, "aaa"+e);
                }
            }
        }, this);
    },

    parseBodyParts : function(data, node, button) {
        var me = this, app = me.application, parts = data.response, partName;
        if (parts) {
            partName = Ext.Object.getKeys(parts)[0];
            if (partName) {
                me.wrapBodyParts(partName, parts[partName], node, button);
            }
        }
    },

    wrapStructurePart : function(name, delimiter, prevPartNode) {
        var me = this, app = me.application, editor = me.getController("Editor"), 
            body = editor.getBody(), partNode, wrapNode, 
            iterNode = body.querySelector('*[class="'+DocProperties.getDocClassList()+'"]');

        if (!prevPartNode) {
            var txtNode = DomUtils.smartFindTextNodes(delimiter.value, iterNode)[0];
            //console.log(txtNode);
            if(txtNode) {
                var firstNode = txtNode[0].node;
                wrapNode = Ext.DomHelper.createDom({
                    tag : 'div',
                    cls : DomUtils.tempParsingClass
                });
                while(firstNode.previousSibling) {
                    if(wrapNode.firstChild) {
                        wrapNode.insertBefore(firstNode.previousSibling, wrapNode.firstChild);
                    } else {
                        wrapNode.appendChild(firstNode.previousSibling);
                    }
                }
                firstNode.parentNode.insertBefore(wrapNode, firstNode);
                if (delimiter.flags && delimiter.flags.indexOf("i") != -1) {
                    var lastNode = txtNode[txtNode.length-1].node;
                    me.wrapPartNodeSibling(wrapNode, null, function(sibling) {
                        return (sibling == lastNode);
                    });
                }
            }
        } else if (prevPartNode.nextSibling) {
            partNode = prevPartNode.nextSibling;
            wrapNode = me.wrapPartNode(partNode, partNode.parentNode);
            if (delimiter.value) {
                me.wrapPartNodeSibling(wrapNode, function(sibling) {
                    if (delimiter.flags && delimiter.flags.indexOf("i") != -1) {
                        sibling = sibling.previousSibling;
                    }
                    if(sibling.nodeType == DomUtils.nodeType.TEXT) {
                        return sibling.data.indexOf(delimiter.value) != -1;
                    } else {
                        var textNodes = DomUtils.smartFindTextNodes(delimiter.value, sibling);
                        //console.log(textNodes);
                        if (textNodes.length > 0) {
                            return true;
                        }
                        return false;    
                    }
                    
                });

            } else {
                me.wrapPartNodeSibling(wrapNode);
            }
        }
        return wrapNode;
    },
    
    parseQuotes : function(data) {
        var me = this, app = me.application, 
            editor = me.getController("Editor"),
             markButton = DocProperties.getFirstButtonByName('quotedText'),
             markButtonStructure = DocProperties.getFirstButtonByName('quotedStructure'),
             body = editor.getBody(), structureToMark = [];
        config = {
            marker : {
                silent : true
            }
        };
        if (data && data.length) {
            Ext.each(data, function(quote) {
                if(quote.start.string && quote.quoted.string && quote.end.string) {
                    var string = quote.start.string+quote.quoted.string+quote.end.string;
                    //var string = quote.quoted.string;
                    // If the string doesn't contains tags
                    if(!string.match(DomUtils.tagRegex)) {
                        config.markButton = markButton;
                        me.searchInlinesToMark(body, string, config, null, function(node) {
                            me.removeQuotesFromQutedTextNode(node, quote);
                            if(node.parentNode && node.parentNode.nodeName.toLowerCase() == "span"
                                    && node.parentNode.childNodes.length == 3 && node.parentNode.parentNode) {
                                if(node.previousSibling) {
                                    node.parentNode.parentNode.insertBefore(node.previousSibling, node.parentNode);
                                }
                                if(node.nextSibling) {
                                    DomUtils.insertAfter(node.nextSibling, node.parentNode);
                                }
                            }
                            return true;
                        });
                    } else {
                        string = quote.quoted.string;
                        try {
                            structureToMark = Ext.Array.push(structureToMark, me.smartFindQuote(body, string));
                        } catch(e) {
                            console.log(e);
                        }
                    }   
                }
            }, me);

            if ( structureToMark.length ) {
                me.requestMarkup(markButtonStructure, {
                    nodes : structureToMark,
                    silent : true,
                    noEvent : true
                });
            }
        }
    },
    
    smartFindQuote : function(node, matchStr) {
        if (!node | !matchStr) return;
        var me = this;
        var resList = DomUtils.smartFindTextNodes(matchStr, node),
            nodesToMark = [];

        Ext.each(resList, function(res) {
            //if ( nodeToMark || (res[0] && Ext.fly(res[0].node).is('.'+DomUtils.tempParsingClass)) ) return;
            var textNodes = [];
            Ext.each(res, function(obj) {
                var splittedNodes = me.splitNode(obj.node, obj.str);
                //console.log(obj.str, splittedNodes);
                textNodes.push(splittedNodes[0]);
            });
            if ( textNodes.length ) {
                var newWrapper = Ext.DomHelper.createDom({
                    tag : 'div',
                    cls : DomUtils.tempParsingClass
                });
                textNodes[0].parentNode.insertBefore(newWrapper, textNodes[0]);
                var lastNode = textNodes[textNodes.length-1];
                //console.log(lastNode, textNodes);
                me.wrapPartNodeSibling(newWrapper, null, function(sibling) {
                    return (sibling == lastNode);
                });

                nodesToMark.push(newWrapper);
            }
        }, this);

        return nodesToMark;
    },

    removeQuotesFromQutedTextNode: function(node, quote) {
        var txtNode = this.searchAndSplitTextNode(node, quote.start.string);
        if(txtNode) {
            node.parentNode.insertBefore(txtNode.previousSibling, node);
        }
        txtNode = this.searchAndSplitTextNode(node, quote.end.string);
        if(txtNode) {
            DomUtils.insertAfter(txtNode, node);
        }
    },

    searchAndSplitTextNode: function(node, string) {
        var txtNode = DomUtils.findTextNodes(string, node)[0], strIndex;
        if(txtNode) {
            strIndex = txtNode.data.indexOf(string);
            if (!strIndex) {
                txtNode = txtNode.splitText(string.length);
            } else if(strIndex > 0) {
                txtNode = txtNode.splitText(strIndex);
            }
        }
        return txtNode;
    },

    parseStructure : function(data, callback) {
        var me = this, app = me.application, structure = data.structure, prevPartNode = null, 
            markButton, siblings;
        if (structure && structure.length && data.success) {
            var nums = structure.length,
                callCallback = function() {
                    if(!--nums) {
                        Ext.callback(callback);
                    }
                };

            Ext.each(structure, function(name) {
                if ((!Ext.isEmpty(data[name]) || prevPartNode) && 
                        !DomUtils.allNodesHaveClass(DomUtils.getSiblingsFromNode(prevPartNode), DomUtils.breakingElementClass)) {

                    prevPartNode = me.wrapStructurePart(name, data[name], prevPartNode);

                    if (prevPartNode) {
                        markButton = DocProperties.getFirstButtonByName(name);
                        var nodes = me.requestMarkup(markButton, {
                            nodes : [prevPartNode],
                            noEvent: true
                        });
                        me.onNodeChanged(nodes, {}, callCallback);
                    } else {
                        callCallback();
                    }
                } else {
                    callCallback();
                }
            });
        } else { // mark all as body
            markButton = DocProperties.getFirstButtonByName('body');
            var editor = me.getController('Editor'),
                docNode = editor.getBody().querySelector('.document');

            var wrapNode = Ext.DomHelper.createDom({
                tag : 'div',
                cls : DomUtils.tempParsingClass
            });

            if ( docNode ) {
                DomUtils.moveChildrenNodes(docNode, wrapNode);

                docNode.appendChild(wrapNode);

                var nodes = me.requestMarkup(markButton, {
                    nodes : [wrapNode],
                    noEvent: true
                });

                me.onNodeChanged(nodes, {}, callback);
            } else {
                callback();
            }
        }
    },
    
    parseReference: function(data) {
        var me = this, editor = me.getController("Editor"), 
            body = editor.getBody(), nodesToMark = [], button = DocProperties.getFirstButtonByName('ref');
            
        Ext.each(data, function(obj) {
             var matchStr = obj.ref,
                res = DomUtils.smartFindTextNodes(matchStr,body);
            Ext.each(res, function(tNodeGroup){
                if(!me.canPassNode(tNodeGroup[0].node, button.id, [DomUtils.tempParsingClass])){
                    return;
                }
                me.newTextNodeToSpans(tNodeGroup, matchStr, function(node){ 
                    var date = obj.date || "";
                    var docNum = obj.docnum || "";
                    var artnum = obj.num || "";
                    var href = "/"+DocProperties.documentInfo.docLocale+"/act/"+date+"/"+docNum+"#"+artnum;
                    node.setAttribute("akn_href", href);                
                    nodesToMark.push(node); 
                });
            }, this);
        }, this);
        if (nodesToMark.length>0) {
            me.requestMarkup(button, {silent:true, noEvent : true, nodes:nodesToMark});
        }
    },
    
    /* This function decides if a node can pass by parent class or id
     * @param {HTMLElement} node
     * @param {String} parentButtonId if this is equal to parent's button id the function returns false
     * @param {String[]} [parentClasses] if parent has one of these classes the function returns false
     * @returns boolean
     */
    canPassNode : function(node,parentButtonId,parentClasses, parentButtonName){
        var parent = node.parentNode;
        if(parent){
            var parentId = parent.getAttribute(DomUtils.elementIdAttribute);
            if(DomUtils.getButtonIdByElementId(parentId) == parentButtonId){
                return false;
            }
            if(parentButtonName && parentId){
                var markedElement = DocProperties.getMarkedElement(parentId);
                if(markedElement && markedElement.button.name == parentButtonName)
                    return false;
            }
            var classes = parent.getAttribute("class");
            if(classes && parentClasses){
                for(var i=0; i<parentClasses.length; i++){
                    if(classes.indexOf(parentClasses[i])!=-1)
                        return false;
                }
            }
        }
        return true;
    },

    /**
     * This function returns the string template of parsing element
     * @param {String} [content] The content of parsing element
     * @param {String} [cls] The cutom class of parsing element
     * @returns {String}
     */
    getParsingTemplate : function(content, cls) {
        cls = (cls) ? " " + cls : '';
        content = (content) ? content : '';
        return "<span class=\"" + DomUtils.tempParsingClass + cls + "\">" + content + "</span>";
    },

    /* This function wrap part of textnode in span element(s)
     * can apply the passed function to every new element
     * Example of usage:
     * the result of calling
     * textNodeToSpans(<TextNode textContent="This is a textNode">, "textNode")
     * will be:
     * [<span class="tempParsingClass">textNode</span>]
     *
     * and the result of calling
     * textNodeToSpans(<TextNode textContent="This is a textNode">, "is")
     * will be:
     * [<span class="tempParsing">is</span>, <span class="tempParsing">is</span>]
     * one span for every occurrence of "is".
     *
     * @param {TextNode} tNode The textnode containing str
     * @param {String} str String to wrap in a span element,
     * can have multiple occurrences in tNode, every occurrence
     * will be wrapped in a span element
     * @param {Function} [applyFn] Function that takes the new node as argument
     *  to apply to every new element
     * @returns {HTMLElement[]} A list of span elements with "tempParsingClass" class
     * */
    textNodeToSpans : function(tNode, str, applyFn) {
        var index, spanElements = [];
        // This is a while instead of if because in the tNode may be
        // multiple occurrences of str, every occurrences will be a span
        while ((!index | index != -1) && ( index = tNode.data.indexOf(str)) != -1) {
            var newNode = tNode;
            if (index > 0) {
                newNode = newNode.splitText(index);
            }
            if (newNode.data.length > str.length) {
                tNode = newNode.splitText(str.length);
                newNode = tNode.previousSibling;
            } else {
                index = -1;
            }
            var newWrapper = Ext.DomHelper.createDom({
                tag : 'span',
                cls : DomUtils.tempParsingClass
            });
            if (newNode.parentNode) {
                newNode.parentNode.insertBefore(newWrapper, newNode);
                newWrapper.appendChild(newNode);
            }
            if (Ext.isFunction(applyFn)) {
                applyFn(newWrapper);
            }
            spanElements.push(newWrapper);
        };
        return spanElements;
    },
    
    newTextNodeToSpans : function(tNodeObjs, str, applyFn) {
        var me = this, spanElements = [], textNodes = [];
        Ext.each(tNodeObjs, function(obj) {
            var splitedNodes = me.splitNode(obj.node, obj.str);
            if ( splitedNodes.length ) {
                textNodes.push(splitedNodes[0]); //TODO: Take all
            }
        });
        if ( textNodes.length ) {
            var newWrapper = Ext.DomHelper.createDom({
                tag : 'span',
                cls : DomUtils.tempParsingClass
            });
            textNodes[0].parentNode.insertBefore(newWrapper, textNodes[0]);
            var lastNode = textNodes[textNodes.length-1];

            me.wrapPartNodeSibling(newWrapper, null, function(sibling) {
                return (sibling == lastNode);
            });

            if (Ext.isFunction(applyFn)) {
                applyFn(newWrapper);
            }
            spanElements.push(newWrapper);
        }
        return spanElements;
    },

    restoreQuotes: function(node) {
        var me = this, finalQuotes, 
            markButton = DocProperties.getFirstButtonByName('body') || 
                          DocProperties.getFirstButtonByName('mainBody'),
            markStructureButton = DocProperties.getFirstButtonByName('quotedStructure');
        Ext.each(me.quotedElements, function(quote, index) {
            var tmpEl  = node.querySelector("[poslist='"+index+"']");
            if(tmpEl) {
                tmpEl.parentNode.replaceChild(quote, tmpEl);    
            }
        });
        
        finalQuotes = node.querySelectorAll("[class~=quotedText], [class~=quotedStructure]");
        
        Ext.each(finalQuotes, function(quote) {
            me.callParser("body", Ext.fly(quote).getHtml(), function(result) {
                var jsonData = Ext.decode(result.responseText, true),
                    nodeToParse = quote, elName = DomUtils.getElementNameByNode(quote);
                if (jsonData) {
                    //TODO: else case
                    if(Ext.Object.getKeys(jsonData.response).length) {
                        if(elName == "quotedText") {
                            nodeToParse = Ext.DomHelper.createDom({
                                tag : 'div'
                            });
                            quote.parentNode.insertBefore(nodeToParse, quote);
                            DomUtils.moveChildrenNodes(quote, nodeToParse);
                            quote.parentNode.removeChild(quote);
                            me.requestMarkup(markStructureButton, {
                                nodes : [nodeToParse],
                                noEvent: true,
                                onFinish: function(nodes) {
                                    try {
                                        me.parseBodyParts(jsonData, nodes[0], markButton);    
                                    } catch(e) {};  
                                }
                            });
                        } else {
                            try {
                                me.parseBodyParts(jsonData, nodeToParse, markButton);    
                            } catch(e) {};    
                        }
                    }
                }
            });
        });
        
        me.quotedElements = [];
    },
    
    saveQuotes: function(node) {
        var me = this;
        me.quotedElements = node.querySelectorAll("[class~=quotedText], [class~=quotedStructure]");

        Ext.each(me.quotedElements, function(quote, index) {
            var tmpEl = Ext.DomHelper.createDom({
                tag : 'span'
            });
            tmpEl.setAttribute("poslist", index);
            quote.parentNode.replaceChild(tmpEl, quote);
            tmpEl.parentNode.normalize();
        });
    },
    
    addHcontainerHeadings: function(node) {
        var me = this, headings = [], subheadings = [],
            headingButton = DocProperties.getFirstButtonByName('heading'),
            subheadingButton = DocProperties.getFirstButtonByName('subheading'),
            elements = Ext.Array.unique(
                            Ext.Array.toArray(
                                node.querySelectorAll('.hcontainer > .hcontainer')
                            ).map(function(el) {
                                return el.parentNode;
                            })
                        );

        Ext.each(elements, function(el) {
            var num = Ext.fly(el).child('.num', true);
            var hcontainerChild = Ext.fly(el).child('.hcontainer', true);
            var headingNode = Ext.DomHelper.createDom({
                tag : 'span',
                cls : DomUtils.tempParsingClass
            });
            var subHeadingNode = Ext.DomHelper.createDom({
                tag : 'span',
                cls : DomUtils.tempParsingClass
            });
            if ( num ) {
                var iterNode = num;
                while ( iterNode.nextSibling && iterNode.nextSibling != hcontainerChild ) {
                    if ( Ext.isEmpty(DomUtils.getTextOfNode(headingNode).trim()) ) {
                        headingNode.appendChild(iterNode.nextSibling);
                    } else {
                        subHeadingNode.appendChild(iterNode.nextSibling);
                    }
                }
                if ( !Ext.isEmpty(DomUtils.getTextOfNode(headingNode).trim()) ) {
                    Ext.fly(headingNode).insertAfter(num);
                    if ( !Ext.isEmpty(DomUtils.getTextOfNode(subHeadingNode).trim()) ) {
                        Ext.fly(subHeadingNode).insertAfter(headingNode);
                        subheadings.push(subHeadingNode);
                    } else {
                        DomUtils.moveChildrenNodes(subheadings, headingNode, true);
                    }
                    headings.push(headingNode);
                } else {
                    while ( headingNode.firstChild ) {
                        el.insertBefore( headingNode.firstChild, hcontainerChild );
                    }
                }
            }
        });
        
        if ( headings.length ) {
            me.requestMarkup(headingButton, {
                silent : true,
                noEvent : true,
                nodes : headings
            });
        }

        if ( subheadings.length ) {
            me.requestMarkup(subheadingButton, {
                silent : true,
                noEvent : true,
                nodes : subheadings
            });
        }
    },
    
    normalizeNodes: function(node) {
        var me = this, 
            uselessNodes = node.querySelectorAll('br, .breaking+br, .breaking+.breaking, .hcontainer > br, .container > br');

        // Remove double breaking nodes
        Ext.each(uselessNodes, function(el) {
            if ( el.nodeName.toLowerCase() == 'br' ) {
                var next = el.nextSibling;
                var prev = el.previousSibling;
                if ( (next && next.nodeType == DomUtils.nodeType.ELEMENT && next.nodeName.toLowerCase() == 'br') ||
                     (prev && prev.nodeType == DomUtils.nodeType.ELEMENT && prev.nodeName.toLowerCase() == 'br') ||
                     (!Ext.fly(el.parentNode).is('.inline') && !Ext.fly(el.parentNode).is('.block')) ) {
                    el.parentNode.removeChild(el);
                }
            } else {
                el.parentNode.removeChild(el);
            }
        });

        var hcontainers = Ext.Array.toArray(node.querySelectorAll('.hcontainer')).filter(function(el) {
            if ( Ext.fly(el).child("div") ) {
                return true;
            }
        });

        var pToMark = [];
        Ext.each(hcontainers, function(hcontainer) {
            var textGroups = me.getTextChildrenGroups(hcontainer);
            if ( textGroups.length ) {
                Ext.each(textGroups, function(group) {
                    var breakingEls = group.filter(function(el) {
                        return ( (el.nodeType == DomUtils.nodeType.ELEMENT && 
                                Ext.fly(el).is('.'+DomUtils.breakingElementClass)) || 
                                (el.nodeType == DomUtils.nodeType.TEXT && Ext.isEmpty(el.data.trim()) ) );
                    });
                    var headingElements = group.filter(function(el) {
                        var fly = Ext.fly(el);
                        return ( el.nodeType == DomUtils.nodeType.ELEMENT && 
                                (fly.is('.num') || fly.is('.heading') || fly.is('.subheading')) );
                    });
                    if ( !headingElements.length && breakingEls.length != group.length ) {
                        var wrapper = me.wrapListOfNodes(group);
                        pToMark.push(wrapper);
                    }
                });
            }
        });

        Ext.each(node.querySelectorAll('.container'), function(node) {
            if ( !node.textContent.trim() ) {
                node.parentNode.removeChild(node);
            }
        });

        /*var blockListInsideP = node.querySelectorAll('.block > .blockList');

        Ext.each(blockListInsideP, function(node) {
            var block = node.parentNode;
            block.parentNode.insertBefore(node, block);
            if ( !block.textContent.trim().length ) {
                block.parentNode.removeChild(block);
            }
        });*/

        var button = DocProperties.getFirstButtonByName("p", "common");

        me.requestMarkup(button, {
            silent : true,
            noEvent : true,
            nodes : pToMark
        });
    },

    activateParsers : function() {
        var me = this, editor = me.getController("Editor"), 
            app = me.application, buttonName;

        if (!DocProperties.getLang()) {
            Ext.MessageBox.alert(Locale.strings.parsersErrors.LANG_MISSING_ERROR_TITLE, Locale.strings.parsersErrors.langMissingError);
            return;
        }
        app.fireEvent(Statics.eventsNames.progressStart, null, {
            value : 0.1,
            text : Locale.getString("parsing", me.getPluginName())
        });

        editor.removeBookmarks();

        editor.parserWorking = true;

        var body = editor.getBody();

        Ext.defer(function() {
            app.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("parsing", me.getPluginName()));
            
            var endParsing = function() {
                me.markOlBlockList(body);
                me.normalizeNodes(body);
                app.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("postParsing", me.getPluginName()));
                Ext.defer(function() {
                    editor.parserWorking = false;
                    Ext.defer(function() {
                        app.fireEvent('nodeChangedExternally', editor.getBody(), {
                            change : true,
                            silent: true
                        }, {
                            callback: function() {
                                app.fireEvent(Statics.eventsNames.progressEnd);
                            }
                        });    
                    }, 100);
                }, 5);
            };

            var callQuoteParser = function() {
                app.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("quoteParsing", me.getPluginName()));
                var content = editor.getContent();

                content = content.replace(/<([a-z][a-z0-9]*)[^>]*?(\/?)>/gi, "<$1$2>");

                me.callParser("quote", content, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                    if (jsonData) {
                        me.parseQuotes(jsonData.response);
                    }
                    callStrParser();
                }, function() {
                    callStrParser();
                });
            };

            var callStrParser = function() {
                var body = editor.getBody();
                app.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("structureParser", me.getPluginName()));
                me.saveQuotes(body);
                me.callParser("structure", editor.getContent(), function(result) {
                    var jsonData = Ext.decode(result.responseText, true);
                    if (jsonData) {
                        me.parseStructure(jsonData.response, function() {
                            me.restoreQuotes(body);
                            me.addHcontainerHeadings(body);
                            callReferenceParser();
                        });
                    }
                }, function() {
                    me.restoreQuotes(body);
                    callReferenceParser();
                });
            };
            
            var callReferenceParser = function() {
                app.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("referenceParser", me.getPluginName()));
                me.callParser("reference", editor.getContent(), function(result) {
                    var jsonData = Ext.decode(result.responseText, true);
                    if (jsonData) {
                        me.parseReference(jsonData.response);
                    }
                    endParsing();
                }, endParsing);
            };
            
            callQuoteParser();

        }, 5, me);
    },
    
    requestMarkup: function(button, config) {
        var marker = this.getController("Marker");
        return marker.autoWrap(button, config);
    },


    /**
     * This function call server side parser with different callbacks
     * @param {String} name
     * @param {String} sendString
     * @param {Function} success
     * @param {Function} failure
     * @param {Function} callback Call anyway
     */
    callParser : function(name, sendString, success, failure, callback) {
        var me = this, contentLang = DocProperties.getLang(), config = me.parsersConfig[name];

        if (!contentLang) {
            return;
        }

        if (config) {
            sendString = sendString.replace(/<br[^>]*>/g, "\n\n");
            Ext.Ajax.request({
                // the url of the web service
                url : config.url,
                timeout : me.parserAjaxTimeOut,
                // set the method
                method : config.method,
                params : {
                    s : sendString,
                    f : 'json',
                    l : contentLang,
                    doctype : DocProperties.getDocType()
                },
                success : function(result) {
                    result.responseText = result.responseText.replace(/\\n\\n/g, "<br />");
                    success(result);
                },
                failure : failure,
                callback : callback
            });
        } else if (failure) {
            failure();
            if (callback) {
                callback();
            }
        }
    },

    init : function() {
        var me = this;
        //Listening progress events
        me.application.on(Statics.eventsNames.afterLoad, me.onDocumentLoaded, me);
        me.application.on(Statics.eventsNames.nodeChangedExternally, me.onNodeChanged, me);
    }
});
