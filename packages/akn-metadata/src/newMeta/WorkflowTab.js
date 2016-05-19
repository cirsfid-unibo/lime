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

Ext.define('AknMetadata.newMeta.WorkflowTab', {
    extend: 'AknMetadata.newMeta.EditorTab',
    xtype: 'akn-metadata-tab-workflow',
    requires: [
        'AknMetadata.newMeta.EditorTab',
        'AknMetadata.newMeta.EditorTable',
        'AknMetadata.newMeta.ReferenceCombo'
    ],
    title: Locale.getString('workflow', 'akn-metadata'),
    glyph: 'xf160@FontAwesome',
    layout: 'fit',
    items: [{
        xtype: 'metadataeditortable',
        bind: {
            store: '{document.workflowSteps}'
        },
        title: Locale.getString('steps', 'akn-metadata'),
        columns: [
            {
                text: Locale.getString('date', 'akn-metadata'),
                dataIndex: 'date',
                editor: 'datefield',
                renderer: Ext.util.Format.dateRenderer(Ext.util.Format.dateFormat)
            },
            {
                text: Locale.getString('actor', 'akn-metadata'),
                dataIndex: 'actor',
                renderer: function (r) { return r && r.data ? r.data.showAs : r; },
                editor: {
                    xtype: 'akn-metadata-tab-referencecombo',
                    filteredTypes: ['TLCPerson', 'TLCOrganization']
                }
            },
            {
                text: Locale.getString('role', 'akn-metadata'),
                dataIndex: 'role',
                renderer: function (r) { return r && r.data ? r.data.showAs : r; },
                editor: {
                    xtype: 'akn-metadata-tab-referencecombo',
                    filteredTypes: ['TLCRole']
                }
            },
            {
                text: Locale.getString('outcome', 'akn-metadata'),
                dataIndex: 'outcome',
                renderer: function (r) { return r && r.data ? r.data.showAs : r; },
                editor: {
                    xtype: 'akn-metadata-tab-referencecombo',
                    filteredTypes: ['TLCConcept']
                }
            }
        ],
        custom: {
            eid: function (context) { return 'w' + context.rowIdx; },
            actor: function (context) { return context.newValues.actor; },
            role: function (context) { return context.newValues.role; },
            outcome: function (context) { return context.newValues.outcome; }
        },
        referenceFix: {
            actor: { defaultType: 'TLCOrganization', idPrefix: 'actor' },
            role: { defaultType: 'TLCRole', idPrefix: 'role' },
            outcome: { defaultType: 'TLCConcept', idPrefix: 'outcome' }
        }
    }]
})