<?php

namespace App\Models;

use CodeIgniter\Model;

class WrongentryModel extends Model
{
	public $builder;
	public $common_model;
	public $pp_to_sap;
	public $rake_loading;
	public $supplier_vehical_info;

    public function __construct() {
	   	$db      = \Config\Database::connect();
		$this->builder = $db->table('purchase_info'); 
		$this->common_model = $db->table('gateout_info'); 
    $this->pp_to_sap = $db->table('pp_to_sap'); 
    $this->rake_loading = $db->table('rake_loading'); 
    $this->supplier_vehical_info = $db->table('supplier_vehical_info'); 

    }

    public function purchase_info() {
    	return $this->builder->get();
    }

	public function updateVehicle(int $id, string $VECHICAL_STATUS , string $remarks,$MigoRejectedBy,$MigoRejectedDt,$MigoRejectedByName) {
		$this->builder->set('VECHICAL_STATUS', $VECHICAL_STATUS)
					  ->set('remarks',$remarks)
            ->set('MigoRejectedBy',$MigoRejectedBy)
	    ->set('MigoRejectedDt',$MigoRejectedDt)
            ->set('MigoRejectedByName',$MigoRejectedByName)
	    ->where('PI_REFID', $id)
	    ->update();
	  }

	public function updateVehicleApproval(int $id,$data,$data1 ) {

  $status = $data['VECHICAL_STATUS'];
	$this->builder->set($data)
					->where('PI_REFID', $id)
					->update();
  if($status == '7') {
    $this->pp_to_sap->insert($data1);
  }
	}

	public function purchase_info_getByID($id){
			$builder = $this->builder->join('quality_info', 'quality_info.purchase_info_id = purchase_info.PI_REFID', 'left')->where('purchase_info.PI_REFID', $id)->select(['purchase_info.remarks','purchase_info.ZQTY','purchase_info.ZVENDOR_CODE','purchase_info.WERKS','purchase_info.migo_status','purchase_info.CONTAINER_NO','quality_info.deduction_amount','purchase_info.LGORT','purchase_info.VECHICAL_STATUS']);
			$remarks = $builder->get();
			return  $remarks->getResultArray();
	}

	public function gateout_info_getByID($id){
		$builder = $this->common_model->where('purchase_info_id', $id)->select('unload_lot');
		$remarks = $builder->get();
		return  $remarks->getResultArray();
    }
	public function common_edit($data,$purchase_info_id)
    {
       $this->common_model->set($data)->where('purchase_info_id', $purchase_info_id)->update();
	   $this->builder->set('VECHICAL_STATUS', '6')->where('PI_REFID', $purchase_info_id)->update();
    }

	// public function common_insert($data)
    // {
    // //    $this->common_model->set($data)->where('purchase_info_id', $purchase_info_id)->update();
	//    $res=$this->builder->set($data)->insert();
	//    return  $res->getResultArray();

	public function common_insert($data_purchase_info,$data_gate_in,$purchase_info_id,$TRIPSHEET_NO)
    {
		// print_r($data_gate_in['bag_type']);exit();
    $res = $this->builder->insert($data_purchase_info);

    $lastId = $res->connID->insert_id;
 $VEHICLETYPE = $data_purchase_info['VEHICLE_TYPE'];
    if($VEHICLETYPE == 'RAKE'){
      
      $rake_data = array(
        'po_number' =>$data_purchase_info['ZPO_NUMBER'],
        'brocker_code' =>$data_purchase_info['ZVENDOR_CODE'],
        'brocker_name' =>$data_purchase_info['ZVENDOR_NAME'],
        'supplier_code' =>$data_purchase_info['ZSUPPLIER_CODE'],
        'supplier_name' =>$data_purchase_info['ZSUPPLIER_NAME'],
        'plant_id' =>$data_purchase_info['WERKS'],	
        'po_line_item' =>$data_purchase_info['PO_LINE_ITEM'],
        'purchase_info_id'=>$lastId,
        
      );

       // ✅ Conditionally add tripsheet_no or fallback status
        if (!empty($TRIPSHEET_NO)) {
          $rake_data['tripsheet_no'] = $TRIPSHEET_NO;
        } 

        // ✅ Conditionally add FNR_NO
        if (!empty($data_purchase_info['FNR_NO'])) {
            $rake_data['fnr_no'] = $data_purchase_info['FNR_NO'];
        }
        
      $this->rake_loading->set($rake_data)
			 ->where('purchase_info_id', $purchase_info_id)
			 ->update();
    }
    $data_gate = array(
        'purchase_info_id' =>$lastId,
        'bag_type' =>$data_gate_in['bag_type'],
        'bag_type2' =>$data_gate_in['bag_type2'],
        'bag_type3' =>$data_gate_in['bag_type3'],
        'no_bags' =>$data_gate_in['no_bags'],
        'no_bags2' =>$data_gate_in['no_bags2'],
        'no_bags3' =>$data_gate_in['no_bags3'],
        'wb_empty_wt' =>$data_gate_in['wb_empty_wt'],
        'wb_net_wt' =>$data_gate_in['wb_net_wt'],
        'gunny_wt' =>$data_gate_in['gunny_wt'],
        'gunny_less_wt' =>$data_gate_in['gunny_less_wt'],
        'supplier_wb_dt' =>$data_gate_in['supplier_wb_dt'],
        'supplier_wb_qty' =>$data_gate_in['supplier_wb_qty'],
        'invoice_rate' =>$data_gate_in['invoice_rate'],
        'invoice_no' =>$data_gate_in['invoice_no'],
        'invoice_qty' =>$data_gate_in['invoice_qty'],
        'invoice_bag_count' =>$data_gate_in['invoice_bag_count'],
        'invoice_date' =>$data_gate_in['invoice_date'],
        'wb_name' =>$data_gate_in['wb_name'],
        'wb_serial_no' =>$data_gate_in['wb_serial_no'],
        'wb_load_wt' =>$data_gate_in['wb_load_wt'],
        'is_own_wb' =>$data_gate_in['is_own_wb'],
        'unload_lot' =>$data_gate_in['unload_lot'],
        'supp_inv_copy' =>$data_gate_in['supp_inv_copy'],
        'supp_wb_copy' =>$data_gate_in['supp_wb_copy'],
        'naga_os_wb_copy' =>$data_gate_in['naga_os_wb_copy'],
        'UnloadVendorName' =>$data_gate_in['UnloadVendorName'],
	'UnloadVendorCharge' =>$data_gate_in['UnloadVendorCharge'],
        'wb_ticket_no' =>$data_gate_in['wb_ticket_no'],
    );
    $this->supplier_vehical_info->set('purchase_info_id',$lastId)
			 ->where('purchase_info_id', $purchase_info_id)
			 ->update();
     $result = $this->common_model->insert($data_gate);
        return $result;
    }

}
