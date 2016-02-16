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

// Metadata model for AkomaNtoso.
// This is the generic model, to use/modify the metadata of the document
// use the default metadata store.

Ext.define('AknMain.metadata.Base', {
    extend: 'Ext.data.Model',

    schema: {
        namespace: 'AknMain.metadata'
    }
 });

Ext.define('AknMain.metadata.Document', {
    extend: 'AknMain.metadata.Base',

    requires: [
        'AknMain.Uri',
        'AknMain.metadata.XmlSerializer'
    ],

    fields: [
        // Identification                       Example:
        { name: 'country', type: 'string' },    // 'it'
        { name: 'type', type: 'string' },       // 'bill'
        { name: 'subtype', type: 'string' },    // 'decree'
        { name: 'author', type: 'string' },     // 'camera'
        { name: 'date', type: 'date' },         // '2014-09-12'
        { name: 'number', type: 'string' },     // 'legge 19822'
        { name: 'name', type: 'string' },       // 'nomelegge'
        { name: 'language', type: 'string' },   // 'ita'
        { name: 'version', type: 'date' },      // '2015-03-12'
        { name: 'official', type: 'string' },   // 'official'
        { name: 'generation', type: 'date' },   // '2015-03-12'
        { name: 'component', type: 'string' },  // 'main'
        { name: 'media', type: 'string' },      // 'xml'
        { name: 'path', type: 'string' },       // 'http://sinatra ... xml'componentcomponent
        { name: 'authoritative', type: 'boolean' },
        { name: 'prescriptive', type: 'boolean' },

        { name: 'workAuthor', reference: 'Reference' },
        { name: 'workAuthorRole', reference: 'Reference' },
        { name: 'expressionAuthor', reference: 'Reference' },
        { name: 'expressionAuthorRole', reference: 'Reference' },
        { name: 'manifestationAuthor', reference: 'Reference' },
        { name: 'manifestationAuthorRole', reference: 'Reference' },

        { name: 'source', reference: 'Reference' },

        // Pubblication
        { name: 'pubblicationName', type: 'string' },
        { name: 'pubblicationDate', type: 'date' },
        { name: 'pubblicationNumber', type: 'string' },
        { name: 'pubblicationShowAs', type: 'string' },

        // Proprietary
        { name: 'proprietary', type: 'auto' }
    ],

    validators: {
        country: { type: 'format', matcher: /[a-z]{2}/ },
        type: { type: 'inclusion', list: [
            'amendmentList',
            'officialGazette',
            'documentCollection',
            'act',
            'bill',
            'debateReport',
            'debate',
            'statement',
            'amendment',
            'judgment',
            'portion',
            'doc'
        ] }
    },

    getUri: function () {
        var uri = AknMain.Uri.empty();
        var normalize = AknMain.metadata.XmlSerializer.normalizeDate;
        uri.country = this.get('country');
        uri.type = this.get('type');
        uri.subtype = this.get('subtype');
        uri.author = this.get('author');
        uri.date = normalize(this.get('date'));
        uri.name = this.get('name') || this.get('number');
        uri.language = this.get('language');
        uri.version = normalize(this.get('version'));
        uri.official = this.get('official');
        uri.generation = normalize(this.get('generation'));
        uri.component = this.get('component');
        uri.media = this.get('media');
        uri.path = this.get('path');
        return uri;
    }
});

Ext.define('AknMain.metadata.Alias', {
    extend: 'AknMain.metadata.Base',
    fields: [
        { name: 'documentId', reference: 'Document' },
        { name: 'name', type: 'string' },
        { name: 'value', type: 'string' },
        { name: 'level', type: 'string' }
    ],

    validators: {
        type: { type: 'inclusion', list: ['work', 'expression', 'manifestation', 'item'] }
    }
});

Ext.define('AknMain.metadata.Reference', {
    extend: 'AknMain.metadata.Base',
    idProperty: 'eid',
    fields: [
        { name: 'documentId', reference: 'Document' },
        { name: 'eid', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'href', type: 'string' },
        { name: 'showAs', type: 'string' }
    ],
    validators: {
        type: { type: 'inclusion', list: [
            'original',
            'TLCPerson',
            'TLCOrganization',
            'TLCConcept',
            'TLCObject',
            'TLCEvent',
            'TLCLocation',
            'TLCProcess',
            'TLCRole',
            'TLCTerm',
            'TLCReference'
        ] }
    }
});

