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

 
require_once('AKNDiff.php');

class nPassiveModification extends PassiveModification {
	
	public $id,$type,$old,$new;
	
	public function __construct($mod) {
		if ($mod->nodeType == XML_ELEMENT_NODE) {
			$this->type = $mod->getAttribute('type');
			$this->destination = substr($mod->getElementsByTagName('destination')->item(0)->getAttribute('href'),1);
			
			foreach ($mod->getElementsByTagName('old') as $old)
				$this->old = $old->nodeValue;
			
			$nodeNew = NULL;
			foreach ($mod->getElementsByTagName('new') as $new) {
				$this->new = $new->nodeValue;
				$nodeNew = $new;
			}
			$this->newHref = ($nodeNew) ? substr($nodeNew->getAttribute('href'),1) : "";
				
			$this->id = (!$this->new && $nodeNew) ? $this->newHref : $this->destination;
		}
	}	
}

class newAKNDiff extends AKNDiff {
	
	protected  function buildColumns($node) {
		$list = array();
		$tdNode = $this->tableDOM->createElement('td');
		foreach ($node->childNodes as $childNode) {
			if($childNode->nodeName == 'div' &&
			   !($childNode->getAttribute('akn_status') == 'removed')) {
					$list = array_merge($list, $this->buildColumns($childNode));
			   }
			else {
				$importedNode = $this->tableDOM->importNode($childNode,TRUE);
				if($node->nodeName == 'div' && $importedNode->nodeType == XML_ELEMENT_NODE) {
					$importedNode->setAttribute('parent', $this->getAllParentsId($childNode));
					$importedNode->setAttribute('parentClass', $childNode->parentNode->getAttribute("class"));
					/////////////////////////////////////////////////////////////////////////////////////
					/////////////////////////////////////////////////////////////////////////////////////
					$originalId = $childNode->parentNode->getAttribute("akn_originalId");
					if ($originalId)
						$importedNode->setAttribute('parentOriginalId', $childNode->parentNode->getAttribute("akn_originalId"));
				}
				
				$tdNode->appendChild($importedNode);
				if(!$this->searchNodeValue($list, $tdNode->nodeValue)) {
					array_push($list, $tdNode);
				}
			}
			$childNode = $childNode->nextSibling;
		}
		return $list;
	}
	
	protected function searchNodeValue($nodes, $value) {
		foreach($nodes as $node) {
			if($node->nodeValue == $value) {
				return TRUE;
			}
		}
		return FALSE;
	}
	
	protected function getTextNodesContaining($node, $str) {
		return $this->getTextNodesBy($node, function($textNode) use ($str) {
			$nodeText = $textNode->data;
			if((!$nodeText || !$str) || strpos($nodeText, $str) === FALSE)
				return FALSE;
			else
				return TRUE;
		});
	}
	
	protected function isNodeInsideMe($parent, $node) {
		if($parent === $node) {
			return TRUE;
		}
		if ($parent->hasChildNodes()) {
			foreach ($parent->childNodes as $childNode) {
				if($this->isNodeInsideMe($childNode, $node)) return TRUE; 
			}	
		}
		return FALSE;
	}
	
	protected function getNextSiblingsContaining($node, $containgNode) {
		$nodes = array();
		$iterNode = $node->nextSibling;
		$found = FALSE;
		while($iterNode) {
			$nodes[] = $iterNode;
			if($this->isNodeInsideMe($iterNode, $containgNode)) {
				$found = TRUE;
				break;
			}
			$iterNode = $iterNode->nextSibling;
		}
		if ($found) return $nodes;
		return array();
	}
	
	protected function getNextSiblings($node, $limitNode = FALSE) {
		$nodes = array();
		$iterNode = $node->nextSibling;
		while($iterNode && (!$limitNode || $iterNode !== $limitNode)) {
			$nodes[] = $iterNode;
			$iterNode = $iterNode->nextSibling;
		}
		return $nodes;
	}
	
