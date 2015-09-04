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

 // Since Ext templates are really really bad for doing stuff with trees,
 // we implement a custom one for our outliner.
 Ext.define('LIME.components.outliner.OutlinerTemplate', {
     extend: 'Ext.Template',

     apply: function (values) {
         console.info('apply', values);
         var root = values.root;
         console.info('ROOOOT', root);
         return this.applyChildren(root);
     },

     applyChildren: function (node) {
         if (!node || !node.childNodes) return '';
         return node.childNodes
                    .map(this.applyItem, this)
                    .join('\n');
     },

     applyItem: function (node) {
         return [
            '<div class="item">',
                '<div class="header">',
                    node.get('text'),
                '</div>',
                '<div class="children">',
                    this.applyChildren(node),
                '</div>',
            '</div>'
         ].join('\n');
     }
 });

// A simple and fast implementation of a tree panel.
// Must be configured with a TreeStore.
Ext.define('LIME.components.outliner.TreePanel', {
    extend: 'Ext.view.View',
    alias: 'widget.treePanel',

    itemSelector: '.item',
    baseCls: 'treePanel',
    scrollable: 'vertical',

    tpl: new LIME.components.outliner.OutlinerTemplate(),

    collectData: function(records, startIndex) {
        var data = this.callParent(arguments);
        var store = this.getStore();
        console.info('str', store);
        if (store.getRoot)
            data.root = store.getRoot();
        // data.root = this.getStore().getRoot();
        return data;
    }

    // Todo: implent ensureVisible:
    // A) Reimplement copying part of it from TreePanel
    // B) Always read all of them (?)
    // ensureVisible: function(path, options) {
    // },
});
