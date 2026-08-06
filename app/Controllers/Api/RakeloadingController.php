<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;
use App\Helpers\VANumberHelper;
use App\Models\FCIModel;
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

		//if(isset($Vehicle_No)){
			//$duplicate_check = $model->Vehicle_Duplicate_Check($Vehicle_No);
			//if($duplicate_check > 0){
				//return  json_encode(["success" => 0, "error"=> "Vehicle Already in ..."]);
			//}
	    //}

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
		$gate_in_out_info = $model->gateInOutInfo($json->plantIds);
		$fg_sales_return_info = $model->fgSalesReturnInfo($json->plantIds);
		$loading_unloading_info = $model->getLoadingAndUnloading($json->plantIds);
        return  $this->respond(["success" => 1, "silo_to_mill" => $res+$res1 ,"sdi"=>$sdi , "rake"=>$rake , "re_direct" =>$re_direct, "gate_in_out_info" =>$gate_in_out_info, "fg_sales_return_info" => $fg_sales_return_info, "loading_unloading_info" =>$loading_unloading_info]);      
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
		$result = $model->SupplierListByID($res['supplier_dispatch_info'][0]['ZPO_NUMBER'],$res['supplier_vehical_info'][0]['LINE_ITEM'],$res['supplier_dispatch_info'][0]['ZSUPPLIER_CODE']);
		return  $this->respond(["success" => 1, "results" => $res['supplier_dispatch_info'] ,'supplier_data'=>$result]);      
	}

	public function Rake_Loading_Insert(){		
		$json = $this->request->getJSON();
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$CurrentDateTime=date("Y-m-d H:i:s");
		$model = new RakeloadingModel();
		$eway_no = 0;
		$duplicate_check = $model->Vehicle_Duplicate_Check($json->vehicle_no);

		if($duplicate_check > 0){
			return  json_encode(["success" => 0, "error"=> "Vehicle Already in ..."]);
		}
		include_once APIPATH. "/db_connection.php"; 
				$Qry1 = "SELECT rr_id FROM `rake_loading` ORDER BY id DESC LIMIT 1";
                $supplier_info=mysqli_query($connect,$Qry1);
                $supplier_info=mysqli_fetch_assoc($supplier_info);
				$transcation_unique_no = $supplier_info['rr_id'];
				$res = VANumberHelper::VANumberHelper('RA','LOAD',$transcation_unique_no);
				$Qry2="SELECT * FROM `master_plant_address` where id='".$json->loading_vendor_loacation." ORDER BY ID DESC'";
                $supplier_info1=mysqli_query($connect,$Qry2);
                $supplier_info1=mysqli_fetch_assoc($supplier_info1);
                $urlPath ="ZFCI_TS_TRIP_DE/FCIraketripsheet?SAP-client=900";
                $sap_data = array (
                    "tripsheet_no"=>$json->tripsheet_no,
                    "po_no"=>$json->po_no,
                    "tripid"=>$res,
                    "truck_no"=>$json->vehicle_no,
                    "company_name"=>$supplier_info1['companyName1'],
                    "street_no"=>$supplier_info1['companyName2'],
                    "street_name"=>$supplier_info1['address1'],
                    "city"=>$supplier_info1['city'],
                    "state"=>$supplier_info1['state'],
                    "postcode"=>$supplier_info1['pinCode'],
                    "region"=>$supplier_info1['regionCode'],
                    "gst_no"=>$supplier_info1['gstInNumber'],
                    "to_plant"=>$json->plant,
                    "quantity" => round(($json->total_bags == 0 ? 300 : $json->total_bags) * 
					(($json->wheatWeight > 0) ? $json->wheatWeight : 50)),
                    "amount" =>  round(
						($json->total_bags == 0 ? 300 : $json->total_bags) * 
						(($json->wheatWeight > 0) ? $json->wheatWeight : 50) * 
						(($json->NETPR) / 1000)
					),
		    "type" => "rake",
                );
                $result = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
                $message = $result[0]->MESSAGE;
                $eway_no = $result[0]->EWAY_NO ?? 0;
                if($result[0]->STATUS == 0 || $eway_no == '' || $eway_no == null || $eway_no == 0){
                    return $this->sendErrorResult("$message Please Contact SAP Team");
                }else if (!isset($result[0]) || !isset($result[0]->STATUS)) {
                    return $this->sendErrorResult ("SAP response is invalid. Please contact the SAP Team.");
                }
		$data = array(
			'fnr_no'=>$json->fnr_no,
			'po_number'=>$json->po_no,
			'vehicle_no'=>trim($json->vehicle_no),
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
			'rr_id'=>$res,
			'loading_location_id'=>$json->loading_vendor_loacation,
			'total_qty'=> round(($json->total_bags) * 
			(($json->wheatWeight > 0) ? $json->wheatWeight : 50)),
			'total_amount'=>round(
				($json->total_bags) * 
				(($json->wheatWeight > 0) ? $json->wheatWeight : 50) * 
				(($json->NETPR) / 1000)),
			'eway_no'=>$eway_no,
			'machine_type1' => $json->MachineType1Lot1 ?? null,
    		'machine_type2' => $json->MachineType2Lot1 ?? null,
    		'machine_type3' => $json->MachineType3Lot1 ?? null,
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
		
		//if(isset($json->old_vehicle_no)){
			//$duplicate_check = $model->Vehicle_Duplicate_Check($json->vehicle_no);
			//if($duplicate_check > 0){
			//	return  json_encode(["success" => 0, "error"=> "Vehicle Already in ..."]);
			//}
	    //}
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
		$data1 = '';
		$res = $model->Rake_Loading_Update($data,$json->id,$data1);
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
		$res = $model->Rake_Loading_Update($data,$json->id,$json->purchase_info_id);
		return  $this->respond(["success" => 1, "results" => $res]);
		
	}

	public function Redirect_Loading_Update(){		
		$json = $this->request->getJSON();
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$CurrentDateTime=date("Y-m-d H:i:s");

		$model = new RakeloadingModel();
		// print_r($json);exit;
		if(isset($json->purchase_info_id)) {
			$data = array(
				'purchase_info_id' => $json->purchase_info_id,
				);
		}
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
	public function OverAllStatusList(){		
		$process_cancel = new RakeloadingModel();
		$res = $process_cancel->OverAllStatusList();
		return  $this->respond(["success" => 1, "results" => $res]);      
	}
	public function FNRNOBasedCount(){		
		$postData = $this->request->getJSON();
		$process_cancel = new RakeloadingModel();
		$res = $process_cancel->FNRNOBasedCount($postData->FNR_NO);
		return  $this->respond(["success" => 1, "results" => $res]);      
	}
	public function FNRNOCHANGE(){    
        	$json = $this->request->getJSON();  
        	$process_cancel = new RakeloadingModel();
        	$res = $process_cancel->FNRNOCHANGE($json);
        	return  $this->respond(["success" => 1, "results" => $res]);      
    }
	public function GetLoadingLocation(){
		$json = $this->request->getJSON();  		
		$process_cancel = new RakeloadingModel();
		$res = $process_cancel->GetLoadingLocation($json);
		return  $this->respond(["success" => 1, "results" => $res]);      
	}

	public function DeliveryChallanPrintFormRake($ID)
    {
        $model = new RakeloadingModel();
		$model1 = new FCIModel();
        $res = $model->DeliveryChallanPrintFormRake($ID);
		$AddressDetails = $model1->CompanyAddressDetails($res[0]['plant_id']);
        return  $this->respond(["success" => 1, "results" => $res ,"AddressDetails" => $AddressDetails]);
    }

	public function RakeFNRNO()
    {
        $model = new RakeloadingModel();
        $res = $model->RakeFNRNO();
        return  $this->respond(["success" => 1, "results" => $res]);
    }
	public function Rake_Unloading_Surveyor_Insert(){		
		$json = $this->request->getJSON();
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$CurrentDateTime=date("Y-m-d H:i:s");
		$model = new RakeloadingModel();
		
		include_once APIPATH. "/db_connection.php"; 
		$prefix = "R";

		// -------- Financial Year Calculation --------
		$month = date('n');
		$year = date('Y');

		if ($month >= 4) {
			$startYear = substr($year, -2);
			$endYear = substr($year + 1, -2);
		} else {
			$startYear = substr($year - 1, -2);
			$endYear = substr($year, -2);
		}

		$financialYear = $startYear . "-" . $endYear;

		// -------- Check FNR Number Duplicate --------
		$Qry = "SELECT fnrNumber 
				FROM rake_surveyor_report 
				WHERE (fnrNumber = '$json->fnrNumber' AND status != 0)
				OR (rakeUniqueNo = '$json->rakeUniqueNumber' AND status != 0)
				ORDER BY id DESC 
				LIMIT 1";
		$result1 = mysqli_query($connect, $Qry);
		$row1 = mysqli_fetch_assoc($result1);

		if($row1){
			return $this->respond([
				"success" => false,
				"message" => "The FNR OR Rake Unique Number Already Added"
			]);
		}

		// -------- Get Last Serial Number of Current Financial Year --------
		$Qry1 = "SELECT rakeUniqueNo 
				FROM rake_surveyor_report 
				WHERE rakeUniqueNo LIKE 'R-%-$financialYear' AND status > 0
				ORDER BY id DESC 
				LIMIT 1";

		$result = mysqli_query($connect, $Qry1);
		$row = mysqli_fetch_assoc($result);

		if ($row) {
			$lastNo = $row['rakeUniqueNo'];   // Example: R-005-25-26
			$parts = explode('-', $lastNo);
			$serial = intval($parts[1]) + 1;

		} else {

			$serial = 1;
		}

		// -------- Format Serial --------
		$serialFormatted = str_pad($serial, 3, "0", STR_PAD_LEFT);

		$transcation_unique_no = $prefix . "-" . $serialFormatted . "-" . $financialYear;
        // print_r($transcation_unique_no);exit;      
		$data = array(
			'rrNumber'=>$json->rrNumber,
			'rakeUniqueNo'=>$json->rakeUniqueNumber ?? $transcation_unique_no,
			'fnrNumber'=>$json->fnrNumber,
			'placementTime'=>$json->placementTime,
			'placementPlatform'=>$json->placementPlatform,
			'freeTimeTill'=>$json->freeTimeTill,
			'completionTime'=>$json->completionTime,
			'rakeType'=>$json->rakeType,
			'noOfWagonReceived'=>$json->noOfWagonReceived,
			'noOfMissingWagon'=>$json->noOfMissingWagon,
			'wagonNumber'=>$json->wagonNumber,
			'totalDcHours'=>$json->totalDcHours,
			'totalWharfage'=>$json->totalWharfage,
			'tarpaulinPlaced'=>$json->tarpaulinPlaced,
			'tarpaulinCovered'=>$json->tarpaulinCovered,
			'tarpaulinPlacedRemarks'=>$json->tarpaulinPlacedRemarks,
			'tarpaulinCoveredRemarks'=>$json->tarpaulinCoveredRemarks,
			'noOfLoadman'=>$json->noOfLoadman,
			'arrivalTime'=>$json->arrivalTime,
			'loadingStartingTime'=>$json->loadingStartingTime,
			'unloadingLocation'=>$json->unloadingLocation,
			'numberOfTrucks'=>$json->numberOfTrucks,
			'nagaOwn'=>$json->nagaOwn,
			'goodshed'=>$json->goodshed,
			'total'=>$json->total,
			'bagsInEachWagon'=>$json->bagsInEachWagon,
			'spillageCleaningLadies'=>$json->spillageCleaningLadies,
			'noOfSpillageTrucks'=>$json->noOfSpillageTrucks,
			'noOfEmptyGunnyUsed'=>$json->noOfEmptyGunnyUsed,
			'bagsUnloadPlatForm'=>$json->bagsUnloadPlatForm,
			'sweepingTime'=>$json->sweepingTime,
			'emptyBoxOpenTime'=>$json->emptyBoxOpenTime,
			'remarks'=>$json->remarks,
			'surveyorNames'=>$json->surveyorNames,
			'createdBy'=>$json->user_id,
			'rrCopy'=>$json->rrCopy,
			'status'=>1,
			);
		$res = $model->Rake_Unloading_Surveyor_Insert($data);
		
		if($res > 0){
			return $this->response->setJSON([
					'success' => true,
					'message' => 'Rake Surveyor Report submitted successfully'
			]);
	    }else{
		return  $this->respond(["success" => false, "message" => "Submission Failed"]);
		}      
	}
	public function SurveyorDetails($status,$fromDate=null,$toDate=null)
	{
		$gateService = new RakeloadingModel();
		$results = $gateService->SurveyorDetails($status,$fromDate,$toDate);
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function Rake_Unloading_Surveyor_Update(){		
		$json = $this->request->getJSON();
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$CurrentDateTime=date("Y-m-d H:i:s");
		$model = new RakeloadingModel();
		
		include_once APIPATH. "/db_connection.php"; 
		$year = date('y'); // 25
		$prefix = "R";

		// Get last serial for current year
		$Qry = "SELECT fnrNumber 
				FROM rake_surveyor_report 
				WHERE fnrNumber LIKE '$json->fnrNumber' AND STATUS = 1
				ORDER BY id DESC 
				LIMIT 1";
		$result1 = mysqli_query($connect, $Qry);
		$row1 = mysqli_fetch_assoc($result1);
		// if($row1['fnrNumber']){
		// 	return  $this->respond(["success" => false, "message" => "The FNR Numbers Already Added"]);
		// }
		
        // print_r($transcation_unique_no);exit;   
		if($json->status == 2){
			$approvedBy = "approvedBy1";
			$approvedAttr = "approvedAt1";
		}else if($json->status == 3){
			$approvedBy = "approvedBy2";
			$approvedAttr = "approvedAt2";
		}else{
			$approvedBy = "updatedBy";
			$approvedAttr = "updatedAt";
		} 
		$data = array(
			'rrNumber'=>$json->rrNumber,
			'rakeUniqueNo'=>$json->rakeUniqueNo,
			'fnrNumber'=>$json->fnrNumber,
			'placementTime'=>$json->placementTime,
			'placementPlatform'=>$json->placementPlatform,
			'freeTimeTill'=>$json->freeTimeTill,
			'completionTime'=>$json->completionTime,
			'rakeType'=>$json->rakeType,
			'noOfWagonReceived'=>$json->noOfWagonReceived,
			'noOfMissingWagon'=>$json->noOfMissingWagon,
			'wagonNumber'=>$json->wagonNumber,
			'totalDcHours'=>$json->totalDcHours,
			'totalWharfage'=>$json->totalWharfage,
			'tarpaulinPlaced'=>$json->tarpaulinPlaced,
			'tarpaulinCovered'=>$json->tarpaulinCovered,
			'tarpaulinPlacedRemarks'=>$json->tarpaulinPlacedRemarks,
			'tarpaulinCoveredRemarks'=>$json->tarpaulinCoveredRemarks,
			'noOfLoadman'=>$json->noOfLoadman,
			'arrivalTime'=>$json->arrivalTime,
			'loadingStartingTime'=>$json->loadingStartingTime,
			'unloadingLocation'=>$json->unloadingLocation,
			'numberOfTrucks'=>$json->numberOfTrucks,
			'nagaOwn'=>$json->nagaOwn,
			'goodshed'=>$json->goodshed,
			'total'=>$json->total,
			'bagsInEachWagon'=>$json->bagsInEachWagon,
			'spillageCleaningLadies'=>$json->spillageCleaningLadies,
			'noOfSpillageTrucks'=>$json->noOfSpillageTrucks,
			'noOfEmptyGunnyUsed'=>$json->noOfEmptyGunnyUsed,
			'surveyorNames'=>$json->surveyorNames,
			 $approvedBy=>$json->user_id,
			 $approvedAttr=>$CurrentDateTime,
			'rrCopy'=>$json->rrCopy,
			'status'=>$json->status,
			'rejectReason'=>$json->rejectReason,
			'bagsUnloadPlatForm'=>$json->bagsUnloadPlatForm,
			'sweepingTime'=>$json->sweepingTime,
			'emptyBoxOpenTime'=>$json->emptyBoxOpenTime,
			'remarks'=>$json->remarks,
			);
		
		$res = $model->Rake_Unloading_Surveyor_Update($data,$json->id);
		// print_r($res);exit;
		if($res['error']){
			return $this->response->setJSON([
				'success' => false,
				'message' => $res['message']
			]);	
		}
		if($res > 0){
			return $this->response->setJSON([
					'success' => true,
					'message' => $json->status > 1 ? 'Rake Surveyor Report updated successfully' : 'Rejected Sucessfully'
			]);
	    }else{
		return  $this->respond(["success" => false, "message" => "Submission Failed"]);
		}      
	}
	public function SurveyorDetailsById($id)
	{
		$gateService = new RakeloadingModel();
		$results = $gateService->SurveyorDetailsById($id);
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function RakeVehicleDetails($FNR_No)
	{
		$gateService = new RakeloadingModel();
		$results = $gateService->RakeVehicleDetails($FNR_No);
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
}
