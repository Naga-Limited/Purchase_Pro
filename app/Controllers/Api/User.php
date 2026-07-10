<?php namespace App\Controllers\Api;
use App\Models\UserModel;

class User extends BaseApiController
{
    public function canLogin(){
      $postData = $this->request->getJSON();

      //print_r($postData);
      //exit();
      $model = new UserModel();
      $res = $model->canLogin($postData->user_name,$postData->password);
      // print_r($res->LoginStatus);exit;
     // if($res->LoginStatus == 1){
       // return $this->sendErrorResult("Duplicate Login");
    //  }
      if($res){
        $session = session();
        $session->set("User",$res);
        $_SESSION["USERID"] = $res->USERID;
        $_SESSION["FIRSTNAME"] = $res->username;
        $_SESSION["USERROLE"] = $res->role;

        $res->token =$this->generateToken($res);
        return $this->sendSuccessResult( $res);
      }
      return $this->sendErrorResult("Invalid User Name And Password");
    }
    
    public function ForgotPassword(){
      $postData = $this->request->getJSON();

      // print_r($postData);
      // exit();
      $model = new UserModel();
      $res = $model->Forgot_Password($postData->user_name);
      if($res){
        return $this->sendSuccessResult($res);
      }
      return $this->sendErrorResult("Please Enter Correct User Name");
    }
    
    public function Verify_OTP(){
      $postData = $this->request->getJSON();
      $model = new UserModel();
      $res = $model->Verify_OTP($postData->user_name,$postData->OTP);
      if($res){
        return $this->sendSuccessResult($res);
      }
      return $this->sendErrorResult("Please Enter OTP");
    }
    public function Password_Change(){
      $postData = $this->request->getJSON();
      $model = new UserModel();
      $res = $model->Password_Change($postData->user_name,$postData->verify_pwd);
      if($res){
        return $this->sendSuccessResult($res);
      }
      return $this->sendErrorResult("Password is Not Matched");
    }

    public function getUserPlants(){
      $res =  (new UserModel())->getUserPlants();
      return $this->sendSuccessResult($res);
    }
    public function getUserPlants_SILO(){
      $res =  (new UserModel())->getUserPlants_SILO();
      return $this->sendSuccessResult($res);
    }

    public function UserLogOut(){
		$postData = $this->request->getJSON();
    $postData1=$postData->id;

		// print_r($this->request->getJSON());exit();

      $res =  (new UserModel())->UserLogOut($postData1);
      return $this->sendSuccessResult($res);
    }

    public function UserCount(){
      $res =  (new UserModel())->UserCount();
      return $this->sendSuccessResult($res);
    }
    public function PasswordExpire($USER_ID){
        $res =  (new UserModel())->PasswordExpire($USER_ID);
        if($res == 1){
          return $this->respond(["success" => true, "message"=> 'Please change your password']);
        }else if ($res == 0){
          return $this->respond(["success" => false, "message"=> '']);
        }
    }
}
