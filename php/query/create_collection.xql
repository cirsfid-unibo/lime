xquery version "3.0";

let $collectionName := request:get-parameter('collectionName', ())

return 
    xmldb:create-collection('/', $collectionName)