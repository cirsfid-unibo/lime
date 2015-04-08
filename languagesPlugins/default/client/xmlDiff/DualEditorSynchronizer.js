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


// DualEditorSynchronizer Controller
// Editor must be in dualEditorMode.
// this.getController('DualEditorSynchronizer').activate()
// this.getController('DualEditorSynchronizer').disable()
Ext.define('LIME.controller.DualEditorSynchronizer', {
    extend : 'Ext.app.Controller',


    init: function () {
        // Make sure this.onScroll handler is always bound to this controller...
        this.onScroll = this.onScroll.bind(this);
    },

    iframeA: undefined,
    iframeB: undefined,

    // Public: enable scroll synchronization on the two editors handled by
    // the Editor controller.  
    enable: function () {
        var editor = this.getController('Editor');
        this.iframeA = editor.getEditorComponent().iframeEl.dom;
        this.iframeB = editor.getEditorComponent(editor.getSecondEditor()).iframeEl.dom;

        // Todo: this should be executed again on resize
        this.generateCheckpoints();

        this.iframeA.contentDocument.addEventListener('scroll', this.onScroll);
        this.iframeB.contentDocument.addEventListener('scroll', this.onScroll);
    },

    // Public: disable scroll synchronization
    disable: function () {
        this.iframeA.contentDocument.removeEventListener('scroll', this.onScroll);
        this.iframeB.contentDocument.removeEventListener('scroll', this.onScroll);

        this.iframeA = undefined;
        this.iframeB = undefined;
    },

    // Checkpoints used to synchronize scrolling.
    // When iframeA is scrolled checkpointsA[i] px from top,
    // iframeB should be scrolled checkpointsB[i] px from top.
    checkpointsA: [],
    checkpointsB: [],

    // Generate the checkpoints used to synchronize scrolling.
    generateCheckpoints: function () {
        this.checkpointsA = [0];
        this.checkpointsB = [0];

        var docA = this.iframeA.contentDocument,
            docB = this.iframeB.contentDocument,
            nodeList = docA.querySelectorAll('*[akn_eid]');
        for (var i = 0; i < nodeList.length; i++) {
            var nodeA = nodeList[i],
                eId = nodeA.getAttribute('akn_eid'),
                nodeB = docB.querySelector('*[akn_eid=' + eId + ']');
            if (nodeB) {
                var offsetA = this.getOffset(nodeA),
                    offsetB = this.getOffset(nodeB);
                // console.info('found match: ', eId, offsetA, offsetB);
                if (offsetA < this.checkpointsA[this.checkpointsA.length -1] ||
                    offsetA < this.checkpointsB[this.checkpointsB.length -1])
                {
                    console.warn('DualEditorSynchronizer.generateCheckpoints', eId, ' if found before previous checkpoint');
                    continue;
                }

                this.checkpointsA.push(offsetA);
                this.checkpointsB.push(offsetB);
            }
        }

        this.checkpointsA.push(this.getHeight(this.iframeA));
        this.checkpointsB.push(this.getHeight(this.iframeB));
        // console.info('this.checkpointsA', this.checkpointsA)
        // console.info('this.checkpointsB', this.checkpointsB)
    },

    // Get offset in px of node from top of document
    getOffset: function (node) {
        var offset = 0;
        while (node) {
            offset += node.offsetTop;
            node = node.offsetParent.tagName != 'BODY' ? node.parentNode : undefined;
        }
        return offset;
    },

    // Get content height of an iframe
    getHeight: function (iframe) {
        return iframe.contentDocument.body.getBoundingClientRect().height;
    },

    // Scroll event handler
    // BUG: on Firefox this make scrolling super-slow, maybe it fares more 
    // scroll events or something like that. Maybe adding a timeout will solve this.
    onScroll: function (e) {
        if (e.target == this.iframeA.contentDocument) {
            var scrollA = this.iframeA.contentWindow.pageYOffset,
                scrollB = this.getMapping(scrollA, this.checkpointsA, this.checkpointsB);
        } else if (e.target == this.iframeB.contentDocument) {
            var scrollB = this.iframeB.contentWindow.pageYOffset,
                scrollA = this.getMapping(scrollB, this.checkpointsB, this.checkpointsA);
        } else {
            console.error(e.target);
            throw new Error('onScroll target not found');
        }
        this.setScroll(scrollA, scrollB);
    },

    // Given a scroll of top relative to checkpoints A, return
    // how much scroll should be set in B.
    getMapping: function (top, A, B) {
        var i = 0;
        while(A[i+1] && A[i+1] < top) i++;
        var aPrev = A[i];
        var aNext = A[i+1];
        var bPrev = B[i];
        var bNext = B[i+1];
        // console.info(top, aPrev, aNext, bPrev, bNext, Math.round(bPrev + ( (top - aPrev) / (aNext - aPrev) * (bNext - bPrev))));
        return Math.round(bPrev + ( (top - aPrev) / (aNext - aPrev) * (bNext - bPrev) ) );
    },

    scrollA: 0,
    scrollB: 0,

    // Scroll the iframes to scrollA/scrollB if the difference from the
    // last set scroll is big enough.
    setScroll: function (scrollA, scrollB) {
        if (this.different(this.scrollA, scrollA) && 
            this.different(this.scrollB, scrollB))
        {
            this.scrollA = scrollA;
            this.scrollB = scrollB;

            this.iframeA.contentWindow.scrollTo(0, scrollA);
            this.iframeB.contentWindow.scrollTo(0, scrollB);
        }
    },

    // Return whether the difference between a and b is bigger that a certain threshold.
    different: function (a, b) {
        if (a == undefined || b == undefined) return true;
        return Math.abs(a - b) > 3;
    }
});