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
        'AknMain.notes.Controller'
    ],

    config: {
        metadataClass: 'meta'
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
        return params;
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
            params.metaDom = metaResults[0].metaDom;
        } else {
            metaResults.push(this.processMeta(null, params));
            metaResults[0].docType = params.docType;
            params.metaDom = metaResults[0].metaDom;
        }

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
    }
});