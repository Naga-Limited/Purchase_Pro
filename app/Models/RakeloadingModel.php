<?php

namespace App\Models;

use CodeIgniter\Model;

class RakeloadingModel extends Model
{
	// public $purchase_info;

    // public function __construct() {
	//    	$db      = \Config\Database::connect();
	// 	$this->purchase_info = $db->table('purchase_info'); 
    // }
	public function FNRNOGet($plantIds){

        $builders = $this->db->table("pp_setting");
        $builders = $builders->select("rake_fnr_no_date");
        $builders =  $builders->where("id",1);
        $builders = $builders->distinct()->get()->getResultArray();

        $date_restrictions = -$builders[0]['rake_fnr_no_date'];
        $today = date('Y-m-d');
        // $lastdate = date('Y-m-d', strtotime('-10 days', strtotime($today)));// days ago
        $lastdate = date('Y-m-d', strtotime("$date_restrictions days", strtotime($today)));// days ago

        if ($plantIds != '') {
            $splitnumber = $plantIds;
            $splittedNumbers = explode(",", $splitnumber);
            $numbers = "'" . implode("', '", $splittedNumbers) ."'";
            $plants = "purchase_info.WERKS IN ($numbers)";
            }else{
            $plants = 'purchase_info.WERKS NOT IN ("0")';
            }

			$builder = $this->db->table("purchase_info")
			->select("purchase_info.FNR_NO as value, purchase_info.FNR_NO as label")
			->join(
				'supplier_dispatch_info',
				'purchase_info.ZPO_NUMBER = supplier_dispatch_info.ZPO_NUMBER
				 AND purchase_info.ZSUPPLIER_CODE = supplier_dispatch_info.ZSUPPLIER_CODE
				 AND purchase_info.PO_LINE_ITEM = supplier_dispatch_info.ZPO_LINE_ITEM',
				'inner'
			)
			->join(
				'supplier_vehical_info',
				'supplier_vehical_info.SUPPLIER_ID = supplier_dispatch_info.SD_REFID',
				'inner'
			)
			->where("purchase_info.FNR_NO !=", '')
			->where("purchase_info.DateAdded >=", $lastdate)
			->where($plants) // ensure $plants is a valid associative array or raw string
			// ->where('supplier_vehical_info.LOADING_STATUS',1) // more appropriate than raw IN()
			->whereIn('purchase_info.VECHICAL_STATUS', [0, 2]); // more appropriate than raw IN()

        
        return  $builder->distinct()->groupBy("FNR_NO")->get()->getResultArray();
    }
	public function PONumberGet($FNR_NO){
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("ZPO_NUMBER as value, ZPO_NUMBER as label");
		$builder =  $builder->where("FNR_NO", $FNR_NO);

		return  $builder->distinct()->groupBy("PI_REFID")->get()->getResultArray();
    }

	public function POLineItem($PO_NO,$FNR_NO){
	$builders = $this->db->table("pp_setting");
        $builders = $builders->select("rake_fnr_no_date");
        $builders =  $builders->where("id",1);
        $builders = $builders->distinct()->get()->getResultArray();

        $date_restrictions = -$builders[0]['rake_fnr_no_date'];
        $today = date('Y-m-d');
        // $lastdate = date('Y-m-d', strtotime('-10 days', strtotime($today)));// days ago
        $lastdate = date('Y-m-d', strtotime("$date_restrictions days", strtotime($today)));// days ago

		$builder = $this->db->table("supplier_dispatch_info");
		$builder = $builder->select("ZPO_LINE_ITEM as value, ZPO_LINE_ITEM as label");
		$builder =  $builder->where("ZPO_NUMBER", $PO_NO);
		$builder =  $builder->where("supplier_dispatch_info.DateAdded >=", $lastdate);
		// $builder =  $builder->where("FNR_NO", $FNR_NO);

		return  $builder->distinct()->groupBy("ZPO_LINE_ITEM")->get()->getResultArray();
    } 

	public function SupplierList($PO_NO,$PO_LINE){
		$builders = $this->db->table("pp_setting");
        $builders = $builders->select("rake_fnr_no_date");
        $builders =  $builders->where("id",1);
        $builders = $builders->distinct()->get()->getResultArray();

        $date_restrictions = -$builders[0]['rake_fnr_no_date'];
        $today = date('Y-m-d');
        // $lastdate = date('Y-m-d', strtotime('-10 days', strtotime($today)));// days ago
        $lastdate = date('Y-m-d', strtotime("$date_restrictions days", strtotime($today)));// days ago

		$builder = $this->db->table("supplier_dispatch_info");
		$builder = $builder->select("ZSUPPLIER_CODE as value, ZSUPPLIER_NAME as label");
		$builder =  $builder->where("ZPO_NUMBER", $PO_NO);
		$builder =  $builder->where("ZPO_LINE_ITEM", $PO_LINE);
		$builder =  $builder->where("supplier_dispatch_info.DateAdded >=", $lastdate);
		// $builder =  $builder->where("LOEKZ !=", 'D');

		return  $builder->distinct()->groupBy("ZSUPPLIER_CODE")->get()->getResultArray();
    } 

	public function SupplierListByID($PO_NO,$PO_LINE,$SUPPLIER_CODE){
		$builder = $this->db->table("sap_to_pp");
		$builder = $builder->join('master_plant', 'master_plant.WERKS = sap_to_pp.WERKS', 'inner');
		$builder = $builder->join('master_storage', 'master_storage.LGORT = sap_to_pp.LGORT', 'inner');
		$builder = $builder->select(['sap_to_pp.*','master_plant.PLANT_NAME','master_storage.STORAGE_LOCATION']);
		$builder =  $builder->where("EBELN", $PO_NO);
		$builder =  $builder->where("EBELP", $PO_LINE);
		$builder =  $builder->where("SUPPLIER_CODE", $SUPPLIER_CODE);
		return  $builder->distinct()->groupBy("SUPPLIER_CODE")->get()->getResultArray();
    } 

	public function UnloadingIASSiloTOMill($plantIds){

		if($plantIds == []){
			$PLANT_ID = '';
		}

		$builder = $this->db->table("empty_vehicle_arrival");
		// $builder = $builder->select("ID as value, concat(TRUCK_NO,'-',SCREEN_TYPE) as label");
		$builder =  $builder->select("ID as value, TRUCK_NO as label");
		$builder =  $builder->where("VEHICLE_STATUS", '15');
		$builder =  $builder->where("TRUCK_NO!=", '');
		// $builder =  $builder->where("PLANT_ID", "$PLANT_ID");

		return  $builder->distinct()->orderBy("ID")->get()->getResultArray();
    } 

	public function getWHplantList($plantFilter)
    {
        if ($plantFilter != '') {
        $splitnumber = $plantFilter;
        $splittedNumbers = explode(",", $splitnumber);
        $numbers = "'" . implode("', '", $splittedNumbers) ."'";
        $plants = "and b.ReceivingPlant IN ($numbers)";
        }
        // else{
        // $plants = 'b.ReceivingPlant NOT IN ("0")';
        // }
        $cnd="";
        
        $cnd.="a.VEHICLE_STATUS = '15' and a.TRUCK_NO NOT IN(' ') $plants";
        
        $Sql = "SELECT  a.ID as value, a.TRUCK_NO as label
                FROM empty_vehicle_arrival a
                LEFT JOIN silotomill_dispatch_info b ON a.ID=b.VehicleArrivalId
                WHERE $cnd group by a.ID";
        $builder = $this->db->query($Sql);
        return  $builder->getResultArray();
    }

