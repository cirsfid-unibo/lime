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
 *Own implementation of tree buttons. 
 */
Ext.define('LIME.view.markingmenu.TreeButton', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.treeButton',
	
	requires : ['LIME.view.markingmenu.treebutton.Expander',
				'LIME.view.markingmenu.treebutton.Name', 
				'LIME.view.markingmenu.treebutton.Children',
				'LIME.view.markingmenu.treebutton.Widgets',
				'LIME.view.markingmenu.menuwidgets.MenuWidget'],

	border :  false,
	margin:"4 2 4 2",
	width : 'auto',
	height : 'auto',
	
	bodyCls :'x-docked-noborder-top', // DEBUG CSS no borders  
	
	tbar : {
		baseCls : 'toolbarTreeButton',
		items : [{
			xtype : 'treeButtonExpander'
		}, {
			xtype : 'treeButtonName',
			flex:1
		}]
	},
	
	
	items : [{
		// Wrapper for the children, for performance purpose
		xtype : 'treeButtonChildren',
		// Hidden by default
		hidden : true
	},{
		// Wrapper for the widgets
		xtype : 'treeButtonWidgets'
	}],
	
	
	/* The tree structure has to be handled from Ext, not external CSS! */
	listeners : {
		beforerender : function(self){
			// If is a child  
			if (self.up('treeButton')){
				self.style = {
					marginLeft : '15px'
				}
			}
		}
	},
	
	
	constructor : function(){
		/**
		 *@property {Boolean}  childrenShown if True children are shown otherwise are hidden
		 */
		this.childrenShown = false;
		/**
		 *@property {Boolean}  leaf if True button hasn't childrenherwise are hidden
		 */	 
		this.leaf = true;
		this.callParent(arguments);
	},
	
	/**
	 * Append a child into the children container
	 * @param {LIME.view.markingmenu.TreeButton} child The child to append 
	 */
	appendChild : function(child){
		this.down('treeButtonChildren').add(child);
	},
	
	
	/**
	 * Set this button as a leaf
	 * @param {Boolean} value True if is a leaf 
	 */
	setLeaf : function(value){
		var expander = this.getExpander();
		// If is a leaf manipulate the expand button
		if (value){
			// Align center
			expander.collapsedText = expander.leafText;
			expander.expandedText = expander.leafText;
			expander.setText(expander.leafText);
			expander.disable();
		} else {
			expander.setText(expander.collapsedText);
			// But what if the children are already visible (expanded)?
			if (this.getChildrenContainer().isVisible()){
				expander.setText(expander.expandedText);
			}
		}
	},
	
	/**
	 * This function returns a reference to the treeButtonName
	 * @returns {String} This TreeButton's TreeButtonName
	 */
	getName : function(){
		var tbar = this.dockedItems.items[0].items.items;
		for (var i in tbar){
			if (tbar[i].xtype == 'treeButtonName') return tbar[i];
		}
		return null;
	},
	
	/**
	 * This function returns a reference to the treeButtonExpander 
	 * @returns {LIME.view.markingmenu.treebutton.Expander} This TreeButton's Expander
	 */
	getExpander : function(){
		var tbar = this.dockedItems.items[0].items.items;
		for (var i in tbar){
			if (tbar[i].xtype == 'treeButtonExpander') return tbar[i];
		}
		return null;
	},
	
	/**
	 * This function returns a reference to the widget container 
	 * @returns {LIME.view.markingmenu.treebutton.Widgets} This TreeButton's widgets container
	 */
	getWidgets : function(){
		return this.down("treeButtonWidgets");
	},
	
	/**
	 * Returns a particular widget belonging to this button or to one of its children
	 * @param {String} id The id of the widget
	 * @returns {LIME.markingmenu.menuwidgets.MenuWidget} A reference to the widget or null if no widgets were found
	 */
	getWidget : function(id, children){
		var widget = this.queryById(id);
		return widget;
	},
	
	/**
	 * This function returns a reference to the children container 
	 * @returns {LIME.view.markingmenu.treebutton.Children} This TreeButton's Children
	 */
	getChildrenContainer : function(){
		var children = this.items.items;
		// Use a simple iteration for efficiency reasons  
		for (var i in children){
			if (children[i].xtype == 'treeButtonChildren') return children[i];
		}
		return null;
	},
	
	
	/**
	 * This function returns a list of the TreeButton children
	 * (comfortable for iteration)
	 * @param {function} filter The filter function
	 * @returns {LIME.view.markingmenu.TreeButton[]} List of his children
	 */
	getChildren : function(filter){
		var children = this.getChildrenContainer().items.items;
		var toReturn = [];
		for (var child in children){
			if(!filter || !Ext.isFunction(filter) || filter(children[child])){
				toReturn.push(children[child]);
			}
		}
		return toReturn;
	},
	
	/**
	 *This function returns an object containing the ascendants  
	 * @return {Object} 
	 */
	getAscendants : function(){
		var ascendants = {};
		var ascendant = this.getParent();
		while (ascendant){
			ascendants[ascendant.getName().text] = true;
			ascendant = ascendant.getParent();
		}
		return ascendants;
	},
	
	/**
	 * This function returns the parent TreeButton  
	 * @return {LIME.view.markingmenu.TreeButton}
	 */
	getParent : function(){
		var parent = this.up('treeButton');
		return parent;
	},
	
	/**
	 * This function returns true if hascendant is a real ascendant 
	 * @param {LIME.view.markingmenu.TreeButton} hascendant look for hascendant in the ascendants
	 * @return {Boolean}
	 */
	isDescendantOf : function(hascendant){
		if (!hascendant || hascendant == this) return false;
		var parent = this.getParent();
		while(parent && parent!=hascendant){
			parent = parent.getParent();
		}
		return parent==hascendant;
	},
	
	
	/**
	 * This function expands the list of the children buttons 
	 * @param {Boolean} animate
	 */
	showChildren : function(animate){
		var expander = this.down('treeButtonExpander');
		if (expander) {
		  expander.showChildren(this, animate);
		}
	},
	
	
	/**
	 * This function collapses the list of the children buttons
	 * if noWidgets is true widgets are not being hidden! 
	 * @param {Boolean} animate
	 */
	hideChildren : function(animate){
		var expander = this.down('treeButtonExpander');
		if (expander) {
		  expander.hideChildren(false, this, animate);    
		}
	},
	
	/**

	 * This function shows the widget related to this button.
	 * If highlight is true the shown widget is highlighted.
	 * If childWidgets is set this function looks for children's
	 * widgets and show them (even if the children are not visible).
	 * It's useful for nested marked elements with widgets.
	 * @param {String} widgetId The widget to show
	 * @param {Boolean} [highlight]
	 * @param {String[]} [childWidgets]
	 * @param {Boolean} [hidden] 
	 * @return {Ext.panel.Panel}
	 */
	showWidget : function(widgetId, highlight, childWidgets, hidden){
		var newWidget = null,
			children = this.down('treeButtonChildren').items.items;
		// Check if the widgets set exists
		this.widgetsSet = this.widgetsSet || {};
		// Check if this button has at least one widget, otherwise iterate on the children
		if (childWidgets){
			// The main button has no widgets but its children have, let's show them!
			Ext.each(childWidgets, function(childWidget){
				children.forEach(function(child){
					if (childWidget.indexOf(child.id) != -1){
						child.showWidget(childWidget);
					}
				});
			});
		}
		// If a widget with this id already exists just show it, otherwise create it
		if (this.waweConfig.widgetConfig && !this.widgetsSet[widgetId]){
			// generic xtype  
			var itemsList = this.waweConfig.widgetConfig.list;
			newWidget = Ext.widget('menuWidget', {
				items : itemsList,
				id : widgetId,
				title : this.waweConfig.widgetConfig.title,
				attributes : this.waweConfig.widgetConfig.attributes
			});
			// We take advantage of the equality between widgetId and the id of the marked element
			newWidget.setContent(widgetId);
			if (hidden) newWidget.hide();
			// Add the just created widget to the global list  
			this.widgetsSet[widgetId] = newWidget;
			this.down('treeButtonWidgets').add(newWidget);
		} else if (this.waweConfig.widgetConfig){
			newWidget = this.widgetsSet[widgetId];
			if (newWidget) {
				//Update content of widget
				newWidget.setContent(widgetId);
				if (!newWidget.isVisible()){
					newWidget.show();	
				}
			}
		}
		if (highlight && newWidget && newWidget.el){
			//newWidget.el.frame("#ff0000", 3, { duration: 250 });
			newWidget.animate({
				duration : 1000,
				keyframes : {
					25 : {
						left : 5
					},
					75 : {
						left : -5
					},
					100 : {
						left : 0
					}
				}
			});	
		}
		return newWidget;
	},
	
	
	/**
	 * This function hides the widgets of the TreeButton 
	 * either from a given list or all of them (if the list
	 * is not specified).
	 * @param {String[]} idList
	 */
	hideWidgets : function(idList){
		if (!this.waweConfig.widgetConfig) return; // Nothing to do  
		if (!idList){
			// Hide all the widgets  
			for (var widget in this.widgetsSet){
				this.widgetsSet[widget].hide();
			}
		} else {
			// Hide only the specified ones  
			for (var widget in this.widgetsSet){
				if (idList.indexOf(widget)){
					this.widgetsSet[widget].hide();
				}
			}
		}
	},
	
	/**
	 * This function destroys a widget with the given id.
	 * If no id is specified all the widgets of this button are destroyed.
	 * @param {String} widgetId The id of the widget to destroy
	 */
	deleteWidgets : function(widgetId){
		var widgetsSet = this.widgetsSet;
		for (var widget in widgetsSet){
			if (!widgetId || widgetId == widget){
				// Delete the component
				this.remove(widgetsSet[widget]);
				//Ext.destroy(widgetsSet[widget]); --> takes too much time
				// Delete the property from the widgetsSet
				delete widgetsSet[widget];
			}
		}
	},
	/**
	 * This function return a child treebutton from passed name
	 * @param {String} name The name of child
	 * @return {LIME.view.markingmenu.TreeButton}
	 */
	getChildByName : function(name) {
		var childs = this.getChildren(function(button){return button.waweConfig.name==name});
		return childs[0];
	},
	
	/**
	 * This function returns the name of this button
	 * @return {String}
	 */
	getButtonName : function() {
		return this.waweConfig.name;	
	},
	
	/**
     * This function returns the pattern of this button
     * @return {String}
     */
	getPattern : function() {
	    return this.waweConfig.pattern.pattern;
	}
}); 
