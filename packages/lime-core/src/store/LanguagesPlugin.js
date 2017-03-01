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

    // Generetes and loads the list of JSON and css files in order to use the
    // passed configuration in the editor
    loadPluginData: function(docType, docLocale) {
        //  If the last loaded configuration is the same of the passed configuration
        //  all files is already loaded
        if (this.isSameConfiguration(docType, docLocale)) {
            return {
                data: this.dataObjects,
                styles: this.lastConfiguration.styles
            }
        }
        this.saveConfiguration(docType, docLocale);

        this.dataObjects = {};
        var reqUrls = [];
        // Get the default global files
        reqUrls = reqUrls.concat(this.getDefaultFiles());

        // Get the default language files
        var defaultDirList = Ext.clone(this.languagePluginDefault);
        defaultDirList.languageRoot = defaultDirList.languageRoot.apply({
                                            lang: Config.getLanguage()
                                        });

        var pluginsRoot = this.baseDirectories['plugins'];
        reqUrls = reqUrls.concat(this.getJSONFiles(pluginsRoot, defaultDirList, 'defaults'));

        var styleUrls = [];
        styleUrls = styleUrls.concat(this.getCssFiles(pluginsRoot, defaultDirList, 'defaults'));

        // Get the docType language files
        var langRoot = pluginsRoot + '/' +
                        this.languagePlugin.languageRoot.apply({ 
                            lang: Config.getLanguage()
                        });
        reqUrls = reqUrls.concat(this.getJSONFiles(langRoot, this.languagePlugin.subDirs));
        styleUrls = styleUrls.concat(this.getCssFiles(langRoot, this.languagePlugin.subDirs));

        // Merge all configuration files based on file name
        this.dataObjects = this.mergeFiles(reqUrls);
        this.lastConfiguration.loaded = true;
        this.lastConfiguration.styles = styleUrls;

        return {
            data: this.dataObjects,
            styles: styleUrls
        }
    },

    isSameConfiguration: function(docType, docLocale) {
        return
            (
                this.lastConfiguration.markingLanguage === Config.getLanguage() &&
                this.lastConfiguration.loaded === true &&
                this.lastConfiguration.docType === docType &&
                this.lastConfiguration.docLocale === docLocale
            );
    },

    saveConfiguration: function(docType, docLocale) {
        this.lastConfiguration = {
            docType : docType,
            docLocale : docLocale,
            loaded : false,
            markingLanguage: Config.getLanguage()
        };
    },

    getDefaultFiles: function() {
        var me = this;
        return this.getFiles(
                this.baseDirectories['global'],
                this.requiredFiles['global'],
                'global',
                function(dir, name, file) {
                    return me.getRequiredFile(name, file, dir);
                });
    },

    getJSONFiles: function(root, dirList, type) {
        return this.getFiles(root, dirList, type, this.getPluginFiles.bind(this));
    },

    getFiles: function(root, dirList, type, fn) {
        var files = [];
        Object.keys(dirList).forEach(function(dirName) {
            var dir = dirName;
            if (dirName === 'locale')
                dir = this.lastConfiguration.docLocale;
            else if (dirName === 'docType')
                dir = this.lastConfiguration.docType;

            root += '/'+ (dirList[dir] || dir);
            type = type || dirName;
            files = files.concat(fn(root, type, dir));
        }, this);
        return files;
    },

    getPluginFiles: function(root, type) {
        var urls = [];
        var pluginsFiles = this.requiredFiles['plugins'];
        for (var files in pluginsFiles) {
            for (var file in pluginsFiles[files]) {
                var reqUrl = root + '/' + pluginsFiles[files][file];
                urls = urls.concat(this.getRequiredFile(type, file, reqUrl));
            }
        }
        return urls;
    },

    getRequiredFile: function(type, file, url) {
        var languageBundle = Config.getLanguageBundle();
        if (languageBundle[url]) {
            return {
                name : file,
                url : url,
                level: type
            };
        }
        return [];
    },

    getCssFiles: function(root, dirList, type) {
        return this.getFiles(root, dirList, type, this.getCssFile.bind(this));
    },

    getCssFile: function(dir) {
        var interfaceUrl = Config.getLanguagePath()+'interface/';
        var styleUrl = Config.getLanguagePath()+'styles/css/'+
                            'content_'+
                            dir.substr(interfaceUrl.length).replace(/\//g, '_')+
                            '.css';
        var languageBundle = Config.getLanguageBundle();
        if (languageBundle[styleUrl]) {
            return styleUrl;
        }
        return [];
    },

    mergeFiles: function(reqObjects) {
        var languageBundle = Config.getLanguageBundle();
        var data = {};
        reqObjects.forEach(function(obj) {
            obj.content = languageBundle[obj.url];
            data[obj.name] = Utilities.mergeJson(
                                data[obj.name],
                                obj.content,
                                Utilities.beforeMerge
                            );
        }, this);
        return data;
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
