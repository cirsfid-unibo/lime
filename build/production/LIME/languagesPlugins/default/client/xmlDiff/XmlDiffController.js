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

Ext.define('LIME.controller.XmlDiffController', {
    extend : 'Ext.app.Controller',
    
    views: ["LIME.ux.xmlDiff.DiffPanel"],

    refs : [{
        selector : 'appViewport',
        ref : 'appViewport'
    }, {
        selector: 'xmlDiff',
        ref: 'diffPanel'
    }],

    config : {
        pluginName : "xmlDiff",
        diffXmlServiceUrl : "php/diff/index.php",
        diffServiceUrl : "php/AKNDiff/index.php",
        initDiffPage: "php/AKNDiff/data/empty.html"
    },
    
    previousDiff: {
        docsId: {},
        docsUrl: {}
    },
    
    maybeDiff : function() {
        if(!this.getDiffPanel()) return;
        var i = 0, diff = true;
        for (; i < this.selectedDocs.length; i++) {
            if (!this.selectedDocs[i].id) {
                diff = false;
                break;
            }
        }
        return (diff) ? this.getDocsUrl() : this.setEmptyPage();
    },

    setViewConfig : function() {
        var me = this, diffPanel = me.getDiffPanel(), 
            selectDocumentButtons = diffPanel.query("*[cls=selectButton]"), show = true;
        Ext.each(selectDocumentButtons, function(selectButton, index) {
            selectButton.docIndex = selectButton.docIndex || index;
            var docId = me.selectedDocs[selectButton.docIndex].id;
            selectButton.setText((docId) ? me.strings.changeDoc : me.strings.selectDoc);
        });
        me.maybeDiff();
    },
    
    setEmptyPage: function() {
        this.setUrl(this.getInitDiffPage());
    },

    getIframePlugin : function(tab) {
        var me = this, diffPanel = me.getDiffPanel(), 
            cmp = tab || diffPanel.down("*[cls=diffContainer]").getActiveTab();
        return cmp.getPlugin('iframe');
    },
    /**
     * This function set the pdf by calling the pdf viewer plugin
     * this is the only interaction with "pdfplugin" plugin
     * @param {String} url The url of pdf to view
     */
    setUrl : function(url) {
        var plugin = this.getIframePlugin();
        plugin.setSrc(url);
    },

    setLoading : function() {
        var plugin = this.getIframePlugin();
        plugin.setLoading();
    },

    getDiff : function(docsUrl) {
        var me = this, diffPanel = me.getDiffPanel(), format = diffPanel.down("*[cls=diffContainer]").getActiveTab().format || 'text',
            params = {
            from : docsUrl.doc1,
            to : docsUrl.doc2/*,
            css : 'http://localhost/new-wawe/resources/stylesheets/diff.css'*/,
            format: format
        }, url = (format=="xml") ? me.getDiffXmlServiceUrl() : me.getDiffServiceUrl();
        url += '?' + Ext.urlEncode(params);
        me.setUrl(url);
    },

    getDocsUrl : function() {
        var me = this, params = {
                requestedService : 'EXPORT_FILES'
            }, changed = false;
        Ext.each(me.selectedDocs, function(doc, index) {
            var name = "doc" + (index + 1);
            doc.id = (doc.id == 'editorDoc') ? DocProperties.documentInfo.docId : doc.id;
            params[name] = doc.id;
            if (me.previousDiff.docsId[name] != params[name]) {
                me.previousDiff.docsId[name] = params[name];
                changed = true;
            }
        }, me);
        if (!changed) {
            me.getDiff(me.previousDiff.docsUrl);
        } else {
            me.setLoading();
            Ext.Ajax.request({
                url : Utilities.getAjaxUrl(),
                method : 'POST',
                params : params,
                scope : me,
                success : function(result, request) {
                    var jsonData = {};
                    jsonData = Ext.decode(result.responseText, true);
                    if (jsonData && jsonData.docsUrl) {
                        me.previousDiff.docsUrl = jsonData.docsUrl;
                        me.getDiff(jsonData.docsUrl);
                    } else {
                        alert("no url");
                    }
                },
                failure : function() {
                    alert("Ajax failure");
                }
            });
        }
    },

    selectDocument : function(button, docIndex) {
        var me = this, textfield = button.up().down("textfield"), 
            otherDoc = me.selectedDocs[1-docIndex].id, workUri, indexes, config = {};
        // If user is selecting the second document
        if (otherDoc) {
            otherDoc = (otherDoc == 'editorDoc') ? DocProperties.documentInfo.docId : otherDoc;
            indexes = Utilities.globalIndexOf("/", otherDoc);
            workUri = (indexes.length >= 2) ? otherDoc.substr(0, indexes[indexes.length - 2]) : otherDoc;
        }
        config = {
            path: workUri,
            allowOnlyInPaths: workUri,
            notAllowedPaths: otherDoc,
            notAllowedPathRender: function(el, record) {
                Ext.tip.QuickTipManager.register({
                    target: el.dom.getAttribute('id'),
                    text: Locale.getString("forbiddenElement", me.getPluginName())
                });
            },
            callback: function(doc) {
                me.selectedDocs[docIndex] = Ext.clone(doc);
                textfield.setValue(doc.path);
                me.setViewConfig();
            },
            scope: me
        };
        me.application.fireEvent(Statics.eventsNames.selectDocument, config); 

    },
    
    clearSelectedDocuments: function(cmp) {
        var fields = cmp.up().query("textfield");
        
        this.selectedDocs = [{}, {}];
        Ext.each(fields, function(field) {
            field.setValue("");
        });
    },
    
    init : function() {
        var me = this;
        
        /*
         {
            path : Locale.getString("currentDocument", me.getPluginName()),
            id : 'editorDoc'
        }
         * */
        me.selectedDocs = [{}, {}],
        
        me.strings = {
            changeDoc : Locale.getString("changeDocument", me.getPluginName()),
            selectDoc : Locale.getString("selectDocument", me.getPluginName())
        },
        
        this.control({
            'xmlDiff': {
                activate: me.setViewConfig
            },
            '*[cls=selectButton]': {
                click: function(cmp) {
                    me.selectDocument(cmp, cmp.docIndex);
                }
            },
            '*[cls=resetButton]': {
                click: function(cmp) {
                    me.clearSelectedDocuments(cmp);
                    me.setViewConfig();
                }
            },
            'tabpanel[cls=diffContainer]': {
                tabchange: me.maybeDiff
            }
        });
    }
});
