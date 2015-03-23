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
	class Proxies_Services_XSLTTransform implements Proxies_Services_Interface
	{
		// the input file
		private $_input;
		
		// the output file
		private $_output;
		
		/**
		 * The constructor of the service
		 * @return the service object
		 * @param Array the params that are passed to the service
		 */
		public function __construct($params)
		{
			// save content of the file to translate
			$this->_input = $params['input'];	
			
			// save the format to which translate the input file
			$this->_output = $params['output'];
			
			// save the document marking language
			$this->_markingLanguage = $params['markingLanguage'];
			
			$this->_transformFile = (isset($params['transformFile'])) ? realpath(LIMEROOT."/".$params['transformFile']) : FALSE;
			$this->_includeFiles = (isset($params['includeFiles'])) ? 
					array_map(function ($str) {
						$path = realpath(LIMEROOT."/".$str);
						return ($path) ? "../../".$str : FALSE; //TODO: use get relative path function
					}, explode(",",$params['includeFiles'])) : FALSE;
		}
		
		/**
		 * this method is used to retrive the result by the service
		 * @return The result that the service computed
		*/ 
		public function getResults()
		{
			// the xslt to use 
			$xslt = new DOMDocument();
			$xml;
			// create the processor 
			$xslProcessor = new XSLTProcessor();
			
			if($this->_transformFile) {
				$xml = new DOMDocument();
				$xslt->load($this->_transformFile);

				if ( $this->_includeFiles ) {
					addIncludesToXsl($xslt, $this->_includeFiles);
				}

				switch($this->_output)
				{
					case 'akn':
						// create the xml file
						$xml->loadXML('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">' . stripcslashes($this->_input));
						
						$xpath = new DOMXPath($xml);
						// The element which has an attribute 'language' which contains 'akoma' has the akn namespace  
						$elements = $xpath->evaluate("//*[@*]");
						// Loocking for the namespace
						if (!is_null($elements) && $elements->length) {
							foreach( $xpath->query('namespace::*', $elements->item(0)) as $node ) {
								$name = ($node->nodeName == 'xmlns:akn') ? 'xmlns' : $node->nodeName;
								$xslt->documentElement->setAttributeNS('http://www.w3.org/2000/xmlns/',$name,$node->nodeValue);
							}
						}
						break;

					case 'html':
						$xml->loadXML(stripcslashes($this->_input));
						$uriNamespace = $xml->documentElement -> lookupnamespaceURI(NULL);
						
						$xpath = new DOMXPath($xml);
						foreach( $xpath->query('namespace::*', $xml->documentElement) as $node ) {
							if($node->nodeName != 'xmlns:xsi' && $node->nodeName != 'xmlns') {
								$xslt->documentElement->setAttributeNS('http://www.w3.org/2000/xmlns/',$node->nodeName,$node->nodeValue);
							}
						}

						$xslt->documentElement->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:akn', $uriNamespace);
						break;
					default:
						$xml->loadXML($this->_input);
				}
		
				// add the stylesheet
				$xslProcessor->importStylesheet($xslt);
		
				// transform the input
				$xml = $xslProcessor->transformToDoc($xml);
				
				// Normalize attributes
				$xslt->load(ATTRIBUTES_NORMALIZER);
				$xslProcessor->importStylesheet($xslt);
				$result = $xslProcessor->transformToXML($xml);

				// return the translated document
				return $result;
			} else {
				return "XSL transform file not found";	
			}		 		
		}
	}