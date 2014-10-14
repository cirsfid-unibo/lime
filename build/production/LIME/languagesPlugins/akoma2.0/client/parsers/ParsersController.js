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
    parserAjaxTimeOut : 4000,

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
        }
    },

    /**
     * @property {Object} parsersListConfig
     * temporary solution to list config
     */
    parsersListConfig : {
        'blockList' : {
            'intro' : 'listIntroduction',
            'item' : 'item',
            'conclusion' : 'listConclusion'
        },
        'list' : {
            'intro' : 'intro',
            'item' : 'point',
            'conclusion' : 'wrap'
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

    /**
     * This function call parsers for passed elements
     * @param {HTMLElement[]} elements Elements to parse
     * @param {Object} [config]
     */
    parseElements : function(elements, config) {
        var me = this;
        if (config.silent)
            return;
        Ext.each(elements, function(markedNode) {
            var elementId = markedNode.getAttribute(DomUtils.elementIdAttribute);
            if (elementId) {
                var button = DocProperties.markedElements[elementId].button, 
                    widgetConfig = button.waweConfig.widgetConfig, markedWrapper = new Ext.dom.Element(markedNode), 
                    contentToParse = markedWrapper.getHTML(), editor = this.getController("Editor"), 
                    app = this.application, viewport = this.getAppViewport();
                //TODO: make an configuration file with all parsers avaible
                if (widgetConfig && (button.waweConfig.name == 'docDate')) {
                    Ext.each(widgetConfig.list, function(widget) {
                        if (widget.xtype == 'datefield') {
                            var widgetComponent = button.queryById(elementId);
                            if (widgetComponent) {
                                widgetComponent.setLoading(true);
                                me.callParser("date", Ext.util.Format.stripTags(contentToParse), function(result) {
                                    var jsonData = Ext.decode(result.responseText, true);
                                    var dates;
                                    if (jsonData.response.dates) {
                                        dates = jsonData.response.dates;
                                    }
                                    for (var i in dates) {
                                        widgetComponent.setContent(widgetComponent.id, dates[i].date);
                                        break;
                                    }
                                    widgetComponent.setLoading(false);
                                }, function() {
                                    widgetComponent.setLoading(false);
                                });
                            }
                        }
                    }, this);
                } else if (button.waweConfig.name == 'list' || button.waweConfig.name == 'blockList') {
                    viewport.setLoading(true);
                    me.callParser("list", Ext.util.Format.stripTags(contentToParse), function(result) {
                        var jsonData = Ext.decode(result.responseText, true);
                        if (jsonData) {
                            me.parseLists(jsonData, markedNode, button);
                        }
                        viewport.setLoading(false);
                    }, function() {
                        viewport.setLoading(false);
                    });
                } else if (button.waweConfig.name == 'preface') {
                    if (viewport) {
                        viewport.setLoading(true);
                    }

                    me.callParser("docNum", contentToParse, function(result) {
                        var jsonData = Ext.decode(result.responseText, true);
                        if (jsonData) {
                            me.parseDocNum(jsonData, markedNode, button);
                        }
                    }, function() {
                    });
                    me.callParser("docDate", contentToParse, function(result) {
                        var jsonData = Ext.decode(result.responseText, true);
                        if (jsonData) {
                            me.parseDocDate(jsonData, markedNode, editor, app, button);
                        }
                        if (viewport) {
                            viewport.setLoading(false);
                        }
                    }, function() {
                        if (viewport) {
                            viewport.setLoading(false);
                        }
                    });

                } else if (button.waweConfig.name == 'body') {
                    //contentToParse = contentToParse.replace(/&nbsp;/g,' ');
                    //markedWrapper.setHTML(contentToParse);
                    me.callParser("body", contentToParse, function(result) {
                        var jsonData = Ext.decode(result.responseText, true);
                        if (jsonData) {
                            try {
                                me.parseBodyParts(jsonData, markedNode, button);    
                            } catch(e) {};
                        }
                    }, function() {
                    });
                }

            }
        }, this);
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
            editor = me.getController("Editor"), markButton = button = Ext.getCmp('date0'), 
            attributeName = markButton.waweConfig.rules.askFor.date1.insert.attribute.name;
        config = {
            app : app,
            editor : editor,
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

    /**
     * This function marks all input parsed items
     * @param {Object} data An object with some items
     * @param {HTMLELement} node
     * @param {Object} editor An istance of the editor controller
     * @param {Object} app A reference to the whole application object (to fire global events)
     * @param {Object} button A reference to the button used for marking
     */
    parseLists : function(data, node, button) {
        var me = this, intro = data.response.intro, items = data.response.items, 
            app = me.application, editor = me.getController("Editor"), 
            editorContent = editor.getContent(), listConfig = Statics.parsersListConfig[button.waweConfig.name];
        if (intro) {
            var markNode = DomUtils.findNodeByText(intro, node), introButton = button.getChildByName(listConfig.intro);
            if (markNode) {
                editor.selectNode(markNode);
                app.fireEvent('markingMenuClicked', introButton, {
                    silent : true
                });
            }
        }
        if (items) {
            var itemButton = button.getChildByName(listConfig.item), 
                numButton = itemButton.getChildByName("num"), config = {
                silent : true
            };
            Ext.each(items, function(item) {
                var markNode = DomUtils.findNodeByText(item.match, node);
                if (markNode) {
                    editor.selectNode(markNode);
                    app.fireEvent('markingMenuClicked', itemButton, config);
                    var extWrapper = Ext.get(markNode);
                    extWrapper.setHTML(extWrapper.getHTML().replace(item.match, me.getParsingTemplate(item.match)));
                    var elementToMark = extWrapper.query("." + DomUtils.tempParsingClass)[0];
                    if (elementToMark) {
                        elementToMark.removeAttribute("class");
                        editor.selectNode(elementToMark);
                        app.fireEvent('markingMenuClicked', numButton, config);
                    }
                }
            }, this);
        }

    },

    /**
     * This function marks the docNumber
     * @param {Object} data An object with docNumber result from parser
     * @param {HTMLELement} node
     * @param {Object} editor An istance of the editor controller
     * @param {Object} app A reference to the whole application object (to fire global events)
     * @param {Object} button A reference to the button used for marking
     */
    parseDocNum : function(data, node, button) {
        var me = this, response = data.response, markButton = button.getChildByName('docNumber'), 
            app = me.application, editor = me.getController("Editor"), config = {
                app : app,
                editor : editor,
                markButton : markButton,
                marker : {
                    silent : true
                }
            };
        if (response) {
            Ext.each(response, function(item) {
                var docNumImpossible = me.docNumImpossibleParents;
                me.searchInlinesToMark(node, item.match, config, function(n) {
                    var extNode = Ext.get(n);
                    for (var i = 0; i < docNumImpossible.length; i++) {
                        if (extNode.up(docNumImpossible[i])) {
                            return false;
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
    searchInlinesToMark : function(node, matchStr, config, filter) {
        if (!node | !matchStr | !(config && config.app && config.editor && config.marker && config.markButton))
            return;
        var textNodes = DomUtils.findTextNodes(matchStr, node);
        Ext.each(textNodes, function(tNode) {
            var index;
            while ((!index | index != -1) && ( index = tNode.data.indexOf(matchStr)) != -1) {
                var newNode = tNode;
                if (Ext.isFunction(filter)) {
                    if (!filter(newNode))
                        break;
                }
                if (index > 0) {
                    //TODO: fix bug, IndexSizeError: Index or size is negative or greater than the allowed amount
                    newNode = newNode.splitText(index);
                }
                if (newNode.data.length > matchStr.length) {
                    tNode = newNode.splitText(matchStr.length);
                    newNode = tNode.previousSibling;
                } else {
                    index = -1;
                }
                var newWrapper = Ext.DomHelper.createDom({
                    tag : 'span'
                });
                newNode.parentNode.insertBefore(newWrapper, newNode);
                newWrapper.appendChild(newNode);
                config.editor.selectNode(newWrapper);
                config.app.fireEvent('markingMenuClicked', config.markButton, config.marker);
            };
        }, this);
    },

    wrapPartNodeSibling : function(wrapNode, guardFunction) {
        var sibling = wrapNode.nextSibling;
        while (sibling) {
            if (Ext.isFunction(guardFunction)) {
                if (guardFunction(sibling)) {
                    break;
                }
            }
            wrapNode.appendChild(sibling);
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

    wrapBodyParts : function(partName, parts, node, button) {
        var me = this, app = me.application, editor = me.getController("Editor"), 
            markButton, numButton, nodesToMark = [], numsToMark = [], 
            markButton = button.getChildByName(partName), numButton = markButton.getChildByName("num");

        Ext.each(parts, function(element) {
            if(!element.value.trim()) return; 
            var textNodes = DomUtils.findTextNodes(element.value, node), 
                extNode = Ext.get(textNodes[0]), 
                extParent = extNode.parent("." + DomUtils.tempParsingClass, true), parent;
            if (extParent || textNodes.length == 0) {
                return;
            } else {
                var newWrapper = me.wrapPartNode(extNode.dom.parentNode, node);
                element.wrapper = newWrapper;
                nodesToMark.push(newWrapper);
            }
            numsToMark = Ext.Array.push(numsToMark, me.textNodeToSpans(textNodes[0], element.value));
        }, this);
        Ext.each(nodesToMark, function(node) {
            me.wrapPartNodeSibling(node, function(sibling) {
                var extSib = Ext.get(sibling), elButton = DomUtils.getButtonByElement(sibling);
                /* If sibling is marked with the same button or it is temp element then stop the loop */
                if ((elButton && (elButton.id === markButton.id)) || (extSib.is('.' + DomUtils.tempParsingClass))) {
                    return true;
                }
                return false;
            });
        }, this);
        if (numsToMark.length > 0) {
            app.fireEvent('markingRequest', numButton, {
                silent : true,
                noEvent : true,
                nodes : numsToMark
            });
        }
        if (nodesToMark.length > 0) {
            app.fireEvent('markingRequest', markButton, {
                silent : true,
                noEvent : true,
                nodes : nodesToMark
            });
        }

        // Do contains elements
        Ext.each(parts, function(element) {
            var contains = element.contains, containsPartName = Ext.Object.getKeys(contains)[0];
            if (containsPartName && contains[containsPartName]) {
                me.wrapBodyParts(containsPartName, contains[containsPartName], element.wrapper, editor, app, button);
            }
        }, this);
    },

    parseBodyParts : function(data, node, button) {
        var me = this, app = me.application, parts = data.response, partName;
        if (parts) {
            partName = Ext.Object.getKeys(parts)[0];
            if (partName) {
                me.wrapBodyParts(partName, parts[partName], node, button);
                app.fireEvent('nodeChangedExternally', node, {
                    change : true,
                    silent: true
                });
            }
        }
    },

    wrapStructurePart : function(name, delimiter, prevPartNode) {
        var me = this, app = me.application, editor = me.getController("Editor"), 
            body = editor.getBody(), partNode, wrapNode, 
            iterNode = Ext.query('*[class='+DocProperties.getDocClassList()+']', true, body)[0];

        if (!prevPartNode) {
            while (iterNode && iterNode.childNodes.length == 1) {
                iterNode = iterNode.firstChild;
            }
            partNode = iterNode.firstChild;
            wrapNode = me.wrapPartNode(partNode, partNode.parentNode);
            me.wrapPartNodeSibling(wrapNode, function(sibling) {
                var textNodes = DomUtils.findTextNodes(delimiter.value, sibling);
                if (textNodes.length > 0) {
                    return true;
                }
                return false;
            });
        } else if (prevPartNode.nextSibling) {
            partNode = prevPartNode.nextSibling;
            wrapNode = me.wrapPartNode(partNode, partNode.parentNode);

            if (delimiter.value) {
                me.wrapPartNodeSibling(wrapNode, function(sibling) {
                    if (delimiter.flags && delimiter.flags.indexOf("i") != -1) {
                        sibling = sibling.previousSibling;
                    }
                    var textNodes = DomUtils.findTextNodes(delimiter.value, sibling);
                    if (textNodes.length > 0) {
                        return true;
                    }
                    return false;
                });

            } else
                me.wrapPartNodeSibling(wrapNode);
        }
        return wrapNode;
    },

    parseStructure : function(data) {
        var me = this, app = me.application, structure = data.structure, prevPartNode = null, 
            markingMenu = me.getController("MarkingMenu"), markButton;
        if (structure && data.success) {
            Ext.each(structure, function(name) {
                prevPartNode = me.wrapStructurePart(name, data[name], prevPartNode);
                if (prevPartNode) {
                    markButton = markingMenu.getFirstButtonByName(name);
                    app.fireEvent('markingRequest', markButton, {
                        nodes : [prevPartNode]
                    });
                }
            });
        }
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

    activateParsers : function() {
        var me = this, editor = me.getController("Editor"), editorContent = editor.getContent(), 
            app = me.application, buttonName;

        if (!DocProperties.getLang()) {
            Ext.MessageBox.alert(Locale.strings.parsersErrors.LANG_MISSING_ERROR_TITLE, Locale.strings.parsersErrors.langMissingError);
            return;
        }

        app.fireEvent(Statics.eventsNames.progressStart, null, {
            value : 0.1,
            text : Locale.getString("parsing", me.getPluginName())
        });
        Ext.defer(function() {
            // Clean docuement, removing white spaces, before parsing
            app.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("parsing", me.getPluginName()));
            me.callParser("structure", editor.getContent(), function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData) {
                    me.parseStructure(jsonData.response);
                }
                app.fireEvent(Statics.eventsNames.progressEnd);
            }, function() {
                app.fireEvent(Statics.eventsNames.progressEnd);
            });
        }, 5, me);
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
                success : success,
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
        me.application.on(Statics.eventsNames.nodeChangedExternally, me.parseElements, me);
    }
});
