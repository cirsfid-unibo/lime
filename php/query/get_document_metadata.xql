
(: Declare the namespace for the ajax functions in wawe :)
declare namespace ajax = "http://www.wawe.com/ajax";

(: Declare the namespace for the advanced functions :)
declare namespace functx = "http://www.functx.com";

(: Declare the namespace for functions of the exist xml db :)
declare namespace xdb="http://exist-db.org/xquery/xmldb";

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

(: This function return an XML containig all the collections and the files in the given collection :)
declare function ajax:getFileXML($xmlFile as xs:string) as 
element()* { 
     ( 
        let $docExists := doc-available($xmlFile)
		let $doc := doc($xmlFile)
		(: Returns an XML fragment describing the collection :)
        return
            if (not($docExists)) then
                <div></div>
            else 
    			<div class="previewMetadataContainer">
    	 			<div class="publicationInfo">
    					<div class="previewMetadata PublicationName">{string($doc//*:meta[1]/*:publication/@*:name)}</div>  
    					<div class="previewMetadata PublicationDate">{string($doc//*:meta[1]/*:publication/@*:date)}</div>  
    					<div class="previewMetadata PublicationShowAs">{string($doc//*:meta[1]/*:publication/@*:showAs)}</div>  
    					<div class="previewMetadata PublicationNumber">{string($doc//*:meta[1]/*:publication/@*:number)}</div>  
    				</div>
    				<h3>Work</h3>
                    <div class="previewMetadata FRBRWork">{string($doc//*:FRBRWork[1]/*:FRBRthis/@*:value)}</div>   
    	 			<h3>Expression</h3>
                    <div class="previewMetadata FRBRExpression">{string($doc//*:FRBRExpression[1]/*:FRBRthis/@*:value)}</div>   
    	 			<h3>Manifestation</h3>
                    <div class="previewMetadata FRBRManifestation">{string($doc//*:FRBRManifestation[1]/*:FRBRthis/@*:value)}                    </div>
    			</div> 
	 ) 
};

(: Login with the given user and password :)
let $userName := request:get-parameter('userName', ())
let $encodedUserName := replace($userName, '@', '.')
let $userPassword := request:get-parameter('userPassword', ())
(:let $login := xdb:login('/db', $adminUsername, $password):)
let $login := xdb:login('/db', $userName, $userPassword)

(: Calls the function that lists the collections getting the collection name from the given GET parameter :)
let $filePath := request:get-parameter("requestedFile", ()) 

(: Build the metadata path from the document's path :)
let $documentName := functx:substring-after-last($filePath, '/')
let $metadataFile := replace('.metadata.%name%', '%name%', $documentName)
let $metadataPath := functx:substring-before-last($filePath, '/')
let $finalPath := replace(concat($metadataPath, '/', $metadataFile), ' ', '%20')

let $docAvailable := doc-available($finalPath)
let $doc := doc($finalPath)

return 
    <ajax-response success="{$docAvailable}">
    {
        $doc
    }
    </ajax-response>