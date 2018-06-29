/*
 * Copyright (c) 2015 - Copyright holders CIRSFID and Department of
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

// Undo/Redo manger for Lime using global checkpoints.
// This controller is responsible for
// - Creating and restoring full LIME checkpoints
// - Managing the stack of checkpoints
// Example Usage:
// var undoManager = this.getController('UndoManager');
// undoManager.addCheckpoint();
// if (undoManager.canUndo()) undoManager.undo();
// if (undoManager.canRedo()) undoManager.redo();
// Note: I would have preferred an approach based on the Command pattern,
// but it's really hard to introduce it in the messy Lime architecture due
// to the lack of a proper model and the fact that every plugin changes that
// model (the dom) directly. We may want to reconsider this decision if
// the situation improves.
Ext.define('LIME.controller.UndoManager', {
    extend: 'Ext.app.Controller',

    checkpoints: [],
    currentLevel: 0,
    maxLevels: 50,

    init: function () {
        this.startAutoCheckpoint();
    },

    startAutoCheckpoint: function() {
        clearInterval(this.checkpointInterval);
        this.checkpointInterval = setInterval(this.addCheckpoint.bind(this), 2000);
    },

    // Create and add a new checkpoint
    addCheckpoint: function () {
        var checkpoint = this.buildCheckpoint(),
            lastCheckpoint = this.checkpoints[this.currentLevel];
        if (this.areDifferent(checkpoint, lastCheckpoint)) {
            this.checkpoints.length = (++this.currentLevel) + 1;
            this.checkpoints[this.currentLevel] = checkpoint;
            if (this.checkpoints.length > this.maxLevels) {
                this.checkpoints.shift();
                this.currentLevel--;
            }
            this.fireEvent('change');
        }
    },

    // Restore the checkpoint before the current one
    undo: function () {
        console.info('undo()');
        if (!this.canUndo())
            throw new Error('undo(): undoStack empty');
        this.checkpoints[--this.currentLevel].restore();
        this.fireEvent('change');
    },

    // Restore the checkpoint after the current one
    redo: function () {
        console.info('redo()');
        if (!this.canRedo())
            throw new Error('redo(): redoStack empty');
        this.checkpoints[++this.currentLevel].restore();
        this.fireEvent('change');
    },

    // Remove all checkpoints
    reset: function () {
        this.currentLevel = 0;
        this.checkpoints = [this.buildCheckpoint()];
        this.fireEvent('change');
        this.startAutoCheckpoint();
    },

    // Return if we can revert to an earlier checkpoint
    canUndo: function () {
        return this.currentLevel > 0;
    },

    // Return if we can move to future checkpoint
    canRedo: function () {
        return (this.currentLevel + 1) < this.checkpoints.length;
    },

    // Create a checkpoint object which freezes:
    // - Document content
    // - Metadata (Not yet supported)
    buildCheckpoint: function () {
        var editorController = this.getController('Editor'),
            editor = editorController.getEditor(),
            html = editor && this.stripHtmlNoise(editor.getContent());
        if (!html) return null;
        return {
            html: html,
            restore: function () {
                console.info('restore', html.substring(0, 50));
                editorController.setContent(html);
            }
        };
    },

    // Given an html string, retuns it with its visibleBookmarks removed
    stripHtmlNoise: function (html) {
        return html.replace(/<span class="visibleBookmark">[^\/]*<\/span>/g, '')
                   .replace(/ focused="true"/g, '');
    },

    // Return whether the two checkpoints are equal
    areDifferent: function (a, b) {
        function normalize(str) {
            // In checkpoint comparison ignore:
            // - newlines
            // - id
            // - data-labelinfo
            // - internal ids
            return str.replace(/\r?\n|\r/g, '')
                      .replace(/ id="[^"]*"/g, '')
                      .replace(/ data-labelinfo="[^"]*"/g, '')
                      .replace(/ internalid="[^"]*"/g, '');
        }
        if (!a || !b) return true;
        if (!a.html || !b.html) return true;
        if (normalize(a.html) === normalize(b.html)) return false;
        // Utilities.debug.diff(normalize(a.html), normalize(b.html), 100);
        return true;
    }
});
