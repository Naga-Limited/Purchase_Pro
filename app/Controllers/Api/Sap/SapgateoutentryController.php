<?php

namespace App\Controllers\Api\Sap;

use App\Controllers\Api\BaseApiController;
use App\Helpers\SapUrlHelper;
use App\Models\RakeloadingModel;

class SapgateoutentryController extends BaseApiController
{
	public function index()
	{
		$json = $this->request->getJSON();

		$CurrentDate=date("Y-m-d");
		$CurrentTime=date("H:i:s");
		$CurrentDateTime=date("Y-m-d H:i:s");

		$model = new RakeloadingModel();
		$res = $model->SAPPushDataGet($json->id);

		$sap_data = array (
			"zqi_refid"=>$res[0]['QI_REFID'],
			"zpurchase_info_id"=>$res[0]['PI_REFID'],
			"zprotein_quality"=>$res[0]['protein_quality'],
			"zmoisture_quality"=>$res[0]['moisture_quality'],
			"zash_quality"=>$res[0]['ash_quality'],
			"zwet_gluten_quality"=>$res[0]['wet_gluten_quality'],
			"zdry_gluten_quality"=>$res[0]['dry_gluten_quality'],
			"zsv_quality"=>$res[0]['sv_quality'],
			"zhl_quality"=>$res[0]['hl_quality'],
			"zkernel_quality"=>$res[0]['kernel_quality'],
			"zmm_quality"=>$res[0]['mm_quality'],
			"zforeign_matter_quality"=>$res[0]['foreign_matter_quality'],
			"zmudballs_quality"=>$res[0]['mudballs_quality'],
			"zbroken_wheat_quality"=>$res[0]['broken_wheat_quality'],
			"zblack_wheat_quality"=>$res[0]['black_wheat_quality'],
			"zsoft_wheat_quality"=>$res[0]['soft_wheat_quality'],
			"zshriveled_wheat_quality"=>$res[0]['shriveled_wheat_quality'],
			"zimmature_wheat_quality"=>$res[0]['immature_wheat_quality'],
			"zinsect_damage_wheat_quality"=>$res[0]['insect_damage_wheat_quality'],
			"zmixed_wheat_quality"=>$res[0]['mixed_wheat_quality'],
			"zkernel_bunt_quality"=>$res[0]['kernel_bunt_quality'],
			"zofg_quality"=>$res[0]['ofg_quality'],
			"zinfestation_quality"=>$res[0]['infestation_quality'],
			"zfungus_quality"=>$res[0]['fungus_quality'],
			"zrain_damage_quality"=>$res[0]['rain_damage_quality'],
			"zprotein_type_quality"=>$res[0]['protein_type_quality'],
			"zfn_quality"=>$res[0]['fn_quality'],
			"zothers_comment"=>$res[0]['others_comment'],
			"zoverall_result"=>$res[0]['overall_result'],
			"zdegrade"=>$res[0]['degrade'],
			"zdeduction_amount1"=>$res[0]['deduction_amount'],
			"zwheat_variety1"=>$res[0]['IDNLF'],
			"zfungus_quality_noofbag"=>$res[0]['fungus_quality_noofbag'],
			"zqc_work_doc"=>$res[0]['qc_work_doc'],
			"zfungus_quality_quarantine"=>$res[0]['fungus_quality_quarantine'],
			"zrecommended_lot"=>$res[0]['recommended_lot'],
			"zrain_damage_quality_noofbag"=>$res[0]['rain_damage_quality_noofbag'],
			"zrain_damage_quality_quarantin"=>$res[0]['rain_damage_quality_quarantine'],
			"zred_grain_quality"=>$res[0]['red_grain_quality'],
			"zpi_refid"=>$res[0]['PI_REFID'],
			"zva_number1"=>$res[0]['ZVA_NUMBER'],
			"zpo_number1"=>$res[0]['ZPO_NUMBER'],
			"zvendor_code1"=>$res[0]['ZVENDOR_CODE'],
			"zvendor_name1"=>$res[0]['ZVENDOR_NAME'],
			"zsupplier_code1"=>$res[0]['ZSUPPLIER_CODE'],
			"zsupplier_name1"=>$res[0]['ZSUPPLIER_NAME'],
			"zqty1"=>$res[0]['ZQTY'],
			"meins1"=>$res[0]['MEINS'] ?? 'TON',
			"idnlf1"=>$res[0]['IDNLF'],
			"matnr1"=>$res[0]['MATNR'],
			"sgt_scat1"=>$res[0]['segment'],
			"netpr1"=>$res[0]['NETPR'],
			"werks1"=>$res[0]['WERKS'],
			"lgort1"=>$res[0]['LGORT'],
			"truck_no1"=>$res[0]['TRUCK_NO'],
			"driver_no1"=>$res[0]['DRIVER_NO'],
			"vechical_status1"=>$res[0]['VECHICAL_STATUS'],
			"wait_in_tm1"=>$res[0]['WAIT_IN_TM'],
			"gat_in_tm1"=>$res[0]['GAT_IN_TM'],
			"inco11"=>$res[0]['INCO1'],
			"device_type1"=>$res[0]['DEVICE_TYPE'],
			"po_bag_type1"=>$res[0]['PO_BAG_TYPE'],
			"screen_type1"=>$res[0]['SCREEN_TYPE'],
			"vehicle_type1"=>$res[0]['VEHICLE_TYPE'],
			"qa_status1"=>$res[0]['QA_STATUS'],
			"migodate"=>$CurrentDate,
			"migotime"=>$CurrentTime,
			"po_line_item1"=>$res[0]['PO_LINE_ITEM'],
			"migo_num1"=>$res[0]['MIGO_NUM'],
			"zgo_refid"=>$res[0]['GO_REFID'],
			"ZGO_purchase_info_id"=>$res[0]['purchase_info_id'],
			"ZGO_bag_type"=>$json->bag_type,
			"ZGO_no_bags"=>$json->no_bags,
			"ZGO_wb_empty_wt"=>$json->wb_empty_wt,
			"ZGO_wb_net_wt"=>$json->wb_net_wt,
			"ZGO_gunny_wt"=>$json->gunny_wt,
			"ZGO_gunny_less_wt"=>$json->gunny_less_wt,
			"ZGO_supplier_wb_dt"=>$json->supplier_wb_dt,
			"ZGO_supplier_wb_qty"=>$json->supplier_wb_qty,
			"ZGO_invoice_rate"=>$json->invoice_rate,
			"ZGO_invoice_no"=>$json->invoice_no,
			"ZGO_invoice_date"=>$json->invoice_date,
			"ZGO_invoice_qty"=>$json->invoice_qty,
			"ZGO_supp_inv_copy"=>$json->supp_inv_copy,
			"ZGO_supp_wb_copy"=>$json->supp_wb_copy,
			"ZGO_naga_os_wb_copy"=>$json->naga_os_wb_copy,
			"ZGO_wb_name"=>$json->wb_name,
			"ZGO_wb_serial_no"=>$res[0]['wb_serial_no'],
			"ZGO_wb_load_wt"=>$json->wb_load_wt,
			"ZGO_is_own_wb"=>$json->is_own_wb,
			"ZGO_wb_ticket_no"=>$json->wb_ticket_no,
			"ZGO_unload_lot"=>$res[0]['unload_lot'],
			"zref_id"=>'',
			"zva_number"=>$res[0]['ZVA_NUMBER'],
			"zpo_number"=>$res[0]['ZPO_NUMBER'],
			"ZGO_bag_type1"=>$json->bag_type2,
			"ZGO_no_bags1"=>$json->no_bags2,
			"ZGO_bag_type2"=>$json->bag_type3,
			"ZGO_no_bags2"=>$json->no_bags3,
			"bukrs"=>'',
			"zpo_line_item"=>$res[0]['PO_LINE_ITEM'],
			"zvendor_code"=>$res[0]['ZVENDOR_CODE'],
			"zvendor_name"=>$res[0]['ZVENDOR_NAME'],
			"zsupplier_code"=>$res[0]['ZSUPPLIER_CODE'],
			"zsupplier_name"=>$res[0]['ZSUPPLIER_NAME'],
			"zquantity"=>'',
			"qty1"=>'',
			"zuom"=>$res[0]['MEINS'] ?? 'TON',
			"zwheat_variety"=>$res[0]['IDNLF'],
			"zmatnr"=>$res[0]['MATNR'],
			"zsgt_scat"=>$res[0]['segment'],
			"zplant"=>$res[0]['WERKS'],
			"zstorage_location"=>$res[0]['LGORT'],
			"zPO_Rate"=>$res[0]['NETPR'],
			"rate1"=>$res[0]['NETPR'],
			"ztruck_container_number"=>$res[0]['TRUCK_NO'],
			"zvendor_invoice"=>$json->invoice_no,
			"zdeduction_amount2"=>$res[0]['deduction_amount'],
			"zcontainer_number"=>$res[0]['CONTAINER_NO'],
			"ZUNLOADING_VENDOR"=>$res[0]['UnloadVendorName'],
			"ZUNLOADING_COST"=>$res[0]['UnloadVendorCharge'],
			"ZZTRIPSHEET_NO"=>isset($res[0]['tripsheet_no']) ? $res[0]['tripsheet_no'] : $res[0]['TRIPSHEET_NO'],
			"ZZGAT_OUT_TM1"=>$CurrentDateTime,
			"ZZFNR_NO"=>$res[0]['fnr_no'],
			"ZLOADING_VENDOR"=>$res[0]['Code'],
			"ZLOADING_VENDOR_NAME"=>$res[0]['Name'],
			"ZLOADING_VENDOR_COST"=>$res[0]['loading_charge'],
			"ZZVENDOR_NO"=>"",
			"ZZATTI_COOLI"=> $res[0]['ATTI_COOLI'],
			"ZZEXTRA_CHARGE"=> $res[0]['EXTRA_CHARGE'],
			"ZZOFFICE_EXPENSE"=> $res[0]['OFFICE_EXPENSE_KG'],
			"ZZWEIGHTMENT_CHARGE"=> $res[0]['WEIGHTMENT_CHARGE'],
			"ZZGATE_EXPENSE"=> $res[0]['GATE_EXPENSE'],
			"ZZOVERALL_EXPENSE"=> $res[0]['OVERALL_EXPENSE'],
			"zzfreight_charg"=> $res[0]['FREIGHT_COST_KG'],
			"zzloading_charg"=> $res[0]['OVERALL_EXPENSE'],
			"zzcost_type"=>$res[0]['COST_TYPE'],
			"ZZTRIPSHEET_NO_A"=>$res[0]['TRIPSHEET_NO1'],
			"machine_type1"=>$res[0]['machine_type1'],
			"machine_type2"=>$res[0]['machine_type2'],
			"machine_type3"=>$res[0]['machine_type3'],
		  );
		  $urlPath ="zrake/zrake_gateout/rake?sap-client=900";

		//   print_r($sap_data);exit;
		  $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
	
		  $message = $res[0]->MESSAGE;
	  
		  if($res[0]->STATUS == 0){
			return $this->sendErrorResult("$message Please Contact SAP Team");
		  }else if(($res[0]->STATUS) > 0){
			return  $this->respond(["success" => 1,"results"=>$res]);  
		  }
	}


