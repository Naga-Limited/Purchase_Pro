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
            $plants = "WERKS IN ($numbers)";
            }else{
            $plants = 'WERKS NOT IN ("0")';
            }

        $builder = $this->db->table("purchase_info");
        $builder = $builder->select("FNR_NO as value, FNR_NO as label");
        $builder =  $builder->where("FNR_NO !=", '');
        $builder =  $builder->where("DateAdded >= '$lastdate'");
        $builder =  $builder->where($plants);

        
        return  $builder->distinct()->groupBy("FNR_NO")->get()->getResultArray();
    }
	public function PONumberGet($FNR_NO){
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("ZPO_NUMBER as value, ZPO_NUMBER as label");
		$builder =  $builder->where("FNR_NO", $FNR_NO);

		return  $builder->distinct()->groupBy("PI_REFID")->get()->getResultArray();
    }

	public function POLineItem($PO_NO,$FNR_NO){
		$builder = $this->db->table("purchase_info");
		$builder = $builder->select("PO_LINE_ITEM as value, PO_LINE_ITEM as label");
		$builder =  $builder->where("ZPO_NUMBER", $PO_NO);
		$builder =  $builder->where("FNR_NO", $FNR_NO);

		return  $builder->distinct()->groupBy("PI_REFID")->get()->getResultArray();
    } 

	public function SupplierList($PO_NO,$PO_LINE){
		$builder = $this->db->table("sap_to_pp");
		$builder = $builder->select("SUPPLIER_CODE as value, SUPPLIER_NAME as label");
		$builder =  $builder->where("EBELN", $PO_NO);
		$builder =  $builder->where("EBELP", $PO_LINE);

		return  $builder->distinct()->groupBy("SUPPLIER_CODE")->get()->getResultArray();
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
		$plants = "and PLANT_ID IN ($numbers)";
		}
		// else{
		// $plants = 'PLANT_ID NOT IN ("0")';
		// }
		$cnd="";
		
		$cnd.="VEHICLE_ARRIVED = '0' and WB_QTY NOT IN(' ') $plants";
		
		$Sql = "SELECT  SUP_VE_REFID as value, VEHICAL_NO as label
				FROM  supplier_vehical_info
				WHERE $cnd order by SUP_VE_REFID";
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
	public function UnloadingSDIVehicleRakeByID($id,$vehicle_no){	
		$builder = $this->db->table("rake_loading");
		$builder = $builder->select("rake_loading.*,master_plant.PLANT_NAME,master_storage.STORAGE_LOCATION");
		$builder = $builder->join('master_plant', 'master_plant.WERKS = rake_loading.plant_id', 'inner');
		$builder = $builder->join('master_storage', 'master_storage.LGORT = rake_loading.storage_location_id', 'inner');
		$builder =  $builder->where("rake_loading.status<", '3');
		$builder =  $builder->where("rake_loading.id","$id");
		$builder =  $builder->where("rake_loading.vehicle_no","$vehicle_no");
		return  $builder->distinct()->orderBy("rake_loading.id")->get()->getResultArray();
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
	
	public function Supplier_Vehicle_ByID($id){	
		$builder = $this->db->table("supplier_vehical_info");
		$builder = $builder->select("SUPPLIER_ID");
		$builder =  $builder->where("VEHICLE_ARRIVED", '0');
		$builder =  $builder->where("SUP_VE_REFID","$id");
		$builder =  $builder->distinct()->get()->getResultArray();

		// print_r($builder[0]['SUPPLIER_ID']);exit;

		$builders = $this->db->table("supplier_dispatch_info");
		$builders = $builders->select('*');
		$builders =  $builders->where("SD_REFID=",$builder[0]['SUPPLIER_ID']);

		return  $builders->distinct()->get()->getResultArray();
    }

	public function Rake_Loading_Insert($Data){	
		// print_r($Data);exit;
		$this->db->table('rake_loading')->set($Data)->insert();
        $InsId=$this->insertID();
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
		  
		$fetchsql = "SELECT a.*,b.PLANT_NAME,c.STORAGE_LOCATION,d.Name,f.BAG_NAME as BAG_NAME,g.BAG_NAME as BAG_NAME2,h.BAG_NAME as BAG_NAME3,i.MIGO_NUM,i.ZVA_NUMBER,i.VECHICAL_STATUS
		,IF(a.status<3,'Gate in',IF(i.VECHICAL_STATUS=23,'First weight',IF(i.VECHICAL_STATUS=2,'QC Check',IF(i.VECHICAL_STATUS=24,'Second weight',IF(i.VECHICAL_STATUS=3,'QC Deduction',IF(i.VECHICAL_STATUS=21,'QC Check After Unload',IF(i.VECHICAL_STATUS=4,'Unload',IF(i.VECHICAL_STATUS=5,'Gate Out',IF(i.VECHICAL_STATUS=6,'Migo Approval',IF(i.VECHICAL_STATUS=7,'Completed',IF(i.VECHICAL_STATUS=35,'Redirect Gateout',''))))))))))) as StatusName
		FROM `rake_loading` a
		JOIN master_plant b ON a.plant_id=b.WERKS
		JOIN master_storage c ON a.storage_location_id=c.LGORT
		JOIN master_vendor d ON a.loading_vendor_id=d.Id
		LEFT JOIN master_bag f ON a.receive_bag1=f.BAG_CODE
		LEFT JOIN master_bag g ON a.receive_bag2=g.BAG_CODE
		LEFT JOIN master_bag h ON a.receive_bag3=h.BAG_CODE
		LEFT JOIN purchase_info i ON a.purchase_info_id=i.PI_REFID
		where $cnd GROUP BY a.id";

		$builder =  $this->db->query($fetchsql);
		return  $builder->getResultArray();
	}

	public function  RakeEntryEdit($plant_id){

		if ($plant_id != '') {
			$splitnumber = $plant_id;
			$splittedNumbers = explode(",", $splitnumber);
			$numbers = "'" . implode("', '", $splittedNumbers) ."'";
			$plants = "a.plant_id IN $numbers";
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

	public function Rake_Loading_Update($Data,$id){	
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
		$builder = $builder->select("purchase_info.*,gateout_info.*,quality_info.*,rake_loading.tripsheet_no,rake_loading.fnr_no,rake_loading.loading_charge,master_vendor.Code,master_vendor.Name,sap_to_pp.SGT_SCAT as segment");
		$builder = $builder->join('gateout_info', 'gateout_info.purchase_info_id = '.$id.'', 'inner');
		$builder = $builder->join('quality_info', 'quality_info.purchase_info_id = '.$id.'', 'left');
		$builder = $builder->join('rake_loading', 'rake_loading.purchase_info_id = '.$id.'', 'left');
		$builder = $builder->join('master_vendor', 'master_vendor.Id = rake_loading.loading_vendor_id', 'left');
		$builder = $builder->join('sap_to_pp', "(sap_to_pp.EBELN,sap_to_pp.EBELP,sap_to_pp.BROCKER_CODE,sap_to_pp.SUPPLIER_CODE,sap_to_pp.WERKS) = (purchase_info.ZPO_NUMBER,purchase_info.PO_LINE_ITEM,purchase_info.ZVENDOR_CODE,purchase_info.ZSUPPLIER_CODE,purchase_info.WERKS)", 'inner');
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

		return  $builder->distinct()->groupBy("FNR_NO")->get()->getResultArray();
    }  

	public function FNRNOBasedCount($fnr_no) {

		
		$Rake_Create = $this->db->table("rake_loading")->where("status", '1')->where("fnr_no","$fnr_no")->countAllResults();
		$Rake_Edit = $this->db->table("rake_loading")->where("status", '2')->where("fnr_no","$fnr_no")->countAllResults();

		$gate_in = $this->db->table("rake_loading")->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')->where("(rake_loading.fnr_no='$fnr_no' AND purchase_info.VECHICAL_STATUS='23') OR (purchase_info.VECHICAL_STATUS='4' AND purchase_info.FirstWeightEntryBy = '0' AND rake_loading.fnr_no='$fnr_no')")->countAllResults();

		$first_weight = $this->db->table("rake_loading")->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')->where("rake_loading.fnr_no","$fnr_no")->where(['purchase_info.VECHICAL_STATUS =' => 4 , 'purchase_info.FirstWeightEntryBy >' => 0])->countAllResults();

		$unloading = $this->db->table("rake_loading")->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')->where("(rake_loading.fnr_no='$fnr_no' AND purchase_info.VECHICAL_STATUS='24') OR (purchase_info.VECHICAL_STATUS='5' AND purchase_info.SecondWeightEntryBy = '0' AND rake_loading.fnr_no='$fnr_no')")->countAllResults();

		$second_weight = $this->db->table("rake_loading")->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')->where("rake_loading.fnr_no","$fnr_no")->where(['purchase_info.VECHICAL_STATUS =' => 5 , 'purchase_info.SecondWeightEntryBy >' => 0])->countAllResults();

		$gate_out = $this->db->table("rake_loading")->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')->where("rake_loading.fnr_no","$fnr_no")->where("purchase_info.VECHICAL_STATUS", '6')->countAllResults();

		$migo_approve = $this->db->table("rake_loading")->join('purchase_info', 'purchase_info.PI_REFID = rake_loading.purchase_info_id', 'inner')->where("rake_loading.fnr_no","$fnr_no")->where("purchase_info.VECHICAL_STATUS", '7')->countAllResults();

		$total_count = $this->db->table("rake_loading")->where("rake_loading.fnr_no","$fnr_no")->countAllResults();
		
		return  (["Rake_Create"=>$Rake_Create,"Rake_Edit"=>$Rake_Edit,"gate_in"=>$gate_in,"first_weight"=>$first_weight,"unloading"=>$unloading,"second_weight"=>$second_weight,"gate_out"=>$gate_out,"migo_approve"=>$migo_approve , "Total_Count" => $total_count , "Process_Cancel"=>$total_count - ($Rake_Create+$Rake_Edit+$gate_in+$first_weight+$unloading+$second_weight+$gate_out+$migo_approve)]);
	 }

	public function SAP_PP_Insert($Data,$UPDATE){	
	  $count = $this->db->table("sap_to_pp")->where(['EBELN =' => $Data['EBELN'] , 'EBELP =' => $Data['EBELP'],'WERKS =' => $Data['WERKS'],'SUPPLIER_CODE ='=>$Data['LIFN2']])->countAllResults();

	//   print_r($count);exit;
		if($count == 0 && $UPDATE == 'I') {
			$this->db->table('sap_to_pp')->insert($Data);
			$InsId=$this->insertID();
		}else if( $UPDATE == 'U'){
			$InsId = $this->db->table('sap_to_pp')->set($Data)->where(['EBELN =' => $Data['EBELN'] , 'EBELP =' => $Data['EBELP'],'WERKS =' => $Data['WERKS'],'LIFN2 ='=>$Data['SUPPLIER_CODE']])->update();
		}else if( $UPDATE == 'D'){
			$InsId = $this->db->table('sap_to_pp')->set($Data)->where(['EBELN =' => $Data['EBELN'] , 'EBELP =' => $Data['EBELP'],'WERKS =' => $Data['WERKS'],'LIFN2 ='=>$Data['SUPPLIER_CODE']])->delete();
		}
	 return  $InsId;
    }
}
