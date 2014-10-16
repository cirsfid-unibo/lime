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

 
require_once('../utils.php');

class PassiveModification {
	
	public $id,$type,$old,$new;
	
	public function __construct($mod) {
		if ($mod->nodeType == XML_ELEMENT_NODE) {
			$this->type = $mod->getAttribute('type');
			$this->id = substr($mod->getElementsByTagName('destination')->item(0)->getAttribute('href'),1);
			
			foreach ($mod->getElementsByTagName('old') as $old)
				$this->old = $old->nodeValue;
			
			$nodeNew = NULL;
			foreach ($mod->getElementsByTagName('new') as $new) {
				$this->new = $new->nodeValue;
				$nodeNew = $new;
			}
				
			if (!$this->new && $nodeNew) $this->id = substr($nodeNew->getAttribute('href'),1);
		}
	}	
}
 
class AKNDiff {
	
	protected $xml_new,$xml_old,$html_new,$html_old,$leftToRight;
	protected $tableDOM,$tableRoot,$mods;

	public function __construct() {
		$doc_1 = (isset($_GET['from'])) ? $_GET['from'] : 'http://localhost/26318-Panes/4.uy_bill_2005-05-03.xml';
		$doc_2 = (isset($_GET['to'])) ? $_GET['to'] : 'http://localhost/26318-Panes/3.uy_bill_2005-05-02-ejecutivo.xml';

		$this->edit = (isset($_GET['edit'])) ? TRUE : FALSE;
		
		if ($doc_1 && $doc_2) {
			$this->doc1Url = $doc_1;
			$this->doc2Url = $doc_2;
			
			$doc1 = new DOMDocument();
			$doc1->preserveWhiteSpace = FALSE;
			$doc1->load($doc_1);
			
			$doc2 = new DOMDocument();
			$doc2->preserveWhiteSpace = FALSE;
			$doc2->load($doc_2);
			
			$this->prepareDocuments($doc1,$doc2);
		}
	}
	
	protected  function collectMods() {
		$this->mods = array();
		$mods = $this->xml_new->getElementsByTagName("passiveModifications");
		if($mods->length) {
			$mods = $mods->item(0)->childNodes;
			foreach ($mods as $mod) {
				$modObj = new PassiveModification($mod);
				$this->mods[$modObj->id] = $modObj;
			}
		}
	}
	
	protected  function buildLineLeft($node) {		
		foreach ($node->childNodes as $childNode) {
			if($childNode->nodeName == 'div') $this->buildLineLeft($childNode);
			else {
				$trNode = $this->tableDOM->createElement('tr');
				$tdNode = $this->tableDOM->createElement('td');
				
				$importedNode = $this->tableDOM->importNode($childNode,TRUE);
				$tdNode->appendChild($importedNode);
				$trNode->appendChild($tdNode);
				$this->tableRoot->appendChild($trNode);	
			}
		}
	}
	
	protected  function buildLineRight($node,&$trNode) {			
		foreach ($node->childNodes as $childNode) {
			if($childNode->nodeName == 'div') $this->buildLineRight($childNode,$trNode);
			else {
				$importedNode = $this->tableDOM->importNode($childNode,TRUE);
				$tdNode = $this->tableDOM->createElement('td');
				$tdNode->appendChild($importedNode);
				$trNode->appendChild($tdNode);
				$trNode = $trNode->nextSibling;
				if (!$trNode) {
					$trNode = $this->tableDOM->createElement('tr');
					$tdNodeEmpty = $this->tableDOM->createElement('td');
					$trNode->appendChild($tdNodeEmpty);
					$this->tableRoot->appendChild($trNode);
				}	
			}
		}
	}
	
