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
    extend: 'Ext.tab.Panel',
    xtype: 'akn-metadata-editor',

    requires: [
        'AknMetadata.newMeta.Model',
        'AknMetadata.newMeta.Controller'
    ],

    controller: 'akn-metadata',
    viewModel: {
        type: 'akn-metadata'
    },

    // ui: 'navigation',
    tabPosition: 'left',
    tabRotation: 0,
    tabBar: {
        border: false
    },

    defaults: {
        textAlign: 'left',
        bodyPadding: 15
    },

    items: [{
        xtype: 'metadataTab',
        title: 'Document',
        glyph: 'xf0f6@FontAwesome',
        items: [{
            xtype: 'datefield',
            fieldLabel: 'Date',
            bind: '{document.date}'
        }, {
            xtype: 'datefield',
            fieldLabel: 'Version date',
            bind: '{document.version}'
        }, {
            xtype: 'textfield',
            fieldLabel: 'Number',
            bind: '{document.name}'
        }, {
            xtype: 'combobox',
            store: 'Nationalities',
            displayField: 'name',
            valueField: 'alpha-2',
            fieldLabel: 'Nation',
            bind: '{document.country}'
        }, {
            xtype: 'combobox',
            store: 'DocumentLanguages',
            displayField: 'name',
            valueField: 'code',
            fieldLabel: 'Language',
            bind: '{document.language}'
        }, {
            xtype: 'textfield',
            fieldLabel: 'Author',
            bind: '{document.author}'
        }, {
            xtype: 'checkboxfield',
            boxLabel: 'Prescriptive',
            bind: '{document.prescriptive}'
        }, {
            xtype: 'checkboxfield',
            boxLabel: 'Authoritative',
            bind: '{document.authoritative}'
        }, {
            xtype: 'metadataeditortable',
            title: 'Aliases',
            hideHeaders: true,
            bind: {
                store: '{document.aliases}'
            },
            columns: [
                { text: 'Value', dataIndex: 'value', flex: 1, editor: 'textfield', allowBlank: false }
            ],
            custom: {
                level: function () { return 'work'; },
                name: function () { return 'alias'; }
            }
        }]
    }, {
        title: 'Events',
        xtype: 'metadataTab',
        glyph: 'xf073@FontAwesome',
        items: [{
            xtype: 'metadataeditortable',
            bind: {
                store: '{document.lifecycleEvents}'
            },
            columns:[
                { text: 'Date', dataIndex: 'date', editor: 'datefield' },
                {
                    text: 'Source',
                    dataIndex: 'source',
                    flex: 1,
                    renderer: function (r) {
                        return r.data.showAs;
                    },
                    editor: {
                        xtype: 'combo',
                        store: [],
                        listeners: {
                            beforequery: function () {
                                var documents = [];
                                Ext.getStore('metadata').getMainDocument().references().each(function (r) {
                                    documents.push(r);
                                });
                                this.setStore(documents.filter(function (r) {
                                    return r.type === 'original' || r.type === 'TLCReference';
                                }).map(function (r) {
                                    return [r, r.data.showAs];
                                }));
                            },
                            show: function () {
                                console.log('show');
                            }
                        },
                    }
                },
                {
                    text: 'Type',
                    dataIndex: 'type',
                    editor: {
                        xtype: 'combo',
                        store: ['generation', 'amendment', 'repeal'],
                        forceSelection: true
                    }
                }
                // { name: 'source', reference: 'Reference' },
                // { name: 'refers', type: 'string' },
                // { name: 'original', type: 'boolean' },
            ]
        }],
        custom: {
            eid: function (context) { return 'e' + context.rowIdx; }
        }

    }, {
        title: 'Workflow',
        xtype: 'metadataTab',
        glyph: 'xf160@FontAwesome',
        layout: 'fit',
        items: [{
            xtype: 'metadataeditortable',
            bind: {
                store: '{document.workflowStep}'
            },
            columns: [
                { text: 'Id', dataIndex: 'eid', editor: 'textfield', allowBlank: false },
                { text: 'Date', dataIndex: 'date', editor: 'datefield' },
                {
                    text: 'Source',
                    dataIndex: 'source',
                    editor: {
                        xtype: 'combo',
                        store: '{document.references}'
                    }
                },
                { text: 'Refers', dataIndex: 'refers', editor: 'textfield' },
                { text: 'Original', dataIndex: 'origianl', editor: 'checkboxfield' },
                {
                    text: 'Type',
                    dataIndex: 'type',
                    editor: {
                        xtype: 'combo',
                        store: AknMain.metadata.LifecycleEvent.validators.type[0].list
                    }
                }
            ]
        }]
    }, {
        title: 'Classification',
        xtype: 'metadataTab',
        glyph: 'xf200@FontAwesome'
    }, {
        title: 'References',
        xtype: 'metadataTab',
        glyph: 'xf08e@FontAwesome',
        layout: 'fit',
        items: [{
            xtype: 'metadataeditortable',
            bind: {
                store: '{document.references}'
            },
            columns: [
                { text: 'Id', dataIndex: 'eid', editor: 'textfield', allowBlank: false },
                {
                    text: 'Type',
                    dataIndex: 'type',
                    editor: {
                        xtype: 'combo',
                        store: AknMain.metadata.Reference.validators.type[0].list
                    },
                    allowBlank: false
                },
                { text: 'Href', dataIndex: 'href', flex: 1, editor: 'textfield' },
                { text: 'Name', dataIndex: 'showAs', editor: 'textfield' }
            ]
        }]
    }]
});

Ext.define('AknMetadata.newMeta.EditorTab', {
    extend: 'Ext.panel.Panel',
    scrollable: 'y',
    alias: 'widget.metadataTab',
    defaults: {
        padding: '0'
    }
});

// Custom Grid used inside the metadata editor.
// - Add tools for adding and removing elements.
// - Row editing.
// - Allow setting model properties programmatically on row edit complete:
//   functions in the 'custom' property are executed with the record context
//   and added to the store.
Ext.define('AknMetadata.newMeta.EditorTable', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.metadataeditortable',
    plugins: {
        ptype: 'rowediting',
        clicksToEdit: 1,
        listeners: {
            validateedit: function(editor, context) {
                var custom = context.grid.custom || {};
                Object.keys(custom).forEach(function (prop) {
                    context.record.data[prop] = custom[prop](context);
                    console.log('setting ', prop, ' to ', context.record.data[prop]);
                });
            }
        }
    },

    tools: [{
        type: 'plus',
        tooltip: 'Add a new item',
        callback: function (grid) {
            console.log('arguments', arguments);
            grid.getStore().add({});
        }
    }, {
        type: 'minus',
        tooltip: 'Remove selected items',
        callback: function (grid) {
            console.log(grid.getSelection());
            grid.getStore().remove(grid.getSelection());
        }
    }]
});
