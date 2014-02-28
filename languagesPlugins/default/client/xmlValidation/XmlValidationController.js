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

Ext.define('LIME.controller.XmlValidationController', {
    extend : 'Ext.app.Controller',

    config : {
        pluginName : "xmlValidation"
    },

    onDocumentLoaded : function(docConfig) {
        var me = this;
        menu = {
            text : Locale.getString("validateXml", me.getPluginName()),
            tooltip : Locale.getString("validateXmlTooltip", me.getPluginName()),
            icon : 'resources/images/icons/accept.png',
            name : 'validateXml',
            handler : Ext.bind(this.beforeValidateXml, this)
        };
        me.application.fireEvent("addMenuItem", me, {
            menu : "documentMenuButton"
        }, menu);
    },

    beforeValidateXml: function() {
        var me = this;
        me.application.fireEvent(Statics.eventsNames.translateRequest, function(xml) {
            me.validateXml(xml);
        });
    },
    
    validateXml : function(xml) {
        var me = this, app = me.application;
        app.fireEvent(Statics.eventsNames.progressStart, null, {
            value : 0.2,
            text : " "
        });
        Ext.Ajax.request({
            url : Utilities.getAjaxUrl(),
            method : 'POST',
            // send the content of the editor
            params : {
                requestedService : "XML_VALIDATION",
                source : xml,
                schema : Config.getLanguageSchemaPath()
            },
            // the scope of the ajax request
            scope : this,
            success : function(result, request) {
                var jsonData = Ext.decode(result.responseText, true);
                if(!jsonData) {
                    jsonData = {
                        decodeError : true
                    };
                }
                me.xmlValidationShowResult(jsonData);
            },
            failure : function() {
            },
            callback : function() {
                app.fireEvent(Statics.eventsNames.progressEnd);
            }
        });
    },

    xmlValidationShowResult : function(data) {
        var me = this, output = "", nums = 0, errorsHtml = "", summaryHtml = "", 
            title = Locale.getString("validateResult", me.getPluginName()), success = false, cfg = {
            fatal_error : {
                listTpl : '<div>'+Locale.getString("validationFatalErrors", me.getPluginName())+' {n}:{items}</div>',
                listItemTpl : '<div style="border-radius: 4px; border: 2px solid black; margin:2px;">{message} - {lineString} at ({line}:{column}) </div>'
            },
            error : {
                listTpl : '<div>'+Locale.getString("validationErrors", me.getPluginName())+' {n}:{items}</div>',
                listItemTpl : '<div style="border-radius: 4px; border: 2px solid #FF0055; margin:2px;">{message} - {lineString} at ({line}:{column}) </div>'
            },
            warning : {
                listTpl : '<div>'+Locale.getString("validationWarnings", me.getPluginName())+' {n}: {items}</div>',
                listItemTpl : '<div style="border-radius: 4px; border: 2px solid #FAD160; margin:2px;">{message} - {lineString} at ({line}:{column}) </div>'
            }
        }, titleCfg = {};
        if (!data.decodeError) {
            if (data.started) {
                Ext.Object.each(cfg, function(name, el) {
                    var tmp = "";
                    if (data[name]) {
                        el.length = data[name].length;
                        Ext.each(data[name], function(obj) {
                            tmp += new Ext.Template(el.listItemTpl).apply(obj);
                        });
                        if (tmp) {
                            output += new Ext.Template(el.listTpl).apply({
                                n : el.length,
                                items : tmp
                            });
                        }
                        nums += el.length;
                    }
                });

                if (!nums) {
                    success = true;
                    output = Locale.getString("validationSuccess", me.getPluginName());
                }
            } else {
                output = Locale.getString("validationProcessError", me.getPluginName())+": " + data.msg;
            }
        }
        this.application.fireEvent(Statics.eventsNames.showNotification, {
            title : title,
            content : output,
            width : (success) ? 200 : 600,
            status : success
        });
    },

    onRemoveController: function() {
        var me = this;
        me.application.removeListener(Statics.eventsNames.afterLoad, me.onDocumentLoaded, me);
    },
    
    init : function() {
        var me = this;
        //Listening progress events
        this.application.on(Statics.eventsNames.afterLoad, this.onDocumentLoaded, this);
    }
});
