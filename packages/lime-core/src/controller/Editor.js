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
    views : ['main.Editor', 'main.editor.Path', 'modal.NewDocument'],

    refs: [
        { ref: 'mainEditorTab',    selector: '#mainEditor #mainEditorTab' },
        { ref: 'mainEditor',       selector: '#mainEditor mainEditor' },
        { ref: 'secondEditor',     selector: '#secondEditor mainEditor' },
        { ref: 'main',             selector: 'main' },
        { ref: 'contextMenu',      selector: 'contextMenu' },
        { ref: 'contextMenuItems', selector: 'menuitem[cls=editor]' },
        { ref: 'explorer',         selector: 'explorer' },
        { ref: 'mainEditorPath',   selector: 'mainEditorPath' },
        { ref: 'markingMenu',      selector: 'markingMenu' },
        { ref: 'mainToolbar',      selector: 'mainToolbar' },
        { ref: 'codemirror',       selector: 'codemirror' },
        { ref: 'uri',              selector: 'mainEditorUri' }
    ],

    config: {
        autosaveEnabled: true
    },

    documentTempConfig: {},
    lastFocused: null,

    listen: {
        global: {
            scrollToActiveNode: 'scrollToShowActiveNode',
            nodeAttributesChanged: 'onChangeAttribute',
            nodeFocusedExternally: 'focus'
        },
        controller: {
            '#Outliner': {
                elementFocused: 'onOutlinerClick'
            },
            '#UndoManager': {
                change: 'refreshUndoButtons'
            }
        },
        component: {
            mainEditorPath: {
                pathItemClicked: 'onPathItemClicked'
            },
            mainEditorUri: {
                // This shouldn't be done by this controller: use stores instead
                pathSwitcherChanged: 'showDocumentIdentifier'
            }
        }
    },

    init: function() {
        var me = this;
        this.application.on({
            nodeFocusedExternally : this.focus,
            nodeChangedExternally : this.focus,
            editorDomNodeFocused : this.onNodeClick,
            scope : this
        });
        this.application.on(Statics.eventsNames.disableEditing, this.disableEditor, this);
        this.application.on(Statics.eventsNames.enableEditing, this.enableEditor, this);

        this.control({
            // Handle the viewable events on the editor (click, contextmenu etc.)
            '#mainEditor mainEditor' : {
                click : me.onClickHandler,
                change: me.onChangeContent,
                setcontent: function(ed, e) {
                    if(!DocProperties.getDocType()) return;
                    me.onChangeContent(ed);
                },
                contextmenu: me.showContextMenu,
                beforerender: me.setupTinyCmp
            },
            '#secondEditor': {
                added: function(cmp) {
                    me.setOnlyEditorTabMode(true);
                },
                removed: function(cmp) {
                    me.setOnlyEditorTabMode(false);
                }
            },
            '#secondEditor mainEditor' : {
                beforerender: me.setupTinySecondEditorCmp,
                editorcreated: function(tinyEditor) {
                    var editor2 = Ext.fly(me.getEditor(me.getSecondEditor()).getBody());
                    editor2.addCls('secondEditor');
                }
            }
        });
    },

    onChangeAttribute: function() {
        this.setChanged(true);
    },

    setChanged: function(state) {
        this.changed = state;
        if (this.saveButton) {
            this.saveButton.disabled(!state);
        }
    },

    isChanged: function() {
        return this.changed;
    },

    onChangeContent: function(ed) {
        this.ensureContentWrapper(ed);
        this.setChanged(true);
    },

    /*
        This function ensures that the first node
        in the body is the right content wrapper
    */
    ensureContentWrapper: function(editor) {
        editor = editor || this.getEditor();
        var body = editor.getBody(),
            docType = DocProperties.getDocType(),
            docBaseCls = DocProperties.documentBaseClass,
            wrapper = body.querySelector('.'+docBaseCls+'.'+docType) || body.firstChild;

        var document = this.getBody().getElementsByClassName(DocProperties.documentBaseClass)[0];
        if (document) {
            this.ensureContentWrapperPosition(document);
        }

        if ( !wrapper || wrapper.nodeName.toLowerCase() != 'div' ) {
            wrapper = body.ownerDocument.createElement('div');
            DomUtils.moveChildrenNodes(body, wrapper);
            body.appendChild(wrapper);
        }
        if (!(wrapper.classList.contains(docBaseCls) &&
                wrapper.classList.contains(docType))) {
            // IE uses only the first parameter
            wrapper.classList.add(docBaseCls);
            wrapper.classList.add(docType);
        }

        if (!wrapper.dataset.nomagicline)
            wrapper.dataset.nomagicline = 'nomagicline';
        if (!wrapper.parentNode.dataset.nomagicline)
            wrapper.parentNode.dataset.nomagicline = 'nomagicline';
    },

    ensureContentWrapperPosition: function (wrapper) {
        var docId = wrapper.getAttribute(DocProperties.docIdAttribute);
        var isSameDocNode = function(node) {
            return node != wrapper &&
            node.nodeType == node.ELEMENT_NODE &&
            node.classList.contains(DocProperties.documentBaseClass) &&
            node.getAttribute(DocProperties.docIdAttribute) == docId;
        };
        var prev = wrapper.previousSibling;
        while (prev) {
            var previousSibling = prev.previousSibling;
            if (this.ensureContentWrapperNodeCheck(prev)) {
                wrapper.insertBefore(prev, wrapper.firstChild);
            }
            prev = previousSibling;
        }

        var next = wrapper.nextSibling;
        while (next) {
            var nextSibling = next.nextSibling;
            if (this.ensureContentWrapperNodeCheck(next)) {
                wrapper.appendChild(next);
            } else if (isSameDocNode(next)) {
                // merge duplicated nodes that are created when Shift+Enter
                // is pressed if the document is empty
                DomUtils.moveChildrenNodes(next, wrapper, true);
                next.parentNode.removeChild(next);
            }
            next = nextSibling;
        }
    },

    ensureContentWrapperNodeCheck: function (node) {
        return node.nodeType == node.TEXT_NODE ||
                node.nodeType == node.ELEMENT_NODE && node.getAttribute(DomUtils.elementIdAttribute);
    },

    showContextMenu: function(ed, e) {
        e.preventDefault(); // Prevent the default context menu to show
        // Compute the coordinates
        var offsetPosition = this.getPosition(),
            coordinates = [e.clientX+offsetPosition[0], e.clientY+offsetPosition[1]];
        this.application.fireEvent(Statics.eventsNames.showContextMenu, coordinates);
    },

    setupTinyCmp: function(cmp) {
        var me = this,
            editorView = cmp,
            tinyView = me.getEditorComponent(cmp),
            tinyConfig = me.getTinyMceConfig();

        tinyConfig = Ext.merge(tinyConfig, {
            // Events and callbacks
            mysetup: function(editor) {
                me.addSaveButton(editor);
                me.addUndoButtons(editor);

                editor.on('init', function(e) {
                    me.tinyInit();
                });

                editor.on('change', function(e) {
                    editorView.fireEvent('change', editor, e);
                });

                editor.on('setcontent', function(e) {
                    editorView.fireEvent('setcontent', editor, e);
                });

                editor.on('BeforeExecCommand', function(e) {
                    if(e.value && Ext.isFunction(e.value.indexOf) && e.value.indexOf('<table>') != -1) {
                        var node = me.getSelectedNode(true);
                        var config = Interpreters.getButtonConfig('table');
                        if (!me.getController('Marker').isAllowedMarking(node, config)) {
                            e.preventDefault();
                        }
                    }
                });

                var blurHandler = Ext.bind(me.blurHandler, me, [editor], true);
                editor.on('blur', blurHandler);
                editor.on('focusOut', blurHandler);

                var focusHandler = Ext.bind(me.focusHandler, me, [editor], true);
                editor.on('focus', focusHandler);

                editor.on('mousedown', function(e) {
                    if ( document.activeElement == me.getIframe().dom ) {
                        me.removeVisualSelectionObjects();
                    } else {
                        /* IE bug workaround, avoid moving the caret
                            at beginning of the document on focusing editor */
                        me.tmpBookmark = me.getBookmark();
                    }
                });

                editor.on('mouseup', function(e) {
                    if (!me.tmpBookmark) return;
                    me.removeBookmarks(true);
                    me.tmpBookmark = null;
                });

                editor.on('click', function(e) {
                    // Fire a click event only if left mousebutton was used
                    if (e.which == 1){
                        me.onClickHandler(editor, e);
                    }
                });

                editor.on('contextmenu', function(e) {
                    me.onClickHandler(editor, e);
                    editorView.fireEvent('contextmenu', editor, e);
                });

                editor.on('BeforeAddUndo', function(e) {
                    editor.fire('change');
                    return false;
                });

                editor.on('init', me.addScrollHandler.bind(me));
            }});

        tinyConfig.menubar = false;

        /* Set the editor custom configuration */
        Ext.apply(tinyView, {tinymceConfig: tinyConfig});
    },

    addSaveButton: function (editor) {
        var me = this;
        editor.addButton('lime-save', {
            tooltip: 'Save',
            onPostRender: function () {
                me.saveButton = this;
            },
            onclick: this.autoSaveContent.bind(this)
        });
    },

    setOnlyEditorTabMode: function(enable) {
        var mainCmp = this.getMain();
        mainCmp.query('[cls~=editorTab]').forEach(function(tabPanel) {
            tabPanel.tab.setVisible(!enable);
        });
        mainCmp.query('[cls*=editorTabButton]').forEach(function(button) {
            button.setVisible(!enable);
        });
    },

    setupTinySecondEditorCmp: function(cmp) {
        var tinyView = this.getEditorComponent(cmp),
            tinyConfig = this.getTinyMceConfig();

        tinyConfig.menubar = false;
        tinyConfig.readonly = 1;
        tinyConfig.mysetup =  function(editor) {
            editor.on('PostRender', function() {
                editor.getBody().addEventListener('click', function(e) {
                    if (e.which == 1){
                        cmp.fireEvent('click', editor, e);
                    }
                });
            });
        };

        /* Set the editor custom configuration */
        Ext.apply(tinyView, {tinymceConfig: tinyConfig});
    },

    // Scroll the editor so that the active node becomes visible
    scrollToShowActiveNode: function() {
        var node = this.lastRange ? this.lastRange.startContainer : this.lastFocused;
        if (!node) return;
        node = (node.nodeType == DomUtils.nodeType.TEXT) ? node.parentNode : node;

        var iframe = this.getIframe().dom,
            nodeRect = node.getBoundingClientRect(),
            iframeRect = iframe.getBoundingClientRect();

        if (nodeRect.top < 0)
            return node.scrollIntoView();

        var delta = nodeRect.bottom + iframeRect.top - iframeRect.bottom;
        if (delta > 0)
            return iframe.contentWindow.scrollBy(0, delta+5);
    },

    onOutlinerClick: function (id) {
        var node = DomUtils.getElementById(id, this.getDom());
        if (node) {
            this.selectNode(node);
            node.scrollIntoView();
        }
    },

    onPathItemClicked: function (node) {
        this.focusNode(node, {
            select: true,
            scroll: true,
            click: true
        });
    },

    /**
     * Returns a reference to the ExtJS component
     * that contains the editor plugin.
     * @returns {LIME.view.main.Editor} The component that contains the editor
     */
    getEditorComponent: function(cmp) {
        // if(cmp) {
        //     console.warn('getEditorComponent', cmp);
        // }
        cmp = cmp || this.getMainEditor();
        // return cmp.down('tinymcefield');
        // TODO: this function is completely useless, remove it.
        return cmp;
    },

    /**
     * Returns a reference to the active editor object that allows to
     * use its own interface (that depends on what editor is currently installed e.g. tinyMCE).
     * @returns {Object} A reference to the editor object
     */
    getEditor: function(cmp) {
        var editorComponent = this.getEditorComponent(cmp);
        return editorComponent && editorComponent.getEditor();
    },

    /**
     * Returns the editor iframe container. Useful for positioning.
     * **Warning**: this method only works with those editor which support an
     * independent DOM and thus are forced to include an iframe in the main DOM.
     * @returns {HTMLElement} The iframe element
     */
    getIframe: function(){
        return this.getEditorComponent().iframeEl;
    },

    /**
     * Returns the real height of the editor body.
     * @returns {Number} The height
     */
    getHeight: function(){
        return this.getIframe().getHeight();
    },

    /**
     * Returns the real height of the editor body.
     * @returns {Number} The width
     */
    getWidth: function(){
        return this.getIframe().getWidth();
    },

    /**
     * Enables/Disables boxes, color and custom typography in the editor.
     */
    updateStyle: function(displayBox, displayColor, displayStyle) {
        [this.getMainEditor(), this.getSecondEditor()]
        .map(function (editor) {
            return Ext.fly(this.getEditor(editor).getBody())
        }, this)
        .forEach(function (el) {
            function setCls(name, enabled) {
                if (enabled) el.addCls(name);
                else el.removeCls(name);
            }
            setCls('lime', displayBox);
            setCls('colors', displayColor);
            setCls('pdf', displayStyle);
        });
    },

    /**
     * Returns the editor DOM position inside the whole page (main DOM).
     * @returns {Array} The coordinates of the position as an array (i.e. [x,y])
     */
    getPosition: function(){
        var cmp = this.getEditorComponent();
        var toolbarHeight = cmp.edToolbar ? cmp.edToolbar.getHeight() : 0;
        return [cmp.getX(), cmp.getY()+toolbarHeight];
    },

    /**
     * Returns a reference to the internal parser of the editor.
     * **Warning**: this method heavily relies on what kind of editor is used (only tested with tinyMCE).
     * @returns {Object} The intenal parser (its type varies depending on what editor is used)
     */
    getParser: function() {
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
    getSerializer: function() {
        //Return the serializer of active editor instead a new serializer
        return tinymce.activeEditor.serializer;
    },

    /**
     * Returns the serialized string of passed HTMLElement
     * @param {HTMLElement} element to serialize
     * @returns {String}
     */
    serialize: function(dom){
        return this.getSerializer().serialize(dom);
    },

    /**
     * This function returns a bookmark to store the current cursor position.
     * @returns {Object} The bookmark object
     */
    getBookmark: function() {
        var selection  = this.getEditor().selection;
        return selection.getBookmark.apply(selection, arguments);
    },

    removeBookmarks: function(invisible) {
        var body = this.getBody(),
            query = '[data-mce-type="bookmark"]';

        query = (invisible) ? query : '.visibleBookmark, '+query;

        Ext.each(body.querySelectorAll(query), function(el) {
            el.parentNode.removeChild(el);
        });
    },

    /**
     * This function reset the cursor to the given bookmark.
     * @param {Object} bookmark A reference to a bookmark instance
     */
    restoreBookmark: function(bookmark) {
        this.getEditor().selection.moveToBookmark(bookmark);
    },

    /**
     * Returns the selection range expressed in characters. For example if the
     * selection starts at the character i and ends
     * after j characters from the beginning of the row the range will be [i,j]
     * @returns {Number[]} [start, end] The array containing the start and end of the range
     */
    getSelectionRange: function() {
        var selectionRange = this.lastSelectionRange || this.getEditor().selection.getRng();
        var rootDocument = this.getBody().getElementsByClassName(DocProperties.documentBaseClass)[0];
        var ancestor = selectionRange.commonAncestorContainer;
        if (selectionRange && !(rootDocument.contains(ancestor))) {
            var newRange = selectionRange.cloneRange();
            newRange.setStart(rootDocument, 0);
            return newRange;
        }

        return selectionRange;
    },

    showDocumentIdentifier: function(isUri) {
        var valueToShow = (isUri !== false) ? this.getDocumentUri() : this.getDocumentPath();

        valueToShow = (valueToShow && valueToShow.replace(/%3A/g, ':')) || Locale.getString("newDocument");
        this.setEditorHeader(valueToShow, isUri);
    },

    // This should be overwritten by a language specific package
    getDocumentUri: function() {
        return this.getDocumentPath();
    },

    getDocumentPath: function() {
        return DocProperties.documentInfo.docId;
    },

    setEditorHeader: function(value, isUri) {
        this.getMainEditorTab().tab.setTooltip(value);
        if (isUri)
            this.getUri().setUri(value);
        else
            this.getUri().setPath(value);
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
    applyPattern: function(patternName, patternProperties) {
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
    focus: function(nodes, actions, config){
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
            try {
                if (nodes.length > 1 && markedAscendant){
                    this.focusNode(markedAscendant, actions, config);
                    this.lastFocused = markedAscendant;
                } else {
                    this.focusNode(lastNode, actions, config);
                    this.lastFocused = lastNode;
                }
            } catch(e) {
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
     *         click : true,
     *         select : true
     *  }
     *
     * @param {HTMLElement} node The dom node to focus
     * @param {Object} actions The actions to perform
     */
    focusNode: function(node, actions, config) {
        var me = this;
        if (!node)
            return;

        if ( !Ext.Object.isEmpty(me.defaultActions) ) {
            actions = Ext.merge(actions, me.defaultActions);
        }

        if (actions.scroll) {
            node.scrollIntoView();
        }
        if(actions.highlight){
            var extNode = Ext.fly(node);
            extNode.highlight("FFFF00", {duration: 800 });
        }
        if (actions.change) {
            me.setChanged(true);
            me.application.fireEvent("editorDomChange", node, "partial", config);
        }
        if (actions.click) {
            me.application.fireEvent('editorDomNodeFocused', node, actions);
            var path = DomUtils.getElementIdPath(node);
            Ext.GlobalEvents.fireEvent('contentFocused', path);
        }
        if (actions.select) {
            me.selectNode(node);
        }
    },

    // Change the editor selection to surround node
    selectNode: function(node) {
        var range = node.ownerDocument.createRange();
        range.setStartBefore(node);
        range.setEndAfter(node);
        this.getEditor().selection.setRng(range);
        this.lastSelectionRange = range;
    },

    setCursorLocation: function(node, offset) {
        this.getEditor().selection.setCursorLocation(node, offset);
    },

    /**
     * Replace the content of the selected text with the text given
     * @param {String} text The substitute text
     */
    setSelectionContent: function(text) {
        this.getEditor().selection.setContent(text);
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
    getSelectionContent: function(formatType) {
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
    getBody: function() {
        return this.getEditor().getBody();
    },

    /**
     * Returns a reference to the dom of the editor.
     * This method is very useful when separated-dom editors are used (such as tinyMCE).
     * @returns {HTMLDocument} A reference to the dom
     */
    getDom: function(cmp) {
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
    getSelectedNode: function(marked, elementName) {
        var selectedNode = this.getEditor().selection.getNode();
        if (marked) {
            return DomUtils.getFirstMarkedAncestor(selectedNode);
        } else if (elementName) {
            return DomUtils.getNodeByName(selectedNode, elementName);
        } else {
            return selectedNode;
        }
    },

    /*
      Returns the visually focused node in the editor
    */
    getFocusedNode: function() {
        var body = this.getBody();
        return body.querySelector("*["+DocProperties.elementFocusedCls+"]");
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
    getSelectionObject: function(formatType, nodeNames, sameLevel) {
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
                for (var j = 0; j < nestingDiff; j++){
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
    getContent: function(formatType, cmp) {
        if (!formatType)
            formatType = "html";
        return this.getEditor(cmp).getContent({
            format : formatType
        });
    },

    addStyles: function(urls, editor) {
        urls = urls || this.stylesUrl;
        this.stylesUrl = urls;
        var editorDom = this.getDom(editor),
            head = editorDom.querySelector("head");
        if ( urls && urls.length ) {
            Ext.each(head.querySelectorAll('.limeStyle'), function(styleNode) {
                head.removeChild(styleNode);
            });
        }

        Ext.each(urls, (function(url) {
            this.addStyle(url, editor);
        }).bind(this));

        if (!editor && this.getSecondEditor())
            this.addStyles(urls, this.getSecondEditor());
    },

    addStyle: function(url, editor) {
        var editorDom = this.getDom(editor),
            head = editorDom.querySelector('head'),
            link = editorDom.createElement('link');
        link.setAttribute('href', url);
        link.setAttribute('class', 'limeStyle');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        head.appendChild(link);
    },

    /**
     * Add the given style properties to the elements that match
     * the given css selector.
     * @param {String} selector The css selector
     * @param {String} styleText The string representing the property
     */
    addContentStyle: function(selector, styleText, cmp) {
        DomUtils.addStyle(selector, styleText, this.getDom(cmp), 'limeStyle');
    },

    /**
     * Remove all the custom styles we've added to the editor
     */
    removeAllContentStyle: function (cmp) {
        var style = this.getDom(cmp).querySelector('head #limeStyle');
        if (style)
            style.parentElement.removeChild(style);
    },

    loadDocument: function(docText, styleUrls, cmp) {
        var body = this.setContent(docText, cmp);
        this.addStyles(styleUrls);
        this.setPath(this.getBody());
        this.showDocumentIdentifier();
        this.startAutoSave();
        return body;
    },

    setContent: function(docText, cmp, silent) {
        // Add a space, empty content prevents other views from updating
        docText = docText || '&nbsp;';
        var editor = this.getEditor(cmp);
        editor.setContent(docText);
        // Clear Css
        this.removeAllContentStyle(cmp);
        var editorBody = editor.getBody();
        this.getController('Marker').searchAndManageMarkedElements(editorBody);
        if (!silent)
            this.application.fireEvent('editorDomChange', editorBody, true);
        return editorBody;
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
    domReplace: function(newNode, oldNodes) {
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
    splitContent: function(content, chunkSize){
        // Compute how many chunks there are
        var chunks = [];
        var toSplit = content;
        while (toSplit.length > chunkSize){
            var chunk = toSplit.split(chunkSize);

        }
    },

    startAutoSave: function() {
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = window.setInterval(this.autoSaveContent.bind(this), 10000);
    },

    /**
     * This is a callback for the autosave functionality.
     * Do NOT rely on the existence of this function.
     * @private
     */
    autoSaveContent: function() {
        /* Check if there has been a change */ /* TODO: pensare a una soluzione più intelligente */
        if (this.getAutosaveEnabled() && this.isChanged()) {
            this.setChanged(false);
            Ext.GlobalEvents.fireEvent('saveDocument');
        }
    },

    addUndoButtons: function (editor) {
        var me = this,
            undoManager = this.getController('UndoManager');
        me.undoButtons = {};

        function addButton (id, title, cb) {
            editor.addButton(id, {
                tooltip: title,
                onPostRender: function () {
                    me.undoButtons[id] = this;
                    this.disabled(true);
                },
                onclick: cb
            });
        };
        addButton('lime-undo', 'Undo', undoManager.undo.bind(undoManager));
        addButton('lime-redo', 'Redo', undoManager.redo.bind(undoManager));
    },

    // Enable or disable undo buttons depending on the UndoManager state.
    refreshUndoButtons: function () {
        if (!this.undoButtons) return;
        if (!this.undoButtons['lime-undo']) return;
        if (!this.undoButtons['lime-redo']) return;
        var undoManager = this.getController('UndoManager');
        this.undoButtons['lime-undo'].disabled(!undoManager.canUndo());
        this.undoButtons['lime-redo'].disabled(!undoManager.canRedo());
    },

    /**
     * Set the callbacks for the autosave plugin in tinyMCE.
     * Do NOT rely on the existence of this function.
     * @private
     */
    tinyInit: function() {
        if (!User.preferences.lastOpened) {
            this.getController('Storage').createNewDefaultDocument();
            this.showWelcomeWindow();
        } else {
            this.restoreSession();
        }
    },

    showWelcomeWindow: function() {
        Ext.Ajax.request({
            url : this.getEditorStartContentUrl(),
            success: (function(response) {
                var win = this.createWelcomeWindow(response.responseText);
                win.show();
            }).bind(this)
        });
    },

    /**
    * The path of default editor content file
    */
    getEditorStartContentUrl: function() {
        return 'config/examples/editorStartContent-'+Locale.getLang()+'.html';
    },

    createWelcomeWindow: function(content) {
        var animation = this.getController('MainToolbar').highlightFileMenu();
        // Create a window containing the example document and highlight the file menu
        // TODO: move this to a view file
        return Ext.widget('window', {
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
                html : content
            }, {
                xtype : 'button',
                cls: 'bigButton',
                text : Locale.strings.continueStr,
                style : {
                    width : '150px',
                    height : '40px',
                    margin : '5px 5px 5px 5px'
                },
                handler: function(cmp){
                    clearInterval(animation);
                    cmp.up('window').close();
                }
            }]
        });
    },


    /* -------------- Events handlers ---------------- */

    /**
     * Create the path based on the given node's position in the dom.
     * @param {HTMLElement} selectedNode The dom node that was selected
     */
    setPath: function(selectedNode) {
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

    addScrollHandler: function () {
        var doc = this.getEditorComponent().iframeEl.dom.contentDocument;
        doc.addEventListener('scroll', DomUtils.delayedExec(500, this.onScroll.bind(this)));
    },

    // On scroll, update the path breadcrumb toolbar
    onScroll: function () {
        var dom = this.getEditorComponent().iframeEl.dom,
            document = dom.contentDocument,
            el = document.elementFromPoint(150, 0);
        this.setPath(el);
    },

    onNodeClick: function(selectedNode) {
        this.unFocusNodes();
        if(selectedNode) {
           this.setPath(selectedNode);
           this.setFocusStyle(selectedNode);
        }
    },

    setFocusStyle: function(node) {
        node.setAttribute(DocProperties.elementFocusedCls, "true");
    },

    /**
     * Restore a previously opened document by settings the appropriate
     * document properties and content taking them from the HTML5 localStorage object
     */
    restoreSession: function() {
        var callback, app = this.application, config;
        var me = this,
            storage = me.getController('Storage');

         if (User.preferences.lastOpened) {
             storage.openDocument(User.preferences.lastOpened);
         }
    },

    disableEditor: function() {
        this.getBody().setAttribute('contenteditable', false);
    },

    enableEditor: function() {
        this.getBody().setAttribute('contenteditable', true);
    },

    setEditorReadonly: function(readonly, tinyView) {
        tinyView = tinyView || this.getEditorComponent();
        var tinyEditor = tinyView.editor;

        tinyEditor.execCommand("contentReadOnly", false, (readonly) ? tinyEditor.getElement() : tinyEditor.getElement().disabled);
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
                // the editor mode
                mode : 'textareas',
                body_class: 'lime ' + Locale.getLang(),
                entity_encoding : 'raw',
                // Sizes
                width : '100%',
                height : '100%',
                resizable : false,
                relative_urls: false,
                nonbreaking_force_tab: true,
                statusbar : false,
                // the enabled plugins in the editor
                plugins : "image, link, magicline, noneditable, paste, searchreplace, table",

                magicline_targetedItems: ['DIV','IMG','TABLE'],
                magicline_triggerMargin: 10,
                magicline_insertedBlockTag: 'br', // Don't need a wrapper just add a br

                noneditable_leave_contenteditable: true,

                valid_elements : "*[*]",

                // the language of tinymce
                language : Locale.getLang(),
                toolbar: "lime-save | lime-undo lime-redo | bold italic strikethrough | superscript subscript | alignleft aligncenter alignright | table | searchreplace | link image"
            };

        return config;
    },

    onClickHandler: function(ed, e, selectedNode) {
        var me = this,
           toMarkNodes = me.getBody().querySelectorAll("."+DomUtils.toMarkNodeClass);

        // Replace all empty toMarkNodes
        Ext.each(toMarkNodes, function(node) {
           if( Ext.isEmpty(node.textContent.trim()) && node.parentNode ) {
               node.parentNode.removeChild(node);
           }
        });

        me.lastRange = this.getEditor().selection.getRng();
        // Hide the context menu
        this.getContextMenu().hide();
        if (Ext.Object.getSize(selectedNode)===0) {
            // When the click release after a selection is outside the editor
            // e.target in Chrome is setted to <html> and the selectedNode is not found.
            // In this case the common ancestor of the range is used to
            // find the selectedNode
            selectedNode = DomUtils.getFirstMarkedAncestor(e.target) ||
                            DomUtils.getFirstMarkedAncestor(me.lastRange.commonAncestorContainer);
        }

        if(selectedNode) {
           var editorNode = this.getSelectedNode(),
               cls = editorNode.getAttribute("class");
           if((cls && cls != DomUtils.toMarkNodeClass) &&
                editorNode != selectedNode) {
                //this.setCursorLocation(selectedNode, 0);
           }
           // Expand the selected node's related buttons
           this.lastFocused = selectedNode;
           me.focusNode(selectedNode, {click: true, rightClick: e.button === 2});
        } else {
            me.unFocusNodes(true);
        }
    },

    unFocusNodes: function(fireEvent, body) {
        body = body || this.getBody();
        Ext.each(body.querySelectorAll("*["+DocProperties.elementFocusedCls+"]"), function(node) {
            node.removeAttribute(DocProperties.elementFocusedCls);
        });
        if ( fireEvent ) {
            this.application.fireEvent(Statics.eventsNames.unfocusedNodes);
        }
    },

    removeVisualSelectionObjects: function(dom) {
        dom = dom || this.getDom();
        Ext.each(dom.querySelectorAll(".visibleBookmark"), function(el) {
            el.parentNode.removeChild(el);
        });
        Ext.each(dom.querySelectorAll(".visibleSelection"), function(el) {
            var parent = el.parentNode;
            DomUtils.unwrapNode(el);
            parent.normalize();
        });
    },

    blurHandler: function(e, editor) {
        var me = this,
            now = Ext.Date.now();

        // Avoid perform on blur and focusOut, the first event goes on
        if ( me.lastBlur && (now - me.lastBlur) < 1000 ) return;

        me.lastBlur = now;
        me.removeVisualSelectionObjects();
        var oldRange = editor.selection.getRng();
        if ( oldRange.toString() ) {
            me.lastSelectionRange = DomUtils.range.normalization.splitRangeNodes(oldRange.cloneRange());
            if ( editor.target.Env.ie ) {
                Ext.each(DomUtils.range.getTextNodes(me.lastSelectionRange), function(node) {
                    DomUtils.wrapNode(node, 'span').setAttribute('class', 'visibleSelection');
                });
            }
        } else if (me.lastRange && !DomUtils.nodeHasTagName(me.lastRange.commonAncestorContainer,'body') ) {
            var document = me.lastRange.startContainer.ownerDocument;
            var visibleBookmark = document.createElement('span');
            visibleBookmark.className = 'visibleBookmark';
            me.lastRange.insertNode(visibleBookmark);
        }
    },

    focusHandler: function(e, editor) {
        var me = this;
        me.removeVisualSelectionObjects();
        me.lastSelectionRange = null;
    },

    onMetadataChanged: function() {
        this.setChanged(true);
        this.showDocumentIdentifier();
        this.autoSaveContent();
    }
});
