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

Ext.define('LIME.controller.UriManagerController', {
    extend : 'Ext.app.Controller',

    views : ["LIME.ux.uriManager.UriManagerWindow"],

    refs : [{
        selector : 'appViewport',
        ref : 'appViewport'
    }, {
        selector : 'main toolbar',
        ref : 'mainToolbar'
    }],

    config : {
        pluginName : "uriManager",
        btnCls : "openUriManagerBtn"
    },

    stores : {},
    
    getters: {
        uri: function(record) {
            return {value: record.get("value")};
        },
        alias: function(record) {
            return {value: record.get("value"), name: record.get("name")};
        }
    },

    addUriButton : function() {
        var me = this, toolbar = me.getMainToolbar();
        if (!toolbar.down("[cls=" + me.getBtnCls() + "]")) {
            toolbar.add("->");
            toolbar.add({
                cls : me.getBtnCls(),
                margin : "0 10 0 0",
                text : Locale.getString("uriManagerTitle", me.getPluginName()),
                listeners : {
                    click : Ext.bind(me.openManager, me)
                }
            });
        }
    },

    removeUriButton : function() {
        var me = this, toolbar = me.getMainToolbar(), openUriBtn = toolbar.down("[cls=" + me.getBtnCls() + "]");
        if (openUriBtn) {
            toolbar.remove(openUriBtn);
        }
    },

    onInitPlugin : function() {
        this.addUriButton();
        this.stores.uri = Ext.create('Ext.data.Store', {
            fields : ['value']
        });
        this.stores.alias = Ext.create('Ext.data.Store', {
            fields : ["value", "name"]
        });
    },
    
    setStoresData: function() {
        var me = this, editor = me.getController("Editor"), 
            metadata = editor.getDocumentMetadata(),
            work, uris = [], aliases = [];
        me.metadata = metadata;
        if(metadata && metadata.obj && metadata.obj["identification"] && metadata.obj["identification"]["FRBRWork"]) {
            work = metadata.obj["identification"]["FRBRWork"];
            /* Using Ext.Array.push is a trick to transform the value
             * in array if it isn't an array and array remain the same */
            Ext.each(Ext.Array.push(work["FRBRuri"]), function(el) {
                uris.push(el.attr);
            });
            Ext.each(Ext.Array.push(work["FRBRalias"]), function(el) {
                aliases.push(el.attr);
            });
        }
        me.stores.uri.loadData(uris);
        me.stores.alias.loadData(aliases);
    },

    onRemoveController : function() {
        this.removeUriButton();
    },

    openManager : function() {
        var newWindow = Ext.widget('uriManagerWindow');
        this.setStoresData();
        newWindow.show();
    },

    addUri : function(grid) {
        this.addRecord(grid, {
            value : "uri"
        });
    },

    addAlias : function(grid) {
        this.addRecord(grid, {
            value : "uri",
            name : "name"
        });
    },

    addRecord : function(grid, record, index) {
        var store = this.getGridStore(grid), 
        plugin = grid.getPlugin("cellediting"), 
        index = index || store.getCount();
        store.insert(index, [record]);
        plugin.startEdit(index, 0);
    },

    getGridStore : function(cmp) {
        if (cmp.storeCls && this.stores[cmp.storeCls]) {
            return this.stores[cmp.storeCls];
        }
        return null;
    },
    
    applyChanges: function(data) {
        var me = this, editor = me.getController("Editor");
        if(DocProperties.updateMetadata({
            metadata : editor.getDocumentMetadata(),
            path : "identification/FRBRWork/FRBRuri",
            data : data.uri,
            after : "FRBRthis"
        })) {
            Ext.MessageBox.alert("Error", "Error setting Uris");
        };
        if(DocProperties.updateMetadata({
            metadata : editor.getDocumentMetadata(),
            path : "identification/FRBRWork/FRBRalias",
            data : data.alias,
            after : "FRBRuri"
        })) {
            Ext.MessageBox.alert("Error", "Error setting Aliases");
        }; 
    },

    init : function() {
        var me = this;
        this.control({
            'uriManagerWindow grid' : {
                beforerender : function(cmp) {
                    if (cmp.storeCls && me.stores[cmp.storeCls]) {
                        cmp.getView().bindStore(me.stores[cmp.storeCls]);
                    }
                }
            },
            'uriManagerWindow grid tool' : {
                click : function(cmp) {
                    switch(cmp.type) {
                        case 'plusUri':
                            me.addUri(cmp.up("grid"));
                            break;
                        case 'plusAlias':
                            me.addAlias(cmp.up("grid"));
                            break;
                    }
                }
            },
            'uriManagerWindow button[cls=applyUriChanges]' : {
                click : function(cmp) {
                    var data = {
                        uri: [],
                        alias: []
                    };
                    Ext.Object.each(me.stores, function(name, store) {
                        store.each(function(record) {
                            data[name].push(me.getters[name](record));
                        });
                    });
                    me.applyChanges(data);
                    cmp.up("window").close();
                }
            },
            'uriManagerWindow button[cls=cancelUriChanges]' : {
                click : function(cmp) {
                    cmp.up("window").close();
                }
            }
        });
    }
});
