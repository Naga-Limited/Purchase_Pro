<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;
use App\Models\Loadingunloadingcost as ModelsLoadingunloadingcost;
use PhpParser\Node\Expr\AssignOp\Concat;

class Loadingunloadingcost extends BaseApiController
{
	public function Loading_Unloading_Data()
	{
	    $json = $this->request->getJSON();
		$model = new ModelsLoadingunloadingcost();
		$rake_loading = $model->Rake_Loading_cost($json);
		$unloading = $model->Unloading_cost($json);
		$ias_unloading = $model->IASUnLoading($json);
		$ias_loading = $model->IASLoading($json);
		$result = array_merge_recursive($ias_unloading, $ias_loading, $unloading, $rake_loading);

		return  $this->respond(["success" => 1, "result" => $result]);      
	}

	public function getVendor()
	{
		$master = new ModelsLoadingunloadingcost();
		return  $this->sendSuccessResult($master->getVendor());
	}
	public function getVendorByID()
	{
		$json = $this->request->getJSON();
		$master = new ModelsLoadingunloadingcost();
		return  $this->sendSuccessResult($master->getVendorByID($json->Id));
	}
	public function getVendorList()
	{
		$json = $this->request->getJSON();
		$master = new ModelsLoadingunloadingcost();
		$rake_loading = $master->Rake_Loading_Vendor($json);
		$unloading = $master->Unloading_vendor($json);
		$ias_unloading = $master->IASUnLoadingVendor($json);
		$ias_loading = $master->IASLoadingVendor($json);
		$marger_array = array_merge_recursive($ias_unloading, $ias_loading, $unloading, $rake_loading);
		
		return  $this->sendSuccessResult($marger_array);
	}
	public function getPlantList()
	{
		$json = $this->request->getJSON();
		$master = new ModelsLoadingunloadingcost();
		$rake_loading = $master->Rake_Loading_Plant($json);
		$unloading = $master->Unloading_Plant($json);
		$ias_unloading = $master->IASLoadingPlant($json);
		$ias_loading = $master->IASUnLoadingPlant($json);
		$marger_array = array_merge_recursive($ias_unloading, $ias_loading, $unloading, $rake_loading);
		
		return  $this->sendSuccessResult($marger_array);
	}

	public function getPOList()
	{
		$json = $this->request->getJSON();
		$master = new ModelsLoadingunloadingcost();
		$rake_loading = $master->Rake_Loading_PO($json);
		$unloading = $master->Unloading_PO($json);
		$ias_unloading = $master->IASLoading_PO($json);
		$ias_loading = $master->IASUnLoading_PO($json);
		$marger_array = array_merge_recursive($ias_unloading, $ias_loading, $unloading, $rake_loading);
		return  $this->sendSuccessResult($marger_array);
	}

	public function Type()
	{
		$res=array();
		$res[] =  array("value"=>"1","label"=>"Loading");
		$res[] =  array("value"=>"2","label"=>"Unloading");
		return  $this->sendSuccessResult($res);
	}

	public function Company_Name()
	{
		$res=array();
		$res[] =  array("value"=>"0","label"=>"Naga");
		$res[] =  array("value"=>"1","label"=>"MMD");
		return  $this->sendSuccessResult($res);
	}

	public function Movement()
	{
		$res=array();
		$res[] =  array("value"=>"Purchase","label"=>"Purchase");
		// $res[] =  array("value"=>"Truck","label"=>"Truck");
		// $res[] =  array("value"=>"Container","label"=>"Container");
		$res[] =  array("value"=>"STO","label"=>"STO");
		return  $this->sendSuccessResult($res);
	}


