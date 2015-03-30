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
 * must include the  acknowledgment: "This product includes
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
 * TORT OR OTHERWISEfollowing, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

Ext.define('LIME.ux.comments.CommentsWindow', {
    extend : 'Ext.window.Window',

    alias : 'widget.commentsWindow',

    title: 'Add a new comment',
    closeAction: 'hide',
    layout: 'fit',
    header: {
        titlePosition: 0,
        items:[{
            xtype:'segmentedbutton',
            activeItem: 1,
            items: [{
              text: 'Modal window'
            },{
              text: 'Bottom window',
              pressed: true
            }]
        },{ xtype: 'tbfill' }]    
    },

    items: [{
        xtype: 'tabpanel',
        layout: 'fit',
        tabBar:{
            //plain:true,
            items:[{
                xtype: 'tbfill'
            },{
                xtype:'segmentedbutton',
                items: [{
                  text: 'Editorial',
                  type: 'editorial',
                    style: {
                        backgroundImage: 'linear-gradient(to bottom, #5bc0de, #5bc0de)',
                        border: '1px solid #008c00',
                        boxShadow: '2px 2px 2px #666'
                    },
                  pressed: true
                },{
                  text: 'Substantive',
                  type: 'substantive',
                  style: {
                        backgroundImage: 'linear-gradient(to bottom, #5bb85d, #5bb85d)',
                        border: '1px solid #008c00',
                        boxShadow: '2px 2px 2px #666'
                    }
                },{
                  text: 'Translation',
                  type: 'translation',
                  style: {
                        backgroundImage: 'linear-gradient(to bottom, #efad4d, #efad4d)',
                        border: '1px solid #008c00',
                        boxShadow: '2px 2px 2px #666'
                    }
                },{
                  text: 'Technical',
                  type: 'technical',
                  style: {
                        backgroundImage: 'linear-gradient(to bottom, #d9544f, #d9544f)',
                        border: '1px solid #008c00',
                        boxShadow: '2px 2px 2px #666'
                    }
                }]
            }]
        },
        border: false,
        items: [{
            title: 'Comment',
            layout : 'fit',
            items: [{
                xtype: 'textarea',
                anchor: '100%'
            }]
        },{
            title: 'Explanation',
            layout : 'fit',
            items: [{
                xtype: 'textarea',
                anchor: '100%'
            }]
        }]
    }],

    dockedItems: [{
        xtype : 'toolbar',
        dock: 'bottom',
        items: ['->',
            { xtype: 'button', cls: 'cancel', text: 'Cancel', icon : 'resources/images/icons/cancel.png' },
            { xtype: 'button', cls: 'save', text: 'Save', icon : 'resources/images/icons/accept.png' }
        ]
    }],

    initComponent: function () {
        //this.title = Locale.getString('tabTitle', 'comments');
        this.callParent(arguments);
    }
});
