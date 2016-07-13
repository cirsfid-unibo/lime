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
			$this->eid = $mod->getAttribute('eId');
			$this->destinations = array();
			$this->olds = array();
			$this->destination = substr($mod->getElementsByTagName('destination')->item(0)->getAttribute('href'),1);
			$previous = $mod->getElementsByTagName('previous');
			$previous = ($previous->length) ? $previous->item(0)->getAttribute("href") : NULL;
			
			$this->previousId = ($previous) ? substr($previous, strrpos($previous, "#")+1) : NULL;
			$oldNode = NULL;
			foreach ($mod->getElementsByTagName('old') as $old) {
				$this->old = $this->getChValue($old, 'text');
				$this->old = ($this->old) ? $this->old : $old->nodeValue;
				$this->textBefore = $this->getChValue($old, 'before');
				$this->textAfter = $this->getChValue($old, 'after');
				$oldNode = $old;
			}
			
			$this->oldHref = ($oldNode) ? substr($oldNode->getAttribute('href'), strrpos($oldNode->getAttribute('href'), "#")+1) : "";
			
			$nodeNew = NULL;
			foreach ($mod->getElementsByTagName('new') as $new) {
				$this->new = $new->nodeValue;
				$nodeNew = $new;
			}
			$this->newHref = ($nodeNew) ? substr($nodeNew->getAttribute('href'),1) : "";
			
			foreach ($mod->getElementsByTagName('destination') as $dest) {
				$this->destinations[] = substr($dest->getAttribute('href'), strrpos($dest->getAttribute('href'), "#")+1);
			}
			
			foreach ($mod->getElementsByTagName('old') as $old) {
				$this->olds[] = substr($old->getAttribute('href'), strrpos($old->getAttribute('href'), "#")+1);
			}
			
			//$this->id = (!$this->new && $nodeNew) ? $this->newHref : $this->destination;
			$this->id = ($this->newHref && $nodeNew) ? $this->newHref : $this->destination;
		}
	}

	protected function getChValue($node, $name) {
		$ch = $node->getElementsByTagName($name);
		if ($ch->length) {
			return $ch->item(0)->nodeValue;
		}
	}	
}

