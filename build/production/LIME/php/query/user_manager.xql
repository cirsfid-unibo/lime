xquery version "3.0";
(: Declare the namespace for the ajax functions in wawe :)
declare namespace ajax = "http://www.wawe.com/ajax";

(: This function is used to authenticate a user in the database :)
declare function ajax:auth-user() as 
element()* { 
     ( 
        (: Get the username and the password passed by the server :)
        let $userName := request:get-parameter("userName", ()) 
        let $password := request:get-parameter("password", ()) 
        let $login := xmldb:authenticate('/db', $userName, $password)
        
         (: Get the users collection :)
        let $usersCollection := request:get-parameter("existUsersDocumentsCollection", ())
       
        return 
            if($login) then
                <ajax-response>
                    <success>{$login}</success>
                    <username>{$userName}</username>
                    <userCollection>{concat($usersCollection, '/', replace($userName,'@','.'))}</userCollection>
                    <msg>NO_ERR_0</msg>
                    <description>Login success</description>
                </ajax-response>
            else
                <ajax-response>
                    <success>{$login}</success>
                    <username>{$userName}</username>
                    <msg>ERR_0</msg>
                    <description>Login failed</description>
                </ajax-response>
                
     ) 
};

(: This function is used to authenticate a user in the database :)
declare function ajax:change-examples-permissions($examplesCollection as xs:string, $userName as xs:string) as 
element()* { 
    ( 
        (: Get the user group :)
        let $userGroup := request:get-parameter("existUsersGroup", ()) (: TODO: BUG! Here the group is wawe_users but it doesn't exist by default :)
                          
        (: list all the documents in THE collection  :)
        for $child in xmldb:get-child-collections($examplesCollection)
            (:let $setECollectionPermissions := sm:chmod(concat($examplesCollection, '/' ,$child), 'group=+read,+write,+execute,other=-read,-write,-execute') :)
            
            let $setECollectionPermissions := xmldb:set-collection-permissions(concat($examplesCollection, '/' ,$child), $userName,$userGroup,util:base-to-integer(0700, 8))
            (:let $childsPermissions := ajax:change-examples-permissions(concat($examplesCollection, '/' ,$child),$userName):)
            for $fileChild in xmldb:get-child-resources(concat($examplesCollection, '/' ,$child))
            
                let $setECollectionPermissions := xmldb:set-resource-permissions(concat($examplesCollection, '/' ,$child), $fileChild,$userName,$userGroup,util:base-to-integer(0700, 8))
            
        return <success>true</success>
    )
};

(: This creates the new collection :)
declare function ajax:create-collection($collectionName as xs:string) as 
element()* { 
     ( 
        (: Get the users collection :)
        let $usersCollection := request:get-parameter("existUsersDocumentsCollection", ())
        
        (: Get the collection name :)
        let $collectionRealName := replace($collectionName,'@','.')
       
        (: Get the user group :)
        let $userGroup := request:get-parameter("existUsersGroup", ()) 
        
        (: Get the samples documents collection :)
        let $sampleDocumentsCollection := request:get-parameter("existSampleDocumentsCollection", ()) 
        
        (: Create the user collection :)
        let $collectionCreated := xmldb:create-collection($usersCollection, $collectionRealName)
        let $setCollectionPermissions := sm:chmod($collectionCreated, 'group=-read,-write,-execute,other=-read,-write,-execute')
        let $setCollectionUser := sm:chown($collectionCreated, $collectionName)
        let $setCollectionGroup := sm:chgrp($collectionCreated, $userGroup)
        
        (: Copy the samples documents in the user collection :)
        let $examplesCollectionCreated := xmldb:create-collection($collectionCreated,'examples')
        let $userDocumentCollectionCreated := xmldb:create-collection($collectionCreated,'my_documents')
        let $setECollectionPermissions := sm:chmod($examplesCollectionCreated, 'group=-read,-write,-execute,other=-read,-write,-execute')
        let $setECollectionPermissions := sm:chmod($userDocumentCollectionCreated, 'group=-read,-write,-execute,other=-read,-write,-execute')
        let $setECollectionUser := sm:chown($examplesCollectionCreated, $collectionName)
        let $setECollectionUser := sm:chown($userDocumentCollectionCreated, $collectionName)
        let $setECollectionGroup := sm:chgrp($examplesCollectionCreated, $userGroup)
        let $setECollectionGroup := sm:chgrp($userDocumentCollectionCreated, $userGroup)
        let $examplesCollection := xmldb:copy($sampleDocumentsCollection, concat($usersCollection, '/', $collectionRealName)) 
        
        (: Checks if the collection was successfully created :)
        let $isCollectionCreated := xmldb:collection-available($collectionCreated)
        
        (: Change the owner and the permissions for all the files in the examples :)
        let $examplesPermissionChange := ajax:change-examples-permissions($examplesCollectionCreated,$collectionName)
        
        return 
            if ($isCollectionCreated) then 
                <ajax-response>
                    <success>true</success>
                    <username>{$collectionName}</username>
                    <userCollection>{$collectionCreated}</userCollection>
                    <msg>NO_ERR_1</msg>
                    <description>The user was successful created on the database</description>
                </ajax-response>
             else
                <ajax-response>
                    <success>false</success>
                    <username>{$collectionName}</username>
                    <userCollection>{$collectionCreated}</userCollection>
                    <msg>ERR_2</msg>
                    <description>The collection for the user cannot be created. Try later</description>
                </ajax-response> 
     )
};


(: This creates the new user and collection :)
declare function ajax:create-user-and-collection($userName as xs:string, $password as xs:string) as 
element()* { 
     (
        (: Get the user group :)
        let $userGroup := request:get-parameter("existUsersGroup", ())
        
        (: Create the user :)
        let $userCreated := sm:create-account($userName, $password, $userGroup)
        
        (: Checks if the user was created :)
        let $userExists := sm:user-exists($userName)
        
        (: The user cannot be created on the server :)
        return 
            if(not($userExists)) then 
                <ajax-response>
                    <success>false</success>
                    <username>{$userName}</username>
                    <msg>ERR_2</msg>
                    <description>The user cannot be created. Try later</description>
                </ajax-response>
            else
                ajax:create-collection($userName)
     )
};

(: This function is used to register a user in the database :)
declare function ajax:register-user() as 
element()* { 
     ( 
            
        (: Get the username and the password passed by the server :)
        let $userName := request:get-parameter("userName", ()) 
        let $password := request:get-parameter("password", ())
        
        (: Check if the user already exists :)
        let $userExists := sm:user-exists($userName)
        
        return 
            (: The user already exists on the server :)
            if ($userExists) then
                <ajax-response>
                    <success>false</success>
                    <username>{$userName}</username>
                    <msg>ERR_1</msg>
                    <description>User already exists</description>
                </ajax-response>
            (: The user does not exist on the server, crate it :)
            else
                (: Create the user and the collection :)
                ajax:create-user-and-collection($userName,$password)
     ) 
};

(:  Get the requested action :)
let $requestedAction := request:get-parameter("requestedAction", ())

(: Do something basing on the requested action :)
return 
    if($requestedAction eq 'Login')
        then ajax:auth-user()
    else if($requestedAction eq 'Create_User')
        then ajax:register-user()
    else
        <ajax-response>
            <success>false</success>
            <msg>No requested action found</msg>
        </ajax-response>