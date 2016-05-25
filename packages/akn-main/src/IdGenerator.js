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

Ext.define('AknMain.IdGenerator', {
    singleton : true,

    noPrefixElements : ["collectionBody", "body", "mainBody", "documentRef", "componentRef", "authorialNote",
                        "ref", "person", "role", "location"],
    noIdElements: ["preface", "preamble", "body", "mainBody", "collectionBody"],
    noIdPatterns: ["block", "inline"],
    exceptIdElements: ["mod", "documentRef", "componentRef", "heading", "ins", "del", "quotedText",
                        "ref", "person", "role", "location"],
    documentContextElements: ["mod", "article"],
    noIdNumElements: ["components", "conclusions", "content", "heading"],
    prefixSeparator: "__",
    numSeparator: "_",
    abbreviations : {
        alinea : "al",
        article : "art",
        attachment : "att",
        blockList : "list",
        chapter : "chp",
        citation : "cit",
        citations : "cits",
        clause : "cl",
        component : "cmp",
        components : "cmpnts",
        componentRef : "cref",
        debateSection : "dbsect",
        division : "dvs",
        documentRef : "dref",
        eventRef : "eref",
        intro : "intro",
        list : "list",
        listIntroduction : "intro",
        listWrapUp : "wrap",
        paragraph : "para",
        quotedStructure : "qstr",
        quotedText : "qtext",
        recital : "rec",
        recitals : "recs",
        section : "sec",
        subchapter : "subchp",
        subclause : "subcl",
        subdivision : "subdvs",
        subparagraph : "subpara",
        subsection : "subsec",
        temporalGroup : "tmpg",
        wrapUp : "wrapup"
    },

    generateId : function(node, root, enforce) {
        var me = this, markingId = "",
            button = DomUtils.getButtonByElement(node),
            elName = (button) ? button.name : DomUtils.getNameByNode(node);

        try {
            if ( enforce || me.needsElementId(elName, button) ) {
                var markedParent = DomUtils.getFirstMarkedAncestor(node.parentNode),
                    documentContext = Ext.fly(node).parent('.document'),
                    
                markingId = me.getMarkingIdParentPart(elName, markedParent, documentContext);

                var context = markedParent || root;
                if (this.noPrefixElements.indexOf(elName) != -1) {
                    context = documentContext.dom;
                }
                var alternativeContext = Ext.fly(node).parent('.collectionBody', true);
                context = (alternativeContext) ? alternativeContext : context;

                if ( me.documentContextElements.indexOf(elName) != -1 ) {
                    context = Ext.fly(node).parent('.mod', true) || documentContext.dom;
                } else if ( elName != 'content' && Ext.fly(node).findParent( '.content', 2, true ) ) {
                    markingId+='content'+me.prefixSeparator;
                }

                var elNum = me.getElNum(node, elName, context);

                var elementRef = (me.abbreviations[elName]) ? (me.abbreviations[elName]) : elName;
                markingId += elementRef;
                if ( me.noIdNumElements.indexOf(elName) == -1 ) {
                    markingId += me.numSeparator+elNum;
                }

            }
        } catch(e) {
            console.log(e, elName);
        }
        return markingId;
    },

    needsElementId: function(elName, button) {
        var pattern = (button) ? button.pattern.pattern : null;

        return (elName && (this.noIdElements.indexOf(elName) == -1) && 
                ( ( !pattern || this.noIdPatterns.indexOf(pattern) == -1 ) ||
                ( this.exceptIdElements.indexOf(elName) != -1 ) ) );
    },

    getMarkingIdParentPart: function(elName, markedParent, documentContext) {
        var markingId = '',
            attributeName = LangProp.attrPrefix + DomUtils.langElementIdAttribute,
            parentName = (markedParent) ? DomUtils.getNameByNode(markedParent) : false,
            cmpParent = (documentContext) ? documentContext.parent('.component', true) : false,
            cmpPrefix = (cmpParent) ? cmpParent.getAttribute(attributeName)+this.prefixSeparator : "";

        if( markedParent && this.noPrefixElements.indexOf(parentName) == -1 
                         && this.noPrefixElements.indexOf(elName) == -1 ) {

            markingId += markedParent.getAttribute(attributeName) ? markedParent.getAttribute(attributeName) 
                                                        : "";
            markingId += (!markingId) ? this.getMarkingIdParentPart(parentName, DomUtils.getFirstMarkedAncestor(markedParent.parentNode)) 
                                                    : this.prefixSeparator;
        }

        if ( cmpPrefix && !Ext.String.startsWith(markingId,cmpPrefix) ) {
            markingId = cmpPrefix+markingId;
        }
        return markingId;
    },


    /* Find elNum by counting the preceding elements with 
       in given the same name in the context.*/

    getElNum: function(element, elName, context) {
        var elNum = false,
            num = Ext.fly(element).down('.num', true);

        if ( num && (num.parentNode == element || Ext.fly(num.parentNode).is('.content')) ) {
            var text = (num) ? num.textContent : "";
            elNum = AknMain.parsers.Num.normalize(text);
        }

        if ( !elNum ) {
            elNum = 1;
            //TODO: don't count the elements inside quotedStructure when the context is not mod
            var siblings = context.querySelectorAll("*[class~="+elName+"]");
            if(siblings.length) {
                var elIndexInParent = Array.prototype.indexOf.call(siblings, element);
                elNum = (elIndexInParent!=-1) ? elIndexInParent+1 : elNum;    
            }
        }
        return elNum;
    },

    partListToId: function(list) {
        if (!list) return '';
        return list.map(function(partObj) {
            var part = Object.keys(partObj)[0],
                name = this.abbreviations[part] || part;
            return name+this.numSeparator+partObj[part];
        }, this).join(this.prefixSeparator);
    }
});
