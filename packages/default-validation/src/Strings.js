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

 Ext.define('DefaultValidation.Strings', {
    singleton : true,
    
    strings: {
        "en": {
            "validateXml": "Validate XML",
            "validateXmlTooltip": "Use XML validator to validate the XML",
            "validateResult": "Validation result",
            "validationProcessError": "Cannot process validation error",
            "validationSuccess": "The document is valid",
            "validationFatalErrors": "Fatal errors",
            "validationErrors": "Errors",
            "validationWarnings": "Warnings",
            "validateResultErrors": "Found {nr} errors",
            "previous": "&laquo; Previous",
            "next": "Next &raquo;",
            "element": "Element {name}",
            "moreInfo": "More Info",
            "technicalInfo": "Technical Info",
            "moreInfoTpl" : "{error} - {lineString} at ({line}:{column}) - {code}",
            "tipsToResolveError": "Tips to fix this error (try one of the followings)",
            "unexpectedElement": "is not expected in {parentName}",
            "unexpectedQuoted": "needs to be inside of a modification element",
            "addActiveModification": "Add a modification around the element",
            "unmarkQuoted": "Unmark the '{name}' if it is not quoting a part of an document but is a simple quote",
            "elementOnly": "can not directly contain plain text",
            "elementNotMarked": "is not fully or partially marked",
            "markInsideElement": "mark missing elements inside this element",
            "runAutomaticMarkup": "try to run the 'Automatic Markup'",
            "removeText": "delete the plain text from this element"
        },
        "es": {
            "validateXml": "Validar XML",
            "validateXmlTooltip": "Use el XML validador para validar el XML",
            "validateResult": "Resultado de la validación",
            "validationProcessError": "No es posible procesar la validación de errores",
            "validationSuccess": "El documento es válido",
            "validationFatalErrors": "Error grave",
            "validationErrors": "Errores",
            "validationWarnings": "Advertencias",
            "validateResultErrors": "Se encontraron {nr} errores",
            "previous": "&laquo; Previo",
            "next": "Siguiente &raquo;",
            "element": "Elemento {name}",
            "moreInfo": "Más información",
            "technicalInfo": "Información técnica",
            "moreInfoTpl": "{error} - {lineString} en ({line}:{column}) - {code}",
            "tipsToResolveError": "Sugerencias para corregir este error (pruebe una de las siguientes)",
            "unexpectedElement": "no es posible incluirlo en {parentName}",
            "unexpectedQuoted": "Es necesario incluirlo dentro de un elemento del tipo Modificación",
            "addActiveModification": "Incluya el elemento dentro de una marca de modificación",
            "unmarkQuoted": "Desmarque el '{name}' si no es una comilla incluida en el propio documento ",
            "elementOnly": "no puede contener texto plano directamente",
            "elementNotMarked": "no está total o parcialmente marcado",
            "markInsideElement": "marque los elementos faltantes dentro de este elemento",
            "runAutomaticMarkup": "intente ejecutar el 'Marcado automático'",
            "removeText": "borre el texto plano dentro de este elemento"
        },
        "it": {
            "validateXml": "Validazione XML",
            "validateXmlTooltip": "Usa il validatore XML per validare il documento",
            "validateResult": "Risultato della validazione",
            "validationProcessError": "E' stato impossibile eseguire la validazione a causa dell'errore",
            "validationSuccess": "Documento valido",
            "validationFatalErrors": "Errori fatali",
            "validationErrors": "Errori",
            "validationWarnings": "Avvertimenti",
            "validateResultErrors": "Trovati {nr} errori",
            "previous": "&laquo; Precedente",
            "next": "Successivo &raquo;",
            "element": "Elemento {name}",
            "moreInfo": "Più informazioni",
            "technicalInfo": "Dettagli tecnici",
            "moreInfoTpl" : "{error} - {lineString} a ({line}:{column}) - {code}",
            "tipsToResolveError": "Suggerimenti per correggere questo errore (prova uno dei seguenti)",
            "unexpectedElement": "non è previsto in {parentName}",
            "unexpectedQuoted": "deve essere all'interno di un elemento di modifica",
            "addActiveModification": "Aggiungere una modifica attorno all'elemento",
            "unmarkQuoted": "Smarca '{name}' se non cita una parte di un documento, ma è una semplice citazione",
            "elementOnly": "non può contenere direttamente testo",
            "elementNotMarked": "non è completamente o parzialmente marcato",
            "markInsideElement": "marca gli elementi mancanti all'interno di questo elemento",
            "runAutomaticMarkup": "prova a lanciare 'Markup automatico'",
            "removeText": "eliminare il testo da questo elemento"
        }
    }
});