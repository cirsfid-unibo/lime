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

// Currently logged in user information.
Ext.define('LIME.User', {
    singleton: true,
    alternateClassName: 'User',

    username: '',
    password: '',
    
    preferences: {
        fullName: '',
        editorLanguage: '',
        folders: ['/'],
        lastOpened: '',
        // List (strings) of currently open views
        views: []
    },

    // Load user from local storage
    loadFromLocalStorage: function () {
        var user = localStorage.getItem('user');
        if (user) {
            console.log('loading from local storage');
            var user = JSON.parse(user);
            this.load(user);
       }
    },

    load: function (user) {
        console.info('Loading user', user);
        if (user.username)
            this.username = user.username;
        if (user.password)
            this.password = user.password;
        for (var key in user.preferences) 
            this.preferences[key] = user.preferences[key];
    },

    // Save user to local storage
    clearLocalStorage: function () {
        localStorage.removeItem('user');
    },

    // Save user to local storage
    saveToLocalStorage: function () {
        console.log('saving to local storage');
        localStorage.setItem('user', JSON.stringify(this.getJsonSerialization()));
    },

    getJsonSerialization: function () {
        return {
            username: this.username,
            password: this.password,
            preferences: this.preferences
        }
    },

    // Update user and call cb on success.
    save: function (cb) {
        cb = cb || function () {};
        Server.saveUser(this.getJsonSerialization(), cb, function (error) {
            Ext.log('Saving user on server failed', error);
        });
        this.saveToLocalStorage();
    },

    // Shortcut to editing user and saving.
    setPreference: function (key, value, cb) {
        this.user.preferences[key] = value;
        this.saveUser(cb);
    }
});
