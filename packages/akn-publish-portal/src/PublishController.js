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

// Simple document publisher

Ext.define('AknPublish.PublishController', {
    extend: 'Ext.app.Controller',

    refs: [
        { ref: 'appViewport', selector: 'appViewport' }
    ],

    config: {
        pluginName: "akn-publish-portal"
    },

    init: function () {
        // Wait adding other buttons
        setTimeout(this.addButtonToMenu.bind(this), 1000);
    },

    addButtonToMenu: function () {
        this.application.fireEvent("addMenuItem", this, {
            menu: "fileMenuButton"
        }, {
            icon: 'resources/images/icons/export-icon.png',
            name: 'publishToPortal',
            text: Locale.getString("publishToPortal", this.getPluginName()),
            tooltip: Locale.getString("publishToPortal", this.getPluginName()),
            handler: this.publishHandler.bind(this),
            after: 'exportAs'
        });
    },

    publishHandler: function () {
        var me = this;

        var path = DocProperties.getDocId();
        var uri = me.getController('Editor').getDocumentUri();
        if ( path && path.trim() ) {
            me.application.fireEvent(Statics.eventsNames.translateRequest, function(err, xml) {
                if (!err) {
                    me.publishDoc(path, uri, xml);
                }
            });
        } else {
            Ext.Msg.alert(Locale.strings.error, "Cannot find document uri");
        }
    },

    publishDoc: function(path, uri, content) {
        Server.publishDocument(path, content,
                                    this.docPublished.bind(this, uri),
                                    this.docPublishedError.bind(this, uri));
    },

    docPublished: function(uri) {
        Ext.Msg.alert({
            title : 'Document published',
            msg :  'Document with URI <b>'+uri+'</b> was successfully published.'
        });
    },

    docPublishedError: function(uri) {
        Ext.Msg.alert({
            title : Locale.strings.error,
            msg :  'Cannot publish document with URI <b>'+uri+'</b>'
        });
    }
});
