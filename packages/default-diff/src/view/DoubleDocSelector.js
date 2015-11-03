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

// Widget for selecting two docs (For Diff like stuff)
Ext.define('DefaultDiff.view.DoubleDocSelector', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.doubleDocSelector',

    config : { pluginName : 'default-diff' },

    // Properties id (string), url (string), new (boolean)
    firstDoc : {},
    secondDoc : {},

    // Called when docs change
    // Updates selection button/texfield labels and fires either 'docsSelected'
    // or 'docsDeselected' event.
    onSelectedDocsChanged: function () {
        var firstButton = this.down('fieldset:first *[cls=selectButton]'),
            secondButton = this.down('fieldset:last *[cls=selectButton]'),
            changeMsg = Locale.getString('changeDocument', this.getPluginName()),
            selectMsg = Locale.getString('selectDocument', this.getPluginName());

        firstButton.setTooltip(this.firstDoc.id ? changeMsg : selectMsg);
        secondButton.setTooltip(this.secondDoc.id ? changeMsg : selectMsg);

        var firstField = this.down('fieldset:first textfield');
        var secondField = this.down('fieldset:last textfield');
        firstField.setValue(this.firstDoc.path);
        secondField.setValue(this.secondDoc.path);

        if (this.firstDoc.path)
            Ext.QuickTips.register({target: firstField.getEl(), text: this.firstDoc.path});
        if (this.secondDoc.path)
            Ext.QuickTips.register({target: secondField.getEl(), text: this.secondDoc.path});

        if (this.firstDoc.id && this.secondDoc.id)
            this.fireEvent('docsSelected', this);
        else
            this.fireEvent('docsDeselected', this);
    },

    // Unselect both documents.
    clearSelectedDocuments: function() {
        this.firstDoc = {};
        this.secondDoc = {};
        this.query('textfield').forEach(function (field) {
            field.setValue('');
        });
        this.onSelectedDocsChanged();
    },

    disableEditButton: function () {
        this.down('*[cls=editButton]').disable();
    },

    enableEditButton: function () {
        this.down('*[cls=editButton]').enable();
    },


    frame: true,
    style: {
        borderRadius: '0px',
        border: '0px'
    },
    layout: { type: 'hbox' },
    items: [],

    initComponent: function () {
        this.items = [{
            xtype: 'fieldset',
            collapsible: false,
            border: 0,
            flex: 97,
            items: [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [{
                    xtype: 'textfield',
                    emptyText: Locale.getString('firstDocumentLabel', this.getPluginName()),
                    readOnly: true,
                    flex: 1
                }, {
                    xtype: 'button',
                    cls: 'selectButton',
                    glyph:'xf016@FontAwesome',
                    handler: function () {
                        this.up('doubleDocSelector').fireEvent('firstDocSelected', this.up('doubleDocSelector'));
                    }
                }]
            }]
        }, {
            xtype: 'button',
            cls: 'resetButton',
            glyph:'xf0e2@FontAwesome',
            tooltip: Locale.getString('resetDocument', this.getPluginName()),
            handler: function () {
                this.up('doubleDocSelector').clearSelectedDocuments();
            }
        },{
            xtype: 'button',
            cls: 'editButton',
            tooltip: this.editButtonLabel,
            glyph:'xf044@FontAwesome',
            margin: '0px 0px 0px 5px',
            handler: function () {
                this.up('doubleDocSelector').fireEvent('edit', this.up('doubleDocSelector'));
            }
        }, {
            xtype: 'fieldset',
            collapsible: false,
            border: 0,
            flex: 100,
            items: [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [{
                    xtype: 'textfield',
                    emptyText: Locale.getString('secondDocumentLabel', this.getPluginName()),
                    readOnly: true,
                    flex: 1
                }, {
                    xtype: 'button',
                    cls: 'selectButton',
                    glyph:'xf016@FontAwesome',
                    handler: function () {
                        this.up('doubleDocSelector').fireEvent('secondDocSelected', this.up('doubleDocSelector'));
                    }
                }]
            }]
        }];
        this.callParent();
    }
});
