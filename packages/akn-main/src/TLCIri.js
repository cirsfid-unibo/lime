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


// Class for AkomaNtoso TLC IRI management, the IRI for non document entities.
// Specifications http://docs.oasis-open.org/legaldocml/akn-nc/v1.0/csprd02/akn-nc-v1.0-csprd02.html#_Toc447637043
//
// Usage example:
// var iri = AknMainTLCIri.create('person', 'it.mario.rossi', 'it');
// iri.toString() -> /akn/ontology/person/it/it.mario.rossi

// TODO
// handle parse
// add more documentation and examples
Ext.define('AknMain.TLCIri', {
    singleton: true,

    TLClist: [
        'person',
        'organization',
        'concept',
        'object',
        'event',
        'location',
        'process',
        'role',
        'term',
        'reference'
    ],

    empty: function () {
        var iri = {
            tlc: undefined,
            subclasses: [],
            id: undefined
        };
        iri.toString = this.iriFunctions.toString.bind(iri);
        return iri;
    },
    // TODO: check id parameter
    create: function(tlc, id, subclasses) {
        var iri = this.empty();
        if (subclasses) {
            iri.subclasses = Array.isArray(subclasses) ? subclasses : [subclasses];
        }
        if (tlc.startsWith('TLC')) {
            tlc = tlc.substring(3).toLowerCase();
        }
        if (this.TLClist.indexOf(tlc) >= 0) {
            iri.tlc = tlc;
        } else {
            throw new Error('Unexpected TLC: '+ tlc);
        }
        iri.id = id;
        return iri;
    },

    parse: function (iriStr) {
        return this.empty();
    },

    // Output functions
    iriFunctions: {
        toString: function () {
            return '/akn/ontology/'+this.tlc+'/'+
                    ((this.subclasses.length) ? this.subclasses.join('/')+'/' : '')+
                    this.id;
        }
    }
});
