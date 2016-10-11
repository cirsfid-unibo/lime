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

	"references" => Array(
						  #"ref_0",
		                  "ref_1","ref_1a","ref_1b","ref_1c",
		                  #"ref_1cbis",
		                  "ref_1d","ref_1e","ref_1f",
						  "ref_range",

						  "ref_3","ref_3b","ref_3c",
						  "ref_4"
						  ),

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////

	"ref_0"  => "/(?P<fragment>{{partnum}}{{numlist}}?,)+\s+(?:della|del|dello|dell(’|'))\s*{{type}}\s+{{date}}\s*,\s*n\.\s*{{docnum}}/",
	"ref_1"  => "/(?P<fragment>{{partnum}}{{numlist}}?),?\s+(?:della|del|dello|dell(’|'))\s*{{type}}\s+{{date}}\s*,\s*n\.\s*{{docnum}}/",
	"ref_1a" => "/(?P<fragment>{{partnum}}{{numlist}}?),?\s+(?:della|del|dello|dell(’|'))\s*{{type}}\s*n\.\s*{{docnum}}/",
	"ref_1b" => "/(?P<fragment>{{partnum}}{{numlist}}?),?\s+(?:della|del|dello|dell(’|'))\s*{{type}}\s+del\s+{{date}}/",
	"ref_1c" => "/(?P<fragment>{{partnum}}{{numlist}}?),?\s+(?:della|del|dello|dell(’|'))\s*{{type}}/",
	"ref_1cbis" => "/(?P<fragment>{{partnum}}{{numlist}}?),?\s+(?:della|del|dello|dell(’|'))\s*(?P<fragments>{{partnum}}{{numlist}}?)/",
	"ref_1d" => "/{{type}}\s+{{date}}\s*,\s*n\.\s*{{docnum}}/",
	"ref_1e" => "/(?P<fragment>{{partnum}}{{numlist}})/",
	"ref_1f" => "/(?P<fragment>{{partnum}})/",

	"ref_range" => "/{{partition}}\s+{{range}}\s+(?:della|del|dello|dell(’|'))\s*{{type}}/",
	"range" => "(?:da\s+{{numFrom}}\s+a\s+{{numTo}})",

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	"docnum"   => "\d+\.?\d*",
	"date"     => "[\w\d\s\.°﻿]+\d{4}",

    "partnum"  => "(?:(?:, )?{{partition}}\s+{{num}}){1,6}",

    "num"      => "(?:\b[a-z]{1,2}\b\))|(?:\b[0-9]{1,4}\b(?:\.[0-9]+)?\)?[\-\–]?{{latin}}?)",
    "numFrom"  => "(?:\b[a-z]{1,2}\b\))|(?:\b[0-9]{1,4}\b(?:\.[0-9]+)?\)?[\-\–]?{{latinFrom}}?)",
	"numTo"    => "(?:\b[a-z]{1,2}\b\))|(?:\b[0-9]{1,4}\b(?:\.[0-9]+)?\)?[\-\–]?{{latinTo}}?)",
    "numFake"  => "(?:\b[a-z]{1,2}\b\))|(?:\b[0-9]{1,4}\b(?:\.[0-9]+)?\)?[\-\–]?{{latinFake}}?)",

    "numlist"  => "(?:(?:\,\s*{{numFrom}}){1,20}(?:\s+e\s+{{numTo}})?)|(?:\s+e\s+{{numFake}})",

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

	"ref_3"  => "/O +del +{{date}}/",
	"ref_3b" => "/direttiva +\d+\/\d+\/CE/",
	"ref_3c" => "/procedimento +[C\-\d]+\/\d+/",

	"ref_4"  =>"/{{partition}} +{{num}}( +delle +disposizioni +transitorie)? +della +Costituzione +federale/",

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    "latin"     => Array("bis","ter","quater","quinquies"),
    "latinFrom" => Array("bis","ter","quater","quinquies"),
    "latinTo"   => Array("bis","ter","quater","quinquies"),
    "latinFake" => Array("bis","ter","quater","quinquies"),

    "ordinal" => Array("primo",
    	               "secondo",
    	               "terzo",
    	               "quarto",
    	               "quinto",
    	               "sesto",
    	               "settimo",
    	               "ottavo",
    	               "nono",
    	               "decimo",
    	               "undicesimo",
    	               "dodicesimo",
    	               "tredicesimo",
    	               "quattordicesimo",
    	               "quindicesimo",
    	               ),
	
	"partition" => Array("articolo",
						 "articoli",
						 "art\.",
						 "artt\.",
						 "comma",
						 "commi",
						 "lettera",
						 "lettere",
						 "numero",
						 "numeri",
						 ),

	// string not regex
	"partition_type" => Array("article" 	=> Array("articolo",
													 "articoli",
													 "art.",
													 "artt.",
													 ),

	                          "paragraph" 	=> Array("comma",
	                          	                     "commi",
		                       						),

	                          "item"		=> Array("lettera",
						 							 "lettere",
						 							 ),

	                          "num"			=> Array("numero",
						 							 "numeri",
						 							 ),
		                     ),
);

?>