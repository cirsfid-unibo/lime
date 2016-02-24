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
 
$rules = Array(
    //"roman" => "(M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))",
    "roman" => "\b[IVX]+\b",
    "number" => "\d+|{{roman}}+|(U|Ú)NICO",
    "book" => "/(?<![\w\.\,] )(?P<num>({{bookList}})\s*({{number}}\s*[º°\.]*))/",
    "title" => "/(?<![\w\.\,] )(?P<num>({{titleList}})\s*({{number}}))/",
    "section" => "/(?<![\w\.\,] )(?P<num>({{sectionList}})\s*({{number}}\s*[º°\.]*))/",
    "chapter" => "/(?<![\w\.\,] )(?P<num>({{chapterList}})\s*({{number}}))/",
    "article" => "/(?<![\w\.\,] )(?P<num>({{articleList}})\s*({{number}}\s*[º°\.]*)([ -]*{{latino}})?)\s*({{heading}})?/",

    "heading" => "\([A-Z][^\(^\)]+\)\.?",

    "paragraph" => "/(?<![\w\.\,] ){{numparagraph}} +{{bodyitem}}/u",
    //"numparagraph" => "\(*\b\d{1,2}[\)\.\-]",
    "numparagraph" => "\b\d{1,2}[\.]|\b([IV]{1,3}-)\d{1,2}[\.]",

    /*
    "item" => "/(?<![\w\.\,] ){{numitem}} +{{bodyitem}}/u",
    "numitem" => "\(*\b[A-Za-z]{1,2}[\)\.\-]",
    "bodyitem" => "[\p{L}\p{N}\p{P}\p{S} ]+[\.;]?",
    "hierarchy" => Array("book","title","chapter","section","article","paragraph","item")
    */

    "item1" => "/(?<![\w\.\,] ){{numitem1}} +{{bodyitem}}/u",
    "item2" => "/(?<![\w\.\,] ){{numitem2}} +{{bodyitem}}/u",
    "numitem1" => "\(*\b[A-Za-z]{1,2}[\)]",
    "numitem2" => "\(*\b[0-9]{1,2}[\)]",
    "bodyitem" => "[\p{L}\p{N}\p{P}\p{S} ]+[\.;]?",
    "hierarchy" => Array("book","title","chapter","section","article","paragraph","item1","item2")

);

?>