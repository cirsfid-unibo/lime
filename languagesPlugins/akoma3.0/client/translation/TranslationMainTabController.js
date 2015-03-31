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

Ext.define('LIME.controller.TranslationMainTabController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.translationMainTabController',

    init: function () {
        var me = this;
        this.control({
            '#': {
                activate: function (cmp) {
                    
                },

                ready: function (Translator){
                    me.Translator = Translator;
                    me.loadDocument();
                },

                updateItem: function (item, status) {
                    var translations = me.Translator.getTranslations();
                    translations[item].status = status;
                    me.Translator.setTranslations(translations);
                },

                useProposed: function (translation) {
                    console.log('useProposed', translation);
                    var translations = me.Translator.getTranslations();
                    translations[me.Translator.focusedFragment] = {
                        status: 'translated',
                        value: translation
                    }
                    me.Translator.setTranslations(translations);
                }
            },

            'pagingtoolbar': {
                'changeSelection': function (n) {
                    if (me.Translator)
                        me.Translator.focus(n -1);
                    me.proposeTranslations();
                }
            }
        });
    },

    loadDocument: function () {
        var me = this,
            id = DocProperties.documentInfo.docId;
        Server.getDocument(id, function (xml) {

            me.Translator.start(xml, {
                // Translations
                1: { status: 'translated', value: 'Lorem ipsum dolor sit amet' },
                5: { status: 'pending', value: 'Lorem ipsum.. (Proposed translation N. 1)' },
                11: { status: 'translated', value: 'consectetur adipiscing elit' },
                12: { status: 'translated', value: 'sed do eiusmod' },
                13: { status: 'translated', value: 'tempor incididunt.' }
            });
            
            var len = Object.keys(me.Translator.getTranslations()).length;
            me.getView().down('pagingtoolbar').setLength(len);
        })
    },

    proposeTranslations: function () {
        if (!this.Translator) return;
        var store = Ext.data.StoreManager.lookup('proposedTranslationsStore');
        console.log('loading data');
        var id = this.Translator.focusedFragment;
        var data = id != 5 ? [] : [
            { 'pos': '1',  "translation": "Lorem ipsum.. (Proposed translation N. 1)",  "stats": "Used in 2312 documents" },
            { 'pos': '2',  "translation": "Lorem ipsum.. (Proposed translation N. 2)",  "stats": "Used in 212 documents" },
            { 'pos': '3',  "translation": "Lorem ipsum.. (Proposed translation N. 3)",  "stats": "Used in 31 documents" }
        ];
        store.loadRawData({ 'items': data });
    }
});

Ext.create('Ext.data.Store', {
    storeId:'proposedTranslationsStore',
    fields:['pos', 'translation', 'stats'],
    data:{ 'items': []},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            rootProperty: 'items'
        }
    }
});
