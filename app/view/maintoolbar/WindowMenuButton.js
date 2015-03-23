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
 * This is the Document menu button
 */
Ext.define('LIME.view.maintoolbar.WindowMenuButton', {
    extend : 'Ext.Button',

    alias : 'widget.windowMenuButton',
    
    checkedIcon: 'resources/images/icons/tick.png',
    
    /**
     * Set the check or blank icon to the passed child
     * @param {Object} cmp
     * @param {Object} [blank]
     */
    setCheckIcon: function(cmp, blank) {
        //Ext bug, setIcon doesn't work
        var icon = (blank===undefined) ? this.checkedIcon : Ext.BLANK_IMAGE_URL;
        if (cmp) {
            this.newSetIcon(cmp, icon);    
        }
    },
    newSetIcon: function(cmp, icon) {
        icon = icon || '';
        var me = cmp,
            btnIconEl = me.iconEl;

        me.icon = icon;
        if (btnIconEl) {
            btnIconEl.setStyle('background-image', icon ? 'url(' + icon + ')': '');
        }
        return me;
    },
    
    initComponent: function(){
        this.text = Locale.strings.windowMenuButton;
        this.menu = {
            xtype : 'menu',
            plain : true,
            
            items : [{
                id: 'showViews', //temporary
                text : Locale.strings.menuShowView
            }, {
                id: 'showStyles',
                text: Locale.strings.menuShowStyle,
                menu: {
                    items: [{
                        xtype: 'menucheckitem',
                        id: 'showBoxCheckbox',
                        checked: true,
                        text: Locale.strings.menuShowStyleBox
                    }, {
                        xtype: 'menucheckitem',
                        id: 'showColorCheckbox',
                        checked: true,
                        text: Locale.strings.menuShowStyleColor
                    }, {
                        xtype: 'menucheckitem',
                        id: 'showStyleCheckbox',
                        text: Locale.strings.menuShowStylePdf
                    }]
                }
            }]
        };
        this.callParent(arguments);
    }
});
