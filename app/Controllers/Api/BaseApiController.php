<?php namespace App\Controllers\Api;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
class BaseApiController extends ResourceController
{
    private $privateKey = "mysec";
    protected function getUser(){
        $authHeader = $this->request->getServer("HTTP_AUTHORIZATION");
        return JWT::decode($authHeader, $this->privateKey, array('HS256'));
    }

    protected function generateToken($res){        
        $token = JWT::encode($res, $this->privateKey);
        return $token;
    }

    protected function sendSuccessResult($res){
        return $this->respond(["success" => 1, "results" => $res]);
    }
    
    protected function sendErrorResult($error=null, $ex=null){
        return $this->respond(["success" => 0, "error" => $error, "ex"=>$ex]);
    }
}