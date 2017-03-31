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


    getContentWrapper: function(node) {
        return node.getElementsByClassName(DocProperties.documentBaseClass)[0];
    },

    
    handleAttachmentsMetadata: function(docDom) {
        Ext.Array.toArray(
            docDom.getElementsByClassName('attachment')
        ).forEach(function(attachmentNode, index) {
            var component = this.getComponentName(index);
            this.setAttachmentDocType(attachmentNode);
            this.setAttachmentDocName(attachmentNode);
            this.addAttachmentMetadata(attachmentNode, component);
        }, this);
    },

    getComponentName: function(index) {
        return 'annex_'+(index+1);
    },

    fixAttachmentsId: function(docDom) {
        Ext.Array.toArray(
            docDom.getElementsByClassName('attachment')
        ).forEach(function(attachmentNode, index) {
            var component = this.getComponentName(index);
            this.addIdPrefix(attachmentNode, component);
        }, this);
    },

    // Add eId prefix to all eId attributes in order to avoid double eId
    addIdPrefix: function(node, prefix) {
        var idAttr = LangProp.attrPrefix+'eId';
        prefix+=AknMain.IdGenerator.prefixSeparator;
        Ext.Array.toArray(node.querySelectorAll('*['+idAttr+']'))
        .forEach(function(node) {
            node.setAttribute(idAttr, prefix+node.getAttribute(idAttr));
        });
    },

    setAttachmentDocType: function(node) {
        var wrapper = this.ensureContentWrapper(node);
        var docType = node.getAttribute('akn_type') || 'doc';
        if (!wrapper.classList.contains(docType)) {
            wrapper.setAttribute('class', DocProperties.documentBaseClass+' '+docType);
        }
        // Remove the akn_type used temporary only here
        node.removeAttribute('akn_type');
    },

    setAttachmentDocName: function(node) {
        var wrapper = this.ensureContentWrapper(node);
        var docName = node.getAttribute('akn_name') || wrapper.classList[1];
        wrapper.setAttribute('akn_name', docName);
        // Remove the akn_name used temporary only here
        node.removeAttribute('akn_name');
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

    addAttachmentMetadata: function(node, component) {
        var language = this.getController('Language');
        var docNode = this.getContentWrapper(node);
        var metaNode = docNode.insertBefore(language.createBlankMeta(), docNode.firstChild);
        var metaStore = this.createAttachmentMetadata(component);
        this.addComponentData(metaStore.getUri());
        this.addReferences(metaStore);
        language.overwriteMetadata(
            metaNode,
            metaStore
        );
    },

    createAttachmentMetadata: function(componentName) {
        var metaStore = Ext.getStore('metadata').getMainDocument().clone();
        metaStore.set('component', componentName);
        return metaStore;
    },

    // Adds componentData to the main metedata store
    addComponentData: function(uri) {
        var metaStore = Ext.getStore('metadata').getMainDocument();
        var workUri = uri.work();
        var componentDatas = metaStore.componentDatas();

        if (componentDatas.findRecord('href', workUri, 0, false, false, true))
            return;

        componentDatas.add({
            name: uri.component, level: 'work', href: workUri
        });
        componentDatas.add({
            name: uri.component, level: 'expression', href: uri.expression()
        });
        componentDatas.add({
            name: uri.component, level: 'manifestation', href: uri.manifestation()
        });
    },

    addReferences: function(attachmentStore) {
        var metaStore = Ext.getStore('metadata').getMainDocument();
        var mainUri = metaStore.getUri();
        var annexUri = attachmentStore.getUri();
        this.addMetaRef(metaStore, 'hasAttachment', annexUri.component, annexUri.work());
        this.addMetaRef(attachmentStore, 'attachmentOf', mainUri.component, mainUri.work());
    },

    addMetaRef: function (meta, type, showAs, href) {
        var references = meta.references(),
            eid = showAs;

        var existingRefIndex = references.findBy(function(rec) {
            return rec.get('type') === type &&  rec.get('href') === href;
        });
        if (existingRefIndex < 0) {
            references.add({
                eid: eid,
                type: type,
                href: href,
                showAs: showAs
            });
        }
    }
});
