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

// Metadata editor for the AknMain.metadata.Store
// Todo: add validation/display errors
Ext.define('AknMetadata.newMeta.Editor', {
    extend: 'Ext.panel.Panel',
    xtype: 'akn-metadata-editor',

    requires: [
        'AknMetadata.newMeta.Model',
        'AknMetadata.newMeta.Controller'
    ],

    controller: 'akn-metadata',
    viewModel: {
        type: 'akn-metadata'
    },

    layout: {
        type: 'accordion',
        titleCollapse: true,
        animate: true,
        fill: true
    },

    items: [{
        xtype: 'metadataTab',
        title: 'Work',
        items: [{
            xtype: 'datefield',
            fieldLabel: 'Work date',
            bind: '{document.date}'
        }, {
            xtype: 'textfield',
            fieldLabel: 'Number',
            bind: '{document.name}'
        }, {
            xtype: 'combobox',
            store: 'Nationalities',
            displayField: 'name',
            fieldLabel: 'Nation',
            bind: '{document.country}'
        }, {
            xtype: 'textfield',
            fieldLabel: 'Author',
            bind: '{document.author}'
        }, {
            xtype: 'gridpanel',
            bind: {
                store: '{document.aliases}'
            },
            columns: [
                { text: 'Value', dateIndex: 'value', flex: 1, editor: 'textfield', allowBlank: false },
                { text: 'Name', dateIndex: 'name', editor: 'textfield' }
            ],
            plugins: {
                ptype: 'rowediting',
                clicksToEdit: 1
            }
        }]
    }, {
        xtype: 'metadataTab',
        title: 'Version',
        items: [{
            xtype: 'combobox',
            store: 'DocumentLanguages',
            displayField: 'name',
            fieldLabel: 'Language',
            bind: '{document.language}'
        }, {
            xtype: 'datefield',
            fieldLabel: 'Version date',
            bind: '{document.date}'
        }, {
            xtype: 'textfield',
            fieldLabel: 'Author',
            bind: '{document.author}'
        }]
    }, {
        xtype: 'metadataTab',
        title: 'Manifestation',
        items: []
    }, {
        xtype: 'metadataTab',
        title: 'References',
        layout: 'fit',
        items: [{
            xtype: 'gridpanel',
            bind: {
                store: '{document.aliases}'
            },
            columns: [
                { text: 'Id', dateIndex: 'eid', editor: 'textfield', allowBlank: false },
                { text: 'Type', dateIndex: 'type', editor: 'combo', allowBlank: false },
                { text: 'Href', dateIndex: 'href', flex: 1, editor: 'textfield' },
                { text: 'Name', dateIndex: 'name', editor: 'textfield' }
            ],
            plugins: {
                ptype: 'cellediting',
                clicksToEdit: 1
            },
            tools: [{
                type: 'plus',
                tooltip: 'Add a new reference',
                callback: function (grid) {
                    console.log('arguments', arguments);
                    grid.getStore().add({});
                }
            }, {
                type: 'minus',
                tooltip: 'Remove selected references',
                callback: function (grid) {
                    console.log(grid.getSelection());
                    grid.getStore().remove(grid.getSelection());
                }
            }]
        }]
    }]
});

Ext.define('AknMetadata.newMeta.EditorTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.metadataTab',
    defaults: {
        padding: '5 20'
    }
});
