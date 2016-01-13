/*
 * Copyright (c) 2016 - Copyright holders CIRSFID and Department of
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

// Todo: add a tab for each element

Ext.define('AknMetadata.newMeta.ReferenceTab', {
    extend: 'AknMetadata.newMeta.EditorTab',
    xtype: 'akn-metadata-tab-reference',
    requires: [
        'AknMetadata.newMeta.EditorTab',
        'AknMetadata.newMeta.EditorTable',
        'Ext.grid.feature.Grouping'
    ],
    title: 'References',
    xtype: 'metadataTab',
    glyph: 'xf08e@FontAwesome',
    layout: 'fit',
    items: [{
        xtype: 'metadataeditortable',
        features: [{
            ftype:'grouping',
            groupHeaderTpl: '{renderedGroupValue}'
        }],
        title: 'Persons',
        bind: { store: '{document.references}' },
        // hideHeaders: true,
        columns: [
            { text: 'Value', dataIndex: 'showAs', editor: 'textfield', allowBlank: false },
            {
                text: 'Type',
                dataIndex: 'type',
                renderer: function (r) {
                    switch (r) {
                    case 'TLCPerson': return 'Person';
                    default: return r;
                    }
                },
                allowBlank: false,
                hidden: true
            }
        ],
        custom: {
            eid: function (context) { return 'p' + context.rowIdx; } },
            type: function () { return 'TLCPerson'; }
        }
    ],

    initComponent: function () {
        // Crappy hack to enable grouping (Ext requires stores to be configured)
        // I understand we're not using Ext stores the way they're supposed to be,
        // but I'm left wondering whether or not there is a right way..
        // It seems like every view should have it's own store, but I've found no
        // way to share data between them apart from not using them as the data source.
        Ext.getStore('metadata').getMainDocument().references().setGroupField('type');
        this.callParent(arguments);
    }
});
