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
 * This view is used as an interface to allow the user to login.
 */

Ext.define('LIME.view.Login', {

    extend : 'Ext.panel.Panel',

    // set the alias
    alias : 'widget.login',

    layout : 'auto',

    border : false,

    bodyStyle : {
        'background-color' : '#C9CEDB'
    },

    width : 300,

    /**
     * Return an object that contains username and password.
     * @return An object containing two elements: username and password.
     */
    getData : function() {
        var data = this.down('form').getValues();
        return data;
    },

    /**
     * Resets form fields
     */
    resetData : function() {
        var form = this.down("form").getForm();
        form.reset();
    },

    /**
     * Shake the window as a feedback to tell the user
     * that login data was incorrect.
     */
    loginFailed : function() {
        var win = this, posX = win.getPosition()[0], offset = 20, form = this.down("form").getForm();

        // Reset the fields
        win.resetData();

        // Highlight wrong fields (TODO popup message from the server)
        form.findField("username").markInvalid(Locale.strings.fieldIsInvalid);
        form.findField("password").markInvalid(Locale.strings.fieldIsInvalid);

        win.animate({
            duration : 500,
            keyframes : {
                25 : {
                    left : posX + offset
                },
                75 : {
                    left : posX - offset
                },
                100 : {
                    left : posX
                }
            }
        });
    },

    /**
     * Set username and password from the given object.
     * @param {Object} loginData An object containing username and password as strings
     */
    setData : function(loginData) {
        var form = this.down("form").getForm();
        form.setValues(loginData);
    },

    initComponent : function() {
        this.title = Locale.strings.login;
        this.items = [{
            xtype : 'toolbar',
            items : ['->', {
                xtype : 'languageSelectionBox'
            }]
        }, {
            // Form to type username and password (including buttons)

            xtype : 'form',
            frame : true,
            padding : '10px',
            layout : 'anchor',
            defaults : {
                anchor : '100%'
            },

            // The fields
            defaultType : 'textfield',
            items : [{
                xtype : "checkbox",
                boxLabel : Locale.strings.guestLogin
            }, {
                emptyText : 'Email',
                name : 'username',
                allowBlank : false
            }, {
                emptyText : 'Password',
                inputType : 'password',
                name : 'password',
                allowBlank : false
            }],

            // The buttons
            dockedItems : [{
                xtype : 'toolbar',
                dock : 'bottom',
                ui : 'footer',

                items : ['->', {
                    xtype : 'container',
                    layout : 'vbox',
                    items : [{
                        xtype : 'button',
                        minWidth : 100,
                        text : Locale.strings.login
                    }, {
                        xtype : 'box',
                        cls : 'registration',
                        style : {
                            marginTop : '10px'
                        },
                        autoEl : {
                            tag : 'a',
                            href : '#',
                            html : Locale.strings.register
                        }
                    }, {
                        xtype : 'box',
                        cls : 'forgotPassword',
                        style : {
                            marginTop : '10px'
                        },
                        autoEl : {
                            tag : 'a',
                            href : '#',
                            html : Locale.strings.forgotPassword
                        }
                    }]
                }, '->']
            }]
        }];
        this.callParent(arguments);
    }
});
