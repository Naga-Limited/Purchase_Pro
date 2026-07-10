<?php namespace App\Controllers\Api;
use App\Helpers\SapUrlHelper;
use App\Models\FCIModel;

class FCITruckController extends BaseApiController
{
    public function getFCIPONumber(){
      $postData = $this->request->getJSON();
      $model = new FCIModel();
      $res = $model->getFCIPONumber($postData);
      return  $this->respond(["success" => 1, "results" => $res]);
    }

    public function FCI_Tripsheet_Get(){		
	$json = $this->request->getJSON();
    $ZZVEHICLE_NO = $json->Vehicle_Number ;
    $ZPO_NUMBER = $json->PO_NUMBER ;
    $urlPath ="ZFCI_TS_TRIP_DE/FCIraketripsheet?SAP-client=900&Po_No=$ZPO_NUMBER&Vehicle_No=$ZZVEHICLE_NO";
    // http://10.10.63.139:50000/ZFCI_TS_TRIP_DE/FCIraketripsheet?SAP-client=900&Po_No=2800001372&Vehicle_No=TN263145
    $result = SapUrlHelper::getWhDatas($urlPath);
    $res = json_decode($result, true);
        if(strlen($res[0]['TRIPSHEET_NO']) > 0){
            return $this->sendSuccessResult($res);
        }else{
            return $this->sendErrorResult('Please Check Tripsheet No for this vehicle...'); 
        }
	}

    public function CostType()
	{
		$res=array();
		$res[] =  array("value"=>"1","label"=>"Same Vendor");
		$res[] =  array("value"=>"2","label"=>"Different Vendor");
		return  $this->sendSuccessResult($res);
	}
   
    public function FCI_Loading_Insert()
	{
		$session = session();
		// $SessionUser=$_SESSION["USERID"];
        // $SessionUserName=$_SESSION["FIRSTNAME"];
		$CurrentDateTime=date("Y-m-d H:i:s");
        $SessionUser = $_POST['USER_ID'];
        $SessionUserName = $_POST['USER_NAME'];
        $loading_point = json_decode($_POST['sdinfo'][0]);
        $loading_point =$loading_point[0]->loading_point;
        $supplier_dispatch_info = array (
            "DateAdded"=>$CurrentDateTime,
            "ZPO_NUMBER"=>$_POST['ZPO_NUMBER'],
            "PO_QTY"=>$_POST['tripsheet_no'],
            "ZSUPPLIER_NAME"=>$_POST['ZSUPPLIER_NAME'],
            "ZSUPPLIER_CODE"=>$_POST['ZSUPPLIER_CODE'],
            "ZPO_LINE_ITEM"=>$_POST['ZPO_LINE_ITEM'],
            "ZSUPPLIER_LOAD_DT"=>$_POST['ZSUPPLIER_LOAD_DT'],
            "ZSUPPLIER_LOAD_POINT"=>$loading_point,
            "EDA"=>$_POST['EDA'],
            "VEHICLE_TYPE"=>$_POST['VEHICLE_TYPE'],
            "WERKS"=>$_POST['WERKS'],
            "QA_APPROVER_STATUS"=>'A',
            "LINER_NAME"=>'',
            "VESSEL_NAME"=>'',
            "FUMIGATION"=>'',
            "VESSEL_NO"=>'',
            "SupplierDispatchInfoSubmitDt"=>$CurrentDateTime,
            "SupplierDispatchInfoSubmitInsBy"=>$SessionUser,
            "SupplierDispatchInfoSubmitInsByName"=>$SessionUserName,
          );
          $model = new FCIModel();
          $res = $model->FCILoadInsert($supplier_dispatch_info,$_POST['sdinfo'],$_POST['COST_TYPE'],$_POST['LOAD_CHARGE'],$_POST['FREIGHT_CHARGE'],$_POST['WB_PATH'],$_POST['INVOICE_PATH']);
          return  $this->sendSuccessResult($res);
    }

    public function getsdiVehicleList(){

        $filter = $this->request->getJSON(true);
        $searchTxt=$filter['searchTxt'];
        $model = new FCIModel();
        $res = $model->getSDIVehicleList($searchTxt);
        $count = $model->getSDIVehicleListCount($searchTxt);
        return  $this->respond(["success" => 1, "results" => $res,"count" => $count]);
    }

