/*
 * Copyright (c) 2015 - Copyright holders CIRSFID and Department of
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

Ext.define('AknMetadata.tagAttributes.Controller', {
    extend: 'Ext.app.Controller',
    requires: ['AknMain.Reference', 'AknMetadata.tagAttributes.RefPanel', 'AknMain.LangProp',
                'AknMetadata.newMeta.ReferenceCombo'],

    tabGroupName: "tagAttributesManager",
    tagAttributesTab: null,

    init: function () {
        this.application.on(Statics.eventsNames.editorDomNodeFocused,
                            function(node) {
                                // Defer the execution in order to get the eventually updated attributes
                                setTimeout(this.showNodeAttributes.bind(this, node), 100);
                            },
                            this);

        this.control({
            "markedElementWidget [itemId=save]": {
                click: function(cmp) {
                    cmp = cmp.up('markedElementWidget');
                    cmp.onSave(cmp);
                }
            }
        });
    },

    showNodeAttributes: function(node) {
        var tag = DomUtils.getNameByNode(node);
        var panel = null;

        switch(tag) {
            case 'ref':
                panel = this.createRefPanel(node);
            break;
            case 'role':
                panel = this.createNodeRefsPanel(node, [{
                    attr: 'refersTo',
                    filters: ['TLCRole']
                }]);
            break;
            case 'location':
                panel = this.createNodeRefsPanel(node, [{
                    attr: 'refersTo',
                    filters: ['TLCLocation']
                }]);
            break;
            case 'person':
                panel = this.createNodeRefsPanel(node, [{
                    attr: 'refersTo',
                    filters: ['TLCPerson']
                },{
                    attr: 'as',
                    filters: ['TLCRole']
                }]);
            break;
            default:
                return;
        }

        this.tagAttributesTab = this.tagAttributesTab || this.addTab();
        this.tagAttributesTab.removeAll(true);
        this.tagAttributesTab.add(panel);
        this.application.fireEvent(Statics.eventsNames.openCloseContextPanel,
                                    true, this.tabGroupName, panel.contextHeight);
        Ext.GlobalEvents.fireEvent('scrollToActiveNode');
    },

    createRefPanel: function(node) {
        var me = this;
        var attribute = LangProp.attrPrefix+'href';
        var href = node.getAttribute(attribute);
        var ref = null;
        try {
            ref = AknMain.Reference.parse(href);
        } catch (e) {
            console.error(e);
        }

        var normalizeSubtype = function(str) {
            str = str || '';
            return str.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        };

        var saveRef = function(refPanel) {
            var data = refPanel.getValues(false, false, false, true);
            var ref = AknMain.Reference.empty();
            ref.internal = (data.type == "external") ? false : true;
            ref.id = data.fragment;
            ref.uri.country = data.nationality;
            ref.uri.type = data.docType;
            ref.uri.subtype = normalizeSubtype(data.subtype);
            ref.uri.name = data.number;
            ref.uri.date = (data.date) ? Ext.Date.format(data.date, 'Y-m-d') : "";
            ref.uri.language = DocProperties.documentInfo.docLang;
            var href = "";
            try {
                href = ref.ref();
            } catch(e) {
                console.error(e);
            }
            if (href.length > 1) {
                node.setAttribute(attribute, href);
                refPanel.down("#successSaveLabel").setVisible(true);
                me.closeContextPanel();
            }
        };

        console.log('create ref panel', href);
        return Ext.widget('refPanel', {
            ref: ref,
            onSave: saveRef
        });
    },

    closeContextPanel: function() {
        this.application.fireEvent(Statics.eventsNames.openCloseContextPanel,
                                    false, this.tabGroupName);
    },

    createNodeRefsPanel: function(node, items) {
        var me = this,
            references = Ext.getStore('metadata').getMainDocument().references();

        items = items.map(function(item) {
            var refers = (node.getAttribute(LangProp.attrPrefix+item.attr) || '').substring(1), // Remove #
                rec = refers && references.getById(refers),
                showAs = rec && rec.get('showAs');

            item.value = showAs || refers;
            item.name = Locale.getString(item.attr, 'akn-metadata');
            return item;
        });

        var beforeSave = function(panel) {
            var allSaved = items.every(function(item) {
                    var cmb = panel.down('[itemId='+item.attr+']'),
                        value = cmb.getValue() || '';
                    if (Ext.isString(value)) {
                        var rec = references.findRecord('eid', value) ||
                                    references.findRecord('showAs', value);
                        if(!rec)
                            return save(item.attr, value);
                        value = rec;
                    }
                    return save(item.attr, value.get('eid'));
                });
            if (allSaved)
                me.closeContextPanel();
        };

        var save = function(name, value) {
            if (!name || !value) return;
            value = value.charAt(0) != '#' ? '#'+value: value;
            node.setAttribute(LangProp.attrPrefix+name, value);
            return true;
        }

        return Ext.widget('markedElementWidget', {
            title: Locale.getString('references', 'akn-metadata'),
            contextHeight: 85+items.length*30,
            onSave: beforeSave,
            fieldDefaults: {
                labelWidth: Ext.Array.max(items.map(function(item) {
                    return item.name.length;
                }))*7
            },
            items: items.map(function(item) {
                return {
                    xtype: 'akn-metadata-tab-referencecombo',
                    queryMode: 'local',
                    itemId: item.attr,
                    fieldLabel: item.name,
                    filteredTypes: item.filters,
                    value: item.value
                }
            })
        });
    },

    // Wrapper function to create and add the attributes tab to the context panel.
    addTab: function() {
        var cmp = Ext.widget("panel", {
            itemId: 'tagPanel',
            padding: 5,
            border: 0,
            name: this.tabGroupName,
            groupName: this.tabGroupName,
            listeners: {
                render: function() {
                    this.up('tabpanel').tabBar.hide();
                }
            }
        });
        this.application.fireEvent(Statics.eventsNames.addContextPanelTab, cmp);
        return cmp;
    }
});
