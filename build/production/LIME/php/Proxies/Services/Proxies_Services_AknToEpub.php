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
class Proxies_Services_AknToEpub implements Proxies_Services_Interface
{

	// the akn source
	private $_submittedSourceXML;
	// the language of the source
	private $_bookLang;
	// title of the book
	private $_bookTitle;
	
	/**
	 * The constructor of the service
	 * @return the service object
	 * @param Array the params that are passed to the service
	 */
	public function __construct($params, $isDownload=false)
	{	
		// save the source
		$this->_submittedSourceXML = trim($params['source']);
		// save the lang
		$this->_bookLang = trim($params['lang']);
		// save the title
		$this->_bookTitle = trim($params['title']);
		$this->_isDownload = $isDownload;
		
		if (get_magic_quotes_gpc()) {
			$this->_submittedSourceXML = stripcslashes($this->_submittedSourceXML);
			$this->_bookLang = stripcslashes($this->_bookLang);
			$this->_bookTitle = stripcslashes($this->_bookTitle);
		}
	}
	
	/**
	 * this method is used to retrive the result by the service
	 * @return The result that the service computed
	 */ 
	public function getResults()
	{	

		$currentDirFullpath = dirname(__FILE__)."/";
		$currentDirWebpath = substr($_SERVER["PHP_SELF"],0, strripos($_SERVER["PHP_SELF"],"/"))."/";
		$xslUrl = "file:///".realpath(($this->_bookLang == 'ita' ? AKN2_TO_HTML_ITA : AKN2_TO_HTML));
		$token = md5(time().rand(0,1000000));
		$tmpDir = $currentDirFullpath.TMPSUBDIRLOCALPATH.$token;

		$scfDoc = new DOMDocument();
		$akomaDoc = new DOMDocument();
		$output = array();
	
		if ($scfDoc->load(SCF_TEMPLATE) && $akomaDoc->loadXML($this->_submittedSourceXML))
		{	
			if (mkdir($tmpDir)) 
				{
					$tmpDir = realpath($tmpDir);
					umask(0);
					chmod($tmpDir,0777);
					
					$sourceFullPath = $tmpDir."/".SOURCEXMLFILENAME;
					$sourceCover = realpath($currentDirFullpath."../../lib/scriba/ebookstaticcontent/copertina_lime.html");
					$styleSource = realpath($currentDirFullpath."../../lib/scriba/ebookstaticcontent/lime.css");
					$akomaDoc->save($sourceFullPath);
					
					$xpath = new DOMXpath($scfDoc);
					
					$title = $xpath->query("//metaitem[@elename='title']");
					if (!is_null($title)) {
						$title = $title->item(0);
						$title->nodeValue = $this->_bookTitle." ".$title->nodeValue;
					}
					$lang = $xpath->query("//metaitem[@elename='language']");
					if (!is_null($lang)) {
						$lang = $lang->item(0);
						$lang->nodeValue = $this->_bookLang;
					}
					$xsltMeta = $xpath->query("//metaitem[@name='xslFullPath']");
					if (!is_null($xsltMeta)) {
						$xsltMeta = $xsltMeta->item(0);
						$xsltMeta->setAttribute("content", $xslUrl);
					}
					$content = $xpath->query("//content[@packageId='content']");
					if (!is_null($content)) {
						$content = $content->item(0);
						$content->setAttribute("tocName", $this->_bookTitle);
						$content->setAttribute("contentUrl", "file:///".$sourceFullPath);
					}
					$cover = $xpath->query("//content[@packageId='copertina']");
					if (!is_null($cover)) {
						$cover = $cover->item(0);
						$cover->setAttribute("contentUrl", "file:///".$sourceCover);
					}
					$style = $xpath->query("//content[@packageId='style']");
					if (!is_null($style)) {
						$style = $style->item(0);
						$style->setAttribute("contentUrl", "file:///".$styleSource);
					}
					$scfFullPath = $tmpDir."/".SCF_FILENAME;
					$scfDoc->save($scfFullPath);

					if (file_exists($scfFullPath))
					{
						
						$epubFullPath = $tmpDir."/".EPUBFILENAME;				
						$final_command = sprintf(SCRIBA_COMMAND, $scfFullPath, $epubFullPath);
						
					    exec($final_command);
	
					    if (file_exists($epubFullPath)) 
					    {
					    	$output["status"] = "success";
							$output["localPathEPUB"] = TMPSUBDIRLOCALPATH.$token."/".EPUBFILENAME;
					    	$output["absolutePathEPUB"] = SERVER_NAME.$currentDirWebpath.TMPSUBDIRWEBPATH.$token."/".EPUBFILENAME;
							if ($this->_isDownload) {
								$output["localFullEPUB"] = realpath($epubFullPath);
							}
					    }
					    else
					    {
					    	//header(':', true, CONVERSION_ERROR_CODE);
							$output["status"] = "error";
							$output["description"] = "Conversion error: impossible to generate XSL-HTML and/or PDF";
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
			}
		if($this->_isDownload && isset($output["localFullEPUB"])) {
			return file_get_contents($output["localFullEPUB"]);
		} else {
			$result = str_replace('\/','/',json_encode($output));	
			return $result;
		}
	}
}
?>
