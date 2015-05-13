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

// Wrapper around the server REST interface.
Ext.define('LIME.Server', {
    singleton: true,
    alternateClassName: 'Server',
    requires: ['Statics', 'Utilities'],

    nodeServer: 'http://sinatra.cirsfid.unibo.it:9008/documentsdb',
    // nodeServer: 'http://localhost:9006',

    // ====================
    // ====== NODE ========
    // ====================

    // Try logging in.
    // Calls success with user object
    login: function (username, password, success, failure) {
        Ext.Ajax.request({
            method: 'GET',
            url: this.nodeServer + '/Users/' + encodeURI(username),
            headers: {
                Authorization: 'Basic ' + Ext.util.Base64.encode(username + ':' + password)
            },
            success: success,
            failure: failure
        });
    },

    // Register user.
    register: function (user, success, failure) {
        Ext.Ajax.request({
            method: 'POST',
            url: this.nodeServer + '/Users',
            jsonData: user,
            success: success,
            failure: failure
        });
    },

    // Update user.
    saveUser: function (user, success, failure) {
        var username = user.username,
            password = user.password;
        Ext.Ajax.request({
            method: 'PUT',
            url: this.nodeServer + '/Users/' + encodeURI(username),
            headers: {
                Authorization: 'Basic ' + Ext.util.Base64.encode(username + ':' + password)
            },
            jsonData: user,
            success: success,
            failure: failure
        });
    },

    // Get file content
    getDocument: function (path, success, failure) {
        var username = User.username,
            password = User.password;

        Ext.Ajax.request({
            method: 'GET',
            url: this.nodeServer + '/Documents' + path,
            headers: {
                Authorization: 'Basic ' + Ext.util.Base64.encode(username + ':' + password)
            },
            success: function (response) {
                success(response.responseText);
            },
            failure: failure
        });
    },

    saveDocument: function (path, content, success, failure) {
        var username = User.username,
            password = User.password;

        Ext.Ajax.request({
            method: 'PUT',
            rawData: content,
            url: this.nodeServer + '/Documents' + path,
            headers: {
                Authorization: 'Basic ' + Ext.util.Base64.encode(username + ':' + password)
            },
            success: function (response) {
                console.info('Saved', path);
                success(response.responseText);
            },
            failure: function (error) {
                console.warn('Saving document failed:', error);
            }
        });
    },


    // ====================
    // ====== PHP =========
    // ====================

    // Transform XML in content with the given xslt path
    applyXslt: function (content, xslt, success, failure, extraConfig) {
        Ext.Ajax.request({
            url: Utilities.getAjaxUrl(),
            method: 'POST',
            params: Ext.merge({
                requestedService: Statics.services.xsltTrasform,
                transformFile: xslt,
                input: content,
                output: '',
                markingLanguage: ''
            }, extraConfig),
            success: function (response) {
                success(response.responseText);
            },
            failure: failure || function (error) {
                Ext.log('XSLT conversion failed', xslt, error);
            }
        });
    },

    // Convert PDF and Doc files to html
    fileToHtml: function (path, success, failure) {
        Ext.Ajax.request({
            url: Utilities.getAjaxUrl(),
            method: 'POST',
            params: {
                requestedService: Statics.services.fileToHtml,
                fileExistPath: path
            },
            success: function (response) {
                try {
                    var res = JSON.parse(response.responseText);
                    console.log(res)
                    if (res.html)
                        success(res.html, res.language);
                    else throw new Error();
                } catch (e) {
                    console.log(e);
                    if (failure) failure (response);
                    else Ext.log('Html conversion failed', path);
                }
            },
            failure: failure || function (error) {
                Ext.log('Html conversion failed', path, error);
            }
        });
    },

    // Export a document from Exist to a url 
    export: function (paths, success, failure) {
        var params = {
            requestedService: 'EXPORT_FILES'
        };

        paths.forEach(function (path, i) {
            params['doc' + (i+1)] = path;
        });

        Ext.Ajax.request({
            url: Utilities.getAjaxUrl(),
            method: 'POST',
            params: params,
            scope: this,
            success: function (result) {
                var jsonData = Ext.decode(result.responseText, true);
                if (jsonData && jsonData.docsUrl) {
                    var urls = [];
                    for (url in jsonData.docsUrl) {
                        urls.push(jsonData.docsUrl[url]);
                    }
                    success(urls)
                } else {
                    console.warn('Error exporting files (Decode error)', result.responseText);
                    if (failure) failure();
                }
            },
            failure: failure || function (error) {
                console.warn('Error exporting files', error);
            }
        });
    },

    // Given a list of urls, return the ones which exist.
    // Parameters:
    // - reqUrls: list of relative urls
    // - content: auto-read response ... 
    // Check (Server-side) which file exist and return them (If 'content' param is set to true)
    // Example reqUrls: [{"name":"patterns","url":"config/Patterns.json"},
    filterUrls: function (reqUrls, content, success, failure, scope) {
        var params = {
            requestedService: Statics.services.filterUrls,
            urls: Ext.encode(reqUrls)
        };
        if(content) {
            params = Ext.merge(params, {content: true});
        }
        Ext.Ajax.request({
            // the url of the web service
            url: Utilities.getAjaxUrl(),
            method: 'POST',
            params: params,
            scope: this,
            success: function (result, request) {
                var newUrls  = Ext.decode(result.responseText, true);
                if (Ext.isFunction (success) && newUrls) {
                    Ext.bind(success, scope)(newUrls);
                } else if(Ext.isFunction (failure)) {
                    Ext.bind(failure, scope)(reqUrls);
                }
            },
            failure: function () {
                if (Ext.isFunction (failure)) {
                    Ext.bind(failure, scope)(reqUrls);
                }
            }
        });
    },

    // Execute callback on the resource file found on path for the
    // given package name.
    // We must detect whether we're in a build environment or a dev one.
    getResourceFile: function (file, packageName, success, failure) {
        var possiblePaths = [{
            name: 'dev',
            url: 'packages/' + packageName + '/resources/' + file // Dev mode
        }, {
            name: 'build',
            url: 'resources/' + packageName + '/' + file // Build mode
        }];

        this.filterUrls(possiblePaths, true, function (possiblePaths) {
            if ( possiblePaths.length )
                success(possiblePaths[0].url, possiblePaths[0].content);
        }, failure, this);
    }
});