Ext.define('AknMain.metadata.LifecycleEvent', {
    extend: 'AknMain.metadata.Base',
    fields: [
        { name: 'documentId', reference: 'Document' },
        { name: 'eid', type: 'string' },
        { name: 'date', type: 'date' },
        { name: 'source', reference: 'Reference' },
        { name: 'refers', reference: 'Reference' },
        { name: 'original', type: 'boolean' },
        { name: 'type', type: 'string' }
    ],
    validators: {
        type: { type: 'inclusion', list: ['generation', 'amendment', 'repeal'] }
    }
});

Ext.define('AknMain.metadata.WorkflowStep', {
    extend: 'AknMain.metadata.Base',
    fields: [
        { name: 'documentId', reference: 'Document' },
        { name: 'eid', type: 'string' },
        { name: 'date', type: 'date' },
        { name: 'actor', reference: 'Reference' },
        { name: 'role', reference: 'Reference' },
        { name: 'outcome', reference: 'Reference' },
        { name: 'refers', reference: 'Reference' }
    ]
});

Ext.define('AknMain.metadata.ClassificationKeyword', {
    extend: 'AknMain.metadata.Base',
    fields: [
        { name: 'documentId', reference: 'Document' },
        { name: 'value', type: 'string' },
        { name: 'showAs', type: 'string' },
        { name: 'dictionary', type: 'string' },
        { name: 'href', type: 'string' }
    ]
});

Ext.define('AknMain.metadata.Modification', {
    extend: 'AknMain.metadata.Base',
    fields: [
        { name: 'documentId', reference: 'Document' },
        { name: 'amendmentType', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'modType', type: 'string' },
        { name: 'eid', type: 'string' },
        { name: 'wid', type: 'string' },
        { name: 'period', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'refers', type: 'string' },
        { name: 'previous', type: 'string' },
        { name: 'force', type: 'string' },
        { name: 'efficacy', type: 'string' },
        { name: 'application', type: 'string' },
        { name: 'duration', type: 'string' },
        { name: 'condition', type: 'string' },
        { name: 'conditionFrozen', type: 'string' }
    ],

    validators: {
        amendmentType: { type: 'inclusion', list: ['active', 'passive'] },
        type: { type: 'inclusion', list: ['textualMod'] },
        modType: { type: 'inclusion', list: [
                    'repeal',
                    'substitution',
                    'insertion',
                    'replacement',
                    'renumbering',
                    'split',
                    'join'] },
        status: { type: 'inclusion', list: [
                    'removed',
                    'temporarilyRemoved',
                    'translated',
                    'editorial',
                    'edited',
                    'verbatim',
                    'incomplete',
                    'unknown',
                    'undefined',
                    'ignored'] }
    },

    getSourceDestinations: function(type) {
        return this.getRecordsBy(this.sourceDestinations(), 'type', type);
    },

    getRecordsBy: function(store, prop, val) {
        var res = [];
        store.each(function(rec) {
            if (!val || rec.get(prop) == val)
                res.push(rec);
        });
        return res;
    },

    getTextualChanges: function(type) {
        return this.getRecordsBy(this.textualChanges(), 'type', type);
    },

    getOldText: function() {
        return this.getTextualChanges('old').map(function(old) {
                return old.get('content');
            }).join(' ').trim();
    }
});

Ext.define('AknMain.metadata.SourceDestination', {
    extend: 'AknMain.metadata.Base',
    fields: [
        { name: 'modification', reference: 'Modification' },
        { name: 'type', type: 'string' },
        { name: 'href', type: 'string' },
        { name: 'pos', type: 'string' },
        { name: 'exclusion', type: 'string' },
        { name: 'incomplete', type: 'string' },
        { name: 'upTo', type: 'string' }
    ],

    validators: {
        type: { type: 'inclusion', list: ['source', 'destination'] },
        pos: { type: 'inclusion', list: [
                    'start',
                    'before',
                    'inside',
                    'after',
                    'end',
                    'unspecified'] }
    }
});

Ext.define('AknMain.metadata.TextualChange', {
    extend: 'AknMain.metadata.Base',
    fields: [
        { name: 'modification', reference: 'Modification' },
        { name: 'type', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'href', type: 'string' }
    ],

    validators: {
        type: { type: 'inclusion', list: ['old', 'new'] }
    }
});