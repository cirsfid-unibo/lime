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
require_once('date/DateParser.php');
require_once('docNum/DocNumParser.php');
require_once('list/ListParser.php');
require_once('doctype/DocTypeParser.php');
require_once('quote/QuoteParser.php');
require_once("body/BodyParser.php");
require_once("structure/StructureParser.php");
require_once("reference/ReferenceParser.php");

class MetaParser {
    
    public $lang, $docType, $content;
    
    public function __construct($lang, $docType, $content) {
        $this->lang = $lang;
        $this->docType = $docType;
        $this->content = $content;
    }

    public function parseDocument() {
        $return = array();

        $dateRes = $this->parseDate();
        $structureRes = $this->parseStructure();
        $bodyRes = $this->parseBody();
        $quoteRes = $this->parseQuote();
        $referenceRes = $this->parseReference();
        $docRes = $this->parseDocNum();
        $docTypeRes = $this->parseDocType();

        //print_r($structureRes);

        $this->handleParserDocTypeResult($docTypeRes, $return);
        $this->handleParserDocNumResult($docRes, $return);
        $this->handleParserRefResult($referenceRes, $return);
        $this->handleParserQuoteResult($quoteRes, $return);
        $this->handleParserStructureResult($structureRes, $return);
        $this->handleParserDateResult($dateRes, $return);

        $this->handleParserBodyResult($bodyRes, $return);

        $this->normalizeOffsets($return);
        return json_encode($return);
    }

    public function parseStructure() {
        $parser = new StructureParser($this->lang, $this->docType);
        return $parser->parse($this->content);
    }

    public function parseBody() {
        $parser = new BodyParser($this->lang, $this->docType);
        return $parser->parse($this->content);
    }

    public function parseQuote() {
        $parser = new QuoteParser($this->lang, $this->docType);
        return $parser->parse($this->content);
    }

    public function parseList() {
        $parser = new ListParser($this->lang);
        return $parser->parse($this->content);
    }

    public function parseReference() {
        $parser = new ReferenceParser($this->lang, $this->docType);
        return $parser->parse($this->content);
    }

    public function parseDocNum() {
        $parser = new DocNumParser($this->lang);
        return $parser->parse($this->content);
    }

    public function parseDate() {
        $parser = new DateParser($this->lang);
        return $parser->parse($this->content);
    }

    public function parseDocType() {
        $parser = new DocTypeParser($this->lang, $this->docType);
        return $parser->parse($this->content);
    }

    private function handleParserResult($name, $result, &$completeResult) {
        $completeResult[$name] = $result;
    }

    private function handleParserDocTypeResult($result, &$completeResult) {
        foreach ($result["response"] as $match) {
            $completeResult[] = array_merge(Array("name"=> "docType"), $match);
        }
    }

    private function handleParserDocNumResult($result, &$completeResult) {
        foreach ($result["response"] as $match) {
            $match["string"] = $match["match"];
            unset($match["match"]);
            $completeResult[] = array_merge(Array("name"=> "docNum"), $match);
        }
    }

    private function handleParserRefResult($result, &$completeResult) {
        foreach ($result["response"] as $match) {
            $match["string"] = $match["ref"];
            unset($match["ref"]);
            $completeResult[] = array_merge(Array("name"=> "ref"), $match);
        }
    }

    private function handleParserQuoteResult($result, &$completeResult) {
        foreach ($result["response"] as $match) {
            $completeResult[] = Array("name"=> "quotedText",
                                      "start" => $match["start"]["offset"],
                                      "end" => $match["end"]["offset"]+strlen($match["end"]["string"]),
                                      "string" => $match["quoted"]["string"]);
            /*"startQuote" => $match["start"]["string"],
            "endQuote" => $match["end"]["string"],*/
        }
    }

    private function handleParserDateResult($result, &$completeResult) {
        if(array_key_exists("dates", $result["response"])) {
            foreach ($result["response"]["dates"] as $key => $match) {
                foreach($match["offsets"] as $offset) {
                    $completeResult[] = Array("name"=> "date",
                                               "string" => $match["match"],
                                               "date" => $match["date"],
                                               "start" => $offset["start"],
                                               "end" => $offset["end"]);
                }
            }    
        }
    }

