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
 * This controller manages the context menu
 */

Ext.define('LIME.controller.ContextMenu', {
    extend : 'Ext.app.Controller',

    refs : [{
        ref : 'contextMenu',
        selector : 'contextMenu'
    }, {
        ref : 'contextMenuItems',
        selector : 'menuitem[cls=editor]'
    }],
    
    menuItems:  [{
        text : 'Unmark',
        separator : true,
        icon : 'resources/images/icons/delete.png',
        menu : {
            // TODO localize the text
            items : [{
                id : "unmarkThis",
                text : 'Unmark this element'
            }, {
                id : "unmarkAll",
                text : 'Unmark this element and its children'
            }]
        }
    }],
    
    beforeShowFns: [],
    
    showContextMenu: function(coordinates) {
        var me = this, menu = this.getContextMenu(),
            editor = me.getController("Editor"),
            selectedNode = editor.getSelectedNode();
        menu.removeAll();
        Ext.each(me.menuItems, function(item) {
            menu.add(item);
        });
        
        Ext.each(me.beforeShowFns, function(beforeShowFn) {
            try {
                beforeShowFn(menu, selectedNode);    
            } catch(e) {
                Ext.log({
                    level : "error"
                }, e);
            }
        });
        
        menu.showAt(coordinates);
    },
    
    registerContextMenuBeforeShow: function(beforeShowFn) {
        var me = this;
        if(Ext.isFunction(beforeShowFn) && me.beforeShowFns.indexOf(beforeShowFn) == -1) {
            me.beforeShowFns.push(beforeShowFn);
        }
    },

    init : function() {
        var me = this, editor = me.getController("Editor"),
            markerController = me.getController('Marker');
        //Listening progress events
        me.application.on(Statics.eventsNames.showContextMenu, me.showContextMenu, me);
        me.application.on(Statics.eventsNames.registerContextMenuBeforeShow, me.registerContextMenuBeforeShow, me);
        
        me.control({
            // Handle the context menu
            'contextMenu menuitem' : {
                /* TODO Distinguere i due casi basandosi sui due bottoni */
                click : function(cmp, e) {
                    var parentXtype = cmp.parentMenu.getXType(), id = cmp.id,
                        selectedNode = editor.getSelectedNode(true);
                        
                    // Call the unmark only with one of the inner buttons
                    if (parentXtype != "contextMenu") {
                        try {
                            // Differentiate between the types of action that have to be performed by looking at the id of the pressed button
                            switch(id) {
                                case "unmarkThis":
                                    me.application.fireEvent(Statics.eventsNames.unmarkNodes, [selectedNode]);
                                    break;
                                case "unmarkAll":
                                    me.application.fireEvent(Statics.eventsNames.unmarkNodes, [selectedNode], true);
                                    break;
                            }
                        } catch(e) {
                            Ext.log({
                                level : "error"
                            }, e);
                        }
                    } else {
                        /* TODO Don't let the menu hide when the main item is clicked */
                    }
                }
            }
        }); 
    }
});
