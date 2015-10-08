/*
 * Copyright (c) 2015 - Copyright holders CIRSFID and Department of
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

// Watch for metadata store changes and port them to the old meta system (dom)
Ext.define('AknMetadata.sync.OldMetaBackport', {
    extend: 'Ext.app.Controller',

    listen: {
        store: {
            '#metadata': {
                update: 'onMetadataUpdate'
            }
        }
    },

    onMetadataUpdate: function (store, record, operation, fields) {
        function isUpdate (field) {
            return operation == 'edit' && fields.indexOf(field) != -1;
        }

        if (isUpdate('date') || isUpdate('version')) {
            console.log('argum', arguments)
            this.updateDates();
        }
    },

    updateDates: function () {
        var store = Ext.getStore('metadata').getMainDocument();
        var date = store.get('date'),
            version = store.get('version');

        // get uri
        // parse uri
        try {
            // We know better than the Law of Demeter.
            var oldUriStr = this.getController('Editor').getDocumentMetadata().originalMetadata.metaDom.querySelector('[class="FRBRManifestation"] [class="FRBRthis"]').getAttribute('value')
            var uri = AknMain.Uri.parse(oldUriStr);
        } catch (e) {return; }
        console.warn('uri', uri.manifestation());
        console.warn('uri', oldUriStr);

        if (uri.date !== date || uri.version !== version) {
            console.warn('actual update')
            // uri.date = date;
            // uri.version = version;
            //
            // this.superUpdate('FRBRWork', 'FRBRthis', 'value', uri.work());
            // this.superUpdate('FRBRExpression', 'FRBRthis', 'value', uri.expression());
            // this.superUpdate('FRBRManifestation', 'FRBRthis', 'value', uri.manifestation());
            // this.superUpdate('FRBRManifestation', 'FRBRdate', 'date', uri.date);
        }
    },

    // Wrapper for DocProperties.updateMetadata
    superUpdate: function (level, item, prop, value) {
        var metadata = this.getController('Editor').getDocumentMetadata();
        var request = {
            metadata: metadata,
            path: 'identification/'+level+'/'+item,
            data: {},
            isAttr: true,
            overwrite: true
        };
        request.data[prop] = value;

        DocProperties.updateMetadata(request);
    }
});
