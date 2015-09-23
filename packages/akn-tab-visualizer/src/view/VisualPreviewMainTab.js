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
 * must include the  acknowledgment: "This product includes
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
 * TORT OR OTHERWISEfollowing, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

Ext.define('AknTabVisualizer.view.VisualPreviewMainTab', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.visualPreviewMainTab',
    controller: 'visualPreviewMainTabVController',

    requires: [
        'Ext.button.Segmented',
        // Require this layout (which is used by Ext.button.Segmented) because
        // ExtJs 5.1 is buggy ad doesn't inclue it by itself.
        'Ext.layout.container.SegmentedButton',
        'Ext.ux.IFrame'
    ],

    cls: 'editorTab',
    notEditMode: true,

    width: '100%',
    padding: 0,
    margin: 0,
    border: 0,
    layout: {
        type: 'vbox',
        align : 'stretch',
        pack  : 'start'
    },

    items: [{
        xtype: 'toolbar',
        items: [{
            xtype: 'segmentedbutton',
            value: 'A4',
            items: [
                { text: 'A4', value: 'A4'},
                { text: '100%', value: 'full'}
            ]
        }]
    }, {
        xtype: 'uxiframe',
        src: '',
        flex: 1,
        listeners: {
            'load': function () {
                // Export window Preview object
                var mainCmp = this.up('visualPreviewMainTab'),
                    win = this.getWin(),
                    Preview = win.Preview;
                if (Preview)
                    mainCmp.fireEvent('ready', Preview);
            },
            'afterRender': function () {
                var me = this;
                Server.getResourceFile('iframe/index.html', 'akn-tab-visualizer', function (path, data) {
                    me.load(path);
                });
            }
        }
    }],

    initComponent: function () {
        this.title = Locale.getString('tabTitle', 'akn-tab-visualizer');
        this.callParent(arguments);
    }
});
