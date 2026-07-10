<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;
use App\Models\RakeloadingModel;

class RakeloadingController extends BaseApiController
{
	public function index()
	{
		//
	}
	public function FNRNOGet(){    
        $json = $this->request->getJSON();  
        $process_cancel = new RakeloadingModel();
        $res = $process_cancel->FNRNOGet($json->plantIds);
        return  $this->respond(["success" => 1, "results" => $res]);      
    }
	public function PONumberGet(){		
		$json = $this->request->getJSON();
		$process_cancel = new RakeloadingModel();
		$res = $process_cancel->PONumberGet($json->FNR_NO);
		return  $this->respond(["success" => 1, "results" => $res]);      
	}

	public function POLineItem(){		
		$json = $this->request->getJSON();
		$process_cancel = new RakeloadingModel();
		$res = $process_cancel->POLineItem($json->PO_NUMBER,$json->FNR_NO);
		return  $this->respond(["success" => 1, "results" => $res]);      
	}

	public function SupplierList(){		
		$json = $this->request->getJSON();
		$process_cancel = new RakeloadingModel();
		$res = $process_cancel->SupplierList($json->PO_NUMBER,$json->PO_LINE_ITEM);
		return  $this->respond(["success" => 1, "results" => $res]);      
	}

	public function SupplierListByID(){		
		$json = $this->request->getJSON();
		$process_cancel = new RakeloadingModel();
		$res = $process_cancel->SupplierListByID($json->PO_NUMBER,$json->PO_LINE_ITEM,$json->ZSUPPLIER_CODE);
		return  $this->respond(["success" => 1, "results" => $res]);      
	}

	public function SAP_Rake_Tripsheet_Get(){		
		$json = $this->request->getJSON();
		$FNR_No = $json->FNR_NO;
		$Vehicle_No = $json->Vehicle_Number;

		$model = new RakeloadingModel();

		if(isset($Vehicle_No)){
			$duplicate_check = $model->Vehicle_Duplicate_Check($Vehicle_No);
			if($duplicate_check > 0){
				return  json_encode(["success" => 0, "error"=> "Vehicle Already in ..."]);
			}
	    }

		$urlPath ="zrake/zrake_tripsheet/raketripsheet?sap-client=900&FNR_No=$FNR_No&Vehicle_No=$Vehicle_No";
		$sapResult = SapUrlHelper::getWhDatas($urlPath);
		return $this->sendSuccessResult(json_decode($sapResult));
	}

	public function Unloading_Gate_in_Vehicle(){       
        $json = $this->request->getJSON();
        $model = new RakeloadingModel();
        $res = $model->getWHplantList($json->plantIds);
        $res1 = $model->getIASList($json->plantIds);
        $sdi = $model->getWHplantListSDI($json->plantIds);
        $rake = $model->getRakeList($json->plantIds);
        $re_direct = $model->RedirectList($json->plantIds);
        return  $this->respond(["success" => 1, "silo_to_mill" => $res+$res1 ,"sdi"=>$sdi , "rake"=>$rake , "re_direct" =>$re_direct]);      
    }
	public function Vehicle_No_ByID(){		
		$json = $this->request->getJSON();
		$model = new RakeloadingModel();
		$res = $model->UnloadingIASSiloTOMillByID($json->id,$json->vehicle_no);
		// $res1 = $model->UnloadingSDIVehicleByID($json->id,$json->vehicle_no);
		// $res2 = $model->UnloadingSDIVehicleRakeByID($json->id,$json->vehicle_no);

		// print_r(strlen($res[0]['SCREEN_TYPE']));exit;

		if(strlen($res[0]['SCREEN_TYPE']) > 0){
		$result = $res;
		}else if(strlen($res[0]['SCREEN_TYPE']) == 0){
		$res1 = $model->UnloadingSDIVehicleByID($json->id,$json->vehicle_no);
		if(strlen($res1[0]['VEHICLE_TYPE']) > 0){
		$result = $res1;
		}else if(strlen($res1[0]['VEHICLE_TYPE']) == 0){
		$res2 = $model->UnloadingSDIVehicleRakeByID($json->id,$json->vehicle_no);
		if(strlen($res2[0]['PLANT_NAME']) > 0){
		$result = $res2;	
		}else if(strlen($res2[0]['PLANT_NAME']) == 0){
		$result = $model->RedirectPurchaseByID($json->id,$json->vehicle_no);	
		}
		}
		}
		return  $this->respond(["success" => 1, "results" => $result]);      
	}