    public function getIASList($plantFilter)
    {
        if ($plantFilter != '') {
        $splitnumber = $plantFilter;
        $splittedNumbers = explode(",", $splitnumber);
        $numbers = "'" . implode("', '", $splittedNumbers) ."'";
        $plants = "and b.ReceivingPlant IN ($numbers)";
        }
        // else if ($plantFilter == ''){
        // // $plants ;
        // }
        $cnd="";
        
        $cnd.="a.VEHICLE_STATUS = '15' and a.TRUCK_NO NOT IN(' ') $plants";
        
        $Sql = "SELECT  a.ID as value, a.TRUCK_NO as label
                FROM empty_vehicle_arrival a
                LEFT JOIN intrastate_warhouse_dispatch_info b ON a.ID=b.VehicleArrivalId
                WHERE $cnd group by a.ID";
        // print_r($Sql);exit;
        $builder = $this->db->query($Sql);
        return  $builder->getResultArray();
    }
	public function UnloadingSDIVehicle(){
		$builder = $this->db->table("supplier_vehical_info");
		$builder = $builder->join('supplier_dispatch_info', 'supplier_dispatch_info.SD_REFID = supplier_vehical_info.SUPPLIER_ID', 'inner');
		$builder = $builder->select("supplier_vehical_info.SUP_VE_REFID as value,supplier_vehical_info.VEHICAL_NO as label");
		$builder =  $builder->where("supplier_vehical_info.VEHICLE_ARRIVED", '0');
		$builder =  $builder->where("supplier_vehical_info.WB_QTY!=",'');
		

		return  $builder->distinct()->orderBy("supplier_vehical_info.SUP_VE_REFID")->get()->getResultArray();
    }

	public function getWHplantListSDI($plantFilter)
	{
		if ($plantFilter != '') {
		$splitnumber = $plantFilter;
		$splittedNumbers = explode(",", $splitnumber);
		$numbers = "'" . implode("', '", $splittedNumbers) ."'";
		$plants = "and sv.PLANT_ID IN ($numbers)";
		}
		// else{
		// $plants = 'PLANT_ID NOT IN ("0")';
		// }
		$cnd="";
		
		$cnd.="sv.VEHICLE_ARRIVED = '0' and sv.purchase_info_id = 0 and sd.VEHICLE_TYPE in ('Truck','Cm Truck') and sv.WB_QTY NOT IN(' ') $plants";
		$cnd.=" or sv.VEHICLE_ARRIVED = '0' AND sd.VEHICLE_TYPE in ('Container','Cm Container') and sv.CONTAINER_PORT_RECEIVE IS NOT NULL and sv.purchase_info_id = 0 $plants";
		$cnd.=" or sd.VEHICLE_TYPE in ('FCI Truck') and sv.FCI_STATUS = 1 and sv.purchase_info_id = 0 $plants";

		$Sql = "SELECT  sv.SUP_VE_REFID as value, sv.VEHICAL_NO as label
				FROM  supplier_vehical_info sv
				left join supplier_dispatch_info sd on sd.SD_REFID = sv.SUPPLIER_ID 	
				WHERE $cnd GROUP BY sv.SUP_VE_REFID order by sv.SUP_VE_REFID";
		//print_r($Sql);exit;
		$builder = $this->db->query($Sql);
		return  $builder->getResultArray();
	}

	public function getRakeList($plantFilter)
	{
		if ($plantFilter != '') {
		$splitnumber = $plantFilter;
		$splittedNumbers = explode(",", $splitnumber);
		$numbers = "'" . implode("', '", $splittedNumbers) ."'";
		$plants = " and plant_id IN ($numbers)";
		}
		// else{
		// $plants = 'plant_id NOT IN ("0")';
		// }
		$cnd="";
		
		$cnd.="status in ('1','2') $plants";
		
		$Sql = "SELECT  id as value, vehicle_no as label
				FROM  rake_loading
				WHERE $cnd order by id";
		$builder = $this->db->query($Sql);
		return  $builder->getResultArray();
	}

	public function RedirectList($plantFilter)
	{
		if ($plantFilter != '') {
		$splitnumber = $plantFilter;
		$splittedNumbers = explode(",", $splitnumber);
		$numbers = "'" . implode("', '", $splittedNumbers) ."'";
		$plants = "and WERKS IN ($numbers)";
		}
		// else{
		// $plants = 'WERKS NOT IN ("0")';
		// }
		$cnd="";
		
		$cnd.="VECHICAL_STATUS in ('35') $plants";
		
		$Sql = "SELECT  PI_REFID as value, TRUCK_NO as label
				FROM  purchase_info
				WHERE $cnd order by PI_REFID";
		$builder = $this->db->query($Sql);
		return  $builder->getResultArray();
	}

	public function gateInOutInfo($plantFilter)
	{
		if ($plantFilter != '') {
		$splitnumber = $plantFilter;
		$splittedNumbers = explode(",", $splitnumber);
		$numbers = "'" . implode("', '", $splittedNumbers) ."'";
		$plants = "WERKS IN ($numbers)";
		}		
		$cnd="";		
		$cnd.= $plants;

		$Sql = "SELECT ID	FROM  master_plant WHERE $cnd";
		$builder = $this->db->query($Sql);                                                                                                         
		$id = $builder->getResultArray();		

		$result = [];
		array_walk_recursive($id, function($v) use (&$result) {
			$result[] = $v;
		});
		$plantId = "'" . implode("','", $result) ."'";	

		$Sql = "SELECT  id as value, vehicleNo as label
				FROM  gate_in_out_info	
				WHERE masterPlantId IN ($plantId) AND moduleStatusId = 0 AND movementType = 2 AND moduleType NOT IN (12,15,21,14) AND (subModuleTypeId NOT IN (1,3,5,17,13,26) OR subModuleTypeId IS NULL)";
		$builder = $this->db->query($Sql);		
		return  $builder->getResultArray();
	}

	public function fgSalesReturnInfo($plantFilter)
	{
		if ($plantFilter != '') {
			$splitnumber = $plantFilter;
			$splittedNumbers = explode(",", $splitnumber);
			$numbers = "'" . implode("', '", $splittedNumbers) ."'";
			$plants = "WERKS IN ($numbers)";
			}		
			$cnd="";		
			$cnd.= $plants;
	
			$Sql = "SELECT ID	FROM  master_plant WHERE $cnd";
			$builder = $this->db->query($Sql);                                                                                                         
			$id = $builder->getResultArray();		
	
			$result = [];
			array_walk_recursive($id, function($v) use (&$result) {
				$result[] = $v;
			});
			$plantId = "'" . implode("','", $result) ."'";	
	
			$Sql = "SELECT  id as value, vehicleNo as label
					FROM  fg_sales_return_info	
					WHERE masterPlantId IN ($plantId) AND moduleStatusId = 0";
			$builder = $this->db->query($Sql);		
			return  $builder->getResultArray();		
	}

