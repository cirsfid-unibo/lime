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

Ext.define('AknAutomaticMarkup.Controller', {
    extend : 'Ext.app.Controller',

    requires: ['AknMain.Reference', 'AknMain.LangProp'],

    config : {
        pluginName : 'akn-automatic-markup'
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
            'url' : 'parsers/date/index.php',
            'method' : 'POST'
        },
        'docNum' : {
            'url' : 'parsers/docNum/index.php',
            'method' : 'POST'
        },
        'list' : {
            'url' : 'parsers/list/index.php',
            'method' : 'POST'
        },
        'docDate' : {
            'url' : 'parsers/date/index.php',
            'method' : 'POST'
        },
        'body' : {
            'url' : 'parsers/body/index.php',
            'method' : 'POST'
        },
        'structure' : {
            'url' : 'parsers/structure/index.php',
            'method' : 'POST'
        },
        'reference' : {
            'url' : 'parsers/reference/index.php',
            'method' : 'POST'
        },
        'quote' : {
            'url' : 'parsers/quote/index.php',
            'method' : 'POST'
        },
        'docType': {
            'url' : 'parsers/doctype/index.php',
            'method' : 'POST'
        },
        'authority': {
            'url' : 'parsers/authority/index.php',
            'method' : 'POST'
        },
        'location': {
            'url' : 'parsers/location/index.php',
            'method' : 'POST'
        },
        'enactingFormula': {
            'url' : 'parsers/enactingFormula/index.php',
            'method' : 'POST'
        },
        'note': {
            'url' : 'parsers/note/index.php',
            'method' : 'POST'
        },
        'organization': {
            'url' : 'parsers/organization/index.php',
            'method' : 'POST'
        },
        'attachment': {
            'url' : 'parsers/attachment/index.php',
            'method' : 'POST'
        }
    },

    /**
     * @property {String[]} docNumImpossibleParents
     */
    docNumImpossibleParents : ["h1", "h2", "a"],

    init : function() {
        var me = this;
        //Listening progress events
        me.application.on(Statics.eventsNames.afterLoad, me.onDocumentLoaded, me);
        me.application.on(Statics.eventsNames.nodeChangedExternally, me.onNodeChanged, me);
        me.application.fireEvent(Statics.eventsNames.registerContextMenuBeforeShow, Ext.bind(me.beforeContextMenuShow, me));
    },

    onDocumentLoaded : function(docConfig) {
        var me = this;
        me.parserActivated = false;
        me.addParserMenuItem();
    },

    addParserMenuItem : function() {
        var me = this;
        menu = {
            text : Locale.getString("parseDocumentText", me.getPluginName()),
            tooltip : Locale.getString("parseDocumentTooltip", me.getPluginName()),
            icon : 'resources/images/icons/lightbulb.png',
            name : 'parseDocument',
            handler : function() {
                // if ( !me.parserActivated ) {
                    me.activateParsers();
                // } else {
                    // Ext.MessageBox.alert(Locale.getString("markedAlready", me.getPluginName()), Locale.getString("documentAllMarked", me.getPluginName()));
                // }
            }
        };
        me.application.fireEvent("addMenuItem", me, {
            menu : "editMenuButton",
            posIndex: 0
        }, menu);
    },

    onNodeChanged: function(nodes, config, callback) {
        var me = this;
        if(!config.unmark) {
            try {
                me.parseElements(nodes, config, function() {
                    me.addChildWrapper(nodes, config);
                    Ext.callback(callback);
                });
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
                            return DomUtils.nodeHasClass(el, DomUtils.breakingElementClass);
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

    getTextChildrenGroups: function(node, extraElements, isTextNodeFn) {
        extraElements = extraElements || [];
        var textGroups = [], group = [],
            groupElementsName = ["br", "sub", "sup", "mod", "quotedStructure", "quotedText"].concat(extraElements),
            headingNode = Ext.fly(node).last('.num,.heading,.subheading', true);

        for ( var i = 0; i < node.childNodes.length; i++ ) {
            var child = node.childNodes[i];
            // Don't consider the text before heading nodes
            if ( headingNode ) {
                if (child == headingNode) {
                    headingNode = null;
                }
                continue;
            }
            var fly = Ext.fly(child);

            if ( Ext.isFunction(isTextNodeFn) ) {
                if ( isTextNodeFn(child, fly) ) {
                    group.push(child);
                } else {
                     textGroups.push(group.slice(0));
                    group = [];
                }
            } else {
                if ( child.nodeType == DomUtils.nodeType.TEXT ||
                    groupElementsName.indexOf(child.nodeName.toLowerCase()) != -1 ||
                    groupElementsName.indexOf(DomUtils.getNameByNode(child)) != -1 ||
                    (child.nodeName.toLowerCase() == 'span' &&
                    !fly.is('.num') && !fly.is('.heading') && !fly.is('.subheading') ) ) {

                    group.push(child);
                } else {
                    textGroups.push(group.slice(0));
                    group = [];
                }
            }
        }
        if ( group.length ) {
            textGroups.push(group);
        }

        return textGroups;
    },

    parseElement: function(node, callback) {
        var me = this, button = DomUtils.getButtonByElement(node),
            editor = me.getController("Editor"), body = editor.getBody();
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
                    me.parseInsidePreamble(node, button, callback, body.querySelector('.docType'));
                    break;
                case 'conclusions':
                    me.parseInsideConclusions(node, button, callback);
                    break;
                case 'body':
                case 'mainBody':
                    me.parseInsideBody(node, button, callback);
                    break;
                case 'blockList':
                case 'list':
                    me.parseInsideList(node, button, callback);
                default:
                    Ext.callback(callback);
            }
        } else {
            Ext.callback(callback);
        }
    },

    parseInsidePreamble: function(node, button, callback, noDocType) {
        var me = this, contentToParse = Ext.fly(node).getHtml();

        var callDocType = function() {
            if (noDocType) {
                Ext.callback(callback);
            } else {
                me.callParser("docType", contentToParse, function(result) {
                    var jsonData = Ext.decode(result.responseText, true);
                    if (jsonData) {
                        me.parseDocTypes([jsonData.response[0]], node);
                    }
                    Ext.callback(callback);
                }, callback);
            }
        };

        var callAutority = function() {
            me.callParser("authority", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseDocAuthorityElements(jsonData, node, button);
                }
                callDocType();
            }, callDocType);
        };

        me.callParser("enactingFormula", contentToParse, function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData) {
                me.parseEnactingFormula(jsonData, node, button);
            }
            callAutority();
        }, callAutority);
    },

    parseInsideDate: function(node, button, callback) {
        var me = this, widgetConfig = DocProperties.getNodeWidget(node),
            contentToParse = Ext.fly(node).getHtml();
        me.callParser("date", Ext.util.Format.stripTags(contentToParse), function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData.response.dates) {
                var dateObj = Ext.Object.getValues(jsonData.response.dates)[0];
                if ( dateObj &&widgetConfig &&
                         widgetConfig.attributes && widgetConfig.attributes.date.name ) {
                    node.setAttribute(widgetConfig.attributes.date.name, dateObj.date);
                    me.application.fireEvent(Statics.eventsNames.nodeAttributesChanged, node);
                }
            }
            Ext.callback(callback);
        }, callback);
    },

    parseDocTitle: function(node, button) {
        var me = this,
            markButton = DocProperties.getChildConfigByName(button,"docTitle") ||
                         DocProperties.getFirstButtonByName("docTitle");

        var initNodes = node.querySelectorAll('.docNumber, .docDate, .docType');

        var isFinishTitle = function(text) {
            return text.match(/\b[\w]+\b\.(?!\w)/g);
        };

        if ( initNodes.length ) {
            var initTitleNode = initNodes[initNodes.length-1];
            var wrapper = Ext.DomHelper.createDom({
                tag : 'span',
                cls : DomUtils.tempParsingClass
            });
            DomUtils.insertAfter(wrapper, initTitleNode);
            me.wrapPartNodeSibling(wrapper, function(el) {
                return isFinishTitle(el.previousSibling.textContent) || 
                        DomUtils.nodeHasClass(el, DomUtils.breakingElementClass);
            });
            me.requestMarkup(markButton, {
                silent : true,
                noEvent : true,
                nodes : [wrapper]
            });
        }
    },

    parseInsidePreface: function(node, button, callback) {
        var me = this, contentToParse = Ext.fly(node).getHtml();

        var callDocType = function() {
            me.callParser("docType", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseDocTypes([jsonData.response[0]], node);
                }
                callDate();
            }, callDate);
        };

        var callTitle = function() {
            // Temporary only for italian documents
            if ( DocProperties.documentInfo.docLocale == 'it' &&
                    DocProperties.documentInfo.docLang == 'ita') {
                me.parseDocTitle(node, button);
            }
            Ext.callback(callback);
        };

        var callDate = function() {
            me.callParser("docDate", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseDocDate(jsonData, node, button);
                }
                callTitle();
            }, callTitle);
        };

        me.callParser("docNum", contentToParse, function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData) {
                me.parseDocNum(jsonData, node, button);
            }
            callDocType();
        }, callDocType);

    },

    parseInsideConclusions: function(node, button, callback) {
        var me = this;
        var notes = node.querySelector('[akn_name=notesContainer]');

        if ( notes ) {
            DomUtils.insertAfter(notes, node);
        }

        var contentToParse = Ext.fly(node).getHtml();

        var finishParsing = function() {
            if ( notes ) {
                node.appendChild(notes);
            }

            Ext.callback(callback);
        };

        var callDate = function() {
            me.callParser("docDate", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseDocDate(jsonData, node, button);
                }
                finishParsing();
            }, finishParsing);
        };

        var callOrganization = function() {
            me.callParser("organization", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseOrganization(jsonData, node, button);
                }
                callAutority();
            }, callAutority);

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
            callOrganization();
        }, callOrganization);
    },

    parseInsideBody: function(node, button, callback) {
        var me = this, contentToParse = Ext.fly(node).getHtml();
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

    parseInsideList: function(node, button, callback) {
        var me = this,
            markButton = DocProperties.getChildConfigByName(button,"item") ||
                         DocProperties.getChildConfigByName(button, "point") ||
                         DocProperties.getFirstButtonByName("item");

        var nodesToMark = me.getTextChildrenGroups(node, [], function(child, fly) {
            if ( child.nodeType != DomUtils.nodeType.TEXT &&
                 ((child.nodeName.toLowerCase() == 'br') ||
                (child.nodeName.toLowerCase() == 'span' &&
                fly.is('.'+DomUtils.breakingElementClass) ) ) ) {

                    return false;
            }
            return true;
        }).filter(function(group) {
            return group.length;
        }).map(function(group) {
            return me.wrapItemText(me.wrapListOfNodes(group));
        });

        if ( nodesToMark.length ) {
            me.requestMarkup(markButton, {
                silent : true,
                noEvent : true,
                nodes : nodesToMark
            });
        }

        Ext.callback(callback);
    },

    isHeadingElement: function(node) {
        var heading = false;
        if ( node && node.getAttribute ) {
            var cls = node.getAttribute('class'),
                match = cls ? cls.match(/\bnum|\bheading|\bsubheading/) : null;

            return (match) ? match.length : false;
        }
        return heading;
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
    parseDocDate : function(data, node, button, noLimit) {
        var me = this, dates = data.response.dates, app = me.application,
            editor = me.getController("Editor"),
            markButtonDocDate = DocProperties.getChildConfigByName(button,"docDate"),
            markButton = DocProperties.getChildConfigByName(button, "date") ||
                         DocProperties.getFirstButtonByName("date");
            attributeName = markButton.rules.askFor.date1.insert.attribute.name;

        if (dates) {
            dates = Ext.Object.getValues(dates).sort(function(a,b) {
                return a.offsets[0].start - b.offsets[0].start;
            });
            var markedNodes = [];
            Ext.each(dates, function(dateParsed) {
                var existingDocDate = node.ownerDocument.querySelector('.docDate');
                var config = {
                    markButton: (markButtonDocDate && !existingDocDate) ? markButtonDocDate : markButton,
                    marker: {
                        silent : true,
                        attribute : {
                            name : attributeName,
                            value : dateParsed.date
                        }
                    }
                };
                markedNodes = me.searchInlinesToMark(node, dateParsed.match.trim(), config);
                markedNodes.forEach(function (node) {
                    me.application.fireEvent(Statics.eventsNames.nodeAttributesChanged, node);
                })
            }, me);
        }
    },

    parseEnactingFormula: function(data, node, button) {
        var me = this, formulas = data.response,
            markButton = DocProperties.getChildConfigByName(button, "formula"),
            nodes = [],
            config = {
                wrapperTag: 'div',
                markButton : markButton
            };

        if (formulas.length) {
            Ext.each(formulas, function(item) {
                if(!Ext.isEmpty(item.enactingFormula)) {
                    var mNode = me.textNodeToTag(node, item.enactingFormula, 'div');
                    if ( mNode ) {
                        nodes.push(mNode);
                    }
                }
            }, me);

            me.requestMarkup(markButton, {
                silent : true,
                noEvent : true,
                nodes : nodes
            });
            Ext.each(nodes, function(item) {
                if ( DomUtils.nodeHasClass(item.parentNode, 'block') ) {
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

        var me = this,
            attr = LangProp.attrPrefix+"refersTo";
        Ext.each(nodes, function(node) {
            var text = DomUtils.getTextOfNode(node);
                id = text.replace(/\s/g, "").toLowerCase().trim();
            node.setAttribute(attr, "#"+id);

            me.addMetaReference({
                eid: id,
                type: "TLCLocation",
                href: "/ontology/location/"+DocProperties.documentInfo.docLocale+"/"+id,
                showAs: text
            });
        });
    },

    parseDocAuthorityElements: function(data, node, button) {
        var me = this,
            markButton = DocProperties.getChildConfigByName(button, "docAuthority") || DocProperties.getFirstButtonByName("docAuthority"),
            nodesToMark = [];

        Ext.each(data.response, function(item) {
            if(!Ext.isEmpty(item.authority)) {
                var returnNode = me.textNodeToSpan(node, item.authority);
                if ( returnNode ) {
                    nodesToMark.push(returnNode);
                }
            }
        }, me);

        if (nodesToMark.length) {
            me.requestMarkup(markButton, {
                silent : true,
                noEvent : true,
                nodes : nodesToMark
            });
        }
    },

    parseAuthorityElements: function(data, node, button) {
        var me = this, signatures = data.response,
        sigButton = DocProperties.getChildConfigByName(button, "signature"),
            roleNodes = [], personNodes = [];

        if( !Ext.isArray(signatures) ) return;

        signatures = signatures.filter(function(obj, index, arr) {
            var itemLikeMe = arr.filter(function(item) {
                return ((item.value == obj.value)
                    && ( obj.start >= item.start && obj.end <= item.end ));
            })[0];

            return arr.indexOf(itemLikeMe) === index;
        });

        var findAndWrap = function(str, node, btn) {
            var range = DomUtils.find(str.replace(/(\s+)(\/>)/gi, '$2'), node)[0],
                wrapper;
            if ( range ) {
                if(!me.canPassNode(range.startContainer.firstChild, btn.id, [DomUtils.tempParsingClass])){
                    return;
                }
                wrapper = me.wrapRange(range, 'span');
            }
            return wrapper;
        };

        var markRole = function(item, node) {
            var wrapper = null;
            var roleButton = DocProperties.getChildConfigByName(sigButton, "role");
            if(!Ext.isEmpty(item.authority)) {
                var wrapper = findAndWrap(item.authority, node, roleButton);
                if(wrapper && !Ext.fly(wrapper).parent('.organization')) {
                    roleNodes.push(wrapper);
                    me.requestMarkup(roleButton, {
                        silent : true,
                        noEvent : true,
                        nodes : [wrapper]
                    });
                } else if ( wrapper ) {
                    wrapper.removeAttribute('class');
                }
            }
            return wrapper;
        };

        var markPerson = function(item, node) {
            var wrapper = null;
            var personButton = DocProperties.getChildConfigByName(sigButton, "person");
            if(!Ext.isEmpty(item.signature)) {
                var wrapper = findAndWrap(item.signature, node, personButton);
                if(wrapper) {
                    wrapper.setAttribute('data-name', item.name);
                    wrapper.setAttribute('data-surname', item.surname);
                    personNodes.push(wrapper);
                    me.requestMarkup(personButton, {
                        silent : true,
                        noEvent : true,
                        nodes : [wrapper]
                    });
                } else if ( wrapper ) {
                    wrapper.removeAttribute('class');
                }
            }
            return wrapper;
        };

        if (signatures.length) {
            Ext.each(signatures, function(item) {
                var wrapper = findAndWrap(item.value, node, sigButton);
                if (wrapper) {
                    me.requestMarkup(sigButton, {
                        silent : true,
                        noEvent : true,
                        nodes : [wrapper]
                    });
                    markRole(item, wrapper);
                    markPerson(item, wrapper);
                }
            }, me);

            Ext.defer(function() {
                me.addRoleMetadata(roleNodes);
                me.addPersonMetadata(personNodes);
            }, 100);
        }
    },

    wrapRange: function(range, tag) {
        var wrapper = range.startContainer.ownerDocument.createElement(tag);
        wrapper.setAttribute("class", DomUtils.tempParsingClass);
        try {
            range.surroundContents(wrapper);
        } catch(e) {
            wrapper = null;
            Ext.log({level: "error"}, e);
        }
        return wrapper;
    },

    addMetaReference: function(data) {
        var store = Ext.getStore('metadata').getMainDocument();
        if ( !store.references().findRecord('eid', data.eid, 0, false, false, true) )
            store.references().add(data);
    },

    addRoleMetadata: function(nodes) {
        var me = this,
            attr = LangProp.attrPrefix+"refersTo";
        Ext.each(nodes, function(node) {
            var text = DomUtils.getTextOfNode(node);
                id = text.replace(/\s/g, "").toLowerCase().trim();
            node.setAttribute(attr, "#"+id);

            me.addMetaReference({
                eid: id,
                type: "TLCRole",
                href: "/ontology/roles/"+DocProperties.documentInfo.docLocale+"/"+id,
                showAs: text
            });
        });
    },

    addOrganizationMetadata: function(nodes) {
        var me = this,
            attr = LangProp.attrPrefix+"refersTo";
        Ext.each(nodes, function(node) {
            var text = DomUtils.getTextOfNode(node);
                id = text.replace(/\s/g, "").toLowerCase().trim();
            node.setAttribute(attr, "#"+id);

            me.addMetaReference({
                eid: id,
                type: "TLCOrganization",
                href: "/ontology/organizations/"+DocProperties.documentInfo.docLocale+"/"+id,
                showAs: text
            });
        });
    },

    addPersonMetadata: function(nodes) {
        var me = this,
            attr = LangProp.attrPrefix+"refersTo";
        Ext.each(nodes, function(node) {
            var text = DomUtils.getTextOfNode(node);
                signature = Ext.fly(node).parent(".signature"),
                name = node.getAttribute('data-name'),
                surname = node.getAttribute('data-surname'),
                asAttribute = "", role = null;


            var id = ( name && surname ) ? name.replace(/\s/g, "").toLowerCase().trim()+'.'+
                                           surname.replace(/\s/g, "").toLowerCase().trim() : "";

            id = id || text.replace(/\s/g, "").toLowerCase().trim();

            role = (signature) ? signature.down(".role", true) : null;
            asAttribute = (role) ? role.getAttribute(attr) : "";
            node.setAttribute(LangProp.attrPrefix+"as", asAttribute);
            node.setAttribute(attr, "#"+id);

            me.addMetaReference({
                eid: id,
                type: "TLCPerson",
                href: "/ontology/persons/"+DocProperties.documentInfo.docLocale+"/"+id,
                showAs: text
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

    parseOrganization : function(data, node, button) {
        var me = this, items = data.response, app = me.application,
            editor = me.getController("Editor"),
            markButton = DocProperties.getChildConfigByName(button,"organization") ||
                         DocProperties.getFirstButtonByName("organization");
        if (items) {
            var nodesToMark = [];
            Ext.each(items, function(item) {
                var span = me.textNodeToSpan(node, item.value);
                if (span) {
                    nodesToMark.push(span);
                }
            });

            if ( nodesToMark.length ) {
                me.requestMarkup(markButton, {
                    silent : true,
                    noEvent : true,
                    nodes : nodesToMark
                });
            }
        }
        Ext.defer(function() {
            me.addOrganizationMetadata(nodesToMark);
        }, 100);
    },

    textNodeToSpan : function(node, matchStr) {
        if (!node || !matchStr) return;
        var me = this, resList = DomUtils.smartFindTextNodes(matchStr, node);
        var nodeToMark = null;
        //console.log(matchStr, resList);
        Ext.each(resList, function(res) {
            if ( nodeToMark || (res[0] && res[0].node.nodeType != DomUtils.nodeType.TEXT &&
                                DomUtils.nodeHasClass(res[0].node, DomUtils.tempParsingClass)) ) return;
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

    textNodeToTag : function(node, matchStr, tag) {
        if (!node || !matchStr) return;
        var me = this, resList = DomUtils.smartFindTextNodes(matchStr, node);
        var nodeToMark = null;
        //console.log(matchStr, resList);
        Ext.each(resList, function(res) {
            if ( nodeToMark ) return;
            var textNodes = [];
            Ext.each(res, function(obj) {
                var splittedNodes = me.splitNode(obj.node, obj.str);
                //console.log(obj.str, splittedNodes);
                textNodes.push(splittedNodes[0]);
            });
            if ( textNodes.length ) {
                var newWrapper = Ext.DomHelper.createDom({
                    tag : tag,
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
        while ((!index || index != -1) && tnode && ( index = tnode.data.indexOf(str)) != -1) {
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
                        silent : true,
                        noEvent : false
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
                    silent : true,
                    noEvent : false
                }
            };
        if (response) {
            var docNumNodes = [];
            Ext.each(response, function(item) {
                var docNumImpossible = me.docNumImpossibleParents;
                if ( !docNumNodes || !docNumNodes.length ) {
                    docNumNodes = me.searchInlinesToMark(node, item.match.trim(), config, function(n) {
                        var extNode = Ext.fly(n);
                        for (var i = 0; i < docNumImpossible.length; i++) {
                            if (extNode && extNode.up(docNumImpossible[i])) {
                                return false;
                            }
                        }
                        return true;
                    });
                    Ext.each(docNumNodes, function(node) {
                        node.setAttribute('data-num', item.numVal);
                    });
                }
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
     *      markButton: markButton,
     *      marker:{silent:true}
     * }
     * @param {function} [filter] The text node will be passed to this function
     * if it returns false the node will be skipped
     */
    searchInlinesToMark : function(node, matchStr, config, filter, beforeMarking, noMarking) {
        config.marker = config.marker || {};
        if (!node || !matchStr || !(config && config.marker && config.markButton))
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
                    newWrapper.setAttribute(LangProp.attrPrefix + config.marker.attribute.name, config.marker.attribute.value);
                }

                nodesToMark.push(newWrapper);
            }
        }, this);

        if( nodesToMark.length && !noMarking) {
            me.requestMarkup(config.markButton, Ext.merge({
                silent : true,
                noEvent : true,
                nodes : nodesToMark
            }, config.marker));
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
                    var posList = DomUtils.getPreviousSiblingWithAttr(prevText, 'poslist');
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
                                DomUtils.nodeHasClass(node, DomUtils.breakingElementClass)) {
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
            newWrapper = (initNode) ? me.wrapPartNode(initNode, node) : null,
            button = DocProperties.getFirstButtonByName("p", "common");

        if ( newWrapper ) {
            me.wrapPartNodeSibling(newWrapper);
            me.requestMarkup(button, {
                silent : true,
                noEvent : true,
                nodes : [newWrapper]
            });
        }
        return node;
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
                var posList = DomUtils.getPreviousSiblingWithAttr(prevText, 'poslist');
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
        var me = this;

        switch(partName) {
            case "item":
                me.wrapBlockList(partName, parts, node, button);
                return;
            case "paragraph":
                parts = parts.map(function(data) {
                    data.num = {value: data.numparagraph, start: data.start}
                    return data;
                });
                break;
            case "item1":
            case "item2":
                partName = "item";
                parts = parts.map(function(data) {
                    data.num = {value: data.numitem.trim(), start: data.start}
                    return data;
                });
                break;
                
        }

        var nodesToMark = [], numsToMark = [], headingsToMark = [],
            markButton = DocProperties.getChildConfigByName(button, partName) 
                        || DocProperties.getFirstButtonByName(partName),
            numButton = DocProperties.getChildConfigByName(markButton,"num") || 
                        DocProperties.getChildConfigByName(button,"num") || 
                        DocProperties.getFirstButtonByName("num"),
            headingButton = DocProperties.getChildConfigByName(markButton,"heading");


        // Choose just one occurrence trying to exclude those that are in references
        var chooseTextObj = function(textNodesObjs, numVal) {
            if (textNodesObjs.length == 1) return textNodesObjs[0];
            var finishCharactersReg = /[;.:]$/;
            for (var i = 0; i < textNodesObjs.length; i++) {
                var textBeforeNum = textNodesObjs[i][0].node.textContent;
                textBeforeNum = textBeforeNum.substring(0, textBeforeNum.indexOf(numVal)).trim();
                var prevTextNode = DomUtils.getPreviousTextNode(textNodesObjs[i][0].node, true);
                textBeforeNum = (prevTextNode) ? prevTextNode.textContent.trim() + textBeforeNum : textBeforeNum;
                if ( textBeforeNum ) {
                    if (textBeforeNum.match(finishCharactersReg))
                        return textNodesObjs[i];
                } else 
                    return textNodesObjs[i];
            }
            return textNodesObjs[0];
        };

        Ext.each(parts, function(element) {
            if(!element.value.trim()) return;
            var numVal = (element.num && element.num.value) || element.value;
            var headingVal = (element.heading && element.heading.value),
                parent, partNode;
            var textNodesObj = [];

            if ( partName == "paragraph" || partName == "item" ) {
                textNodesObj = DomUtils.smartFindTextNodes(element.value, node);
                textNodesObj = textNodesObj.map(function(group) {
                    return group.map(function(obj) {
                        obj.str = numVal;
                        return obj;
                    });
                });
            }

            if ( !textNodesObj.length )
                textNodesObj = DomUtils.smartFindTextNodes(numVal, node);

            if ( !textNodesObj.length ) return;
            var textNodeObj = chooseTextObj(textNodesObj, numVal);
            var firstNode = textNodeObj[0].node;
            if ( Ext.fly(firstNode) && Ext.fly(firstNode).parent("." + DomUtils.tempParsingClass, true) )  return;
            partNode = (firstNode.parentNode == node) ? firstNode: firstNode.parentNode;
            var newWrapper = me.wrapPartNode(partNode, node);
            element.wrapper = newWrapper;
            nodesToMark.push(newWrapper);
            numsToMark = Ext.Array.push(numsToMark, me.newTextNodeToSpans(textNodeObj));

            if ( headingVal ) {
                var text = DomUtils.smartFindTextNodes(headingVal, node);
                if ( text.length ) {
                    headingsToMark = Ext.Array.push(headingsToMark, me.newTextNodeToSpans(text[0]));
                }
            }

        }, this);
        Ext.each(nodesToMark, function(node) {
            me.wrapPartNodeSibling(node, function(sibling) {
                var elButton = DomUtils.getButtonByElement(sibling);
                /* If sibling is marked with the same button or it is temp element then stop the loop */
                if ((elButton && (elButton.id === markButton.id)) 
                    || (headingsToMark.indexOf(sibling) == -1 
                            && DomUtils.nodeHasClass(sibling, DomUtils.tempParsingClass)) ) {
                    return true;
                }
                return false;
            });
        }, this);
        
        if (partName == "item") {
            me.wrapItems(nodesToMark, button);
        }

        if (numsToMark.length > 0) {
            me.requestMarkup(numButton, {
                silent : true,
                noEvent : true,
                nodes : numsToMark
            });
        }
        if (headingsToMark.length > 0) {
            me.requestMarkup(headingButton, {
                silent : true,
                noEvent : true,
                nodes : headingsToMark
            });
        }
        if (nodesToMark.length > 0) {
            me.requestMarkup(markButton, {
                silent : true,
                noEvent : true,
                nodes : nodesToMark
            });
            me.onNodeChanged(nodesToMark, {});
        }

        // Do contains elements
        Ext.each(parts, function(element) {
            var contains = element.contains, containsPartName = Ext.Object.getKeys(contains)[0];
            if (containsPartName && contains[containsPartName]) {
                try {
                    me.wrapBodyParts(containsPartName, contains[containsPartName], element.wrapper, button);
                } catch (e) {
                    Ext.log({level: "error"}, "WrapBodyParts"+e);
                }
            }
        }, this);
    },


    // Wraps items in at least one blockList
    // breaks items in more blockLists if between items there is some content
    wrapItems: function(nodes, button) {
        if (!nodes.length) return;
        var me = this,
            wrapButton = DocProperties.getChildConfigByName(button,'blockList') 
                        || DocProperties.getFirstButtonByName('blockList'),
            introButton = DocProperties.getChildConfigByName(wrapButton, 'listIntroduction');

        var wrapBlocks = [];
        var listIntroductions = [];
        var itemsToInsert = Ext.Array.clone(nodes);
        var addListIndroduction = function(wrapNode) {
            var prevText = DomUtils.getPreviousTextNode(wrapNode, true);
            if ( prevText && DomUtils.getTextOfNode(prevText).trim().match(/:$/) ) {
                var listWrapper = Ext.DomHelper.createDom({
                    tag : 'span'
                });
                // Include saved quote
                var posList = DomUtils.getPreviousSiblingWithAttr(prevText, 'poslist');
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
        };

        while( itemsToInsert.length ) {
            var wrapNode = Ext.DomHelper.createDom({
                tag : 'div',
                cls : DomUtils.tempParsingClass
            });

            itemsToInsert[0].parentNode.insertBefore(wrapNode, itemsToInsert[0]);

            // List introduction
            addListIndroduction(wrapNode);

            me.wrapPartNodeSibling(wrapNode, function(node) {
                if ( itemsToInsert.length != Ext.Array.remove(itemsToInsert, node).length) {
                    return false;
                }
                if ( node.nodeType == DomUtils.nodeType.ELEMENT &&
                            (node.nodeName.toLowerCase() == "br") ||
                            DomUtils.nodeHasClass(node, DomUtils.breakingElementClass)) {
                    return false;
                } else if ( node.nodeType == DomUtils.nodeType.TEXT &&
                            Ext.isEmpty(node.data.trim()) ) {
                    return false;
                }
                return true;
            });
            wrapBlocks.push(wrapNode);
        }

        me.requestMarkup(wrapButton, {
            silent : true,
            noEvent : true,
            nodes : wrapBlocks
        });

        me.requestMarkup(introButton, {
            silent : true,
            noEvent : true,
            nodes : listIntroductions
        });
    },

    parseBodyParts : function(data, node, button) {
        var me = this, app = me.application, parts = data.response, partName;
        if ( parts && !Ext.isEmpty(parts) ) {
            partName = Ext.Object.getKeys(parts)[0];
            if (partName) {
                me.wrapBodyParts(partName, parts[partName], node, button);
            }
        } else {
            me.addArticleParagrapths(node);
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
                        if (DomUtils.findTextIgnoringHtml(delimiter.value, sibling).length > 0) {
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
                        me.searchInlinesToMark(body, string, config, function(node) {
                            var parentsNote = DomUtils.getMarkedParents(node).filter(function(node) {
                                return DomUtils.nodeHasClass(node, 'authorialNote');
                            });
                            return Ext.isEmpty(parentsNote);
                        }, function(node) {
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
                            structureToMark = Ext.Array.push(structureToMark, me.smartFindQuote(body, string, function(node) {
                                var parentsNote = DomUtils.getMarkedParents(node).filter(function(node) {
                                    return DomUtils.nodeHasClass(node, 'authorialNote');
                                });
                                return Ext.isEmpty(parentsNote);
                            }));
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

    smartFindQuote : function(node, matchStr, filter) {
        if (!node || !matchStr) return;
        var me = this, nodesToMark = [];

        var range = DomUtils.find(matchStr.replace(/(\s+)(\/>)/gi, '$2'), node)[0];
        if (range) {
            var wrapper = me.wrapRange(range, 'div');
            if ( wrapper ) {
                nodesToMark.push(wrapper);
            }
        } else {
            var resList = DomUtils.smartFindTextNodes(matchStr, node);
            Ext.each(resList, function(res) {
                if (res[0] && Ext.isFunction(filter)) {
                    if (!filter(res[0].node))
                        return;
                }
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
        }


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
                    } else {
                        next(structure.length-nums);
                    }
                };

            var next = function(index) {
                var name = structure[index];
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
            };

            next(0);
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

    parseReference: function(data, callback) {
        var me = this, editor = me.getController("Editor"), attrs = [],
            body = editor.getBody(), nodesToMark = [], button = DocProperties.getFirstButtonByName('ref');

        var todayDate = Ext.Date.format(new Date(), 'Y-m-d');
        
        data.sort(function compare(a,b) {
            return b.ref.length - a.ref.length;
        });
        // Filter the result and remove repeating elements
        var filtredData = [];
        var containsRef = function(list, ref) {
            var refs = list.filter(function(item) {
                return ( (item.start >= ref.start && item.end <= ref.end) ||
                        (ref.start >= item.start && ref.end <= item.end));
            });
            return refs.length != 0;
        };

        // Remove references included in other references
        for (var i = 0; i < data.length; i++) {
            if (!containsRef(filtredData, data[i]))
                filtredData.push(data[i]);
        }

        console.log("Ref to mark: ",filtredData.length);

        var refStrings = [];
        // Remove dublicate strings
        filtredData = filtredData.filter(function(obj) {
            if (refStrings.indexOf(obj.ref) == -1) {
                refStrings.push(obj.ref);
                return true;
            }
            return false;
        });

        var total = nums = filtredData.length;
        var callCallback = function() {
            if (--nums > 0) {
                if ( !(nums % 100) ) {
                    me.application.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("referenceParser", me.getPluginName())+' '+Math.ceil(nums/100));
                }
                if ( !(nums % 20) ) {
                    setTimeout(next, 100);
                } else {
                    next();
                }
            } else {
                if ( nodesToMark.length ) {
                    me.requestMarkup(button, {silent:true, noEvent : true, nodes:nodesToMark, attributes: attrs});
                }
                console.log("Ref marked", body.querySelectorAll('[class~=ref]').length);
                Ext.callback(callback);
            }
        };

        var getRefHref = function(refData) {
            //console.log(refData);
            var ref = AknMain.Reference.empty();
            ref.internal = (refData.num && !refData.date && !refData.docnum && !refData.type) ? true : false;
            ref.id = refData.fragment || refData.num;
            ref.uri.country = DocProperties.documentInfo.docLocale;
            ref.uri.type = 'act';
            ref.uri.name = refData.docnum;
            ref.uri.date = refData.date || todayDate;
            ref.uri.language = DocProperties.documentInfo.docLang;
            var href = "";
            try {
                href = ref.ref();
            } catch(e) {
                console.error(e);
            }
            //console.log(ref);
            return href;
        };

        var next = function(index) {
            index = index || total-nums;
            var obj = filtredData[index];

            try {
                var matchStr = obj.ref;
                var ranges = DomUtils.findText(matchStr, body);
                href = getRefHref(obj);
                //console.log(nums, matchStr, ranges.length);
                if ( ranges.length ) {
                    Ext.each(ranges, function(range) {
                        if(!me.canPassNode(range.startContainer.firstChild, button.id, [DomUtils.tempParsingClass])){
                            // console.log(matchStr, "cannot pass");
                            return;
                        }

                        var span = range.startContainer.ownerDocument.createElement("span");
                        span.setAttribute("class", DomUtils.tempParsingClass);
                        try {
                            range.surroundContents(span);
                            attrs.push({ name: 'href', value: href });
                            // console.log(matchStr, span);
                            nodesToMark.push(span);
                        } catch(e) {
                            Ext.log({level: "error"}, e);
                        }
                    });
                }
            } catch(e) {
                console.warn('Error finding reference '+ matchStr);
                console.warn(e);
            }

            callCallback();
        };

        /*setTimeout(function() {
            if (nums > 0) {
                nums = 0;
                callCallback();
            }
        }, 10000);*/

        if ( nums ) {
            next(0);
        } else {
            Ext.callback(callback);
        }
    },

    htmlToText: function(html) {
        html = html.replace(/<br>/gi, "\n");
        html = html.replace(/<\/?(p|div)[^>]*>/gi, "\n");
        html = html.replace(/<(?:.|\s)*?>/g, "").replace(/\n+/gi, '\n');
        return html;
    },

    callAttachmentParser: function(callback, text) {
        var me = this, editor = me.getController("Editor");

        text = text || me.htmlToText(editor.getContent());

        me.callParser("attachment", text, function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData) {
                me.parseAttachments(jsonData.response);
            }
            Ext.callback(callback);
        }, callback);
    },

    parseAttachments: function(attachments) {
        var me = this, editor = me.getController("Editor"),
            body = editor.getBody(),
            attachmentsButton = DocProperties.getFirstButtonByName('attachments'),
            attachmentButton = DocProperties.getFirstButtonByName('attachment'),
            attachNodes = [],
            attachmentsNode = null;

        Ext.each(attachments, function(att) {
            var ranges = DomUtils.findText(att.attachment, body);
            Ext.each(ranges, function(range) {
                var wrapNode = Ext.DomHelper.createDom({
                    tag : 'div',
                    cls : DomUtils.tempParsingClass
                });
                range.startContainer.parentNode.insertBefore(wrapNode, range.startContainer);
                attachNodes.push(wrapNode);
            });
        });

        if ( attachNodes.length ) {
            var refNodes = body.querySelectorAll('.body, .conclusions');
            attachmentsNode = Ext.DomHelper.createDom({
                tag : 'div',
                cls : DomUtils.tempParsingClass
            });
            DomUtils.insertAfter(attachmentsNode, refNodes[refNodes.length-1]);
        }

        Ext.each(attachNodes, function(node) {
            me.wrapPartNodeSibling(node, function(sibling) {
                var elButton = DomUtils.getButtonByElement(sibling);
                /* If sibling is marked with the same button or it is temp element then stop the loop */
                if ((elButton && (elButton.id === attachmentButton.id)) || DomUtils.nodeHasClass(sibling, DomUtils.tempParsingClass) ) {
                    return true;
                }
                return false;
            });

            attachmentsNode.appendChild(node);
        });

        if ( attachmentsNode ) {
            me.requestMarkup(attachmentsButton, {
                silent : true,
                noEvent : true,
                nodes : [attachmentsNode]
            });
            me.requestMarkup(attachmentButton, {
                silent : true,
                noEvent : true,
                nodes : attachNodes
            });
        }
    },

    parseNotes: function(response) {
        var me = this, editor = me.getController("Editor"), body = editor.getBody(),
            markButton = DocProperties.getFirstButtonByName('authorialNote');

        var clickLinker = function() {
            var marker = this.getAttribute('refto');

            if (marker) {
                var note = body.querySelector("[notetmpid="+marker+"]");
                if(note) {
                    me.application.fireEvent('nodeFocusedExternally', note, {
                        select : true,
                        scroll : true,
                        click : true
                    });
                }
            }
        };

        if ( !Ext.isEmpty(response) && Ext.isArray(response) ) {
            var nodesToMark = [], markedItems = [];

            Ext.each(response, function(item) {
                if( Ext.isEmpty(item.note.trim()) ) return;
                var textNodesObj = DomUtils.smartFindTextNodes(item.note, body);

                if ( !textNodesObj.length ) return;

                var firstNode = textNodesObj[0][0].node;

                if ( Ext.fly(firstNode) && Ext.fly(firstNode).parent("." + DomUtils.tempParsingClass, true) )  return;

                var partNode = firstNode.parentNode;
                var newWrapper = me.wrapPartNode(firstNode, firstNode.parentNode);
                nodesToMark.push(newWrapper);
                markedItems.push(item);
            });
            Ext.each(nodesToMark, function(node) {
                me.wrapPartNodeSibling(node, function(sibling) {
                    var elButton = DomUtils.getButtonByElement(sibling);
                    if ((elButton && (elButton.id === markButton.id)) || DomUtils.nodeHasClass(sibling, DomUtils.tempParsingClass) ) {
                        return true;
                    }
                    return false;
                });
            }, this);
            if ( nodesToMark.length > 0 ) {

                var notesContainer = Ext.DomHelper.createDom({
                    tag : 'div'
                });
                var p = Ext.DomHelper.createDom({
                    tag : 'div'
                });

                notesContainer.appendChild(p);
                notesContainer.setAttribute('akn_name', 'notesContainer');
                nodesToMark[0].parentNode.insertBefore(notesContainer, nodesToMark[0]);
                var supLinkTemplate = new Ext.Template('<sup><a class="linker" href="#">{markerNumber}</a></sup>');
                var isArtRef = /(articolo|art\.)(\s)+([ae\d\-\–\, ]+)/;

                Ext.each(nodesToMark, function(note, index) {
                    var noteMarker = index+1;
                    var noteId = 'note_'+noteMarker;
                    var tmpElement = Ext.DomHelper.createDom({
                        tag : 'span',
                        cls: 'posTmpSpan',
                        style: 'margin: 5px;'
                    });

                    var markedItem = markedItems[index];

                    var marker = markedItem.notenum || noteMarker;

                    if ( !Ext.isEmpty(markedItem.text.trim()) ) {
                        var art = markedItem.text.match(isArtRef);
                        if ( art ) {
                            tmpElement.setAttribute('artnum', art[0]);
                        }
                    }

                    var supElement = Ext.DomHelper.insertHtml("afterBegin", tmpElement, supLinkTemplate.apply({
                        'markerNumber' : marker
                    }));
                    supElement.querySelector('a').setAttribute('refto', noteId);
                    supElement.querySelector('a').onclick = clickLinker;

                    p.appendChild(note);

                    tmpElement.setAttribute('noteref', noteId);
                    note.setAttribute('notetmpid', noteId);
                    note.parentNode.insertBefore(tmpElement, note);
                });

                me.requestMarkup(DocProperties.getFirstButtonByName('p'), {
                    silent : true,
                    noEvent : true,
                    nodes : [p]
                });

                me.requestMarkup(DocProperties.getFirstButtonByName('container'), {
                    silent : true,
                    noEvent : true,
                    nodes : [notesContainer]
                });

                me.requestMarkup(markButton, {
                    silent : true,
                    noEvent : true,
                    nodes : nodesToMark
                });
            }
        }
    },

    positionateNotesMarker : function(node) {
        var me = this;
        var markers = node.querySelectorAll('.posTmpSpan');
        var nums = node.querySelectorAll('.article > .num');
        var preface = node.querySelector('.preface');

        if ( preface ) {
            var firstPrefaceNode = preface.querySelector('.p');
        }

        Ext.each(markers, function(marker) {
            if ( marker.hasAttribute('artnum') ) {
                var num = me.searchNodeInNodeListByString(marker.getAttribute('artnum'), nums);
                if ( num ) {
                    num.appendChild(marker);
                }
            } else {
                if ( firstPrefaceNode ) {
                    var noteRef = firstPrefaceNode.querySelectorAll('.posTmpSpan');
                    if ( noteRef && noteRef.length ) {
                        DomUtils.insertAfter(marker, noteRef[noteRef.length-1]);
                    } else if ( firstPrefaceNode.firstChild ) {
                        firstPrefaceNode.insertBefore(marker, firstPrefaceNode.firstChild);
                    } else {
                        firstPrefaceNode.appendChild(marker);
                    }
                }
            }
        });
    },

    searchNodeInNodeListByString: function(str, nodeList) {
        for ( var i = 0; i < nodeList.length; i++ ) {
            var node = nodeList[i];
            if ( node.textContent && (node.textContent.toLowerCase().indexOf(str.toLowerCase()) != -1) ) {
                return node;
            }
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
        while ((!index || index != -1) && ( index = tNode.data.indexOf(str)) != -1) {
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

    newTextNodeToSpans : function(tNodeObjs, applyFn) {
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

    restoreQuotes: function(node, callback) {
        var me = this, finalQuotes,
             markButton = DocProperties.getFirstButtonByName('body') ||
                          DocProperties.getFirstButtonByName('mainBody'),
             markStructureButton = DocProperties.getFirstButtonByName('quotedStructure'),
             quotedTextLimit = 50;
        me.application.fireEvent(Statics.eventsNames.progressUpdate);
        Ext.each(me.quotedElements, function(quote, index) {
            var tmpEl  = node.querySelector("[poslist='"+index+"']");
            if(tmpEl) {
                tmpEl.parentNode.replaceChild(quote, tmpEl);
            }
        });
        me.quotedElements = [];

        finalQuotes = node.querySelectorAll("[class~=quotedText], [class~=quotedStructure]");

        var total = nums = finalQuotes.length;
        var callCallback = function() {
            if(!--nums) {
                Ext.callback(callback);
            } else {
                if ( !(nums % 30)  )
                    me.application.fireEvent(Statics.eventsNames.progressUpdate);
                next(total-nums);
            }
        };

        var next = function(index) {
            quote = finalQuotes[index];
            // Assuming that short quotes are quotedTexts
            if ( quote.textContent.length < quotedTextLimit ) {
                callCallback();
                return;
            }
            me.callParser("body", quote.innerHTML, function(result) {
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
                callCallback();
            });
        };

        if ( nums ) {
            next(0);
        } else {
            Ext.callback(callback);
        }
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

    addHcontainerHeading: function(node) {
        var me = this;
        var fly = Ext.fly(node);
        var searchAfter = fly.last('.num,.heading,.subheading', true);
        var headings = [], subheadings = [];
        var hcontainerChild = fly.child('.hcontainer', true);
        var headingNode = fly.child('.heading', true) || Ext.DomHelper.createDom({
            tag : 'span',
            cls : DomUtils.tempParsingClass
        });
        var subHeadingNode = fly.child('.subheading', true) || Ext.DomHelper.createDom({
            tag : 'span',
            cls : DomUtils.tempParsingClass
        });

        if ( searchAfter ) {
            var iterNode = searchAfter;
            while ( iterNode.nextSibling && DomUtils.getNodeNameLower(iterNode.nextSibling) != 'div' ) {
                if ( Ext.isEmpty(DomUtils.getTextOfNode(headingNode).trim()) ) {
                    headingNode.appendChild(iterNode.nextSibling);
                } else {
                    subHeadingNode.appendChild(iterNode.nextSibling);
                }
            }
            if ( !Ext.isEmpty(DomUtils.getTextOfNode(headingNode).trim()) ) {
                Ext.fly(headingNode).insertAfter(searchAfter);
                if ( !Ext.isEmpty(DomUtils.getTextOfNode(subHeadingNode).trim()) ) {
                    Ext.fly(subHeadingNode).insertAfter(headingNode);
                    subheadings.push(subHeadingNode);
                } else {
                    DomUtils.moveChildrenNodes(subheadings, headingNode, true);
                }
                headings.push(headingNode);
            } else {
                while ( headingNode.firstChild ) {
                    node.insertBefore( headingNode.firstChild, hcontainerChild );
                }
            }
        }

        var markup = function(nodes, name) {
            Ext.each(nodes, function(node) {
                if ( node.getAttribute(DomUtils.elementIdAttribute) ) return;
                var parentButton = DomUtils.getButtonByElement(DomUtils.getFirstMarkedAncestor(node)),
                    headingButton = DocProperties.getChildConfigByName(parentButton, name) ||
                                    DocProperties.getFirstButtonByName(name);
                me.requestMarkup(headingButton, {
                    silent : true,
                    noEvent : true,
                    nodes : [node]
                });
            });
        }

        markup(headings, 'heading');
        markup(subheadings, 'subheading');
    },

    addHcontainerHeadings: function(node) {
        var me = this,
            elements = Ext.Array.unique(
                Ext.Array.toArray(
                    node.querySelectorAll('.hcontainer > .hcontainer')
                ).map(function(el) {
                    return el.parentNode;
                })
            );

        Ext.each(elements, function(el) {
            me.addHcontainerHeading(el);
        });
    },

    addParagraphs : function(node) {
        var me = this;

        Ext.each(node.querySelectorAll('.article'), function(article) {
            me.addArticleParagrapths(article);
        });
    },

    addArticleParagrapths: function(node) {
        var me = this, nodesToMark = [], prevWrapper = null, brEndPar = [];
        if ( node.querySelector('.paragraph') ) return;
        Ext.each(node.querySelectorAll('div'), function(el) {
            var notMarkedChild = (el.parentNode == node && !el.getAttribute(DomUtils.elementIdAttribute));
            if ( notMarkedChild ) {
                nodesToMark.push(el);
            }
        });
        Ext.each(node.querySelectorAll('br+br'), function(brNode) {
            var prevTextNode = DomUtils.getPreviousTextNode(brNode, true);
            if ( prevTextNode && prevTextNode.textContent.trim().match(/\.$/) ) {
                var wrapper = Ext.DomHelper.createDom({
                    tag : 'div',
                    cls : DomUtils.tempParsingClass
                });
                brNode.parentNode.insertBefore(wrapper, brNode);
                var fly = Ext.fly(wrapper);
                while ( wrapper.previousSibling ) {
                    var prevSib = wrapper.previousSibling;
                    if ( (DomUtils.getNodeNameLower(prevSib) == 'br' &&
                         DomUtils.getNodeNameLower(prevSib.previousSibling) == 'br' &&
                         brEndPar.indexOf(prevSib) != -1 ) ||
                        ( nodesToMark.indexOf(prevSib) != -1 ) || me.isHeadingElement(prevSib) ) {
                        break;
                    }
                    fly.insertFirst(prevSib);
                }
                nodesToMark.push(wrapper);
                brEndPar.push(brNode);
            }
        });

        var textGroups = me.getTextChildrenGroups(node, ["table"]).filter(function(group) {
            var beakingSpans = group.filter(function(el) {
                return ( el.nodeType == DomUtils.nodeType.ELEMENT &&
                        ( DomUtils.nodeHasClass(el, DomUtils.breakingElementClass) ||
                        DomUtils.getNodeNameLower(el) == 'br' ) );
            });

            return beakingSpans.length != group.length;
        });

        var hContainerChild = node.querySelector('.hcontainer');

        Ext.each(textGroups, function(group) {
            var wrapper = me.wrapListOfNodes(group);

            nodesToMark.push(wrapper);

            if ( prevWrapper ) {
                while( prevWrapper.nextSibling && prevWrapper.nextSibling != wrapper ) {
                    prevWrapper.appendChild(prevWrapper.nextSibling);
                }
            }

            /*if ( hContainerChild ) {
                while ( wrapper.firstChild && (( wrapper.firstChild.nodeType == DomUtils.nodeType.TEXT ) ||
                                ( wrapper.firstChild.nodeType == DomUtils.nodeType.ELEMENT &&
                                !wrapper.firstChild.getAttribute(DomUtils.elementIdAttribute) )) ) {
                    wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
                }
            }*/

            prevWrapper = wrapper;
        });

        Ext.each(nodesToMark, function(paragraph, index) {
            if ( Ext.fly(paragraph).up('table') ) {
                DomUtils.unwrapNode(paragraph);
                nodesToMark[index] = null;
                return;
            }
            while( paragraph.nextSibling && !DomUtils.nodeHasClass(paragraph.nextSibling, 'paragraph')
                    && !DomUtils.nodeHasClass(paragraph.nextSibling, DomUtils.tempParsingClass) ) {
                paragraph.appendChild(paragraph.nextSibling);
            }
        });

        nodesToMark = nodesToMark.filter(function(node) {
            return (node) ? true : false;
        });

        if(nodesToMark.length) {
            var parButton = DocProperties.getFirstButtonByName('paragraph');
            me.requestMarkup(parButton, {
                silent : true,
                noEvent : true,
                nodes : nodesToMark
            });
        }
        me.addHcontainerHeading(node);
    },

    normalizeNodes: function(node) {
        var me = this;

        // Add text wrapping to items that not contain h?containers
        Ext.each(node.querySelectorAll('.item'), function(item) {
            if (!AknMain.xml.Document.newDocument(item).select("*[contains(@class, 'container')]").length)
                me.wrapItemText(item);
        });

        var hcontainers = Ext.Array.toArray(node.querySelectorAll('.article')).filter(function(el) {
            var fly = Ext.fly(el);
            if ( fly.child("div") && !fly.child(".paragraph") ) {
                return true;
            }
        });
        var pToMark = [], paragraphToMark = [];
        Ext.each(hcontainers, function(hcontainer) {
            var textGroups = me.getTextChildrenGroups(hcontainer);
            if ( textGroups.length ) {
                Ext.each(textGroups, function(group) {
                    var breakingEls = group.filter(function(el) {
                        return ( (el.nodeType == DomUtils.nodeType.ELEMENT &&
                                DomUtils.nodeHasClass(el, DomUtils.breakingElementClass)) ||
                                (el.nodeType == DomUtils.nodeType.TEXT && Ext.isEmpty(el.data.trim()) ) );
                    });
                    var headingElements = group.filter(function(el) {
                        return (DomUtils.nodeHasClass(el, 'num') ||
                                DomUtils.nodeHasClass(el,'heading') ||
                                DomUtils.nodeHasClass(el, 'subheading') );
                    });
                    if ( !headingElements.length && breakingEls.length != group.length ) {
                        var wrapper = me.wrapListOfNodes(group);

                        if ( DomUtils.nodeHasTagName(wrapper.previousSibling, 'div')
                                 && DomUtils.nodeHasClass(wrapper.previousSibling, DomUtils.tempParsingClass) ) {
                            DomUtils.moveChildrenNodes(wrapper, wrapper.previousSibling, true);
                            wrapper.parentNode.removeChild(wrapper);
                            return;
                        }

                        var childHcontainer = Ext.Array.toArray(wrapper.parentNode.querySelectorAll('.hcontainer')).filter(function(chEl) {
                            if ( chEl.parentNode == wrapper.parentNode ) {
                                return true;
                            }
                        });
                        if ( childHcontainer.length ) {
                            paragraphToMark.push(wrapper);
                        } else {
                            pToMark.push(wrapper);
                            if ( DomUtils.nodeHasClass(wrapper.nextSibling, 'quotedStructure') ) {
                                wrapper.appendChild(wrapper.nextSibling);
                            }
                        }
                    }
                });
            }
        });

        Ext.each(node.querySelectorAll('.container, .block'), function(node) {
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

        Ext.each(node.querySelectorAll('.body, .mainBody'), function(body) {
            if ( !body.querySelector('div') ) {
                var wrapper = Ext.DomHelper.createDom({
                    tag : 'div',
                    cls : DomUtils.tempParsingClass
                });
                body.parentNode.insertBefore(wrapper, body);
                DomUtils.moveChildrenNodes(body, wrapper, true);
                body.appendChild(wrapper);
                pToMark.push(wrapper);
            }
        });


        me.requestMarkup(DocProperties.getFirstButtonByName("p", "common"), {
            silent : true,
            noEvent : true,
            nodes : pToMark
        });
        me.requestMarkup(DocProperties.getFirstButtonByName("paragraph"), {
            silent : true,
            noEvent : true,
            nodes : paragraphToMark
        });

        Ext.each(node.querySelectorAll('.'+DomUtils.tempParsingClass), function(tmp) {
            DomUtils.unwrapNode(tmp);
        });
    },

    callReferenceParser: function(callback, content) {
        var me = this, editor = me.getController("Editor"),
            app = me.application, buttonName;
        content = content || editor.getContent();
        app.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("referenceParser", me.getPluginName()));
        me.callParser("reference", content, function(result) {
            var jsonData = Ext.decode(result.responseText, true);
            if (jsonData) {
                me.parseReference(jsonData.response, callback);
            } else {
                Ext.callback(callback);
            }
        }, callback);
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
                me.positionateNotesMarker(body);
                me.markOlBlockList(body);
                me.addParagraphs(body);
                me.normalizeNodes(body);
                app.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("postParsing", me.getPluginName()));
                Ext.defer(function() {
                    editor.parserWorking = false;
                    me.parserActivated = true;
                    Ext.defer(function() {
                        app.fireEvent('nodeChangedExternally', [editor.getBody()], {
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

                var filterData = function(data) {
                    return data.filter(function(obj) {
                        var str = obj.quoted.string.replace(/<br[^>]*>/g, "").
                                    replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");

                        return str.trim().length;
                    });
                };

                me.callParser("quote", content, function(result) {
                    var jsonData = Ext.decode(result.responseText, true);
                    if (jsonData && jsonData.success !== false) {
                        var data = filterData(jsonData.response).slice(0, 50);
                        var clusterNum = 5;
                        var times = Math.ceil(data.length/clusterNum);
                        var done = 0;
                        var goNext = function() {
                            var start = done*clusterNum;
                            var end = (times-done) ? start+clusterNum : false;
                            me.parseQuotes(data.slice(start, end));
                            done++;
                            if ( end ) {
                                app.fireEvent(Statics.eventsNames.progressUpdate);
                                setTimeout(goNext, 50);
                            } else {
                                callStrParser();
                            }
                        };
                        goNext();
                    } else callStrParser();
                }, function() {
                    callStrParser();
                });
            };

            var callStrParser = function() {
                var body = editor.getBody();
                app.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("structureParser", me.getPluginName()));
                me.saveQuotes(body);
                var goToNext = function() {
                    me.restoreQuotes(body, function() {
                        me.addHcontainerHeadings(body);
                        callReferenceParser();
                    });
                };
                me.callParser("structure", editor.getContent(), function(result) {
                    var jsonData = Ext.decode(result.responseText, true);
                    if (jsonData) {
                        me.parseStructure(jsonData.response, goToNext);
                    } else {
                        goToNext();
                    }
                }, goToNext);
            };

            var callReferenceParser = function() {
                me.callReferenceParser(endParsing);
            };

            var callNoteParser = function() {
                me.callParser("note", editor.getContent(), function(result) {
                    var jsonData = Ext.decode(result.responseText, true);
                    if (jsonData) {
                        me.parseNotes(jsonData.response);
                    }
                    callQuoteParser();
                }, callQuoteParser);
            };

            callNoteParser();

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
                url : Server.getPhpServer()+config.url,
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

    beforeContextMenuShow: function(menu, node) {
        var me = this;
        var getContentToParse = function() {
            var editor = me.getController('Editor'),
                selectionRange = editor.lastSelectionRange || editor.getEditor().selection.getRng();
            return selectionRange.toString().trim();
        }
        //TODO: add loading bar
        var callParser = function() {
            var contentToParse = getContentToParse(),
                button = DomUtils.getButtonByElement(node);
            
            if (!contentToParse) return;

            me.callParser("body", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    try {
                        me.parseBodyParts(jsonData, node, button);
                    } catch(e) {
                        Ext.log({level: "error"}, e);
                    };
                }
            });
        };

        if(menu.down("*[name=autoMarkup]") || !getContentToParse()) return;
        menu.add({
            text : 'Markup automatico',
            name: 'autoMarkup',
            handler : callParser
        });
    }
});
