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
 * This is implementation of widget for Marking Menu
 */
Ext.define('LIME.view.markingmenu.menuwidgets.MenuWidget', {
	extend : 'Ext.form.Panel',
	alias : 'widget.menuWidget',
	collapsible : true,
	frame : true,
	fieldDefaults : {
		msgTarget : 'side',
		labelWidth : 30
	},
	tools : [{
		type : 'search',
		hidden:true,
		tooltip : 'Try to recognize automatically'
	}],
	defaults : {
		anchor : '100%'
	},
	margin:"4 0 0 0",
	
	/**
	 *Set content of this widget from HTMLElement identified by elementId or from content variable 
	 * @param {String} elementId
	 * @param {String} [content]
	 */
	setContent : function(elementId, content) {
		var textField,
            fields = this.query('textfield'),
            attributes = this.attributes,
		    value;
		if(content) {
		    textField = this.down('textfield'),
		    value = content;
		    this.setFieldValue(textField, value);
		} else {
		    Ext.each(fields, function(field) {
		        var value = DocProperties.markedElements[elementId].htmlElement.getAttribute(field.name);
		        if (value) {
                    this.setFieldValue(field, value);    
		        }
		    }, this);
		    if (attributes) {
                Ext.Object.each(attributes, function(attribute, obj) {
                    var value, values;
                    if (obj.tpl && obj.separator) {
                        var tpl = new Ext.Template(obj.tpl),
                            tplValues = tpl.html.match(tpl.re);
                        value = DocProperties.markedElements[elementId].htmlElement.getAttribute(obj.name);
                        if(Ext.String.startsWith(value, obj.separator)) {
                            value = value.substring(obj.separator.length);
                        }
                        if (value) {
                            values = value.split(obj.separator);
                            for(var i=0; i<tplValues.length; i++) {
                                var key = tplValues[i].substring(1, tplValues[i].length-1),
                                    field = this.getFieldByOrigName(key);
                                if(field && values[i]) {
                                    this.setFieldValue(field, values[i]);    
                                }
                            }       
                        }
                    }
                }, this);
            }
		}
		this.setAttributes();
	},
	
	getFieldByOrigName: function(name) {
	    return this.query('textfield[origName='+name+']')[0];   
	},
	
	setFieldValue: function(field, value) {
	    if (value) {
            if (field.name == 'date') {
                value = new Date(value.replace(/-/g, '/'));
            }
            field.setValue(value);
            this.updateData(field, value);
        }
	},
	
	updateData: function(field, value, updateAttributes) {
	    var originalName = field.origName;
	    //check if field is a date and convert to the ISO format
	    if (Ext.isDate(value)) {
	        var newDate = Utilities.toISOString(value);
            //get only the date without time
            newDate = newDate.substr(0, newDate.indexOf("T"));
            value = newDate;
	    }
	    this.ownData = this.ownData || {};
	    this.ownData[originalName] = value || "";
	    if (updateAttributes) {
	        this.setAttributes();
	    }
	},
	
	setAttributes: function() {
        var attributes = this.attributes,
            result = []; 
        if (attributes) {
            this.ownData = this.ownData || {};
            this.templates = this.templates || {};
            Ext.Object.each(attributes, function(attribute, obj) {
                this.templates[obj.name] = this.templates[obj.name] || new Ext.Template(obj.tpl);
                result.push({name: obj.name, value: this.templates[obj.name].apply(this.ownData)});
            }, this);
        }
        if (result.length) {
            this.fireEvent("changedAttributes", {id:this.id, attributes:result});    
        }
	}
	
});
