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
 *This is the Expander of a tree button 
 */
Ext.define('LIME.view.markingmenu.treebutton.Expander', {
	extend : 'Ext.button.Button',

	alias : 'widget.treeButtonExpander',

	expandedText : '&#9660;',

	collapsedText : '&#9658;',
	
	border: false,
	
	leafText : '&nbsp;',
	
	// TODO Fare in modo che se sono foglie setti da solo il leafText e il disable, non da MarkingMenu controller

	listeners : {
		click : function(me) {
			// Expand or collapse the children  
			var button = me.up("treeButton");
			if (button.childrenShown) {
				// Hide the children  
				me.hideChildren(button);
				//This is for the view bug when the scrollbar disappears
				me.up("treeButton").updateLayout();
			} else {
				// Show the children  
				me.showChildren(button);
			}
			me.updateLayout();
		}
	},

	/**
	 * @private
	 * This function expands the list of the treeButton's children buttons.
	 * Widgets cannot be shown here! Which one should we show? We don't know.
	 * @param {LIME.view.markingmenu.TreeButton} treeButton
	 */
	showChildren : function(treeButton) {
		if (treeButton.getChildren().length != 0){
			var markingMenu = this.up("markingMenu");
			// Show the button only if it doesn't appear in the shown
			if (markingMenu.shown.indexOf(treeButton) == -1){
				var ChildrenContainer = treeButton.getChildrenContainer();
				// Save the state of the menu
				markingMenu.shown.push(treeButton);
				// Actually show the children
				//For better performance call direct the el.show() instead of .show()
				ChildrenContainer.hidden = false;
				ChildrenContainer.el.show();
				// Animate the showing *EXPERIMENTAL*
				treeButton.childrenShown = true;
				//Update the button text with own setText function because is faster
				this.setTextFast(this.expandedText);
				//this.updateLayout();
			}
		}
	},

	/**
	 * @private
	 * This function expands the list of the treeButton's children buttons.
	 * @param {LIME.view.markingmenu.TreeButton} treeButton An istance of the treeButton we have to act on
	 */
	hideChildren : function(treeButton) {
		// Just check if the children exist and are opened
		if ((treeButton.getChildren().length == 0 || treeButton.getChildrenContainer().hidden)){
			return;
		}
		var markingMenu = this.up("markingMenu"),
			// Get the index of the treeButton inside of the shown array
			treeButtonIndex = markingMenu.shown.indexOf(treeButton),
			children = treeButton.getChildrenContainer(),
			realChildren = children.items.items;
		
		// Hide the button only if it has been shown		
		if (treeButtonIndex != -1){
			for (var i in realChildren) {
				var currentChildExpander = realChildren[i].getExpander();
				// Hide the children  
				currentChildExpander.hideChildren(realChildren[i]);
			}
			//For better performance call direct the el.hide() instead of .hide()		
			children.hidden = true;
			children.el.hide();		
			treeButton.childrenShown = false;
			//Update the button text with own setText function because is faster
			this.setTextFast(this.collapsedText);
			// Delete the button from the shown array
			markingMenu.shown.splice(treeButtonIndex, 1);
		}
		//this.updateLayout();
	},
	/**
	 * @private
	 * This function is an alternative to the original setText(text) function.
	 * Original function is very slow because it updates the layout and fires an event
	 * we don't need this because we just change the text (collapsedText is an arrow) 
	 * that has the same length of the previous text  
	 * @param {String} text Text to set
	 */
	setTextFast : function(text){
		this.text  = text;
		this.btnInnerEl.update(text);
	}
});
