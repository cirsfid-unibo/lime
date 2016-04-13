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

require_once('config.php');
require_once('lib/Text_LanguageDetect/Text/LanguageDetect.php');
 
function aknToHtml($input,$stylesheet=FALSE,$language=FALSE, $fullOutput=FALSE, $akn2xsl=FALSE, $akn3xsl=FALSE) {
	
	$AKN20NameSpace = "http://www.akomantoso.org/2.0";
	$result; $xsl = new DOMDocument;
	if (gettype($input) == "string") {
		$doc = new DOMDocument();
		$doc->loadXML($input);
	} else {
		$doc = $input;
	}
	
	$uriNamespace = $doc -> documentElement -> lookupnamespaceURI(NULL);

	if ($uriNamespace == $AKN20NameSpace && $akn2xsl) {
		$xsl -> load($akn2xsl);
		$language = 'akoma2.0';
		
	} else {
	    // load an Akomantoso v3.0
		// or custom stylesheet		 
	    if ($stylesheet) $xsl -> load($stylesheet);
		else $xsl -> load($akn3xsl);
		
		$language = 'akoma3.0';
		$xpath = new DOMXPath($doc);
		foreach( $xpath->query('namespace::*', $doc -> documentElement) as $node ) {
			if($node->nodeName != 'xmlns:xsi' && $node->nodeName != 'xmlns') {
				$xsl->documentElement->setAttributeNS('http://www.w3.org/2000/xmlns/',$node->nodeName,$node->nodeValue);
			}
		}
		// set namespace uri of the correct AKN3.0 revision
		$xsl->documentElement->setAttributeNS(
	        'http://www.w3.org/2000/xmlns/',
	        'xmlns:akn',
	        $uriNamespace
		);
	}
	
	$proc = new XSLTProcessor;
	$proc -> importStyleSheet($xsl);

	$htmlDoc = $proc -> transformToDoc($doc);
	
	if ($htmlDoc) {
		if ($htmlDoc->documentElement) {
			$htmlDoc -> documentElement -> setAttribute('markinglanguage', $language);
			// Avoiding the xml declaration
			$result = $htmlDoc -> saveXML($htmlDoc -> documentElement);	
		} else{
			$result = $htmlDoc -> saveXML();	
		}
	}
	if ($fullOutput) {
		return array("xml" => $result, "markinglanguage" => $language);	
	}
	
	return $result;
}

function SimpleXMLToArray($simpleXml,$out=array()) {
    foreach ( (array) $simpleXml as $index => $node )
        $out[$index] = ( is_object ( $node ) ) ? SimpleXMLToArray ( $node ) : $node;
    return $out ? $out : NULL;
}

function XMLToJSON ($xml,$container=NULL) {
		$xml = str_replace(array("\n", "\r", "\t"), '', $xml);
		$xml = trim(str_replace('"', "'", $xml));
		$arrayXml = SimpleXMLToArray(simplexml_load_string($xml));
		$arrayXml = ($container == NULL) ? $arrayXml : $arrayXml[$container];
		$json = json_encode($arrayXml);
		return $json;
}

function cssFileToArray($path) {
	$cssRules = array();	
	$cssContent = file_get_contents($path);
	if($cssContent) {
		$cssContent = preg_replace('/}(?!$)/', '}||', preg_replace('/\s+/', '', $cssContent));
		$blocks = explode("||", $cssContent);
		foreach($blocks as $block) {
			preg_match('/(?P<selector>[^{]+){(?P<rules>[^}]+)/',$block,$matches);
			$tmpRules = explode(";", $matches["rules"]);
			$rules = array();
			foreach($tmpRules as $rule) {
				$values = explode(":", $rule);
				if(count($values) == 2) {
					$rules[$values[0]] = $values[1];
				}
			}
			if(array_key_exists($matches["selector"], $cssRules)) {
				$cssRules[$matches["selector"]] = array_merge($cssRules[$matches["selector"]], $rules);
			} else {
				$cssRules[$matches["selector"]] = $rules;
			}
		}
	}
	return $cssRules;
}

function addIncludesToXsl($dom, $paths) {
	$insertFirst = function($parent, $node) {
        if ($parent->hasChildNodes()) {
		    $parent->insertBefore($node, $parent->firstChild);
		} else {
		    $parent->appendChild($node);
		}
    };

	foreach ($paths as $path) {
		if ( $path ) {
			$include = $dom->createElementNS("http://www.w3.org/1999/XSL/Transform", "xsl:include");
			$include->setAttribute("href", $path);
			$insertFirst($dom->documentElement, $include);
		}
	}
}

function createAttributeSet($dom, $selector, $rules) {
	$name = preg_replace('/\./', '', $selector);
	$attributeSet = $dom->createElementNS("http://www.w3.org/1999/XSL/Transform", "xsl:attribute-set");
	$attributeSet->setAttribute("name", $name);
	foreach($rules as $rule => $value) {
		$attribute = $dom->createElementNS("http://www.w3.org/1999/XSL/Transform", "xsl:attribute", $value);
		$attribute->setAttribute("name", $rule);
		$attributeSet->appendChild($attribute);
	}
	return $attributeSet;
}
	
function detectLanguage($text, $length = 2) {
    $l = new Text_LanguageDetect();

	try {
	    $l->setNameMode($length);
	
	    $result = $l->detect($text, 1);
		$languages = array_keys($result);
		if (!count($languages)) return NULL;
		// Temporary solution in order to have the same romanian language code
		$language = ($languages[0] == 'ron') ? 'rum' : $languages[0];
	    return $language;
	} catch (Text_LanguageDetect_Exception $e) {
	    return NULL;
	}
}


?>