(: Declare the namespace for the ajax functions in wawe :)
declare namespace ajax = "http://www.wawe.com/ajax";

(: Declare the namespace for the advanced functions :)
declare namespace functx = "http://www.functx.com"; 

(: Declare the namespace for functions of the exist xml db :)
declare namespace xdb="http://exist-db.org/xquery/xmldb";
declare namespace exist="http://exist.sourceforge.net/NS/exist"; 

(: Declare the namespace for akomantoso :)
declare namespace akn="http://www.akomantoso.org/2.0";

(: Declare the namespace for akomantoso :)
declare namespace xsi="http://www.w3.org/2001/XMLSchema-instance";

(: Declare the options to save the document as html :)
declare option exist:serialize "method=json media-type=text/javascript";

(: The substring after last function :)
declare function functx:substring-after-last 
		($arg as xs:string?,
  		 $delim as xs:string) 
		as xs:string 
		{
   			replace ($arg,concat('^.*',functx:escape-for-regex($delim)),'')
 		};

(: The substring before last function :)
declare function functx:substring-before-last 
  		($arg as xs:string?,
    	 $delim as xs:string)  
		as xs:string 
		{
   			if (matches($arg, functx:escape-for-regex($delim)))
   				then replace($arg,
     						 concat('^(.*)', functx:escape-for-regex($delim),'.*'),
            				 '$1')
   			else ''
 		};

declare function functx:escape-for-regex 
  		($arg as xs:string?)  
		as xs:string 
		{
   			replace($arg,
           			'(\.|\[|\]|\\|\||\-|\^|\$|\?|\*|\+|\{|\}|\(|\))','\\$1')
 		};

(: This get the document contained in the request data :)
let $docType := '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
let $metadataNameTpl := '.metadata.%name%'
let $usersDocumentsDir := request:get-parameter('usersDocumentsDir', ())
let $waweUsersGroup := request:get-parameter('existUsersGroup', ())


(: Build the content of the file adding the DOCTYPE :)
let $my-doc := if ($content eq '') then
        <div/>
    else
        concat($docType, $content)

(: This is used to set an autosave or a normal save :) 
let $saveType := request:get-parameter("savetype",())

(: This is the complete filepath :)
let $filePath := request:get-parameter("file", false())

(: This get the collection passed as parameter :)
let $collection := functx:substring-before-last($filePath,"/")

(: Build the file path depending on the user collection's path :)
let $userName := request:get-parameter('userName', ())
let $encodedUsername := replace($userName, '@', '.')
let $basePath := concat($usersDocumentsDir, '/', $encodedUsername)
(: Fault tolerant: make sure that the path is always relative :)
let $collectionPath := replace(functx:substring-after-last(functx:substring-before-last($filePath, '/'), $basePath), '@', '.')
let $fullPath := concat($basePath, $collectionPath)
 
(: The filename of the document :)
let $fileName := concat(replace(functx:substring-after-last($filePath, "/"), '.xml', ''), '.xml')
(: Avoid problems due to spaces in the file name :)
let $encodedFileName := replace($fileName, ' ', '%20')

(: Create the collection if it doesn't exist (no further checks required) :)
let $creation := xmldb:create-collection($basePath, $collectionPath)

(: Create the autosave collection anyway, if it exists nothing is done :)
let $autoSaveFolder := 'autosave'
let $autoSavePath := concat($basePath, '/', $autoSaveFolder)
let $autoSaveCollection := xmldb:create-collection($basePath, $autoSaveFolder)
(: Change the saving path depending on wether the file name was specified or not :)
let $emptyFileName := concat(util:hash($userName, 'md5'), '.xml') (: If the file name is not specified use a hash taken from the username :)

(: Encode metadata file name :)
let $metadataName := replace($metadataNameTpl, '%name%', $fileName)
let $encodedMetadataName := replace($metadataName, ' ', '%20')


(: Store the actual files  :)
let $storeStatus :=
    if (not($filePath)) then
        let $autoSave := xdb:store($autoSavePath, $emptyFileName, $my-doc)
        return $autoSave
    else
        let $metadataSave := if ($metadata eq () or $metadata eq '') then (: Avoid errors due to empty metadata :)
                ()
            else
                xdb:store($fullPath, $encodedMetadataName, $metadata)
        let $documentSave := xdb:store($fullPath, $encodedFileName, $my-doc)
        return $documentSave
  	
(: Set permissions :)
let $saved := $storeStatus
(:for $saved in $storeStatus:)
let $setCollectionPermissions := sm:chmod($saved, 'group=-read,-write,-execute,other=-read,-write,-execute')
let $setCollectionUser := sm:chown($saved, $userName)
let $setCollectionGroup := sm:chgrp($saved, $waweUsersGroup)

return
    <ajax-response>
        <success>true</success>
        <path>{$saved}</path>
    </ajax-response>
