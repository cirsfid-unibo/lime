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
/**
 * This is grid panel used as list view for files
 */
Ext.define('LIME.view.modal.newOpenfile.ListView', {
    extend : 'Ext.grid.Panel',
    alias : 'widget.openFileListView',
    // Requires what plugins can include
    requires : ['Ext.grid.plugin.DragDrop', 'Ext.grid.column.Action'],
    columns : [{
        text : 'Folder', //TODO: localize
        dataIndex : 'name',
        width: 195,
        renderer : function(value, cmp, record) {
            value = value || "";
            if (!record.data.leaf) {
                value = '<div style="float:left;">' + value + '</div><img class="openfile-expander" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==">';
            }
            // Add file type label.
            var suffix = record.data.name.substr(-4);
            if (['.xml', '.doc', '.docx', '.pdf', '.txt'].indexOf(suffix) != -1) {
                var label = suffix.toUpperCase();
                value = '<div style="float:left;">' + value + '</div><i style="float:right;border: 1px solid #888;border-radius: 5px;padding: 0 5px;background: #ccc;">'+label.substring(1)+'</i>';
            }
            return value;
        }
    }],
    scrollable: 'y',
    width : 195,
    displayField : 'name',
    initComponent : function() {
        var me = this;
        Ext.apply(me, {
            store : me.buildStore(me)
        });
        me.callParent(arguments);
    },

    buildStore : function() {
        return Ext.create('LIME.store.OpenFile');
    }
});
