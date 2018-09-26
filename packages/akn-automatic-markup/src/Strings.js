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

 Ext.define('AknAutomaticMarkup.Strings', {
    singleton : true,

     strings: {
        "en": {
            "parseDocumentText": "Automatic markup",
            "parseDocumentTooltip": "Try to markup automatically this document",
            "parsing": "Parsing",
            "postParsing": "Post parsing",
            "quoteParsing": "Parsing quotes",
            "structureParser": "Parsing structure",
            "referenceParser": "Parsing references",
            "markedAlready": "Document is marked",
            "documentAllMarked": "I marked what I was able to recognize automatically",
            "parsersErrors": {
                "LANG_MISSING_ERROR_TITLE": "Language error",
                "langMissingError": "The language of document is missing"
            },
            "refExtensionNotFound": "No extension found",
            "refExtensionFound": "The reference was extended from \"{oldText}\" to \"{newText}\"",
            "paragraphParse": "Paragraph automatic markup"
        },
        "it": {
            "parseDocumentText": "Markup automatico",
            "parseDocumentTooltip": "Prova a marcare il documento automaticamente",
            "parsing": "Riconoscimento",
            "postParsing": "Rifinimento",
            "quoteParsing": "Riconoscimento delle menzioni",
            "structureParser": "Riconoscimento della struttura",
            "referenceParser": "Riconoscimento dei riferimenti",
            "markedAlready": "Documento marcato",
            "documentAllMarked": "Ho già marcato quello che sono riuscito a riconoscere automaticamente",
            "parsersErrors": {
                "LANG_MISSING_ERROR_TITLE": "Errore lingua",
                "langMissingError": "La lingua del documento non è stata trovata"
            },
            "refExtensionNotFound": "Non è stata trovata nessuna estensione",
            "refExtensionFound": "Il riferimento è stato esteso da \"{oldText}\" a \"{newText}\"",
            "paragraphParse": "Paragrafi marcati automaticamente"
        },
        "es": {
            "parseDocumentText": "Marcado Autimático",
            "parseDocumentTooltip": "Trate de analizar el documento automáticamente",
            "parsing": "Análisis",
            "postParsing": "Refinamiento",
            "quoteParsing": "Reconocimiento de las citas",
            "structureParser": "Reconocimiento de la estructura",
            "referenceParser": "Reconocimiento de referencias",
            "markedAlready": "Document is marked",
            "documentAllMarked": "I marked what I was able to recognize automatically",
            "parsersErrors": {
                "LANG_MISSING_ERROR_TITLE": "Error de idioma",
                "langMissingError": "Falta el idioma del documento"
            }
        },
        "ro": {
            "parseDocumentText": "Parser",
            "parseDocumentTooltip": "Încercă să analizăzi documentul în mod automat",
            "parsing": "Parsing",
            "postParsing": "Post parsing",
            "quoteParsing": "Parsing quotes",
            "structureParser": "Parsing structure",
            "referenceParser": "Parsing references",
            "markedAlready": "Document is marked",
            "documentAllMarked": "I marked what I was able to recognize automatically"
        },
        "ru": {
            "parseDocumentText": "Парсер",
            "parseDocumentTooltip": "Попробуйте анализировать этот документ автоматически",
            "parsing": "Анализ",
            "postParsing": "Post parsing",
            "quoteParsing": "Parsing quotes",
            "structureParser": "Parsing structure",
            "referenceParser": "Parsing references",
            "markedAlready": "Document is marked",
            "documentAllMarked": "I marked what I was able to recognize automatically"
        }
    },

    constructor: function() {
        Locale.setPluginStrings('akn-automatic-markup', this.strings);
    }
});
