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

global $patterns, $decorations, $partNames; 
$meta = array(
	"author" => "Fabio Vitali",
	"name" => "Heading parser",
	"date" => "14/06/2012",
	"desc" => "A parser for the headings of legislative documents",
	"copyright" => "© 2012 Fabio Vitali, all rights reserved",
);
$return = array() ;

$debug = isset($_GET['debug'])?true:false ;
debug("*** START ***");
$string = stripcslashes(isset($_GET['s'])?$_GET['s']:"") ;
debug("string: ".$string);
$format = isset($_GET['f'])?$_GET['f']:"json" ;
debug("format: ".$format);
$voc = isset($_GET['l'])?$_GET['l']:"standard" ;
debug("voc: ".$voc);

$vocs = array(
	"ita" => "italian.php",
	"eng" => "english.php",
	"esp" => "espanol.php",
); 

	
require_once "standard.php" ;
debug("Loaded standard vocabulary") ;
if (isset($vocs[$voc])) { 
	require_once $vocs[$voc] ;
	debug("Loaded ".$voc." vocabulary") ;
}

$digit = "(\d+)" ;
$roman = "(M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))";
$letter = "([a-ZA-Z]+)" ;

$decs = implode("|",$decorations); 
$parts = implode("|",array_keys($partNames)) ; 
$pts = implode("\.|",array_keys($abbreviations))."\." ; 

$patterns = array( 
	"base: part num [dec] - heading"         => "/^(?P<part>$parts)\W+(?P<num>$digit|$roman)\W*((?P<dec>$decs){0,1}\W+)(?P<heading>.*)$/i" ,
	"abbreviated: pt. num [dec] - heading"   => "/^(?P<part>$pts)\W+(?P<num>$digit|$roman)\W*((?P<dec>$decs){0,1}\W+)(?P<heading>.*)$/i" ,
	"no part name: num [dec] - heading"      => "/^(?P<num>$digit|$roman)\W*((?P<dec>$decs){0,1}\W+)(?P<heading>.*)$/i" ,
	"no heading: part num"                   => "/^(?P<part>\w+)\W+(?P<num>\w+)$/i",
	"all heading"                            => "/^(?P<heading>.*)$/"
) ;
debug("Loaded standard patterns") ;
if (isset($localpatterns)) {
	$patterns = array_merge($localpatterns,$patterns);
	debug("Loaded ".$voc." patterns") ;
}

$success = false ;
while (!$success && $element = each($patterns)) {
	$success = 	preg_match($element['value'], $string, $n) ;
	debug($element['value'].": ".$string." - ".($success?"correct":"incorrect")) ;
}
debug("Patterns completed with ".($success?"success":"no success")) ;

if ($success) {
	$return['rule'] = $element['key'];
	if ($debug) {
		$return['pattern'] = $element['value'];
	}
	if (isset($n['part'])) {
		$return['partString'] = $n['part'] ;
		$val = strtolower($n['part']) ;
		if (isset($partNames[$val])) {
			$return['part'] = $partNames[$val] ;
		} elseif (isset($abbreviations[substr($val,0,strlen($val)-1)])) {
			$return['part'] = $abbreviations[substr($val,0,strlen($val)-1)] ;
		} else {
			$return['part'] = "" ;
		}
	}
	if (isset($n['num'])) {
		$return['numString'] = $n['num'] ;
		if (is_numeric($n['num'])) {
			$return['numType'] = 'number';
			$return['numValue'] = intval($n['num']) ; 
			debug("Number is numeric:".$return['numValue']) ;
		} else {
			$val = romanValue($n['num']) ;
			if ($val>0) {
				$return['numType'] = 'roman';
				$return['numValue'] = $val ; 
				debug("Number is roman:".$val) ;
			} else {
				$return['numType'] = 'letter';
				$return['numValue'] = letterValue($n['num']) ; 
				debug("Number is letter:".$val) ;
			}
		}
	}	
	if (isset($n['dec']) && $n['dec']!="") {
		$return['decoration'] = $n['dec'] ;
	}
	if (isset($n['heading']) && $n['heading']!="") {
		$return['heading'] = $n['heading'] ;
	}
	if ($debug) {
		$return['match'] = $n ;
	}
}
debug("Return value created") ;


$ret = array(
	"response" => $return,
	"request" => $_REQUEST,
	"metadata" => $meta 
) ; 

if ($debug) {
	$ret["debug"]=$debugInfo ;
}

if ($format=="json") {
//	header('Content-type: application/json');	
	echo json_encode($ret) ;
} else {
	$simple = toXml($ret, 'data') ;
	$dom = dom_import_simplexml($simple)->ownerDocument;
	$dom->formatOutput = true;
//	header ("Content-Type:text/xml");
	echo stripcslashes($dom->saveXML()) ;
}

// -------------------------------------  //

function romanValue($s) {
	$romans = array(
		'M' => 1000,
		'CM' => 900,
		'D' => 500,
		'CD' => 400,
		'C' => 100,
		'XC' => 90,
		'L' => 50,
		'XL' => 40,
		'X' => 10,
		'IX' => 9,
		'V' => 5,
		'IV' => 4,
		'I' => 1,
		'm' => 1000,
		'cm' => 900,
		'd' => 500,
		'cd' => 400,
		'c' => 100,
		'xc' => 90,
		'l' => 50,
		'xl' => 40,
		'x' => 10,
		'ix' => 9,
		'v' => 5,
		'iv' => 4,
		'i' => 1,
	);
	
	$result = 0;
	
	foreach ($romans as $key => $value) {
		while (strpos($s, $key) === 0) {
			$result += $value;
			$s = substr($s, strlen($key));
		}
	}
	return $result ;
}

function letterValue($s) {
	return ord($s) - ord('a') +1 ;
}

function toXml($data, $r = 'data', &$xml=null) {
	if (ini_get('zend.ze1_compatibility_mode') == 1) {
		ini_set ('zend.ze1_compatibility_mode', 0);
	}

	if (is_null($xml) || !isset($xml)) {
		$xml = simplexml_load_string("<?xml version='1.0' encoding='utf-8'?><".$r."/>");
	}

	foreach($data as $key => $value) {
		if (is_numeric($key)) {
			$key = $r;
		}
		$key = preg_replace('/[^a-z0-9\-\_\.\:]/i', '', $key);
		if (is_array($value)) {
			$node = isAssoc($value) ? $xml->addChild($key) : $xml;
			toXml($value, $key, $node);
		} else {
			$value = htmlentities($value);
			$xml->addChild($key,$value);
		}
	}
	return $xml;
}

function isAssoc( $array ) {
	return (is_array($array) && 0 !== count(array_diff_key($array, array_keys(array_keys($array)))));
}

function debug($t) {
	global $debug, $debugInfo;
	if ($debug) {
		if (!isset($debugInfo))
			$debugInfo = array() ;
//		echo $t."\n" ; 
		array_push($debugInfo,$t) ;
	}
}
?>