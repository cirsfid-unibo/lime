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
 * This view is used for version selection
 */
Ext.define('LIME.view.modal.newSavefile.VersionSelector', {
	extend : 'Ext.form.FieldContainer',
	alias : 'widget.docVersionSelector',
	mixins: {
        field: 'Ext.form.field.Field'
    },
	name : 'docVersion',
	layout: 'hbox',
	width: 190,
	combineErrors: true,
	msgTarget: 'side',
    allowBlank : false,
    
    
    initComponent: function () {
        var me = this;
        if (!me.langCfg) me.langCfg = {};
        if (!me.dateCfg) me.dateCfg = {};
        me.buildField();
        me.callParent();
        me.dateField = me.down('datefield');
        me.langField = me.down('docLangSelector');
        me.langField.on("blur", me.onFieldsBlur, me);
        me.langField.on("specialkey", me.onFieldsSpecialKey, me);
        me.dateField.on("specialkey", me.onFieldsSpecialKey, me);
        me.dateField.on("blur", me.onFieldsBlur, me);
        me.initField();
    },
    
    buildField: function () {
        var me = this;
        me.items = [
        Ext.apply({
            xtype: 'docLangSelector',
            width: 85
        }, me.langCfg),{
            xtype: 'displayfield',
            value: '@'
        },Ext.apply({
            xtype: 'datefield',
            submitValue: false,
            width: 85,
            format: 'Y-m-d'
        }, me.dateCfg)];
    },
    
    getValue: function () {
        var me = this,
            value,
            date = me.dateField.getSubmitValue(),
            dateFormat = me.dateField.format,
            lang = me.langField.getSubmitValue();
        if (lang) {
            date = (date) ? date : "";
            value = lang + "@" + date;
        }
        return (value) ? value : "";
    },
    
    setValue: function (value) {
        var me = this,
            separator = "@", separatorPos;
       if (value) {
            separatorPos = value.indexOf(separator);
            if (separatorPos != -1) {
                me.dateField.setValue(value.substring(separatorPos+1));
                me.langField.setValue(value.substring(0, separatorPos));
            } else {
                me.langField.setValue(value);
            }
        }
    },
    
    getSubmitData: function () {
        var me = this,
            data = null;
        if (!me.disabled && me.submitValue && !me.isFileUpload()) {
            data = {},
            value = me.getValue(),
            data[me.getName()] = '' + value ? Ext.Date.format(value, me.submitFormat) : null;
        }
        return data;
    },
    
    getFormat: function () {
        var me = this;
        return (me.dateField.submitFormat || me.dateField.format);
    },
    
    onFieldsSpecialKey: function(cmp, evt) {
        if (evt.getKey() == evt.ENTER && this.langField.getSubmitValue()) {
            cmp.up('docVersionSelector').fireEvent('blur', evt);
        }
    },
    
    onFieldsBlur: function(cmp, evt, eOps) {
        var extNode;
        if (!evt) {
            return;
        }
        extNode = new Ext.Element(evt.getTarget());
        if (!(extNode.is('.x-form-field') || extNode.is('.x-form-date-trigger')) && this.langField.getSubmitValue()) {
            cmp.up('docVersionSelector').fireEvent('blur', evt, eOps);
        }
    }
}); 
