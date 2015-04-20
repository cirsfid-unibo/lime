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
 *This store is used for loading all .json configuration files.
 */
Ext.define('LIME.store.LanguagesPlugin', {
    extend : 'Ext.data.Store',

    autoLoad : false,

    model : 'LIME.model.Json',

    /* Directories structure */
    baseDirectories : {
        plugins : Config.pluginBaseDir,
        global : "config"
    },
    
    styleFile: 'content.css',
    
    /**
     * @property {Object} lastConfiguration
     * This object contains the last configuration of plugins
     * @private
     */
    lastConfiguration : {
        docType : null,
        docLocale : null,
        loaded : false
    },

    /* TODO This directory structure has to be read from a web service! */
    languagePlugin : {
        languageRoot : new Ext.Template('{lang}/interface'),
        subDirs : {
            docType : '',
            locale : '',
            language : Locale.getLang()
        }
    },
    
    languagePluginDefault : {
        languageRoot : new Ext.Template('{lang}/interface/default'),
        language : Locale.getLang() 
    },

    /* File names */
    requiredFiles : {
        'global' : {
            'patterns' : 'Patterns.json'
        },
        'plugins' : [{
            'markupMenu' : 'markupMenu.json',
            'markupMenuRules' : 'markupMenu_rules.json'
        }, {
            'markupMenu' : 'custom_buttons.json',
            'patterns' : 'custom_patterns.json'
        },{
        	'viewConfigs' : 'viewConfigs.json'
        },{
            'semanticRules' : 'semantic/semantic_rules.json'
        }]
    },

    /* Initially empty, loaded dinamically */
    dataObjects : {},
    
    /**
     * Loader for requests events.
     * WARNING: ensure that the scope of this function is "this" (the controller that implements it)
     * @private
     */
    requestLoader : function(id, reqUrls) {
        var app = this.app;
        this.load({
            url : reqUrls[id].url,
            scope : this,
            callback : function(records, operation, success) {
                var evtPrefix = 'makeRequest';
                if (success && (operation.response.responseText != "")) {
                    var fileName = reqUrls[id].name,
                        level = reqUrls[id].level;
                    if (fileName == "viewConfigs") {
                    	//Just replace the content don't merge as others
                    	this.dataObjects[fileName] = records[0].raw;
                    } else {
                        if (!this.dataObjects[level]) {
                            this.dataObjects[level] = {};
                        }
                        this.dataObjects[level][fileName] = Utilities.mergeJson(this.dataObjects[level][fileName], records[0].raw, Utilities.beforeMerge);
                        if (fileName != 'markupMenu') {
                            this.dataObjects[fileName] = Utilities.mergeJson(this.dataObjects[fileName], records[0].raw, Utilities.beforeMerge);
                        }
                    }
                }
                if (id == reqUrls.length - 1) {
                    /* Fire the event only if this is the last url to scan */
                    this.fireEvent('filesloaded', this.dataObjects);
                    this.lastConfiguration.loaded = true;
                } else {
                    /* Either the call was successful or not fire the next request */
                    var eventName = evtPrefix + (id + 1);
                    this.fireEvent(eventName, id + 1, reqUrls);
                }
                app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.configurationFiles);
                // this.removeListener(evtPrefix+id, this.requestLoader, this);
            }
        });
    },
    
    requestSyncLoader: function(reqObjects) {
        var me = this, app = this.app;
        Ext.each(reqObjects, function(obj) {
            var fileName = obj.name,
                level = obj.level;
            if (fileName == "viewConfigs") {
                //Just replace the content don't merge as others
                me.dataObjects[fileName] = obj.content;
            } else {
                if (!me.dataObjects[level]) {
                    me.dataObjects[level] = {};
                }
                me.dataObjects[level][fileName] = Utilities.mergeJson(me.dataObjects[level][fileName], obj.content, Utilities.beforeMerge);
                if (fileName != 'markupMenu') {
                    me.dataObjects[fileName] = Utilities.mergeJson(me.dataObjects[fileName], obj.content, Utilities.beforeMerge);
                }
            }
        });
            
        me.fireEvent('filesloaded', me.dataObjects, me.styleUrls.map(function(el) {return el.url;}));
        me.lastConfiguration.loaded = true;
        app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.configurationFiles);
    },

    /**
     * This function merges all the different languagePlugins files
     * and stores a complete configuration in this store. Several
     * AJAX requests have to be made in order to get all the interested
     * files and for each of them the url has to be changed according to
     * the directory structure. This function is event based and simulate
     * a series of synchronous requests (because order matters!).
     */
    loadPluginData : function(app, docType, docLocale) {
        var me = this;
        /**
         * If the last loaded configuration is the same of the passed configuration 
         * all files is already loaded
         */
        if (this.lastConfiguration.markingLanguage == Config.getLanguage() && this.lastConfiguration.loaded && this.lastConfiguration.docType == docType && this.lastConfiguration.docLocale == docLocale) {
            this.fireEvent('filesloaded', this.dataObjects);
            return;
        }
        
        /* For each directory retrieve all the needed json files starting from the languageRoot */
        var languagesPlugins = this;
        var directoriesList = this.languagePlugin.subDirs;
        var directoriesListDefault = Ext.clone(this.languagePluginDefault);
        directoriesListDefault.languageRoot = directoriesListDefault.languageRoot.apply({lang: Config.getLanguage()});
        var currentDirectory = this.baseDirectories['plugins']+'/'+this.languagePlugin.languageRoot.apply({lang: Config.getLanguage()});
        var currentDirectoryDefault = this.baseDirectories['plugins'];
        /* Build a list of urls to make the requests to */
        var reqUrls = [];
        var globalFiles = this.requiredFiles['global'];
        var pluginsFiles = this.requiredFiles['plugins'];
        var globalDir = this.baseDirectories['global'];
        for (var file in globalFiles) {
        	var reqUrl = globalDir + '/' + globalFiles[file];
            var reqObject = {
                name : file,
                url : reqUrl,
                level: 'global'
            };
            reqUrls.push(reqObject);
        }
        this.app = app;
        this.dataObjects = {};
        app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.configurationFiles);
        this.lastConfiguration = {
            docType : docType,
            docLocale : docLocale,
            loaded : false,
            markingLanguage: Config.getLanguage()
        };
        
        var styleUrls = [];
        
        for (var directory in directoriesListDefault) {
            var newDir = directoriesListDefault[directory];
            currentDirectoryDefault += '/' + newDir;
            styleUrls.push({url: currentDirectoryDefault+"/"+me.styleFile});
            for (var files in pluginsFiles) {
                for (var file in pluginsFiles[files]) {
                    var reqUrl = currentDirectoryDefault + '/' + pluginsFiles[files][file];
                    var reqObject = {
                        name : file,
                        url : reqUrl,
                        level: 'defaults'
                    };
                    reqUrls.push(reqObject);
                }
            }
        }
        
        for (var directory in directoriesList) {
            var newDir = directoriesList[directory];
            if (directory == "locale") {
                newDir = docLocale;
            } else if (directory == "docType") {
                newDir = docType;
            }
            currentDirectory += '/' + newDir;
            styleUrls.push({url: currentDirectory+"/"+me.styleFile});
            for (var files in pluginsFiles) {
                for (var file in pluginsFiles[files]) {
                    var reqUrl = currentDirectory + '/' + pluginsFiles[files][file];
                    var reqObject = {
                        name : file,
                        url : reqUrl,
                        level: directory
                    };
                    reqUrls.push(reqObject);
                }
            }
        }
        me.reqUrls = reqUrls;
        Server.filterUrls(styleUrls, false, me.setStyleAndRequestFiles, me.setStyleAndRequestFiles, me);
    },
    
    setStyleAndRequestFiles: function(styleUrls) {
        var me = this;
        me.styleUrls = styleUrls;
        Server.filterUrls(me.reqUrls, true, me.requestSyncLoader, function(reqUrls) {
            for (objIndex in reqUrls) {
                /* Add a lister that waits for the given key file to be loaded */
                var eventName = 'makeRequest' + objIndex;
                me.addListener(eventName, languagesPlugins.requestLoader, me);
            }
            
            /* Start the requests from the first file */
            me.fireEvent('makeRequest0', 0, reqUrls);
        }, me);
    }, 
    
    /**
     * This function returns the already retrieved data in a raw format.
     * NOTICE: This function DOES NOT check if the data is already available in the store!
     * @returns {Object}
     */
    getConfigData : function() {
        return this.dataObjects;
    }
});