	protected function getTextNodesContainingTextSmart($node, $text, $words = FALSE, $fromEnd = FALSE, $secondChance = FALSE) {
		$words = ($words === FALSE) ? mb_split(" ", $text) : $words;
		$nodes = array();
		$lastNodes = array();
		$result = array();
		$nums = count($words);
		$index = $nums;

		while($index) {
			$str =  ($fromEnd) ? implode(" ", array_slice($words, $nums-$index)) 
							   : implode(" ", array_slice($words, 0, $index));
			$nodes = $this->getTextNodesContaining($node, $str);
			foreach($nodes as $nd) {
				$result[] = array("str" => $str, "node" => $nd);	
			}
			if(count($nodes)) {
				break;
			}
			$index--;
		}
		
		if($index && $index != count($words)) {
			$nodes = $this->getTextNodesContainingTextSmart($node, $text, array_slice($words, $index), TRUE);
			$result = array_merge($result, $nodes);
		} else if(!count($nodes) && !$secondChance){
			$words = array_slice($words, $index);
			$lastWord = $words[count($words)-1];
			$countReplace = 0;
			if($lastWord) {
				$words[count($words)-1] = preg_replace('/[.]+/', '', $lastWord, -1, $countReplace);
			}
			//TODO: check countReplace
			$nodes = $this->getTextNodesContainingTextSmart($node, $text, $words, TRUE, TRUE);
			$result = array_merge($result, $nodes);
		}

		return $result;
	}

	protected function findAndwrapTextNode($searchText, $node, $wrapperClass = FALSE) {
		$searchText = trim($searchText);
		$wrapNodes = array();
		$nodes = $this->getTextNodesContaining($node, $searchText);
		if(count($nodes)) {
			foreach($nodes as $node) {
				if($wrapperClass !== FALSE) {
					$wrapNodes[] = $this->wrapTextNode($node, $searchText, $wrapperClass);	
				}
			}	
		} else {
			$nodes = $this->getTextNodesContainingTextSmart($node, $searchText);
			if(count($nodes)) {
				$firtPart = $nodes[0];
				$lastPart = $nodes[count($nodes)-1];
				$wrapNode = $this->wrapTextNode($firtPart["node"], $firtPart["str"], $wrapperClass);
				$siblings = $this->getNextSiblingsContaining($wrapNode, $lastPart["node"]);
				foreach($siblings as $sibling) {
					$wrapNode->appendChild($sibling);
				}
				$wrapNodes[] = $wrapNode;
			} else {
				return FALSE;
			}
		}
		
		return ($wrapperClass === FALSE) ? $nodes : $wrapNodes;
	}
	
	protected function wrapTextNode($tNode, $str, $class = "textWrapper") {
		$encoding = mb_detect_encoding($tNode->data);
		$pos = mb_strpos($tNode->data, $str, 0, $encoding);
		$doc = $tNode->ownerDocument;
		if($pos !== FALSE) {
			$newNode = $tNode;
			if($pos > 0) {
				$newNode = $newNode->splitText($pos);
			}
			if(strlen($newNode->data) > strlen($str)) {
				$tNode = $newNode->splitText(strlen($str));
				$newNode = $tNode->previousSibling;
			}
			$wrapNode = $doc->createElement('span');
			$wrapNode->setAttribute("class", $class);
			if($newNode->parentNode) {
				$newNode->parentNode->insertBefore($wrapNode, $newNode);
				$wrapNode->appendChild($newNode);
			}
		}
		return $wrapNode;
	}
	
	protected function getTextNodesBy($node, $fn) {
		$textList = array();
		if(get_class($node) == 'DOMNodeList') {
			foreach($node as $childNode) {
				$textList = array_merge($textList, $this->getTextNodesBy($childNode, $fn));
			}
		} else {
			foreach ($node->childNodes as $childNode) {
				if($childNode->nodeType == XML_ELEMENT_NODE) {
					$textList = array_merge($textList, $this->getTextNodesBy($childNode, $fn));
				} else if($childNode->nodeType == XML_TEXT_NODE) {
					if($fn($childNode)) {
						$textList[] = $childNode;	
					}
				}
			}	
		}

		return $textList;
	}
	
	protected function createBlankCell($document) {
		$cell = $document->createElement('td');
		$cell->nodeValue = "&nbsp;";
		$cell->setAttribute("blankcell", "true");
		return $cell;
	}
	