	public function Supplier_Vehicle_ByID(){		
		$json = $this->request->getJSON();
		$model = new RakeloadingModel();
		$res = $model->Supplier_Vehicle_ByID($json->SUP_VE_REFID);
		$result = $model->SupplierListByID($res[0]['ZPO_NUMBER'],$res[0]['ZPO_LINE_ITEM'],$res[0]['ZSUPPLIER_CODE']);
		return  $this->respond(["success" => 1, "results" => $res ,'supplier_data'=>$result]);      
	}

	public function Rake_Loading_Insert(){		
		$json = $this->request->getJSON();
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$CurrentDateTime=date("Y-m-d H:i:s");
		$model = new RakeloadingModel();

		$duplicate_check = $model->Vehicle_Duplicate_Check($json->vehicle_no);

		if($duplicate_check > 0){
			return  json_encode(["success" => 0, "error"=> "Vehicle Already in ..."]);
		}

		$data = array(
			'fnr_no'=>$json->fnr_no,
			'po_number'=>$json->po_no,
			'vehicle_no'=>$json->vehicle_no,
			'tripsheet_no'=>$json->tripsheet_no,
			'driver_no'=>$json->driver_no,
			'driver_name'=>$json->driver_name,
			'po_line_item'=>$json->po_line_item,
			'supplier_code'=>$json->supplier_code,
			'brocker_code'=>$json->brocker_code,
			'supplier_name'=>$json->supplier_name,
			'brocker_name'=>$json->brocker_name,
			'plant_id'=>$json->plant,
			'vehicle_type'=>$json->vehicle_type,
			'storage_location_id'=>$json->storage_location,
			'wheat_variety'=>$json->wheat_variety,
			'supplier_code'=>$json->supplier_code,
			'loading_vendor_id'=>$json->loading_vendor,
			'loading_charge'=>$json->loading_cost,
			'receive_bag1'=>$json->recieve_bag1,
			'receive_bag2'=>$json->recieve_bag2,
			'receive_bag3'=>$json->recieve_bag3,
			'no_bags2'=>$json->no_bags2,
			'no_bags1'=>$json->no_bags1,
			'no_bags3'=>$json->no_bags3,
			'gunny_wt1'=>$json->gunny_wt1,
			'gunny_wt2'=>$json->gunny_wt2,
			'gunny_wt3'=>$json->gunny_wt3,
			'total_bags'=>$json->total_bags,
			'total_gunny_wt'=>$json->total_gunny_wt,
			'status'=>1,
			'created_at'=>$CurrentDateTime,
			'created_by'=>$SessionUser,
			);
		$res = $model->Rake_Loading_Insert($data);
		return  $this->respond(["success" => 1, "results" => $res]);      
	}

	public function RakeEntryReport(){
		$postData = $this->request->getJSON();
		$model = new RakeloadingModel();
		return  $this->sendSuccessResult($model->RakeEntryReport($postData->formType,$postData->Data->fromdate,$postData->Data->todate,$postData->Data->FNR_NO)); 
	}

	public function RakeEntryEdit(){
		$postData = $this->request->getJSON();
		$model = new RakeloadingModel();
		return  $this->sendSuccessResult($model->RakeEntryEdit($postData->formType)); 
	}

