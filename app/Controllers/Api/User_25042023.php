<?php namespace App\Controllers\Api;
use App\Models\UserModel;

class User extends BaseApiController
{
    public function canLogin(){
      $postData = $this->request->getJSON();

      $model = new UserModel();
      $res = $model->canLogin($postData->user_name,$postData->password);
      if($res){
        $session = session();
        $session->set("User",$res);
        $_SESSION["USERID"] = $res->USERID;
        $_SESSION["FIRSTNAME"] = $res->username;
        $_SESSION["USERROLE"] = $res->role;

        $res->token =$this->generateToken($res);
        return $this->sendSuccessResult( $res);
      }
      return $this->sendErrorResult("Invalid Login");
    }
    
    
    public function getUserPlants(){
      $res =  (new UserModel())->getUserPlants();
      return $this->sendSuccessResult($res);
    }
    public function getUserPlants_SILO(){
      $res =  (new UserModel())->getUserPlants_SILO();
      return $this->sendSuccessResult($res);
    }
}