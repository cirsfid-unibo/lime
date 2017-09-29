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

Ext.define('AknConsolidation.ConsolidationController', {
    extend: 'Ext.app.Controller',

    views: ["AknConsolidation.ConsolidationMainTab"],

    refs: [{
        ref: 'consolidationPanel',
        selector: 'consolidationMainTab'
    }, {
        ref: 'modifiedDocField',
        selector: 'consolidationMainTab fieldset[cls=selectModified] textfield'
    }, {
        ref: 'modifyingDocField',
        selector: 'consolidationMainTab fieldset[cls=selectModifying] textfield'
    }, {
        ref: 'editButton',
        selector: '*[cls=editButton]'
    },{
        ref: 'mainEditor',
        selector: '#mainEditor mainEditor'
    }, {
        ref: 'secondEditor',
        selector: '#secondEditor mainEditor'
    }, {
        ref: 'appViewport',
        selector: 'appViewport'
    }, {
        ref: 'main',
        selector: 'main'
    }, {
        ref: 'outliner',
        selector: 'outliner'
    }, {
        ref: 'mainToolbar',
        selector: 'mainToolbar'
    }, {
        ref : 'markingMenuContainer',
        selector : '[cls=markingMenuContainer]'
    }],

    config: {
        pluginName: "akn-consolidation"
    },

    listen: {
        global:  {
            secondDocumentLoaded: 'onSecondDocumentLoaded'
        }
    },

    // The document being modified.
    modifiedDoc: null,
    // The document containing the active
    // modifications.
    modifyingDoc: null,

    init: function () {
        var me = this;

        me.application.on(Statics.eventsNames.afterLoad, me.parseDocuments, me);

        this.control({
            'consolidationMainTab fieldset[cls=selectModified] button': {
                click: function(cmp) {
                    me.showOpenDocumentDialog(function(doc) {
                        me.modifiedDoc = Ext.clone(doc);
                        me.updateFields();
                    });
                }
            },
            'consolidationMainTab fieldset[cls=selectModifying] button': {
                click: function(cmp) {
                    me.showOpenDocumentDialog(function(doc) {
                        me.modifyingDoc = Ext.clone(doc);
                        me.updateFields();
                    });
                }
            },
            'consolidationMainTab button[cls=resetButton]': {
                click: function(cmp) {
                    delete me.modifiedDoc;
                    delete me.modifyingDoc;
                    me.updateFields();
                }
            },
            'consolidationMainTab button[cls=consolidationButton]': {
                click: me.startConsolidation
            }
        });
    },

    onSecondDocumentLoaded: function(config) {
        this.secondDocumentConfig = config;
    },
    // Show the select document dialog and call
    // callback with the selected document.
    showOpenDocumentDialog: function (cb) {
        var me = this;
        var config = {
            callback: cb,
            scope: me
        };
        me.application.fireEvent(Statics.eventsNames.selectDocument, config);
    },

    // Display the document path inside the selected document fields.
    updateFields: function () {
        var modifiedVal = this.modifiedDoc ? this.modifiedDoc.path : '';
        this.getModifiedDocField().setValue(modifiedVal);

        var modifyingVal = this.modifyingDoc ? this.modifyingDoc.path : '';
        this.getModifyingDocField().setValue(modifyingVal);
    },

    parseDocuments: function() {
        var me = this, modController = this.getController('AknConsolidation.ModificationController'),
            editorController = me.getController("Editor");

        if ( me.secondDocumentConfig && me.secondDocumentConfig.metaDom ) {
            var activeModifications = me.secondDocumentConfig.metaDom.querySelectorAll('*[class~=activeModifications] > *');
            if ( activeModifications.length ) {
                var modifyingDom = editorController.getDom(me.secondEditor);
                var modifiedDom = editorController.getDom();
                modController.consolidate(activeModifications, modifyingDom, modifiedDom);
            } else {
                Ext.Msg.alert('Warning', 'There are no active modifications');
            }
        }
    },

    startConsolidation: function (cmp) {
        var dualConfig = {
            editableDoc: this.modifiedDoc.id,
            notEditableDoc: this.modifyingDoc.id
        };
        var editorController = this.getController("Editor");
        editorController.defaultActions = {
            noExpandButtons: true
        };
        var markingMenu = this.getMarkingMenuContainer();
        if(markingMenu) {
            markingMenu.hide();
        }
        var me = this;
        this.application.fireEvent(Statics.eventsNames.enableDualEditorMode, {
            diffTab: cmp.up('consolidationMainTab'),
            editableDoc: dualConfig.editableDoc,
            notEditableDoc: dualConfig.notEditableDoc,
            startCallback: function () {},
            stopCallback: function () {},
            addButtons: me.addFinishEditingButton.bind(me),
            secondEditorCreated: function(cmp) {
                me.secondEditor = cmp;
                var el2 = Ext.fly(cmp.getEditor().getBody());
                el2.addCls('noboxes');
                el2.addCls('nocolors');
                el2.addCls('pdfstyle');
                console.log(cmp, editorController.getSecondEditor());
                cmp.up().setTitle(Locale.getString("modifyingDocument", me.getPluginName()));
                me.initialMainEditorTitle = editorController.getMainEditor().up().title;
                editorController.getMainEditor().up().setTitle(Locale.getString("modifiedDocument", me.getPluginName()));
                Ext.defer(function() {
                  editorController.addContentStyle('#tinymce div.mod', 'padding-left: 15px', cmp);
                  editorController.addContentStyle('#tinymce div.mod', 'border-radius: 0', cmp);
                  editorController.addContentStyle('#tinymce div.mod', 'border-left: 5px solid #1B6427', cmp);

                  editorController.addContentStyle('#tinymce div.quotedStructure', 'padding-left: 15px', cmp);
                  editorController.addContentStyle('#tinymce div.quotedStructure', 'border-radius: 0', cmp);
                  editorController.addContentStyle('#tinymce div.quotedStructure', 'border-left: 5px solid #ABB26E', cmp);
                }, 2000);
            }
        });
    },

    stopConsolidation: function(editor, tab) {
        var me = this;
        var markingMenu = this.getMarkingMenuContainer();

        var singleModeRestored = function() {
            if(markingMenu) {
                markingMenu.show();
            }
            if(me.finishEditBtn) {
                me.finishEditBtn.up().remove(me.finishEditBtn);
            }
            var editorController = me.getController('Editor');
            editorController.getMainEditor().up().setTitle(me.initialMainEditorTitle);
            me.getController('AknConsolidation.ModificationController').success();
        };
        this.getController('CustomizationManager').finishEditingMode(editor, tab, singleModeRestored);
    },

    addFinishEditingButton : function(cmp, consolidationTab) {
        var me = this, toolbar = me.getMainToolbar();
        if (!toolbar.down("[cls=finishEditingButton]")) {
            //toolbar.add("->");
            me.finishEditBtn = toolbar.insert(6, {
                cls : "finishEditingButton",
                margin : "0 10 0 240",
                text : "Finish consolidation",
                listeners : {
                    click : Ext.bind(me.stopConsolidation, me, [cmp, consolidationTab])
                }
            });
        }
    }
});
