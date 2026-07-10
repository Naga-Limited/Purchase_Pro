<?php namespace App\Controllers\Api;
use App\Models\SDIModel;

class SupplierDispatch extends BaseApiController
{
    public function getsdiVehicleList(){
      $filter = $this->request->getJSON(true);
      //print_r($filter);
      $searchTxt=$filter['searchTxt'];
      
      $model = new SDIModel();
     // $res = $model->getSDIVehicleList();
     // $count = $model->getSDIVehicleListCount();
      $res = $model->getSDIVehicleList_new($searchTxt);
      $count = $model->getSDIVehicleListCount_new($searchTxt);
      return  $this->respond(["success" => 1, "results" => $res,"count" => $count]);
    }
    public function getsdiDetailsById(){
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->getSDIDetailById($postData->id);
      return  $this->respond(["success" => 1, "results" => $res]);
    }

    public function getsdiPOLines(){
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->getSDIPOLineItem($postData->PO_NUMBER, $postData->ZSUPPLIER_CODE);
      return  $this->respond(["success" => 1, "results" => $res]);
    }

    public function updatesdiPOLine(){
      $postData = $this->request->getJSON();

      include_once APIPATH. "/db_connection.php";  
      $Qry="SELECT SUPPLIER_ID FROM `supplier_vehical_info` where SUP_VE_REFID='".$postData->id."'";
      $SelectDispDet=mysqli_query($connect,$Qry);
      $FetchDispDet=mysqli_fetch_assoc($SelectDispDet);
      $SupplierId=$FetchDispDet['SUPPLIER_ID'];


      $model = new SDIModel();
      $res = $model->updatePoLineById($postData->id,$postData->lineItem,$postData->plantId,$SupplierId);
      return  $this->respond(["success" => $res]);
    }
    public function Deletesdi(){
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->deleteSDILineById($postData->id);
      return  $this->respond(["success" => $res]);
    }
    
    public function getPlantbysdi(){
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->getPlantBySdi($postData->poNumber,$postData->lineItem,$postData->supplierCode);
      return  $this->respond(["success" => 1, "results" => $res]);
    }

    public function gateoutRedirect(){ 
      $postData = $this->request->getJSON();
      $model = new SDIModel();
      $res = $model->updateRedirect($postData);
      return  $this->respond(["success" => 1, "results" => $res]);      
    }

}