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

Ext.define('LIME.controller.XmlJNDiffController', {
    extend: 'Ext.app.Controller',

    refs : [
        { ref: 'pagingToolbar', selector: 'pagingtoolbar' },
        { ref: 'statusButtons', selector: 'segmentedbutton' },
    ],

    init: function() {
        var me = this;
                
        this.control({
            'jnDiffMainTab doubleDocSelector': {
                afterrender: function (cmp) {
                    cmp.onSelectedDocsChanged();

                    // me.getPagingToolbar().setLength(5);
                },

                docsSelected: function (cmp) {
                    Server.getDocument(cmp.firstDoc.id, function (doc1) {
                        Server.getDocument(cmp.secondDoc.id, function (doc2) {
                            me.JNDiff.start(doc1, doc2);
                            // TODO: Add a callback to start method
                            setTimeout(function () {
                                var count = me.JNDiff.getCount();
                                me.getPagingToolbar().setLength(count);
                            }, 2000);
                        });
                    });
                },

                edit: me.enableEditMode
            },
            'jnDiffMainTab': {
                ready: function (JNDiff) {
                    me.JNDiff = JNDiff;

                    // Test
                    var a = '/db/wawe_users_documents/aasd.gmail.com/my_documents/uy/bill/2005-04-04/2005-04-04/esp.2005-05-02/esp.2005-05-02%3A00%3A00/1.xml';
                    var b = '/db/wawe_users_documents/aasd.gmail.com/my_documents/uy/bill/2005-04-04/2005-04-04/esp.2005-05-02/esp.2005-05-02%3A00%3A00/2.xml';
                    setTimeout(function () {
                        Server.getDocument(a, function (doc1) {
                            Server.getDocument(b, function (doc2) {
                                me.JNDiff.start(doc1, doc2);
                                // TODO: Add a callback to start method
                                setTimeout(function () {
                                    var count = me.JNDiff.getCount();
                                    me.getPagingToolbar().setLength(count);
                                }, 2000);
                            });
                        });
                    }, 100)
                },

                save: function () {
                    me.JNDiff.save();
                }
            },

            'jnDiffMainTab pagingtoolbar': {
                'changeSelection': function (n) {
                    console.log('selecting ', n);
                    var modification = n-1;
                    if (me.JNDiff) {
                        me.JNDiff.focus(modification);
                        var status = me.JNDiff.getStatus(modification);
                        console.log('setting status', modification, status);
                        me.getStatusButtons().setValue(status);
                    }
                }
            },

            'jnDiffMainTab segmentedbutton': {
                'toggle': function (button) {
                    var modification = me.getPagingToolbar().store.currentPage -1;
                    console.log('toggle', modification, button.getValue())
                    switch (button.getValue()) {
                        case 'accepted':
                            me.JNDiff.accept(modification);
                            break;
                        case 'rejected':
                            me.JNDiff.reject(modification);
                            break;
                        case 'pending':
                            me.JNDiff.reset(modification);
                            break;
                    }
                }
            }
        });
    },
});