	public function getLoadingAndUnloading($plantFilter)
	{
		if ($plantFilter != '') {
			$splitnumber = $plantFilter;
			$splittedNumbers = explode(",", $splitnumber);
			$numbers = "'" . implode("', '", $splittedNumbers) ."'";
			$plants = "WERKS IN ($numbers)";
			}		
			$cnd="";		
			$cnd.= $plants;
	
			$Sql = "SELECT ID	FROM  master_plant WHERE $cnd";
			$builder = $this->db->query($Sql);                                                                                                         
			$id = $builder->getResultArray();		
	
			$result = [];
			array_walk_recursive($id, function($v) use (&$result) {
				$result[] = $v;
			});
			$plantId = "'" . implode("','", $result) ."'";	
	
			$Sql = "SELECT lui.id as value, lui.truckNo as label
					FROM  loading_unloading_info lui
					left join master_module mm on mm.id = lui.moduleTypeId 	
					WHERE masterPlantId IN ($plantId) AND statusId = 0 and mm.movementTypeId = 2 and lui.moduleTypeId NOT IN (16,18,12,14,15,21)" ;
			$builder = $this->db->query($Sql);		
			return  $builder->getResultArray();		
	}
	
	public function UnloadingIASSiloTOMillByID($id,$vehicle_no){
		$builder = $this->db->table("empty_vehicle_arrival");
		$builder =  $builder->select("ID,TRUCK_NO,SCREEN_TYPE");
		$builder =  $builder->where("ID", "$id");
		$builder =  $builder->where("TRUCK_NO","$vehicle_no");
		$builder =  $builder->where("VEHICLE_STATUS", '15');

		return  $builder->distinct()->orderBy("ID")->get()->getResultArray();
    }

