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

declare namespace httpclient = "http://exist-db.org/xquery/httpclient";

(: Declare the options to save the document as html :)
declare option exist:serialize "method=json media-type=text/javascript";

let $imageName := request:get-parameter('imageName', ())
let $imageUrl := request:get-parameter('imageUrl', ())
let $collection := request:get-parameter('collection', ())
let $http-response := httpclient:get(xs:anyURI($imageUrl), false(), ()) return

let $img-mimetype := $http-response/httpclient:body/@mimetype,
    $img-data := $http-response/httpclient:body/text() return

let $saved := 
    let $imageSave := xdb:store($collection, $imageName, xs:base64Binary($img-data), $img-mimetype)
    return $imageSave

return
    <ajax-response>
        <success>true</success>
        <path>{$saved}</path>
    </ajax-response>
    