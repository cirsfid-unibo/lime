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
require_once(dirname(__FILE__)."/../doctype/DocTypeParser.php");
require_once(dirname(__FILE__)."/../authority/AuthorityParser.php");



class CoverPageParser {
    
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

    		$entry = Array();
		    $date = $this->requestDate($content);
			if(array_key_exists("dates", $date['response'])) {
				$date = $date['response']['dates'];
			
				if(!empty($date)) {
					$last = end($date);
					$entry["date"] = $last;
				}
			
			}

		
			$doctype = $this->requestDocType($content);
			if(!empty($doctype['response'])) {
				$doctype = $doctype['response'];
				$entry["doctype"] = $doctype;
			}

			$authority = $this->requestAuthority($content);
			if(!empty($authority['response'])) {
				$authority = $authority['response'];
				$entry["authority"] = $authority;
			}

			$return[] = $entry;

    	} else  $return = Array('success' => FALSE);

        $ret = array("response" => $return);
        if($jsonOutput)  return json_encode($ret);    
        else return $ret;
  
    }

	private function requestDate($content) {
		$parser = new DateParser($this->lang);
        return $parser->parse($content);
	}

	private function requestDocType($content) {
		$parser = new DocTypeParser($this->lang,$this->docType);
		return $parser->parse($content);
	}

	private function requestAuthority($content) {
		$parser = new AuthorityParser($this->lang,$this->docType);
		return $parser->parse($content);
	}

    private function loadConfiguration() {
        $this->parserRules = importParserConfiguration($this->lang,$this->docType, $this->dirName);
    }
}

?>