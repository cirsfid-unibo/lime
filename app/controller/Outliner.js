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
 * This controller takes care of managing the tree responsible for the visualization
 * of the current hierarchy of marked elements in the document. Through the related view
 * it is possible to interact with the visualized elements selecting, modifying or deleting them.
 */
Ext.define('LIME.controller.Outliner', {

    extend : 'Ext.app.Controller',

    views : ['Outliner'],

    refs : [{
        ref : 'outliner',
        selector : 'outliner'
    }, {
        ref : 'contextMenu',
        selector : 'contextMenu'
    }],
    
    iconBaseCls: 'explorer-icon', 

    /**
     * This function expands and selects the passed node.
     * @param {Ext.data.NodeInterface} node A reference the node that has to be expanded
     */
    expandItem : function(node) {
        var tree = this.getOutliner(), root, row;
        if (!tree || tree.isHidden()) return;
        root = tree.store.getRootNode();
        if (!node) {
            tree.getSelectionModel().select(root, false, true);
        };

        //Select me or the first ascendant node in the tree
        while (node && node.nodeType == DomUtils.nodeType.ELEMENT) {
            var internalId = node.getAttribute(DomUtils.elementIdAttribute);
            //if node is defined and have an elementid
            if (node && internalId) {
                //get the store node by id
                var storedNode = root.findChild('cls', internalId, true);
                if (storedNode) {
                    var iterateNode = storedNode;
                    //expand node and his ancestors
                    while (iterateNode && !iterateNode.isExpanded()) {
                        iterateNode.expand();
                        iterateNode = iterateNode.parentNode;
                    }
                    //select the node
                    tree.getSelectionModel().select(storedNode, false, true);
                    row = Ext.query('#'+tree.items.items[0].getRowId(storedNode));
                    if (row.length>0) {
                        row = Ext.get(row[0]);
                        row.scrollIntoView(tree.items.items[0].getEl(), false, true);
                    }
                    
                    break;
                }
            }
            node = node.parentNode;
        }
    },

    /**
     * This function converts an object that contains different type of nodes
     * in an structured object for the tree store that contains nodes that
     * @param {Object} data
     * @param {Object} [parent]
     * @param {Number} [pos]
     * @returns {Object[]/Object}
     */
    createTreeData : function(data, parent, pos) {
        var treeData = {},
            childs = [];
        if (data && data.el && data.el.nodeType == DomUtils.nodeType.ELEMENT) {
            var elementClass = data.el.getAttribute('class');
            var id = data.el.getAttribute(DomUtils.elementIdAttribute);
            if (id && DocProperties.markedElements[id]) {
                // Creating the icon and set the right class
                var button = DocProperties.markedElements[id].button;
                    wrapperClass = button.waweConfig.pattern.wrapperClass,
                    newIcon = '<div class="'+this.iconBaseCls+' ' + wrapperClass + '"></div>',
                    iconColor = button.waweConfig.pattern.styleObj["background-color"],
                    iconStyle = 'height: 12px; width: 12px; -moz-border-radius: 6px; border-radius: 6px; background-color: '+iconColor+'; display: inline-block; vertical-align:middle; margin-right: 5px; margin-bottom: 1px; border: 1px solid #6D6D6D;';
                // Adding explorer icon's style
                DomUtils.addStyle('*[class="'+ this.iconBaseCls+' '+ wrapperClass + '"]', iconStyle, document);

                if (elementClass) {
                    var classes = elementClass.split(" ");
                    var text = newIcon + classes[(classes.length - 1)];
                    //treeData.icon = Statics.treeIcon[classes[0]];
                    var info = DomUtils.getNodeExtraInfo(data.el, "hcontainer");
                    if (info) {
                        text += " (" + info + ")";
                    }
                    treeData.text = text;

                } else {
                    treeData.text = newIcon + id;
                }
                // treeData.id = id;
                treeData.cls = id;
            }
            if (data.children) {
                treeData.children = [];
                for (var i = 0; i < data.children.length; i++) {
                    var child = data.children[i];
                    if (child) {
                        if (!treeData.text && parent) {
                            Ext.Array.insert(parent.children, pos + i + 1, [child]);
                        } else {
                            var chdata = this.createTreeData(child, data, i);
                            if (chdata) {
                                treeData.children.push(chdata);
                            }
                        }
                    }
                }
            }
        }
        if (Ext.Object.getSize(treeData) != 0) {
            if (!treeData.text) {
                if (!parent)
                    return treeData.children;
                return null;
            } else if (treeData.children && treeData.children.length > 0) {
                treeData.expanded = true;
                treeData.leaf = false;
            } else {
                treeData.leaf = true;
            }
            return treeData;
        } else
            return null;
    },

    /**
     * Build the whole tree or a part of it depending
     * on the value of the config argument that can be one of the following:
     *
     * * "partial" : the tree is partially built only where the change takes place
     * * __anything else__ : the tree is completely rebuilt
     *
     * @param {Ext.data.NodeInterface} node The node the changes start from
     * @param {String} [config] What kind of change has to be made
     */
    buildTree : function(node, config) {
        var me = this,
            tree = Ext.getStore('Outliner'),
            treeView = this.getOutliner(),
            root = tree.getRootNode();

        if(!treeView) return;

        try {
            //convert to tree format json the node
            if (config != "partial" || DomUtils.getFirstMarkedAncestor(node.parentNode) == null) {
                var docClass = DocProperties.getDocClassList().split(" "), 
                    foundNode = Ext.query("."+docClass[(docClass.length-1)], true, node.ownerDocument)[0], 
                    rawData = DomUtils.xmlToJson(foundNode), 
                    data = this.createTreeData(rawData), wrapper;
                if (Ext.isArray(data)) {
                    wrapper = {
                        text : 'root',
                        children : data,
                        expanded: true
                    };
                } else {
                    wrapper = data;
                }
                treeView.setRootNode(wrapper);
            } else {
                var nodeIter = node;
                var nodeBuild = null;
                while (!nodeBuild && nodeIter && nodeIter.nodeType == DomUtils.nodeType.ELEMENT) {
                    var internalId = nodeIter.getAttribute(DomUtils.elementIdAttribute);
                    if (internalId) {
                        // search the node in the tree
                        if (root.findChild('cls', internalId, true)) {
                            nodeBuild = nodeIter;
                        }
                    }
                    nodeIter = nodeIter.parentNode;
                }
                var rawData;
                if (nodeBuild) {
                    rawData = DomUtils.xmlToJson(nodeBuild);
                } else {
                    rawData = DomUtils.xmlToJson(node);
                }
                var data = this.createTreeData(rawData, null, null);

                if (!Ext.isArray(data)) {
                    data = [data];
                }
                Ext.each(data, function(dataNode, index) {
                    var storedNode = root.findChild('cls', dataNode.cls, true);
                    // var storedNode = tree.getNodeById(dataNode.id);
                    if (!storedNode) {
                        //set the new root to the tree store
                        root.insertChild(index, dataNode);
                        root.set("leaf", false);
                        root.expand();
                    } else {
                        storedNode.parentNode.replaceChild(dataNode, storedNode);
                    }
                }, this);
            }
            treeView.getRootNode().expand();
        } catch(e) {
        }
    },

    onChangeEditorMode: function(config) {
        var cmp = this.getOutliner();
        if (config.sidebarsHidden) {
            cmp.collapse();
            //cmp.placeholder.tools[0].hide();
        } else {
            cmp.expand();
        }
    },

    // init the app
    init : function() {
        // Register for events
        this.application.on({
            editorDomChange : function(node, config) {
                try {
                    this.buildTree(node, config);   
                } catch(e) {
                    Ext.log({level: "error"}, e);
                }
            },
            editorDomNodeFocused : this.expandItem,
            scope : this
        });
        this.application.on(Statics.eventsNames.changedEditorMode, this.onChangeEditorMode, this);

        // set up the control
        this.control({
            'outliner' : {
                //on item click in the tree panel
                itemclick : function(view, rec, item, index, eventObj) {
                    var node = DocProperties.markedElements[rec.getData().cls];
                    if (node) {
                        this.application.fireEvent('nodeFocusedExternally', node.htmlElement, {
                            select : true,
                            scroll : true,
                            click : true
                        });
                    }
                },
                itemcontextmenu : function(view, rec, item, index, e, eOpts) {
                    var coordinates = [];
                    // Prevent the default context menu to show
                    e.preventDefault();
                    /*Fire an itemclick event to select the htmlNode in the editor*/
                    view.fireEvent('itemclick', view, rec, item, index, e, eOpts);
                    this.application.fireEvent(Statics.eventsNames.showContextMenu, e.getXY());
                }
            }
        });
    }
});
