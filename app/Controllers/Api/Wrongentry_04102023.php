<?php namespace App\Controllers\Api;

use App\Helpers\SapUrlHelper;
use App\Models\RakeloadingModel;
use App\Models\UserModel;
use App\Models\WrongentryModel;

use function PHPUnit\Framework\lessThan;

class Wrongentry extends BaseApiController
{
  
    public function updateVehicleposition(){

			$PI_REFID = $this->request->getJSON();

			// print_r($this->request->getJSON());exit();
			$format = date('Y-m-d H:i:s');

			$id = $PI_REFID->PI_REFID;
			$remarks = $PI_REFID->remarks;
			$MigoRejectedBy = $PI_REFID->MigoRejectedBy;
			$MigoRejectedDt = $format;
			$MigoRejectedByName = $PI_REFID->MigoRejectedByName;
			// print_r($id);exit();
			$VECHICAL_STATUS = $PI_REFID->wrong == '1' ? '25' :  '26' ;
	
			$wrong_entry_model = new WrongentryModel();
			
			$wrong_entry_model->updateVehicle($id, $VECHICAL_STATUS ,$remarks,$MigoRejectedBy,$MigoRejectedDt,$MigoRejectedByName);
    }

	public function WrongWBApproval(){

		$PI_REFID = $this->request->getJSON();


		$format = date('Y-m-d');
		$time = date('H:i:s');
		$formats = date('Y-m-d H:i:s');

		if($PI_REFID->VECHICAL_STAT == "7") {
			$id = $PI_REFID->id;
			$model = new RakeloadingModel();
			$res = $model->SAPPushDataGet($id);
			$resu = $model->SAPTOPPLastID();
// print_r($res);exit;
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
				"zqty1"=>round(intval($res[0]['ZQTY'])/1000,3),
				"meins1"=>'TON',
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
				"migodate"=>$format,
				"migotime"=>$time,
				"po_line_item1"=>$res[0]['PO_LINE_ITEM'],
				"migo_num1"=>$res[0]['MIGO_NUM'],
				"zgo_refid"=>$res[0]['GO_REFID'],
				"ZGO_purchase_info_id"=>$res[0]['purchase_info_id'],
				"ZGO_bag_type"=>$res[0]['bag_type'],
				"ZGO_no_bags"=>$res[0]['no_bags'],
				"ZGO_wb_empty_wt"=>$res[0]['wb_empty_wt'],
				"ZGO_wb_net_wt"=>$res[0]['wb_net_wt'],
				"ZGO_gunny_wt"=>$res[0]['gunny_wt'],
				"ZGO_gunny_less_wt"=>$res[0]['gunny_less_wt'],
				"ZGO_supplier_wb_dt"=>$res[0]['supplier_wb_dt'],
				"ZGO_supplier_wb_qty"=>$res[0]['supplier_wb_qty'],
				"ZGO_invoice_rate"=>$res[0]['invoice_rate'],
				"ZGO_invoice_no"=>$res[0]['invoice_no'],
				"ZGO_invoice_date"=>$res[0]['invoice_date'],
				"ZGO_invoice_qty"=>$res[0]['invoice_qty'],
				"ZGO_supp_inv_copy"=>$res[0]['supp_inv_copy'],
				"ZGO_supp_wb_copy"=>$res[0]['supp_wb_copy'],
				"ZGO_naga_os_wb_copy"=>$res[0]['naga_os_wb_copy'],
				"ZGO_wb_name"=>$res[0]['wb_name'],
				"ZGO_wb_serial_no"=>$res[0]['wb_serial_no'],
				"ZGO_wb_load_wt"=>$res[0]['wb_load_wt'],
				"ZGO_is_own_wb"=>$res[0]['is_own_wb'],
				"ZGO_wb_ticket_no"=>$res[0]['wb_ticket_no'],
				"ZGO_unload_lot"=>$res[0]['unload_lot'],
				"zref_id"=>$resu[0]['REF_ID']+1,
				"zva_number"=>$res[0]['ZVA_NUMBER'],
				"zpo_number"=>$res[0]['ZPO_NUMBER'],
				"ZGO_bag_type1"=>$res[0]['bag_type2'],
				"ZGO_no_bags1"=>$res[0]['no_bags2'],
				"ZGO_bag_type2"=>$res[0]['bag_type3'],
				"ZGO_no_bags2"=>$res[0]['no_bags3'],
				"bukrs"=>'',
				"zpo_line_item"=>$res[0]['PO_LINE_ITEM'],
				"zvendor_code"=>$res[0]['ZVENDOR_CODE'],
				"zvendor_name"=>$res[0]['ZVENDOR_NAME'],
				"zsupplier_code"=>$res[0]['ZSUPPLIER_CODE'],
				"zsupplier_name"=>$res[0]['ZSUPPLIER_NAME'],
				"zquantity"=>round(intval($res[0]['ZQTY'])/1000,3),
				"qty1"=>round(intval($res[0]['ZQTY'])/1000,3),
				"zuom"=>'TON',
				"zwheat_variety"=>$res[0]['IDNLF'],
				"zmatnr"=>$res[0]['MATNR'],
				"zsgt_scat"=>$res[0]['segment'],
				"zplant"=>$res[0]['WERKS'],
				"zstorage_location"=>$res[0]['LGORT'],
				"zPO_Rate"=>$res[0]['NETPR'],
				"rate1"=>$res[0]['NETPR'],
				"ztruck_container_number"=>$res[0]['TRUCK_NO'],
				"zvendor_invoice"=>$res[0]['TRUCK_NO'],
				"zdeduction_amount2"=>$res[0]['deduction_amount'],
				"zcontainer_number"=>$res[0]['CONTAINER_NO'],
				"ZUNLOADING_VENDOR"=>$res[0]['UnloadVendorName'],
				"ZUNLOADING_COST"=>$res[0]['UnloadVendorCharge'],
				"ZZTRIPSHEET_NO"=>$res[0]['tripsheet_no'],
				"ZZGAT_OUT_TM1"=>$res[0]['GAT_OUT_TM1'],
				"ZZFNR_NO"=>$res[0]['fnr_no'],
				"ZLOADING_VENDOR"=>$res[0]['Code'],
				"ZLOADING_VENDOR_NAME"=>$res[0]['Name'],
				"ZLOADING_VENDOR_COST"=>$res[0]['loading_charge'],
				"ZZVENDOR_NO"=>"",
				"Migo_staus"=>"I"
			  );
			  $urlPath ="zrake/zrake_migoapp/migoapp?sap-client=900";
	
			//   print_r($sap_data);exit;
			  $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
		
			  $message = $res[0]->MESSAGE;
		  
			  if($res[0]->STATUS == 0){
				return $this->sendErrorResult("$message Please Contact SAP Team");
			  }else if(($res[0]->STATUS) > 0){
				
				$data = array(
					'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STAT,
					'MIGOApprovalBy' =>$PI_REFID->MIGOApprovalBy,
					'MIGOApprovalDt' =>$format,
					'MIGOApprovalByName'=>$PI_REFID->MIGOApprovalByName,
					'ZDATE' =>$format,
					'ZTIME'=>$time,
					"MIGO_NUM"=>$res[0]->MIGONO,
				);
				$data1 = array(
					'ZVA_NUMBER' =>$PI_REFID->ZVA_NUMBER,
					'ZPO_NUMBER' =>$PI_REFID->ZPO_NUMBER,
					'ZPO_LINE_ITEM' =>$PI_REFID->PO_LINE_ITEM,
					'ZDATE' =>$format,
					'ZTIME'=>$time,
					'ZVENDOR_CODE' =>$PI_REFID->ZVENDOR_CODE,
					'ZVENDOR_NAME' =>$PI_REFID->ZVENDOR_NAME,
					'ZSUPPLIER_CODE' =>$PI_REFID->ZSUPPLIER_CODE,
					'ZSUPPLIER_NAME' =>$PI_REFID->ZSUPPLIER_NAME,
					'ZQTY' =>$PI_REFID->ZQTY/1000,
					'MEINS' =>"",
					'IDNLF' =>$PI_REFID->IDNLF,
					'MATNR' =>$PI_REFID->MATNR,
					'SGT_SCAT' =>"",
					'NETPR' =>$PI_REFID->NETPR,
					'WERKS' =>$PI_REFID->WERKS,
					'LGORT' =>$PI_REFID->STORAGE_LOCATION,
					'ZTRUCK_CONTAINER_NUMBER' =>$PI_REFID->TRUCK_NO,
					'ZVENDOR_INVOICE' =>$PI_REFID->invoice_no,
					'isupdate'=>"0",
					'ZDEDUCTION_AMOUNT'=>$PI_REFID->deduction_amount,
				);
		 }
		}else if($PI_REFID->VECHICAL_STATUS == '27'){
			$id = $PI_REFID->id;
			$model = new RakeloadingModel();
			$res = $model->SAPPushDataGet($id);
			$sap_data = array (
				"zva_number1"=>$res[0]['ZVA_NUMBER'],
				"zva_number"=>$res[0]['ZVA_NUMBER'],
				"Migo_reject_Flag"=>'X',
				"Migo_reason"=>$res[0]['remarks'],
				"Migo_staus"=>"R"
			  );
			  $urlPath ="zrake/zrake_migoapp/migoapp?sap-client=900";
			//   print_r($sap_data);exit;
			  $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
			  $message = $res[0]->MESSAGE;

			  if($res[0]->STATUS == 0){
				return $this->sendErrorResult("$message Please Contact SAP Team");
			  }elseif ($res[0]->STATUS > 0){
				$data = array(
				'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STATUS,
				'MigoRejectedDt' =>$formats,
				);
		      }
		 }else if($PI_REFID->VECHICAL_STATUS == '28'){
				$data = array(
				'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STATUS,
				'MigoRejectedDt' =>$formats,
			    );
		}else{
			$id = $PI_REFID->id;
			$data = array(
			'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STATUS,
			);
		}
	

