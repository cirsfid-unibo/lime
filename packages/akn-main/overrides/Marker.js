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
Ext.define('AknMain.Marker', {
    override: 'LIME.controller.Marker',

    unMarkFirstMarkedNode: false,

    /**
     * This function retrieves the selected nodes set from the editor and mark
     * them all according to the rule defined in the button's wrapperElement rule.
     * Returns the list of the marked elements (useful in many cases).
     * @param {TreeButton} button The button that was used to mark
     * @param {Object} [attribute] The optional attribute (a name-value pair) to be set
     * @return {Array} The array of the wrapped elements
     */
    wrap: function () {
        var res = this.callParent(arguments);
        var firstMarkedNode = res && res[0];

        if (this.unMarkFirstMarkedNode && firstMarkedNode) {
            this.unmarkNode(firstMarkedNode);
        }
        this.unMarkFirstMarkedNode = false;
    },

    isAllowedMarking: function (markedNode, node, config) {
        var nodePattern = this.getPatternConfigByNode(markedNode);
        if (!nodePattern || Ext.fly(node).is('table') || Ext.fly(node).up('table')) {
            return true;
        }

        var allowed = this.callParent(arguments);

        // If marking is not allowed
        if (!allowed) {
            // This is tricky and ugly and maybe we shouldn't do it...
            // Make an exception when the user is trying to mark a container
            // inside a "p" element, let mark the container and after remove the "p".
            // Example of this scenario:
            // <preamble>
            //   <p> text text text </p>
            // </preamble>
            // the user wants to wrap the "text" with an enactingFormula.
            var markedName = DomUtils.getNameByNode(markedNode);
            //TODO: check the root elements
            if (markedName === 'p' && config.pattern.pattern === 'container') {
                this.unMarkFirstMarkedNode = true;
                return true;
            }
        }

        return allowed;
    },

    getFirstButton: function (elId, nameAttr) {
        return DocProperties.getFirstButtonByName(elId, 'common') ||
            DocProperties.getFirstButtonByName(nameAttr, 'common') ||
            this.callParent(arguments);
    }
});