class newAKNDiff09 extends AKNDiff {
	protected function setParentsAttributes($node) {
		$childDiv = $node->getElementsByTagName('div');
		foreach( $childDiv as $childNode ) {
			$childNode->setAttribute('parent', $this->getAllParentsId($childNode));
			$childNode->setAttribute('parentWid', $this->getAllParentsWId($childNode));
			$childNode->setAttribute('parentClass', $childNode->parentNode->getAttribute("class"));
		}
	}
	
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
					$importedNode->setAttribute('parentWid', $this->getAllParentsWId($childNode));
					$importedNode->setAttribute('parentClass', $childNode->parentNode->getAttribute("class"));
					/////////////////////////////////////////////////////////////////////////////////////
					/////////////////////////////////////////////////////////////////////////////////////
					/*
					 * $originalId = $childNode->parentNode->getAttribute("akn_originalId");
						if ($originalId)
						$importedNode->setAttribute('parentOriginalId', $childNode->parentNode->getAttribute("akn_originalId"));
					 * */
				}
				//$this->setParentsAttributes($importedNode);
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
	
	protected function getTextNodesContaining($node, $str, $caseSensitive = FALSE) {
		return $this->getTextNodesBy($node, function($textNode) use ($str, $caseSensitive) {
			$nodeText = $textNode->data;
			if($caseSensitive === FALSE) {
				$nodeText = strtolower($nodeText);
				$str = strtolower($str);
			}
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

	protected function findAndwrapTextNode($searchText, $node, $wrapperClass = FALSE, $textBefore = FALSE, $textAfter = FALSE) {
		$searchText = trim($searchText);
		$wrapNodes = array();
		$nodes = $this->getTextNodesContaining($node, $searchText);
		if(count($nodes)) {
			if($wrapperClass !== FALSE) {
				foreach($nodes as $node) {
					$txtNode = $this->getSplittedTxtNode($node, $searchText, $textBefore, $textAfter);
					if ($txtNode) {
						$wrapper = $this->wrapNode($txtNode, $wrapperClass);
						$wrapNodes[] = $wrapper;
					}
				}
			}	
		} else {
			$nodes = $this->getUniqueObjNodes($this->getTextNodesContainingTextSmart($node, $searchText));
			if(count($nodes)) {
				$allTxtNodes = $this->splitAllObjNodes($nodes);
				$combinations = $this->findTextNodeCombination($allTxtNodes, $allTxtNodes, $searchText);
				$txtNodes = $this->getBestIntervalNode($combinations, $textBefore, $textAfter);
				if(count($txtNodes)) {
					$wrapNode = $this->wrapTextNodesInterval($txtNodes[0], $txtNodes[1]);
					if($wrapNode) {
						$wrapNode->setAttribute("class", $wrapperClass);
						$wrapNodes[] = $wrapNode;
					}
				}
			}

		}

		$nodes = ($wrapperClass === FALSE) ? $nodes	: $wrapNodes;
		return (count($nodes)) ? $nodes : FALSE;
	}

	// Remove duplicates from the $objs returned from getTextNodesContainingTextSmart
	protected function getUniqueObjNodes($objs) {
		$result = array();
		$passed = array();

		foreach ($objs as $obj) {
			if (!array_key_exists($obj["str"], $passed)) {
				$passed[$obj["str"]] = array();
			}
			if ($this->domnode_array_search($obj["node"], $passed[$obj["str"]]) === FALSE) {
				$passed[$obj["str"]][] = $obj["node"];
				$result[] = $obj;	
			}
		}
		return $result;
	}

	protected function domnode_array_search($node, $arr) {
		foreach ($arr as $arrnd) {
			if ($arrnd->isSameNode($node)) {
				return $arrnd;
			}
		}
		return FALSE;
	}

	protected function splitAllObjNodes($nodes) {
		$allNodes = array();
		foreach ($nodes as $node) {
			$txtNodes = $this->splitTextNode($node["node"], $node["str"]);
			$allNodes = array_merge($allNodes, $txtNodes);
		}
		return $allNodes;
	}

	// Find the best interval node based on textBefore and textAfter
	protected function getBestIntervalNode($intervalNodes, $textBefore, $textAfter) {
		$textBefore = $this->removeSpaces($textBefore);
		$textAfter = $this->removeSpaces($textAfter);
		foreach ($intervalNodes as $intNode) {
			if ($textBefore) {
				$prevText = $this->removeSpaces($this->getPrecedingText($intNode[0]));
				if (!$this->endswith($prevText, $textBefore)) {
					continue;
				}
			}
			if ($textAfter) {
				$nextText = $this->removeSpaces($this->getFollowingText($intNode[1]));
				if (!$this->startswith($nextText, $textAfter)) {
					continue;
				}
			}
			// This can be needed occurence or 
			// the first one if the $textBefore and $textAfter are empty
			return $intNode;
		}
	}

	protected function splitTextNode($tNode, $str, $includeStr = FALSE) {
		$textNodes = array();
		$encoding = mb_detect_encoding($str);
		$len = mb_strlen($str, $encoding);
		$positions = $this->strpos_all($tNode->data, $str);
		for($i = count($positions)-1; $i>=0; $i--) {
			$pos = $positions[$i];
			if ($pos > 0) {
				$newNode = $tNode->splitText($pos);
			} else {
				$newNode = $tNode;
			}
			$newNode->splitText($len);
			array_unshift($textNodes, $newNode);
		}
		return $textNodes;
	}

	protected function findTextNodeCombination($firstNodes, $lastNodes, $str) {
		$str = $this->removeSpaces($str);
		$pairs = array();
		foreach ($firstNodes as $firstNode) {
			foreach ($lastNodes as $lastNode) {
				$text = $this->joinText($firstNode, $lastNode);
				if ($this->removeSpaces($text) == $str) {
					$pairs[] = array($firstNode, $lastNode);
				}
			}
		}
		return $pairs;
	}

	protected function strpos_all($str, $needle) {
		$encoding = mb_detect_encoding($str);
		$lastPos = 0;
		$positions = array();

		while (($lastPos = mb_strpos($str, $needle, $lastPos, $encoding))!== false) {
		    $positions[] = $lastPos;
		    $lastPos = $lastPos + mb_strlen($needle, $encoding);
		}

		return $positions;
	}

	protected function joinText($from, $to) {
		$siblings = $this->getNextSiblingsContaining($from, $to);
		$text = $from->textContent;
		foreach ($siblings as $node) {
			$text.=$node->textContent;
		}
		return $text;
	}

	protected function wrapTextNodesInterval($from, $to) {
		if(!$from->parentNode) return FALSE;
		$wrapNode = $from->ownerDocument->createElement('span');
		$from->parentNode->insertBefore($wrapNode, $from);
		$wrapNode->appendChild($from);
		$siblings = $this->getNextSiblingsContaining($wrapNode, $to);
		foreach ($siblings as $node) {
			$wrapNode->appendChild($node);
		}
		return $wrapNode;
	}
	// Old function TODO: remove if is useless
	protected function wrapTextNode($tNode, $str, $class = "textWrapper", $caseSensitive = FALSE, $precedingText = FALSE) {
		$wrapNode = NULL;
		$encoding = mb_detect_encoding($tNode->data);
		$precedingPos = ($precedingText) ? mb_strpos(strtolower($tNode->data), strtolower($precedingText), 0, $encoding) : 0;
		$precedingPos = ($precedingPos !== FALSE && $precedingText) ? $precedingPos+mb_strlen($precedingText, $encoding) : 0;
		$textData = $tNode->data;
		$strings = explode($str, $textData);
		if ( $precedingText && strlen($precedingText) && $precedingPos === 0 && count($strings) > 2 ) {
			$stringsPrev = explode($str, $precedingText);

			if ( array_key_exists(count($stringsPrev)-1, $strings) ) {
				$lastStr = $strings[(count($stringsPrev)-1)];
				$precedingPos = (mb_strpos($textData, $lastStr, 0, $encoding) + mb_strlen($lastStr, $encoding));
			}
		}

		if($caseSensitive === FALSE) {
			$pos = mb_strpos(strtolower($textData), strtolower($str), $precedingPos, $encoding);
		} else {
			$pos = mb_strpos($textData, $str, $precedingPos, $encoding);
		}
		$doc = $tNode->ownerDocument;
		if($pos !== FALSE) {
			$newNode = $tNode;
			if($pos > 0) {
				$newNode = $newNode->splitText($pos);
			}
			if(mb_strlen($newNode->data, $encoding) > mb_strlen($str, $encoding)) {
				$tNode = $newNode->splitText(mb_strlen($str, $encoding));
				if($tNode) {
					$newNode = $tNode->previousSibling;	
				}
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

	protected function wrapNode($node, $class = "wrapper") {
		$span = $node->ownerDocument->createElement('span');
		$span->setAttribute("class", $class);
		if($node->parentNode) {
			$node->parentNode->insertBefore($span, $node);
			$span->appendChild($node);
			$span->parentNode->normalize();
		}
	}

	// Choose one of the occurences of $str in $txtNode based on $textBefore and $textAfter
	// and return the text node which has the same content of $str
	protected function getSplittedTxtNode($txtNode, $str, $textBefore, $textAfter) {
		$nodes = $this->splitTextNode($txtNode, $str);
		// Ignore spaces they are not relevant
		$textBefore = $this->removeSpaces($textBefore);
		$textAfter = $this->removeSpaces($textAfter);
		// Iterate and the nodes occurences
		foreach ($nodes as $node) {
			if ($textBefore) {
				$prevText = $this->removeSpaces($this->getPrecedingText($node));
				if (!$this->endswith($prevText, $textBefore)) {
					continue;
				}
			}
			if ($textAfter) {
				$nextText = $this->removeSpaces($this->getFollowingText($node));
				if (!$this->startswith($nextText, $textAfter)) {
					continue;
				}
			}
			// This can be needed occurence or 
			// the first one if the $textBefore and $textAfter are empty
			return $node;
		}
	}

	protected function endswith($string, $test) {
		$strlen = strlen($string);
		$testlen = strlen($test);
		if ($testlen > $strlen) return false;
		return substr_compare($string, $test, $strlen - $testlen, $testlen) === 0;
	}

	protected function startswith($string, $test) {
		$strlen = strlen($string);
		$testlen = strlen($test);
		if ($testlen > $strlen) return false;
		return substr_compare($string, $test, 0, $testlen) === 0;
	}
	
	protected function getTextNodesBy($node, $fn) {
		$textList = array();
		if(get_class($node) == 'DOMNodeList' || is_array($node)) {
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
		$nodesOld = $xpath->query("//*[@class='oldVersion']//*[contains(@class, 'ins')]", $table);
		foreach($nodesOld as $node) {
			if(preg_match('/\bins/', $node->getAttribute('class'))) {
				$this->unwrapNode($node);
			}
		}
	}
	
	protected function unwrapNode($node, $addSpace=TRUE) {
		$doc = $node->ownerDocument;
		$parent = $node->parentNode;
		$iterNode = $node->firstChild;
		if ($addSpace)
			$parent->insertBefore($doc->createTextNode(" "), $node);
		if($node->nextSibling && $addSpace) {
			$parent->insertBefore($doc->createTextNode(" "), $node->nextSibling);	
		}
		while($iterNode) {
			$nodeToMove = $node->removeChild($iterNode);
			$parent->insertBefore($nodeToMove, $node);
			$iterNode = $node->firstChild;
		}
		$parent->removeChild($node);
		$parent->normalize();	
	}
	
	protected function setAllAttribute($nodes, $attribute, $value, $append = TRUE) {
		$attValue = $value;
		foreach($nodes as $node) {
			if ($append) {
				$oldValue = $node->getAttribute($attribute);
				$attValue= ($oldValue) ? $oldValue." $value" : $value;	
			}
			$node->setAttribute($attribute, trim($attValue));
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
		if(!$td) return;
		$xpath = new DOMXPath($td->ownerDocument);
		$tr = $this->getParentByName($td, "tr");
		$table = $this->getParentByName($tr, "table");
		$siblings = $this->getNextSiblings($tr, $nextTr);
		foreach($siblings as $sibling) {
			$this->normalizeRow($sibling,$modName);
			$modNodes = $xpath->query(".//*[contains(@class, '$modName')]", $sibling);
			if(!$modNodes->length) continue;
			$tdToAdd = FALSE;
			foreach($modNodes as $mod) {
				$tdModParent = $this->getParentByName($mod, "td");
				// Add blank cell if the cell contains only the insertion
				if(trim($mod->nodeValue) == trim($tdModParent->nodeValue)) {
					$tdToAdd = $tdModParent;
					break;
				}
			}
			if(!$tdToAdd) continue;
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

	protected function normalizeInserition($td, $nextTd) {
		$this->normalizeModification($td, $nextTd, "insertion", "repeal");
	}
	
	protected function normalizeRepeal($td, $nextTd) {
		$this->normalizeModification($td, $nextTd, "repeal", "insertion");
	}
	
	protected function normalizeModifications($td, $nextTd) {
		$nextTr = ($nextTd) ? $this->getParentByName($nextTd, "tr") : FALSE;
		$firstRepeal = FALSE;
		if($td) {
			$xpath = new DOMXPath($td->ownerDocument);
			$tr = $this->getParentByName($td, "tr");
			$siblings = $this->getNextSiblings($tr, $nextTr);
			foreach($siblings as $sibling) {
				$nodesRepeal = $xpath->query(".//*[contains(@class, 'repeal')]", $sibling);
				$nodesInsertion = $xpath->query(".//*[contains(@class, 'insertion')]", $sibling);
				if($nodesRepeal->length && !$nodesInsertion->length) {
					$firstRepeal = TRUE;
					break;
				} else if($nodesInsertion->length && !$nodesRepeal->length) {
					break;
				}
			}
		}
		if($firstRepeal) {
			$this->normalizeRepeal($td, $nextTd);
			$this->normalizeInserition($td, $nextTd);
		} else {
			$this->normalizeInserition($td, $nextTd);
			$this->normalizeRepeal($td, $nextTd);
		}
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
				// TODO: check if this is really need to be removed
				// $parent = $xpath->query(".//*/@parentOriginalId", $tdNew);
				// if ($parent->length > 0) {
				// 	$parent = $parent->item(0)->nodeValue;
				// } else {
				// }
				$parent = $xpath->query(".//*/@parent", $tdNew);
				if ($parent->length > 0) $parent = $parent->item(0)->nodeValue;
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
				//$this->setAllAttribute(array($tdNew, $tdOld), "style", "background-color:red;");
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
			$this->normalizeModifications($tdNew, $nextTdNew);
		}
		$this->applySplits($table);
		$this->applyJoins($table);
		$this->detectCellsOfInteress($table);
	}
	
	
	protected function applyNotes($table) {
		$xpath = new DOMXPath($table->ownerDocument);
		$noteRow = $this->tableDOM->createElement('tr');
		$notesDescriptions = array();
		$this->tableRoot->appendChild($noteRow);
		$notes = $this->xml_new->getElementsByTagName("note");
		$blankCell = $this->createBlankCell($this->tableDOM);
		$notesCell = $this->tableDOM->createElement('td');
		$lsitHeader = $this->tableDOM->createElement('h4');
		$lsitHeader->nodeValue = "Notes";
		$notesCell->setAttribute("class", "notes");
		$notesList = $this->tableDOM->createElement('ul');
		$notesCell->appendChild($lsitHeader);
		$notesCell->appendChild($notesList);
		$pos = NULL;
		foreach($notes as $note) {
			$notesDescriptions[$note->getAttribute("eId")] = $note->nodeValue;
		}
		
		$notesRef = $xpath->query(".//*[@class='newVersion']//*[contains(@class, 'noteRef')]", $table);	
		for($i = 0; $i < $notesRef->length; $i++) {
			$noteRef = $notesRef->item($i);
			$id = substr($noteRef->getAttribute("akn_href"),1);
			if(array_key_exists($id, $notesDescriptions)) {
				$note = $notesDescriptions[$id];
				$noteNum = $i+1;
				$noteLink = $table->ownerDocument->createElement('a');
				$noteLink->setAttribute("href", "#noteBottom$noteNum");
				$noteLink->setAttribute("id", "note$noteNum");
				$noteLink->nodeValue = "Note $noteNum";
				$description = $table->ownerDocument->createElement('span');
				$description->nodeValue = $note;
				$noteLink->appendChild($description);
				$noteRef->appendChild($noteLink);
				$noteItem = $this->tableDOM->createElement('li');
				$noteLink = $this->tableDOM->createElement('a');
				$noteLink->nodeValue = "$noteNum";
				$noteLink->setAttribute("href", "#note$noteNum");
				$noteLink->setAttribute("class", "bottomRef");
				$noteItem->appendChild($noteLink);
				$noteItem->appendChild($this->tableDOM->createTextNode($note));
				$noteItem->setAttribute("id", "noteBottom$noteNum");
				$notesList->appendChild($noteItem);
				if(!$pos) {
					$td = $this->getParentByName($noteRef, "td");
					$pos = $this->getPosInParent($td);
				}
			}
			
		}
		
		if($pos) {
			$noteRow->appendChild($blankCell);
			$noteRow->appendChild($notesCell);
		} else {
			$noteRow->appendChild($notesCell);
			$noteRow->appendChild($blankCell);
		}
	}

	protected function finalCleanUp($table) {
		$xpath = new DOMXPath($table->ownerDocument);
		$rowContainsBlank = $xpath->query("//tr[td[@blankcell]]", $table);
		
		foreach($rowContainsBlank as $row) {
			$otherTd = $xpath->query("./td[not(@blankcell)]", $row);
			if(!$otherTd->length) {
				$row->parentNode->removeChild($row);
			}
		}
		
		$emptyTds = $xpath->query("//td[not(@blankcell) and not(node())]");
		foreach($emptyTds as $td) {
			$td->nodeValue = "&nbsp;";
		}
	}

	protected function detectCellsOfInteress($table) {
		$xpath = new DOMXPath($table->ownerDocument);
		$rows = $table->getElementsByTagName("tr");
		$equalCount = 0;
		foreach($rows as $row) {
			$cells = $row->getElementsByTagName("td");
			if($cells->length == 2) {
				$firstChild = $cells->item(0);
				$secondChild = $cells->item(1);
				$modsXpath = ".//*[contains(@class, 'insertion') or contains(@class, 'substitution') or contains(@class, 'repeal')]";
				$firstMods = $xpath->query($modsXpath, $firstChild);
				$secondMods = $xpath->query($modsXpath, $secondChild);
				if(!$firstMods->length && !$secondMods->length && 
								(!$firstChild->getAttribute("blankcell") && !$secondChild->getAttribute("blankcell"))) {
					$this->setAllAttribute(array($firstChild, $secondChild), "equalcell", "equal$equalCount");
					//$this->setAllAttribute(array($firstChild, $secondChild), "style", "background-color:red;");
					$equalCount++;
				}
			}
		}

		$renumberedNodes = $xpath->query(".//*[@renumbering and contains(@parentClass, 'container')]", $table);

		foreach($renumberedNodes as $node) {
			$originalId = $node->getAttribute("parentOriginalId");
			$renumberingId = $node->getAttribute("renumbering");
			if (!$originalId) continue;
			$oldNodes = $this->findOldNodes($node, $table, $originalId);
			if (!count($oldNodes)) continue;
			$oldNode = $oldNodes[0];

			$tdNew = $this->getParentByName($node, "td");
			$tdOld = $this->getParentByName($oldNode, "td");
			$tdOld->setAttribute("renumberingFrom", $renumberingId);
			$tdNew->setAttribute("renumberingTo", $renumberingId);
		}
	}
	
	protected function applySplits($table) {
		$xpath = new DOMXPath($table->ownerDocument);
		$nodesToSplit = $xpath->query("//*[@class='oldVersion']//*[@toSplit]", $table);
		foreach($nodesToSplit as $node) {
			$modId = $node->getAttribute("toSplit");
			$mod =  $this->mods[$modId];
			if($mod && count($mod->destinations) > 1) {
                $splittedNodes = $xpath->query("//*[@class='newVersion']//*[@splittedBy='$modId']", $table);
                $this->normalizeSplitJoinCells($table, $node, $splittedNodes);
				$td = $this->getParentByName($node, "td");
				$pos = $this->getPosInParent($td);
				$tr = $this->getParentByName($td, "tr");
				$siblingTr = $tr->nextSibling;
				$removedTd = FALSE;
				for($i=0; $i < count($mod->destinations)-1; $i++) {
					if($siblingTr) {
						$tdToRemove = $siblingTr->childNodes->item($pos);
						if($tdToRemove && $tdToRemove->getAttribute("blankcell")) {
							$removedTd = TRUE;
							$siblingTr->removeChild($tdToRemove);	
						}
					}
					$siblingTr = $siblingTr->nextSibling;
				}
				if ($removedTd)
					$td->setAttribute("rowspan", count($mod->destinations));
			}
		}
	}

    protected function normalizeSplitJoinCells($table, $node, $destNodes) {
        $xpath = new DOMXPath($table->ownerDocument);
        $posInParent = $this->getPosInParent($this->getParentByName($node, "td"));
        $targetTr = $this->getParentByName($node, "tr");
        
        foreach($destNodes as $spNode) {
            $tr = $this->getParentByName($spNode, "tr");
            if ($tr === $targetTr) continue;
            $tdToMove = $tr->childNodes->item($posInParent);
            $blankCell = $this->createBlankCell($this->tableDOM);
            $tdToMove = $tr->replaceChild($blankCell, $tdToMove);

            if ($tr->nextSibling) {
                $nextTd = $tr->nextSibling->childNodes->item($posInParent);
                $tdToMove = $tr->nextSibling->replaceChild($tdToMove, $nextTd);
                if (!$tdToMove->getAttribute("blankcell"))
                    $this->insertAfter($this->wrapTd($table, $tdToMove, $posInParent), $tr->nextSibling);
            } else 
                $table->insertBefore($this->wrapTd($table, $tdToMove, $posInParent), $tr->nextSibling);
        }
    }

    protected function insertAfter($node, $target) {
        if ($target->nextSibling)
            $target->parentNode->insertBefore($node, $target->nextSibling);
        else
            $target->parentNode->appendChild($node);
    }

    protected function wrapTd($table, $td, $pos) {
        $trNode = $table->ownerDocument->createElement('tr');
        $blankCell = $this->createBlankCell($table->ownerDocument);
        if($pos) {
            $trNode->appendChild($blankCell);
            $trNode->appendChild($td);
        } else {
            $trNode->appendChild($td);
            $trNode->appendChild($blankCell);
        }
        return $trNode;
    }
	
	protected function applyJoins($table) {
		$xpath = new DOMXPath($table->ownerDocument);
		$nodesJoined = $xpath->query("//*[@class='newVersion']//*[@joined]", $table);
		foreach($nodesJoined as $nodeJoined) {
			$tdJoined = $this->getParentByName($nodeJoined, "td");
			$modId = $nodeJoined->getAttribute("joined");
			$nodesToJoin = $xpath->query("//*[@class='oldVersion']//*[@joinInto='$modId']", $table);
            $this->normalizeSplitJoinCells($table, $nodeJoined, $nodesToJoin);
			$nodeJoined->setAttribute("numJoins", $nodesToJoin->length);
			$mod =  $this->mods[$modId];
			$fistJoin = $nodesToJoin->item(0);
			$td = $this->getParentByName($fistJoin, "td");
			$pos = $this->getPosInParent($td);
			$tr = $this->getParentByName($td, "tr");
			$siblingTr = $tr->nextSibling;
			$newTr = FALSE;
			for($i=0; $i < $nodesToJoin->length-1; $i++) {
				$nodeJoin = $nodesToJoin->item($i+1);
				$tdJoin = $this->getParentByName($nodeJoin, "td");
				if ($nodeJoin && $tdJoin && $nodeJoin->nodeValue == $tdJoin->nodeValue) {
					$newTr = $table->ownerDocument->createElement('tr');
					if($siblingTr) {
						$tr->parentNode->insertBefore($newTr, $siblingTr);	
					} else {
						$tr->parentNode->appendChild($newTr);
					}
					$newTr->appendChild($tdJoin);
				}
			}
			if ($newTr)
				$tdJoined->setAttribute("rowspan", $nodesToJoin->length);
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
	protected function getPrecedingText($node) {
		$text = "";
		while ($node->previousSibling) {
			$text = $node->previousSibling->nodeValue . $text;
			$node = $node->previousSibling;
		}
		return $text;
	}

	protected function getFollowingText($node) {
		$text = "";
		while ($node->nextSibling) {
			$text .= $node->nextSibling->nodeValue;
			$node = $node->nextSibling;
		}
		return $text;
	}
	
	protected function applyMods($table) {
		$xpath = new DOMXPath($table->ownerDocument);		
		foreach($this->mods as $id => $mod) {
			if($mod->previousId)
				$this->setPreviousIdAttr($mod, $xpath, $table);
			
			switch($mod->type) {
				case "substitution":
					$this->applyModSubstitution($mod, $xpath, $table);
					break;
				case "insertion":
					$this->applyModInsertion($mod, $xpath, $table);
					break;
				case "renumbering":
					$this->applyModRenumbering($mod, $xpath, $table);
					break;
				case "repeal":
					$this->applyModRepeal($mod, $xpath, $table);
					break;
				case "split":
					$this->applyModSplit($mod, $xpath, $table);
					break;
				case "join":
					$this->applyModJoin($mod, $xpath, $table);
					break;
			}
		}
	}

	protected function setPreviousIdAttr($mod, $xpath, $table) {
		// It's important to check first if there're nodes with parent = id and after check if contains
		$originalNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId ='$mod->id' or @parent = '$mod->id']", $table);
		$originalNodes = (!$originalNodes->length) ? 
							$xpath->query("//*[@class='newVersion']//*[@akn_currentId ='$mod->id' or contains(@parent, '$mod->id')]", $table) 
							: $originalNodes;
		foreach($originalNodes as $node) {
			if(preg_match("/\b$mod->id/", $node->getAttribute("parent"))) {
				$this->setAllAttribute(array($node), "parentOriginalId", $mod->previousId);						
			}
		}
	}

	protected function applyModSubstitution($mod, $xpath, $table) {
		$precedingText = $mod->textBefore;
		$subsNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId ='$mod->id' or contains(@parent, '$mod->id')]", $table);

		$destNodes = $xpath->query("//*[@class='oldVersion']//*[@akn_currentId ='$mod->id' or @akn_currentId ='$mod->destination' or contains(@parent, '$mod->destination')]", $table);
		//echo $destNodes->length.' - '.$mod->old.' - '.$mod->id.' - '.$mod->destination.'<br>';

		if ($subsNodes->length == 1) {
			$newNode = $subsNodes->item(0);
		} else {
			$newNode = $xpath->query("(//*[@class='newVersion']//*[@akn_currentId ='$mod->id' or  contains(@parent, '$mod->destination')])[last()]", $table)->item(0);
		}
		
		if(!$destNodes->length && $mod->old) {
			if($newNode) {
				$parent = $newNode->parentNode;
				$parentId = $parent->getAttribute('akn_currentId');
				$destNodes = $xpath->query("//*[@class='oldVersion']//*[@akn_currentId ='$parentId']", $table);
				
				//echo $destNodes->length.' - '.$mod->old.' - '.$parentId.'<br>';

				if (!$destNodes->length) {
					$destNodes = $xpath->query("//*[@class='oldVersion']//*[contains(., '$precedingText')]", $table);
				}
			}
		}

		$targetNodes = $xpath->query("(//*[@class='newVersion']//*[@akn_currentId= '$mod->destination' or @akn_wId= '$mod->destination' or contains(@parent, '$mod->destination')])[last()]", $table);


		if ($targetNodes->length) {
			$parentWithWid = $this->getNodeWithAttribute($targetNodes, "akn_wId");
			if (!$parentWithWid) {
				$parentWithWid = $this->getNodeWithAttribute($targetNodes, "parentWid");
				if ($parentWithWid) {
					$parentWid = explode(" ", $parentWithWid->getAttribute("parentWid"));
					$parentWid = end($parentWid);
					$parentWithWid->setAttribute('akn_wId', $parentWid);
				}
			}
		}

		$found = FALSE;
		if ($parentWithWid) {
			$destNodesW = $this->findOldNodes($parentWithWid, $table);
			if (count($destNodesW)) {
				$found = $this->searchSubstitution($destNodesW, $mod, $xpath, $table, $subsNodes, $destNodes->length ? FALSE : TRUE);
			}
		}
		if ($destNodes->length && !$found) {
			$this->searchSubstitution($destNodes, $mod, $xpath, $table, $subsNodes, TRUE);
		}
	}

	protected function searchSubstitution($destNodes, $mod, $xpath, $table, $subsNodes, $setErrors = TRUE) {
		$precedingText = $mod->textBefore;
		//echo $mod->destination." - ".$destNodes->length. " - ".$mod->id." - ".$mod->old." - ".$precedingText."<br>";					
		$this->setAllAttribute($subsNodes, "title", "Old string: ".$mod->old);
		$this->setAllAttribute($subsNodes, "class", $mod->type);
		$length = get_class($destNodes) == 'DOMNodeList' ? $destNodes->length : count($destNodes);

		if($mod->old && $length) {
			// Filter nodes based on preceding text
			if ($precedingText && $length > 1) {
				$txt = $this->removeSpaces($precedingText);
				$nodes = array();
				foreach ($destNodes as $nd) {
					if ( strpos($this->removeSpaces($nd->textContent), $txt) !== FALSE ){
						$nodes[] = $nd;
					}
				}
				if (count($nodes)){
					$destNodes = $nodes;
				}
			}

			if($this->findAndwrapTextNode($mod->old, $destNodes, $mod->type, $mod->textBefore, $mod->textAfter) === FALSE) {
				if ($setErrors) {
					$this->setAllAttribute($subsNodes, "class", "errorSubstitution");
					$this->setAllAttribute($subsNodes, "data-old", $mod->old);
					$this->setAllAttribute($subsNodes, "title", $mod->old." not found", FALSE);
				}
				return FALSE;
			}
		} else {
			//echo $mod->destination." - ".$mod->id." - ".$mod->old." - ".$precedingText."<br>";					
			$this->setAllAttribute($destNodes, "class", $mod->type);	
		}
		return TRUE;
	}

	protected function applyModInsertion($mod, $xpath, $table) {
		//TODO: controllare se va sempre bene il contains, se no fare un filtro dopo
		$insNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId ='$mod->id' or contains(@parent,'$mod->id')]", $table);
		$this->setAllAttribute($insNodes, "class", $mod->type);
	}

	protected function applyModRenumbering($mod, $xpath, $table) {
		$renumberingNodes = $xpath->query("//*[@class='newVersion']//*[@parentOriginalId and (@akn_currentId ='$mod->id' or contains(@parent,'$mod->id'))]", $table);
		$this->setAllAttribute($renumberingNodes, "renumbering", $mod->eid);
	}

	protected function applyModSplit($mod, $xpath, $table) {
		//echo $mod->type. " - ".$id." - ".$mod->oldHref."<br>";
		if(!$mod->oldHref || count($mod->destinations) < 2) return;
		$previousNodes = $xpath->query("//*[@class='oldVersion']//*[@akn_currentId= '$mod->oldHref' or contains(@parent, '$mod->oldHref')]", $table);
		if(!$previousNodes->length) return;

		$this->setAllAttribute($previousNodes, "toSplit", "$mod->id");
		for($i=0; $i < count($mod->destinations); $i++) {
			$destHref = $mod->destinations[$i];
			$destNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId= '$destHref' or contains(@parent, '$destHref')]", $table);
			$this->setAllAttribute($destNodes, "splittedBy", "$mod->id");
		}
	}

	protected function applyModJoin($mod, $xpath, $table) {
        if(!$mod->destination || count($mod->olds) < 2) return;
		$dest = $mod->destination;
		$previousNodes = $xpath->query("//*[@class='newVersion']//*[@akn_currentId= '$dest' or contains(@parent, '$dest')]", $table);
		if(!$previousNodes->length) return;

		$this->setAllAttribute($previousNodes, "joined", "$mod->id");
		for($i=0; $i < count($mod->olds); $i++) {
			$oldHref = $mod->olds[$i];
			$oldNodes = $xpath->query("//*[@class='oldVersion']//*[@akn_currentId= '$oldHref' or contains(@parent, '$oldHref')]", $table);
			$this->setAllAttribute($oldNodes, "joinInto", "$mod->id");
		}
	}
	

	protected function applyModRepeal($mod, $xpath, $table) {
		$idCond = "";
		$parentIdCond = "";
		$targetNodes = $xpath->query("(//*[@class='newVersion']//*[@akn_currentId= '$mod->destination' or @akn_wId= '$mod->destination' or contains(@parent, '$mod->destination')])[last()]", $table);
		//echo $targetNodes->length. " - ".$mod->destination." - ".$mod->old." - ".$targetNodes->item(0)->nodeName."<br>";

		if($targetNodes->length) {
			$firstTarget = $targetNodes->item(0);
			$originalId = $firstTarget->getAttribute("akn_wId");
			$parentWid = $firstTarget->getAttribute("parentWid");
			$idCond = ($originalId) ? "contains(@parent, '$originalId') or " : $idCond;
			//$firstTargetParent = $xpath->query("./ancestor::*[@parent or @parentOriginalId]", $firstTarget);
			$targetParents = $xpath->query("./ancestor::*[contains(@class, 'container') or contains(@parentClass, 'container')]", $firstTarget);
			//echo "<br>".$mod->destination." - ".$mod->old." - ".$targetParents->length."!!<br>";
			if($targetParents->length) {
				$firstTargetParent = $targetParents->item($targetParents->length-1);
				$parentWithWid = $this->getNodeWithAttribute($targetParents, "akn_wId");
				$parentStatusRemoved = $this->getNodeWithAttribute($targetParents, "akn_status", "removed");
				// $originalId = $firstTargetParent->getAttribute("parentOriginalId");
				// $parentId = ($originalId) ? $originalId : $firstTargetParent->getAttribute("parent");
				$parentId = $firstTargetParent->getAttribute("akn_currentId");
				$parentAttr = $firstTargetParent->getAttribute("parent");
				$idCond = ($parentId) ? "@akn_currentId = '$parentId' or $idCond" : $idCond;
				$parentIdCond = ($parentAttr) ? "@parent = '$parentAttr'" : "";
			}
		}

		if ($parentStatusRemoved) {
			//TODO check if nodes are siblings
			$oldNodes = $this->findOldNodes($parentStatusRemoved, $table);
			if ($this->removeSpaces($mod->old) == $this->removeSpaces($this->getTextFromNodes($oldNodes))) {
				$this->setAllAttribute($oldNodes, "class", "repeal");
				return;
			}
		}

		$destNodes = $xpath->query("//*[@class='oldVersion']//*[$idCond contains(@parent, '$mod->destination') or contains(@parentWid, '$mod->destination')]", $table);
		if (!$destNodes->length && $parentIdCond)
			$destNodes = $xpath->query("//*[@class='oldVersion']//*[$parentIdCond]", $table);
		if (!$destNodes->length && $parentWid)
			$destNodes = $xpath->query("//*[@class='oldVersion']//*[contains(@parent, '$parentWid')]", $table);
		// This may happen when the node is in quotedStructure so it hasn't parent or parentWid attributes
		if (!$destNodes->length && $parentWithWid) {
			$parentWid = $parentWithWid->getAttribute("akn_wId");
			$destNodes = $xpath->query("//*[@class='oldVersion']//*[@akn_currentId = '$parentWid']", $table);
			if (!$destNodes->length) {
				// May be that wId is to old, now we try to rebuild it combining wId and eId
				$parentWid = $this->rebuildwIdFromeId($parentWid, $parentWithWid->getAttribute("akn_eId"));
				$destNodes = $xpath->query("//*[@class='oldVersion']//*[@akn_currentId = '$parentWid']", $table);
			}
		}
		if($destNodes->length == 1 ) {
			if ( $parentStatusRemoved && $this->removeSpaces($mod->old) == $this->removeSpaces($destNodes->item(0)->textContent) ) {
				// Set as removed the entire element
				$this->setAllAttribute(array($destNodes->item(0)), "class", "repeal");
				return;
			}
			if($mod->old) {
				$repealNodes = $this->findAndwrapTextNode($mod->old, $destNodes, $mod->type, $mod->textBefore, $mod->textAfter);
				if($repealNodes === FALSE) {
					$this->setAllAttribute($targetNodes, "class", "errorRepeal");
					$this->setAllAttribute($targetNodes, "data-old", $mod->old);
				}	
			} else if($destNodes->length == 1) {
				$this->setAllAttribute($destNodes, "class", $mod->type);		
			}
		} else {
			$this->setAllAttribute($destNodes, "class", $mod->type);
		}
	}

	protected function getTextFromNodes($nodes) {
		$str = "";
		foreach ($nodes as $node) {
			$str.= $node->textContent;
		}
		return $str;
	}

	protected function removeSpaces($str) {
		$str = ($str) ? $str : "";
		$str = str_replace(chr(0xC2).chr(0xA0), " ", $str);
		$str = str_replace("&#160", " ", $str);
		$str = str_replace("&#xa0", " ", $str);
		$str = str_replace("&nbsp", " ", $str);
		return preg_replace('/\s/', '', trim($str));
	}

	protected function getNodeWithAttribute($nodes, $attr, $value=FALSE) {
		for($i = $nodes->length-1; $i >= 0; $i--) {
			if ($nodes->item($i)->hasAttribute($attr) && (!$value || $nodes->item($i)->getAttribute($attr) == $value) )
				return $nodes->item($i);
		}
		return FALSE;
	}

	protected function findOldNodes($node, $table, $id="") {
		$xpath = new DOMXPath($table->ownerDocument);
		$wId = $node->getAttribute("akn_wId");
		if ($wId) {
			$oldNodes = $this->nodeListToArray($xpath->query("(//*[@class='oldVersion']//*[@akn_wId='$wId' or @parentWid='$wId' or @akn_eId='$wId'])", $table));
			if (count($oldNodes)) return $oldNodes;
			$oldNodes = $this->findNodesContainPrentId($wId, $table);
			if (count($oldNodes)) {
				$filtered = $this->filterNodesParentAttr($oldNodes, $node->getAttribute('parent'));
				if (count($filtered)) return $filtered;
				return $oldNodes;
			}
		}

		$eId = (strlen($id)) ? $id : $node->getAttribute("akn_eId");
		if ($eId) {
			$oldNodes = $this->nodeListToArray($xpath->query("(//*[@class='oldVersion']//*[@akn_eId='$eId'])", $table));
			if (count($oldNodes)) return $oldNodes;
			$oldNodes = $this->findNodesContainPrentId($eId, $table);
			if (count($oldNodes)) {
				$filtered = $this->filterNodesParentAttr($oldNodes, $node->getAttribute('parent'));
				if (count($filtered)) return $filtered;
				return $oldNodes;
			}
		}
		return array();
	}


	protected function nodeListToArray($list) {
		$nodes = array();
		foreach ($list as $node) {
			$nodes[] = $node;
		}
		return $nodes;
	}

	protected function findNodesContainPrentId($id, $table) {
		$xpath = new DOMXPath($table->ownerDocument);
		$oldNodes = $xpath->query("//*[@class='oldVersion']//*[contains(@parent,'$id')]", $table);
		$returnNodes = array();
		foreach ($oldNodes as $node) {
			$parent = $node->getAttribute('parent');
			$parents = explode(" ", $parent);
			if (in_array($id, $parents))
				$returnNodes[] = $node;
		}
		return $returnNodes;
	}

	protected function filterNodesParentAttr($nodes, $parentAttr) {
		$eId = explode(" ", $parentAttr);
		$eId = $eId[0];
		$filtered = array();
		foreach ($nodes as $node) {
			$parenteId = explode(" ", $node->getAttribute('parent'));
			$parenteId = $parenteId[0];
			// Keep the node with similar ids
			if ( $this->rebuildwIdFromeId($eId, $parenteId) ==
					$this->rebuildwIdFromeId($parenteId, $eId)) {
				$filtered[] = $node;
			}
		}
		return $filtered;
	}

	protected function getFirstOldParent($nodes, $text, $table) {
		$xpath = new DOMXPath($table->ownerDocument);
		$query = "";
		for($i = $nodes->length-1; $i >= 0; $i--) {
			$id = $nodes->item($i)->getAttribute("akn_currentId");
			if ($id) {
				$oldNode = $xpath->query("(//*[@class='oldVersion']//*[@akn_currentId='$id'])[last()]", $table);
				if ($oldNode->length) {
					$txtNodes = $this->getTextNodesContaining($oldNode->item(0), $text);
					if (count($txtNodes))
						return $xpath->query("(./ancestor::*)[last()]", $txtNodes[0]);
				}
			}
		}
		return FALSE;
	}

	// This function tries to rebuild wId from an wId and eId
	protected function rebuildwIdFromeId($wid, $eid) {
		$widParts = explode("__", $wid);
		$eidParts = explode("__", $eid);
		$diff = array_diff($eidParts, $widParts);
		$newWidParts = $this->buildIdFromDiffArray($diff, array_merge($widParts), $wid);
		if ( count($newWidParts) == count($widParts) ) {
			$diff = array_diff($widParts, $eidParts);
			$newWidParts = $this->buildIdFromDiffArray($diff, $widParts, $wid);
		}
		return implode("__", $newWidParts);
	}

	protected function buildIdFromDiffArray($diff, $idParts, $id, $keepEqual = FALSE) {
		foreach ($diff as $key => $value) {
			if (!array_key_exists($key, $idParts)) continue;
			// If there are the same this means that eId doesn't have this part so remove it
			if ( $idParts[$key] ==  $value) 
				array_splice($idParts, $key, 1);
			else { // check if we need to value to wId
				$partsEl = explode("_",$value);
				$partsElWid = explode("_",$idParts[$key]);
				// adding only if the name of elements are different
				if ( $partsEl[0] != $partsElWid[0] && strpos($id, $partsEl[0]."_") === FALSE ) { 
					array_splice( $idParts, $key, 0, $value );
				}
			}
		}
		return $idParts;
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
		if(!$cellToInsert->getAttribute("blankcell"))
			$table->appendChild($this->wrapTd($table, $cellToInsert, $cellPosition));
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
		return $mods->length;
	}
	
	protected function prepareDocuments($doc1,$doc2) {
		
		/////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////
		
		$expression = '//doc:FRBRExpression/doc:FRBRdate';
				
		$uri = $doc1->documentElement->lookupnamespaceURI(NULL);	
		$xpath = new DOMXPath($doc1);
		$xpath->registerNamespace('doc', $uri);
		$xml_1_date = strtotime($xpath->evaluate($expression)->item(0)->getAttribute('date'));
	
		
		$uri = $doc2->documentElement->lookupnamespaceURI(NULL);		
		$xpath = new DOMXPath($doc2);
		$xpath->registerNamespace('doc', $uri);
		$xml_2_date = strtotime($xpath->evaluate($expression)->item(0)->getAttribute('date'));
		
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

		$this->newUrl = ($this->leftToRight) ? $this->doc1Url : $this->doc2Url;
		$this->oldUrl = ($this->leftToRight) ? $this->doc2Url : $this->doc1Url;

		$html = aknToHtml($this->xml_new,'data/AknToXhtml309.xsl');
		$this->html_new = new DOMDocument();
		$this->html_new->loadXML($html);
		
		$html = aknToHtml($this->xml_old,'data/AknToXhtml309.xsl');
		$this->html_old = new DOMDocument();
		$this->html_old->loadXML($html);
	}

	protected function getBodyNode($node) {
		$finder = new DomXPath($node);
		$docType = $this->getDocType($node);
		$bodyName = ($docType == 'doc') ? 'mainBody' : 'body';
		$bodyNode = $finder->query("//*[@class and contains(concat(' ', normalize-space(@class), ' '), ' $bodyName ')]");
		return $bodyNode->item(0);
	}

	protected function getDocType($node) {
		$finder = new DomXPath($node);
		$docClass = $finder->query("//*[*/@class = 'meta']/@class")->item(0)->value;
		$docClass = explode(" ", $docClass);
		return array_pop($docClass);
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
			
			$scriptNode = $html->createElement('script');
			//$scriptNode->nodeValue = "";
			$scriptNode->setAttribute('src', "js/afterRender.js");
			$headNode = $html->createElement('head');
			$headNode->appendChild($metaNode);
			$headNode->appendChild($styleNode);
			$headNode->appendChild($scriptNode);
			
			$body = $html->createElement('body');
			$body->setAttribute("onload", "addVisualizationLayouts()");
			
			///////////////////////////////////////////////////////
			///////////////////////////////////////////////////////
			///////////////////////////////////////////////////////
			
			$contentLeft = $this->getBodyNode($this->html_new);
			$contentRight = $this->getBodyNode($this->html_old);

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
			
			$numMods = $this->collectMods();
			if(!$numMods) {
				$div = $html->createElement('div');
				$div->setAttribute("class", "noMods");
				$div->nodeValue = "No modifies between these versions.";
				$body->appendChild($div);
			}
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
			$trNode = $this->tableDOM->createElement('tr');
			$this->tableRoot->appendChild($trNode);
			$this->bottomOfDocument($nodeLeft,$nodeRight,$trNode);
			
			$this->applyNotes($table);
			$this->finalCleanUp($table);

			$imported = $html->importNode($this->tableDOM->documentElement, TRUE);
			$root->appendChild($headNode);
			$body->appendChild($imported);
			$root->appendChild($body);
			$html->appendChild($root);
			$html->formatOutput = TRUE;

			if($this->edit) {
				$finder = new DomXPath($html);
				$first = $finder->query("//*[contains(@class, 'newVersion')]")->item(0);
				if($first) {
					$posInParent = $this->getPosInParent($first);
					$table = $finder->query("./ancestor::table", $first)->item(0);
					$trHeader = $html->createElement('tr');
					$tdOldHeader = $html->createElement('td');
					$tdNewHeader = $html->createElement('td');

					$tdOldHeader->setAttribute("url", $this->oldUrl);
					$tdOldHeader->setAttribute("class", "oldDocVersion");
					$tdOldHeader->setAttribute("style", "display:none;");
					$tdNewHeader->setAttribute("url", $this->newUrl);
					$tdNewHeader->setAttribute("class", "newDocVersion");
					$tdNewHeader->setAttribute("style", "display:none;");

					if($posInParent) {
						$trHeader->appendChild($tdOldHeader);
						$trHeader->appendChild($tdNewHeader);
					} else {
						$trHeader->appendChild($tdNewHeader);
						$trHeader->appendChild($tdOldHeader);
					}

					$table->appendChild($trHeader);
				}
			}
			
			echo $html->saveHTML();
		}
	}
}