	protected function topOfDocument($nodeLeft,$nodeRight) {
		
		foreach ($nodeLeft->childNodes as $childNode) {
			if (($childNode->nodeType == XML_ELEMENT_NODE) &&
				($childNode->getAttribute('class') != 'meta') &&
				(!preg_match('/\bbody/', $childNode->getAttribute('class')))) $this->buildLineLeft($childNode);
			elseif (($childNode->nodeType == XML_ELEMENT_NODE) &&
					(preg_match('/\bbody/', $childNode->getAttribute('class')))) break;
		}
		
		$trNode = $this->tableRoot->firstChild;
		if (!$trNode) {
			$trNode = $this->tableDOM->createElement('tr');
			$tdNodeEmpty = $this->tableDOM->createElement('td');
			$trNode->appendChild($tdNodeEmpty);
			$this->tableRoot->appendChild($trNode);
		}
		foreach ($nodeRight->childNodes as $childNode) {
			if (($childNode->nodeType == XML_ELEMENT_NODE) &&
				($childNode->getAttribute('class') != 'meta') &&
				(!preg_match('/\bbody/', $childNode->getAttribute('class')))) $this->buildLineRight($childNode,$trNode);
			elseif (($childNode->nodeType == XML_ELEMENT_NODE) &&
					(preg_match('/\bbody/', $childNode->getAttribute('class')))) break;
		}
	}
	
	protected function bottomOfDocument($nodeLeft,$nodeRight,$trNode) {
		$nextSiblingsOfBody = FALSE;
		foreach ($nodeLeft->childNodes as $childNode) {
			if (($childNode->nodeType == XML_ELEMENT_NODE) &&
				($nextSiblingsOfBody)) $this->buildLineLeft($childNode);
			elseif (($childNode->nodeType == XML_ELEMENT_NODE) &&
					(preg_match('/\bbody/', $childNode->getAttribute('class')))) $nextSiblingsOfBody = TRUE;
		}
		
		$nextSiblingsOfBody = FALSE;
		$trNode = $trNode->nextSibling;
		if (!$trNode) {
			$trNode = $this->tableDOM->createElement('tr');
			$tdNodeEmpty = $this->tableDOM->createElement('td');
			$trNode->appendChild($tdNodeEmpty);
			$this->tableRoot->appendChild($trNode);
		}
		foreach ($nodeRight->childNodes as $childNode) {
			if (($childNode->nodeType == XML_ELEMENT_NODE) &&
				($nextSiblingsOfBody)) $this->buildLineRight($childNode,$trNode);
			elseif (($childNode->nodeType == XML_ELEMENT_NODE) &&
					(preg_match('/\bbody/', $childNode->getAttribute('class')))) $nextSiblingsOfBody = TRUE;
		}
		
	}
	
	protected function getParentID($node,&$id) {
		$parent = $node->getAttribute('parent');
		if (!$id || $parent) {
			$id = $parent;
			foreach(array_keys($this->mods) as $key)
				if ($key && !(strpos($id,$key) === FALSE)) { $id = $key; break; }
		}
	}
	
	protected function document($node) {
		if ($node->nodeType == XML_ELEMENT_NODE) {
			$id = $node->getAttribute('akn_currentId');

			$this->getParentID($node, $id);
			
			if(array_key_exists($id, $this->mods)) {
				$mod = $this->mods[$id];
				switch ($mod->type) {
					case 'insertion':
						$class = $node->getAttribute('class');
						$node->setAttribute('class',trim($class . ' ' . $mod->type));
						break;
				    case 'substitution':
						$class = $node->getAttribute('class');
						$node->setAttribute('class',trim($class . ' ' . $mod->type));
				        break;
					case 'repeal':
						// TODO
						$node->nodeValue = '';
						break;
				}
			}
			if ($node->hasChildNodes())
				foreach ($node->childNodes as $child)
					if ($child->nodeType == XML_ELEMENT_NODE)
						$this->document($child);
		}
	}
	