	public function UnloadingSDIVehicleByID($id,$vehicle_no){	
		$builder = $this->db->table("supplier_vehical_info");
		$builder = $builder->join('supplier_dispatch_info', 'supplier_dispatch_info.SD_REFID = supplier_vehical_info.SUPPLIER_ID', 'inner');
		$builder = $builder->select("supplier_vehical_info.SUP_VE_REFID,supplier_vehical_info.VEHICAL_NO,supplier_vehical_info.ZSUPPLIER_INV_QTY,supplier_dispatch_info.VEHICLE_TYPE,supplier_dispatch_info.SD_REFID");
		$builder =  $builder->where("supplier_vehical_info.VEHICLE_ARRIVED", '0');
		$builder =  $builder->where("supplier_vehical_info.SUP_VE_REFID","$id");
		$builder =  $builder->where("supplier_vehical_info.VEHICAL_NO","$vehicle_no");


		return  $builder->distinct()->orderBy("supplier_vehical_info.SUP_VE_REFID")->get()->getResultArray();
    }
	public function UnloadingSDIVehicleRakeByID($id, $vehicle_no)
	{
		// SUBQUERY → Pick Latest SD_REFID for matching PO + Supplier + Line Item
		$latestSDISubquery = "
			(
				SELECT *
				FROM supplier_dispatch_info s1
				WHERE s1.SD_REFID = (
					SELECT MAX(SD_REFID)
					FROM supplier_dispatch_info
					WHERE ZPO_NUMBER = s1.ZPO_NUMBER
					AND ZSUPPLIER_CODE = s1.ZSUPPLIER_CODE
					AND ZPO_LINE_ITEM = s1.ZPO_LINE_ITEM
				)
			) AS supplier_dispatch_info
		";

		$builder = $this->db->table("rake_loading");

		$builder->select("
			rake_loading.*,
			master_plant.PLANT_NAME,
			master_storage.STORAGE_LOCATION,
			supplier_vehical_info.INV_COPY
		");

		// JOINS
		$builder->join('master_plant', 'master_plant.WERKS = rake_loading.plant_id', 'inner');
		$builder->join('master_storage', 'master_storage.LGORT = rake_loading.storage_location_id', 'inner');

		// JOIN only MAX SD_REFID record
		$builder->join($latestSDISubquery,
			'supplier_dispatch_info.ZPO_NUMBER = rake_loading.po_number
			AND supplier_dispatch_info.ZSUPPLIER_CODE = rake_loading.supplier_code
			AND supplier_dispatch_info.ZPO_LINE_ITEM = rake_loading.po_line_item',
			'left'
		);

		// JOIN vehicle table → only one latest dispatch record is joined
		$builder->join(
			'supplier_vehical_info',
			'supplier_vehical_info.SUPPLIER_ID = supplier_dispatch_info.SD_REFID',
			'left'
		);

		// FILTERS
		$builder->where("rake_loading.status <", '3');
		$builder->where("rake_loading.id", $id);
		$builder->where("rake_loading.vehicle_no", $vehicle_no);

		return $builder->distinct()->orderBy("rake_loading.id", "DESC")->get()->getResultArray();
	}


	public function RedirectPurchaseByID($id,$vehicle_no){	
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("purchase_info.*,master_plant.PLANT_NAME,master_storage.STORAGE_LOCATION");
		$builder = $builder->join('master_plant', 'master_plant.WERKS = purchase_info.WERKS', 'inner');
		$builder = $builder->join('master_storage', 'master_storage.LGORT = purchase_info.LGORT', 'inner');
		$builder =  $builder->where("purchase_info.VECHICAL_STATUS", '35');
		$builder =  $builder->where("purchase_info.PI_REFID","$id");
		$builder =  $builder->where("purchase_info.TRUCK_NO","$vehicle_no");
		return  $builder->distinct()->orderBy("purchase_info.PI_REFID")->get()->getResultArray();
    }
	
	public function Supplier_Vehicle_ByID($id)
	{
		// Fetch supplier vehicle info
		$builder = $this->db->table("supplier_vehical_info");
		$builder->select("SUPPLIER_ID, LINE_ITEM, INV_COPY");
		$builder->where("VEHICLE_ARRIVED", '0');
		$builder->where("SUP_VE_REFID", $id);
		$builder->distinct();

		$supplier_vehicle_info = $builder->get()->getResultArray();

		// If no vehicle info found, return empty safely
		if (empty($supplier_vehicle_info)) {
			return [
				"supplier_vehical_info" => [],
				"supplier_dispatch_info" => []
			];
		}

		// Get supplier dispatch info based on first supplier ID
		$supplierId = $supplier_vehicle_info[0]['SUPPLIER_ID'];

		$dispatchBuilder = $this->db->table("supplier_dispatch_info");
		$dispatchBuilder->select('supplier_dispatch_info.*,supplier_vehical_info.INV_COPY');
		$dispatchBuilder = $dispatchBuilder->join('supplier_vehical_info', "supplier_vehical_info.SUPPLIER_ID =  $supplierId", 'inner');
		$dispatchBuilder->where("supplier_dispatch_info.SD_REFID", $supplierId);
		$dispatchBuilder->distinct();

		$supplier_dispatch_info = $dispatchBuilder->get()->getResultArray();

		return [
			"supplier_vehical_info" => $supplier_vehicle_info,
			"supplier_dispatch_info" => $supplier_dispatch_info
		];
	}

	public function Rake_Loading_Insert($Data){	
		// print_r($Data);exit;
		$this->db->table('rake_loading')->set($Data)->insert();
		// print_r($this->db->getLastQuery());exit;
        $InsId=$this->insertID();
		// print_r($InsId);exit;
		return  $InsId;
    }

	public function  RakeEntryReport($status,$fromdate,$todate,$FNR_NO){

		$cnd="";
		
		  if(isset($status) and !empty($status)){
			$cnd .= "a.status in ($status)";
		  }
		  if(isset($fromdate) and !empty($fromdate))
		  {
			  $cnd .= " and a.created_at >= '$fromdate'";
		  }
		  if(isset($todate) and !empty($todate))
		  {
			  $cnd .= " and a.created_at <= date_add('$todate', INTERVAL 1 DAY)";
		  }
		  if(isset($FNR_NO) and !empty($FNR_NO))
		  {
			$cnd .= "and a.fnr_no = '$FNR_NO'";
		  }
		  if(empty($todate) && empty($fromdate)){
			$cnd .= " and a.created_at >= curdate() AND a.created_at < curdate() + INTERVAL '1' DAY";
		  }
		  
    $fetchsql = "SELECT a.*, b.PLANT_NAME, c.STORAGE_LOCATION, d.Name, UI.FIRST_NAME as Createdby,
          f.BAG_NAME as BAG_NAME, 
          g.BAG_NAME as BAG_NAME2, 
          h.BAG_NAME as BAG_NAME3, 
          i.MIGO_NUM, i.ZVA_NUMBER, i.VECHICAL_STATUS,i.GateInByName,i.GateOutByName,
          i.UnloadWHSubmitByName,i.MIGOApprovalByName,i.FirstWeightEntryByName,i.SecondWeightEntryByName,
          DATE_FORMAT(i.GateInDt, '%d-%m-%Y %H:%i:%s') as FormattedGateInDt,
          DATE_FORMAT(i.UnloadWHSubmitDt, '%d-%m-%Y %H:%i:%s') as FormattedUnloadWHSubmitDt, 
          DATE_FORMAT(i.MIGOApprovalDt, '%d-%m-%Y %H:%i:%s') as FormattedMIGOApprovalDt,
          DATE_FORMAT(i.FirstWeightEntryDt, '%d-%m-%Y %H:%i:%s') as FormattedFirstWeightEntryDt,
          DATE_FORMAT(i.SecondWeightEntryDt, '%d-%m-%Y %H:%i:%s') as FormattedSecondWeightEntryDt,
          DATE_FORMAT(i.GateOutDt, '%d-%m-%Y %H:%i:%s') as FormattedGateOutDt,
          DATE_FORMAT(a.created_at, '%d-%m-%Y %H:%i:%s') as Formattedcreated_at,
		  goi.UnloadVendorName,  goi.UnloadVendorCharge, 
		  goi.wb_load_wt as FirstWeight,goi.wb_empty_wt as SecondWeight,goi.wb_net_wt as NetWeight,goi.gunny_wt as gunnyweight ,goi.gunny_less_wt as gunnylessweight,
          IF(a.status < 3, 'Gate in', 
              IF(i.VECHICAL_STATUS = 23, 'First weight', 
              IF(i.VECHICAL_STATUS = 2, 'QC Check', 
              IF(i.VECHICAL_STATUS = 24, 'Second weight', 
              IF(i.VECHICAL_STATUS = 3, 'QC Deduction', 
              IF(i.VECHICAL_STATUS = 21, 'QC Check After Unload', 
              IF(i.VECHICAL_STATUS = 4, 'Unload', 
              IF(i.VECHICAL_STATUS = 5, 'Gate Out', 
              IF(i.VECHICAL_STATUS = 6, 'Migo Approval', 
              IF(i.VECHICAL_STATUS = 7, 'Completed', 
              IF(i.VECHICAL_STATUS = 35, 'Redirect Gateout', ''))))))))))) as StatusName
      FROM rake_loading a
      JOIN master_plant b ON a.plant_id = b.WERKS
      JOIN master_storage c ON a.storage_location_id = c.LGORT
      JOIN master_vendor d ON a.loading_vendor_id = d.Id
      LEFT JOIN master_bag f ON a.receive_bag1 = f.BAG_CODE
      LEFT JOIN master_bag g ON a.receive_bag2 = g.BAG_CODE
      LEFT JOIN master_bag h ON a.receive_bag3 = h.BAG_CODE
      LEFT JOIN purchase_info i ON a.purchase_info_id = i.PI_REFID
	  LEFT JOIN user_info UI ON a.created_by = UI.UI_ID
	  LEFT JOIN gateout_info goi ON i.PI_REFID = goi.purchase_info_id
      WHERE $cnd
      GROUP BY a.id";

		$builder =  $this->db->query($fetchsql);
		return  $builder->getResultArray();
	}

	public function  RakeEntryEdit($plant_id){

		if ($plant_id != '') {
			$splitnumber = $plant_id;
			$splittedNumbers = explode(",", $splitnumber);
			$numbers = "'" . implode("', '", $splittedNumbers) ."'";
			$plants = "a.plant_id IN ($numbers)";
			}else{
			$plants = 'a.plant_id NOT IN ("0")';
			}
			$cnd="";
			
			$cnd.="a.status IN('1','2') and $plants";

		$fetchsql = "SELECT a.*,DATE_FORMAT(a.created_at, '%d-%m-%Y') AS created_at,b.PLANT_NAME,c.STORAGE_LOCATION,d.Name
		FROM `rake_loading` a
		JOIN master_plant b ON a.plant_id=b.WERKS
		JOIN master_storage c ON a.storage_location_id=c.LGORT
		JOIN master_vendor d ON a.loading_vendor_id=d.Id
		where $cnd GROUP BY a.id";
		$builder =  $this->db->query($fetchsql);
		return  $builder->getResultArray();
	  }

	public function  RakeEntryByID($id){
		$fetchsql = "SELECT a.*,b.PLANT_NAME,c.STORAGE_LOCATION,d.Name,f.BAG_NAME as BAG_NAME,g.BAG_NAME as BAG_NAME2,h.BAG_NAME as BAG_NAME3,f.WEIGHT as bag_weight,g.WEIGHT as bag_weight2,h.WEIGHT as bag_weight3

		FROM `rake_loading` a
		JOIN master_plant b ON a.plant_id=b.WERKS
		JOIN master_storage c ON a.storage_location_id=c.LGORT
		JOIN master_vendor d ON a.loading_vendor_id=d.Id
		LEFT JOIN master_bag f ON a.receive_bag1=f.BAG_CODE
		LEFT JOIN master_bag g ON a.receive_bag2=g.BAG_CODE
		LEFT JOIN master_bag h ON a.receive_bag3=h.BAG_CODE
		
		where a.id = '$id' ORDER BY a.id";
		$builder =  $this->db->query($fetchsql);
		return  $builder->getResultArray();
	}

	public function  UnloadingByID($id){
		$fetchsql = "SELECT a.*,b.PLANT_NAME,c.STORAGE_LOCATION,d.Name,f.BAG_NAME as BAG_NAME,g.BAG_NAME as BAG_NAME2,h.BAG_NAME as BAG_NAME3
		FROM `rake_loading` a
		JOIN master_plant b ON a.plant_id=b.WERKS
		JOIN master_storage c ON a.storage_location_id=c.LGORT
		JOIN master_vendor d ON a.loading_vendor_id=d.Id
		LEFT JOIN master_bag f ON a.receive_bag1=f.BAG_CODE
		LEFT JOIN master_bag g ON a.receive_bag2=g.BAG_CODE
		LEFT JOIN master_bag h ON a.receive_bag3=h.BAG_CODE
		
		where a.purchase_info_id = '$id' ORDER BY a.id";
		$builder =  $this->db->query($fetchsql);
		return  $builder->getResultArray();
	}

	public function Rake_Loading_Update($Data,$id,$purchase_info_id){
		if(isset($purchase_info_id)) {
			$fnr_no = $this->db->table('rake_loading')->select('fnr_no')->where('id', $id)->get()->getResultArray();
			$Data1 = array(
				'FNR_NO' => $fnr_no[0]['fnr_no']
			);
			$this->db->table('purchase_info')->set($Data1)->where('PI_REFID', $purchase_info_id)->update();
		}
		$InsId=$this->db->table('rake_loading')->set($Data)->where('id',$id)->update();
		return  $InsId;
    } 

	public function Redirect_Loading_Update($Data,$Data1,$id){	
		$this->db->table('rake_loading')->set($Data)->where('purchase_info_id',$id)->update();
		$InsId=$this->db->table('purchase_info')->set($Data1)->where('PI_REFID',$id)->update();
		return  $InsId;
    } 

	public function Vehicle_Duplicate_Check($vehicle_no){	
				
		$fetchsql = "SELECT vehicle_no
		FROM `rake_loading`
		where vehicle_no = '$vehicle_no' and status in ('1','2')";
		$builder =  $this->db->query($fetchsql)->getResultArray();
		$rake_load_count = count($builder);

		$fetchsqls = "SELECT TRUCK_NO
		FROM `purchase_info` 
		where TRUCK_NO = '$vehicle_no' and VECHICAL_STATUS not in ('6','7','11','12','18','25','26','27','28','29','30','31','34','2','0')";
		$builders =  $this->db->query($fetchsqls)->getResultArray();
		$purchase_info = count($builders);

		$sql = "select ZVA_NUMBER from empty_vehicle_arrival where (TRUCK_NO = '$vehicle_no' or TRAILER_NO = '$vehicle_no') and VEHICLE_STATUS not in ('11','12','0','34')";

		$builders1 =  $this->db->query($sql)->getResultArray();

		$empty_vehicle_arrival = count($builders1);

		$total_count = $rake_load_count+$purchase_info+$empty_vehicle_arrival;
		
		return  $total_count;
    }

	public function BagWeightGet($id){	
		$builder = $this->db->table("master_bag");
		$builder = $builder->select("WEIGHT");
		$builder =  $builder->where("BAG_CODE","$id");
		$builder =  $builder->distinct()->get()->getResultArray();

		return  $builder;
    }

	public function SAPPushDataGet($id){	
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("purchase_info.*,gateout_info.*,quality_info.*,rake_loading.tripsheet_no,rake_loading.fnr_no,rake_loading.loading_charge,master_vendor.Code,master_vendor.Name,sap_to_pp.SGT_SCAT as segment,supplier_vehical_info.ATTI_COOLI,supplier_vehical_info.TRIPSHEET_NO,supplier_vehical_info.EXTRA_CHARGE,supplier_vehical_info.OFFICE_EXPENSE_KG,supplier_vehical_info.WEIGHTMENT_CHARGE,supplier_vehical_info.FREIGHT_COST_KG,supplier_vehical_info.GATE_EXPENSE,supplier_vehical_info.OVERALL_EXPENSE,supplier_vehical_info.FREIGHT_COST,supplier_vehical_info.COST_TYPE,supplier_vehical_info.WB_QTY,supplier_vehical_info.WB_DT,supplier_vehical_info.TRIPSHEET_NO1,sap_to_pp.MEINS");
		$builder = $builder->join('gateout_info', 'gateout_info.purchase_info_id = '.$id.'', 'inner');
		$builder = $builder->join('quality_info', 'quality_info.purchase_info_id = '.$id.'', 'left');
		$builder = $builder->join('rake_loading', 'rake_loading.purchase_info_id = '.$id.'', 'left');
		$builder = $builder->join('master_vendor', 'master_vendor.Id = rake_loading.loading_vendor_id', 'left');
		$builder = $builder->join('supplier_vehical_info', 'supplier_vehical_info.purchase_info_id = '.$id.'', 'left');
		$builder = $builder->join('sap_to_pp', "(sap_to_pp.EBELN,sap_to_pp.EBELP,sap_to_pp.SUPPLIER_CODE,sap_to_pp.WERKS) = (purchase_info.ZPO_NUMBER,purchase_info.PO_LINE_ITEM,purchase_info.ZSUPPLIER_CODE,purchase_info.WERKS)", 'inner');
		$builder =  $builder->where("purchase_info.PI_REFID","$id");
		// print_r($builder);exit;
		$builder =  $builder->distinct()->get()->getResultArray();
		return  $builder;
    }

	
	public function SAPTOPPLastID(){	
		$fetchsqls = "SELECT MAX(`REF_ID`) as REF_ID FROM pp_to_sap";
		$builder =  $this->db->query($fetchsqls)->getResultArray();
		return  $builder;
    }

	public function Migo_Number_Update($id,$Data){	
		// print_r($Data);exit;
		$InsId = $this->db->table('purchase_info')->set($Data)->where('PI_REFID',$id)->update();
        // $InsId=$this->insertID();
		return  $InsId;
    }

	public function FNRNOOverAllList(){

		$builder = $this->db->table("rake_loading");
		$builder = $builder->select("fnr_no as value, fnr_no as label");
		$builder =  $builder->where("status <=", 3);

		return  $builder->distinct()->groupBy("fnr_no")->get()->getResultArray();
    }  
	public function OverAllStatusList(){

		$builder = $this->db->table("rake_loading");
		$builder = $builder->select("purchase_info.VECHICAL_STATUS as value, IF(rake_loading.status<3,'Gate in',IF(purchase_info.VECHICAL_STATUS=23,'First weight',IF(purchase_info.VECHICAL_STATUS=2,'QC Check',IF(purchase_info.VECHICAL_STATUS=24,'Second weight',IF(purchase_info.VECHICAL_STATUS=3,'QC Deduction',IF(purchase_info.VECHICAL_STATUS=21,'QC Check After Unload',IF(purchase_info.VECHICAL_STATUS=4,'Unload',IF(purchase_info.VECHICAL_STATUS=5,'Gate Out',IF(purchase_info.VECHICAL_STATUS=6,'Migo Approval',IF(purchase_info.VECHICAL_STATUS=7,'Completed',IF(purchase_info.VECHICAL_STATUS=35,'Redirect Gateout',''))))))))))) as label");
		$builder = $builder->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'left');
		return  $builder->distinct()->groupBy('rake_loading.status,purchase_info.VECHICAL_STATUS')->orderBy('purchase_info.VECHICAL_STATUS')->get()->getResultArray();
    }  

