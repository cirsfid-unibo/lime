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

Ext.define('AknMetadata.MetadataManagerController', {
    extend : 'Ext.app.Controller',

    views : ["AknMetadata.MetaGrid", "AknMetadata.MetadataManagerTabPanel"],

    requires: [
        'AknMain.Uri'
    ],

    refs : [{
        selector : 'appViewport',
        ref : 'appViewport'
    }, {
        selector : 'main tabbar',
        ref : 'mainToolbar'
    }, {
        selector: 'metaManagerPanel',
        ref: 'metaManagerPanel'
    }, {
        selector: 'contextPanel',
        ref: 'contextPanel'
    }],

    config : {
        pluginName : "akn-metadata",
        btnCls : "editorTabButton openMetadataBtn"
    },

    tabMetaMap: {},

    listen: {
        global: {
            forceMetadataWidgetRefresh: 'refreshMetadataFields'
        }
    },

    addMetadataButton : function() {
        var me = this, toolbar = me.getMainToolbar();
        if (!toolbar.down("[cls='" + me.getBtnCls() + "']")) {
            toolbar.add({xtype: 'tbfill'});
            toolbar.add({
                xtype: 'button',
                enableToggle: true,
                cls : me.getBtnCls(),
                margin : "0 10 0 0",
                text : Locale.getString("title", me.getPluginName()),
                listeners : {
                    click : Ext.bind(me.openManager, me)
                }
            });
        }
    },

    toggleMetadataButton: function(state) {
        var btn = this.getMainToolbar().down("[cls='" + this.getBtnCls() + "']");
        btn.toggle(state);
    },

    removeMetadataButton : function() {
        var me = this, toolbar = me.getMainToolbar(),
            btn = toolbar.down("[cls='" + me.getBtnCls() + "']");
        if (btn) {
            toolbar.remove(btn);
        }
    },

    openManager: function(btn) {
        this.application.fireEvent(Statics.eventsNames.openCloseContextPanel,
                                    btn.pressed, this.getPluginName());
    },

    addTab: function(conf) {
        conf = conf || {};
        var cmp = Ext.widget("metaManagerPanel", Ext.merge({
            name: "metaManagerPanel",
            autoDestroy: false,
            itemId: conf.name,
            groupName: this.getPluginName()
        }, conf));
        this.application.fireEvent(Statics.eventsNames.addContextPanelTab, cmp);
        return cmp;
    },

    onRemoveController : function() {
        this.removeMetadataButton();
    },

    addMetadataFields: function() {
        var me = this,
            metaTemplate = Config.getLanguageConfig().metaTemplate,
            newTab;

        Ext.Object.each(metaTemplate, function(key, value) {
            if(key == "identification") {
                var frbrFieldsets = Ext.Object.getKeys(value).filter(function(name) {
                    return name.charAt(0) != "@";
                });
                Ext.each(frbrFieldsets, function(name) {
                    newTab = me.addMetaFRBRFieldset(name, value[name]);
                    me.tabMetaMap[name] = {
                        tab: newTab,
                        metaParent: key
                    };
                });
            } else {
                newTab = me.addMetaFieldset(key, value);
                me.tabMetaMap[key] = {
                    tab: newTab
                };
            }
        });

        me.addLifecycle();
        me.addWorkflow();
        me.addClassification();
        me.addProprietary();
    },

    fakeSavingToolbar: [{
        xtype: 'component',
        hidden: true,
        flex: 1,
        baseCls: 'form-success-state',
        cls: Ext.baseCSSPrefix + 'success-icon',
        html: Locale.getString('savedMsg', 'metadataManager')
    },'->', {
        xtype: 'button',
        text: Locale.getString("saveDocumentButtonLabel"),
        handler: function(cmp) {
            var label = cmp.up().down('component');
            setTimeout(function () {
                label.show();
                setTimeout(function () { label.hide(); }, 5000);
            }, 300);
        }
    }],

    // Add lifecycle tab
    addLifecycle: function() {
        this.addMetaTab("lifecycle", "lifecycle", [
            this.createFieldsetItem ("lifecycle", ["source"]),
            this.createMetaGrid (
                "children",
                ["eId", "date", "source", "type"],
                {
                    // Custom columns
                    "type": ["generation", "amendment", "repeal"]
                },
                "lifecycle/eventRef"
            )
        ]);
    },

    // Add workflow tab
    addWorkflow: function() {
        this.addMetaTab("workflow", "workflow", [
            this.createFieldsetItem ("workflow", ["source"]),
            this.createMetaGrid (
                "children",
                ["date", "actor", "outcome", "refersTo"],
                {
                    "type": ["generation", "amendment", "repeal"]
                },
                "workflow/step"
            )
        ]);
    },

    // Add classification tab
    addClassification: function() {
        this.addMetaTab("classification", "classification", [
            this.createFieldsetItem ("classification", ["source"]),
            this.createMetaGrid (
                "children",
                ["value", "showAs", "dictionary", "href"],
                {
                },
                "classification/keyword"
            )
        ]);
    },

    addProprietary: function() {
        var me = this, editor = me.getController("Editor");
        this.addMetaTab("proprietary", "proprietary", [
            this.createFieldsetItem ("proprietary", ["source"]),
            this.createMetaGrid (
                "proprietary",
                ["name", "content"],
                {
                    "name": ["Asunto", "Carpeta", "WorkflowTitle", "Cuerpo", "SubType", "Variante", "Iniciativa", "Asunto", "Repartido", "Destribuito"]
                },
                "proprietary",
                function(store) {
                    var data = me.getDataObjectsFromStore(store),
                        metadata = editor.getDocumentMetadata(),
                        groups = {};

                    Ext.each(metadata.originalMetadata.metaDom.querySelectorAll('[class=proprietary] *'), function(node) {
                        node.parentNode.removeChild(node);
                    });

                    Ext.each(data, function(obj) {
                       var name = obj.name;
                       if(name) {
                           delete obj.name;
                           obj.html = obj.content;
                           delete obj.content;
                           name = DocProperties.documentInfo.docLocale + ':' + name;
                           groups[name] = groups[name] || [];
                           groups[name].push(obj);
                       }
                    });
                    Ext.Object.each(groups, function(group, gData) {
                       var result = DocProperties.updateMetadata(Ext.merge({
                            metadata : editor.getDocumentMetadata(),
                            path : "proprietary/"+group,
                            data : gData
                        }));
                        if (result) {
                            Ext.MessageBox.alert("Error", "Error " + result);
                        } else {
                            //remove this
                            editor.changed = true;
                        }
                    });
                }
            )
        ]);
    },


    storeGridChanged: function(store) {
        var data = this.getDataObjectsFromStore(store);
        if ( store.grid.name == "FRBRalias" ) {
            data = data.map(function(obj) {
                obj.name = (obj.name == "name") ? 'alias' : obj.name;
                return obj;
            });
        }
        this.updateMetadata(store.grid, data, {
            overwrite: false,
            after: (store.grid.name == "FRBRuri") ? "FRBRthis" : "FRBRuri"
        });
    },

    getDataObjectsFromStore: function(store) {
        var data = [];
        store.each(function(record) {
            var recordData = record.getData(),
                filtredData = {};
            Ext.Object.each(recordData, function(key, val) {
                if(val != undefined) {
                    filtredData[key] = val;
                }
            });
            data.push(filtredData);
        });
        return data;
    },

    // Add a tab with title tabname and containing items, responsible for the metadataTag
    addMetaTab: function (tabName, metadataTag, items) {
        var tab = this.addTab({
            name: metadataTag,
            title: Ext.String.capitalize(Locale.getString(tabName, this.getPluginName())),
            items: items,
            bbar: this.fakeSavingToolbar
        });
        this.tabMetaMap[metadataTag] = {
            tab: tab
        };
    },

    getValuesFromObj: function(obj) {
      return Ext.Object.getKeys(obj).filter(function(el) {
          return (el.charAt(0) == "@");
      }).map(function(attr) {
          return attr.substr(1);
      });
    },

    createMetaGrid: function(name, values, customColumns, customPath, callback) {
        var me = this,
            callback = callback || me.storeGridChanged;
        return Ext.widget("metaGrid", {
                title: Locale.getString(name, me.getPluginName()),
                width: "98%",
                margin: '5 0 0 5',
                name: name,
                columnsNames: values,
                customColumns: customColumns,
                customPath: customPath,
                store: Ext.create('Ext.data.Store', {
                    fields : values,
                    listeners: {
                        remove: Ext.bind(callback, me),
                        update: Ext.bind(callback, me)
                    }
                })
        });
    },

    addMetaFRBRFieldset: function(name, conf) {
        var me = this,
            items = [];
        Ext.Object.each(conf, function(key) {
            var values = me.getValuesFromObj(conf[key]);
            if(key == "FRBRuri" || key == "FRBRalias") {
                items.push(me.createMetaGrid(key, values));
            } else {
                items.push(me.createFieldsetItem(key, values));
            }
        });
        return me.addMetaFieldset(name, conf, items);
    },

    addMetaFieldset: function(name, conf, items) {
        var me = this,
            tab = me.getMetaManagerPanel(),
            possibleChildren = conf["!possibleChildren"],
            values;

      if(!Ext.isArray(items)) {
        items = [me.createFieldsetItem(name, me.getValuesFromObj(conf))];
      }

        if(possibleChildren) {
            // if(possibleChildren.names) {
                values = Ext.Array.push("type", me.getValuesFromObj(possibleChildren.attributes));
                items.push(me.createMetaGrid("children", values, {
                    "type": possibleChildren.names
                }));
            // } else {
            //     values = me.getValuesFromObj(possibleChildren.attributes);
            //     items.push(me.createMetaGrid("Children", values, {}));
            // }
        }
        // console.warn('add meta filedset', name);
        items.forEach(function (item) {
            item.itemId = item.name;
            // console.info('item.itemId', item.itemId);
        });
          return me.addTab({
              name: name,
              title: Ext.String.capitalize(Locale.getString(name, me.getPluginName())),
              items: items,
            bbar: me.fakeSavingToolbar
          });
    },

    createFieldsetItem: function(name, values) {
        var me = this;
        return {
            xtype: "form",
            width: "98%",
            name: name,
            bodyPadding: 10,
            margin: '5 0 0 5',
            layout: {
                type: (values.length > 3) ? 'anchor' : 'hbox',
                padding:'5',
                align:'right'
            },
            title: Locale.getString(name, me.getPluginName()),
            items: values.map(function(attr) {
              return {
                xtype: (attr == "date") ? "datefield" : "textfield",
                format: (attr == "date") ? "Y-m-d" : "",
                fieldLabel: (values[0] == 'source') ?
                    Locale.getString("provenance", me.getPluginName()) :
                    Locale.getString(attr.replace("akn_", ""),me.getPluginName()),
                labelAlign : 'right',
                anchor: '30%',
                labelWidth: 80,
                name: attr
              };
            })
          };
    },

    afterSave: function() {
        // TODO: finish updating data after save
        /*try {
            var contextPanel = this.getContextPanel();
            if (contextPanel.down()) {
                var tab = contextPanel.down().activeTab;
                this.fillMetadataFields(tab, false);
            }
        } catch(e) {
            console.error('AfterSave metadataManager failed get activeTab', e);
        }*/
    },

    refreshMetadataFields: function() {
        try {
            var contextPanel = this.getContextPanel();
            if (contextPanel.down()) {
                var tab = contextPanel.down().activeTab;
                this.fillMetadataFields(tab, false);
            }
        } catch(e) {
            console.error('metadataManager failed to refresh metadata', e);
        }
    },

    // TODO: update every time
    fillMetadataFields: function(tab, filled) {
        var me = this, editor = me.getController("Editor"),
            metadata = editor.getDocumentMetadata(),
            tabMap = me.tabMetaMap[tab.name];

        //tabMap.filled = (filled !== undefined) ? filled : tabMap.filled;
        if(!tabMap) return;
        metadata = (metadata && metadata.obj && tabMap.metaParent) ?  metadata.obj[tabMap.metaParent] : metadata.obj;
        if(metadata && metadata[tab.name]) {
            // Removing all from grids before filling up
            Ext.each(tabMap.tab.query('metaGrid'), function(grid) {
                grid.store.removeAll();
            });
            // Populate source field.
            var source = metadata[tab.name].attr["source"],
                sourceField = tabMap.tab.down("*[name='source']");
            if(source && sourceField) {
                sourceField.setValue(source);
            }
            Ext.each(metadata[tab.name].children, function(el) {
                var cmpToFill = tabMap.tab.down("*[name='" + el.attr["class"] + "']");

                if(tabMap.tab.down("*[name='children']")) {
                    cmpToFill = tabMap.tab.down("*[name='children']");
                    if(tab.name == 'references') {
                        el.attr["type"] = el.attr["class"];
                    }
                }

                if(tabMap.tab.down("*[name='proprietary']")) {
                    cmpToFill = tabMap.tab.down("*[name='proprietary']");
                    el.attr["name"] = el.attr["class"].substring(el.attr["class"].indexOf(':')+1);
                    el.attr["content"] = el.el.innerHTML;
                }

                if(cmpToFill) {
                    if(cmpToFill.xtype == "metaGrid") {
                        me.fillGridFields(cmpToFill, me.normalizeAttributes(el));
                    } else {
                        me.fillFormFields(cmpToFill, me.normalizeAttributes(el));
                    }
                } else {
                }
            });
        }
        //tabMap.filled = true;
    },

    normalizeAttributes: function(obj) {
        var normalizedAttr = {
            "showas": "akn_showAs",
            "showAs": "akn_showAs",
            "eid": "eId"
        };
        for (attr in normalizedAttr)
            if (obj.attr[attr] && !obj.attr[normalizedAttr[attr]]) {
                obj.attr[normalizedAttr[attr]] = obj.attr[attr];
                delete obj.attr[attr];
            }

        return obj;
    },

    fillGridFields: function(grid, data) {
        this.addRecord(grid, data.attr, false, true);
    },

    fillFormFields: function(form, data) {
        Ext.Object.each(data.attr, function(attr, val) {
            var field = form.down("*[name='"+attr+"']");
            if(field) {
                if(Ext.isEmpty(val)) {
                    field.reset();
                } else {
                  field.setValue(val);
                }
            }
        });
    },

    tabActivated: function(tab) {
        //TODO: check why this is called multiple times
        this.fillMetadataFields(tab);
    },

    addRecord : function(grid, record, index, noEdit) {
        var store = grid.getStore(),
        plugin = grid.getPlugin("cellediting"),
        index = index || store.getCount();
        store.insert(index, [record]);
        if(!noEdit) {
            plugin.startEdit(index, 0);
        }
    },

    /*resetFields: function() {
        var me = this;
        Ext.Object.each(me.tabMetaMap, function(el, obj) {
            obj.filled = false;
            if(obj.tab) {
                Ext.each(obj.tab.query("textfield"), function(cmp) {
                    cmp.reset();
                });
                Ext.each(obj.tab.query("metaGrid"), function(cmp) {
                    cmp.getStore().removeAll(true);
                });
            }
        });
        this.application.fireEvent(Statics.eventsNames.openCloseContextPanel,
                                    false, this.getPluginName());
    },
    */

    docLoaded: function() {
        this.tabMetaMap = {};
        this.application.fireEvent(Statics.eventsNames.removeGroupContextPanel, this.getPluginName());
        Ext.defer(this.addMetadataFields, 200, this);
    },

    updateMetadata: function(cmp, data, conf, enablePropagation) {
        // if (enablePropagation)
        //     this.propagationInterceptor(cmp, data, conf);
        var me = this, editor = me.getController("Editor"),
            tab = cmp.up("metaManagerPanel"),
            tabMap = me.tabMetaMap[tab.name],
            name = cmp.name,
            path = "";
        conf = conf || {};

        if(tabMap && cmp) {
            path = (tabMap.metaParent) ? tabMap.metaParent + "/" : "";
            if(name == "children" && tab.name == 'references') {
               var groups = {};
               Ext.each(data, function(obj) {
                    var type = obj.type;
                    if(type !== undefined) {
                        delete obj.type;
                        groups[type] = groups[type] || [];
                        groups[type].push(obj);
                    }
               });
                // Removing old references
                var meta = editor.getDocumentMetadata(),
                    refs = meta.originalMetadata.metaDom.querySelector('[class=references]');
                if (refs)
                    DomUtils.removeChildren(refs);
               Ext.Object.each(groups, function(group, gData) {
                   var result = DocProperties.updateMetadata(Ext.merge({
                        metadata : editor.getDocumentMetadata(),
                        path : path+tab.name+"/"+group,
                        data : gData
                    }));
                    if (result) {
                        Ext.MessageBox.alert("Error", "Error " + result);
                    } else {
                        //remove this
                        editor.changed = true;
                    }
               });
            } else if (name == "children" && (tab.name == "lifecycle" || tab.name == "workflow" || tab.name == "classification")
                       && cmp.customPath) {
                var result = DocProperties.updateMetadata(Ext.merge({
                    metadata : editor.getDocumentMetadata(),
                    path : cmp.customPath,
                    data : data,
                    overwrite: true
                }, conf));
                if (result) {
                    Ext.MessageBox.alert("Error", "Error " + result);
                } else {
                    //remove this
                    editor.changed = true;
                }
            } else {
                path += (tab.name != name) ? tab.name + "/" + name : tab.name;
                //move this to a controller
                // if (path == "identification/FRBRWork/FRBRthis") {
                //     var manifestation =
                //         editor.getDocumentMetadata().originalMetadata.metaDom
                //         .querySelector('[class="FRBRManifestation"] [class="FRBRthis"]').getAttribute('value');
                //     var manifestationList = manifestation.split('/');
                //     // console.log(data);
                //     var workList = data.value.split('/');
                //     // console.log('manifestation before', manifestation);
                //     for (var i = 0; i < workList.length -1; i++) {
                //         manifestationList[i] = workList[i];
                //     }
                //     manifestation = manifestationList.join('/');
                //     // console.log('manifestation after', manifestation);
                //     DocProperties.updateMetadata(Ext.merge({
                //         metadata : editor.getDocumentMetadata(),
                //         path : "identification/FRBRManifestation/FRBRthis",
                //         data : { value: manifestation },
                //         isAttr: data.source ? true : false,
                //         overwrite: data.source ? false : true
                //     }, conf));
                //
                // }
                var result = DocProperties.updateMetadata(Ext.merge({
                    metadata : editor.getDocumentMetadata(),
                    path : path,
                    data : data,
                    isAttr: data.source ? true : false,
                    overwrite: data.source ? false : true
                }, conf));
                if (result) {
                    Ext.MessageBox.alert("Error", "Error " + result);
                } else {
                    //remove this
                    editor.changed = true;
                }
            }
        }
        editor.showDocumentIdentifier();
    },

    // Alert: very crappy hack is coming.
    // Some metadata changes need to be propagated (Eg. a change in the
    // doc date should result in a change in all the URIs as well, etc.)
    // Since LIME's metadata "management" is complicated, duplicated in many files
    // and hard to hook with, we'll do this: on a component change, detect what changed
    // and update the other connected widgets.
    // A wonderful hack for a wonderful editor.
    propagationInterceptor: function (cmp, data, conf) {
        console.log(cmp, data, conf);
        var editor = this.getController('Editor'),
            tab = cmp.up("metaManagerPanel"),
            section = tab.name,
            widget = cmp.name;

        // We know better than the Law of Demeter.
        var oldUriStr = editor.getDocumentMetadata().originalMetadata.metaDom.querySelector('[class="FRBRManifestation"] [class="FRBRthis"]').getAttribute('value'),
            uri = AknMain.Uri.parse(oldUriStr),
            oldGeneratedUri = uri.manifestation();

        console.info(section, widget, data);
        if (section == 'FRBRWork' && widget == 'FRBRdate') uri.date = data.date;

        // TODO: do it even for url to properties. Parse it again and Object.keys iterate it?

        function superUpdate(level, item, prop, value) {
            var selector = '#'+level+' #'+item+' field';
            tab.ownerCt.down(selector).setRawValue(value);
            var request = {
                metadata : editor.getDocumentMetadata(),
                path : 'identification/'+level+'/'+item,
                data : {},
                isAttr: true,
                overwrite: true
            };
            request.data[prop] = value;

            DocProperties.updateMetadata(request);
        }
        if(oldGeneratedUri != uri.manifestation()) {
            console.info(uri.work());
            console.info(uri.expression());
            console.info(uri.manifestation());
            superUpdate('FRBRWork', 'FRBRthis', 'value', uri.work());
            superUpdate('FRBRExpression', 'FRBRthis', 'value', uri.expression());
            superUpdate('FRBRManifestation', 'FRBRthis', 'value', uri.manifestation());
            superUpdate('FRBRManifestation', 'FRBRdate', 'date', uri.date);

            // Update FRBRdate
            // Update FRBRauthor
            // ...
        }
    },
    uri: undefined,


    init : function() {
        var me = this;
        me.application.on(Statics.eventsNames.afterLoad, me.docLoaded, me);
        me.application.on(Statics.eventsNames.afterLoad, me.addMetadataButton, me);
        me.application.on(Statics.eventsNames.afterSave, me.afterSave, me);
        me.control({
            'metaManagerPanel': {
                activate: me.tabActivated
            },
            'metaManagerPanel textfield': {
                change: function(cmp, newValue, oldValue) {
                    if(!cmp.up("metaGrid")) {
                        var form = cmp.up("form");
                        me.updateMetadata(form, form.getValues(), undefined, !!oldValue);
                    }
                }
            },
            'metaGrid tool' : {
                click : function(cmp) {
                    var grid = cmp.up("metaGrid");
                    var records = {};
                    Ext.each(grid.columnsNames, function(name) {
                        records[name] = name;
                        // what is record?
                    });
                    me.addRecord(grid, records);
                }
            },
            'contextPanel': {
                show: function(cmp) {
                    if (cmp.down('[name=akn-metadata]') && cmp.down('[name=akn-metadata]').isVisible())
                        me.toggleMetadataButton(true);
                },
                hide: function(cmp) {
                    me.toggleMetadataButton(false);
                }
            }
        });
    }
});
