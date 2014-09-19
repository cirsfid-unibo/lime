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

	define("E_NONE", (0));
	error_reporting(E_ALL | E_STRICT);

	
	// requires the configuration file
	require('./config.php');
	require('./utils.php');
	require('./Proxies/Services/Proxies_Services_Interface.php');
	require('./Proxies/Services/Proxies_Services_GetFileContent.php');
	require('./Proxies/Services/Proxies_Services_ListFiles.php');
	require('./Proxies/Services/Proxies_Services_GetFileMetadata.php');
	require('./Proxies/Services/Proxies_Services_UserManager.php');
	require('./Proxies/Services/Proxies_Services_UserPreferences.php');
    require('./Proxies/Services/Proxies_Services_SaveFile.php');
	require('./Proxies/Services/Proxies_Services_XSLTTransform.php');
	require('./Proxies/Services/Proxies_Services_AknToPdf.php');
	require('./Proxies/Services/Proxies_Services_AknToEpub.php');
	require('./Proxies/Services/Proxies_Services_AknToXml.php');
	require('./Proxies/Services/Proxies_Services_AknToHtml.php');
	require('./Proxies/Services/Proxies_Services_FileToHtml.php');
	require('./Proxies/Services/Proxies_Services_Upload.php');
	require('./Proxies/Services/Proxies_Services_HtmlToPdf.php');
	require('./Proxies/Services/Proxies_Services_CreateDocumentCollection.php');
	require('./Proxies/Services/Proxies_Services_XmlValidation.php');
	require('./Proxies/Services/Proxies_Services_ExportFiles.php');
	require('./Proxies/Services/Proxies_Services_FilterUrls.php');
	require('./Proxies/Proxies.php');
	require('./Proxies/Services/Proxies_Services_AknToPdfFop.php');
	
	// the method of the request
	$type = $_SERVER['REQUEST_METHOD'];

	// the desired format of the response
	$params = $type=='GET'? $_GET : $_POST;
	
	// get the service name
	$requestedService = $params['requestedService'];
	
	// remove the requested service from the params
	unset($params['requestedService']);
    
	// create the proxy 
	$proxy = new Proxies($requestedService,$params);
	
	// get the result
	$result =  $proxy->getResults();
    
	echo $result; 
	return $result;  
	
	
	