	public function Migo_SAP_Push()
	{
		$json = $this->request->getJSON();

		$CurrentDateTime=date("Y-m-d H:i:s");
		$CurrentDate=date("Y-m-d");
		$CurrentTime=date("H:i:s");
		$model = new RakeloadingModel();
		$res = $model->SAPPushDataGet($json->id);
		$resu = $model->SAPTOPPLastID();
		$vehicleType = $res[0]['VEHICLE_TYPE'];
		$sap_data = array (
			"zqi_refid"=>$res[0]['QI_REFID'],
			"zpurchase_info_id"=>$res[0]['PI_REFID'],
			"zprotein_quality"=>$res[0]['protein_quality'],
			"zmoisture_quality"=>$res[0]['moisture_quality'],
			"zash_quality"=>$res[0]['ash_quality'],
			"zwet_gluten_quality"=>$res[0]['wet_gluten_quality'],
			"zdry_gluten_quality"=>$res[0]['dry_gluten_quality'],
			"zsv_quality"=>$res[0]['sv_quality'],
			"zhl_quality"=>$res[0]['hl_quality'],
			"zkernel_quality"=>$res[0]['kernel_quality'],
			"zmm_quality"=>$res[0]['mm_quality'],
			"zforeign_matter_quality"=>$res[0]['foreign_matter_quality'],
			"zmudballs_quality"=>$res[0]['mudballs_quality'],
			"zbroken_wheat_quality"=>$res[0]['broken_wheat_quality'],
			"zblack_wheat_quality"=>$res[0]['black_wheat_quality'],
			"zsoft_wheat_quality"=>$res[0]['soft_wheat_quality'],
			"zshriveled_wheat_quality"=>$res[0]['shriveled_wheat_quality'],
			"zimmature_wheat_quality"=>$res[0]['immature_wheat_quality'],
			"zinsect_damage_wheat_quality"=>$res[0]['insect_damage_wheat_quality'],
			"zmixed_wheat_quality"=>$res[0]['mixed_wheat_quality'],
			"zkernel_bunt_quality"=>$res[0]['kernel_bunt_quality'],
			"zofg_quality"=>$res[0]['ofg_quality'],
			"zinfestation_quality"=>$res[0]['infestation_quality'],
			"zfungus_quality"=>$res[0]['fungus_quality'],
			"zrain_damage_quality"=>$res[0]['rain_damage_quality'],
			"zprotein_type_quality"=>$res[0]['protein_type_quality'],
			"zfn_quality"=>$res[0]['fn_quality'],
			"zothers_comment"=>$res[0]['others_comment'],
			"zoverall_result"=>$res[0]['overall_result'],
			"zdegrade"=>$res[0]['degrade'],
			"zdeduction_amount1"=>$res[0]['deduction_amount'],
			"zwheat_variety1"=>$res[0]['IDNLF'],
			"zfungus_quality_noofbag"=>$res[0]['fungus_quality_noofbag'],
			"zqc_work_doc"=>$res[0]['qc_work_doc'],
			"zfungus_quality_quarantine"=>$res[0]['fungus_quality_quarantine'],
			"zrecommended_lot"=>$res[0]['recommended_lot'],
			"zrain_damage_quality_noofbag"=>$res[0]['rain_damage_quality_noofbag'],
			"zrain_damage_quality_quarantin"=>$res[0]['rain_damage_quality_quarantine'],
			"zred_grain_quality"=>$res[0]['red_grain_quality'],
			"zpi_refid"=>$res[0]['PI_REFID'],
			"zva_number1"=>$res[0]['ZVA_NUMBER'],
			"zpo_number1"=>$res[0]['ZPO_NUMBER'],
			"zvendor_code1"=>$res[0]['ZVENDOR_CODE'],
			"zvendor_name1"=>$res[0]['ZVENDOR_NAME'],
			"zsupplier_code1"=>$json->ZSUPPLIER_CODE == '' ? $res[0]['ZSUPPLIER_CODE'] : $json->ZSUPPLIER_CODE,
			"zsupplier_name1"=>$json->ZSUPPLIER_NAME == '' ? $res[0]['ZSUPPLIER_NAME'] : $json->ZSUPPLIER_NAME,
			"zqty1"=>round($json->gunny_less_wt)/1000,3,
			"meins1"=>$res[0]['MEINS'] ?? 'TON',
			"idnlf1"=>$res[0]['IDNLF'],
			"matnr1"=>$res[0]['MATNR'],
			"sgt_scat1"=>$res[0]['segment'],
			"netpr1"=>$res[0]['NETPR'],
			"werks1"=>$res[0]['WERKS'],
			"lgort1"=>$res[0]['LGORT'],
			"truck_no1"=>$res[0]['TRUCK_NO'],
			"driver_no1"=>$res[0]['DRIVER_NO'],
			"vechical_status1"=>$res[0]['VECHICAL_STATUS'],
			"wait_in_tm1"=>$res[0]['WAIT_IN_TM'],
			"gat_in_tm1"=>$res[0]['GAT_IN_TM'],
			"inco11"=>$res[0]['INCO1'],
			"device_type1"=>$res[0]['DEVICE_TYPE'],
			"po_bag_type1"=>$res[0]['PO_BAG_TYPE'],
			"screen_type1"=>$res[0]['SCREEN_TYPE'],
			"vehicle_type1"=>$res[0]['VEHICLE_TYPE'],
			"qa_status1"=>$res[0]['QA_STATUS'],
			"migodate"=>$CurrentDate,
			"migotime"=>$CurrentTime,
			"po_line_item1"=>$res[0]['PO_LINE_ITEM'],
			"migo_num1"=>$res[0]['MIGO_NUM'],
			"zgo_refid"=>$res[0]['GO_REFID'],
			"ZGO_purchase_info_id"=>$res[0]['purchase_info_id'],
			"ZGO_bag_type"=>isset($json->bag_type) ? $json->bag_type : $res[0]['bag_type'],
			"ZGO_no_bags"=>isset($json->no_bags) ? $json->no_bags : $res[0]['no_bags'],
			"ZGO_wb_empty_wt"=>$json->wb_empty_wt,
			"ZGO_wb_net_wt"=>$json->wb_net_wt,
			"ZGO_gunny_wt"=>$json->gunny_wt,
			"ZGO_gunny_less_wt"=>$json->gunny_less_wt,
			"ZGO_supplier_wb_dt"=>$json->supplier_wb_dt,
			"ZGO_supplier_wb_qty"=>$json->supplier_wb_qty,
			"ZGO_invoice_rate"=>$json->invoice_rate,
			"ZGO_invoice_no"=>$json->invoice_no,
			"ZGO_invoice_date"=>$res[0]['invoice_date'] == ''?$json->invoice_date:$res[0]['invoice_date'],
			"ZGO_invoice_qty"=>$json->invoice_qty,
			"ZGO_supp_inv_copy"=>$json->supp_inv_copy,
			"ZGO_supp_wb_copy"=>$json->supp_wb_copy,
			"ZGO_naga_os_wb_copy"=>$json->naga_os_wb_copy,
			"ZGO_wb_name"=>$json->wb_name,
			"ZGO_wb_serial_no"=>$json->wb_serial_no,
			"ZGO_wb_load_wt"=>$json->wb_load_wt,
			"ZGO_is_own_wb"=>$res[0]['is_own_wb'],
			"ZGO_wb_ticket_no"=>$json->wb_ticket_no,
			"ZGO_unload_lot"=>$res[0]['unload_lot'],
			"zref_id"=>$resu[0]['REF_ID']+1,
			"zva_number"=>$res[0]['ZVA_NUMBER'],
			"zpo_number"=>$res[0]['ZPO_NUMBER'],
			"ZGO_bag_type1"=> isset($json->bag_type2) ? $json->bag_type2 : $res[0]['bag_type2'],
			"ZGO_no_bags1"=>isset($json->no_bags2) ? $json->no_bags2 : $res[0]['no_bags2'],
			"ZGO_bag_type2"=>isset($json->bag_type3) ? $json->bag_type3 : $res[0]['bag_type3'],
			"ZGO_no_bags2"=>isset($json->no_bags3) ? $json->no_bags3 : $res[0]['no_bags3'],
			"bukrs"=>'',
			"zpo_line_item"=>$res[0]['PO_LINE_ITEM'],
			"zvendor_code"=>$res[0]['ZVENDOR_CODE'],
			"zvendor_name"=>$res[0]['ZVENDOR_NAME'],
			"zsupplier_code"=>$json->ZSUPPLIER_CODE == '' ? $res[0]['ZSUPPLIER_CODE'] : $json->ZSUPPLIER_CODE,
			"zsupplier_name"=>$json->ZSUPPLIER_NAME == '' ? $res[0]['ZSUPPLIER_NAME'] : $json->ZSUPPLIER_NAME,
			"zquantity"=>round($json->gunny_less_wt)/1000,3,
			"qty1"=>round($json->gunny_less_wt)/1000,3,
			"zuom"=>$res[0]['MEINS'] ?? 'TON',
			"zwheat_variety"=>$res[0]['IDNLF'],
			"zmatnr"=>$res[0]['MATNR'],
			"zsgt_scat"=>$res[0]['segment'],
			"zplant"=>$res[0]['WERKS'],
			"zstorage_location"=>$res[0]['LGORT'],
			"zPO_Rate"=>$res[0]['NETPR'],
			"rate1"=>$res[0]['NETPR'],
			"ztruck_container_number"=>$res[0]['TRUCK_NO'],
			"zvendor_invoice"=>$json->invoice_no,
			"zdeduction_amount2"=>$res[0]['deduction_amount'],
			"zcontainer_number"=>$res[0]['CONTAINER_NO'],
			"ZUNLOADING_VENDOR"=>$res[0]['UnloadVendorName'],
			"ZUNLOADING_COST"=>$res[0]['UnloadVendorCharge'],
			"ZZTRIPSHEET_NO"=>isset($res[0]['tripsheet_no']) ? $res[0]['tripsheet_no'] : $res[0]['TRIPSHEET_NO'],
			"ZZGAT_OUT_TM1"=>$res[0]['GAT_OUT_TM1'],
			"ZZFNR_NO"=>$res[0]['fnr_no'],
			"ZLOADING_VENDOR"=>$res[0]['Code'],
			"ZLOADING_VENDOR_NAME"=>$res[0]['Name'],
			"ZLOADING_VENDOR_COST"=>$res[0]['loading_charge'],
			"ZZVENDOR_NO"=>"",
			"Migo_staus"=>$json->formType,
			"ZZATTI_COOLI"=> $res[0]['ATTI_COOLI'],
			"ZZEXTRA_CHARGE"=> $res[0]['EXTRA_CHARGE'],
			"ZZOFFICE_EXPENSE"=> $res[0]['OFFICE_EXPENSE_KG'],
			"ZZWEIGHTMENT_CHARGE"=> $res[0]['WEIGHTMENT_CHARGE'],
			"ZZGATE_EXPENSE"=> $res[0]['GATE_EXPENSE'],
			"ZZOVERALL_EXPENSE"=> $res[0]['OVERALL_EXPENSE'],
			"zzfreight_charg"=> $res[0]['FREIGHT_COST_KG'],
			"zzloading_charg"=> $res[0]['OVERALL_EXPENSE'],
			"zzcost_type"=>$res[0]['COST_TYPE'],
			"ZZTRIPSHEET_NO_A"=>$res[0]['TRIPSHEET_NO1'],
			"machine_type1"=>$res[0]['machine_type1'],
			"machine_type2"=>$res[0]['machine_type2'],
			"machine_type3"=>$res[0]['machine_type3'],
		  );
		  if($json->formType == 'U'){
			$urlPath ="zrake/zrake_migoappov/migoappove?sap-client=900";
		  }else if ($json->formType == 'I'){
		    $urlPath ="zrake/zrake_migoapp/migoapp?sap-client=900";
		  }

		//print_r($sap_data);exit;

		  $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
	
		  $message = $res[0]->MESSAGE;
		  if($res[0]->STATUS == 0 || empty($res[0]->STATUS)){
			return $this->sendErrorResult("$message Please Contact SAP Team");
		  }else if(($res[0]->STATUS) > 0){
			  $migoNo501 = 0;
			  if(in_array($vehicleType,['CM Truck','CM Rake','CM Container'])){
				$migoNo501 = $res[0]->MIGO501;
			  }
			  $data = array (
				"MIGO_NUM"=>$res[0]->MIGONO,
				"MIGOApprovalDt"=>$CurrentDateTime,
				"payment_status"=>1,
				"MIGO501"=>$migoNo501
			   );
			   $result = $model->Migo_Number_Update($json->id,$data);
			return  $this->respond(["success" => 1,"results"=>$result]);  
		  }
	}

	public function Migo_SAP_Reject()
	{
		$json = $this->request->getJSON();
		$model = new RakeloadingModel();
		$res = $model->SAPPushDataGet($json->id);
	
		$sap_data = array (
			"zva_number1"=>$res[0]['ZVA_NUMBER'],
			"zva_number"=>$res[0]['ZVA_NUMBER'],
			"Migo_reject_Flag"=>'X',
			"Migo_reason"=>$res[0]['remarks'],
			"Migo_staus"=>"X"
		  );
		  $urlPath ="zrake/zrake_migoapp/migoapp?sap-client=900";

		//   print_r($sap_data);exit;
		  $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
	
		  $message = $res[0]->MESSAGE;
	  
		  if($res[0]->STATUS == 0){
			return $this->sendErrorResult("$message Please Contact SAP Team");
		  }else if(($res[0]->STATUS) > 0){
			return  $this->respond(["success" => 1,"results"=>$res]);  
		  }
	}
}
