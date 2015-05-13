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

Ext.define('DefaultNir.NirUtils', {
    singleton : true,
    alternateClassName : 'NirUtils',
    
    nirToHtml: function(content, callback) {
        var me = this;

        switch(me.getNirNamespace(content)) {
            case 'http://www.normeinrete.it/nir/1.0':
            me.nir1ToNir2(content, function(nir) {
                me.nir2ToNir22(nir, function(nir) {
                    me.nir22ToAkn(nir, function(akn) {
                        me.aknToHtml(akn, callback);
                    });
                });
            });
            break;
            case 'http://www.normeinrete.it/nir/2.0':
            me.nir2ToNir22(content, function(nir) {
                me.nir22ToAkn(nir, function(akn) {
                    me.aknToHtml(akn, callback);
                });
            });
            break;
            case 'http://www.normeinrete.it/nir/2.2':
            me.nir22ToAkn(content, function(akn) {
                me.aknToHtml(akn, callback);
            });
            break;
            default:
                throw('Not expected NIR namespace.');
        }
    },

    aknToHtml: function(content, callback) {
        var akn2html = Config.getLanguageTransformationFile("languageToLIME", 'akoma3.0');
        Server.applyXslt(content, akn2html, function (html) {
            Ext.callback(callback, null, [html]);
        });
    },

    nir22ToAkn: function(content, callback) {
        this.applyXslt('NirToAkn.xsl', content, callback);
    },

    nir1ToNir2: function(content, callback) {
        this.applyXslt('Nir1XToNir20.xsl', content, callback);
    },

    nir2ToNir22: function(content, callback) {
        this.applyXslt('Nir20ToNir22.xsl', content, callback);
    },

    applyXslt: function(path, content, callback) {
        Server.getResourceFile(path, 'default-nir', function (path) {
            Server.applyXslt(content, path, function (xml) {
                Ext.callback(callback, null, [xml]);
            });
        });
    },

    isNirContent: function(content) {
        return content.indexOf('http://www.normeinrete.it/nir/') != -1;
    },

    getNirNamespace: function(content) {
        try {
            return content.match("xmlns=\"(http://www.normeinrete.it/nir/\\d.\\d)/?\"")[1];
        } catch (e) {
            console.log('Error: getNirNamespace', e);
            console.log(content);
        }
    },

    confirmAknTranslation: function (cb, ncb) {
        Ext.Msg.show({
            title: Locale.getString('confirmAknTranslationTitle', 'default-nir'), 
            msg: Locale.getString('confirmAknTranslationQuestion', 'default-nir'),
            buttons: Ext.Msg.YESNOCANCEL,
            closable: false,
            fn: function(btn) {
                if (btn == 'yes'){
                    cb();
                } else {
                    ncb();
                }
            }
        });
    }

});
