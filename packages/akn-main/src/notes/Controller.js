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
        changePosAttr: 'chposid',
        changePosTargetAttr: 'chpos_id',
        noteRefAttribute: 'noteref',
        refToAttribute: 'refto',
        notesContainerCls: 'notesContainer',
        tmpSpanCls: 'posTmpSpan',
        noteTmpId: 'notetmpid'
    },

    init : function() {
        var me = this;
        //Listening progress events
        me.application.on(Statics.eventsNames.afterLoad, me.beforeProcessNotes, me);
        me.application.on(Statics.eventsNames.nodeAttributesChanged, me.nodeChangedAttributes, me);
    },

    beforeProcessNotes: function(config) {
        var editorBody = this.getController("Editor").getBody();
        this.linkNotes(editorBody);
        this.processNotes(editorBody);
    },

    linkNotes: function(body) {
        var me = this, app = this.application,
            noteLinkers = body.querySelectorAll(".linker");
        clickLinker = function() {
            var marker = this.getAttribute(me.getRefToAttribute()), note;
            if (marker) {
                note = body.querySelector("*["+me.getChangePosTargetAttr()+"="+marker+"]");
                if(note) {
                    app.fireEvent('nodeFocusedExternally', note, {
                        select : true,
                        scroll : true,
                        click : true
                    });
                }
            }
        };
        Ext.each(noteLinkers, function(linker) {
            linker.onclick = clickLinker;
        }, this);
    },
    
    nodeChangedAttributes: function(node) {
        if(node.getAttribute("class").indexOf(this.getAuthorialNoteClass())!=-1) {
            var result = this.updateNote(node, this.getController("Editor").getBody());
            if(result.placement) {
                this.application.fireEvent('nodeFocusedExternally', node, {
                    select : true,
                    scroll : true,
                    click : true
                }); 
            }
        }
    },

    processNotes : function(editorBody) {
        var me = this, 
            athNotes = editorBody.querySelectorAll("*[class~='"+me.getAuthorialNoteClass()+"']"); 
        Ext.each(athNotes, function(element) {
            me.processNote(element, editorBody);
        }, me);  
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
    
    
    setNotePosition: function(note, refNode, editorBody) {
        var me = this,
            placement = LangProp.getNodeLangAttr(note, "placement"), 
            allRefs = Array.prototype.slice.call(editorBody.querySelectorAll("*["+me.getNoteRefAttribute()+"]")),
            notesContainer, changed = false, refIndex, siblingNote, refSibling, refSiblingIndex;

        if (placement.value == "bottom" && note.parentNode && 
                    (!note.parentNode.getAttribute("class") || 
                        note.parentNode.getAttribute("class").indexOf(me.getNotesContainerCls()) == -1)) {
            notesContainer = me.getNotesContainer(editorBody);
            if(!notesContainer.childNodes.length) {
                notesContainer.appendChild(note);    
            } else {
                // Insert the note in order
                refIndex = allRefs.indexOf(refNode);
                for(var i = 0; i < notesContainer.childNodes.length; i++) {
                    siblingNote = notesContainer.childNodes[i];
                    refSibling = allRefs.filter(function(el) { 
                        return el.getAttribute(me.getNoteRefAttribute()) == siblingNote.getAttribute(me.getNoteTmpId());
                    })[0];
                    if(refSibling) {
                        refSiblingIndex = allRefs.indexOf(refSibling);
                        if(refSiblingIndex > refIndex) {
                            break;
                        }
                    }
                }
                if(siblingNote && refSiblingIndex > refIndex) {
                    notesContainer.insertBefore(note, siblingNote);
                } else {
                    notesContainer.appendChild(note);
                }
            }
            changed = true;
        } else if (placement.value == "inline" && note.parentNode && 
                (note.parentNode.getAttribute("class") && 
                    note.parentNode.getAttribute("class").indexOf(me.getNotesContainerCls()) != -1)) {
            if (refNode.nextSibling) {
                refNode.parentNode.insertBefore(note, refNode.nextSibling);
            } else {
                refNode.parentNode.appendChild(note);
            }
            changed = true;
        }
        return changed;
    },

    
    processNote: function(node, editorBody) {
        var me = this, parent = node.parentNode, app = me.application,
            elId, tmpElement,  link, tmpExtEl,
            marker = LangProp.getNodeLangAttr(node, "marker"),
            placement = LangProp.getNodeLangAttr(node, "placement"),
            supLinkTemplate = new Ext.Template('<sup><a class="linker" href="#">{markerNumber}</a></sup>'),
            notTmpId = node.getAttribute(me.getNoteTmpId()),
            tmpRef = editorBody.querySelector("*["+me.getNoteRefAttribute()+"="+notTmpId+"]"),
            allRefs = Array.prototype.slice.call(editorBody.querySelectorAll("*["+me.getNoteRefAttribute()+"]")),
            clickLinker = function() {
                var marker = this.getAttribute(me.getRefToAttribute()),
                    note;
                if (marker) {
                    note = editorBody.querySelector("*["+me.getNoteTmpId()+"="+marker+"]");
                    if(note) {
                        app.fireEvent('nodeFocusedExternally', note, {
                            select : true,
                            scroll : true,
                            click : true
                        });    
                    }
                }  
            };
        if (tmpRef) {
            elId = allRefs.indexOf(tmpRef);
            elId = (elId != -1) ? elId+1 : "note";
            marker.value = marker.value || elId;
            placement.value = placement.value || "bottom";
            
            if(!tmpRef.querySelector('a')) {
                tmpElement = Ext.DomHelper.insertHtml("afterBegin", tmpRef, supLinkTemplate.apply({
                    'markerNumber' : marker.value
                }));
                tmpElement.querySelector('a').setAttribute(me.getRefToAttribute(), notTmpId);
                tmpElement.querySelector('a').onclick = clickLinker;    
            }
            
            node.setAttribute(marker.name, marker.value);
            node.setAttribute(placement.name, placement.value);
            me.setNotePosition(node, tmpRef, editorBody);
        }
    },
    
    updateNote: function(node, editorBody) {
        var me = this,
            marker = LangProp.getNodeLangAttr(node, "marker"),
            eId = node.getAttribute(me.getNoteTmpId()),
            ref = editorBody.querySelector("*["+me.getNoteRefAttribute()+"="+eId+"]"),
            linker, result = {marker: false, placement: false};
        if(eId && ref && marker && marker.value) {
            linker = ref.querySelector('a');
            if(marker.value.trim() !=  DomUtils.getTextOfNode(linker).trim()) {
                result.marker = true;
                linker.replaceChild(editorBody.ownerDocument.createTextNode(marker.value), linker.firstChild);  
            }
            result.placement = me.setNotePosition(node, ref, editorBody);
        }
        return result;
    },

    /*
     * Is important to call this function before loading the document in the editor. 
     * */
    preProcessNotes : function(dom) {
        if (!dom) return;
        var athNotes = dom.querySelectorAll("*[class~=" + this.getAuthorialNoteClass() + "]"),
            markerTemplate = new Ext.Template('<span class="'+this.getTmpSpanCls()+'" '+this.getNoteRefAttribute()+'="{ref}"></span>');
            
        Ext.each(athNotes, function(element, index) {
            var noteTmpId = "note_"+index;
            Ext.DomHelper.insertHtml("beforeBegin", element, markerTemplate.apply({
                'ref' : noteTmpId
            }));
            element.setAttribute(this.getNoteTmpId(), noteTmpId);
            // Move the element to the end of parent to prevent split in parent
            if(element.nextSibling) {
                element.parentNode.appendChild(element);
            }
        }, this);
    }

});
