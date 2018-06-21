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

Ext.define('AknCollection.DocumentCollectionController', {
    extend : 'Ext.app.Controller',

    views : ['AknCollection.NewDocumentCollection'],

    requires: [
        'AknMain.xml.DocumentCollection',
        'Xml.Document',
        'AknMain.LangProp',
        'AknMain.metadata.HtmlSerializer'
    ],

    refs : [
        { ref: 'appViewport', selector: 'appViewport'},
        { ref: 'docCollectionTab', selector: '*[cls=docCollectionTab]'},
        { ref: 'markingMenu', selector: 'markingMenu'}
    ],

    config: {
        pluginName: "akn-collection",
        colModSuffix: "-mod",
        docColAlternateType: "documentCollectionContent"
    },

    collectionLoaded: false,

    init: function() {
        var me = this;
        me.application.on(Statics.eventsNames.afterLoad, me.onDocumentLoaded, me);
        me.addMenuItem();

        me.control({
            '*[cls=modifyDocColl]': {
                click: function() {
                    me.newDocumentCollection(true);
                }
            },
            '*[cls=docCollectionTab] treepanel': {
                itemclick : function(view, rec, item, index, eventObj) {
                    me.switchDoc(rec.getData());
                },
                afterrender: function() {
                    me.selectActiveDocument(-1);
                }
            },
            'newDocumentCollection': {
                afterrender: function(cmp) {
                    var collectionGrid = cmp.down("*[cls=dropArea] grid"),
                    config, gridStore, components = [];
                    if (!cmp.isModify) return;
                    components = this.getDocumentsFromSnapshot(me.completeEditorSnapshot);
                    if (collectionGrid) {
                        gridStore = collectionGrid.getStore();
                        gridStore.loadData(components);
                    }
                }
            },
            'newDocumentCollection button[cls=createDocumentCollection]' : {
                click : function(cmp) {
                    var relatedWindow = cmp.up('window'),
                        collectionGrid = relatedWindow.down("*[cls=dropArea] grid"),
                        components = [];
                    if (collectionGrid) {
                        var gridStore = collectionGrid.getStore();
                        gridStore.each(function(record) {
                            components.push({
                                id: record.get('id'),
                                download: record.get('cls') !== 'xml'
                            });
                        });
                    }
                    me.createDocumentCollection(components, function () {
                        relatedWindow.close();
                    });
                }
            },
            'newDocumentCollection *[cls=dropArea] gridview' : {
                drop : function(node, data, dropRec, dropPosition) {
                    var record = data.records[0], store = record.store;
                    if (record.get('cls') == "folder") {
                        store.requestNode = record.get('id');
                        store.load({
                            addRecords : true,
                            scope : this,
                            callback : function(records, operation, success) {
                                var oldRecordIndex = store.indexOf(record);
                                // Remove the "version" record
                                store.remove(record);
                                // If new records are in the wrong position move they
                                if (store.indexOf(records[0]) != oldRecordIndex) {
                                    store.remove(records);
                                    store.insert(oldRecordIndex, records);
                                }
                            }
                        });
                    }
                },
                beforedrop : function(node, data, overModel, dropPosition, dropHandlers) {
                    var record = data.records[0], relatedWindow = data.view.up("window"), dropGrid = relatedWindow.down("*[cls=dropArea] gridview");

                    dropHandlers.wait = true;
                    // Check if the record already exist in the store and cancel drop event if so
                    if (dropGrid != data.view && dropGrid.getStore().find('id', record.get('id')) != -1) {
                        dropHandlers.cancelDrop();
                    } else {
                        dropHandlers.processDrop();
                    }
                }
            }
        });
    },

    addMenuItem: function() {
        var menu = {
            text : Locale.getString("newCollectionText", this.getPluginName()),
            icon : 'resources/images/icons/package_add.png',
            name : 'newDocCollection',
            handler : Ext.bind(this.newDocumentCollection, this, [false])
        };
        this.application.fireEvent("addMenuItem", this, {
            menu: "fileMenuButton",
            after: "newDocumentButton"
        }, menu);
    },

    onDocumentLoaded: function(docConfig) {
        var me = this,
            app = me.application,
            collTab = me.getDocCollectionTab(),
            tabPanel = collTab.up();

        // Create snapshot and documents tree only if the load is not light load but a complete one
        if (!docConfig.lightLoad) {
            if (docConfig.docType == 'documentCollection') {
                me.collectionLoaded = true;
                me.completeEditorSnapshot = me.createEditorSnapshot();
                me.setDocumentTreeData(docConfig);
            } else {
                // Disables the document collection tab if the opened document is not a document collection
                tabPanel.setActiveTab(0);
                tabPanel.getTabBar().items.items[1].disable();
                me.collectionLoaded = false;
            }
        }

        if (docConfig.docType == 'documentCollection' && !docConfig.colectionMod) {
            tabPanel.setActiveTab(collTab);
            tabPanel.getTabBar().items.items[0].disable();
            tabPanel.getTabBar().items.items[1].enable();
            app.fireEvent(Statics.eventsNames.disableEditing);
        } else {
            tabPanel.setActiveTab(0);
            tabPanel.getTabBar().items.items[0].enable();
            app.fireEvent(Statics.eventsNames.enableEditing);
        }

        if (me.collectionLoaded)
            me.selectActiveDocument(docConfig.treeDocId, true);
    },

    newDocumentCollection : function(modify) {
        var newWindow = Ext.widget('newDocumentCollection'),
            grid = newWindow.down("*[cls=dropArea] grid");
        if (modify) {
            newWindow.setData(DocProperties.documentInfo);
            newWindow.isModify = true;
        } else {
            grid.getStore().removeAll();
        }
        newWindow.onAddColumn = Ext.bind(this.onAddColumn, this);
        newWindow.show();
    },

    docCollectionBeforeTranslate: function(params) {
        if (!this.collectionLoaded) return params;
        var me = this, dom = params.docDom, metaConf = DocProperties.docsMeta,
            documents, snapshot, tmpDom, rootEl;

        // Checking if the request is before saving the document
        if (params.complete && me.completeEditorSnapshot) {
            snapshot = me.updateEditorSnapshot(me.completeEditorSnapshot);
            if(snapshot.dom) {
                tmpDom = DomUtils.parseFromString(snapshot.content);
                DomUtils.moveChildrenNodes(tmpDom, dom);
            }
        }
        documents = dom.querySelectorAll("*["+DocProperties.docIdAttribute+"]");
        // Insert the metadata which was removed before loading
        if (metaConf) {
            Ext.each(documents, function(doc, index) {
                var docId = doc.getAttribute(DocProperties.docIdAttribute);
                docId = (docId!=undefined) ? parseInt(docId) : undefined;
                // The first document is processed by the editor here we process
                // the documents inside the first document e.g. documentCollection
                if (docId != 0 && metaConf[docId] && metaConf[docId].metaDom) {
                    var metaDom = Ext.clone(metaConf[docId].metaDom);
                    metaDom.setAttribute("class", "meta");
                    if ( doc.firstChild && Ext.fly(doc.firstChild) && !Ext.fly(doc.firstChild).is('.meta') )
                        doc.insertBefore(metaDom, doc.firstChild);

                    me.getController('Language').overwriteMetadata(metaDom, Ext.getStore('metadata').getAt(docId));
                }
            }, this);
        }
        // Copy the root attributes from snapshot to dom
        if (me.completeEditorSnapshot && me.completeEditorSnapshot.dom) {
            rootEl = me.completeEditorSnapshot.dom.querySelector("*["+DocProperties.markingLanguageAttribute+"]");
            tmpDom = dom.querySelector("*["+DocProperties.markingLanguageAttribute+"]");
            if(!tmpDom && rootEl) {
                Ext.each(rootEl.attributes, function(el) {
                    dom.setAttribute(el.nodeName, el.nodeValue);
                });
            }
        }

        params.docDom = dom;
        return params;
    },

    createEditorSnapshot: function(config) {
        var editor = this.getController('Editor'),
            newSnapshot = {
                content: editor.getContent()
            };
        newSnapshot.dom = DomUtils.parseFromString(newSnapshot.content);
        return newSnapshot;
    },

    updateEditorSnapshot: function(snapshot) {
        var me = this, editor = me.getController('Editor'),
            newSnapshot = me.createEditorSnapshot(),
            snapshotDoc, newSnapshot, editorDoc, editorDocId;
        if (newSnapshot.dom) {
            editorDoc = newSnapshot.dom.querySelector("*["+DocProperties.docIdAttribute+"]");
            if (editorDoc) {
                editorDocId = editorDoc.getAttribute(DocProperties.docIdAttribute);
                if(me.isDocColMod(editorDoc)) {
                    snapshot.dom = me.docColModToSnapshot(editorDoc, editorDocId, snapshot);
                } else if (parseInt(editorDocId) === 0) {
                    snapshot.dom = newSnapshot.dom;
                } else {
                    Utilities.replaceChildByQuery(snapshot.dom, "["+DocProperties.docIdAttribute+"='" + editorDocId + "']", editorDoc);
                }
                snapshot.content = DomUtils.serializeToString(snapshot.dom);
            }
        }
        return Ext.merge(snapshot, {editorDocId: editorDocId});
    },

    isDocColMod: function(doc) {
        var colMod = parseInt(doc.getAttribute("colmod"));
        if(isNaN(colMod)) {
            return false;
        }
        return (colMod) ? true : false;
    },

    docToTreeData: function(doc, dom, textSufix, qtip) {
        var docChildren = [];
        if (!doc) return {};

        if(doc.classList.contains('documentCollection'))
            docChildren.push({text: doc.getAttribute(LangProp.attrPrefix+'name') || 'collection',
               leaf: true,
               id: doc.getAttribute('docid')+this.getColModSuffix(),
               qtip: 'collection'});

        var collBody = doc.querySelector('*[class~=collectionBody]');
        var children = (collBody) ? DomUtils.filterMarkedNodes(collBody.childNodes) : [];
        for (var i = 0; i < children.length; i++) {
            var cmpDoc = children[i];
            if (cmpDoc.classList.contains('component'))
                cmpDoc = DomUtils.filterMarkedNodes(cmpDoc.childNodes)[0];
            if(!cmpDoc) continue;

            var treeData;
            if (DomUtils.getElementNameByNode(cmpDoc) == 'documentRef')
                treeData = this.docToTreeData(this.findDocByDocRef(cmpDoc), dom,
                                                    cmpDoc.getAttribute(LangProp.attrPrefix+"href"),
                                                    cmpDoc.getAttribute(LangProp.attrPrefix+'showAs'));
            else if(cmpDoc.classList.contains(DocProperties.documentBaseClass))
                treeData = this.docToTreeData(cmpDoc, dom);

            if (!Ext.Object.isEmpty(treeData))
                docChildren.push(treeData);
        }

        var res = {text:DomUtils.getDocTypeByNode(doc) + ((textSufix) ? ' '+ textSufix : ''),
               children: docChildren,
               leaf: (docChildren.length === 0),
               expanded : (docChildren.length >= 0),
               id: parseInt(doc.getAttribute('docid')),
               qtip: qtip};
        return res;
    },

    findDocByDocRef: function(node) {
        var docRef = AknMain.metadata.HtmlSerializer.normalizeHref(node.getAttribute(LangProp.attrPrefix+"href"));
        if (!docRef) return;
        var doc = node.ownerDocument.querySelector("*[class~='components'] "+
                                                    "*["+LangProp.attrPrefix+LangProp.elIdAttr+"="+docRef+"] "+
                                                    "*[class~="+DocProperties.documentBaseClass+"]");
        return doc;
    },

    selectActiveDocument: function(docId, persistent) {
        var openedDocumentsStore = this.getStore('OpenedDocuments'),
            treePanel = this.getDocCollectionTab().down("treepanel"),
            node;

        docId = (docId == -1) ? this.selectedDocId : docId;
        node = (docId) ? openedDocumentsStore.getNodeById(docId) : openedDocumentsStore.getRootNode().firstChild;

        if (node) {
            treePanel.getSelectionModel().select(node, false, true);
        }
        if (persistent) {
            this.selectedDocId = docId;
        }
    },

    setDocumentTreeData: function(docConfig) {
        var openedDocumentsStore = this.getStore('OpenedDocuments'), treeData = [];
        if (docConfig.docDom && docConfig.docType == "documentCollection") {
            var currentDocument = docConfig.docDom.querySelector("*[class*="+docConfig.docType+"]");
            treeData.push(this.docToTreeData(currentDocument, docConfig.docDom));
        }
        openedDocumentsStore.setRootNode({children: treeData, expanded: true});
    },

    onAddColumn : function(columnDescriptor) {
        var config = {};
        if (columnDescriptor && (columnDescriptor.fieldName == "version" || columnDescriptor.fieldName == "docName")) {
            config = {
                viewConfig : {
                    plugins : {
                        ptype : 'gridviewdragdrop',
                        dragGroup : 'secondGridDDGroup',
                        dropGroup : 'firstGridDDGroup',
                        dragText : Locale.getString("dragDocText", this.getPluginName())
                    }
                },
                cls : 'draggableGrid'
            };
        }
        return config;
    },

    // Create a new document collection with `documents` and load it in the editor.
    // `documents` is a list of objects with `id` and `download` properties:
    // Documents with download set to true will be downloaded from server,
    // documents with download set to false will be read from the current file.
    // Call `callback` when done.
    createDocumentCollection: function(documents, callback) {
        var me = this;
        var xmls = [];
        function next() {
            me.getDocumentXml(documents.shift(), function (xml) {
                xmls.push(xml);
                if(documents.length > 0) next();
                else done();
            });
        }
        function done() {
            var collection = new AknMain.xml.DocumentCollection ({
                linkedDocuments: xmls,
                docLang: DocProperties.documentInfo.docLang, //TODO: get from input form not from document
                docLocale: DocProperties.documentInfo.docLocale
            });
            collection.toHtmlToso(function (html) {
                Ext.GlobalEvents.fireEvent(Statics.eventsNames.loadDocument, {
                    docText: html
                });
                if (callback) callback();
            });
        }
        return next();
    },

    getDocumentXml: function (document, callback) {
        var me = this;
        // TODO: the performance of this is awful: we should make requests in
        // parallel and use only one translateRequest.
        if (document.download) {
            Server.getDocument(document.id, callback);
        } else {
            me.application.fireEvent(Statics.eventsNames.translateRequest, function(err, xml) {
                if (err) return callback('');

                var result = Xml.Document.parse(xml, 'akn').getXml(
                    '//akn:component/*' +
                    '[descendant::akn:FRBRthis[@value="' + document.id + '"]]'
                );
                if (result)
                    callback('<akomaNtoso>' + result + '</akomaNtoso>');
                else {
                    callback('');
                }
            }, {complete: true});
        }
    },

    switchDoc: function(config) {
        var me = this,
            snapshot = me.completeEditorSnapshot;
        if (!snapshot || !snapshot.dom) return;

        // Before loading a new document we need to update
        // the snapshot with new content from the editor
        var newSnapshot = me.updateEditorSnapshot(snapshot),
            docId = Ext.isString(config.id) ? parseInt(config.id) : config.id,
            docMeta = DocProperties.docsMeta[docId],
            colMod = Ext.isString(config.id) ? (config.id.indexOf(me.getColModSuffix()) != -1) : false;
        // Select the document in the snapshot and load it
        var doc = (docId === 0) ? snapshot.dom :
                    snapshot.dom.querySelector("*["+DocProperties.docIdAttribute+"='" + docId + "']");
        var prevColMod = doc.querySelector("[colmod]");
        prevColMod = (prevColMod) ? parseInt(prevColMod.getAttribute("colmod")) : 0;
        if (doc && ((docId != parseInt(newSnapshot.editorDocId)) || colMod || prevColMod)) {
            if(colMod) {
                doc = me.snapshotToDocColMod(snapshot, docId);
                docTypeAlternateName = "";
            }
            var docEl = doc.querySelector("["+DocProperties.docIdAttribute+"]");
            if(docEl) {
                docEl.setAttribute("colmod", (colMod) ? 1 : 0);
            }
            Ext.GlobalEvents.fireEvent(Statics.eventsNames.loadDocument, Ext.Object.merge(docMeta, {
                docMarkingLanguage: Config.getLanguage(),
                docText : DomUtils.serializeToString(doc),
                alternateDocType: (colMod) ? me.getDocColAlternateType() : null,
                lightLoad : true,
                treeDocId : config.id,
                docIndex: docId,
                colectionMod : colMod
            }));
        }
    },

    snapshotToDocColMod: function(snapshot, docId) {
        // Create a temporary copy of the snapshot, don't modify it directly!
        var completeSnapshotDom = DomUtils.parseFromString(snapshot.content),
            doc = (docId === 0) ? completeSnapshotDom : completeSnapshotDom.querySelector("*["+DocProperties.docIdAttribute+"='" + docId + "']"),
            docCol = completeSnapshotDom.querySelector("*["+DocProperties.docIdAttribute+"='" + docId + "']"),
            colBody;
        Utilities.removeNodeByQuery(doc, "[class*=components]");
        return doc;
    },

    docColModToSnapshot: function(doc, docId, snapshot) {
        var completeSnapshotDom = DomUtils.parseFromString(snapshot.content), oldDoc, collectionBody;
        if (completeSnapshotDom) {
            /*oldDoc = completeSnapshotDom.querySelector("["+DocProperties.docIdAttribute+"='" + docId + "']");
            if (oldDoc) {
                collectionBody = oldDoc.querySelector("[class*=collectionBody]");
                doc.appendChild(collectionBody);
            }*/
            Utilities.replaceChildByQuery(completeSnapshotDom, "["+DocProperties.docIdAttribute+"='" + docId + "']", doc);
        }
        return completeSnapshotDom;
    },

    // TODO: porting to the new metadata
    getDocumentsFromSnapshot: function(snapshot) {
        var domDocs, documents = [], metaConf = DocProperties.docsMeta;
        if (snapshot && snapshot.dom) {
            domDocs = snapshot.dom.querySelectorAll("*["+DocProperties.docIdAttribute+"]");
            Ext.each(domDocs, function(doc, index) {
                var docId = doc.getAttribute(DocProperties.docIdAttribute),
                    metaDom, uri;
                docId = (docId!=undefined) ? parseInt(docId) : undefined;
                // Document with id '0' is the collection
                if (docId != 0 && metaConf[docId] && metaConf[docId].metaDom) {
                    metaDom = metaConf[docId].metaDom;
                    uri = metaDom.querySelector("*[class=FRBRManifestation]>*[class=FRBRthis]");
                    uri = (uri) ? uri : metaDom.querySelector("*[class=FRBRExpression]>*[class=FRBRuri]");
                    uri = uri.getAttribute("value");
                    documents.push({
                        id: uri,
                        cls: 'xml',
                        path: uri
                    });
                }
            }, this);
        }
        return documents;
    }
});
