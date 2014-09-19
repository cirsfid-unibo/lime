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

Ext.define('LIME.controller.ContextInfoManager', {
    extend : 'Ext.app.Controller',

    views: ["LIME.view.main.ContextPanel", "LIME.view.main.editor.Path"],
    refs : [{
        selector: 'contextPanel',
        ref: 'contextPanel'
    }, {
    	selector: 'mainEditorPath tool[type="up"]',
    	ref: 'cxtPanelUpDownTool'
    }],

    tabGroups: {},
    enabledGroup: null,

    /*
     *
     * Opens the context panel
     * @param {Number/String} height The height of the panel it can be:
     * undefined - set the maximum height,
     * number - set height in pixel
     * string - if passed "lastHeight" it doesn't change the height
     * */

    openContextPanel: function(height) {
    	var tool = this.getCxtPanelUpDownTool(),
    		contextPanel= this.getContextPanel(),
    		activatedTab, firstTab,
    		groupCmp = this.getGroupCmp();

        if(groupCmp) {
            activatedTab = groupCmp.getActiveTab();
            firstTab = groupCmp.down("panel");
        }

        if(height != "lastHeight") {
            height = (Ext.isNumber(height)) ? height : contextPanel.maxHeight;
            contextPanel.setHeight(height);
        }

    	contextPanel.show();
		tool.setType("down");

		if(activatedTab) {
			groupCmp.setActiveTab(activatedTab);
			activatedTab.fireEvent("activate", activatedTab);
		} else if(firstTab) {
			groupCmp.setActiveTab(firstTab);
			firstTab.fireEvent("activate", firstTab);
		}
    },

    closeContextPanel: function() {
    	var tool = this.getCxtPanelUpDownTool(),
    		contextPanel= this.getContextPanel();

    	contextPanel.hide();
		tool.setType("up");
    },

    openTabGroup: function(groupToEnable) {
        var me = this, contextPanel= me.getContextPanel();
        groupToEnable = groupToEnable || me.enabledGroup || Ext.Object.getKeys(me.tabGroups)[0];

        // Remove elements from previous group
        if(me.enabledGroup && me.enabledGroup != groupToEnable) {
            me.removeElementsFromGroup(me.enabledGroup);
        }

        if(groupToEnable && me.tabGroups[groupToEnable]) {
            me.enabledGroup = groupToEnable;
            if(!me.getGroupCmp(groupToEnable)) {
                contextPanel.add(me.tabGroups[groupToEnable]);
            }
            me.tabGroups[groupToEnable].show();
        }
    },

    /*
     * Opens or closes the context panel
     * @param {Boolean} open True to open and False to close
     * @param {String} groupToEnable The name of the group to open or close
     * @param {Number/String} height The height of the panel it can be:
     * undefined - set the maximum height,
     * number - set height in pixel
     * string - if passed "lastHeight" it doesn't change the height
     * */
    openCloseContextPanel: function(open, groupToEnable, height) {
    	var me = this, contextPanel= me.getContextPanel();

    	open = (Ext.isBoolean(open)) ? open : ((contextPanel.isVisible()) ? false : true);

		if(open) {
            me.openTabGroup(groupToEnable);
    		me.openContextPanel(height);
    	} else {
    		me.closeContextPanel();
    	}
    },

    addTab: function(cmp) {
    	var me = this, newCmp = me.tabGroups[cmp.groupName],
            contextPanel= this.getContextPanel(),
            existingCmp, index;

        if(!me.tabGroups[cmp.groupName]) {
            newCmp = Ext.widget("tabpanel", {
                name: cmp.groupName,
                border : 0
            });
            me.tabGroups[cmp.groupName] = newCmp;
        }
        existingCmp = newCmp.down("*[name='"+cmp.name+"']");
        if(existingCmp) {
            index = newCmp.items.indexOf(existingCmp);
            newCmp.remove(existingCmp);
            newCmp.insert(index, cmp);
        } else {
            newCmp.add(cmp);
        }
    },

    getGroupCmp: function(groupName) {
        groupName = groupName || this.enabledGroup;
        var contextPanel= this.getContextPanel();
        return contextPanel.down("*[name='"+groupName+"']");
    },

    removeElementsFromGroup: function(groupName, destroy) {
        var me = this, contextPanel= me.getContextPanel(),
            groupCmp = me.getGroupCmp(groupName);
        if(groupCmp) {
            groupCmp.hide();
            if(destroy) {
                contextPanel.remove(groupCmp);
                delete me.tabGroups[groupName];
            }
        }
    },

    removeGroup: function(groupName) {
        var me = this;
        me.removeElementsFromGroup(groupName, true);
        me.closeContextPanel();
    },

    init : function() {
        var me = this;

        me.application.on(Statics.eventsNames.openCloseContextPanel, me.openCloseContextPanel, me);
        me.application.on(Statics.eventsNames.removeGroupContextPanel, me.removeGroup, me);
        me.application.on(Statics.eventsNames.addContextPanelTab, me.addTab, me);

        me.control({
        	"mainEditorPath": {
        		afterrender: function(cmp) {
        			cmp.add({
				        xtype:"tool",
				        type: 'up',
				        callback: function() {
				            me.openCloseContextPanel(null, null, "lastHeight");
				        }
				    });
        		}
        	},
        	"contextPanel": {
        		afterrender: function(cmp) {
        		}
        	}
        });
    }
});
