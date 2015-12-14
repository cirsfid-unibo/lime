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


/*
 * This controller manages widgets of marked elements.
 * It takes care of creating, updating, showing and hiding of widgets.
 * It also adds a tab in ContextPanel which contains the widgets.
 * */

Ext.define('LIME.controller.WidgetManager', {
    extend : 'Ext.app.Controller',

    views: ['widgets.MarkedElementWidget'],
    refs : [{
        selector: 'contextPanel',
        ref: 'contextPanel'
    }, {
        selector: 'markedElementWidget',
        ref: 'markedElementWidget'
    }],
    
    tabGroupName: "widgetManager",

    listen: {
        global: {
            forceMetadataWidgetRefresh: 'refreshActiveWidgetData'
        }
    },
    
    /*
     * Wrapper function for creating widgets
     * 
     * @param {String} id The id of the widget
     * @param {Object} config The configuration of the widget, created by Interpreters.parseWidget
     * @return {markedElementWidget} Created widget
     * */    
    createWidget: function(id, config) {
        var me = this, 
            newWidget = Ext.widget('markedElementWidget', {
                items : config.list,
                id : id,
                width: "40%",
                title : config.title,
                attributes : config.attributes,
                bbar: [{
                    xtype: 'component',
                    id: 'successSaveLabel',
                    hidden: true,
                    flex: 1,
                    baseCls: 'form-success-state',
                    cls: Ext.baseCSSPrefix + 'success-icon',
                    html: 'Data have been saved'
                },'->', {
                    xtype: 'button',
                    text: Locale.getString("saveDocumentButtonLabel"),
                    handler: function() {
                        me.saveWidgetData(this.up("markedElementWidget"), this);
                        me.application.fireEvent(Statics.eventsNames.openCloseContextPanel,
                                    false, me.tabGroupName);
                    }    
                }]
            });
        return newWidget; 
    },


    saveWidgetData: function(widget, button) {
        var me = this;
        Ext.each(widget.query("textfield"), function(field) {
            me.updateWidgetData(widget, field, false, true);
        });
        widget.down("#successSaveLabel").setVisible(true);
    },
    
    /*
     * This function is called when a node is focused.
     * If the focused node has a widget, the widget is created and added to the tab.
     * In the end it opens the context panel if there is a widget or closes it otherwise.
     * @param {HTMLElement} node The focused node
     * */
    onNodeFocused: function(node) {
        var widgetConfig = DocProperties.getNodeWidget(node),
            elId = DomUtils.getElementId(node), 
            panelHeight, widget;
        if(widgetConfig && elId) {
            if(!this.tab.getChildByElement(elId)) {
                this.tab.removeAll(true);
                widget = this.createWidget(elId, widgetConfig);
                this.setWidgetContent(widget);
                this.tab.add(widget);    
            }
            // Calculates the height of the panel base on numer of fields in the widget
            panelHeight = (widgetConfig.list.length*30)+102;
            this.application.fireEvent(Statics.eventsNames.openCloseContextPanel,
                                    true, this.tabGroupName, panelHeight);
        } else {
            this.application.fireEvent(Statics.eventsNames.openCloseContextPanel,
                                    false, this.tabGroupName);
        }
    },
    
    /*
     * Wrapper function to create and add a tab to the context panel.
     * */
    addTab: function() {
        var cmp = Ext.widget("panel", {
            itemId: 'widgetsPanel',
            title: "Widgets",
            padding: 5,
            border: 0,
            name: this.tabGroupName,
            groupName: this.tabGroupName
        });
        this.tab = cmp;
        this.application.fireEvent(Statics.eventsNames.addContextPanelTab, cmp);
        return cmp;
    },

    refreshActiveWidgetData: function() {
        var contextPanel = this.getContextPanel();
        if ( !this.tab || !contextPanel.isVisible() ) return;
        var widget = this.tab.down();

        if (widget) {
            this.setWidgetContent(widget, true);
        }
    },
    
    /*  
     *  This function sets the content of a widget. 
     *  It fills out all the fields of the widget with extracted data
     *  from attributes of the associated html node. 
     *
     *  @param {markedElementWidget} widget
     * */
    
    setWidgetContent: function(widget, refresh) {
        var me = this, markedElement = DocProperties.getMarkedElement(widget.id),
            fields = widget.query('textfield');
            
        Ext.each(fields, function(field) {
            var value = markedElement.htmlElement.getAttribute(field.name);
            if (value) {
                me.setWidgetFieldValue(widget, field, value);    
            }
        });
        
        if (widget.attributes) {
            Ext.Object.each(widget.attributes, function(attribute, obj) {
                var value, values;
                if (obj.tpl && obj.separator) {
                    var tpl = new Ext.Template(obj.tpl),
                        tplValues = tpl.html.match(tpl.re);
                    value = markedElement.htmlElement.getAttribute(obj.name);
                    if(Ext.String.startsWith(value, obj.separator)) {
                        value = value.substring(obj.separator.length);
                    }
                    if (value) {
                        values = value.split(obj.separator);
                        for(var i=0; i<tplValues.length; i++) {
                            var key = tplValues[i].substring(1, tplValues[i].length-1),
                                field = me.getWidgetFieldByOrigName(widget, key);

                            if(field && values[i]) {
                                if ( obj.internalSeparator ) {
                                    var internalSplit = values[i].split(obj.internalSeparator);
                                    if ( internalSplit.length == 2 ) {
                                        values[i] = internalSplit[0];
                                        values.push(internalSplit[1]);
                                    }
                                }
                                me.setWidgetFieldValue(widget, field, values[i]);    
                            }
                        }       
                    }
                }
            });
        }
        if (!refresh) {
            me.setWidgetAttributes(widget);
        }
    },
    
    /*
     * Utility function to get a field by original name
     * 
     * @param {markedElementWidget} widget
     * @param {String} name
     * @return {Textfield} found field
     * */
    getWidgetFieldByOrigName: function(widget, name) {
        return widget.query('textfield[origName='+name+']')[0];   
    },
    
    /*
     * Utility function to set the value of a single widget field
     * 
     * @param {markedElementWidget} widget
     * @param {Textfield} field
     * @param {String} value
     * */
    setWidgetFieldValue: function(widget, field, value) {
        if (value) {
            if (field.name == 'date') {
                value = new Date(value.replace(/-/g, '/'));
            }
            field.setValue(value);
            this.updateWidgetData(widget, field, value);
        }
    },
    
    
    /*
     * Utility function to set and store the attributes (values of all fields) of a widget
     * 
     * @param {markedElementWidget} widget
     * */
    setWidgetAttributes: function(widget) {
        var attributes = widget.attributes,
            result = []; 
        if (attributes) {
            widget.ownData = widget.ownData || {};
            widget.templates = widget.templates || {};
            Ext.Object.each(attributes, function(attribute, obj) {
                widget.templates[obj.name] = widget.templates[obj.name] || new Ext.Template(obj.tpl);
                result.push({name: obj.name, value: widget.templates[obj.name].apply(widget.ownData)});
            });
        }
        
        if(result.length) {
            this.setElementAttributes(widget.id, result);
        }
    },
    
    /*
     * Wrapper function to set attributes to a marked element
     * 
     * @param {String} elementId
     * @param {Array} attributes A list of Objects {name:name, value:value}
     * */
    
    setElementAttributes: function(elementId, attributes) {
        var editorController = this.getController('Editor'), node, tmpNode;
        if (!Ext.isEmpty(attributes)) {
            Ext.each(attributes, function(attribute) {
                tmpNode = editorController.setElementAttribute(elementId, attribute.name, attribute.value);
                node = node || tmpNode;
            });
            if(node) {
                this.application.fireEvent(Statics.eventsNames.nodeAttributesChanged, node);
            }
        }
    },
    
    
    /*
     * This function is called when a field in the widget is changed
     * It cares about updating the attributes of the associated marked element.
     * 
     * @param {markedElementWidget} widget
     * @param {Textfield} field
     * @param {String} value
     * @param {Boolean} updateAttributes True to update the attributes of the widget and element
     * */
     //TODO: move this to akn package
    updateWidgetData: function(widget, field, value, updateAttributes) {
        var originalName = field.origName;
        value = value || field.getValue();
        value = ( field.disabled ) ? "" : value;
        //check if field is a date and convert to the ISO format
        if (Utilities.isValidDate(value))
            value = Utilities.normalizeDate(value);
        widget.ownData = widget.ownData || {};
        widget.ownData[originalName] = value || "";
        if (updateAttributes) {
            this.setWidgetAttributes(widget);
        }
    },
    
    init : function() {
        var me = this;
        
        me.addTab();
        me.application.on(Statics.eventsNames.editorDomNodeFocused, me.onNodeFocused, me);
        me.application.on(Statics.eventsNames.unfocusedNodes, function() {
            me.application.fireEvent(Statics.eventsNames.openCloseContextPanel,
                                    false, this.tabGroupName);
        }, this);

        me.control({
            "markedElementWidget textfield" : {
                change : function(field) {
                    var widget = field.up('markedElementWidget');
                    widget.down("#successSaveLabel").setVisible(false);
                },
                focus : function(field) {
                    var widget = field.up('markedElementWidget'),
                        markedEl = DocProperties.getMarkedElement(widget.id);
                    if(markedEl) {
                        me.application.fireEvent(Statics.eventsNames.nodeFocusedExternally, markedEl.htmlElement, {
                            highlight:true
                        });
                    }
                }
            },
            "[itemId=widgetsPanel]": {
                render: function(cmp) {
                    cmp.up('tabpanel').tabBar.hide()
                }
            }
        });
    }
});
