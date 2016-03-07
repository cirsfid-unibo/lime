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

Ext.define('AknMetadata.Strings', {
    singleton : true,
    
    strings: {
        "en": {
            "title": "Metadata editor",
            "classification": "Classification",
            "keywords": "Keywords",
            "document": "Document",
            "date": "Date",
            "versionDate": "Version date",
            "number": "Number",
            "nation": "Nation",
            "language": "Language",
            "author": "Author",
            "prescriptive": "Prescriptive",
            "authoritative": "Authoritative",
            "aliases": "Aliases",
            "addItem": "Add a new item",
            "removeItem": "Remove selected items",
            "events": "Events",
            "source": "Source",
            "type": "Type",
            "revisions": "Revisions",
            "references": "References",
            "reference": "Reference",
            "value": "Value",
            "workflow": "Workflow",
            "steps": "Steps",
            "actor": "Actor",
            "role": "Role",
            "outcome": "Outcome",
            "dictionary": "Uri thesaurus",
            "associated": "Associated to",
            "wholeContent": "Whole content",
            "classify": "Classify",
            "seeelement": "Show associated element",
            "selectKeyword": "Select one of the following keywords",
            "emptySelection": "No item selected",
            "classifyConfirm": "Are you sure to classify the selected node as <b>{keyword}</b>?"
        },
        "it": {
            "title": "Editor metadati",
            "classification": "Classificazione",
            "keywords": "Parole chiavi",
            "document": "Documento",
            "date": "Data",
            "versionDate": "Data versione",
            "number": "Numero",
            "nation": "Nazione",
            "language": "Lingua",
            "author": "Autore",
            "prescriptive": "Prescrittivo",
            "authoritative": "Autorevole",
            "aliases": "Pseodomini",
            "addItem": "Aggiungi nuovo elemento",
            "removeItem": "Elimina gli elementi selezionati",
            "events": "Eventi",
            "source": "Fonte",
            "type": "Tipo",
            "revisions": "Revisioni",
            "references": "Riferimenti",
            "reference": "Riferimento",
            "value": "Valore",
            "workflow": "Iter",
            "steps": "Passi",
            "actor": "Attore",
            "role": "Ruolo",
            "outcome": "Esito",
            "dictionary": "Uri thesaurus",
            "associated": "Associato a",
            "wholeContent": "Contenuto intero",
            "classify": "Classifica",
            "seeelement": "Visualizza l'elemento associato",
            "selectKeyword": "Seleziona una parola chiave",
            "emptySelection": "Nessun elemento selezionato",
            "classifyConfirm": "Sei sicuro di voler classificare l'elemento selezionato come <b>{keyword}</b>?"
        },
        "es": {
            "title": "Editor de metadatos",
            "classification": "Classification",
            "keywords": "Palabras clave",
            "document": "Documento",
            "date": "Fecha",
            "versionDate": "Fecha de la versión",
            "number": "Número",
            "nation": "Nación",
            "language": "Idioma",
            "author": "Autor",
            "prescriptive": "Preceptivo",
            "authoritative": "Autoritario",
            "aliases": "Alias",
            "addItem": "Añadir un nuevo elemento",
            "removeItem": "Eliminar elementos seleccionados",
            "events": "Eventos",
            "source": "Fuente",
            "type": "Tipo",
            "revisions": "Las revisiones",
            "references": "Referencias",
            "reference": "Referencia",
            "value": "Valor",
            "workflow": "Workflow",
            "steps": "Pasos",
            "actor": "Actor",
            "role": "Papel",
            "outcome": "Resultado",
            "dictionary": "Uri thesaurus",
            "associated": "Associated to",
            "wholeContent": "Whole content",
            "classify": "Classify",
            "seeelement": "Show associated element",
            "selectKeyword": "Select one of the following keywords",
            "emptySelection": "No item selected",
            "classifyConfirm": "Are you sure to classify the selected node as <b>{keyword}</b>?"
        }
    },

    constructor: function() {
        Locale.setPluginStrings('akn-metadata', this.strings);
    }
});
