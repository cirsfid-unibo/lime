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
 * Marked document proprieties
 */
Ext.define('LIME.DocProperties', {
    /* Since this is merely a utility class define it as a singleton (static members by default) */
    singleton : true,
    alternateClassName : 'DocProperties',

    /**
     * @property {String} metadataClass
     * The class attribute of the metadata node
     */
    metadataClass : 'limeMetadata',

    /**
     * @property {String} documentBaseClass
     * This is the first class of the document element
     */
    documentBaseClass: 'document',

    elementFocusedCls: 'focused',

    /**
     * @property {String} docIdAttribute
     * The name of the attribute which contains the id of the document
     */
    docIdAttribute: 'docid',

    /**
     * @property {String} markingLanguageAttribute
     * The name of the attribute which contains the marking language
     */
    markingLanguageAttribute: 'markinglanguage',

    languageAttribute: 'language',

    /**
     * @property {Ext.Template} docClsTpl
     * The class attribute of div that contains the document that has to be marked.
     */
    docClsTpl : new Ext.Template("document {docType}"),

    /**
     * @property {Object} documentInfoTemplate
     * Informations abount document
     */
    documentInfoTemplate : {
        nationality : null,
        docType : null,
        docLocale : null,
        date : null,
        number : null,
        docName : null,
        docLang : null,
        docMarkingLanguage: null,
        folder: null
    },

    /**
     * @property {Object} markedElements
     * This object contains information about marked elements.
     */
    markedElements : {},
    /**
     * @property {Object} elementsWidget
     * This object contains information about widget of marked elements.
     */
    elementsWidget : {},

    elementsConfig : {},
    elementsConfigByName: {},

    /**
     * Return the document's type
     */
    getDocType : function() {
        return this.documentInfo.docType;
    },

    /**
     * Return the correct document's class based
     * on the metadata.
     */
    getDocClassList : function(docType) {
        docType = docType || this.documentInfo.docType;
        return this.docClsTpl.apply({
            docType : docType
        });
    },

    /**
     * This function returns the language code of the opened document
     * returns {String} The language code
     */
    getLang : function() {
        return this.documentInfo.docLang;
    },
    /**
     * This function removes all document proprieties
     */
    removeAll : function() {
        this.markedElements = {};
    },

    setElementWidget: function(name, widget) {
        this.elementsWidget[name] = widget;
    },

    getElementWidget: function(name) {
        return this.elementsWidget[name];
    },

    getNodeWidget: function(node) {
        return this.getElementWidget(DomUtils.getElementNameByNode(node));
    },

    clearElementConfig: function() {
        this.elementsConfig = {};
        this.elementsConfigByName = {};
    },

    setElementConfig: function(id, config) {
        this.elementsConfig[id] = config;
        this.elementsConfigByName[config.name] = this.elementsConfigByName[config.name] || [];
        this.elementsConfigByName[config.name].push(config);
    },

    getElementConfig: function(id) {
        return this.elementsConfig[id];
    },

    getChildConfigByName: function(parent, name) {
        if ( parent && name && parent.children.length) {
            for ( var i in parent.children ) {
                if ( parent.children[i].name == name ) {
                    return this.getElementConfig(parent.children[i].id);
                }
            }
        }
    },

    getFirstButtonByName: function(name, type) {
        var elements = this.elementsConfigByName[name];
        if ( elements && elements.length ) {
            if ( type ) {
                elements = elements.filter(function(config) {
                    return (config.type == type);
                });
            }
            return elements[0];
        }
    },

    getElementsConfigList: function() {
        return Ext.Object.getValues(this.elementsConfigByName).map(function(config) {
            return Ext.Object.getValues(config)[0];
        });
    },

    getMarkedElementsByName: function(name) {
        return Ext.Object.getValues(this.markedElements).filter(function(obj) {
            return obj.button.name == name;
        });
    },

    /**
     * This function set the properties of a given marked element id
     * @param {String} markingId
     * @param {Object} properties
     */
    setMarkedElementProperties : function(markingId, properties) {
        this.markedElements[markingId] = properties;
    },

    getMarkedNode : function(markingId) {
        var el = this.getMarkedElement(markingId);
        return el && el.htmlElement;
    },

    /**
     * Returns the marked element that has the specified id
     * @param {String} markingId
     * @returns {Object}
     */
    getMarkedElement : function(markingId) {
        return this.markedElements[markingId];
    },

    /**
     * Set the name of the document
     * @param {String} name The new name of the document
     */
    setDocName : function(name) {
        this.documentInfo.docName = name;
    },

    /**
     * Set the id of the document
     * @param {String} name The new id of the document
     */
    setDocId : function(id) {
        this.documentInfo.docId = id;
    },

    getDocId: function() {
        return this.documentInfo.docId;
    },

    /**
     * This function updates the documentInfo property
     * @param {Object} values The new documentInfo object
     */
    setDocumentInfo : function(values) {
        this.documentInfo = Ext.Object.merge(this.documentInfo, values);
    },

    /**
     * This function clears and initializes metadata objects
     * @param {Object} app The new frbr object
     */
    clearMetadata : function(app) {
        this.initVars();
    },

    isAutosaveId: function(id) {
        return !Ext.isEmpty(id.match("/autosave/"));
    },

    initVars : function() {
        this.documentInfo = Ext.clone(this.documentInfoTemplate);
    },

    constructor : function() {
        this.initVars();
    }
});