	public function Load_Unload_Payment_insert()
	{
		$json = $this->request->getJSON();
		$master = new ModelsLoadingunloadingcost();
		$invoice_count=$master->InvoiceCount($json->invoice_no);
		if($invoice_count > 0){
			return $this->sendErrorResult("Please Check Invoice Number");
	    }
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$SessionUserName=$_SESSION['User']->username;
		$CurrentDateTime=date("Y-m-d H:i:s");
		$Currentyear=date("Y");
		$Currentmonth=date("md");
		$year=substr($Currentyear, 2, 2);
		$today='LU'.$year.$Currentmonth;
		$data = $master->Loading_unloading_Last_ID();
		$load_unload_no = $data[0]['load_unload_no'];
		if(strlen($load_unload_no)>0){
		$current_no=(substr($load_unload_no,0,8));
		if(trim($current_no) == $today){
		$unique_no = ++$load_unload_no;
		}else{
		  $unique_no = $today.'001';
		}
		}else{
		  $unique_no = $today.'001';
		}
		$created_by[] = array(
		  "user_id"=>$SessionUser,
		  "date_time"=>$CurrentDateTime,
		  "user_name"=>$SessionUserName
		);

		$values = array (
			"load_unload_no"=>$unique_no,
			"row_count"=>$json->row_count,
			"total_value"=>$json->total_value,
			"invoice_value"=>$json->invoice_value,
			"difference"=>$json->difference,
			"confirm_vendor_id"=>$json->confirm_vendor,
			"invoice_date"=>$json->invoice_date,
			"invoice_no"=>$json->invoice_no,
			"invoice_attachment"=>$json->Invoicecopy,
			"rake_id"=>$json->rake_id,
			"ias_load_id"=>$json->ias_load_id,
			"unload_id"=>$json->unload_id,
			"ias_unload_id"=>$json->ias_unload_id,
			"load_unload_info"=>json_encode($json->child_info),
			"remarks"=>$json->remarks,
			"process_type"=>$json->process_type,
			"status"=>'1',
			"created_at"=>$CurrentDateTime,
			"created_by"=>json_encode($created_by),
			"company_name"=>$json->company_name
		);
		  if(strlen($json->rake_id)>0){
			$master->Load_Unload_Rake_Reverse($json->rake_id,1);
		  }
		  if(strlen($json->ias_unload_id)>0){
			  $master->Load_Unload_Purchase_Reverse($json->ias_unload_id,1);
		  }
		  if(strlen($json->ias_load_id)>0){
			  $master->Load_Load_IAS_Reverse($json->ias_load_id,1);
		  }
		  if(strlen($json->unload_id)>0){
			  $master->Load_Unload_Purchase_Reverse($json->unload_id,1);
		  }
		$data = $master->Loading_unloading_Insert($values);
		return  $this->sendSuccessResult($data);
	}

	public function Load_Unload_Payment_Index()
	{
		$json = $this->request->getJSON();
		$master = new ModelsLoadingunloadingcost();
		
		$data = $master->Load_Unload_Payment_Index($json);
		$load_unload_info=$data[0]['load_unload_info'];
		return  $this->respond(["load_unload_info" => json_decode($load_unload_info),"results" =>$data,"success"=>1]);
	}

	public function Load_Unload_Payment_Update()
	{
		$json = $this->request->getJSON();
		$CurrentDateTime=date("Y-m-d H:i:s");
		$session = session();
		$SessionUser=$_SESSION["USERID"];
		$SessionUserName=$_SESSION['User']->username;
		$master = new ModelsLoadingunloadingcost();
		$approved_by[] = array(
			"user_id"=>$SessionUser,
			"date_time"=>$CurrentDateTime,
			"user_name"=>$SessionUserName
		  );
		if($json->status == 2){
		   $data = array (
			"status"=>$json->status,
			"updated_at"=>$CurrentDateTime,
			"wh_mg_approved_by"=>json_encode($approved_by),
			"remarks"=>$json->remarks,
		   );
		}else if($json->status == 3){
			$data = array (
			"status"=>$json->status,
			"updated_at"=>$CurrentDateTime,
			"accounts_exe_confirm_by"=>json_encode($approved_by),
			"remarks"=>$json->remarks,
			"invoice_no"=>$json->vendor_invoice_no,
			"invoice_date"=>$json->invoice_date,
			"miro_date"=>$json->miro_posting_date,
			);
		}else if($json->status == 4){
			$sap_data = array (
			"VENDOR"=>$json->Code,
			"POST_DATE"=>$json->miro_posting_date,
			"TDS"=>$json->tds_code,
			"TOTAL_AMT"=>$json->invoice_value,
			"INV_REF"=>$json->vendor_invoice_no,
			"INV_DATE"=>$json->invoice_date,
			"PROCESS_TYPE"=>$json->process_type,
			"MIRO_ID"=>$json->load_unload_no,
			"LINE"=>$json->sap_info,
			"COMP_CODE"=>$json->company_name == 'NAGA' ? '9200':'8000'
			);
		$urlPath = "ZMIRO_POST_PP/Mirorev?sap-client=900";
		// print_r($sap_data);exit;
		$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
		$message = $res[0]->MESSAGE;
		if($res[0]->STATUS == 2){
				return $this->sendErrorResult("$message Please Contact SAP Team");
	    }else{
		  $miro_no = $res[0]->MIRO_NO;
		  $data = array (
			"status"=>$json->status,
			"updated_at"=>$CurrentDateTime,
			"accounts_mg_approved_by"=>json_encode($approved_by),
			"remarks"=>$json->remarks,
			"invoice_no"=>$json->vendor_invoice_no,
			"invoice_date"=>$json->invoice_date,
			// "miro_date"=>$json->miro_posting_date,
			"miro_no"=>$miro_no,
		   );
		}
		}else if($json->status == 7){
			$sap_data = array (
				"DOC_NO"=>$json->miro_no,
				"POST_DATE"=>$json->miro_reverse_date,
				);
			$urlPath = "ZMIRO_REV_GP/Mirorev?sap-client=900";
			// print_r($sap_data);exit;
			$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
			$message = $res[0]->MESSAGE;
			if($res[0]->STATUS == 2){
					return $this->sendErrorResult("$message Please Contact SAP Team");
			}else{
			  $approve = 'rejected_by';
			  $miro_reverse_no = $res[0]->DOC_NO;
			  $data = array (
				"status"=>$json->status,
				"updated_at"=>$CurrentDateTime,
				"rejected_by"=>json_encode($approved_by),
				"remarks"=>$json->remarks,
				"miro_reverse_no"=>$miro_reverse_no,
			   );
			}
		}else{
			$approve = 'rejected_by';
			$data = array (
				"status"=>$json->status,
				"updated_at"=>$CurrentDateTime,
				"rejected_by"=>json_encode($approved_by),
				"remarks"=>$json->remarks,
			);
		}
		
		if(($json->status == 7 || $json->status == 5) && $json->rake_id != ''){
		  $master->Load_Unload_Rake_Reverse($json->rake_id,0);
		}
		if(($json->status == 7 || $json->status == 5) && $json->ias_unload_id != ''){
			$master->Load_Unload_Purchase_Reverse($json->ias_unload_id,0);
		}
		if(($json->status == 7 || $json->status == 5) && $json->ias_load_id != ''){
			$master->Load_Load_IAS_Reverse($json->ias_load_id,0);
		}
		if(($json->status == 7 || $json->status == 5) && $json->unload_id != ''){
			$master->Load_Unload_Purchase_Reverse($json->unload_id,0);
		}
		$result = $master->Load_Unload_Payment_Update($json->ID,$data);
		return  $this->respond(["results" =>$result,"success"=>1]);
	}

