<?php 
namespace App\Models;

use App\Helpers\SessionHelper;
use CodeIgniter\Model;

class UserModel extends Model
{
   public function canLogin($username,$password){
      $password =md5($password);
      $query =  $this->db->query("SELECT 
                                    UI_ID as USERID, 
                                    FIRST_NAME as username, 
                                    ROLE_NAME as role  
                                 FROM user_info, master_role  
                                 WHERE USER_ROLE_ID = RM_REFID and 
                                       LOGIN_ID = '$username' and 
                                       PASSWORD='$password'and 
                                       USER_STATUS = '1'");

      //https://codeigniter4.github.io/userguide/database/results.html
      $res = $query->getFirstRow();
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
}