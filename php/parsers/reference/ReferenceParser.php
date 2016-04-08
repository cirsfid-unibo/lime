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

require_once(dirname(__FILE__)."/../utils.php");
require_once(dirname(__FILE__)."/../date/DateParser.php");

class ReferenceParser {
    
    public $lang, $docType;
    private $parserRules = array();
    
    public function __construct($lang, $docType) {
        $this->lang = $lang;
        $this->docType = $docType;
        $this->dirName = dirname(__FILE__);

        $this->loadConfiguration();
    }

    public function parse($content, $jsonOutput = FALSE) {
    	$return = array();
    	if($this->lang && $this->docType && !empty($this->parserRules)) {
    		$references = $this->parserRules['references'];
	
			foreach($references as $ref) {
				$resolved = resolveRegex($this->parserRules[$ref],$this->parserRules,$this->lang, $this->docType, $this->dirName);
				$success = 	preg_match_all($resolved["value"], $content, $result, PREG_OFFSET_CAPTURE);
				if ($success) 
					for ($i = 0; $i < $success; $i++) {
						$match = trim($result[0][$i][0], ", ");
						$offset = $result[0][$i][1];
						$entry = Array(
							"ref" => $match,
							"start" => $offset,
							"end" => $offset+strlen($match),
							"regex" => $ref,
							);
						
						if (array_key_exists("fragment", $result)) {
							if(is_array($result["fragment"])) {
								$entry["fragment"] = $result["fragment"][$i][0];
							}
						}

						if (array_key_exists("type", $result)) {
							if(is_array($result["type"])) {
								$entry["type"] = $result["type"][$i][0];
							}
						}
						
						if (array_key_exists("num", $result)) {
							//$entry["num"] = $result["num"][$i][0];

							$fragment = $result["fragment"][$i][0];
							foreach (array_reverse($this->parserRules['partition_type']) as $key => $list) {
								for($j=0; $j<count($list); $j++) {
									$sub_fragment = explode($list[$j], $fragment);
									if (count($sub_fragment) > 1) {
										$result_array = Array($key => array_map('trim', array_filter(preg_split('/(?: +e +|, +)/', $sub_fragment[1]))));
										$entry["num"][] = $result_array;
										$fragment = $sub_fragment[0];
									}
								}
							}
						}
						
						if (array_key_exists("docnum", $result)) {
							if(is_array($result["docnum"])) {
								$entry["docnum"] = $result["docnum"][$i][0];
							}
						}
						
						if (array_key_exists("date", $result)) {
							$date = $this->requestDate($result["date"][$i][0]);
							if(array_key_exists("dates", $date['response'])) {
								$date = $date['response']['dates'];
								if(!empty($date)) {
									$last = end($date);
									$entry["date"] = $last['date'];		
								}
							}
						}
						
						$return[] = $entry;
					}
			}
    	} else {
			$return = Array('success' => FALSE);
		}

        $ret = array("response" => $return);
        if($jsonOutput) {
            return json_encode($ret);    
        } else {
            return $ret;
        }
    }

	private function requestDate($content) {
		$parser = new DateParser($this->lang);
        return $parser->parse($content);
	}

    private function loadConfiguration() {
        $this->parserRules = importParserConfiguration($this->lang,$this->docType, $this->dirName);
    }
}

?>