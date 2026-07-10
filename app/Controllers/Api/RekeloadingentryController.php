<?php
namespace App\Controllers\Api;
//use App\Controllers\BaseController;

use App\Helpers\VANumberHelper;
use App\Models\RekeloadingentryModel;


date_default_timezone_set("Asia/Calcutta");
class RekeloadingentryController extends BaseApiController
{
    public function getstatelist()
    {
        $master = new RekeloadingentryModel();

        return $this->sendSuccessResult($master->getstatelist());
    }

    public function getraketypelist()
    {
  
      $model = new RekeloadingentryModel();
      $res = $model->getraketypelist();
      // print_r($res);exit;
  
      return $this->sendSuccessResult($res);;
    }
    public function getunloadingloclist()
    {
  
      $model = new RekeloadingentryModel();
      $res = $model->getunloadingloclist();
      // print_r($res);exit;
  
      return $this->sendSuccessResult($res);;
    }
    public function submitLoadingDetails()
    {
        $postData = $this->request->getJSON();
        $fnrnumber=$postData->fnrNumber;
        $model = new RekeloadingentryModel();

        $existingEntry = $model->getcountfnrnumber($fnrnumber);
 
    if ($existingEntry!='') {
        // If the RR number already exists, return an error response
        return $this->sendErrorResult("FNR number already exists.");
    }

        $res = $model->submitLoadingDetails($postData);
        if ($res != '') {
            $response = [
                'success' => true,
                'message' => 'Data inserted successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Data not inserted ',
            ];
        }
        return $this->response->setJSON($response);
    }

    public function getrakeentrydetails()
    {

        $getdate = $this->request->getJSON();
        $fromDate = $getdate->fromDate;
        $toDate = $getdate->toDate;
        $Model = new RekeloadingentryModel();
        $data = $Model->getrakeentrydetails($fromDate, $toDate);
        return $this->sendSuccessResult($data);
    }

    public function updatestautsforloadingsate()
    {
        $postData=$this->request->getJSON();   
        // print_r($postData);exit();  
        $model = new RekeloadingentryModel();
        $res=$model->updatestautsforloadingsate($postData);     
         return $this->sendSuccessResult($res);
    }
    public function rejectEntry()
    {
        $postData=$this->request->getJSON();   
        // print_r($postData);exit();  
        $model = new RekeloadingentryModel();
        $res=$model->rejectEntry($postData);     
         return $this->sendSuccessResult($res);
    }
    
    public function recivieddateupdate()
    {
        $postData=$this->request->getJSON();   
        // print_r($postData);exit();  
        $model = new RekeloadingentryModel();
        $res=$model->recivieddateupdate($postData);     
         return $this->sendSuccessResult($res);
    }

    public function getloadingstatedetails()
    {
        $postData = $this->request->getJSON();

        $model = new RekeloadingentryModel();
        $res = $model->getloadingstatedetails();

        return $this->sendSuccessResult($res);
    }
     public function getdelayreasontimedetails()
    {
        $postData = $this->request->getJSON();

        $model = new RekeloadingentryModel();
        $res = $model->getdelayreasontimedetails();

        return $this->sendSuccessResult($res);
    }
    public function Insertstatedetails()
    {
        $postData = $this->request->getJSON();
        $state_name=$postData->state_name;
        $model = new RekeloadingentryModel();
        $existingEntry = $model->getcountstate_name($state_name);
 
        if ($existingEntry!='') {
            // If the RR number already exists, return an error response
            return $this->sendErrorResult("State already exists.");
        }
        $res = $model->Insertstatedetails($postData);
        if ($res != '') {
            $response = [
                'success' => true,
                'message' => 'Data inserted successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Data not inserted ',
            ];
        }
        return $this->response->setJSON($response);
    }
    
    public function Insertdelayreasontimedetails()
    {
        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $VehicleType=$postData->VehicleType->label;
        $plantcode=$postData->plantcode;
        $model = new RekeloadingentryModel();
        $existingEntry = $model->getcountvehicletype($VehicleType,$plantcode);
 
        if ($existingEntry!='') {
            // If the RR number already exists, return an error response
            return $this->sendErrorResult("Vehicle Type already exists.");
        }
        $res = $model->Insertdelayreasontimedetails($postData,$VehicleType);
        if ($res != '') {
            $response = [
                'success' => true,
                'message' => 'Data inserted successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Data not inserted ',
            ];
        }
        return $this->response->setJSON($response);
    }

    public function getvehicletypelist()
    {
  
      $model = new RekeloadingentryModel();
      $res = $model->getvehicletypelist();
      // print_r($res);exit;
  
      return $this->sendSuccessResult($res);;
    }

    public function updatestautsfordelayreasontime()
    {
        $postData=$this->request->getJSON();   
        // print_r($postData);exit();  
        $model = new RekeloadingentryModel();
        $res=$model->updatestautsfordelayreasontime($postData);     
         return $this->sendSuccessResult($res);
    }

    public function getDelayReasons()
  {
    $model = new RekeloadingentryModel();
    $res = $model->getDelayReasons();
    return $this->sendSuccessResult($res);;
  }

  public function getplantcode()
    {
        $master = new RekeloadingentryModel();
        // print_r($userRole);exit;

        return $this->sendSuccessResult($master->getplantcode());
    }


}
