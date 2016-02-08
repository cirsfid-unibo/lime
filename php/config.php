<?php
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
    require_once('lime-config.php');

    /*
     * This files contains all the configurations strings for the server side calls
     */

    // the base directory of the xslt stylesheets
    define('XSLT_BASE_DIR', dirname(__FILE__) . '/../resources/xslt/');

    // the xslt that translates akomantoso to pdf
    define('AKN_TO_PDF', XSLT_BASE_DIR . 'AknToPdfGeneric.xsl');

    // the xslt that translates akomantoso2 to xhtml
    define('AKN2_TO_HTML', XSLT_BASE_DIR . 'Akn20ToXhtml.xsl');

    // the xslt that translates akomantoso2 to a package for ebook
    define('AKN20_TO_XHTML', XSLT_BASE_DIR . 'AknToXhtml20.xsl');

    // the xslt that translates akomantoso2 to a package for ebook
    define('AKN30_TO_XHTML', XSLT_BASE_DIR . 'AknToXhtml30.xsl');

    // the xslt that translates akomantoso3 to xhtml
    define('AKN3_TO_HTML', XSLT_BASE_DIR . 'Akn30ToXhtml.xsl');

    // the xslt that translates akomantoso2 to xhtml italian
    define('AKN2_TO_HTML_ITA', XSLT_BASE_DIR . 'Akn20ToXhtml_ita_senato.xsl');

    // the xslt that translates akomantoso3 to xhtml italian
    define('AKN3_TO_HTML_ITA', XSLT_BASE_DIR . 'Akn30ToXhtml_ita_senato.xsl');

    // the xslt that cleans an abiword converted document's html up
    define('CLEAN_CONVERTED_HTML', XSLT_BASE_DIR . 'CleanConvertedHtml.xsl');

    // the xslt that normalizes the attributes
    define('ATTRIBUTES_NORMALIZER', XSLT_BASE_DIR . 'AknAttributesNormalizer.xsl');

    // absolute path to Fop utility
    // this path is specified as an absolute path however FOP is included into the main project
    // package
    // DEPRECATED
    define('FOP_COMMAND', realpath(dirname(__FILE__)."/lib/isafop/fop"));

    // relative path to temp directory
    define('TMPSUBDIRLOCALPATH', '../../tmp/');

    // path to root of LIME
    define('LIMEROOT', realpath(dirname(__FILE__)."/../"));

    // web relative path to temp directory
    define('TMPSUBDIRWEBPATH', 'tmp/');

    // the name of source xml files
    define('SOURCEXMLFILENAME', 'source.xml');

    // the name of fo xsl files
    define('XSLFOFILENAME', 'intermediate.xml');    

    // the name of pdf files
    define('PDFFILENAME', 'final.pdf');

    // the name of scf files
    define('SCF_FILENAME', 'ebook-scf.xml');

    // the name of epub files
    define('EPUBFILENAME', 'ebook.epub');

    // the scriba command
    define('SCRIBA_COMMAND', "java -Xmx1024m -jar ".realpath(dirname(__FILE__)."/lib/scriba/ScribaEBookMaker.jar")." -t EPUB -c %s -o %s");

    // the absolute path of scf template
    define('SCF_TEMPLATE', realpath(dirname(__FILE__)."/lib/scriba/scf-template.xml"));
