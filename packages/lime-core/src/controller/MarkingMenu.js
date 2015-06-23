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

    extend : 'Ext.app.Controller',

    views : ['LIME.view.MarkingMenu'],

    refs : [{
        selector : '[cls=markingMenuContainer]',
        ref : 'markingMenuContainer'
    },{
        selector: 'appViewport',
        ref: 'appViewport'
    },{
        ref: 'secondEditor',
        selector: '#secondEditor mainEditor'
    }, {
        ref: 'treeButtonsStructure',
        selector: '#treeStructure'
    }, {
        ref: 'treeButtonsCommons',
        selector: '#treeCommons'
    }],

    /**
     * @property {Object} buttonsReferences
     * An object which contains a reference to each button created. Useful
     * to create sequenced unique ids.
     */
    buttonsReferences : {},
    expandState : {},
    styleId : 'limeTreeButtonsStyle',

    getMarkingMenu: function() {
        var container = this.getMarkingMenuContainer();
        if (container.is("markingMenu")) {
            return container;
        } else {
            return container.down("markingMenu");
        }
    },

    /**
     * Build the root of the marking buttons
     * based on a static configuration file
     * loaded at runtime by {@link LIME.store.LanguagesPlugin}
     */
    buildButtonsStructure : function(pluginData) {
        var me = this, // Save the scope,
            rootElements = pluginData.markupMenuRules.rootElements,
            commonElements = pluginData.markupMenuRules.commonElements,
            levelsOrder = ['locale', 'docType', 'defaults'],
            head = document.querySelector("head"),
            styleNode = head.querySelector('#'+me.styleId );

        if ( styleNode ) {
            head.removeChild(styleNode);
        }

        this.buttonsReferences = {};
        this.configReferences = {};
        DocProperties.clearElementConfig();

        for(var i=0; i<levelsOrder.length; i++) {
            var level = levelsOrder[i];
            if (pluginData[level] && pluginData[level].markupMenu) {
               pluginData[level] = Utilities.mergeJson(pluginData[level], pluginData['language'], Utilities.beforeMerge);
               pluginData.markupMenu = pluginData[level].markupMenu;
               break;
            }
        }

        var treeStructure = {
            text: 'Document structure',
            expanded: true,
            id: 'structure',
            children: []
        };

        var treeCommon = {
            text: 'Common elements',
            expanded: true,
            id: 'commons',
            children: []
        };


        // Create and append each child
        Ext.each(rootElements, function(button) {
            treeStructure.children.push(me.buildConfigData(button, false, false, false, "structure"));
        }, this);
        Ext.each(commonElements, function(button) {
            treeCommon.children.push(me.buildConfigData(button, false, false, false, "common"));
        }, this);

        me.getTreeButtonsStructure().getStore().setRootNode(treeStructure);
        me.getTreeButtonsCommons().getStore().setRootNode(treeCommon);

        this.application.fireEvent(Statics.eventsNames.markingMenuLoaded);
    },

    /**
     * This function instantiate a TreeButton with all of its children
     * @param {String} name The name of the button (necessary to get the configuration before the instantiation)
     */
    createButton : function(name, buttons, rules, scope) {
        var me = this, // Save the scope
            buttonConfig = null, buttonId = me.createNewButtonId(name), newButton = null, style;
        // Instantiate a new TreeButton
        try {
            buttonConfig = me.getButtonConfig(name, buttons, rules);
        } catch(e) {
            Ext.log({level: "error"}, e);
            throw "Error: There is some error in the configuration of the plugin, the button with name " + name + " couldn't be initialized";
        }

        // TODO: remove all style from marking menu
        // if (buttonConfig.pattern) {
        //     style = buttonConfig.pattern.buttonStyle;
        // } else {
        //     style = buttonConfig.markupConfig.buttonStyle;
        // }

        // Create the actual button
        newButton = Ext.widget('treeButton', {
            style : style,
            id : buttonId,
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

    buildConfigData : function(name, buttons, rules, scope, type) {
        var me = this,
            config = null, configId = me.createConfigId(name), newConfig = null, style;

        try {
            config = me.getButtonConfig(name, buttons, rules);
        } catch(e) {
            Ext.log({level: "error"}, e);
            throw "Error: There is some error in the configuration of the plugin, the button with name " + name + " couldn't be initialized";
        }

        // if (config.pattern) {
        //     style = config.pattern.buttonStyle;
        // } else {
        //     style = config.markupConfig.buttonStyle;
        // }

        newConfig = Ext.merge(config, {
            type: type,
            style : style,
            id : configId,
            handlerScope: scope,
            children: []
        });

        // If it has children do not show as a leaf
        newConfig.leaf = (newConfig.rules.children) ? false : true;

        // In the end create its children
        Ext.each(newConfig.rules.children, function(child) {
            newConfig.children.push(me.buildConfigData(child, buttons, rules, scope, type));
        });

        // TODO: remove all style from marking menu tree
        // if ( Ext.Object.isEmpty(me.configReferences[name]) ) {
        //     if(style) {
        //         DomUtils.addStyle('.x-tree-custom *[class~="'+ name + '"] .x-tree-node-text ', style, document, me.styleId);
        //     }
        // }

        DocProperties.setElementConfig(configId, newConfig);
        me.configReferences[name][configId] = newConfig;


        return {
            text: newConfig.label,
            cls: name+' '+configId,
            name: name,
            id: configId,
            leaf: newConfig.leaf,
            children: (newConfig.children.length) ? newConfig.children : undefined
        };
    },

    /**
     * Create a unique id for a specific button (specified by its name)
     * @param {String} name The name of the button.
     * @returns {String} The computed id
     */
    createNewButtonId : function(name) {
        var count = 0;
        if (!this.buttonsReferences[name]) {
            this.buttonsReferences[name] = {};
        }
        for (var i in this.buttonsReferences[name]) {
            count++;
        }
        return name + count;
    },

    createConfigId : function(name) {
        var count = 0;
        if (!this.configReferences[name]) {
            this.configReferences[name] = {};
        }
        for (var i in this.configReferences[name]) {
            count++;
        }
        return name + count;
    },

    getButtonsByName: function(name) {
        return this.buttonsReferences[name];
    },

    /**
     * Return the custom configuration of a button taken from the
     * language plugin currently in use.
     * @param {String} name The name of the button
     * @returns {Object} The configuration of the button
     */
    getButtonConfig : function(name, buttons, rules) {
        //Get plugin configuration from store
        var pluginData = this.getStore('LanguagesPlugin').getConfigData(),
        //  If the button doesn't exist there must be some error in the configuration
        button = (buttons && buttons[name]) ? buttons[name] : pluginData.markupMenu[name],
        defaultButton = pluginData.defaults.markupMenu[name],
        // Get global patterns from store
        patterns = pluginData.patterns,
        rules = (rules && rules.elements[name]) ? rules : pluginData.markupMenuRules,
        // Get the element's rule
        rule = rules.elements[name] || pluginData.markupMenuRules[name] || {},
        // Dinamically add the translated text
        label = (button.label) ? button.label : (defaultButton && defaultButton.label) ? defaultButton.label : name,
        shortLabel = (button.shortLabel) ? button.shortLabel : (defaultButton && defaultButton.shortLabel) ? defaultButton.shortLabel : name,
        widget = null, pattern = null, config = null;
        // If specific configuration is not defined, get the default one
        if (!rule[Utilities.buttonFieldDefault]) {
            rule[Utilities.buttonFieldDefault] = rules.defaults;
        }
        
        if (button.pattern) {
            pattern = Interpreters.parsePattern(name, patterns[button.pattern], (defaultButton) ? defaultButton : button);
        }

        if(!button.buttonStyle && defaultButton) {
            button.buttonStyle = defaultButton.buttonStyle;
        }
        
        //  Get the element's widget
        widget = (rule) ? Interpreters.parseWidget(rule) : null;
        if(widget) {
            DocProperties.setElementWidget(name, widget);
        }
        
        //Create the configuration object
        config = {
            markupConfig : button,
            pattern : pattern,
            rules : rule,
            name : name,
            label : label,
            shortLabel : shortLabel,
            customHandler: button.handler,
            markAsButton: button.markAsButton
        };
        return config;
    },

    /* Return the list of all buttons */
    getAllButtons : function() {
        var refs = this.buttonsReferences;
            buttons = [];
        for (var k in refs)
            if (refs.hasOwnProperty(k))
                if(refs[k].hasOwnProperty(k + '0'))
                    buttons.push(refs[k][k + '0']);
        return buttons;
    },

    addMarkingMenu : function(pluginData) {
        var me = this, vp = this.getAppViewport(),
            markingMenu = vp.down('*[cls=markingMenuContainer]'),
            secondEditor = this.getSecondEditor(),
            collapsed;
        if (markingMenu) {
            collapsed = markingMenu.collapsed;
        }
        this.application.fireEvent(Statics.eventsNames.beforeCreation, "MarkingMenu", vp.markingMenu, function(config) {
            if(!markingMenu) {
                //TODO: check this when secondEditor exists
                /*if(markingMenu) {
                    vp.remove(markingMenu, true);   
                }*/
                vp.add(Ext.merge(config, {
                    collapsed: collapsed
                }));
            }
            me.buildButtonsStructure(pluginData);
        });
    },

    updateTreeView : function(tree, fn) {
        var view = tree.getView();
        view.getStore().loadRecords(fn(tree.getRootNode()));
        view.refresh();
    },

    collapseAll : function(tree) {
        this.updateTreeView(tree, function(root) {
            root.cascadeBy(function(node) {
                if (!node.isRoot() || tree.rootVisible) {
                    node.data.expanded = false;
                }
            });
            return tree.rootVisible ? [root] : root.childNodes;
        });
    },

    getFirstTreeButtonByNameAndType : function(name, type) {
        var buttonData = Ext.Object.getValues(this.configReferences[name]).filter(function(data) {
                        return data.type == type;
                      })[0];
        if (buttonData) {
            return this.getTreeButton(buttonData.id);
        }
        return null;
    },

    /**
     * This function expands the buttons based on the selected
     * node in the editor. If no arguments are given all the buttons
     * will be collapsed depending on the value of the __leaveExpanded__ property
     * specified in the configuration files.
     * @param {HTMLElement} node The node which the expansion must start from
     *
     */
    expandButtons : function(node) {
        var me = this, markingMenu = this.getMarkingMenu(), markingId, relatedButton;
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
                var name = DomUtils.getElementNameByNode(node);
                var commonButton = me.getFirstTreeButtonByNameAndType(name, "common");
                if ( commonButton ) {
                    treePanel = commonButton.getOwnerTree();
                    pathToExpand = commonButton.getPath();
                } else {
                    pathToExpand = relatedButton.getPath();
                }
            }
            if ( me.expandedTree && me.expandedPath && me.expandedPath != pathToExpand ) {
                me.collapseAll(me.expandedTree);
            }

            if ( !treePanel.isDisabled() ) {
                markingMenu.setActiveTab(treePanel);
                if ( treePanel &&  pathToExpand && me.expandedPath != pathToExpand ) {
                    treePanel.expandPath(pathToExpand);
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
        return this.getTreeButtonsStructure().getStore().getNodeById(id) || 
               this.getTreeButtonsCommons().getStore().getNodeById(id);
    },

    /**
     * Collapse all the buttons.
     */
    collapseButtons : function() {
        var markingMenu = this.getMarkingMenu();
        // To collapse all buttons we call the expandButtons method with no marked node
        markingMenu.hideAll();
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
    onChangeEditorMode: function(config) {
        var vp = this.getAppViewport(),
            cmp = vp.down('*[cls=markingMenuContainer]');
        if(cmp) {
            if (config.sidebarsHidden && !config.markingMenu) {
                cmp.collapse();
            } else {
                cmp.expand();
            }
        }
    },

    //TODO: finish this function
    addMarkingGroup: function(config) {
        var me = this, markingMenu = me.getMarkingMenu(),
            newTab;
        if(!markingMenu.down("*[name="+config.name+"]")) {
            newTab = markingMenu.add({
                xtype : 'panel',
                title : config.title,
                border : false,
                autoScroll : true,
                name: config.name,
                cls: 'buttonsContainer '+config.name
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
                    var match = (child.data.cls) ? child.data.cls.match('\\b' + refItem + '\\b') : false;
                    return (match && match.length) ? true : false;
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

    setCustomMarkingHandler: function(config) {
        var  me = this, button = DocProperties.getFirstButtonByName(config.button);
        if(button) {
            button.handlerScope = config.scope;
            switch(config.handlerType) {
                case "before":
                    button.beforeMarking = config.handler;
                    break;
                case "after":
                    button.afterMarking = config.handler;
                    break;
                case "replace":
                    button.customHandler = config.handler;
                    break;
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
    }, 

    //  --------------- Event Handlers -------------------

    // Initialization of the controller
    init : function() {
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
        app.on(Statics.eventsNames.languageLoaded, this.addMarkingMenu, this);
        app.on(Statics.eventsNames.disableEditing, this.disableMarkingMenu, this);
        app.on(Statics.eventsNames.enableEditing, this.enableMarkingMenu, this);
        app.on(Statics.eventsNames.changedEditorMode, this.onChangeEditorMode, this);
        app.on(Statics.eventsNames.addMarkingGroup, this.addMarkingGroup, this);
        app.on(Statics.eventsNames.addMarkingButton, this.addMarkingButton, this);
        app.on(Statics.eventsNames.setCustomMarkingHandler, this.setCustomMarkingHandler, this);
        app.on(Statics.eventsNames.unfocusedNodes, function() {
            this.expandButtons();
        }, this);

        this.control({
            '#treeStructure, #treeCommons': {
                // Warn that a marking button has been clicked and say which one
                itemclick : function(view, treeNode) {
                    var id = treeNode.getData().id;
                    var config = DocProperties.getElementConfig(id), aliasButton;
                    var afterMarking = (Ext.isFunction(config.afterMarking)) ?
                                       Ext.bind(config.afterMarking, config.handlerScope) : undefined;

                    Ext.callback(config.beforeMarking, config.handlerScope, [config]);

                    if(me.getController("Editor").getMain().getActiveTab().cls != "editor") {
                        return;
                    }

                    if (Ext.isFunction(config.customHandler)) {
                        if(config.markAsButton) {
                            aliasButton = DocProperties.getFirstButtonByName(config.markAsButton);
                            this.application.fireEvent('markingMenuClicked', aliasButton, {
                                callback : Ext.bind(config.customHandler, config.handlerScope, [config], true)
                            });
                        } else {
                            Ext.callback(config.customHandler, config.handlerScope, [config]);
                        }
                    } else if (config.pattern) {
                        this.application.fireEvent('markingMenuClicked', config, {
                            callback : afterMarking
                        });
                    } else {
                        if( treeNode.isExpanded() ) {
                            treeNode.collapse();
                        } else {
                            treeNode.expand();
                        }
                    }
                }
            }
        });
    }
});
