/*
 * Copyright (c) 2016 - Copyright holders CIRSFID and Department of
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

Ext.define('AknMetadata.newMeta.NotesTab', {
    extend: 'AknMetadata.newMeta.EditorTab',
    xtype: 'akn-metadata-tab-notes',

    requires: [
        'AknMetadata.newMeta.EditorTab'
    ],

    title: Locale.getString('notes', 'akn-metadata'),
    glyph: 'xf249@FontAwesome',
    layout: 'fit',

    items: [{
        xtype: 'metadataeditortable',
        title: Locale.getString('notes', 'akn-metadata'),
        bind: { store: '{document.notes}' },
        columns: [
            { text: Locale.getString('marker', 'akn-metadata'), dataIndex: 'marker', editor: 'textfield', allowBlank: true },
            {
                text: Locale.getString('placement', 'akn-metadata'),
                dataIndex: 'placement',
                renderer: function (r) {
                    return Locale.getString(r, 'akn-metadata');
                },
                editor: {
                    xtype: 'combo',
                    store: AknMain.metadata.Note.validators.placement[0].list
                            .map(function(type) {
                                return [type, Locale.getString(type, 'akn-metadata')]
                            })
                }
            },
            {
                flex: 1,
                text: Locale.getString('content', 'akn-metadata'),
                dataIndex: 'content',
                editor: {
                    xtype: 'textarea',
                    validator: function(val) {
                        try {
                            var xmlDoc = Xml.Document.parse('<p>'+val+'</p>');
                            if (xmlDoc.select('//*[local-name()="parsererror"]').length > 0) {
                                return Locale.getString('contentParseError', 'akn-metadata');
                            }
                            return true;
                        } catch(e) {
                            return Locale.getString('contentParseError', 'akn-metadata');
                        }
                    }
                }
            }
        ]
    }]
})
