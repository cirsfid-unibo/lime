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

    dataObjects : {},

    requestSyncLoader: function(callback, reqObjects) {
        var me = this, app = this.app;
        var languageBundle = Config.getLanguageBundle();
        Ext.each(reqObjects, function(obj) {
            obj.content = languageBundle[obj.url];
            me.dataObjects[obj.name] = Utilities.mergeJson(me.dataObjects[obj.name], obj.content, Utilities.beforeMerge);
        });

        me.lastConfiguration.loaded = true;
        app.fireEvent(Statics.eventsNames.progressUpdate, Locale.strings.progressBar.configurationFiles);
        callback(me.dataObjects, me.styleUrls.map(function(el) {return el.url;}));
    },

    /**
     * This function merges all the different languagePlugins files
     * and stores a complete configuration in this store. Several
     * AJAX requests have to be made in order to get all the interested
     * files and for each of them the url has to be changed according to
     * the directory structure. This function is event based and simulate
     * a series of synchronous requests (because order matters!).
     */
    //TODO: rewrite this function!!
    loadPluginData : function(app, docType, docLocale, callback) {
        var me = this;
        /**
         * If the last loaded configuration is the same of the passed configuration
         * all files is already loaded
         */
        if (this.lastConfiguration.markingLanguage == Config.getLanguage()
            && this.lastConfiguration.loaded && this.lastConfiguration.docType == docType
            && this.lastConfiguration.docLocale == docLocale) {
            return callback(this.dataObjects);
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
        var languageBundle = Config.getLanguageBundle();

        for (var directory in directoriesListDefault) {
            var newDir = directoriesListDefault[directory];
            currentDirectoryDefault += '/' + newDir;
            var styleUrl = currentDirectoryDefault+"/"+me.styleFile;
            if (languageBundle[styleUrl]) {
                styleUrls.push({url: styleUrl});
            }
            for (var files in pluginsFiles) {
                for (var file in pluginsFiles[files]) {
                    var reqUrl = currentDirectoryDefault + '/' + pluginsFiles[files][file];
                    var reqObject = {
                        name : file,
                        url : reqUrl,
                        level: 'defaults'
                    };
                    if (languageBundle[reqUrl]) {
                        reqUrls.push(reqObject);
                    }
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
            var styleUrl = currentDirectory+"/"+me.styleFile;
            if (languageBundle[styleUrl]) {
                styleUrls.push({url: styleUrl});
            }
            for (var files in pluginsFiles) {
                for (var file in pluginsFiles[files]) {
                    var reqUrl = currentDirectory + '/' + pluginsFiles[files][file];
                    var reqObject = {
                        name : file,
                        url : reqUrl,
                        level: directory
                    };
                    if (languageBundle[reqUrl]) {
                        reqUrls.push(reqObject);
                    }
                }
            }
        }
        me.reqUrls = reqUrls;
        me.styleUrls = styleUrls;
        me.requestSyncLoader(callback, me.reqUrls);
    },

    // Get the new empty document template for the current configuration.
    // This implementation is obviously buggy and incomplete:
    // everything will be a div, etc.
    buildEmptyDocumentTemplate: function () {
        var dataObjects = this.getConfigData();
        var template = '';

        function addTag (el) {
            var name = el.name,
                button = DocProperties.getFirstButtonByName(el.name),
                pattern = button.pattern.pattern,
                tag = button.pattern.wrapperElement.match(/\w+/)[0],
                content = el.content || '&nbsp;';
            template += '\n<' + tag + ' ' + DomUtils.elementIdAttribute + '="' + name + '" '+
                                         'class="' + pattern + ' ' + name + '">' + content;
            (el.children || []).forEach(addTag);
            template += '\n</' + tag + '>';
        }

        template += '<div>'; // This will be filled with document root class
        dataObjects.markupMenuRules.newDocumentTemplate.forEach(addTag);
        template += '</div>';
        return template;
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
