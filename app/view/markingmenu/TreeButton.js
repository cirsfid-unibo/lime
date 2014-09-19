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
				'LIME.view.markingmenu.treebutton.Children'],

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
		  expander.hideChildren(this, animate);    
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
