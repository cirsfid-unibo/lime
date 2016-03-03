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

    views : ['DocumentLangSelector', 'LocaleSelector', 'Ext.ux.IframePlugin'],

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

    init : function() {
        var me = this;
        //Listening progress events
        me.application.on(Statics.eventsNames.addMenuItem, me.addMenuItem, me);
        me.application.on(Statics.eventsNames.enableDualEditorMode, me.enableDualEditorMode, me);
        me.application.on(Statics.eventsNames.afterLoad, me.afterDocumentLoaded, me);

        me.control({
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
    },

    addMenuItem: function(controller, config, menuConfig) {
        var me = this, mainToolbar = me.getController("MainToolbar"), item;

        item = mainToolbar.addMenuItem(config, menuConfig);
        if(item) {
            me.customMenuItems[controller.id] = me.customMenuItems[controller.id] || [];
            me.customMenuItems[controller.id].push(item);
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
        return secondEditor.query('mainEditor')[0];
    },

    // Save document and restore single editor mode
    finishEditingMode: function(editor, diff) {
        var me = this;

        me.getController('Storage').saveDocument(function() {
            var language = me.getController("Language");
            var html = language.getHtmlToTranslate(null, editor, me.secondDocumentConfig.metaDom);
            language.translateContent(html, function(xml) {
                xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
                Server.saveDocument(me.secondDocumentConfig.docId, xml, function () {
                    me.restoreSingleEditor(editor, diff);
                });
            });
        });
    },

    // Switch back to single editor mode
    restoreSingleEditor: function (editor, diff) {
        var me = this;
        this.stopCallback();

        function remove (button) {
            if (button) button.up().remove(button);
        }
        remove(me.finishEditBtn);
        remove(me.cancelButton);
        remove(me.syncButton);
        me.getController('DefaultDiff.controller.DualEditorSynchronizer').disable();

        if(diff) {
            diff.tab.show();
            diff.enforceReload = true;
            me.getMain().setActiveTab(diff);
            diff.fireEvent("finishEditing", diff);
        }

        var editorTab = me.getMainEditor().up();
        me.getController('Editor').setAutosaveEnabled(true);
        var viewport = me.getAppViewport();
        viewport.remove(editor.up('main'));

        var newExplorer = Ext.widget("outliner", {
            region : 'west',
            expandable : true,
            resizable : true,
            width : '15%',
            scrollable: true,
            margin : 2
        });
        viewport.down('mainEditor').up().add(newExplorer);
    },

    addButtons: function(cmp, xmlDiff) {
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
            me.cancelButton = toolbar.insert(7, {
                cls : "finishEditingButton",
                margin : "0 10 0 20",
                text : "Cancel",
                listeners : {
                    click : Ext.bind(me.restoreSingleEditor, me, [cmp, xmlDiff])
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
        console.info('enableDualEditorMode', dualConfig);
        var me = this,
            mainTabPanel = me.getMain(),
            editorTab = me.getMainEditor().up(),
            storage = me.getController("Storage"),
            editorController = me.getController("Editor"),
            language = me.getController("Language"),
            xmlDiff = dualConfig.diffTab,
            secondEditor;

        dualConfig.startCallback();
        this.stopCallback = dualConfig.stopCallback;

        me.getController('Editor').setAutosaveEnabled(false);

        // Set active the editor tab
        mainTabPanel.setActiveTab(editorTab);

        if(xmlDiff) {
            xmlDiff.tab.hide();
        }
        
        secondEditor = me.createSecondEditor();
        me.secondEditor = secondEditor;

        // TODO: prevent adding onother outliner in DualEditMode
        Ext.each(Ext.ComponentQuery.query('outliner'), function(outliner) {
            outliner.up().remove(outliner);
        });
        me.addButtons(secondEditor, xmlDiff);

        Ext.defer(function() {
            storage.openDocumentNoEditor(dualConfig.notEditableDoc, function(config) {
                language.beforeLoadManager(config, function(newConfig) {
                    me.secondDocumentConfig = newConfig;
                    editorController.loadDocument(newConfig.docText, newConfig.docId, secondEditor, true);
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
    }
});
