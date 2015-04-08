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
	views : ['main.Editor', 'main.editor.Path', 'main.editor.Uri','modal.NewDocument'],

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
		ref : 'explorer',
		selector : 'explorer'
	}, {
		ref : 'mainEditorPath',
		selector : 'mainEditorPath'
	},{
		ref : 'markingMenu',
		selector : 'markingMenu'
	},{
		ref : 'mainToolbar',
		selector : 'mainToolbar'
	},{
        ref : 'codemirror',
        selector : 'codemirror'
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

	/**
	 * Returns the editor DOM position inside the whole page (main DOM).
	 * @returns {Array} The coordinates of the position as an array (i.e. [x,y])
	 */
	getPosition : function(){
		var cmp = this.getEditorComponent();
		return [cmp.getX(), cmp.getY()+cmp.edToolbar.getHeight()];
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
	        uri = this.getDocumentUri();

        uri = (!uri) ? Locale.getString("newDocument") : uri.replace(/%3A/g, ':');
	    editorContainer.tab.setTooltip(uri);
	    main.down("mainEditorUri").setUri(uri);
	},

    getDocumentUri: function() {
        var metadata = this.getDocumentMetadata();
        var dom = metadata.originalMetadata.metaDom;
        var frbrThis = dom.querySelector(".FRBRManifestation .FRBRthis");
        if ( frbrThis ) {
            return frbrThis.getAttribute('value');
        }
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
	focus : function(nodes, actions, config){
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
	 *  	// Set to true only the ones to perform
	 * 		click : true,
	 * 		select : true
	 *  }
	 *
	 * @param {HTMLElement} node The dom node to focus
	 * @param {Object} actions The actions to perform
	 */
	focusNode : function(node, actions, config) {
        var me = this;
		if (!node)
			return;

        if ( !Ext.Object.isEmpty(this.defaultActions) ) {
            actions = Ext.merge(actions, this.defaultActions);
        }
        
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
            this.addUndoLevel();
			/* Warn of the change */
			this.changed = true;
			this.application.fireEvent("editorDomChange", node, "partial", config);
		}
		if (actions.click) {
			this.application.fireEvent('editorDomNodeFocused', node, actions);
		}
	},

	/**
	 * Just select the given node in the editor
	 * @param {HTMLElement} node The node to highlight
	 */
	selectNode : function(node, content) {
        // content = (content == undefined) ? true : content;
        // this.getEditor().selection.select(node, content);

        // We want to select the span.breaking before and after the given node
        var range = new Range();
        range.setStartBefore(node.previousSibling || node);
        range.setEndAfter(node.nextSibling || node);
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
	setSelectionContent : function(text) {
		this.getEditor().selection.setContent(text);
	},

    /* Add an undo level */
    addUndoLevel: function() {
        try {
            this.getEditor().undoManager.add();
        } catch(e) {
            Ext.log({level: "error"}, 'Editor addUndoLevel: '+e);
        }
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
	    docId = docId || this.getCurrentDocId() || 0;

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
	 * 		{
	 * 			start : "div",
	 * 			end : "p",
	 * 			current : "span",
	 * 		}
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
	getContent : function(formatType, cmp) {
		if (!formatType)
			formatType = "html";
		return this.getEditor(cmp).getContent({
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
        
        this.stylesUrl = styleUrls || this.stylesUrl;

	    this.addStyles(styleUrls);
        var editor2 = this.getSecondEditor();
        if (editor2) {
            this.addStyles(styleUrls, editor2);
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

    addStyles: function(urls, editor) {
        var me = this, editorDom = me.getDom(editor),
            head = editorDom.querySelector("head");

        urls = urls || me.stylesUrl;
        if ( urls && urls.length ) {
            Ext.each(head.querySelectorAll('.limeStyle'), function(styleNode) {
                head.removeChild(styleNode);
            });
        }
        
        Ext.each(urls, function(url) {
            var link = editorDom.createElement("link");
            link.setAttribute("href", url);
            link.setAttribute("class", 'limeStyle');
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
        me.getStore('LanguagesPlugin').addListener('filesloaded', me.onPluginLoaded, me);

        app.fireEvent(Statics.eventsNames.progressStart, null, {value:0.1, text: Locale.strings.progressBar.loadingDocument});
        docType =  Ext.isString(config.alternateDocType) ? config.alternateDocType : config.docType;
        Ext.defer(function() {
            me.getStore('LanguagesPlugin').loadPluginData(app, docType, config.docLocale);
        }, 200, me);
    },

	linkNotes: function(body) {
		var app = this.application, 
			noteLinkers = body.querySelectorAll(".linker");
        clickLinker = function() {
            var marker = this.getAttribute(LoadPlugin.refToAttribute), note;
            if (marker) {
                note = body.querySelector("*["+LoadPlugin.changePosTargetAttr+"="+marker+"]");
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
			marker = this.getController('Marker'),
			markedElements = body.querySelectorAll("*[" + DomUtils.elementIdAttribute + "]");
		
        //Parse the new document and build documentProprieties 
		Ext.each(markedElements, function(element, index) {
			var elId = element.getAttribute(DomUtils.elementIdAttribute),
			    newElId;
			var nameAttr = element.getAttribute(LanguageController.getLanguagePrefix()+'name');
			var buttonId = DomUtils.getButtonIdByElementId(elId);
			var button; // = DocProperties.getElementConfig(buttonId)

		    if (elId.indexOf(DomUtils.elementIdSeparator)==-1) {
		        var parent = DomUtils.getFirstMarkedAncestor(element.parentNode);
                if(parent) {
                    var buttonParent = DomUtils.getButtonByElement(parent);
                    if(buttonParent) {
                        button = DocProperties.getChildConfigByName(buttonParent, elId) || 
                                 DocProperties.getChildConfigByName(buttonParent, nameAttr);
                    }
                }
                if(!button) {
                    button = DocProperties.getFirstButtonByName(elId, 'common') ||
                             DocProperties.getFirstButtonByName(nameAttr, 'common') || 
                             DocProperties.getFirstButtonByName(elId) ||
                             DocProperties.getFirstButtonByName(nameAttr);
                    if ( button ) {
                        buttonId = button.id;
                        elId = marker.getMarkingId(buttonId);
                    }
                } else {
                    elId = marker.getMarkingId(button.id);
                }
		    } else {
                elId = elId.substr(0, elId.indexOf(DomUtils.elementIdSeparator));
            }

            if ( !button ) {
                button = DocProperties.getElementConfig(elId) || 
                        DocProperties.getFirstButtonByName(elId.replace(/\d/g,''));
                elId = (button) ? marker.getMarkingId(button.id) : elId;
            }

			if (!button) {
				if(!noSideEffects) {
                    Ext.log({level: "error"}, "FATAL ERROR!!", "The button with id " + buttonId + " is missing!");
					//Ext.MessageBox.alert("FATAL ERROR!!", "The button with id " + buttonId + " is missing!");	
				}
				return;
			}

			//if(!noSideEffects) {
				DocProperties.setMarkedElementProperties(elId, {
					button : button,
					htmlElement : element
				});	
			//}

            //remove inline style
            element.removeAttribute('style');
            element.setAttribute(DomUtils.elementIdAttribute, elId);
            var isBlock = DomUtils.blockTagRegex.test(button.pattern.wrapperElement);
            if(isBlock){
                marker.addBreakingElements(element);
            }

            this.onNodeChange(element, false);
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
		this.addUndoLevel();

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

	/**
	 * This is a callback for the autosave functionality.
	 * Do NOT rely on the existence of this function.
	 * @private
	 */
	autoSaveContent : function(userRequested) {
		/* Check if there has been a change */ /* TODO: pensare a una soluzione più intelligente */
		if (!userRequested && !this.changed || this.parserWorking)
			return;
        console.info('Saving...')
		this.changed = false;
		this.getController('Storage').saveDocument({
		    silent: true,
		    autosave: true
		});
	},

	/**
	 * Set the callbacks for the autosave plugin in tinyMCE.
	 * Do NOT rely on the existence of this function.
	 * @private
	 */
	tinyInit : function() {
        var me = this;
		userPreferences = me.getController('PreferencesManager').getUserPreferences();

		/* Load exemple document if there is no saved document */

		if (!userPreferences.lastOpened) {
			/*Config.setLanguage(Config.languages[0].name, function() {
	            me.application.fireEvent(Statics.eventsNames.languageLoaded, {});
            });*/

    		Ext.Ajax.request({
    			url : Statics.editorStartContentUrl,
    			success : function(response) {
    				var animation = me.getController('MainToolbar').highlightFileMenu();
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
		    me.restoreSession();
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

    setEditorReadonly: function(readonly) {
        var tinyView = this.getEditorComponent(),
            tinyEditor = tinyView.editor;

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
                plugins : "code, table, link, image, searchreplace, paste, noneditable",

                noneditable_leave_contenteditable: true,

                valid_elements : "*[*]",

                // the language of tinymce
                language : Locale.getLang(),
                toolbar: "undo redo | bold italic strikethrough | superscript subscript | bullist numlist outdent indent | alignleft aligncenter alignright | table | searchreplace | link image"  
            };

		return config;
    },

    onClickHandler : function(ed, e, selectedNode) {
        var me = this,
           toMarkNodes = me.getBody().querySelectorAll("."+DomUtils.toMarkNodeClass);

        // Replace all empty toMarkNodes with breaking elements
        Ext.each(toMarkNodes, function(node) {
           if( Ext.isEmpty(node.textContent.trim()) && node.parentNode ) {
               Ext.DomHelper.insertHtml('beforeBegin', node, DomUtils.getBreakingElementHtml());
               node.parentNode.removeChild(node);
           }
        });

        me.lastRange = this.getEditor().selection.getRng();

        // Hide the context menu
        this.getContextMenu().hide();
        if (Ext.Object.getSize(selectedNode)==0) {
            selectedNode = DomUtils.getFirstMarkedAncestor(e.target);
            if(DomUtils.isBreakingNode(e.target)) {
                var content = Ext.fly(e.target).getHtml();
                var newElement = Ext.DomHelper.createDom({
                    tag : 'div',
                    html : (content) ? content : '&nbsp;',
                    cls: DomUtils.toMarkNodeClass
                });
                e.target.parentNode.replaceChild(newElement, e.target);
                //this.setCursorLocation(newElement, 0);
                if(selectedNode) {
                    this.lastFocused = selectedNode;
                    me.focusNode(selectedNode, {click: true});
                    return;
                }
            }
        }

        if(selectedNode) {
           var editorNode = this.getSelectedNode(),
               cls = editorNode.getAttribute("class");
           if((cls && cls != DomUtils.toMarkNodeClass) &&
               !DomUtils.isBreakingNode(editorNode) && editorNode != selectedNode) {
                //this.setCursorLocation(selectedNode, 0);
           }
           // Expand the selected node's related buttons
           this.lastFocused = selectedNode;
           me.focusNode(selectedNode, {click: true});
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

    removeVisualSelectionObjects: function() {
        var dom = this.getDom();
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
            me.lastSelectionRange = DomUtils.range.splitRangeNodes(oldRange.cloneRange());
            if ( editor.target.Env.ie ) {
                Ext.each(DomUtils.range.getTextNodes(me.lastSelectionRange), function(node) {
                    Ext.fly(node).wrap({
                        tag: 'span',
                        cls: 'visibleSelection'
                    });
                });
            }
        } else if (me.lastRange) {
            me.setCursorLocation(me.lastRange.startContainer, me.lastRange.startOffset);
            me.getEditor().selection.setRng(me.lastRange);
            me.getBookmark();
            var selection = me.getSelectionObject();

            if(selection.start) {
                Ext.fly(selection.start).addCls("visibleBookmark");
            }
        }
    },

    focusHandler: function(e, editor) {
        var me = this;
        me.removeVisualSelectionObjects();
        me.lastSelectionRange = null;
    },

    /*
        This function ensures that the first node 
        in the body is the right content wrapper
    */
    ensureContentWrapper: function(editor) {
        var body = editor.getBody(),
            docType = DocProperties.getDocType(),
            docBaseCls = DocProperties.documentBaseClass,
            wrapper = body.querySelector('.'+docBaseCls+'.'+docType) || body.firstChild;

        if ( !wrapper || wrapper.nodeName.toLowerCase() != this.defaultElement.tag ) {
            wrapper = body.ownerDocument.createElement(this.defaultElement.tag);
            DomUtils.moveChildrenNodes(body, wrapper);
            body.appendChild(wrapper);
        }

        if ( !Ext.fly(wrapper).is('.'+docBaseCls+'.'+docType) ) {
            wrapper.setAttribute('class', docBaseCls+' '+docType);
        }
    },

    afterSave: function(config) {
        this.showDocumentUri();
        // Save as the last opened
        if (config.saveData && config.saveData.path) {
            // Set the current file's id
            DocProperties.setDocId(config.saveData.path);
        }
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

    onNodeChange : function(node, deep) {
        Ext.callback(Language.onNodeChange, Language, [node, deep]);
    },

	/* Initialization of the controller */
	init : function() {
		var me = this;
		// Set the event listeners
		this.application.on({
			nodeFocusedExternally : this.focus,
			nodeChangedExternally : this.focus,
			editorDomNodeFocused : this.onNodeClick,
            editorDomChange: this.onNodeChange,
			scope : this
		});
		this.application.on(Statics.eventsNames.loadDocument, this.beforeLoadDocument, this);
		this.application.on(Statics.eventsNames.disableEditing, this.disableEditor, this);
        this.application.on(Statics.eventsNames.enableEditing, this.enableEditor, this);
        this.application.on(Statics.eventsNames.afterSave, this.afterSave, this);

        window.setInterval(me.autoSaveContent.bind(me), 10000);

		// save a reference to the controller
		var editorController = this;
		var markerController = this.getController('Marker');
		this.control({
			// Handle the path panel
			'mainEditorPath' : {
				update : function() {
                    var selectorsConfig = this.getMainEditorPath().elements;
                    Ext.select(".pathSelectors", true).on("click", function(evt, el) {
                        var elId = el.getAttribute("path");
                        if (elId && selectorsConfig[elId]) {
                            var nodeToSelect = selectorsConfig[elId];
                            me.focusNode(nodeToSelect, {
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
				click : me.onClickHandler,
				change : function(ed, e) {
                    me.ensureContentWrapper(ed);
					/* Warn of the change */
					this.changed = true;
                    me.addUndoLevel();
				},
				setcontent : function(ed, e) {
					if(!DocProperties.getDocType()) return;
					me.ensureContentWrapper(ed);
					/* Warn of the change */
					this.changed = true;
				},

                contextmenu : function(ed, e) {
                    var coordinates = [],
                        offsetPosition = this.getPosition();
                    // Prevent the default context menu to show
                    e.preventDefault();
                    // Compute the coordinates
                    //coordinates = [e.pageX+offsetPosition[0], e.pageY+offsetPosition[1]];
                    coordinates = [e.clientX+offsetPosition[0], e.clientY+offsetPosition[1]];
                    // Can't use Ext getXY because it's a tinymce event!
                    this.application.fireEvent(Statics.eventsNames.showContextMenu, coordinates);
                },

				beforerender : function(cmp) {
                    var me = this, 
                    	editorView = cmp, 
                    	tinyView = me.getEditorComponent(cmp),
                    	tinyConfig = me.getTinyMceConfig();
						
					tinyConfig = Ext.merge(tinyConfig, {

	                    // Events and callbacks
	                    mysetup : function(editor) {
                            editor.on('init', function(e) {
                                console.log('init event', e);
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
	                    }});

                    tinyConfig.menubar = false;

					/* Set the editor custom configuration */
                    Ext.apply(tinyView, {tinymceConfig: tinyConfig});
				}
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
				beforerender: function(cmp) {
                    var me = this,
                        tinyView = me.getEditorComponent(cmp),
                        tinyConfig = me.getTinyMceConfig();

                    tinyConfig.menubar = false;

                    tinyConfig.readonly = 1;

                    tinyConfig.mysetup =  function(editor) {
                        editor.on('click', function(e) {
                            // Fire a click event only if left mousebutton was used
                            if (e.which == 1){
                                cmp.fireEvent('click', editor, e);
                            }
                        });
                    };

                    /* Set the editor custom configuration */
                    Ext.apply(tinyView, {tinymceConfig: tinyConfig});
                },

                afterrender: function(cmp) {
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
