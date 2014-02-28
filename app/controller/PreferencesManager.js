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
 * This controller manages user's preferences.
 *  */

Ext.define('LIME.controller.PreferencesManager', {
    extend : 'Ext.app.Controller',
    // set the references for this controller
    
    /**
     * @property {Boolean} cached
     * True when the user's preferences are already available locally 
     */
    cached : false,
    
    /**
     * @property {Object} userPreferences
     * This object holds the user's preferences at runtime.
     */
    userPreferences : {
        userFullName : null,
        defaultLanguage : null,
        defaultLocale : null,
        views : null,
        lastOpened : null
    },
    
    /**
     * Set the user's preferences on the DB.
     * @param {Object} preferences The user's preferences
     * @param {Boolean} [create] True if the user's preferences must be created from scratch
     * @param {Function} [callback] An optional callback to call once the preferences are set on the DB
     */
    setUserPreferences : function(preferences, create, callback){
       if (!preferences){
           throw "No preferences specified";
       } 
        
       var prefManager = this,
           loginManager = this.getController('LoginManager'),
           loginData = loginManager.getUserInfo(),
           args = {
                requestedService : Statics.services.userPreferences,
                requestedAction : (create)? 'Create_User_Preferences' : 'Set_User_Preferences',
                userName : preferences.username || loginData.username,
                password : preferences.password || loginData.password
           },
           serviceUrl;
       // Set the preferences to save
       for (pref in this.userPreferences){
           if (preferences[pref]){
               // Update the global object
               this.userPreferences[pref] = preferences[pref];
               // Convert arrays into comma-separated strings
               if (Ext.isArray(preferences[pref])){
                   preferences[pref] = preferences[pref].join(',');
               }
               args[pref] = preferences[pref];
           } else {
               if (Ext.isArray(this.userPreferences[pref])){
                   args[pref] = this.userPreferences[pref].join(',');
               } else {
                   args[pref] = (this.userPreferences[pref]) ? this.userPreferences[pref] : Ext.emptyString; 
               }
           }
       }
       
       // Build the request url
       serviceUrl = Utilities.getAjaxUrl(args);
       
       // The service called depends on whether we want to create a new resource on the DB or not
       if (create){

           Ext.Ajax.request({
               url : serviceUrl,
               success : function(response){
                   try {
                       var responseObj = JSON.parse(response.responseText);
                   } catch (e){
                       throw "Invalid JSON (Preferences)";   
                   }
                   if (responseObj.success != 'true'){
                       Ext.Msg.alert(Locale.strings.error, Locale.strings.noPreferences);
                   }
                   
                   if (callback)
                        callback(this.userPreferences);
                        
               },
               
               failure : function(msg){
                   Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
               }
           });
           
       } else {
           
           Ext.Ajax.request({
               url : serviceUrl,
               success : function(response){
                   var responseObj = JSON.parse(response.responseText);
                   if (responseObj.success != 'true'){
                       Ext.Msg.alert(Locale.strings.error, Locale.strings.noPreferences);
                   }
                   
                   if (callback)
                        callback(this.userPreferences);
               },
               
               failure : function(msg){
                   Ext.Msg.alert(Locale.strings.error, Locale.strings.serverFailure);
               }
           });
       }
    },

    
    /**
     * Get the user's preferences from the DB.
     */
    getUserPreferences : function(successCallback, failureCallback){
        var loginManager = this.getController('LoginManager'),
            preferencesManager = this,
            userPrefs,
            userInfo = loginManager.getUserInfo(),  
            serviceUrl;
       
       // If the preferences have already been retrieved (and the request is synchronous) just return them
       if (!successCallback && !failureCallback){
           return preferencesManager.userPreferences;
       }
       
        // If we've already retrieved the preferences return the cache
        if (preferencesManager.cached){
            successCallback({user : preferencesManager.cached}); // It must included into an object
        }
        
        serviceUrl = Utilities.getAjaxUrl({
            requestedService : Statics.services.userPreferences,
            requestedAction : 'Get_User_Preferences',
            userName : userInfo.username,
            password: userInfo.password
        });
        
        // Otherwise execute the real request
        Ext.Ajax.request({
           url : serviceUrl,
           success : function(response){
               var responseObj = JSON.parse(response.responseText);
               if (responseObj.success != 'true'){
                   var errorCode = responseObj.msg;
                   Ext.Msg.alert(Locale.strings.error, (Locale.strings.prefErrors[errorCode]) ? Locale.strings.prefErrors[errorCode] : Locale.strings.prefErrors.GENERIC);
               }
               
               // Execute the callback if set
               if (successCallback){
                   // Set the global object
                   preferencesManager.userPreferences = responseObj.user;
                   userPrefs = preferencesManager.userPreferences;
                   if (userPrefs.views){
                       userPrefs.views = userPrefs.views.view;
                       if (!Ext.isArray(userPrefs.views)){
                           userPrefs.views = [userPrefs.views];
                       }
                   } else {
                       userPrefs.views = [];
                   }
                   preferencesManager.cached = true;
                   successCallback(userPrefs);
               }
           },
           
           failure : function(msg){
               Ext.Msg.alert(Locale.strings.error, Locale.strings.internalServerError);
               // Execute the callback if set
               if (failureCallback){
                    failureCallback(msg);
               }
           }
        });
    },
    
    
    /**
     * Reload the editor with the new user's preferences.
     * @param {Object} userPreferences The user's preferences. 
     */
    loadUserPreferences : function(userPreferences){
       var preferences = userPreferences,
           // Current preferences
           currentLanguage = Locale.strings.languageCode,
           // User's preferences
           userLanguage = preferences.defaultLanguage,
           // Open views
           openViews = preferences.views;
           
           // TODO: locale, lastOpened, views
           
       // Set the language        
       if (currentLanguage != userLanguage){
           // Utilities.changeLanguage(userLanguage);
           this.setUserPreferences({
               defaultLanguage : currentLanguage
           });
       }
    }

});
