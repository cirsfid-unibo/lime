
(: Declare the namespace for the ajax functions in wawe :)
declare namespace ajax = "http://www.wawe.com/ajax";

(: Declare the namespace for the advanced functions :)
declare namespace functx = "http://www.functx.com";

(: Declare the namespace for functions of the exist xml db :)
declare namespace xdb="http://exist-db.org/xquery/xmldb";

(: Get the username and the password passed by the server :)
declare variable $userName := request:get-parameter("userName", ());
declare variable $encodedUserName := replace($userName, '@', '.');
declare variable $password := request:get-parameter("password", ());

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

(: Return document namespace :)
declare function functx:namespace 
        ($path as xs:string?)  
        as xs:string 
        {
            namespace-uri(doc($path)/*)
        };

(: Calls the function that lists the collections getting the collection name from the given GET parameter :)
declare variable $collection := replace(request:get-parameter("collection", ()), ' ', '%20');
declare variable $relativePath := functx:substring-after-last($collection, $encodedUserName);

(: Login the user :)
declare variable $userLogin := xmldb:login('/db', $userName, $password);

(: This function return an XML containig all the collections and the files in the given collection :)
declare function ajax:display-collection($collection as xs:string, $username as xs:string) as 
element()* {
    let $encodedUsername := replace($userName, '@', '.')
(:    let $userPath := substring-after($collection, concat($encodedUsername, '/')):)
    return ( 
        
        
		(: Iterate all the collection in the given collection :)
        for $child in xdb:get-child-collections($collection) order by $child 
       
        (: Returns an XML fragment describing the collection :)
        return
            (: Hide the autosave temporary folder :)
            if (contains($child, 'autosave')) then
                ()
            else
                let $childName := replace(replace($child, '([a-z]{3})((%40)|(\.))','$1@'), '%3A',':')
                return
                <node>
    				<id>{concat($collection, '/', replace($child,'%40','@'))}</id> 
                    (: The language is in the uri as lang@ with @ replaced by a dot :)
                    <text>{
                        $childName
                    }</text>
                    <path>{concat($relativePath, '/', replace($child,'%40','@'))}</path> 
    				<cls>folder</cls>
    				<leaf></leaf>
                </node>,

        (: Iterate all the files in the given collection :)
        for $child in xdb:get-child-resources($collection)
        let $mimetype := xdb:get-mime-type(xs:anyURI(concat($collection, '/', $child)))
        let $path := concat($collection, '/', replace($child,'%40','@'))
        (: Hide the autosave temporary folder :)
        where not(contains($child, '.metadata'))
        order by $child 

        (: Returns an XML fragment describing the file :)
        return
            <node> 
                <id>{ $path }</id> 
                <text>{replace($child,'%40','@')}</text> 
                <type>resource</type> 
                <path>{concat($relativePath, '/', replace($child,'%40','@'))}</path>
				<cls>file</cls>
				<leaf>1</leaf> 
                <mime>{$mimetype}</mime>
                <namespace>
                    { if ($mimetype = 'application/xml') then functx:namespace($path) else () }
                </namespace>
                <size>{fn:ceiling(xdb:size($collection, $child) div 1024)}</size> 
            </node> 
     ) 
}; 

(: Temporary :)
let $something := ()

return 
	<ajax-response> 
    { 
        ajax:display-collection($collection, $userName) 
    } 
    </ajax-response> 