	protected function delta($node) {
		if ($node->nodeType == XML_ELEMENT_NODE) {
			$id = $node->getAttribute('akn_currentId');
			$this->getParentID($node,$id);
			if(array_key_exists($id, $this->mods)) {
				$mod = $this->mods[$id];
				switch ($mod->type) {
				    case 'insertion':
				        $node->nodeValue = '';
				        break;
				    case 'substitution':
				        $node->nodeValue = $mod->old;
						$class = $node->getAttribute('class');
						$node->setAttribute('class',trim($class . ' ' . $mod->type));
				        break;
				    case 'repeal':
				        $node->nodeValue = $mod->old;
						$class = $node->getAttribute('class');
						if (!strpos($class,$mod->type))
							$node->setAttribute('class',trim($class . ' ' . $mod->type));
				        break;
				}
			}
			if ($node->hasChildNodes())
				foreach ($node->childNodes as $child)
					if ($child->nodeType == XML_ELEMENT_NODE)
						$this->delta($child);
		}
	}
	
	protected function getAllParentsId($node) {
		$ids = array();
		$parent = $node->parentNode;
		while($parent) {
			if ($parent->nodeName == 'div') {
				$id = $parent->getAttribute('akn_currentId');
				if ($id) $ids[] = $id;
			}
			$parent = $parent->parentNode;
		}
		return implode(' ', $ids);
	}
	
	protected function buildLineDiff($node) {
		$trNode = $this->tableDOM->createElement('tr');
		$tdNode = $this->tableDOM->createElement('td');
		$tdDelta = $this->tableDOM->createElement('td');
		
		foreach ($node->childNodes as $childNode) {
			if($childNode->nodeName == 'div' && 
			   !($childNode->getAttribute('akn_status') == 'removed')) {
			   					
				$this->buildLineDiff($childNode);
				
			} else {		
				$importedNode = $this->tableDOM->importNode($childNode,TRUE);
				if($node->nodeName == 'div' && $importedNode->nodeType == XML_ELEMENT_NODE) 
					$importedNode->setAttribute('parent',$this->getAllParentsId($childNode));
				$tdNode->appendChild($importedNode);
				$this->document($importedNode);
				
				
				/////////////////////////////////////////////////////////////////////////////////
				/////////////////////////////////////////////////////////////////////////////////
				/////////////////////////////////////////////////////////////////////////////////
				
				$importedNode = $this->tableDOM->importNode($childNode,TRUE);
				if (preg_match('/\bnum/',$childNode->getAttribute('class'))) {
					$originalId = $node->getAttribute('akn_originalId');
					if($originalId) {
						$finder = new DomXPath($this->html_old);
						$originalNode = $finder->query("//*[@akn_currentId = '$originalId']")->item(0);
						if ($originalNode) {
							foreach($originalNode->childNodes as $num) {
								if (preg_match('/\bnum/', $num->getAttribute('class'))) {
									$importedNode = $this->tableDOM->importNode($num,TRUE);
									break;
								}
							}
						}
					}
				}
				
				if($importedNode && $node->nodeName == 'div' && $importedNode->nodeType == XML_ELEMENT_NODE) 
					$importedNode->setAttribute('parent',$this->getAllParentsId($childNode));
				$tdDelta->appendChild($importedNode);
				$this->delta($importedNode);
				
				/////////////////////////////////////////////////////////////////////////////////
				/////////////////////////////////////////////////////////////////////////////////
				/////////////////////////////////////////////////////////////////////////////////
				

				if ($this->leftToRight) {
					$trNode->appendChild($tdNode);
					$trNode->appendChild($tdDelta);
				} else {
					$trNode->appendChild($tdDelta);
					$trNode->appendChild($tdNode);
				}
				
				$this->tableRoot->appendChild($trNode);
			}
		}
	}
	
