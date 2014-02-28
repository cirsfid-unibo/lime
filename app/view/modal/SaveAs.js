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
 * This view is used as an interface to allow the user to register.
 */

Ext.define('LIME.view.modal.SaveAs', {

    extend : 'Ext.window.Window',
    
    requires : ['LIME.view.generic.MetadataForm'], 

    alias : 'widget.saveAs',

    layout : 'auto',
    
    startSaveEvent: 'startSaveAs',
    
    draggable : true,

    border : false,
    
    modal : true,
    
    width : 250,
    
    /**
     * The groups that have to be hidden
     * @cfg toHide
     * @type {Array} 
     */
    toHide : [],
    
    constructor : function(cfg){
        // Hide unused fieldsets
        this.initConfig(cfg);
        this.callParent(arguments);
    },
    
    /**
     * Hide the groups with the given classes
     * @param {Array} toHide The classes of the groups to hide
     */
    hideGroups : function(toHide){
        var current;
        if (toHide){
            for (var i = 0; i < toHide.length; i++){
                current = this.down('*[cls='+toHide[i]+']');
                current.hide();
            }
        }
    },
    
    /**
     * Hide the groups with the given classes
     * @param {Array} toShow The classes of the groups to show 
     */
    showGroups : function(toShow){
        var current;
        if (toShow){
            for (var i = 0; i < toShow.length; i++){
                current = this.down('*[cls='+toShow[i]+']');
                current.show();
            }
        }
    },
    
    listeners : {
        afterrender : function(cmp){
            cmp.hideGroups(cmp.toHide);
        }
    },
    
    /**
     * Return the data set in the view
     * @return {Object} An object containing the key-value pairs in the form
     */
    getData : function(){
        var classes = ['work', 'expression', 'manifestation'];
        var values = null;
        var currentForm;
        
        for (var i = 0; i < classes.length; i++){
            currentForm = this.down('[cls='+classes[i]+']').down('form').getForm();
            if (currentForm.isValid()){
                values = values || {};
                values[classes[i]] = currentForm.getValues(false, false, false, true);
            }
        }
        
        return values;
    },
    
    items : [{
        xtype : 'fieldset',
        title : 'Work',
        cls : 'work',
        items : [{
            xtype : 'metadataForm',
            type : 'work'
        }],
        collapsible : true
    }, {
        xtype : 'fieldset',
        title : 'Version',
        cls : 'expression',
        items : [{
            xtype : 'metadataForm',
            type : 'expression'
        }],
        collapsible : true
    }, {
        xtype : 'fieldset',
        title : 'File',
        cls : 'manifestation',
        items : [{
            xtype : 'metadataForm',
            type : 'manifestation'
        }],
        collapsible : true
    }],   

    
    initComponent: function(){
        this.title = Locale.strings.saveAsMenuLabel,
        this.dockedItems = [{
            xtype : 'toolbar',
            dock : 'bottom',
            ui : 'footer',
    
            items : ['->', 
            {
                xtype : 'button',
                minWidth : 100,
                text : Locale.strings.saveDocumentButtonLabel
            }]
        }],
        this.callParent(arguments);
    }
}); 
