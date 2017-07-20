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
 * This controller contains the logic of the interaction
 * between the editor and the buttons used to mark the document
 * (and vice versa). Each button marks a specific kind of elements
 * and thus has to be treated in a consistent way. The whole set of buttons
 * is loaded (and rendered) asynchronously so that each one of them is
 * completely customizable before the runtime. If, for some reason, one or more
 * buttons couldn't be loaded/rendered an error message will appear in the console
 * (if debug mode is enabled with the `debug=yes` parameter in the URL).
 */
Ext.define('LIME.controller.MarkingMenu', {

    extend: 'Ext.app.Controller',

    views: ['LIME.view.MarkingMenu'],

    refs: [
        { ref: 'markingMenuContainer', selector: '[cls=markingMenuContainer]' },
        { ref: 'markingMenu', selector: 'markingMenu' },
        { ref: 'mainTab',              selector: 'main' },
        { ref: 'secondEditor',         selector: '#secondEditor mainEditor' },
        { ref: 'treeButtons', selector: '#markingTreeRootButtons' }
    ],

    /**
     * @property {Object} buttonsReferences
     * An object which contains a reference to each button created. Useful
     * to create sequenced unique ids.
     */
    buttonsReferences: {},
    expandState: {},

    init: function() {
        // save a reference to the controller
        var me = this, app = me.application;


        // Set the event listeners
        app.on(Statics.eventsNames.editorDomNodeFocused, function(node, config) {
            if ( !config || !config.noExpandButtons ) {
                try {
                    this.expandButtons(node);
                } catch(e) {
                    Ext.log({level: "error"}, 'MarkingMenu expandButtons: '+e);
                }
            }
        }, this);
        app.on(Statics.eventsNames.languageLoaded, this.buildButtonsStructure, this);
        app.on(Statics.eventsNames.disableEditing, this.disableMarkingMenu, this);
        app.on(Statics.eventsNames.enableEditing, this.enableMarkingMenu, this);
        app.on(Statics.eventsNames.addMarkingButton, this.addMarkingButton, this);
        app.on(Statics.eventsNames.unfocusedNodes, this.expandButtons, this);

        // Add mark menu item, calling directly because the event is not catched
        // if fired in this init
        this.getController('ContextMenu').registerContextMenuBeforeShow(me.addMarkContextMenu.bind(me));
    },

    addMarkContextMenu: function(menu, node) {
        var me = this;
        var selectedContent = me.getController('Editor').getSelectionContent();
        if (!node || selectedContent.length === 0) return;
        var button = DocProperties.getFirstButtonByName(DomUtils.getNameByNode(node));
        if (!button || Ext.isEmpty(button.children)) return;

        var makeMarkItem = function(button) {
            return {
                text: button.text,
                handler: function() {
                    LIME.app.fireEvent('markingMenuClicked', DocProperties.getElementConfig(button.id));
                }
            }
        }

        menu.add({
            text: Locale.getString('Mark'), //TODO: localize
            menu: {
                items: button.children.map(makeMarkItem)
            }
        });
    },
    /**
     * Build the root of the marking buttons
     * based on a static configuration file
     */
    buildButtonsStructure: function(pluginData) {
        this.buttonsReferences = {};
        this.configReferences = {};
        DocProperties.clearElementConfig();
        this.setTreePanelData(pluginData);
        this.application.fireEvent(Statics.eventsNames.markingMenuLoaded);
    },

    setTreePanelData: function(config) {
        var me = this;
        var rootElements = config.markupMenuRules.rootElements;
        var treeData = {
            expanded: true,
            id: 'rootButtons',
            children: []
        };
        // Create and append each child
        Ext.each(rootElements, function(button) {
            treeData.children.push(me.buildConfigData(button, false, false, false, 'rootButtons'));
        }, this);

        var treeCmp = me.getTreeButtons();
        if (treeCmp)
            treeCmp.getStore().setRootNode(treeData);
    },

    /**
     * This function instantiate a TreeButton with all of its children
     * @param {String} name The name of the button (necessary to get the configuration before the instantiation)
     */
    createButton: function(name, buttons, rules, scope) {
        var me = this, // Save the scope
            buttonConfig = null, buttonId = me.createNewButtonId(name), newButton = null, style;
        // Instantiate a new TreeButton
        try {
            buttonConfig = me.getButtonConfig(name, buttons, rules);
        } catch(e) {
            Ext.log({level: "error"}, e);
            throw "Error: There is some error in the configuration of the plugin, the button with name " + name + " couldn't be initialized";
        }

        // Create the actual button
        newButton = Ext.widget('treeButton', {
            style: style,
            id: buttonId,
            name: name,
            customHandler: buttonConfig.customHandler,
            handlerScope: scope
        }),
        // Set the custom configuration
        newButton.waweConfig = buttonConfig;
        // Customize the button
        var nameButton = newButton.down('treeButtonName'),
            pluginChildren = newButton.waweConfig.rules.children,
            labelTxt = newButton.waweConfig.label;

        // Set the button name
        nameButton.setText(labelTxt);

        // Set an internal reference for further elaboration
        me.buttonsReferences[name][buttonId] = newButton;

        // If it has children do not show as a leaf
        if (pluginChildren) {
            newButton.setLeaf(false);
        } else {
            newButton.setLeaf(true);
        }
        // In the end create its children
        Ext.each(pluginChildren, function(child) {
            newButton.appendChild(me.createButton(child, buttons, rules, scope));
        });
        return newButton;
    },

    buildConfigData: function(name, buttons, rules, scope, type) {
        var me = this,
            config = null, configId = me.createConfigId(name), newConfig = null, style;

        try {
            config = me.getButtonConfig(name, buttons, rules);
        } catch(e) {
            Ext.log({level: "error"}, e);
            throw "Error: There is some error in the configuration of the plugin, the button with name " + name + " couldn't be initialized";
        }

        newConfig = Ext.merge(config, {
            type: type,
            style: style,
            id: configId,
            handlerScope: scope,
            children: []
        });

        // If it has children do not show as a leaf
        newConfig.leaf = (newConfig.rules.children) ? false: true;

        // In the end create its children
        Ext.each(newConfig.rules.children, function(child) {
            newConfig.children.push(me.buildConfigData(child, buttons, rules, scope, type));
        });

        DocProperties.setElementConfig(configId, newConfig);
        me.configReferences[name][configId] = newConfig;


        return {
            text: newConfig.label,
            cls: name+' '+configId,
            name: name,
            id: configId,
            leaf: newConfig.leaf,
            children: (newConfig.children.length) ? newConfig.children: undefined
        };
    },

    /**
     * Create a unique id for a specific button (specified by its name)
     * @param {String} name The name of the button.
     * @returns {String} The computed id
     */
    createNewButtonId: function(name) {
        var count = 0;
        if (!this.buttonsReferences[name]) {
            this.buttonsReferences[name] = {};
        }
        for (var i in this.buttonsReferences[name]) {
            count++;
        }
        return name + count;
    },

    createConfigId: function(name) {
        var count = 0;
        if (!this.configReferences[name]) {
            this.configReferences[name] = {};
        }
        for (var i in this.configReferences[name]) {
            count++;
        }
        return name + count;
    },

    /**
     * Return the custom configuration of a button taken from the
     * language plugin currently in use.
     * @param {String} name The name of the button
     * @returns {Object} The configuration of the button
     */
    getButtonConfig: function(name, buttons, rules) {
        //Get plugin configuration from store
        var pluginData = this.getStore('LanguagesPlugin').getConfigData(),
        //  If the button doesn't exist there must be some error in the configuration
        button = (buttons && buttons[name]) ? buttons[name]: pluginData.markupMenu[name],
        // Get global patterns from store
        patterns = pluginData.patterns,
        rules = (rules && rules.elements[name]) ? rules: pluginData.markupMenuRules,
        // Get the element's rule
        rule = rules.elements[name] || pluginData.markupMenuRules[name] || {},
        // Dinamically add the translated text
        label = (button.label) ? button.label: name,
        shortLabel = (button.shortLabel) ? button.shortLabel: name,
        widget = null, pattern = null, config = null;
        // If specific configuration is not defined, get the default one
        if (!rule[Utilities.buttonFieldDefault]) {
            rule[Utilities.buttonFieldDefault] = rules.defaults;
        }

        if (button.pattern)
            pattern = Interpreters.parsePattern(name, patterns[button.pattern], button);

        //  Get the element's widget
        widget = (rule) ? Interpreters.parseWidget(rule): null;
        if(widget) {
            DocProperties.setElementWidget(name, widget);
        }

        //Create the configuration object
        config = {
            markupConfig: button,
            pattern: pattern,
            rules: rule,
            name: name,
            label: label,
            shortLabel: shortLabel,
            customHandler: button.handler,
            markAsButton: button.markAsButton
        };
        return config;
    },

    updateTreeView: function(tree, fn) {
        var view = tree.getView();
        view.getStore().loadRecords(fn(tree.getRootNode()));
        view.refresh();
    },

    collapseAll: function(tree) {
        this.updateTreeView(tree, function(root) {
            root.cascadeBy(function(node) {
                if (!node.isRoot() || tree.rootVisible) {
                    node.data.expanded = false;
                }
            });
            return tree.rootVisible ? [root]: root.childNodes;
        });
    },

    /**
     * This function expands the buttons based on the selected
     * node in the editor. If no arguments are given all the buttons
     * will be collapsed depending on the value of the __leaveExpanded__ property
     * specified in the configuration files.
     * @param {HTMLElement} node The node which the expansion must start from
     *
     */
    expandButtons: function(node) {
        var me = this, markingMenu = this.getMarkingMenu(), markingId, relatedButton;
        if (!markingMenu) return;
        Ext.suspendLayouts();
        if ( node ) {
            markingId = node.getAttribute(DomUtils.elementIdAttribute);
            relatedButton = me.getTreeButton(DomUtils.getButtonIdByElementId(markingId));
        }

        // Proceed only if the given node exists (it means it was marked)
        if ( node && markingId && relatedButton ) {
            var buttonPath = relatedButton.getPath().split('/').slice(2);
            var nodesPath = Ext.Array.push(node, DomUtils.getMarkedParents(node));
            nodesPath = nodesPath.map(function(el) {
                return DomUtils.getButtonIdByElementId(el.getAttribute(DomUtils.elementIdAttribute));
            }).reverse();
            var treePanel = relatedButton.getOwnerTree();
            var pathToExpand;
            if ( buttonPath[0] == nodesPath[0] ) {
                pathToExpand = relatedButton.getPath();
            } else {
                // Expand only buttons in the markingTreeRootButtons tree
                for (var i = nodesPath.length-1; i >= 0; i--) {
                    var btn = me.getTreeButton(nodesPath[i]),
                        tree = btn.getOwnerTree();
                    if (btn && tree.id == 'markingTreeRootButtons') {
                        treePanel = tree;
                        pathToExpand = btn.getPath();
                        break;
                    }
                }
            }
            if ( me.expandedTree && me.expandedPath && me.expandedPath != pathToExpand ) {
                me.collapseAll(me.expandedTree);
            }

            if ( !treePanel.isDisabled() ) {
                markingMenu.setActiveTab(treePanel);
                if ( treePanel &&  pathToExpand && me.expandedPath != pathToExpand ) {
                    treePanel.expandPath(pathToExpand, false, true);
                    me.expandedTree = treePanel;
                    me.expandedPath = pathToExpand;
                }
            }
        } else {
            if ( me.expandedTree ) {
                me.collapseAll(me.expandedTree);
                me.expandedPath = null;
            }
        }
        Ext.resumeLayouts(true);
    },

    getTreeButton: function(id) {
        return this.getMarkingMenu().query('markingTreePanel')
            .map(function(treePanel) {
                return treePanel.getStore().getNodeById(id);
            })[0];
    },

    disableMarkingMenu: function() {
        var cmp = this.getMarkingMenu();
        if(cmp) {
            Ext.each(cmp.items.items, function(item) {
               item.disable();
            });
        }
    },

    enableMarkingMenu: function() {
        var cmp = this.getMarkingMenu();
        if(cmp) {
            Ext.each(cmp.items.items, function(item) {
               item.enable();
            });
        }
    },

    addMarkingButton: function(config) {
        var me = this, markingMenu = me.getMarkingMenu(),
            group = me.getTreeButton(config.group),
            refItem = config.before || config.after,
            configId = me.createConfigId(config.name);

        if(group && !me.getTreeButton(configId)) {
            var configButton = me.buildConfigData(config.name, config.buttons, config.rules, config.scope);
            if (refItem) {
                var refButton = group.findChildBy(function(child) {
                    var match = (child.data.cls) ? child.data.cls.match('\\b' + refItem + '\\b'): false;
                    return (match && match.length) ? true: false;
                }, me, true);
                if(refButton) {
                    if ( config.after && refButton.nextSibling ) {
                        refButton.parentNode.insertBefore(configButton, refButton.nextSibling);
                    } else if ( config.after ) {
                        refButton.parentNode.appendChild(configButton);
                    } else {
                        refButton.parentNode.insertBefore(configButton, refButton);
                    }
                } else {
                    group.appendChild(configButton);
                }
            } else {
                group.appendChild(configButton);
            }
        }
    },

    filterTreeByFn: function(tree, fn) {
        if ( !Ext.isFunction(fn) ) return;
        this.clearTreeFilter(tree);

        var view = tree.getView(),
        me = tree,
        nodesAndParents = [];

        // Find the nodes which match the search term, expand them.
        // Then add them and their parents to nodesAndParents.
        me.getRootNode().cascadeBy(function(tree, view){
            var currNode = this;

            if( currNode && fn(currNode) ) {
                me.expandPath(currNode.getPath());

                while(currNode.parentNode) {
                    nodesAndParents.push(currNode.id);
                    currNode = currNode.parentNode;
                }
            }
        }, null, [me, view]);

        // Hide all of the nodes which aren't in nodesAndParents
        me.getRootNode().cascadeBy(function(tree, view) {
            var uiNode = view.getNodeByRecord(this);

            if(uiNode && !Ext.Array.contains(nodesAndParents, this.id)) {
                Ext.fly(uiNode).setDisplayed('none');
            }
        }, null, [me, view]);
    },

    clearTreeFilter: function( tree ) {
        var view = tree.getView();

        tree.getRootNode().cascadeBy(function(tree, view) {
            var uiNode = view.getNodeByRecord(this);

            if(uiNode) {
                Ext.fly(uiNode).setDisplayed('table-row');
            }
        }, null, [tree, view]);
    }
});
