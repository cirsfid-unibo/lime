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

 Ext.define('AknModsMarker.Strings', {
    singleton : true,

    strings: {
        "en": {
            "insertion": "Insertion",
            "substitution": "Substitution",
            "repeal": "Repeal",
            "activeModifications": "Active modifications",
            "passiveModifications": "Passive modifications",
            "split": "Split",
            "join": "Join",
            "renumbering": "Renumbering",
            "destinationText": "Destination Text",
            "action": "Action",
            "renumbered": "renumbered",
            "joined": "joined",
            "splitted": "splitted",
            "inserted": "inserted",
            "deleted": "deleted",
            "replaced": "replaced",
            "modType": "Modification type",
            "externalRef": "Set external ref",
            "quotedType": "Type",
            "oldText": "The old text",
            "haveToSelectElement": "You have to select {name} element",
            "splitOnlySiblings": "You can split only sibling nodes",
            "causedRenumbering": "This modification has caused a renumbering?"
        },
        "it": {
            "insertion": "Inserimento",
            "substitution": "Sostituzione",
            "repeal": "Abrogazione",
            "activeModifications": "Modifiche attive",
            "passiveModifications": "Modifiche passive",
            "split": "Divisione",
            "join": "Unione",
            "renumbering": "Rinumerazione",
            "destinationText": "Testo di destinazione",
            "action": "Azione",
            "renumbered": "renumerato",
            "joined": "unito",
            "splitted": "diviso",
            "inserted": "inserito",
            "deleted": "rimosso",
            "replaced": "sostituito",
            "modType": "Tipo modifica",
            "externalRef": "Aggiungi riferimento",
            "quotedType": "Tipo",
            "oldText": "Testo precedente",
            "haveToSelectElement": "Devi selezionere un elemento {name}",
            "splitOnlySiblings": "Puoi dividere solo elementi vicini",
            "causedRenumbering": "Questa modifica ha causato una rinumerazione?"
        },
        "es": {
            "insertion": "Insertion",
            "substitution": "Sustitución",
            "repeal": "Revocación",
            "activeModifications": "Cambios Activos",
            "passiveModifications": "Cambios Pasivos",
            "split": "División",
            "join": "Unirse",
            "renumbering": "Renumeración",
            "destinationText": "Destination Text",
            "action": "Action",
            "renumbered": "renumerado",
            "joined": "unido",
            "splitted": "diviso",
            "inserted": "adicional",
            "deleted": "eliminado",
            "replaced": "reemplazado",
            "modType": "Tipo de modificación",
            "externalRef": "Set external ref",
            "quotedType": "Type",
            "oldText": "El texto anterior",
            "haveToSelectElement": "Usted tiene que seleccionar el elemento {name}",
            "splitOnlySiblings": "Se puede dividir nodos único hermano",
            "causedRenumbering": "Esta modificación ha provocado una nueva numeración?"
        }
    },

    constructor: function() {
        Locale.setPluginStrings('akn-mods-marker', this.strings);
    }
});