	public function FNRNOBasedCount($fnr_no)
{
    // Step 1: Get plant-wise total count
    $plantWiseData = $this->db->table("rake_loading")
        ->select("rake_loading.plant_id, COUNT(DISTINCT rake_loading.id) as total_count")
        ->where("rake_loading.fnr_no", $fnr_no)
        ->groupBy("rake_loading.plant_id")
        ->get()
        ->getResultArray();

    $plantCounts = [];

    foreach ($plantWiseData as $row) {
        $plant_id = $row['plant_id'];
        $plantCounts[$plant_id]['Total_Count'] = $row['total_count'];

        // Rake Create
        $plantCounts[$plant_id]['Rake_Create'] = $this->db->table("rake_loading")
            ->distinct()
            ->select("id")
            ->where("plant_id", $plant_id)
            ->where("status", '1')
            ->where("fnr_no", $fnr_no)
            ->countAllResults();

        // Rake Edit
        $plantCounts[$plant_id]['Rake_Edit'] = $this->db->table("rake_loading")
            ->distinct()
            ->select("id")
            ->where("plant_id", $plant_id)
            ->where("status", '2')
            ->where("fnr_no", $fnr_no)
            ->countAllResults();

        // Gate In
        $plantCounts[$plant_id]['gate_in'] = $this->db->table("rake_loading")
            ->distinct()
            ->select("rake_loading.id")
            ->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')
            ->groupStart()
                ->groupStart()
                    ->where("rake_loading.fnr_no", $fnr_no)
                    ->where("purchase_info.VECHICAL_STATUS", '23')
                ->groupEnd()
                ->orGroupStart()
                    ->where("rake_loading.fnr_no", $fnr_no)
                    ->where("purchase_info.VECHICAL_STATUS", '4')
                    ->where("purchase_info.FirstWeightEntryBy", '0')
                ->groupEnd()
            ->groupEnd()
            ->where("plant_id", $plant_id)
            ->countAllResults();

        // First Weight
        $plantCounts[$plant_id]['first_weight'] = $this->db->table("rake_loading")
            ->distinct()
            ->select("rake_loading.id")
            ->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')
            ->where("plant_id", $plant_id)
            ->where("rake_loading.fnr_no", $fnr_no)
            ->where("purchase_info.VECHICAL_STATUS", '4')
            ->where("purchase_info.FirstWeightEntryBy >", 0)
            ->countAllResults();

        // Unloading
        $plantCounts[$plant_id]['unloading'] = $this->db->table("rake_loading")
            ->distinct()
            ->select("rake_loading.id")
            ->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')
            ->groupStart()
                ->groupStart()
                    ->where("rake_loading.fnr_no", $fnr_no)
                    ->where("purchase_info.VECHICAL_STATUS", '24')
                ->groupEnd()
                ->orGroupStart()
                    ->where("rake_loading.fnr_no", $fnr_no)
                    ->where("purchase_info.VECHICAL_STATUS", '5')
                    ->where("purchase_info.SecondWeightEntryBy", '0')
                ->groupEnd()
            ->groupEnd()
            ->where("plant_id", $plant_id)
            ->countAllResults();

        // Second Weight
        $plantCounts[$plant_id]['second_weight'] = $this->db->table("rake_loading")
            ->distinct()
            ->select("rake_loading.id")
            ->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')
            ->where("plant_id", $plant_id)
            ->where("rake_loading.fnr_no", $fnr_no)
            ->where("purchase_info.VECHICAL_STATUS", '5')
            ->where("purchase_info.SecondWeightEntryBy >", 0)
            ->countAllResults();

        // Gate Out
        $plantCounts[$plant_id]['gate_out'] = $this->db->table("rake_loading")
            ->distinct()
            ->select("rake_loading.id")
            ->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')
            ->where("plant_id", $plant_id)
            ->where("rake_loading.fnr_no", $fnr_no)
            ->where("purchase_info.VECHICAL_STATUS", '6')
            ->countAllResults();

        // MIGO Approve
        $plantCounts[$plant_id]['migo_approve'] = $this->db->table("rake_loading")
            ->distinct()
            ->select("rake_loading.id")
            ->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')
            ->where("plant_id", $plant_id)
            ->where("rake_loading.fnr_no", $fnr_no)
            ->where("purchase_info.VECHICAL_STATUS", '7')
            ->countAllResults();

        // Gate Outed Data (last 15 unique vehicle numbers)
        $plantCounts[$plant_id]['gateouteddata'] = $this->db->table("rake_loading")
            ->select("rake_loading.vehicle_no")
            ->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')
            ->where("plant_id", $plant_id)
            ->where("rake_loading.fnr_no", $fnr_no)
            ->whereIn("purchase_info.VECHICAL_STATUS", [5, 6, 7])
            ->orderBy("purchase_info.GateOutDt", "DESC")
            ->limit(15)
            ->get()
            ->getResultArray();

        // ➕ Calculate Process_Cancel
        $plantCounts[$plant_id]['Process_Cancel'] = $plantCounts[$plant_id]['Total_Count']
            - (
                $plantCounts[$plant_id]['Rake_Create'] +
                $plantCounts[$plant_id]['Rake_Edit'] +
                $plantCounts[$plant_id]['gate_in'] +
                $plantCounts[$plant_id]['first_weight'] +
                $plantCounts[$plant_id]['unloading'] +
                $plantCounts[$plant_id]['second_weight'] +
                $plantCounts[$plant_id]['gate_out'] +
                $plantCounts[$plant_id]['migo_approve']
            );
    }

    // Final overall count: sum of plant-wise Total_Counts
    $overallTotalCount = array_sum(array_column($plantCounts, 'Total_Count'));

    return [
        'plantCounts' => $plantCounts,
        'overallcount' => $overallTotalCount
    ];
}



