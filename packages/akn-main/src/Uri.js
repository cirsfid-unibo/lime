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
// uri.component   "main" "table1" (optional) |
// uri.language    "ita"                      | Expression
// uri.version     "2015-03-12"    (optional) |
// uri.official    "official"      (optional) |
// uri.generation  "2015-04-11"    (optional) |
// uri.media       ".xml"                     | Manifestation
// uri.path        "http://sinatra ... xml"   | Item
//
// uri.work()          -> "/akn/it/act/legge/stato/2014-09-12/2/main"
// uri.expression()    -> "/akn/it/act/legge/stato/2014-09-12/2/ita@2015-03-12!official/2015-04-11/main"
// uri.manifestation() -> "/akn/it/act/legge/stato/2014-09-12/2/ita@2015-03-12!official/2015-04-11/main.xml"
// uri.item()          -> "http://sinatra.cirsfid.unibo.it/node/documentsdb/mnardi@unibo.it/myFiles/esempio.xml"
// work and expression allows you to hide the component part (Eg. FRBRuri generation)
// uri.work(true)      -> "/akn/it/act/legge/stato/2014-09-12/2"

// Todo: extract code
// Fix documentation
// handle components
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
            component: undefined,
            media: 'xml',
            path: undefined
        };
        uri.work = this.uriFunctions.work.bind(uri),
        uri.expression = this.uriFunctions.expression.bind(uri),
        uri.manifestation = this.uriFunctions.manifestation.bind(uri),
        uri.item = this.uriFunctions.item.bind(uri)
        return uri;
    },

    parse: function (uriStr) {
        var uri = this.empty(),
            components = uriStr.split('/');
            is = this.is;

        if (is.component(components[components.length-1]))
            uri.component = components.pop();
        required(is.empty, 'Unexpected uri start');
        optional(is.equalTo('akn'));
        uri.country = required(is.country, 'Missing country');
        uri.type = required(is.type, 'Invalid doc type');

        uri.date = optional(is.date, function () {
            uri.subtype = required(is.subtype, 'Invalid date and subtype');
            return optional(is.date, function () {
                uri.author = required(is.anything);
                return required(is.date, 'Invalid date')
            });
        });
        var version = optional(is.version, function () {
            uri.name = optional(is.anything);
            return optional(is.anything);
        });

        if (is.version(version)) {
            uri.language = version.substring(0, 3);
            uri.version = version.substring(4);
            if (uri.version === '') uri.version = uri.date;

            var lastElement = optional(is.anything);
            if (lastElement && lastElement.endsWith('.xml')) {
                uri.media = 'xml';
                uri.component = lastElement.substring(0, lastElement.length - 4);
            } else if (lastElement) {
                uri.component = lastElement;
            }
        }

        function optional(test, failure) {
            var item = components.shift();
            if (test(item)) {
                return item;
            } else {
                components.unshift(item);
                return failure ? failure(item) : undefined;
            }
        }
        function required(test, errorMsg) {
            return optional(test, function (item) {
                throw new Error(errorMsg + ': "' + item + '"');
            });
        }

        return uri;
    },

    // Functions to check if a string can be a certain URI component
    is: {
        // Accept every non empty string
        anything: function (item) {
            return !!item;
        },
        // Accept only empty strings
        empty: function (item) {
            return item === '';
        },
        // Equality check
        equalTo: function (str) {
            return function (item) {
                return item === str;
            }
        },
        // Accept country codes
        country: function (item) {
            return item && (item.length === 2 || item.length === 4);
        },
        // Accept dates
        date: function (item) {
            return !isNaN(Date.parse(item));
        },
        // Accept versions eg "ita@2009-10-10"
        version: function (item) {
            return item && !!item.match(/^\w\w\w@/);
        },
        // Accept document types
        type: function (item) {
            return item && [
                'doc',
                'act',
                'bill',
                'debaterecord',
                'documentCollection'
            ].indexOf(item) !== -1;
        },
        // Accept subtypes
        subtype: function (item) {
            return item && !!item.match(/^[a-zA-Z\.]*$/);
        },
        author: function (item) {
            return item && !!item.match(/^[a-zA-Z\.]*$/);
        },
        component: function (item) {
            return item && [
                'main',
                'table',
                'schedule'
            ].indexOf(item) !== -1;
        }
    },

    // URI output functions
    // Eg. uri.work()
    uriFunctions: {
        work: function (hideComponent) {
            return '/akn' +
                   '/' + this.country +
                   '/' + this.type +
                   (this.subtype ? '/' + this.subtype : '') +
                   (this.author ? '/' + this.author : '') +
                   '/' + this.date +
                   (this.name ? '/' + this.name : '') +
                   ((this.component && !hideComponent) ? '/' + this.component : '');
        },

        expression: function (hideComponent) {
            var version = ((this.version && this.version != this.date) ? this.version : '');
            return this.work(true) +
                   '/' + this.language +
                   '@' + version +
                   (this.official ? '!' + this.official : '') +
                   ((this.component && !hideComponent) ? '/' + this.component : '');
        },

        manifestation: function () {
            return this.expression(true) +
                   '/' + this.component + '.' + this.media;
        },

        item: function () {
            return this.path;
        }
    }
});
