<?php

namespace App\Controllers\Api;
//use App\Controllers\BaseController;

use App\Helpers\VANumberHelper;
use App\Models\canteentokeenmodel;

date_default_timezone_set("Asia/Calcutta");
class Canteentokeencontroller extends BaseApiController
{
  public function getshifts()
  {

    $model = new canteentokeenmodel();
    $res = $model->getshifts();
    // print_r($res);exit;

    return $this->sendSuccessResult($res);;
  }
  public function insertCanteenToken()
{
    $json = $this->request->getJSON();
    $model = new canteentokeenmodel();

    // Check if an entry already exists for the given date and shift
    $existingToken = $model->getTokenByDateAndShift($json->date, $json->Shift);
    // print_r($existingToken);exit;
    
    if ($existingToken!=0) {
        // Entry already exists for this date and shift
        $response = [
            'success' => false,
            'message' => 'A token for this shift on this date already exists',
        ];
        return $this->response->setJSON($response);
    }
    else{
    // Proceed with insertion if no existing token
    $gateid = $model->getGateid($json->created_by);
    $data = $model->getLastCourierTicNo();
    $transcation_unique_no = $data[0]['ct_unique_number'];
    $res = VANumberHelper::VANumberHelper('CT', $gateid[0]['gateCode'], $transcation_unique_no);
    
    $id = $model->insertCanteenToken($json, $res);

    if ($id != 0) {
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
}

  public function getcantentokendetail()
  {
    // Get the date from the request (ensure you validate and sanitize it)
    $date = $this->request->getVar('date');

    $model = new canteentokeenmodel();
    $res = $model->getcantentokendetail($date); // Pass the date parameter
    $count = count($res);

    return $this->sendSuccessResult($res);
  }
  public function getcantentokendetailbydata()
  {
    $json = $this->request->getJSON();
    $fromDate = $json->fromDate;
    $shift = $json->shift;
    // print_r($json);exit;
    $model = new canteentokeenmodel();
    $res = $model->getcantentokendetailbydata($fromDate, $shift);
    $count = count($res);

    return $this->sendSuccessResult($res);
  }
  public function getcanteentookenById()
  {
    $postData = $this->request->getJSON();
    $model = new canteentokeenmodel();
    $res = $model->getcanteentookenById($postData->id);
    return $this->sendSuccessResult($res);;
  }
  public function updateCanteenToken()
  {
    $postData = $this->request->getJSON();
    // print_r($postData);exit; 
    $model = new canteentokeenmodel();
    $res = $model->updateCanteenToken($postData);
    // print_r($res);exit;
    if ($res != '') {
      $response = [
        'success' => true,
        'message' => 'Data saved successfully',
      ];
    } else {
      $response = [
        'success' => false,
        'message' => 'Failed to save data',
      ];
    }
    return $this->sendSuccessResult($response);;
  }

  public function updatestatus()
  {

    $postData = $this->request->getJSON();
    // print_r($postData);exit;
    $model = new canteentokeenmodel();
    $res = $model->updatestatus($postData);

    return $this->sendSuccessResult($res);
  }
  public function updaterejectstatus()
  {

    $postData = $this->request->getJSON();

    $model = new canteentokeenmodel();
    $res = $model->updaterejectstatus($postData);

    return $this->sendSuccessResult($res);
  }
  public function getcantentokendetailforreport()
  {

    $postData = $this->request->getJSON();
    // print_r($postData);exit;

    $model = new canteentokeenmodel();
    $res = $model->getcantentokendetailforreport($postData);

    return $this->sendSuccessResult($res);
  }
}
