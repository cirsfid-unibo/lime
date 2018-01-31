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
 * This controller takes care of various tasks which are relevant to the marking language
 * such translating the content of the text area (html) into
 * the chosen language by using the specified web service. The XSLT sheet needed for
 * the translation is part of the server side.
 */
// TODO: rename this to Document
Ext.define('LIME.controller.Language', {
    extend : 'Ext.app.Controller',

    listen: {
        global: {
            loadDocument: 'loadDocument'
        }
    },

    init : function() {
        // Create bindings between events and callbacks
        // User's custom callbacks
        this.application.on(Statics.eventsNames.translateRequest, this.processTranslateRequest, this);
        this.application.on(Statics.eventsNames.getDocumentHtml, this.getDocumentHtml, this);
        this.application.on(Statics.eventsNames.afterLoad, this.afterLoad, this);
        this.application.on(Statics.eventsNames.beforeSave, this.beforeSave, this);
        this.application.on(Statics.eventsNames.afterSave, this.afterSave, this);
    },

    loadDocument: function(config) {
        config.docMarkingLanguage = config.docMarkingLanguage ||
                                    Config.languages.length == 1 && Config.languages[0].name;
        config = this.beforeLoadManager(config);

        var success = Config.setLanguage(config.docMarkingLanguage);
        if (!success || !config.docType || !config.docLang || !config.docLocale)
            return this.openNewDocumentWindow(config, !success);

        this.application.fireEvent(Statics.eventsNames.progressStart, null, {
            value:0.1, text: Locale.strings.progressBar.loadingDocument
        });
        this.setDocProperties(config);
        this.loadLanguageConf(config, this.performLoad.bind(this));
    },

    openNewDocumentWindow: function(config, onlyLang) {
        Ext.widget('newDocument', {
            tmpConfig: config,
            onlyLanguage: onlyLang
        }).show();
    },

    setDocProperties: function(config) {
        DocProperties.removeAll();
        DocProperties.setDocId(config.docId || User.getDefaultFilePath());
        DocProperties.documentInfo.docType = config.docType;
        DocProperties.documentInfo.docLang = config.docLang;
        DocProperties.documentInfo.docLocale = config.docLocale;
        DocProperties.documentInfo.originalDocId = config.originalDocId;
        DocProperties.documentInfo.docMarkingLanguage = config.docMarkingLanguage;
    },

    loadLanguageConf: function(config, callback) {
        var docType = Ext.isString(config.alternateDocType) ? config.alternateDocType : config.docType;

        this.application.fireEvent(
            Statics.eventsNames.progressUpdate,
            Locale.strings.progressBar.configurationFiles
        );
        var pluginData = this.getStore('LanguagesPlugin').loadPluginData(docType, config.docLocale);

        this.application.fireEvent(
            Statics.eventsNames.progressUpdate,
            Locale.strings.progressBar.configurationFiles
        );
        this.application.fireEvent(Statics.eventsNames.languageLoaded, pluginData.data);
        callback(config, pluginData.styles);
    },

    performLoad: function(config, styleUrls) {
        var app = this.application;
        app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.loadingDocument);
        // Clear previous undo levels
        this.getController('UndoManager').reset();

        // If the document loaded is empty, use the template
        // following the complicated rules in our json configuration files.
        if (config.docText == '<div> &nbsp; </div>')
            config.docText = this.getStore('LanguagesPlugin').buildEmptyDocumentTemplate();

        config.docDom = this.getController('Editor').loadDocument(config.docText, styleUrls).ownerDocument;
        app.fireEvent(Statics.eventsNames.afterLoad, config);
        app.fireEvent(Statics.eventsNames.progressEnd);
    },

    processTranslateRequest: function(callback, config, cmp, metaNode) {
        var me = this,
            html = me.getHtmlToTranslate();

        me.translateContent(html, function(responseText) {
            // pretty print the code because codemirror is not enough
            var xmlPretty = vkbeautify.xml(responseText);
            if (Ext.isFunction(callback)) {
                callback.call(me, xmlPretty, me.aknIdMapping, html);
            }
        }, function() {
            Ext.log({level: "error"}, "Document not translated");
        });
    },

    getDocumentHtml: function(callback) {
        var html = this.getHtmlToTranslate();
        Ext.callback(callback, this, [html]);
    },

    getHtmlToTranslate: function(config, cmp, metaNode) {
        var newConfig = this.beforeTranslate(config, cmp) || config;

        return this.prepareToTranslate(newConfig, metaNode);
    },

    /**
     * Call the language translate function.
     * If the ajax request is successful the related view is updated.
     * Note that this function doesn't return anything since it asynchronously
     * changes the content of a view.
     * @param {Object} params
     */
    prepareToTranslate : function(params, metaNode) {
        var me = this,
            editorController = this.getController("Editor"),
            tmpElement = params.docDom,
            unusedElements = tmpElement.querySelectorAll(DomUtils.getTempClassesQuery()),
            markedElements = tmpElement.querySelectorAll("*[" + DomUtils.elementIdAttribute + "]"),
            focusedElements  = tmpElement.querySelectorAll("."+DocProperties.elementFocusedCls);

        me.aknIdMapping = {};
        me.appendMetadata(tmpElement, metaNode);

        var wrappingElements = [];
        // TODO: decide if this part is general for all languages or specific
        try {
            //Remove all unused elements
            Ext.each(unusedElements, function(element) {
                //Remove all elements that don't have children
                if (!element.hasChildNodes()) {
                    element.parentNode.removeChild(element);
                }
            });

            editorController.removeVisualSelectionObjects(tmpElement);

            Ext.each(focusedElements, function(node) {
                Ext.fly(node).removeCls(DocProperties.elementFocusedCls);
            });

            //Apply rules for all marked elements
            Ext.each(markedElements, function(element) {
                // My manager forced me to write this "if brutto brutto". I'm sorry.
                if (DocProperties.documentInfo.docType == 'documentCollection') return;
                wrappingElements = wrappingElements.concat(Interpreters.wrappingRulesHandlerOnTranslate(element));
            }, this);

            me.handleMarkedElBeforeTranslate(tmpElement, wrappingElements);
        } catch(e) {
            Ext.log({level: "error"}, 'prepareToTranslate '+ e);
            return;
        }

        var tmpHtml = editorController.serialize(tmpElement);
        tmpHtml = tmpHtml.replace(/\bid="[^"]*"/g, "");
        return tmpHtml;
    },

    appendMetadata: function(node, meta) {
        var root = node.querySelector("*["+DocProperties.docIdAttribute+"]")
                    || node.querySelector(".document");

        if (!meta) {
            var docMeta = DocProperties.docsMeta[root.getAttribute(DocProperties.docIdAttribute)];
            meta = docMeta && docMeta.metaDom;
        }

        return this.insertMetaNode(root, meta);
    },

    insertMetaNode: function(docNode, metaNode) {
        if (!docNode || !metaNode) return;
        var getMetaNode = function(node) {
            var children = node.children;
            for (var i = 0; i < children.length; i++) {
                if (children[i].classList.contains('meta'))
                    return children[i];
            }
        }

        var metaDom = Ext.clone(metaNode);
        metaDom.setAttribute('class', 'meta');

        var prevMeta = getMetaNode(docNode);
        if (!prevMeta)
            docNode.insertBefore(metaDom, docNode.firstChild);
        else
            prevMeta.parentNode.replaceChild(metaDom, prevMeta);

        return metaDom;
    },

    beforeTranslate: function(config, cmp) {
       var editorController = this.getController("Editor"),
        //removing all ext generated ids
        editorContent = editorController.getContent(false, cmp).replace(/id="ext-element-(\d)+"/g, "")
                        .replace(/(class=\"[^\"]+)(\s+\bfocused\")/g, '$1"');

        // creating a div that contains the editor content
        var tmpElement = Ext.DomHelper.createDom({
            tag : 'div',
            html : editorContent
        });

        return {
            docDom: tmpElement
        };
    },
    // TODO: this function needs to be refactored
    beforeLoadManager: function(params, noSideEffects) {
        var me = this, app = this.application, docDom, docText,
            parser = new DOMParser(), doc, docCounters = {}, openedDocumentsData = [];

        // Checking that before load will be called just one time per document
        if (!params.beforeLoaded) {
            if ( !noSideEffects ) {
                DocProperties.docsMeta = {};
            }

            if (params.docText) {
                // IE exception
                try {
                    docDom = parser.parseFromString(params.docText, "application/xml");
                    if (!(docDom.documentElement.tagName == "parsererror" ||
                        docDom.documentElement.querySelector("parseerror") ||
                        docDom.documentElement.querySelector("parsererror"))) {
                        params.docDom = docDom;
                    }
                } catch(e) {
                    console.log(e);
                }
            }

            var newParams = me.beforeLoad(params);
            if (newParams) {
                params = newParams;
                params.beforeLoaded = true;

                if (params.metaResults && !noSideEffects) {
                    Ext.each(params.metaResults, function(metaObj, index) {
                        var name = metaObj.docType;
                        docCounters[name] = docCounters[name]+1 || 1;
                        if (metaObj.docDom) {
                            metaObj.docDom.setAttribute(DocProperties.docIdAttribute, index);
                        }
                        name = (docCounters[name]>1) ? name+docCounters[name] : name;
                        openedDocumentsData.push({name: name, docId: index});
                        DocProperties.docsMeta[index] = metaObj;
                    });
                }

                if(params.docDom) {
                    params.docText = DomUtils.serializeToString(params.docDom);
                }
            }
        }
        Ext.Object.each(DocProperties.docsMeta, function(index, obj) {
            obj.docLang = obj.docLang || params.docLang;
            obj.docLocale = obj.docLocale || params.docLocale;
        });
        return params;
    },

    /*
        These functions are ment be overridden by other packages
    */
    beforeLoad: function(params) {},
    afterLoad: function(params) {
        var docEl = params.docDom.querySelector("."+DocProperties.documentBaseClass);
        if(docEl && !docEl.getAttribute(DocProperties.docIdAttribute)) {
            docEl.setAttribute(DocProperties.docIdAttribute, 0);
        }
    },
    beforeSave: function(params) {},
    afterSave: function(params) {},
    translateContent: function(html, success, failure) {
        var xslt = Config.getLanguageTransformationFile("LIMEtoLanguage");
        Server.applyXslt(html, xslt, success, function (error) {
            Ext.callback(failure);
        });
    },
    getLanguagePrefix: function() {
        return '';
    },
    handleMarkedElBeforeTranslate: function(root, wrappingEls) {}
});
