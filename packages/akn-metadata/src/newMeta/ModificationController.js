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

Ext.define('AknMetadata.newMeta.ModificationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.akn-metadata-modification',

    listen: {
        store: {
            '*': {
                remove: 'onStoreAddRemove',
                add: 'onStoreAddRemove',
                update: 'onStoreChanged'
            }
        }
    },

    onStoreAddRemove: function(store, records) {
        var record = records[0];
        if (this.isRelevantChange(record))
            this.updateGridStore();
    },

    onStoreChanged: function(store, record, operation) {
        if (operation != 'edit') return;
        if (this.isRelevantChange(record))
            this.updateGridStore();
    },

    isRelevantChange: function(record) {
        if (!record) return false;
        switch(record.$className) {
            case 'AknMain.metadata.Modification':
            case 'AknMain.metadata.SourceDestination':
            case 'AknMain.metadata.TextualChange':
                return true;
            default:
                return false;
        }
    },

    updateGridStore: Utilities.events.debounce(function() {
        var store = this.getViewModel().getStore('passiveModifications');
        var mainDoc = Ext.getStore('metadata').getMainDocument();
        var records = [];
        mainDoc.modifications().each(function(record) {
            var data = record.getAllData();
            var getFirstVal = function(key, attr) {
                return data[key][0] && data[key][0][attr] || '';
            };
            data['_source'] = getFirstVal('source', 'href');
            data['_destination'] = getFirstVal('destination', 'href');
            data['_old'] = getFirstVal('old', 'content');
            data['_new'] = getFirstVal('new', 'href');
            records.push(data);
        });
        store.setData(records);
    }, 500),

    onItemClick: function(grid, record) {
        var nodeId = record.data['_new'] || record.data['_destination'];
        var node = nodeId && DocProperties.getMarkedElement(nodeId);
        if (node) {
            Ext.GlobalEvents.fireEvent('nodeFocusedExternally', node.htmlElement, {
                select : true,
                scroll : true
            });
            record.set('_isLinked', true);
        } else {
            record.set('_isLinked', false);
        }
    },

    onItemRemove: function(grid) {
        var selectedRows = grid.getSelection();
        if (selectedRows.length == 0) return;
        this.deleteConfirm(selectedRows[0].get('eid'), function() {
            grid.getStore().remove(selectedRows);
        });
    },

    deleteConfirm: function(ruleName, fn) {
        var msg = new Ext.Template(AknMetadata.Strings.get('deleteModMsg')).apply({
            name: ruleName
        });
        Ext.Msg.confirm(
            AknMetadata.Strings.get('deleteMod'),
            msg,
            function(res){
                if (res === 'yes') fn();
            }
        );
    }
});
