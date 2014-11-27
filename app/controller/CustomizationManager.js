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

    views : ['DocumentLangSelector', 'LocaleSelector', 'MarkingMenu', 'Ext.ux.Iframe'],

    customCallbacks : {},
    
    customMenuItems: {},
    
    refs : [{
        selector: 'appViewport',
        ref: 'appViewport'
    }, {
        selector: 'mainToolbar',
        ref: 'mainToolbar'
    }, {
        selector: 'main',
        ref: 'main'
    }, {
        selector: 'mainEditor',
        ref: 'mainEditor'
    }, {
        selector: 'outliner',
        ref: 'outliner'
    }, {
        selector : '[cls=markingMenuContainer]',
        ref : 'markingMenuContainer'
    }],

    onLanguageLoaded : function(controllers) {
        this.customCallbacks = {};
        this.loadControllers(Config.customControllers);
    },

    //Config.customDefaultControllers
    loadControllers : function(controllers) {
        var me = this, 
            controllers = controllers || [];

        if (controllers) {
            Ext.each(controllers, function(controller) {
                var cntr = me.getController(controller);
                //TODO: hide application and make custom fire event
                Ext.callback(cntr.onInitPlugin, cntr);
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
        return secondEditor;
    },

    finishEditingMode: function(editor, diff) {
         var me = this,
            mainTabPanel = me.getMain(),
            viewport = me.getAppViewport(),
            userInfo = this.getController('LoginManager').getUserInfo(),
            editorTab = me.getMainEditor().up(),
            newExplorer, language = me.getController("Language"),
            editorController = me.getController("Editor");

        editorController.autoSaveContent(true);

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
        }
    },

    enableDualEditorMode: function(dualConfig) {
        var me = this,
            mainTabPanel = me.getMain(),
            outliner = me.getOutliner(),
            markingMenu = me.getMarkingMenuContainer(),
            editorTab = me.getMainEditor().up(),
            storage = me.getController("Storage"),
            editorController = me.getController("Editor"),
            language = me.getController("Language"),
            xmlDiff = mainTabPanel.down("xmlDiff"),
            xmlDiffController = me.getController("XmlDiffController"),
            secondEditor;

        //me.getAppViewport().setLoading(true);

        editorTab.noChangeModeEvent = true;

        // Set active the editor tab
        mainTabPanel.setActiveTab(editorTab);

        if(xmlDiff) {
            xmlDiff.tab.hide();  
        }
        
        //outliner.setVisible(false);

        outliner.up().remove(outliner);

        //markingMenu.collapse();

        if(markingMenu) {
            markingMenu.placeholder.getEl().on('mouseenter', function(){ 
                markingMenu.floatCollapsedPanel();
            });
        }
        
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
                        Ext.each(xmlDiffController.selectedDocs, function(doc, index) {
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
            }
        });
    }
});
