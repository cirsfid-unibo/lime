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

var exec = require('child_process').exec;

var saxonJar = './lib/saxon/saxon9he.jar'
var saxonCommand = 'java -cp ' + saxonJar;


// Validate content using Saxon
// Note: disabled since Saxon Home Edition doesn't support it.
exports.validate = function (content, schemaPath, cb) {
    throw new Error ('Saxon HE doesn\'t support schema validation.');
    // var command = saxonCommand + ' net.sf.saxon.Validate -s:- -xsd:' + schemaPath;
    // var options = { timeout: 10000 };
    // child = exec(command, options, function (error, stdout, stderr) {
    //     console.log(stderr, stdout, error);
    //     cb(error, stdout);
    // });
    // child.stdin.write(content);
    // child.stdin.end();
};

// Convert content with XSLT in xsltPath using Saxon
exports.transform = function (content, xsltPath, cb) {
    if(!exports.canTransform)
        throw new Error ('XSLT transformations with Saxon are disabled');
    var command = saxonCommand + ' net.sf.saxon.Transform -s:- -xsl:' + xsltPath;
    var options = { timeout: 10000 }
    child = exec(command, options, cb);
    child.stdin.write(content);
    child.stdin.end();
};

// Check if Saxon is properly installed.
function setup() {
    exports.canValidate = false;
    exports.canTransform = false;
    var testXsltPath = '../languagesPlugins/akoma3.0/AknToXhtml.xsl';
    var testCommand = saxonCommand + ' net.sf.saxon.Transform -s:- -xsl:' + testXsltPath;
    child = exec(testCommand, function (error, stdout, stderr) {
        if(error) console.log('Saxon XSLT: disabled');
        else console.log('Saxon XSLT: enabled');
        exports.canTransform = !error;
    });
    child.stdin.write('<akomaNtoso></akomaNtoso>');
    child.stdin.end();
};

setup();
