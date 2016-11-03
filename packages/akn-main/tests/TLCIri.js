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

describe ('AknMain.TLCIri', function () {
    it ('Empty', function () {
        var tlcIri = AknMain.TLCIri.empty();
        expect(tlcIri.tlc).toBe(undefined);
        expect(tlcIri.id).toBe(undefined);
        expect(tlcIri.subclasses).toEqual([]);
        expect(tlcIri.toString()).toEqual('/akn/ontology/undefined/undefined');
    });

    it ('Create /akn/ontology/person/kn.joe.smith.1964-12-22', function () {
        var tlcIri = AknMain.TLCIri.create('person', 'kn.joe.smith.1964-12-22');
        expect(tlcIri.tlc).toEqual('person');
        expect(tlcIri.id).toEqual('kn.joe.smith.1964-12-22');
        expect(tlcIri.subclasses).toEqual([]);
        expect(tlcIri.toString()).toEqual('/akn/ontology/person/kn.joe.smith.1964-12-22');
    });

    it ('Create /akn/ontology/person/kn/kn.joe.smith.1964-12-22', function () {
        var tlcIri = AknMain.TLCIri.create('person', 'kn.joe.smith.1964-12-22', 'kn');
        expect(tlcIri.tlc).toEqual('person');
        expect(tlcIri.id).toEqual('kn.joe.smith.1964-12-22');
        expect(tlcIri.subclasses).toEqual(['kn']);
        expect(tlcIri.toString()).toEqual('/akn/ontology/person/kn/kn.joe.smith.1964-12-22');
    });

    it ('Create /akn/ontology/person/kn/judge/kn.joe.smith.1964-12-22', function () {
        var tlcIri = AknMain.TLCIri.create('person', 'kn.joe.smith.1964-12-22', ['kn', 'judge']);
        expect(tlcIri.tlc).toEqual('person');
        expect(tlcIri.id).toEqual('kn.joe.smith.1964-12-22');
        expect(tlcIri.subclasses).toEqual(['kn', 'judge']);
        expect(tlcIri.toString()).toEqual('/akn/ontology/person/kn/judge/kn.joe.smith.1964-12-22');
    });

    it ('Create with TLC /akn/ontology/person/kn.joe.smith.1964-12-22', function () {
        var tlcIri = AknMain.TLCIri.create('TLCPerson', 'kn.joe.smith.1964-12-22');
        expect(tlcIri.tlc).toEqual('person');
        expect(tlcIri.id).toEqual('kn.joe.smith.1964-12-22');
        expect(tlcIri.toString()).toEqual('/akn/ontology/person/kn.joe.smith.1964-12-22');
    });

    it ('Create non existent TLC /akn/ontology/foo/kn.joe.smith.1964-12-22', function () {
        var fn = function () { AknMain.TLCIri.create('foo', 'kn.joe.smith.1964-12-22')};
        expect(fn).toThrowError('Unexpected TLC: foo');
        fn = function () { AknMain.TLCIri.create('TLCFoo', 'kn.joe.smith.1964-12-22')};
        expect(fn).toThrowError('Unexpected TLC: foo');
    });

    it ('Parse /akn/ontology/person/joe.smith.1964-12-22', function () {
        var tlcIri = AknMain.TLCIri.parse('/akn/ontology/person/joe.smith.1964-12-22');
        expect(tlcIri.tlc).toEqual('person');
        expect(tlcIri.id).toEqual('joe.smith.1964-12-22');
    });
    
});



