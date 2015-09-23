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

Ext.define('LIME.controller.chImportController', {
    extend : 'Ext.app.Controller',

    config : {
        pluginName : "chImportDocument"
    },

    checkNumReg : new RegExp("^(\\d+)[-]?\\s*[\\).]*\\s*$", 'i'),
    checkLetterReg : new RegExp("^([a-zA-Z])[-]?\\s*[\\).]*\\s*$", 'i'),

    initMenu : function() {
        var me = this;
        menu = {
            xtype : 'menuseparator',
            name : 'importSeparator'
        };
        me.application.fireEvent("addMenuItem", me, {
            menu : "fileMenuButton",
            after : "saveAsDocumentButton"
        }, menu);
        me.addImportItem();
    },

    addImportItem : function() {
        var me = this;
        menu = {
            text : Locale.getString("importDocument", me.getPluginName()),
            tooltip : Locale.getString("importDocumentTooltip", me.getPluginName()),
            icon : 'resources/images/icons/import-icon.png',
            name : 'chImportDocument'
        };
        me.application.fireEvent("addMenuItem", me, {
            menu : "fileMenuButton",
            after : "importSeparator"
        }, menu);
    },

    uploadFinished: function(content, request) {
        var docMLang, docLang;
        if(request.response) {
            docMLang = request.response[DocProperties.markingLanguageAttribute] || "";
            docLang = request.response[DocProperties.languageAttribute] || "";
        }

        // Upload the editor's content
        Ext.GlobalEvents.fireEvent(Statics.eventsNames.loadDocument, {
            docText: content,
            docId: new Date().getTime(),
            docMarkingLanguage: docMLang,
            docLang: docLang
        });
    },

    importDocument : function() {
        // Create a window with a form where the user can select a file
        var me = this,
            transformFile = Config.getLanguageTransformationFile("languageToLIME", Config.languages[0].name),
            uploaderView = Ext.widget('uploader', {
                buttonSelectLabel : Locale.getString("selectDocument", me.getPluginName()),
                buttonSubmitLabel : Locale.getString("importDocument", me.getPluginName()),
                dragDropLabel : Locale.getString("selectDocumentExplanation", me.getPluginName()),
                title : Locale.getString("importDocument", me.getPluginName()),
                uploadCallback : me.uploadFinished,
                callbackScope: me,
                uploadUrl : Utilities.getAjaxUrl(),
                uploadParams : {
                    requestedService: Statics.services.fileToHtml,
                    transformFile: (transformFile) ? transformFile : ""
                }
            });
        uploaderView.show();
    },

    finalCleaning: function(node) {
        var parsers = this.getController("ParsersController");

        Ext.each(node.querySelectorAll('ol'), function(el) {
            Ext.fly(el).addCls('toMark');
        });

        parsers.markOlBlockList(node);

        Ext.each(node.querySelectorAll('.formula'), function(el) {
            el.setAttribute(Language.getAttributePrefix()+'name', 'enactingFormula');
        });

        Ext.each(node.querySelectorAll('p'), function(el) {
            Ext.fly(el).insertHtml('afterBegin', '<br>');
            Ext.fly(el).insertHtml('beforeEnd', '<br>');
            while(el.firstChild) {
                el.parentNode.insertBefore(el.firstChild, el);
            };
            el.parentNode.removeChild(el);
        });

        Ext.each(node.querySelectorAll('span > span'), function(el) {
            var parent = el.parentNode;

            if ( !parent.getAttribute('class') ) {
                while(parent.firstChild) {
                    parent.parentNode.insertBefore(parent.firstChild, parent);
                };
                parent.parentNode.removeChild(parent);
            }
        });

        Ext.each(node.querySelectorAll('.hcontainer'), function(el) {
            if ( !el.textContent.trim() ) {
                el.parentNode.removeChild(el);
            } else {
                var childHcontainer = Ext.Array.toArray(el.querySelectorAll('.hcontainer')).filter(function(chEl) {
                    if ( chEl.parentNode == el) {
                        return true;
                    }
                });
            }
        });

        parsers.addChildWrapper(node.querySelectorAll('.container'));
        parsers.normalizeNodes(node);
    },

    parseReferences: function(callback) {
        var me = this, parsers = this.getController("ParsersController"),
            editor = me.getController("Editor"),
            content = editor.getContent('text');

        parsers.callReferenceParser(callback, content);
    },

    normalizeDocDates: function() {
        var me = this, editor = me.getController("Editor"),
            body = editor.getBody();
        var parsers = this.getController("ParsersController");
        var preface = body.querySelector('.preface');

        if (preface) {
            var dates = preface.querySelectorAll('.docDate');
            var contentToParse = Ext.fly(preface).getHtml();
            var button = DomUtils.getButtonByElement(preface);

            parsers.callParser("docDate", contentToParse, function(result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData && !Ext.Object.isEmpty(jsonData.response.dates)) {
                    Ext.each(dates, function(date) {
                        DomUtils.unwrapNode(date);
                    });
                    parsers.parseDocDate(jsonData, preface, button, true);
                }
            }, function() {});
        }
    },

    parseDocument: function() {
        var me = this,
            parsers = me.getController("ParsersController"),
            editor = me.getController("Editor");

        me.application.fireEvent(Statics.eventsNames.progressStart, null, {
            value : 0.1,
            text : Locale.getString("parsing", "parsers")
        });
        try {
            me.searchNodesToMark(function(markingConfigs) {
                Ext.each(markingConfigs, function(markingConf) {
                    //var silent = (markingConf.button.markupConfig.pattern == "inline") ? false : true;
                    parsers.requestMarkup(markingConf.button, {
                        silent : true,
                        noEvent : true,
                        noDoubleMarkingCheck : true,
                        nodes : markingConf.nodes,
                        noExpandButtons: true
                    });
                });
                if(markingConfigs.length) {
                    me.detectHcontainerNumsToMark();
                    me.normalizeDocDates();
                    me.finalCleaning(editor.getBody());
                    parsers.callAttachmentParser(function() {
                        me.parseReferences(function() {
                            me.application.fireEvent(Statics.eventsNames.progressEnd);
                        });
                    });

                } else {
                    me.application.fireEvent(Statics.eventsNames.progressEnd);
                }
            });
        } catch(e) {
            console.log(e);
            me.application.fireEvent(Statics.eventsNames.progressEnd);
        }
    },

    getElementsToMarkGeneric: function(node, type, config) {
        var me = this,
            button = DocProperties.getFirstButtonByName(type);
        if(button) {
            node.setAttribute("class", DomUtils.tempParsingClass+" "+type);
            me.addElementToConfig(config, button.id, node);
        }
    },

    getElementsToMarkPartitionHeader: function(node, type, config) {
        var me = this,
            orderButtons = ["num", "heading"];
        Ext.each(node.children, function(nodeChild, index) {
            if(orderButtons[index]) {
                var elButton = DocProperties.getFirstButtonByName(orderButtons[index]);
                if(elButton) {
                    nodeChild.setAttribute("class", DomUtils.tempParsingClass+" "+elButton.name);
                    me.addElementToConfig(config, elButton.id, nodeChild);
                }
            }
        });
    },

    addElementToConfig: function(config, id, element) {
        config[id] = config[id] || [];
        config[id].push(element);
    },

    detectHcontainerNumsToMark: function() {
        var me = this, editor = me.getController("Editor"),
            body = editor.getBody(),
            hcontainers = Array.prototype.slice.call(body.querySelectorAll(".hcontainer")).filter(function(el) {
                return !el.querySelector(".num");
            }), button,
            checkNum = new RegExp("^\\d+[-]?\\w*\\s*[\\)]", 'i'), //TODO: include letters
            nodesToMark = [];

        Ext.each(hcontainers, function(node) {
            var leafs = Array.prototype.slice.call(node.querySelectorAll("*")).filter(function(el) {
                return (!el.querySelector("*") && el.textContent.trim() );
            }), maybeNumNode = leafs[0],
                text = (maybeNumNode) ? maybeNumNode.textContent.trim()+")" : '';

            // Filter only very short texts
            if(checkNum.test(text)) {
                nodesToMark.push(maybeNumNode);
            }
        });

        if(nodesToMark.length) {
            button = DocProperties.getFirstButtonByName("num");
            me.application.fireEvent('markingRequest', button, {silent:true, nodes:nodesToMark});
        }
    },

    wrapBodyPars: function(body, type, cls, config) {
        var me = this,
            parsers = me.getController("ParsersController"),
            partitions = body.querySelectorAll("[class='"+cls+"']"),
            button = DocProperties.getFirstButtonByName(type),
            nodes = [];

        if(button) {
            partitions = Array.prototype.slice.call(partitions);
            Ext.each(partitions, function(partition) {
                var partEl = parsers.wrapPartNode(partition, partition.parentNode);
                parsers.wrapPartNodeSibling(partEl, function(sibling) {
                    if (partitions.indexOf(sibling) == -1) {
                        return false;
                    }
                    return true;
                });
                partEl.setAttribute("class", DomUtils.tempParsingClass+" "+button.name);
                me.addElementToConfig(config, button.id, partEl);
                Ext.fly(partition).removeCls("partitionHeader");
                nodes.push(partEl);
            });
        }
        return nodes;
    },

    getTypeByPartitionCls : function(cls) {
        var lastCls = cls.split(" ");
        lastCls = lastCls[lastCls.length-1];
        var type = "";
        switch(lastCls) {
            case "h1":
                type = "chapter";
                break;
            case "h2":
                type = "section";
                break;
            case "h6":
                type = "article";
                break;
        }
        return type;
    },

    wrapPartitionsRicorsive: function(node, config) {
        var me = this, partition = node.querySelector(".partitionHeader"),
            cls, type, nodes;
        if(partition) {
            cls = partition.getAttribute("class");
            type = me.getTypeByPartitionCls(cls);
            if(type) {
                nodes = me.wrapBodyPars(node, type, cls, config);
                Ext.each(nodes, function(nd) {
                    me.wrapPartitionsRicorsive(nd, config);
                });
            }
        }
    },

    detectBodyParts: function(body, config, callback) {
        if (!body) {
            Ext.callback(callback, this);
            return;
        }
        var me = this,
            parsers = me.getController("ParsersController"),
            nums = body.querySelectorAll(".num"),
            contentToParse = "";

        Ext.each(nums, function(node) {
            contentToParse+= "<span>"+DomUtils.getTextOfNode(node)+ "</span>";
        });

        me.wrapPartitionsRicorsive(body, config);

        Ext.each(body.querySelectorAll('.article'), function(node) {
            me.detectArticleParts(node, config);
        });

        Ext.callback(callback, me);
    },

    detectArticleParts: function(node, config) {
        var me = this, items= [], nums = [],
            parsers = me.getController("ParsersController"),
            blockListButton = DocProperties.getChildConfigByName(DocProperties.getFirstButtonByName("article"), 'blockList')
                                || DocProperties.getFirstButtonByName('blockList'),
            itemButton = DocProperties.getChildConfigByName(blockListButton, 'item')
                            || DocProperties.getFirstButtonByName('item'),
            numButton = DocProperties.getChildConfigByName(itemButton, 'num')
                        || DocProperties.getFirstButtonByName('num');

        Ext.each(node.querySelectorAll('p, .paragraph'), function(paraNode) {
            var numNode = paraNode.firstChild;

            // Check if this p may be an item
            if ( numNode && numNode.textContent.trim() &&
                    ( me.checkNumReg.test(numNode.textContent) || me.checkLetterReg.test(numNode.textContent) ) ) {

                var wrapNode = me.createAndInsertWrapper(paraNode);

                numNode.setAttribute("class", DomUtils.tempParsingClass+" "+numButton.name);
                me.addElementToConfig(config, numButton.id, numNode);
                me.addElementToConfig(config, itemButton.id, wrapNode);

                DomUtils.moveChildrenNodes(paraNode, wrapNode, true);
                parsers.wrapItemText(wrapNode);
                items.push(wrapNode);
                nums.push(numNode);
            }
        });

        if (items.length ) {
            me.wrapItemsBlockLists(items, nums, config, blockListButton);
        }
    },

    wrapItemsBlockLists: function(items, nums, config, button) {
        var me = this,
            parsers = me.getController("ParsersController"),
            itemsToInsert = Ext.Array.clone(items);

        // There may be many blocklists
        while( itemsToInsert.length ) {
            var wrapNode = me.createAndInsertWrapper(itemsToInsert[0]);

            parsers.wrapPartNodeSibling(wrapNode, function(node) {
                if ( itemsToInsert.length != Ext.Array.remove(itemsToInsert, node).length) {
                    return false;
                }
                if ( node.nodeType == DomUtils.nodeType.ELEMENT &&
                            (node.nodeName.toLowerCase() == "br") ||
                             Ext.fly(node).hasCls(DomUtils.breakingElementClass)) {
                    return false;
                } else if ( Ext.isEmpty(node.textContent.trim()) ) {
                    return false;
                }
                return true;
            });

            me.addElementToConfig(config, button.id, wrapNode);
        }

        me.nestListsByCmpNums(nums, config, button);
    },

    nestListsByCmpNums: function(nums, config, listButton) {
        var me = this,
            parsers = me.getController("ParsersController");

        var prevNum = nums[0];
        Ext.each(nums.splice(1), function(numNode) {
            if ( me.checkNumReg.test(prevNum.textContent) &&
                    me.checkLetterReg.test(numNode.textContent) &&
                    Ext.String.endsWith(prevNum.parentNode.textContent.trim(), ':') ) {

                var wrapNode = me.createAndInsertWrapper(numNode.parentNode);
                parsers.wrapPartNodeSibling(wrapNode, function(node) {
                    var num = node.querySelector('.num');
                    if ( num && me.checkNumReg.test(num.textContent) != me.checkNumReg.test(numNode.textContent) ) {
                        return true;
                    }
                });
                prevNum.parentNode.appendChild(wrapNode);

                me.addElementToConfig(config, listButton.id, wrapNode);
            }
            prevNum = numNode;
        });
    },

    createAndInsertWrapper: function(targetNode) {
        var wrapNode = Ext.DomHelper.createDom({
            tag : 'div',
            cls : DomUtils.tempParsingClass
        });
        targetNode.parentNode.insertBefore(wrapNode, targetNode);
        return wrapNode;
    },

    detectBody: function(node, config) {
        var me = this, partition = node.querySelector(".partitionHeader"),
            parsers = me.getController("ParsersController"), bodyEl,
            button = DocProperties.getFirstButtonByName("body");

        if(partition) {
            bodyEl = parsers.wrapPartNode(partition, partition.parentNode);
            parsers.wrapPartNodeSibling(bodyEl);
            bodyEl.setAttribute("class", DomUtils.tempParsingClass+" "+button.name);
            me.addElementToConfig(config, button.id, bodyEl);
        }

        return bodyEl;
    },

    detectPreamble: function(editorBody, bodyEl, config) {
        var me = this, preamble = editorBody.querySelector(".preamble"),
            parsers = me.getController("ParsersController"), sibling, preambleEl,
            button = DocProperties.getFirstButtonByName("preamble"), cls;

        if (preamble) {
            preambleEl = parsers.wrapPartNode(preamble, preamble.parentNode);
            DomUtils.moveChildrenNodes(preamble, preambleEl, true);
            preambleEl.removeChild(preamble);
            preambleEl.setAttribute("class", DomUtils.tempParsingClass+" "+button.name);
            // Include in the preamble all siblings until reach the body
            if (bodyEl) {
                sibling = preambleEl.nextSibling;
                while (sibling && sibling != bodyEl) {
                    preambleEl.appendChild(sibling);
                    sibling = preambleEl.nextSibling;
                }
            }

            if(preambleEl.previousSibling) {
                sibling = preambleEl.previousSibling;
                cls = sibling.getAttribute("class") || "";
                if(sibling.querySelector(".docAuthority") || cls.indexOf(".docAuthority")) {
                    preambleEl.insertBefore(sibling, preambleEl.firstChild);
                }
            }
        }

        if(preambleEl) {
            config[button.id] = [preambleEl];
            Ext.each(preambleEl.querySelectorAll('span:not(class)'), function(span) {
                if ( span.textContent ) {
                    DomUtils.unwrapNode(span);
                }
            });
        }

        return preambleEl;
    },

    detectPreface: function(editorBody, limitNode, config) {
        var me = this, parsers = me.getController("ParsersController"), sibling, prefaceEl,
            button = DocProperties.getFirstButtonByName("preface");

        if(limitNode && limitNode.previousSibling) {
            prefaceEl = parsers.wrapPartNode(limitNode.previousSibling, limitNode.previousSibling.parentNode);
            prefaceEl.setAttribute("class", DomUtils.tempParsingClass+" "+button.name);
            me.addElementToConfig(config, button.id, prefaceEl);
            sibling = prefaceEl.previousSibling;
            while(sibling) {
                prefaceEl.insertBefore(sibling, prefaceEl.firstChild);
                sibling = prefaceEl.previousSibling;
            }
        }

        /*if ( prefaceEl ) {
            parsers.parseInsidePreface(prefaceEl, button);
        }*/

        return prefaceEl;
    },

    searchNodesToMark: function(callback) {
        var me = this, editor = me.getController("Editor"),
            body = editor.getBody(), toMarkNodes = body.querySelectorAll(".toMark"),
            parsers = me.getController("ParsersController"),
            markingConfigs = {}, result = [], bodyEl, preambleEl, notesManager;

        if(toMarkNodes.length) {
            Ext.each(toMarkNodes, function(node) {
                var type = me.getMarkingTypeByNode(node),
                    getNodeFn = me["getElementsToMark"+Ext.String.capitalize(type)];
                if(Ext.isFunction(getNodeFn)) {
                    Ext.callback(getNodeFn, me, [node, type, markingConfigs]);
                } else {
                    me.getElementsToMarkGeneric(node, type, markingConfigs);
                }
            });

            bodyEl = me.detectBody(body, markingConfigs);
            preambleEl = me.detectPreamble(body, bodyEl, markingConfigs) || bodyEl;
            me.detectPreface(body, preambleEl, markingConfigs);


            me.detectBodyParts(bodyEl, markingConfigs, function() {
                Ext.each(Ext.Object.getKeys(markingConfigs), function(buttonId) {
                    var button  = DocProperties.getElementConfig(buttonId);
                    if(button) {
                        result.push({
                            button: button,
                            nodes: markingConfigs[buttonId]
                        });
                    }
                });
                toMarkNodes = body.querySelectorAll(".toMark");
                Ext.each(toMarkNodes, function(node) {
                    node.removeAttribute("class");
                });
                if ( preambleEl != bodyEl ) {
                    parsers.parseInsidePreamble(preambleEl, DocProperties.getFirstButtonByName("preamble"), function() {
                        Ext.callback(callback, me, [result]);
                    }, true);
                } else {
                    Ext.callback(callback, me, [result]);
                }
            });
        } else {
            Ext.callback(callback, me, [result]);
        }
    },

    getMarkingTypeByNode: function(node) {
        var cls = node.getAttribute("class") || "",
            clses = cls.split(" ");
        return clses[1];
    },

    onInitPlugin : function() {
        var me = this;
        me.initMenu();
        me.application.on(Statics.eventsNames.afterLoad, me.parseDocument, me);
    },

    init : function() {
        var me = this;

        __CH = me;
        this.control({
            'menu [name=chImportDocument]' : {
                click : function() {
                    me.importDocument();
                }
            }
        });
    }
});
