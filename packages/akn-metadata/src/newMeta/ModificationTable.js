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

Ext.define('AknMetadata.newMeta.ModificationTable', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.metadatamodificationtable',

    columns: [
        {
            text: Locale.getString('eId', 'akn-metadata'),
            dataIndex: 'eid'
        },
        {
            text: Locale.getString('type', 'akn-metadata'),
            dataIndex: 'modType'
        },
        {
            text: Locale.getString('source', 'akn-metadata'),
            dataIndex: '_source',
            cellTooltip: true
        },
        {
            text: Locale.getString('destination', 'akn-metadata'),
            dataIndex: '_destination',
            renderer: function(value, metadata, record) {
                metadata.tdAttr = 'data-qtip="' + record.get('_destination') + '"';
                return value;
            }
        },
        {
            text: Locale.getString('new', 'akn-metadata'),
            dataIndex: '_new'
        },
        {
            text: Locale.getString('old', 'akn-metadata'),
            dataIndex: '_old',
            flex: 1,
            cellWrap: true
        }
    ],

    listeners: {
        itemclick: 'onItemClick'
    },

    viewConfig: {
        stripeRows: false,
        getRowClass: function(record) {
            return record.get('_isLinked') ? '' : 'forbidden-cell';
        }
    },

    tools: [{
        type: 'minus',
        tooltip: Locale.getString('removeItem', 'akn-metadata'),
        callback: 'onItemRemove'
    }],

    initComponent: function() {
        var renderer = function(value, metadata, record, rowIndex, colIndex) {
            var headerCt = this.getHeaderContainer(),
                column = headerCt.getHeaderAtIndex(colIndex);

            metadata.tdAttr = 'data-qtip="' + record.get(column.dataIndex) + '"';
            return value;
        }
        Ext.each(this.columns, function(column) {
            if (!column.renderer && column.cellTooltip) {
                column.renderer = renderer
            }
        })
        this.callParent(arguments);
    }
});
