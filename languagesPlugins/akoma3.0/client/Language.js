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

/**
 * Language dependent utilities
 */
Ext.define('LIME.ux.akoma3.Language', {
    /* Since this is merely a utility class define it as a singleton (static members by default) */
    singleton : true,
    alternateClassName : 'Language',

    name : 'Akoma ntoso',

    config : {
        elementIdAttribute: "eId",
        attributePrefix: "akn_",
        metadataStructure : {},
        abbreviations : {
            "adjournment" : "adj",
            "administrationOfOath" : "admoath",
            "address" : "addr",
            "answer" : "ans",
            "article" : "art",
            "attachment" : "att",
            "chapter" : "chp",
            "citation" : "cit",
            "citations" : "cits",
            "clause" : "cl",
            "component" : "cmp",
            "communication" : "comm",
            "componentRef" : "cref",
            "debateSection" : "dbtsec",
            "declarationOfVote" : "dclvote",
            "documentRef" : "dref",
            "embeddedStructure" : "estr",
            "embeddedText" : "etxt",
            "fragment" : "frag",
            "heading" : "hdg",
            "intro" : "intro",
            "listIntroduction" : "intro",
            "blockList" : "list",
            "list" : "list",
            "party" : "lwr",
            "ministerialStatements" : "mnstm",
            "noticesOfMotion" : "ntcmot",
            "nationalInterest" : "ntnint",
            "oralStatements" : "orlstm",
            "paragraph" : "para",
            "pointOfOrder" : "pntord",
            "proceduralMotions" : "prcmot",
            "personalStatements" : "prnstm",
            "prayers" : "pry",
            "petitions" : "pts",
            "question" : "qst",
            "quotedStructure" : "qstr",
            "questions" : "qsts",
            "quotedText" : "qtxt",
            "recital" : "rec",
            "recitals" : "recs",
            "rollCall" : "roll",
            "resolutions" : "res",
            "section" : "sec",
            "subchapter" : "subchp",
            "subclause" : "subcl",
            "subheading" : "subhdg",
            "subparagraph" : "subpara",
            "subsection" : "subsec",
            "transitional" : "trans",
            "listWrap" : "wrap",
            "wrap" : "wrap",
            "writtenStatements" : "wrtst"
        },
        noContextElements : ["listIntroduction", "listConclusion", "docDate", "docNumber", "docTitle", "location", "docType", "heading", "num", "proponent", "signature", "role", "person", "quotedText", "subheading", "ref", "mref", "rref", "date", "time", "organization", "concept", "object", "event", "process", "from", "term", "quantity", "def", "entity", "courtType", "neutralCitation", "party", "judge", "lower", "scene", "opinion", "argument", "affectedDocument", "relatedDocument", "change", "inline", "mmod", "rmod", "remark", "recorderedTime", "vote", "outcome", "ins", "del", "legislature", "session", "shortTitle", "docPurpose", "docCommittee", "docIntroducer", "docStage", "docStatus", "docJurisdiction", "docketNumber", "placeholder", "fillIn", "decoration", "docProponent", "omissis", "extractText", "narrative", "summery", "tocItem"],
        prefixSeparator: "__",
        numSeparator: "_"
    },

    /**
     * Translate the content based on an external web service (called by
     * an ajax request) which uses a XSLT stylesheet.
     * If the ajax request is successful the success callback is called.
     * Note that this function doesn't return anything since it asynchronously
     * call callback functions.
     *
     * @param {String} content The content to translate
     * @param {Object} callbacks Functions to call after translating
     */
    translateContent : function(content, markingLanguage, callbacks) {
        var params = {
            requestedService : Statics.services.xsltTrasform,
            output : 'akn',
            input : content,
            markingLanguage : markingLanguage
        }, transformFile = Config.getLanguageTransformationFile("LIMEtoLanguage");
        if (transformFile) {
            params = Ext.merge(params, {
                transformFile : transformFile
            });
        }
        //Calling the translate service
        Ext.Ajax.request({
            // the url of the web service
            url : Utilities.getAjaxUrl(),
            method : 'POST',
            // send the content in XML format
            params : params,
            scope : this,
            // if the translation was performed
            success : function(result, request) {
                if (Ext.isFunction(callbacks.success)) {
                    callbacks.success(result.responseText);
                }
            },
            failure : callbacks.failure
        });
    },

    getLanguageMarkingId : function(element, langPrefix, root) {
        var me = this, elementId = element.getAttribute(DomUtils.elementIdAttribute), 
            button = DomUtils.getButtonByElement(element), elName,
            markedParent, markingId = "", attributeName = langPrefix + DomUtils.langElementIdAttribute, 
            parentId, elNum = 1, siblings, elIndexInParent,
            elName = (button) ? button.name : DomUtils.getNameByNode(element);

        if (elementId && elName) {
            markedParent = DomUtils.getFirstMarkedAncestor(element.parentNode);
            if(markedParent){
                if(markedParent.getAttribute(attributeName)) {
                    markingId = markedParent.getAttribute(attributeName)+me.getPrefixSeparator();
                }
                siblings = markedParent.querySelectorAll("*[class~="+elName+"]");
            } else {
                siblings = root.querySelectorAll("*[class~="+elName+"]");
            }
            
            if(siblings.length) {
                elIndexInParent = Array.prototype.indexOf.call(siblings, element);
                elNum = (elIndexInParent!=-1) ? elIndexInParent+1 : elNum;    
            }
            
            elName = (me.getAbbreviations()[elName]) ? (me.getAbbreviations()[elName]) : elName;
            markingId += elName+me.getNumSeparator()+elNum;
        }
        return markingId;
    },

    constructor: function (config) {
        this.initConfig({});
    }
});
