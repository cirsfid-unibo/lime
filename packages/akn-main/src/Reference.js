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


// Class for AkomaNtoso Reference management
// Note: documentation of AkomaNtoso URI is a little vague in some places.
// This implementation is not (and can't be) perfect.
//
// var reference = AknMain.Reference.parse(string uri href of reference)
//
// ref.internel    "false"                    | Type of reference internal or not
// ref.id          "art_1"                    | Fragment identifier
// ref.uri         AknMain.Uri                | Uri part of href
//
// ref.ref()           -> "/akn/it/act/legge/stato/2014-09-12/2/ita@2015-03-12!official/2015-04-11#art_2"
Ext.define('AknMain.Reference', {
    singleton: true,

    requires: ['AknMain.Uri'],

    empty: function () {
        var ref = {
            id: undefined,
            internal: undefined
        };
        ref.ref = this.refFunctions.ref.bind(ref);
        ref.uri = AknMain.Uri.empty();
        return ref;
    },

    parse: function (refStr) {
        if ( !refStr )
            error('Unexpected empty string', '');
        var idStrSep = refStr.indexOf('#');
        var uriStr = (idStrSep != -1) ? refStr.substring(0, idStrSep) : refStr;
        var idStr = (idStrSep != -1) ? refStr.substring(idStrSep+1) : '';


        var ref = this.empty();

        if (idStr)
            ref.id = idStr;
        if (uriStr) {
            ref.uri = AknMain.Uri.parse(uriStr);
            ref.internal = false;
        }
        else
            ref.internal = true;

        return ref;

        function error (msg, piece) {
            throw new Error(msg + ': "' + piece + '"');
        }
    },

    refFunctions: {
        ref: function () {
            var idSep = '#';
            if ( this.internal )
                return idSep+this.id;

            var work = this.uri.work();
            return (this.id) ? work+idSep+this.id : work;
        }
    }
});
