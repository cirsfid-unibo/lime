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

describe ('AknMain.parsers.Num', function () {
    it ('normalize: simple art num', function () {
        var num = AknMain.parsers.Num.normalize('Art. 2');
        expect(num).toEqual('2');
        var num = AknMain.parsers.Num.normalize('Art. 2.');
        expect(num).toEqual('2');
        var num = AknMain.parsers.Num.normalize('Art. 2)');
        expect(num).toEqual('2');
    });

    it ('normalize: simple num', function () {
        var num = AknMain.parsers.Num.normalize('2');
        expect(num).toEqual('2');
        var num = AknMain.parsers.Num.normalize('2.');
        expect(num).toEqual('2');
        var num = AknMain.parsers.Num.normalize('2)');
        expect(num).toEqual('2');
    });

    it ('normalize: simple letter', function () {
        var num = AknMain.parsers.Num.normalize('a');
        expect(num).toEqual('a');
        var num = AknMain.parsers.Num.normalize('b.');
        expect(num).toEqual('b');
        var num = AknMain.parsers.Num.normalize('c)');
        expect(num).toEqual('c');
    });

    it ('normalize: point letters with brackets', function () {
        var num = AknMain.parsers.Num.normalize('(a)');
        expect(num).toEqual('a');
        num = AknMain.parsers.Num.normalize('( b )');
        expect(num).toEqual('b');
        num = AknMain.parsers.Num.normalize('b )');
        expect(num).toEqual('b');
        num = AknMain.parsers.Num.normalize('( b');
        expect(num).toEqual('b');
    });

    it ('normalize: simple num special character', function () {
        var num = AknMain.parsers.Num.normalize('Artículo 10º.');
        expect(num).toEqual('10');
    });

    it ('normalize: num with latin', function () {
        var num = AknMain.parsers.Num.normalize('Art. 30 - bis');
        expect(num).toEqual('30-bis');
        var num = AknMain.parsers.Num.normalize('Art. 30-ter');
        expect(num).toEqual('30-ter');
    });

    it ('normalize: roman', function () {
        var num = AknMain.parsers.Num.normalize('Chapter IV');
        expect(num).toEqual('IV');
    });

    it ('normalize: roman with latin', function () {
        var num = AknMain.parsers.Num.normalize('Chapter IV- ter');
        expect(num).toEqual('IV-ter');
        var num = AknMain.parsers.Num.normalize('Chapter IV -quater');
        expect(num).toEqual('IV-quater');
    });

    it ('normalize: multiple nums with points', function () {
        var num = AknMain.parsers.Num.normalize('Section 2.3');
        expect(num).toEqual('23');
        var num = AknMain.parsers.Num.normalize('Section 2.3.5');
        expect(num).toEqual('235');
    });
});
