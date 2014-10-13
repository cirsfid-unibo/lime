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
        var app = this.application, docMLang, docLang;
        if(request.response) {
            docMLang = request.response[DocProperties.markingLanguageAttribute] || "";
            docLang = request.response[DocProperties.languageAttribute] || ""; 
        }
        
        // Upload the editor's content
        app.fireEvent(Statics.eventsNames.loadDocument, {
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
    
    parseDocument: function() {
        var me = this;
        
        me.application.fireEvent(Statics.eventsNames.progressStart, null, {
            value : 0.1,
            text : Locale.getString("parsing", "parsers")
        });
        try {
            me.searchNodesToMark(function(markingConfigs) {
                Ext.each(markingConfigs, function(markingConf) {
                    var silent = (markingConf.button.waweConfig.markupConfig.pattern == "inline") ? false : true;
                    me.application.fireEvent('markingRequest', markingConf.button, {silent:silent, nodes:markingConf.nodes});            
                });
                if(markingConfigs.length) {
                    me.detectHcontainerNumsToMark();    
                }
                me.application.fireEvent(Statics.eventsNames.progressEnd);
            });    
        } catch(e) {
            console.log(e);
            me.application.fireEvent(Statics.eventsNames.progressEnd);
        }
    },
    
    getElementsToMarkGeneric: function(node, type, config) {
        var me = this, markingMenu = me.getController("MarkingMenu"),
            button = markingMenu.getFirstButtonByName(type);
        if(button) {
            node.setAttribute("class", DomUtils.tempParsingClass+" "+type);
            me.addElementToConfig(config, button.id, node);
        }
    },
    
    getElementsToMarkPartitionHeader: function(node, type, config) {
        var me = this, markingMenu = me.getController("MarkingMenu"),
            orderButtons = ["num", "heading"];
        Ext.each(node.children, function(nodeChild, index) {
            if(orderButtons[index]) {
                var elButton = markingMenu.getFirstButtonByName(orderButtons[index]);
                if(elButton) {
                    nodeChild.setAttribute("class", DomUtils.tempParsingClass+" "+elButton.waweConfig.name);
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
            markingMenu = me.getController("MarkingMenu"),
            hcontainers = Array.prototype.slice.call(body.querySelectorAll(".hcontainer")).filter(function(el) {
                return !el.querySelector(".num");
            }), button,
            checkNum = new RegExp("\\d+[-]?\\w*\\s*[\\)]", 'i'), //TODO: include letters
            nodesToMark = [];
            
        Ext.each(hcontainers, function(node) {
            var leafs = Array.prototype.slice.call(node.querySelectorAll("*")).filter(function(el) {
                return !el.querySelector("*");
            }), maybeNumNode = leafs[0],
                text = DomUtils.getTextOfNode(maybeNumNode)+")";
            // Filter only very short texts
            if(text.length < 6 && checkNum.test(text)) {
                nodesToMark.push(maybeNumNode);
            }
        });
        
        if(nodesToMark.length) {
            button = markingMenu.getFirstButtonByName("num");
            me.application.fireEvent('markingRequest', button, {silent:true, nodes:nodesToMark});
        }
    },

    wrapBodyPars: function(body, type, config) {
        var me = this, markingMenu = me.getController("MarkingMenu"), 
            parsers = me.getController("ParsersController"),
            partitions = body.querySelectorAll(".partitionHeader"),
            button = markingMenu.getFirstButtonByName(type);
        
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
                partEl.setAttribute("class", DomUtils.tempParsingClass+" "+button.waweConfig.name);
                me.addElementToConfig(config, button.id, partEl);
            });
        }
    },

    
    detectBodyParts: function(body, config, callback) {
        var me = this,
            markingMenu = me.getController("MarkingMenu"),
            parsers = me.getController("ParsersController"),
            nums = body.querySelectorAll(".num"),
            contentToParse = "";
        
        Ext.each(nums, function(node) {
            contentToParse+= "<span>"+DomUtils.getTextOfNode(node)+ "</span>";
        });
  
        parsers.callParser("body", contentToParse, function(result) {
            var jsonData = Ext.decode(result.responseText, true), type;
            if (jsonData) {
                me.application.fireEvent(Statics.eventsNames.progressUpdate, Locale.getString("parsing", "parsers"));
                type = Ext.Object.getKeys(jsonData.response)[0];
                me.wrapBodyPars(body, type, config);
                Ext.callback(callback, me);
            }
        }, function() {
            Ext.callback(callback, me);
        });
    },
    
    detectBody: function(node, config) {
        var me = this, partition = node.querySelector(".partitionHeader"),
            markingMenu = me.getController("MarkingMenu"),
            parsers = me.getController("ParsersController"), bodyEl,
            button = markingMenu.getFirstButtonByName("body");

        if(partition) {
            bodyEl = parsers.wrapPartNode(partition, partition.parentNode);
            parsers.wrapPartNodeSibling(bodyEl);
            bodyEl.setAttribute("class", DomUtils.tempParsingClass+" "+button.waweConfig.name);
            me.addElementToConfig(config, button.id, bodyEl);
        }
        
        return bodyEl;
    },
    
    detectPreamble: function(editorBody, bodyEl, config) {
        var me = this, preamble = editorBody.querySelector(".preamble"),
            parsers = me.getController("ParsersController"), sibling, preambleEl,
            markingMenu = me.getController("MarkingMenu"),
            button = markingMenu.getFirstButtonByName("preamble"), cls;
        
        if (preamble) {
            preambleEl = parsers.wrapPartNode(preamble, preamble.parentNode);
            DomUtils.moveChildrenNodes(preamble, preambleEl, true);
            preambleEl.removeChild(preamble);
            preambleEl.setAttribute("class", DomUtils.tempParsingClass+" "+button.waweConfig.name);
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
        }
        
        return preambleEl;
    },
    
    detectPreface: function(editorBody, limitNode, config) {
        var me = this, parsers = me.getController("ParsersController"), sibling, prefaceEl,
            markingMenu = me.getController("MarkingMenu"),
            button = markingMenu.getFirstButtonByName("preface");
            
        if(limitNode && limitNode.previousSibling) {
            prefaceEl = parsers.wrapPartNode(limitNode.previousSibling, limitNode.previousSibling.parentNode);
            prefaceEl.setAttribute("class", DomUtils.tempParsingClass+" "+button.waweConfig.name);
            me.addElementToConfig(config, button.id, prefaceEl);
            sibling = prefaceEl.previousSibling;
            while(sibling) {
                prefaceEl.insertBefore(sibling, prefaceEl.firstChild);
                sibling = prefaceEl.previousSibling;
            }
        }
        
        return prefaceEl;
    },
    
    searchNodesToMark: function(callback) {
        var me = this, editor = me.getController("Editor"),
            body = editor.getBody(), toMarkNodes = body.querySelectorAll(".toMark"),
            parsers = me.getController("ParsersController"), markingMenu = me.getController("MarkingMenu"),
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
                    var button  = Ext.getCmp(buttonId);
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
                Ext.callback(callback, me, [result]);
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
