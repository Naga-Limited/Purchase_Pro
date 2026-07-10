<?php namespace App\Controllers\Api;
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
			$data = array(
				'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STAT,
				'MIGOApprovalBy' =>$PI_REFID->MIGOApprovalBy,
				'MIGOApprovalDt' =>$format,
				'MIGOApprovalByName'=>$PI_REFID->MIGOApprovalByName,
				'ZDATE' =>$format,
                                'ZTIME'=>$time,
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
		}else if($PI_REFID->VECHICAL_STATUS == '27'){
			$id = $PI_REFID->id;
			$data = array(
			'VECHICAL_STATUS' =>$PI_REFID->VECHICAL_STATUS,
			'MigoRejectedDt' =>$formats,
			);
		}else if($PI_REFID->VECHICAL_STATUS == '28'){
			$id = $PI_REFID->id;
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

		// print_r($this->request->getJSON());exit();

		$id = $PI_REFID->id;
		// print_r($id);exit();
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

		// print_r($this->request->getJSON());exit();
		$format = date('Y-m-d H:i:s');
		$id = $PI_REFID->id;
		// print_r($id);exit();
		$data = array(
			'VECHICAL_STATUS' =>'31',
			'MigoRejectedDt'=>$format,
		);
		$data1 = array(
			'ZVA_NUMBER' =>$PI_REFID->ZVA_NUMBER,
		);
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