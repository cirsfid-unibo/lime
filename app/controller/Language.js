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

    metaTemplate : {
        outer : {
            'identification' : {
                'FRBRWork' : {
                    'FRBRcountry' : {
                        '@value' : null
                    }
                },

                'FRBRExpression' : {
                    'FRBRlanguage' : {
                        '@language' : null
                    }
                },

                'FRBRManifestation' : {
                }
            }
            // TODO References
        },

        inner : {
            'FRBRthis' : {
                '@value' : null
            },
            'FRBRuri' : {
                '@value' : null
            },
            'FRBRdate' : {
                '@date' : null,
                '@name' : null
            },
            'FRBRauthor' : {
                '@href' : null,
                '@as' : null
            },
            'componentInfo' : {
                'componentData' : {
                    '@id' : null,
                    '@href' : null,
                    '@name' : null,
                    '@showAs' : null
                }
            }
        }
    },

    /**
     * Call the language translate function.
     * If the ajax request is successful the related view is updated.
     * Note that this function doesn't return anything since it asynchronously
     * changes the content of a view.
     * @param {Object} params
     * @param {Function} [callback] Function to call after translating
     */
    translateContent : function(params, callback, view) {
        var languageController = this, 
            editorController = this.getController("Editor"),
            tmpElement = params.docDom,
            unusedElements = tmpElement.querySelectorAll(DomUtils.getTempClassesQuery()), 
            markedElements = tmpElement.querySelectorAll("*[" + DomUtils.elementIdAttribute + "]"),
            focusedElements  = tmpElement.querySelectorAll("."+DocProperties.elementFocusedCls),
            langPrefix = languageController.getLanguagePrefix(),
            counters = {};

        if (DocProperties.frbrDom) {
            var root = tmpElement.querySelector("*["+DocProperties.docIdAttribute+"]");
            var metaDom = Ext.clone(DocProperties.frbrDom);
            metaDom.setAttribute("class", "meta");
            if (root && !root.querySelector("*[class*=meta]")) {
                root.insertBefore(metaDom, root.firstChild);    
            }
        }
        
        // TODO: decide if this part is general for all languages or specific
        try {
            DomUtils.cleanNodeFromExtId(tmpElement, true);

            //Remove all unused elements
            Ext.each(unusedElements, function(element) {
                var classes = element.getAttribute("class");
                //Remove all elements including breaking elements that don't have children
                if (classes != DomUtils.breakingElementClass || !element.hasChildNodes()) {
                    element.parentNode.removeChild(element);
                }
            });
            
            Ext.each(focusedElements, function(node) {
                Ext.fly(node).removeCls(DocProperties.elementFocusedCls);
            });
            
            //Apply rules for all marked elements
            Ext.each(markedElements, function(element) {
                var intId = element.getAttribute(DomUtils.elementIdAttribute), newId,
                    hrefElements = tmpElement.querySelectorAll("*["+langPrefix+"href = '#"+intId+"']");
                //Set a language unique Id
                newId = languageController.setLanguageMarkingId(element, counters, tmpElement);
                Ext.each(hrefElements, function(hrefElement) {
                    hrefElement.setAttribute(langPrefix+"href", "#"+newId);
                });
                Interpreters.wrappingRulesHandlerOnTranslate(element);
            }, this);
        } catch(e) {
            if (view && Ext.isFunction(view.setLoading)) {
                view.setLoading(false);
            }
            Ext.log({level: "error", stack: true}, "Language.translateContent - "+e);
            return;
        }
        
        var tmpHtml = editorController.serialize(tmpElement);
        
        //temporary trick to remove focus class when removeCls don't work
        tmpHtml = tmpHtml.replace(/(class=\"[^\"]+)(\s+\bfocused\")/g, '$1"');

        //Ext.log(false, tmpHtml);
        Language.translateContent(tmpHtml, DocProperties.documentInfo.docMarkingLanguage, {
            success : function(responseText) {
                // pretty print the code because codemirror is not enough
                var xmlPretty = vkbeautify.xml(responseText);
                if (Ext.isFunction(callback)) {
                    callback.call(languageController, xmlPretty);
                }
                if (view && Ext.isFunction(view.setLoading)) {
                    view.setLoading(false);
                }
            },
            failure : function() {
                alert("error");
                if (view && Ext.isFunction(view.setLoading)) {
                    view.setLoading(false);
                }
            }
        });
    },
    
    beforeTranslate: function(callback, config, view) {
       var languageController = this, editorController = this.getController("Editor"),
            beforeTranslate = TranslatePlugin.beforeTranslate,
        //removing all ext generated ids
        editorContent = editorController.getContent().replace(/id="ext-gen(\d)+"/g, ""), 
        params = {}, newParams, newFn;
        
        if (view && Ext.isFunction(view.setLoading)) {
            view.setLoading(true);
        }
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
        languageController.translateContent(newParams, callback, view);
    },
    
    buildInternalMetadata : function(withContainer){
        var internalMetadata = document.createElement('div'),
            info = DocProperties.documentInfo,
            child;
            
        internalMetadata.setAttribute('class', Statics.metadata.internalClass);
        child = Utilities.jsonToHtml(info);
        internalMetadata.appendChild(child);
        
        if (withContainer && DocProperties.frbrDom) {
            var container = document.createElement('div');
            container.setAttribute('class', Statics.metadata.containerClass);   
            container.appendChild(internalMetadata);
            container.appendChild(Ext.clone(DocProperties.frbrDom));
            return container; 
        }
        return internalMetadata;
    },

    /**
     * Build the metadata starting from a template.
     * @param {Object} values The values to be mapped in the metadata
     * @param {Boolean} dom If true returns a DOM element, if false returns an Object
     */
    buildMetadata : function(values, dom, docUri){
        var serializer = new XMLSerializer(),
            container = document.createElement('div'),
            metaTemplate = Ext.clone(Config.getLanguageConfig().metaTemplate),
            identification = metaTemplate['identification'],
            work = identification['FRBRWork'],
            expression = identification['FRBRExpression'],
            manifestation = identification['FRBRManifestation'],
            internalMetadata,
            uriRegex = {
                workUri : '(\.xml)|(%lang%@)/',
                workOnlyNumber : '/\\w{3}@.*$',
                expressionUri : '(\.xml)'
            };
            
        // Build the main structure
        container.setAttribute('class', Statics.metadata.containerClass);
        internalMetadata = this.buildInternalMetadata(container);
        container.appendChild(internalMetadata);

        // Populate template
        // Example: identification['FRBRWork']['FRBRCountry']['@value'] = values.nationality;
        if (values && values.work && values.expression && values.manifestation){
            var newWorkUriRegex = new RegExp(uriRegex.expressionUri.replace('%lang%', values.expression.docLang), 'gi');
                
            work['FRBRcountry']['@value'] = values.work.nationality;
            work['FRBRthis']['@value'] = docUri.replace(newWorkUriRegex, '');
            work['FRBRuri']['@value'] = docUri.replace(new RegExp(uriRegex.workOnlyNumber, 'gi'), '');
            //work['FRBRdate']['@date'] = Ext.Date.format(values.work.date, 'Y-m-d');
            work['FRBRdate']['@date'] = values.work.date;
            
            expression['FRBRthis']['@value'] = docUri.replace(uriRegex.expressionUri, '');
            expression['FRBRuri']['@value'] = docUri.split(values.expression.docLang+'@')[0]+values.expression.docLang+'@';
            expression['FRBRlanguage']['@language'] = values.expression.docLang;
            //expression['FRBRdate']['@date'] = Ext.Date.format(values.expression.date, 'Y-m-d');
            expression['FRBRdate']['@date'] = values.expression.date;
            
            manifestation['FRBRthis']['@value'] = docUri;
            manifestation['FRBRuri']['@value'] = docUri; // TODO what about the suffix (e.g. akn)?
            //manifestation['FRBRdate']['@date'] = Ext.Date.format(values.manifestation.date, 'Y-m-d');
            
        }

        // Save metadata in DocProperties
        DocProperties.metadata = metaTemplate;
        DocProperties.frbrDom = null;
        // Convert to HTML
        if (dom) {
            var frbr = Utilities.jsonToHtml(metaTemplate);
            frbr.setAttribute('class', Statics.metadata.frbrClass);
            this.parseFrbrMetadata(frbr);
            container.appendChild(frbr);
            container.setAttribute('class', Statics.metadata.containerClass);
            return container;
        }
        return mainTemplate;
    },

    /**
     * Store metadata in an object by parsing the
     * given XML DOM.
     */
    parseMetadata : function(xmlDom, xmlString, noSideEffects) {
        var metaObject = {}, extDom;
        try {
            extDom = Ext.get(xmlDom);
        } catch(e) { //Ext.Element sometimes fails with IE browsers.
            var parser = new DOMParser();
            var doc = parser.parseFromString(xmlString, "application/xml");
            extDom = Ext.get(doc);
        }    
         var internalMetadata = extDom.down('*[class=internalMetadata]'), 
             docLang, docLocale, docType, nationality, frbrDom;
            if (internalMetadata) {
                docLang = internalMetadata.down('*[class=docLang]');
                docLocale = internalMetadata.down('*[class=docLocale]'); 
                docType = internalMetadata.down('*[class=docType]');
                docMarkingLanguage = internalMetadata.down('*[class=docMarkingLanguage]');
                if (docLang && docLang.dom.firstChild && docLang.dom.firstChild.nodeValue) {
                    metaObject.docLang = docLang.dom.firstChild.nodeValue;
                }
                if (docLocale && docLocale.dom.firstChild && docLocale.dom.firstChild.nodeValue) {
                    metaObject.docLocale = docLocale.dom.firstChild.nodeValue;
                }
                if (docType && docType.dom.firstChild && docType.dom.firstChild.nodeValue) {
                    metaObject.docType = docType.dom.firstChild.nodeValue;
                }
                if (docMarkingLanguage && docMarkingLanguage.dom.firstChild && docMarkingLanguage.dom.firstChild.nodeValue) {
                    metaObject.docMarkingLanguage = docMarkingLanguage.dom.firstChild.nodeValue;
                }
            }
            
            frbrDom = extDom.down("*[class=frbr]", true);
            if (frbrDom) {
                metaObject.frbrObj = this.parseFrbrMetadata(frbrDom, noSideEffects);
                metaObject.frbrDom = frbrDom;
                metaObject.nationality =  DocProperties.frbr.work.nationality;
            }
        return metaObject;
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
        if (newId != '') {
            markedElement.setAttribute(langPrefix + DomUtils.langElementIdAttribute, newId);
            markedElement.setAttribute(langPrefix + Language.getElementIdAttribute(), newId);
        }
            
        return newId;
    },
    
    parseFrbrMetadata : function(dom, noSideEffects) {
        var frbr, 
            frbrDom = Ext.get(dom);

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
            DocProperties.frbrDom = dom;   
            this.application.fireEvent(Statics.eventsNames.frbrChanged);  
        }
        return frbr;
    },
    
    getLanguagePrefix: function() {
         var languageConfig = LanguageConfigLoader.getConfig();
         return languageConfig.markupMenuRules.defaults.attributePrefix;       
    },
    
    nodeGetLanguageAttribute: function(node, attribute) {
        var prefix = this.getLanguagePrefix(),
            value = node.getAttribute(prefix+attribute);
        
        return {
            name: prefix+attribute,
            value: value
        };
    },

    /**
     * Execute the custom request needed to save the document.
     * @param {Object} values A set of key-value pairs that contain some information about the document
     * @param {Object} params Parameters of the HTTP request
     * @param {Function} callback A callback function to be executed if/when the request is successful
     * It gets two parameters: the request's response object and the uri of the saved document
     * @param {Object} scope The scope of the callback function
     * TODO Move somewhere else (not related to the language)
     */
    saveDocument : function(docUrl, params, callback, scope) {
        var params = Ext.Object.merge(params, {
            requestedService : Statics.services.saveAs,
            file : docUrl
        });

        Ext.Ajax.request({
            url : Utilities.getAjaxUrl(),
            params : params,
            scope : this,
            success : function(response) {
                if (Ext.isFunction(callback)) {
                    // Use Ext.callback to keep the scope
                    Ext.callback(callback, scope, [response, docUrl]);
                }
            }
        });
    },
    
    beforeLoad: function(params, callback, noSideEffects) {
        var me = this, app = this.application, beforeLoad = LoadPlugin.beforeLoad,
            XMLS = new XMLSerializer(),
            editorController = me.getController("Editor"),
            newParams = params,
            newFn, docDom, docText,
            parser = new DOMParser(), doc, docCounters = {}, openedDocumentsData = [];
        // Checking that before load will be called just one time per document
        if (beforeLoad && !newParams.beforeLoaded) {
            if (params.docText) {
                // IE exception
                try {
                    docDom = parser.parseFromString(params.docText, "application/xml");
                    if (docDom.documentElement.tagName == "parsererror" || docDom.documentElement.querySelector("parseerror") || docDom.documentElement.querySelector("parsererror")) {
                        callback(params);
                        return;
                    } else {
                        params.docDom = docDom;
                    }
                } catch(e) {
                    Ext.log({level: "error"}, "Language.beforeLoad"+e);
                    callback(params);
                    return;
                }
            }
            
            newFn = Ext.Function.bind(beforeLoad, LoadPlugin, [params]);
            newParams = newFn();
            if (newParams) {
                newParams.beforeLoaded = true;
                
                if (newParams.metaResults && !noSideEffects) {
                    DocProperties.docsMeta = {};
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
                    try {
                        docText = editorController.serialize(newParams.docDom.firstChild);
                    } catch(e) {
                        docText = "";
                    }
                    params.docText = docText || XMLS.serializeToString(newParams.docDom);
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
        this.application.on(Statics.eventsNames.translateRequest, this.beforeTranslate, this);
        // now before translate on documentLoaded is useless
        //this.application.on(Statics.eventsNames.documentLoaded, this.beforeTranslate, this);
        this.application.on(Statics.eventsNames.afterLoad, this.afterLoad, this);
        this.application.on(Statics.eventsNames.beforeLoad, this.beforeLoad, this);
        this.application.on(Statics.eventsNames.saveDocument, this.saveDocument, this);
        this.application.on(Statics.eventsNames.beforeSave, this.beforeSave, this);
        this.application.on(Statics.eventsNames.afterSave, this.afterSave, this);

        this.control({
            'main' : {
                tabchange: function(panel, newC, oldC) {
                    var me = this;
                    if(!newC.noChangeModeEvent) {
                        Ext.defer(function() {
                            me.application.fireEvent(Statics.eventsNames.changedEditorMode, {
                                sidebarsHidden: newC.notEditMode,
                                markingMenu: newC.markingMenu
                            });            
                        }, 100);    
                    }
                }
            }
        });
    }
});
