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
	class Proxies_Services_CreateDocumentCollection implements Proxies_Services_Interface
	{
	
		/**
		 * The constructor of the service
		 * @return the service object
		 * @param Array the params that are passed to the service
		 */
		public function __construct($params)
		{
			// save the name of the requested file
			$this->_modify = (isset($params['modify'])) ? $params['modify'] : false;
			if ($this->_modify) {
				$this->_cls = $params['cls'];
				$this->_source = $params['source'];
			}
			$this->_docs = $params['docs'];
            $this->_userName = $params['userName'];
            $this->_userPassword = $params['userPassword'];
			$this->_docCollectionName = $params['docCollectionName'];
			$this->_docLang = $params['docLang'];
			$this->_docLocale = $params['docLocale'];
			/*$this->_markingLanguage = $params['markingLanguage'];*/
			$this->_docCollectionTemplate = '<akomaNtoso>
	            <documentCollection>
	            <meta>
	            	<identification source="#somebody">
	        			<FRBRWork>
	        				<FRBRthis value=""/>
	        				<FRBRuri value=""/>
	        				<FRBRdate date="" name=""/>
	        				<FRBRauthor href="" as=""/>
	        				<FRBRcountry value=""/>
	        			</FRBRWork>
	        			<FRBRExpression>
	        				<FRBRthis value=""/>
	        				<FRBRuri value=""/>
	        				<FRBRdate date="" name=""/>
	        				<FRBRauthor href="#somebody" as="#editor"/>
	        				<FRBRlanguage language=""/>
	        			</FRBRExpression>
	        			<FRBRManifestation>
	        				<FRBRthis value=""/>
	        				<FRBRuri value=""/>
	        				<FRBRdate date="" name=""/>
	        				<FRBRauthor href="#somebody" as="#editor"/>
	        			</FRBRManifestation>
	        		</identification>
	        		<publication date="" name="" showAs="" number=""/>
	        		<references source="#somebody">
	        			<original id="" href="" showAs="Original"/>
	        			<TLCOrganization id="" href="" showAs=""/>
	        			<TLCPerson id="somebody" href="/ontology/person/ak/somebody" showAs="Somebody"/>
	        			<TLCRole id="author" href="/ontology/roles/ak/author" showAs="Author of Document"/>
	        			<TLCRole id="editor" href="/ontology/roles/ak/editor" showAs="Editor of Document"/>
	        		</references>
	        	</meta>
	            <collectionBody/>
	        </documentCollection>
	        <components/>
	        </akomaNtoso>';

		}
		
		/**
		 * this method is used to retrive the result by the service
		 * @return The result that the service computed
		*/ 
		public function getResults()
		{
			$uris = explode(";", $this->_docs);
			if ($this->_modify) {
				$cls = explode(";", $this->_cls);
				$docCollection = new DOMDocument();
				// Trick to remove the default namespace
				//$this->_source = preg_replace("/xmlns=\"[^\"]+\"/i", "", $this->_source);
				if ($docCollection->loadXML($this->_source)) {
					$docCollection = $this->modifyDocumentCollection($docCollection, $uris, $cls);
				}
			} else {
				$docCollection = $this->createDocumentCollection($uris);
			}
			
			$this->setDocumentCollectionPropreties($docCollection);
			$xmlResult = aknToHtml($docCollection->saveXML());
			//$xmlResult = $docCollection->saveXML();
			// return the results
			return $xmlResult; 
		}
		
		private function setDocumentCollectionPropreties($docCollection) {
			$xpath = new DOMXPath($docCollection);
			$this->setXPathAttribute($xpath, "//*[name()='FRBRWork']/*[name()='FRBRcountry']", "value", $this->_docLocale);
			$this->setXPathAttribute($xpath, "//*[name()='FRBRExpression']/*[name()='FRBRlanguage']", "language", $this->_docLang);
			if ($this->_docCollectionName) {
				$this->setXPathAttribute($xpath, "//*[name()='documentCollection']", "name", $this->_docCollectionName);	
			}
		}
		
		private function createDocumentCollection($uris) {
			$docCollection = new DOMDocument();
			$docCollection->loadXML($this->_docCollectionTemplate);
			$xpath = new DOMXPath($docCollection);
			$documents = $this->getDocuments($uris);
			if ($documents) {
				$collectionBody = $this->getFirstXPath($xpath, "//collectionBody");
				$components = $this->getFirstXPath($xpath, "//components");
				$xpathDocs = new DOMXPath($documents);
				$elements = $xpathDocs->evaluate("/documents/*");
				for ($i = 0; $i < $elements->length; $i++) {
					$element = $elements->item($i);
					// Loocking for the namespace
					if (!$docCollection -> documentElement -> lookupnamespaceURI(NULL)) {
					    $uriNamespace = $element->lookupnamespaceURI(NULL);
						if($uriNamespace) {
							// Set the namespace of document collection
							$docCollection->documentElement->setAttributeNS('http://www.w3.org/2000/xmlns/','xmlns',$uriNamespace);
						}
					}
					$docNode = $xpathDocs->query("./*", $element);
					$docNode = (!is_null($docNode) && $docNode->length) ? $docNode->item(0) : NULL;
					$this->addDocumentComponent($docCollection, $collectionBody, $components, $docNode ,($i+1));
				}
			}
			return $docCollection;
		}

		private function modifyDocumentCollection($docCollection, $uris, $cls) {
			$newDocCollection = $docCollection->cloneNode(true);
			$xpath = new DOMXPath($newDocCollection);
			$oXpath = new DOMXPath($docCollection);
			$newUris = Array();
			$uriMap = Array();
			if(count($uris) == count($cls)) {
				foreach($uris as $key => $value) {
					$uriMap[] = NULL;
					if($cls[$key] == "file") {
						$newUris[] = $value;
						$uriMap[$key] = count($newUris)-1;
					}
				}
			}
			if(count($newUris)) {
				$documents = $this->getDocuments($newUris);
				//echo $documents->saveXML();
				$xpathDocs = new DOMXPath($documents);
				$elements = $xpathDocs->evaluate("/documents/*");
			}

			$collectionBody = $this->getFirstXPath($xpath, "//*[name()='collectionBody']");
			$components = $this->getFirstXPath($xpath, "//*[name()='components']");
			$this->deleteChildren($collectionBody);
			$this->deleteChildren($components);
			foreach($uris as $key => $value) {
				if($cls[$key] == "file") {
					$docNode = $elements->item($uriMap[$key]);
					if($docNode) {
						$docNode = $xpathDocs->query("./*", $docNode);
						$docNode = (!is_null($docNode) && $docNode->length) ? $docNode->item(0) : NULL;	
					}
				} else {
					$docNode = $this->getFirstXpath($oXpath, "//*[name()='component']/*[descendant::*[name()='FRBRthis' and @value='".$value."']]");
				}
				if ($docNode) {
					$this->addDocumentComponent($newDocCollection, $collectionBody, $components, $docNode ,($key+1));	
				}
			}
			return $newDocCollection;
		}
		
		private function addDocumentComponent($docCollection, $collectionBody, $components, $docNode, $baseId) {
			$docId = 'doc'.$baseId;
			$newColComponent = $docCollection->createElement('component');
			$newColComponent->setAttribute('eId', 'comp'.$baseId);
			$newRef = $docCollection->createElement('documentRef');
			$newRef->setAttribute('eId', $docId);
			$newRef->setAttribute('href', '#'.$docId);
			$newColComponent->appendChild($newRef);
			
			$newComponent = $docCollection->createElement('component');
			$newComponent->setAttribute('eId', $docId);
			
			$xpath = new DOMXPath($docNode->ownerDocument);
			if($docNode) {
				$nodesToChange = $xpath->query(".//*[@eId]", $docNode);
				foreach($nodesToChange as $nodeToChange) {
					$attVal = $nodeToChange->getAttribute("eId");
					$attVal = preg_replace("/doc(\d)*-/i", "", $attVal);
					$nodeToChange->setAttribute("eId", $docId."-".$attVal);
				}
				$docNode = $docCollection->importNode($docNode, true);
				$newComponent->appendChild($docNode);
			}
			if($collectionBody && $components) {
				$collectionBody->appendChild($newColComponent);
				$components->appendChild($newComponent);	
			}
		}

		private function getDocuments($uris) {
			require_once(dirname(__FILE__) . './../../dbInterface/class.dbInterface.php');
			$credential = $this->_userName .':' . $this->_userPassword;
			$DBInterface = new DBInterface(EXIST_URL,$credential);
			$documents = new DOMDocument();
            
            $params = array(
                'docs' => implode(";", $uris)
            );
            
			$result = $DBInterface->get_documents($params);

			if ($documents->loadXML($result)) {
				return $documents;
			}
			return NULL;
		}
		
		private function deleteChildren($node) {
		    while (isset($node->firstChild)) {
		        $this->deleteChildren($node->firstChild);
		        $node->removeChild($node->firstChild);
		    }
		} 
		
		private function getFirstXPath($xpath, $expression) {
			$elements = $xpath->evaluate($expression);
			return (!is_null($elements) && $elements->length) ? $elements->item(0) : NULL;
		}
		
		private function setXPathAttribute($xpath, $expression, $attName, $attValue) {
			$el = $this->getFirstXPath($xpath, $expression);
			($el) ? $el->setAttribute($attName, $attValue) : NULL;
		}
	}

?>