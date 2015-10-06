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

// This controller loads in the metadata store the right values every time
// a new document is loaded in LIME.
Ext.define('AknMain.metadata.ImportController', {
    extend: 'Ext.app.Controller',

    requires: [
        'AknMain.xml.Document'
    ],

    listen: {
        global:  {
            loadDocument: 'onLoadDocument'
        }
    },

    // On the loadDocument event, load metadata from the original xml document.
    // No HtmlToso, no XSLTs, just plain and simple AkomaNtoso. KISS. <3
    onLoadDocument: function (config) {
        var akn = AknMain.xml.Document.parse(config.originalXml, 'akn'),
            store = Ext.getStore('metadata').newMainDocument();

        // FRBRWork
        // TODO: parse URI
        // TODO: FRBRalias
        store.set('type', akn.query('local-name(//akn:akomaNtoso/*)'));
        store.set('date', akn.getValue('//akn:FRBRWork/akn:FRBRdate/@date'));
        store.set('author', akn.getValue('//akn:FRBRauthor/@value'));
        store.set('country', akn.getValue('//akn:FRBRcountry/@value'));
        // TODO: FRBRsubtype
        // TODO: FRBRnumber
        // TODO: FRBRname
        // TODO: FRBRprescriptive
        // TODO: FRBRauthoritative

        this.importReferences(store.references(), akn);
        this.importSource(store, akn);
    },

    importReferences: function (store, akn) {
        akn.select('//akn:references/*').forEach(function (reference) {
            var data = {
                eid: reference.getAttribute('eId'),
                type: reference.tagName,
                href: reference.getAttribute('href'),
                showAs: reference.getAttribute('showAs')
            }
            store.add(data);
        });
    },

    importSource: function (store, akn) {
        var source = akn.getValue('//akn:identification/@source').substring(1),
            reference = source && store.references().findRecord('eid', source);
        console.log('source', source, reference);
        if (reference) {
            store.setSource(reference);
        } else {
            store.setSource(
                store.references().add({
                    eid: 'source',
                    type: 'TLCPerson',
                    href: '/ontology/person/somebody',
                    showAs: 'Somebody'
                })[0]
            );
        }
    }
});
