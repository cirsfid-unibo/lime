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
                'AknMetadata.newMeta.ReferenceCombo', 'AknMain.RefersTo'],

    tabGroupName: "tagAttributesManager",
    tagAttributesTab: null,

    init: function () {
        this.application.on(Statics.eventsNames.editorDomNodeFocused,
                            function(node, actions) {
                                if (this.haveToShowNodeAttributes(node, actions)) {
                                    // Defer the execution in order to get the eventually updated attributes
                                    setTimeout(this.showNodeAttributes.bind(this, node), 100);
                                }
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

    // Decide if the node attributes will be shown.
    // This is because of the attribute 'refersTo' in all inline elements and the
    // panel is opening to many times when is not necessary.
    // This control prevents to open the panel when it's not
    // immediately necessary and it aims to improve the UX.
    // e.g. marking the <num>
    // Anyway the user can open it buy clicking on the node.
    haveToShowNodeAttributes: function(node, actions) {
        if (actions.rightClick) return false;
        if (!actions.manualMarking) return true;
        var tag = DomUtils.getNameByNode(node);
        // Elements not requiring attributes immediately
        var noAttrEls = [
            'num',
            'mod',
            'heading',
            'subheading',
            'docType',
            'docNumber',
            'docDate',
            'docTitle',
            'docAuthority',
            'docProponent',
            'docStage',
            'docStatus',
            'docCommittee',
            'docIntroducer',
            'docJurisdiction',
            'docketNumber'
        ];

        if (noAttrEls.indexOf(tag) >= 0) return false;
        return true;
    },

    showNodeAttributes: function(node) {
        var panel = this.getAttributePanel(node);
        if (!panel) return;
        this.tagAttributesTab = this.tagAttributesTab || this.addTab();
        this.tagAttributesTab.removeAll(true);
        this.tagAttributesTab.add(panel);
        this.application.fireEvent(Statics.eventsNames.openCloseContextPanel,
                                    true, this.tabGroupName, panel.contextHeight);
        Ext.GlobalEvents.fireEvent('scrollToActiveNode');
    },

    getAttributePanel: function(node) {
        var tag = DomUtils.getNameByNode(node);
        switch(tag) {
            case 'num':
            case 'heading':
            case 'mmod':
            case 'ins':
            case 'del':
                return;
            case 'ref':
                return this.createRefPanel(node);
            case 'role':
                return this.createNodeRefsPanel(node, [{
                    attr: 'refersTo',
                    filters: this.getElementRefTypes(tag)
                }]);
            case 'location':
                return this.createNodeRefsPanel(node, [{
                    attr: 'refersTo',
                    filters: this.getElementRefTypes(tag)
                }]);
            case 'person':
                return this.createNodeRefsPanel(node, [{
                    attr: 'refersTo',
                    filters: this.getElementRefTypes(tag)
                },{
                    attr: 'as',
                    filters: this.getElementRefTypes('role')
                }]);
            case 'docDate':
            case 'date':
                return this.createDatePanel(node);
        }
        // Show refersTo for all inline elements
        var pattern = DomUtils.getPatternByNode(node);
        if (pattern === 'inline')
            return this.createNodeRefsPanel(node, [{
                attr: 'refersTo',
                filters: this.getElementRefTypes(tag)
            }]);
    },

    getElementRefTypes: function(name) {
        switch(name) {
            case 'date':
            case 'docDate':
            case 'time':
                return ['TLCConcept', 'TLCEvent'];
            case 'quantity':
                return ['TLCObject'];
            case 'def':
            case 'entity':
            case 'docPurpose':
                return ['TLCConcept'];
            default:
                var validTypes = AknMain.metadata.Reference.validators.type[0].list;
                var type = 'TLC'+Ext.String.capitalize(name);
                if (validTypes.indexOf(type) >= 0)
                    return [type];
        }

        return [];
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

        // This is a hack for internal ref validation
        // we cannot use allowBlank because fragment is allowed blank
        // in external ref but not allowed in internal
        var isValidInternalRef = function(ref, refPanel) {
            var valid = (ref.internal && ref.id) ? true : false;
            var invalidField = refPanel.getField('fragment');
            if (!valid) {
                invalidField.toggleInvalidCls(true);
                setTimeout(function() {
                    invalidField.toggleInvalidCls(false);
                }, 1000);
            }
            return valid;
        };

        var saveRef = function(refPanel) {
            var data = refPanel.getValues(false, false, false, true);
            var ref = AknMain.Reference.empty();
            ref.internal = (data.type == "external") ? false : true;
            ref.id = data.fragment;
            ref.uri.country = data.nationality;
            ref.uri.author = data.author;
            ref.uri.type = data.docType;
            ref.uri.subtype = normalizeSubtype(data.subtype);
            ref.uri.name = data.number;
            ref.uri.date = (data.date) ? Ext.Date.format(data.date, 'Y-m-d') : "";
            ref.uri.language = DocProperties.documentInfo.docLang;
            var href = "";
            if (!refPanel.isValid() || !isValidInternalRef(ref, refPanel)) {
                return;
            }
            try {
                href = ref.ref();
                // this is for causing the error if href is not parsable
                AknMain.Reference.parse(href)
            } catch(e) {
                console.error(e);
                return;
            }
            if (href.length > 1) {
                var oldValue = node.getAttribute(attribute);
                node.setAttribute(attribute, href);
                refPanel.down("#successSaveLabel").setVisible(true);
                me.closeContextPanel();
                if (href !== oldValue) {
                    var attrs = {};
                    attrs[attribute] = {value: href, oldValue: oldValue};
                    Ext.GlobalEvents.fireEvent('nodeAttributesChanged', node, attrs);
                }
            }
        };

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
                var value = panel.down('[itemId='+item.attr+']').getValue() || '';
                if (value && Ext.isString(value)) {
                    var type = (!Ext.isEmpty(item.filters)) ? item.filters[0] : 'TLCReference';
                    value = AknMain.RefersTo.getRef(type, value);
                }
                return value && save(item.attr, value.get('eid'));
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
                var obj = {
                    xtype: 'akn-metadata-tab-referencecombo',
                    queryMode: 'local',
                    itemId: item.attr,
                    fieldLabel: item.name,
                    value: item.value
                }
                if (item.filters && item.filters.length)
                    obj.filteredTypes = item.filters;
                return obj;
            })
        });
    },

    createDatePanel: function(node) {
        var me = this,
            dateAttr = LangProp.attrPrefix+'date',
            date = node.getAttribute(dateAttr);
        date = date && Utilities.fixDateTime(new Date(date));
        // Create a refs panel and change it by adding the date field
        var panel = this.createNodeRefsPanel(node, [{
            attr: 'refersTo',
            filters: this.getElementRefTypes('date')
        }]);
        panel.setTitle(Locale.getString('date', 'akn-metadata'));
        panel.contextHeight+=30;
        panel.insert(0, {
            xtype: 'datefield',
            name: 'date',
            fieldLabel: Locale.getString('date', 'akn-metadata'),
            value: date
        });
        var onSaveRefers = panel.onSave;
        panel.onSave = function(panel) {
            var date = panel.down('[name=date]').getValue();
            date = Utilities.isValidDate(date) && Utilities.normalizeDate(date);
            if (date)
                node.setAttribute(dateAttr, date);
            me.closeContextPanel();
            return onSaveRefers(panel);
        }
        return panel;
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