	public function MIRO_NUMBER()
	{
		$json = $this->request->getJSON();
		$master = new ModelsLoadingunloadingcost();
		$data = $master->MIRO_NUMBER($json);
		return  $this->respond(["results" =>$data,"success"=>1]);
	}

	public function Load_Unload_Payment_Reverse()
	{
		$json = $this->request->getJSON();
		$master = new ModelsLoadingunloadingcost();
		$data = $master->Load_Unload_Payment_Reverse($json);
		$load_unload_info=$data[0]['load_unload_info'];
		return  $this->respond(["results" =>$data,"success"=>1,"load_unload_info" => json_decode($load_unload_info)]);
	}

	public function Load_Unload_Payment_Report()
	{
		$json = $this->request->getJSON();
		$master = new ModelsLoadingunloadingcost();
		$data = $master->Load_Unload_Payment_Report($json);
		$load_unload_info=$data[0]['load_unload_info'];
		return  $this->respond(["results" =>$data,"success"=>1,"load_unload_info" => json_decode($load_unload_info)]);
	}

	public function IAS_SAP_Migo_Get()
	{
		include_once APIPATH . "/db_connection.php";
		$urlPath ="zwh_iasmigo/migo?sap-client=900";
		$sapResult = SapUrlHelper::getWhDatas($urlPath);
		$array = json_decode($sapResult);
		foreach ($array as $migo) {
			$VA_NUMBER=trim($migo->ZIASNO);
			$MIGO_NUMBER=trim($migo->ZMIGO_NUMBER);
				$usqls = "SELECT VECHICAL_STATUS FROM purchase_info WHERE ZVA_NUMBER = '$VA_NUMBER' AND VECHICAL_STATUS = '12'";
				// print_r($usqls);exit;
				$result = mysqli_query($connect, $usqls);
				 $Fetch = mysqli_fetch_assoc($result);
				//  print_r($Fetch);exit;

					if($Fetch['VECHICAL_STATUS'] == 12) {
						$usql = "UPDATE purchase_info SET MIGO_NUM=$MIGO_NUMBER WHERE ZVA_NUMBER = '$VA_NUMBER'";
					 $res = mysqli_query($connect, $usql);
					}else{
					 $res = false;
					}
		}
	return json_encode(["success" => 1, "results" =>  $res]);
	}

	public function SAP_PostingDate()
	{
		$master = new ModelsLoadingunloadingcost();
		$data = $master->SAP_PostingDate();
		return  $this->respond(["results" =>$data,"success"=>1]);
	}
}
