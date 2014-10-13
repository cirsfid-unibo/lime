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
 * This view is used as an interface to allow the user to register.
 */

Ext.define('LIME.view.modal.Registration', {

    extend : 'Ext.window.Window',

    // set the alias
    alias : 'widget.registration',

    layout : 'auto',

    draggable : false,

    resizable : false,

    border : false,

    width : 300,

    /**
     * Shake the window as a feedback to tell the user
     * that login data was incorrect.
     */
    registrationFailed : function() {
        var win = this, posX = win.getPosition()[0], offset = 20, form = this.down("form").getForm();

        // Reset the fields
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
     * Mark password and pass confirmation as invalid.
     */
    checkPasswords : function() {
        var form = this.down('form').getForm(), 
            password = form.findField('password'), 
            passwordConfirmation = form.findField('passwordConfirmation'), 
            message = Locale.strings.passwordsDontMatch;

        if (password.value != passwordConfirmation.value) {
            password.markInvalid(message);
            passwordConfirmation.markInvalid(message);
            this.registrationFailed();
            return false;
        } else {
            return true;
        }

    },

    initComponent : function() {
        this.title = Locale.strings.userRegistration;
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
                emptyText : 'Full name',
                name : 'name',
                allowBlank : false
            }, {
                emptyText : 'Email',
                name : 'email',
                regex : /^([\w\-\'\-]+)(\.[\w-\'\-]+)*@([\w\-]+\.){1,5}([A-Za-z]){2,4}$/,
                allowBlank : false
            }, {
                emptyText : 'Password',
                inputType : 'password',
                name : 'password',
                allowBlank : false
            }, {
                emptyText : 'Password (repeat)',
                inputType : 'password',
                name : 'passwordConfirmation',
                allowBlank : false
            }],

            // The buttons
            dockedItems : [{
                xtype : 'toolbar',
                dock : 'bottom',
                ui : 'footer',

                items : ['->', {
                    xtype : 'button',
                    minWidth : 100,
                    text : Locale.strings.register
                }]
            }]
        }];
        this.callParent(arguments);
    }
});
