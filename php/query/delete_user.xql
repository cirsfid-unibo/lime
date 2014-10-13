xquery version "3.0";
(: Declare the namespace for the ajax functions in wawe :)
declare namespace ajax = "http://www.wawe.com/ajax";
declare namespace exist = "http://exist.sourceforge.net/NS/exist"; 
declare namespace request="http://exist-db.org/xquery/request";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace sm="http://exist-db.org/xquery/securitymanager";
declare option exist:serialize "method=json media-type=text/javascript";

(: Login into the DB :)
declare variable $username := request:get-parameter('username', ());
declare variable $encodedUsername := replace($username, '@', '.');
declare variable $admin := request:get-parameter('admin', ());
declare variable $password := request:get-parameter('password', ());
declare variable $login := xmldb:login('/db', $admin, $password);

declare variable $usersDocuments := '/db/wawe_users_documents/';
declare variable $usersPreferences := '/db/wawe_users/';


(: Delete the user :)
let $a := xmldb:delete-user($username)
    
(: Delete the group :)
(:let $b := sm:delete-group($username):)

(: Delete the user's collections :)
let $documents := concat($usersDocuments, $encodedUsername)
let $preferences := concat($encodedUsername, '.xml')

let $c := xmldb:remove($documents)
let $d := xmldb:remove($usersPreferences, $preferences)

return concat('User ', $username, ' correctly deleted')