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

Ext.define('LIME.view.Main', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Ext.ux.TabCloseMenuImproved',
        'Ext.ux.form.field.TinyMCE',
        'Extra.ux.toggleslide.view.ToggleSlide',
        'LIME.view.main.Editor',
        'LIME.view.ContextMenu',
        'LIME.view.main.editor.Path',
        'LIME.components.uri.Uri',
        'LIME.view.DocumentLangSelector',
        'LIME.view.MarkingMenu',
        'LIME.view.Outliner',
        'LIME.view.main.ContextPanel'
    ],

    // set the alias
    alias: 'widget.main',

    // This is istantiated by the MarkingMenu controller on language loaded.
    // TODO: This should really be contained inside this component items and
    // just reload its data on language load.
    markingMenu: {
        xtype: 'markingMenu',
        cls: 'markingMenuContainer',
        region: 'east',
        width: '26%',
        collapsible: true,
        expandable: true,
        resizable: true,
        autoScroll: true
    },

    initComponent: function() {
        this.items = [{
            // This is the main tab. It contains the TinyMCE editor on the center and
            // the outliner and markingMenu panels on the sides.
            cls: 'editor',
            itemId: 'mainEditorTab',
            layout: 'border',
            padding: '3 0 0 0',
            title: Locale.getString('mainEditor'),
            items: [{
                region: 'center',
                // xtype: 'panel',
                // layout: 'fit',
                // items: [{
                    xtype: 'mainEditor',
                // }],
                // bbar: [{
                //     xtype: 'mainEditorPath'
                // }]
                margin: '0 3'
            }, {
                region: 'south',
                xtype: 'mainEditorPath'
            },{
                xtype: 'contextPanel',
                region: 'south'
            }, {
                xtype: 'outliner',
                region: 'west',
                expandable: true,
                resizable: true,
                width: '17%',
                autoScroll: true
            }]
        }];
        this.plugins = {
            ptype: 'tabclosemenuimproved',
            closeTabText: Locale.getString('closeTabText'),
            closeOthersTabsText: Locale.getString('closeOthersTabsText'),
            closeAllTabsText: Locale.getString('closeAllTabsText')
        };
        this.callParent(arguments);
    }
});
