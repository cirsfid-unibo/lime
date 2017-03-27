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

Ext.define('AknMain.Language', {
    override: 'LIME.controller.Language',

    requires: [
        'AknMain.notes.Controller',
        'AknMain.LangProp',
        'AknMain.IdGenerator',
        'AknMain.utilities.String',
        'AknMain.attachments.AttachmentsHandler'
    ],

    config: {
        metadataClass: 'meta'
    },

    init : function() {
        this.callParent(arguments);
        this.application.on('editorDomChange', this.onNodeChange, this);
    },

    onNodeChange : function(node, deep) {
        var me = this, fly = Ext.fly(node);
        if (!node) return;
        
        if ( deep === false ) {
            DomUtils.setNodeInfoAttr(node, 'hcontainer', " {data}");
        } else if ( fly && fly.is('.inline')) {
            me.onNodeChange(fly.parent('.hcontainer', true), false);
        } else {
            Ext.each(Ext.Array.push(Ext.Array.toArray(node.querySelectorAll('.hcontainer')), node), function(node) {
                me.onNodeChange(node, false);
            });
        }
    },

    beforeLoad: function(params) {
        var metaResults = [];
        if (params.docDom) {
            var documents = params.docDom.querySelectorAll('*[class~=' + DocProperties.documentBaseClass + ']');
            if(documents.length) {
                Ext.each(documents, function(doc, index) {
                    metaResults.push(Ext.Object.merge(this.processMeta(doc, params), {docDom: doc}));
                }, this);    
            } else {
                metaResults.push(this.processMeta(null, params));
            }
                   
            // Set the properties of main document which is the first docuemnt found
            // params object contains properties inserted by user, 
            // metaResults contains properties founded in the document
            metaResults[0].docLang = metaResults[0].docLang || params.docLang;
            metaResults[0].docLocale = metaResults[0].docLocale || params.docLocale;
            metaResults[0].docType = metaResults[0].docType || params.docType;
            params.docLang = metaResults[0].docLang;
            params.docLocale = metaResults[0].docLocale;
            params.docType = metaResults[0].docType;
        } else {
            metaResults.push(this.processMeta(null, params));
            metaResults[0].docType = params.docType;
        }

        params.metaDom = metaResults.length && metaResults[0].metaDom;
        params.metaResults = metaResults;

        this.getController('AknMain.notes.Controller').preProcessNotes(params.docDom);
        return params;
    },

    processMeta: function(doc, params) {
        var meta, result = {}, ownDoc;
        
        result.docMarkingLanguage = params.docMarkingLanguage;
        
        if(!doc || !doc.querySelector("*[class="+this.getMetadataClass()+"]")) {
            result.metaDom = this.createBlankMeta();
        }  else {
            meta = doc.querySelector("*[class=" + this.getMetadataClass() + "]");
            result = {}, ownDoc = doc.ownerDocument;
            if (meta && meta.parentNode) {
                var language = meta.querySelector("*[class=FRBRlanguage]"),
                    country = meta.querySelector("*[class=FRBRcountry]");
    
                if (language) {
                    result.docLang = language.getAttribute('language');
                }
                if (country) {
                    result.docLocale = country.getAttribute('value');
                }
                result.metaDom = meta.parentNode.removeChild(meta);
            }
        }
        if (doc)
            result.docType = DomUtils.getDocTypeByNode(doc);         
        
        return result;
    },
    
    createBlankMeta: function() {
        var meta = document.createElement('div');
        meta.setAttribute('class', this.getMetadataClass());
        return meta;
    },

    performLoad: function(config) {
        // Remove diacritics from attributes
        config.docText = AknMain.utilities.String.removeDiacriticsFromAttrs(config.docText);
        this.callParent(arguments);
    },

    afterLoad: function(params) {
        this.callParent(arguments);
        
        var documentNode = params.docDom.querySelector('*[class="'+DocProperties.getDocClassList()+'"]');
        if(documentNode && !documentNode.getAttribute("akn_name")) {
            documentNode.setAttribute("akn_name", DocProperties.getDocType());
        }

        Ext.each(params.docDom.querySelectorAll('['+'akn_class'+']'), function(node) {
            var align = node.getAttribute('akn_class');
            if ( !Ext.isEmpty(align) ) {
                node.setAttribute('style', 'text-align: '+align+';');
            }
        });

        // Add proprietary namespace for the given locale if it is missing
        if(DocProperties.documentInfo.docLocale == 'uy') {
            var el = params.docDom.querySelector('.document');
            if (el && !el.getAttribute("xmlns:uy"))
                el.setAttribute("xmlns:uy", "http://uruguay/propetary.xsd");
        }

        // Remove all note ref numbers from Word imported documents.
        Ext.each(params.docDom.querySelectorAll('span.noteRefNumber'), function(node) {
            node.parentNode.removeChild(node);
        });
    },

    beforeTranslate : function(config) {
        var params = this.callParent(arguments);
        var dom = params.docDom;
        Ext.each(dom.querySelectorAll('[style]'), function(node) {
            var align = node.getAttribute('style').match(/text-align:\s*(\w+);/);
            if ( align && align[1] ) {
                node.setAttribute('akn_class', align[1]);
            }
        });
        var nameAttr = 'akn_name';
        Ext.each(dom.querySelectorAll('.formula'), function(node) {
            if (  !node.getAttribute(nameAttr)  ) {
                var type = Config.getLanguageConfig().formulaName || "" ;
                node.setAttribute(nameAttr, type);
            }
        });
        // Removing data-old-text attribute it's useless for the output
        Ext.each(dom.querySelectorAll('[data-old-text]'), function(node) {
            node.removeAttribute('data-old-text');
        });
        return params;
    },

    translateContent: function(html, success, failure) {
        var config = {
            output : 'akn',
            includeFiles : [Config.getLocaleXslPath()]
        };
        var xslt = Config.getLanguageTransformationFile("LIMEtoLanguage");
        var attributeNormalizer = Config.getLanguagePath()+'AknAttributesNormalizer.xsl';
        html = AknMain.utilities.String.removeDiacriticsFromAttrs(html)
        Server.applyXslt(html, [xslt,attributeNormalizer], success, failure, config);
    },

    getLanguagePrefix: function() {
        return LangProp.attrPrefix;
    },

    handleMarkedElBeforeTranslate: function(root, wrappingEls) {
        var me = this;

        Ext.each(root.querySelectorAll('*[' + DomUtils.elementIdAttribute + ']'), function(node) {
            var intId = node.getAttribute(DomUtils.elementIdAttribute),
                hrefElements = root.querySelectorAll("["+LangProp.attrPrefix+"href = '#"+intId+"'], [href='#"+intId+"']");
                //TODO: improve this to work with complete href eg: /uy/..../#id

            //Set a language unique id (eId)
            var newId = me.setNodeId(root, node, (hrefElements.length != 0)),
                status = node.getAttribute(LangProp.attrPrefix +'status'),
                wId = node.getAttribute(LangProp.attrPrefix +'wId');

            Ext.each(hrefElements, function(hrefElement) {
                var oldHref = hrefElement.getAttribute(LangProp.attrPrefix+"href") || hrefElement.getAttribute("href");
                if ( newId && !status || status != 'removed' || !wId ) {
                    hrefElement.setAttribute("href", oldHref.replace(intId, newId));
                } else if (wId) {
                    hrefElement.setAttribute("href", oldHref.replace(intId, wId));
                }
            });

            if ( newId ) {
                Ext.each(root.querySelectorAll("[current='#"+intId+"']"), function(node) {
                    var old = node.getAttribute('current');
                    node.setAttribute('current', old.replace(intId, newId));
                });
                me.aknIdMapping[newId] = intId;
            }
        });

        // Add ids also to wrapping elements
        Ext.each(wrappingEls, me.setNodeId.bind(me, root));

        me.getController('AknMain.attachments.AttachmentsHandler')
            .beforeTranslate(root);
    },

    setNodeId: function(root, node, enforce) {
        var me = this;
        var newId = AknMain.IdGenerator.generateId(node, root, enforce);
        var oldId = node.getAttribute(LangProp.attrPrefix + LangProp.elIdAttr);

        // TODO: understand how to manage changing ids
        if ( oldId && newId && oldId != newId ) {
            node.setAttribute(LangProp.attrPrefix + 'wId', oldId);
        }

        if (newId !== '') {
            node.setAttribute(LangProp.attrPrefix + LangProp.elIdAttr, newId);
        }

        return newId;
    }
});