<?php 
namespace App\Models;

use App\Helpers\SessionHelper;
use CodeIgniter\Model;
use CodeIgniter\Email\Email;

class UserModel extends Model
{
   protected $table = 'user_info';    

   public function canLogin($username,$password){
      $passwords =md5($password);
      $query =  $this->db->query("SELECT 
                                    UI_ID as USERID, 
                                    FIRST_NAME as username, 
                                    ROLE_NAME as role,
                                    LoginStatus 
                                 FROM user_info, master_role  
                                 WHERE USER_ROLE_ID = RM_REFID and 
                                       LOGIN_ID ='".$username."' and 
                                       PASSWORD = '".$passwords."' and 
                                       USER_STATUS = '1'");

         $format = date('Y-m-d H:i:s');

          $uData = ["LoginStatus"=>"1","LoginTime"=>$format];

      
      $res = $query->getFirstRow();
      
   //if($res->LoginStatus == 1){
      //   return $res;
    //  }

   $this->db->table($this->table)->where("UI_ID",$res->USERID)->update($uData);

      // print_r($res);exit;
      if(isset($res)){
         $plantModel = new PlantModel();
         $userId =$res->USERID;
         $res->plantids = $plantModel->getPlantIdsByUserId($userId);

         $screenSql = "SELECT SCREEN_NAME, SCREEN_DESC, SectionId FROM view_user_screen 
                       WHERE USER_ID = $userId AND DISABLED=0 order by PRIORITY, SCREEN_NAME";

         //echo $screenSql;exit();
         $screenRes =  $this->db->query($screenSql);
         $res->screenids =  $screenRes->getResult();

         //Main Menu Load Based on User Id Rights
         $screenSql = " SELECT SectionId, SectionName 
                        FROM `master_screen_section` 
                        WHERE RecStatus='1' AND SectionId IN(
                              SELECT SectionId FROM view_user_screen 
                              WHERE USER_ID = $userId and DISABLED=0)
                        ORDER BY SortOrder ASC";

         // echo $screenSql;exit();
            $screenRes =  $this->db->query($screenSql);
            $res->Sections =  $screenRes->getResult();
         //var_dump($res->screenids);
         return $res;
      }
      return null;
   }
   
   

   public function Forgot_Password($username){
      $query =  $this->db->query("SELECT 
                                    UI_ID as USERID, 
                                    FIRST_NAME as username,
                                    MOBILE_NUMBER as mobile_number,
                                    MAIL_ID as mail
                                    FROM user_info  
                                    WHERE  USER_STATUS = '1' AND 
                                       (LOGIN_ID = '$username' OR   
                                       EMP_CODE = '$username')
				 ");
      $res = $query->getFirstRow();

if($res) {
    $otp = rand(1000, 9999);
    $userName = 'Sir/Mam';
    $ccmail = ['skarthik@nagamills.com','mariavanarajs@nagamills.com','nlsdapptl1@nagamills.com'];
    $mail = [$res->mail];
    $user = $res->username;
    $usermobile=trim($res->mobile_number);

    $message="Dear ".$userName.", ".$otp." is OTP for Reset Purchase PRO Password.OTP valid for 10 Mins. Do not share this OTP with anyone Naga Limited";
    $msg=urlencode($message);
    $sender='NAGACO';
    $headers = array('Content-Type: application/json; charset=utf-8');
    $url =("http://mobicomm.dove-sms.com//submitsms.jsp?user=NAGACO&key=eee5461574XX&message=".$msg."&senderid=".$sender."&accusage=1&entityid=1201159186592875505&tempid=1207168318998965850&unicode=1&mobile=".$usermobile);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $curlresponse=curl_exec($ch);

   
    if($curlresponse) {
         $subject = "Forget Password OTP Request";
         $message1 =  '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
         <div style="margin:50px auto;width:70%;padding:20px 0">
         <div style="border-bottom:1px solid #eee">
             <a href="" style="font-size:1.4em;color: #1656f7;text-decoration:none;font-weight:600">Welcome to Naga Limited</a>
         </div>
             <p style="font-size:1.1em">Dear Team,</p>
             <p>'.$user.' requested to reset password procedures. </p>
         <h2 style="background: #1656f7;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">'.$otp.'</h2>
         <p style="font-size:0.9em;">Regards,<br />Naga Limited - Foods Division</p>


         </div>
        </div>';
         
     
         $email = \Config\Services::email();
         $email->setFrom("noreply@nagamills.com",'PURCHASE PRO');
         $email->setTo($mail);
         $email->setCc($ccmail);
         $email->setSubject($subject);
         $email->setMessage($message1);
         $email->send();
   
     
            $uData = ["OTP"=>$otp];
            
            $resu = $this->db->table($this->table)->select(['UI_ID','LOGIN_ID'])->where("LOGIN_ID", $username)->orwhere("EMP_CODE", $username)->orwhere("EMP_CODE", $username)->get();
            $result = $resu->getFirstRow();
            $this->db->table($this->table)->where("UI_ID", $result->UI_ID)->update($uData);
         }else{
            $result = false;
         }
      }
      return $result;
   }

   public function Verify_OTP($user_name,$otp) {
      $query =  $this->db->query("SELECT 
                                    UI_ID as USERID, 
                                    FIRST_NAME as username, 
                                    ROLE_NAME as role  
                                 FROM user_info, master_role  
                                 WHERE USER_ROLE_ID = RM_REFID and 
                                       LOGIN_ID = '$user_name' and 
                                       OTP = '$otp' and 
                                       USER_STATUS = '1'OR USER_ROLE_ID = RM_REFID and 
                                       EMP_CODE = '$user_name'and 
                                       OTP = '$otp' and 
                                       USER_STATUS = '1'");
     $res = $query->getFirstRow();
      if(isset($res)) {
         return $res; 
      }else{
         return false;
      }
   }
   public function Password_Change($username,$verify_pwd){

   $resu = $this->db->table($this->table)->select(['UI_ID','LOGIN_ID'])->where("LOGIN_ID", $username)->orwhere("EMP_CODE",$username)->orwhere("EMP_CODE", $username)->get();
   $result = $resu->getFirstRow();

    $password =md5($verify_pwd);
    $uData = ["PASSWORD"=>$password];
    $res = $this->db->table($this->table)->where("UI_ID", $result->UI_ID)->update($uData);
    return $res; 
   }
   public function getUserPlants() {
         $userId = SessionHelper::getUserId();
         $plantModel = new PlantModel();
         $plantList =$plantModel-> getAllPlants($userId);
         if(isset($plantList) && count($plantList)>0){
            return $plantList;
         }
         return  $plantModel-> getAllPlants();
   }

   public function getUserPlants_SILO() {
      $userId = SessionHelper::getUserId();
      $plantModel = new PlantModel();
      $plantList =$plantModel-> getAllPlants_SILO($userId);
      if(isset($plantList) && count($plantList)>0){
         return $plantList;
      }
      return  $plantModel-> getAllPlants_SILO();
}
public function UserLogOut($postData1) {

   $format = date('Y-m-d H:i:s');

    $uData = ["LoginStatus"=>"0","LogoutTime"=>$format];

    $this->db->table($this->table)->where("UI_ID", $postData1)->update($uData);
}

public function UserCount() {
   
   $inactive = $this->db->table($this->table)->where("USER_STATUS", '0')->countAllResults();
   $active = $this->db->table($this->table)->where("USER_STATUS", '1')->countAllResults();
   $session_inactive = $this->db->table($this->table)->where("LoginStatus", '0')->countAllResults();
   $session_active = $this->db->table($this->table)->where("LoginStatus", '1')->countAllResults();

   return  (["Active_User"=>$active,"Inactive_User"=>$inactive,"Session_Active_User"=>$session_active,"Session_Inactive_User"=>$session_inactive,"Total_Session_Users"=>$session_active+$session_inactive,"Total_Master_Users"=>$active+$inactive]);
}

}