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

Ext.define('LIME.controller.XmlJNDiffController', {
    extend : 'Ext.app.Controller',
    
    views: ["LIME.ux.xmlJNdiff.JNdiffMainTab"],

    refs : [{
        selector : 'appViewport',
        ref : 'appViewport'
    }, {
        selector: 'jnDiffMainTab',
        ref: 'diffPanel'
    }, {
        selector: 'jnDiffMainTab *[cls=diffContainer]',
        ref: 'diffContainer'
    }, {
        ref : 'mainEditor',
        selector : '#mainEditor mainEditor'
    }, {
        ref: 'secondEditor',
        selector: '#secondEditor mainEditor'
    },{
        selector: 'explorer',
        ref: 'explorer'
    },{
        selector: 'mainToolbar',
        ref: 'mainToolbar'
    }, {
        selector: 'main',
        ref: 'main'
    }, {
        selector : '[cls=markingMenuContainer]',
        ref : 'markingMenuContainer'
    }, {
        selector: 'mainToolbar',
        ref: 'mainToolbar'
    }],

    config : {
        pluginName : "xmlJNdiff",
        jndiffXmlServiceUrl : "php/JNxmlDiff/index.php",
        initDiffPage: "php/AKNDiff/data/empty.html"
    },
    
    previousDiff: {
        docsId: {},
        docsUrl: {}
    },
    
    maybeDiff : function() {
        if(!this.getDiffPanel()) return;
        var i = 0, diff = true;
        for (; i < this.selectedDocs.length; i++) {
            if (!this.selectedDocs[i].id) {
                diff = false;
                break;
            }
        }
        return (diff) ? this.getDocsUrl() : null;
    },

    setViewConfig : function() {
        var me = this, diffPanel = me.getDiffPanel(), 
            selectDocumentButtons = diffPanel.query("*[cls=selectButton]"), show = true;
        Ext.each(selectDocumentButtons, function(selectButton, index) {
            selectButton.docIndex = selectButton.docIndex || index;
            var docId = me.selectedDocs[selectButton.docIndex].id;
            selectButton.setText((docId) ? me.strings.changeDoc : me.strings.selectDoc);
        });
        me.maybeDiff();
    },

    getIframePlugin : function(tab) {
        var me = this, diffPanel = me.getDiffPanel(), 
            cmp = tab || diffPanel.down("*[cls=diffContainer]").getActiveTab();
        return cmp.getPlugin('iframe');
    },

    setLoading : function(loading) {
        var cmp = this.getDiffContainer();
        cmp.setLoading(loading);
    },

    getDiff : function(docsUrl) {
        var me = this, diffPanel = me.getDiffPanel();

        var callDiff = function(source1, source2) {
            Ext.Ajax.request({
                url : me.getJndiffXmlServiceUrl(),
                method : 'POST',
                params : {
                    source1 : source1,
                    source2 : source2
                },
                success : function(result, request) {
                    me.showDiff(result.responseText);
                    /*var jsonData = {};
                    jsonData = Ext.decode(result.responseText, true);
                    if (jsonData) {
                        console.log(jsonData);
                    } else {
                        Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
                    }*/
                },
                failure : function() {
                    Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
                }
            });
        };

        me.downloadXml(docsUrl.doc1, function(result1) {
            me.downloadXml(docsUrl.doc2, function(result2) {
                callDiff(result1.responseText, result2.responseText);
            });
        });
    },

    showDiff: function(data) {
        var cmp = this.getDiffContainer().down('textfield');
        this.setLoading(false);
        cmp.setValue(data);
    },

    downloadXml: function(url, callback) {
        Ext.Ajax.request({
            url : url,
            method : 'GET',
            success : function(result, request) {
                callback(result);
            },
            failure : function() {
                Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
            }
        });
    },

    getDocsUrl : function() {
        var me = this, 
            diffPanel = me.getDiffPanel(), 
            params = {
                requestedService : 'EXPORT_FILES'
            }, changed = false;
        Ext.each(me.selectedDocs, function(doc, index) {
            var name = "doc" + (index + 1);
            doc.id = (doc.id == 'editorDoc') ? DocProperties.documentInfo.docId : doc.id;
            params[name] = doc.id;
            if (me.previousDiff.docsId[name] != params[name]) {
                me.previousDiff.docsId[name] = params[name];
                changed = true;
            }
        }, me);
        
        me.setLoading(true);
        Ext.Ajax.request({
            url : Utilities.getAjaxUrl(),
            method : 'POST',
            params : params,
            scope : me,
            success : function(result, request) {
                var jsonData = {};
                jsonData = Ext.decode(result.responseText, true);
                if (jsonData && jsonData.docsUrl) {
                    me.previousDiff.docsUrl = jsonData.docsUrl;
                    me.getDiff(jsonData.docsUrl);
                    diffPanel.enforceReload = false;
                } else {
                    Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
                }
            },
            failure : function() {
                Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
            }
        });
    },

    selectDocument : function(button, docIndex) {
        var me = this, textfield = button.up().down("textfield"), 
            otherDoc = me.selectedDocs[1-docIndex].id, workUri, indexes, config = {};
        // If user is selecting the second document
        if (otherDoc) {
            otherDoc = (otherDoc == 'editorDoc') ? DocProperties.documentInfo.docId : otherDoc;
            indexes = Utilities.globalIndexOf("/", otherDoc);
            workUri = (indexes.length >= 2) ? otherDoc.substr(0, indexes[indexes.length - 2]) : otherDoc;
        }
        config = {
            path: workUri,
            allowOnlyInPaths: workUri,
            notAllowedPaths: otherDoc,
            notAllowedPathRender: function(el, record) {
                Ext.tip.QuickTipManager.register({
                    target: el.getAttribute('id'),
                    text: Locale.getString("forbiddenElement", me.getPluginName())
                });
            },
            callback: function(doc) {
                me.selectedDocs[docIndex] = Ext.clone(doc);
                textfield.setValue(doc.path);
                me.setViewConfig();
            },
            scope: me
        };
        me.application.fireEvent(Statics.eventsNames.selectDocument, config); 

    },
    
    clearSelectedDocuments: function(cmp) {
        var fields = cmp.up().query("textfield");
        
        this.selectedDocs = [{}, {}];
        Ext.each(fields, function(field) {
            field.setValue("");
        });

        previousDiff = {
            docsId: {},
            docsUrl: {}
        };
    },

    enableEditMode: function() {
        var me = this, config;
        if(!Ext.isEmpty(me.previousDiff.docsId)) {
            config = {
                editableDoc: me.previousDiff.docsId[me.previousDiff["new"]],
                notEditableDoc: me.previousDiff.docsId[me.previousDiff["old"]]
            };
            me.application.fireEvent(Statics.eventsNames.enableDualEditorMode, config);      
        }       
    },

    enableEditModeScenarioB: function() {
        var me = this, config;
        if( !Ext.isEmpty(me.previousDiff.docsId) ) {
            config = {
                editableDoc: me.previousDiff.docsId[me.previousDiff["new"]],
                notEditableDoc: me.previousDiff.docsId[me.previousDiff["old"]]
            };
            me.enableDualEditorMode(config);    
        }
    },


    createSecondEditor: function() {
        var secondEditor = Ext.widget("main", {
            id: 'secondEditor',
            resizable : true,
            region : 'west',
            width: '48%',
            margin : 2
        });

        this.getAppViewport().add(secondEditor);
        return secondEditor;
    },

    finishEditingMode: function(editor, diff) {
         var me = this,
            mainTabPanel = me.getMain(),
            viewport = me.getAppViewport(),
            userInfo = this.getController('LoginManager').getUserInfo(),
            editorTab = me.getMainEditor().up(),
            newExplorer, language = me.getController("Language"),
            markingMenuController = me.getController('MarkingMenu'),
            editorController = me.getController("Editor");

        editorController.autoSaveContent(true);

        var structure = markingMenuController.getTreeButtonsStructure();

        Ext.defer(function() {
            structure.enable();
        }, 100);

        var commons = markingMenuController.getTreeButtonsCommons();

        markingMenuController.clearTreeFilter(commons);
        editorController.defaultActions = {};
        DocProperties.documentState = '';

        language.beforeTranslate(function(xml) {
            xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
            var params = {
                userName : userInfo.username,
                fileContent : xml,
                metadata: DomUtils.serializeToString(me.secondDocumentConfig.metaDom)
            };

            var url = me.secondDocumentConfig.docId.replace("/diff/", "/diff_modified/");

            me.application.fireEvent(Statics.eventsNames.saveDocument, url, params, function() {
                if(diff) {
                    diff.tab.show();
                    diff.enforceReload = true;
                    mainTabPanel.setActiveTab(diff);
                }

                editorTab.noChangeModeEvent = false;
                viewport.remove(editor);

                newExplorer = Ext.widget("explorer", {
                    region : 'west',
                    expandable : true,
                    resizable : true,
                    width : '15%',
                    autoScroll : true,
                    margin : 2
                });
                viewport.add(newExplorer);
                if(me.finishEditBtn) {
                    me.finishEditBtn.up().remove(me.finishEditBtn);
                }
            });
        }, {}, null, editor, me.secondDocumentConfig.metaDom);
    },

    focusNode: function(dom, node) {
        // Remove the focus from previous nodes
        Ext.each(dom.querySelectorAll("*["+DocProperties.elementFocusedCls+"]"), function(focusedNode) {
            focusedNode.removeAttribute(DocProperties.elementFocusedCls);
        });

        if(node) {
            node.scrollIntoView();
            node.setAttribute(DocProperties.elementFocusedCls, "true");
        }
    },

    onNodeFocused: function(node) {
        var secondEditor = this.getSecondEditor(),
            editorController = this.getController("Editor"),
            langPrefix, newElId, oldElId, secondEditorDom,
            nodeToScrollTo, firstId, secondId, query;

        if(secondEditor) {
            secondEditorDom = editorController.getDom(secondEditor);
            langPrefix = Language.getAttributePrefix();
            firstId = langPrefix+"wId";
            secondId = langPrefix+"eId";
            var secondEditorNode = null;
            var iterNode = node;

            while ( !secondEditorNode && iterNode && iterNode.nodeType == DomUtils.nodeType.ELEMENT ) {
                newElId = iterNode.getAttribute(firstId) || iterNode.getAttribute(secondId);
                if(newElId) {
                    query = "*["+firstId+"='"+newElId+"'], *["+secondId+"='"+newElId+"']";
                    secondEditorNode = secondEditorDom.querySelector(query);
                }

                iterNode = iterNode.parentNode;
            }

            if ( secondEditorNode ) {
                this.focusNode(secondEditorDom, secondEditorNode);
            }
        }
    },

    afterDocumentLoaded: function() {
        var me = this;
        if(Ext.isFunction(me.manageAfterLoad)) {
            Ext.callback(me.manageAfterLoad);
            me.manageAfterLoad = null;
        }
    },

    onMarkingMenuLoaded: function() {
        if ( Ext.isFunction(this.markingMenuMenuLoad) ) {
            this.markingMenuMenuLoad();
        }
        this.markingMenuMenuLoad = null;
    },
    
    init : function() {
        var me = this;
        me.selectedDocs = [{}, {}];
        
        me.strings = {
            changeDoc : Locale.getString("changeDocument", me.getPluginName()),
            selectDoc : Locale.getString("selectDocument", me.getPluginName())
        };

        me.application.on(Statics.eventsNames.editorDomNodeFocused, me.onNodeFocused, me);
        me.application.on(Statics.eventsNames.afterLoad, me.afterDocumentLoaded, me);
        me.application.on(Statics.eventsNames.markingMenuLoaded, me.onMarkingMenuLoaded, me);
        
        this.control({
            'jnDiffMainTab': {
                activate: me.setViewConfig
            },
            'jnDiffMainTab *[cls=selectButton]': {
                click: function(cmp) {
                    me.selectDocument(cmp, cmp.docIndex);
                }
            },
            'jnDiffMainTab *[cls=resetButton]': {
                click: function(cmp) {
                    me.clearSelectedDocuments(cmp);
                    me.setViewConfig();
                }
            },
            'jnDiffMainTab *[cls=editButton]': {
                click: me.enableEditMode
            },
            'jnDiffMainTab *[cls=editButtonScenarioB]': {
                click: me.enableEditModeScenarioB
            },
            'jnDiffMainTab *[cls=printButton]': {
                click: function () {
                    var plugin = me.getIframePlugin(),
                        url = plugin && plugin.url;
                    if (url)
                        window.open(url);
                }
            },
            'jnDiffMainTab tabpanel[cls=diffContainer]': {
                tabchange: me.maybeDiff
            }
        });
    }
});