	public function RakeEntryByID(){
		$postData = $this->request->getJSON();
		$model = new RakeloadingModel();
		return  $this->sendSuccessResult($model->RakeEntryByID($postData->id)); 
	}
	public function UnloadingByID(){
		$postData = $this->request->getJSON();
		$model = new RakeloadingModel();
		return  $this->sendSuccessResult($model->UnloadingByID($postData->purchase_info_id)); 
	}
    public function Rake_Loading_Update(){		
		$json = $this->request->getJSON();
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$CurrentDateTime=date("Y-m-d H:i:s");

		$model = new RakeloadingModel();
		
		if(isset($json->old_vehicle_no)){
			$duplicate_check = $model->Vehicle_Duplicate_Check($json->vehicle_no);
			if($duplicate_check > 0){
				return  json_encode(["success" => 0, "error"=> "Vehicle Already in ..."]);
			}
	    }
		$data = array(
			'fnr_no'=>$json->fnr_no,
			'po_number'=>$json->po_no,
			'vehicle_no'=>$json->vehicle_no,
			'tripsheet_no'=>$json->tripsheet_no,
			'driver_no'=>$json->driver_no,
			'driver_name'=>$json->driver_name,
			'po_line_item'=>$json->po_line_item,
			'supplier_code'=>$json->supplier_code,
			'brocker_code'=>$json->brocker_code,
			'supplier_name'=>$json->supplier_name,
			'brocker_name'=>$json->brocker_name,
			'plant_id'=>$json->plant,
			'vehicle_type'=>$json->vehicle_type,
			'storage_location_id'=>$json->storage_location,
			'wheat_variety'=>$json->wheat_variety,
			'supplier_code'=>$json->supplier_code,
			'loading_vendor_id'=>$json->loading_vendor,
			'loading_charge'=>$json->loading_cost,
			'receive_bag1'=>$json->recieve_bag1,
			'receive_bag2'=>$json->recieve_bag2,
			'receive_bag3'=>$json->recieve_bag3,
			'no_bags2'=>$json->no_bags2,
			'no_bags1'=>$json->no_bags1,
			'no_bags3'=>$json->no_bags3,
			'gunny_wt1'=>$json->gunny_wt1,
			'gunny_wt2'=>$json->gunny_wt2,
			'gunny_wt3'=>$json->gunny_wt3,
			'total_bags'=>$json->total_bags,
			'total_gunny_wt'=>$json->total_gunny_wt,
			'status'=>2,
			'updated_at'=>$CurrentDateTime,
			'updated_by'=>$SessionUser,
			);
		$res = $model->Rake_Loading_Update($data,$json->id);
		return  $this->respond(["success" => 1, "results" => $res]);  
		
	}
    public function Sap_Fnrno_flag(){

	 $json = $this->request->getJSON();
	  $sap_data = array (
        "Tripsheet_no"=>$json->tripsheet_no,
		"FNR_No"=>$json->fnr_no,
        "Vehicle_No"=>$json->vehicle_no,
		"gatein_flag"=>'X',
		"count"=>'1',
		"rake_id"=>$json->id,
      );
      $urlPath ="zrake/zrake_tripsheet/raketripsheet?sap-client=900";
      $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

      $message = $res[0]->MESSAGE;
	  if($res[0]->STATUS == 0){
        return $this->sendErrorResult("$message,Please Contact SAP Team");
      }else if($res[0]->STATUS > 0){
		return  $this->respond(["success" => 1,"results"=>$res]);  
	  }
	}
	public function Rake_Loading_Update_Gate_in(){		
		$json = $this->request->getJSON();
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$CurrentDateTime=date("Y-m-d H:i:s");

		$model = new RakeloadingModel();
		
		
		$data = array(
			'status'=>3,
			'purchase_info_id'=>$json->purchase_info_id,
			);
		$res = $model->Rake_Loading_Update($data,$json->id);
		return  $this->respond(["success" => 1, "results" => $res]);  
		
	}

	public function Redirect_Loading_Update(){		
		$json = $this->request->getJSON();
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$CurrentDateTime=date("Y-m-d H:i:s");

		$model = new RakeloadingModel();
		
		$data = array(
			'purchase_info_id'=>$json->purchase_info_id,
			);
		$data1 = array(
			'VECHICAL_STATUS'=>'18',
			);
		$res = $model->Redirect_Loading_Update($data,$data1,$json->id);
		return  $this->respond(["success" => 1, "results" => $res]);  
		
	}

	public function BagWeightGet(){
		$postData = $this->request->getJSON();
		$model = new RakeloadingModel();
		return  $this->sendSuccessResult($model->BagWeightGet($postData->bag_type)); 
	}

	public function FNRNOOverAllList(){		
		$process_cancel = new RakeloadingModel();
		$res = $process_cancel->FNRNOOverAllList();
		return  $this->respond(["success" => 1, "results" => $res]);      
	}

	public function FNRNOBasedCount(){		
		$postData = $this->request->getJSON();
		$process_cancel = new RakeloadingModel();
		$res = $process_cancel->FNRNOBasedCount($postData->FNR_NO);
		return  $this->respond(["success" => 1, "results" => $res]);      
	}
}
