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
 * This controller contains the logic of the interaction
 * between the editor and the buttons used to mark the document
 * (and viceversa). There are two main operations: wrapping and splitting.
 * The first one wraps the selected element(s) inside of the element we
 * want to add while the second provides a way to split a selected
 * block/container in two (or more) different blocks/containers.
 * Inlines and markers beahave the same either for wrapping and splitting
 * operations.
 */
Ext.define('LIME.controller.Marker', {
    extend: 'Ext.app.Controller',

    nodeChangedConfig: {
        select: false,
        scroll: false,
        change: true
    },

    init: function() {
        this.application.on({
            markingMenuClicked: {fn: this.wrap, scope:this},
            markingRequest: {fn: this.autoWrap, scope:this}
        });
        this.application.on(Statics.eventsNames.unmarkNodes, this.unmarkNodes, this);
    },

    /**
     * This function retrieves the selected nodes set from the editor and mark
     * them all according to the rule defined in the button's wrapperElement rule.
     * Returns the list of the marked elements (useful in many cases).
     * @param {TreeButton} button The button that was used to mark
     * @param {Object} [attribute] The optional attribute (a name-value pair) to be set
     * @return {Array} The array of the wrapped elements
     */
    wrap: function(button, config) {
        var editorController = this.getController('Editor'),
            selectedNode = editorController.getSelectedNode(),
            firstMarkedNode = DomUtils.getFirstMarkedAncestor(selectedNode);

        if( !this.isAllowedMarking(firstMarkedNode, selectedNode, button) ) {
            return this.showPatternError(firstMarkedNode, button);
        }
        // If the node is already been marked just exit
        if (firstMarkedNode &&
                DomUtils.getButtonIdByElementId(
                    firstMarkedNode.getAttribute(DomUtils.elementIdAttribute)
                ) == button.id) {
            return;
        }

        var newElement = this.wrapRaw(button, config);
        var setCursorLocation = false;
        if ( !newElement.textContent.trim() ) {
            newElement.appendChild(newElement.ownerDocument.createTextNode("  "));
            setCursorLocation = true;
        }

        // Warn of the changed nodes
        this.application.fireEvent('nodeChangedExternally', [newElement], Ext.merge(config, Ext.merge(this.nodeChangedConfig, {
            click: (config.silent) ? false : true,
            manualMarking: true,
            setCursorLocation: setCursorLocation
        })));

        Ext.callback(config.callback, this, [button, [newElement]]);

        return [firstMarkedNode, newElement];
    },

    isAllowedMarking: function(markedNode, node, config) {
        var patterns = this.getStore("LanguagesPlugin").getConfigData().patterns,
            newParent, patternError = false, pattern,
            nodePattern = this.getPatternConfigByNode(markedNode);

        if (!this.isAllowedPattern(nodePattern,
                                   config.pattern)) {
            // There is a pattern incompatibility
            patternError = true;
            // Trying to apply wrapping rules to check if the incompatibility still persists
            newParent = this.getParentOfSelectionAfterWrappingRules(markedNode);
            if(newParent && !markedNode.isEqualNode(newParent)) {
                pattern = DomUtils.getPatternByNode(newParent);
                if(pattern && patterns[pattern] &&
                    this.isAllowedPattern(patterns[pattern], config.pattern)) {
                    patternError = false;
                }
            }
        }

        if (!Ext.isEmpty(nodePattern.exceptionalAllowedElements) &&
            nodePattern.exceptionalAllowedElements.indexOf(config.name) != -1) {
            patternError = false;
        }

        return !patternError;
    },

    showPatternError: function(markedNode, toMarkConfig) {
        var nodePattern = this.getPatternConfigByNode(markedNode);
        this.application.fireEvent(Statics.eventsNames.showNotification, {
            title: Locale.getString('notAllowedMarking'),
            autoCloseDelay: 5000,
            content: new Ext.Template(Locale.getString('semanticError')).apply({'name': "<b>"+toMarkConfig.name+"</b>"}),
            moreInfo: new Ext.Template(Locale.getString('patternNotAllowed')).apply({
                'elementPattern': toMarkConfig.pattern.pattern,
                'parentPattern': nodePattern.pattern
            })
        });
    },

    getPatternConfigByNode: function(node) {
        var button = DomUtils.getButtonByElement(node);
        if(button) {
            return button.pattern;
        }
    },

    isAllowedPattern: function(parentPatternConfig, patternConfig) {
        if(!Ext.isEmpty(parentPatternConfig.allowedPatterns) &&
            parentPatternConfig.allowedPatterns.indexOf(patternConfig.pattern) == -1) {
            return false;
        }
        return true;
    },

    getParentOfSelectionAfterWrappingRules: function(node) {
        var editorController = this.getController('Editor'),
            startSelection, tmpNode, tmpStart;

        // Save a reference of the selection
        editorController.getBookmark();
        startSelection = editorController.getEditor().selection.getStart();

        tmpNode = this.applyWrappingRuleWithoutEffects(node);
        tmpStart = tmpNode.querySelector("[data-id='"+startSelection.getAttribute("id")+"']");
        return tmpStart.parentNode;
    },

    applyWrappingRuleWithoutEffects: function(node) {
        var fixAllId = function(node) {
            var fixId = function(node) {
                node.setAttribute('data-id', node.getAttribute('id'));
                node.removeAttribute('id');
            };
            fixId(node);
            Ext.each(node.querySelectorAll('[id]'), fixId);
            return node;
        };
        //Temporary solution to remove double ext generated ids.
        var cloned = fixAllId(Ext.clone(node));
        Interpreters.wrappingRulesHandlerOnTranslate(cloned);
        return cloned;
    },

    wrapRaw: function(button, config) {
        var isBlock = DomUtils.blockTagRegex.test(button.pattern.wrapperElement);
        var wrapper = (isBlock) ? this.wrapRange(button) : this.wrapRange(button, 'span');

        // Common finilizing operations
        var bookmarkParent = Ext.fly(wrapper).parent('.visibleBookmark', true);
        if ( bookmarkParent ) {
            DomUtils.insertAfter(wrapper, bookmarkParent);
            bookmarkParent.parentNode.removeChild(bookmarkParent);
        }

        this.setMarkedElementProperties(wrapper, button, config);

        return wrapper;
    },

    wrapRange: function(button, element) {
        element = element || 'div';
        var editor = this.getController('Editor'),
            selectionRange = editor.getSelectionRange();

        DomUtils.range.normalize(selectionRange);
        DomUtils.range.normalization.getOutOfFakeEditorElements(selectionRange);

        var wrapper = selectionRange.startContainer.ownerDocument.createElement(element);
        selectionRange.surroundContents(wrapper);
        return wrapper;
    },

    setMarkedElementProperties: function(node, button, config) {
        config = config || {};
        var markingId = this.getMarkingId(button.id); // Get a unique id for the marked element
        // Set the internal id and the class
        node.setAttribute(DomUtils.elementIdAttribute, markingId);
        node.setAttribute('class',  button.pattern.wrapperClass);

        // Set the optional attribute, if it has name and value
        if (config.attribute && config.attribute.name && config.attribute.value) {
            node.setAttribute(this.getController('Language').getLanguagePrefix() + config.attribute.name, config.attribute.value);
        }
        // Wrap the parent if it's a toMarkNode
        if( node.parentNode && Ext.fly(node.parentNode).is('.'+DomUtils.toMarkNodeClass) ) {
            DomUtils.unwrapNode(node.parentNode);
        }
        // Set the document properties
        DocProperties.setMarkedElementProperties(markingId, {
            button: button,
            htmlElement: node
        });
    },

    /**
     * This method returns a well formed unique id for the marked element.
     * For more information about the button id see {@link Ext.view.markingmenu.TreeButton}
     * @param {String} buttonId The id of the button that was used to mark the element
     * @returns {String} The unique id
     */
    getMarkingId: function(buttonId) {
        var markedElements = DocProperties.markedElements,
            partialId = buttonId + DomUtils.elementIdSeparator,
            counter = 1;
        for (counter; markedElements[partialId + counter]; counter++);
        return partialId + counter;
    },

    /**
     * This function mark nodes passed in config according to the rule defined
     * in the button's wrapperElement rule.
     * This function is used by parsers for fast marking.
     * @param {TreeButton} button The button that was used to mark
     * @param {Object} config
     */
    autoWrap: function(button, config) {
        if(!config.nodes || !button)
            return;
        var buttonPattern = button.pattern,
            markedElements = [];

        Ext.each(config.nodes, function(newElement, index) {
            var firstMarkedNode = DomUtils.getFirstMarkedAncestor(newElement);

            if ( !config.noDoubleMarkingCheck && firstMarkedNode &&
                DomUtils.getButtonIdByElementId(firstMarkedNode.getAttribute(DomUtils.elementIdAttribute)) == button.id) {
                return;
            }

            if(!DomUtils.isSameNodeWithHtml(newElement, buttonPattern.wrapperElement)) {
                if(buttonPattern.pattern == "inline") {
                    if(newElement.children.length == 1 &&
                        DomUtils.isSameNodeWithHtml(newElement.firstChild, buttonPattern.wrapperElement)) {
                        newElement = newElement.firstChild;
                    } else {
                        newElement = this.wrapChildrenInWrapperElement(newElement, buttonPattern);
                    }
                } else {
                    newElement = this.wrapElementInWrapperElement(newElement, buttonPattern);
                }
            }

            this.setMarkedElementProperties(newElement, button, Ext.merge(Ext.clone(config), {
                attribute: (config.attributes) ? config.attributes[index] : null
            }));

            markedElements.push(newElement);
        },this);

        Ext.callback(config.onFinish, this, [markedElements]);

        if (!config.noEvent) {
            config = Ext.merge(Ext.merge({}, this.nodeChangedConfig), config);
            this.application.fireEvent('nodeChangedExternally', markedElements, Ext.merge(config, {
                click : (config.silent) ? false : true
            }));
        }
        return markedElements;
    },

    wrapChildrenInWrapperElement: function(node, pattern) {
        var htmlContent = Interpreters.parseElement(pattern.wrapperElement, {
            content : ''
        }), newNode = Ext.DomHelper.insertHtml("beforeBegin", node, htmlContent);
        DomUtils.moveChildrenNodes(node, newNode);
        return node.appendChild(newNode);
    },

    wrapElementInWrapperElement: function(node, pattern) {
        var htmlContent = Interpreters.parseElement(pattern.wrapperElement, {
            content : ''
        }), newNode = Ext.DomHelper.insertHtml("beforeBegin", node, htmlContent);
        newNode.appendChild(node);
        return newNode;
    },

    /**
     * Simply remove a node attaching the children to the parent node
     * @param {HTMLElement} markedNode The element to unmark
     * @param {boolean} [unmarkChildren]
     * @private
     */
    unmarkNode: function(markedNode, unmarkChildren) {
        var unmarkedChildIds = [];
        if (unmarkChildren) {
            var discendents = markedNode.querySelectorAll("["+DomUtils.elementIdAttribute+"]");
            // Find all the marked children and unmark them
            Ext.each(discendents, function(child){
                unmarkedChildIds = Ext.Array.merge(unmarkedChildIds, this.unmarkNode(child));
            }, this);
        }
        var markedId = markedNode.getAttribute(DomUtils.elementIdAttribute);
        // Replace all the
        markedNode.normalize();
        while (markedNode.hasChildNodes()) {
            if(DomUtils.markedNodeIsPattern(markedNode, "inline")) {
                if(markedNode.firstChild.nodeType == DomUtils.nodeType.TEXT) {
                    DomUtils.addSpacesInTextNode(markedNode.firstChild);
                } else {
                    Ext.each(DomUtils.getTextNodes(markedNode.firstChild), DomUtils.addSpacesInTextNode);
                }
            }
            markedNode.parentNode.insertBefore(markedNode.firstChild, markedNode);
        }
        if(markedNode.parentNode) markedNode.parentNode.normalize();

        markedNode.parentNode.removeChild(markedNode);
        // Remove any reference to the removed node
        delete DocProperties.markedElements[markedId];

        return Ext.Array.merge(markedId, unmarkedChildIds);
    },

    unmarkNodes: function(nodes, unmarkChildren) {
        var me = this, parents = [], editor = me.getController("Editor"),
            documentEl = editor.getDocumentElement(),
            nodeDocument = nodes[0].ownerDocument,
            unmarkedNodeIds = [], config = {change : true, unmark: true};

        editor.removeBookmarks();
        Ext.each(nodes, function(node) {
            var parent = DomUtils.getFirstMarkedAncestor(node.parentNode);
            if(parent && parents.indexOf(parent) == -1) parents.push(parent);
            unmarkedNodeIds = Ext.Array.merge(unmarkedNodeIds, me.unmarkNode(node, unmarkChildren));
        });
        if(parents.length) {
            Ext.each(parents, function(parent) {
                me.application.fireEvent('nodeChangedExternally', parent, config);
            });
        } else {
            me.application.fireEvent('nodeChangedExternally', documentEl, config);
        }
        me.application.fireEvent(Statics.eventsNames.unmarkedNodes, unmarkedNodeIds, nodeDocument);
    },

    // Link marked elements with buttons and build documentProprieties
    searchAndManageMarkedElements: function(node) {
        DocProperties.removeAllMarkedElements();
        var markedElements = node.querySelectorAll("*[" + DomUtils.elementIdAttribute + "]");
        Ext.each(markedElements, function(node) {
            var elId = node.getAttribute(DomUtils.elementIdAttribute),
                button = this.findButton(node);

            if (!button)
                return Ext.log({level: "error"}, "FATAL ERROR!!", "The button for element " + elId + " is missing!");

            elId = this.getMarkingId(button.id);

            DocProperties.setMarkedElementProperties(elId, {
                button : button,
                htmlElement : node
            });

            node.removeAttribute('style'); //remove inline style
            node.setAttribute(DomUtils.elementIdAttribute, elId);
        }, this);
    },

    // Find a button from node
    findButton: function(node) {
        var elId = node.getAttribute(DomUtils.elementIdAttribute);
        var nameAttr = node.getAttribute(this.getController('Language').getLanguagePrefix()+'name');
        var button = null;

        if (elId.indexOf(DomUtils.elementIdSeparator) == -1) {
            var parent = DomUtils.getFirstMarkedAncestor(node.parentNode);
            var buttonParent = parent && DomUtils.getButtonByElement(parent);
            button = buttonParent && (DocProperties.getChildConfigByName(buttonParent, elId) ||
                                    DocProperties.getChildConfigByName(buttonParent, nameAttr));
        } else
            elId = elId.substr(0, elId.indexOf(DomUtils.elementIdSeparator));

        if(!button)
            button = this.getFirstButton(elId, nameAttr);

        return button || DocProperties.getElementConfig(elId) ||
                        DocProperties.getFirstButtonByName(elId.replace(/\d/g,''));
    },

    getFirstButton: function(elId, nameAttr) {
        return DocProperties.getFirstButtonByName(elId) ||
            DocProperties.getFirstButtonByName(nameAttr);
    }
});
