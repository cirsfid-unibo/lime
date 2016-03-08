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

class CollectionParser {
    
    public $lang, $docType;
    private $parserRules = array();
    
    public function __construct($lang, $docType) {
        $this->lang = $lang;
        $this->docType = $docType;
        $this->dirName = dirname(__FILE__);

        $this->loadConfiguration();
    }

    private function getChildren($collection,$content) {
        $resolved_children = resolveRegex($this->parserRules['children'],$this->parserRules,$this->lang, $this->docType, $this->dirName);
        $children = Array();
        if (count($collection) > 2) array_shift($collection);
        if (count($collection) == 2) {
            $fragment = substr($content,$collection[0],$collection[1]-$collection[0]);
            $success_children =  preg_match_all($resolved_children["value"], $fragment, $result_children, PREG_OFFSET_CAPTURE);
            for ($j = 0; $j < $success_children; $j++) {
                $match_child = $result_children[0][$j][0];
                $offset_child = $result_children[0][$j][1];
                //////////////////////////////////////////////////////////////////////
                //////////////////////////////////////////////////////////////////////
                //// GET ANNEXES /////////////////////////////////////////////////////
                $works[] = $offset_child;
                $annexes = $this->getAnnexes($works,$fragment);
                //////////////////////////////////////////////////////////////////////
                //////////////////////////////////////////////////////////////////////
                $entry_child = Array(
                    "header" => $match_child,
                    "start" => $offset_child,
                    "end" => $offset_child+strlen($match_child)
                );
                if (count($annexes)) $children[$j-1]['annexes'] = $annexes;
                $children[] = $entry_child;
            }
        }
        return $children;
    }

    private function getAnnexes($works,$fragment) {
        $resolved_annex = resolveRegex($this->parserRules['annexes'],$this->parserRules,$this->lang, $this->docType, $this->dirName);
        $annexes = Array();
        if (count($works) > 2) array_shift($works);
        if (count($works) == 2) {
            $fragment_work = substr($fragment,$works[0],$works[1]-$works[0]);
            $success_annexes =  preg_match_all($resolved_annex["value"], $fragment_work, $result_annexes, PREG_OFFSET_CAPTURE);
            for ($k = 0; $k < $success_annexes; $k++) {
                $match_annex = $result_annexes[0][$k][0];
                $offset_annex = $result_annexes[0][$k][1];
                $entry_annex = Array(
                    "header" => $match_annex,
                    "start" => $offset_annex,
                    "end" => $offset_annex+strlen($match_annex)
                );
                $annexes[] = $entry_annex;
            }
        }
        return $annexes;
    }

    public function parse($content, $jsonOutput = FALSE) {
        $return = array();
		if($this->lang && $this->docType && !empty($this->parserRules)) {
			$resolved = resolveRegex($this->parserRules['main'],$this->parserRules,$this->lang, $this->docType, $this->dirName);
			$success = 	preg_match_all($resolved["value"], $content, $result, PREG_OFFSET_CAPTURE);
			if ($success) {
                // adding end of document/////////////////////////////////////////////////////////
                $result[0][$success][0] = 'EOF';
                $result[0][$success][1] = strlen($content);
                $success++;
                //////////////////////////////////////////////////////////////////////////////////
                //// COLLECTION //////////////////////////////////////////////////////////////
                $collection = Array();
				for ($i = 0; $i<$success; $i++) {
                    $match = $result[0][$i][0];
                    $offset = $result[0][$i][1];
                    //////////////////////////////////////////////////////////////////////////////
                    //// GET CHILDREN ////////////////////////////////////////////////////////////
                    $collection[] = $offset;
                    $children = $this->getChildren($collection,$content);
                    //////////////////////////////////////////////////////////////////////////////
                    //////////////////////////////////////////////////////////////////////////////
                    $entry = Array (
                        "header" => $match,
                        "start" => $offset,
                        "end" => $offset+strlen($match)
                    );
                    if (count($children)) $return[$i-1]['children'] = $children;
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

    public function loadConfiguration() {
        $this->parserRules = importParserConfiguration($this->lang,$this->docType, $this->dirName);
    }
}

?>