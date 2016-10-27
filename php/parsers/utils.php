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
 

function importJson($filePath) {
	$content = file_get_contents($filePath);
	return json_decode($content, true);
}

function resolveRegex($value, $configArray,$lang,$documentType, $directory = "") {
	$keyRe  = "/\{\{(\w+)#?(\w+)?\}\}/";
	$directory = empty($directory) ? getcwd() : $directory;
	//if (!file_exists($directory . "/lang/" . $lang . "/" . $documentType)
	//or $directory . "/docType/" . $documentType) $documentType = "bill";
	
	if(is_array($value)) {
		$value = array_map('trim',$value);
		return Array('value' => implode("|", $value));
	}
	
	$flags = Array();
	$success = 	preg_match_all($keyRe, $value, $result);
	if ($success) {
		foreach($result["0"] as $k => $toBeReplaced) {
			
			$keyword = $result["1"][$k];
			if (strlen($result["2"][$k])) {
				$flags[$keyword] = $result["2"][$k];
			}
			
			if(array_key_exists($keyword, $configArray)) {
				$resolved = resolveRegex($configArray[$keyword], $configArray,
										 $lang,$documentType, $directory);
			} else {
				// get parser's configuration by document language
				$standardLang = array(
					"spa" => "esp"
				);
				$lang = array_key_exists($lang, $standardLang) ? $standardLang[$lang] : $lang;
				///////////////////////////////////////////////////
				
				$localFileName = $directory . "/lang/" . $lang . "/" . $documentType . "/" . $keyword;
				$localFileName2 = $directory . "/lang/" . $lang . "/" . $keyword;
				if(file_exists($localFileName)) {
					$resolved = resolveRegex(file($localFileName),
											 $configArray,$lang,$documentType, $directory);
											 
				} else if(file_exists($localFileName2)) {
					$resolved = resolveRegex(file($localFileName2),
											 $configArray,$lang,$documentType, $directory);				 
				} else {
					$commonFileName = $directory . "/../common/lang/" . $lang . "/" . $keyword;
					if(file_exists($commonFileName)) {
						$resolved = resolveRegex(file($commonFileName),
												 $configArray,$lang,$documentType, $directory);
					}
				}
			}
				
			if(isset($resolved['flags'])) {
				$flags = array_merge($flags,$resolved['flags']);	
			}
			if(isset($resolved['value'])) {
				$regexPart = sprintf("(?P<%s>%s)", $keyword, $resolved['value']);
				$value = str_replace($toBeReplaced, $regexPart, $value);
				//$value = resolveRegex($value, $configArray,$lang,$documentType, $directory);
				//$value = $value['value'];
			}
		}
	}

	$resolved = Array('value' => $value);
	if(count($flags)) $resolved['flags'] = $flags;
	//print_r($resolved);
	return $resolved;
}

function arrayToPairsArray($array,$max) {
	$result = array();
	for($i = 0; $i < count($array); $i++) {
		$pair = array();
		$pair[0] = $array[$i];
		if($i == count($array)-1) {
			$pair[1] = $max;
		} else {
			$pair[1] = $array[$i+1]; 
		}
		$result[] = $pair;
	}
	return $result;
}

function importParserConfiguration($lang, $documentType, $directory = "") {
	
	$parserRules = Array();
	$directory = empty($directory) ? getcwd() : $directory;
	// get parser's common configuration
	$filename = $directory . "/../common/conf.php";
	//if (!file_exists($directory . "/lang/" . $lang . "/" . $documentType)
	//	or $directory . "/docType/" . $documentType) $documentType = "bill";

	if (file_exists($filename)) {
		require_once($filename);
		$parserRules = array_merge($parserRules, $rules);
	}
	
	// get parser's standard configuration
	$filename = $directory . "/conf.php";
	if (file_exists($filename)) {
		require_once($filename);
		$parserRules = array_merge($parserRules, $rules);
	}
	
	// get parser's configuration by document type
	$filename = $directory . "/docType/" . $documentType . "/conf.php";
	if (file_exists($filename)) {
		require_once($filename);
		$parserRules = array_merge($parserRules, $rules);
	}
	
	// get parser's configuration by document language
	$standardLang = array(
		"spa" => "esp"
	);
	$lang = array_key_exists($lang, $standardLang) ? $standardLang[$lang] : $lang;
	///////////////////////////////////////////////////
	
	$filename = $directory . "/lang/" . $lang . "/conf.php";
	if (file_exists($filename)) {
		require_once($filename);
		$parserRules  = array_merge($parserRules, $rules);
	}
	$filename = $directory . "/lang/" . $lang . "/" . $documentType . "/conf.php";
	if (file_exists($filename)) {
		require_once($filename);
		$parserRules  = array_merge($parserRules, $rules);
	}
	
	return $parserRules;
}


