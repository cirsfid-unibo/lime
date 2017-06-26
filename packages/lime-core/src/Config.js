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

    constructor: function() {
        this.load();
    },

    load : function() {
        var me = this;
        if (Ext.manifest.limeConfig) {
            me.setConfigs(Ext.manifest.limeConfig);
            me.loadPluginStructure(Ext.manifest.limeConfig.language);
        } else {
            console.error('limeConfig was not found in Ext.manifest. Make sure you successfully executed "sencha app refresh" or "sencha app build" command before using LIME.');
            alert('LIME configuration not found! For technical details open the web console.');
        }
    },

    setConfigs: function(data) {
        this.languages = data.languages;
        this.fieldsDefaults = (data.fieldsDefaults) ? data.fieldsDefaults : this.fieldsDefaults;
        this.setServerConfig(data.server);
    },

    setServerConfig: function(data) {
        Server.setNodeServer(data.node);
    },

    loadPluginStructure : function(language){
        var structureUrl = this.getPluginStructureUrl(language.name);
        this.pluginStructure[language.name] = language;
        language[structureUrl].name = language.name;
        this.generateTransformationUrls(language[structureUrl]);
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

    getLanguageConfig: function(lang) {
        return this.getLanguageBundle(lang)[this.getPluginStructureUrl(lang)];
    },

    getPluginStructureUrl : function(lang){
        lang = lang || this.language;
        return this.pluginBaseDir+'/'+lang+'/'+this.pluginStructureFile;
    },

    getLanguageBundle: function(lang) {
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
        if (this.getLanguageConfig(lang)) {
            var arrDocsByLang = this.getLanguageConfig(lang).docTypes;
            var langi18n = Locale.getLang();
            if (arrDocsByLang != false) {
                for (var i=0; i < arrDocsByLang.length; i++) {
                    if (arrDocsByLang[i].label) {
                        if (langi18n in arrDocsByLang[i].label) {
                            arrDocsByLang[i].i18n_name = arrDocsByLang[i].label[langi18n];
                        } else {
                            arrDocsByLang[i].i18n_name = arrDocsByLang[i].name;
                        }
                    } else {
                        arrDocsByLang[i].i18n_name = arrDocsByLang[i].name;
                    }
                }
            }
            return arrDocsByLang;
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
        var path = this.getLanguagePath(lang)+'localeXsl/'+locale+'.xsl';
        return this.getLanguageBundle(lang)[path] ? path : null;
    }
});
