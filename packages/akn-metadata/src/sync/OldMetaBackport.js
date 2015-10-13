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
                add: 'onDocumentAdded',
                update: 'onMetadataUpdate'
            }
        }
    },

    // Listen to add events of references store.
    onDocumentAdded: function (store, records) {
        var me = this;
        records.forEach(function (document) {
            document.references().on('add', me.onReferenceAdded, me);
        })
    },

    // When a new reference is added, update the htmltoso references
    onReferenceAdded: function (store, records, index) {
        try {
            var dom = this.getController('Editor').getDocumentMetadata().originalMetadata.metaDom;
        } catch (e) {
            // Document is being loaded: nothing to do.
            return;
        }
        records.forEach(function (reference) {
            var node = dom.querySelector('[class="references"] *[eId="' + reference.get('eid') + '"]');
            if (!node) {
                node = document.createElement("div");

                dom.querySelector('[class="references"]').appendChild(node);
            }
            node.setAttribute('eId', reference.get('eid'));
            node.setAttribute('class', reference.get('type'));
            node.setAttribute('akn_href', reference.get('href'));
            node.setAttribute('akn_showAs', reference.get('showAs'));
        });
        Ext.GlobalEvents.fireEvent('forceMetadataWidgetRefresh');
    },

    // When the AknMain.metadata.Document is updated, watch for date/version
    // update and update URIs accordingly.
    onMetadataUpdate: function (store, record, operation, fields) {
        function isUpdate (field) {
            return operation == 'edit' && fields.indexOf(field) != -1;
        }

        if (isUpdate('date') || isUpdate('version')) {
            this.updateDates();
        }

        if ( isUpdate('number') ) {
            this.updateNumber();
        }

        if ( isUpdate('subtype') ) {
            this.updateSubtype();
        }
    },

    // Update URis and FRBRdate when document date or version has changed.
    updateDates: function () {
        var store = Ext.getStore('metadata').getMainDocument();
        var date = store.get('date'),
            version = store.get('version');

        var uri = this.getUri();
        if (!uri) return;

        if (uri.date !== date || uri.version !== version) {
            uri.date = AknMain.metadata.XmlSerializer.normalizeDate(date);
            uri.version = AknMain.metadata.XmlSerializer.normalizeDate(version);
            this.superUpdate('FRBRWork', 'FRBRdate', 'date', uri.date);
            this.superUpdate('FRBRExpression', 'FRBRdate', 'date', uri.date);
            this.updateUri(uri);
        }
    },

    updateNumber: function() {
        var store = Ext.getStore('metadata').getMainDocument();
        var number = store.get('number');
        var uri = this.getUri();
        if (!uri) return;

        if (uri.name !== number) {
            uri.name = number;
            this.superUpdate('FRBRWork', 'FRBRnumber', 'value', uri.name);
            this.updateUri(uri);
        }
    },

    updateSubtype: function() {
        var store = Ext.getStore('metadata').getMainDocument();
        var subtype = store.get('subtype');
        var uri = this.getUri();
        if (!uri) return;

        if (uri.subtype !== subtype) {
            uri.subtype = subtype;
            this.updateUri(uri);
        }
    },

    getUri: function() {
        try {
            // We know better than the Law of Demeter.
            var oldUriStr = this.getController('Editor').getDocumentMetadata().originalMetadata.metaDom.querySelector('[class="FRBRManifestation"] [class="FRBRthis"]').getAttribute('value')
            return AknMain.Uri.parse(oldUriStr);
        } catch (e) {return; }
    },

    updateUri: function(uri) {
        this.superUpdate('FRBRWork', 'FRBRthis', 'value', uri.work());
        this.superUpdate('FRBRWork', 'FRBRuri', 'value', uri.work());
        this.superUpdate('FRBRExpression', 'FRBRthis', 'value', uri.expression());
        this.superUpdate('FRBRExpression', 'FRBRuri', 'value', uri.expression());
        this.superUpdate('FRBRManifestation', 'FRBRthis', 'value', uri.manifestation());
        this.superUpdate('FRBRManifestation', 'FRBRuri', 'value', uri.manifestation());
        this.getController('Editor').showDocumentIdentifier();
        Ext.GlobalEvents.fireEvent('forceMetadataWidgetRefresh');
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
