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

//TODO: add feedback, loading
Ext.define('DefaultExport.Controller', {
    extend : 'Ext.app.Controller',

    refs : [{
        ref : 'downloadManager',
        selector : 'downloadManager'
    }],

    config : {
        pluginName : "default-export"
    },

    init : function() {
        var me = this;
        this.addExportItem();
        this.control({
            'menu [name=exportXmlButton]': {
                click: this.exportTo.bind(this, 'xml')
            },
            'menu [name=exportHtmlButton]': {
                click: function() {
                    me.exportDocument(Server.getAjaxUrl(), {
                        requestedService: Statics.services.htmlExport
                    });
                }
            },
            'menu [name=exportPdfButton]': {
                click: function() {
                    var downloadManager = me.getDownloadManager(),
                        editor = me.getController("Editor"),
                        parameters = {
                            requestedService: Statics.services.pdfExport,
                            source: editor.getDocHtml()
                        };
                    downloadManager.fireEvent(downloadManager.eventActivate, Server.getAjaxUrl(), parameters);
                    // TODO: this is the new way using the node.js akn to pdf
                    // converter test the service and remove the above method
                    // me.exportTo('pdf');
                }
            },
            'menu [name=exportEbookButton]': {
                click: this.exportTo.bind(this, 'epub')
            }
        });
    },

    addExportItem: function() {
        var me = this;
        menu = {
            text: Locale.getString("exportDocument", me.getPluginName()),
            icon: 'resources/images/icons/export-icon.png',
            name: 'exportAs',
            id: 'exportMenu',
            hideOnClick: false,
            menu: {
                plain: true,
                items: me.getMenuItems()
            }
        };
        me.application.fireEvent("addMenuItem", me, {
            menu: "fileMenuButton"
        }, menu);
    },

    // Return the items, it's convenient to have it in a separate function
    // in order to be able to add or remove items by overriding it
    getMenuItems: function() {
        var name = this.getPluginName();
        return [{
            text : Locale.getString("exportXml", name),
            tooltip : Locale.getString("exportXmlTooltip", name),
            icon : 'resources/images/icons/file-xml.png',
            name : 'exportXmlButton'
        }, {
            text : Locale.getString("exportHtml", name),
            tooltip : Locale.getString("exportHtmlTooltip", name),
            icon : 'resources/images/icons/html.png',
            name : 'exportHtmlButton'
        }, {
            text : Locale.getString("exportPdf", name),
            tooltip : Locale.getString("exportPdfTooltip", name),
            icon : 'resources/images/icons/file-pdf.png',
            name : 'exportPdfButton'
        }, {
            text : Locale.getString("exportEbook", name),
            tooltip : Locale.getString("exportEbookTooltip", name),
            icon : 'resources/images/icons/file-epub.png',
            name : 'exportEbookButton'
        }];
    },

    /**
     * This function exports the document using the download manager
     * @param {String} url The url of download service
     * @param {Object} params Params to pass to the download service
     */
    exportDocument: function(url, params) {
        console.info('exportDocument', url, params);
        var downloadManager = this.getDownloadManager();
        // Set a callback function to translateContent
        this.application.fireEvent(Statics.eventsNames.translateRequest, function(xml) {
            var parameters = Ext.Object.merge(params, {source: xml});
            downloadManager.fireEvent(downloadManager.eventActivate, url, parameters);
        }, {complete: true});
    },

    // First save the document
    exportTo: function(extension) {
        var path = DocProperties.getDocId();
        var mime = this.getMime(extension);
        var onExportSuccess = (function(data) {
            this.saveDataAs(data, extension, mime);
            Ext.GlobalEvents.fireEvent('setAppLoading', false);
        }).bind(this);
        var onExportFailure = function(err) {
            Ext.GlobalEvents.fireEvent('setAppLoading', false);
            Ext.Msg.alert(Locale.getString('error'), err.statusText);
        };
        var exportFn = function () {
            // The document is saved in xml, so just get it
            if (extension === 'xml')
                return Server.getDocument(path, onExportSuccess, onExportFailure);

            Server.aknExportTo(path, extension, mime, onExportSuccess, onExportFailure);
        };

        Ext.GlobalEvents.fireEvent('setAppLoading', true);
        // First save the document to be sure to export the updated version
        Ext.GlobalEvents.fireEvent('saveDocument', exportFn);
    },

    // Create the Blob data and trigger the browser's saveAs dialog
    saveDataAs: function(data, extension, mimeType) {
        var blob = new Blob([data], {type: mimeType});
        saveAs(blob, 'document.'+extension);
    },

    getMime: function(extension) {
        switch(extension) {
            case 'xml':
            return 'text/xml;charset=utf-8';
            case 'pdf':
            return 'application/pdf';
            case 'epub':
            return 'application/epub+zip';
            default:
            return 'text/html';
        }
    }
});
