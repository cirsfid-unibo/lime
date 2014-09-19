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

$partNames = array( 
	"comma" => "clause" ,
	"sezione" => "section" ,
	"parte" => "part" ,
	"paragrafo" => "paragraph" ,
	"capitolo" => "chapter" ,
	"titolo" => "title" ,
	"articolo" => "article" ,
	"libro" => "book" ,
	"tomo" => "tome" ,
	"divisione" => "division" ,
	"lista" => "list" ,
	"punto" => "point" ,
	"lettera" => "indent" ,
	"numero" => "alinea" ,
	"subsezione" => "subsection" ,
	"subparte" => "subpart" ,
	"subparagrafo" => "subparagraph" ,
	"subcapitolo" => "subchapter" ,
	"subtitolo" => "subtitle" ,
	"subccomma" => "subclause" ,
	"sublista" => "sublist" 
) ;

$abbreviations = array( 
	"c" => "clause" ,
	"sez" => "section" ,
	"pt" => "part" ,
	"par" => "paragraph" ,
	"cap" => "chapter" ,
	"tit" => "title" ,
	"art" => "article" ,
	"div" => "division" ,
) ;

$decorations = array(
	"bis",
	"ter",
	"quater",
	"quinquies",
	"[a-z]{1,2}"
) ; 

$localpatterns = array( 
	"solo italiano: PROVA - heading"         => "/^(?P<part>PROVA)\W+(?P<heading>.*)$/i" 
) ;

$examples = <<<END
	<li>Art. 12 Rubrica dell'articolo</li>
	<li>Articolo 14 bis - Rubrica dell'articolo</li>
	<li>Tomo XV 
	Altra rubrica dell'articolo</li>
	<li>14) Del testo</li>
	<li>c - Dell'altro testo</li>
	<li>Sezione 123 - Ancora testo</li>
	<li>Sez. 123 a: Dell'altro testo</li>
	<li>Libro XXVII: Del matrimonio</li>
	<li>Tomo ii: questo è sbagliato</li>
END;

?>