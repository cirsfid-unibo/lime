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
 * This controller manages login and registration processes.
 */


Ext.define('LIME.controller.LoginManager', {
	extend : 'Ext.app.Controller',
	// set the references for this controller
	views : ['modal.Login', 'modal.Registration', 'maintoolbar.UserButton'],
	
	refs : [{
		selector : 'viewport',
		ref : 'viewport'
	},{
        selector : 'login',
        ref : 'login'
    },{
        selector : 'userButton',
        ref : 'userButton'
    }],
    
    /**
     * All the information saved when the user logs in.
     * @type {Array} 
     */
    userInfo : ['username', 'password', 'userCollection', 'editorLanguage'],
	
	/**
	 * This function starts the Editor 
	 * TODO: move
	 */
	startEditor: function() {
	   var viewport = this.getViewport();
	   this.cleanViewport();
	   this.addViewportItems(viewport.editorItems);
	},
	
	/**
	 * This function shows the login view
	 */
	showLogin: function() {
	   var viewport = this.getViewport();
	   this.cleanViewport();
	   this.addViewportItems(viewport.loginItems);
	},
	
	/**
	 * Empty the viewport so that new components
	 * can be added without conflicts.
	 * @private 
	 */
	cleanViewport: function() {
	   var viewport = this.getViewport();
	   viewport.removeAll(true);
	},
	
	/**
	 * Helps rendering the editor by adding all the
	 * editor's components to the viewport.
	 * @private 
	 */
	addViewportItems: function(items) {
	    var viewport = this.getViewport();
	    items = Ext.Array.merge(items, viewport.commonItems);
        viewport.add(items);
	},
	
	/**
	 * Return true if all the user's data is loaded in
	 * the local storage. False otherwise
	 * @return {Boolean} True or False 
	 */
	isLoggedIn : function(){
	    for (var i = 0; i < this.userInfo.length; i++){
	        if (!localStorage.getItem(this.userInfo[i])){
	            return false;
	        }
	        return true;
	    }
	},
	
	/**
	 * Set the user's info in the local storage
	 * Data that can be set:
	 *     - username
	 *     - password
	 *     - userCollection (for the DB)
	 *     - editorLanguage (language used for the editor, not the document)
	 * 
	 * @param {Object} userData The user's data
	 */
	setUserInfo : function(userData){
	    if (userData){
    	    localStorage.setItem('username', userData.username);
            localStorage.setItem('password', userData.password);
            localStorage.setItem('userCollection', userData.userCollection);
            localStorage.setItem('editorLanguage', userData.editorLanguage);
        } else {
            throw "Either username or password or userCollection were not specified";
        }
	},
	
	/**
	 * If user is logged in returns all user's info
	 * from the localStorage
	 * @returns {Object}  
	 */
	getUserInfo: function() {
	    var result = {};
	    if (this.isLoggedIn()) {
	        for (var i = 0, length = this.userInfo.length; i < length; i++){
	            result[this.userInfo[i]] = localStorage.getItem(this.userInfo[i]);
            }
            return result;
	    }
	    
	    return null;
	},
	
	
	prepareLogin: function() {
	    var me = this, loginView = this.getLogin(),
            data = loginView.getData(),  requestUrl,
            preferencesManager = this.getController('PreferencesManager');
       
        // DEBUG used when Exist is down (fake login)
        /*
        loginManager.setUserInfo("demo@prova.com", "demo", "/path/to/collection");
        loginView.hide();
        loginManager.startEditor();
        return;
        */

        me.login(data.username, data.password, function(loginData) {
            var userData = {
                username: data.username,
                password: data.password,
                userCollection: loginData.userCollection,
                editorLanguage: Locale.strings.languageCode
            };

            // Store user's info locally
            me.setUserInfo(userData);

            // Retrieve user's preferences from the DB (load them in the editor in the callback)
            preferencesManager.getUserPreferences(function(args) {
                Ext.defer(function(args) {
                    preferencesManager.loadUserPreferences(args);
                    // Dinamically load the files store when the user has already logged in
                    loginView.hide();
                    me.startEditor();
                }, 0, preferencesManager, [args]);
            });
        }, function(loginData) {
            var errorCode, errorMsg = {title: Locale.strings.error, content:  Locale.strings.serverFailure};
            if (Ext.isObject(loginData)) {
                errorCode = loginData.msg;
                switch (errorCode) {
                    case 'ERR_0' :
                        errorMsg = {
                            title: Locale.strings.authErrors.LOGIN_FAILED_TITLE,
                            content:  Locale.strings.authErrors.ERR_0
                        };
                        break;
                }
            } else {
                Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
            }

            if (!loginView.isVisible()) {
                loginView.show();
            }
            loginView.loginFailed(); 
            Ext.Msg.alert(errorMsg.title, errorMsg.content);
        });
	},
	
	prepareRegister: function(cmp) {
	    // cmp is the registration button
        var form = cmp.up('form').getForm(),
            modal = cmp.up('window'),
            me = this,
            preferencesManager = this.getController('PreferencesManager');
        
        if (form.isValid()){
            values = form.getValues();
            if (modal.checkPasswords()){
                // Give a waiting feedback to the user
                modal.setLoading(true);
                
                me.register(values.email, values.password, values.name, function(data) {
                    Ext.Msg.alert(Locale.strings.registrationOk, Locale.strings.registrationOkMessage);
                    modal.setLoading(false);
                    modal.close();
                    // Create the user'spreferences
                    preferencesManager.setUserPreferences({
                        username : values.email,
                        userFullName : values.name,
                        password : values.password,
                        editorLanguage : Locale.strings.languageCode
                    }, true); 
                }, function(data) {
                    var errorCode;

                    if (Ext.isObject(data)) {
                        errorCode = data.msg;
                        // Handle different type of server-side errors
                        switch (errorCode) {
                            case 'ERR_1' :
                                Ext.Msg.alert(Locale.strings.authErrors.REGISTRATION_FAILED_TITLE, Locale.strings.authErrors.ERR_1);
                                break;

                            case 'ERR_2' :
                                Ext.Msg.alert(Locale.strings.authErrors.REGISTRATION_FAILED_TITLE, Locale.strings.authErrors.ERR_2);
                                break;

                            default :
                                Ext.Msg.alert(Locale.strings.authErrors.REGISTRATION_FAILED_TITLE, 'Undefined error');
                        }
                    } else {
                        Ext.Msg.alert(Locale.strings.authErrors.REGISTRATION_FAILED_TITLE, ' server-side failure');
                    }
                    modal.setLoading(false); 
                    modal.registrationFailed();
                });
            }
            
        } else {
            modal.registrationFailed();
        }
	},
	/**
     * Start the login procedure calling the related web service.
     * If the login is successful it loads the editor
     * otherwise it shows some message. 
     */
    login: function(username, password, success, failure) {
        var me = this, requestUrl;
        
        if(!Ext.isString(username) || !Ext.isString(password) 
           || Ext.isEmpty(username.trim()) || Ext.isEmpty(password.trim())) {
            Ext.callback(failure, me);
            return;            
        }
        
        requestUrl = Utilities.getAjaxUrl({
               'requestedService' : Statics.services.userManager,
               'requestedAction' : 'Login',
               'userName' :  username,
               'password':  password
        });
        

        Ext.Ajax.request({
            url : requestUrl,
            success : function(response, opts) {
                var jsonData = Ext.decode(response.responseText, true);
                if (!jsonData) {
                    Ext.callback(failure, me, [response.responseText]);
                } else if (jsonData.success == 'true') {
                    Ext.callback(success, me, [jsonData]);
                } else { // login data was wrong
                    Ext.callback(failure, me, [jsonData]);
                }
            },
            failure : function(response, opts) {
                if (!response || !response.status) {
                    response = response || {};
                    response.status = 'request timed-out';
                }
                Ext.callback(failure, me, [response.status]);
            }
        }); 

    },
    
	/**
	 * Starts the registration procedure calling the related web service.
	 * If the registration is successful the user is created and can now login.
	 * Otherwise a message is shown to the user. 
	 */
    
    register : function(email, password, name, success, failure) {
        var me = this, requestUrl;
        
        if(!Ext.isString(email) || !Ext.isString(password) || !Ext.isString(name) 
           || Ext.isEmpty(email.trim()) || Ext.isEmpty(password.trim()) || Ext.isEmpty(name.trim())) {
            Ext.callback(failure, me);
            return;            
        }
        
        requestUrl = Utilities.getAjaxUrl({
            'requestedService' : Statics.services.userManager,
            'requestedAction' : 'Create_User',
            'userName' : email,
            'password' : password,
            'userFullName' : name
        });

        Ext.Ajax.request({
            url : requestUrl,
            success : function(response, opts) {
                var jsonData = Ext.decode(response.responseText, true);
                if (!jsonData) {
                    Ext.callback(failure, me, [response.responseText]);
                } else if (jsonData.success == 'true') {
                    Ext.callback(success, me, [jsonData]);
                } else {
                    Ext.callback(failure, me, [jsonData]);
                }
            },
            failure : function(response, opts) {
                Ext.callback(failure, me, [response.status]);
            }
        });
    },

	/**
     * Perform a logout cleaning whatever is needed from the
     * localStorage.
     * Refresh the page to force the user to login again. 
     */
    logout : function(){
         // Only remove user credentials
         localStorage.removeItem('username');
         localStorage.removeItem('password');
         localStorage.removeItem('userCollection');
         localStorage.removeItem('documentContent');
         localStorage.removeItem('documentId');
         
         // Refresh the page
         window.location.reload();
    },
    
	/**
	 * Show a form where the user can add his 
	 * registration details (e.g. username, password, email).
	 * Once the user submits the registration a call to a
	 * web service is performed.
	 */
	showRegistration: function() {
        var registrationView = Ext.widget('registration').show();
	},
	
	init : function() {
        var loginManager = this;
        this.control({
            'viewport': {
                render: function(cmp) {
                    this.showLogin();
                }
            },
            'login': {
                added: function(cmp) {
                    var loginView = this.getLogin(),
                        user = localStorage.getItem('username'),
                        password = localStorage.getItem('password');
                    if (user && password) {
                        loginView.setData({username: user, password: password});  
                        this.prepareLogin();
                    } else {
                        cmp.show();    
                    }
                }
            },
            'login button': {
                click: function(cmp) {
                    this.prepareLogin();
                }
            },
            'box[cls=registration]': {
                render: function(cmp) {
                    cmp.getEl().addListener("click", this.showRegistration);         
                }
            },
            
            'login checkbox': {
                change: function(cmp, value) {
                    var loginView = this.getLogin();
                    if (value) {
                        loginView.setData({username: 'demo@lime.com', password: 'demo'});
                    } else {
                        loginView.resetData();
                    }
                }
            },

            'registration button' : {
                click : this.prepareRegister
            },
            
            'userButton': {
                beforerender: function(cmp) {
                    var userdata = this.getController("PreferencesManager").getUserPreferences(),
                        name, tpl;
                    if (userdata && userdata.fullName) {
                        tpl = new Ext.Template(cmp.tpl); 
                        cmp.setText(tpl.apply({name: userdata.fullName}));
                    }
                }          
            }
        });
    }
}); 