	public function SAP_PP_Insert($Data, $Data1, $UPDATE, $SUPPLIER_CODE)
	{
		$count = $this->db->table("sap_to_pp")->where(['EBELN =' => $Data['EBELN'], 'EBELP =' => $Data['EBELP'], 'WERKS =' => $Data['WERKS'], 'SUPPLIER_CODE =' => $Data['SUPPLIER_CODE'], 'LOEKZ !=' => 'A'])->countAllResults();
		$count1 = 0;
	if($count == 0){
		$count1 = $this->db->table("sap_to_pp")->where(['EBELN =' => $Data['EBELN'] , 'EBELP =' => $Data['EBELP'],'WERKS =' => $Data['WERKS'],'SUPPLIER_CODE ='=>$SUPPLIER_CODE,'LOEKZ !='=>'A'])->countAllResults();
	  }
		if($count > 0 && $UPDATE == 'U'){
			$InsId = $this->db->table('sap_to_pp')->set($Data1)->where(['EBELN =' => $Data['EBELN'] , 'EBELP =' => $Data['EBELP'],'SUPPLIER_CODE ='=>$Data['SUPPLIER_CODE']])->update();
		}else if($count1 > 0 && $UPDATE == 'U'){
			$InsId = $this->db->table('sap_to_pp')->set($Data1)->where(['EBELN =' => $Data['EBELN'] , 'EBELP =' => $Data['EBELP'],'SUPPLIER_CODE ='=>$SUPPLIER_CODE])->update();
		
		}else if( $UPDATE == 'D'){
			$InsId = $this->db->table('sap_to_pp')->set('LOEKZ','D')->where(['EBELN =' => $Data['EBELN'] , 'EBELP =' => $Data['EBELP'],'WERKS =' => $Data['WERKS'],'SUPPLIER_CODE ='=>$Data['SUPPLIER_CODE'],'LOEKZ !='=>'D'])->update();
		
		}else if($count == 0 && $count1 == 0 && $Data['PURCHASE_ORG_DESC'] != 'Rake') {
			$this->db->table('sap_to_pp')->insert($Data);
			$InsId=$this->insertID();
		}

	 return  $InsId;
    }
    
    public function SAP_PP_DELETE_FLAG($Data){	
		foreach ($Data as $detail) {
			$po_number .= $detail->PO_NUMBER . ',';
			$line_item .= $detail->PO_LINE_ITEM . ',';
			$supplier_code .= $detail->SUPPLIER_CODE . ',';
			$supplier_code1 .= substr($detail->SUPPLIER_CODE,4) . ',';
		 }
		 $po_number = explode(",", $po_number);
	     $po_number = "'" . implode("', '", $po_number) ."'";
		 $po_number = substr($po_number,0, -4);
		 $line_item = explode(",", $line_item);
	     $line_item = "'" . implode("', '", $line_item) ."'";
		 $line_item = substr($line_item,0, -4);
		 $supplier_code = explode(",", $supplier_code);
	     $supplier_code = "'" . implode("', '", $supplier_code) ."'";
		 $supplier_code = substr($supplier_code,0, -4);
		 $supplier_code1 = explode(",", $supplier_code1);
	     $supplier_code1 = "'" . implode("', '", $supplier_code1) ."'";
		 $supplier_code1 = substr($supplier_code1,0, -4);

        $result = $this->db->table("sap_to_pp")->select("refid,SUPPLIER_CODE")->where("EBELN in($po_number) and EBELP in($line_item) and SUPPLIER_CODE not in($supplier_code) and LOEKZ != D")->get()->getResultArray();

		foreach ($result as $details) {
			if(strlen($details['SUPPLIER_CODE'])==10){
			$InsId = $this->db->table('sap_to_pp')->set('LOEKZ','U')->where(['refid =' => $details['refid']])->update();
			}else{
			$InsId = $this->db->table('sap_to_pp')->set('LOEKZ','U')->where(['refid =' => $details['refid']])->update();
			}
		}
	   return  $InsId;
    }
    