    private function handleParserStructureResult($result, &$completeResult) {
        $tmpArray = Array();
        if($result["response"]["success"]) {
            foreach($result["response"]["structure"] as $key => $element) {
                $newElement = Array("name"=> $element,
                                   "string" => (array_key_exists("value", $result["response"][$element])) 
                                               ? $result["response"][$element]["value"] : "",
                                   "end" => (array_key_exists("end", $result["response"][$element])) 
                                               ? $result["response"][$element]["end"] : "");
                if(!empty($newElement["string"]) && empty($tmpArray)) {
                    $newElement["start"] = 0;
                } else {
                    $lastElement = end($tmpArray);
                    if(!empty($lastElement["string"])) {
                        $newElement["start"] = $lastElement["end"];
                    }
                    if($key == (count($result["response"]["structure"])-1)) {
                        $newElement["end"] = strlen($this->content);
                    }
                }
                if(array_key_exists("start", $newElement)) {
                    $tmpArray[] = $newElement;
                    $completeResult[] = $newElement;
                }
            }
        }
    }

    private function handleParserBodyResult($result, &$completeResult) {
        foreach ($result["response"] as $elementName => $elements) {
            $nums = Array();
            foreach ($elements as $element) {
                $newElement = Array("name"=> "num",
                                          "string" => $element["value"],
                                          "start" => $element["start"],
                                          "end" => $element["start"]+strlen($element["value"]));
                $nums[] = $newElement;
                $completeResult[] = $newElement;
            }
            foreach ($nums as $key => $num) {
                $parent = $this->getElementParent($num, $completeResult);
                $parentIndex = array_search($parent, $completeResult);
                if($parent["name"] == "quotedText") {
                    $completeResult[$parentIndex]["name"] = "quotedStructure";
                }
                $end = $parent["end"];
                if(array_key_exists($key+1, $nums)) {
                    $parentNext = $this->getElementParent($nums[$key+1], $completeResult);
                    if($parentNext === $parent) {
                        $end = $nums[$key+1]["start"];
                    } else {
                        $nextSibling = $this->getElementWithSameParent($num, $parent, $completeResult);
                        if(!empty($nextSibling)) {
                            $end = $nextSibling[0]["start"];
                        }
                    }
                }
                if($end != 0) {
                    $newElement = Array("name"=> $elementName,
                                    "start" => $num["start"],
                                    "end" => $end);
                    $completeResult[] = $newElement;    
                }
                
            }
        }
    }

    private function getElementWithSameParent($element, $parent, $completeResult) {
        $elements = array_filter($completeResult, function($res) use ($element, $parent, $completeResult)  {
            return ($res != $element && $res["name"] == $element["name"]);
        });
        $siblings = Array();
        foreach ($elements as $el) {
            $parentNext = $this->getElementParent($el, $completeResult);
            if($parentNext === $parent) {
                $siblings[] = $el;
            }
        }
        return $siblings;
    }

    private function getElementParent($element, $completeResult) {
        $parents = array_filter($completeResult, function($res) use ($element)  {
            return ($res != $element && $res["start"] <= $element["start"] && $res["end"]>=$element["end"]);
        });
        usort($parents , function($a, $b) use ($element) {
            if ($a == $b) {
                return 0;
            }
            return ($a["end"] < $b["end"]) ? -1 : 1;
        });

        return (!empty($parents)) ? $parents[0] : NULL; 
    }

    private function normalizeOffsets(&$completeResult) {
        $encoding = mb_detect_encoding($this->content);
        foreach ($completeResult as &$element) {
            $subStr = substr($this->content, 0, $element["start"]);
            $element["start"] = mb_strlen($subStr, $encoding);
            $subStr = substr($this->content, 0, $element["end"]);
            $element["end"] = mb_strlen($subStr, $encoding);
        }
    }
}

?>