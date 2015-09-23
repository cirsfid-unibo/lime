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
 * Global editor configuration
 */
Ext.define('LIME.Config', {
    /* Since this is merely a utility class define it as a singleton (static members by default) */
    singleton : true,
    alternateClassName : 'Config',
    uxPath : 'LIME.ux',
    requires : ['Server'],

    extensionScripts : ['LoadPlugin', 'Language', 'SavePlugin', 'TranslatePlugin'],

    language : 'default',

    pluginBaseDir : 'languagesPlugins',

    pluginClientLibs : 'client',

    pluginServerLibs : 'server',
    
    pluginStructureFile : 'structure.json',
    
    pluginClientStructureFile: 'structure.json',
    
    pluginClientStringsFile: 'strings.json',
    
    pluginStructure : {},
    
    customizationViews : {},
    
    customDefaultControllers : [],
    
    allLanguages: [{name: "default"}],
    
    languages:[],
    
    fieldsDefaults: {},

    // Indicates whether the default language/plugin was loaded.
    loaded: false,

    loadedFinish: false,

    constructor: function() {
        var me = this;
        me.initConfig();
        Ext.defer(function() {
            me.load();
        }, 100);
    },

    getDependences : function() {
        return Ext.Array.map(this.extensionScripts, function(script) {
            return this.uxPath + "." + script;
        }, this);
    },

    load : function() {
        var me = this;

        Ext.Loader.setPath(this.uxPath, this.getPluginLibsPath());
        Ext.syncRequire(this.getDependences());
        // Loading the language plugin configuration file
        Ext.Ajax.request({
            url : 'languagesPlugins/config.json',
            async: false,
            scope: this,
            success : function(response, opts) {
                var jsonData;
                try {
                    jsonData = Ext.decode(response.responseText, true);
                    if(jsonData) {
                        Ext.Array.push(me.allLanguages, jsonData.languages);
                        me.languages = jsonData.languages;
                        me.fieldsDefaults = (jsonData.fieldsDefaults) ? jsonData.fieldsDefaults : me.fieldsDefaults;
                        // Load the plugin structure
                        me.loadPluginStructure();
                        me.loadLanguage(function() {
                            me.loaded = true;
                            Ext.callback(me.afterDefaultLoaded);
                        });
                    } else {
                        Ext.log({level: "error"}, "language config (languagesPlugins/config.json) decode error!");                        
                    }
                } catch(e) {
                    Ext.log({level: "error"}, e);
                    alert(Locale.strings.error);
                }
            },
            
            failure : function(response, opts) {
                Ext.log({level: "error"}, response);
                alert(Locale.strings.error);
            }
        });
    },
    
    loadPluginStructure : function(){
        Ext.each(this.allLanguages, function(language) {
            var lang = language.name,
                requestUrl = this.getPluginStructureUrl(lang);
            Ext.Ajax.request({
               async : false,
               url : requestUrl,
               scope : this,
               success : function(response) {
                   var data = Ext.decode(response.responseText, true);
                   if(data) {
                       data.name = lang;
                       this.pluginStructure[lang] = data;
                       this.generateTransformationUrls(data);
                   } else {
                       Ext.log({level: "error"}, "Language ("+lang+") structure decode error! ");
                   }
               }
            });     
        }, this);
    },

    // Add the trasformationUrls object to the language configuration
    generateTransformationUrls: function (langConf) {
        var me = this;
        var urls = [];
        if(langConf.transformationFiles) {
            langConf.transformationUrls = {};
            Ext.Object.each(langConf.transformationFiles, function(name, value) {
                var url = me.getLanguagePath(langConf.name)+value;
                if(name == "languageToLIME" || name == "LIMEtoLanguage") {
                    urls.push({
                        url: url,
                        name: name
                    });
                    langConf.transformationUrls[name] = url;
                }
            });

            if(!Ext.isEmpty(urls)) {
                Server.filterUrls(urls, false, function(newUrls) {
                    langConf.transformationUrls = {};
                    Ext.each(newUrls, function(obj) {
                        langConf.transformationUrls[obj.name] = obj.url;
                    });
                }, false, me);
            }
        }
    },

    loadLanguage : function(callback) {
        var me = this, counter,
            callingCallback = function() {
                if(!--counter) {
                    var newCallback = function() {
                        me.loadedFinish = true;
                        Ext.callback(callback, me);    
                    };
                    me.loadClientPlugins(newCallback);
                } else {
                    me.loadedFinish = false;
                }
            }, scriptToLoad = Ext.Array.clone(this.extensionScripts), 
            langConf = this.getLanguageConfig();
        me.initClientPlugins();
        // Temporary solution to remove loaded class    
        if (this.customScript) {
            Ext.each(this.customScript, function(name) {
                delete window[name];
                delete window[name+'Custom'];
            });
            this.customScript = [];
        }
        if (langConf) {
            if (langConf.customViews) {
                this.customScript = langConf.customViews;
                Ext.Array.push(scriptToLoad, langConf.customViews);    
            }
        }
        Ext.Loader.setPath(this.uxPath, this.getPluginLibsPath());
        counter = scriptToLoad.length;
        // Load app's components
        Ext.each(scriptToLoad, function(script) {
            me.loadScript(this.getPluginLibsPath() + '/' + script + '.js', callingCallback, callingCallback);
        }, this);
    },
    
    loadScript: function(url, success, error) {
        Ext.Loader.loadScript({
            url : url,
            onLoad : function() {
                Ext.callback(success, this);
            },
            onError: function() {
                Ext.callback(error, this);
            },
            scope : this
        });
    },
    
    loadClientPlugins: function(callback) {
        var me = this, langConf = this.getLanguageConfig(), counter,
            callingCallback = function() {
                if(!--counter) {
                    Ext.callback(callback, me);
                }
            };
        if (langConf && langConf.plugins && langConf.plugins.length) {
            counter = langConf.plugins.length;
            Ext.each(langConf.plugins, function(plugin) {
                me.loadClientPlugin(plugin, callingCallback);
            });   
        } else {
            Ext.callback(callback, me);
        }
    },
    
    initClientPlugins: function() {
        this.customControllers = [];
        this.customizationViews = {};
    },
    
    loadClientPlugin: function(name, callback) {
        var me = this, pluginDirUrl = me.getPluginLibsPath() + '/' + name + '/',
            structureUrl = pluginDirUrl+me.pluginClientStructureFile, counter, langConf = me.getLanguageConfig(),
            callingCallback = function() {
                if(!--counter) {
                    Ext.callback(callback, me);  
                }
            };
            
        me.setPluginUrl(name, pluginDirUrl);
        
        Ext.Ajax.request({
           async : false,
           url : structureUrl,
           scope : me,
           success : function(response) {
               var data = Ext.decode(response.responseText, true),
                   scriptToLoad = [];
                if(data) {
                    
                    if (data.views) {
                        Ext.Array.push(scriptToLoad, data.views);    
                    }
                    if (data.controllers) {
                        if(langConf.name == "default") {
                            Ext.Array.push(me.customDefaultControllers, data.controllers);
                        } else {
                            Ext.Array.push(me.customControllers, data.controllers);    
                        }
                        Ext.Array.push(scriptToLoad, data.controllers);    
                    }
                    me.loadClientPluginStrings(name, pluginDirUrl);
                    counter = scriptToLoad.length;
                    Ext.each(scriptToLoad, function(script) {
                        var url = pluginDirUrl + script + '.js';
                        me.loadScript(url, callingCallback, callingCallback);
                    }, me);
                } else {
                    Ext.log({level: "error"}, "Error loading structure of plugin: "+name);
                    Ext.callback(callback, me);
                }
                
           },
           failure: function() {
                Ext.callback(callback, me);
           }
        });
    },
    
    loadClientPluginStrings: function(name, pluginDirUrl) {
        var stringsUrl = pluginDirUrl+this.pluginClientStringsFile;
        Ext.Ajax.request({
           async : false,
           url : stringsUrl,
           scope : this,
           success : function(response) {
               var data = Ext.decode(response.responseText, true);
               Locale.setPluginStrings(name, data);
           }
        });
    },
    
    addCustomView : function(view) {
        var viewToCustomize = view.getViewToCustomize();
        if(viewToCustomize) {
            this.customizationViews[viewToCustomize] = this.customizationViews[viewToCustomize] || [];
            this.customizationViews[viewToCustomize].push(view);    
        }
    },
    
    setPluginUrl: function(name, relativeUrl) {
        var me = this;
        me.pluginUrls = me.pluginUrls || {};
        me.pluginUrls[name] = {
            relative: relativeUrl,
            absolute: me.getAppUrl()+relativeUrl
        };
    },
    
    getAppUrl: function() {
        return window.location.origin+window.location.pathname;
    },
    
    getPluginUrl: function(name) {
        return this.pluginUrls[name];
    },
    
    getLanguageTransformationFiles: function(lang) {
        return this.getLanguageConfig(lang).transformationUrls;
    },
    
    getLanguageTransformationFile: function(name, lang) {
        lang = lang || (this.language == "default" && Config.languages[0].name);
        var files =  this.getLanguageTransformationFiles(lang);
        return (files && files[name]) ? files[name] : null;
    },
    
    getCustomViews : function(name) {
        return this.customizationViews[name];
    },
    
    getPluginStructureUrl : function(lang){
        return this.pluginBaseDir+'/'+lang+'/'+this.pluginStructureFile;  
    },

    getPluginLibsPath : function() {
        return this.getLanguagePath() + this.pluginClientLibs;
    },
    
    getLanguageConfig: function(lang) {
        return this.pluginStructure[(lang) ? lang : this.language];
    },

    setLanguage : function(language, callback) {
        var me = this,
            wrapperCallback = function() {
                me.loaded = true;
                Ext.callback(callback, me);
            };
        if(me.language != language) {
            me.loaded = false;
            me.language = language;
            if(Ext.isFunction(this.beforeSetLanguage)) {
                var callB = Ext.bind(function() {
                    me.loadLanguage(wrapperCallback);
                }, me);
                this.beforeSetLanguage(language, callB);
            } else {
                this.loadLanguage(wrapperCallback);    
            }
        } else {
            Ext.callback(wrapperCallback, me);
        }
    },
    
    getLanguage: function() {
        return this.language;   
    },
    
    getLanguagePath: function(lang) {
        lang = lang || this.language;
        return this.pluginBaseDir + '/' + lang + '/';
    },
    
    getLanguageSchemaPath: function() {
        return this.getLanguagePath()+'schema.xsd';
    },
    
    getLocaleByDocType: function(lang, type) {
        var docTypes = this.getDocTypesByLang(lang);
        for(var i = 0; i<docTypes.length; i++) {
            if (docTypes[i].name == type) {
                return docTypes[i].locales;
            }    
        }
        return null;
    },
    
    getDocTypesByLang: function(lang) {
        if (this.pluginStructure[lang]) {
            return this.pluginStructure[lang].docTypes;     
        }
        return false;
    },
    
    getDocTypesName: function() {
        return Ext.Array.map(this.getDocTypesByLang(this.getLanguage()), function(item) {
            return item.name;
        });
    },
    
    getUxClassName: function(name) {
        return this.uxPath+"." +name;
    },

    getLocaleXslPath: function(lang, locale) {
        locale = locale || DocProperties.documentInfo.docLocale || this.fieldsDefaults['docLocale'];
        return this.getLanguagePath(lang)+'localeXsl/'+locale+'.xsl';
    }
});
