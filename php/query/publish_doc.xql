(: Declare the namespace for the ajax functions in wawe :)
declare namespace ajax = "http://www.wawe.com/ajax";

(: Declare the namespace for the advanced functions :)
declare namespace functx = "http://www.functx.com"; 

(: Declare the namespace for functions of the exist xml db :)
declare namespace xdb="http://exist-db.org/xquery/xmldb";
declare namespace exist="http://exist.sourceforge.net/NS/exist"; 

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



(: This is the complete filepath :)
let $filePath := xmldb:encode-uri(request:get-parameter("uri", false()))

(: This get the collection passed as parameter :)
let $collection := functx:substring-before-last($filePath,"/")

let $basePath := ""

(: The filename of the document :)
let $fileName := concat(replace(functx:substring-after-last($filePath, "/"), '.xml', ''), '.xml')

(: Create the collection if it doesn't exist (no further checks required)  :)
let $creation := xmldb:create-collection($basePath, $collection)
(: Store the actual files  :)

let $storeStatus :=
        let $documentSave := xdb:store($collection, $fileName, $content)
        return $documentSave 
  	
(: Set permissions :)
let $saved := $storeStatus
let $setCollectionPermissions := sm:chmod($saved, 'group=+read,other=+read')

return
    <ajax-response>
        <success>true</success>
        <path>{$saved}</path>
    </ajax-response>
