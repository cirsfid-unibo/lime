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

// Outline proxy which loads data from the editor
Ext.define('LIME.components.outliner.OutlineEditorProxy', {
    extend: 'Ext.data.proxy.Proxy',

    // Our implementation of the Proxy read operation
    read: function (operation) {
        operation.setStarted();
        this.readChildren(operation.config.id, function (children) {
            var resultSet = Ext.create('Ext.data.ResultSet', {
                records: children,
                total: children.length,
                count: children.length,
                loaded: true
            });
            operation.setResultSet(resultSet);
            operation.setSuccessful(true);
        });
    },

    // Try to read the children of the element with the given id
    // and call cb with result when successful.
    readChildren: function (parentId, cb) {
        try {
            var el = this.getDomElement(parentId);
        } catch (e) {
            console.warn(e);
            var me = this;
            setTimeout(function () {
                me.readChildren.apply(me, [parentId, cb]);
            }, 2000);
            return;
        }
        cb(this.getVisibleChildren(el).map(this.convertToModel, this));
    },

    // Return the element with the given id.
    getDomElement: function (id) {
        // Todo: this use of the global LIME object is suboptimal.
        // Maybe this should be set as a config.
        var doc = LIME.app.getController('Editor').getDom(),
            result;

        if (id == 'root') result = doc.querySelector('[docid]');
        else result = DomUtils.getElementById(id, doc);

        if (!result) throw new Error('Couldn\'t find element');
        else return result;
    },

    // Return array of nodes which should be displayed in the outliner
    getVisibleChildren: function (node) {
        var results = [];
        for (var child = node.firstChild; child; child = child.nextSibling)
            if (DomUtils.getElementId(child))
                results.push(child);
        return results;
    },

    convertToModel: function (node) {
        var text = node.classList[1],
            isLeaf = this.getVisibleChildren(node).length == 0;
        return Ext.create('LIME.components.outliner.OutlineModel', {
            id: DomUtils.getElementId(node),
            parentId: DomUtils.getElementId(node.parentNode),
            expanded: false,
            leaf: isLeaf,
            text: text,
            phantom: false
        });
    }
});
