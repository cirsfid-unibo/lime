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
 * This view is used to upload files from the user's hard drive.
 * NOTE: This view should NEVER be instantiated.
 * Extend it instead and set the properties consistently.
 * 
 * This view fires an event when the upload is complete.
 * 
 * When the upload is complete there are two
 */

Ext.define('LIME.view.modal.Uploader', {

    extend : 'Ext.window.Window',

    // set the alias
    alias : 'widget.uploader',
    
    requires : ['Ext.ux.upload.Button', 'Ext.ux.upload.plugin.Uploader'],

    layout : {
        type : 'vbox',
        align: 'center'
    },
    
    closeAction: 'destroy',

    border : false,

    modal : true,
    
    icon : 'resources/images/icons/import-icon.png',
    
    /**
     * @event uploadEnd
     * Fired when the upload of the file is complete
     */
    
    /**
     * @config {String}
     * The url to the service that implements file uploading 
     */
    uploadUrl : null,
    
    /**
     * @config {Object} 
     */
    uploadParams : {},
    
    /**
     * Dinamically set properties for this view.
     * NOTE: only the following properties can be set (other than the ones provided by ExtJS)
     * - fieldLabel
     * - fieldLabelWidth
     * - buttonSelectLabel
     * - buttonSubmitLabel
     * - dragDropLabel
     * @param {Object} The properties that have to be changed.
     */
    setViewProperties : function(properties, render){
        var properties = properties || {},
            fieldLabel = properties.fieldLabel || this.fieldLabel || 'File',
            buttonSelectLabel = properties.buttonSelectLabel || this.buttonSelectLabel || 'Select File...',
            buttonSubmitLabel = properties.buttonSubmitLabel || this.buttonSubmitLabel || 'Upload',
            dragDropLabel = properties.dragDropLabel || this.dragDropLabel || 'Drop your file here',
            uploader = this, items;
            
           // Set the request details
           this.uploadUrl = properties.uploadUrl || this.uploadUrl;
           this.uploadParams = properties.uploadParams || this.uploadParams;
           
           items = [{
               xtype: 'uploadbutton',
               id: 'uploadbutton',
               text: buttonSubmitLabel,
               height : 50,
               margin : '10px 0 10px 0',
               plugins: [{
                      ptype: 'ux.upload.uploader',
                      mainUploader: uploader // The plugin contains the events' callbacks configurations
                  }
               ],
               mainUploader: uploader,
               finishEvent: 'uploadEnd',
               errorEvent : 'uploadError',
               uploader: 
               {
                    url: this.uploadUrl,
                    multipart_params: this.uploadParams,
                    autoStart: true,
                    max_file_size: '2020mb',            
                    drop_element: 'dropArea',
                    statusQueuedText: 'Ready to upload',
                    statusUploadingText: 'Uploading ({0}%)',
                    statusFailedText: '<span style="color: red">Error</span>',
                    statusDoneText: '<span style="color: green">Complete</span>',
        
                    statusInvalidSizeText: 'File too large',
                    statusInvalidExtensionText: 'Invalid file type'
               }
           },
           {
                xtype : 'panel',
                id : 'dropArea',
                minHeight : 200,
                frame : true,
                style : {
                    border : '2px dashed #99BCE8',
                    marginTop : '5px',
                    marginLeft : '0px',
                    marginRight : '0px'
                },
                layout: {
                    type : 'hbox',
                    align : 'middle',
                    pack : 'center'
                },
                items : [{
                    xtype : 'panel',
                    frame : true,
                    style : {
                        border : '0px'
                    },
                    html : dragDropLabel
                }]
            }];
            
            // Empty the view and add the new items
            this.removeAll();
            this.add(items);
            
            // Check if the view must be updated
            if (render){
                this.update();
            }
    },

    listeners : {
        beforerender : function(){
            // By default the properties are the ones specified during the declaration
            this.setViewProperties();
            
            // If IE < 10 don't show the drag and drop panel (no dataTransfer.files)
            if (Ext.isIE9){
                this.down('#dropArea').hide();
            }
        },
        afterrender: function(cmp) {
        	var uploadButton = cmp.down('uploadbutton');
        	// Positioning the hidden uploader button
        	Ext.defer(function() {
            	uploadButton.uploader.uploader.refresh();         
	        }, 300, this);
        }
    }

});