    public function getsdiDetailsById(){
        $postData = $this->request->getJSON();
        include_once APIPATH. "/db_connection.php";
        $model = new FCIModel();
        $res = $model->getSDIDetailById($postData->id);
        $purchase_info_id=$res[0]['purchase_info_id'];
        $Qry="SELECT ZVA_NUMBER FROM `purchase_info` where PI_REFID='".$purchase_info_id."'";
        $SelectDispDet=mysqli_query($connect,$Qry);
        $FetchDispDet=mysqli_fetch_assoc($SelectDispDet);
        $va_number=$FetchDispDet['ZVA_NUMBER'];
        // $va_number='RMSDTSIL2400000857';
        $urlPath ="zrake/zrake_migoapp/migoapp?sap-client=900&va_number=$va_number";
        $result = SapUrlHelper::getWhDatas($urlPath);
        $sapData = json_decode($result, true);
        return  $this->respond(["success" => 1, "results" => $res ,"FRT_LOAD_POST_FLAG" => $sapData[0]['LP_POSTING_FLAG'] == 'X' ? false : true,'LOAD_POST_FLAG' => $sapData[0]['LOAD_POST_FLAG'] == 'X'  ? false : true]);
    }

    public function updatesdiPOLine(){
        $postData = $this->request->getJSON();
        $eway_no = 0;
        include_once APIPATH. "/db_connection.php";  
        $Qry="SELECT SUPPLIER_ID FROM `supplier_vehical_info` where SUP_VE_REFID='".$postData->id."'";
        $SelectDispDet=mysqli_query($connect,$Qry);
        $FetchDispDet=mysqli_fetch_assoc($SelectDispDet);
        $SupplierId=$FetchDispDet['SUPPLIER_ID'];
            if($postData->purchase_info_id > 0 && $postData->FCI_STATUS > 0){
                $Qry1="SELECT VECHICAL_STATUS,ZVA_NUMBER FROM `purchase_info` where PI_REFID='".$postData->purchase_info_id."'";
                $purchase_info=mysqli_query($connect,$Qry1);
                $FETCH=mysqli_fetch_assoc($purchase_info);
                $VECHICAL_STATUS=$FETCH['VECHICAL_STATUS'];
                $ZVA_NUMBER=$FETCH['ZVA_NUMBER'];

                if($VECHICAL_STATUS == 7){
                    $urlPath ="zrake/zrake_migoapp/migoapp?sap-client=900";
                    $LOAD_COST = $postData->ATTI_COOLI+$postData->EXTRA_CHARGE+$postData->WEIGHTMENT_CHARGE+$postData->GATE_EXPENSE+ $postData->OFFICE_EXPENSE_KG;
                    $sap_data = array (
                        "zva_number"=>$ZVA_NUMBER,
                        "zzatti_cooli"=>$postData->ATTI_COOLI,
                        "zzextra_charge"=>$postData->EXTRA_CHARGE,
                        "zzoffice_expense"=>$postData->OFFICE_EXPENSE_KG,
                        "zzweightment_charge"=>$postData->WEIGHTMENT_CHARGE,
                        "zzgate_expense"=>$postData->GATE_EXPENSE,
                        "zzoverall_expense"=>$LOAD_COST,
                        "zzfreight_charg"=>$postData->FREIGHT_COST_KG,
                        "zzloading_charg"=>$LOAD_COST,
                        "zzcost_type"=>$postData->COST_TYPE,
                        "METHOD"=>'PUT'
                    );
                    $result = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
                    $message = $result[0]->MESSAGE;

                    if($result[0]->STATUS == 0){
                        return $this->sendErrorResult("$message Please Contact SAP Team");
                    }
                }
            }else if($postData->FCI_STATUS == 0){
                $Qry1="SELECT * FROM `supplier_vehical_info` where SUP_VE_REFID='".$postData->id."'";
                $supplier_info=mysqli_query($connect,$Qry1);
                $supplier_info=mysqli_fetch_assoc($supplier_info);
                $urlPath ="ZFCI_TS_TRIP_DE/FCIraketripsheet?SAP-client=900";
                $sap_data = array (
                    "tripsheet_no"=>$supplier_info['TRIPSHEET_NO'],
                    "po_no"=>$postData->ZPO_NUMBER,
                    "tripid"=>$supplier_info['TRIP_ID'],
                    "truck_no"=>$supplier_info['VEHICAL_NO'],
                    "company_name"=>$supplier_info['COMPANYNAME'],
                    "street_no"=>$supplier_info['STREETNO'],
                    "street_name"=>$supplier_info['STREETNAME'],
                    "city"=>$supplier_info['CITY'],
                    "state"=>$supplier_info['STATE'],
                    "postcode"=>$supplier_info['POSTCODE'],
                    "region"=>$supplier_info['REGION'],
                    "gst_no"=>$supplier_info['GSTNUMBER'],
                    "to_plant"=>$supplier_info['PLANT_ID'],
                    "quantity" => $supplier_info['ZSUPPLIER_INV_QTY'],
                    "amount" =>round( $supplier_info['ZSUPPLIER_INV_QTY']*$supplier_info['ZSUPPLIER_INV_RATE'])
                );
                $result = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
                $message = $result[0]->MESSAGE ?? '';
                $eway_no = $result[0]->EWAY_NO ?? '';
                if($result[0]->STATUS == 0 || $result[0]->EWAY_NO == '' || $result[0]->EWAY_NO == null || $result[0]->EWAY_NO == 0){
                    return $this->sendErrorResult("$message Please Contact SAP Team");
                }
            }
        $model = new FCIModel();
        $res = $model->updatePoLineById($postData,$SupplierId,$eway_no ? $eway_no:0);
        return  $this->respond(["success" => $res]);
      }

