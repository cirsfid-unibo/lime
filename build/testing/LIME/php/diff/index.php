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
 
require_once('lib/class.TextDiff.php');
require_once('lib/class.CodeDiff.php');
require_once('../utils.php');
require_once('../config.php');

class DocumentDiff {
	
	const DIFFSTYLE = "https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js";
	const CSS = "data/diff.css";
	const XML = 'xml'; const TEXT = 'text';
	private $from,$to,$css,$format,$doc;
	
	public function __construct() {
		$this->from = (isset($_GET['from'])) ? $_GET['from'] : FALSE;
		$this->to = (isset($_GET['to'])) ? $_GET['to'] : FALSE;
		$this->css = (isset($_GET['css'])) ? $_GET['css'] : self::CSS;
		$this->format = (isset($_GET['format'])) ? $_GET['format'] : self::TEXT;
		$this->expression = (isset($_GET['expression'])) ? $_GET['expression'] : FALSE;
	}
	
	private function checkExpression() {
		
		if($this->expression) {
			
			/////////////////////////////////////////////////////////////
			
			$fromDOM = new DOMDocument();
			$fromDOM->load($this->from);
			$uri = $fromDOM->documentElement->lookupnamespaceURI(NULL);
			
			$xpath = new DOMXPath($fromDOM);
			$xpath->registerNamespace('doc', $uri);
			$fromExp = $xpath->evaluate($this->expression);
			
			//////////////////////////////////////////////////////////////
			
			$toDOM = new DOMDocument();
			$toDOM->load($this->to);
			$uri = $toDOM->documentElement->lookupnamespaceURI(NULL);
			
			$xpath = new DOMXPath($toDOM);
			$xpath->registerNamespace('doc', $uri);
			$toExp = $xpath->evaluate($this->expression);
			
			//////////////////////////////////////////////////////////////
		
			$result = ($fromExp == $toExp) ? TRUE : FALSE;	
			
		} else $result = TRUE;
		
		return $result;
	}
	
	private function compareXML() {
		$result = CodeDiff::compareFiles($this->from,$this->to);
		$result = CodeDiff::toTable($result);
		return $result;
	}
	
	private function compareText() {
		$fromDOM = new DOMDocument();
		$fromDOM->load($this->from);
		$this->from = aknToHtml($fromDOM,'data/AKNToXHTMLDiff.xsl');
		
		$toDOM = new DOMDocument();
		$toDOM->load($this->to);
		$this->to = aknToHtml($toDOM,'data/AKNToXHTMLDiff.xsl');
		
		$result = TextDiff::compare($this->from,$this->to);
		$result = TextDiff::toTable($result,'','');
		return $result;	
	}
	
	private function compare() {
		if($this->format == self::XML) {
			$result = $this->compareXML();
		} elseif ($this->format == self::TEXT) {
			$result = $this->compareText();
		}
		return $result;
	}
	
	private function renderXML() {
		return $this->doc->saveHTML();
	}
	
	private function renderText() {
		return htmlspecialchars_decode($this->doc->saveHTML());
	}
	
	private function render() {
		if($this->format == self::XML) {
			$result = $this->renderXML();
		} elseif ($this->format == self::TEXT) {
			$result = $this->renderText();
		}
		echo $result;
	}
	
	private function prepareDocument($result) {
		$this->doc->loadHTML(mb_convert_encoding($result, 'HTML-ENTITIES','UTF-8'));
		
		$scriptNode = $this->doc->createElement('script');
		$scriptNode->setAttribute('src',self::DIFFSTYLE);
		
		$metaNode = $this->doc->createElement('meta');
		$metaNode->setAttribute('http-equiv','Content-type');
		$metaNode->setAttribute('content','text/html');
		$metaNode->setAttribute('charset','UTF-8');
		
		$headNode = $this->doc->createElement('head');
		$headNode->appendChild($metaNode);
		$headNode->appendChild($scriptNode);
		
		if($this->css) {
			$styleNode = $this->doc->createElement('link');
			$styleNode->setAttribute('rel','stylesheet');
			$styleNode->setAttribute('type','text/css');
			$styleNode->setAttribute('href',$this->css);
			$headNode->appendChild($styleNode);
		}
		
		$root = $this->doc->documentElement;
		$root->insertBefore($headNode,$root->firstChild);
	}
	
	public function run() {
		// create container document
		$this->doc = new DOMDocument();
		
		if($this->from && $this->to && $this->checkExpression()) {
			$result = $this->compare();
		} else {
			$result = '<p class="diffProblems"><em>From Document</em> does not match to <em>To Document</em>
			           for this expression: <strong>' . $this->expression . '</strong></p>';
		}
		
		$this->prepareDocument($result);
		$this->render();
	}
}

$documentDiff = new DocumentDiff();
$documentDiff->run();

?>