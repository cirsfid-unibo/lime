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
 * This controller takes care of loading customizations.
 *
 */

Ext.define('LIME.controller.CustomizationManager', {
    extend : 'Ext.app.Controller',

    views : ['DocumentLangSelector', 'LocaleSelector', 'MarkingMenu', 'Ext.ux.IframePlugin'],

    customCallbacks : {},

    customMenuItems: {},

    refs : [
        { ref: 'appViewport', selector: 'appViewport' },
        { ref: 'mainToolbar', selector: 'mainToolbar' },
        { ref: 'main', selector: 'main' },
        { ref: 'mainEditor', selector: 'mainEditor' },
        { ref: 'outliner', selector: 'outliner' },
        { ref: 'uri', selector: 'mainEditorUri' },
        { ref: 'markingMenuContainer', selector: '[cls=markingMenuContainer]' }
    ],

    onLanguageLoaded : function() {
        this.customCallbacks = {};
        this.loadControllers(Config.customControllers);
    },

    loadControllers : function(controllers) {
        var me = this,
            controllers = controllers || [];

        if (controllers) {
            Ext.each(controllers, function(controller) {
                // Don't run this code on View Controllers since it would
                // rise an exception.
                if (controller.indexOf('VController') != -1) return;
                try {
                    var cntr = me.getController(controller);
                    //TODO: hide application and make custom fire event
                    Ext.callback(cntr.onInitPlugin, cntr);
                } catch (e) {
                    console.log('Error loading controller ', controller);
                    console.log(e);
                }
            });
        }
    },

    callCallback : function(cmp, name) {
        var me = this, className = me.fullNameToName(cmp.self.getName());
        if(me.customCallbacks[className] && me.customCallbacks[className][name]) {
            me.customCallbacks[className][name](cmp);
        }
    },

    fullNameToName: function(className) {
        var lastPoint = className.lastIndexOf(".");
        return className.substring(lastPoint+1);
    },

    beforeCreation: function(className, originalConfig, callback) {
        var me = this, config = Ext.clone(originalConfig), customs = Config.getCustomViews(className);
        // Calling every customization of 'className' view
        Ext.each(customs, function(custom) {
            if(Ext.isFunction(custom.beforeCreation)) {
                try {
                    config = Ext.bind(custom.beforeCreation, custom)(config);
                } catch(e) {
                    Ext.log({level: "warn"}, "Exception beforeCreation plugin of "+className, e);
                }
            }
        });
        config = config || originalConfig;
        // Don't let customizations to change cls
        config.cls = originalConfig.cls;
        if (Ext.isFunction(callback)) {
            callback(config);
        }
    },

    addMenuItem: function(controller, config, menuConfig) {
        var me = this, mainToolbar = me.getController("MainToolbar"), item;

        item = mainToolbar.addMenuItem(config, menuConfig);
        if(item) {
            me.customMenuItems[controller.id] = me.customMenuItems[controller.id] || [];
            me.customMenuItems[controller.id].push(item);
        }
    },

    removeCustomMenuItems: function(controller) {
        var me = this;
        Ext.each(me.customMenuItems[controller.id], function(item) {
            item.parentMenu.remove(item);
        });
        me.customMenuItems[controller.id] = [];
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
        return secondEditor.query('mainEditor')[0];
    },

    finishEditingMode: function(editor, diff) {
         var me = this,
            mainTabPanel = me.getMain(),
            viewport = me.getAppViewport(),
            editorTab = me.getMainEditor().up(),
            newExplorer, language = me.getController("Language"),
            editorController = me.getController("Editor");

        this.stopCallback();
        editorController.autoSaveContent(true);

        if(me.finishEditBtn) {
            me.finishEditBtn.up().remove(me.finishEditBtn);
        }
        if(me.syncButton) {
            if (me.syncButton.syncEnabled)
                me.getController('DualEditorSynchronizer').disable();
            me.syncButton.up().remove(me.syncButton);
        }
        var html = language.getHtmlToTranslate(null, editor, me.secondDocumentConfig.metaDom);
        language.translateContent(html, function(xml) {
            xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '');

            var url = me.secondDocumentConfig.docId.replace("/diff/", "/diff_modified/");

            Server.saveDocument(url, xml, function() {
                if(diff) {
                    diff.tab.show();
                    diff.enforceReload = true;
                    mainTabPanel.setActiveTab(diff);
                }

                editorTab.noChangeModeEvent = false;
                viewport.remove(editor.up('main'));

                newExplorer = Ext.widget("outliner", {
                    region : 'west',
                    expandable : true,
                    resizable : true,
                    width : '15%',
                    autoScroll : true,
                    margin : 2
                });
                viewport.down('mainEditor').up().add(newExplorer);
            });
        });
    },

    addFinishEditingButton : function(cmp, xmlDiff) {
        var me = this, toolbar = me.getMainToolbar();
        if (!toolbar.down("[cls=finishEditingButton]")) {
            //toolbar.add("->");
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
                            me.getController('DefaultDiff.controller.DualEditorSynchronizer').disable();
                        } else {
                            this.syncEnabled = true;
                            this.setText('Disable Synchronization');
                            me.getController('DefaultDiff.controller.DualEditorSynchronizer').enable();
                        }
                    }
                }
            });
        }
    },

    enableDualEditorMode: function(dualConfig) {
        var me = this,
            mainTabPanel = me.getMain(),
            explorer = me.getOutliner(),
            editorTab = me.getMainEditor().up(),
            storage = me.getController("Storage"),
            editorController = me.getController("Editor"),
            language = me.getController("Language"),
            xmlDiff = dualConfig.diffTab,
            secondEditor;

        dualConfig.startCallback();
        this.stopCallback = dualConfig.stopCallback;

        editorTab.noChangeModeEvent = true;

        // Set active the editor tab
        mainTabPanel.setActiveTab(editorTab);

        if(xmlDiff) {
            xmlDiff.tab.hide();
        }

        explorer.up().remove(explorer);
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
                            me.getUri().setUri(manifestationUri.getAttribute("value"));
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

    init : function() {
        var me = this;
        //Listening progress events
        me.application.on(Statics.eventsNames.languageLoaded, me.onLanguageLoaded, me);
        me.application.on(Statics.eventsNames.beforeCreation, me.beforeCreation, me);
        me.application.on(Statics.eventsNames.addMenuItem, me.addMenuItem, me);
        me.application.on(Statics.eventsNames.enableDualEditorMode, me.enableDualEditorMode, me);
        me.application.on(Statics.eventsNames.afterLoad, me.afterDocumentLoaded, me);


        Config.beforeSetLanguage = function(lang, callback) {
            if (Config.customControllers) {
                Ext.each(Config.customControllers, function(controller) {
                    var cntr = me.getController(controller);
                    me.removeCustomMenuItems(cntr);
                    Ext.callback(cntr.onRemoveController, cntr);
                });
            }
            Ext.callback(callback);
        };

        var loadDefaultPlugin = function () {
            me.loadControllers(Config.customDefaultControllers);
        }

        if (Config.loaded) {
            loadDefaultPlugin();
        } else {
            Config.afterDefaultLoaded = loadDefaultPlugin;
        }

        me.control({
            'markingMenu' : {
                afterrender : function(cmp) {
                    me.callCallback(cmp, "afterCreation");
                }
            },
            'docLangSelector': {
                afterrender: function(cmp) {
                    if(Config.fieldsDefaults[cmp.name]) {
                        cmp.setValue(Config.fieldsDefaults[cmp.name]);
                    }
                }
            },
            'docLocaleSelector': {
                afterrender: function(cmp) {
                    if(Config.fieldsDefaults[cmp.name]) {
                        cmp.setValue(Config.fieldsDefaults[cmp.name]);
                    }
                }
            },
            'docTypeSelector': {
                afterrender: function(cmp) {
                    if(Config.fieldsDefaults[cmp.name]) {
                        cmp.setValue(Config.fieldsDefaults[cmp.name]);
                    }
                }
            }
        });
    }
});
