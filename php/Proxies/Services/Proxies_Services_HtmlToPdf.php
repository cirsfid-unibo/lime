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
class Proxies_Services_HtmlToPdf implements Proxies_Services_Interface
{
	private $_submittedSourceHTML;

	/**
	 * The constructor of the service
	 * @return the service object
	 * @param Array the params that are passed to the service
	 */
	public function __construct($params, $isDownload=false)
	{		
		// save the source
		$this->_submittedSourceHTML = $params['source'];
		
		$this->_isDownload = $isDownload;
	}
	
	/**
	 * this method is used to retrive the result by the service
	 * @return The result that the service computed
	 */ 
	public function getResults()
	{	
		
		$currentDirFullpath = dirname(__FILE__)."/";
		$currentDirWebpath = substr($_SERVER["PHP_SELF"],0, strripos($_SERVER["PHP_SELF"],"/"))."/";
		
		$token = md5(time().rand(0,1000000));
		$source = trim($this->_submittedSourceHTML);
		if (get_magic_quotes_gpc()) 
			$source = stripcslashes($source);
		
		$doc = new DOMDocument();
		$output = array();

		if ($doc->loadHTML($source)) {
			if (mkdir($currentDirFullpath.TMPSUBDIRLOCALPATH.$token)) {
					umask(0);
					chmod($currentDirFullpath.TMPSUBDIRLOCALPATH.$token,0777);

					$htmlFullPathFilename = $currentDirFullpath.TMPSUBDIRLOCALPATH.$token."/source.html";
					$doc->saveHTMLFile($htmlFullPathFilename);
	
					if (file_exists($htmlFullPathFilename)) {					
						$pdfFullPath = $currentDirFullpath.TMPSUBDIRLOCALPATH.$token."/".PDFFILENAME;
						$cmd = escapeshellarg(ABIWORD_PATH).' --to=pdf '.realpath($htmlFullPathFilename).' -o '.$pdfFullPath;
						exec($cmd);

					    if (file_exists($pdfFullPath)) {
					    	$output["status"] = "success";
							if ($this->_isDownload) {
								$output["localFullPdf"] = realpath($pdfFullPath);
							}
					    	$output["absolutePathPDF"] = SERVER_NAME.$currentDirWebpath.TMPSUBDIRWEBPATH.$token."/".PDFFILENAME;
					    	
					    } else {
				    		//header(':', true, CONVERSION_ERROR_CODE);
							$output["status"] = "error";
							$output["description"] = "Impossible to generate PDF";
							$output["path"]	= $pdfFullPath;			
						}
					}
					else {
			 	        //header(':', true, CONVERSION_ERROR_CODE);
						$output["status"] = "error";
						$output["description"] = "Impossible to generate HTML";
					}	
	    		} else {
					//header(':', true, CONVERSION_ERROR_CODE);
		    		$output["status"] = "error";
					$output["description"] = "Impossible to create directories e/o temporary files";
				}
			}
		else 
			{
			//header(':', true, 400);
			$output["status"] = "error";
			$output["description"] = "Impossible to load XML, empty or bad-formed document";
			$output["input"] = $source;
			}
		if($this->_isDownload && isset($output["localFullPdf"])) {
			return file_get_contents($output["localFullPdf"]);
		} else {
			$result = str_replace('\/','/',json_encode($output));	
			return $result;
		}
	}
}

?>
