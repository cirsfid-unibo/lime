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
 * This is the plugin for loading documents
 */

Ext.define('LIME.ux.LoadPlugin', {
    singleton : true,
    alternateClassName : 'LoadPlugin',

    metadataClass : 'meta',
    authorialNoteClass : 'authorialNote',
    changePosAttr: 'chposid',
    changePosTargetAttr: 'chpos_id',
    refToAttribute: 'refto',

    supLinkTemplate : new Ext.Template('<sup><a class="linker" href="#">{markerNumber}</a></sup>'),

    beforeLoad : function(params) {
        var metaResults = [], extdom, documents, treeData = [];
        if (params.docDom) {
            extdom = Ext.get(params.docDom);
            documents = extdom.query("*[class~=" + DocProperties.documentBaseClass + "]");
            Ext.each(documents, function(doc, index) {
                metaResults.push(Ext.Object.merge(this.processMeta(doc, params), {docDom: doc}));
            }, this);
                       
            this.processNotes(extdom);
            
            // Set the properties of main document which is the first docuemnt found
            if (metaResults[0]) {
                // params object contains properties inserted by user, 
                // metaResults contains properties founded in the document
                metaResults[0].docLang = metaResults[0].docLang || params.docLang;
                metaResults[0].docLocale = metaResults[0].docLocale || params.docLocale;
                metaResults[0].docType = metaResults[0].docType || params.docType;
                params.docLang = metaResults[0].docLang;
                params.docLocale = metaResults[0].docLocale;
                params.docType = metaResults[0].docType;
                params.metaDom = metaResults[0].metaDom;
            }
        }
        params.treeData = treeData;
        params.metaResults = metaResults;
        return params;
    },

    afterLoad : function(params, app) {
    },
    
    processMeta: function(doc, params) {
        var extdom = Ext.get(doc),
            meta = extdom.down("*[class=" + this.metadataClass + "]"),
            result = {};
            
        result.docType = DomUtils.getDocTypeByNode(doc);
        result.docMarkingLanguage = params.docMarkingLanguage;
        if (meta && meta.dom.parentNode) {
            var language = meta.down("*[class=FRBRlanguage]", true),
                country = meta.down("*[class=FRBRcountry]", true);

            if (language) {
                result.docLang = language.getAttribute('language');
            }
            if (country) {
                result.docLocale = country.getAttribute('value');
            }
            result.metaDom = meta.dom.parentNode.removeChild(meta.dom);
        }
        return result;
    },
    
    processNotes : function(extdom) {
        var athNotes = extdom.query("*[class~=" + this.authorialNoteClass + "]"), 
            linkTemplate = this.supLinkTemplate,
            authCounter = 0;
            
        Ext.each(athNotes, function(element, index) {
            var parent = element.parentNode, 
                markerNumber = element.getAttribute('akn_marker'),
                elId = 'athNote_' + index,
                tmpElement,  link, tmpExtEl;

            while(!markerNumber) {
                var newMarker = 'note'+(++authCounter);
                if (extdom.query("*[akn_marker=" + newMarker + "]").length == 0) {
                    markerNumber =  newMarker;   
                }
            }
           tmpElement = Ext.DomHelper.createDom({
                tag : 'span',
                cls: 'posTmpSpan',
                html : linkTemplate.apply({
                    'markerNumber' : markerNumber
                })
            });
            tmpElement.querySelector('a').setAttribute(this.refToAttribute, elId);
            //TODO: move to constants
            tmpElement.setAttribute(this.changePosAttr, elId);
            element.setAttribute(this.changePosTargetAttr, elId);
            element = parent.replaceChild(tmpElement, element);
            //TODO: imporve this
            if (parent.nextSibling) {
                parent.parentNode.insertBefore(element, parent.nextSibling);
            } else {
                parent.parentNode.appendChild(element);
            }
        }, this);
    }
});