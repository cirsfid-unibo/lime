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
     * @property {Object} frbrTemplate
     * FRBR metadata
     */
    frbrTemplate : {
        work : null,
        expression : null,
        manifestation : null
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
     * @property {Object} currentEditorFile
     * This object contains information about opened document
     */
    currentEditorFile : {
        id : ''
    },

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
    getDocClassList : function() {
        var docType = this.documentInfo.docType;
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
        this.currentEditorFile.id = '';
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
        this.currentEditorFile.id = id;
    },

    /**
     * This function updates the documentInfo property
     * @param {Object} values The new documentInfo object
     */
    setDocumentInfo : function(values) {
        this.documentInfo = Ext.Object.merge(this.documentInfo, values);
    },

    /**
     * This function updates the frbr property
     * @param {Object} values The new frbr object
     */
    setFrbr : function(values) {
        var newFrbr = Ext.Object.merge(this.frbr, values);
        this.frbr = newFrbr;
    },

    /**
     * This function clears and initializes metadata objects
     * @param {Object} app The new frbr object
     */
    clearMetadata : function(app) {
        this.initVars();
        app.fireEvent(Statics.eventsNames.frbrChanged);
    },

    getDocumentUri : function() {
        if (this.frbr && this.frbr.manifestation) {
            return this.frbr.manifestation.FRBRuri;
        }
        return;
    },

    insertChildInOrder: function(parent, child, parentStructure, childStructure) {
        var indexInParent = parentStructure.children.indexOf(childStructure),
            refNode, tmpNode;
        if(indexInParent == -1 || indexInParent == parentStructure.children.length-1) {
            parent.appendChild(child);
        } else {
            for(var i = indexInParent+1; i < parentStructure.children.length; i++) {
                refNode = parent.querySelector("[class='" + parentStructure.children[i].name + "']");
                if(refNode) break;
            }
            if(refNode) {
                parent.insertBefore(child, refNode);
            } else {
                parent.appendChild(child);
            }
        }
    },

    updateMetadata: function(config) {
        // console.info('updateMetadata', config);
        var obj = config.metadata.obj,
            nodes = config.path.split("/"),
            targetNode = nodes[nodes.length-1],
            parentTarget = obj,
            afterNode,
            result = 0,
            me = this;
        Ext.Array.remove(nodes, targetNode);

        if(config.isAttr) {
            Ext.Array.push(nodes, targetNode);
        }

        //console.log('update metadata')
        Ext.each(nodes, function(el) {
            var parent = Language.getMetadataStructure();
            if (parentTarget[el] == undefined) {
                //console.log('creating ', el);
                var child = document.createElement('div');
                child.setAttribute('class', el);
                var found = false;
                for(var i = 0; i < parent.children.length; i++) {
                    //console.log(parent.children[i].name, el)
                    if (parent.children[i].name == el) {
                        //console.log(this);
                        me.insertChildInOrder(parentTarget.el, child, parent, parent.children[i]);
                        //parent = parent.children[i];
                        found = true;
                        //console.log('updateMetadata, found', el);
                        break;
                    }
                }
                if (!found) {
                    //console.log('updateMetadata, not found and creating', el);
                    //console.log('parent', parent);
                    parentTarget.el.appendChild(child);
                }
                parentTarget[el] = {
                    el: child
                }
            }
            parentTarget = parentTarget[el];
        });
        if(config.isAttr) {
            if(parentTarget)
                for(var key in config.data)
                    parentTarget.el.setAttribute(key, config.data[key]);
        } else if (parentTarget) {
            try {
                if(config.overwrite) {
                    config.after = targetNode;
                } else if (!config.append) {
                    /* Using Ext.Array.push is a trick to transform the value
                     * in array if it isn't an array and array remain the same */
                    Ext.each(Ext.Array.push(parentTarget[targetNode]), function(child) {
                        parentTarget.el.removeChild(child.el);
                    });
                }
                afterNode = (config.after && parentTarget[config.after])
                            ? Utilities.getLastItem(Ext.Array.push(parentTarget[config.after])).el
                            : parentTarget.el.lastChild;
                firstAfterNode = afterNode;
                Ext.each(config.data, function(attributes) {
                    delete attributes["class"];
                    var newElConf = Ext.merge({
                        tag : 'div',
                        cls : targetNode
                    }, attributes);
                    if(afterNode && afterNode.children && afterNode.children.length > 0) {
                        afterNode = Ext.DomHelper.insertAfter(afterNode, newElConf);
                    } else {
                        afterNode = Ext.DomHelper.append(parentTarget.el, newElConf);
                    }
                });
                if(config.overwrite && firstAfterNode) {
                    afterNode.parentNode.removeChild(firstAfterNode);
                }
            } catch(e) {
                Ext.log({level: "error"}, e);
                result = 2;
            }
        } else {
            result = 1;
        }

        return result;
    },

    isAutosaveId: function(id) {
        return !Ext.isEmpty(id.match("/autosave/"));
    },

    initVars : function() {
        this.frbr = Ext.clone(this.frbrTemplate);
        this.documentInfo = Ext.clone(this.documentInfoTemplate);
        this.frbrDom = null;
    },

    constructor : function() {
        this.initVars();
    }
});
