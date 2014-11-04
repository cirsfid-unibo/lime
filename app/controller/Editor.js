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
 * This controller takes care of manipulating the text area reserved for the
 * actual document. It also provides a useful interface for getting and putting data
 * through a lot of getter and setter and utility methods.
 *
 * It also includes the path view where the current hierarchy (starting from the selected
 * node and going up) can be easily seen.
 */
Ext.define('LIME.controller.Editor', {

    extend : 'Ext.app.Controller',

    views : ['main.Editor', 'Outliner', 'main.editor.Path', 'main.editor.Uri','modal.NewDocument'],

    refs : [{
        ref : 'mainEditor',
        selector : '#mainEditor mainEditor'
    }, {
        ref: 'secondEditor',
        selector: '#secondEditor mainEditor'
    },
    {
        ref : 'main',
        selector : 'main'
    }, {
        ref : 'contextMenu',
        selector : 'contextMenu'
    }, {
        ref : 'contextMenuItems',
        selector : 'menuitem[cls=editor]'
    },
    {
        ref : 'outliner',
        selector : 'outliner'
    }, {
        ref : 'mainEditorPath',
        selector : 'mainEditorPath'
    },{
        ref : 'markingMenu',
        selector : 'markingMenu'
    },{
        ref : 'mainToolbar',
        selector : 'mainToolbar'
    }],

    constructor : function(){
        /**
         * @property {HTMLElement} lastFocused The last focused element
         */
        this.lastFocused = null;

        /**
         * @property {Object} defaultElement
         * The default element that wraps the content of the editor (compatible with Ext.DomHelper)
         */
        this.defaultElement = {
            tag : 'div'
        };

        this.callParent(arguments);
    },

    documentTempConfig: {},

    /**
     * Returns a reference to the ExtJS component
     * that contains the editor plugin.
     * @returns {LIME.view.main.Editor} The component that contains the editor
     */
    getEditorComponent : function(cmp) {
        cmp = cmp || this.getMainEditor();
        return cmp.down('tinymcefield');
    },

    /**
     * Returns a reference to the active editor object that allows to
     * use its own interface (that depends on what editor is currently installed e.g. tinyMCE).
     * @returns {Object} A reference to the editor object
     */
    getEditor : function(cmp) {
        return this.getEditorComponent(cmp).getEditor();
    },

    /**
     * Returns the editor iframe container. Useful for positioning.
     * **Warning**: this method only works with those editor which support an
     * independent DOM and thus are forced to include an iframe in the main DOM.
     * @returns {HTMLElement} The iframe element
     */
    getIframe : function(){
        return this.getEditorComponent().iframeEl;
    },

    /**
     * Returns the real height of the editor body.
     * @returns {Number} The height
     */
    getHeight : function(){
        return this.getIframe().getHeight();
    },

    /**
     * Returns the real height of the editor body.
     * @returns {Number} The width
     */
    getWidth : function(){
        return this.getIframe().getWidth();
    },

    /**
     * Enables/Disables boxes, color and custom typography in the editor.
     */
    updateStyle : function(displayBox, displayColor, displayStyle) {
        var el = Ext.fly(this.getEditor().getBody());

        if(displayBox) el.removeCls('noboxes');
        else el.addCls('noboxes');

        if(displayColor) el.removeCls('nocolors');
        else el.addCls('nocolors');

        if(displayStyle) el.addCls('pdfstyle');
        else el.removeCls('pdfstyle');

        var el2 = Ext.fly(this.getEditor(this.getSecondEditor()).getBody());

        if(displayBox) el2.removeCls('noboxes');
        else el2.addCls('noboxes');

        if(displayColor) el2.removeCls('nocolors');
        else el2.addCls('nocolors');

        if(displayStyle) el2.addCls('pdfstyle');
        else el2.removeCls('pdfstyle');
    },

    /*
     * When the buttons structure in marking menu is loaded, load all the CSS
     */
    loadCss: function() {
        var me = this;
        Ext.defer(function() {
            me.application.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.loadingDocumentStyles);    
        }, 1);
        

        var addStyle = function (button) {
            if (!button.waweConfig.pattern) return;
            var styleClass = button.waweConfig.pattern.wrapperClass;
            var styleValue = button.waweConfig.pattern.wrapperStyle;
            if (styleValue.pdf)
                me.addContentStyle('.pdfstyle *[class="' + styleClass + '"]', styleValue.pdf);
            me.applyAllStyles('*[class="' + styleClass + '"]', styleValue, button.waweConfig.shortLabel);
            me.applyAllStyles('.pdfstyle:not(.noboxes) *[class="' + styleClass + '"]', styleValue, button.waweConfig.shortLabel);

            // Apply style to second editor
            var editor2 = me.getSecondEditor();
            if (editor2) {
                if (styleValue.pdf)
                    me.addContentStyle('.pdfstyle *[class="' + styleClass + '"]', styleValue.pdf, editor2);
                me.applyAllStyles('*[class="' + styleClass + '"]', styleValue, button.waweConfig.shortLabel, editor2);
                me.applyAllStyles('.pdfstyle:not(.noboxes) *[class="' + styleClass + '"]', styleValue, button.waweConfig.shortLabel, editor2);
            }
        }

        var counter = 0;
        var buttons = this.getController('MarkingMenu').getAllButtons();
        var iter = function () {
            if (counter < buttons.length) {
                addStyle(buttons[counter++]);
                setTimeout(iter, 0);
            } else {
                me.application.fireEvent(Statics.eventsNames.progressEnd);
            }
        }
        iter();
    },

    /**
     * Returns the editor DOM position inside the whole page (main DOM).
     * @returns {Array} The coordinates of the position as an array (i.e. [x,y])
     */
    getPosition : function(){
        var iframe = this.getIframe();
        return [iframe.getX(), iframe.getY()];
    },

    /**
     * Returns a reference to the internal parser of the editor.
     * **Warning**: this method heavily relies on what kind of editor is used (only tested with tinyMCE).
     * @returns {Object} The intenal parser (its type varies depending on what editor is used)
     */
    getParser : function() {
        return new tinymce.html.DomParser({
            validate : true
        }, tinymce.html.schema);
    },

    /**
     * Returns a reference to the internal serializer of the editor.
     * It's necessary to make some computation on dom elements.
     * **Warning**: this method heavily relies on what kind of editor is used (only tested with tinyMCE).
     * @returns {Object} The serializer (its type varies depending on what editor is used)
     */
    getSerializer : function() {
        //Return the serializer of active editor instead a new serializer
        return tinymce.activeEditor.serializer;
    },

    /**
     * Returns the serialized string of passed HTMLElement
     * @param {HTMLElement} element to serialize
     * @returns {String}
     */
    serialize : function(dom){
        return this.getSerializer().serialize(dom);
    },

    /**
     * This function returns a bookmark to store the current cursor position.
     * @returns {Object} The bookmark object
     */
    getBookmark : function() {
        return this.getEditor().selection.getBookmark();
    },

    /**
     * This function reset the cursor to the given bookmark.
     * @param {Object} bookmark A reference to a bookmark instance
     */
    restoreBookmark : function(bookmark) {
        this.getEditor().selection.moveToBookmark(bookmark);
    },

    /**
     * Returns the selection range expressed in characters. For example if the
     * selection starts at the character i and ends
     * after j characters from the beginning of the row the range will be [i,j]
     * @returns {Number[]} [start, end] The array containing the start and end of the range
     */
    getSelectionRange : function() {
        var ed = this.getEditor(), rng = ed.selection.getRng(), range = [rng.startOffset, rng.endOffset];
        return range;
    },

    showDocumentUri: function(docId) {
        var editorContainer = this.getMainEditor().up(), 
            title, main = this.getMain(),
            uri = DocProperties.getDocumentUri();
        //!docId || !Ext.isString(docId) || DocProperties.isAutosaveId(docId) ||
        uri = (!uri) ? Locale.getString("newDocument") : uri;
        editorContainer.tab.setTooltip(uri);
        main.down("mainEditorUri").setUri(uri);
    },

    /**
     * Allows to apply the given pattern
     * to the whole selection. Be careful when used with non-inline patterns
     * or you could easily destroy the whole document structure!
     * Returns an array containing the marked elements.
     * **Warning**: this method heavily relies on what editor is used
     * @param {String} patternName The name of the pattern to be used (e.g. span, div etc.)
     * @param {Object} [patternProperties] Some optional properties for the pattern
     * @returns {Array} The array of the nodes which the pattern was applied to
     */
    applyPattern : function(patternName, patternProperties) {
        tinymce.activeEditor.formatter.register(patternName, patternProperties);
        tinymce.activeEditor.formatter.apply(patternName);
        var searchRoot = this.getBody();
        var marked = searchRoot.querySelectorAll('span[class*="' + patternProperties.classes + '"]');
        return marked;
    },

    /**
     * Dispatcher for the focus events. It distinguishes
     * between a single node and an array of them.
     * If the given argument is an array of HTMLElement only on the last one
     * all the actions are applied (this avoids a waste of resources to repeat
     * the same actions even on the other nodes without a useful result).
     * @param {HTMLElement/HTMLElement[]/String} nodes The node(s) to focus
     * @param {Object} actions The actions that have to be performed on the node(s), e.g. click, scroll, select and
     */
    focus : function(nodes, actions){
            var markedAscendant,
                lastNode;
            if (Ext.isString(nodes)){
                //This means that "nodes" is an node id
                nodes = this.getBody().querySelectorAll('#'+nodes);
            }else if(!Ext.isArray(nodes)){
                // Uniform to a single type
                nodes = [nodes];
            }
            // If nodes is empty do not continue
            if (nodes.length == 0){
                return null;
            }
            lastNode = nodes[nodes.length-1];
            markedAscendant = DomUtils.getFirstMarkedAncestor(lastNode.parentNode);
            // If we've selected the same node don't do anything
            if (lastNode === this.lastFocused){
                actions.click = false;
            }
            if (nodes.length > 1 && markedAscendant){
                this.focusNode(markedAscendant, actions);
                this.lastFocused = markedAscendant;
            } else {
                this.focusNode(lastNode, actions);
                this.lastFocused = lastNode;
            }
    },

    /**
     * This function focuses the given node and performs the given actions on it.
     * There's a big difference with the focus method since this one only applies on a
     * single node and performs all the given actions on it, while the second
     * uses this method to apply all the actions only on the last node given in the array.
     * The actions that can be performed are:
     *
     * * click: simulate a click event on the given node
     * * select: highlight the node in the view
     * * change: state that the focused node has changed in some way (value, attributes etc.)
     * * scroll: scroll the view to the given node
     *
     * An example of actions object is the following:
     *
     *  {
     *      // Set to true only the ones to perform
     *      click : true,
     *      select : true
     *  }
     *
     * @param {HTMLElement} node The dom node to focus
     * @param {Object} actions The actions to perform
     */
    focusNode : function(node, actions) {
        if (!node)
            return;
        if (actions.select) {
            this.selectNode(node);
        }
        if (actions.scroll) {
            node.scrollIntoView();
        }
        if(actions.highlight){
            var extNode = Ext.fly(node);
            extNode.highlight("FFFF00", {duration: 800 });
        }
        if (actions.change) {
            /* Add an undo level */
            this.getEditor().undoManager.add();
            /* Warn of the change */
            this.changed = true;
            this.application.fireEvent("editorDomChange", node, "partial");
        }
        if (actions.click) {
            this.application.fireEvent('editorDomNodeFocused', node);
        }

    },

    /**
     * Just select the given node in the editor
     * @param {HTMLElement} node The node to highlight
     */
    selectNode : function(node, content) {
        content = (content == undefined) ? true : content;
        this.getEditor().selection.select(node, content);
    },

    setCursorLocation: function(node, offset) {
        this.getEditor().selection.setCursorLocation(node, offset);
    },

    /**
     * Replace the content of the selected text with the text given
     * @param {String} text The substitute text
     */
    setSelectionContent : function(text) {
        this.getEditor().selection.setContent(text);
    },

    /**
     * This function set an attribute to the given element or
     * the given id of the element
     * using name as its name and value as its value.
     * @param {HTMLElement/String} element The node or its id
     * @param {String} name The name of the attribute
     * @param {String} value The value of the attribute
     * @returns {Boolean} true if the attribute was changed, false otherwise
     */
    setElementAttribute : function(elementId, name, value) {
        var element = elementId, oldValue, chaged = false, 
            dom = this.getDom(), query;

        if(Ext.isString(element)) {
            query = new Ext.Template('*[{attr}="{value}"]').apply({
                attr: DomUtils.elementIdAttribute,
                value: element
            });
            element = dom.querySelector(query);
        }

        if (element) {
            oldValue = element.getAttribute(name);
            if(oldValue != value) {
                //set attribute that has the same name of field
                element.setAttribute(name, value);
                /* Prevent from inserting empty attributes */
                if (value == "") {
                    element.removeAttribute(name);
                }
                this.getEditorComponent().fireEvent('change', this.getEditor());
                chaged = element;
            }
        }
        return chaged;
    },

    /**
     * Returns the currently selected text in the format requested.
     * **Warning**: no checks are performed on the given format but
     * it should be one of the following:
     *
     * * html (default)
     * * raw
     * * text
     *
     * **Warning**: this method heavily relies on what editor is used (tested with tinyMCE)
     * @param {String} [formatType] The format of the selection
     */
    getSelectionContent : function(formatType) {
        if (!formatType)
            formatType = "html";
        return this.getEditor().selection.getContent({
            format : formatType
        });
    },

    /**
     * Returns the body element of the dom of the editor.
     * **Warning**: this is _not_ the dom! See the {@link LIME.controller.Editor#getDom}
     * for further details.
     * @returns {HTMLElement} The body element
     */
    getBody : function() {
        return this.getEditor().getBody();
    },

    /**
     * Returns a reference to the dom of the editor.
     * This method is very useful when separated-dom editors are used (such as tinyMCE).
     * @returns {HTMLDocument} A reference to the dom
     */
    getDom : function(cmp) {
        return this.getEditor(cmp).dom.doc;
    },
    /**
     * Returns the Html string of entire dom
     * This method is very useful when separated-dom editors are used (such as tinyMCE).
     * @returns {String}
     */
    getDocHtml: function() {
        var doc = this.getDom().documentElement;
        return DomUtils.serializeToString(doc);
    },

    getDocumentElement: function() {
        var me = this, body = me.getBody();
        return body.querySelector("*[class~='"+DocProperties.documentBaseClass+"']");
    },

    getCurrentDocId: function() {
        var doc = this.getBody(),
           docEl = doc.querySelector("["+DocProperties.docIdAttribute+"]");
        if(docEl) {
            return docEl.getAttribute(DocProperties.docIdAttribute);
        }
        return null;
    },

    getDocumentMetadata: function(docId) {
        var result = {};
        docId = docId || this.getCurrentDocId();
        result.originalMetadata = DocProperties.docsMeta[docId];
        if(result.originalMetadata) {
            result.obj = DomUtils.nodeToJson(result.originalMetadata.metaDom);
            return result;
        }
        return null;
    },

    /**
     * Returns the currently selected node or one of its ascendants
     * found by looking at two possible conditions given as arguments: either
     * a generic marked node or a node with a particular tag name (e.g.
     * div, span, p etc.).
     *
     * **Warning**: the two arguments are mutually exclusive and more
     * priority is given to the first one but both are optional.
     *
     * @param {Boolean} [marked]
     * @param {String} [elementName]
     * @return {HTMLElement} The selected/found element
     */
    getSelectedNode : function(marked, elementName) {
        var selectedNode = this.getEditor().selection.getNode();
        if (marked) {
            return DomUtils.getFirstMarkedAncestor(selectedNode);
        } else if (elementName) {
            return DomUtils.getNodeByName(selectedNode, elementName);
        } else {
            return selectedNode;
        }
    },


    /**
     * This method returns an object containing many things:
     *
     * * text : the content of the selected text
     * * node : the selected node
     * * start : the first node of the selected nodes
     * * end : the last node of the selected nodes
     *
     * All the involved nodes are retrieved depending on the given arguments.
     * Thus you can specify: what should the format of the text be, what
     * tag name should the retrieved nodes have and if start and end should be
     * at the same nesting level.
     *
     * The tag name of the nodes can be specified as an object:
     *
     *      {
     *          start : "div",
     *          end : "p",
     *          current : "span",
     *      }
     *
     * Non specified names are simply ignored.
     *
     * @param {String} [formatType] The format of the selected text
     * @param {Object} [nodeNames] The names of the nodes
     * @param {Boolean} [sameLevel] If true start or end is brought to the same (upper) level as the other one
     */
    getSelectionObject : function(formatType, nodeNames, sameLevel) {
        /* TODO
         *  SE SONO ALLO STESSO LIVELLO E NON SONO FRATELLI SALI FINCHé NON TROVI DUE FRATELLI
         */
        // Avoid lack of the parameter
        nodeNames = nodeNames || {
            start : null,
            end : null,
            current : null
        };
        var selStart = this.getEditor().selection.getStart();
        var selEnd = this.getEditor().selection.getEnd();
        var current = this.getEditor().selection.getNode();
        if (nodeNames.start) {
            selStart = DomUtils.getNodeByName(selStart, nodeNames.start);
        }
        if (nodeNames.end) {
            selEnd = DomUtils.getNodeByName(selEnd, nodeNames.end);
        }
        if (sameLevel){
            var startNesting = DomUtils.nestingLevel(selStart);
            var endNesting = DomUtils.nestingLevel(selEnd);
            var nestingDiff = Math.abs(startNesting-endNesting);
            if (startNesting < endNesting){
                for (var i=0; i<nestingDiff; i++){
                    selEnd = selEnd.parentNode;
                }
            } else if (endNesting < startNesting){
                for (var i=0; i<nestingDiff; i++){
                    selStart = selStart.parentNode;
                }
            }
        }
        if (nodeNames.current) {
            current = DomUtils.getNodeByName(current, nodeNames.current);
        }
        var selInfo = {
            text : this.getSelectionContent(formatType),
            node : current,
            start : selStart,
            end : selEnd
        };
        return selInfo;
    },

    /**
     * Returns the whole content of the editor (__not__ the selection).
     *
     * **Warning**: this method heavily depends on what editor is used.
     * @param {String} formatType Specify the format of the output (html, raw, text etc.)
     */
    getContent : function(formatType) {
        if (!formatType)
            formatType = "html";
        return this.getEditor().getContent({
            format : formatType
        });
    },

    /**
     * Given a css selector, an object with some css properties and
     * the name of a button (to match the class of marked elements)
     * apply the given style by appending one or more style elements
     * by using {@link LIME.controller.Editor#addContentStyle}.
     * @param {String} selector The css selector
     * @param {Object} styleObj An object with some css properties
     * @param {String} buttonName The name of the button
     */
    applyAllStyles : function(selector, styleObj, buttonName, cmp) {
        for (var i in styleObj) {
            // Apply the style on the simple selector
            if (i == "this") {
                this.addContentStyle(selector, styleObj[i], cmp);
            // Otherwise a complex selector was given
            } else if (i.indexOf("this") != -1) {
                var styleCss = styleObj[i];
                selector = i.replace("this", selector);
                this.applyAllStyles(selector, styleObj[i], buttonName, cmp);
            // This means that another element was selected
            } else {
                var styleCss = styleObj[i];
                if (styleCss.indexOf("content:") == -1) {
                    styleCss = "content:'" + buttonName.toUpperCase() + "';" + styleCss;
                }
                this.addContentStyle(selector + ':' + i, styleCss, cmp);
            }

        }
    },

    onPluginLoaded : function(data, styleUrls) {
        var markingMenuController = this.getController('MarkingMenu'),
            mainToolbarController = this.getController('MainToolbar'),
           app = this.application, config = this.documentTempConfig;
        
        if(Ext.isArray(styleUrls)) {
            this.addStyles(styleUrls);
        }

        app.fireEvent(Statics.eventsNames.languageLoaded, data);
        app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.loadingDocument);
        this.loadDocument(config.docText, config.docId);
        app.fireEvent(Statics.eventsNames.progressEnd);
        config.docDom = this.getDom();
        app.fireEvent(Statics.eventsNames.afterLoad, config);
        this.setPath(this.getBody());
        this.showDocumentUri(config.docId);
    },

    addStyles: function(urls) {
        var me = this, editorDom = me.getDom(),
            head = editorDom.querySelector("head");
        Ext.each(urls, function(url) {
            var link = editorDom.createElement("link");
            link.setAttribute("href", url);
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            head.appendChild(link);
        });
    },

    /**
     * Add the given style properties to the elements that match
     * the given css selector.
     * @param {String} selector The css selector
     * @param {String} styleText The string representing the property
     */
    addContentStyle : function(selector, styleText, cmp) {
        DomUtils.addStyle(selector, styleText, this.getDom(cmp), 'limeStyle');
    },

    /**
     * Remove all the custom styles we've added to the editor
     */
    removeAllContentStyle : function (cmp) {
        var style = this.getDom(cmp).querySelector('head #limeStyle');
        if (style)
            style.parentElement.removeChild(style);
    },

    beforeLoadDocument: function(config) {
        var initDocument = this.initDocument, me = this, loaded = false;
        if (!config.docMarkingLanguage && me.getStore('MarkupLanguages').count() == 1) {
            config.docMarkingLanguage = me.getStore('MarkupLanguages').getAt(0).get("name");
        }
        if (config.docMarkingLanguage) {
            if (me.getStore('MarkupLanguages').findExact('name', config.docMarkingLanguage)!=-1) {
               Config.setLanguage(config.docMarkingLanguage, function() {
                    me.getStore('DocumentTypes').loadData(Config.getDocTypesByLang(config.docMarkingLanguage));
                    if (!config.lightLoad) {
                        //Before load
                        me.application.fireEvent(Statics.eventsNames.beforeLoad, config, function(newConfig) {
                            initDocument(newConfig, me);
                        });
                    } else {
                        initDocument(config, me);
                    }

                });
                loaded = true;
            }
        }
        if(!loaded) {
            var newDocumentWindow = Ext.widget('newDocument');
            // TODO: temporary solution
            newDocumentWindow.tmpConfig = config;
            newDocumentWindow.onlyLanguage = true;
            newDocumentWindow.show();
        }
    },

    initDocument : function(config, me) {
        var me = me || this, app = me.application, docType;
        if (!config.docType || !config.docLang || !config.docLocale) {
            var newDocumentWindow = Ext.widget('newDocument');
            // TODO: temporary solution
            newDocumentWindow.tmpConfig = config;
            newDocumentWindow.show();
            return;
        }

        DocProperties.documentInfo.docId = config.docId;
        DocProperties.documentInfo.docType = config.docType;
        DocProperties.documentInfo.docLang = config.docLang;
        DocProperties.documentInfo.docLocale = config.docLocale;
        DocProperties.documentInfo.originalDocId = config.originalDocId;
        DocProperties.documentInfo.docMarkingLanguage = config.docMarkingLanguage;

        me.documentTempConfig = config;

        app.fireEvent(Statics.eventsNames.progressStart, null, {value:0.1, text: Locale.strings.progressBar.loadingDocument});
        docType =  Ext.isString(config.alternateDocType) ? config.alternateDocType : config.docType;
        Ext.defer(function() {
            app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.configurationFiles);
            LanguageConfigLoader.load(docType, config.docLocale, Ext.bind(me.onPluginLoaded, me));
        }, 200, me);
    },

    linkNotes: function(body) {
        var app = this.application, 
            noteLinkers = body.querySelectorAll('*[class="linker"]');
        clickLinker = function() {
            var marker = this.getAttribute(LoadPlugin.refToAttribute),
                note, query;
            if (marker) {
                query = new Ext.Template('*[{attr}="{value}"]').apply({
                    attr: LoadPlugin.changePosTargetAttr,
                    value: marker
                });
                note = editorBody.querySelector(query);
                if(note) {
                    app.fireEvent('nodeFocusedExternally', note, {
                        select : true,
                        scroll : true,
                        click : true
                    });
                }
            }
        };
        Ext.each(noteLinkers, function(linker) {
            linker.onclick = clickLinker;
        }, this);
    },


    searchAndManageMarkedElements: function(body, cmp, noSideEffects) {
        var LanguageController = this.getController('Language'),
            markingMenu = this.getController('MarkingMenu'),
            marker = this.getController('Marker'),
            markedElements = body.querySelectorAll('*[' + DomUtils.elementIdAttribute + ']');
        
        //Parse the new document and build documentProprieties 
        Ext.each(markedElements, function(element, index) {
            var elId = element.getAttribute(DomUtils.elementIdAttribute),
                newElId;
            var nameAttr = element.getAttribute(LanguageController.getLanguagePrefix()+'name');
            var buttonId = DomUtils.getButtonIdByElementId(elId);
            var button = Ext.getCmp(buttonId);
            if (!button) {
                if (elId.indexOf(DomUtils.elementIdSeparator)==-1) {
                    var parent = DomUtils.getFirstMarkedAncestor(element.parentNode);
                    if(parent) {
                        var buttonParent = DomUtils.getButtonByElement(parent);
                        if(buttonParent) {
                            button = buttonParent.getChildByName(elId) || buttonParent.getChildByName(nameAttr);
                        }
                    }
                    if(!button) {
                        var buttons = markingMenu.getButtonsByName(elId) ||
                                  markingMenu.getButtonsByName(nameAttr),
                        buttonKeys;
                        if(buttons) {
                            buttonKeys = Ext.Object.getKeys(buttons);
                            if(buttonKeys.length) {
                                buttonId = buttonKeys[0];
                                button = buttons[buttonId];
                                elId = marker.getMarkingId(buttonId);
                            }
                        }
                    } else {
                        elId = marker.getMarkingId(button.id);
                    }
                }
                if (!button) {
                    if(!noSideEffects) {
                        Ext.MessageBox.alert("FATAL ERROR!!", "The button with id " + buttonId + " is missing!");   
                    }
                    return;
                }
            }

            if(!noSideEffects) {
                DocProperties.setMarkedElementProperties(elId, {
                    button : button,
                    htmlElement : element
                }); 
            }

            //remove inline style
            element.removeAttribute('style');
            element.setAttribute(DomUtils.elementIdAttribute, elId);
            var isBlock = DomUtils.blockTagRegex.test(button.waweConfig.pattern.wrapperElement);
            if(isBlock){
                marker.addBreakingElements(element);
            }
        }, this);
    },

    /**
     * This method ensures that the given text is loaded after
     * some built-in preconditions are met. For example a default
     * content that must wrap the newly loaded text.
     * @param {String} docText The text that has to be loaded
     * @param {String} [docId] The id of the document
     * @param {Function} [callback] Function to call when finished
     * @param {Boolean} [initial] If true removing previous document properties
     * will be skipped
     */
    loadDocument : function(docText, docId, cmp, noSideEffects) {
        var editor = this.getEditor(cmp), editorBody,
            app = this.application;

        //set new content to the editor
        if (Ext.isEmpty(docText)) {
            docText = '&nbsp;';
        }
        
        // Clear Css
        this.removeAllContentStyle(cmp);

        // Clear previous undo levels
        editor.undoManager.clear();
        editor.setContent(docText); // Add a space, empty content prevents other views from updating
        // Add an undo level
        editor.undoManager.add();

        if(!noSideEffects) {
            //Remove all previous document proprieties
            DocProperties.removeAll();
            // save the id of the currently opened file
            DocProperties.setDocId(docId);
        }

        editorBody = editor.getBody();

        this.linkNotes(editorBody);
        this.searchAndManageMarkedElements(editorBody, cmp, noSideEffects);

        if(!noSideEffects) {
            app.fireEvent('editorDomChange', editorBody);
            app.fireEvent(Statics.eventsNames.documentLoaded);
        }
    },

    /**
     * Replace the whole content of the editor with the given string.
     *
     * **Warning**: do NOT use this method to load text. Please refer to
     * {@link LIME.controller.Editor#loadDocument} that will perform additional checks.
     * @param {newContent} The content that has to be set
     * @private
     */
    setContent : function(newContent) {
        //set new content to the editor
        this.getEditor().setContent(newContent);
    },

    /**
     * Replace the given old node(s) with the new one.
     *
     * Note that this method can also replace an array of
     * siblings with a single node.
     *
     * **Warning**: this method doesn't check if the given nodes are siblings!
     * @param {HTMLElement} newNode
     * @param {HTMLElement/HTMLElement[]} oldNodes
     */
    domReplace : function(newNode, oldNodes) {
        if (Ext.isArray(oldNodes)) {
            oldNodes[0].parentNode.insertBefore(newNode, oldNodes[0]);
            Ext.each(oldNodes, function(node) {
                node.parentNode.removeChild(node);
            });
        } else {
            this.getEditor().dom.replace(newNode, oldNodes);
        }
        return newNode;
    },

    /**
     * Split the content into many chunks to be saved (e.g. cookies max size is 4095 bytes)
     * @param {String} content The content to be split
     * @param {Integer} chunkSize The exact size of each chunk
     * @return {String[]} The split content
     */
    splitContent : function(content, chunkSize){
        // Compute how many chunks there are
        var chunks = [];
        var toSplit = content;
        while (toSplit.length > chunkSize){
            var chunk = toSplit.split(chunkSize);

        }
    },

    saveDocument: function(config) {
       var editor = this;
       this.application.fireEvent(Statics.eventsNames.translateRequest, function(xml) {
           xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
           editor.saveDocumentText(xml, config);
       }, {complete: true});
    },

    /**
     * This is a wrapper for Language.saveDocument function
     */
    saveDocumentText: function(text, config) {
        var app = this.application,
            params,
            userInfo = this.getController('LoginManager').getUserInfo(),
            preferencesManager = this.getController('PreferencesManager'),
            languageController = this.getController('Language'),
            frbr = DocProperties.frbr,
            info = DocProperties.documentInfo,
            values = {},
            metadataDom,
            docName,
            editoController = this,
            editorDom = this.getDom(),
            docUrl = DocProperties.documentInfo.docId || Ext.emptyString,
            metadataString,
            xmlSerializer = new XMLSerializer(),
            uriTpl = new Ext.Template('/{nationality}/{docType}/{date}/{number}/{docLang}@/{docName}'),
            uriPartialTmp = new Ext.Template('/{docLang}@/{docName}'),
            saveWindow = (config)? config.view : null, partialUrl;

        // Fill the values to be used to compile the template
        if (config.path) {
            docUrl = config.path;
        }
        if (!config || !config.autosave){
            docName = frbr.manifestation.docName;
           partialUrl = docUrl.substring(1);
           partialUrl = partialUrl.substring(partialUrl.indexOf('/'));
            metadataDom = languageController.buildMetadata(frbr, true, partialUrl);
        } else {
            // TODO: don't call this every autosave
            metadataDom = languageController.buildInternalMetadata(true);
        }

        // Before saving
        app.fireEvent(Statics.eventsNames.beforeSave, {
            editorDom: editorDom,
            metadataDom: metadataDom,
            documentInfo: DocProperties.documentInfo
        });

        try {
        metadataString = xmlSerializer.serializeToString(metadataDom);
        } catch(e) {
            metadataString = Ext.emptyString;
        }

        params = {
            userName : userInfo.username,
            fileContent : text,
            metadata: metadataString
        };

        // Saving phase
        app.fireEvent(Statics.eventsNames.saveDocument, docUrl, params, function(response, docUrl) {
            var responseText = response.responseText, jsonData;
            if(responseText[responseText.length-1] == "1") {
                responseText = responseText.substring(0, (responseText.length-1));
            }
            jsonData = JSON.parse(responseText);

            // If it's an autosave don't show anything
            if (!config || !config.autosave) {
               if (saveWindow){
                   saveWindow.close();
               }

               var msgTpl = Locale.strings.savedToTpl;
               Ext.Msg.alert({
                    title : Locale.strings.saveAs,
                    msg :  new Ext.Template(msgTpl).apply({
                        docName : docName,
                        docUrl : docUrl.replace(docName, '')
                    })
                });
            }

            // After saving
            app.fireEvent(Statics.eventsNames.afterSave, {
                editorDom: editorDom,
                metadataDom: metadataDom,
                documentInfo: DocProperties.documentInfo
            });

            // Save as the last opened
            if (jsonData.path) {
                // Set the current file's id
                DocProperties.setDocId(jsonData.path);
                preferencesManager.setUserPreferences({
                    lastOpened : jsonData.path
                });
            }
        });

    },

    /**
     * This is a callback for the autosave functionality.
     * Do NOT rely on the existence of this function.
     * @private
     */
    autoSaveContent : function(userRequested) {
        /* Check if there has been a change */ /* TODO: pensare a una soluzione più intelligente */
        if (!userRequested && !this.changed)
            return;
        this.changed = false;
        this.saveDocument({
            silent: true,
            autosave: true
        });
    },

    /**
     * Set the callbacks for the autosave plugin in tinyMCE.
     * Do NOT rely on the existence of this function.
     * @private
     */
    tinyInit : function(editor, autoSaveContent) {
        /* The context is the one from the plugin! */
        var tinyautosave = this,
            mainToolbarController = editor.getController('MainToolbar');
        tinyautosave.onPreSave = autoSaveContent;
        userPreferences = editor.getController('PreferencesManager').getUserPreferences(),
        storage = editor.getController('Storage');

        /* Load exemple document if there is no saved document */
        if (!userPreferences.lastOpened) {
            /*Config.setLanguage(Config.languages[0].name, function() {
                editor.application.fireEvent(Statics.eventsNames.languageLoaded, {});
            });*/
            Ext.Ajax.request({
                url : Statics.editorStartContentUrl,
                success : function(response) {
                    var animation = mainToolbarController.highlightFileMenu();
                    // Create a window containing the example document and highlight the file menu
                    var exampleWin = Ext.widget('window', {
                        height : 400,
                        width : 800,
                        modal: true,
                        resizable : false,
                        closable : false,
                        layout : {
                            type : 'vbox',
                            align : 'center'
                        },
                        title : Locale.strings.welcome,
                        items : [{
                            xtype : 'panel',
                            width : 800,
                            height : 320,
                            html : response.responseText
                        }, {
                            xtype : 'button',
                            cls: "bigButton",
                            text : Locale.strings.continueStr,
                            style : {
                                width : '150px',
                                height : '40px',
                                margin : '5px 5px 5px 5px'
                            },
                            handler : function(cmp){
                                clearInterval(animation);
                                cmp.up('window').close();
                            }
                        }]
                    }).show();
                }
            });

        } else {
            editor.restoreSession();
        }
    },


    /* -------------- Events handlers ---------------- */

    /**
     * Create the path based on the given node's position in the dom.
     * @param {HTMLElement} selectedNode The dom node that was selected
     */
    setPath : function(selectedNode) {
        var elements = [];
        var docClass = DocProperties.getDocClassList().split(" ");
        if(selectedNode) {
            var currentNode = selectedNode;
            var classes = currentNode.getAttribute("class");
            if (classes) {
                while (currentNode && (classes.indexOf(docClass[0]) == -1)) {
                    classes = currentNode.getAttribute("class");
                    classes = classes.split(" ");
                    elements.push({
                        node : currentNode,
                        name : classes[(classes.length - 1)]
                    });
                    currentNode = DomUtils.getFirstMarkedAncestor(currentNode.parentNode);
                }
            }
        }
        elements.push({
            node : null,
            name : docClass[1]
        });
        this.getMain().down('mainEditorPath').setPath(elements);
    },

    onNodeClick: function(selectedNode) {
        var body = this.getBody();

        Ext.each(body.querySelectorAll("*["+DocProperties.elementFocusedCls+"]"), function(node) {
            //Ext.fly(node).removeCls(DocProperties.elementFocusedCls);
            node.removeAttribute(DocProperties.elementFocusedCls);
        });
        if(selectedNode) {
           this.setPath(selectedNode);
            //Ext.fly(selectedNode).addCls(DocProperties.elementFocusedCls);
            selectedNode.setAttribute(DocProperties.elementFocusedCls, "true");
        }

    },

    /**
     * Restore a previously opened document by settings the appropriate
     * document properties and content taking them from the HTML5 localStorage object
     */
    restoreSession : function() {
        var callback, app = this.application, config;
        var me = this,
            userPreferences = me.getController('PreferencesManager').getUserPreferences(),
            storage = me.getController('Storage');

         if (userPreferences.lastOpened) {
             storage.openDocument(userPreferences.lastOpened);
         }
    },

    disableEditor: function() {
        this.getBody().setAttribute('contenteditable', false);
    },

    enableEditor: function() {
        this.getBody().setAttribute('contenteditable', true);
    },

    getTinyMceConfig: function() {
        var config = {
                doctype : '<!DOCTYPE html>',
                theme : "modern",
                schema: "html5",
                element_format : "xhtml",
                force_br_newlines : true,
                force_p_newlines : false,
                forced_root_block : '',
                // Custom CSS
                content_css : 'resources/tiny_mce/css/content.css',

                // the editor mode
                mode : 'textareas',

                entity_encoding : 'raw',

                // Sizes
                width : '100%',
                height : '100%',
                resizable : false,
                relative_urls: false,
                nonbreaking_force_tab: true,
                statusbar : false,
                // the enabled plugins in the editor
                plugins : "compat3x, code, tinyautosave, table, link, image, searchreplace, jbimages, paste, noneditable",

                noneditable_leave_contenteditable: true,

                valid_elements : "*[*]",

                // the language of tinymce
                language : Locale.getLang(),
                toolbar: "undo redo | bold italic strikethrough | superscript subscript | bullist numlist outdent indent | table | searchreplace | link image"  
            };

        return config;
    },

    /* Initialization of the controller */
    init : function() {
        var me = this;
        // Set the event listeners
        this.application.on({
            nodeFocusedExternally : this.focus,
            nodeChangedExternally : this.focus,
            editorDomNodeFocused : this.onNodeClick,
            scope : this
        });
        this.application.on(Statics.eventsNames.loadDocument, this.beforeLoadDocument, this);
        this.application.on(Statics.eventsNames.disableEditing, this.disableEditor, this);
        this.application.on(Statics.eventsNames.enableEditing, this.enableEditor, this);
        this.application.on(Statics.eventsNames.markingMenuLoaded, this.loadCss, this);

        // save a reference to the controller
        var editorController = this;
        var markerController = this.getController('Marker');
        this.control({
            // Handle the path panel
            'mainEditorPath' : {
                update : function() {
                    var selectorsConfig = this.getMainEditorPath().elements;
                    Ext.select(".pathSelectors", true).on("click", function(evt, el) {
                        var elId = el.getAttribute("id");
                        if (elId && selectorsConfig[elId]) {
                            var nodeToSelect = selectorsConfig[elId];
                            this.getController('Editor').focusNode(nodeToSelect, {
                                select : true,
                                scroll : true,
                                click : true
                            });
                        }
                    }, this);
                }
            },

            'mainEditorUri' : {
                update : function() {
                    var me = this;
                    Ext.select(".uriSelector", true).on("click", function(evt, el) {
                        var elId = el.getAttribute("path");
                        if (elId) {
                            me.application.fireEvent(Statics.eventsNames.openDocument, config = {path: elId});
                        }
                    }, this);
                }
            },

            // Handle the viewable events on the editor (click, contextmenu etc.)
            '#mainEditor mainEditor' : {
                click : function(ed, e, selectedNode) {
                    var me = this,
                       toMarkNodes = me.getBody().querySelectorAll("."+DomUtils.toMarkNodeClass);

                    // Replace all empty toMarkNodes with breaking elements
                    Ext.each(toMarkNodes, function(node) {
                       if(Ext.isEmpty(DomUtils.getTextOfNode(node).trim())) {
                           if(node.parentNode) {
                               Ext.DomHelper.insertHtml('beforeBegin',node, DomUtils.getBreakingElementHtml());
                               node.parentNode.removeChild(node);
                           }
                       }
                    });

                    // Hide the context menu
                    this.getContextMenu().hide();
                    if (Ext.Object.getSize(selectedNode)==0) {
                        selectedNode = DomUtils.getFirstMarkedAncestor(e.target);
                        if(DomUtils.isBreakingNode(e.target)) {
                            var newElement = Ext.DomHelper.createDom({
                                tag : 'div',
                                html : '&nbsp;',
                                cls: DomUtils.toMarkNodeClass
                            });
                            e.target.parentNode.replaceChild(newElement, e.target);
                            this.setCursorLocation(newElement, 0);
                            if(selectedNode) {
                                this.lastFocused = selectedNode;
                                me.application.fireEvent('editorDomNodeFocused', selectedNode);
                                return;
                            }
                        }
                    }

                    if(selectedNode) {
                       var editorNode = this.getSelectedNode(),
                           cls = editorNode.getAttribute("class");
                       if((cls && cls != DomUtils.toMarkNodeClass) &&
                           !DomUtils.isBreakingNode(editorNode) && editorNode != selectedNode) {
                            this.setCursorLocation(selectedNode, 0);
                       }
                       // Expand the selected node's related buttons
                       this.lastFocused = selectedNode;
                       me.application.fireEvent('editorDomNodeFocused', selectedNode);
                    }
                },
                change : function(ed, e) {
                    /* If the body node is not the default one wrap it */
                    var body = ed.getBody(),
                        docCls = DocProperties.getDocClassList(),
                        documentTypeNode = body.querySelector('*[class="'+docCls+'"]');
                    if (!documentTypeNode) {
                        /* Re/Wrap the whole editor content into the correct div */
                        var bodyInnerHtml = body.innerHTML;
                        // get a copy of the content
                        body.innerHTML = '';
                        // erase the whole content
                        var wrappingElement = Ext.DomHelper.createDom(Ext.Object.merge(this.defaultElement, {cls: docCls, html:bodyInnerHtml}));
                        body.appendChild(wrappingElement);
                    }
                    /* Add a new undo level */
                    ed.undoManager.add();
                    /* TODO Bug di tinymce: una volta impostata la root con il div andando a capo
                     * lo prende come contenuto di "default" al posto dei p. Provare drag droppando
                     * un testo da una tab esterna (su un document vuoto)
                     */
                    /* Warn of the change */
                    this.changed = true;
                },

                contextmenu : function(ed, e) {
                    var coordinates = [],
                        offsetPosition = this.getPosition();
                    // Prevent the default context menu to show
                    e.preventDefault();
                    // Compute the coordinates
                    coordinates = [e.clientX+offsetPosition[0], e.clientY+offsetPosition[1]];
                    // Can't use Ext getXY because it's a tinymce event!
                    this.application.fireEvent(Statics.eventsNames.showContextMenu, coordinates);
                },

                setcontent : function(ed, e) {
                    var body = this.getBody(),
                        docCls = DocProperties.getDocClassList(),
                        docBaseCls = DocProperties.documentBaseClass,
                        documentTypeNode = body.querySelector('*[class="'+docCls+'"]');
                    if(!DocProperties.getDocType()) {
                        return;
                    }
                    if (!documentTypeNode) {
                        /* Re/Wrap the whole editor content into the correct div */
                        var bodyInnerHtml = body.innerHTML;
                        // get a copy of the content
                        body.innerHTML = '';
                        // erase the whole content
                        var wrappingElement = Ext.DomHelper.createDom(Ext.Object.merge(this.defaultElement, {cls: docCls, html: bodyInnerHtml}));
                        body.appendChild(wrappingElement);
                    } else {
                        var classAtt = documentTypeNode.getAttribute('class');
                        if (!classAtt || classAtt.indexOf(docCls)==-1) {
                           documentTypeNode.setAttribute('class', docCls);
                        }
                    }
                    /* Warn of the change */
                    this.changed = true;
                    this.application.fireEvent('editorDomChange', body);
                },

                beforerender : function(cmp) {
                    var me = this, 
                        editorView = cmp, 
                        tinyView = me.getEditorComponent(cmp),
                        tinyConfig = me.getTinyMceConfig();


                    // trick for a global scope (needed by the autosave plugin)
                    __tinyInit = function() {
                       var plugin = this;
                       // Call 'tinyInit' with the plugin scope, pass 'autoSaveContent' with editor scope
                       Ext.bind(me.tinyInit, plugin, [me, Ext.bind(me.autoSaveContent, me)])();
                    };
                        
                    tinyConfig = Ext.merge(tinyConfig, {
                        // set the controller of the autosave
                        tinyautosave_oninit : '__tinyInit', // global reference to a local method
                        tinyautosave_minlength : 10,
                        tinyautosave_interval_seconds : 10,

                        // Events and callbacks
                        mysetup : function(editor) {
                            editor.on('change', function(e) {
                                editorView.fireEvent('change', editor, e);
                            });

                            editor.on('setcontent', function(e) {
                                editorView.fireEvent('setcontent', editor, e);
                            });

                            editor.on('BeforeExecCommand', function(e) {
                                if(e.value && e.value.indexOf('<table>') != -1) {
                                    var node = me.getSelectedNode(true);
                                    var config = Interpreters.getButtonConfig('table');
                                    if (!me.getController('Marker').isAllowedMarking(node, config)) {
                                        e.preventDefault();
                                    }
                                }
                            });

                            editor.on('click', function(e) {
                                // Fire a click event only if left mousebutton was used
                                if (e.which == 1){
                                    editorView.fireEvent('click', editor, e);
                                }
                            });

                            editor.on('contextmenu', function(e) {
                                editorView.fireEvent('click', editor, e);
                                editorView.fireEvent('contextmenu', editor, e);
                            });
                        }});

                    if (!WaweDebug) {
                        tinyConfig.menubar = false;
                    }

                    /* Set the editor custom configuration */
                    Ext.apply(tinyView, {tinymceConfig: tinyConfig});
                }
            },
            '#secondEditor mainEditor' : {
                beforerender: function(cmp) {
                    var me = this,
                        tinyView = me.getEditorComponent(cmp),
                        tinyConfig = me.getTinyMceConfig();

                    if (!WaweDebug) {
                        tinyConfig.menubar = false;
                    }

                    tinyConfig.plugins = tinyConfig.plugins.replace("tinyautosave,", "");
                    tinyConfig.readonly = 1;

                    /* Set the editor custom configuration */
                    Ext.apply(tinyView, {tinymceConfig: tinyConfig});
                }
            },
            '#secondEditor mainEditor tinymcefield': {
                editorcreated: function(editor) {
                    var editor2 = Ext.fly(this.getEditor(this.getSecondEditor()).getBody());
                    editor2.addCls('secondEditor');
                    Ext.Object.each(editor.controlManager.buttons, function(name) {
                        editor.controlManager.setDisabled(name, true);
                    });
                }
            }
        });
    }
});
