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

	views : ['MarkingMenu', 'markingmenu.TreeButton'],

	stores : ['LanguagesPlugin'],

	refs : [{
        selector : '[cls=markingMenuContainer]',
        ref : 'markingMenuContainer'
    },{
	    selector: 'appViewport',
	    ref: 'appViewport'
	}],

	/**
	 * @property {Object} buttonsReferences 
	 * An object which contains a reference to each button created. Useful
	 * to create sequenced unique ids.
	 */
	buttonsReferences : {},
	expandState : {},

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
		  root = this.getMarkingMenu().down('*[cls~=structure]'), 
		  rootElements = pluginData.markupMenuRules.rootElements,
		  commonElements = pluginData.markupMenuRules.commonElements,
		  common = this.getMarkingMenu().down('*[cls~=commons]'),
		  commonButtons = {},
		  levelsOrder = ['locale', 'docType', 'defaults'],
		  sortButtons = function(btn1, btn2) {
		      return btn1.waweConfig.name > btn2.waweConfig.name;
		  };
		  
	    this.buttonsReferences = {};
	    root.removeAll();
	    common.removeAll();
	    
	    for(var i=0; i<levelsOrder.length; i++) {
	        var level = levelsOrder[i];
	        if (pluginData[level] && pluginData[level].markupMenu) {
	           pluginData[level] = Utilities.mergeJson(pluginData[level], pluginData['language'], Utilities.beforeMerge);
	           pluginData.markupMenu = pluginData[level].markupMenu;
	           break;    
	        }
	    }
	    
	    // //Collapse all button in the markingMenu
            // markingMenu.collapseButtons();
            // //Delete all widgets
            // markingMenu.deleteAllWidgets();
		// Create and append each child
		Ext.each(rootElements, function(button) {
			root.add(me.createButton(button));
		}, this);
		Ext.each(commonElements, function(button) {
            common.add(me.createButton(button));
        }, this);
		/*Ext.each(commonElements, function(button) {
		    var newButton = me.createButton(button),
		        pattern  = newButton.waweConfig.pattern.pattern;
		    if (!commonButtons[pattern]) {
		        commonButtons[pattern] = [];
		    }
		    commonButtons[pattern].push(newButton);
        }, this);
        Ext.Object.each(commonButtons, function(key, value) {
            var sortedButtons = Ext.Array.sort(value, sortButtons);
            Ext.each(sortedButtons, function(button) {
                common.add(button);
            }, this);
        }, this);*/
	},

	/**
	 * This function instantiate a TreeButton with all of its children
	 * @param {String} name The name of the button (necessary to get the configuration before the instantiation)
	 */
	createButton : function(name) {
		var me = this, // Save the scope
			buttonConfig = null, buttonId = me.createNewButtonId(name), newButton = null, style;
		// Instantiate a new TreeButton
		try {
			buttonConfig = me.getButtonConfig(name);
		} catch(e) {
			Ext.log({level: "error"}, e);
			throw "Error: There is some error in the configuration of the plugin, the button with name " + name + " couldn't be initialized";
		}
		
		if (buttonConfig.pattern) {
		    style = buttonConfig.pattern.buttonStyle;
		} else {
		    style = buttonConfig.markupConfig.buttonStyle;
		}
		
		// Create the actual button
		newButton = Ext.widget('treeButton', {
			style : style,
			id : buttonId
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
			newButton.appendChild(me.createButton(child));
		});
		return newButton;
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
	
	getButtonsByName: function(name) {
	    return this.buttonsReferences[name];
	},
	
	getFirstButtonByName: function(name) {
	    var me = this, buttons = me.getButtonsByName(name);
        if (buttons) {
            return buttons[Ext.Object.getKeys(buttons)[0]];
        }
	    return null;
	},
	
	/**
	 * Return the custom configuration of a button taken from the
	 * language plugin currently in use.
	 * @param {String} name The name of the button
	 * @returns {Object} The configuration of the button
	 */
	getButtonConfig : function(name) {
		//Get plugin configuration from store
		var pluginData = this.getLanguagesPluginStore().getData(),
		//  If the button doesn't exist there must be some error in the configuration
		button = pluginData.markupMenu[name],
		defaultButton = pluginData.defaults.markupMenu[name],
		// Get global patterns from store
		patterns = pluginData.patterns, rules = pluginData.markupMenuRules,
		// Get the element's rule
		rule = rules.elements[name] || {},
		// Dinamically add the translated text
		label = (button.label) ? button.label : (defaultButton && defaultButton.label) ? defaultButton.label : name, 
		shortLabel = (button.shortLabel) ? button.shortLabel : (defaultButton && defaultButton.shortLabel) ? defaultButton.shortLabel : name,
		widget = null, pattern = null, config = null;

		// If specific configuration is not defined, get the default one
		if (!rule[Utilities.buttonFieldDefault]) {
			rule[Utilities.buttonFieldDefault] = rules.defaults;
		}
		//  Get the element's widget
		widget = (rule) ? Interpreters.parseWidget(rule) : null;
		if (button.pattern) {
		    pattern = Interpreters.parsePattern(name, patterns[button.pattern], (defaultButton) ? defaultButton : button);    
		}
		
		if(!button.buttonStyle && defaultButton) {
		    button.buttonStyle = defaultButton.buttonStyle;
		}
		
		//Create the configuration object
		config = {
			markupConfig : button,
			pattern : pattern,
			rules : rule,
			widgetConfig : widget,
			name : name,
			label : label,
			shortLabel : shortLabel
		};
		return config;
	},
	
	addMarkingMenu : function(pluginData) {
        var me = this, vp = this.getAppViewport(),
            markingMenu = vp.down('*[cls=markingMenuContainer]');
        if (markingMenu) {
            vp.remove(markingMenu);
        }
        this.application.fireEvent(Statics.eventsNames.beforeCreation, "MarkingMenu", vp.markingMenu, function(config) {
            vp.add(config);
            me.buildButtonsStructure(pluginData);
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
	expandButtons : function(node) {
		// If the selected node is the same as before don't do anything
		if(this.expandState && this.expandState.node == node){
			return;
		}else{
			if(!this.expandState){
				this.expandState = {};
			}
			this.expandState.node=node;
		}
		//  If the node is marked only hide the not interesting nodes!
		var markingMenu = this.getMarkingMenu(), 
			pluginData = this.getLanguagesPluginStore().getData(), 
			leaveExpanded = pluginData.markupMenuRules.defaults.leaveExpanded, 
			sameLevelExpand = pluginData.markupMenuRules.defaults.sameLevelExpand, 
			elementIdAttribute = DomUtils.elementIdAttribute, 
			markedElements = DocProperties.markedElements, 
			iterator = node, parentButton = null, 
			currentButton = null, 
			childWidgetsId = null,
			parentNode = null;
		// Hiding phase	
		if (!leaveExpanded){
				markingMenu.hideAll();
		}
		// Proceed only if the given node exists (it means it was marked)
		if (node) {
			var time1_s = new Date().getTime();
			// Get some hooks for the specific configuration to be used while iterating
			markingId = node.getAttribute(elementIdAttribute);
			// If there isn't a related button just don't do anything
			if (markedElements[markingId]) {
				relatedButton = markedElements[markingId].button || null;
				//TODO: is the same button remove only widgets
				/*if(this.expandState.button==relatedButton.id && this.expandState.markedParent==DomUtils.getFirstMarkedAncestor(node.parentNode)){
					var markedParent = DomUtils.getFirstMarkedAncestor(node.parentNode);
					if(this.expandState.markedParent!=markedParent){
						relatedButton.hideWidgets();
						this.expandState.markedParent = markedParent;
					}
					childWidgetsId = DomUtils.getMarkedChildrenId(iterator);
					markingId = iterator.getAttribute(DomUtils.elementIdAttribute);
					relatedButton.showWidget(markingId, true, childWidgetsId);
					return;
				}*/
				markingMenu.setActiveTab(relatedButton.up('*[cls~=buttonsContainer]'));
				
				this.expandState.button = relatedButton.id;
				parentButton = relatedButton.getParent();
				currentButton = relatedButton;
				// If this button is one of the common buttons
				if( currentButton.up('*[cls~=commons]')) {
				    currentButton.hideWidgets();
				    parentButton.showChildren();
				}
				// Iterate on both the button to expand and its children
				while (iterator && relatedButton) {
					// Get a list of the childen's ids in the dom
					childWidgetsId = DomUtils.getMarkedChildrenId(iterator);
					markingId = iterator.getAttribute(DomUtils.elementIdAttribute);
					currentButton = markedElements[markingId].button;
					// Showing phase
					if ((!sameLevelExpand && !currentButton.isDescendantOf(parentButton)) || currentButton == relatedButton || sameLevelExpand) {
						//  If we're on a button which is a sibling of the previously expanded button expand it depending on a config value
						currentButton.showChildren();
						//  Show also the children's widgets (children should be visible at this point)
						currentButton.showWidget(markingId, true, childWidgetsId);
					}
					parentButton = currentButton.getParent();
					parentNode = DomUtils.getFirstMarkedAncestor(iterator.parentNode);
					if (parent == iterator || !parent) {
						break;
					} else {
						iterator = parentNode;
					}
				}
				//this.expandState.markedParent=DomUtils.getFirstMarkedAncestor(node.parentNode);
			}
		}
		//For performance reason we call doLayout() just one time and not for each button
		markingMenu.updateLayout();
	},

	/**
	 * Collapse all the buttons.
	 */
	collapseButtons : function() {
		var markingMenu = this.getMarkingMenu();
		// To collapse all buttons we call the expandButtons method with no marked node
		markingMenu.hideAll();
	},

	/**
	 * Delete all the widgets built until now.
	 */
	deleteAllWidgets : function() {
		var cmp = this.getMarkingMenu();
		var buttons = cmp.query('treeButton');
		Ext.each(buttons, function(button) {
			button.deleteWidgets();
		}, this);
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
            if (config.sidebarsHidden) {
                cmp.collapse();
            } else {
                cmp.expand();
            }    
        }
    },
	//  --------------- Event Handlers -------------------

	// Initialization of the controller
	init : function() {

		// Set the event listeners
		this.application.on({
			editorDomNodeFocused : this.expandButtons,
			scope : this
		});
		this.application.on(Statics.eventsNames.languageLoaded, this.addMarkingMenu, this);
		this.application.on(Statics.eventsNames.disableEditing, this.disableMarkingMenu, this);
		this.application.on(Statics.eventsNames.enableEditing, this.enableMarkingMenu, this);
		this.application.on(Statics.eventsNames.changedEditorMode, this.onChangeEditorMode, this);
		
		// save a reference to the controller
		var editorController = this;

		this.control({
			'treeButtonName' : {
				click : function(cmp) {
					// Warn that a marking button has been clicked and say which one
					var button = cmp.up().up(), expander;
					if (button.waweConfig.pattern) {
					   this.application.fireEvent('markingMenuClicked', button);    
					} else { // This is just a container of buttons
					    expander = button.down("treeButtonExpander");
                       // Expand or collapse the children  
                        if (button.childrenShown) {
                            // Hide the children  
                            expander.hideChildren(true, button);
                            //This is for the view bug when the scrollbar disappears
                            expander.up("treeButton").updateLayout();
                        } else {
                            // Show the children  
                            expander.showChildren(button);
                        }
                        expander.updateLayout();				    
					}
				},
				afterrender : function(cmp) {
					var parent = cmp.up('treeButton');
					var styles;
					if (parent.waweConfig.pattern) {
					   styles = parent.waweConfig.pattern.styleObj;    
					} else {
					   styles = Utilities.cssToJson(parent.waweConfig.markupConfig.buttonStyle);
					}
					
					for (var i in styles) {
						cmp.btnInnerEl.setStyle(i, styles[i]);
					}
				}
			},
			'menuWidget field' : {
				focus : function(self) {
					var widget = self.up('menuWidget'),
						node;
					if(node = DocProperties.markedElements[widget.id]){
						this.application.fireEvent('nodeFocusedExternally', node.htmlElement, {
							highlight:true
						});
					}
				}
			},
			'menuWidget': {
                changedAttributes : function(config) {
                    var editorController = this.getController('Editor');
                    if (config && config.attributes) {
                        Ext.each(config.attributes, function(attribute) {
                            editorController.setElementAttribute(config.id, attribute.name, attribute.value);    
                        });
                    }
                }
			},
			'treeButtonExpander' : {
				afterrender : function(cmp) {
					//change expander color
					//cmp.btnInnerEl.setStyle("color","white");
				}
			},
			'treeButton textfield' : {
				change : function(field) {
					var value = field.getValue();
					var widget = field.up('form');
					//var editorController = this.getController('Editor');
					//check if field is a datefield and convert to the ISO format
					//if (field.xtype == "datefield") {
						/* WARNING: We don't want to convert the date in UTC since
						 * if the time is <= 00.00+GMT_hours the day counter could be decreased! */
				//		var newDate = Utilities.toISOString(value);

						//get only the date without time
						//newDate = newDate.substr(0, newDate.indexOf("T"));
						//value = newDate;
					//}
					// Set the actual value of the attribute
					//editorController.setElementAttribute(widget.id, field.name, value);
					widget.updateData(field, value, true);
				}
			}
		});
	}
});
