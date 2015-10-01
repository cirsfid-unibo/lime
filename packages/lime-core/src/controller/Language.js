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

Ext.define('LIME.controller.Language', {

    // extend the ext controller
    extend : 'Ext.app.Controller',
    // set up the views
    views : ['Main', 'main.editor.Path'],

    refs : [{
        ref: 'main',
        selector: 'main'
    }],

    processTranslateRequest: function(callback, config, cmp, frbrDom) {
        var me = this,
            html = me.getHtmlToTranslate();

        me.translateContent(html, callback);
    },

    getDocumentHtml: function(callback) {
        var html = this.getHtmlToTranslate();
        Ext.callback(callback, this, [html]);
    },

    getHtmlToTranslate: function(config, cmp, frbrDom) {
        var newConfig = this.beforeTranslate(config, cmp) || config;

        return this.prepareToTranslate(newConfig, frbrDom);
    },

    /**
     * Call the language translate function.
     * If the ajax request is successful the related view is updated.
     * Note that this function doesn't return anything since it asynchronously
     * changes the content of a view.
     * @param {Object} params
     */
    prepareToTranslate : function(params, frbrDom) {
        var me = this,
            editorController = this.getController("Editor"),
            tmpElement = params.docDom,
            unusedElements = tmpElement.querySelectorAll(DomUtils.getTempClassesQuery()),
            markedElements = tmpElement.querySelectorAll("*[" + DomUtils.elementIdAttribute + "]"),
            focusedElements  = tmpElement.querySelectorAll("."+DocProperties.elementFocusedCls),
            langPrefix = me.getLanguagePrefix(),
            counters = {};

        me.aknIdMapping = {};
        me.appendMetadata(tmpElement, frbrDom);

        // TODO: decide if this part is general for all languages or specific
        try {
            //Remove all unused elements
            Ext.each(unusedElements, function(element) {
                var classes = element.getAttribute("class");
                //Remove all elements including breaking elements that don't have children
                if (classes != DomUtils.breakingElementClass || !element.hasChildNodes()) {
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

                var intId = element.getAttribute(DomUtils.elementIdAttribute), newId,
                    hrefElements = tmpElement.querySelectorAll("*["+langPrefix+"href = '#"+intId+"']");//TODO: improve this to work with complete href eg: /uy/..../#id

                var elName = DomUtils.getNameByNode(element),
                    button = DocProperties.getFirstButtonByName(elName),
                    wrappingElements = Interpreters.wrappingRulesHandlerOnTranslate(element, button);

                //Set a language unique Id
                newId = me.setLanguageMarkingId(element, counters, tmpElement);
                var status = element.getAttribute(langPrefix +'status');
                var wId = element.getAttribute(langPrefix +'wId');

                Ext.each(hrefElements, function(hrefElement) {
                    var oldHref = hrefElement.getAttribute(langPrefix+"href");
                    if ( !status || status != 'removed' || !wId ) {
                        hrefElement.setAttribute(langPrefix+"href", oldHref.replace(intId, newId));
                    } else if (wId) {
                        hrefElement.setAttribute(langPrefix+"href", oldHref.replace(intId, wId));
                    }
                });

                if ( newId ) {
                    me.aknIdMapping[newId] = intId;
                }

                // Add ids also to wrapping elements
                Ext.each(wrappingElements, function (el) {
                    var id = me.setLanguageMarkingId(el, counters, tmpElement);
                });
            }, this);
        } catch(e) {
            Ext.log({level: "error"}, 'prepareToTranslate '+ e);
            return;
        }

        var tmpHtml = editorController.serialize(tmpElement);

        tmpHtml = tmpHtml.replace(/\bid="[^"]*"/g, "");
        return tmpHtml;
    },

    translateContent: function(html, callback) {
        var me = this;
        Language.translateContent(html, DocProperties.documentInfo.docMarkingLanguage, {
            success : function(response) {
                // pretty print the code because codemirror is not enough
                var xmlPretty = vkbeautify.xml(response.responseText);

                if (Ext.isFunction(callback)) {
                    callback.call(me, xmlPretty, me.aknIdMapping, html);
                }
            },
            failure : function() {
                Ext.log({level: "error"}, "Document not translated");
            }
        });
    },

    appendMetadata: function(node, meta) {
        meta = meta || DocProperties.frbrDom;

        if (meta) {
            var root = node.querySelector("*["+DocProperties.docIdAttribute+"]")
                        || node.querySelector(".document");
            var metaDom = Ext.clone(meta);
            metaDom.setAttribute("class", "meta");
            if (root && !root.querySelector("*[class*=meta]")) {
                root.insertBefore(metaDom, root.firstChild);
            }
            return metaDom;
        }
    },

    beforeTranslate: function(config, cmp) {
       var languageController = this, editorController = this.getController("Editor"),
            beforeTranslate = TranslatePlugin.beforeTranslate,
        //removing all ext generated ids
        editorContent = editorController.getContent(false, cmp).replace(/id="ext-element-(\d)+"/g, "")
                        .replace(/(class=\"[^\"]+)(\s+\bfocused\")/g, '$1"'),
        params = {}, newParams, newFn;

        // creating a div that contains the editor content
        var tmpElement = Ext.DomHelper.createDom({
            tag : 'div',
            html : editorContent
        });

        if (beforeTranslate) {
            params.docDom = tmpElement;
            newFn = Ext.Function.bind(beforeTranslate, TranslatePlugin, [Ext.Object.merge(params, config)]);
            newParams = newFn();
            if (!newParams) {
                newParams = params;
            }
        }
        return newParams;
    },

    /**
     * This function builds and set an id attribute starting from the given element.
     * The build process is based on the hierarchy of the elements.
     * The difference between this and {@link LIME.controller.Marker#getMarkingId} is that this id is
     * specific to the language plugin currently in use while the latest is for development purposes.
     * @param {HTMLElement} markedElement The element we have to set the attribute to
     * @param {Object} counters Counters of elements
     */
    getLanguageMarkingIdGeneral : function(markedElement, prefix, root, counters) {
        var newId = '', elementId = markedElement.getAttribute(DomUtils.elementIdAttribute);
        if (elementId && DocProperties.markedElements[elementId]) {
            var counter = 1, button = DocProperties.markedElements[elementId].button;
            // If the element has already an language id, leave it
            if (markedElement.getAttribute(prefix + DomUtils.langElementIdAttribute))
                return;
            newId = button.id.replace(DomUtils.vowelsRegex, ''),
            //don't use "parent" variable because in IE is a reference to Window
            parentMarked = DomUtils.getFirstMarkedAncestor(markedElement.parentNode);
            if (parentMarked) {
                parentId = parentMarked.getAttribute(prefix + DomUtils.langElementIdAttribute);
                if (!counters[parentId]) {
                    counters[parentId] = {};
                } else if (counters[parentId][newId]) {
                    counter = counters[parentId][newId];
                }
                counters[parentId][newId] = counter + 1;
                newId = parentId + '-' + newId;
            } else {
                if (!counters[newId]) {
                    counters[newId] = counter + 1;
                } else {
                    counter = counters[newId];
                }
            }
            newId += counter;
        }

        return newId;
    },

    setLanguageMarkingId: function(markedElement, counters, root) {
        var me = this, langSetId, newId, langPrefix = me.getLanguagePrefix();
        if(Ext.isFunction(Language.getLanguageMarkingId)) {
            langSetId = Ext.Function.bind(Language.getLanguageMarkingId, Language);
        } else {
            langSetId = me.getLanguageMarkingIdGeneral;
        }
        newId = langSetId(markedElement, langPrefix, root, counters);

        var oldId = markedElement.getAttribute(langPrefix + Language.getElementIdAttribute());

        // TODO: understand how to manage changing ids
        if ( oldId && newId && oldId != newId ) {
            markedElement.setAttribute(langPrefix + 'wId', oldId);
        }

        if (newId != '') {
            markedElement.setAttribute(langPrefix + DomUtils.langElementIdAttribute, newId);
            markedElement.setAttribute(langPrefix + Language.getElementIdAttribute(), newId);
        }

        return newId;
    },

    parseFrbrMetadata : function(dom, noSideEffects) {
        var frbr, frbrDom = Ext.fly(dom);
        frbr = (noSideEffects) ? {} : DocProperties.frbr;
        frbr.work = {};
        frbr.expression = {};
        frbr.manifestation = {};

        var nationality = frbrDom.down('*[class=FRBRWork] *[class=FRBRcountry]', true);
        if (nationality) {
            frbr.work.nationality = nationality.getAttribute('value');
        }
        var workDate = frbrDom.down('*[class=FRBRWork] *[class=FRBRdate]', true);
        if (workDate) {
            frbr.work.date = new Date(workDate.getAttribute('date'));
        }

        var workUri = frbrDom.down('*[class=FRBRWork] *[class=FRBRuri]', true);
        if (workUri) {
            frbr.work.FRBRuri = workUri.getAttribute('value');
        }

        var expLang = frbrDom.down('*[class=FRBRExpression] *[class=FRBRlanguage]', true);
        if (expLang) {
            frbr.expression.docLang = expLang.getAttribute('language');
        }

        var expDate = frbrDom.down('*[class=FRBRExpression] *[class=FRBRdate]', true);
        if (expDate) {
            frbr.expression.date = new Date(expDate.getAttribute('date'));
        }

        var expUri = frbrDom.down('*[class=FRBRExpression] *[class=FRBRuri]', true);
        if (expUri) {
            frbr.expression.FRBRuri = expUri.getAttribute('value');
        }

        var manDate = frbrDom.down('*[class=FRBRManifestation] *[class=FRBRdate]', true);
        if (manDate) {
            frbr.manifestation.date = new Date(manDate.getAttribute('date'));
        }

        var manUri = frbrDom.down('*[class=FRBRManifestation] *[class=FRBRuri]', true);
        if (manUri) {
            frbr.manifestation.FRBRuri = manUri.getAttribute('value');
        }

        if(!noSideEffects) {
            if ( DocProperties.frbrDom ) {
                if ( frbr.work.FRBRuri ) {
                    workUri = DocProperties.frbrDom.querySelector('.FRBRWork .FRBRuri');
                    if ( workUri ) {
                        workUri.setAttribute('value', frbr.work.FRBRuri);
                    }
                }

                if ( frbr.expression.FRBRuri ) {
                    expUri = DocProperties.frbrDom.querySelector('.FRBRExpression .FRBRuri');
                    if ( expUri ) {
                        var expThisUri = DocProperties.frbrDom.querySelector('.FRBRExpression .FRBRthis');
                        expUri.setAttribute('value', frbr.expression.FRBRuri);
                        if ( expThisUri ) {
                            expThisUri.setAttribute('value', frbr.expression.FRBRuri);
                        }
                    }
                }

                if ( frbr.manifestation.FRBRuri ) {
                    manUri = DocProperties.frbrDom.querySelector('.FRBRManifestation .FRBRuri');
                    if ( manUri ) {
                        var manThisUri = DocProperties.frbrDom.querySelector('.FRBRManifestation .FRBRthis');
                        manUri.setAttribute('value', frbr.manifestation.FRBRuri);
                        if ( manThisUri ) {
                            manThisUri.setAttribute('value', frbr.manifestation.FRBRuri);
                        }
                    }
                }
                if ( manDate ) {
                    var date = manDate.getAttribute('date');
                    manDate = DocProperties.frbrDom.querySelector('.FRBRManifestation .FRBRdate');
                    if ( manDate ) {
                        manDate.setAttribute('date', date);
                    }
                }
            } else {
                DocProperties.frbrDom = dom;
            }
            this.application.fireEvent(Statics.eventsNames.frbrChanged);
        }
        return frbr;
    },

    getLanguagePrefix: function() {
        return Language.getAttributePrefix();
    },

    nodeGetLanguageAttribute: function(node, attribute) {
        var prefix = this.getLanguagePrefix(),
            value = node.getAttribute(prefix+attribute);

        return {
            name: prefix+attribute,
            value: value
        };
    },

    beforeLoad: function(params, callback, noSideEffects) {
        var me = this, app = this.application, beforeLoad = LoadPlugin.beforeLoad,
            editorController = me.getController("Editor"),
            newParams = params,
            newFn, docDom, docText,
            parser = new DOMParser(), doc, docCounters = {}, openedDocumentsData = [];
        // Checking that before load will be called just one time per document
        if (beforeLoad && !newParams.beforeLoaded) {
            if ( !noSideEffects ) {
                DocProperties.docsMeta = {};
                DocProperties.frbrDom = null;
            }

            if (params.docText) {
                // IE exception
                try {
                    docDom = parser.parseFromString(params.docText, "application/xml");
                    if (!(docDom.documentElement.tagName == "parsererror" || docDom.documentElement.querySelector("parseerror") || docDom.documentElement.querySelector("parsererror"))) {
                        params.docDom = docDom;
                    }
                } catch(e) {
                    console.log(e);
                }
            }

            newFn = Ext.Function.bind(beforeLoad, LoadPlugin, [params]);
            newParams = newFn();
            if (newParams) {
                newParams.beforeLoaded = true;

                if (newParams.metaResults && !noSideEffects) {
                    Ext.each(newParams.metaResults, function(metaObj, index) {
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

                if(newParams.docDom) {
                    /*try {
                        console.log(newParams.docDom.firstChild);
                        docText = editorController.serialize(newParams.docDom.firstChild);
                    } catch(e) {
                        docText = "";
                    }*/
                    params.docText = DomUtils.serializeToString(newParams.docDom);
                }
                if (newParams.metaDom && !noSideEffects) {
                    this.parseFrbrMetadata(newParams.metaDom);
                }
            } else {
                newParams = params;
            }
        }
        callback(newParams);
    },

    afterLoad: function(params) {
        var docEl = params.docDom.querySelector("."+DocProperties.documentBaseClass);
        if(docEl && !docEl.getAttribute(DocProperties.docIdAttribute)) {
            docEl.setAttribute(DocProperties.docIdAttribute, 0);
        }
        var newFn = Ext.Function.bind(LoadPlugin.afterLoad, LoadPlugin, [params, this.application]);
        newFn();
    },

    beforeSave: function(params) {
        var newFn = Ext.Function.bind(SavePlugin.beforeSave, SavePlugin, [params]);
        newFn();

    },
    afterSave: function(params) {
        var newFn = Ext.Function.bind(SavePlugin.afterSave, SavePlugin, [params, this.application]);
        newFn();
    },

    init : function() {
        // save a reference to the controller
        var languageController = this;

        // Create bindings between events and callbacks
        // User's custom callbacks
        this.application.on(Statics.eventsNames.translateRequest, this.processTranslateRequest, this);
        this.application.on(Statics.eventsNames.getDocumentHtml, this.getDocumentHtml, this);
        // now before translate on documentLoaded is useless
        //this.application.on(Statics.eventsNames.documentLoaded, this.beforeTranslate, this);
        this.application.on(Statics.eventsNames.afterLoad, this.afterLoad, this);
        this.application.on(Statics.eventsNames.beforeLoad, this.beforeLoad, this);
        this.application.on(Statics.eventsNames.beforeSave, this.beforeSave, this);
        this.application.on(Statics.eventsNames.afterSave, this.afterSave, this);
    }
});
