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

describe ('AknMain.IdGenerator', function () {
    it ('partListToId: without arguments', function () {
        var id = AknMain.IdGenerator.partListToId();
        expect(id).toEqual('');
    });

    it ('partListToId: passing empty list', function () {
        var id = AknMain.IdGenerator.partListToId([]);
        expect(id).toEqual('');
    });

    it ('partListToId: single part abbr', function () {
        var id = AknMain.IdGenerator.partListToId([{article:3}]);
        expect(id).toEqual('art_3');
    });

    it ('partListToId: single part without abbr', function () {
        var id = AknMain.IdGenerator.partListToId([{item:'b'}]);
        expect(id).toEqual('item_b');
    });

    it ('partListToId: two parts', function () {
        var id = AknMain.IdGenerator.partListToId([{article:'4-bis'}, {paragraph: '2'}]);
        expect(id).toEqual('art_4-bis__para_2');
    });

    it ('partListToId: more parts', function () {
        var id = AknMain.IdGenerator.partListToId([{chapter:'IV'}, {article:10}, {paragraph: 3}, {list: 1}, {item:'b)'}]);
        expect(id).toEqual('chp_IV__art_10__para_3__list_1__item_b)');
    });

    it ('partListToId: more parts with num', function () {
        var id = AknMain.IdGenerator.partListToId([{article:2}, {paragraph: 10}, {item:'a'}, {num:3}]);
        expect(id).toEqual('art_2__para_10__item_a__num_3');
    });
});