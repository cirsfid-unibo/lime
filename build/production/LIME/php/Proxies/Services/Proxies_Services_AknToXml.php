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
class Proxies_Services_AknToXml implements Proxies_Services_Interface
{
	// the akn source
	private $_submittedSourceXML;
	
	private $_isFile;
	
	const TMPSUBDIRLOCALPATH = "../../tmp/";
	const TMPSUBDIRWEBPATH = "tmp/";
	const XMLFILENAME = "document.akn";
	
	/**
	 * The constructor of the service
	 * @return the service object
	 * @param Array the params that are passed to the service
	 */
	public function __construct($params, $isFile=false)
	{	
		// save the source
		$this->_submittedSourceXML = $params['source'];
		$this->_isFile = $isFile;
	}
	
	/**
	 * this method is used to retrive the result by the service
	 * @return The result that the service computed
	 */ 
	public function getResults()
	{	
		$sourceXML = trim($this->_submittedSourceXML);
		if (get_magic_quotes_gpc()) 
		            $sourceXML = stripcslashes($sourceXML);
		
		$doc = new DOMDocument();
		if ($doc->loadXML($sourceXML)) {
			if ($this->_isFile) {
				$currentDirFullpath = dirname(__FILE__)."/";
				$currentDirWebpath = substr($_SERVER["PHP_SELF"],0, strripos($_SERVER["PHP_SELF"],"/"))."/";
				$token = md5(time().rand(0,1000000));
				$tmpDir = $currentDirFullpath.self::TMPSUBDIRLOCALPATH.$token;
				$output = array();
				if (mkdir($tmpDir)) {
					$tmpDir = realpath($tmpDir);
					$xmlFullPath = $tmpDir."/".self::XMLFILENAME;
					if ($doc->save($xmlFullPath) === FALSE) {
						$output["status"] = "error";
						$output["description"] = "Impossible to write xml file";
					} else {
						$output["status"] = "success";
					    $output["absolutePathXML"] = SERVER_NAME.$currentDirWebpath.self::TMPSUBDIRWEBPATH.$token."/".self::XMLFILENAME;
					}
				} else {
		    		$output["status"] = "error";
					$output["description"] = "Impossible to create directories e/o temporary files";
				}
				
				$result = str_replace('\/','/',json_encode($output));	
				return $result;
			} else {
				return $doc->saveXML();
			}
		}
		return FALSE;
	}
}
?>
