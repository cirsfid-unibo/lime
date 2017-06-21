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

// Panel for editing reference href attribute
Ext.define('AknMetadata.tagAttributes.RefPanel', {
    extend: 'LIME.view.widgets.MarkedElementWidget',
    alias: 'widget.refPanel',

    ref: null,
    contextHeight: 320,
    title: Locale.getString('referenceWidgetTitle', 'akn-metadata'),
    items: [{
        xtype: 'combo',
        emptyText: Locale.getString('type', 'akn-metadata'),
        name: 'type',
        displayField: 'name',
        allowBlank: false,
        valueField: 'type',
        queryMode: 'local',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'type'],
            data: [{name: Locale.getString('internal', 'akn-metadata'), type: 'internal'},
                    {name: Locale.getString('external', 'akn-metadata'), type: 'external'}]
        })
    }, {
        xtype: 'nationalitySelector'
    }, {
        xtype: 'docTypeSelector'
    }, {
        xtype: 'textfield',
        name: 'subtype',
        emptyText: Locale.getString('docSubType', 'akn-metadata')
    }, {
        xtype: 'textfield',
        emptyText: Locale.getString('author', 'akn-metadata'),
        name: 'author'
    }, {
        xtype: 'datefield',
        name: 'date',
        allowBlank: false,
        emptyText: Locale.getString('date', 'akn-metadata')
    }, {
        xtype: 'textfield',
        name: 'number',
        emptyText: Locale.getString('number', 'akn-metadata')
    }, {
        xtype: 'textfield',
        name: 'fragment',
        emptyText: Locale.getString('fragment', 'akn-metadata')
    }],

    listeners: {
        afterrender: function () {
            this.down('[name=type]').on('change', this.onTypeChange, this);
            if (this.ref)
                this.getForm().setValues(this.refToFormValues());
        }
    },

    onTypeChange: function(field, newValue, oldValue) {
        if (newValue == 'internal') {
            this.query('field').filter(function(field) {
                return (field.name != 'type' && field.name != 'fragment');
            }).forEach(function(field) {
                field.disable();
            });
        } else {
            this.query('field').forEach(function(field) {
                field.enable();
            });
        }
    },

    refToFormValues: function() {
        return {
            type: (this.ref.internal) ? 'internal' : 'external',
            nationality: this.ref.uri.country,
            docType: this.ref.uri.type,
            author: this.ref.uri.author,
            subtype: this.ref.uri.subtype,
            date: this.ref.uri.date,
            number: this.ref.uri.name,
            fragment: this.ref.id
        }
    },

    getField: function(name) {
        return this.down('[name='+name+']');
    }
});