	protected  function buildTable($table, $contentLeft, $contentRight) {
		$leftTds = $this->buildColumns($contentLeft, TRUE);
		$rightTds = $this->buildColumns($contentRight);
		$tdNr = max(count($leftTds), count($rightTds));
	
		for($i = 0; $i < $tdNr; $i++) {
			$trNode = $this->tableDOM->createElement('tr');
			$tdNodeLeft = (array_key_exists($i, $leftTds)) ? $leftTds[$i] :  $this->createBlankCell($this->tableDOM);
			$tdNodeRight = (array_key_exists($i, $rightTds)) ? $rightTds[$i] :  $this->createBlankCell($this->tableDOM);

			$tdNodeLeft->setAttribute("class", ($this->leftToRight) ? "newVersion" : "oldVersion");
			$tdNodeRight->setAttribute("class", ($this->leftToRight) ? "oldVersion" : "newVersion");
			
			$trNode->appendChild($tdNodeLeft);
			$trNode->appendChild($tdNodeRight);
			
			$table->appendChild($trNode);
		}
		
		$this->cleanTable($table);
		$this->applyMods($table);
		$this->normalizeTable($table);
	}
	
	protected function cleanTable($table) {
		$doc = $table->ownerDocument;
		$xpath = new DOMXPath($doc);
		$nodesOld = $xpath->query("//*[@class='oldVersion']//*[contains(@class, 'del')]", $table);
		foreach($nodesOld as $node) {
			$parent = $node->parentNode;
			$parent->replaceChild($doc->createTextNode(" "), $node);
			$parent->normalize();
		}
	}
	
	protected function setAllAttribute($nodes, $attribute, $value, $append = TRUE) {
		foreach($nodes as $node) {
			if ($append) {
				$oldValue = $node->getAttribute($attribute);
				$value = ($oldValue) ? $oldValue." $value" : $value;	
			}
			$node->setAttribute($attribute, trim($value));
		}
	}
	
	protected function appendUniqueTd($nodes, $array) {
		foreach($nodes as $node) {
			$td = $this->getParentByName($node, "td");
			if(($node->getAttribute("parent") || $node->getAttribute("parentOriginalId")) && !in_array($td, $array, TRUE)) {
				array_push($array, $td);
			}			
		}
		return $array;
	}
	
	protected function getUpRowContainsAttr($td, $attr, $class) {
		$xpath = new DOMXPath($td->ownerDocument);
		$posInParent = $this->getPosInParent($td);
		$iterNode = $this->getParentByName($td, "tr");
		while($iterNode) {
			$nodes = $xpath->query(".//*[contains(@$attr, '$class')]", $iterNode);
			if($nodes->length) return $iterNode;
			$iterNode = $iterNode->previousSibling;
		}
		return FALSE;
	}
	
	protected function normalizeRow($tr,$modName) {
		$class = $modName . 'BlankCell';
		$xpath = new DOMXPath($tr->ownerDocument);
		$blankCell = $xpath->query(".//td[contains(@class, '$class')]", $tr);
		if ($blankCell->length) {
			$blankCell = $blankCell->item(0);
			$class = $modName . 'Cell';
			$cell = $xpath->query(".//td[contains(@class, '$class')]", $tr);
			if (!$cell->length) {
				$this->removeBlankCell($blankCell);
			} 
		}
		
	}
	
	protected function normalizeModification($td, $nextTd, $modName, $avoidClass = FALSE) {
		$nextTr = ($nextTd) ? $this->getParentByName($nextTd, "tr") : FALSE;
		if($td) {
			$xpath = new DOMXPath($td->ownerDocument);
			$tr = $this->getParentByName($td, "tr");
			$table = $this->getParentByName($tr, "table");
			$siblings = $this->getNextSiblings($tr, $nextTr);
			foreach($siblings as $sibling) {
				$this->normalizeRow($sibling,$modName);
				$modNodes = $xpath->query(".//*[contains(@class, '$modName')]", $sibling);
				if($modNodes->length) {
					$tdToAdd = FALSE;
					foreach($modNodes as $mod) {
						$tdModParent = $this->getParentByName($mod, "td");
						// Add blank cell if the cell contains only the insertion
						if($mod->nodeValue == $tdModParent->nodeValue) {
							$tdToAdd = $tdModParent;
							break;
						}
					}
					if($tdToAdd) {
						$posInParent = $this->getPosInParent($tdToAdd);
						$tdToMove = $sibling->childNodes->item(1-$posInParent);
						// Checking if the td contains avoiding elements
						if(!$avoidClass || $xpath->query(".//*[contains(@class, '$avoidClass')]", $tdToMove)->length == 0) {
							$trHcontainer = $this->getUpRowContainsAttr($tdToMove, "parentClass", "hcontainer");
							// Check if cells are in the same hcontainer
							if($trHcontainer && $trHcontainer === $tr) {
								$blankCell = $this->addBlankCell($table, $tdToMove);
								if ($blankCell) {
									$this->setAllAttribute(array($tdToAdd),"class", $modName.'Cell');
									$this->setAllAttribute(array($blankCell),"class", $modName.'BlankCell');
								}
							}
						}
					}
				}
			}
		}
	}

