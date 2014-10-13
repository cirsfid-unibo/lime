(: Declare the namespace for the ajax functions in wawe :)
declare namespace ajax = "http://www.wawe.com/ajax";

(: Declare the namespace for functions of the exist xml db :)
declare namespace xdb="http://exist-db.org/xquery/xmldb";

(: Declare the namespace for akomantoso :)
declare namespace akn="http://www.akomantoso.org/2.0";

(: Declare the namespace for akomantoso :)
declare namespace xsi="http://www.w3.org/2001/XMLSchema-instance";

(: This function return an XML containig all the collections and the files in the given collection :)
declare function ajax:getFileXML($xmlFile as xs:string) as 
node()* { 
     ( 
		let $doc := doc($xmlFile)
		(: Returns an XML fragment describing the collection :)
      	return 
			 $doc
	) 
}; 

(: Calls the function that lists the collections getting the collection name from the given GET parameter :)
let $file := request:get-parameter("requestedFile", ())
let $encodedFile := replace($file, ' ', '%20') (: Exist does a urldecode with the parameters of the request! :)
(: Get the username and the password passed by the server :)
let $userName := request:get-parameter("userName", ()) 
let $password := request:get-parameter("userPassword", ()) 
(: Login the user :)
let $userLogin := xmldb:login('/db', $userName, $password)

return 
	ajax:getFileXML($encodedFile)