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
class Proxies_Services_AknToPdfFop implements Proxies_Services_Interface
{
	// the start page number
	private $_startPageNumber; 

	// the akn source
	private $_submittedSourceXML;
	
	/**
	 * The constructor of the service
	 * @return the service object
	 * @param Array the params that are passed to the service
	 */
	public function __construct($params, $isDownload=false)
	{
		// save the start page number
		$this->_startPageNumber = $params['start_page'];	
		
		// save the source
		$this->_submittedSourceXML = $params['source'];
		
		$this->_isDownload = $isDownload;
		$this->_cssFile = (isset($params['css'])) ? $params['css'] : FALSE;
	}
	
	/**
	 * this method is used to retrive the result by the service
	 * @return The result that the service computed
	 */ 
	public function getResults()
	{
		//$fop_command = $currentDirFullpath."isafop/fop ";
		
		$currentDirFullpath = dirname(__FILE__)."/";
		$currentDirWebpath = substr($_SERVER["PHP_SELF"],0, strripos($_SERVER["PHP_SELF"],"/"))."/";
		
		$token = md5(time().rand(0,1000000));
		
		/*
		if ($_FILES['datafile']['error'] == UPLOAD_ERR_OK               //checks for errors
		      && is_uploaded_file($_FILES['datafile']['tmp_name'])) { //checks that file is uploaded
		  		$this->_submittedSourceXML = file_get_contents($_FILES['datafile']['tmp_name']); 
			}
		*/
		$sourceXML = trim($this->_submittedSourceXML);
		if (get_magic_quotes_gpc()) 
		            $sourceXML = stripcslashes($sourceXML);
			
		$doc = new DOMDocument();
		$output = array();

		if (preg_match("/^[0-9]+$/", $this->_startPageNumber))
			{	
			if ($doc->loadXML($sourceXML))
				{	
				if (mkdir($currentDirFullpath.TMPSUBDIRLOCALPATH.$token)) 
					{
						umask(0);
						chmod($currentDirFullpath.TMPSUBDIRLOCALPATH.$token,0777);
						
						
						$xmlFullPathFilename = $currentDirFullpath.TMPSUBDIRLOCALPATH.$token."/".SOURCEXMLFILENAME;
						$doc->save($xmlFullPathFilename);
						//TODO: if fileexists
		
						if (file_exists($xmlFullPathFilename))
						{
							
							$xsl = new DOMDocument;
							$xsl->load(AKN_TO_PDF);
							
							if($this->_cssFile) {
								$cssRules = cssFileToArray($this->_cssFile);
								foreach($cssRules as $selector => $rules) {
									$attributeSet = createAttributeSet($xsl, $selector, $rules);
									$xsl->documentElement->appendChild($attributeSet);
								}
							}
							
							$uriNamespace = $doc ->documentElement ->lookupnamespaceURI(NULL);
							
							// set namespace uri of the correct AKN3.0 revision
							$xsl->documentElement->setAttributeNS(
						        'http://www.w3.org/2000/xmlns/',
						        'xmlns:akn',
						        $uriNamespace
							);
			
							// Configure the transformer
							$proc = new XSLTProcessor;
							$proc->importStyleSheet($xsl); // attach the xsl rules
							$proc->setParameter('', 'startPageNumber', $this->_startPageNumber);

							$fo = $proc->transformToDoc($doc);
							
							if ($fo)
								{
								/*** FONT-ISSUE: substitute chars non currently supported, add fonts ***/
								$patchedFO = str_replace("&#x96;", "-", $fo->saveXML());
								$patchedFO = str_replace("&#x92;", "&#x27;", $patchedFO);
								$fo->loadXML($patchedFO);
								/*** FONT-ISSUE ***/
														
								$fo->save($currentDirFullpath.TMPSUBDIRLOCALPATH.$token."/".XSLFOFILENAME);
							
								$fullPath = realpath($currentDirFullpath.TMPSUBDIRLOCALPATH.$token."/");	
								$foFullPath = $fullPath."/".XSLFOFILENAME;
								$pdfFullPath = $fullPath."/".PDFFILENAME;
									
								//$fop_conf = " -c ".$currentDirFullpath."isafop/conf/fop.xconf";
								$fop_conf = "";
							    $final_command = '"'.realpath(FOP_COMMAND).'"'." $fop_conf -fo ".'"'.$foFullPath.'"'." -pdf ".'"'.$pdfFullPath.'"';
							    exec($final_command);

							    if (file_exists($pdfFullPath)){
							    	$output["status"] = "success";
									$output["localPathXML"] = TMPSUBDIRLOCALPATH.$token."/".SOURCEXMLFILENAME;
									$output["absolutePathXML"] = SERVER_NAME.$currentDirWebpath.TMPSUBDIRWEBPATH.$token."/".SOURCEXMLFILENAME;
									$output["localPathPDF"] = TMPSUBDIRLOCALPATH.$token."/".PDFFILENAME;
									if ($this->_isDownload) {
										$output["localFullPdf"] = realpath($pdfFullPath);
									}
							    	$output["absolutePathPDF"] = SERVER_NAME.$currentDirWebpath.TMPSUBDIRWEBPATH.$token."/".PDFFILENAME;
							    	
							    	}
							    	else
							    	{
							    		//header(':', true, CONVERSION_ERROR_CODE);
									$output["status"] = "error";
									$output["description"] = "Conversion error: impossible to generate XSL-FO and/or PDF(2)";
									$output["path"]	= $pdfFullPath;			
									}
								}
							else
								{
								//header(':', true, CONVERSION_ERROR_CODE);
								$output["status"] = "error";
								$output["description"] = "Conversion error: impossible to generate XSL-FO and/or PDF(1)";				
								}
						}
						else
						{
			 	        //header(':', true, CONVERSION_ERROR_CODE);
						$output["status"] = "error";
						$output["description"] = "Impossible to create directories e/o temporary files";
						}	
		    		}
					else
					{
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
				$output["input"] = $sourceXML;
				}
			}
		else
			{
				//header(':', true, 400);
				$output["status"] = "error";
				$output["description"] = "Incorrect starting page number";	
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
