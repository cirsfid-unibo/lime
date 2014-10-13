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
 * This is a simple controller that manages the upload process. 
 * 
 */

Ext.define('LIME.controller.DocumentUploader', {
    extend : 'Ext.app.Controller',
    // set the references for this controller
    views : ['modal.Uploader'],
    
    refs : [{
        ref : 'uploader',
        selector : 'uploader'
    }],
    
    /**
     * This dispatcher uses HTML5 File API and performs
     * different operations according to the type of file.
     * @param {File} file The file object 
     */
    fileDispatcher : function(file, request, callback, scope){
        // Distinguish the type of the given file
        switch (file.type){
            
            // Text group
            case 'text/plain':
            case 'text/html':
                var fr = new FileReader(),
                    controller = this;
                
                // Set the callback called once the file has been completely read
                fr.onload = function(evt){
                    
                    // TODO Call the service to convert file to html (give a content, get a content)
                    var fileContent = evt.target.result;
                    Ext.callback(callback, scope, [fileContent, request]);
                };
                
                // Try to read the file
                fr.readAsText(file);
                break;
            
            // Unsupported formats
            default :
                Ext.Msg.alert(Locale.strings.error, Locale.strings.typeNotSupported);
                break;
        }  
    },
    
    
    /**
     * This function gets a File object and sets the editor's content
     * consistently with the type.
     * @param {File/String} file The file to manipulate
     */
    uploadCallback : function(content, request, callback, scope){
        if (Ext.isString(content)){
            //this.textDispatcher(content, request, callback);
            Ext.callback(callback, scope, [content, request]);        
        } else {
            this.fileDispatcher(content, request, callback, scope);
        }
    },
    
    init : function() {
        var app = this.application;
        this.control({
            'uploader' : {
                    uploadEnd : function(content, request){
                        var uploaderController = this,
                            uploader = this.getUploader();
                        // Ensure not to pass a null file reference
                        if (content) {
                            uploaderController.uploadCallback(content, request, uploader.uploadCallback, uploader.callbackScope);
                            uploader.close();
                        }

                    },
                    close: function(cmp) {
                        cmp.down('uploadbutton').uploader.uploader.destroy();
                    }
            },
            'uploader uploadbutton': {
                beforeupload: function() {
                    var uploader = this.getUploader();
                    app.fireEvent(Statics.eventsNames.progressStart, null, {value:0.5, text: Locale.strings.progressBar.loadingDocument});
                },
                uploadcomplete: function() {
                    app.fireEvent(Statics.eventsNames.progressEnd);
                },
                uploaderror: function(cmp, status) {
                    var msg = status.file.content;
                    if (!msg || (msg !== undefined && msg.length == 0)) {
                        msg = Locale.strings.uploadError; 
                    }
                    Ext.Msg.alert(Locale.strings.error, msg); 
                }
            }
        });
    }
}); 
