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
 * This is a simple iframe plugin
 * To include this plugin you need to require:
 * "Ext.ux.Iframe"
 * and include it by ptype that is "iframe"
 */

Ext.define('Ext.ux.Iframe', {
    extend: 'Ext.AbstractPlugin',
    
    alias: 'plugin.iframe',
    
    src : "",
    
    loadingHtml : '<div id="loading" style="text-align:center"><img style="position: absolute;top: 50%; left: 50%;" src="resources/images/icons/loading.gif"/></div>',
    
    init: function() {
        this.callParent(arguments);
        this.cmp.tpl = new Ext.Template([
            '<iframe width="100%" seamless frameborder="0" height="100%" src="{url}">',
            '</iframe>'
        ]); 
        this.setSrc(this.src);
    },
    /**
     * This function set the url of pdf to view
     * @param {String} url The url of pdf to view
     */
    setSrc : function(url){
        if(url && (!this.url || url!=this.url)){
            this.cmp.update({url:url});
            this.url = url;
        }
    },
    
    setRawSrc: function(url, callback) {
        var iframe = this.getIframe(),
            onLoad = function() {
                iframe.removeEventListener( 'load', onLoad );
                callback(this.contentDocument);
            };
        if(url){
            if(Ext.isFunction(callback)) {
                iframe = this.getIframe();
                if(iframe) {
                    iframe.addEventListener( 'load', onLoad );    
                }
            }
            iframe.setAttribute("src", url);
            this.url = url;
        }
    },
    
    getIframe: function() {
        return this.cmp.body.down("iframe", true);
    },
    
    getIfameDoc: function() {
        var iframe = this.getIframe(), iframeDoc;
        if (iframe) {
            iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        }
        return iframeDoc;
    },
    
    setLoading : function() {
        var iframe = this.getIframe();
        if (iframe && iframe.doc) {
            iframe.doc.body.innerHTML = this.loadingHtml;
        }
    },
    
    addCssLink: function(url) {
        var me = this, iframe = this.getIframe(), cssLink,
            addCss = function() {
                var iframeDoc = me.getIfameDoc();
                cssLink = iframeDoc.createElement("link");
                cssLink.href = url; 
                cssLink.rel = "stylesheet"; 
                cssLink.type = "text/css";
                iframeDoc.head.appendChild(cssLink);
            };
        if (iframe) {
            iframe.onload = addCss;
            addCss();
        }
    }

});