    public function FNRNOCHANGE($Data){
        $builder = $this->db->table("purchase_info");
        $builder = $builder->select("FNR_NO as value, FNR_NO as label");
		$builder =  $builder->where("ZPO_NUMBER", $Data->PO_NUMBER);
        $builder =  $builder->where("PO_LINE_ITEM", $Data->PO_LINE);

        
        return  $builder->distinct()->groupBy("FNR_NO")->get()->getResultArray();
    }

	public function SAPPushDataSTM($id){	
		$builder = $this->db->table("empty_vehicle_arrival");
		$builder = $builder->select("empty_vehicle_arrival.*,silotomill_dispatch_info.*,quality_info.*");
		$builder = $builder->join('silotomill_dispatch_info', 'silotomill_dispatch_info.VehicleArrivalId = '.$id.'', 'inner');
		$builder = $builder->join('quality_info', 'quality_info.STM_VehicleArrivalId = '.$id.'', 'inner');
		//$builder = $builder->join('pp_silotomillweights', 'pp_silotomillweights.VANumber = empty_vehicle_arrival.ZVA_NUMBER', 'inner');
		$builder =  $builder->where("empty_vehicle_arrival.ID","$id");
		$builder =  $builder->distinct()->get()->getResultArray();
		return  $builder;
    }

	public function STMDeliveryNoFetch($SCREEN){	
		$builder = $this->db->table("empty_vehicle_arrival");
		$builder = $builder->select("ZVA_NUMBER");
		$builder =  $builder->where("VEHICLE_STATUS","5");
		// $builder =  $builder->where("IsUpdated","0");
		$builder =  $builder->where("SCREEN_TYPE",$SCREEN);
		$builder =  $builder->distinct()->get()->getResultArray();
		return  $builder;
    }

	public function PurchaseDetailsByID($PI_REFID){	
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("purchase_info.*,empty_vehicle_arrival.GateOutDt");
		$builder = $builder->join('empty_vehicle_arrival', 'empty_vehicle_arrival.ID = purchase_info.EMPTY_VEHICLE_ARRIVAL_ID', 'inner');
		$builder =  $builder->where("purchase_info.PI_REFID",$PI_REFID);
		$builder =  $builder->distinct()->get()->getResultArray();
		return  $builder;
    }

	public function STMPOInsert($po_no,$flag,$data){	
		$count = $this->db->table("pp_silotomillpoline")->where('PONumber',$po_no)->countAllResults();
		   if($count == 0) {
				  $this->db->table('pp_silotomillpoline')->insert($data);
				  $InsId=$this->insertID();
		   }else if($count > 0 && $flag == 'X') {
				  $InsId = $this->db->table('pp_silotomillpoline')->set('flag','X')->where(['PONumber =' => $po_no])->update();
		   }
		   else if($count > 0 && $flag == '') {
				  $InsId = $this->db->table('pp_silotomillpoline')->set('flag',0)->where(['PONumber =' => $po_no])->update();
		   }
		   else{
				  $InsId = false ;
		   }
		   return  $InsId;
	}
	public function GetLoadingLocation($data){
        $builder = $this->db->table("master_plant_address");
        $builder = $builder->select("id as value, companyName1 as label");
		$builder =  $builder->where("isActive",1 );
		if(!empty($data->plantIds)){
        	$builder =  $builder->whereIn("divisionUnit", $data->plantIds);
		}else{
			$builder =  $builder->whereIn("divisionUnit", ['FR01','FR04']);
		}
        return  $builder->distinct()->get()->getResultArray();
    }

	public function DeliveryChallanPrintFormRake($ID){
		$builder = $this->db->table("rake_loading");
		$builder = $builder->select("rake_loading.*,master_plant_address.*,DATE_FORMAT(rake_loading.created_at,'%d-%m-%Y') as created_at");
		$builder = $builder->join('master_plant_address', 'master_plant_address.id = rake_loading.loading_location_id', 'inner');
		$builder =  $builder->where("rake_loading.id", $ID);
		return  $builder->get()->getResultArray();
	}

	public function STMMigoDataFetch($ID){	
		$builder = $this->db->table('purchase_info');

		// Select all columns from both 'empty_vehicle_arrival' and 'purchase_info' tables
		$builder->select('empty_vehicle_arrival.*, purchase_info.*,silotomill_dispatch_info.*,pp_silotomillpoline.SendingLocation,purchase_info.GateInDt as ReciveGateIn,purchase_info.GateOutDt as ReciveGateOut,empty_vehicle_arrival.GateInDt as SendingGateIn,empty_vehicle_arrival.GateOutDt as SendingGateOut,pp_silotomillweights_unload.FirstWeight as RecivingFirstWt,pp_silotomillweights_unload.SecondWeight as RecivingSecondWt,pp_silotomillweights_unload.NetWeight as RecivingNetWt');

		// Apply the necessary WHERE conditions
		// $builder->where('purchase_info.VECHICAL_STATUS', '12');
		// $builder->where('purchase_info.IsUpdated', '0');
		$builder->where('purchase_info.SCREEN_TYPE', 'SILOTOMILL');
		$builder->where('purchase_info.PI_REFID', $ID);
		// Perform an inner join with the 'empty_vehicle_arrival' table
		$builder->join('empty_vehicle_arrival', 'empty_vehicle_arrival.ID = purchase_info.EMPTY_VEHICLE_ARRIVAL_ID', 'inner');
		$builder->join('silotomill_dispatch_info', 'silotomill_dispatch_info.VehicleArrivalId = purchase_info.EMPTY_VEHICLE_ARRIVAL_ID', 'inner');
		$builder->join('pp_silotomillpoline', 'pp_silotomillpoline.PONumber = silotomill_dispatch_info.ZPO_NUMBER and silotomill_dispatch_info.VehicleArrivalId = purchase_info.EMPTY_VEHICLE_ARRIVAL_ID', 'inner');
		$builder->join('pp_silotomillweights_unload', 'pp_silotomillweights_unload.VANumber = purchase_info.ZVA_NUMBER', 'inner');

		// Execute the query and retrieve the results as an array
		$result = $builder->distinct()->groupBy('purchase_info.PI_REFID')->get()->getResultArray();
		return $result;
    }

	public function STMMigoCompletionUpdate($purchase_info_id,$empty_vehicle_arrival_id){
				
		$this->db->table('purchase_info')
             ->set('IsUpdated', 1)
             ->where('PI_REFID', $purchase_info_id)
             ->update();

		// Check the number of affected rows
		$affectedRows = $this->db->affectedRows();
		// Return true if rows were affected, otherwise false
		return $affectedRows > 0;
    }

