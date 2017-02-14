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

Ext.define('AknMain.attachments.AttachmentsHandler', {
    extend : 'Ext.app.Controller',

    listen: {
        global: {
            nodeAttributesChanged: 'nodeChangedAttributes'
        }
    },

    init: function() {
        this.application.on(
            Statics.eventsNames.nodeChangedExternally,
            this.onNodeChanged,
            this
        );
    },

    nodeChangedAttributes: function(node) {
        this.onNodeChanged([node], {});
    },

    onNodeChanged: function(nodes, config) {
        if(config.unmark || !nodes) return;
        var me = this;
        Ext.each(nodes, function(node) {
            var name = DomUtils.getElementNameByNode(node);
            if (name === 'attachments') {
                me.handleAttachments(node);
            } else if (name === 'attachment') {
                me.handleAttachment(node);
            }
        });
    },

    handleAttachments: function(node) {
        var attachmentsNode = this.findAttachmentsNode();
        if (attachmentsNode && attachmentsNode !== node) {
            DomUtils.moveChildrenNodes(node, attachmentsNode, true);
            this.application.fireEvent(Statics.eventsNames.unmarkNodes, [node]);
            node = attachmentsNode;
        } else {
            this.moveNodeToDocumentRoot(node);
        }
        this.focusNode(node);
    },

    findAttachmentsNode: function() {
        var attachmentsNodes = DocProperties.getMarkedElementsByName('attachments');
        return (attachmentsNodes.length > 0) ?
                attachmentsNodes[0].htmlElement : false;
        
    },

    moveNodeToDocumentRoot: function(node) {
        var docRoot = node.ownerDocument.getElementsByClassName(DocProperties.documentBaseClass)[0];
        if (!docRoot) return;
        docRoot.appendChild(node);
        return node;
    },

    focusNode: function(node) {
        this.application.fireEvent('nodeFocusedExternally', node, {
            select : false, scroll : true, click : true
        });
    },

    handleAttachment: function(node) {
        this.ensureAttachmentsParent(node);
        this.ensureContentWrapper(node);
        this.setAttachmentDocType(node);
        this.focusNode(node);
    },

    ensureAttachmentsParent: function(node) {
        var markedParent = DomUtils.getFirstMarkedAncestor(node.parentNode);
        if (DomUtils.getElementNameByNode(markedParent) !== 'attachments') {
            markedParent = this.findAttachmentsNode();
            if (!markedParent) {
                markedParent = this.createAttachments(node);
            }
            markedParent.appendChild(node);
        }
        return markedParent;
    },

    createAttachments: function(node) {
        var attachmentsNode = node.ownerDocument.createElement('div');
        node.parentNode.appendChild(attachmentsNode);
        this.application.fireEvent(
            'markingRequest',
            DocProperties.getFirstButtonByName('attachments'), {
                silent : true,
                noEvent : true,
                nodes : [attachmentsNode]
            }
        );
        return this.moveNodeToDocumentRoot(attachmentsNode);
    },

    ensureContentWrapper: function(node) {
        var wrapper = this.getContentWrapper(node);
        if ( !wrapper ) {
            wrapper = node.ownerDocument.createElement('div');
            DomUtils.moveChildrenNodes(node, wrapper);
            node.appendChild(wrapper);
        }
        return wrapper;
    },

    getContentWrapper: function(node) {
        return node.getElementsByClassName(DocProperties.documentBaseClass)[0];
    },

    setAttachmentDocType: function(node) {
        var wrapper = this.ensureContentWrapper(node);
        var docType = node.getAttribute('akn_type') || 'doc';
        if (!wrapper.classList.contains(docType)) {
            wrapper.setAttribute('class', DocProperties.documentBaseClass+' '+docType);
        }
    },

    beforeTranslate: function(docDom) {
        Ext.Array.toArray(
            docDom.getElementsByClassName('attachment')
        ).forEach(function(attachmentNode, index) {
            // Remove the akn_type used temporary only in setAttachmentDocType
            attachmentNode.removeAttribute('akn_type');
            this.addAttachmentMetadata(attachmentNode, index);
        }, this);
    },

    addAttachmentMetadata: function(node, index) {
        var docNode = this.getContentWrapper(node);
        var language = this.getController('Language');
        var metaNode = docNode.insertBefore(language.createBlankMeta(), docNode.firstChild);
        //console.log(overwriteMetadata);
        //language.overwriteMetadata(metaNode, Ext.getStore('metadata').getMainDocument());
        console.log(docNode, metaNode);
    }
});
