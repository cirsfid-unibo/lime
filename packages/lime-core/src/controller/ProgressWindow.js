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
 * This controller manages the progress window.
 *  */

Ext.define('LIME.controller.ProgressWindow', {
    extend : 'Ext.app.Controller',
    // set the references for this controller
    views : ['ProgressWindow'],
    
    refs : [{
        // the open document button
        selector : 'progressWindow',
        ref : 'progressWindow'
    }],
    
    progressStep: 0.05,
    
    //TODO: remove start only update
    
    /**
     * This function starts a progress bar window
     * @param {String} [title] The title of window 
     * @param {Object} [progress] Init progress of the bar with value and text
     */
    progressStart: function(title, progress) {
       var progressWindow = this.getProgressWindow();
       
       //Set the passed title to the window
       if (title && Ext.isString(title)) {
           progressWindow.setTitle(title);
       }
       //Se the passed progress or empty progress
       if (!(progress && progress.value && progress.text)) {
           this.progressRawUpdate(0, Ext.emptyString, false);
       } else {
           this.progressRawUpdate(progress.value, progress.text);
       }
       progressWindow.show();
    },
    
    /**
     * Update the opened progress bar
     * @param {Number} value New value to set
     * @param {String} text New text of the progress
     * @param {Boolean} animation
     */
    progressRawUpdate: function(value, text, animation) {
        var progressWindow = this.getProgressWindow(),
            progressBar = progressWindow.down("progressbar");
            
        progressBar.updateProgress(value, (Ext.isString(text)) ? text : null, animation);
    },
    
    progressUpdate: function(text) {
        var progressWindow = this.getProgressWindow(),
            progressBar = progressWindow.down("progressbar");

        this.progressRawUpdate(progressBar.value+this.progressStep, text, true);
    },
    
    /**
     * Ends the started progress 
     */
    progressEnd: function() {
        var progressWindow = this.getProgressWindow(),
            progressBar = progressWindow.down("progressbar");
            
        progressWindow.hide();
    },
    
    init : function() {
        //Listening progress events
        this.application.on(Statics.eventsNames.progressStart, this.progressStart, this);
        this.application.on(Statics.eventsNames.progressUpdate, this.progressUpdate, this);
        this.application.on(Statics.eventsNames.progressEnd, this.progressEnd, this);
    }
}); 
