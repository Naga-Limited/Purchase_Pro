<?php 
namespace App\Helpers;

class SessionHelper
{ 
    public static function getUser(){
        return session("User");
    }
    public static function getUserName(){
       return  SessionHelper::getUser()->username;
    }
    public static function getUserId(){
       return  SessionHelper::getUser()->USERID;
    }
}
