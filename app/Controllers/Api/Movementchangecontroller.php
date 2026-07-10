<?php

namespace App\Controllers\Api;
//use App\Controllers\BaseController;

use App\Helpers\VANumberHelper;
use App\Models\Movementchangemodel;


date_default_timezone_set("Asia/Calcutta");
class Movementchangecontroller extends BaseApiController
{
public function getallgateinandoutdetail()
  {
    $filters = $this->request->getJSON();
    // print_r($filters);exit;
    $model = new Movementchangemodel();
    $res = $model->getallgateinandoutdetail($filters);
    $res1 = $model->GetPurchaseInfoData($filters);
    $mergedResult = array_merge($res, $res1);
    return $this->sendSuccessResult($mergedResult);;
  }

  public function movementtype()
  {
    $model = new Movementchangemodel();
    $res = $model->movementtype();
    // print_r($res);exit;

    return $this->sendSuccessResult($res);
  }
  public function moduleType()
  {
    $filters = $this->request->getJSON();
    $type=$filters->movementType;
    // print_r($type);exit;
    $model = new Movementchangemodel();
    $res = $model->moduletype($type);
    // print_r($res);exit;

    return $this->sendSuccessResult($res);
  }

  public function saveMovementChange()
  {
      $postdata = $this->request->getJSON();
    
      $model = new Movementchangemodel();
      $res = $model->saveMovementChange($postdata);
      
      // Check if $res contains both $InsID and $message or just $InsID
      if (is_array($res) && isset($res[1])) {
          $InsID = $res[0];
          $message = $res[1];
          $response = [
              'InsID' => $InsID,
              'message' => $message
          ];
      } elseif ($res) {
          $response = [
              'InsID' => $res,
              'message' => 'Data inserted successfully'
          ];
      } else {
          $response = [
              'success' => false,
              'message' => 'Failed to insert data'
          ];
      }
      // print_r($response);exit;
  
      return $this->respond($response);
  }

  public function getVehicleDetails()
  {
      $filters = $this->request->getJSON();
      $model = new Movementchangemodel();
      $res = $model->getVehicleDetails($filters);
  
      // if (!$res) {
      //     return $this->sendErrorResult('No data found for the provided vehicle.');
      // }
  
      switch ($res[0]['moduleStatusId']) {
          case 0:
          case 1:
          case 4:
              $res[0]['contact_person'] = $res[0]['FIRST_NAME'];
              $res[0]['contact_person_no'] = $res[0]['MOBILE_NUMBER'];
              break;
          case 2:
              $res[0]['contact_person'] = $res[0]['Weighment'];
              $res[0]['contact_person_no'] = $res[0]['WIMOBILE_NUMBER'];
              break;
          case 3:
              $res[0]['contact_person'] = $res[0]['Person'] ?? $res[0]['FIRST_NAME'];
              $res[0]['contact_person_no'] = $res[0]['LIMOBILE_NUMBER'] ?? $res[0]['MOBILE_NUMBER'];
              break;
          default:
              $res[0]['contact_person'] = $res[0]['FIRST_NAME'];
              $res[0]['contact_person_no'] = $res[0]['MOBILE_NUMBER'];
              break;
      }
  
      if (isset($res[0]['contact_person']) && isset($res[0]['contact_person_no'])) {
          return $this->sendSuccessResult($res);
      } else {
          $res1 = $model->getVehicleDetailsLoadUnload($filters);
          if ($res1) {
              return $this->sendSuccessResult($res1);
          } else {
              return $this->sendErrorResult('No Entry Pending For this Vehicle');
          }
      }
  }
}  
