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

 Ext.define('LIME.controller.TocGeneratorController', {
    extend : 'Ext.app.Controller',

    refs : [
        {ref: 'generateTocButton', selector: '*[name=generateTocButton]'}
    ],

    config : {
        pluginName : "tocGenerator"
    },
    
    init : function() {
        var me = this;
        me.application.on(Statics.eventsNames.afterLoad, me.onDocumentLoaded, me);
        this.control({
            'editMenuButton menu': {
                show: function() {
                    var genTocBtn = this.getGenerateTocButton();

                    if ( Ext.isEmpty(DocProperties.getMarkedElementsByName(Language.getBodyName())) ) {
                        genTocBtn.disable();
                        genTocBtn.setTooltip(Locale.getString("noPreambleFound", this.getPluginName()));
                    } else {
                        genTocBtn.enable();
                        genTocBtn.setTooltip(Locale.getString("generateToc", this.getPluginName()));
                    }
                }
            }
        });
    },

    onDocumentLoaded : function(docConfig) {
        this.addMenuButton();
    },

    addMenuButton : function() {
        this.application.fireEvent("addMenuItem", this, {
            menu : "editMenuButton"
        }, menu = {
            text : Locale.getString("generateToc", this.getPluginName()),
            tooltip: Locale.getString("generateToc", this.getPluginName()),
            icon : 'resources/images/icons/lightbulb.png',
            name : 'generateTocButton',
            handler : Ext.bind(this.generateToc, this)
        });
    },

    generateToc: function() {
        var data;
        if ( DocProperties.getDocType() == 'documentCollection' ) {
            data = this.findTocDataFromNodeCollection(this.getController('Editor').getBody());
        } else {
            data = this.findTocDataFromNode(this.getController('Editor').getBody(), 4);
        }
        
        this.moveTocNodeToPreamble(this.markToc(data.filter(function(obj) {
            return obj.info;
        })));

    },

    findTocDataFromNodeCollection: function(root) {
        var body = root.querySelector('.collectionBody');

        return Ext.Array.toArray(body.querySelectorAll('.documentRef')).map(function(node) {
            var button = DomUtils.getButtonByElement(node);
            return {
                node: node,
                button: button,
                name: button.name,
                info: node.textContent,
                parents: 1
            }
        });
    },

    findTocDataFromNode: function(root, depth) {
        var me = this;
        depth = depth || 1;
        var nodes = Ext.Array.toArray(root.querySelectorAll('.hcontainer')).map(function(node) {
            var parents = DomUtils.getMarkedParents(node, function(pNode) {
                if ( root == pNode || (root.compareDocumentPosition(pNode) & Node.DOCUMENT_POSITION_CONTAINED_BY) ) {
                    return true;
                }
            });
            return {
                node: node,
                parents: parents.length
            };
            
        }).filter(function(obj) {
            return obj.parents <= depth;
        });
        
        return nodes.map(function(obj) {
            var button = DomUtils.getButtonByElement(obj.node);
            
            return Ext.merge(obj, {
                name: button.name,
                info: me.getNodeHeadingsInfo(obj.node)
            });
        });
    },

    getNodeHeadingsInfo: function(node) {
        var headings = Ext.Array.toArray(node.querySelectorAll('.num, .heading')).filter(function(child) {
            return child.parentNode == node;
        });
        return headings.reduce(function(prev, node, index) {
          return (index % 2) ? prev + ' - '+ node.textContent : prev + ' '+ node.textContent;
        }, "");
    },

    markToc: function(data) {
        var tocConfig = DocProperties.getFirstButtonByName('toc'),
            tocItemConfig = DocProperties.getChildConfigByName(DocProperties.getFirstButtonByName('toc'), 'tocItem'),
            tocItems = [],
            marker = this.getController("Marker");
        //console.log(data);
        var tocNode = Ext.DomHelper.createDom({
            tag : 'div',
            cls : DomUtils.tempParsingClass
        });

        data.forEach(function(tocItemObj) {
            var tocItemNode = Ext.DomHelper.createDom({
                tag : 'span',
                cls : DomUtils.tempParsingClass,
                html: tocItemObj.info
            });
            tocItemNode.setAttribute(Language.getAttributePrefix()+'level', tocItemObj.parents);
            tocItemNode.setAttribute(Language.getAttributePrefix()+'href', '#'+tocItemObj.node.getAttribute(DomUtils.elementIdAttribute));
            tocItems.push(tocItemNode);
            tocNode.appendChild(tocItemNode);
        });

        var body = DocProperties.getMarkedElementsByName(Language.getBodyName())[0].htmlElement;
        body.parentNode.insertBefore(tocNode, body);

        marker.autoWrap(tocItemConfig, {
            silent : true,
            noEvent : true,
            nodes: tocItems
        });
        marker.autoWrap(tocConfig, {
            nodes: [tocNode],
            scroll: true
        });

        return tocNode;
    },

    moveTocNodeToPreamble: function(node) {
        var preamble = DomUtils.getSiblingsFromNode(node).filter(function(node) {
            var button = DomUtils.getButtonByElement(node);

            return (button && button.name == 'preamble');
        })[0];

        if ( !preamble ) {
            preamble = Ext.DomHelper.createDom({
                tag : 'div',
                cls : DomUtils.tempParsingClass
            });
            node.parentNode.insertBefore(preamble, node);
            this.getController('Marker').autoWrap(DocProperties.getFirstButtonByName('preamble'), {
                silent : true,
                nodes: [preamble]
            });
        }

        preamble.appendChild(node);
    }
});