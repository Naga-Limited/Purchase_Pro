<?php

namespace App\Controllers\Api;
//use App\Controllers\BaseController;

use App\Helpers\VANumberHelper;
use App\Models\AddMailModel;
use App\Models\canteentokeenmodel;

date_default_timezone_set("Asia/Calcutta");
class AutoMailMaster extends BaseApiController
{
  
  public function insertAutoMail(){
      $json = $this->request->getJSON();
      $model = new AddMailModel();
      $data = array (
        'to_mail'=> $json->to_mail,
        'cc_mail'=> $json->cc_mail,
        'bcc_mail'=> $json->bcc_mail,
        'plant_id'=> $json->plant_id,
        'status'=> $json->isActive,
        'division'=> $json->division,
        'created_by'=> $json->userInfoId,
      );
      $id = $model->insertAutoMail($data);
      if ($id) {
          $response = [
              'success' => true,
              'message' => 'Data inserted successfully',
          ];
      } else {
          $response = [
              'success' => false,
              'message' => 'Failed to insert data',
          ];
      }

      return $this->response->setJSON($response);
    
  }
  public function getMailDetails(){
      $model = new AddMailModel();
      $res = $model->getMailDetails();  
      return $this->sendSuccessResult($res);
  }
  public function updateMailDetails(){
      $json = $this->request->getJSON();
      $data = array (
        'to_mail'=> $json->to_mail,
        'cc_mail'=> $json->cc_mail,
        'bcc_mail'=> $json->bcc_mail,
        'plant_id'=> $json->plant_id,
        'status'=> $json->status,
        'division'=> $json->division,
        'updated_by'=> $json->userInfoId,
      );
      $model = new AddMailModel();
      $res = $model->updateMailDetails($data,$json->id);  
      if ($res) {
        return $this->sendSuccessResult("Update successful");
      } else {
          return $this->sendErrorResult("Failed to update record");
      }
  }

  public function DeactivateUserScreenAccess(){
    $json = $this->request->getJSON();
    
    $model = new AddMailModel();
    $res = $model->DeactivateUserScreenAccess($json->ID,$json->status);  
    if ($res) {
        return $this->sendSuccessResult("Update successfully");
    } else {
        return $this->sendErrorResult("Failed to update record");
    }
  }

  public function insertUnmanWBMaster(){
      $json = $this->request->getJSON();
      $model = new AddMailModel();
      $data = array (
        'systemNo'=> $json->systemNo,
        'printerName'=> $json->printerName,
        'baudRate'=> 2400,
        'portName'=> $json->portName,
        'status'=> $json->status,
        'plantCode'=> $json->plantCode,
        'createdBy'=> $json->userInfoId,
        'weighbridgeName'=> $json->weighbridgeName,
        'userId'=> $json->userId,
      );
      $id = $model->insertUnmanWBMaster($data);
      if ($id) {
          $response = [
              'success' => true,
              'message' => 'Data inserted successfully',
          ];
      } else {
          $response = [
              'success' => false,
              'message' => 'Failed to insert data',
          ];
      }

      return $this->response->setJSON($response);
    
  }
  public function getUnmanWBMasterDetails(){
      $model = new AddMailModel();
      $res = $model->getUnmanWBMasterDetails();  
      return $this->sendSuccessResult($res);
  }
  public function updateUnmanWBMaster(){
      $json = $this->request->getJSON();
      $data = array (
        'systemNo'=> $json->systemNo,
        'printerName'=> $json->printerName,
        'baudRate'=> 2400,
        'portName'=> $json->portName,
        'status'=> $json->status,
        'plantCode'=> $json->plantCode,
        'weighbridgeName'=> $json->weighbridgeName,
        'userId'=> $json->userId,
      );
      $model = new AddMailModel();
      $res = $model->updateUnmanWBMaster($data,$json->id);  
      if ($res) {
        return $this->sendSuccessResult("Update successful");
      } else {
          return $this->sendErrorResult("Failed to update record");
      }
  }
}