	protected function normalizeInserition($td, $nextTd) {
		$this->normalizeModification($td, $nextTd, "insertion", "repeal");
	}
	
	protected function normalizeRepeal($td, $nextTd) {
		$this->normalizeModification($td, $nextTd, "repeal");
	}
	
	protected function normalizeTable($table) {
		$xpath = new DOMXPath($table->ownerDocument);
		$nodesNew = $xpath->query("//*[@class='newVersion']//*[contains(@parentClass, 'hcontainer')]", $table);
		$nodesOld = $xpath->query("//*[@class='oldVersion']//*[contains(@parentClass, 'hcontainer')]", $table);
		$tdsNew = array();
		$tdsOld = array();
		$tdsNew = $this->appendUniqueTd($nodesNew, $tdsNew);
		$tdsOld = $this->appendUniqueTd($nodesOld, $tdsOld);
		
		$num = max(count($tdsNew), count($tdsOld));
		for($i=0; $i<$num; $i++) {
			$tdNew = (array_key_exists($i, $tdsNew)) ? $tdsNew[$i] : FALSE;
			
			if ($tdNew) {
				$parent = $xpath->query(".//*/@parentOriginalId", $tdNew);
				if ($parent->length > 0) {
					$parent = $parent->item(0)->nodeValue;
				} else {
					$parent = $xpath->query(".//*/@parent", $tdNew);
					if ($parent->length > 0) $parent = $parent->item(0)->nodeValue;
				}
			}
			

			//$tdOld = (array_key_exists($i, $tdsOld)) ? $tdsOld[$i] : FALSE;
			$tdOld = FALSE;
			foreach ($tdsOld as $td) {
				$result  = $xpath->query(".//*[contains(@parent, '$parent')]", $td);
				if($xpath->query(".//*[contains(@parent, '$parent')]", $td)->length > 0) {
					$tdOld = $td;
					break;
				}
			}
			if($tdNew && $tdOld) {
				$tr = $this->getParentByName($tdNew, "tr");
				$trOld = ($tdOld) ? $this->getParentByName($tdOld, "tr") : FALSE;
				$trNewPos = $this->getPosInParent($tr);
				$trOldPos = ($trOld) ? $this->getPosInParent($trOld) : FALSE;
				if($trNewPos !==FALSE && $trOldPos !== FALSE) {
					$diffPos = $trNewPos - $trOldPos;
					$posInParent = $this->getPosInParent($tdOld);
					$nums = abs($diffPos);
					if($diffPos<0) {
						$tdAdd = $tdNew;
					} else if($diffPos>0) {
						$tdAdd = $tdOld;
					}
					
					while($nums) {
						$this->addBlankCell($table, $tdAdd);
						$nums--;	
					}
				}
			}
			
			// Importante farlo a questo punto e non prima, perché altrimenti si perde l'allineamento
			$nextTdNew = (array_key_exists($i+1, $tdsNew)) ? $tdsNew[$i+1] : FALSE;
			$nextTdOld = (array_key_exists($i+1, $tdsOld)) ? $tdsOld[$i+1] : FALSE;
			
			$this->normalizeInserition($tdNew, $nextTdNew);
			$this->normalizeRepeal($tdOld, $nextTdOld);
		}
	}
	
	protected function getPosInParent($node) {
		$parent = $node->parentNode;
		$counter = 0;
		foreach($parent->childNodes as $cNode) {
			if($cNode === $node) 
				return $counter;
			$counter++;
		}
		return -1;
	}

