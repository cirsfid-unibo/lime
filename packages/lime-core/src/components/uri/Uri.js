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

// This view implements a URI viewer of the document.
// Actually this can display either the URI or the Path.
Ext.define('LIME.components.uri.Uri', {
    extend: 'Ext.Component',
    alias: 'widget.mainEditorUri',
    controller: 'uri',
    requires: [
        'LIME.components.uri.UriController'
    ],

    tpl: new Ext.XTemplate(
        '<div class="inner">',
            '<tpl for="components" between="/">',
                '<a path="{id}" class="uriSelector" href="javascript:;">',
                    '{text}',
                '</a>',
            '</tpl>',
            '<a class="switch" href="#">',
                '<tpl if="isUri">',
                    '<i class="fa fa-toggle-on"></i>Uri',
                '<tpl else>',
                    '<i class="fa fa-toggle-off"></i>Path',
                '</tpl>',
            '</a>',
        '</div>'
    ),

    data: [],

    baseCls: 'mainEditorUri',
    height: 30,

    setUri: function (uri) {
        this.setData({
            components: this.getComponents(uri),
            isUri: true
        });
    },

    setPath: function (path) {
        this.setData({
            components: this.getComponents(path),
            isUri: false
        });
    },

    // Translate a uri or path to an array of objects with a name and
    // the path to that element.
    getComponents: function (path) {
        return path
        .split('/')
        .map(function (text, index, array) {
            return {
                text: text,
                id: array.slice(0, index).join('/')
            };
        });
    },

    listeners: [{
        element: 'el',
        delegate: '.uriSelector',
        click: function (ev, a) {
            var uri = a.getAttribute('path');
            Ext.getCmp(this.id).fireEvent('itemClicked', uri);
        }
    }, {
        element: 'el',
        delegate: '.switch',
        click: function (ev, el) {
            var cmp = Ext.getCmp(this.id),
                displayUri = !cmp.getData().isUri;
            cmp.fireEvent('pathSwitcherChanged', displayUri);
        }
    }]
});
