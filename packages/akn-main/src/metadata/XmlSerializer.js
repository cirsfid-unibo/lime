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

 // <akomaNtoso
 //     xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD09"
 //     xmlns:html="http://www.w3.org/1999/xhtml"
 //     xmlns:uy="http://uruguay/propetary.xsd">
 //     <documentCollection name="documentCollection">
 //         <meta>
 //             <identification source="#somebody">
 //                 <FRBRWork>
 //                     <FRBRthis value="/akn/uy/documentCollection/2015-09-15"/>
 //                     <FRBRuri value="/akn/uy/documentCollection/2015-09-15"/>
 //                     <FRBRdate date="2015-09-15" name=""/>
 //                     <FRBRauthor href="#author" as="#author"/>
 //                     <FRBRcountry value="uy"/>
 //                 </FRBRWork>
 //                 <FRBRExpression>
 //                     <FRBRthis value="/akn/uy/documentCollection/2015-09-15/spa@"/>
 //                     <FRBRuri value="/akn/uy/documentCollection/2015-09-15/spa@"/>
 //                     <FRBRdate date="2015-09-15" name=""/>
 //                     <FRBRauthor href="#somebody" as="#editor"/>
 //                     <FRBRlanguage language="spa"/>
 //                 </FRBRExpression>
 //                 <FRBRManifestation>
 //                     <FRBRthis value="/akn/uy/documentCollection/2015-09-15/spa@/main.xml"/>
 //                     <FRBRuri value="/akn/uy/documentCollection/2015-09-15/spa@/main.xml"/>
 //                     <FRBRdate date="2015-09-15" name=""/>
 //                     <FRBRauthor href="#somebody" as="#editor"/>
 //                 </FRBRManifestation>
 //             </identification>
 //             <publication date="2015-09-15" name="" showAs="" number=""/>
 //             <references source="#somebody">
 //                 <original href="" showAs="Original"/>
 //                 <TLCOrganization href="" showAs=""/>
 //                 <TLCPerson href="/ontology/person/ak/somebody" showAs="Somebody"/>
 //                 <TLCRole href="/ontology/roles/ak/author" showAs="Author of Document"/>
 //                 <TLCRole href="/ontology/roles/ak/editor" showAs="Editor of Document"/>
 //                 <TLCPerson eId="limeEditor" href="/lime.cirsfid.unibo.it" showAs="LIME editor"/>
 //             </references>
 //             <proprietary source="#crr"/>
 //         </meta>
 //         <collectionBody>
 //             <component eId="cmp_1" wId="comp1"/>
 //             <component eId="cmp_2" wId="comp2"/>
 //             <component eId="cmp_3" wId="comp3"/>
 //         </collectionBody>
 //     </documentCollection>
 //     <components eId="cmpnts">


// Xml serializer for meta.
// Eg. AknMain.metadata.XmlSerializer.serialize(model)
// -> "<meta><identificat ... </meta>"
Ext.define('AknMain.metadata.XmlSerializer', {
    singleton: true,

    template: new Ext.XTemplate([
        '<meta>',
        '   <identification source="#{source.eid}">',
        '       <FRBRWork>',
        '           <FRBRthis value="/akn/{country}/{type}/{date}"/>',
        '           <FRBRuri value="/akn/{country}/{type}/{date}"/>',
        '           <FRBRdate date="{date}" name=""/>',
        '           <FRBRcountry value="{country}"/>',
        '       </FRBRWork>',
        '       <FRBRExpression>',
        '          <FRBRthis value="/akn/{country}/{type}/{date}/{language}@"/>',
        '          <FRBRuri value="/akn/{country}/{type}/{date}/{language}@"/>',
        '          <FRBRdate date="{version}" name=""/>',
        '          <FRBRlanguage language="{language}"/>',
        '       </FRBRExpression>',
        '       <FRBRManifestation>',
        '           <FRBRthis value="/akn/{country}/{type}/{date}/{language}@/{media}"/>',
        '           <FRBRuri value="/akn/{country}/{type}/{date}/{language}@/{media}"/>',
        '           <FRBRdate date="{today}" name=""/>',
        '       </FRBRManifestation>',
        '   </identification>',
        '   <publication date="{pubblicationDate}" name="{pubblicationName}"',
        '                showAs="{pubblicationShowAs}" number="{pubblicationNumber}"/>',
        '   <references source="#{source.eid}">',
        '<tpl for="references">' +
        '        <{type} eId="{eid}" href="{href}" showAs="{showAs}"/>',
        '</tpl>' +
        '   </references>',
        '</meta>'
    ].join('\n')),

    serialize: function (model) {
        console.info(model);
        var data = model.getData();
        data.date = this.normalizeDate(data.date);
        data.version = this.normalizeDate(data.version);
        data.pubblicationDate = this.normalizeDate(data.pubblicationDate);
        data.today = this.normalizeDate(new Date());
        data.source = model.getSource().getData();
        data.references = [];
        model.references().each(function (d) { return data.references.push(d.getData()); });

        console.info(data);

        return this.template.apply(data);
    },

    normalizeDate: function (date) {
        if (!date) return '';
        function padding (n) { return n >= 10 ? 10 : '0' + n; }
        return [
            date.getFullYear(),
            padding(date.getMonth()),
            padding(date.getDate())
        ].join('-');
    }
 });
