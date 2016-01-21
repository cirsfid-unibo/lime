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

Ext.define('DefaultDiff.controller.XmlDiff', {
    extend: 'Ext.app.Controller',

    views: [
        'DefaultDiff.view.AmendingDiffMainTab',
        'DefaultDiff.view.ConsolidatingDiffMainTab'
    ],

    refs: [
        { ref: 'appViewport', selector : 'appViewport' },
        { ref: 'editButton', selector: 'amendingDiffMainTab *[cls=editButton]' },
        { ref: 'editButtonScenarioB', selector: 'consolidatingDiffMainTab *[cls=editButton]' },
        { ref: 'mainEditor', selector : '#mainEditor mainEditor' },
        { ref: 'secondEditor', selector: '#secondEditor mainEditor' },
        { ref: 'outliner', selector: 'outliner' },
        { ref: 'mainToolbar', selector: 'mainToolbar' },
        { ref: 'main', selector: 'main' },
        { ref: 'markingMenuContainer', selector : '[cls=markingMenuContainer]' },
        { ref: 'mainToolbar', selector: 'mainToolbar' }
    ],

    config: {
        diffXmlServiceUrl : "diff/index.php",
        diffServiceUrl : "AKNDiff/index.php",
        initDiffPage: "AKNDiff/data/empty.html"
    },

    // Set the iframe source of the current tab to either the Akomantoso diff
    // or the generic XML diff, depending on which tab is active.
    getDiff: function(tab, selector) {
        var format = tab.down("*[cls=diffContainer]").getActiveTab().format || 'text',
            baseUrl = (format=="xml") ? this.getDiffXmlServiceUrl() : this.getDiffServiceUrl(),
            url = Server.getPhpServer() + baseUrl + '?' + Ext.urlEncode({
                from: selector.firstDoc.url,
                to: selector.secondDoc.url,
                format: format,
                edit: true
            });
        console.info(url);
        tab.setIframeSource(url, function(doc) {
            var newDoc = doc.querySelector(".newDocVersion");

            if(newDoc) {
                var firstDocIsNewer = (newDoc.getAttribute("url") == selector.firstDoc.url);
                selector.firstDoc['new'] = firstDocIsNewer;
                selector.secondDoc['new'] = !firstDocIsNewer;
            }
        });
    },

    // Call EXPORT_FILES service and get an url where the diff
    // can access the two files.
    getDocsUrl : function(tab, selector) {
        var me = this;
        tab.setLoading();
        var failureCb = function () {
            Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
        };
        Server.exportDocument(selector.firstDoc.id, function (url1) {
            Server.exportDocument(selector.secondDoc.id, function (url2) {
                selector.firstDoc.url = url1;
                selector.secondDoc.url = url2;
                me.getDiff(tab, selector);
            }, failureCb);
        }, failureCb);
    },


    enableEditMode: function(cmp) {
        if(cmp.firstDoc.id && cmp.secondDoc.id) {
            var newer = cmp.firstDoc['new'] ? cmp.firstDoc : cmp.secondDoc,
                older = cmp.firstDoc['new'] ? cmp.secondDoc : cmp.firstDoc;

            this.application.fireEvent(Statics.eventsNames.enableDualEditorMode, {
                diffTab: cmp.up('diffTab'),
                editableDoc: newer.id,
                notEditableDoc: older.id,
                startCallback: function () {},
                stopCallback: function () {}
            });
        }
    },

    enableEditModeScenarioB: function(cmp) {
        var me = this;
        if(cmp.firstDoc.id && cmp.secondDoc.id) {
            var newer = cmp.firstDoc['new'] ? cmp.firstDoc : cmp.secondDoc,
                older = cmp.firstDoc['new'] ? cmp.secondDoc : cmp.firstDoc;

            me.application.fireEvent(Statics.eventsNames.enableDualEditorMode, {
                diffTab: cmp.up('diffTab'),
                editableDoc: newer.id,
                notEditableDoc: older.id,

                startCallback: function () {
                    // Special things to do for mode B
                    me.getController('Editor').setEditorReadonly(true);
                    me.getController('Editor').defaultActions = {
                        noExpandButtons: true
                    };
                    me.markingMenuMenuLoad = function() {
                        var markingMenuController = me.getController('MarkingMenu'),
                            markingMenu = markingMenuController.getMarkingMenu(),
                            structure = markingMenuController.getTreeButtonsStructure();
                        //TODO: check if adding buttons is stil useful
                        //me.getController('ModsMarkerController').addModificationButtons();
                        /*Ext.defer(function() {
                            structure.disable();
                        }, 100);
                        var commons = markingMenuController.getTreeButtonsCommons();
                        markingMenu.setActiveTab(commons);*/
                        markingMenu.setActiveTab(structure);
                        Ext.defer(function() {
                            markingMenuController.filterTreeByFn(structure, function( node ) {
                                var path = node.getPath();
                                if ( path.match(/passiveModifications\d+\/action\d+/)  && !path.match(/renumbering/) ) {
                                    return true;
                                }
                            });
                        }, 1000);
                    };

                    DocProperties.documentState = 'diffEditingScenarioB';

                },

                stopCallback: function () {
                    var markingMenuController = me.getController('MarkingMenu');
                    me.getController('Editor').setEditorReadonly(false);
                    var structure = markingMenuController.getTreeButtonsStructure();
                    /*Ext.defer(function() {
                        structure.enable();
                    }, 100);
                    var commons = markingMenuController.getTreeButtonsCommons();*/
                    markingMenuController.clearTreeFilter(structure);
                    me.getController('Editor').defaultActions = {};
                    DocProperties.documentState = '';
                }
            });
        }
    },

    afterDocumentLoaded: function() {
        var me = this;
        if(Ext.isFunction(me.manageAfterLoad)) {
            Ext.callback(me.manageAfterLoad, me);
            me.manageAfterLoad = null;
        }
    },

    onMarkingMenuLoaded: function() {
        if ( Ext.isFunction(this.markingMenuMenuLoad) ) {
            this.markingMenuMenuLoad();
        }
        this.markingMenuMenuLoad = null;
    },

    init: function() {
        var me = this;
        me.application.on(Statics.eventsNames.afterLoad, me.afterDocumentLoaded, me);
        me.application.on(Statics.eventsNames.markingMenuLoaded, me.onMarkingMenuLoaded, me);

        this.control({
            'diffTab doubleDocSelector': {
                afterrender: function (cmp) {
                    cmp.onSelectedDocsChanged();
                },

                docsDeselected: function (selector) {
                    selector.up('diffTab').setIframeSource(Server.getPhpServer() + me.getInitDiffPage());
                },

                docsSelected: function (selector) {
                    selector.enableEditButton();
                    me.getDocsUrl(selector.up('diffTab'), selector);
                }
            },
            'diffTab': {
                diffTypeChanged: function (cmp) {
                    me.getDiff(cmp, cmp.down('doubleDocSelector'));
                },
                finishEditing: function (diffTab) {
                    me.getDocsUrl(diffTab, diffTab.down('doubleDocSelector'));
                }
            },

            'amendingDiffMainTab doubleDocSelector': {
                edit: me.enableEditMode
            },
            'consolidatingDiffMainTab doubleDocSelector': {
                edit: me.enableEditModeScenarioB
            }
        });
    }
});
