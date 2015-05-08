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

var fs = require('fs'),
    path = require('path'),
    libxml,
    libxslt;

// Validate content XML with the given schema using libxml
exports.validate = function (content, schemaPath, cb) {
    fs.readFile(schemaPath, { encoding: 'utf8' }, function (err, xsd) {
        if (err) return cb (err);
        // Schema inclusions are relative to working directory:
        // http://stackoverflow.com/questions/26294385/invalid-xsd-schema-using-libxmljs-with-nodejs
        var cwd = process.cwd();
        process.chdir(path.dirname(schemaPath));
        var xsdDoc = libxml.parseXml(xsd);
        var xmlDoc = libxml.parseXml(content);
        var isValid = xmlDoc.validate(xsdDoc);
        process.chdir(cwd);
        if (isValid) {
            cb(undefined, JSON.stringify({
                success: true
            }));
        }
        else {
            // console.log(xmlDoc.validationErrors);
            cb(undefined, JSON.stringify({
                errors: xmlDoc.validationErrors
            }));
        }
    });
};

// Convert content with the given XSLT using libxslt
// Note: doesn't work on Windows
exports.transform = function (content, xsltPath, cb) {
    console.log('transforming using libxslt');
    libxslt.parseFile(xsltPath, function (err, xslt) {
        if (err) cb(err);
        xslt.apply(content, function(err, result) {
            if (err) cb(err);
            else cb(undefined, result);
        });
    });
};

// {"error":[{"message":"Element '{http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}quotedText': This element is not expected.\n","line":97,"column":0,"type":"error","lineString":"&lt;p eId=&quot;body_1__art_5__p_1&quot;&gt;                 - Sustit&Atilde;&ordm;yese el inciso segundo del                          &lt;ref href=&quot;/uy/act/1971-08-17/14.005#4&quot; eId=&quot;body_1__art_5__p_1__ref_1&quot;&gt;art&Atilde;&shy;culo 4&Acirc;&ordm; de la Ley N&Acirc;&ordm; 14.005, de 17 de agosto de 1971&lt;/ref&gt;, por el siguiente: &quot;                          &lt;quotedText eId=&quot;body_1__art_5__p_1__qtxt_1&quot;&gt;Los &Atilde;&sup3;rganos y tejidos humanos almacenados en Bancos de Organos y Tejidos p&Atilde;&ordm;blicos o privados constituyen un bien p&Atilde;&ordm;blico de la comunidad, y el fin &Atilde;&ordm;ltimo de los mismos ser&Atilde;&iexcl; determinado por las necesidades asistenciales&lt;/quotedText&gt;&quot;.                                      &lt;/p&gt;"},{"message":"Element '{http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}quotedStructure': This element is not expected. Expected is one of ( {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}blockList, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}blockContainer, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}tblock, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}toc, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}ul, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}ol, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}table, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}p, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}foreign, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}block ).\n","line":116,"column":0,"type":"error","lineString":"&lt;quotedStructure eId=&quot;body_1__art_8__qstr_1&quot;&gt;"},{"message":"Element '{http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}quotedStructure': This element is not expected. Expected is one of ( {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}blockList, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}blockContainer, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}tblock, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}toc, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}ul, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}ol, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}table, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}p, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}foreign, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}block ).\n","line":131,"column":0,"type":"error","lineString":"&lt;quotedStructure eId=&quot;body_1__art_10__qstr_1&quot;&gt;"},{"message":"Element '{http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}quotedStructure': This element is not expected. Expected is one of ( {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}blockList, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}blockContainer, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}tblock, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}toc, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}ul, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}ol, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}table, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}p, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}foreign, {http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11}block ).\n","line":146,"column":0,"type":"error","lineString":"&lt;quotedStructure eId=&quot;body_1__art_12__qstr_1&quot;&gt;"}],"fatal_error":[],"warning":[],"started":true}

// Check if libxml and libxslt are are working correctly.
function setup () {
    exports.canValidate = false;
    exports.canTransform = false;
    try {
        libxml = require('libxmljs');
        exports.canValidate = true;
        libxslt = require('libxslt');
        libxslt.parse('<?xml version="1.0" encoding="UTF-8"?>\
                       <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\
                         <xsl:template match="/"></xsl:template>\
                       </xsl:stylesheet>');
        exports.canTransform = true;
    } catch (e) {
        // console.log(e);
    };
    console.log('libxml validation: ' + (exports.canValidate ? 'enabled' : 'disabled'));
    console.log('libxml XSLT: ' + (exports.canTransform ? 'enabled' : 'disabled'));
}

setup();