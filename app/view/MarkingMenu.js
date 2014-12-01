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
 * This menu is a container for all the buttons we will use to mark.
 * Each button is a TreeButton (our "panelish" implementation of a tree made of buttons)
 */

Ext.override(Ext.layout.container.Card, {
    setActiveItem: function (newCard) {
        var me = this,
            owner = me.owner,
            oldCard = me.activeItem,
            rendered = owner.rendered,
            newIndex;

        newCard = me.parseActiveItem(newCard);
        newIndex = owner.items.indexOf(newCard);

        // If the card is not a child of the owner, then add it.
        // Without doing a layout!
        if (newIndex === -1) {
            newIndex = owner.items.items.length;
            Ext.suspendLayouts();
            newCard = owner.add(newCard);
            Ext.resumeLayouts();
        }

        // Is this a valid, different card?
        if (newCard && oldCard !== newCard) {
            // Fire the beforeactivate and beforedeactivate events on the cards
            if (newCard.fireEvent('beforeactivate', newCard, oldCard) === false) {
                return false;
            }
            if (oldCard && oldCard.fireEvent('beforedeactivate', oldCard, newCard) === false) {
                return false;
            }

            if (rendered) {
                Ext.suspendLayouts();

                // If the card has not been rendered yet, now is the time to do so.
                if (!newCard.rendered) {
                    me.renderItem(newCard, me.getRenderTarget(), owner.items.length);
                }

                var handleNewCard = function () {
                    // Make sure the new card is shown
                    if (newCard.hidden) {
                        newCard.show();
                    }

                    var newCardEl = newCard.getEl();
                    newCardEl.dom.style.opacity = 1;
                    if (newCardEl.isStyle('display', 'none')) {
                        newCardEl.setDisplayed('');
                    } else {
                        newCardEl.show();
                    }

                    newCardEl.up().toggleCls('flipped');

                    // Layout needs activeItem to be correct, so set it if the show has not been vetoed
                    if (!newCard.hidden) {
                        me.activeItem = newCard;
                    }
                    Ext.resumeLayouts(true);
                };

                if (oldCard) {
                    var oldCardEl = oldCard.getEl();

                    if (me.hideInactive) {
                        oldCard.hide();
                        oldCard.hiddenByLayout = true;
                    }
                    oldCard.fireEvent('deactivate', oldCard, newCard);
                    handleNewCard();

                } else {
                    handleNewCard();
                }

            } else {
                me.activeItem = newCard;
            }

            newCard.fireEvent('activate', newCard, oldCard);

            return me.activeItem;
        }
        return false;
    }
});

Ext.define('LIME.view.MarkingMenu', {
    extend : 'Ext.panel.Panel',

    requires : ['LIME.view.NationalitySelector'],

    alias : 'widget.markingMenu',

    id: 'markingMenu',

    collapsible : true,

    layout : 'card',

    listeners : {
        resize : function(cmp) {
            cmp.doLayout();
        }
    },

    dockedItems: [{
       xtype: 'toolbar',
       dock: 'top',
        layout : {
            type : 'hbox',
            pack : 'center'
        },
       items: [{
            xtype: 'toggleslide',
            onText: 'Quest buttons', 
            offText: 'All buttons',
            booleanMode: false,
            state: true,
            listeners: {
                change: function(toggle, state) {
                    var item = (state == toggle.onText) ? 0 : 1;
                    Ext.getCmp('markingMenu').setActiveItem(item);
                },
                afterrender: function(toggle) {
                    var markingMenu = toggle.up().up();
                    markingMenu.toggleButtons = toggle;
                }
            }
        }]
    }],

    constructor : function() {
        /**
         * @property {Array} shown
         * Array containing references to the currently opened buttons
         */
        this.shown = [];
        this.title = Locale.strings.eastToolbarTitle;
        this.items = [{
            xtype : 'treepanel',
            //title : Locale.strings.documentStructure,
            cls : 'x-tree-noicon x-tree-custom structure',
            id: 'treeStructure',
            useArrows: true,
            border : false,
            rootVisible: false,
            autoScroll : true
        },{
            xtype : 'treepanel',
            //title : Locale.strings.commonButtons,
            cls : 'x-tree-noicon x-tree-custom commons',
            id: 'treeCommons',
            useArrows: true,
            border : false,
            rootVisible: false,
            autoScroll : true,
            dockedItems: [{
                xtype: 'toolbar', 
                dock: 'top',
                layout : {
                    type : 'hbox',
                    pack : 'center'
                },
                items: [{
                    xtype: 'textfield',
                    onTriggerClick: function () {
                        this.reset();
                        this.focus();
                    }, 
                    listeners: {
                        change: function (field, newVal) {
                            //var tree = field.up('treepanel');
                            //tree.filter(newVal);
                        },
                        buffer: 250
                    }
                }]
            }]
        }],
        this.callParent(arguments);
    }
});
