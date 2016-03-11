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
    requires : ['Server'],

    language : '',
    pluginBaseDir : 'languagesPlugins',
    pluginStructureFile : 'structure.json',
    pluginStructure : {},
    languages:[],
    fieldsDefaults: {},
    isReady: false,

    constructor: function() {
        this.load();
    },

    load : function() {
        var me = this;
        // Loading the language plugin configuration file
        Ext.Ajax.request({
            url : 'config.json',
            success : function(response, opts) {
                try {
                    var jsonData = Ext.decode(response.responseText, true);
                    if(jsonData) {
                        me.setConfigs(jsonData);
                        // Load the plugin structure
                        me.loadPluginStructure();
                        me.isReady = true;
                    } else {
                        Ext.log({level: "error"}, "config (config.json) decode error!");                        
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

    setConfigs: function(data) {
        this.languages = data.languages;
        this.fieldsDefaults = (data.fieldsDefaults) ? data.fieldsDefaults : this.fieldsDefaults;
        this.setServerConfig(data.server);
    },

    setServerConfig: function(data) {
        Server.setNodeServer(data.node);
        Server.setPhpServer(data.php);
    },
    
    loadPluginStructure : function(){
        Ext.each(this.languages, function(language) {
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
                // TODO: understand if filterUrls is essential
                Server.filterUrls(urls, false, function(newUrls) {
                    langConf.transformationUrls = {};
                    if (urls.length != newUrls.length)
                        console.error('Not found all transformation files!', urls);
                    Ext.each(newUrls, function(obj) {
                        langConf.transformationUrls[obj.name] = obj.url;
                    });
                }, false, me);
            }
        }
    },
    
    getAppUrl: function() {
        return window.location.origin+window.location.pathname;
    },
    
    getLanguageTransformationFiles: function(lang) {
        return this.getLanguageConfig(lang).transformationUrls;
    },
    
    getLanguageTransformationFile: function(name, lang) {
        lang = lang || this.language || Config.languages[0].name;
        var files =  this.getLanguageTransformationFiles(lang);
        return (files && files[name]) ? files[name] : null;
    },
    
    getPluginStructureUrl : function(lang){
        return this.pluginBaseDir+'/'+lang+'/'+this.pluginStructureFile;  
    },
    
    getLanguageConfig: function(lang) {
        return this.pluginStructure[(lang) ? lang : this.language];
    },

    setLanguage : function(language) {
        var existingLang = language && this.languages.filter(function(lg) {
                        return lg.name === language;
                    })[0];
        if (!existingLang) return false;
        this.language = language;
        Ext.getStore('DocumentTypes').loadData(this.getDocTypesByLang(language));
        return true;
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
    
    getLocaleXslPath: function(lang, locale) {
        locale = locale || DocProperties.documentInfo.docLocale || this.fieldsDefaults['docLocale'];
        return this.getLanguagePath(lang)+'localeXsl/'+locale+'.xsl';
    }
});
