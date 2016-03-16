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

Ext.define('AknMain.Interpreters', {
    override: 'LIME.Interpreters',

    headingElements: ['num', 'heading', 'subheading'],

    // Adds the content wrapper
    addWrapperElementRule : function(rule, markedNode) {
        var content = this.getChildWithCls(markedNode, 'content'),
            hcontainer = this.getChildWithCls(markedNode, 'hcontainer');
        if(!rule.type || rule.type !== 'content' || content || hcontainer) return;

        content = this.createContentNode(markedNode.ownerDocument);
        // Insert the content in the dom
        var headingEl = this.getLastHeading(markedNode);
        if (headingEl)
            DomUtils.insertAfter(content, headingEl);
        else if (markedNode.firstChild)
            markedNode.insertBefore(content, markedNode.firstChild);
        else
            markedNode.appendChild(content);

        this.moveSiblingsToNode(content);
        return content;
    },

    getChildWithCls: function(node, cls) {
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children.item(i);
            if (child.classList.contains(cls))
                return child;
        }
    },

    getLastHeading: function(node) {
        var heading = undefined;
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children.item(i);
            if (this.headingElements.indexOf(DomUtils.getNameByNode(child)) != -1)
                heading = child;
        }
        return heading;
    },

    createContentNode: function(doc) {
        var config = this.getButtonConfig('content'),
            content = doc.createElement('div');
        content.setAttribute('class', config.pattern.wrapperClass);
        return content;
    },

    moveSiblingsToNode: function(node) {
        var sibling = node.nextSibling;
        while (sibling) {
            node.appendChild(sibling);
            sibling = node.nextSibling;
        }
    }
});
