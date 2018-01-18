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

Ext.define('AknMain.components.ComponentsHandler', {
    extend : 'Ext.app.Controller',

    init: function() {
        this.application.on(
            Statics.eventsNames.nodeChangedExternally,
            this.onNodeChanged,
            this
        );
    },

    onNodeChanged: function(nodes, config) {
        if(config.unmark || !nodes) return;
        var markedNode = nodes[0],
            name = DomUtils.getNameByNode(markedNode);
        if (name != 'component') return;
        var parentName = DomUtils.getNameByNode(
                            DomUtils.getFirstMarkedAncestor(markedNode.parentNode)
                        );
        // Ask for replacement with componentRef if component is not in a valid wrapper
        if (parentName != 'components' && parentName != 'collectionBody') {
            this.askForReplace(this.replaceComponentWithRef.bind(this, markedNode));
        }
    },

    askForReplace: function(callback) {
        Ext.Msg.confirm(AknMain.Strings.get('wrongComponentPos'),
                        AknMain.Strings.get('replaceComponentWithRef'),
            function(res) {
                if (res === 'yes' && callback)
                    callback();
            });
    },

    replaceComponentWithRef: function(node) {
        this.createComponentRef(node);
        var componentsNode = this.ensureComponentsNode();
        componentsNode.append(node);
    },

    createComponentRef: function(node) {
        var cmpRefNode = Ext.DomHelper.createDom({
            tag : 'span'
        });
        cmpRefNode.setAttribute(LangProp.attrPrefix+"src", '');
        cmpRefNode.setAttribute(LangProp.attrPrefix+"showAs", '');
        node.parentNode.insertBefore(cmpRefNode, node);
        this.application.fireEvent('markingRequest',
            DocProperties.getFirstButtonByName('componentRef'),
            {
                silent : true,
                noEvent : true,
                nodes : [cmpRefNode]
            }
        );
    },

    ensureComponentsNode: function() {
        var componentsNode = DocProperties.getMarkedElementsByName('components')[0];
        componentsNode = componentsNode && componentsNode.htmlElement;

        if ( !componentsNode ) {
            var documentEl = this.getController('Editor').getDocumentElement();
            componentsNode = Ext.DomHelper.createDom({
                tag : 'div',
                cls : DomUtils.tempParsingClass
            });
            documentEl.appendChild(componentsNode);
            this.application.fireEvent('markingRequest',
                DocProperties.getFirstButtonByName('components'),
                {
                    silent : true,
                    nodes : [componentsNode]
                }
            );
        }
        return componentsNode;
    }
});