function toXml($data, $r = 'data', &$xml = null) {
	if (ini_get('zend.ze1_compatibility_mode') == 1) {
		ini_set('zend.ze1_compatibility_mode', 0);
	}

	if (is_null($xml) || !isset($xml)) {
		$xml = simplexml_load_string("<?xml version='1.0' encoding='utf-8'?><" . $r . "/>");
	}

	foreach ($data as $key => $value) {
		if (is_numeric($key)) {
			$key = $r;
		}
		$key = preg_replace('/[^a-z0-9\-\_\.\:]/i', '', $key);
		if (is_array($value)) {
			$node = isAssoc($value) ? $xml -> addChild($key) : $xml;
			toXml($value, $key, $node);
		} else {
			$value = htmlentities($value);
			$xml -> addChild($key, $value);
		}
	}
	return $xml;
}

function isAssoc($array) {
	return (is_array($array) && 0 !== count(array_diff_key($array, array_keys(array_keys($array)))));
}

function debug($t, $debug, $debugInfo) {
	if ($debug) {
		if (!isset($debugInfo))
			$debugInfo = array();
		//		echo $t."\n" ;
		array_push($debugInfo, $t);
	}
}

if (!function_exists('http_response_code')) {
    function http_response_code($code = NULL) {

        if ($code !== NULL) {

            switch ($code) {
                case 100: $text = 'Continue'; break;
                case 101: $text = 'Switching Protocols'; break;
                case 200: $text = 'OK'; break;
                case 201: $text = 'Created'; break;
                case 202: $text = 'Accepted'; break;
                case 203: $text = 'Non-Authoritative Information'; break;
                case 204: $text = 'No Content'; break;
                case 205: $text = 'Reset Content'; break;
                case 206: $text = 'Partial Content'; break;
                case 300: $text = 'Multiple Choices'; break;
                case 301: $text = 'Moved Permanently'; break;
                case 302: $text = 'Moved Temporarily'; break;
                case 303: $text = 'See Other'; break;
                case 304: $text = 'Not Modified'; break;
                case 305: $text = 'Use Proxy'; break;
                case 400: $text = 'Bad Request'; break;
                case 401: $text = 'Unauthorized'; break;
                case 402: $text = 'Payment Required'; break;
                case 403: $text = 'Forbidden'; break;
                case 404: $text = 'Not Found'; break;
                case 405: $text = 'Method Not Allowed'; break;
                case 406: $text = 'Not Acceptable'; break;
                case 407: $text = 'Proxy Authentication Required'; break;
                case 408: $text = 'Request Time-out'; break;
                case 409: $text = 'Conflict'; break;
                case 410: $text = 'Gone'; break;
                case 411: $text = 'Length Required'; break;
                case 412: $text = 'Precondition Failed'; break;
                case 413: $text = 'Request Entity Too Large'; break;
                case 414: $text = 'Request-URI Too Large'; break;
                case 415: $text = 'Unsupported Media Type'; break;
                case 500: $text = 'Internal Server Error'; break;
                case 501: $text = 'Not Implemented'; break;
                case 502: $text = 'Bad Gateway'; break;
                case 503: $text = 'Service Unavailable'; break;
                case 504: $text = 'Gateway Time-out'; break;
                case 505: $text = 'HTTP Version not supported'; break;
                default:
                    exit('Unknown http status code "' . htmlentities($code) . '"');
                break;
            }

            $protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');

            header($protocol . ' ' . $code . ' ' . $text);

            $GLOBALS['http_response_code'] = $code;

        } else {

            $code = (isset($GLOBALS['http_response_code']) ? $GLOBALS['http_response_code'] : 200);

        }

        return $code;
    }
}
		
?>