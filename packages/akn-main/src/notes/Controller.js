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

Ext.define('AknMain.notes.Controller', {
    extend : 'Ext.app.Controller',

    requires: ['AknMain.LangProp'],

    config : {
        authorialNoteClass : 'authorialNote',
        noteRefAttribute: 'noteref',
        refToAttribute: 'refto',
        notesContainerCls: 'notesContainer',
        tmpSpanCls: 'posTmpSpan',
        noteTmpId: 'notetmpid'
    },

    noteIndex: 0,

    init: function() {
        var me = this;
        //Listening progress events
        me.application.on(Statics.eventsNames.afterLoad, me.beforeProcessNotes, me);
        me.application.on(Statics.eventsNames.nodeAttributesChanged, me.nodeChangedAttributes, me);
        me.application.on(Statics.eventsNames.nodeChangedExternally, me.onNodeChanged, me);
        me.application.on(Statics.eventsNames.unmarkedNodes, me.nodesUnmarked, me);
    },

    beforeProcessNotes: function(config) {
        this.linkNotes(config.docDom);
        this.processNotes(config.docDom);
    },

    linkNotes: function(body) {
        var me = this;
        Ext.each(body.querySelectorAll(".linker"), function(linker) {
            linker.onclick = function() {
                me.noteLinkClickHandler(this);
            };
        });
    },

    processNotes: function(editorBody) {
        var athNotes = editorBody.querySelectorAll("*[class~='"+this.getAuthorialNoteClass()+"']"); 
        Ext.each(athNotes, function(element, index) {
            this.processNote(element, index);
        }, this);  
    },

    processNote: function(node, index) {
        var me = this, 
            noteTmpId = node.getAttribute(me.getNoteTmpId()),
            tmpRef = node.ownerDocument.querySelector("*["+me.getNoteRefAttribute()+"="+noteTmpId+"]");
        if (!tmpRef) return;

        var marker = LangProp.getNodeLangAttr(node, "marker"),
            placement = LangProp.getNodeLangAttr(node, "placement");
            
        marker.value = marker.value || index && index+1 || 'note';
        placement.value = placement.value || "bottom";

        if(!tmpRef.querySelector('a')) {
            var linkContainer = this.insertMarkerLink(tmpRef, marker.value);
            linkContainer.querySelector('a').setAttribute(me.getRefToAttribute(), noteTmpId);
            linkContainer.querySelector('a').onclick = function() {
                me.noteLinkClickHandler(this);
            };
        }
        
        node.setAttribute(marker.name, marker.value);
        node.setAttribute(placement.name, placement.value);
        me.setNotePosition(node, tmpRef);
    },

    insertMarkerLink: function(node, marker) {
        var supLinkTemplate = new Ext.Template('<sup><a class="linker" href="#">{markerNumber}</a></sup>');
        return Ext.DomHelper.insertHtml("afterBegin", node, supLinkTemplate.apply({
            'markerNumber': marker
        }));
    },

    noteLinkClickHandler: function(node) {
        var marker = node.getAttribute(this.getRefToAttribute()),
            note = marker && node.ownerDocument.querySelector("*["+this.getNoteTmpId()+"="+marker+"]");
        if (note)
            this.focusNote(note);
    },

    focusNote: function(node) {
        this.application.fireEvent('nodeFocusedExternally', node, {
            select : true, scroll : true, click : true
        });
    },

    setNotePosition: function(note, refNode) {
        var placement = LangProp.getNodeLangAttr(note, "placement");
        var parentClsList = note.parentNode && note.parentNode.classList;

        if (placement.value == "bottom" && parentClsList &&
                (!parentClsList.length || !parentClsList.contains(this.getNotesContainerCls()))) {
            this.moveNoteToBottom(note, refNode);
            return true;
        }

        if (placement.value == "inline" && parentClsList &&
                parentClsList.contains(this.getNotesContainerCls())) {
            this.moveNoteInline(note, refNode);
            return true;
        }
        return false;
    },

    moveNoteToBottom: function(node, refNode) {
        var me = this, 
            notesContainer = me.getNotesContainer(node.ownerDocument);
        if(!notesContainer.childNodes.length)
            return notesContainer.appendChild(node);
        // Insert the note in order
        var allRefs = Ext.Array.toArray(node.ownerDocument.querySelectorAll("*["+me.getNoteRefAttribute()+"]")),
            refIndex = allRefs.indexOf(refNode),
            sbNote, refSibling;

        for(var i = 0; i < notesContainer.childNodes.length; i++) {
            sbNote = notesContainer.childNodes[i];
            refSibling = allRefs.filter(function(el) {
                return el.getAttribute(me.getNoteRefAttribute()) == sbNote.getAttribute(me.getNoteTmpId());
            })[0];
            if(refSibling && allRefs.indexOf(refSibling) > refIndex)
                return notesContainer.insertBefore(node, sbNote);
        }
        
        notesContainer.appendChild(node);
    },

    moveNoteInline: function(node, refNode) {
        if (DomUtils.getPatternByNode(refNode.parentNode) == 'inline')
            return DomUtils.insertAfter(node, refNode.parentNode);
        DomUtils.insertAfter(node, refNode);
    },

    nodeChangedAttributes: function(node) {
        if (DomUtils.getElementNameByNode(node) !== 'authorialNote') return;
        if (this.updateNote(node).placement)
            this.focusNote(node);
    },

    updateNote: function(node) {
        var noteId = node.getAttribute(this.getNoteTmpId()),
            ref = noteId && node.ownerDocument.querySelector("*["+this.getNoteRefAttribute()+"="+noteId+"]"),
            result = {marker: false, placement: false},
            marker = LangProp.getNodeLangAttr(node, "marker");

        if(ref && marker && marker.value) {
            var linker = ref.querySelector('a');
            if(marker.value.trim() != linker.textContent.trim()) {
                result.marker = true;
                linker.replaceChild(node.ownerDocument.createTextNode(marker.value), linker.firstChild);  
            }
            result.placement = this.setNotePosition(node, ref);
        }

        return result;
    },

    onNodeChanged: function(nodes, config) {
        if(config.unmark || !nodes) return;
        var me = this;
        Ext.each(nodes, function(node) {
            if (DomUtils.getElementNameByNode(node) === 'authorialNote') {
                me.insertNoteTmpSpan(node);
                me.processNote(node);
            }
        });
    },

    insertNoteTmpSpan: function(node) {
        var markerTemplate = new Ext.Template('<span class="'+this.getTmpSpanCls()+'" '+this.getNoteRefAttribute()+'="{ref}"></span>');
        var noteTmpId = "note_"+this.noteIndex++;
        Ext.DomHelper.insertHtml("beforeBegin", node, markerTemplate.apply({
            'ref' : noteTmpId
        }));
        node.setAttribute(this.getNoteTmpId(), noteTmpId);
        // Move the element after the parent to prevent split in parent
        DomUtils.insertAfter(node, node.parentNode);
    },

    //TODO: remove all tmp nodes when the node is unmarked
    nodesUnmarked: function(nodes) {
        console.log(nodes);
    },
    
    getNotesContainer: function(editorBody) {
        var notesContainer = editorBody.querySelector("."+this.getNotesContainerCls()),
            docNode = editorBody.querySelector("."+DocProperties.documentBaseClass);
        if(!notesContainer && docNode) {
            notesContainer = Ext.DomHelper.createDom({
                tag : 'div',
                cls: this.getNotesContainerCls()
            });
            docNode.appendChild(notesContainer);
        }
        
        return notesContainer;
    },

    /*
     * Is important to call this function before loading the document in the editor. 
     * */
    preProcessNotes: function(dom) {
        this.noteIndex = 0;
        if (!dom) return;
        var athNotes = dom.querySelectorAll("*[class~=" + this.getAuthorialNoteClass() + "]");
        Ext.each(athNotes, this.insertNoteTmpSpan, this);
    }
});