      public function FCI_Cost_Details()
      {
        $model = new FCIModel();
        $res = $model->FCI_Cost_Details();
        return  $this->sendSuccessResult($res);
      }

      public function PP_Setting_Update(){		
		$json = $this->request->getJSON();
		$model = new FCIModel();
	
		$data = array(
			'mobile_numbers'=>$json->mobile_numbers,
			'session_time_out'=>$json->session_time_out,
			'WB_BufferPercentage'=>$json->WB_BufferPercentage,
			'rake_fnr_no_date'=>$json->rake_fnr_no_date,
			'invoice_posting_date'=>$json->invoice_posting_date,
			'sap_posting_date'=>$json->sap_posting_date,
			'load_unload_cost_percentage'=>$json->load_unload_cost_percentage,
			'vehicleMinWeight'=>$json->vehicleMinWeight,
			'atti_cooli'=>$json->atti_cooli,
			'extra_momul'=>$json->extra_momul,
			'office_expense'=>$json->office_expense,
			'weighment_expense'=>$json->weighment_expense,
            'gate_expense'=>$json->gate_expense,
            'freight_cost'=>$json->freight_cost,
            'vehicleNoValidation'=>$json->vehicleNoValidation,
            'migoDaysControl'=>$json->migoDaysControl,
            'net_weight_validation'=>$json->net_weight_validation,
            'courier_sending_date'=>$json->courier_sending_date,
			);
		$res = $model->PP_Setting_Update($data);
		return  $this->respond(["success" => 1, "results" => $res]);  	
	}

    public function FCI_Location_Details()
      {
        $model = new FCIModel();
        $res = $model->FCI_Location_Details();
        return  $this->sendSuccessResult($res);
      }
    public function DeliveryChallanPrintForm($SupplierId)
    {
        $model = new FCIModel();
        $res = $model->DeliveryChallanPrintForm($SupplierId);
        $AddressDetails = $model->CompanyAddressDetails($res[0]['PLANT_ID']);
        return  $this->respond(["success" => 1, "results" => $res ,"AddressDetails" => $AddressDetails,'MobileNo'=>'7708111369']);
        // return  $this->sendSuccessResult($res);
    }
    
    public function AddressDetails($plant)
    {
        $model = new FCIModel();
        $AddressDetails = $model->CompanyAddressDetails($plant);
        return  $this->respond(["success" => 1, "AddressDetails" => $AddressDetails]);
    }
}
