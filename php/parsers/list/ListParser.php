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

class ListParser {
    
    public $lang;
    private $patterns = array();
    
    public function __construct($lang) {
        $this->lang = $lang;
        $this->loadConfiguration($lang);
    }

    public function parse($content, $jsonOutput = FALSE) {
        $return = array();
		$preg_result = array();
		$element = array();
		$success = false ;
		while (!$success && $element = each($this->patterns)) {
			$success = 	preg_match_all($element['value'], $content, $n) ;
		}
		
		if ($success) {
				$return['items']=array();
				$tmpResult = array();
				$matches = $n['0'];
				for($i=0;$i<count($matches);$i++){
					$tmp = array();
					$match = $matches[$i];
					$myPos = strpos($content,$match);
					$myStr = '';
					if($i+1<count($matches)){
						$nextPos = strpos($content,$matches[$i+1]);	
						$len = $nextPos-$myPos;
						$myStr = substr($content,$myPos,$len);
						$tmp['len'] = $nextPos-$myPos;
					}else{
						$myStr = substr($content,$myPos);
					}
					$tmp['str'] = $myStr;
					$tmp['pos'] = $myPos;
					$tmp['match'] = $match;
					
					$tmpResult[] = $tmp;
					
					$return['items'][] = array("match" => $match, "str" => $myStr);
				}
				
				$intro = substr($content,0,$tmpResult[0]['pos']);
				if($intro != ""){
					$return['intro'] = $intro;
				}
		}

        $ret = array("response" => $return);
        if($jsonOutput) {
            return json_encode($ret);    
        } else {
            return $ret;
        }
    }

    public function loadConfiguration() {
        global $patterns, $monthsNames,$monthsNamesExceptions; 
        $vocs = array("ita" => "italian.php", 
                      "eng" => "english.php", 
                      "esp" => "espanol.php", 
                      "spa" => "espanol.php",);
        
        $day = "(\d){1,2}";
		$year = "(\d){4}";
		$num_month = "(\d){1,2}";

		require_once "standard.php" ;
		/*debug("Loaded standard vocabulary") ;
		if (isset($vocs[$voc])) { 
			require_once $vocs[$voc] ;
			debug("Loaded ".$voc." vocabulary") ;
		}
		 */
		$digit = "(?:\d+[-]?\w*)";
		//$roman = "(?i:M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))"; questo è giusto ma fa match anche con la stringa vuota
		$roman = "(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})";
		//$roman = "(?i:[IVXLCDM]+)";
		//$number = "$digit|$roman";
		$number = $digit;

		$patterns = array( 
			"num"			=> "/[\(\[]?(?P<num>(($number)(?:\s*[e,]\s*$number))|$number)\s*[\)\]]/i",
			"letter"		=> "/[\(\[]?(?P<letter>[a-zA-Z]+)\s*[\)\]]/i"
		);

		if (isset($localpatterns)) {
			$patterns = array_merge($localpatterns,$patterns);
		}

        $this->patterns = $patterns;
    }
}

?>