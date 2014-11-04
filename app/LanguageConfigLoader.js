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
 * Given the language, docType, docLocale load its configuration files:
 * - Language Tags. (Relative patterns, marking menu button labels, styles,  etc.)
 * - Patterns.
 * - Css (? ...not now)
 * - Semantic rules (? ...not now)
 */ 
Ext.define('LIME.LanguageConfigLoader', {
    singleton: true,
    alternateClassName: 'LanguageConfigLoader',

    /* Directories structure */
    baseDirectories: {
        plugins: Config.pluginBaseDir
    },
    
    styleFile: 'content.css',
    
    /**
     * @property {Object} lastConfiguration
     * This object contains the last configuration of plugins
     * @private
     */
    lastConfiguration: {
        docType: null,
        docLocale: null,
        loaded: false
    },

    languagePlugin: {
        languageRoot: new Ext.Template('{lang}/interface'),
        subDirs: {
            docType: '',
            locale: '',
            language: Locale.getLang()
        }
    },
    
    languagePluginDefault: {
        languageRoot: new Ext.Template('{lang}/interface/default'),
        language: Locale.getLang() 
    },

    /* File names */
    files: {
        'markupMenu': 'markupMenu.json',
        'patterns': 'patterns.json',
        'markupMenuRules': 'markupMenu_rules.json',
        'viewConfigs': 'viewConfigs.json',
        'semanticRules': 'semantic/semantic_rules.json'
    },

    // Indicates whether we're loading and mergin configurations
    isLoading: false,

    // Contains the loaded and merged configurations
    styleConfiguration: undefined,
    generalConfiguration: undefined,

    // Get the general configuration object
    getConfig: function() {
        return this.generalConfiguration;
    },
 
    // Given a document type, load the configuration of its language by 
    // merging and prioritizing its settings, which can be specific to
    // language, locale and/or doctype.
    // The cb callback is executed on success.
    load: function(docType, docLocale, cb) {
        // Check if we have to load something
        if (this.isLoading)
            return Ext.log('LanguageConfigLoader.load() called while a language was already loading');
        if (this.isEqualToLastConfiguration(docType, docLocale))
            return cb(this.dataObjects);

        // Reset configuration
        this.isLoading = true;
        this.generalConfiguration = undefined;
        this.styleConfiguration = undefined;
        this.lastConfiguration = {
            docType: docType,
            docLocale: docLocale,
            loaded: false,
            markingLanguage: Config.getLanguage()
        };
        
        // Get urls, filter them and store the resulting configurations 
        var urls = this.getUrls(docType, docLocale);
        var filterError = function () {
            Ext.log({ level: 'error', msg: 'Error with filter request in LanguageConfigLoader' });
        }
        Utilities.filterUrls(urls.style, false, this.onStyleUrlsMerged.bind(this, cb), filterError);
        Utilities.filterUrls(urls.general, true, this.onGeneralUrlsMerged.bind(this, cb), filterError);
    },

    /* PRIVATE METHODS */

    // Check if we're loading the same configuration we've already loaded.
    isEqualToLastConfiguration: function (docType, docLocale) {
        return this.lastConfiguration.markingLanguage == Config.getLanguage() && 
            this.lastConfiguration.loaded && 
            this.lastConfiguration.docType == docType &&
            this.lastConfiguration.docLocale == docLocale;
    },

    // Create two lists of urls (One for style and one for general configurations)
    // containing all possible paths for the given document settings.
    getUrls: function (docType, docLocale) {
        var me = this, reqUrls = [];
        var language = Config.getLanguage();
        /* For each directory retrieve all the needed json files starting from the languageRoot */
        var directoriesList = this.languagePlugin.subDirs;
        var directoriesListDefault = Ext.clone(this.languagePluginDefault);
        directoriesListDefault.languageRoot = directoriesListDefault.languageRoot.apply({lang: language});
        var currentDirectory = this.baseDirectories['plugins']+'/'+this.languagePlugin.languageRoot.apply({lang: language});
        var currentDirectoryDefault = this.baseDirectories['plugins'];
        /* Build a list of urls to make the requests to */

        var styleUrls = [];
        
        for (var directory in directoriesListDefault) {
            var newDir = directoriesListDefault[directory];
            currentDirectoryDefault += '/' + newDir;
            styleUrls.push({url: currentDirectoryDefault+"/"+me.styleFile});
            for (var file in me.files) {
                var reqUrl = currentDirectoryDefault + '/' + me.files[file];
                var reqObject = {
                    name: file,
                    url: reqUrl,
                    level: 'defaults'
                };
                reqUrls.push(reqObject);
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
            for (var file in me.files) {
                var reqUrl = currentDirectory + '/' + me.files[file];
                var reqObject = {
                    name: file,
                    url: reqUrl,
                    level: directory
                };
                reqUrls.push(reqObject);
            }
        }

        return {
            general: reqUrls,
            style: styleUrls
        };
    },

    // Store the style urls
    onStyleUrlsMerged: function(cb, styleUrls) {
        this.styleConfiguration = styleUrls.map(function (el) {
            return el.url;
        });

        this.checkSuccess(cb);
    },

    // Store the general configuration urls and jsons
    onGeneralUrlsMerged: function(cb, reqObjects) {
        var me = this;
        me.generalConfiguration = {};
        Ext.each(reqObjects, function(obj) {
            var fileName = obj.name,
                level = obj.level;
            if (fileName == "viewConfigs") {
                //Just replace the content don't merge as others
                me.generalConfiguration[fileName] = obj.content;
            } else {
                if (!me.generalConfiguration[level]) {
                    me.generalConfiguration[level] = {};
                }
                me.generalConfiguration[level][fileName] = Utilities.mergeJson(me.generalConfiguration[level][fileName], obj.content, Utilities.beforeMerge);
                if (fileName != 'markupMenu') {
                    me.generalConfiguration[fileName] = Utilities.mergeJson(me.generalConfiguration[fileName], obj.content, Utilities.beforeMerge);
                }
            }
        });
            
        this.checkSuccess(cb);
    },

    // If we've successfully loaded both style and general configurations,
    // execute cb.
    checkSuccess: function (cb) {
        if (this.generalConfiguration && this.styleConfiguration) {
            this.isLoading = false;
            this.lastConfiguration.loaded = true;
            cb(this.generalConfiguration, this.styleConfiguration);
        }
    }
});