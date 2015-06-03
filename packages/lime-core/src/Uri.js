
// Todo:
// Create a class for Uri management with this interface

// var uri = new AknUri(string uri work/expression/manifestation)

// uri.country     "it"                       | Work
// uri.type        "act"                      |
// uri.subtype     "legge" (optional)         |
// uri.author      "stato" (optional)         |
// uri.date        "2014-09-12"               |
// uri.name        "2" "nomelegge" (optional) |
// uri.language    "ita"                      | Expression
// uri.version     "2015-03-12"               |
// uri.official    "official"      (optional) |
// uri.generation  "2015-04-11"    (optional) |
// uri.media       "xml"                      | Manifestation
// uri.item        "http://sinatra ... xml"   | Item

// uri.work()          -> "/akn/it/act/legge/stato/2014-09-12/2"
// uri.expression()    -> "/akn/it/act/legge/stato/2014-09-12/2/ita@2015-03-12!official/2015-04-11"
// uri.manifestation() -> "/akn/it/act/legge/stato/2014-09-12/2/ita@2015-03-12!official/2015-04-11/main.xml"
// uri.item()          -> "http://sinatra.cirsfid.unibo.it/node/documentsdb/mnardi@unibo.it/myFiles/esempio.xml"

