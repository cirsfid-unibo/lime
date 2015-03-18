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
	
	/**
	 * This class is the class that supplies all the proxies needed by the editor
	 * @package Proxies
	 * @author Luca Cervone <cervoneluca@gmail.com>
	*/
	class Proxies {
		
		// the requested service
		private $_requestedService; 
		
		// the parameters to give to the requested service
		private $_params; 
		
		// the service instance
		private $_service;
		
		/**
		 * Create the proxies object
		 * @return The Proxy Object
		 * @param String the name of the requested service
		 * @param Array the params to give to the requested service
		 */
		public function __construct($requestedService, $params)
		{
			// save the name of the requested service
			$this->_requestedService = $requestedService;
			
			// save the params that will be given to the requested service
			$this->_params = $params; 
			
			// create the requested service instance
			switch($this->_requestedService)
			{
				case 'LIST_FILES':
					$this->_service = new Proxies_Services_ListFiles($this->_params);
					header("Content-Type: text/xml");
					break;
				case 'GET_FILE_CONTENT':
					header("Content-Type: text/xml");
					$this->_service = new Proxies_Services_GetFileContent($this->_params);
					break;
				case 'GET_FILE_METADATA':
					header("Content-Type: text/xml");
					$this->_service = new Proxies_Services_GetFileMetadata($this->_params);
					break;
				case 'AUTOSAVE_FILE':
					$this->_service = new Proxies_Services_AutosaveFile($this->_params);
					break;
                case 'SAVE_FILE':
                    $this->_service = new Proxies_Services_SaveFile($this->_params);              
                    break; 
				case 'USER_MANAGER':
					header("Content-Type: application/json");
					$this->_service = new Proxies_Services_UserManager($this->_params);
					break;
				case 'USER_PREFERENCES':
					header("Content-Type: application/json");
					$this->_service = new Proxies_Services_UserPreferences($this->_params);
					break;
				case 'XSLT_TRANSFORM':
				//	header("Content-Type: text/xml");
					$this->_service = new Proxies_Services_XSLTTransform($this->_params);
					break; 
				case 'AKN_TO_PDF':
					header("Content-Type: application/json");
					$this->_service = new Proxies_Services_AknToPdf($this->_params);
					break;
				case 'AKN_TO_EPUB':
					header("Content-Type: application/epub+zip");
					header('Content-disposition: attachment; filename="document.epub"');
					$this->_service = new Proxies_Services_AknToEpub($this->_params, true);
					break;
				case 'AKN_TO_PDF_DOWNLOAD':
					header("Content-Type: application/pdf");
					header('Content-disposition: attachment; filename="document.pdf"');
					$this->_service = new Proxies_Services_AknToPdf($this->_params, true);
					break;
				case 'AKN_TO_XML_DOWNLOAD':
					header("Content-Type: text/xml");
					header('Content-disposition: attachment; filename="document.xml"');
					$this->_service = new Proxies_Services_AknToXml($this->_params);
					break;
				case 'AKN_TO_HTML_DOWNLOAD':
					header("Content-Type: text/html");
					header('Content-disposition: attachment; filename="document.html"');
					$this->_service = new Proxies_Services_AknToHtml($this->_params);
					break;
				case 'AKN_TO_FILE':
					header("Content-Type: application/json");
					$this->_service = new Proxies_Services_AknToXml($this->_params, true);
					break;
				case 'FILE_TO_HTML':
					header("Content-Type: application/json"); // TODO if set to any other type the result is wrapped into a <pre> tag
					$this->_service = new Proxies_Services_FileToHtml($this->_params);
					break;
				case 'UPLOAD':
					$this->_service = new Proxies_Services_Upload($this->_params);
					break;
				case 'HTML_TO_PDF':
					header("Content-Type: application/json");
					$this->_service = new Proxies_Services_HtmlToPdf($this->_params);
					break;
				case 'HTML_TO_PDF_DOWNLOAD':
					header("Content-Type: application/pdf");
					header('Content-disposition: attachment; filename="document.pdf"');
					$this->_service = new Proxies_Services_HtmlToPdf($this->_params, true);
					break;
				case 'CREATE_DOCUMENT_COLLECTION':
					header("Content-Type: text/xml");
					$this->_service = new Proxies_Services_CreateDocumentCollection($this->_params);
					break;
				case 'XML_VALIDATION':
					header("Content-Type: application/json");
					$this->_service = new Proxies_Services_XmlValidation($this->_params);
					break;
				case 'EXPORT_FILES':
					header("Content-Type: application/json");
					$this->_service = new Proxies_Services_ExportFiles($this->_params);
					break;
				case 'FILTER_URLS':
					header("Content-Type: application/json");
					$this->_service = new Proxies_Services_FilterUrls($this->_params);
					break;
				case 'AKN_TO_PDF_FOP':
					header("Content-Type: application/json");
					$this->_service = new Proxies_Services_AknToPdfFop($this->_params);
					break;
			}
			
		}

		/**
		 * Return the result that the needed service outputs
		 * @return the result by the given service
		*/
		public function getResults()
		{
			// return the service results
			return $this->_service->getResults();
		}
		
	}	