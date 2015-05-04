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

// Plugin to display and export a NIR conversion
// of the AkomaNtoso document.
Ext.define('DefaultNir.controller.NirPreview', {
    extend : 'Ext.app.Controller',
    
    views: ["DefaultNir.view.NirPreviewMainTab"],

    refs : [{
        selector : 'appViewport',
        ref : 'appViewport'
    }, {
        selector: 'nirPreviewMainTab',
        ref: 'xml'
    }, {
        selector: 'menuitem#exportMenu menu',
        ref: 'exportMenu'
    }, {
        ref : 'downloadManager',
        selector : 'downloadManager'
    }],


    init: function() {
        this.control({
            'nirPreviewMainTab' : {
                activate: this.showPreview
            }
        });
        this.addExportMenu();
    },

    // Show the NirPreviewPanel
    showPreview: function() {
        var me = this;

        var xml = me.getXml();
        if (!xml) return;
        var activeTab = xml.up("main").getActiveTab();
        if (activeTab != xml) return;

        me.translateToNir(function (nirXml) {
        console.log(5)
            if (me.getXml()) {
                me.getXml().down('codemirror').setValue(nirXml);
            }
        });
    },

    // Call cb with the NIR conversion of the current document.
    translateToNir: function (cb) {
        var me = this;

        // HTMLToso to AkomaNtoso
        console.log(1)
        me.application.fireEvent(Statics.eventsNames.translateRequest, function (aknXml) {
        console.log(2)
            Server.getResourceFile('AknToNir.xsl', 'default-nir', function (xsltPath) {
        console.log(3)
                // AkomaNtoso to NIR
                aknXml = me.forceLatestVersion(aknXml);
                Server.applyXslt(aknXml, xsltPath, cb, function () {
        console.log(4)
                    Ext.Msg.alert('Nir conversion failed');
                });
            });
        }, me.getXml());
    },

    // Force latest version of AkomaNtoso.
    // Our XSLT expects the 11th version of AKN 3.
    // This is a hack which may cause bugs.
    forceLatestVersion: function (aknXml) {
        var regex = /http:\/\/docs\.oasis-open\.org\/legaldocml\/ns\/akn\/3\.0\/CSD../g,
            targetNamespace = 'http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11';
        return aknXml.replace(regex, targetNamespace);
    },

    // Add NIR item to export menu. 
    addExportMenu: function () {
        var menu = this.getExportMenu();
        if (menu) {
            menu.add({
                text: 'NIR',
                icon: 'resources/images/icons/file-xml.png',
                name: 'ExportNIR',
                handler: this.onExportClicked.bind(this)
            });
        }
    },

    // Download NIR file using downloadManager.
    onExportClicked: function () {
        var me = this;
        me.translateToNir(function (nirXml) {
            var params = {
                source: nirXml,
                requestedService: Statics.services.xmlExport
            };

            var downloadManager = me.getDownloadManager();
            downloadManager.fireEvent(downloadManager.eventActivate, Utilities.getAjaxUrl(), params);
        });
    },

    onInitPlugin: function() {
        this.application.on(Statics.eventsNames.afterLoad, this.showPreview, this);
    },

    onRemoveController: function() {
        this.application.removeListener(Statics.eventsNames.afterLoad, this.showPreview, this);
    }
});
