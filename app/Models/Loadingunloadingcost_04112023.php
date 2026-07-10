<?php

namespace App\Models;

use CodeIgniter\Model;

class Loadingunloadingcost extends Model
{
	//Rake Loading Details get
	public function Rake_Loading_cost($data){
		$PlantId = $data->Plant;
		$po_number = $data->po_number;
		$Vendor_Name = $data->Vendor_Name;
		$Filter_po_number = "";
		$Filter_Plantid = "";
		$Filter_VendorName = "";
		$vehicle_type=$data->vehicle_type == 'Purchase' ? 'Rake' : '';
		$cnd="";
		  if(isset($data->fromdate) and isset($data->todate) and isset($data->Vendor_Name) and isset($data->company_name) and isset($data->vehicle_type))
		  {
			 for ($i = 0; $i < sizeof((array)$Vendor_Name); $i++) {
				$Filter_VendorName .= "'" . $Vendor_Name[$i]->value . "',";
			  }
			  $Filter_VendorName = rtrim($Filter_VendorName, ",");

			  $cnd .= "rake_loading.created_at >= '$data->fromdate' and rake_loading.created_at <= date_add('$data->todate', INTERVAL 1 DAY) and rake_loading.miro_status=0 and rake_loading.loading_charge > 0 and rake_loading.vehicle_type = '$vehicle_type' and purchase_info.MIGO_NUM != '' and master_vendor.Code IN($Filter_VendorName) and master_plant.plant_subdivision='$data->company_name'";
		  }
		  if ((isset($PlantId)) && sizeof((array)$PlantId) > 0) {
			for ($i = 0; $i < sizeof((array)$PlantId); $i++) {
			  $Filter_Plantid .= "'" . $PlantId[$i]->value . "',";
			}
			$Filter_Plantid = rtrim($Filter_Plantid, ",");
			$cnd .= " AND master_plant.ID IN($Filter_Plantid) ";
		  }
		  if(isset($po_number)and !empty($po_number)){
			for ($i = 0; $i < sizeof((array)$po_number); $i++) {
				$Filter_po_number .= "'" . $po_number[$i]->value . "',";
			  }
			  $Filter_po_number = rtrim($Filter_po_number, ",");
			  
			$cnd .= " and rake_loading.po_number in ($Filter_po_number)";
		  }
		  if($data->Type == 2){ 
			$cnd .= " and rake_loading.po_number in ('')";
		  }
		//   if(isset($data->vehicle_type) and !empty($data->vehicle_type)){ 
		// 	$cnd .= " and rake_loading.vehicle_type in ('$data->vehicle_type')";
		//   }
		  if(empty($data->todate) or empty($data->fromdate) or empty($data->Vendor_Name)){
			$cnd .= "rake_loading.id";
		  }
		// print_r($cnd);exit;
		$builder = $this->db->table("rake_loading");
		$builder = $builder->select("rake_loading.id,
		rake_loading.vehicle_no,
		rake_loading.po_number,ROUND(SUM(gateout_info.wb_net_wt/1000),3) as total_weight,
		rake_loading.loading_charge,
		master_vendor.Name,
		ROUND(SUM((gateout_info.wb_net_wt/1000)*rake_loading.loading_charge),0) as value,
		ROUND(SUM((gateout_info.wb_net_wt/1000)*rake_loading.loading_charge),0) as confirm_value,
		rake_loading.vehicle_type,IF(rake_loading.fnr_no != '','Loading','') as Type,
		rake_loading.plant_id,
		DATE_FORMAT(rake_loading.created_at, '%d-%m-%Y')as DateAdded,
		purchase_info.MIGO_NUM,
		purchase_info.ZVA_NUMBER,
		rake_loading.id as index,
		rake_loading.po_line_item");
        $builder = $builder->join('purchase_info', 'purchase_info.VECHICAL_STATUS = 7 and purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner');
		// $builder = $builder->join('pp_to_sap', 'pp_to_sap.ZVA_NUMBER = purchase_info.ZVA_NUMBER and pp_to_sap.isupdate = 0', 'inner');
		$builder = $builder->join('gateout_info', 'gateout_info.purchase_info_id = rake_loading.purchase_info_id', 'inner');
		$builder = $builder->join('master_vendor', 'master_vendor.Id = rake_loading.loading_vendor_id', 'inner');
		$builder = $builder->join('master_plant', 'master_plant.WERKS = rake_loading.plant_id', 'inner');

		$builder =  $builder->where($cnd);
		return  $builder->groupBy('rake_loading.id')->get()->getResultArray();
    }
		//Unloading_cost Details get
	public function Unloading_cost($data){
		$PlantId = $data->Plant;
		$Vendor_Name = $data->Vendor_Name;
		$po_number = $data->po_number;
		$Filter_po_number = "";
		$Filter_Plantid = "";
		$Filter_VendorName = "";
		$cnd="";
		$vehicle_type=$data->vehicle_type == 'Purchase' ? '7' : 0;

		  if(isset($data->fromdate) and isset($data->todate) and isset($data->Vendor_Name)and isset($data->company_name)and isset($data->vehicle_type))
		  {
			  for ($i = 0; $i < sizeof((array)$Vendor_Name); $i++) {
				$Filter_VendorName .= "'" . $Vendor_Name[$i]->value . "',";
			  }
			  $Filter_VendorName = rtrim($Filter_VendorName, ",");
			  $cnd .= "purchase_info.DateAdded >= '$data->fromdate' and purchase_info.DateAdded <= date_add('$data->todate', INTERVAL 1 DAY) and purchase_info.VECHICAL_STATUS = '$vehicle_type' and purchase_info.miro_status = 0 and purchase_info.MIGO_NUM != '' and master_plant.plant_subdivision='$data->company_name' and master_vendor.Code IN($Filter_VendorName) and gateout_info.UnloadVendorCharge > 0";
		  }

		  if ((isset($PlantId)) && sizeof((array)$PlantId) > 0) {
			for ($i = 0; $i < sizeof((array)$PlantId); $i++) {
			  $Filter_Plantid .= "'" . $PlantId[$i]->value . "',";
			}
			$Filter_Plantid = rtrim($Filter_Plantid, ",");
			$cnd .= " AND master_plant.Id IN($Filter_Plantid) ";
		  }
		
		  if(isset($po_number)and !empty($po_number)){
			for ($i = 0; $i < sizeof((array)$po_number); $i++) {
				$Filter_po_number .= "'" . $po_number[$i]->value . "',";
			  }
			  $Filter_po_number = rtrim($Filter_po_number, ",");
			  
			$cnd .= " and purchase_info.ZPO_NUMBER in ($Filter_po_number)";
		  }
		  if($data->Type == 1){ 
			$cnd .= " and purchase_info.ZPO_NUMBER in ('')";
		  }
		//   if(isset($data->vehicle_type) and !empty($data->vehicle_type)){ 
		// 	$cnd .= " and purchase_info.VEHICLE_TYPE in ('$data->vehicle_type')";
		//   }
		  if(empty($data->todate) or empty($data->fromdate) or empty($data->Vendor_Name)){
			$cnd .= "purchase_info.id";
		  }
		// print_r($cnd);exit;
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("purchase_info.PI_REFID,
		purchase_info.PI_REFID as index,
		purchase_info.TRUCK_NO as vehicle_no,
		purchase_info.ZPO_NUMBER as po_number,
		purchase_info.PO_LINE_ITEM as po_line_item,
		ROUND(SUM(gateout_info.wb_net_wt/1000),3) as total_weight,
		gateout_info.UnloadVendorCharge as loading_charge,
		master_vendor.Name,
		ROUND(SUM((gateout_info.wb_net_wt/1000)*gateout_info.UnloadVendorCharge),0) as value,
		ROUND(SUM((gateout_info.wb_net_wt/1000)*gateout_info.UnloadVendorCharge),0) as confirm_value,
		purchase_info.VEHICLE_TYPE as vehicle_type,
		IF(purchase_info.VECHICAL_STATUS != '','Unloading','') as Type,
		purchase_info.WERKS as plant_id,
		DATE_FORMAT(purchase_info.DateAdded, '%d-%m-%Y')as DateAdded,
		purchase_info.MIGO_NUM,
		purchase_info.ZVA_NUMBER");
		// $builder = $builder->join('pp_to_sap', 'pp_to_sap.ZVA_NUMBER = purchase_info.ZVA_NUMBER and pp_to_sap.isupdate = 0', 'inner');
		$builder = $builder->join('master_plant', 'master_plant.WERKS = purchase_info.WERKS', 'inner');
		$builder = $builder->join('gateout_info', 'gateout_info.purchase_info_id = purchase_info.PI_REFID', 'inner');
		$builder = $builder->join('master_vendor', 'master_vendor.Name = gateout_info.UnloadVendorName', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('purchase_info.PI_REFID')->get()->getResultArray();
    }
		//IASUnLoading Details get
	public function IASUnLoading($data){
		$PlantId = $data->Plant;
		$Vendor_Name = $data->Vendor_Name;
		$po_number = $data->po_number;
		$Filter_po_number = "";
		$Filter_Plantid = "";
		$Filter_VendorName = "";
		$cnd="";
		$vehicle_type=$data->vehicle_type == 'STO' ? '12' : 0;

		// print_r($data);exit;
		  if(isset($data->fromdate) and isset($data->todate) and isset($data->Vendor_Name)and isset($data->company_name)and isset($data->vehicle_type))
		  {
			for ($i = 0; $i < sizeof((array)$Vendor_Name); $i++) {
				$Filter_VendorName .= "'" . $Vendor_Name[$i]->value . "',";
			  }
			  $Filter_VendorName = rtrim($Filter_VendorName, ",");
			  $cnd .= "purchase_info.DateAdded >= '$data->fromdate' and purchase_info.DateAdded <= date_add('$data->todate', INTERVAL 1 DAY) and purchase_info.VECHICAL_STATUS = '$vehicle_type' and purchase_info.SCREEN_TYPE = 'IAS' and purchase_info.miro_status = 0 and purchase_info.MIGO_NUM != '' and master_vendor.Code IN($Filter_VendorName) and master_plant.plant_subdivision = '$data->company_name'";
		  }

		  if ((isset($PlantId)) && sizeof((array)$PlantId) > 0) {
			for ($i = 0; $i < sizeof((array)$PlantId); $i++) {
			  $Filter_Plantid .= "'" . $PlantId[$i]->value . "',";
			}
			$Filter_Plantid = rtrim($Filter_Plantid, ",");
			$cnd .= " AND master_plant.Id IN($Filter_Plantid) ";
		  }
		  if(isset($po_number)and !empty($po_number)){
			for ($i = 0; $i < sizeof((array)$po_number); $i++) {
				$Filter_po_number .= "'" . $po_number[$i]->value . "',";
			  }
			  $Filter_po_number = rtrim($Filter_po_number, ",");
			  
			$cnd .= " and intrastate_warhouse_dispatch_info.PO_Number in ($Filter_po_number)";
		  }
		  if($data->Type == 1){ 
			$cnd .= " and intrastate_warhouse_dispatch_info.PO_Number in ('')";
		  }
		//   if(isset($data->ScreenName) and !empty($data->ScreenName)){ 
		// 	$cnd .= " and purchase_info.SCREEN_TYPE in ('$data->ScreenName')";
		//   }
		  if(empty($data->todate) or empty($data->fromdate) or empty($data->Vendor_Name)){
			$cnd .= "purchase_info.id";
		  }

		// print_r($cnd);exit;
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("purchase_info.PI_REFID as ias_unload_id,
		purchase_info.PI_REFID as index,
		purchase_info.TRUCK_NO as vehicle_no,
		intrastate_warhouse_dispatch_info.PO_Number as po_number,
		intrastate_warhouse_dispatch_info.PO_LineItem as po_line_item,
		ROUND(SUM(intrastate_gateout_info.WbNetWt/1000),3) as total_weight,
		intrastate_gateout_info.UnloadingChargePerTon as loading_charge,
		intrastate_gateout_info.UnLoadingVendor as Name,
		ROUND(SUM((intrastate_gateout_info.WbNetWt/1000)*intrastate_gateout_info.UnloadingChargePerTon),0) as value,
		ROUND(SUM((intrastate_gateout_info.WbNetWt/1000)*intrastate_gateout_info.UnloadingChargePerTon),0) as confirm_value,
		purchase_info.SCREEN_TYPE as vehicle_type,
		IF(purchase_info.VECHICAL_STATUS != '','Unloading','') as Type,
		purchase_info.WERKS as plant_id,
		DATE_FORMAT(purchase_info.DateAdded, '%d-%m-%Y')as DateAdded,
		intrastate_warhouse_dispatch_info.DeliveryNo,
		intrastate_warhouse_dispatch_info.SendingPlant,
		intrastate_warhouse_dispatch_info.ReceivingPlant,
		purchase_info.MIGO_NUM,
		purchase_info.ZVA_NUMBER");
		// $builder = $builder->join('pp_to_sap', 'pp_to_sap.ZVA_NUMBER = purchase_info.ZVA_NUMBER and pp_to_sap.isupdate = 0', 'inner');
		$builder = $builder->join('master_plant', "master_plant.WERKS = purchase_info.WERKS", 'inner');
		$builder = $builder->join('intrastate_warhouse_dispatch_info', "intrastate_warhouse_dispatch_info.VehicleArrivalId = purchase_info.EMPTY_VEHICLE_ARRIVAL_ID", 'left');
		$builder = $builder->join('intrastate_gateout_info', 'intrastate_gateout_info.ReceivingArrivalId = purchase_info.PI_REFID and intrastate_gateout_info.UnloadingChargePerTon != 0', 'left');
		$builder = $builder->join('master_vendor', "master_vendor.Name = intrastate_gateout_info.UnLoadingVendor", 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('purchase_info.PI_REFID')->get()->getResultArray();
    }
			//IASLoading Details get
	public function IASLoading($data){
		$PlantId = $data->Plant;
		$Vendor_Name = $data->Vendor_Name;
		$Filter_Plantid = "";
		$cnd="";
		$po_number = $data->po_number;
		$Filter_po_number = "";
		$Filter_VendorName = "";
		$vehicle_type=$data->vehicle_type == 'STO' ? '12' : 0;

		  if(isset($data->fromdate) and isset($data->todate) and isset($data->Vendor_Name) and isset($data->company_name) and isset($data->vehicle_type))
		  {
			for ($i = 0; $i < sizeof((array)$Vendor_Name); $i++) {
				$Filter_VendorName .= "'" . $Vendor_Name[$i]->value . "',";
			  }
			  $Filter_VendorName = rtrim($Filter_VendorName, ",");
			  $cnd .= "empty_vehicle_arrival.DateAdded >= '$data->fromdate' and empty_vehicle_arrival.DateAdded <= date_add('$data->todate', INTERVAL 1 DAY) and empty_vehicle_arrival.VEHICLE_STATUS = '$vehicle_type' and empty_vehicle_arrival.SCREEN_TYPE='EVADP' and empty_vehicle_arrival.miro_status = 0 and purchase_info.MIGO_NUM != '' and master_vendor.Code IN($Filter_VendorName) and master_plant.plant_subdivision = '$data->company_name'";
		  }

		  if ((isset($PlantId)) && sizeof((array)$PlantId) > 0) {
			for ($i = 0; $i < sizeof((array)$PlantId); $i++) {
			  $Filter_Plantid .= "'" . $PlantId[$i]->value . "',";
			}
			$Filter_Plantid = rtrim($Filter_Plantid, ",");
			$cnd .= " AND master_plant.Id IN($Filter_Plantid) ";
		  }
		  if(isset($po_number)and !empty($po_number)){
			for ($i = 0; $i < sizeof((array)$po_number); $i++) {
				$Filter_po_number .= "'" . $po_number[$i]->value . "',";
			  }
			  $Filter_po_number = rtrim($Filter_po_number, ",");
			  
			$cnd .= " and intrastate_warhouse_dispatch_info.PO_Number in ($Filter_po_number)";
		  }
		  if($data->Type == 2){ 
			$cnd .= " and intrastate_warhouse_dispatch_info.PO_Number in ('')";
		  }
		//   if(isset($data->vehicle_type) and !empty($data->vehicle_type)){ 
		// 	$cnd .= " and empty_vehicle_arrival.SCREEN_TYPE in ('$data->vehicle_type')";
		//   }
		  if(empty($data->todate) or empty($data->fromdate) or empty($data->Vendor_Name)){
			$cnd .= "empty_vehicle_arrival.id";
		  }
		// print_r($cnd);exit;
		$builder = $this->db->table("empty_vehicle_arrival");
		$builder = $builder->select("empty_vehicle_arrival.ID,
		empty_vehicle_arrival.ID as index,
		empty_vehicle_arrival.TRUCK_NO as vehicle_no,
		intrastate_warhouse_dispatch_info.PO_Number as po_number,
		intrastate_warhouse_dispatch_info.PO_LineItem as po_line_item,
		ROUND(SUM(intrastate_warhouse_dispatch_info.WbNetWt/1000),3) as total_weight,
		intrastate_warhouse_dispatch_info.LoadingChargesPerTon as loading_charge,
		master_vendor.Name,
		ROUND(SUM((intrastate_warhouse_dispatch_info.WbNetWt/1000)*intrastate_warhouse_dispatch_info.LoadingChargesPerTon),0) as value,
		ROUND(SUM((intrastate_warhouse_dispatch_info.WbNetWt/1000)*intrastate_warhouse_dispatch_info.LoadingChargesPerTon),0) as confirm_value,
		empty_vehicle_arrival.SCREEN_TYPE as vehicle_type,
		IF(empty_vehicle_arrival.VEHICLE_STATUS != '','Loading','') as Type,
		empty_vehicle_arrival.PLANT_ID as plant_id,
		DATE_FORMAT(empty_vehicle_arrival.DateAdded, '%d-%m-%Y')as DateAdded,
		intrastate_warhouse_dispatch_info.DeliveryNo,
		intrastate_warhouse_dispatch_info.SendingPlant,
		intrastate_warhouse_dispatch_info.ReceivingPlant,
		purchase_info.MIGO_NUM,
		empty_vehicle_arrival.ZVA_NUMBER");
		$builder = $builder->join('master_plant', 'master_plant.WERKS = empty_vehicle_arrival.PLANT_ID', 'inner');
		$builder = $builder->join('intrastate_warhouse_dispatch_info', 'intrastate_warhouse_dispatch_info.VehicleArrivalId = empty_vehicle_arrival.ID and intrastate_warhouse_dispatch_info.LoadingChargesPerTon > 0', 'inner');
		$builder = $builder->join('purchase_info', 'purchase_info.EMPTY_VEHICLE_ARRIVAL_ID = empty_vehicle_arrival.ID', 'inner');
		$builder = $builder->join('master_vendor', 'master_vendor.Id = intrastate_warhouse_dispatch_info.LoadingVendorId', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('empty_vehicle_arrival.ID')->get()->getResultArray();
    }
	
	public function getVendor()
	{
		$builder = $this->db->table("master_vendor");
		$builder = $builder->select("Id as value, Name as label");
		$builder = $builder->where("Category", 'Unloading Vendor');
		$builder = $builder->orWhere("Category", 'Loading Vendor');
		$builder = $builder->orWhere("Category", 'LOADING VENDOR');
		$builder = $builder->orWhere("Category", 'UNLOADING VENDOR');

		return  $builder->get()->getResultArray();
	}
	public function getVendorByID($id)
	{
		$builder = $this->db->table("master_vendor");
		$builder = $builder->select("tds_code,tds_name");
		$builder = $builder->where("Id", $id);
		return  $builder->get()->getResultArray();
	}
	//Rake_Loading_Vendor Details get
	public function Rake_Loading_Vendor($data){

		$cnd="";
		
		  if(isset($data->fromdate) and isset($data->toDate))
		  {
			  $cnd .= "rake_loading.created_at >= '$data->fromdate' and rake_loading.created_at <= date_add('$data->toDate', INTERVAL 1 DAY) and rake_loading.miro_status = 0 and purchase_info.VECHICAL_STATUS = 7 and purchase_info.MIGO_NUM != ''";
		  }
		//   print_r($cnd);exit;
		$builder = $this->db->table("rake_loading");
		$builder = $builder->select("master_vendor.Code as value,master_vendor.Name as label");
		$builder = $builder->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner');
		$builder = $builder->join('master_vendor', 'master_vendor.Id = rake_loading.loading_vendor_id', 'inner');

		$builder =  $builder->where($cnd);

		return  $builder->groupBy('master_vendor.Code')->get()->getResultArray();
    }
		//Unloading_vendor Details get
	public function Unloading_vendor($data){
		
		$cnd="";
		
		if(isset($data->fromdate) and isset($data->toDate))
		{
			$cnd .= "purchase_info.DateAdded >= '$data->fromdate' and purchase_info.DateAdded <= date_add('$data->toDate', INTERVAL 1 DAY) and purchase_info.VECHICAL_STATUS = 7 and purchase_info.MIGO_NUM != ''";
		}
		 
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("master_vendor.Code as value,master_vendor.Name as label");
		$builder = $builder->join('gateout_info', 'gateout_info.purchase_info_id = purchase_info.PI_REFID', 'inner');
		$builder = $builder->join('master_vendor', 'master_vendor.Name = gateout_info.UnloadVendorName', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('master_vendor.Code')->get()->getResultArray();
    }
			//IASUnLoadingVendor Details get
	public function IASUnLoadingVendor($data){
		
		$cnd="";
		
		  if(isset($data->fromdate) and isset($data->toDate))
		  {
			  $cnd .= "purchase_info.DateAdded >= '$data->fromdate' and purchase_info.DateAdded <= date_add('$data->toDate', INTERVAL 1 DAY) and purchase_info.VECHICAL_STATUS = 12 and purchase_info.MIGO_NUM != ''";
		  }
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("master_vendor.Code as value,master_vendor.Name as label");
		$builder = $builder->join('intrastate_gateout_info', 'intrastate_gateout_info.ReceivingArrivalId = purchase_info.PI_REFID', 'inner');
		$builder = $builder->join('master_vendor', 'master_vendor.Name = intrastate_gateout_info.UnLoadingVendor', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('master_vendor.Code')->get()->getResultArray();
    }
			//IASLoadingVendor Details get
	public function IASLoadingVendor($data){
		$cnd="";
		  if(isset($data->fromdate) and isset($data->toDate))
		  {
			  $cnd .= "empty_vehicle_arrival.DateAdded >= '$data->fromdate' and empty_vehicle_arrival.DateAdded <= date_add('$data->toDate', INTERVAL 1 DAY) and empty_vehicle_arrival.VEHICLE_STATUS=12 and purchase_info.MIGO_NUM != ''";
		  }
		$builder = $this->db->table("empty_vehicle_arrival");
		$builder = $builder->select("master_vendor.Code as value,master_vendor.Name as label");
		$builder = $builder->join('intrastate_warhouse_dispatch_info', 'intrastate_warhouse_dispatch_info.VehicleArrivalId = empty_vehicle_arrival.ID', 'inner');
		$builder = $builder->join('master_vendor', 'master_vendor.Id = intrastate_warhouse_dispatch_info.LoadingVendorId', 'inner');
		$builder = $builder->join('purchase_info', 'purchase_info.EMPTY_VEHICLE_ARRIVAL_ID = empty_vehicle_arrival.ID', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('master_vendor.Code')->get()->getResultArray();
    }
			//Rake_Loading_Plant Details get
	public function Rake_Loading_Plant($data){

		$cnd="";
		
		  if(isset($data->fromdate) and isset($data->toDate))
		  {
			$cnd .= "rake_loading.created_at >= '$data->fromdate' and rake_loading.created_at <= date_add('$data->toDate', INTERVAL 1 DAY) and rake_loading.miro_status = 0 and purchase_info.VECHICAL_STATUS = 7 and purchase_info.MIGO_NUM != ''";
		  }

		$builder = $this->db->table("rake_loading");
		$builder = $builder->select("master_plant.ID as value,master_plant.PLANT_NAME as label");
		$builder = $builder->join('purchase_info', 'purchase_info.VECHICAL_STATUS = 7 and purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner');
		$builder = $builder->join('master_plant', 'master_plant.WERKS = rake_loading.plant_id', 'inner');
		$builder =  $builder->where($cnd);

		return  $builder->groupBy('master_plant.WERKS')->get()->getResultArray();
    }
				//Unloading_Plant Details get
	public function Unloading_Plant($data){
		
		$cnd="";
		
		if(isset($data->fromdate) and isset($data->toDate))
		{
			$cnd .= "purchase_info.DateAdded >= '$data->fromdate' and purchase_info.DateAdded <= date_add('$data->toDate', INTERVAL 1 DAY) and purchase_info.VECHICAL_STATUS = 7 and purchase_info.MIGO_NUM != ''";
		}
		 
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("master_plant.ID as value,master_plant.PLANT_NAME as label");
		$builder = $builder->join('gateout_info', 'gateout_info.purchase_info_id = purchase_info.PI_REFID', 'inner');
		$builder = $builder->join('master_plant', 'master_plant.WERKS = purchase_info.WERKS', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('master_plant.WERKS')->get()->getResultArray();
    }
					//IASUnLoadingPlant Details get
	public function IASUnLoadingPlant($data){
		
		$cnd="";
		
		  if(isset($data->fromdate) and isset($data->toDate))
		  {
			  $cnd .= "purchase_info.DateAdded >= '$data->fromdate' and purchase_info.DateAdded <= date_add('$data->toDate', INTERVAL 1 DAY) and purchase_info.VECHICAL_STATUS = 12 and purchase_info.MIGO_NUM != ''";
		  }
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("master_plant.ID as value,master_plant.PLANT_NAME as label");
		$builder = $builder->join('master_plant', 'master_plant.WERKS = purchase_info.WERKS', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('master_plant.WERKS')->get()->getResultArray();
    }
	//IASLoadingPlant Details get
	public function IASLoadingPlant($data){
		$cnd="";
		  if(isset($data->fromdate) and isset($data->toDate))
		  {
			  $cnd .= "empty_vehicle_arrival.DateAdded >= '$data->fromdate' and empty_vehicle_arrival.DateAdded <= date_add('$data->toDate', INTERVAL 1 DAY) and empty_vehicle_arrival.VEHICLE_STATUS = 12 and purchase_info.MIGO_NUM != ''";
		  }
		$builder = $this->db->table("empty_vehicle_arrival");
		$builder = $builder->select("master_plant.ID as value,master_plant.PLANT_NAME as label");
		$builder = $builder->join('master_plant', 'master_plant.WERKS = empty_vehicle_arrival.PLANT_ID', 'inner');
		$builder = $builder->join('purchase_info', 'purchase_info.EMPTY_VEHICLE_ARRIVAL_ID = empty_vehicle_arrival.ID', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('master_plant.WERKS')->get()->getResultArray();
    }
	//Rake_Loading_PO Details get
	public function Rake_Loading_PO($data){

		$cnd="";
		
		  if(isset($data->fromdate) and isset($data->toDate))
		  {
			  $cnd .= "rake_loading.created_at >= '$data->fromdate' and rake_loading.created_at <= date_add('$data->toDate', INTERVAL 1 DAY) and purchase_info.MIGO_NUM != ''";
		  }

		$builder = $this->db->table("rake_loading");
		$builder = $builder->select("rake_loading.po_number as value,rake_loading.po_number as label");
		$builder = $builder->join('purchase_info', 'purchase_info.VECHICAL_STATUS = 7 and purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner');
		$builder =  $builder->where($cnd);

		return  $builder->groupBy('rake_loading.po_number')->get()->getResultArray();
    }
		//Unloading_PO Details get
	public function Unloading_PO($data){
		
		$cnd="";
		
		if(isset($data->fromdate) and isset($data->toDate))
		{
			$cnd .= "purchase_info.DateAdded >= '$data->fromdate' and purchase_info.DateAdded <= date_add('$data->toDate', INTERVAL 1 DAY) and purchase_info.VECHICAL_STATUS = 7 and purchase_info.MIGO_NUM != ''";
		}
		 
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("purchase_info.ZPO_NUMBER as value,purchase_info.ZPO_NUMBER as label");
		$builder = $builder->join('gateout_info', 'gateout_info.purchase_info_id = purchase_info.PI_REFID', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('purchase_info.ZPO_NUMBER')->get()->getResultArray();
    }
			//IASUnLoading_PO Details get
	public function IASUnLoading_PO($data){
		
		$cnd="";
		
		  if(isset($data->fromdate) and isset($data->toDate))
		  {
			  $cnd .= "purchase_info.DateAdded >= '$data->fromdate' and purchase_info.DateAdded <= date_add('$data->toDate', INTERVAL 1 DAY) and purchase_info.VECHICAL_STATUS = 12 and purchase_info.MIGO_NUM != ''";
		  }
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("intrastate_warhouse_dispatch_info.PO_Number as value,intrastate_warhouse_dispatch_info.PO_Number as label");
		$builder = $builder->join('intrastate_warhouse_dispatch_info', 'intrastate_warhouse_dispatch_info.VehicleArrivalId = purchase_info.EMPTY_VEHICLE_ARRIVAL_ID', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('intrastate_warhouse_dispatch_info.PO_Number')->get()->getResultArray();
    }
	//IASLoading_PO Details get
	public function IASLoading_PO($data){
		$cnd="";
		  if(isset($data->fromdate) and isset($data->toDate))
		  {
			  $cnd .= "empty_vehicle_arrival.DateAdded >= '$data->fromdate' and empty_vehicle_arrival.DateAdded <= date_add('$data->toDate', INTERVAL 1 DAY) and empty_vehicle_arrival.VEHICLE_STATUS = 12 and purchase_info.MIGO_NUM != ''";
		  }
		$builder = $this->db->table("empty_vehicle_arrival");
		$builder = $builder->select("intrastate_warhouse_dispatch_info.PO_Number as value,intrastate_warhouse_dispatch_info.PO_Number as label");
		$builder = $builder->join('intrastate_warhouse_dispatch_info', 'intrastate_warhouse_dispatch_info.VehicleArrivalId = empty_vehicle_arrival.ID', 'inner');
		$builder = $builder->join('purchase_info', 'purchase_info.EMPTY_VEHICLE_ARRIVAL_ID = empty_vehicle_arrival.ID', 'inner');
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('intrastate_warhouse_dispatch_info.PO_Number')->get()->getResultArray();
    }
	public function Loading_unloading_Last_ID(){
		$builder = $this->db->table("loading_unloading_payment");
		$builder = $builder->select("load_unload_no");
		$builder = $builder->limit(1);
		$builder = $builder->orderBy('id',"DESC");

		return  $builder->get()->getResultArray();
    }
	public function Loading_unloading_Insert($Data){
		$this->db->table('loading_unloading_payment')->set($Data)->insert();
        $InsId=$this->insertID();
		return  $InsId;
    }
	public function Load_Unload_Payment_Index($data){
		$builder = $this->db->table("loading_unloading_payment");
		$builder = $builder->select("loading_unloading_payment.*,master_vendor.Code,master_vendor.Name,master_vendor.tds_code,master_vendor.tds_name,IF(loading_unloading_payment.status=1,'WH MG Approve',IF(loading_unloading_payment.status=2,'Acc. Confirmation',IF(loading_unloading_payment.status=3,'Acc MG Approve',IF(loading_unloading_payment.status=4,'Miro Completed',IF(loading_unloading_payment.status=5,'Rejected',IF(loading_unloading_payment.status=6,'Accounts MG Rejected',IF(loading_unloading_payment.status=7,'Miro Reversed',''))))))) as Waiting_at,DATE_FORMAT(loading_unloading_payment.created_at, '%d-%m-%Y') AS created_at");
		$builder = $builder->join('master_vendor', 'master_vendor.Id = loading_unloading_payment.confirm_vendor_id', 'inner');
		$builder = $builder->where("loading_unloading_payment.status in($data->status)");
		$builder = $builder->orderBy('loading_unloading_payment.id');

		return  $builder->get()->getResultArray();
    }
	public function Load_Unload_Payment_Update($id,$Data){

		$InsId = $this->db->table('loading_unloading_payment')->set($Data)->where('id',$id)->update();
		return  $InsId;
    }
	public function Load_Unload_Rake_Reverse($id,$status){
		$splitnumbers = $id;
		$splittedNumbe = explode(",", $splitnumbers);
		$ID = "'" . implode("', '", $splittedNumbe) ."'";
		$fetchsql = "UPDATE  `rake_loading`
		SET miro_status = $status
		where id in ($ID)";
		$InsId=$this->db->query($fetchsql);
		return  $InsId;
    }
	public function Load_Unload_Purchase_Reverse($id,$status){
		$splitnumbers = $id;
		$splittedNumbe = explode(",", $splitnumbers);
		$ID = "'" . implode("', '", $splittedNumbe) ."'";
		$fetchsql = "UPDATE  `purchase_info`
		SET miro_status = $status
		where PI_REFID in ($ID)";
		$InsId=$this->db->query($fetchsql);
		return  $InsId;
    }
	public function Load_Load_IAS_Reverse($id,$status){

		$splitnumbers = $id;
		$splittedNumbe = explode(",", $splitnumbers);
		$ID = "'" . implode("', '", $splittedNumbe) ."'";
		$fetchsql = "UPDATE  `empty_vehicle_arrival`
		SET miro_status = $status
		where ID in ($ID)";
		$InsId=$this->db->query($fetchsql);
		return  $InsId;
    }
	public function MIRO_NUMBER($data){
		$cnd = '';

		if(isset($data->fromdate) and isset($data->toDate))
		{
			$cnd .= "created_at >= '$data->fromdate' and created_at <= date_add('$data->toDate', INTERVAL 1 DAY) and status = 4";
		}
		// print_r($cnd);exit;
		$builder = $this->db->table("loading_unloading_payment");
		$builder = $builder->select("id as value,miro_no as label");
		$builder =  $builder->where($cnd);
		return  $builder->groupBy('id')->get()->getResultArray();
    }
	public function Load_Unload_Payment_Reverse($data){
		$cnd = '';
		if(isset($data->fromdate) and isset($data->todate) and isset($data->id))
		{
			$cnd .= "loading_unloading_payment.created_at >= '$data->fromdate' and loading_unloading_payment.created_at <= date_add('$data->todate', INTERVAL 1 DAY) and loading_unloading_payment.status = 4 and loading_unloading_payment.id=$data->id";
		}
		// print_r($cnd);exit;
		$builder = $this->db->table("loading_unloading_payment");
		$builder = $builder->select("loading_unloading_payment.*,master_vendor.Code,master_vendor.Name,master_vendor.tds_code,master_vendor.tds_name,IF(loading_unloading_payment.status=4,'Miro Reverse','') as Waiting_at,DATE_FORMAT(loading_unloading_payment.created_at, '%d-%m-%Y') AS created_at");
		$builder = $builder->join('master_vendor', 'master_vendor.Id = loading_unloading_payment.confirm_vendor_id', 'inner');
		$builder = $builder->where($cnd);
		$builder = $builder->orderBy('loading_unloading_payment.id');
		
		return  $builder->get()->getResultArray();
    }

	public function Load_Unload_Payment_Report($data){
		$cnd = '';
		if(isset($data->fromdate) and isset($data->todate))
		{
			$cnd .= "loading_unloading_payment.created_at >= '$data->fromdate' and loading_unloading_payment.created_at <= date_add('$data->todate', INTERVAL 1 DAY)";
		}
		$builder = $this->db->table("loading_unloading_payment");
		$builder = $builder->select("loading_unloading_payment.*,master_vendor.Code,master_vendor.Name,master_vendor.tds_code,master_vendor.tds_name,IF(loading_unloading_payment.status=1,'WH MG Approve',IF(loading_unloading_payment.status=2,'Acc. Confirmation',IF(loading_unloading_payment.status=3,'Acc MG Approve',IF(loading_unloading_payment.status=4,'Miro Completed',IF(loading_unloading_payment.status=5,'Rejected',IF(loading_unloading_payment.status=6,'Accounts MG Rejected',IF(loading_unloading_payment.status=7,'Miro Reversed',''))))))) as Waiting_at,DATE_FORMAT(loading_unloading_payment.created_at, '%d-%m-%Y') AS created_at");
		$builder = $builder->join('master_vendor', 'master_vendor.Id = loading_unloading_payment.confirm_vendor_id', 'inner');
		$builder = $builder->where($cnd);
		$builder = $builder->orderBy('loading_unloading_payment.id');
		
		return  $builder->get()->getResultArray();
    }

	public function SAP_PostingDate(){
		$builder = $this->db->table("pp_setting");
		$builder = $builder->select("*");
		return  $builder->get()->getResultArray();
    }
	public function InvoiceCount($invoice_no){
		$total_count = $this->db->table("loading_unloading_payment")->where("(invoice_no='$invoice_no' AND status in('1','2','3','4','6'))")->countAllResults();
		return  $total_count;
    }

}
