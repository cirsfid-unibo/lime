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
class Proxies_Services_XmlValidation implements Proxies_Services_Interface {
	// the XML source
	private $_source;
	private $_schema;

	/**
	 * The constructor of the service
	 * @return the service object
	 * @param Array the params that are passed to the service
	 */
	public function __construct($params) {
		// save the XML
		$this -> _source = $params['source'];
		$this -> _schema = $params['schema'];
	}

	/**
	 * this method is used to retrive the result by the service
	 * @return The result that the service computed
	 */
	public function getResults() {
		libxml_use_internal_errors(true);
		$result = Array();
		$internalSchemaPath = ($this -> _schema) ? realpath(LIMEROOT . '/' . $this -> _schema) : NULL;
		// creates the URL of the curl with the address and the parameters

		$dom = new DOMDocument();

		try {
			if ($dom -> loadXML($this -> _source)) {
				if ($internalSchemaPath) {
					if (!$dom -> schemaValidate($internalSchemaPath)) {
						$result = $this -> libxmlGetErrors($this -> _source);
					}
					$result["started"] = true;
				} else {
					$result["started"] = false;
					$result["msg"] = "Cannot find schema file";
				}
			} else {
				$result["started"] = false;
				$result["msg"] = "Cannot find schema file";
			}
		} catch (Exception $e) {
			$result["started"] = false;
			$result["msg"] = "Cannot load xml source";
		}

		// return the results
		return str_replace('\/', '/', json_encode($result));
	}

	private function libxmlErrorToArray($error) {
		$result = Array();
		$result["message"] = $error -> message;
		$result["code"] = $error -> code;
		$result["line"] = $error -> line;
		$result["column"] = $error -> column;
		switch ($error->level) {
			case LIBXML_ERR_WARNING :
				$result["type"] = "warning";
				break;
			case LIBXML_ERR_ERROR :
				$result["type"] = "error";
				break;
			case LIBXML_ERR_FATAL :
				$result["type"] = "fatal_error";
				break;
		}

		return $result;
	}

	private function libxmlGetErrors($xmlString) {
		$xmlLines = explode("\n", $xmlString);
		$errors = libxml_get_errors();
		$result = Array("error" => Array(), "fatal_error" => Array(), "warning" => Array());
		$tmpRes = Array();
		foreach ($errors as $error) {
			$tmpRes = $this -> libxmlErrorToArray($error);
			$tmpRes["lineString"] = trim($xmlLines[$tmpRes["line"] - 1]);
			$result[$tmpRes["type"]][] = $tmpRes;
		}
		libxml_clear_errors();
		return $result;
	}

	/** Prettifies an XML string into a human-readable and indented work of art
	 *  from http://gdatatips.blogspot.it/2008/11/xml-php-pretty-printer.html
	 *  @param string $xml The XML as a string
	 *  @param boolean $html_output True if the output should be escaped (for use in HTML)
	 */
	private function xmlpp($xml, $html_output = false) {
		$xml_obj = new SimpleXMLElement($xml);
		$level = 4;
		$indent = 0;
		// current indentation level
		$pretty = array();

		// get an array containing each XML element
		$xml = explode("\n", preg_replace('/>\s*</', ">\n<", $xml_obj -> asXML()));

		// shift off opening XML tag if present
		if (count($xml) && preg_match('/^<\?\s*xml/', $xml[0])) {
			$pretty[] = array_shift($xml);
		}

		foreach ($xml as $el) {
			if (preg_match('/^<([\w])+[^>\/]*>$/U', $el)) {
				// opening tag, increase indent
				$pretty[] = str_repeat(' ', $indent) . $el;
				$indent += $level;
			} else {
				if (preg_match('/^<\/.+>$/', $el)) {
					$indent -= $level;
					// closing tag, decrease indent
				}
				if ($indent < 0) {
					$indent += $level;
				}
				$pretty[] = str_repeat(' ', $indent) . $el;
			}
		}
		$xml = implode("\n", $pretty);
		return ($html_output) ? htmlentities($xml) : $xml;
	}

}
