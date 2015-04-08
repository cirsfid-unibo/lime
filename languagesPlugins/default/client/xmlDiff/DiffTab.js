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

Ext.define('LIME.ux.xmlDiff.DiffTab', {
    extend : 'Ext.panel.Panel',
    alias : 'widget.diffTab',
    requires : ['Ext.ux.Iframe'],

    cls : 'editorTab diffTab',

    notEditMode : true,

    config : {
        pluginName : "xmlDiff"
    },

    width : '100%',
    padding : 0,
    margin : 0,
    border : 0,
    layout : {
        type : 'vbox',
        padding : '0',
        align : 'stretch'
    },

    // Properties id (string), url (string), new (boolean)
    firstDoc : {},
    secondDoc : {},

    // Called when docs change
    // Updates selection button/texfield labels and fires either 'docsSelected'
    // or 'docsDeselected' event.
    onSelectedDocsChanged: function () {
        var firstButton = this.down('fieldset:first *[cls=selectButton]'),
            secondButton = this.down('fieldset:last *[cls=selectButton]'),
            changeMsg = Locale.getString("changeDocument", this.getPluginName()),
            selectMsg = Locale.getString("selectDocument", this.getPluginName());

        firstButton.setText(this.firstDoc.id ? changeMsg : selectMsg);
        secondButton.setText(this.secondDoc.id ? changeMsg : selectMsg);
        
        this.down('fieldset:first textfield').setValue(this.firstDoc.path);
        this.down('fieldset:last textfield').setValue(this.secondDoc.path);

        if (this.firstDoc.id && this.secondDoc.id)
            this.fireEvent('docsSelected', this);
        else
            this.fireEvent('docsDeselected', this);
    },

    // Unselect both documents.
    clearSelectedDocuments: function() {
        this.firstDoc = {};
        this.secondDoc = {};
        this.query("textfield").forEach(function (field) {
            field.setValue("");
        });
        this.onSelectedDocsChanged();
    },

    disableEditButton: function () {
        this.down('*[cls=editButton]').disable();
    },

    enableEditButton: function () {
        this.down('*[cls=editButton]').enable();
    },

    iframeSource: '',

    // Set the url of the currently active iframe.
    setIframeSource: function (url, callback) {
        this.iframeSource = url;
        var iframe = this.down('*[cls=diffContainer]').getActiveTab().getPlugin('iframe');
        iframe.setRawSrc(url, callback);
    },

    // Set the iframe as loading.
    setLoading: function () {
        var iframe = this.down('*[cls=diffContainer]').getActiveTab().getPlugin('iframe');
        iframe.setLoading();
    },

    initComponent : function() {
        var me = this;

        me.items = [{
            xtype : "panel",
            frame : true,
            style : {
                borderRadius : "0px",
                border : "0px"
            },
            layout : {
                type : 'hbox'
            },
            items : [{
                xtype : 'fieldset',
                collapsible : false,
                border : 0,
                flex : 97,
                items : [{
                    xtype : 'fieldcontainer',
                    layout : 'hbox',
                    items : [{
                        xtype : 'textfield',
                        fieldLabel : Locale.getString("firstDocumentLabel", me.getPluginName()),
                        //value : Locale.getString("currentDocument", me.getPluginName()),
                        readOnly : true,
                        labelWidth : 80,
                        flex : 1
                    }, {
                        xtype : 'button',
                        cls : 'selectButton',
                        handler: function () {
                            this.up('diffTab').fireEvent('firstDocSelected', this.up('diffTab'));
                        }
                    }]
                }]
            }, {
                xtype : 'button',
                cls : 'resetButton',
                text : Locale.getString("resetDocument", me.getPluginName()),
                handler : function () {
                    this.up('diffTab').clearSelectedDocuments();
                } 
            },{
                xtype : 'button',
                cls : 'editButton',
                text : me.editButtonLabel,
                margin: "0px 0px 0px 5px",
                handler: function () {
                    this.up('diffTab').fireEvent('edit', this.up('diffTab'));
                }
            }, {
                xtype : 'fieldset',
                collapsible : false,
                border : 0,
                flex : 100,
                items : [{
                    xtype : 'fieldcontainer',
                    layout : 'hbox',
                    items : [{
                        xtype : 'textfield',
                        fieldLabel : Locale.getString("secondDocumentLabel", me.getPluginName()),
                        readOnly : true,
                        labelWidth : 80,
                        flex : 1
                    }, {
                        xtype : 'button',
                        cls : 'selectButton',
                        handler: function () {
                            this.up('diffTab').fireEvent('secondDocSelected', this.up('diffTab'));
                        }
                    }]
                }]
            }, {
                xtype : 'button',
                cls : 'printDiffButton',
                text : "Print",
                margin: "0px 0px 0px 5px",
                handler: function () {
                    var url = cmp.up('diffTab').iframeSource;
                    if (url)
                        window.open(url);
                }
            }]
        }, {
            xtype : "tabpanel",
            cls : 'diffContainer',
            flex : 1,
            border : 0,
            items : [{
                title : Locale.getString("textTabTitle", me.getPluginName()),
                format : 'text',
                plugins : [{
                    ptype : 'iframe',
                    pluginId : 'iframe'
                }]
            }, {
                title : Locale.getString("xmlTabTitle", me.getPluginName()),
                format : 'xml',
                plugins : [{
                    ptype : 'iframe',
                    pluginId : 'iframe'
                }]
            }],
            listeners : {
                tabchange: function () {
                    var cmp = this.up('diffTab');
                    if (cmp.iframeSource)
                        cmp.fireEvent('diffTypeChanged', cmp);
                }
            }
        }];
        me.callParent(arguments);
    }
});
