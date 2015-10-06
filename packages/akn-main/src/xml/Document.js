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

// Parse xml and allow to use XPath on it.
// Eg. var doc = AknMain.xml.Document.parse('<akomaNtoso></akomaNtoso>', 'akn');
// doc.select('//akn:references') -> [Dom elements]
// doc.getXml('//akn:meta') -> "<meta xmlns="">...</meta>"
// doc.getValue('//FRBRWork/FRBRdate/@date') -> "2015-04-03"
// doc.query('count(//akn:references)') -> "4"
// The second parameter (ns) is the namespace prefix which can be used in the
// xpath queries to match the namespace of root element. (which often is the default one)
Ext.define('AknMain.xml.Document', {
    singleton: true,

    parser: new DOMParser(),
    serializer: new XMLSerializer(),

    parse: function (xml, ns) {
        var dom = this.parser.parseFromString(xml, "application/xml");
        return this.newDocument(dom, ns);
    },

    newDocument: function (dom, ns) {
        var me = this;
        var document = dom.ownerDocument || dom;
        var dom = dom.ownerDocument == null ? dom.documentElement : dom;

        //
        var defaultResolver = document.createNSResolver(dom).lookupNamespaceURI;
        var defaultNs = dom.namespaceURI || dom.firstElementChild.namespaceURI;
        var nsResolver = function (prefix) {
            if (prefix == ns) return defaultNs;
            else defaultResolver(prefix);
        }

        function executeXpath (xpath, type) {
            return document.evaluate(
                xpath,
                dom,
                nsResolver,
                type,
                null
            );
        }

        return {
            // Return list of dom element matchers
            select: function (xpath) {
                var result = executeXpath(xpath, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
                var matches = [];
                for (var i=0; i < result.snapshotLength; i++)
                    matches.push(result.snapshotItem(i));
                return matches;
            },

            // Return string concatenation of matches
            getValue: function (xpath) {
                return this.select(xpath)
                    .map(function (el) { return el.textContent})
                    .join('\n');
            },

            // Execute xpath function and return a string
            query: function (xpath) {
                return executeXpath(xpath, XPathResult.STRING_TYPE).stringValue;
            },

            // Return serialization of first match
            getXml: function (xpath) {
                var result = executeXpath(xpath, XPathResult.FIRST_ORDERED_NODE_TYPE);
                if (result.singleNodeValue)
                    return me.serializer.serializeToString(result.singleNodeValue);
            }
        };
    }
});