		$wrong_entry_model = new WrongentryModel();
		
		$wrong_entry_model->updateVehicleApproval($id, $data,$data1);
    }

	public function WrongPOApproval(){

		$PI_REFID = $this->request->getJSON();
		$id = $PI_REFID->id;
		$format = date('Y-m-d H:i:s');

		$data = array(
			'VECHICAL_STATUS' =>'28',
			'MigoRejectedDt' =>$format,
		);
		$data1 = array(
			'ZVA_NUMBER' =>$PI_REFID->ZVA_NUMBER,
		);
		$wrong_entry_model = new WrongentryModel();
		
		$wrong_entry_model->updateVehicleApproval($id, $data,$data1);
    }

	public function MigoApprovalReject(){

		$PI_REFID = $this->request->getJSON();

		$format = date('Y-m-d H:i:s');
		$id = $PI_REFID->id;
	
		$model = new RakeloadingModel();
		$res = $model->SAPPushDataGet($id);
		$sap_data = array (
			"zva_number"=>$res[0]['ZVA_NUMBER'],
			"Migo_reject_Flag"=>'X',
			"Migo_reason"=>$res[0]['remarks'],
			"Migo_staus"=>"R"
		  );
		  $urlPath ="zrake/zrake_migorejec/migorejct?sap-client=900";
		  $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
		  $message = $res[0]->MESSAGE;

		if($res[0]->STATUS == 0) {
			return $this->sendErrorResult("$message Please Contact SAP Team");
		}else if($res[0]->STATUS > 0){
			$data = array(
				'VECHICAL_STATUS' =>'31',
				'MigoRejectedDt'=>$format,
			);
			$data1 = array(
				'ZVA_NUMBER' =>$PI_REFID->ZVA_NUMBER,
			);
		}
		$wrong_entry_model = new WrongentryModel();
		
		$wrong_entry_model->updateVehicleApproval($id, $data,$data1);
    }

	 public function purchase_info_getByID(){
		$postData = $this->request->getJSON();
		// print_r($postData->id);exit();
		$model = new WrongentryModel();
		$res = $model->purchase_info_getByID($postData->id);
		return  $this->respond(["success" => 1, "results" => $res]);
	  }

	public function gateout_info_getByID(){
		$postData = $this->request->getJSON();
		// print_r($postData->id);exit();
		$model = new WrongentryModel();
		$res = $model->gateout_info_getByID($postData->id);
		return  $this->respond(["success" => 1, "results" => $res]);
	  }

	  public function WB_Entry_Reversal(){
		$reverse_data = $this->request->getJSON();
				// print_r($reverse_data);exit();
		$data = array(
			'wb_empty_wt' =>$reverse_data->wb_empty_wt,
			'wb_load_wt' =>$reverse_data->wb_load_wt,
			'wb_net_wt' =>$reverse_data->wb_net_wt,
			'gunny_less_wt' =>$reverse_data->gunny_less_wt,
			'wb_load_wt_old'=>$reverse_data->wb_load_wt_old,
			'wb_empty_wt_old'=>$reverse_data->wb_empty_wt_old
		);
			
		 $purchase_info_id = $reverse_data->zvanumber;
		 $wrong_entry_model = new WrongentryModel();
		 $wrong_entry_model->common_edit($data, $purchase_info_id);
		 return  $this->respond(["success" => '1']);
		}

	public function PO_Entry_Reversal(){
			$reverse_data = $this->request->getJSON();
			// echo "<pre>";print_r($this->request->getJson());exit();

			$format = date('Y-m-d H:i:s');
			if($reverse_data->Invoicecopy){
				$InvoiceCopy = $reverse_data->Invoicecopy;
			}else{
				$InvoiceCopy = $reverse_data->supp_inv_copy;
			}

			if($reverse_data->WBCopy){
				$WBCopy = $reverse_data->WBCopy;
			}else{
				$WBCopy = $reverse_data->supp_wb_copy;
			}

			if($reverse_data->NagaOutsideWBCopy){
				$NagaOutsideWBCopy = $reverse_data->NagaOutsideWBCopy;
			}else{
				$NagaOutsideWBCopy = $reverse_data->naga_os_wb_copy;
			}

			if($reverse_data->VECHICAL_STATUS == '28'){
				$VECHICAL_STATUS = $reverse_data->VEHICLETYPE == 'RAKE' ? '30' : $reverse_data->VEHICLETYPE == 'Rake' ? '30' : '2';
			}else{
				$VECHICAL_STATUS = '30';
			}

			if($reverse_data->BROCKER_CODE){
				$BROCKER_CODE = $reverse_data->BROCKER_CODE;
			}else{
				$BROCKER_CODE = $reverse_data->ZVENDOR_CODE;
			}

			if($reverse_data->BROCKER_NAME){
				$BROCKER_NAME = $reverse_data->BROCKER_NAME;
			}else{
				$BROCKER_NAME = $reverse_data->ZVENDOR_NAME;
			}

			if($reverse_data->ZPO_LINE_ITEM){
				$ZPO_LINE_ITEM = $reverse_data->ZPO_LINE_ITEM;
			}else{
				$ZPO_LINE_ITEM = $reverse_data->PO_LINE_ITEM;
			}

			if($reverse_data->VEHICLETYPE){
				$VEHICLETYPE = $reverse_data->VEHICLETYPE;
			}else{
				$VEHICLETYPE = $reverse_data->VEHICLE_TYPE;
			}
			
			if($reverse_data->plant_id){
				$PLANT_NAME = $reverse_data->plant_id;
			}else{
				$PLANT_NAME = $reverse_data->WERKS;
			}
			if($reverse_data->storage_id){
				$storage_id = $reverse_data->storage_id;
			}else{
				$storage_id = $reverse_data->LGORT;
			}
			$data_purchase_info = array(
				'ZVA_NUMBER' =>$reverse_data->ZVA_NUM,
				'ZPO_NUMBER' =>$reverse_data->ZPO_NUMBER,
				'ZVENDOR_CODE' =>$BROCKER_CODE,
				'ZVENDOR_NAME' =>$BROCKER_NAME,
				'ZSUPPLIER_CODE' =>$reverse_data->ZSUPPLIER_CODE,
				'ZSUPPLIER_NAME' =>$reverse_data->ZSUPPLIER_NAME,
				'ZQTY' =>$reverse_data->ZQTY,
				// 'MEINS' =>'',
				'IDNLF' =>$reverse_data->IDNLF,
				'MATNR' =>$reverse_data->MATNR,
				// 'SGT_SCAT' =>'',
				'NETPR' =>$reverse_data->NETPR,
				'WERKS' =>$PLANT_NAME,
				'LGORT' =>$storage_id,
				'INCO1' =>$reverse_data->INCO1,
				'TRUCK_NO' =>$reverse_data->TRUCK_NO,
				'DRIVER_NO' =>$reverse_data->DRIVER_NO,
				'VECHICAL_STATUS' =>$VECHICAL_STATUS,
				// 'WAIT_IN_TM' =>'',
				// 'GAT_IN_TM' =>'2023-04-03',
				// 'DEVICE_TYPE' =>'',
				'PO_BAG_TYPE' =>$reverse_data->bag_type,
				'SCREEN_TYPE' =>$reverse_data->SCREEN_TYPE,
				'VEHICLE_TYPE' =>$VEHICLETYPE,
				'InvoiceCopy' =>$InvoiceCopy,
				'WBCopy' =>$WBCopy,
				// 'QA_STATUS' =>'',
				// 'ZDATE' =>'',
				'PO_LINE_ITEM' =>$ZPO_LINE_ITEM,
				'CONTAINER_NO' =>$reverse_data->CONTAINER_NO,
				// 'MIGO_NUM' =>'',
				// 'PICK_SLIP_NO' =>'',
				// 'EMPTY_VEHICLE_ARRIVAL_ID' =>'',
				// 'IsFromSDT' =>'',
				// 'IsUpdated' =>'',
				// 'PlantDescription' =>'',
				// 'StorageLocation' =>'',
				'InvoiceQty' =>$reverse_data->invoice_qty,
				'InvoiceRate' =>$reverse_data->invoice_rate*1000,
				'MigoRejectedByName'=>$reverse_data->MIGOApprovalByName,
				'MigoRejectedBy'=>$reverse_data->MIGOApprovalBy,
				'MigoRejectedDt'=>$format,
				'migo_status' =>$reverse_data->VECHICAL_STATUS == '28' ? '1' : '2',
			);


			$data_gate_in = array(
				'purchase_info_id' =>$reverse_data->ZVA_NUMBER,
				'bag_type' =>$reverse_data->bag_type,
				'bag_type2' =>$reverse_data->bag_type2,
				'bag_type3' =>$reverse_data->bag_type3,
				'no_bags' =>$reverse_data->no_bags,
				'no_bags2' =>$reverse_data->no_bags2,
				'no_bags3' =>$reverse_data->no_bags3,
				'wb_empty_wt' =>$reverse_data->wb_empty_wt,
				'wb_net_wt' =>$reverse_data->wb_net_wt,
				'gunny_wt' =>$reverse_data->gunny_wt,
				'gunny_less_wt' =>$reverse_data->gunny_less_wt,
				'supplier_wb_dt' =>$reverse_data->supplier_wb_dt,
				'supplier_wb_qty' =>$reverse_data->supplier_wb_qty,
				'invoice_rate' =>$reverse_data->invoice_rate,
				'invoice_no' =>$reverse_data->invoice_no,
				'invoice_qty' =>$reverse_data->invoice_qty,
				'invoice_bag_count' =>$reverse_data->invoice_bag_count,
				'invoice_date' =>$reverse_data->invoice_date,
				'wb_name' =>$reverse_data->wb_name,
				'wb_serial_no' =>$reverse_data->wb_serial_no,
				'wb_load_wt' =>$reverse_data->wb_load_wt,
				'is_own_wb' =>$reverse_data->is_own_wb,
				'wb_ticket_no'=>$reverse_data->wb_ticket_no,
				'unload_lot'=>$reverse_data->unload_lot,
				'supp_inv_copy' =>$InvoiceCopy,
				'supp_wb_copy' =>$WBCopy,
				'naga_os_wb_copy' =>$NagaOutsideWBCopy,
				'UnloadVendorName' =>$reverse_data->UnloadVendorName,
				'UnloadVendorCharge' =>$reverse_data->UnloadVendorCharge,
			);

			 $wrong_entry_model = new WrongentryModel();
			 $res = $wrong_entry_model->common_insert($data_purchase_info,$data_gate_in);
			
			 return  $this->respond(["success" => 1, "results" => $res]);      
		}
}