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

require_once(dirname(__FILE__) . '/../config.php');

class DBInterface {
	
	private $_exist, $_HTTPCredential;
	
	public function __construct($exist,$HTTPCredential) {
		$this->_exist = trim($exist,"/") . "/rest/";
		$this->_HTTPCredential = $HTTPCredential;
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
		
	private function check_result($result, $expression,$value_to_check) {
		$response = TRUE;
		if($result) {
			$resultDOM = new DOMDocument();
			$resultDOM->loadXML($result);		
			$xpath = new DOMXPath($resultDOM);
			$resultExp = $xpath->evaluate($expression);
			
			if($resultExp != $value_to_check) $response = FALSE;
			
		} else $response = FALSE;
		return $response;
	}
	
	private function unwrap_xml($xmlResult) {
		$xmlResult = preg_replace ( '/<exist:result.+>/i' , '', $xmlResult);
		$xmlResult = preg_replace ( '/<\/exist:result>/i' , '', $xmlResult);
		return trim($xmlResult);
	}
	
		
	private function exec_query($params, $text, $variables=NULL) {
	
		$query_params = http_build_query($params);
		$query_text = file_get_contents(dirname(__FILE__) . '/../query/query.xml');
		$query_text = str_replace ('[__TEXT__]',$text, $query_text);
		if($variables) $query_text = str_replace ('[__VARIABLES__]',$this->build_variables($variables), $query_text);
		else $query_text = str_replace ('[__VARIABLES__]','', $query_text);
		$query_url = $this->_exist.'?'.$query_params;
		
		$ch = curl_init($query_url);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt ($ch, CURLOPT_HTTPHEADER, Array("Content-Type: application/xml"));
		curl_setopt($ch, CURLOPT_POSTFIELDS, $query_text);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_USERPWD, $this->_HTTPCredential);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT ,5); 
		curl_setopt($ch, CURLOPT_TIMEOUT, 400);
		$result = curl_exec($ch);
		curl_close ($ch);

		return $result;
	}
	
	private function build_variables($params) {
		$VARIABLE = '<variable xmlns:sx="http://exist-db.org/xquery/types/serialized">
	<qname><localname>[__NAME__]</localname></qname>
	<sx:sequence><sx:value type="xs:string"><![CDATA[ [__VALUE__] ]]></sx:value></sx:sequence>
</variable>';

		$variables = array();
		foreach($params as $key=>$value) {
			$variable = 
			$variables[] = str_replace('[__VALUE__]', $value,
									   str_replace ('[__NAME__]', $key, $VARIABLE));
		}
		return '<variables>' . implode($variables) . '</variables>';
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
			
	public function delete_user($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/delete_user.xql'); 
		return $this->exec_query($params, $text);
	}

	public function get_document_content($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/get_document_content.xql'); 
		return $this->unwrap_xml($this->exec_query($params, $text));
	}
	
	public function get_document_metadata($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/get_document_metadata.xql'); 
		return $this->unwrap_xml($this->exec_query($params, $text));
	}
	
	public function get_documents($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/get_documents.xql'); 
		return $this->unwrap_xml($this->exec_query($params, $text));
	}
		
	public function list_documents($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/list_documents.xql'); 
		return $this->exec_query($params, $text);
	}
	
	public function save_document_html($params,$variables) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/save_document_html.xql'); 
		return $this->unwrap_xml($this->exec_query($params, $text, $variables));
	}
	
	public function save_image($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/save_image.xql'); 
		return $this->exec_query($params, $text);
	}
	
	public function user_manager($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/user_manager.xql'); 
		return $this->unwrap_xml($this->exec_query($params, $text));
	}
	
	public function user_preferences($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/user_preferences.xql'); 
		return $this->unwrap_xml($this->exec_query($params, $text));
	}
		
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////
	
	public function create_collection($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/create_collection.xql'); 
		return $this->exec_query($params, $text);
	}
	
	public function create_group($params) {
		$text = file_get_contents(dirname(__FILE__) . '/../query/create_group.xql'); 
		return $this->exec_query($params, $text);
	}	

	public function init_db() {
		$params = array('collectionName' => EXIST_USERS_DOCUMENTS_COLLECTION);
		$result = $this->create_collection($params);
		print_r($result);
		$checkResult = $this->check_result($result, 'string(/exist:result/exist:value/text())', 
										   EXIST_USERS_DOCUMENTS_COLLECTION);
		
		$params = array('collectionName' => EXIST_USERS_PREFERENCES_COLLECTION);
		$result = $this->create_collection($params);
		$checkResult = $checkResult && $this->check_result($result, 'string(/exist:result/exist:value/text())',
														   EXIST_USERS_PREFERENCES_COLLECTION);
		
		$params = array('collectionName' => EXIST_SAMPLE_DOCUMENTS_COLLECTION);
		$result = $this->create_collection($params);
		$checkResult = $checkResult && $this->check_result($result, 'string(/exist:result/exist:value/text())',
		                                                   EXIST_SAMPLE_DOCUMENTS_COLLECTION);
											   
		$params = array('groupName' => EXIST_USERS_GROUP);
		$result = $this->create_group($params);
		
		return $checkResult;
	}
}

?>