	protected function prepareDocuments($doc1,$doc2) {
		
		/////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////
		
		$expression = '//doc:FRBRExpression/doc:FRBRdate';
				
		$uri = $doc1->documentElement->lookupnamespaceURI(NULL);	
		$xpath = new DOMXPath($doc1);
		$xpath->registerNamespace('doc', $uri);
		$xml_1_date = $xpath->evaluate($expression)->item(0)->getAttribute('date');
	
		
		$uri = $doc2->documentElement->lookupnamespaceURI(NULL);		
		$xpath = new DOMXPath($doc2);
		$xpath->registerNamespace('doc', $uri);
		$xml_2_date = $xpath->evaluate($expression)->item(0)->getAttribute('date');
		
		/////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////
		
		$expression = 'count(//doc:lifecycle/*)';
		
		$uri = $doc1->documentElement->lookupnamespaceURI(NULL);		
		$xpath = new DOMXPath($doc1);
		$xpath->registerNamespace('doc', $uri);
		$xml_1_eventRefs = $xpath->evaluate($expression);
		
		$uri = $doc2->documentElement->lookupnamespaceURI(NULL);		
		$xpath = new DOMXPath($doc2);
		$xpath->registerNamespace('doc', $uri);
		$xml_2_eventRefs = $xpath->evaluate($expression);
		
		/////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////
				
		if ($xml_1_date > $xml_2_date) {
			$this->xml_new = $doc1;
			$this->xml_old = $doc2;
			$this->leftToRight = TRUE;
			
		} else if ($xml_1_date == $xml_2_date) {
			
			if ($xml_1_eventRefs > $xml_2_eventRefs) {
				$this->xml_new = $doc1;
				$this->xml_old = $doc2;
				$this->leftToRight = TRUE;
			} else {
				$this->xml_new = $doc2;
				$this->xml_old = $doc1;
				$this->leftToRight = FALSE;
			}
			
		} else {
			$this->xml_new = $doc2;
			$this->xml_old = $doc1;
			$this->leftToRight = FALSE;
		}
		$html = aknToHtml($this->xml_new,'data/AknToXhtml30.xsl');
		$this->html_new = new DOMDocument();
		$this->html_new->loadXML($html);
		
		$html = aknToHtml($this->xml_old,'data/AknToXhtml30.xsl');
		$this->html_old = new DOMDocument();
		$this->html_old->loadXML($html);
	}


	public function render() {
		
		if ($this->xml_new && $this->xml_old) {
				
			$html = new DOMDocument();
			$root = $html->createElement('html');
			
			$metaNode = $html->createElement('meta');
			$metaNode->setAttribute('http-equiv','Content-type');
			$metaNode->setAttribute('content','text/html');
			$metaNode->setAttribute('charset','UTF-8');
			
			$styleNode = $html->createElement('link');
			$styleNode->setAttribute('rel','stylesheet');
			$styleNode->setAttribute('type','text/css');
			$styleNode->setAttribute('href','data/diff.css');
			
			$headNode = $html->createElement('head');
			$headNode->appendChild($metaNode);
			$headNode->appendChild($styleNode);
			
			$body = $html->createElement('body');
			
			///////////////////////////////////////////////////////
			///////////////////////////////////////////////////////
			///////////////////////////////////////////////////////
			
			$classname="body";
			$finder = new DomXPath($this->html_new);
			$content = $finder->query("//*[@class and contains(concat(' ', normalize-space(@class), ' '), ' $classname ')]")->item(0);
			
			$this->tableDOM = new DOMDocument();
			$this->tableRoot = $this->tableDOM->createElement('table');
			
			$nodeLeft = $this->html_new->documentElement->firstChild;
			$nodeRight = $this->html_old->documentElement->firstChild;
			if (!$this->leftToRight) {
				$nodeLeft = $this->html_old->documentElement->firstChild;
				$nodeRight = $this->html_new->documentElement->firstChild;
			}
			$this->topOfDocument($nodeLeft,$nodeRight);
			
			$this->collectMods();
			$this->buildLineDiff($content);
			
			$trNode = $this->tableDOM->createElement('tr');
			$this->tableRoot->appendChild($trNode);
			$this->bottomOfDocument($nodeLeft,$nodeRight,$trNode);
			
			$this->tableDOM->appendChild($this->tableRoot);
			
			///////////////////////////////////////////////////////
			///////////////////////////////////////////////////////
			///////////////////////////////////////////////////////
			
			$imported = $html->importNode($this->tableDOM->documentElement, TRUE);
			$root->appendChild($headNode);
			$body->appendChild($imported);
			$root->appendChild($body);
			$html->appendChild($root);
			$html->formatOutput = TRUE;
			
			echo $html->saveXML();
		}
	}
}
