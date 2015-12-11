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

// Xml serializer for meta.
// Eg. AknMain.metadata.XmlSerializer.serialize(model)
// -> "<meta><identificat ... </meta>"
Ext.define('AknMain.metadata.XmlSerializer', {
    singleton: true,

    requires: [
        'AknMain.utilities.Template'
    ],

    template: [
        '<meta>',
        // identification
        '   <identification source="#{source}">',
        '       <FRBRWork>',
        '           <FRBRthis value="{uri.work}/main"/>',
        '           <FRBRuri value="{uri.work}"/>',
        '<tpl for="aliases"><tpl if="level==\'work\'">' +
        '           <FRBRalias value="{value}" name="{name}"/>',
        '</tpl></tpl>' +
        '           <FRBRdate date="{date}" name=""/>',
        '<tpl if="workAuthor">' +
        '           <FRBRauthor href="#{workAuthor}" as="#{workAuthorRole}"/>',
        '</tpl>' +
        '           <FRBRcountry value="{country}"/>',
        '       </FRBRWork>',
        '       <FRBRExpression>',
        '          <FRBRthis value="{uri.expression}/main"/>',
        '          <FRBRuri value="{uri.expression}"/>',
        '<tpl for="aliases"><tpl if="level==\'expression\'">' +
        '           <FRBRalias value="{value}" name="{name}"/>',
        '</tpl></tpl>' +
        '<tpl if="expressionAuthor">' +
        '           <FRBRauthor href="#{expressionAuthor}" as="#{expressionAuthorRole}"/>',
        '</tpl>' +
        '          <FRBRdate date="{version}" name=""/>',
        '          <FRBRlanguage language="{language}"/>',
        '       </FRBRExpression>',
        '       <FRBRManifestation>',
        '           <FRBRthis value="{uri.manifestation}/main"/>',
        '           <FRBRuri value="{uri.manifestation}"/>',
        '<tpl for="aliases"><tpl if="level==\'manifestation\'">' +
        '           <FRBRalias value="{value}" name="{name}"/>',
        '</tpl></tpl>' +
        '<tpl if="manifestationAuthor">' +
        '           <FRBRauthor href="#{manifestationAuthor}" as="#{manifestationAuthorRole}"/>',
        '</tpl>' +
        '           <FRBRdate date="{today}" name=""/>',
        '       </FRBRManifestation>',
        '   </identification>',
        // Publication
        '   <publication date="{pubblicationDate}" name="{pubblicationName}"',
        '                showAs="{pubblicationShowAs}" number="{pubblicationNumber}"/>',
        // References
        '   <references source="#{source}">',
        '<tpl for="references">' +
        '        <{type} eId="{eid}" href="{href}" showAs="{showAs}"/>',
        '</tpl>' +
        '   </references>',

        '</meta>'
    ],

    constructor: function () {
        var template = new AknMain.utilities.Template(this.template);
        this.applyTemplate = function (data) {
            return template.apply(data);
        };
        return this.callParent(arguments);
    },

    serialize: function (model) {
        function mapData(store) {
            var res = [];
            store.each(function (d) { res.push(d.getData()); });
            return res;
        }
        console.info(model);
        var data = model.getData();
        data.date = this.normalizeDate(data.date);
        data.version = this.normalizeDate(data.version);
        data.pubblicationDate = this.normalizeDate(data.pubblicationDate);
        data.today = this.normalizeDate(new Date());
        data.references = mapData(model.references());
        data.aliases = mapData(model.aliases());

        var uri = model.getUri();
        data.uri = {
            work: uri.work(),
            expression: uri.expression(),
            manifestation: uri.manifestation()
        };

        console.info(data);

        return this.applyTemplate(data);
    },

    // Returns the ISO string of the date, removing the time
    normalizeDate: function (date) {
        if (!date) return '';
        try {
            return date.toISOString().substring(0, 10);
        } catch(e) {
            console.error('Invalid date: ', date, e);
        }
        return '';
    }
 });
