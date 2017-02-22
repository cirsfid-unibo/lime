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
    requires: [
        'Statics'
    ],

    config: {
        nodeServer : null
    },

    constructor: function() {
        this.initConfig();
    },

    // Like Ext.Ajax.request, but delayed until we've loaded server config.
    // Replaces {nodeServer} in config.url
    request: function (config) {
        var me = this;
        if (!me.getNodeServer())
            return console.error('Server is not configurated yet!');

        config.url = config.url.replace('{nodeServer}', me.getNodeServer());
        Ext.Ajax.request(config);
    },

    // Request with authorization headers
    authRequest: function (config) {
        var auth = Ext.util.Base64.encode(User.username + ':' + User.password);
        config.headers = config.headers || {};
        config.headers.Authorization = 'Basic ' + auth;
        this.request(config);
    },

    // Execute callback on the resource file found on path for the
    // given package name.
    // We must detect whether we're in a build environment or a dev one.
    getResourceFile: function (file, packageName, success, failure) {
        this.resources = this.resources || {};
        this.resources[packageName] = this.resources[packageName] || {};
        var cacheResources = this.resources[packageName];
        if ( cacheResources[file] ) {
            success(cacheResources[file].url, cacheResources[file].content);
            return;
        }

        var possiblePaths = [];
        
        if (Ext.manifest['env'] === 'development') {
            possiblePaths.push({
                name: 'dev',
                url: 'packages/' + packageName + '/resources/' + file // Dev mode
            });
        } else {
            possiblePaths.push({
                name: 'build',
                url: 'resources/' + packageName + '/' + file // Build mode
            });
        }

        this.filterUrls(possiblePaths, true, function(possiblePaths) {
            if ( possiblePaths.length ) {
                success(possiblePaths[0].url, possiblePaths[0].content);
                this.resources[packageName][file] = {
                    url: possiblePaths[0].url,
                    content: possiblePaths[0].content
                };
            }
        }, failure, this);
    },

    // Given a list of urls, return the ones which exist.
    // Parameters:
    // - reqUrls: list of relative urls
    // - content: auto-read response ...
    // Check (Server-side) which file exist and return them (If 'content' param is set to true)
    // Example reqUrls: [{"name":"patterns","url":"config/Patterns.json"},
    // TODO: using OPTIONS method when content is set to false
    filterUrls: function (reqUrls, content, success, failure, scope) {
        var me = this;
        var newUrls = [];
        var makeRequest = function(urlObj, cb) {
            me.request({
                url: urlObj.url,
                success: function (result) {
                    var content = result.responseText;
                    if (content) {
                        var json = Ext.decode(content, true);
                        urlObj.content = json || content;
                        newUrls.push(urlObj);
                    }
                },
                callback: cb
            });
        };
        var index = 0;
        var finish = function(urls) {
            if (Ext.isFunction (success) && urls.length) {
                Ext.bind(success, scope)(urls);
            } else if(Ext.isFunction (failure)) {
                Ext.bind(failure, scope)([]);
            }
        }
        var goNext = function() {
            if (index < reqUrls.length) {
                makeRequest(reqUrls[index++], goNext);
            } else {
                finish(newUrls);
            }
        }
        goNext();
    },


    // ====================
    // ====== NODE ========
    // ====================

    // Try logging in.
    // Calls success with user object
    login: function (username, password, success, failure) {
        this.request({
            method: 'GET',
            url: '{nodeServer}/documentsdb/Users/' + encodeURI(username),
            headers: {
                Authorization: 'Basic ' + Ext.util.Base64.encode(username + ':' + password)
            },
            success: success,
            failure: failure
        });
    },

    // Register user.
    register: function (user, success, failure) {
        this.request({
            method: 'POST',
            url: '{nodeServer}/documentsdb/Users',
            jsonData: user,
            success: success,
            failure: failure
        });
    },

    // Update user.
    saveUser: function (user, success, failure) {
        var username = user.username,
            password = user.password;
        console.log('username', user.username, user.password);
        this.authRequest({
            method: 'PUT',
            url: '{nodeServer}/documentsdb/Users/' + encodeURI(username),
            jsonData: user,
            success: success,
            failure: failure
        });
    },

    // Get file content
    getDocument: function (path, success, failure) {
        var username = User.username,
            password = User.password;

        this.authRequest({
            method: 'GET',
            url: '{nodeServer}/documentsdb/Documents' + path,
            success: function (response) {
                success(response.responseText);
            },
            failure: failure
        });
    },

    // Call Server.getDocument on every document in the list.
    getAllDocuments: function (paths, success, failure) {
        failure = failure || function () {
            console.warn('Could not get documents', paths);
        };
        var results = {};
        paths.forEach(function (path) {
            Server.getDocument(path, function (result) {
                results[path] = result;
                if (Object.keys(results).length == paths.length) {
                    success(paths.map(function (path) {
                        return results[path];
                    }));
                }
            }, function () {
                failure();
            });
        });
    },

    // Convert PDF and Doc files to html
    fileToHtml: function (path, success, failure) {
        this.authRequest({
            method: 'GET',
            url: '{nodeServer}/documentsdb/Documents' + path,
            headers: {
                Accept: 'text/html'
            },
            success: function (response) {
                var html = DomUtils.normalizeBr(response.responseText);
                success(html);
            },
            failure: failure
        });
    },

    saveDocument: function (path, content, success, failure) {
        this.authRequest({
            method: 'PUT',
            rawData: content,
            url: '{nodeServer}/documentsdb/Documents' + path,
            success: function (response) {
                console.info('Saved', path);
                success(response.responseText);
            },
            failure: function (error) {
                console.warn('Saving document failed:', error);
            }
        });
    },

    // Export a document to a url accessible to everyone
    exportDocument: function (path, success, failure) {
        var me = this;
        this.authRequest({
            method: 'POST',
            url: '{nodeServer}/documentsdb/Export?url=' + path,
            success: function (response) {
                var url;
                try {
                    url = JSON.parse(response.responseText).url;
                    url = me.getNodeServer() + url.substring(url.indexOf('/documentsdb/'));
                } catch (e) {
                    console.warn('Error exporting file');
                    console.warn(response.responseText);
                    if (failure) failure();
                }
                if (url) success(url);
            },
            failure: failure || function (error) {
                console.warn('Error exporting file', error);
            }
        });
    },

    deleteDocument: function(path, success, failure) {
        this.authRequest({
            method: 'DELETE',
            url: '{nodeServer}/documentsdb/Documents' + path,
            success: function (response) {
                console.info('deleted', path);
                success(response.responseText);
            },
            failure: failure
        });
    },

    applyXslt: function (content, xslt, success, failure, extraConfig) {
        var params = Ext.merge({
                source: content,
                output: '',
                includeFiles: []
        }, extraConfig);

        var urlMap = function(path) {
            return path.startsWith('http') ? path : Config.getAppUrl() + path;
        };
        params.includeFiles = params.includeFiles.map(urlMap);
        params.transformFiles = [].concat(xslt).map(urlMap);
        this.request({
            url: '{nodeServer}/xml/XsltTransform',
            method: 'POST',
            jsonData: params,
            success: function (response) {
                success(response.responseText);
            },
            failure: function (response) {
                Ext.log('XSLT conversion failed', xslt, response);
                if (failure) {
                    failure(response.statusText+': '+response.responseText);
                }
            }
        });
    }
});
