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
 * This controller takes care of handling interaction with the main toolbar which
 * is responsible for letting the user open, save and delete a document or change the language
 * of the application. 
 */
Ext.define('LIME.controller.MainToolbar', {

	// extend the ext controller
	extend : 'Ext.app.Controller',
	// set the references for this controller

	refs : [{
		// the open document button
		selector : 'openDocumentButton',
		ref : 'openDocumentButton'
	}, {
		// The reference to the open file window
		selector : 'modalOpenfileMain',
		ref : 'openFileWindowMain'
	}, {
		// The reference to the open file window
		selector : 'languageSelectionBox',
		ref : 'LanguagesComboBox'
	},{
        ref : 'downloadManager',
        selector : 'downloadManager'
    },{
        ref : 'documentUploader',
        selector : 'documentUploader'
    },{
        ref : 'main',
        selector : 'main'
    },{
        ref: 'windowMenuButton',
        selector: 'windowMenuButton'
    },{
        ref : 'fileMenuButton',
        selector : 'fileMenuButton'
    },{
        ref : 'saveDocumentButton',
        selector : 'saveDocumentButton'
    },{
        ref : 'saveAsDocumentButton',
        selector : 'saveAsDocumentButton'
    },{
        ref : 'saveAsMenu',
        selector : 'saveAsMenu'
    },{
        ref : 'windowMenuButton',
        selector : 'windowMenuButton'
    },{
        ref : 'showBoxCheckbox',
        selector : '#showBoxCheckbox'
    },{
        ref : 'showColorCheckbox',
        selector : '#showColorCheckbox'
    },{
        ref : 'showStyleCheckbox',
        selector : '#showStyleCheckbox'
    },{
        ref : 'mainToolbar',
        selector : 'mainToolbar'
    }],

	// set up the views
	views : ['MainToolbar', 
               'Main',
	           'maintoolbar.OpenDocumentButton', 
	           'maintoolbar.LocaleSelector', 
	           'maintoolbar.LanguageSelectionBox', 
	           'maintoolbar.LanguageSelectionMenu',
	           'modal.newOpenfile.Main',
	           'modal.newSavefile.Main',
	           'maintoolbar.FileMenuButton', 
	           'maintoolbar.DocumentMenuButton',
	           'maintoolbar.WindowMenuButton',
	           'modal.NewDocument'],
	           
	/**
	 * Create a new document by performing all the necessary
	 * operations (replace editor's content and document's id) 
	 */
	createNewDocument : function(params){
	   var app = this.application,
	       documentId = DocProperties.currentEditorFile.id,
	       config = {
	           docText: params.docText || '<div> &nbsp; </div>',
	           docId: ''
	       };
	   // If a document's id is not specified it means the document is saved
	   // in a temporary file on the server, we have to make the user save it with save as
	   if (Ext.isEmpty(documentId)) {
	       // TODO Dialog for save as
	   }
	   // Load an empty document with empty id
	   app.fireEvent(Statics.eventsNames.loadDocument, Ext.Object.merge(config, params));
	},
	
    
	/**
     * Highlight file menu
     * TODO Generalize for different buttons
     */
    highlightFileMenu : function(){
        var fileMenuButton = this.getFileMenuButton(),
            domEl = fileMenuButton.getEl();
            
        return setInterval(function(){
            domEl.frame("#ff0000", 1, { duration: 1000 });
        }, 1000);
    },
	
	
	/**
	 * This function is called on selection of a language in the menu
	 * @param {Ext.menu.Menu} item, the clicked menu item
	 */
	selectLanguage: function(item) {
        var langCode = item.record.get("code"),
            preferencesManager = this.getController('PreferencesManager');
            
        var callback = function(prefs){
            // Change the language
            Utilities.changeLanguage(langCode);
        };    
            
        // Set the new language in the user's preferences
        preferencesManager.setUserPreferences({
            defaultLanguage : langCode
        }, false, callback);
        
	},
	
	
	/**
     * This function is called on selection of a locale in the menu
     * @param {Ext.menu.Menu} item, the clicked menu item
     */
	selectLocale: function(item) {
        var selectedLocale = item.record.get("locale");
        var preferencesManager = this.getController('PreferencesManager');
        var params = Ext.urlDecode(window.location.search);
        params.locale = selectedLocale;
        // Redirect
        var callback = function(){
            window.location.search = Ext.Object.toQueryString(params);
        };
        
        // Set the new language in the user's preferences
        preferencesManager.setUserPreferences({
            defaultLocale : selectedLocale
        }, false, callback);
    },
    
    /**
     * Add a tab to the main view and thick the related
     * item in the menu.
     * @param {Ext.Component} cmp The component to be added
     */
    addTab : function(xtype){
        var main = this.getMain(), newTab;
        if (xtype && !main.down(xtype)) {
            newTab = Utilities.createWidget({xtype:xtype, closable: true});
            if(newTab) {
                main.add(newTab);
            } else {
                this.removeMainTabFromPreferences(xtype);
            }
        }
    },
 
     setAllowedViews : function() {
        var mainMenu = this.getWindowMenuButton(),
            viewsMenu = mainMenu.menu.down("*[id=showViews]"),
            configData = this.getStore('LanguagesPlugin').getData(),
            preferencesManager = this.getController('PreferencesManager'),
            openViews = preferencesManager.userPreferences.views,
            menu =  {
                xtype : 'menu',
                plain : true,
                items : []
            };
        if (configData.viewConfigs) {
            var views = configData.viewConfigs.allowedViews,
                icon;
            Ext.each(views, function(view) {
                /* View can be defined in client plugin, try to instantiate it to be sure 
                 * if there aren't errors in the creation process.
                 * The text of menu item will be the title of the widget in order to obtain
                 * a localized text for the menu button.
                 *  */
                widget = Utilities.createWidget(view);
                if(widget) {
                    icon = (openViews.indexOf(view) != -1) ? mainMenu.checkedIcon : Ext.BLANK_IMAGE_URL;
                    menu.items.push({
                        text: widget.menuText || widget.title,
                        openElement: view,
                        icon : icon
                    });
                    // Is important to destroy the temporary widget created before
                    Ext.destroy(widget);
                }
            });
            viewsMenu.setMenu(menu);
        }   
    },
    
    onLanguageLoaded: function() {
        var me = this, main = me.getMain(), 
            customViews = Config.getLanguageConfig().customViews,
            preferencesManager = me.getController('PreferencesManager'),
            openViews = preferencesManager.userPreferences.views; // Get the open views from the preferences
            
        me.setAllowedViews();

        // Open the tabs by their xtype
        for (var i in openViews){
            this.addTab(openViews[i]);
        }
    },
    
    addMenuItem: function(config, menuConfig) {
        if(this.getMainToolbar()) {
            this.addMenuItemRaw(config, menuConfig);
        } else {
            this.menuItemsToAdd = this.menuItemsToAdd || [];
            this.menuItemsToAdd.push({
                config: config,
                menuConfig: menuConfig
            });
        }
    },

    addMenuItemRaw: function(config, menuConfig) {
        var mainMenu = this.getMainToolbar(), newMenu,
            menu = mainMenu.down(config.menu+" menu"),
            refItem = config.before || config.after || config.replace,
            refItemIndex = -1, posIndex = config.posIndex || -1;

        if(menu && !menu.down("*[name="+menuConfig.name+"]")) {
            newMenu = menu.add(menuConfig);
            if (refItem) {
                var refCmp = menu.down(refItem) || menu.down("*[name="+refItem+"]");
                refItemIndex = menu.items.indexOf(refCmp);
                if ( config.replace ) refCmp.hide();
            }
            if (refItemIndex != -1 || posIndex != -1) {
                posIndex = (posIndex != -1) ? posIndex : (refItemIndex+((config.before) ? 0 : 1));
                if (posIndex != -1) {
                    menu.move(newMenu, posIndex);
                } 
            }

        }
    },
    
    removeMainTabFromPreferences: function(xtype) {
        var preferencesManager = this.getController('PreferencesManager');

        preferencesManager.setUserPreferences({
            views : preferencesManager.userPreferences.views.filter(function(el) {
                if (el == xtype) {
                    return false;
                } else {
                    return true;
                }
            }) 
        });
    },

	init : function() {
		// save a reference to the controller
		var toolbarController = this;
		
		this.application.on(Statics.eventsNames.languageLoaded, this.onLanguageLoaded, this);
		
		// set up the control
		this.control({
			'openDocumentButton' : {
				// when the button is clicked
				click : function() {
                    Ext.widget('newOpenfileMain').show();
				}
			},
			'languageSelectionBox' : {
				afterrender : function(cmp) {
					var record = Ext.getStore('Languages').findRecord('code', Locale.strings.languageCode, null, null, null, true);
					// if language was found in store, assign it as current value in combobox
					if (record) {
						cmp.setValue(record.data.language);
					}
				},
				// when a language is selected
				select : {
					// register the function
					fn : function(cb, records) {
						// get the store record of the language
						var langCode = records[0].get("code");
						
						// Change the language
						Utilities.changeLanguage(langCode);
						    
					}
				}
			},
			'languageSelectionMenu': {
                beforerender: function(cmp) {
                    var menu = Ext.create('Ext.menu.Menu'),
                        languageStore = this.getStore(cmp.store),
                        currentRecord = languageStore.findRecord('code', Locale.strings.languageCode, null, null, null, true),
                        currentLanguage;
                    // if language was found in store, assign it as current value in menu
                    if (currentRecord) {
                        currentLanguage = currentRecord.get('code');
                    }
                    languageStore.each(function(record) {
                        menu.add({
                            text: record.get(cmp.displayField),
                            record: record,
                            handler: this.selectLanguage,
                            checked: (record.get('code')==currentLanguage) ? true : false,
                            group: 'languages',
                            scope : this
                        });
                    }, this);
                    cmp.setMenu(menu);
                }
			},
			'localeSelector' : {
			    beforerender: function(cmp) {
                    var menu = Ext.create('Ext.menu.Menu'),
                        localeStore = this.getStore(cmp.store),
                        currentLocale = Ext.urlDecode(window.location.search).locale;
                    localeStore.each(function(record) {
                        if (record.get('status') != 'disabled') {
                            menu.add({
                                text: record.get(cmp.displayField),
                                record: record,
                                handler: this.selectLocale,
                                checked: (record.get('locale')==currentLocale) ? true : false,
                                group: 'locales',
                                scope : this
                            });
                        } else {
                            menu.add('<b class="menu-title">'+record.get(cmp.displayField)+'</b>');
                        }
                    }, this);
                    cmp.setMenu(menu);
                }
				
			},
			
			'logoutButton': {
			     click: function() {
			         var loginManager = this.getController('LoginManager');
			             confirm = Ext.Msg.confirm(Locale.strings.warning, Locale.strings.logoutWarning,
			             function(buttonId){
			                 if (buttonId == 'yes'){
			                    // If the user confirmed perform a logout
    			                loginManager.logout();
                             }
			             });
			     }  
			},
            
            '[cls~=editorTab]' : {
                added : function(cmp){
                    var preferencesManager = this.getController('PreferencesManager'),
                        menu = this.getWindowMenuButton(),
                        openViews = preferencesManager.userPreferences.views,
                        xtype = cmp.getXType(),
                        menuItem = menu.menu.down('*[openElement='+cmp.xtype+']');
                        if (menuItem) {
                        	// Just set the icon (it will be rendered later)
                        	menuItem.icon = menu.checkedIcon;
                        }
                        // If the view is not in the preferences add it
                        if (openViews && openViews.indexOf(xtype) == -1){
                            preferencesManager.setUserPreferences({
                                views : openViews.concat([xtype])
                            });
                        }
                },
                
                close : function(cmp){
                    var menu = this.getWindowMenuButton();
                    //By convention openElement is the xtype of the element to open
                    menu.setCheckIcon(menu.menu.down('*[openElement='+cmp.xtype+']'), true);
                },
                
                removed : function(cmp){
                    toolbarController.removeMainTabFromPreferences(cmp.getXType());
                }
            },
            
            'newDocumentButton' : {
                click : function(cmp){
                    var newDocumentWindow = Ext.widget('newDocument');
                    newDocumentWindow.show();
                }
                
            },
            
            'docMarkingLanguageSelector[cls=syncType]': {
                change: function(cmp, value) {
                    var typeSelector, typeStore, types;
                    if (cmp.up('window').onlyLanguage) {
                        return;    
                    }
                    typeSelector = cmp.up('window').down('docTypeSelector'),
                    typeStore = this.getStore('DocumentTypes'),
                    types = Config.getDocTypesByLang(value);
                    
                    if (types) {
                        typeStore.loadData(types);
                        typeSelector.allowBlank = false;
                        typeSelector.show();
                    } else {
                        typeStore.removeAll();
                        typeSelector.allowBlank = true;
                        typeSelector.hide();
                    }
                }
            },
            
            // Selector used on creation of document collection
            'docMarkingLanguageSelector[cls=syncTypeCollection]': {
                change: function(cmp, value) {
                    var typeStore = this.getStore('DocumentTypes'), types = Config.getDocTypesByLang(value),
                        newDocWindow = cmp.up('window'),
                        localeSelector = newDocWindow.down('docLocaleSelector'),
                        localeStore = this.getStore('Locales'), locales;

                    if (types) {
                        typeStore.loadData(types);
                        locales = Config.getLocaleByDocType(value, 'documentCollection');
                        if (locales) {
                            localeStore.loadData(locales);
                            localeSelector.allowBlank = false;
                            localeSelector.show();
                        } else {
                            localeStore.removeAll();
                            localeSelector.allowBlank = true;
                            localeSelector.hide();
                        }
                    } else {
                        typeStore.removeAll();
                    }
                }
            },
            
            'docTypeSelector[cls=syncLocale]': {
                change: function(cmp, value) {
                    var newDocWindow = cmp.up('window'),
                        localeSelector = newDocWindow.down('docLocaleSelector'),
                        localeStore = this.getStore('Locales'),
                        lang = newDocWindow.down('docMarkingLanguageSelector').getValue(),
                        locales = Config.getLocaleByDocType(lang, value);
                    
                    if (locales) {
                        localeStore.loadData(locales);
                        localeSelector.allowBlank = false;
                        localeSelector.show();
                    } else {
                        localeStore.removeAll();
                        localeSelector.allowBlank = true;
                        localeSelector.hide();
                    }
                }
            },
            
            'newDocument button': {
                click: function(cmp) {
                    var newWindow = cmp.up('window'),
                        docLangsStore = this.getStore('DocumentLanguages'),
                        data = {};
                    // TODO: temporary solution
                    if (!newWindow.tmpConfig) {
                        newWindow.tmpConfig = {};
                        DocProperties.clearMetadata(this.application);
                    }
                    data = Ext.Object.merge(newWindow.tmpConfig, newWindow.getData());
                    this.createNewDocument(data);
                    newWindow.autoClosed = true;
                    newWindow.close();
                }
            },
            'newDocument': {
               afterrender: function(cmp) {
                    var newWindow = cmp,
                        config = newWindow.tmpConfig;
                    
                    // Setting the first language as default selected
                    newWindow.down("docMarkingLanguageSelector").setValue(Config.languages[0].name);
                    
                    if(config) {
                        if(config.docMarkingLanguage && !cmp.onlyLanguage) {
                            newWindow.down("docMarkingLanguageSelector").setValue(config.docMarkingLanguage);
                        }
                        if(config.docType) {
                            newWindow.down("docTypeSelector").setValue(config.docType);
                        }
                        if(config.docLang) {
                            newWindow.down("docLangSelector").setValue(config.docLang);
                        }
                        if(config.docLocale) {
                            newWindow.down("docLocaleSelector").setValue(config.docLocale);
                        }
                    }
                    
                    if (cmp.onlyLanguage) {
                        newWindow.down("docTypeSelector").hide();
                        newWindow.down("docTypeSelector").allowBlank = true;
                        newWindow.down("docLangSelector").hide();
                        newWindow.down("docLangSelector").allowBlank = true;
                        newWindow.down("docLocaleSelector").hide();
                        newWindow.down("docLocaleSelector").allowBlank = true;
                    }
                }
            },            
            'saveDocumentButton' : {
                click: function() {
                    if(!DocProperties.documentInfo.docId || 
                        DocProperties.documentInfo.docId.match("/autosave/")) {
                        Ext.widget('newSavefileMain').show();
                    } else {
                        this.getController("Editor").autoSaveContent(true);    
                    }
                }
            },
            
            'windowMenuButton *[id=showViews]' : {
            	beforerender: function() {
            		this.setAllowedViews();
            	}
            },
            
            'windowMenuButton *[id=showViews] menuitem': {
                click: function(cmp) {
                    var main = this.getMain(),
                        menu = this.getWindowMenuButton(),
                        tab = main.down(cmp.openElement);
                    
                    if (tab) {
                        tab.close();
                    } else {
                        this.addTab(cmp.openElement);
                        menu.setCheckIcon(cmp);
                    }
                }
            },

            'windowMenuButton *[id=showStyles] menuitem': {
                checkchange: function(cmp) {
                    var displayBox = this.getShowBoxCheckbox().checked,
                        displayColor = this.getShowColorCheckbox().checked,
                        displayStyle = this.getShowStyleCheckbox().checked,
                        editor = this.getController('Editor');
                    editor.updateStyle(displayBox, displayColor, displayStyle);
                }
            },
            
            'saveAsDocumentButton': {
                click: function() {
                    Ext.widget('newSavefileMain').show();
                }
            },
            'mainToolbar button': {
                afterrender: function(cmp) {
                    // Hide buttons with no items in the menu
                    if(cmp.menu && !cmp.menu.items.getCount()) {
                        cmp.hide();
                    }           
                }
            },
            'mainToolbar button menu': {
                add: function(cmp) {
                    var button = cmp.up();
                    if (button && button.isHidden()) {
                        button.show();
                    }
                },
                remove: function(menu) {
                    var button = menu.up();
                    if (button && !menu.items.getCount()) {
                        button.hide();
                    }
                }
            }
		});
	}
});
