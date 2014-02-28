xquery version "3.0";
declare namespace fn = "http://www.w3.org/2005/xpath-functions";
declare namespace exist = "http://exist.sourceforge.net/NS/exist"; 
declare namespace request="http://exist-db.org/xquery/request";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";

(: This function return an XML containig the document  :)
declare function local:getDocument($xmlFile as xs:string) as 
node()* { 
     ( 
        let $doc := doc($xmlFile)
      	return
			 $doc
	) 
};

let $documents := request:get-parameter("docs", ())
let $docs := tokenize($documents, ';')

return
            <documents>
            {
               for $doc in $docs
               return
                   local:getDocument($doc)
            }
            </documents>

