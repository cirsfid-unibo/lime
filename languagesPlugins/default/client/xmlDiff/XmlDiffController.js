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

Ext.define('LIME.controller.XmlDiffController', {
    extend: 'Ext.app.Controller',
    
    views: [
      "LIME.ux.xmlDiff.AmendingDiffMainTab",
      "LIME.ux.xmlDiff.ConsolidatingDiffMainTab"
    ],

    refs: [
        { ref: 'appViewport', selector : 'appViewport' }, 
        { ref: 'editButton', selector: 'amendingDiffMainTab *[cls=editButton]' }, 
        { ref: 'editButtonScenarioB', selector: 'consolidatingDiffMainTab *[cls=editButton]' }, 
        { ref: 'mainEditor', selector : '#mainEditor mainEditor' }, 
        { ref: 'secondEditor', selector: '#secondEditor mainEditor' },
        { ref: 'explorer', selector: 'explorer' },
        { ref: 'mainToolbar', selector: 'mainToolbar' }, 
        { ref: 'main', selector: 'main' }, 
        { ref: 'markingMenuContainer', selector : '[cls=markingMenuContainer]' }, 
        { ref: 'mainToolbar', selector: 'mainToolbar' }
    ],

    config: {
        pluginName : "xmlDiff",
        diffXmlServiceUrl : "php/diff/index.php",
        diffServiceUrl : "php/AKNDiff/index.php",
        initDiffPage: "php/AKNDiff/data/empty.html"
    },

    // Set the iframe source of the current tab to either the Akomantoso diff
    // or the generic XML diff, depending on which tab is active. 
    getDiff : function(cmp) {
        var format = cmp.down("*[cls=diffContainer]").getActiveTab().format || 'text',
            baseUrl = (format=="xml") ? this.getDiffXmlServiceUrl() : this.getDiffServiceUrl(),
            url = baseUrl + '?' + Ext.urlEncode({
                from: cmp.firstDoc.url,
                to: cmp.secondDoc.url,
                format: format,
                edit: true
            });
        cmp.setIframeSource(url, function(doc) {
            cmp.enableEditButton();
            var newDoc = doc.querySelector(".newDocVersion");

            if(newDoc) {
                var firstDocIsNewer = (newDoc.getAttribute("url") == cmp.firstDoc.url);
                cmp.firstDoc.new = firstDocIsNewer;
                cmp.secondDoc.new = !firstDocIsNewer;
            }
        });
    },

    // Call EXPORT_FILES service and get an url where the diff
    // can access the two files.
    getDocsUrl : function(cmp) {        
        cmp.setLoading();
        Ext.Ajax.request({
            url : Utilities.getAjaxUrl(),
            method : 'POST',
            params : {
                requestedService: 'EXPORT_FILES',
                doc1: cmp.firstDoc.id,
                doc2: cmp.secondDoc.id
            },
            scope : this,
            success : function(result, request) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData && jsonData.docsUrl) {
                    cmp.firstDoc.url = jsonData.docsUrl.doc1;
                    cmp.secondDoc.url = jsonData.docsUrl.doc2;
                    this.getDiff(cmp);
                } else {
                    Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
                }
            },
            failure : function() {
                Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
            }
        });
    },

    selectDocument : function(cmp, changingDoc, otherDoc) {
        var me = this,
            otherDocId = cmp[otherDoc].id,
            workUri;

        // If user is selecting the second document
        if (otherDocId) {
            var indexes = Utilities.globalIndexOf("/", otherDocId);
            workUri = (indexes.length >= 2) ? otherDocId.substr(0, indexes[indexes.length - 2]) : otherDocId;
        }

        me.application.fireEvent(Statics.eventsNames.selectDocument, {
            path: workUri,
            allowOnlyInPaths: workUri,
            notAllowedPaths: otherDocId,
            notAllowedPathRender: function(el, record) {
                Ext.tip.QuickTipManager.register({
                    target: el.dom.getAttribute('id'),
                    text: Locale.getString("forbiddenElement", me.getPluginName())
                });
            },
            callback: function(doc) {
                cmp[changingDoc] = Ext.clone(doc);
                if (cmp[changingDoc].id == 'editorDoc')
                    cmp[changingDoc].id = DocProperties.documentInfo.docId;
                cmp.onSelectedDocsChanged();
            },
            scope: me
        });
    },
    
    enableEditMode: function(cmp) {
        if(cmp.firstDoc.id && cmp.secondDoc.id) {
            var newer = cmp.firstDoc.new ? cmp.firstDoc : cmp.secondDoc,
                older = cmp.firstDoc.new ? cmp.secondDoc : cmp.firstDoc;
            this.application.fireEvent(Statics.eventsNames.enableDualEditorMode, {
                diffTab: cmp,
                editableDoc: newer.id,
                notEditableDoc: older.id
            });      
        }
    },

    enableEditModeScenarioB: function(cmp) {
        if(cmp.firstDoc.id && cmp.secondDoc.id) {
            var newer = cmp.firstDoc.new ? cmp.firstDoc : cmp.secondDoc,
                older = cmp.firstDoc.new ? cmp.secondDoc : cmp.firstDoc;
            this.enableDualEditorMode(cmp, {
                editableDoc: newer.id,
                notEditableDoc: older.id
            });    
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

        if(me.finishEditBtn) {
            me.finishEditBtn.up().remove(me.finishEditBtn);
        }
        if(me.syncButton) {
            if (me.syncButton.syncEnabled)
                me.getController('DualEditorSynchronizer').disable();
            me.syncButton.up().remove(me.syncButton);
        }

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
            });
        }, {}, null, editor, me.secondDocumentConfig.metaDom);
    },

    addFinishEditingButton : function(cmp, xmlDiff) {
        var me = this, toolbar = me.getMainToolbar();
        if (!toolbar.down("[cls=finishEditingButton]")) {
            me.finishEditBtn = toolbar.insert(6, {
                cls : "finishEditingButton",
                margin : "0 10 0 240",
                text : "Finish editing",
                listeners : {
                    click : Ext.bind(me.finishEditingMode, me, [cmp, xmlDiff])
                }
            });
            me.syncButton = toolbar.insert(7, {
                margin : "0 10 0 20",
                text : "Enable Synchronization",
                enableToggle: true,
                syncEnabled : false,
                listeners : {
                    click : function () {
                        if (this.syncEnabled) {
                            this.syncEnabled = false;
                            this.setText('Enable Synchronization');
                            me.getController('DualEditorSynchronizer').disable();
                        } else {
                            this.syncEnabled = true;
                            this.setText('Disable Synchronization');
                            me.getController('DualEditorSynchronizer').enable();
                        }
                    }
                }
            });

        }
    },

    enableDualEditorMode: function(cmp, dualConfig) {
        var me = this,
            mainTabPanel = me.getMain(),
            explorer = me.getExplorer(),
            markingMenu = me.getMarkingMenuContainer(),
            editorTab = me.getMainEditor().up(),
            storage = me.getController("Storage"),
            editorController = me.getController("Editor"),
            language = me.getController("Language"),
            xmlDiff = cmp,
            markingMenuController = me.getController('MarkingMenu'),
            xmlDiffController = me,
            secondEditor;

        editorTab.noChangeModeEvent = true;

        // Set active the editor tab
        mainTabPanel.setActiveTab(editorTab);

        if(xmlDiff) {
            xmlDiff.tab.hide();  
        }

        var tinyView = editorController.getEditorComponent();
        var tinyEditor = tinyView.editor;

        tinyEditor.execCommand("contentReadOnly", false, tinyEditor.getElement());

        editorController.defaultActions = {
            noExpandButtons: true
        };

        me.markingMenuMenuLoad = function() {
            var markingMenu = markingMenuController.getMarkingMenu();
            var structure = markingMenuController.getTreeButtonsStructure();

            Ext.defer(function() {
                structure.disable();
            }, 100);

            var commons = markingMenuController.getTreeButtonsCommons();
            markingMenu.setActiveTab(commons);
            Ext.defer(function() {
                markingMenuController.filterTreeByFn(commons, function( node ) {
                    var path = node.getPath();
                    if ( path.match(/passiveModifications\d+\/action\d+/)  && !path.match(/split|renumbering/) ) {
                        return true;
                    }
                });
            }, 1000);
        };


        /*Ext.each(tinyNode.querySelectorAll('div.mce-toolbar'), function( toolbar ) {
            Ext.fly(toolbar).parent('.mce-first').hide();
        });

        Ext.Object.each(tinyEditor.controlManager.buttons, function(name) {
            tinyEditor.controlManager.setDisabled(name, true);
        });*/

        DocProperties.documentState = 'diffEditingScenarioB';

        explorer.up().remove(explorer);

        // Bug: this causes the first editor to disappear
        // if(markingMenu) {
        //     markingMenu.placeholder.getEl().on('mouseenter', function(){ 
        //         markingMenu.floatCollapsedPanel();
        //     });
        // }
        
        secondEditor = me.createSecondEditor();
        me.secondEditor = secondEditor;

        me.addFinishEditingButton(secondEditor, xmlDiff);

        Ext.defer(function() {
            storage.openDocumentNoEditor(dualConfig.notEditableDoc, function(config) {
                language.beforeLoad(config, function(newConfig) {
                    me.secondDocumentConfig = newConfig;
                    editorController.loadDocument(newConfig.docText, newConfig.docId, secondEditor, true);
                    if(newConfig.metaDom) {
                        var manifestationUri = newConfig.metaDom.querySelector("*[class=FRBRManifestation] *[class=FRBRuri]");
                        if(manifestationUri) {
                            secondEditor.down("mainEditorUri").setUri(manifestationUri.getAttribute("value"));
                        }
                    }
                    me.manageAfterLoad = function() {
                        var newId = dualConfig.editableDoc.replace("/diff/", "/diff_modified/");
                        DocProperties.documentInfo.docId = newId;
                        Ext.each([xmlDiff.firstDoc, xmlDiff.secondDoc], function(doc, index) {
                            var textFields = xmlDiff.query("textfield");
                            var oldPath = doc.path;
                            doc.path = doc.path.replace("/diff/", "/diff_modified/");
                            doc.id = doc.id.replace("/diff/", "/diff_modified/");
                            if(doc.id == dualConfig.editableDoc) {
                                doc.id = newId;
                                doc.path = doc.path.replace("/diff/", "/diff_modified/");
                            }
                            Ext.each(textFields, function(text) {
                                if(text.getValue() == oldPath) {
                                    text.setValue(doc.path);
                                }
                            });
                        }, me);
                    };
                    storage.openDocument(dualConfig.editableDoc);
                }, true);
            });    
        }, 100);       
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
        
        me.application.on(Statics.eventsNames.afterLoad, me.afterDocumentLoaded, me);
        me.application.on(Statics.eventsNames.markingMenuLoaded, me.onMarkingMenuLoaded, me);
        
        this.control({
            'diffTab': {
                activate: function (tab) {
                    tab.onSelectedDocsChanged();
                }, 

                docsDeselected: function (tab) {
                    tab.disableEditButton();
                    tab.setIframeSource(me.getInitDiffPage());
                },

                docsSelected: function (tab) {
                    me.getDocsUrl(tab);
                },

                firstDocSelected: function (tab) {
                    me.selectDocument(tab, 'firstDoc', 'secondDoc');
                },

                secondDocSelected: function (tab) {
                    me.selectDocument(tab, 'secondDoc', 'firstDoc');
                },

                diffTypeChanged: function (tab) {
                    me.getDiff(tab);
                }
            },

            'amendingDiffMainTab': {
                edit: me.enableEditMode
            },
            'consolidatingDiffMainTab': {
                edit: me.enableEditModeScenarioB
            },
        });
    }
});
