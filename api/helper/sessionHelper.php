<?php

//header('Access-Control-Allow-Origin: *');
//header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
//header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");


// session_start();
$session = session();
$user = $session->get("User");
$loggedUserId="";
$loggedUserName="";
$loggedUserRole="";

if(!isset($user )){
    /*Mohan REMOVE 18092021 Commented for session enable * /
    echo json_encode(["success" => 1, "user" => ""]);
    exit();*/
    //$user=array(["USERID"=>"1","username"=>"Super Admin"]);
    //$session->set_userdata($user);
    $loggedUserId = $_SESSION["USERID"];
    $loggedUserName = $_SESSION["FIRSTNAME"];
    $loggedUserRole = $_SESSION["USERROLE"];
}
else{
    $loggedUserId = $user->USERID;// $_SESSION["USERID"];
    $loggedUserName =  $user->username; //$_SESSION["FIRSTNAME"];
    $loggedUserName =  $user->role; //$_SESSION["USERROLE"];
}
?>
