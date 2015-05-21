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
 * Static configuration, only constants.
 */
Ext.define('LIME.Statics', {
	/* Since this is merely a utility class define it as a singleton (static members by default) */
	singleton : true,
	alternateClassName : 'Statics',

	/*Used for debug*/
	debugUrl : '/wawe-debug/',
	
	/**
	 * @property {String} globalPatternsFile
	 * The path of global pattern configuration file 
	 */
	globalPatternsFile : "config/Patterns.json",
	/**
	 * @property {String} editorStartContentUrl
	 * The path of default editor content file 
	 */
	editorStartContentUrl : 'config/examples/editorStartContent-'+Locale.getLang()+'.html',
	
	/**
	 * Static values for metadata
	 * @property {Object} metadata
	 */
	metadata : {
	    containerClass : 'metadata',
	    frbrClass : 'frbr',
	    internalClass : 'internalMetadata'
	},
	
	/**
	 * @property {Object} widgetTypePatterns
	 * Object used as dictionary for translation of widget type in ext xtypes 
	 */
	widgetTypePatterns : {
		text : "textfield",
		date : "datefield",
		number: 'numberfield',
		doctype: 'docTypeSelector',
		nationality: 'nationalitySelector',
		list: 'combo'
	},
	
	/**
	 * @property {String} defaultContentLang
	 */
	defaultContentLang: 'esp',
	
	/**
	 * @property {Number} extraInfoLimit
	 */
	extraInfoLimit: 13,

	 
    eventsNames: {
	     translateRequest: "translateRequest",
	     progressStart: "progressStart",
	     progressUpdate: "progressUpdate",
	     progressEnd: "progressEnd",
	     loadDocument: "loadDocument",
	     beforeSave : 'beforeSave',
	     afterSave : 'afterSave',
	     saveDocument : 'saveDocument',
	     frbrChanged: 'frbrChanged',
	     beforeLoad: 'beforeLoad',
	     afterLoad: 'afterLoad',
         documentLoaded: 'documentLoaded',
         disableEditing: 'disableEditing',
         enableEditing: 'enableEditing',
         showNotification: 'showNotification',
         changedEditorMode: 'changedEditorMode',
         languageLoaded: 'languageLoaded',
         selectDocument: 'selectDocument',
         beforeCreation: 'beforeCreation',
         nodeChangedExternally: 'nodeChangedExternally',
         openDocument: 'openDocument',
         addMarkingGroup: 'addMarkingGroup',
         addMarkingButton: 'addMarkingButton',
         setCustomMarkingHandler: "setCustomMarkingHandler",
         editorDomNodeFocused: "editorDomNodeFocused",
         nodeFocusedExternally: "nodeFocusedExternally",
         unfocusedNodes: "unfocusedNodes",
         unmarkNodes: "unmarkNodes",
         unmarkedNodes: "unmarkedNodes",
         nodeAttributesChanged: "nodeAttributesChanged",
         showContextMenu: "showContextMenu",
         registerContextMenuBeforeShow: "registerContextMenuBeforeShow",
         openCloseContextPanel: "openCloseContextPanel",
         addContextPanelTab: "addContextPanelTab",
         removeGroupContextPanel: "removeGroupContextPanel",
         addMenuItem: "addMenuItem",
         enableDualEditorMode: "enableDualEditorMode",
         markingMenuLoaded: "markingMenuLoaded"
	 },
	 
	 services: {
	     htmlToPdf: 'HTML_TO_PDF',
	     pdfExport: 'HTML_TO_PDF_DOWNLOAD',
	     xmlExport: 'AKN_TO_XML_DOWNLOAD',
	     htmlExport: 'AKN_TO_HTML_DOWNLOAD',
	     aknToEpub: 'AKN_TO_EPUB',
	     aknToPdf: 'AKN_TO_PDF',
	     aknToFile: 'AKN_TO_FILE',
	     xsltTrasform: 'XSLT_TRANSFORM',
	     getFileContent: 'GET_FILE_CONTENT',
	     getFileMetadata: 'GET_FILE_METADATA',
	     saveAs : 'SAVE_FILE',
	     listFiles: 'LIST_FILES',
	     fileToHtml: 'FILE_TO_HTML',
	     userManager: 'USER_MANAGER',
	     userPreferences: 'USER_PREFERENCES',
	     createDocumentCollection: 'CREATE_DOCUMENT_COLLECTION',
	     filterUrls: 'FILTER_URLS',
         publishDocument: 'PUBLISH_DOCUMENT'
	 }
	
});
