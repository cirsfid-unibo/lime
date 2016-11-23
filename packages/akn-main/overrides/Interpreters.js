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
    headingsQuery: '', //will be computed based on headingElements

    // Overwrite the core's wrappingRulesHandlerOnTranslate by wrapping it
    // adding the hcontainer parent control for heading elements
    // This cannot be a wrapper rule because it has to be done before other rules
    // This cannot be done in the xsl because the eId generation is done
    // after the applying of the rules and before the xsl transformation.
    // It's important to have the heading elements in the right place before
    // the eId generation because "num" is used in the process.
    wrappingRulesHandlerOnTranslate: function(node) {
        var button = DomUtils.getButtonByElement(node);
        // query will be .num, .heading...
        this.headingsQuery = this.headingsQuery || '.'+this.headingElements.join(', .');
        if (button && button.pattern.pattern === 'hcontainer') {
            try {
                this.ensureHcontOnDescHeadings(node);
            } catch(e) {
                Ext.log({level: "error"}, 'AknMain ensureHcontOnDescHeadings '+ e);
            }
        }
        return this.callParent(arguments);
    },

    // Call the headingEnsureHcontainerParent function on direct heading nodes
    ensureHcontOnDescHeadings: function(node) {
        // Returns the first hcontainer parent
        var getHcontainerParent = function(node) {
            return DomUtils.findParentNode(node, function(parent) {
                return DomUtils.getPatternByNode(parent) === 'hcontainer';
            });
        };
        // Returns the first subFlow parent
        var getSubFlowParent = function(node) {
            // Elements which contain full structure within a text content.
            // mod is not a subFlow but it contains subFlow elements
            var subFlows =  [
                'mod',
                'quotedStructure',
                'embeddedStructure',
                'authorialNote',
                'note',
                'subFlow'
            ];
            return DomUtils.findParentNode(node, function(parent) {
                return subFlows.indexOf(DomUtils.getNameByNode(parent)) > -1;
            });
        };

        // Return true if the passed heading node is a direct heading of hcontainer node.
        // By direct is not meaning direct child but a heading node which belogs to
        // the hcontainer i.e. if between the heading and the hcontainer there're
        // no other hcontainers and subFlow elements (which break the context).
        // e.g.
        // <article>
        //    <num>2</num>
        //    <quotedStructure><num>1</num></quotedStructure>
        //    <item><num>4</num></item>
        // </article>
        // The hcontainer is article.
        // If heading is <num>2</num> return true
        // If heading is <num>1</num> return false, the context is quotedStructure
        // and article is out of it
        // If heading is <num>4</num> return false
        // e.g.
        // <paragraph>
        //    <p><num>3</num></p>
        // </paragraph>
        // The hcontainer is paragraph and the heading is <num>3</num>
        // return true
        var isDirectHeading = function(hcontainer, heading) {
            return getHcontainerParent(heading) === hcontainer &&
                    !hcontainer.contains(getSubFlowParent(heading));
        };
        // Search heading nodes in the node and call headingEnsureHcontainerParent
        // only on direct heading nodes
        Ext.each(node.querySelectorAll(this.headingsQuery), function(hnode) {
            if (isDirectHeading(node, hnode))
                this.headingEnsureHcontainerParent(hnode);
        }, this);
    },
    // Ensure hcontainer parent for node by splitting the eventual parent node
    // e.g. <article><p><num>1</num> this is a p </p></article>
    // if the passed node is "num"
    // will become <article><num>1</num> <p>this is a p </p></article>
    // e.g. <article><p>this is a <num>1</num> p text </p></article>
    // will become <article><p>this is a</p> <num>1</num><p> p text </p></article>
    headingEnsureHcontainerParent: function(node) {
        var parentPattern = DomUtils.getPatternByNode(node.parentNode);
        var getPrevText = function (node) {
            var txt = '';
            if (!node) return txt;
            while( node.previousSibling ) {
                node = node.previousSibling;
                txt = node.textContent + txt;
            }
            return txt;
        };
        var splitNode = function(node, limitNode) {
            var dupNode = node.cloneNode(false);
            // Move all the previous siblings of limitNode to dupNode
            while(limitNode.previousSibling) {
                dupNode.insertBefore(limitNode.previousSibling, dupNode.firstChild);
            }
            // Insert dupNode before node and return it
            return node.parentNode.insertBefore(dupNode, node);
        };
        if (parentPattern === 'hcontainer') return;
        // If there's some useful text before split the parent
        if (getPrevText(node).trim()) {
            splitNode(node.parentNode, node);
        }
        var parent = node.parentNode;
        // Move the node before its parentNode
        parent.parentNode.insertBefore(node, parent);
        // If the parentNode becomes empty remove it
        if (!parent.textContent.trim()) {
            parent.parentNode.removeChild(parent);
        }
        // Call recursively until the parent will be an hcontainer
        return this.headingEnsureHcontainerParent(node);
    },

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
        var heading;
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
