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
    extend: 'Ext.app.Controller',

    // set the references for this controller
    views: [
        'Login',
        'modal.Registration',
        'maintoolbar.UserButton'
    ],

    refs: [{
        ref : 'viewport',
        selector : 'viewport'
    }, {
        ref : 'login',
        selector : 'login'
    }, {
        ref : 'userButton',
        selector : 'userButton'
    }, {
        ref : 'registrationWindow',
        selector : 'registration'
    }],


    init : function() {
        var me = this;
        User.loadFromLocalStorage();
        this.control({
            'viewport': {
                render: function(cmp) {
                    cmp.showLogin();
                }
            },
            'login': {
                added: function(cmp) {
                    if (User.password) {
                        me.getLogin().setData({
                            username: User.username,
                            password: User.password
                        });
                        me.login();
                    } else {
                        cmp.show();
                    }
                }
            },
            'login button': {
                click: function(cmp) {
                    me.login();
                }
            },
            'box[cls=registration]': {
                render: function(cmp) {
                    cmp.getEl().addListener("click", me.showRegistration);
                }
            },

            'login checkbox': {
                change: function(cmp, useDemoUser) {
                    var loginView = me.getLogin();
                    if (useDemoUser)
                        loginView.setData({username: 'demo@lime.com', password: 'demo'});
                    else
                        loginView.resetData();
                }
            },

            'registration button' : {
                click : me.register
            },

            'userButton': {
                beforerender: function(cmp) {
                    var fullName = User.preferences.fullName;
                    if (fullName) {
                        var tpl = new Ext.Template(cmp.tpl);
                        cmp.setText(tpl.apply({
                            name: fullName
                        }));
                    }
                }
            },
            '[name=password]' : {
                specialkey: function(cmp, evt) {
                    if (evt.getKey() == evt.ENTER)
                        me.login();
                }
            }
        });
    },

    // Fake login (used for debug purposes when Exist is down)
    fakeLogin: function () {
        User.username = 'demo@prova.com';
        User.password = 'demo';
        if (this.getLogin())
            this.getLogin().hide();
        this.getViewport().showEditor();
    },

    // Try logging in, getting user data/preferences.
    // If successful, switch to editor.
    login: function () {
        var me = this,
            loginView = this.getLogin(),
            data = loginView.getData();

        Server.login(data.username, data.password, function(response) {
            User.load(JSON.parse(response.responseText));
            User.password = data.password;
            User.saveToLocalStorage();
            loginView.hide();
            me.getViewport().showEditor();
        }, function(error) {
            loginView.show();
            loginView.loginFailed();
            Ext.Msg.alert(Locale.strings.authErrors.LOGIN_FAILED_TITLE,
                          Locale.strings.authErrors.ERR_0);
        });
        // throw new Error();
    },

    // Register a new user.
    register: function () {
        var registrationWindow = this.getRegistrationWindow(),
            form = registrationWindow.down('form').getForm(),
            me = this;

        if (!form.isValid())
            return registrationWindow.registrationFailed();
        if (!registrationWindow.checkPasswords()) return;

        // Give feedback to the user
        registrationWindow.setLoading(true);

        var values = form.getValues();
        User.username = values.email,
        User.password = values.password,
        User.preferences = {
            fullName: values.name,
            editorLanguage: Locale.strings.languageCode,
            views: []
        };

        Server.register(User.getJsonSerialization(), function() {
            Ext.Msg.alert(Locale.strings.registrationOk, Locale.strings.registrationOkMessage);
            registrationWindow.setLoading(false);
            registrationWindow.close();
        }, function(error) {
            Ext.Msg.alert(Locale.strings.authErrors.REGISTRATION_FAILED_TITLE, Locale.strings.authErrors.ERR_1);
            console.log(error);
            registrationWindow.setLoading(false);
            registrationWindow.registrationFailed();
        });
    },


    // Logout and clean the localStorage.
    // Refresh the page to force the user to login again.
    logout: function () {
        User.clearLocalStorage();
        window.location.reload();
    },

    // Show a form where the user can add his
    // registration details (e.g. username, password, email).
    showRegistration: function () {
        Ext.widget('registration').show();
    }
});
