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

    // extend the ext controller
    extend : 'Ext.app.Controller',

    // set up the views
    views : ['main.Editor'],

    refs : [{
        ref : 'contextMenu',
        selector : 'contextMenu'
    }],

    nodeChangedConfig: {
        select : false,
        scroll : false,
        change : true
    },

    /**
     * This method returns a well formed unique id for the marked element.
     * For more information about the button id see {@link Ext.view.markingmenu.TreeButton}
     * @param {String} buttonId The id of the button that was used to mark the element
     * @returns {String} The unique id
     */
    getMarkingId : function(buttonId) {
        var markedElements = DocProperties.markedElements, 
            partialId = buttonId + DomUtils.elementIdSeparator,
            counter = 1;
        for (counter; markedElements[partialId + counter]; counter++);
        return partialId + counter;
    },

    /**
     * This function builds an id attribute starting from the given element's markingId.
     * The build process is based on the hierarchy of the elements.
     * The difference between this and {@link LIME.controller.Marker#getMarkingId} is that this id is
     * specific to the language plugin currently in use while the latest is for development purposes.
     * @param {HTMLElement} markedElement The element we have to set the attribute to
     * @param {String} buttonId The id of the button that was used to mark the element
     * @param {String} [prefix] The prefix for the attribute
     * @returns {String} The language element unique id
     */
    getLanguageMarkingId : function(markedElement, buttonId, prefix) {
        var newId = buttonId.replace(DomUtils.vowelsRegex, ''), counter = markedElement.getAttribute(DomUtils.elementIdAttribute).split(DomUtils.elementIdSeparator)[1],
        /* Retrieve all the parent nodes' ids */
        iterator = markedElement, parent = DomUtils.getFirstMarkedAncestor(iterator.parentNode);
        if (parent) {
            parentId = parent.getAttribute(prefix + DomUtils.langElementIdAttribute);
            newId = parentId + '-' + newId;
        }
        return newId + counter;
    },
    
    /**
     * This function is used by wrapBlock to wrap selected text 
     * into the wrapElement
     * @param {HTMLELement} wrapElement, wrapper node
     * @param {HTMLELemnet} tmpElement, temporary element inside wrapElement
     */
    
    wrapSelectedTextInNode: function(wrapElement, tmpElement) {
        var lastNode, iterNode, nextSibling, isLast,
            tempElements = [],
            tmpClass = DomUtils.tempSelectionClass+"_wrapText",
            editorController = this.getController('Editor'),
            toMarkNodes = editorController.applyPattern('tempselection', {
                inline : 'span',
                classes : tmpClass
            });
            
        if (toMarkNodes.length) {
            toMarkNodes[0].parentNode.insertBefore(wrapElement, toMarkNodes[0]);
            lastNode = toMarkNodes[toMarkNodes.length - 1];
            iterNode = toMarkNodes[0];
            while (iterNode) {
                nextSibling = iterNode.nextSibling, isLast = (iterNode == lastNode);
                tmpElement.parentNode.insertBefore(iterNode, tmpElement);
                iterNode = isLast ? false : nextSibling;
            }
        }
        
        tempElements = Ext.query('span[class~='+tmpClass+']', wrapElement);
        // Unwrap text from temporary elements
        Ext.each(tempElements, function(node) {
            if(node.getAttribute("class") == tmpClass) {
                DomUtils.unwrapNode(node);    
            } else {
                Ext.fly(node).removeCls(tmpClass);
            }
        }); 
    },
    
    /**
     * Wrap the currently selected node(s) into a specific block
     * related to the given button.
     * @param {TreeButton} button An istance of the button which was used to mark the block
     * @return {HTMLElement[]} An array of the marked elements
     */
    wrapBlock : function(button) {
        var editorController = this.getController('Editor'),
            // Get selection info from the editor
            selection = editorController.getSelectionObject('html', {
                start : DomUtils.blockRegex,
                end : DomUtils.blockRegex
            }, true),
            selectionRange = editorController.getSelectionRange();
            // Get the list of the nodes between the first and last selected
            // Notice: this excludes the last node if the selection has a strange end of range (e.g. 0)
            lastNode = (selectionRange[1] == 0) ? selection.end.previousSibling : selection.end, 
            selectedNodes = DomUtils.getSiblings(selection.start, lastNode),
            // Parse the wrapper element in order to determine where the content goes
            parsedHtml = Interpreters.parseElement(button.pattern.wrapperElement, {
                content : '<span class="' + DomUtils.tempSelectionClass + '"/>'
            }),
            // Create a new HTMLElement to be used as the wrapper (they all are divs)
            newElement = Ext.DomHelper.createDom({
                tag : 'div',
                html : parsedHtml
            }),
            // Get a reference to the temporary element to be replaced from the actual content (the wrapped elements)
            tempSelection = Ext.query('*[class*='+DomUtils.tempSelectionClass+']', newElement)[0];
            
        // Check for data integrity
        if (!selectedNodes || selectedNodes.length == 0) {
            //return [];
            selectedNodes = [selection.node];
        }
  
        if(selection.text && selectedNodes.length == 1
                && selectedNodes[0] == selection.start && selectedNodes[0] == selection.end) {
            this.wrapSelectedTextInNode(newElement, tempSelection);    
        } else {
            // Insert the wrapper just before the first of the selected elements
            selectedNodes[0].parentNode.insertBefore(newElement, selectedNodes[0]);
            // Wrap the nodes
            if (tempSelection){ // temp selection could not exist if the element doesn't have a content
                Ext.each(selectedNodes, function(node) {
                    tempSelection.parentNode.insertBefore(node, tempSelection);
                });
            }  
        }
        
        // Delete the (temporary) utility node
        if (tempSelection){
            tempSelection.parentNode.removeChild(tempSelection);
        }
         // Avoid useless nested elements
        newElement = editorController.domReplace(newElement.childNodes[0], newElement);
        // Add breaking elements so that text can be inserted
        this.addBreakingElements(newElement);
        return [newElement];
    },

    wrapRange: function(button, element) {
        var editor = this.getController('Editor'),
            element = element || 'div'
            selectionRange = editor.lastSelectionRange || editor.getEditor().selection.getRng();

        var wrapper = selectionRange.startContainer.ownerDocument.createElement(element);
        DomUtils.range.normalize(selectionRange);
        selectionRange.surroundContents(wrapper);

        if ( element == 'div' ) {
            // Add breaking elements so that text can be inserted
            this.addBreakingElements(wrapper);
        }
        return wrapper;
    },

    /**
     * Mark one or multiple inlines related to the button used to mark.
     * 
     * **Warning**: to provide a uniform interface, and void waste
     * of code to check for differences, this method always returns an array of HTMLElement.
     * Of course it's always possible to select a single element by using indices.
     * @param {TreeButton} button An istance of the button which caused the marking
     * @return {HTMLElement[]} An array of the marked elements
     */
    wrapInline: function(button) {
        var editorController = this.getController('Editor'),
            // Creat temporary spans to be replaced
            toMarkNodes = [],
            markedElements = [],
            bogusNode,
            isMarker = false,
            //number of elements in the group
            numberOfEls, nodesLength;
        /* Temp nodes in toMarkNodes are separate span elements this loop 
         * try to group these elements that are siblings but they can be separated by <br> element(s).
         * Each group will be marked and not each element, in this way
         * we can mark as unique inline, elements that are rendered with multiple rows.
         * Each iteration represents a group for this reason the "i" variable is incremented by "numberOfEls". 
         */
         var selection = editorController.getSelectionObject();

        if ( selection.start.getAttribute('data-mce-type') == 'bookmark' && 
                    selection.node == selection.start &&  selection.start == selection.end ) {

            var wrapper = Ext.DomHelper.createDom({
                tag : 'span',
                cls : DomUtils.tempParsingClass
            });

            DomUtils.insertAfter(wrapper, selection.end);
            toMarkNodes = [wrapper];
        } else {
            toMarkNodes = editorController.applyPattern('tempselection', {
                inline : 'span',
                classes : DomUtils.tempSelectionClass
            });
            
        }
        
        nodesLength = toMarkNodes.length;

        for(var i = 0; i < nodesLength; i+=numberOfEls) {
            var node = toMarkNodes[i],
                extNode = new Ext.Element(node),
                //Get html of wrapperElement
                htmlContent = Interpreters.parseElement(button.pattern.wrapperElement, {
                    content : ''
                }),
                inlineWrapper;
            bogusNode = extNode.up('[data-mce-bogus]');
            // An element without content e.g. eop element
            if ((button.pattern.wrapperElement.indexOf(Interpreters.flags.content)==-1)) {
                isMarker = true;
                if (bogusNode) {
                    inlineWrapper = Ext.DomHelper.insertHtml("afterEnd", bogusNode.dom, htmlContent);                    
                } else {
                    inlineWrapper = Ext.DomHelper.insertHtml("afterEnd", toMarkNodes[nodesLength-1], htmlContent);
                }
            } else {
                // Creation of group as dom element and put it before "node" that is the first element of this group
                inlineWrapper = Ext.DomHelper.insertHtml("beforeBegin", node, htmlContent);
            }
            var inlineExt = new Ext.Element(inlineWrapper),
                next = extNode.next();
            
            //set the number of elements of this group to 1 this is the first element "node"
            numberOfEls = 1;
            //Add to the wrapper element the our temporal class
            inlineExt.addCls(DomUtils.tempSelectionClass);
            //Node temporal class is now useless
            node.removeAttribute("class");
            if (!isMarker) {
                //Append the first child to the group
                DomUtils.moveChildrenNodes(node, inlineExt.dom, true);
                node.parentNode.removeChild(node);
                //inlineExt.appendChild(node);
                //Finding other group elements that can exists only if the next sibling is a <br> 
                while (next && next.is("br")) {
                    var tmpBr = next;
                    var groupEl;
                    next = next.next();
                    //Check if the next sibling of <br> is the next element in the list of nodes to mark
                    if(next && next.dom==toMarkNodes[i+numberOfEls]){
                        //if there is a group element clean and append it
                        if (next.dom) {
                            //append the <br> element to the group, we need to keep the original formatting
                            inlineExt.appendChild(tmpBr);
                            next.dom.removeAttribute("class");
                            inlineExt.appendChild(next.dom);
                        }
                        next = next.next();
                        numberOfEls++;
                    }
                }   
            }
            markedElements.push(inlineWrapper);
            if(isMarker) {
                break;
            }
        }
        return markedElements;
    },
    /**
     * This function retrieves the selected nodes set from the editor and mark
     * them all according to the rule defined in the button's wrapperElement rule.
     * Returns the list of the marked elements (useful in many cases).
     * @param {TreeButton} button The button that was used to mark
     * @param {Object} [attribute] The optional attribute (a name-value pair) to be set
     * @return {Array} The array of the wrapped elements
     */
    wrap : function(button, config) {
        var editorController = this.getController('Editor'), 
            isBlock = DomUtils.blockTagRegex.test(button.pattern.wrapperElement), 
            newElements = [], 
            selectedNode = editorController.getSelectedNode(), 
            firstMarkedNode = DomUtils.getFirstMarkedAncestor(selectedNode);
        
        // If marking is not allowed or the node is already been marked just exit
        if( !this.isAllowedMarking(firstMarkedNode, selectedNode, button) || 
            (firstMarkedNode && DomUtils.getButtonIdByElementId(firstMarkedNode.getAttribute(DomUtils.elementIdAttribute)) == button.id) ) {
            return;
        }

        if (isBlock) {
            //newElements = this.wrapBlock(button);
            newElements = [this.wrapRange(button)];
        } else {
            //newElements = this.wrapInline(button);
            newElements = [this.wrapRange(button, 'span')];
        }
        var setCursorLocation = false;
        // Common finilizing operations
        Ext.each(newElements, function(node) {
            var bookmarkParent = Ext.fly(node).parent('.visibleBookmark', true);
            if ( bookmarkParent ) {
                DomUtils.insertAfter(node, bookmarkParent);
                bookmarkParent.parentNode.removeChild(bookmarkParent);
            }

            if ( !node.textContent.trim() ) {
                node.appendChild(node.ownerDocument.createTextNode("  "));
                setCursorLocation = true;
            }

            this.setMarkedElementProperties(node, button, config);
        }, this);

        // Warn of the changed nodes
        this.application.fireEvent('nodeChangedExternally', newElements, Ext.merge(config, Ext.merge(this.nodeChangedConfig, {
            click : (config.silent) ? false : true,
            setCursorLocation: setCursorLocation
        })));
        
        Ext.callback(config.callback, this, [button, newElements]);
    },

    /**
     * This function mark nodes passed in config according to the rule defined
     * in the button's wrapperElement rule.
     * This function is used by parsers for fast marking.
     * @param {TreeButton} button The button that was used to mark
     * @param {Object} config 
     */
    autoWrap : function(button, config) {
        if(!config.nodes | !button)
            return;
        var buttonPattern = button.pattern,
            isBlock = DomUtils.blockTagRegex.test(buttonPattern.wrapperElement),
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

            if(isBlock) {
                this.addBreakingElements(newElement);
            }
            markedElements.push(newElement);
        },this);
        
        Ext.callback(config.onFinish, this, [markedElements]);
        
        if (!config.noEvent) {
            this.application.fireEvent('nodeChangedExternally', newElements, Ext.merge(config, Ext.merge(this.nodeChangedConfig, {
                click : (config.silent) ? false : true,
            })));
        }
        return markedElements;
    },

    setMarkedElementProperties : function(node, button, config) {
        var markingId = this.getMarkingId(button.id); // Get a unique id for the marked element
        // Set the internal id and the class
        node.setAttribute(DomUtils.elementIdAttribute, markingId);
        node.setAttribute('class',  button.pattern.wrapperClass);

        // Set the optional attribute, if it has name and value
        if (config.attribute && config.attribute.name && config.attribute.value) {
            node.setAttribute(Language.getAttributePrefix() + config.attribute.name, config.attribute.value);
        }
        // Wrap the parent if it's a toMarkNode
        if( node.parentNode && Ext.fly(node.parentNode).is('.'+DomUtils.toMarkNodeClass) ) {
            DomUtils.unwrapNode(node.parentNode);
        }
        // Set the document properties
        DocProperties.setMarkedElementProperties(markingId, {
            button : button,
            htmlElement : node
        });
    },

    /**
     * Simply remove a node attaching the children to the parent node
     * @param {HTMLElement} markedNode The element to unmark
     * @param {boolean} [unmarkChildren]
     * @private
     */ 
    unmarkNode : function(markedNode, unmarkChildren) {
        var unmarkedChildIds = [];
        if (unmarkChildren) {
            var discendents = Ext.query("["+DomUtils.elementIdAttribute+"]", markedNode);
            // Find all the marked children and unmark them
            Ext.each(discendents, function(child){
                unmarkedChildIds = Ext.Array.merge(unmarkedChildIds, this.unmarkNode(child));
            }, this);
        }
        var markedParent = markedNode.parentNode,
            markedId = markedNode.getAttribute(DomUtils.elementIdAttribute),
            extNode = new Ext.Element(markedNode),
            nextSpaceP = extNode.next('.'+DomUtils.breakingElementClass),
            prevSpaceP = extNode.prev('.'+DomUtils.breakingElementClass);
        // Replace all the 
        while (markedNode.hasChildNodes()) {
            if(DomUtils.markedNodeIsPattern(markedNode, "inline")) {
                if(markedNode.firstChild.nodeType == DomUtils.nodeType.TEXT) {
                    DomUtils.addSpacesInTextNode(markedNode.firstChild);
                } else {
                    Ext.each(DomUtils.getTextNodes(markedNode.firstChild), function(node) {
                         DomUtils.addSpacesInTextNode(node);
                    });
                    
                }
            }
            markedNode.parentNode.insertBefore(markedNode.firstChild, markedNode);              
        }
        if(markedNode.parentNode) markedNode.parentNode.normalize();
        
        if (nextSpaceP) {
            nextSpaceP.remove();
        }

        if (prevSpaceP) {
            var prevSibling = prevSpaceP.prev();
            //Remove the space p if the previous sibling is not marked
            if(!prevSibling || !prevSibling.getAttribute(DomUtils.elementIdAttribute)){
                prevSpaceP.remove();
            }
        }

        markedNode.parentNode.removeChild(markedNode);
        // Remove any reference to the removed node
        delete DocProperties.markedElements[markedId];
        
        return Ext.Array.merge(markedId, unmarkedChildIds);
    },
    
    /**
     * OLD FUNCTION
     *
     * Handler for the unmark feature, uses unmarkNode to really unmark the node(s)
     * @param {HTMLElement} node The node to start from
     * @param {Boolean} unmarkChildren True if also the children has to be unmarked
     * TODO: remove spans after unmark!
     */
    unmark: function(node, unmarkChildren) {
        // If a marked node could not be found we just have to
        var selectedNodes = this.getController("Editor").getSelectionObject("html", null, true);
        var start = DomUtils.getFirstMarkedAncestor(selectedNodes.start),
            end = DomUtils.getFirstMarkedAncestor(selectedNodes.end),
            siblings = DomUtils.getSiblings(start, end),
            // Check what kind of operations we have to perform on the unmarked node
            eventConfig = {change : true, click : true, unmark: true},
            markedParent = (start)? start.parentNode : end.parentNode,
            unmarkedNodeIds = [];
        // Check the siblings
        if (siblings){
            // If the node is not marked delete it from the array
            siblings = siblings.filter(function(node){
                if (node && (node.nodeType != DomUtils.nodeType.ELEMENT || !node.getAttribute(DomUtils.elementIdAttribute))){
                    return false;
                } else {
                    return true;
                }
            });
        } else {
            // If not siblings were found it means that only one node, or none at all, is marked
            start? siblings = [start] : siblings = [end];
        }
        // Now we actually unmark the nodes
        Ext.each(siblings, function(node){
            var markedId = node.getAttribute(DomUtils.elementIdAttribute);
            unmarkedNodeIds = Ext.Array.merge(unmarkedNodeIds, this.unmarkNode(node, unmarkChildren));
            /*if (unmarkChildren) { // TODO: search this event
                this.application.fireEvent('nodeRemoved', markedId);
            }*/
        }, this);
        // If nodes were removed just focus the just unmarked node
        /*if (unmarkChildren) {
            eventConfig.change = false;
        }*/
        this.application.fireEvent('nodeChangedExternally', markedParent, eventConfig);
        this.application.fireEvent(Statics.eventsNames.unmarkedNodes, unmarkedNodeIds);
    },

    unmarkNodes: function(nodes, unmarkChildren) {
        var me = this, parents = [], editor = me.getController("Editor"),
            documentEl = editor.getDocumentElement(),
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
        me.application.fireEvent(Statics.eventsNames.unmarkedNodes, unmarkedNodeIds);
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
     * This function adds breaking elements before and/or after the node so that text can be inserted
     * @param {HTMLElement} node 
     */
    addBreakingElements : function(node){
        //var breakingElementString = "<p class=\""+DomUtils.breakingElementClass+"\"></p>";
        var breakingElementString = DomUtils.getBreakingElementHtml();
        var flyNode = Ext.fly(node);

        Ext.DomHelper.insertHtml('afterBegin',node, breakingElementString);
        Ext.DomHelper.insertHtml('beforeEnd',node, breakingElementString);

        // Add a breaking element also above the marked element but only if there isn't another breaking element
        if (!node.previousSibling || node.previousSibling.nodeName.toLowerCase() != 'br' && 
                                    !Ext.fly(node.previousSibling).hasCls(DomUtils.breakingElementClass)) {
            Ext.DomHelper.insertHtml('beforeBegin',node, breakingElementString);
        }

        if ( !node.nextSibling || (node.nextSibling.nodeName.toLowerCase() != 'br' && !Ext.fly(node.nextSibling).hasCls(DomUtils.breakingElementClass)) ) {
            Ext.DomHelper.insertHtml('afterEnd',node, breakingElementString);
        }
    },

    applyWrappingRuleWithoutEffects: function(node) {
        var cloned = Ext.clone(node);
        Interpreters.wrappingRulesHandlerOnTranslate(cloned);
        return cloned;
    },

    getParentOfSelectionAfterWrappingRules: function(node) {
        var editorController = this.getController('Editor'),
            startSelection, tmpNode, tmpStart;

        // Save a reference of the selection
        editorController.getBookmark();
        startSelection = editorController.getEditor().selection.getStart();

        tmpNode = this.applyWrappingRuleWithoutEffects(node);

        tmpStart = tmpNode.querySelector("#"+startSelection.getAttribute("id"));
        return tmpStart.parentNode;
    },

    isAllowedMarking: function(markedNode, node, config) {
        var patterns = this.getStore("LanguagesPlugin").getData().patterns,
            newParent, patternError = false, pattern,
            nodePattern = this.getPatternConfigByNode(markedNode);

        if(!nodePattern || Ext.fly(node).is('table') || Ext.fly(node).up('table') ) {
            return true;
        }

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

        if(patternError) {
            this.application.fireEvent(Statics.eventsNames.showNotification, {
                title: Locale.strings.notAllowedMarking,
                content: new Ext.Template(Locale.strings.semanticError).apply({'name': "<b>"+config.name+"</b>"}),
                moreInfo: new Ext.Template(Locale.strings.patternNotAllowed).apply({
                    'elementPattern': config.pattern.pattern,
                    'parentPattern': nodePattern.pattern
                })
            });   
        }
        return !patternError;
    },
    
    isAllowedPattern: function(parentPatternConfig, patternConfig) {
        if(!Ext.isEmpty(parentPatternConfig.allowedPatterns)
            && parentPatternConfig.allowedPatterns.indexOf(patternConfig.pattern) == -1) {
            return false;
        }
        return true;
    },

    getPatternConfigByNode: function(node) {
        var button = DomUtils.getButtonByElement(node);
        if(button) {
            return button.pattern;
        }
    },

    isAllowedElement: function(parent, buttonConfig) {
        var languageData = this.getStore("LanguagesPlugin").getData(),
            documentRoot = this.getController("Editor").getBody(),
            semanticRules = languageData.semanticRules,
            elements, elementRules, parentId, parentConfig, parentRules, childrenRules;
        if (languageData.semanticRules && languageData.semanticRules.elements) {
            elements = languageData.semanticRules.elements;
            elementRules = elements[buttonConfig.name];
            if (parent) {
                parentId = parent.getAttribute(DomUtils.elementIdAttribute);
                if (DocProperties.markedElements[parentId] && DocProperties.markedElements[parentId].button) {
                    parentConfig = DocProperties.markedElements[parentId].button;
                    parentRules = elements[parentConfig.name];
                    if (parentRules && parentRules.children) {
                        childrenRules = parentRules.children[buttonConfig.name];
                        if (childrenRules) {
                            if (childrenRules.cardinality > 0 && childrenRules.cardinality <= this.getNumberOfChildrenByClass(parent, buttonConfig.name)) {
                                return false;
                            }
                        } else {
                            return true; //TODO: improve this
                        }   
                    }
                }
                
            }
            if (elementRules) {
                if (elementRules.cardinality > 0 && elementRules.cardinality <= this.getNumberOfChildrenByClass(documentRoot, buttonConfig.name, true)) {
                    return false;
                }
            }                       
        }
        
        return true;
    },
    
    getNumberOfChildrenByClass: function(node, childClass, includeDescendant) {
        var extNode = new Ext.Element(node),
           childrenNumber = 0,
           children = extNode.query("*[class~="+childClass+"]");
        
        return children.length;
    },
    
    searchObjInArrayByAttribute: function(array, attrName, attrValue) {
        var aLength = array.length, i;
        
        for(i = 0; i < aLength; i++) {
            if(array[i][attrName] == attrValue) {
                return array[i];
            }
        }
        
        return null;
    },

    init : function() {
        // Listens for marking inputs
        this.application.on({
            markingMenuClicked : {fn: this.wrap, scope:this},
            markingRequest : {fn: this.autoWrap, scope:this}
        });
        this.application.on(Statics.eventsNames.unmarkNodes, this.unmarkNodes, this);
    }
});
