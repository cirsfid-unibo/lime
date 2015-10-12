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


// Class for AkomaNtoso URI management
// Note: documentation of AkomaNtoso URI is a little vague in some places.
// This implementation is not (and can't be) perfect.
//
// var uri = AknMain.Uri.parse(string uri work/expression/manifestation)
//
// uri.country     "it"                       | Work
// uri.type        "act"                      |
// uri.subtype     "legge" (optional)         |
// uri.author      "stato" (optional)         |
// uri.date        "2014-09-12"               |
// uri.name        "2" "nomelegge" (optional) |
// uri.language    "ita"                      | Expression
// uri.version     "2015-03-12"               |
// uri.official    "official"      (optional) |
// uri.generation  "2015-04-11"    (optional) |
// uri.media       "main.xml"                 | Manifestation
// uri.path        "http://sinatra ... xml"   | Item
//
// uri.work()          -> "/akn/it/act/legge/stato/2014-09-12/2"
// uri.expression()    -> "/akn/it/act/legge/stato/2014-09-12/2/ita@2015-03-12!official/2015-04-11"
// uri.manifestation() -> "/akn/it/act/legge/stato/2014-09-12/2/ita@2015-03-12!official/2015-04-11/main.xml"
// uri.item()          -> "http://sinatra.cirsfid.unibo.it/node/documentsdb/mnardi@unibo.it/myFiles/esempio.xml"
Ext.define('AknMain.Uri', {
    singleton: true,

    empty: function () {
        var uri = {
            country: undefined,
            type: undefined,
            subtype: undefined,
            author: undefined,
            date: undefined,
            name: undefined,
            language: undefined,
            version: undefined,
            official: undefined,
            generation: undefined,
            media: undefined,
            path: undefined
        };
        uri.work = this.uriFunctions.work.bind(uri),
        uri.expression = this.uriFunctions.expression.bind(uri),
        uri.manifestation = this.uriFunctions.manifestation.bind(uri),
        uri.item = this.uriFunctions.item.bind(uri)
        return uri;
    },

    parse: function (uriStr) {
        var workStr = uriStr;
        var expressionStart = uriStr.search(/\/\w\w\w@/);
        var expressionStr = "";
        if (expressionStart != -1) {
            workStr = uriStr.substring(0, expressionStart);
            expressionStr = uriStr.substring(expressionStart);
        }

        var work = workStr.split('/');
        if (work[0]) error('Unexpected uri start', work[0]);
        if (work[1] != 'akn') error('Missing /akn/ start', work[1]);

        var country = work[2];
        if (!country || (country.length != 2 && country.length != 4))
            error('Missing country', country);

        var type = work[3];
        if (!type || ['doc', 'act', 'bill', 'debaterecord'].indexOf(type) == -1)
            error('Invalid doc type', type);

        var dateIndex = 4;
        // If work[4] is not a date, expect it to be the subtype
        var subtype;
        if (isNaN(Date.parse(work[4]))) {
            subtype = work[4];
            dateIndex++;
        }

        // If work[4] and work[5] are not dates,
        // expect work[5] it to be the author.
        // Problem: we do not support author if there is no subtype
        var author;
        if (subtype && !Date.parse(work[5])) {
            author = work[5];
            dateIndex++;
        }

        var date = work[dateIndex];
        if (isNaN(Date.parse(date))) {
            if (dateIndex != 4) date = work.slice(4, 7);
            error('Invalid date', date);
        }

        var name = work[dateIndex + 1];

        // Expression
        var language;
        var version;
        var result;
        var lastMatch = 0;
        try {
            result = expressionStr.match(/\/(\w\w\w)@/)
            language = result[1];
            lastMatch = result.index + result[0].length;
        } catch (e) { if (expressionStr) error('Missing language', expressionStr); }
        try {
            // version = expressionStr.match(/\/\w\w\w@([\w\W\d\-]*)(!|$|\/)/)[1];
            result = expressionStr.match(/\/\w\w\w@([^!$\/]*)/);
            version = result[1];
            lastMatch = result.index + result[0].length;
            if (version === '') version = date;
        } catch (e) { if (expressionStr) error('Missing version', expressionStr); }

        // Manifestation
        var manifestationStr = expressionStr.substring(lastMatch + 1);
        var media = manifestationStr;

        var uri = this.empty();
        uri.country = country;
        uri.type = type;
        uri.subtype = subtype;
        uri.author = author;
        uri.date = date;
        uri.name = name;
        uri.language = language;
        uri.version = version;
        uri.media = media;
        return uri;

        function error (msg, piece) {
            throw new Error(msg + ': "' + piece + '"');
        }
    },

    uriFunctions: {
        work: function () {
            return '/akn' +
                   '/' + this.country +
                   '/' + this.type +
                   (this.subtype ? '/' + this.subtype : '') +
                   (this.author ? '/' + this.author : '') +
                   '/' + this.date +
                   (this.name ? '/' + this.name : '');
        },

        expression: function () {
            return this.work() +
                   '/' + this.language +
                   '@' + (this.version != this.date ? this.version : '') +
                   (this.official ? '!' + this.official : '') +
                   (this.generation ? '/' + this.generation : '');
        },

        manifestation: function () {
            return this.expression() +
                   '/' + this.media;
        },

        item: function () {
            return this.path;
        }
    }
});
