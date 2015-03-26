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


Ext.define('LIME.controller.CommentsMainTabController', {
    extend : 'Ext.app.Controller',
    
    views: ["LIME.ux.comments.CommentsMainTab"],

    refs: [
        { ref: 'viewport', selector: 'appViewport' },
        { ref: 'outliner', selector: 'outliner' },
        { ref: 'markingMenu', selector: '[cls=markingMenuContainer]'},
        { ref : 'editor', selector : '#mainEditor mainEditor'}
    ],

    init: function () {
        var me  = this;
        this.control({
            'commentsMainTab' : {
                activate: function (cmp) {
                    var id = DocProperties.documentInfo.docId;
                    me.reorganizeInterface();
                    me.loadDocument(id, cmp);
                }
            },
            'commentsMainTab *[cls*=akomantosoViewer]' : {
                contextmenu: function(cmp, e) {
                    e.preventDefault();
                    me.contextMenu = Ext.widget('menu', {
                        items: [{
                            text: 'Add a comment',
                            icon: 'resources/images/icons/comment_add.png'
                        },{
                            text: 'Add a modify',
                            icon: 'resources/images/icons/pencil.png'
                        }]
                    }).showAt([e.pageX, e.pageY]);
                },
                click: function(cmp, e) {
                    if ( me.contextMenu ) {
                        me.contextMenu.close();
                    }
                }
            }
        });
    },

    reorganizeInterface: function() {
        var viewport = this.getViewport();
        viewport.remove(this.getMarkingMenu());

        this.commentsPanel = viewport.add({
            xtype: 'panel',
            title: 'Comments',
            region : 'east',
            width : '25%',
            margin : '2 0 0 0',
            titleAlign: 'right',
            autoScroll : true
        });

        this.getEditor().up().tab.setVisible(false);
    },

    loadDocument: function(docId, cmp) {
        var me = this;
        console.log(docId);
        me.getController('Storage').openDocumentNoEditor(docId, function (config) {
            me.getController("Language").beforeLoad(config, function(doc) {
                cmp.setContent(doc.docText);
            }, true);
        });
    }
});
