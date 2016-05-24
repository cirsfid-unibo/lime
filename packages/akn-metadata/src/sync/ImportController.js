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

// This controller loads in the metadata store the right values every time
// a new document is loaded in LIME.
Ext.define('AknMetadata.sync.ImportController', {
    extend: 'Ext.app.Controller',

    requires: [
        'AknMain.xml.Document',
        'AknMain.Uri',
        'AknMain.metadata.HtmlSerializer'
    ],

    listen: {
        global:  {
            loadDocument: 'onLoadDocument'
        }
    },

    // On the loadDocument event, load metadata from the original xml document.
    // No HtmlToso, no XSLTs, just plain and simple AkomaNtoso. KISS. <3
    onLoadDocument: function (config) {
        var metaNodes = this.getMetadataNodes(config);
        if (!metaNodes.length) return;

        var metadata = Ext.getStore('metadata');
        metadata.removeAll();
        try {
            metaNodes.forEach(function(meta) {
                var doc = AknMain.xml.Document.newDocument(meta, 'akn');
                this.importDocumentMeta(doc, metadata.newDocument());
            }, this);
        } catch (e) {
            console.warn('Exception parsing metadata: ', e);
            console.warn(e.stack);
        }
    },

    // Get metadata nodes in the originalXml or from a generated xml from config
    getMetadataNodes: function(config) {
        var metaNodes = [];
        try {
            metaNodes = AknMain.xml.Document.parse(config.originalXml, 'akn').select('//akn:meta');
        } catch(e) {
            console.warn('Exception parsing xml: ', e);
        }
        if (!metaNodes.length) {
            var xml = this.generateMetaXml(config);
            metaNodes = xml && AknMain.xml.Document.parse(xml, 'akn').select('//akn:meta') || [];
        }

        return metaNodes;
    },

    importDocumentMeta: function(akn, store) {
        var expUri = akn.getValue('.//akn:FRBRExpression/akn:FRBRuri/@value'),
            uri = expUri ? AknMain.Uri.parse(expUri) : AknMain.Uri.empty();

        return main();

        function main () {
            importReferences();
            importLifecycleEvents();
            importWorkflowSteps();
            importClassificationKeywords();
            importAliases();
            importModifications();

            importWork();
            importExpression();
            importManifestation();
            importPublication();

            store.set('type', akn.query('local-name(..)'));

            store.setSource(getReference('.//akn:identification/@source', {
                eid: 'source',
                type: 'TLCPerson',
                href: '/ontology/person/somebody',
                showAs: 'Somebody'
            }));
        }

        function importReferences () {
            akn.select('.//akn:references/*').forEach(function (reference) {
                var data = {
                    eid: reference.getAttribute('eId'),
                    type: reference.tagName,
                    href: reference.getAttribute('href'),
                    showAs: reference.getAttribute('showAs')
                }
                store.references().add(data);
            });
        }

        function importLifecycleEvents() {
            var xpath = './/akn:lifecycle/akn:eventRef';
            akn.select(xpath).forEach(function (event, index) {
                var xpathIndex = xpath+'['+(index+1)+']';
                var data = {
                    eid: event.getAttribute('eId'),
                    type: event.getAttribute('type'),
                    href: event.getAttribute('href'),
                    showAs: event.getAttribute('showAs'),
                    date: new Date(event.getAttribute('date')),
                    source: getReference(xpathIndex+'/@source'),
                    refers: getReference(xpathIndex+'/@refersTo')
                }
                store.lifecycleEvents().add(data);
            });
        }

        function importWorkflowSteps() {
            var xpath = './/akn:workflow/akn:step';
            akn.select(xpath).forEach(function (step, index) {
                var xpathIndex = xpath+'['+(index+1)+']';
                var data = {
                    eid: step.getAttribute('eId'),
                    date: new Date(step.getAttribute('date')),
                    actor: getReference(xpathIndex+'/@actor')
                            || getReference(xpathIndex+'/@by'),
                    role: getReference(xpathIndex+'/@as'),
                    outcome: getReference(xpathIndex+'/@outcome'),
                    refers: getReference(xpathIndex+'/@refersTo')
                }
                store.workflowSteps().add(data);
            });
        }

        function importClassificationKeywords() {
            var xpath = './/akn:classification/akn:keyword';
            akn.select(xpath).forEach(function (keyword, index) {
                var data = {
                    value: keyword.getAttribute('value'),
                    showAs: keyword.getAttribute('showAs'),
                    dictionary: keyword.getAttribute('dictionary'),
                    href: AknMain.metadata.HtmlSerializer.normalizeHref(keyword.getAttribute('href'))
                }
                store.classificationKeywords().add(data);
            });
        }

        function importAliases () {
            akn.select('.//akn:FRBRalias').forEach(function (alias) {
                var data = {
                    name: alias.getAttribute('name'),
                    value: alias.getAttribute('value'),
                    level: {
                        FRBRWork: 'work',
                        FRBRExpression: 'expression',
                        FRBRManifestation: 'manifestation',
                        FRBRItem: 'item'
                    }[alias.parentNode.tagName]
                };
                store.aliases().add(data);
            });
        }

        function importModifications () {
            var addTextualChanges = function(node, mod) {
                var data = {
                    type: node.tagName,
                    href: AknMain.metadata.HtmlSerializer.normalizeHref(node.getAttribute('href')),
                    content: akn.getValue('.//text()', node).trim()
                };
                mod.textualChanges().add(data);
            }

            var addSourceDestination = function(node, mod) {
                var data = {
                    type: node.tagName,
                    href: AknMain.metadata.HtmlSerializer.normalizeHref(node.getAttribute('href')),
                    pos: node.getAttribute('pos'),
                    exclusion: node.getAttribute('exclusion'),
                    incomplete: node.getAttribute('incomplete'),
                    upTo: node.getAttribute('upTo')
                };
                mod.sourceDestinations().add(data);
            }

            var addModification = function(node) {
                var amndType = (node.parentNode.tagName == 'activeModifications') ? 'active' : 'passive';
                var data = {
                    amendmentType: amndType,
                    type: node.tagName,
                    modType: node.getAttribute('type'),
                    eid: node.getAttribute('eId'),
                    wid: node.getAttribute('wId'),
                    period: node.getAttribute('period'),
                    status: node.getAttribute('status'),
                    refers: node.getAttribute('refersTo')
                };
                data.period = data.period ? data.period.substring(1) : '';
                data.refers = data.refers ? data.refers.substring(1) : '';

                var mod = store.modifications().add(data)[0];
                akn.select('./akn:old | ./akn:new', node).forEach(function(nd) {
                    addTextualChanges(nd, mod);
                });
                akn.select('./akn:source | ./akn:destination', node).forEach(function(nd) {
                    addSourceDestination(nd, mod);
                });
            }

            akn.select('.//akn:textualMod').forEach(addModification);
        }

        function importWork() {
            var date = new Date(akn.getValue('.//akn:FRBRWork/akn:FRBRdate/@date') || uri.date);
            date = (Utilities.isValidDate(date)) ? date : new Date();
            store.set('date', Utilities.fixDateTime(date));
            store.set('author',  uri.author);
            store.set('number',  akn.getValue('.//akn:FRBRWork/akn:FRBRnumber/@value'));
            store.set('name',    akn.getValue('.//akn:FRBRWork/akn:FRBRname/@value'));
            if (!store.get('name') && !store.get('number')) store.set('name', uri.name);
            store.set('subtype', akn.getValue('.//akn:FRBRWork/akn:FRBRsubtype/@value') || uri.subtype);
            store.set('country', akn.getValue('.//akn:FRBRWork/akn:FRBRcountry/@value') || uri.country);
            store.set('authoritative', akn.getValue('.//akn:FRBRWork/akn:FRBRauthoritative/@value') === 'true');
            store.set('prescriptive', akn.getValue('.//akn:FRBRWork/akn:FRBRprescriptive/@value') === 'true');
            store.setWorkAuthor(getReference('.//akn:FRBRWork/akn:FRBRauthor/@href'));
            store.setWorkAuthorRole(getReference('.//akn:FRBRWork/akn:FRBRauthor/@as'));
        }

        function importExpression () {
            var date = new Date(akn.getValue('.//akn:FRBRExpression/akn:FRBRdate/@date') || uri.version);
            if (Utilities.isValidDate(date))
                store.set('version', Utilities.fixDateTime(date));
            store.set('language', akn.getValue('.//akn:FRBRExpression/akn:FRBRlanguage/@language') || uri.language);
            store.setExpressionAuthor(getReference('.//akn:FRBRExpression/akn:FRBRauthor/@href'));
            store.setExpressionAuthorRole(getReference('.//akn:FRBRExpression/akn:FRBRauthor/@as'));
        }

        function importManifestation () {
            store.set('component', 'main');
            store.set('media', 'xml');
            store.setManifestationAuthor(getReference('.//akn:FRBRManifestation/akn:FRBRauthor/@href'));
            store.setManifestationAuthorRole(getReference('.//akn:FRBRManifestation/akn:FRBRauthor/@as'));
        }

        function importPublication () {
            store.set('pubblicationName', akn.getValue('.//akn:publication/@name'));
            store.set('pubblicationShowAs', akn.getValue('.//akn:publication/@showAs'));
            store.set('pubblicationNumber', akn.getValue('.//akn:publication/@number'));
            var date = new Date(akn.getValue('.//akn:publication/@date'));
            if (Utilities.isValidDate(date))
                store.set('pubblicationDate', date);
        }

        function getReference (xpath, fallback) {
            var eid = akn.getValue(xpath).substring(1),
                reference = eid && store.references().findRecord('eid', eid);

            if (reference)
                return reference;
            else if (fallback)
                return store.references().add(fallback)[0];
        }
    },

    generateMetaXml: function(config) {
        var metaTpl = new Ext.Template([
            '<akomaNtoso xmlns="akn">',
                '<{docType}>',
                    '<meta>',
                        '<identification>',
                            '<FRBRWork>',
                                '<FRBRcountry value="{docLocale}"/>',
                            '</FRBRWork>',
                            '<FRBRExpression>',
                                '<FRBRlanguage language="{docLang}"/>',
                            '</FRBRExpression>',
                        '</identification>',
                    '</meta>',
                '</{docType}>',
            '</akomaNtoso>'
        ]);
        return (config.docType && config.docLocale && config.docLang) ? metaTpl.apply(config) : "";
    }
});