	protected function applyMods($table) {
		$xpath = new DOMXPath($table->ownerDocument);
		$oldTds = $xpath->query("//*[@class='oldVersion']", $table);
		
		foreach($this->mods as $id => $mod) {
			//echo $mod->type. " - ".$id."<br>"; 
			switch($mod->type) {
				case "substitution":
					$destNodes = $xpath->query("//*[@class='oldVersion']//*[contains(@parent, '$mod->destination')]", $table);
					$destNodes = ($destNodes->length) ? $destNodes : $oldTds;
					$subsNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId ='$id']", $table);
					if($this->findAndwrapTextNode($mod->old, $destNodes, $mod->type) === FALSE) {
						$this->setAllAttribute($subsNodes, "class", "errorSubstitution");
						$this->setAllAttribute($subsNodes, "data-old", $mod->old);
						$this->setAllAttribute($subsNodes, "title", $mod->old." not found");
					}
					$this->setAllAttribute($subsNodes, "class", $mod->type);
					break;
				case "insertion":
					//TODO: controllare se va sempre bene il contains, se no fare un filtro dopo
					$insNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId ='$id' or contains(@parent,'$id')]", $table);
					$this->setAllAttribute($insNodes, "class", $mod->type);
					break;
				case "renumbering":
					$renumberingNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId ='$id' or contains(@parent,'$id')]", $table);
					$this->setAllAttribute($renumberingNodes, "renumbering", "true");
					break;
				case "repeal":
					$idCond = "";
					$targetNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId= '$mod->destination' or contains(@parent, '$mod->destination')]", $table);
					if($targetNodes->length) {
						$firstTarget = $targetNodes->item(0);
						$originalId = $firstTarget->getAttribute("akn_originalId");
						$idCond = ($originalId) ? "contains(@parent, '$originalId') or " : $idCond;
						$firstTargetParent = $xpath->query("./ancestor::*[@parent or @parentOriginalId]", $firstTarget);
						//TODO: non prendere solo il primo
						if($firstTargetParent->length) {
							$firstTargetParent = $firstTargetParent->item(0); 
							$originalId = $firstTargetParent->getAttribute("parentOriginalId");
							$parentId = ($originalId) ? $originalId : $firstTargetParent->getAttribute("parent");
							$idCond = ($parentId) ? "@parent = '$parentId' or $idCond" : $idCond;
						}
					}
					$destNodes = $xpath->query("//*[@class='oldVersion']//*[$idCond contains(@parent, '$mod->destination')]", $table);
					if($destNodes->length <= 1 ) {
						$destNodes = ($destNodes->length) ? $destNodes : $oldTds;
						$repealNodes = $this->findAndwrapTextNode($mod->old, $destNodes, $mod->type);
						$subsNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId ='$id']", $table);
						if($repealNodes === FALSE) {
							$this->setAllAttribute($subsNodes, "class", "errorRepeal");
							$this->setAllAttribute($subsNodes, "data-old", $mod->old);
						}
					} else {
						$this->setAllAttribute($destNodes, "class", $mod->type);
					}
					
					break;
			}
		}
	}

	protected function addBlankCell($table, $node) {
		$tr = $this->getParentByName($node, "tr");
		if($tr) {
			$pos = $this->getPosInParent($node);
			if($node && !$node->getAttribute("blankcell")) {
				$blankCell = $this->createBlankCell($this->tableDOM);
				$this->shiftAndInsertCell($node, $blankCell, $pos);
				return $blankCell;
			}
		}
	}
	
	protected function switchNode($node1, $node2) {
		$tmpNode = $this->createBlankCell($node1->ownerDocument);
		$node1 = $node1->parentNode->replaceChild($tmpNode, $node1);
		$node2 = $node2->parentNode->replaceChild($node1, $node2);
		$tmpNode->parentNode->replaceChild($node2, $tmpNode);
	}
	
	protected function removeBlankCell($node) {
		$tr = $this->getParentByName($node, "tr");
		if($tr) {
			$pos = $this->getPosInParent($node);
			while($tr) {
				$nextTR = $tr->nextSibling;
				if ($nextTR) { 
					$rightTd = $nextTR->childNodes->item($pos);
					if($rightTd) {
						$this->switchNode($rightTd, $node);
					}
				} else if($tr->childNodes->item(1-$pos)->getAttribute("blankcell")) {
					$tr->parentNode->removeChild($tr);
				}
				$tr = $nextTR;
			}
		}
	}

	protected function shiftAndInsertCell($cell, $newCell, $cellPosition) {
		$tr = $cell->parentNode;
		$table = $tr->parentNode;
		$cellToInsert = $newCell;
		while($tr) {
			$rigthTd = $tr->childNodes->item($cellPosition);
			if($rigthTd) {
				if ($cellToInsert) {
					$cellToInsert = $tr->replaceChild($cellToInsert, $rigthTd);	
				}
			}
			$tr = $tr->nextSibling;
		}
		// If the last cell is not a blank cell insert a new row
		if(!$cellToInsert->getAttribute("blankcell")) {
			$trNode = $table->ownerDocument->createElement('tr');
			$blankCell = $this->createBlankCell($table->ownerDocument);
			if($cellPosition) {
				$trNode->appendChild($blankCell);
				$trNode->appendChild($cellToInsert);
			} else {
				$trNode->appendChild($cellToInsert);
				$trNode->appendChild($blankCell);
			}
			$table->appendChild($trNode);
		}
	}
	
	protected function getParentByName($node, $name) {
		$iterNode = $node->parentNode;
		while($iterNode && $iterNode->nodeName != $name)
			$iterNode = $iterNode->parentNode;
		
		return ($iterNode && $iterNode->nodeName == $name) ? $iterNode : FALSE;
	}

	protected  function collectMods() {
		$this->mods = array();
		$mods = $this->xml_new->getElementsByTagName("passiveModifications");
		if($mods->length) {
			$mods = $mods->item(0)->childNodes;
			foreach ($mods as $mod) {
				$modObj = new nPassiveModification($mod);
				$this->mods[$modObj->id] = $modObj;
			}
		}
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
			$styleNode->setAttribute('href','data/newDiff.css');
			
			//$scriptNode = $html->createElement('script');
			//$scriptNode->nodeValue = "var head = document.getElementsByTagName('head')[0];var script = document.createElement('script');script.type = 'text/javascript';script.src = 'data/afterRender.js'; head.appendChild(script);";
			//$scriptNode->setAttribute('src', "https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js");
			
			$headNode = $html->createElement('head');
			$headNode->appendChild($metaNode);
			$headNode->appendChild($styleNode);
			//$headNode->appendChild($scriptNode);
			
			$body = $html->createElement('body');
			//$body->setAttribute("onload", "cleanHTML()");
			
			///////////////////////////////////////////////////////
			///////////////////////////////////////////////////////
			///////////////////////////////////////////////////////
			
			$finder = new DomXPath($this->html_new);
			$classname="body";
			$contentLeft = $finder->query("//*[@class and contains(concat(' ', normalize-space(@class), ' '), ' $classname ')]")->item(0);
			$finder = new DomXPath($this->html_old);
			$contentRight = $finder->query("//*[@class and contains(concat(' ', normalize-space(@class), ' '), ' $classname ')]")->item(0);
			
			$this->tableDOM = new DOMDocument();
			$this->tableRoot = $this->tableDOM->createElement('table');
			
			$nodeLeft = $this->html_new->documentElement->firstChild;
			$nodeRight = $this->html_old->documentElement->firstChild;
			if (!$this->leftToRight) {
				$nodeLeft = $this->html_old->documentElement->firstChild;
				$nodeRight = $this->html_new->documentElement->firstChild;
				$tmp = $contentLeft;
				$contentLeft = $contentRight;
				$contentRight = $tmp;
			}
			$this->topOfDocument($nodeLeft,$nodeRight);
			
			$this->collectMods();
			$this->tableDOM->appendChild($this->tableRoot);
			$table = $this->tableDOM->createElement('table');
			$table->setAttribute("class", "tableBody");
			$_trNode = $this->tableDOM->createElement('tr');
			$_tdNode = $this->tableDOM->createElement('td');
			$_tdNode->setAttribute("colspan", 2);
			$_tdNode->appendChild($table);
			$_trNode->appendChild($_tdNode);
			$this->tableRoot->appendChild($_trNode);
			
			$this->buildTable($table, $contentLeft, $contentRight);
			//$this->buildLineDiff($table, $contentLeft, $contentRight);
			$trNode = $this->tableDOM->createElement('tr');
			$this->tableRoot->appendChild($trNode);
			$this->bottomOfDocument($nodeLeft,$nodeRight,$trNode);
			
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
