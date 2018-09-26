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

Ext.define('AknModsMarker.Controller', {
    extend : 'Ext.app.Controller',

    views : ['AknModsMarker.ModsMarkerWindow',
            'AknModsMarker.SplitNodesSelectorWindow',
            'AknModsMarker.RepealSelectorWindow'],

    refs : [{
        ref : 'mainEditor',
        selector : '#mainEditor mainEditor'
    }, {
        ref: 'secondEditor',
        selector: '#secondEditor mainEditor'
    }],

    requires: [
        'AknMain.LangProp',
        'Xml.Document'
    ],

    config: {
        renumberingAttr: "renumbering",
        joinAttr: "joined",
        splitAttr: "splitted",
        externalConnectedElements: ["quotedStructure", "quotedText", "ref", "rref", "mref"]
    },

    modsMap: {},

    listen: {
        global:  {
            secondDocumentLoaded: 'onSecondDocumentLoaded',
            nodeAttributesChanged: 'nodeChangedAttributes',
            changedDefaultModMode: 'setDefaultPassiveModMode'
        }
    },

    init : function() {
        var me = this;
        me.application.on(Statics.eventsNames.editorDomNodeFocused, me.editorNodeFocused, me);
        me.application.on(Statics.eventsNames.unmarkedNodes, me.nodesUnmarked, me);
        me.application.on(Statics.eventsNames.afterLoad, me.onDocumentLoaded, me);
        me.application.on(Statics.eventsNames.nodeChangedExternally, me.onNodeChanged, me);
        me.application.fireEvent(Statics.eventsNames.registerContextMenuBeforeShow, Ext.bind(me.beforeContextMenuShow, me));

        me.initPosMenu();

        this.control({
            '#secondEditor mainEditor' : {
                click: me.secondEditorClickHandler
            },
            'splitWindow, repealWindow': {
                close: function() {
                    me.secondEditorClickHandlerCustom = null;
                    me.setMaskEditors(false, false);
                }
            },
            'splitWindow grid': {
                activate: function(cmp) {
                    cmp.up('window').setTitle(cmp.winTitle);

                    if ( cmp.itemId == 'toSplit' )
                        me.setMaskEditors(false, true);
                    else
                        me.setMaskEditors(true, false);
                }
            },
            'splitWindow [itemId=accept]': {
                click: function(btn) {
                    var secondMeta = me.getSecondEditor().up().up().metaConf,
                        cmp = btn.up('window'),
                        dataToSplit = me.getNodeDataFromGrid(cmp.down('[itemId=toSplit]')),
                        splittedNodes = me.getNodeDataFromGrid(cmp.down('[itemId=splitted]')).map(function(data) {
                            return data.node;
                        });

                    if ( splittedNodes.length && dataToSplit.length ) {
                        me.setSplitNodesStyle(splittedNodes);
                        me.setSplitMetadata(dataToSplit[0].node, secondMeta, splittedNodes);
                        cmp.close();
                    } else {
                        Ext.MessageBox.alert("Error", 'Not enough elements selected');
                        console.warn('Not enough elements selected');
                    }
                }
            },
            'repealWindow [itemId=accept]': {
                click: function(btn) {
                    var cmp = btn.up('window');
                    me.delHandlerConsolidation(cmp.selection.text, cmp.selectedNode, cmp.selection.textBefore, cmp.selection.textAfter);
                    cmp.close();
                }
            }
        });
    },

    defaultPassiveModMode: 'amendment',

    getOptionsMenuItems: function() {
        var me = this;
        function getRadioCheckItem(type) {
            return {
                xtype: 'menucheckitem',
                text: AknModsMarker.Strings.get(type),
                group : 'passiveModDefault',
                checked: me.defaultPassiveModMode == type,
                handler: me.setDefaultPassiveModMode.bind(me, type)
            };
        }
        return [{
            xtype: 'menuseparator'
        },{
            text: AknModsMarker.Strings.get('passiveModsDefaultBehaviour'),
            plain: true
        },
        getRadioCheckItem('amendment'),
        getRadioCheckItem('consolidation')
        ];
    },

    setDefaultPassiveModMode: function(mode) {
        this.defaultPassiveModMode = mode;
    },

    onSecondDocumentLoaded: function(config) {
        var importMeta = this.getController('AknMetadata.sync.ImportController'),
            metaNodes = importMeta.getMetadataNodes(config);

        var expUri = '';
        if (metaNodes.length) {
            var doc = Xml.Document.newDocument(metaNodes[0], 'akn');
            expUri = doc.getValue('.//akn:FRBRExpression/akn:FRBRuri/@value');
        }

        this.secondDocumentConfig = {
            expUri: expUri
        };
    },

    nodeChangedAttributes: function(node, attrs) {
        var hrefAttr = LangProp.attrPrefix+'href';
        if (DomUtils.getNameByNode(node) === 'ref' && attrs[hrefAttr]) {
            return this.onRefAttrChange(node, attrs[hrefAttr].value, attrs[hrefAttr].oldValue);
        }
    },

    // Updates mod's destination on ref's href change
    onRefAttrChange: function(node, href, oldHref) {
        var refId = node.getAttribute(DomUtils.elementIdAttribute);
        var destination = this.findActiveDestination(refId, oldHref);
        if (destination) {
            this.bindActiveModRef(destination.getModification(), node);
        }
    },

    findActiveDestination: function(refId, href) {
        var destinations = [];
        this.getTextualMods('active').forEach(function(mod) {
            destinations = destinations.concat(mod.getSourceDestinations('destination'));
        });

        return this.findDestination(destinations, refId, href);
    },

    findDestination: function(dests, refId, href) {
        href = AknMain.metadata.HtmlSerializer.normalizeHref(href);
        return dests.filter(function(dest) {
            var sameHref = dest.get('href') === href;
            return (dest.get('href') === href && dest.get('refInternalId') === refId);
        })[0];
    },

    editorNodeFocused: function(node) {
        if(this.openedForm) {
            this.openedForm.close();
            this.openedForm = null;
        }
        if(node)
            this.showModInfo(node);

        Ext.callback(this.editorClickHandlerCustom, this, [node, this.getController("Editor").getEditor()]);
    },

    onNodeChanged: function(nodes, config) {
        if(config.unmark || nodes.length == 0) return;
        var name = DomUtils.getNameByNode(nodes[0]);
        if (name === 'quotedStructure') {
            this.ensureModNode(nodes[0], true);
        }
    },

    showModInfo: function(node) {
        var mod = this.getModFromNode(node, 'passive');
        if(!mod || !mod.modElement) return;
        this.showSourceRef(node, mod);
        switch(mod.textMod.get('modType')) {
            case "substitution":
                if(mod.modElement.get('type') == 'new')
                    this.createSubstitution(node, mod.textMod.getOldText(), true);
                break;
            case "repeal":
                return this.showOldText(node, mod.textMod.getOldText());
        }
    },

    showOldText: function(node, oldText) {
        this.openedForm = this.createAndShowFloatingForm(node, AknModsMarker.Strings.get('oldText'), oldText.trim(), true);
    },

    showSourceRef: function(node, mod) {
        var tagAttrController = this.getController('AknMetadata.tagAttributes.Controller');
        var source = mod.textMod.getSourceDestinations('source')[0];
        if (!source) return;
        var panel = this.creteSourceUriPanel(source);
        panel.setTitle(AknModsMarker.Strings.get('sourceOf')+ ' ' +AknModsMarker.Strings.get(mod.textMod.get('modType')));
        tagAttrController.showNodeAttributes(node, panel);
    },

    creteSourceUriPanel: function(source) {
        var tagAttrController = this.getController('AknMetadata.tagAttributes.Controller');
        var uri = source.get('href');
        if (uri) {
            uri = (uri.startsWith('/') || uri.startsWith('#')) ? uri : '#'+uri;
        }
        return tagAttrController.createRefPanel(uri, function(uri) {
            if (!uri) return;
            source.set('href', uri);
            return true;
        });
    },

    nodesUnmarked: function(nodesIds) {
        Ext.each(nodesIds, this.unlinkModByElId, this);
    },

    unlinkModByElId: function(elId) {
        var mod = elId && this.getModFromElId(elId);
        if(!mod || !mod.modElement) return;

        var elConf = DocProperties.getElementConfig(DomUtils.getButtonIdByElementId(elId));
        if (!elConf || elConf.name == 'mod' || mod.textMod.get('amendmentType') == 'passive')
            this.removeMod(elId);
        else {
            mod.modElement.set('href', '');
            delete this.modsMap[elId];
        }
    },

    removeMod: function(id) {
        var mod = this.modsMap[id];
        if (!mod) return;
        delete this.modsMap[id];
        // Search and remove all the references to this mod
        Object.keys(this.modsMap).filter(function(id) {
            return this.modsMap[id] === mod;
        }, this).forEach(function(id) {
            delete this.modsMap[id];
        }, this);
        this.getModifications().remove(mod);
    },

    onDocumentLoaded : function() {
        this.addModificationButtons();
    },

    addModificationButtons: function() {
       this.addActiveModificationButtons();
       this.addPassiveModificationButtons();
    },

    addActiveModificationButtons: function() {
        var me = this, app = me.application;
            markerButtons = {
                activeModifications: {
                    label: AknModsMarker.Strings.get('activeModifications')
                },
                insertionCustom: {
                    label: AknModsMarker.Strings.get('insertion'),
                    handler: me.activeInsertionHandler,
                    markAsButton: "mod",
                    modType: "insertion"
                },
                repealCustom: {
                    label: AknModsMarker.Strings.get('repeal'),
                    handler: me.activeDelHandler,
                    markAsButton: "mod",
                    modType: "repeal"
                },
                substitutionCustom: {
                    label: AknModsMarker.Strings.get('substitution'),
                    handler: me.activeSubstitutionHandler,
                    markAsButton: "mod",
                    modType: "substitution"
                },
                splitCustom: {
                    label: AknModsMarker.Strings.get('split'),
                    handler: me.activeSplitHandler,
                    markAsButton: "mod",
                    modType: "split"
                },
                joinCustom: {
                    label: AknModsMarker.Strings.get('join'),
                    handler: me.activeJoinHandler,
                    markAsButton: "mod",
                    modType: "join"
                },
                renumberingCustom: {
                    label: AknModsMarker.Strings.get('renumbering'),
                    handler: me.activeRenumberingHandler,
                    markAsButton: "mod",
                    modType: "renumbering"
                },
                destintionText: {
                    label: AknModsMarker.Strings.get('destinationText')
                },
                action: {
                    label: AknModsMarker.Strings.get('action')
                },
                redlineInline: {
                    label: AknModsMarker.Strings.get('redlineInline')
                }
            },
            rules = {
                elements: {
                    activeModifications: {
                        children: ["commonReference", "destintionText", "action", "redlineInline", "embeddedStructure"]
                    },
                    redlineInline: {
                        children: ["ins", "del"]
                    },
                    destintionText: {
                        children: ["quotedStructure", "quotedText"]
                    },
                    action: {
                        children: ["mmod", "insertionCustom", "repealCustom", "substitutionCustom", "splitCustom", "joinCustom", "renumberingCustom"]
                    }
                }
            },
            config = {
                name : 'activeModifications',
                group: "rootButtons",
                //after: "commonReference",
                buttons: markerButtons,
                rules: rules,
                scope: me
            };
       app.fireEvent(Statics.eventsNames.addMarkingButton, config);
       me.activeModButtons = markerButtons;
    },

    addPassiveModificationButtons: function() {
         var me = this, app = me.application;
            markerButtons = {
                passiveModifications: {
                    label: AknModsMarker.Strings.get('passiveModifications')
                },
                insertionCustom: {
                    label: AknModsMarker.Strings.get('insertion'),
                    handler: me.beforeInsertionHandler
                },
                repealCustom: {
                    label: AknModsMarker.Strings.get('repeal'),
                    handler: me.beforeDelHandler
                },
                substitutionCustom: {
                    label: AknModsMarker.Strings.get('substitution'),
                    handler: me.beforeSubstitutionHandler,
                    elementStyle: "background-color: #fcf8e3;border-color: #faebcc;",
                    // labelStyle: "border-color: #faebcc;",
                    // shortLabel: AknModsMarker.Strings.get('substitution'),
                    modType: "substitution"
                },
                splitCustom: {
                    label: AknModsMarker.Strings.get('split'),
                    handler: function(button) {
                        if ( me.defaultPassiveModMode == 'consolidation' ) {
                            me.splitHandlerConsolidation(button);
                        } else {
                            me.splitHandler(button);
                        }
                    }
                },
                joinCustom: {
                    label: AknModsMarker.Strings.get('join'),
                    handler: function(button) {
                        if ( me.defaultPassiveModMode == 'consolidation' ) {
                            me.joinHandlerConsolidation(button);
                        } else {
                            me.joinHandler(button);
                        }
                    }
                },
                renumberingCustom: {
                    label: AknModsMarker.Strings.get('renumbering'),
                    handler: function (button) {
                        if ( me.defaultPassiveModMode == 'consolidation' ) {
                            me.renumberingHandlerConsolidation(button);
                        } else {
                            me.renumberingHandler(button);
                        }
                    }
                },
                destintionText: {
                    label: AknModsMarker.Strings.get('destinationText')
                },
                action: {
                    label: AknModsMarker.Strings.get('action')
                }
            },
            rules = {
                elements: {
                    passiveModifications: {
                        children: ["commonReference", "destintionText", "action"]
                    },
                    destintionText: {
                        children: ["quotedStructure", "quotedText"]
                    },
                    action: {
                        children: ["insertionCustom", "repealCustom", "substitutionCustom", "splitCustom", "joinCustom", "renumberingCustom"]
                    }
                }
            },
            config = {
                name : 'passiveModifications',
                group: "rootButtons",
                //after: "activeModifications",
                buttons: markerButtons,
                rules: rules,
                scope: me
            };
       app.fireEvent(Statics.eventsNames.addMarkingButton, config);
       me.passiveModButtons = markerButtons;
    },

    initPosMenu: function() {
        var me = this, modPosChecked = Ext.bind(this.modPosChecked, this);
        this.posMenu = {
            items : [{
                type: "start"
            },{
                type: "before"
            },{
                type: "inside"
            },{
                type: "after"
            },{
                type: "end"
            },{
                type: "unspecified"
            }]
        };

        Ext.each(this.posMenu.items, function(item) {
            item.text = AknModsMarker.Strings.get(item.type);
            item.checkHandler = modPosChecked;
            item.group = "modPos";
            item.checked = false;
        });
    },

    setMaskEditors: function(leftMask, rightMask) {
        var rightEditor = this.getMainEditor().up(),
            leftEditor = this.getSecondEditor() && this.getSecondEditor().up();

        if (leftEditor) {
            if (leftMask)
                leftEditor.mask();
            else
                leftEditor.unmask();
        }

        if (rightMask)
            rightEditor.mask();
        else
            rightEditor.unmask();
    },

    secondEditorClickHandler: function(editor, evt) {
        var selectedNode = DomUtils.getFirstMarkedAncestor(evt.target);
        Ext.callback(this.secondEditorClickHandlerCustom, this, [selectedNode, evt, editor]);
    },

    modPosChecked: function(cmp, checked) {
        var me = this,
            typesMenu = cmp.up("*[name=types]"),
            pos, destination;
        if(checked && typesMenu && typesMenu.textMod) {
            destination = typesMenu.textMod.querySelector('*[class="destination"]');
            if(destination) {
                pos = LangProp.getNodeLangAttr(destination, "pos");
                destination.setAttribute(pos.name, cmp.type);
            }
        }
    },

    // This function is called by overridden ImportController
    detectExistingMods: function() {
        var me = this,
            editorBody = me.getController("Editor").getBody();

        var getNodeByModRec = function(rec) {
            var href = rec.get('href');
            if (!href) return;
            return editorBody.querySelector("*[" + LangProp.attrPrefix + "eid='"+href+"']") ||
                    editorBody.querySelector("*[" + DomUtils.elementIdAttribute + "='"+href+"']") ||
                    editorBody.querySelector("*[" + LangProp.attrPrefix + "href='"+href+"']") ||
                    editorBody.querySelector("*[" + LangProp.attrPrefix + "href='#"+href+"']");
        };

        var bindNode = function(rec) {
            var referencedNode = getNodeByModRec(rec);
            if (!referencedNode) return;
            // Set the source href to internetId because the eId can change,
            // at the translation this process will be reverted
            var refId = referencedNode.getAttribute(DomUtils.elementIdAttribute);
            rec.set('href', refId);
            return referencedNode;
        };

        var bindDestNode = function(rec) {
            var referencedNode = getNodeByModRec(rec);
            if (referencedNode) {
                var refId = referencedNode.getAttribute(DomUtils.elementIdAttribute);
                rec.set('href', AknMain.metadata.HtmlSerializer.normalizeHref(
                                    referencedNode.getAttribute(LangProp.attrPrefix+'href')
                                )
                    );
                rec.set('refInternalId', refId);
            } else {
                rec.set('refInternalId', 'customHref');
            }
        };

        var setModAttrs = function(mod, rec, bindCustom) {
            var modNode = Ext.isFunction(bindCustom) ? bindCustom(rec) : bindNode(rec);
            if (!modNode) return;
            var id = modNode.getAttribute(DomUtils.elementIdAttribute);
            me.modsMap[id] = mod;
            me.setModDataAttributes(modNode, mod.get('modType'));
            return modNode;
        };

        me.getTextualMods('active').forEach(function(mod) {
            var isLinked = false;
            mod.getSourceDestinations('source').forEach(function(rec) {
                var modNode = setModAttrs(mod, rec);
                if (modNode) {
                    isLinked = true;
                }
            });
            mod.set('_isLinked', isLinked);
            mod.getSourceDestinations('destination').forEach(function(rec) {
                setModAttrs(mod, rec, bindDestNode);
            });
            mod.getTextualChanges().forEach(bindNode);
        });

        me.getTextualMods('passive').forEach(function(mod) {
            //TODO: check if destination href for substitution needs id update
            var modEls = mod.getSourceDestinations('destination');
            if (mod.get('modType') == 'substitution') {
                modEls = mod.getTextualChanges('new');
            }
            var isLinked = false;
            var oldText = mod.getOldText();
            modEls.forEach(function(rec) {
                var modNode = setModAttrs(mod, rec);
                if (modNode) {
                    isLinked = true;
                    if (oldText) {
                        modNode.setAttribute('data-old-text', oldText);
                    }
                }
            });
            mod.set('_isLinked', isLinked);
        });
    },

    getTextualMods: function(amendmentType) {
        var mods = [];

        this.getModifications().each(function(mod) {
            if ((mod.get('type') == 'textualMod') &&
                (!amendmentType || mod.get('amendmentType') == amendmentType ) )
                mods.push(mod);
        });
        return mods;
    },

    getModifications: function() {
        return Ext.getStore('metadata').getMainDocument().modifications();
    },

    beforeContextMenuShow: function(menu, node) {
        var me = this,
            elementName = DomUtils.getElementNameByNode(node);

        if(!elementName && node) {
            node = DomUtils.getFirstMarkedAncestor(node.parentNode);
            elementName = DomUtils.getElementNameByNode(node);
        }

        if (!node || !elementName) return;

        switch(elementName) {
            case 'ref':
                me.addRefContextMenuItem(node, menu);
                break;
            case 'mod':
                me.addModContextMenuItem(node, menu);
                me.addModifiersContextMenuItem(node, menu);
                break;
            case 'quotedStructure':
            case 'quotedText':
                me.addQuotedContextMenuItem(node, menu, elementName);
                me.addModifiersContextMenuItem(node, menu);
                break;
            case 'ins':
            case 'del':
                me.addInsDelContextMenuItem(node, menu);
                break;
        }
    },

    // TODO: move this function from this file
    addRefContextMenuItem: function(node, menu) {
        if(!menu.down("*[name=openlink]"))
            menu.add({
                text : 'Resolve link',
                name: 'openlink',
                refNode: node,
                handler : function() {
                    var href = node.getAttribute('akn_href');
                    if (href && href.length > 3) {
                        window.open('http://akresolver.cs.unibo.it' + href);
                    }
                }
            });
    },

    addModContextMenuItem: function(node, menu) {
        if(menu.down("*[name=modType]")) return;
        node = this.ensureModNode(node);
        var me = this,
            mod = this.getModFromNode(node, 'active'),
            modType = mod && mod.textMod.get('modType');

        menu.add(['-', {
            text : AknModsMarker.Strings.get('modType'),
            name: "modType",
            menu : {
                items : [{
                    text : AknModsMarker.Strings.get('insertion'),
                    modType: 'insertion',
                    group : 'modType',
                    refNode: node,
                    checked: (modType == "insertion") ? true : false,
                    checkHandler : Ext.bind(me.onModTypeSelected, me)
                }, {
                    text : AknModsMarker.Strings.get('repeal'),
                    modType: 'repeal',
                    group : 'modType',
                    refNode: node,
                    checked: (modType == "repeal") ? true : false,
                    checkHandler : Ext.bind(me.onModTypeSelected, me)
                }, {
                    text : AknModsMarker.Strings.get('substitution'),
                    modType: 'substitution',
                    group : 'modType',
                    refNode: node,
                    checked: (modType == "substitution") ? true : false,
                    checkHandler : Ext.bind(me.onModTypeSelected, me)
                }]
            }
        }]);
        if (mod)
            me.addRefsMenuItems(node, menu, mod);
    },

    addRefsMenuItems: function(node, menu, mod) {
        var me = this, itemName = 'externalRefs';

        if(menu.down("*[name="+itemName+"]")) return;

        var onFocusRefItem = function(item) {
            me.application.fireEvent('nodeFocusedExternally', item.ref.node, {
                select : true,
                scroll : true
            });
        };

        var destinations = mod.textMod.getSourceDestinations('destination');
        var findDestinationByRef = function(node) {
            var refId = node.getAttribute(DomUtils.elementIdAttribute);
            var href = node.getAttribute(LangProp.attrPrefix+'href');
            return me.findDestination(destinations, refId, href);
        }

        var createHrefCustomizer = function(text, onAccept) {
            var onClose = function(cmp) {
                cmp.close();
            };
            me.createAndShowFloatingForm(node, 'Destination href', text, false,
                function(cmp, newText) {
                    onAccept(newText);
                    onClose(cmp);
                }, onClose
            ).center();
        }

        var onSelectRefItem = function(item, checked) {
            var refNode = item.ref.node;
            var dest = findDestinationByRef(refNode);
            if (checked && !dest) {
                var href = refNode.getAttribute(LangProp.attrPrefix+'href');
                createHrefCustomizer(href, function(newHref) {
                    var ref = refNode;
                    if (newHref != href) {
                        // Create a clone and update the href attribute
                        ref = ref.cloneNode(true);
                        setFakeRefAttributes(ref, newHref);
                    }
                    me.bindActiveModRef(mod.textMod, ref, true);
                });
            } else if (!checked && dest) {
                mod.textMod.sourceDestinations().remove(dest);
            }
            me.application.fireEvent('nodeFocusedExternally', node, {
                select : false,
                scroll : true
            });
        };

        var setFakeRefAttributes = function(node, href) {
            node.setAttribute(LangProp.attrPrefix+'href', href);
            node.setAttribute(DomUtils.elementIdAttribute, 'customHref');
            return node;
        };

        var refNodeMap = function(ref) {
            return {
                text : ref.href || Ext.String.ellipsis(ref.text, 50),
                ref: ref,
                checked: findDestinationByRef(ref.node) !== undefined,
                checkHandler : onSelectRefItem,
                listeners: {
                    focus: onFocusRefItem
                }
            };
        };

        var refDestinationMap = function(dest) {
            var href = dest.get('href');
            // Creating a fake ref element in order to use the same functions
            // of real references
            var fakeRef = node.ownerDocument.createElement('span');
            return refNodeMap({
                href: href,
                node: setFakeRefAttributes(fakeRef, href)
            });
        };

        var isCustomDestination = function(dest) {
            var refId = dest.get('refInternalId');
            return refId === 'customHref' || !refId;
        };

        var items = me.getModRelatedReferences(node).map(refNodeMap)
                    .concat(destinations.filter(isCustomDestination).map(refDestinationMap));

        menu.add(['-', {
            text : AknModsMarker.Strings.get('setRefs'),
            name: itemName,
            defaultType: 'checkboxfield',
            menu : {
                items : items
            }
        }]);
    },

    getModRelatedReferences: function(node) {
        // Get the outmost hcontainer parent
        var nodeWithRefs = Xml.Document.newDocument(node)
                            .select("(./ancestor::*[contains(@class, 'hcontainer')])[1]")[0]
                            || node.ownerDocument;
        var references = Ext.Array.toArray(nodeWithRefs.querySelectorAll('.ref')).filter(function(refNode) {
            var nodePos = node.compareDocumentPosition(refNode);
            // Keep the references that precedes and contained in the mod node
            return nodePos & Node.DOCUMENT_POSITION_PRECEDING ||
                    nodePos & Node.DOCUMENT_POSITION_CONTAINED_BY;
        }).map(function(refNode) {
            return {
                text: refNode.textContent,
                node: refNode
            }
        }).reverse();
        return references;
    },

    addModifiersContextMenuItem: function(node, menu) {
        if(menu.down("*[name=modifiers]")) return;
        var mod = this.getModFromNode(this.ensureModNode(node), 'active');
        mod = mod && mod.textMod;
        if (!mod) return;

        var onModifierChecked = function(type, cmp, checked) {
            mod.set(type, checked);
        }

        var onRedlineChecked = function(type, cmp, checked) {
            if (checked) {
                var ref = AknMain.RefersTo.getRef('TLCConcept', type);
                mod.set('refers', ref.get('eid'));
            } else {
                mod.set('refers', '');
            }
        }

        var createModifierItem = function(type) {
            return {
                text : AknModsMarker.Strings.get(type),
                checked: mod.get(type),
                checkHandler : onModifierChecked.bind(this, type)
            };
        }

        var createRedlineItem = function(type) {
            return {
                text : AknModsMarker.Strings.get(type),
                checked: mod.get('refers') === type.toLowerCase(),
                group: 'redline',
                checkHandler : onRedlineChecked.bind(this, type)
            };
        }

        menu.add([{
            text : AknModsMarker.Strings.get('setModifiers'),
            name: 'modifiers',
            defaultType: 'checkboxfield',
            menu : {
                items : [
                    createModifierItem('incomplete'),
                    createModifierItem('exclusion'),
                    createRedlineItem('redline'),
                    createRedlineItem('redlineMultiple')
                ]
            }
        }]);
    },

    //TODO: test the working all this function
    addQuotedContextMenuItem: function(node, menu, name) {
        var me = this;
        var getPosMenuChecked = function(textMod) {
            var posMenu = Ext.clone(me.posMenu);
            var destination = textMod.getSourceDestinations('destination')[0];
            var pos = (destination) ? destination.get('pos') : false;
            posMenu.items.filter(function(item) {
                return pos && item.type == pos;
            }).map(function(item) {
                item.checked = true;
            });

            return posMenu;
        };
        me.addModContextMenuItem(node, menu);
        if (!me.isNodeInsideMod(node)) {
            return me.addExternalContextMenuItems(menu, node, name);
        }
        var markedParent = DomUtils.getFirstMarkedAncestor(node.parentNode);
        me.addPosMenuItems(menu, node, name, markedParent);
        var textMod = me.getModFromNode(markedParent);
        if (!textMod) return;

        // TODO: check modElement
        var modType = textMod.modElement.get('type');

        if(!menu.down("*[name=quotedType]")) {
            menu.add(['-', {
                text : AknModsMarker.Strings.get('type'),
                name: "quotedType",
                menu : {
                    name: "types",
                    textMod: textMod.textMod,
                    refNode: node,
                    modElement: textMod.modElement,
                    items : [{
                        text : 'Old',
                        group : 'modType',
                        textMod: textMod.textMod,
                        modElement: textMod.modElement,
                        refNode: node,
                        type: "old",
                        checked: (modType == "old") ? true : false,
                        checkHandler : Ext.bind(me.onTypeSelected, me)
                    }, {
                        text : 'New',
                        group : 'modType',
                        checked: (modType == "new") ? true : false,
                        textMod: textMod.textMod,
                        refNode: node,
                        modElement: textMod.modElement,
                        type: "new",
                        checkHandler : Ext.bind(me.onTypeSelected, me)
                    }, {
                        text : 'Pos',
                        group : 'modType',
                        checked: (modType == "pos") ? true : false,
                        type: "pos",
                        checkHandler : Ext.bind(me.onTypeSelected, me),
                        menu: getPosMenuChecked(textMod.textMod)
                    }]
                }
            }]);
        }
    },

    isNodeInsideMod: function(node) {
        var markedParent = DomUtils.getFirstMarkedAncestor(node.parentNode);
        return markedParent && DomUtils.getElementNameByNode(markedParent) === 'mod';
    },

    addInsDelContextMenuItem: function(node, menu) {
        var me = this;
        if (!me.isNodeInsideMod(node)) return;
        var textMod = me.getModFromNode(me.ensureModNode(node), 'active');
        if (!textMod) return;
        var mod = textMod.textMod;
        var elId = node.getAttribute(DomUtils.elementIdAttribute);

        var onTypeSelected = function(cmp, checked) {
            var textChange;
            if (checked) {
                textChange = mod.getTextualChanges(cmp.type)[0] ||
                             mod.textualChanges().add({ type: cmp.type })[0];
                textChange.set('href', elId);
            } else {
                textChange = me.findTextChange(mod, cmp.type, elId);
                mod.textualChanges().remove(textChange);
            }
        };

        var isChecked = function(type) {
            return me.findTextChange(mod, type, elId) !== undefined;
        };

        var createMenuItem = function(type) {
            return {
                text: AknModsMarker.Strings.get(type),
                type: type,
                checked: isChecked(type),
                group: 'insDelType',
                checkHandler: onTypeSelected
            };
        };

        menu.add(['-', {
            text: AknModsMarker.Strings.get('type'),
            menu: {
                items: [
                    createMenuItem('old'),
                    createMenuItem('new')
                ]
            }
        }]);
    },

    findTextChange: function(mod, type, href) {
        return mod.getTextualChanges(type)
                .filter(function(textChange) {
                    return textChange.get('href') === href;
                })[0];
    },

    getModFromNode: function(node, amendmentType) {
        var elId = node && node.getAttribute(DomUtils.elementIdAttribute);
        return elId && this.getModFromElId(elId, amendmentType);
    },

    getModFromElId: function(id, amendmentType) {
        var mod = this.modsMap[id];
        if (!mod || amendmentType && mod.get('amendmentType') != amendmentType) return;
        var modEls = mod.getSourceDestinations()
                        .concat(mod.getTextualChanges())
                        .filter(function(modEl) {
                            return modEl.get('href') === id;
                        });
        return {
            textMod: mod,
            modElement: modEls[0]
        };
    },

    addPosMenuItems: function(menu, node, elementName, markedParent) {
        var mod = this.getModFromNode(node);
        if(!mod || !mod.modElement) return;

        var type = mod.modElement.get('type');
        if(type == "destination" || type == "source") {
            if(!menu.down("*[name=modPos]")) {
                var posMenu = Ext.clone(this.posMenu);
                var pos = mod.modElement.get('pos');
                if(pos) {
                    menuItem = posMenu.items.filter(function(item) {
                        return item.type == pos;
                    })[0];
                    if(menuItem) {
                        menuItem.checked = true;
                    }
                }
                posMenu.textMod = mod.textMod;
                posMenu.name = "types";
                menu.add(['-', {
                    name: "modPos",
                    text : 'Pos',
                    type: "pos",
                    menu: posMenu
                }]);
            }
        }
    },

    addExternalContextMenuItems: function(menu, node, elementName) {
        var me = this;
        if(Ext.Array.contains(me.getExternalConnectedElements(), elementName)) {
            if(!menu.down("*[name=connectExternal]")) {
                var mods = me.getModNodes(),
                    items = [];
                Ext.each(mods, function(mod) {
                    items.push({
                        text : AknModsMarker.Strings.get(mod.type),
                        modType: mod.type,
                        group : 'connectExternal',
                        refMod: mod,
                        checked: false,
                        checkHandler : Ext.bind(me.onExternalConnect, me),
                        listeners: {
                            focus: Ext.bind(me.onFocusExternalMenuItem, me)
                        }
                    });
                });

                menu.add(['-', {
                    text : 'Set as external mod element',
                    name: "connectExternal",
                    menu : {
                        items : items
                    }
                }]);
            }
        }
    },

    getModNodes: function() {
        var editorBody = this.getController("Editor").getBody(),
            modNodes = Ext.toArray(editorBody.querySelectorAll("[class~='mod']"));

        return modNodes.map(function(node) {
            return {
                node: node,
                type: node.dataset.modtype
            }
        });
    },

    onFocusExternalMenuItem: function(cmp) {
        this.application.fireEvent('nodeFocusedExternally', cmp.refMod.node, {
            select : true,
            scroll : true
        });
    },

    onExternalConnect: function(cmp, checked) {
        console.log(cmp, checked);
    },

    onModTypeSelected: function(cmp, checked) {
        var me = this,
            node = me.ensureModNode(cmp.refNode, true);
        if(checked && node) {
            var mod = me.getModFromNode(node);
            if (mod && mod.textMod.get('modType') == cmp.modType) return;
            me.addModMetadata(node, cmp.modType);
        } else if(!checked) {
            me.setModDataAttributes(node, false);
        }
    },

    ensureModNode: function(node, wrapWithMod) {
        if (DomUtils.getNameByNode(node) == 'mod') return node;
        var parent = DomUtils.getFirstMarkedAncestor(node.parentNode);
        if (DomUtils.getNameByNode(parent) == 'mod') return parent;
        if (!wrapWithMod) return node;
        var mod = node.ownerDocument.createElement('div');
        node.parentNode.insertBefore(mod, node);
        mod.appendChild(node);
        this.getController("Marker").autoWrap(DocProperties.getFirstButtonByName('mod'), {
            silent : true,
            noEvent : true,
            nodes : [mod]
        });
        return mod;
    },

    addModMetadata: function(node, type) {
        this.removeMod(node.getAttribute(DomUtils.elementIdAttribute));
        switch(type) {
            case 'insertion':
                return this.addActiveInsMeta(node);
            case 'substitution':
                return this.addActiveSubMeta(node);
            case 'repeal':
                return this.addActiveDelMeta(node);
        }
    },

    setModDataAttributes: function(node, type) {
        if (type)
            node.setAttribute('data-modtype', type);
        else
            node.removeAttribute('data-modtype');
    },

    onTypeSelected: function(cmp, checked) {
        var me = this;
        //TODO: check pos type
        if(checked && cmp.textMod && cmp.modElement) {
            var oldType = cmp.modElement.get('type');
            var sameType = cmp.textMod.getTextualChanges(oldType);

            if(sameType.length == 1)
                sameType.set('type', oldType);

            cmp.modElement.set('type', cmp.type);
        } else if(checked && cmp.textMod) { //TODO: check this case
            var hrefAttr = LangProp.attrPrefix+'href',
                elId = cmp.refNode.getAttribute(DomUtils.elementIdAttribute),
                existedEl = cmp.textMod.querySelector("*[class='"+cmp.type+"']["+hrefAttr+"='#']"),
                href = (elId) ? "#"+elId : "#";

            if(existedEl) {
                existedEl.setAttribute(hrefAttr, href);
            } else {
                var textModObj = {
                    name: cmp.type,
                    attributes: [{
                        name: hrefAttr,
                        value: href
                    }]
                };
                var modEl = me.objToDom(cmp.textMod.ownerDocument, textModObj);
                //me.insertTextModChildInOrder(cmp.textMod, modEl);
            }
        }
    },

    setElementStyles: function(markedElements, button, originalButton, buttonCfg) {
        var me = this,
        buttonCfg = buttonCfg || me.activeModButtons[originalButton.name];

        Ext.each(markedElements, function(markedElement) {
            markedElement.setAttribute(buttonCfg.modType, "true");
        });
    },

    getTextualModId: function() {
        return "pmod_"+(this.getModifications().count()+1);
    },

    activeInsertionHandler: function(button, markedElements, originalButton) {
        if(!markedElements.length) return;
        var modEl = markedElements[0];
        var textualMod = this.addActiveInsMeta(modEl);
        this.askForRenumbering(modEl, textualMod);
    },

    addActiveInsMeta: function(node) {
        var quotedEl = node.querySelector("*[class~=quotedStructure], *[class~=quotedText]"),
            newHref = (quotedEl) ? quotedEl.getAttribute(DomUtils.elementIdAttribute) : "";

        var meta = {
            "new": newHref
        };

        return this.addActiveMeta(node, 'insertion', meta);
    },

    activeDelHandler: function(button, markedElements, originalButton) {
        if(!markedElements.length) return;
        var modEl = markedElements[0];
        var textualMod = this.addActiveDelMeta(modEl);
        this.askForRenumbering(modEl, textualMod);
    },

    addActiveDelMeta: function(node) {
        return this.addActiveMeta(node, 'repeal');
    },

    findModRef: function(node) {
        var ref = Array.prototype.slice.call(node.querySelectorAll('*[class~=ref]')).filter(function(el) {
            return (node == DomUtils.getFirstMarkedAncestor(el.parentNode));
        })[0];
        return ref;
    },

    addActiveMeta: function(node, type, meta) {
        meta = meta || {};
        var data = {
            amendmentType: 'active',
            type: 'textualMod',
            modType: type,
            eid: this.getTextualModId()
        };
        var mod = this.getModifications().add(data)[0];
        this.modsMap[node.getAttribute(DomUtils.elementIdAttribute)] = mod;

        mod.sourceDestinations().add({
            type: 'source',
            href: node.getAttribute(DomUtils.elementIdAttribute)
        });

        var ref = this.findModRef(node);
        if (ref)
            this.bindActiveModRef(mod, ref);

        if (meta['new'])
            mod.textualChanges().add({ type: 'new', href: meta['new']});

        if (meta['old'])
            mod.textualChanges().add({ type: 'old', href: meta['old']});
        this.setModDataAttributes(node, type);
        return mod;
    },

    bindActiveModRef: function(mod, refNode, allowMultiple) {
        var destination = {};
        var destinations = mod.getSourceDestinations('destination');
        if (destinations.length > 0 && !allowMultiple) {
            destination = destinations[0];
        } else {
            destination = mod.sourceDestinations().add({
                type: 'destination'
            })[0];
        }
        destination.set('href', refNode.getAttribute(LangProp.attrPrefix+'href'));
        destination.set('refInternalId', refNode.getAttribute(DomUtils.elementIdAttribute));
    },

    activeSubstitutionHandler: function(button, markedElements, originalButton) {
        if(!markedElements.length) return;
        var modEl = markedElements[0];
        var textualMod = this.addActiveSubMeta(modEl);
        this.askForRenumbering(modEl, textualMod);
    },

    addActiveSubMeta: function(node) {
        var quotedEls = node.querySelectorAll("*[class~=quotedStructure], *[class~=quotedText]");
            newHref = (quotedEls[0]) ? quotedEls[0].getAttribute(DomUtils.elementIdAttribute) : "",
            oldHref = (quotedEls[1]) ? quotedEls[1].getAttribute(DomUtils.elementIdAttribute) : "";

        var meta = {
            "old": oldHref,
            "new": newHref
        };

        return this.addActiveMeta(node, 'substitution', meta);
    },

    addPassiveMeta: function(node, type, meta) {
        meta = meta || {};
        var data = Ext.merge({
            amendmentType: 'passive',
            type: 'textualMod',
            modType: type,
            eid: this.getTextualModId(),
            _isLinked: true
        }, meta.extraData);
        var mod = this.getModifications().add(data)[0];
        this.modsMap[node.getAttribute(DomUtils.elementIdAttribute)] = mod;

        Ext.each(meta.sourceDestinations, function(data) {
            mod.sourceDestinations().add(data);
        });
        Ext.each(meta.textualChanges, function(data) {
            mod.textualChanges().add(data);
        });

        this.setModDataAttributes(node, type);
        return mod;
    },

    activeJoinHandler: function(button, markedElements, originalButton) {
        if(!markedElements.length) return;
        var modEl = markedElements[0];
        var textualMod = this.activeCommonMeta(modEl, 'join');
        this.askForRenumbering(modEl, textualMod);
    },

    activeSplitHandler: function(button, markedElements, originalButton) {
        if(!markedElements.length) return;
        var modEl = markedElements[0];
        var textualMod = this.activeCommonMeta(modEl, 'split');
        this.askForRenumbering(modEl, textualMod);
    },

    activeRenumberingHandler: function(button, markedElements, originalButton) {
        if(!markedElements.length) return;
        var modEl = markedElements[0];
        this.activeCommonMeta(modEl, 'renumbering');
    },

    activeCommonMeta: function(node, type) {
        var quotedEls = node.querySelectorAll("*[class~=quotedStructure], *[class~=quotedText]"),
            newHref = (quotedEls[0]) ? quotedEls[0].getAttribute(DomUtils.elementIdAttribute) : "",
            oldHref = (quotedEls[1]) ? quotedEls[1].getAttribute(DomUtils.elementIdAttribute) : "";

        var meta = {
            "old": oldHref,
            "new": newHref
        };

        return this.addActiveMeta(node, type, meta);
    },

    beforeInsertionHandler: function() {
        var me = this,
            editor = me.getController('Editor'),
            selectionRange = editor.lastSelectionRange || editor.getEditor().selection.getRng();

        if ( selectionRange.toString() ) {
            var aliasButton = DocProperties.getFirstButtonByName('ins');
            me.application.fireEvent('markingMenuClicked', aliasButton, {
                callback : Ext.bind(me.insertionHandler, me)
            });
        } else {
            var focusedNode = editor.getFocusedNode();
            if ( !focusedNode ) return;

            var button = DomUtils.getButtonByElement(focusedNode);
            me.insertionHandler(button, [focusedNode]);
            // For now ask renumbering only in consolidation mode
            if ( me.defaultPassiveModMode != 'consolidation' ) return;
            me.askForRenumbering(function() {
                me.getNextSiblingsSameCls(focusedNode).forEach(function(node, index, arr) {
                    var prevNode = (index != 0) ? arr[index-1] : focusedNode;
                    // Register a renumbering as if the previous sibling were the old node
                    // this works in most cases but not always
                    // TODO: try to get the real old node from the previous version
                    me.updateRenumberingMetadata(node, prevNode);
                });
            });
        }
    },

    getNextSiblingsSameCls: function(node) {
        var allSiblings = this.getAllSibSameClass(node);
        return allSiblings.slice(allSiblings.indexOf(node)+1);
    },

    getAllSibSameClass: function(node) {
        var cls = node.getAttribute('class'),
            nodes = [],
            children = node.parentNode.children;
        for(var i = 0; i < children.length; i++) {
            if (children[i].getAttribute('class') === cls)
                nodes.push(children[i])
        }
        return nodes;
    },

    insertionHandler: function(button, markedElements) {
        var node = markedElements[0];
        var meta = {
            sourceDestinations: [{type:'source', href: ''},
                                {type:'destination', href: node.getAttribute(DomUtils.elementIdAttribute)}]
        };
        this.setModDataAttributes(node, "insertion");
        return this.addPassiveMeta(node, 'insertion', meta);;
    },

    renumberingHandler: function(button) {
        var me = this, editor = me.getController("Editor"),
            selectedNode = editor.getSelectedNode(true);

        var num = Ext.Array.toArray(selectedNode.querySelectorAll(".num")).filter(function(num) {
            return num.parentNode == selectedNode;
        })[0];

        if(num) {
            me.createRenumbering(num, null, false, selectedNode);
        } else {
            Ext.MessageBox.alert("Error", "Number to renumbering is missing!");
        }

    },

    renumberingHandlerConsolidation: function() {
        var me = this, editor = me.getController('Editor'),
            selection = editor.getSelectionObject(null, null, true),
            renumberNode = me.ensureHcontainerNode(DomUtils.getFirstMarkedAncestor(selection.start));

        if (!renumberNode) {
            return Ext.MessageBox.alert('Error', 'You have to select a fragment to renumber');
        }
        me.setMaskEditors(false, true);
        var markButton = DomUtils.getButtonByElement(renumberNode);

        var close = function(cmp) {
            me.setMaskEditors(false, false);
            cmp.close();
        };

        var winCmp = me.createAndShowFloatingForm(renumberNode, 'Select the renumbered fragment from the old side', false, false, function(cmp) {
            if (!cmp.selectedNode) {
                return Ext.MessageBox.alert("Error", 'You have to select the fragment which was renumbered.');
            }
            me.registerRenambering(renumberNode, cmp.selectedNode);
            close(cmp);
        }, close, {
            items : [{
                xtype: 'box',
                itemId: 'selectedMsg',
                margin: '0 0 20 0'
            }],
            width: 400
        });

        winCmp.center();

        var setSelectedNode = function(node, name) {
            var msg = '';
            var selectedText = node && node.textContent.trim() || '';
            if (selectedText) {
                var num = node && DomUtils.getNodeExtraInfo(node, 'hcontainer', 10);
                var tpl = new Ext.Template("<h4 style=\"margin: 0px;\">You've selected the fragment {name} ({num}) containing this text:</h4>{text}");
                msg = tpl.apply({
                    text: Ext.String.ellipsis(selectedText.trim(), 200, true),
                    name: name,
                    num: num
                });
                winCmp.selectedNode = node;
            } else {
                winCmp.selectedNode = null;
            }

            winCmp.down('[itemId=selectedMsg]').setHtml(msg);
        };

        me.secondEditorClickHandlerCustom = function(node) {
            node = me.ensureHcontainerNode(node);
            var oldNodeButton = node && DocProperties.getFirstButtonByName(DomUtils.getNameByNode(node));
            if ( !node || !oldNodeButton || !winCmp || !winCmp.isVisible() ) return;

            if ( markButton.name != oldNodeButton.name ) {
                winCmp.selectedNode = null;
                setSelectedNode(null);
                return Ext.Msg.alert(Locale.strings.error, new Ext.Template(AknModsMarker.Strings.get('haveToSelectElement')).apply({
                    name : markButton.name
                }));
            }

            setSelectedNode(node, oldNodeButton.name);
        };
    },

    registerRenambering: function(node, oldNode) {
        var me = this;
        // Propagate the renumbering by adding implicit renumberings
        // based on the position of nodes so it's not very precise
        // The idea is to simulate the removal of node and oldNode
        // from the interval of siblings in the middle of the two nodes
        // and adding a renumbering for each pair of nodes old-new.
        var propagateRenumbering = function() {
            var children = me.getAllSibSameClass(node);
            var childrenOld = me.getAllSibSameClass(oldNode);
            var nodeIndex = children.indexOf(node);
            var oldNodeIndex = childrenOld.indexOf(oldNode);
            var minIndex = Math.min(nodeIndex, oldNodeIndex);
            var maxIndex = Math.max(nodeIndex, oldNodeIndex);
            // Consider the portion of the list from minIndex to maxIndex
            children = children.slice(minIndex, maxIndex+1);
            childrenOld = childrenOld.slice(minIndex, maxIndex+1);
            // Remove node and oldNode from children list
            nodeIndex = children.indexOf(node);
            oldNodeIndex = childrenOld.indexOf(oldNode);
            children.splice(nodeIndex, 1);
            childrenOld.splice(oldNodeIndex, 1);

            // Apply renumbering to nodes in the middle
            children.forEach(function(node, index) {
                // TODO: understand if some check is needed before set renumbering
                if (childrenOld[index]) {
                    me.updateRenumberingMetadata(node, childrenOld[index]);
                }
            });
        };
        me.updateRenumberingMetadata(node, oldNode);
        me.askForRenumberingPropagation(propagateRenumbering);
    },

    askForRenumberingPropagation: function(callback) {
        Ext.Msg.confirm(
            AknModsMarker.Strings.get('renumbering'),
            AknModsMarker.Strings.get('propagationRenumbering'),
            function(res) {
                if (res === 'yes' && callback) callback();
            }
        );
    },

    splitHandler: function(button) {
        var me = this, editor = me.getController("Editor"),
            selection = editor.getSelectionObject(null, null, true),
            node = DomUtils.getFirstMarkedAncestor(selection.node),
            formTitle = "Select the element to split";

        if(node && selection.start == selection.node && selection.node == selection.start) {
            // Save a reference of the selection
            editor.getBookmark();
            selection = editor.getSelectionObject();
            if(selection.start) {
                Ext.fly(selection.start).addCls("visibleBookmark");
                var parents = DomUtils.getMarkedParents(selection.start, function(parent) {
                    if(!DomUtils.getFirstMarkedAncestor(parent.parentNode)) {
                        return false;
                    }
                    return true;
                });
                if (parents.length) {
                    /*var elementSelector = {
                        xtype: 'radiogroup',
                        //columns: 1,
                        items: parents.reverse().map(function(parent) {
                            var id = parent.getAttribute(DomUtils.elementIdAttribute),
                                relBtn = DomUtils.getButtonByElement(parent);
                            return {
                                boxLabel: relBtn.shortLabel,
                                name: 'splitParent',
                                inputValue: id
                            };
                        })
                    };*/

                    // Work around for Extjs4 bug with radio buttons in window
                    var html = '';
                    var items = parents.reverse().map(function(parent) {
                        var id = parent.getAttribute(DomUtils.elementIdAttribute),
                            relBtn = DomUtils.getButtonByElement(parent);

                        return {
                            boxLabel: relBtn.shortLabel,
                            name: 'splitParent',
                            inputValue: id
                        };
                    });
                    Utilities.getLastItem(items).checked = true;

                    Ext.each(items, function(item) {
                        var checked = (item.checked) ? 'checked="checked"' : '';
                        html+= '<input type="radio" name="'+item.name+'" value="'+item.inputValue+'">'+item.boxLabel+'<br>';
                    });

                    var elementSelector = {
                        xtype  : 'box',
                        autoEl : {
                            html : html
                        }
                    };

                    var onClose = function(cmp) {
                        cmp.close();
                        Ext.fly(selection.start).removeCls("visibleBookmark");
                    };

                    me.createAndShowFloatingForm(selection.start, formTitle, false, false, function(cmp) {
                        //var parentId = cmp.getValues().splitParent;
                        var parentId = me.getRadioSelectedValue("splitParent");
                        var tmpParent = Ext.fly(selection.start).parent(".toMarkNode", true) ||
                                        Ext.fly(selection.start).parent(".beaking", true);
                        var posNode = tmpParent || selection.start;
                        me.splitElement(DocProperties.getMarkedElement(parentId).htmlElement, posNode);
                        onClose(cmp);
                    }, onClose, {
                        items : [elementSelector],
                        width: 200
                    });
                } else {
                    Ext.fly(selection.start).removeCls("visibleBookmark");
                    Ext.MessageBox.alert("Error", "You can't split this element!");
                }
            }
        } else {
            Ext.MessageBox.alert("Error", "You can split one element at time!");
        }
    },

    splitHandlerConsolidation: function(button) {
        var me = this,
            editor = me.getController("Editor"),
            body = document.querySelector('body');

        var winCmp = Ext.widget('splitWindow').show().center();

        me.editorClickHandlerCustom = function(node, ed) {
            node = me.ensureHcontainerNode(node);
            if ( !node ) return;
            var markButton = DocProperties.getFirstButtonByName(DomUtils.getNameByNode(node)),
                body = ed.getBody();

            if ( markButton && winCmp && winCmp.isVisible() && winCmp.down('[itemId=splitted]').isVisible() ) {
                var grid = winCmp.down('[itemId=splitted]');
                var toSplitGrid = winCmp.down('[itemId=toSplit]');
                var selectedToSplit = toSplitGrid.editor.getBody().querySelector('['+DomUtils.elementIdAttribute+'='+toSplitGrid.store.getAt(0).get('id')+']');
                var toSplitButton = DocProperties.getFirstButtonByName(DomUtils.getNameByNode(selectedToSplit));
                grid.editor = ed;

                if ( markButton.name != toSplitButton.name ) {
                    Ext.Msg.alert(Locale.strings.error, new Ext.Template(AknModsMarker.Strings.get('haveToSelectElement')).apply({
                        name : toSplitButton.name
                    }));
                    return;
                }

                if ( !grid.store.getCount() ) {
                    editor.unFocusNodes(false, body);
                } else {
                    var firstNode = body.querySelector('['+DomUtils.elementIdAttribute+'='+grid.store.getAt(0).get('id')+']');
                    if ( firstNode && DomUtils.getSiblingsFromNode(firstNode).indexOf(node) == -1 ) {
                        Ext.Msg.alert(Locale.strings.error, AknModsMarker.Strings.get('splitOnlySiblings'));
                        return;
                    }
                }

                editor.setFocusStyle(node);

                grid.store.loadData([{
                    name: markButton.shortLabel,
                    content: node.textContent,
                    id: node.getAttribute(DomUtils.elementIdAttribute),
                    eId: node.getAttribute(LangProp.attrPrefix+'eid')
                }], true);
            }
        };

        me.secondEditorClickHandlerCustom = function(node, evt, ed) {
            node = me.ensureHcontainerNode(node);
            if ( !node ) return;
            var markButton = DocProperties.getFirstButtonByName(DomUtils.getNameByNode(node)),
                body = ed.getBody();
            if ( markButton && winCmp && winCmp.isVisible() && winCmp.down('[itemId=toSplit]').isVisible() ) {
                var grid = winCmp.down('[itemId=toSplit]');
                editor.unFocusNodes(false, body);
                editor.setFocusStyle(node);
                grid.editor = ed;

                grid.store.loadData([{
                    name: markButton.shortLabel,
                    content: node.textContent,
                    id: node.getAttribute(DomUtils.elementIdAttribute),
                    eId: node.getAttribute(LangProp.attrPrefix+'eid')
                }]);
            }
        };
    },

    ensureHcontainerNode: function(node) {
        if (!node) return;
        if (!node.classList || !node.classList.contains('hcontainer'))
            return this.ensureHcontainerNode(node.parentNode);
        return node;
    },

    getNodeDataFromGrid: function(grid) {
        var data = [];
        grid.store.each(function(record) {
            var node = (grid.editor) ? grid.editor.getBody().querySelector('['+DomUtils.elementIdAttribute+'='+record.get('id')+']') : null;
            data.push({
                id: record.get('id'),
                langId: record.get('eId'),
                node: node
            });
        });
        return data;
    },

    setSplitNodesStyle: function(nodes) {
        var button = DomUtils.getButtonByElement(nodes[0]);
        this.setElementStyles(nodes, button, button, {
            shortLabel: button.shortLabel+" "+AknModsMarker.Strings.get('splitted'),
            modType: this.getSplitAttr(),
            elementStyle: "",
            labelStyle: "background-color: #75d6ff; border: 1px solid #44b4d5;"
        });
    },

    getRadioSelectedValue: function(name) {
        var inputItems = Ext.Array.toArray(document.getElementsByName(name));
        inputItems = inputItems.filter(function(input) {
            return input.checked;
        });
        return (inputItems.length) ? inputItems[0].value : false;
    },

    splitElement: function(node, posNode, initialSplitNode) {
        var me = this;
        initialSplitNode = initialSplitNode || node;
        if (posNode.parentNode == node) {
            var button = DomUtils.getButtonByElement(node);
            var newElement = Ext.DomHelper.createDom({
                 tag : node.tagName
            });
            DomUtils.insertAfter(newElement, node);
            while(posNode.nextSibling) {
                newElement.appendChild(posNode.nextSibling);
            }
            node.setAttribute(me.getSplitAttr(), "true");
            newElement.setAttribute(me.getSplitAttr(), "true");

            if(button) {
                me.setElementStyles([node, newElement], button, button, {
                    shortLabel: button.shortLabel+" "+AknModsMarker.Strings.get('splitted'),
                    modType: me.getSplitAttr(),
                    elementStyle: "",
                    labelStyle: "background-color: #75d6ff; border: 1px solid #44b4d5;"
                });
                me.application.fireEvent('markingRequest', button, {
                    silent : true,
                    noEvent : true,
                    nodes : [newElement]
                });
                if(initialSplitNode == node) {
                    me.setSplitMetadata(node, null, [node, newElement]);
                }
            }
        } else if(node.compareDocumentPosition(posNode) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
            me.splitElement(posNode.parentNode, posNode, initialSplitNode);
            me.splitElement(node, posNode.parentNode, initialSplitNode);
        }
    },

    setSplitMetadataB: function(node1, node2) {
        var prevId = LangProp.getNodeLangAttr(node1, "eId").value ||
                        node1.getAttribute(DomUtils.elementIdAttribute);

        var meta = {
            extraData: { previous: prevId },
            sourceDestinations: [
                {type: 'destination', href: node1.getAttribute(DomUtils.elementIdAttribute)},
                {type: 'destination', href: node2.getAttribute(DomUtils.elementIdAttribute)}
            ],
            textualChanges: [{type: 'old', href: node1.getAttribute(DomUtils.elementIdAttribute)}]
        };
        this.addPassiveMeta(node1, 'split', meta);
    },

    setSplitMetadata: function(prevNode, prevMeta, nodes) {
        // TODO: use prevMeta for prevId
        var prevId = LangProp.getNodeLangAttr(prevNode, "eId").value
                    || prevNode.getAttribute(DomUtils.elementIdAttribute);

        var sourceDestinations = nodes.map(function(node) {
            return {type: 'destination', href: node.getAttribute(DomUtils.elementIdAttribute)};
        });

        var meta = {
            extraData: { previous: prevId },
            sourceDestinations: sourceDestinations,
            textualChanges: [{type: 'old', href: prevId}]
        };
        this.addPassiveMeta(nodes[0], 'split', meta);
    },

    joinHandler: function(button) {
        var me = this, editor = me.getController("Editor");

        var onClose = function(cmp) {
            cmp.close();
        };

        var winCmp = me.createAndShowFloatingForm(editor.getBody(), 'Select the elements to join', false, false, function(cmp) {
            var grid = cmp.down('[itemId=toJoin]');
            grid.editor = editor;
            var joinData = me.getNodeDataFromGrid(cmp.down('[itemId=toJoin]'));

            if ( joinData.length ) {
                var siblings = Ext.Array.toArray(joinData[0].node.parentNode.children);
                joinData.sort(function(a, b) {
                    return siblings.indexOf(a.node) - siblings.indexOf(b.node);
                });
                var startNode = joinData[0].node;
                var endNode = joinData[joinData.length-1].node;
                var button = DomUtils.getButtonByElement(startNode);
                startNode.setAttribute(me.getJoinAttr(), "true");

                var iternode = startNode.nextElementSibling;
                while(iternode) {
                    DomUtils.moveChildrenNodes(iternode, startNode, true);
                    if(iternode == endNode) {
                        break;
                    }
                    iternode = iternode.nextElementSibling;
                }
                me.setElementStyles([startNode], button, button, {
                    shortLabel: button.shortLabel+" "+AknModsMarker.Strings.get('joined'),
                    modType: me.getJoinAttr(),
                    elementStyle: "",
                    labelStyle: "background-color: #75d6ff; border: 1px solid #44b4d5;"
                });
                var toUnmark = joinData.map(function(data) {
                    return data.node;
                }).slice(1);
                me.application.fireEvent(Statics.eventsNames.unmarkNodes, toUnmark);
                me.setJoinMetadata(startNode, joinData);
                onClose(cmp);
            } else {
                Ext.MessageBox.alert("Error", 'Not enough elements selected');
                console.warn('Not enough elements selected');
            }
        }, onClose, {
            items : [{
                xtype: 'nodesGrid',
                itemId: 'toJoin'
            }],
            width: 400
        }).center();


        me.editorClickHandlerCustom = function(node, ed) {
            if ( !node ) return;
            var markButton = DocProperties.getFirstButtonByName(DomUtils.getNameByNode(node)),
                body = ed.getBody();

            if ( markButton && winCmp && winCmp.isVisible() && winCmp.down('[itemId=toJoin]').isVisible() ) {
                var grid = winCmp.down('[itemId=toJoin]');

                if ( !grid.store.getCount() ) {
                    editor.unFocusNodes(false, body);
                } else {
                    var firstNode = body.querySelector('['+DomUtils.elementIdAttribute+'='+grid.store.getAt(0).get('id')+']');
                    var toJoinButton = DocProperties.getFirstButtonByName(DomUtils.getNameByNode(firstNode));
                    if ( markButton.name != toJoinButton.name ) {
                        Ext.Msg.alert(Locale.strings.error, new Ext.Template(AknModsMarker.Strings.get('haveToSelectElement')).apply({
                            name : toJoinButton.name
                        }));
                        return;
                    }
                    if ( firstNode && DomUtils.getSiblingsFromNode(firstNode).indexOf(node) == -1 ) {
                        Ext.Msg.alert(Locale.strings.error, AknModsMarker.Strings.get('splitOnlySiblings'));
                        return;
                    }
                }

                editor.setFocusStyle(node);

                grid.store.loadData([{
                    name: markButton.shortLabel,
                    content: node.textContent,
                    id: node.getAttribute(DomUtils.elementIdAttribute),
                    eId: node.getAttribute(LangProp.attrPrefix+'eid')
                }], true);
            }
        };
    },

    joinHandlerConsolidation : function(button) {
        var me = this,
            editor = me.getController("Editor"),
            selection = editor.getSelectionObject(null, null, true),
            joinedNode = me.ensureHcontainerNode(DomUtils.getFirstMarkedAncestor(selection.start)),
            joinedData = [];

        if ( joinedNode ) {
            var markButton = DomUtils.getButtonByElement(joinedNode);

            var onClose = function(cmp) {
                cmp.close();
            };

            var insertRemovedNode = function() {
                // Creating the 'del' node
                var del = joinedNode.ownerDocument.createElement('span');
                DomUtils.insertAfter(del, joinedNode);

                var wrapNode = DomUtils.wrapNode(del, joinedNode.tagName);
                wrapNode.setAttribute(LangProp.attrPrefix+'status', 'removed');

                me.application.fireEvent('markingRequest', DocProperties.getFirstButtonByName('del'), {
                    silent : true,
                    noEvent : true,
                    nodes : [del]
                });
                me.application.fireEvent('markingRequest', DocProperties.getFirstButtonByName(DomUtils.getNameByNode(joinedNode)), {
                    silent : true,
                    noEvent : true,
                    nodes : [wrapNode]
                });
            };

            var registerJoin = function(data) {
                joinedNode.setAttribute(me.getJoinAttr(), "true");
                // Insert a "removed" node for every joined node except the first
                data.slice(1).forEach(insertRemovedNode);
                me.setJoinMetadata(joinedNode, data);
            };

            var winCmp = me.createAndShowFloatingForm(joinedNode, 'Select elements to join', false, false, function(cmp) {
                var grid = cmp.down('grid'),
                    data = [];
                grid.store.each(function(record) {
                    var node = cmp.editor.getBody().querySelector('['+DomUtils.elementIdAttribute+'='+record.get('id')+']');
                    data.push({
                        id: record.get('id'),
                        langId: record.get('eId'),
                        node: node
                    });
                });
                registerJoin(data);
                onClose(cmp);
            }, onClose, {
                items : [me.getNodesGridConfig()],
                width: 400
            });

            me.secondEditorClickHandlerCustom = function(node, evt, ed) {
                node = me.ensureHcontainerNode(node);
                if ( !node ) return;
                winCmp.editor = ed;
                var toJoinButton = DocProperties.getFirstButtonByName(DomUtils.getNameByNode(node)),
                    body = ed.getBody();

                if ( toJoinButton && winCmp && winCmp.isVisible() ) {
                    var grid = winCmp.down('grid');

                    if ( markButton.name != toJoinButton.name ) {
                        Ext.Msg.alert(Locale.strings.error, new Ext.Template(AknModsMarker.Strings.get('haveToSelectElement')).apply({
                            name : markButton.name
                        }));
                        return;
                    }

                    if ( !grid.store.getCount() ) {
                        editor.unFocusNodes(false, body);
                    } else {
                        var firstNode = body.querySelector('['+DomUtils.elementIdAttribute+'='+grid.store.getAt(0).get('id')+']');
                        if ( firstNode && DomUtils.getSiblingsFromNode(firstNode).indexOf(node) == -1 ) {
                            Ext.Msg.alert(Locale.strings.error, AknModsMarker.Strings.get('splitOnlySiblings'));
                            return;
                        }
                    }

                    editor.setFocusStyle(node);

                    grid.store.loadData([{
                        name: toJoinButton.shortLabel,
                        content: node.textContent,
                        id: node.getAttribute(DomUtils.elementIdAttribute),
                        eId: node.getAttribute(LangProp.attrPrefix+'eid')
                    }], true);
                }
            };
        }
    },

    setJoinMetadata: function(joinedNode, joinedData) {
        var textualChanges = joinedData.map(function(joinedEl) {
            return {type: 'old', href: joinedEl.langId || joinedEl.id};
        });

        var meta = {
            sourceDestinations: [
                {type: 'destination', href: joinedNode.getAttribute(DomUtils.elementIdAttribute)}
            ],
            textualChanges: textualChanges
        };
        this.addPassiveMeta(joinedNode, 'join', meta);
    },

    beforeDelHandler: function(button, node) {
        if ( this.defaultPassiveModMode == 'consolidation' )
            if (this.getSecondEditor())
                this.beforeDelHandlerConsolidationDualEditor();
            else
                this.beforeDelHandlerConsolidation(node);
        else
            this.beforeDelHandlerAmendment();
    },

    beforeDelHandlerConsolidation: function(node) {
        var me = this;
        var selectedNode = me.getController("Editor").getSelectedNode();
        me.createAndShowFloatingForm(selectedNode, AknModsMarker.Strings.get('oldText'), '', false, function(cmp, text) {
            me.delHandlerConsolidation(text, null, '', '');
            cmp.close();
        }, function(cmp) {
            cmp.close();
        }).center();
    },

    beforeDelHandlerConsolidationDualEditor: function() {
        var me = this;
        var winCmp = Ext.widget('repealWindow').show().center();

        me.setMaskEditors(false, true);
        winCmp.selection = {};
        me.secondEditorClickHandlerCustom = function(node, evt, ed) {
            var msg = "",
                selection = me.getSelectionObj(ed),
                selectedText = selection.text;
            if (selectedText) {
                var tpl = new Ext.Template("<h4>You've selected the following portion of text:</h4>{text}");
                msg = tpl.apply({text: selectedText});
                winCmp.selection = selection;
                winCmp.selectedNode = false;
            } else {
                node = me.ensureHcontainerNode(node);
                if ( !node ) return;
                var markButton = DocProperties.getFirstButtonByName(DomUtils.getNameByNode(node));
                var editor = me.getController('Editor');
                var tpl = new Ext.Template("<h4>You've selected the element <b>{name}</b> ({num}) which contains the following text:</h4>{text}");
                editor.unFocusNodes(false, ed.getBody());
                editor.setFocusStyle(node);

                msg = tpl.apply({
                    text: node.textContent.trim(),
                    num: node && DomUtils.getNodeExtraInfo(node, 'hcontainer', 10),
                    name: markButton.shortLabel
                });
                winCmp.selectedNode = node;
                winCmp.selection = {};
            }
            winCmp.down('[itemId=accept]').enable();
            winCmp.down('[itemId=selectedMsg]').setHtml(msg);
        };
    },

    getSelectionObj: function(ed) {
        var selection = ed.selection,
            rng = selection.getRng(),
            upperNodeLimit = this.getUpperTextLimit(selection.getNode());

        var getPrevText = function (node) {
            var txt = '';
            if (!node) return txt;
            while( node.previousSibling ) {
                node = node.previousSibling;
                txt = node.textContent + txt;
            }
            if (upperNodeLimit && node.parentNode !== upperNodeLimit) {
                txt = getPrevText(node.parentNode) + txt;
            }
            return txt;
        }
        var getNextText = function (node) {
            var txt = '';
            if (!node) return txt;
            while( node.nextSibling ) {
                node = node.nextSibling;
                txt += node.textContent;
            }
            if (upperNodeLimit && node.parentNode !== upperNodeLimit) {
                txt += getNextText(node.parentNode);
            }
            return txt;
        }
        var res = {
            text: selection.getContent({format: 'text'}).trim()
        };
        if (res.text && rng.startContainer && rng.endContainer) {
            var maxLength = 50;
            res.textBefore = (getPrevText(rng.startContainer)+
                            rng.startContainer.textContent.substring(0, rng.startOffset)).trim();
            res.textAfter = (rng.endContainer.textContent.substring(rng.endOffset)+
                            getNextText(rng.endContainer)).trim();

            res.textBefore = (res.textBefore.length > maxLength) ?
                                res.textBefore.substring(res.textBefore.length-maxLength) : res.textBefore;
            res.textAfter = res.textAfter.substring(0, maxLength);
        }
        return res;
    },

    getUpperTextLimit: function(node) {
        if (!node) return;
        if (node.classList && (
                node.classList.contains('hcontainer') ||
                node.classList.contains('container') ||
                node.classList.contains('block') ||
                node.classList.contains('num') ||
                node.classList.contains('heading') ||
                node.classList.contains('subheading')
            )) {
            return node;
        }
        return this.getUpperTextLimit(node.parentNode);
    },

    beforeDelHandlerAmendment: function() {
        var me = this,
            editor = me.getController('Editor'),
            selectionRange = editor.lastSelectionRange || editor.getEditor().selection.getRng();

        if ( selectionRange.toString() ) {
            var aliasButton = DocProperties.getFirstButtonByName('del');
            me.application.fireEvent('markingMenuClicked', aliasButton, {
                callback : Ext.bind(me.delHandler, me)
            });
        } else {
            var focusedNode = editor.getFocusedNode();
            if ( focusedNode ){
                var button = DomUtils.getButtonByElement(focusedNode);
                me.delHandler(button, [focusedNode]);
                focusedNode.setAttribute(LangProp.attrPrefix+"status", "removed");
                DomUtils.removeChildren(focusedNode);
                me.setElementStyles([focusedNode], button, button, {
                    shortLabel: button.shortLabel+" "+AknModsMarker.Strings.get('deleted'),
                    modType: 'deleted',
                    elementStyle: "",
                    labelStyle: "background-color: #75d6ff; border: 1px solid #44b4d5;"
                });
            }
        }
    },

    delHandlerConsolidation: function(removedText, removedNode, textBefore, textAfter) {
        var me = this;
        if (!removedText && !removedNode) return;
        var wrapDelWithNode = function(delNode, wrapOld) {
            var wrapNode = DomUtils.wrapNode(delNode, wrapOld.tagName);
            wrapNode.setAttribute(LangProp.attrPrefix+'status', 'removed');
            // Set the old eId as new wId, TODO check if is ok
            wrapNode.setAttribute(LangProp.attrPrefix+'wid', wrapOld.getAttribute(LangProp.attrPrefix+'eid'));
            me.application.fireEvent('markingRequest', DocProperties.getFirstButtonByName(DomUtils.getNameByNode(wrapOld)), {
                silent : true,
                noEvent : true,
                nodes : [wrapNode]
            });
            return wrapNode;
        };

        var renumbering = function(node, removedNode) {
            me.askForRenumbering(function() {
                var nextSiblings = me.getNextSiblingsSameCls(node);
                var nextSiblingsOld = me.getNextSiblingsSameCls(removedNode);
                nextSiblings.forEach(function(node, index) {
                    var prevNode = nextSiblingsOld[index];
                    me.updateRenumberingMetadata(node, prevNode);
                });
            });
        };

        var afterDelMarked = function(node) {
            if (removedText && !removedNode)
                me.addDelMeta(node, removedText, textBefore, textAfter);
            else {
                var wrapNode = wrapDelWithNode(node, removedNode);
                me.addDelMeta(node, removedNode.textContent.trim());
                renumbering(wrapNode, removedNode);
            }
        };

        var delButton = DocProperties.getFirstButtonByName('del');
        afterDelMarked(me.getController('Marker').wrapRaw(delButton));
    },

    addDelMeta: function(node, oldText, textBefore, textAfter) {
        var meta = {
            sourceDestinations: [{type:'source', href: ''},
                                {type:'destination', href: node.getAttribute(DomUtils.elementIdAttribute)}],
            textualChanges: [{type: 'old', content: oldText, textBefore: textBefore, textAfter: textAfter}]
        };
        return this.addPassiveMeta(node, 'repeal', meta);
    },

    delHandler: function(button, markedElements) {
        var me = this, modEl, textualMod;

        var setMetadata = function(oldText) {
            Ext.each(markedElements, function(element) {
                oldText = oldText || DomUtils.getTextOfNode(element);
                modEl = element;
                textualMod = me.addDelMeta(element, oldText);
            });
        };

        if ( me.defaultPassiveModMode != 'consolidation' ) {
            setMetadata();
            me.askForRenumbering(modEl, textualMod);
        } else if ( markedElements.length ) {
            me.createAndShowFloatingForm(markedElements[0], AknModsMarker.Strings.get('oldText'), false, false, function(cmp, text) {
                setMetadata(text);
                cmp.close();
            }, function(cmp) {
                cmp.close();
                Ext.fly(markedElements[0]).remove();
            });
        }
    },

    updateSubsMetadata: function(node, oldText, textBefore, textAfter) {
        var elId = node.getAttribute(DomUtils.elementIdAttribute),
            parent = this.ensureHcontainerNode(node),
            destId = (parent) ? parent.getAttribute(DomUtils.elementIdAttribute) : elId;

        var oldMod = this.modsMap[elId];
        var sourceHref = '';
        if (oldMod) {
            var source =  oldMod.getSourceDestinations('source')[0];
            sourceHref = source ? source.get('href') : sourceHref;
            this.removeMod(elId); // Remove the possibly existing mod
        }

        var meta = {
            sourceDestinations: [{type:'source', href: sourceHref},
                                {type:'destination', href: destId}],
            textualChanges: [
                {type: 'old', content: oldText, textBefore: textBefore, textAfter: textAfter},
                {type: 'new', href: elId}]
        };

        node.setAttribute('data-old-text', oldText);
        return this.addPassiveMeta(node, 'substitution', meta);
    },

    updateRenumberingMetadata: function(node, renumberedNode) {
        var me = this,
            prevElId = LangProp.getNodeLangAttr(renumberedNode, "eId").value ||
                        renumberedNode.getAttribute(DomUtils.elementIdAttribute),
            elId = node.getAttribute(DomUtils.elementIdAttribute);

        this.removeMod(elId); // Remove the possibly existing mod

        var prevUri = me.secondDocumentConfig && me.secondDocumentConfig.expUri || '';
        prevUri = (prevUri) ? prevUri+'#' : '';
        var meta = {
            extraData: { previous: prevUri+prevElId },
            sourceDestinations: [
                {type: 'destination', href: elId}
            ]
        };
        node.setAttribute(LangProp.attrPrefix+'wid', prevElId);
        // this.addMapping(prevElId, elId);
        return this.addPassiveMeta(node, 'renumbering', meta);
    },

    // TODO: check how need to be done
    addMapping: function(original, current) {
        var mappings = Ext.getStore('metadata').getMainDocument().mappings();
        var existedMap = false;
        mappings.each(function(mapping) {
            if (mapping.get('original') === original &&
                    mapping.get('current') === current) {
                existedMap = true;
            }
        });
        if (!existedMap)
            mappings.add({
                original: original,
                current: current
            });
    },

    beforeSubstitutionHandler: function(aliasButton, elements) {
        var me = this,
            editor = me.getController('Editor'),
            selectionRange = editor.lastSelectionRange || editor.getEditor().selection.getRng();

        if ( selectionRange.toString() ) {
            var aliasButton = DocProperties.getFirstButtonByName('ins');
            me.application.fireEvent('markingMenuClicked', aliasButton, {
                callback : Ext.bind(me.substitutionHandler, me)
            });
        } else {
            var focusedNode = editor.getFocusedNode();
            if ( focusedNode ){
                me.setMaskEditors(false, true);
                var button = DomUtils.getButtonByElement(focusedNode);
                me.createSubstitutionBlock(focusedNode, false, false, function(obj) {
                    var oldText = DomUtils.getTextOfNode(obj.node);
                    me.updateSubsMetadata(focusedNode, oldText);
                    me.setMaskEditors(false, false);

                    me.setElementStyles([focusedNode], button, button, {
                        shortLabel: button.shortLabel+" "+AknModsMarker.Strings.get('replaced'),
                        modType: 'replaced',
                        elementStyle: "",
                        labelStyle: "background-color: #75d6ff; border: 1px solid #44b4d5;"
                    });
                });
            }
        }
    },

    substitutionHandler: function(aliasButton, elements, button) {
        this.setMaskEditors(false, true);
        this.createSubstitution(elements[0]);
    },

    createRenumbering: function(node, formText, update, renumberedNode) {
        var me = this, editor = me.getController("Editor"),
            panel = me.createAndShowFloatingForm(node, "Insert the new text",formText, false, function(form, text) {
                var oldText = DomUtils.replaceTextOfNode(form.relatedNode, text);
                me.updateRenumberingMetadata(form.relatedNode, form.renumberedNode);
                form.renumberedNode.setAttribute(me.getRenumberingAttr(), oldText);
                var button = DomUtils.getButtonByElement(form.renumberedNode);
                me.setElementStyles([form.renumberedNode], button, button, {
                    shortLabel: button.shortLabel+" "+AknModsMarker.Strings.get('renumbered'),
                    modType: me.getRenumberingAttr(),
                    elementStyle: "",
                    labelStyle: "background-color: #75d6ff; border: 1px solid #44b4d5;"
                });
                form.destroy();
                me.openedForm = null;
            }, function(form) {
                if(update) {
                    var oldText = DomUtils.replaceTextOfNode(form.relatedNode, form.originalText);
                    me.updateRenumberingMetadata(form.relatedNode, form.renumberedNode);
                } else {
                    //me.application.fireEvent(Statics.eventsNames.unmarkNodes, [form.relatedNode]);
                    //TODO: remove meta
                    form.renumberedNode.removeAttribute(me.getRenumberingAttr());
                }
                form.destroy();
                me.openedForm = null;
            });

        editor.selectNode(node);
        panel.relatedNode = node;
        panel.renumberedNode = renumberedNode;
        panel.originalText = formText;
        me.openedForm = panel;
    },

    createSubstitutionBlock: function(node, formText, update, callback) {
        var me = this, editor = me.getController("Editor"),
            oldText = formText,
            button = DocProperties.getFirstButtonByName("ins");

        var panel = null;

        var onClose = function(cmp) {
            cmp.close();
        };

        panel = me.createAndShowFloatingForm(node, 'Select the element to replace', false, false, function(cmp) {
            var grid = cmp.down('grid'),
                data = [];
            grid.store.each(function(record) {
                var node = cmp.editor.getBody().querySelector('['+DomUtils.elementIdAttribute+'='+record.get('id')+']');
                data.push({
                    id: record.get('id'),
                    langId: record.get('eId'),
                    node: node
                });
            });
            Ext.callback(callback, me, [data[0]]);
            onClose(cmp);
        }, onClose, {
            items : [me.getNodesGridConfig()],
            width: 400
        });
        var firstEditorNode = node;
        me.secondEditorClickHandlerCustom = function(node, evt, ed) {
            panel.editor = ed;
            if ( !node ) return;
            var markButton = DocProperties.getFirstButtonByName(DomUtils.getNameByNode(node)),
                markButtonNameSecond = markButton.name,
                markButtonName = DomUtils.getNameByNode(firstEditorNode),
                body = ed.getBody();

            if ( markButtonNameSecond && panel && panel.isVisible() ) {
                if ( markButtonNameSecond != markButtonName ) {
                     Ext.Msg.alert(Locale.strings.error, new Ext.Template(AknModsMarker.Strings.get('haveToSelectElement')).apply({
                        name : markButtonName
                     }));
                     return;
                }
                var grid = panel.down('grid');

                if ( !grid.store.getCount() ) {
                    editor.unFocusNodes(false, body);
                }

                editor.setFocusStyle(node);

                grid.store.loadData([{
                    name: markButton.shortLabel,
                    content: node.textContent.trim(),
                    id: node.getAttribute(DomUtils.elementIdAttribute),
                    eId: node.getAttribute(LangProp.attrPrefix+'eid')
                }], false);
            }
        };
    },

    getNodesGridConfig: function() {
        return {
            xtype: 'gridpanel',
            store: Ext.create('Ext.data.Store', {
                fields:['name', 'content', 'id', 'eId'],
                data: []
            }),
            columns: [
                { text: 'Name',  dataIndex: 'name' },
                { text: 'Content', dataIndex: 'content', flex: 1 }, {
                    xtype : 'actioncolumn',
                    width : 30,
                    sortable : false,
                    menuDisabled : true,
                    items : [{
                        icon : 'resources/images/icons/delete.png',
                        tooltip : 'Remove',
                        handler : function(grid, rowIndex) {
                            grid.getStore().removeAt(rowIndex);
                        }
                    }]
                }
            ]
        };
    },

    createSubstitution: function(node, formText, update) {
        if ( this.defaultPassiveModMode == 'consolidation' )
            if (!this.getSecondEditor() || update)
                this.createSubstitutionConsolidationUpdate(node, update);
            else
                this.createSubstitutionConsolidation(node);
        else
            this.createSubstitutionAmendment(node, formText, update);
    },

    createSubstitutionConsolidationUpdate: function(node, update) {
        var me = this,
            oldText = (update) ? node.getAttribute('data-old-text') : '';
        me.createAndShowFloatingForm(node, AknModsMarker.Strings.get('oldText'), oldText, false, function(cmp, text) {
            me.updateSubsMetadata(node, text);
            cmp.close();
        }, function(cmp) {
            cmp.close();
            if ( !update )
                DomUtils.unwrapNode(node);
        });
    },

    createSubstitutionConsolidation: function(node) {
        var me = this;
        var winCmp = me.createAndShowFloatingForm(node, 'Select the old portion of text', false, false, function(cmp) {
            if (!cmp.selection || !cmp.selection.text ) {
                return Ext.MessageBox.alert("Error", 'No text was selected');
            }
            me.updateSubsMetadata(node, cmp.selection.text, cmp.selection.textBefore, cmp.selection.textAfter);
            cmp.close();
        }, function(cmp) {
            cmp.close();
            DomUtils.unwrapNode(node);
        }, {
            items : [{
                xtype: 'box',
                itemId: 'selectedMsg',
                margin: '0 0 20 0'
            }],
            width: 400
        });

        me.secondEditorClickHandlerCustom = function(node, evt, ed) {
            var msg = "",
                selection = me.getSelectionObj(ed),
                selectedText = selection.text;
            if (selectedText) {
                var tpl = new Ext.Template("<h4 style=\"margin: 0px;\">You've selected the following portion of text:</h4>{text}");
                msg = tpl.apply({text: selectedText.trim()});
                winCmp.selection = selection;
                winCmp.selectedNode = me.ensureHcontainerNode(node);
            } else {
                winCmp.selection = {};
                winCmp.selectedNode = null;
            }
            winCmp.down('[itemId=selectedMsg]').setHtml(msg);
        };
    },

    createSubstitutionAmendment: function(node, oldText, update) {
        var me = this, editor = me.getController("Editor");
        if(!update) {
            oldText = DomUtils.getTextOfNode(node).trim();
            me.updateSubsMetadata(node, oldText);
            me.createAndShowFloatingForm(node, "Insert the new text", false, false, function(cmp, text) {
                node.textContent = text;
                cmp.close();
            }, function(cmp) {
                cmp.close();
            });
        } else {
            oldText = oldText || '';
            me.openedForm = me.createAndShowFloatingForm(node, AknModsMarker.Strings.get('oldText'), oldText.trim(), true);
        }
        Ext.defer(function() {
            editor.getEditor().focus();
            if(!update)
                editor.selectNode(node);
        }, 40);
    },

    createAndShowFloatingForm: function(node, title ,text, readOnly, onAccept, onCancel, customConfig) {
        customConfig = customConfig || {};
        var me = this, editor = me.getController("Editor"),
            editorBoundingRect = editor.getIframe().dom.getBoundingClientRect(),
            elementBoundingRect = node.getBoundingClientRect(),
            boxMargin= {top: -150, left: -20},
            boxWidth = customConfig.width || 300,
            boxPos = {x: (editorBoundingRect.left+elementBoundingRect.left+boxMargin.left),
                      y: (editorBoundingRect.top+elementBoundingRect.top+boxMargin.top)},
            panel, buttons;

        if(!readOnly) {
            buttons = [{
                text : Locale.getString("openFileWindowSouthCancelButtonLabel"),
                icon : 'resources/images/icons/cancel.png',
                handler : function() {
                    Ext.callback(onCancel, me, [this.up("form")]);
                }
            }, {
                text : Locale.getString("ok"),
                icon : 'resources/images/icons/accept.png',
                handler : function() {
                    var form = this.up("form");
                    if (form.getForm().isValid()) {
                        Ext.callback(onAccept, me, [form, form.getValues().newText]);
                    }
                }
            }];
        }
        panel = Ext.widget('form', {
            width : boxWidth,
            bodyPadding : 5,
            title : title,
            closable: true,
            floating : true,
            frame : true,
            layout : 'fit',
            listeners: {
                close: function () {
                    me.setMaskEditors(false, false);
                }
            },
            items : customConfig.items || [{
                xtype : "textareafield",
                name : 'newText',
                readOnly: readOnly,
                grow : true,
                value: text || "",
                margin : 0,
                allowBlank: false
            }],

            buttons: buttons
        });

        if(elementBoundingRect.width) {
            if(elementBoundingRect.width < boxWidth) {
                boxPos.x -= (boxWidth -  elementBoundingRect.width)/2;
            } else {
                boxPos.x += (elementBoundingRect.width - boxWidth)/2;
            }
        }
        panel.showAt(boxPos.x, boxPos.y);
        return panel;
    },

    askForRenumbering: function(callback) {
        Ext.Msg.confirm(AknModsMarker.Strings.get('renumbering'),
            AknModsMarker.Strings.get('causedRenumbering'),
            function(res) {
                if (res === 'yes' && callback)
                    callback();
            });
    }
});