	public function IASDeliveryCompletionUpdate($ID,$Data){
				
		$this->db->table('empty_vehicle_arrival')
             ->set($Data)
             ->where('ID', $ID)
             ->update();

		// Check the number of affected rows
		$affectedRows = $this->db->affectedRows();
		// Return true if rows were affected, otherwise false
		return $affectedRows > 0;
    }
	/**
	 * Get distinct FNR numbers created within the last $days days with summary data.
	 *
	 * @param int $days Number of days to look back (default 15)
	 * @return array Each entry contains: value (fnr_no), label (fnr_no), total_count, last_created (dd-mm-YYYY HH:ii)
	 */
	public function RakeFNRNO(){
		$builders = $this->db->table("pp_setting");
		$builders = $builders->select("surveyorScreenDate");
		$builders =  $builders->where("id",1);
		$builders = $builders->distinct()->get()->getResultArray();

		$date_restrictions = -$builders[0]['surveyorScreenDate'];	
		$lastdate = date('Y-m-d', strtotime("{$date_restrictions} days"));
		$sql = "
			SELECT 
				a.fnr_no as value,
				a.fnr_no as label,

				CONCAT(
					'[',
					GROUP_CONCAT(
						CONCAT(
							'{\"PLANT_ID\":\"',a.plant_id,
							'\",\"TOTAL_VEHICLE\":',a.plant_count,'}'
						)
					),
					']'
				) as plant_ids,

				SUM(a.plant_count) as total_count,

				b.Own_Count,
				b.Hire_Count,

				d.rrCopy,
				d.noOfWagan,
				e.surveyorScreenDate,

				MAX(a.created_at) as last_created

			FROM (
				SELECT 
					fnr_no,
					plant_id,
					created_at,
					COUNT(vehicle_no) as plant_count
				FROM rake_loading
				WHERE fnr_no != ''
				AND created_at >= '$lastdate'
				GROUP BY fnr_no, plant_id
			) a

			JOIN (
				SELECT 
					fnr_no,
					COUNT(DISTINCT CASE WHEN tripsheet_no LIKE 'O%' THEN vehicle_no END) as Own_Count,
					COUNT(DISTINCT CASE WHEN tripsheet_no LIKE 'R%' THEN vehicle_no END) as Hire_Count
				FROM rake_loading
				WHERE fnr_no != ''
				AND created_at >= '$lastdate'
				GROUP BY fnr_no
			) b ON a.fnr_no = b.fnr_no

			LEFT JOIN supplier_entry d 
				ON d.truckNo = a.fnr_no 
				AND d.status = 2

			LEFT JOIN rake_surveyor_report c 
				ON c.fnrNumber = a.fnr_no 
				AND c.status = 1
			LEFT JOIN pp_setting e  ON e.id = 1

			WHERE c.fnrNumber IS NULL

			GROUP BY a.fnr_no

			ORDER BY MAX(a.created_at) DESC
			";
    return $this->db->query($sql)->getResultArray();
}
public function Rake_Unloading_Surveyor_Insert($Data){	
		$this->db->table('rake_surveyor_report')->set($Data)->insert();
		// print_r($this->db->error());exit;
        $InsId=$this->insertID();
		return  $InsId;
}
public function SurveyorDetails($status, $fromDate, $toDate) {
        // Convert milliseconds to seconds if necessary
        if ($fromDate > 1000000000000) {
            $fromDate /= 1000;
        }
        if ($toDate > 1000000000000) {
            $toDate /= 1000;
        }
    
        // Format dates
        $fromDate = $fromDate > 0 ? date("Y-m-d 00:00:00", $fromDate) : date("Y-m-d 00:00:00");
        $toDate   = $toDate > 0   ? date("Y-m-d 23:59:59", $toDate)   : date("Y-m-d 23:59:59");
		
		$builders = $this->db->table("pp_setting");
		$builders = $builders->select("surveyorScreenDate");
		$builders =  $builders->where("id",1);
		$builders = $builders->distinct()->get()->getResultArray();

		$date_restrictions = -$builders[0]['surveyorScreenDate'];	
		$lastdate = date('Y-m-d', strtotime("{$date_restrictions} days"));
        // Start building query
        $builder = $this->db->table("rake_surveyor_report")
            ->select("
                rake_surveyor_report.*,
                CASE 
                    WHEN rake_surveyor_report.status = 1 THEN 'Approval 1'
					WHEN rake_surveyor_report.status = 2 THEN 'Approval 2'
					WHEN rake_surveyor_report.status = 3 THEN 'Completed'
					WHEN rake_surveyor_report.status = 0 THEN 'Reject'
					ELSE 'Unknown'
				END AS statusName,
				definitions_list.id as definitions_list_id,
				pp_setting.surveyorScreenDate
            ")
        ->join('definitions_list', 'definitions_list.definitionsName = rake_surveyor_report.rakeType', 'inner')
 		->join('pp_setting', 'pp_setting.id = 1', 'inner');
    
        // Filter by date only if status > 1
        if ($status > 1) {
            $builder->where('rake_surveyor_report.createdAt >=', $fromDate);
            $builder->where('rake_surveyor_report.createdAt <=', $toDate);
        }
    
        // Apply status filter
        if ($status == 1) {
            // $builder->where('rake_surveyor_report.status', $status);
			$threeDaysAgo = date("Y-m-d 00:00:00", strtotime("-3 days"));
			$today = date("Y-m-d 23:59:59");

			$builder->whereIn('rake_surveyor_report.status', [1,2,3]);
			$builder->where('rake_surveyor_report.createdAt >=', $lastdate);
			$builder->where('rake_surveyor_report.createdAt <=', $today);
        }
        // Optional: group by ID if needed for joins
        $builder->groupBy('rake_surveyor_report.id');
        // Execute and return results
        return $builder->get()->getResultArray();
}
public function Rake_Unloading_Surveyor_Update($Data,$id){	
		$result=$this->db->table('rake_surveyor_report')->set($Data)->where('id',$id)->update();
		if(!$result){
			$error = $this->db->error();
			print_r($error);
			exit;
		}
		return  $result;
} 
public function SurveyorDetailsById($id) {

        $builder = $this->db->table("rake_surveyor_report")
            ->select("
                rake_surveyor_report.*,
                CASE 
                    WHEN rake_surveyor_report.status = 1 THEN 'Completed'
                    WHEN rake_surveyor_report.status = 0 THEN 'Reject'
                    ELSE 'Unknown'
                END AS statusName,
				definitions_list.id as definitions_list_id,
				user_info.FIRST_NAME
            ")
        ->join('definitions_list', 'definitions_list.definitionsName = rake_surveyor_report.rakeType', 'inner')
		->join('user_info', 'user_info.UI_ID = rake_surveyor_report.createdBy', 'inner');
		$builder->where('rake_surveyor_report.id', $id);	
        $builder->groupBy('rake_surveyor_report.id');
        return $builder->get()->getResultArray();
}
public function RakeVehicleDetails($fnr_no) {

        $builder = $this->db->table("rake_loading")
            ->select("
                rake_loading.*,
				rake_surveyor_report.tarpaulinPlaced,
				purchase_info.ZVA_NUMBER as vaNumber,
				master_bag.BAG_NAME as receive_bag1
            ")
        ->join('rake_surveyor_report', 'rake_surveyor_report.fnrNumber = rake_loading.fnr_no', 'inner')
		->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'left')
		->join('master_bag', 'master_bag.BAG_CODE = rake_loading.receive_bag1', 'inner');
		
		$builder->where('rake_loading.fnr_no', $fnr_no);
		$builder->groupBy('rake_loading.id');	
        return $builder->get()->getResultArray();
}
}