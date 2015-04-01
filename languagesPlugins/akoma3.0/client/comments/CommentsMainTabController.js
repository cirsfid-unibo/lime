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
    
    views: ["LIME.ux.comments.CommentsMainTab", "LIME.ux.comments.CommentsWindow"],

    refs: [
        { ref: 'viewport', selector: 'appViewport' },
        { ref: 'outliner', selector: 'outliner' },
        { ref: 'markingMenu', selector: '[cls=markingMenuContainer]'},
        { ref : 'editor', selector : '#mainEditor mainEditor'},
        { ref: 'akomantosoViewer', selector: 'commentsMainTab *[cls*=akomantosoViewer]'},
        { ref: 'commentsMainTab', selector: 'commentsMainTab'},
        { ref: 'commentsRender', selector: 'appViewport *[cls*=commentsRender]'},
    ],

    comments: {},

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
                            icon: 'resources/images/icons/comment_add.png',
                            handler: me.addComment.bind(me, e.target)
                        },{
                            text: 'Add a modify',
                            icon: 'resources/images/icons/pencil.png',
                            handler: me.addModify.bind(me, e.target)
                        }]
                    }).showAt([e.pageX, e.pageY]);
                    me.focusNode(e.target);
                },
                click: function(cmp, e) {
                    if ( me.contextMenu ) {
                        me.contextMenu.close();
                    }
                    me.unFocusNodes();
                }
            },
            'commentsWindow button[cls*=save]' : {
                click: function(cmp) {
                    var winCmp = cmp.up('window'),
                        type = winCmp.down('tabpanel').query('segmentedbutton button[pressed]')[0].type,
                        value = winCmp.down('textarea').getValue();

                    me.saveNote(this.selectedNode, type, value);

                    winCmp.down('textarea').setValue('');
                    winCmp.close();
                }
            }
        });
    },

    reorganizeInterface: function() {
        var viewport = this.getViewport();
        viewport.remove(this.getMarkingMenu());

        if ( !viewport.down('*[cls*=commentsRender]') ) {
            this.commentsPanel = viewport.add({
                xtype: 'panel',
                title: 'Comments',
                region : 'east',
                width : '25%',
                margin : '2 0 0 0',
                titleAlign: 'right',
                items: [{
                    xtype: 'container',
                    cls: 'commentsRender'
                }],
                autoScroll : true
            });
        }

        this.getEditor().up().tab.setVisible(false);
        viewport.setVisibleEditorToolbar(false);

        if ( !viewport.down('commentsWindow') ) {
            this.commentWindow = viewport.add({
                xtype: 'commentsWindow',
                region: 'south',
                height: 300,
                draggable: false,
                resizable: false,
                floating: false
            });
        }
    },
    
    loadDocument: function(docId, cmp) {
        var me = this;
        if ( docId == me.loadedDocId ) return;
        me.getController('Storage').openDocumentNoEditor(docId, function (config) {
            me.getController("Language").beforeLoad(config, function(doc) {
                me.loadedDocId = docId;
                cmp.setContent(doc.docText);
                me.genTmpIds(cmp.getContentDom());
                me.addExampleComments(cmp.getContentDom());
                me.renderComments(cmp.getContentDom());
                me.enableScrollSync();
            }, true);
        });
    },

    genTmpIds: function(root) {
        var counter = 0;
        Ext.each(root.querySelectorAll('*'), function(node) {
            node.setAttribute('id', 'paragraph '+counter++);
        });
    },

    addExampleComments: function(root) {
        var commentValue = "Comment example comment example comment example";
        try {
            this.saveNote(root.querySelector('.preamble').querySelectorAll('*')[1], 'editorial', commentValue);
            this.saveNote(root.querySelectorAll('.p')[2], 'technical', commentValue);
            this.saveNote(root.querySelectorAll('.p')[5], 'translation', commentValue);
        } catch(e) {
            console.warn('Examples work only for one document');
        }
    },

    enableScrollSync: function() {
        var nodeA = this.getCommentsMainTab().body,
            nodeB = this.getCommentsRender().up('panel').body,
            lastScrollTime = 0;

        var setScroll = function(e) {
            if ( (e.time-lastScrollTime) <= 5 ) return;
            if ( nodeA.dom == e.target ) {
                nodeB.dom.scrollTop = nodeA.dom.scrollTop;
            } else if ( nodeB.dom == e.target ) {
                nodeA.dom.scrollTop = nodeB.dom.scrollTop;
            }
            lastScrollTime = e.time;
        };

        nodeA.on('scroll', setScroll);
        nodeB.on('scroll', setScroll);
    },

    addComment: function(node) {
        this.selectedNode = node;

        var div = this.getCommentsMainTab().getEl().down('div');

        var scrollTop = div.scrollTop;
        this.commentWindow.show();
        div.scrollTop = scrollTop;
    },

    addModify: function() {

    },

    focusNode: function(node) {
        node.setAttribute(DocProperties.elementFocusedCls, "true");
    },

    unFocusNodes: function(fireEvent) {
        node = this.getAkomantosoViewer().getEl().dom;
        Ext.each(node.querySelectorAll("*["+DocProperties.elementFocusedCls+"]"), function(node) {
            node.removeAttribute(DocProperties.elementFocusedCls);
        });
    },

    saveNote: function(node, type, text) {
        //console.log(winCmp, value, node, type);
        var id = node.getAttribute('id');

        this.comments[id] = this.comments[id] || [];
        this.comments[id].push({
            comment: text,
            node: node,
            type: type
        });

        this.addOrUpdateBadge(node, type);
        
        this.renderComments(this.getCommentsMainTab().getContentDom());
    },

    addOrUpdateBadge: function(node, type) {
        var badgeContainer = node.querySelector('.badgeContainer');

        if (!badgeContainer) {
            badgeContainer = Ext.fly(node).appendChild({
                tag: 'span',
                cls: 'badgeContainer'
            }, true);
        }
        
        var badge = badgeContainer.querySelector('.badge.'+type);

        if (!badge) {
            Ext.fly(badgeContainer).appendChild({
                tag: 'span',
                cls: 'badge '+type,
                html: 1
            });
        } else {
            badge.textContent = parseInt(badge.textContent)+1;
        }
    },

    renderComments: function(root) {
        var me = this,
            commentsRender = me.getCommentsRender(),
            documentBox = me.getCommentsMainTab().getContentDom().getBoundingClientRect();

        var html = '';
        var counter = 1;
        var renderOrder = ['editorial', 'substantive', 'translation', 'technical'];
        Ext.each(root.querySelectorAll('.badgeContainer'), function(node) {
            var id = node.parentNode.getAttribute('id'),
                containerHtml = "",
                comments = me.comments[id],
                nodePos = me.getNodePosition(node.parentNode);

            if ( Ext.isEmpty(comments) ) return;

            comments.sort(function(a, b) {
                return renderOrder.indexOf(a.type) - renderOrder.indexOf(b.type);
            });
            comments.forEach(function(obj) {
                containerHtml += '<div class="commentBox '+obj.type+'"><div class="header"><span class="badge">'+ (counter++) +'</span><span class="title">'+ id +'</span></div><div class="content">'+obj.comment+'</div><div class="actions"></div><div class="clear"></div></div>';
            });

            html += '<div class="boxContainer" style="top:'+ nodePos.top +'px;" data-for-node="'+id+'">'+containerHtml+'</div>';
            //html += '<div class="boxContainer" data-for-node="'+id+'">'+containerHtml+'</div>';
        });

        html += '<div class="boxContainer" style="top:'+ (documentBox.top+documentBox.height) +'px; position:relative; height:1px;"></div>';
        commentsRender.update(html);
    },

    getNodePosition: function(node) {
        var pos = node.getBoundingClientRect(),
            containerPos = this.getCommentsMainTab().getContentDom().getBoundingClientRect();

        return {
            top: pos.top - containerPos.top - 5,
            height: pos.height
        };
    }
});
