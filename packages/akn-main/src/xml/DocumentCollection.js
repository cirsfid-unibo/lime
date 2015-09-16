/*
 * Copyright (c) 2015 - Copyright holders CIRSFID and Department of
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

// Utility functions for creating and handling document collections
// This class, like the others in this folder, work directly on AkomaNtoso xml,
// do not need XSLT and are generic.
Ext.define('AknMain.xml.DocumentCollection', {
    requires: [
        'AknMain.metadata.Document',
        'AknMain.metadata.XmlSerializer'
    ],

    config: {
        linkedDocuments: [],
        docLang: 'en',
        docLocale: 'eng'
    },

    constructor: function (config) {
        this.initConfig(config);
        return this;
    },

    toHtmlToso: function (callback) {
        var content = generateXml();
        // Detect the right XSLT for HTMLToso conversion
        var lang = Utilities.detectMarkingLang(content);
        var xslt = Config.getLanguageTransformationFile("languageToLIME", lang);
        Server.applyXslt(content, xslt, function (content) {
            console.info('htmltoso', content, lang);
            callback(content, lang);
        });
    },

    generateXml: function () {
        var meta = this.generateMeta();
        var str = AknMain.metadata.XmlSerializer.serialize(meta);
        console.info(meta);
        console.info(str);
    },

    generateMeta: function () {
        var meta = new AknMain.metadata.Document();
        meta.set('country', this.getDocLang());
        meta.set('type', 'documentCollection');
        meta.set('date', new Date());
        meta.set('language', this.getDocLocale());
        meta.set('media', 'main.xml');
        meta.set('pubblicationDate', new Date());

        meta.setSource(
            meta.references().add({
                eid: 'source',
                type: 'TLCPerson',
                href: '/ontology/person/' + this.getDocLang() + '/somebody',
                showAs: 'Somebody'
            })[0]
        );
        meta.aliases().add({name: 'nir', value: 'nir: ...'});

        return meta;
    }

    // Private
});
