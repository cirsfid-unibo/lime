xquery version "3.0";

(: Declare the namespace for the ajax functions in wawe :)
declare namespace ajax = "http://www.wawe.com/ajax";
declare namespace exist = "http://exist.sourceforge.net/NS/exist"; 
declare namespace request="http://exist-db.org/xquery/request";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare option exist:serialize "method=json media-type=text/javascript";

(: Global request's parameters (used in many functions) :)
declare variable $collection := request:get-parameter('existUsersPreferencesCollection', ());
declare variable $userName := request:get-parameter('userName', ());
declare variable $fullName := request:get-parameter('userFullName', ());
declare variable $lastOpened := request:get-parameter('lastOpened', ());
declare variable $views := request:get-parameter('views', ());
declare variable $defaultLanguage := request:get-parameter('defaultLanguage', ());
declare variable $defaultLocale := request:get-parameter('defaultLocale', ());

declare variable $toSave := ($defaultLanguage, $defaultLocale, $lastOpened, $views);

declare variable $resetString := '%null%';

(: 
 : Return the user's preferences.
 :  :)
declare function ajax:get-user-preferences()
as node()* {
        
    let $encodedUserName := replace($userName, '@', '.')

    let $resourceName := concat($encodedUserName, '.xml')
    
    (: To check if the resource exists we have to provide the function
    with a path relative to db. E.g.: /wawe_users/resource.xml :)
    let $relativePath := concat(replace($collection, '/db', ''), '/', $resourceName)
    
    (: Check if the user has preferences set :)
    let $resourceExists := doc-available($relativePath)
    
    let $resource := doc($relativePath)
    
    return
        if ($resourceExists) then
            <ajax-response>
                <success>true</success>
                <msg>PREF_NO_ERR_0</msg>
                <description>User's preferences correctly loaded</description>
                {$resource}
            </ajax-response>
        else
            <ajax-response>
                <success>false</success>
                <msg>PREF_ERR_0</msg>
                <description>User's preferences do not exist.</description>
            </ajax-response>
};


(: 
 : Store the new user's preferences in an XML resource.
 : $newUserId: The id of the new user's preferences element
 : return: If everything worked the path to the resource. 
 : Otherwise an empty string. 
 : :)
declare function ajax:create-preferences-xml($newUserId as xs:string, $overwrite as xs:boolean)
as xs:string {

    let $encodedUserName := replace($userName, '@', '.')

    let $resourceName := concat($encodedUserName, '.xml')
    
    (: To check if the resource exists we have to provide the function
    with a path relative to db. E.g.: /wawe_users/resource.xml :)
    let $relativePath := concat(replace($collection, '/db', ''), '/', $resourceName)
    
    let $resourceExists := doc-available($relativePath)
    
    let $resource := doc($relativePath)
    
    let $userId := 
        if ($resourceExists) then 
            (: Retrieve the resource's id :)
            let $id := $resource//@id
            return $id
        else
            $newUserId

    (: Check which fields must be actually overwritten :)
    let $realLastOpened :=
        if ($lastOpened eq $resetString) then
            ''
        else
            $lastOpened
            
    let $realDefaultLanguage :=
        if ($resourceExists and string-length($defaultLanguage) eq 0) then
            $resource//defaultLanguage/text()
        else
            $defaultLanguage
            
    let $realDefaultLocale :=
        if ($resourceExists and string-length($defaultLocale) eq 0) then
            $resource//defaultLocale/text()
        else
            $defaultLocale
            
    let $realViews :=
        let $viewStrings := tokenize($views, ',')
        let $viewElements := 
            for $view in $viewStrings
                return <view>{$view}</view>
            return $viewElements
            
    let $realFullName :=
        if ($resourceExists and string-length($fullName) eq 0) then
            $resource//fullName/text()
        else
            $fullName

    (: Populate the xml template :)
    let $newUserXml := 
    <user id="{$userId}">
        <userName>{$userName}</userName>
        <lastOpened>{$realLastOpened}</lastOpened>
        <defaultLanguage>{$realDefaultLanguage}</defaultLanguage>
        <defaultLocale>{$realDefaultLocale}</defaultLocale>
        <views>{$realViews}</views>
        <fullName>{$realFullName}</fullName>
    </user>
    
    return
        if ($resourceExists and not($overwrite)) then
            ''
        else
            (: Write the new user to the DB :)
            xmldb:store($collection, $resourceName, $newUserXml)
};

(: 
 : Manipulate the request's parameters and create the actual
 : user's preferences as an XML resource into the DB.
 : return: The path to the new resource. Empty string if an error occured.
 : :)
declare function ajax:create-user-preferences()
as element()* {
    
    let $realCollection := collection($collection)
    
    let $maxId := max($realCollection//@id)
    
    let $newUserId := 
            if ($maxId) then
                $maxId+1
            else
                1
    
    (: Try to create a new preferences file for the user, do not overwrite if it exists :)
    let $newUser := ajax:create-preferences-xml($newUserId, false())
    
    return
        if ($newUser eq '') then
            <ajax-response>
                <success>false</success>
                <msg>PREF_ERR_1</msg>
                <description>Cannot create user's preferences. Try later.</description>
            </ajax-response>
        else
            <ajax-response>
                <success>true</success>
                <description>User preferences correctly created.</description>
                <msg>PREF_NO_ERR_1</msg>
                <path>{$newUser}</path>
            </ajax-response>

};

(: 
 : Set the user's preferences on a dedicated XML file
 : :)
declare function ajax:set-user-preferences()
as element()* {
  
    let $realCollection := collection($collection)
    
    let $newUserId := max($realCollection//@id)+1
    
    (: Try to create a new preferences file for the user, do not overwrite if it exists :)
    let $newUser := ajax:create-preferences-xml($newUserId, true())
    
    return  
        if ($newUser eq '') then
            <ajax-response>
                <success>false</success>
                <msg>PREF_ERR_2</msg>
                <description>Cannot set user's preferences. Try later.</description>
            </ajax-response>
        else
            <ajax-response>
                <success>true</success>
                <description>User preferences correctly set.</description>
                <msg>PREF_NO_ERR_2</msg>
                <path>{$newUser}</path>
            </ajax-response>
};

(: Login credentials (as admin) :)
let $adminUser := request:get-parameter('existAdminUser', ())
let $adminPassword := request:get-parameter('existAdminPassword', ())

(: Authenticate as admin to write into the DB :)
let $login := xmldb:login('/db', $adminUser, $adminPassword)

(:  Get the requested action :)
let $requestedAction := request:get-parameter("requestedAction", ())

(: Do something basing on the requested action :)
return 
    if($requestedAction eq 'Create_User_Preferences') then
        ajax:create-user-preferences()
            
    else if($requestedAction eq 'Set_User_Preferences') then
        ajax:set-user-preferences()
    
    else if($requestedAction eq 'Get_User_Preferences') then
        ajax:get-user-preferences()
    
    else
        <ajax-response>
            <success>false</success>
            <msg>No requested action found</msg>
        </ajax-response>