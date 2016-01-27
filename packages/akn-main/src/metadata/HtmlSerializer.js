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

// Html serializer for meta.
// Eg. AknMain.metadata.HtmlSerializer.serialize(model)
// -> <div class="meta"><div class="identification"><div class="FRBRWork">...
Ext.define('AknMain.metadata.HtmlSerializer', {
    singleton: true,
    requires: [
        'AknMain.metadata.XmlSerializer'
    ],

    template: new Ext.XTemplate(
        '<div class="meta">',
        // identification
        '   <div class="identification" source="#{source}">',
        '       <div class="FRBRWork">',
        '           <div class="FRBRthis" value="{uri.work}/main"/>',
        '           <div class="FRBRuri" value="{uri.work}"/>',
        '<tpl for="aliases"><tpl if="level==\'work\'">' +
        '           <div class="FRBRalias" value="{value}" name="{name}"/>',
        '</tpl></tpl>' +
        '           <div class="FRBRdate" date="{date}" name=""/>',
        '           <div class="FRBRauthor" href="#{workAuthor}" as="#{workAuthorRole}"/>',
        '           <div class="FRBRcountry" value="{country}"/>',
        '       </div>',
        '       <div class="FRBRExpression">',
        '          <div class="FRBRthis" value="{uri.expression}/main"/>',
        '          <div class="FRBRuri" value="{uri.expression}"/>',
        '<tpl for="aliases"><tpl if="level==\'expression\'">' +
        '           <div class="FRBRalias" value="{value}" name="{name}"/>',
        '</tpl></tpl>' +
        '           <div class="FRBRauthor" href="#{expressionAuthor}" as="#{expressionAuthorRole}"/>',
        '          <div class="FRBRdate" date="{version}" name=""/>',
        '          <div class="FRBRlanguage" language="{language}"/>',
        '       </div>',
        '       <div class="FRBRManifestation">',
        '           <div class="FRBRthis" value="{uri.manifestation}/main"/>',
        '           <div class="FRBRuri" value="{uri.manifestation}"/>',
        '<tpl for="aliases"><tpl if="level==\'manifestation\'">' +
        '           <div class="FRBRalias" value="{value}" name="{name}"/>',
        '</tpl></tpl>' +
        '           <div class="FRBRauthor" href="#{manifestationAuthor}" as="#{manifestationAuthorRole}"/>',
        '           <div class="FRBRdate" date="{today}" name=""/>',
        '       </div>',
        '   </div>',
        // Publication
        '<tpl if="pubblicationDate">' +
        '   <div class="publication" date="{pubblicationDate}" name="{pubblicationName}"',
        '                showAs="{pubblicationShowAs}" number="{pubblicationNumber}"/>',
        '</tpl>' +
        // Classification
        '   <div class="classification" source="#{source}">',
        '<tpl for="classificationKeywords">' +
        '        <div class="keyword" value="{value}" showAs="{showAs}" dictionary="{dictionary}" {[this.uriAttrOpt("href", values.href)]} />',
        '</tpl>' +
        '   </div>',
        // LifeCycle
        '   <div class="lifecycle" source="#{source}">',
        '<tpl for="lifecycleEvents">' +
        '        <div class="eventRef" source="#{source}" type="{type}" eId="{eid}" date="{date}" {[this.uriAttrOpt("refersTo", values.refers)]}/>',
        '</tpl>' +
        '   </div>',
        // Workflow
        '   <div class="workflow" source="#{source}">',
        '<tpl for="workflowSteps">' +
        '        <div class="step" date="{date}" {[this.uriAttrOpt("as", values.role)]} {[this.uriAttrOpt("actor", values.actor)]} {[this.uriAttrOpt("outcome", values.outcome)]} {[this.uriAttrOpt("refersTo", values.refers)]}/>',
        '</tpl>' +
        '   </div>',
        // References
        '   <div class="references" source="#{source}">',
        '<tpl for="references">' +
        '        <div class="{type}" eId="{eid}" href="{href}" showAs="{showAs}"/>',
        '</tpl>' +
        '   </div>',

        '</div>', 
        {
            uriAttrOpt: function(attr, value) {
                attrVal = (value && value.startsWith('/')) ? value : '#'+value;
                return value ? attr+'="'+attrVal+'"' : '';
            }
        }
    ),

    constructor: function () {
        this.applyTemplate = function (data) {
            return this.template.apply(data);
        };
        return this.callParent(arguments);
    },

    serialize: function (model) {
        function mapData(store) {
            var res = [];
            store.each(function (d) { res.push(d.getData()); });
            return res;
        }

        function mapRef(data, prop) {
            data[prop] = (data[prop]) ? data[prop].get('eid') : '';
            return data;
        }

        function mapEvent(data) {
            data.date = AknMain.metadata.XmlSerializer.normalizeDate(data.date);
            mapRef(data, 'source');
            mapRef(data, 'refers');
            return data;
        }

        function mapStep(data) {
            data.date = AknMain.metadata.XmlSerializer.normalizeDate(data.date);
            mapRef(data, 'refers');
            mapRef(data, 'role');
            mapRef(data, 'outcome');
            mapRef(data, 'actor');
            return data;
        }

        var data = model.getData();
        data.date = AknMain.metadata.XmlSerializer.normalizeDate(data.date);
        data.version = AknMain.metadata.XmlSerializer.normalizeDate(data.version);
        data.pubblicationDate = AknMain.metadata.XmlSerializer.normalizeDate(data.pubblicationDate);
        data.today = AknMain.metadata.XmlSerializer.normalizeDate(new Date());
        data.references = mapData(model.references());
        data.aliases = mapData(model.aliases());
        data.lifecycleEvents = mapData(model.lifecycleEvents()).map(mapEvent);
        data.workflowSteps = mapData(model.workflowSteps()).map(mapStep);
        data.classificationKeywords = mapData(model.classificationKeywords());

        var uri = model.getUri();
        data.uri = {
            work: uri.work(),
            expression: uri.expression(),
            manifestation: uri.manifestation()
        };

        return this.applyTemplate(data);
    }
 });
