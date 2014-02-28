xquery version "3.0";

let $groupName := request:get-parameter('groupName', ())

return 
    sm:create-group($groupName)