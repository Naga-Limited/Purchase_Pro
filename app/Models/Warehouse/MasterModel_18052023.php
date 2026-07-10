<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;


class MasterModel extends Model
{
  public function getWarehouse()
  {
    $builder = $this->db->query("select WH_REFID as value, WH_NAME as label FROM warehouse_master order by WH_CODE");
    return  $builder->getResultArray();
  }
  public function getReceivingBinwithValue(){
    //Mohan 06082022 Commented for changing BIN Table $builder = $this->db->query("select ReceivingBin as label, Id as value from pp_receivingbin");
    $builder = $this->db->query("select BulksiloNo as label, id as value from pp_bulksilono");
    return  $builder->getResultArray();
  }
  public function updateMasterBag1($id,$Data){
    if($this->getMasterBagDuplicateChk($Data->BAG_CODE, $id)=="0")
    {
      $this->db->table('master_bag')->set($Data)->where('BAG_REFID',$id)->update();
    }
   else{
     $InsId=-5; //-5 Means Duplicate record exists
   }
  
  return $id; 
   }
   public function getMasterBag($Id) {
    $fetchsql = "SELECT *, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM master_bag WHERE BAG_REFID='$Id'";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
   }
   
   public function getMasterBagDuplicateChk($code,$id="") {
    //print_r($code);
    $cnd="";
    if($id!="")
    {
      $cnd.=" and BAG_REFID <> '".$id."'";
    }
    $fetchsql = "SELECT `BAG_REFID` FROM master_bag WHERE BAG_CODE='$code' ".$cnd;
    //print_r($fetchsql);
    $builder =  $this->db->query($fetchsql);
    
    return count($builder->getResultArray());
   }
   public function  insertMasterBag1($Data){
    //print_r(getMasterBagDuplicateChk($Data->BAG_CODE));
   //  print_r($Data->BAG_CODE);
   if($this->getMasterBagDuplicateChk($Data->BAG_CODE)=="0")
   {
   $this->db->table('master_bag')->set($Data)->insert();
   $InsId=$this->insertID();
    
  }
  else{
    $InsId=-5; //-5 Means Duplicate record exists
  }
   
   return $InsId;
 }
  public function getDistrict()
  {
    $builder = $this->db->query("SELECT id as value,districtname as label FROM `ngw_state_district` where RecStatus='1' ORDER by id");
    return  $builder->getResultArray();
  }
  public function getParameterType(){
    $builder = $this->db->query("SELECT Id AS value,ParameterType as label FROM `ngw_rnd_lot_parametertype` WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function get_parament_req(){
    $builder = $this->db->query("SELECT Id as value,Name as label FROM `wh_parameter_req` WHERE 1");
    return  $builder->getResultArray();
  }
  public function getState()
  {
    $builder = $this->db->query("SELECT distinct statename as value,statename as label FROM `ngw_state_district` where RecStatus='1' ORDER by id");
    return  $builder->getResultArray();
  }

  public function getDistWeekNo()
  {
    $builder = $this->db->query("SELECT DISTINCT weekno as value,weekno  as label FROM `ngw_weeklyplan` ORDER by planid");
    return  $builder->getResultArray();
  }
  public function getWeekNo()
  {
    $builder = $this->db->query("SELECT Id as value,WeekNo  as label FROM `ngw_weekno` ORDER by Id");
    return  $builder->getResultArray();
  }
  
  public function getRestrictMode()
  {
    $builder = $this->db->query("SELECT RestrictMode as value,RestrictMode  as label FROM `ngw_restrictmode` ORDER by Id");
    return  $builder->getResultArray();
  }


  public function getWHplantList($WH_CODE)
  {
    $cnd="";
    if(isset($WH_CODE))
    {
      $cnd.=" and b.WH_CODE='$WH_CODE' ";
    }
    $Sql = "SELECT  a.ID as value, 
                    concat(a.werks,'-',a.PLANT_NAME) as label, 
                    a.werks, 
                    a.PLANT_NAME,
                    b.name_of_collateral, 
                    b.company_name 
            FROM  master_plant a, 
                  warehouse_master b 
            WHERE b.WH_CODE = a.wh_code $cnd order by a.werks, a.PLANT_NAME";
    //echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }

  public function getWHplantListAll(){
    $Sql = "SELECT  ID as value, concat(werks,' - ',PLANT_NAME) as label FROM  master_plant WHERE RecStatus = 1";
    // echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }

  public function getWHstoragelocationList($WH_CODE)
  {
    $cnd="";
    if(isset($WH_CODE))
    {
      $cnd.=" and b.WH_CODE='$WH_CODE' ";
    }
    $Sql = "SELECT STORAGE_REFID as value,STORAGE_LOCATION as label ,
    (select name_of_collateral from warehouse_master where WH_CODE='$WH_CODE') as name_of_collateral,
    (select company_name from warehouse_master where WH_CODE='$WH_CODE') as company_name
    FROM `master_storage` where RecStatus='1' and plantid IN(SELECT a.ID 
    FROM `master_plant` a where a.WH_CODE='$WH_CODE')";
    //echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }
  public function getStateName($DistrictId)
  {
    $cnd="";
    if(isset($WH_CODE))
    {
      $cnd.=" and b.WH_CODE='$WH_CODE' ";
    }
    $Sql = "SELECT statename as label ,statename as value  FROM `ngw_state_district` where id='$DistrictId'";
   // echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }
  public function getKeyloadplantList($WH_CODE)
  {
    $cnd="";
    if(isset($WH_CODE))
    {
      $cnd.=" and b.WH_CODE='$WH_CODE' ";
    }
    $Sql = "select a.ID as value, concat(a.WERKS,'-',a.PLANT_NAME) as label, WERKS, a.PLANT_NAME 
    from master_plant a, warehouse_master b 
    where b.WH_CODE = a.wh_code 
    and a.ID IN(SELECT plantid FROM `ngw_keyloan_pledge` where balance_qty>'0' and  warehouseid='".$WH_CODE."')
    $cnd order by a.WERKS, a.PLANT_NAME";
   // echo $Sql;exit();
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }
  public function getKeyLoanDet($SRNo)
  {
    $cnd="";
    if(isset($SRNo))
    {
      $cnd.=" and a.SR_No='$SRNo' ";
    }
    $Sql = "SELECT a.*,concat(a.warehouseid,' - ',b.WH_NAME) as warehouseName
    FROM `ngw_keyloan_pledge` a 
    JOIN warehouse_master b ON a.warehouseid=b.wh_code
    WHERE 1 ".$cnd;
    //echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }

 public function getKeyLoanwarehouses(){
  $builder = $this->db->query("select WH_CODE as value, concat(WH_CODE,'-', WH_NAME) as label 
  from warehouse_master where
   wh_code IN(SELECT warehouseid FROM `ngw_keyloan_pledge` where balance_qty>'0' )  order by WH_NAME");
  return  $builder->getResultArray();
 }
 
  public function getKeyloanSRNo(){
    $Sql = "SELECT SR_No as label, SR_No as value FROM `ngw_keyloan_pledge` WHERE (Loan_No='' OR Loan_No is NULL)";
    // echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }

  public function getWHLotList($plantid,$storagelocationId)
  {
    $cnd="";
    if(isset($plantid))
    {
      $cnd.=" and a.plantid='$plantid' ";
    }
    if(isset($storagelocationId))
    {
      //$cnd.=" and a.locationid='$storagelocationId' ";
      $cnd.=" and (plantid, locationid) in (select plantid, STORAGE_REFID from master_storage where STORAGE_REFID='$storagelocationId' )";
    }
    $Sql = "select a.lotid as value, lotno as label  from ngw_lot a where recstatus = 1 $cnd order by a.lotno";
    // echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }

  public function getWHLotList_With_Plantid($plantid,$storagelocationId){
    // $cnd="";
    // if(isset($plantid))
    // {
    //   $cnd.=" and a.plantid='$plantid' ";
    // }
    // if(isset($storagelocationId))
    // {
    //   //$cnd.=" and a.locationid='$storagelocationId' ";
    //   $cnd.=" and (plantid, locationid) in (select plantid, STORAGE_REFID from master_storage where STORAGE_REFID='$storagelocationId' )";
    // }

    $Sql = "SELECT a.lotid as value, CONCAT(b.werks,' - ',a.lotno) as label  
            FROM ngw_lot a 
            JOIN master_plant b ON a.plantid = b.ID
            WHERE a.recstatus = 1 order by a.lotno";

    //echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }

  public function getWHLotListFromStorageLocation_st($storagelocationId)
  {
    $cnd="";
   
    if(isset($storagelocationId))
    {
      $cnd.=" and a.locationid='$storagelocationId' ";
    }
    $Sql = "select a.lotid as value, lotno as label  from ngw_lot a where recstatus = 1 $cnd order by a.lotno";
    // echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }
  public function getWHLotListFromStorageLocation($storagelocationId)
  {
    $cnd="";
   
    if(isset($storagelocationId))
    {
      $cnd.=" and a.plantid='$storagelocationId' ";
    }
    $Sql = "select a.lotid as value, lotno as label  from ngw_lot a where recstatus = 1 $cnd order by a.lotno";
    // echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }
  public function getKeyLoanLotList($plantid,$WHId)
  {
    $cnd="";
    if(isset($plantid))
    {
      $cnd.=" and a.plantid='$plantid' ";
    }
    $Sql = "select a.lotid as value, lotno as label from ngw_lot a where recstatus = 1 
    and a.lotid IN(SELECT lotid FROM `ngw_keyloan_pledge` where balance_qty>'0' and  warehouseid='$WHId' and plantid='$plantid')
    $cnd order by a.lotno";
   //  echo $Sql;exit();
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }
  public function getSublotWHeatvarietyList($PlantId,$WarehouseId,$StorageLocationId){
    $cnd="";
    if(isset($PlantId))
    {
      $cnd .= " and b.plantid='$PlantId' ";
    }
    if(isset($WarehouseId))
    {
      $cnd .= " and e.wh_code='$WarehouseId' ";
    }
    if(isset($StorageLocationId))
    {
      $cnd .= " and b.StorageLocationId='$StorageLocationId' ";
    }
    $Sql = "SELECT a.id as value,a.WheatVariety as label, 
    concat_ws('-',d.WERKS,d.PLANT_NAME) plantname,c.plantid, 
    e.WH_NAME wh_name,e.WH_CODE wh_code, e.wh_refid, b.wheatqty as SAP_Qty ,b.init_lot_qty
     FROM `master_mrc_wheat_variety` a, ngw_sublot b, ngw_lot c,master_plant d, 
     warehouse_master e where e.wh_code = d.WH_CODE and c.plantid=d.ID 
     and b.wheatvarietyid=a.id and c.lotid = b.lotid and b.Recstatus = 1 $cnd ORDER by a.WheatVariety";
    //echo $Sql;exit();
   $builder = $this->db->query($Sql);
   return  $builder->getResultArray();
  }
  
  public function getWHWheatvarietyList($lotid="",$StorageLocation="")
  {
    $cnd="";
    //echo "TEST";exit();
    if(isset($lotid) and !empty($lotid)) //Fetch all wheat variety to dropdown used in Weeklyplan page
    {
      $cnd .= " and b.lotid='$lotid' ";
    }
    if(isset($StorageLocation) && $StorageLocation!="") //Fetch all wheat variety to dropdown used in Weeklyplan page
    {
      $cnd .= " and b.StorageLocationId='$StorageLocation' ";
    }
    
     // $cnd .= " and b.lotid='6' ";
    //echo "SELECT id as value,WheatVariety as label FROM `master_mrc_wheat_variety` ORDER by id";exit();
    ///2 % difference allowed for Physical stock inventory adjustment 
    $Sql = "SELECT distinct a.id as value,a.WheatVariety as label, concat_ws('-',d.WERKS,d.PLANT_NAME) plantname,
    c.plantid, e.WH_NAME wh_name,e.WH_CODE wh_code, e.wh_refid, b.wheatqty as SAP_Qty ,b.init_lot_qty,
    f.STORAGE_LOCATION as storagelocationname,b.StorageLocationId as storagelocationid, '2' allowed_diff_in_percent,
    if(c.totalcapacity<b.wheatqty,c.totalcapacity,b.wheatqty) as diff_compare_qty,c.totalcapacity, b.wheatqty
    FROM `master_mrc_wheat_variety` a, ngw_sublot b, ngw_lot c,master_plant d, warehouse_master e ,
    master_storage f 
    where e.wh_code = d.WH_CODE and c.plantid=d.ID and b.wheatvarietyid=a.id 
    and c.lotid = b.lotid 
    and b.StorageLocationId = f.STORAGE_REFID 
    and b.Recstatus = 1 $cnd ORDER by a.WheatVariety";
    //  echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }
  public function getPlants() {
    $fetchsql = "SELECT ID as value , PLANT_NAME as label FROM `master_plant` where RecStatus='1'";
   
   $builder =  $this->db->query($fetchsql);
   return  $builder->getResultArray();
 }  
 //Fill Warehouse, Plant, StorageLocation, Lot based on Wheat Variety Id
 public function getWH_Plant_SL_Lot_WheatvarietyId($WheatvarietyId) {
  if(!isset($WheatvarietyId)) $WheatvarietyId="1"; //REMOVE WHEN LIVE

  $cndWH = " and wh_refid in (SELECT warehouseid FROM `ngw_sublot` where wheatvarietyid = '$WheatvarietyId') ";
  $cndPlant = "and id in (SELECT plantid FROM `ngw_sublot` where wheatvarietyid = '$WheatvarietyId') ";
  $cndSLocation = "and STORAGE_REFID in (SELECT StorageLocationId FROM `ngw_sublot` where wheatvarietyid = '$WheatvarietyId') ";
  $cndLot = "and LotId in (SELECT lotid FROM `ngw_sublot` where wheatvarietyid = '$WheatvarietyId')";

  $Sql="select WH_REFID as value, WH_NAME as label from warehouse_master where recstatus = 1 $cndWH order by WH_CODE ";
  
  $wh_builder = $this->db->query($Sql);
  $whArr = $wh_builder->getResultArray();
  
  $Sql = "select a.ID as value, concat(a.WERKS,'-',a.PLANT_NAME) as label from master_plant a where recstatus = 1 $cndPlant order by a.WERKS, a.PLANT_NAME";
  //echo $Sql;
  $plant_builder =  $this->db->query($Sql);
  $PlantArr = $plant_builder->getResultArray();
  
  $Sql="select LGORT as value, concat(LGORT,'-', STORAGE_LOCATION) as label from master_storage where 1 $cndSLocation order by STORAGE_LOCATION";
  // echo $Sql;
  $sloc_builder = $this->db->query($Sql);
  $sloc_Arr = $sloc_builder->getResultArray();

  $Sql = "select a.lotid as value, lotno as label  from ngw_lot a where recstatus = 1 
  and lotid in (select lotid from ngw_sublot where SAP_Qty>0 and wheatvarietyid='$WheatvarietyId')
  $cndLot order by a.lotno";  //Mohan 07-09-2022 Added condition for showing only stock available lots in the plan dropdown
  // echo $Sql;
  $lot_builder = $this->db->query($Sql);
  $LotArr = $lot_builder->getResultArray();
  $retArr = array("warehouse"=>$whArr, "plant"=>$PlantArr, "slocation"=>$sloc_Arr, "lot"=>$LotArr);
  
  return $retArr;
  }

  public function getKeyloanHWheatvarityList($lotid,$WarehouseId,$PlantId,$StorageLocationId)
  {
    $cnd="";
    if(isset($lotid))
    {
      $cnd .= " and b.lotid='$lotid' ";
    }
    //echo "SELECT id as value,WheatVariety as label FROM `master_mrc_wheat_variety` ORDER by id";exit();
    $Sql = "SELECT a.id as value,a.WheatVariety as label 
    FROM `master_mrc_wheat_variety` a, ngw_sublot b 
    where b.wheatvarietyid=a.id and b.Recstatus = 1 $cnd 
    and Id IN(SELECT Wheat_Variety_Id FROM `ngw_keyloan_pledge` where balance_qty>'0' 
    and  warehouseid='$WarehouseId' and  locationid='$StorageLocationId')
    ORDER by a.WheatVariety";
    // echo $Sql;
    $builder = $this->db->query($Sql);
    return  $builder->getResultArray();
  }

  public function getWheatVariety()
  {
    //echo "SELECT id as value,WheatVariety as label FROM `master_mrc_wheat_variety` ORDER by id";exit();
    $builder = $this->db->query("SELECT id as value, CONCAT(LEFT(Segment,1),'-', WheatVariety) as label FROM `master_mrc_wheat_variety` ORDER by id");
    return  $builder->getResultArray();
  }

  public function getLotNumber()
  {
    $builder = $this->db->query("SELECT lotno as label, lotid as value FROM `ngw_lot` WHERE recstatus='1'");
    return  $builder->getResultArray();
  }
  
  public function getMovementGroupNumber()
  {
    $builder = $this->db->query("SELECT concat('MGN-',IFNULL(max(SeqNumber),0)+1) as MovementGroupNumber FROM `ngw_weeklyplanseq` WHERE 1");
    return  $builder->getResultArray();
  }
  
  public function updateMaster_ngw_state_district($id,$Data){
    $this->db->table('ngw_state_district')->set($Data)->where('id',$id)->update();
    $InsId=$id;
    return $InsId;
   }
   public function  insertMaster_ngw_state_district($Data){
  
     $this->db->table('ngw_state_district')->set($Data)->insert();
     $InsId=$this->insertID();
 
     return $InsId;
  }
  //
  public function UpdateParameter($id,$Data){
    $this->db->table('ngw_rnd_lot_parametermaster')->set($Data)->where('rnd_lot_parametermasterid',$id)->update();
    $InsId=$id;
    return $InsId;
   }
   public function  InsertParameter($Data){
  //var_dump($Data);exit();
     $this->db->table('ngw_rnd_lot_parametermaster')->set($Data)->insert();
     $InsId=$this->insertID();
 
     return $InsId;
  }
  //END
 
  public function getRelotReason($Id) {
    $fetchsql = "SELECT `Relotreasonid`, `Relotreason`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` 
    FROM `ngw_relotreason` WHERE Relotreasonid='$Id'";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }
  public function getStateDistrict($Id) {
    $fetchsql = "SELECT `id`, `statename`, `districtname`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM `ngw_state_district` where RecStatus='1' and id='$Id'";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function getMaster_rndlotconversion($Id) {
    //echo "test";exit();
    $fetchsql = "SELECT a.*,a.sortorderno,
    b.ParameterType as ParameterTypeName,if(validationrequired='1','YES','NO') as ValReq,
    IF(a.attachmentrequired='1','YES','NO') as AttReq,if(a.attachmentmandatory='1','YES','NO') as AttMan
    FROM `ngw_rnd_lot_parametermaster` a 
    JOIN ngw_rnd_lot_parametertype b ON a.`parametertype`=b.Id
    WHERE a.rnd_lot_parametermasterid='$Id'";
    //echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  //bank  master
  public function updateMaster_ngw_bank($id,$Data){
    $this->db->table('ngw_bankmaster')->set($Data)->where('bankid',$id)->update();
    $InsId=$id;
    return $InsId;
   }

   public function  insertMaster_ngw_bank($Data){
    
     $this->db->table('ngw_bankmaster')->set($Data)->insert();
     $InsId=$this->insertID();
     return $InsId;
  }
  public function getbankmaster($Id) {
    $Cnd="";
    if(isset($Id))
    {
      $Cnd .= " and bankid='$Id' ";
    }
    $fetchsql = "SELECT `bankid`, `bankname`, `bankcode`  FROM `ngw_bankmaster` where recstatus = 1 $Cnd order by bankid";
    // echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function getbankmasterDropDown() {
    $Cnd="";
    $fetchsql = "SELECT `bankid` value, concat_ws('-',`bankcode`,`bankname`) as label   FROM `ngw_bankmaster` where recstatus = 1 $Cnd order by bankid";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  //Driver Master
  public function updateMaster_ngw_driver($id,$Data){
    $this->db->table('ngw_drivermaster')->set($Data)->where('driverid',$id)->update();
    $InsId=$id;
    return $InsId;
  }

  public function  insertMaster_ngw_driver($Data){  
    $this->db->table('ngw_drivermaster')->set($Data)->insert();
    $InsId=$this->insertID();
    return $InsId;
  }

  public function getdrivermaster($Id) {
    $Cnd="";
    if(isset($Id))
    {
      $Cnd .= " and driverid='$Id' ";
    }
    $fetchsql = "SELECT `driverid`, `drivername`, `driverno`  FROM `ngw_drivermaster` where recstatus = 1 $Cnd order by driverid";
    // echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function getdrivermasterDropDown() {
    $Cnd="";
    $fetchsql = "SELECT `driverid` value, concat_ws('-',`drivername`,`driverno`) as label   FROM `ngw_drivermaster` where recstatus = 1 $Cnd order by driverid";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  //warehouse master
  public function updateMaster_new_warehouse($id,$Data){
    $this->db->table('warehouse_master')->set($Data)->where('wh_refid',$id)->update();
    $InsId=$id;
    return $InsId;
   }
   public function  insertMaster_new_warehouse($Data){
  
     $this->db->table('warehouse_master')->set($Data)->insert();
     $InsId=$this->insertID();
 
     return $InsId;
  }
  public function getwarehousewithID()
  {
    $builder = $this->db->query("select wh_refid as value, concat(WH_CODE,'-', WH_NAME) as label from warehouse_master where approval_status>2 order by WH_NAME");
    return  $builder->getResultArray();
  }
  public function getwarehousewithID_ID($Id)
  {
    $builder = $this->db->query("select wh_refid as value, concat(WH_CODE,'-', WH_NAME) as label 
    from warehouse_master where approval_status>2 and wh_refid='$Id' order by WH_NAME");
    return  $builder->getResultArray();
  }
  
  public function getwarehousecreation($Id) {
/*    $fetchsql = ""SELECT 'wh_refid','wh_code','warehousename','whaddress','whcity','street','whpincode',
'district','state','whlat','whlong','ownertype','ownername','owneraddress',
'ownerstreet','ownerpincode','ownercity','ownerdistrict','ownerstate',
'ownerfaxnumber','ownerlandlineno','ownermobileno','ownermailid',
'totalcapacityinmts','totalcapacityinsqft','pillarinfo','outsideareacapacitymts',
'outsideareacapacityinsqft','contractstartdate','contractenddate',
'advancevalueaftertds','rentpersqft','rentpermonth','rentduedate',
'lockingperiodinmonths','noticeperiodinmonths','contracttype','servicechargespwh',
'bankname','bankbranch','bankcity','bankdistrict','bankstate','bankpincode',
'bankaccountno','bankifsc','wb_count','wb_1_name','wb_2_name',
'wb1_capacity_in_mts','wb2_capacity_in_mts','wb1_stamping_start_date','wb2_stamping_start_date','wb1_stamping_expiry_date','wb2_stamping_expiry_date','wb1_stamping_certificate_attachment','wb2_stamping_certificate_attachment','separate_electric_meters','electric_plug_points_inside','electric_light_points_outside','electric_light_points_inside','electric_light_points_outside','drinking_water_facility',
'no_of_fire_extinguisher','borewell_facility','toilet_facility','water_connection',
'year_of_construction','warehouse_security','naga_security','boundary_wall',
'distance_railway_goods_shed','distance_mandi','distance_national_highways',
'distance_fci_procurement_point','distance_state_highways','distance_pucca',
'statutory_survey_type','statutory_type_attachment','license_no_1','license_copy_attachment1','license_no_2','license_copy_attachment2','license_no_3',
'license_copy_attachment3','independent_gate','wall_type',
'shutter_count','plinth','no_of_exits','roof_type','door_count','floor_height',
'wh_photograph_attachment','floor_type','window_count','height_from_adj_land',
'inside_road_type','inside_heavy_vehicle_mvmt','inside_no_of_truck_in_capacity',
'repair_work_remarks','latest_audit_date','next_audit_due_date',
'name_of_collateral','name_of_bank','naga_pwh_insurance_no','naga_pwh_insurance_attachment','insurance_covered_amt','insurance_premium_amt','insurance_period',
'insurance_start_date','insurance_end_date','insurance_company','gst_registration',
'company_name','godown_type','contract_agreement_attachment','gst_type',
'effective_from','effective_to','cost_centre','gl_account','insby','insdt','modby',
'moddt','RecStatus' from 'warehouse_master' where RecStatus='1' and wh_refid='$Id'";"
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();*/
  }

/** R & D lot Conversion **/

public function updateMaster_rndlotconversion1($id,$Data){
  $this->db->table('ngw_rnd_lot_conversion')->set($Data)->where('rnd_lot_conversion_id',$id)->update();
  $InsId=$id;
  return $InsId;
 }
 public function  insertMaster_rndlotconversion1($Data){
   $this->db->table('ngw_rnd_lot_conversion')->set($Data)->insert();
   $InsId=$this->insertID();
   return $InsId;
}
public function getrndlotconversion($Id) {
    $fetchsql = "SELECT 'rnd_lot_conversion_id', 'qano','warehouseid','plantid','locationid','lotid',
'lotno','rndconfirmqty','fumigationclearedqty','keyloandoqty','mixingratio',
'rnddate','rnd_moisture','rnd_hl','rnd_temparature','rnd_hi','rnd_wet_gluten_percent','rnd_dry_gluten_percent','rnd_gi','rnd_sv','rnd_fn','rnd_t','rnd_hp_lp',
'rnd_he_le','rnd_e','rnd_iec','rnd_t_e','rnd_w','rnd_wap','rnd_ddt','rnd_stability',
'demo_parotta_v','demo_parotta_s','demo_parotta_c','demo_parotta_f','demo_parotta_score','demo_bakery_b','demo_bakery_c','demo_bakery_o','demo_bakery_score',
'demo_parotta_w','demo_chapathy_score','color',
`InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM `ngw_rnd_lot_conversion` where RecStatus='1' and rnd_lot_conversion_id='$Id' order by qano";
  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
}

/** R&D End**/


/** fumigation Model **/

public function updateFumigationEntry($id,$Data){
  $this->db->table('ngw_fumigation')->set($Data)->where('FumigationId',$id)->update();
  $InsId=$id;
  return $InsId;
 }
 public function  insertFumigationEntry($Data){
   $this->db->table('ngw_fumigation')->set($Data)->insert();
   $InsId=$this->insertID();
   return $InsId;
}
public function getFumigationEntry($Id) {
    $fetchsql = "SELECT `FumigationId`,`lotid`,`warehouseid`,`plantid`,`locationid`,`lotno`,
`FumigationNo`,`Fumigation_date`,`Last_Fumigation_Type`,`Last_Fumigated_date`,
`Last_Degassed_date`,`Next_Due_Date`,`Lead_Days`,`Fumigation_Status`,
`QC_Update`,`QC_Updated_UserId`,`Fumigation_No`,`Reason_for_Delay`,
`Bag_Type`,`Fumigation_Type`,`Fumigation_Agency`,`Fumigator_Name`,
`Vendor_Name`,`Amount`,`ALP_Count`,`ActionRequired`,`Reason_for_Deviation`,
`InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM `ngw_fumigation` where RecStatus='1' and FumigationId='$Id' order by Lead_Days";
  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
}

/*** End Fumigaion Model***/

/*** Relotting Model ***/

public function updateRelottingEntry($id,$Data){
  $this->db->table('ngw_relot')->set($Data)->where('RelotId',$id)->update();
  $InsId=$id;
  return $InsId;
 }
 public function  insertRelottingEntry($Data){
   $this->db->table('ngw_relot')->set($Data)->insert();
   $InsId=$this->insertID();
   return $InsId;
}
public function getRelottingEntry($Id) {
    $fetchsql = "SELECT `RelotId`, `RelotDate`,`fromwarehouseid`,`fromplantid`,`fromlocationid`,
`fromlotid`,`fromlotno`,`towarehouseid`,`toplantid`,`tolocationid`,`tolotid`,
`tolotno`,`BagType`,`NoOfBags`,`QtyInMTS`,`RelottingVendorId`,`RelottingCharges`,
`RelottingReasonId`,`RelotStatus`,`BeforeFromLotQty`,`BeforeToLotQty`,
`AfterFromLotQty`,`AfterToLotQty`,`SAPStatus`,`WeightmentSlip`,`BeforeImage`,
`AfterImage`,
`InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM `ngw_relot` where RecStatus='1' and RelotId='$Id' order by RelotDate";
  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
}

/*** End Relotting Model ***/
  /*** Get Warehouse master Changed By Prakash on 30-11-2021 ***/

  public function getEntryWarehouses()
  {
    $builder = $this->db->query("select WH_CODE as value, concat(WH_CODE,'-', warehousename) as label from warehouse_master order by warehousename");
    return  $builder->getResultArray();
  }

  /*** Get master_storage ***/

  public function getStorageLocation()
  {
    $builder = $this->db->query("select LGORT as value, concat(LGORT,'-', STORAGE_LOCATION) as label from master_storage order by STORAGE_LOCATION");
    return  $builder->getResultArray();
  }

  public function getStorageLocationListFromPlant($Id){
    $fetchsql = "SELECT STORAGE_REFID as value,STORAGE_LOCATION as label 
    FROM `master_storage` where plantid='$Id' and RecStatus='1'";
    //echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

   /*** Get fumigation Type ***/

  public function getFumigationTypeData()
  {
    $builder = $this->db->query("select Fumigation_TypeId as value, Fumigation_Type as label from ngw_fumigation_type");
    return  $builder->getResultArray();
  }

   /*** Get Reson For Delay ***/

  public function getResonForDelayData()
  {
    $builder = $this->db->query("select ReasonDelayId as value, ReasonDelayStatus as label, SortOrder from ngw_reason_for_delay");
    return  $builder->getResultArray();
  }
 
  /*** Get New Lot No ***/

  public function getNewLotNoList()
  {
    $builder = $this->db->query("select lotid as value, lotno as label from ngw_lot");
    return  $builder->getResultArray();
  }

  /*** Get Fumigation Status ***/

  public function getFumigationStatusList()
  {
    $builder = $this->db->query("SELECT Fumigation_StatusId as value,Fumigation_Status as label FROM `ngw_fumigation_status` where RecStatus='1'");
    return  $builder->getResultArray();
  }
   public function getFumigationTypeAgency()
  {
    $builder = $this->db->query("SELECT FumigationAgencyId as value,FumigationAgency as label FROM `ngw_fumigation_agency` WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function getDegassStatusList()
  {
    $builder = $this->db->query("SELECT Fumigation_StatusId as value,Fumigation_Status as label 
    FROM `ngw_fumigation_status` WHERE RecStatus='1' and DegassStatus='1'");
    return  $builder->getResultArray();
  }
  public function updatengw_contract_type($id,$Data){
    $this->db->table('ngw_contract_type')->set($Data)->where('contracttypeid',$id)->update();
    $InsId=$id;
    return $InsId;
   }
   public function  insertngw_contract_type($Data){
     $this->db->table('ngw_contract_type')->set($Data)->insert();
     $InsId=$this->insertID();
     return $InsId;
  }
  public function getngw_contract_type($Id) {
    $fetchsql = "SELECT `contracttypeid`,`contracttype`,`InsBy`,`InsDt`,`ModBy`,`ModDt`,`RecStatus` FROM `ngw_contract_type` where RecStatus='1' and contracttypeid='$Id' order by contracttypeid";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }
  public function getcontract_typeDropDown() {
    $fetchsql = "SELECT `contracttypeid` as value,`contracttype` as label,`InsBy`,`InsDt`,`ModBy`,`ModDt`,`RecStatus` FROM `ngw_contract_type` where RecStatus='1' order by contracttypeid";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }
  public function updateMaster_ngw_reasondelay($id,$Data){
    $this->db->table('ngw_reason_for_delay')->set($Data)->where('ReasonDelayId',$id)->update();$InsId=$id;
    return $InsId;
  }
   public function  insertMaster_ngw_reasondelay($Data){
     $this->db->table('ngw_reason_for_delay')->set($Data)->insert();
     $InsId=$this->insertID();
     return $InsId;
  }
  public function GetMaster_ngw_reasondelay($Id) {
   $fetchsql = "SELECT `ReasonDelayId`, `ReasonDelayStatus`, `SortOrder`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM ngw_reason_for_delay WHERE ReasonDelayId='$Id'";
   $builder =  $this->db->query($fetchsql);
   return  $builder->getResultArray();
  }

  public function updateMaster_ngw_reasondeviation($id,$Data){
    $this->db->table('ngw_reason_for_deviation')->set($Data)->where('ReasonDeviationId',$id)->update();$InsId=$id;
  return $InsId;
  }
   public function  insertMaster_ngw_reasondeviation($Data){
     $this->db->table('ngw_reason_for_deviation')->set($Data)->insert();
     $InsId=$this->insertID();
     return $InsId;
  }
  public function GetMaster_ngw_reasondeviation($Id) {
   $fetchsql = "SELECT `ReasonDeviationId`, `ReasonDeviation`, `SortOrder`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM ngw_reason_for_deviation WHERE ReasonDeviationId='$Id'";
   $builder =  $this->db->query($fetchsql);
   return  $builder->getResultArray();
  }
 
  public function GetMaster_ngw_fumigation_type($Id) {
   $fetchsql = "SELECT `Fumigation_TypeId`, `Fumigation_Type`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM ngw_fumigation_type WHERE Fumigation_TypeId='$Id'";
   $builder =  $this->db->query($fetchsql);
   return  $builder->getResultArray();
  }

  public function updateMaster_ngw_fumigation_status($id,$Data){
    $this->db->table('ngw_fumigation_status')->set($Data)->where('Fumigation_StatusId',$id)->update();$InsId=$id;
  return $InsId;
  }
   public function  insertMaster_ngw_fumigation_status($Data){
     $this->db->table('ngw_fumigation_status')->set($Data)->insert();
     $InsId=$this->insertID();
     return $InsId;
  }
  public function GetMaster_ngw_fumigation_status($Id) {
   $fetchsql = "SELECT `Fumigation_StatusId`, `Fumigation_Status`, `SortOrder`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM ngw_fumigation_status WHERE Fumigation_StatusId='$Id'";
   $builder =  $this->db->query($fetchsql);
   return  $builder->getResultArray();
  }

  public function updateMaster_ngw_division($id,$Data){
    $this->db->table('ngw_division')->set($Data)->where('divisionid',$id)->update();$InsId=$id;
  return $InsId;
   }
   public function  insertMaster_ngw_division($Data){
     $this->db->table('ngw_division')->set($Data)->insert();
     $InsId=$this->insertID();
     return $InsId;
  }
  public function getMaster_ngw_divisionById($Id) {
   $fetchsql = "SELECT `divisionid`, `divisionname`, `sapdivisioncode`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM ngw_division WHERE divisionid='$Id'";
   $builder =  $this->db->query($fetchsql);
   return  $builder->getResultArray();
  }
      
  public function updateMaster_ngw_fumigation_type($id,$Data){
    $this->db->table('ngw_fumigation_type')->set($Data)->where('Fumigation_TypeId',$id)->update();$InsId=$id;
  return $InsId;
   }
   public function  insertMaster_ngw_fumigation_type($Data){
     $this->db->table('ngw_fumigation_type')->set($Data)->insert();
     $InsId=$this->insertID();
     return $InsId;
  }
  public function getMaster_ngw_fumigation_typeById($Id) {
   $fetchsql = "SELECT `Fumigation_TypeId`, `Fumigation_Type`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM ngw_fumigation_type WHERE Fumigation_TypeId='$Id'";
   $builder =  $this->db->query($fetchsql);
   return  $builder->getResultArray();
  }

  /**** Get Fumigation Entry List On 05-01-2022 ****/
  public function getFumigationEntryData($Id) {
    $fetchsql = "SELECT `Fumigation_TypeId`, `Fumigation_Type`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM ngw_fumigation_type WHERE Fumigation_TypeId='$Id'";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  /**** Update Rental Verification On 06-01-2022 ****/
  public function udpateaRentalStatus($Id,$Data) {
    $this->db->table('warehouse_master')->set($Data)->where('wh_refid',$Id)->update();
    $InsId=$Id;
    return $InsId;
  }

  /*** Get Bank List ***/
  public function getbankmasterlist() {
    $builder = $this->db->query("SELECT bankid as value, bankname as label from `ngw_bankmaster` WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }

  public function getCompanyDetlist() {
    $builder = $this->db->query("SELECT Id as value, Name as label from `master_vendor` WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function getInfestation() {
    $builder = $this->db->query("SELECT Name as value,Name as label FROM `infestation` WHERE 1");
    return  $builder->getResultArray();
  }
  public function bagtype() {
    $builder = $this->db->query("SELECT BAG_REFID as value, BAG_NAME as label FROM `master_bag` where RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function bagtype_new() {
    $builder = $this->db->query("SELECT concat(BAG_NAME, '|',WEIGHT) as label,BAG_REFID as value FROM `master_bag` where RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function bagtype_noloosewheat() {
    $builder = $this->db->query("SELECT BAG_REFID as value, BAG_NAME as label FROM `master_bag`
     where RecStatus='1' and upper(BAG_NAME)<>'LOOSE WHEAT'");
    return  $builder->getResultArray();
  }
  public function bagtype_noloosewheat_wheatweight() {
    $builder = $this->db->query("SELECT BAG_REFID as value, concat(BAG_NAME,'|',WheatWeight) as label FROM `master_bag`
     where RecStatus='1' and upper(BAG_NAME)<>'LOOSE WHEAT'");
    return  $builder->getResultArray();
  }
  public function relottingvendor() {
    $builder = $this->db->query("SELECT id as value, Name as label,RelottingCharge FROM `master_vendor` where RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function getVendor() {
    $builder = $this->db->query("SELECT id as value, Name as label FROM `master_vendor` where RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function relottingreason() {
    $builder = $this->db->query("SELECT Relotreasonid as value,Relotreason as label FROM `ngw_relotreason` WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function getUsers() {
    $builder = $this->db->query("SELECT UI_ID as value,FIRST_NAME as label FROM `user_info` where RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function getMaterialCode($WheatVarietyId){

$Sql = "SELECT MaterialCode SeedVariety FROM `master_mrc_wheat_variety` where id='$WheatVarietyId'";
// echo $Sql;
    $builder = $this->db->query($Sql);
     
    return  $builder->getResultArray();
  }
  public function getLotInformation($LotId, $WheatVarietyId) {
    $Cnd = "";
    if(isset($WheatVarietyId))
    {
      $Cnd.=" and a.wheatvarietyid = '".$WheatVarietyId."'";
    }
// echo "X".$Cnd."X".$WheatVarietyId;
// exit();

// Dijo 01 added a.init_lot_qty in Col 60
$Sql = "SELECT a.wheatqty ,b.WheatVariety,a.wheatvarietyid, a.init_lot_qty
FROM `ngw_sublot` a 
JOIN master_mrc_wheat_variety b on a.wheatvarietyid=b.Id
WHERE a.lotid='$LotId' $Cnd";
// echo $Sql;
    $builder = $this->db->query($Sql);
     
    return  $builder->getResultArray();
  }

  public function getWheatvarietyDet($WarehouseId,$StorageLocationId,$PlantId,$LotId, $WheatVarietyId) {
    $Cnd = "";
    if(isset($WarehouseId))
    {
      $Cnd.=" and (a.warehouseid =  '".$WarehouseId."' or a.warehouseid in (select wh_refid from warehouse_master where wh_code='".$WarehouseId."')) ";
    }
    if(isset($PlantId) && $PlantId!="")
    {
      $Cnd.=" and a.plantid = '".$PlantId."'";
    }
    if(isset($StorageLocationId))
    {
      $Cnd.=" and a.StorageLocationId = '".$StorageLocationId."'";
    }
    if(isset($LotId))
    {
      $Cnd.=" and a.lotid = '".$LotId."'";
    }
    if(isset($WheatVarietyId))
    {
      $Cnd.=" and a.wheatvarietyid = '".$WheatVarietyId."'";
    }
    // echo "X".$Cnd."X".$WheatVarietyId;
    // exit();
    $Sql = "SELECT a.wheatqty ,b.WheatVariety, a.wheatvarietyid
    FROM `ngw_sublot` a 
    JOIN master_mrc_wheat_variety b on a.wheatvarietyid=b.Id
    WHERE a.lotid='$LotId' $Cnd";
    //echo $Sql; exit();
    $builder = $this->db->query($Sql);
     
    return  $builder->getResultArray();
  }

  


  
  

  public function getYESNODET() {
    $builder = $this->db->query("select Id as value, AttachmentValues as label from ngw_rnd_lot_attachmentvalidation");
    return  $builder->getResultArray();
  }
  public function  insertLot($Data){
   //echo "model";
   //var_dump($Data);exit();
    $this->db->table('ngw_lot')->set($Data)->insert();
    $InsId=$this->insertID();

    return $InsId;
   }
   public function updateLot($Id,$Data) {
    // print_r($Data);
    $this->db->table('ngw_lot')->set($Data)->where('lotid',$Id)->update();
    $InsId=$Id;
    return $InsId;
  }

  /*** Update Quality Items ****/
  public function updateWarehouseCreation($Id,$Data) {
    // print_r($Data);
    $this->db->table('warehouse_master')->set($Data)->where('wh_refid',$Id)->update();
    $InsId=$Id;
    return $InsId;
  }
 /* public function updatewarehouseStatus($Id,$Data) {
    // print_r($Data);
    $this->db->table('warehouse_master')->set($Data)->where('wh_refid',$Id)->update();
    $InsId=$Id;
    return $InsId;
  }
*/
    public function getMaster_new_warehouse($Id) {
      $fetchsql = "SELECT wh_refid,wh_code,WH_NAME as wh_name,whaddress,whcity,street,whpincode,
      b.districtname district,a.district as districtid, a.state,whlat,whlong,ownertype,ownername,owneraddress,
      ownerstreet,ownerpincode,ownercity,c.districtname ownerdistrict,a.ownerdistrict as ownerdistrictid,ownerstate,
      ownerfaxnumber,ownerlandlineno,ownermobileno,ownermailid,
      totalcapacityinmts,totalcapacityinsqft,pillarinfo,outsideareacapacitymts,CM_fees,Security_salary,
      outsideareacapacityinsqft,date_format(contractstartdate,'%Y-%m-%d') as contractstartdate,date_format(contractenddate,'%Y-%m-%d') as contractenddate,
      advancevalueaftertds,rentpersqft,rentpermonth,date_format(rentduedate,'%d-%m-%Y') as rentduedate,
      lockingperiodinmonths,noticeperiodinmonths,e.contracttype,a.contracttype as contracttypeid,servicechargespwh,
      bankname,bankbranch,bankcity,d.districtname bankdistrict,a.bankdistrict as bankdistrictid,bankstate,bankpincode,
      bankaccountno,bankifsc,bankaccounttype,wb_count,wb_1_name,wb_2_name,
      wb1_capacity_in_mts,wb2_capacity_in_mts,date_format(wb1_stamping_start_date,'%Y-%m-%d') as wb1_stamping_start_date,date_format(wb2_stamping_start_date,'%Y-%m-%d') as wb2_stamping_start_date,
      date_format(wb1_stamping_expiry_date,'%Y-%m-%d') as wb1_stamping_expiry_date,date_format(wb2_stamping_expiry_date,'%Y-%m-%d') as wb2_stamping_expiry_date,
      wb1_stamping_certificate_attachment,wb2_stamping_certificate_attachment,separate_electric_meters,
      electric_plug_points_inside,electric_light_points_outside,
      electric_light_points_inside,electric_plug_points_outside,drinking_water_facility,
      no_of_fire_extinguisher,borewell_facility,toilet_facility,water_connection,
      year_of_construction,warehouse_security,naga_security,boundary_wall,
      distance_railway_goods_shed,distance_mandi,distance_national_highways,
      distance_fci_procurement_point,distance_state_highways,distance_pucca,
      statutory_survey_type,statutory_type_attachment,license_no_1,license_copy_attachment1,license_no_2,license_copy_attachment2,license_no_3,
      license_copy_attachment3,independent_gate,wall_type,
      shutter_count,plinth,no_of_exits,roof_type,door_count,floor_height,
      wh_photograph_attachment,wh_photograph_attachment1,wh_photograph_attachment2,wh_photograph_attachment3,
      floor_type,window_count,height_from_adj_land,
      inside_road_type,inside_heavy_vehicle_mvmt,inside_no_of_truck_in_capacity,
      repair_work_remarks,date_format(latest_audit_date,'%Y-%m-%d') as latest_audit_date,date_format(next_audit_due_date,'%Y-%m-%d') as next_audit_due_date,audit_type,
      name_of_collateral,name_of_bank,naga_pwh_insurance_no,naga_pwh_insurance_attachment,insurance_covered_amt,insurance_premium_amt,insurance_period,
      date_format(insurance_start_date,'%Y-%m-%d') as insurance_start_date,date_format(insurance_end_date,'%Y-%m-%d') as insurance_end_date,insurance_company,gst_registration,
      company_name,godown_type,contract_agreement_attachment,gst_type,
      effective_from,effective_to,cost_centre,gl_account,a.insby,a.insdt,a.modby,
      a.moddt,a.RecStatus,rejectreason,
      date_format(a.effective_from,'%Y-%m-%d') as effectiveFrmDt,
      date_format(a.effective_to,'%Y-%m-%d') as effectiveToDt,
      date_format(a.insurance_start_date,'%Y-%m-%d') as insuranceStartDt,
      date_format(a.insurance_end_date,'%Y-%m-%d') as insuranceEndDt,
      date_format(a.contractenddate,'%Y-%m-%d') as contractEndDt,
      date_format(a.contractstartdate,'%Y-%m-%d') as contractStartDt,
      date_format(a.rentduedate,'%Y-%m-%d') as rentdueDt,
      
       f.Name as  companyName
       from 
      warehouse_master a left join ngw_state_district b on a.district=b.id 
      left join ngw_state_district c on a.ownerdistrict=c.id 
      left join ngw_state_district d on a.bankdistrict=d.id 
      left join ngw_contract_type e on e.contracttypeid=a.contracttype 
      left join master_vendor f on f.Id=a.company_name 

      where a.RecStatus='1' and a.wh_refid='$Id'";

       //echo $fetchsql;

      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
    }
    
    public function getMaster_new_warehouseLotDetById($Id) {
      $fetchsql = "SELECT a.wh_refid,a.wh_code,WH_NAME as wh_name,whaddress,whcity,street,whpincode,
      a.insby,a.insdt,a.modby, a.moddt,a.RecStatus,
      f.warehouseid , f.plantid , f.locationid , f.lotno , f.maxcapacity , 
      f.totalcapacity , f.length , f.breadth , f.height , f.totalsqft ,f.sRow,f.sColumn,
      concat(g.WERKS,'-',g.PLANT_NAME) plantname,
      concat(h.LGORT,'-', h.STORAGE_LOCATION) locationname,f.AllowedTolerance,
      STORAGE_REFID locationid
      from 
      warehouse_master a left join ngw_state_district b on a.district=b.id 
      left join ngw_state_district c on a.ownerdistrict=c.id 
      left join ngw_state_district d on a.bankdistrict=d.id 
      left join ngw_contract_type e on e.contracttypeid=a.contracttype 
      left join ngw_lot f on f.warehouseid=a.wh_refid 
      left join master_plant g on g.WH_CODE = a.wh_code and g.WH_CODE<>''  and f.plantid=g.ID
      left join master_storage h on h.STORAGE_REFID = f.locationid
      where a.RecStatus='1' and a.wh_refid='$Id'";
      
      //echo $fetchsql;exit();
      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
    }
    
    // Lijesh
    public function GetMaster_ngw_Relotreasonlist()
{
$builder = $this->db->query("select Relotreasonid as value, Relotreason as label from ngw_relotreason");
return  $builder->getResultArray();
}

public function updatengw_Relotreason($id,$Data){
$this->db->table('ngw_relotreason')->set($Data)->where('Relotreasonid',$id)->update();
$InsId=$id;
return $InsId;
 }

 public function insertngw_Relotreason($Data){
  //var_dump($Data );exit();
 $this->db->table('ngw_relotreason')->set($Data)->insert();
 $InsId=$this->insertID();
 return $InsId;
}

public function GetMaster_ngw_Relotreason($Id) {
$fetchsql = "SELECT `Relotreasonid`, `Relotreason`, `InsBy`, `InsDt`, `ModBy`, `ModDt` ,`RecStatus`  FROM `ngw_relotreason` where RecStatus='1' and Relotreasonid='$Id' order by Relotreasonid";
$builder =  $this->db->query($fetchsql);
return  $builder->getResultArray();
}

public function getMaster_ngw_RelotreasonDropDown() {
$fetchsql = "SELECT `Relotreasonid` as value,`Relotreason` as label,`InsBy`,`InsDt`,`ModBy`,`ModDt`,`RecStatus` FROM `ngw_relotreason` where RecStatus='1' order by Relotreasonid";
$builder = $this->db->query($fetchsql);
return  $builder->getResultArray();
}

public function getLotDetails() {
  //lotid lotno
  $fetchsql = "SELECT `lotid` as value,`lotno` as label FROM `ngw_lot` where RecStatus='1' order by label";
  $builder = $this->db->query($fetchsql);
  return  $builder->getResultArray();
}








  public function getWarehousePlanUnPlanList001($postData){
    if(isset($postData->Screen)){
     
      if($postData->Screen=="WEEKLYPLAN")
      { 
        $Cnd="";
        $Cnd.=" a.RecStatus='1'"; 
        if(isset($postData->divisionName) && ($postData->divisionName!="")){
          $Cnd.=" AND l.KeyCompany='".$postData->divisionName."' ";
        }
        if(isset($postData->warehouseid) && ($postData->warehouseid!="")){
          $Cnd.=" AND b.wh_code=$postData->warehouseid ";
        }
        if(isset($postData->plantid) && ($postData->plantid!="")){
          $Cnd.=" AND c.ID=$postData->plantid  ";
        }
        if(isset($postData->locationid) && ($postData->locationid!="")){
          $Cnd.=" AND j.STORAGE_REFID=$postData->locationid ";
        }
        if(isset($postData->lotno) && ($postData->lotno!="")){
          $Cnd.=" AND g.lotid=$postData->lotno  ";
        }
        if(isset($postData->wheatvarietyid) && ($postData->wheatvarietyid!="")){
          $Cnd.=" AND f.Id=$postData->wheatvarietyid ";
        }
      }
  
      if($postData->Screen=="RNDCONFIRMATION"){
        $Cnd=" a.plandate >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')";
      }
    }
  
    $fetchsql ="SELECT
                  a.plandate,
                  DATE_FORMAT(a.plandate, '%M') AS PlanMonth,
                  a.Priority, 
                  g.lotno as lotno,
                  b.WH_NAME AS wh_name,
                  c.PLANT_NAME AS plant_name,
                  f.WheatVariety AS WheatvarietyName,
                  DATE_FORMAT(h.degassingdate,'%d-%m-%Y') AS Next_QC_date,
                  DATE_FORMAT(h.nextfumigationdate,'%d-%m-%Y') AS Next_Fumigation_Date,
                  a.wheatvarityid,
                  j.STORAGE_LOCATION AS storage_location,
                  a.ReceivingBin AS ReceivingBinId,
                  i.BulksiloNo AS ReceivingBinNo,
                  l.KeyCompany AS division,
                  h.SAP_Qty,
                  h.wheatqty,
                  k.ReceivingBin,
                  
                  @Reserved_Stock :=( SELECT SUM(IF((ManualReleaseQty > 0),ManualReleaseQty,planqty))
                                      FROM ngw_weeklyplan wp
                                      WHERE (wp.wheatvarityid,wp.fromplantid,wp.fromlocationid,wp.fromlotid) =
                                            (a.wheatvarityid,a.fromplantid,a.fromlocationid,a.fromlotid) 
                                      AND wp.plandate >= DATE_FORMAT(CURRENT_DATE,'%Y-%m-01')) as Reserved_Stock, 
                
                
                  @Movement_Qty =(  SELECT SUM(IF(MovementQty IS NULL,0,MovementQty))
                                    FROM ngw_weeklyplan_actual wpa
                                    WHERE (wpa.WheatVarietyId,wpa.PlantId,wpa.StorageLocationId,wpa.LotId)=
                                          (a.wheatvarityid,a.fromplantid,a.fromlocationid,a.fromlotid) 
                                    AND wpa.MovementDate >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) as Movement_Qty,
  
                  @Movement_Qty - h.wheatqty AS Diff_for_Mvmt_Qty_SAP_QTY, a.Expected_Arrival, a.Purchase_Plan, 'RD' Release_Division,
                  0 AS QC_Cleared_Qty, 0 Fumi_Cleared_Qty, 0 Keyloan_Cleared_Qty
                  ,'S1' as status
                FROM
                  `ngw_weeklyplan` a
                JOIN warehouse_master b ON a.fromwarehouseid = b.wh_code
                JOIN master_plant c ON a.fromplantid = c.ID
                JOIN master_storage j ON a.fromlocationid = j.STORAGE_REFID
                JOIN master_mrc_wheat_variety f ON a.wheatvarityid = f.Id
                JOIN ngw_lot g ON a.fromlotid = g.lotid 
                  AND g.plantid = c.ID 
                  AND g.locationid = j.STORAGE_REFID
                JOIN ngw_sublot h ON a.fromlotid = h.lotid
                JOIN pp_bulksilono i ON a.ReceivingBin = i.Id
                JOIN pp_bulksilono k ON a.ReceivingBin = k.Id
                JOIN ngw_keyloan_pledge l ON g.lotno = l.lotno
                WHERE ".$Cnd." ORDER BY planid";
  
      // echo $fetchsql; exit();
      $builder =  $this->db->query($fetchsql);
      return $builder->getResultArray();
    }
  
        /* update Weekly Plan data # Arularasu A 28-05-2022 */
        public function updatePlanList($Id , $Data, $Length ) {

          //var_dump($Data);exit();
          $resID =false;
          for ($i=0;$i<$Length;$i++){      
            $Priority = (isset($Data[$i]->Priority) && $Data[$i]->Priority!="")? $Data[$i]->Priority:"0";
            $MovementQty = (isset($Data[$i]->Movement_Qty) && $Data[$i]->Movement_Qty!="")? $Data[$i]->Movement_Qty:"0";
            $ReleaseQty = (isset($Data[$i]->Release_Qty) && $Data[$i]->Release_Qty!="")?$Data[$i]->Release_Qty:"0";
            $Status =1;
    
            $updateSql = "UPDATE ngw_weeklyplan SET Priority ='".$Priority."', planqty ='".$MovementQty."', ManualReleaseQty ='".$ReleaseQty."', Status = '".$Status."' WHERE planid ='".$Data[$i]->planid."'";
            //echo $updateSql; exit();
            $this->db->query($updateSql);
            $resID = true;
          }
          return $resID;
        }

//********************************************************************** */
    // ** IAS Flow
    public function getLastMileTransportVendor() {
      $builder = $this->db->query("SELECT Id AS value, Name AS label FROM `master_vendor` WHERE Category ='Last Mile Transporter' AND RecStatus='1'");
      return  $builder->getResultArray();
    }

    public function getLoadingVendor() {
      $builder = $this->db->query("SELECT Id AS value, Name AS label FROM `master_vendor` WHERE Category ='Loading Vendor' AND RecStatus='1'");
      return  $builder->getResultArray();
    }

    public function getReceivingBin() {
      $builder = $this->db->query("SELECT BulksiloNo AS label, Id AS value FROM pp_bulksilono");
      return  $builder->getResultArray();
    }

    public function getBagCuttingCharges($Vendor_Id){
      $builder = $this->db->query("SELECT BagCuttingCharge FROM master_vendor WHERE Id='".$Vendor_Id."'");
      return  $builder->getResultArray();
    }

    public function getVendorwithCharges() { //concat(BAG_NAME, '|',WEIGHT) as label
      $builder = $this->db->query("SELECT id as value, concat(Name, '|', BagCuttingCharge) as label FROM `master_vendor` where RecStatus='1'");
      return  $builder->getResultArray();
    }

    

    public function getPODetails1($PO_Id){
      $builder = $this->db->query("SELECT * FROM ias_purchase_info WHERE id='".$PO_Id."'");
      return  $builder->getResultArray();
    }

    /********************************** */

    public function getDeliveryBypass($postData){
      //for($i=0;$i<=3;$i++){
      $builder = $this->db->query("SELECT ias_DeliveryNo_Bypass_Flag as ias_deliveryno_bypass_flag FROM pp_setting WHERE id ='1'");
      //echo $this->db->getLastQuery();
      $ans = $builder->getResultArray();
      $retval = $ans[0]['ias_deliveryno_bypass_flag'];
     // echo "X ". $ans[0]['ias_DeliveryNo_Bypass_Flag']. " Y";
    //  echo "X".$postData->mode."X";
      if($postData->mode==="SET"){
        // echo "IN";
      if ($retval == "YES"){
        $strQuery = "UPDATE pp_setting SET ias_DeliveryNo_Bypass_Flag = 'NO' WHERE id ='1'";
        $retval="NO";
      }else if ($retval == "NO"){
        $strQuery = "UPDATE pp_setting SET ias_DeliveryNo_Bypass_Flag = 'YES' WHERE id ='1'";
        $retval="YES";
      }
      // echo $strQuery;
      $builder = $this->db->query($strQuery);
      }
      $ans[0]['ias_deliveryno_bypass_flag']=$retval;
    //}
      return $ans;

    }

 

    

    public function getArrayPosVal($paramArray, $Pos){
        if (isset($paramArray[$Pos])){
          return $paramArray[$Pos];
        }else{
          return '';
        }
    }


    public function getVANumber(){
      $builder = $this->db->query("SELECT VA_No AS label, VA_No AS value FROM ias_purchase_info Where RecStatus ='1'");
      return  $builder->getResultArray();
    }

    public function getSendingPlant(){
      $sql ="SELECT distinct concat(b.werks, ' - ' ,b.PLANT_NAME) AS label, a.SendingPlant AS value 
      FROM intrastate_warhouse_dispatch_info a 
      JOIN master_plant b ON a.SendingPlant = b.werks
      WHERE a.RecStatus ='1'";
      
      //echo $sql;

      $builder = $this->db->query($sql);
      return  $builder->getResultArray();
    }

    public function getReceivingPlant(){
      $sql ="SELECT distinct concat(b.werks, ' - ' ,b.PLANT_NAME) AS label, a.ReceivingPlant AS value 
      FROM intrastate_warhouse_dispatch_info a 
      JOIN master_plant b ON a.ReceivingPlant = b.werks
      WHERE a.RecStatus ='1'";
      
      //echo $sql;

      $builder = $this->db->query($sql);
      return  $builder->getResultArray();
    }

    public function getVehicleNO(){
      $sql = "SELECT distinct TruckNo AS label, TruckNo AS value 
      FROM intrastate_warhouse_dispatch_info WHERE RecStatus ='1'";
      
      // echo $sql;

      $builder = $this->db->query($sql);
      return  $builder->getResultArray();
    }
    
    public function getUnloadingVendor() { 
      $builder = $this->db->query("SELECT id as value, Name as label FROM `master_vendor` where RecStatus='1' and Category ='Unloading Vendor'");
      return  $builder->getResultArray();
    }

    public function getLotNoBySegment($Seg1,$Seg2,$Seg3){
      $cnd ="";
      if (isset($Seg1) && $Seg1 != ""){
        $cnd = " AND b.Segment IN('$Seg1')";
      }
      if ((isset($Seg1) && $Seg1 != "") && (isset($Seg2) && $Seg2 != "")){
        $cnd = " AND b.Segment IN('$Seg1','$Seg2')";
      }
      if ((isset($Seg1) && $Seg1 != "") && (isset($Seg2) && $Seg2 != "") && (isset($Seg2) && $Seg2 != "")){
        $cnd = " AND b.Segment IN('$Seg1','$Seg2','$Seg3')";
      }

      $strQuery = "SELECT lotno AS label,  lotid AS value
                   FROM `ngw_sublot`   a
                   JOIN master_mrc_wheat_variety b ON b.id = a.wheatvarietyid
                   WHERE RecStatus = '1' $cnd" ;

      $builder = $this->db->query($strQuery);
      return  $builder->getResultArray();
    }

    public function getSegmentId($Seg1,$Seg2,$Seg3){
      $strQuery = "SELECT Id FROM `master_mrc_wheat_variety` 
                  WHERE Segment IN('$Seg1','$Seg2','$Seg3')";
      
      $builder = $this->db->query($strQuery);
      return  $builder->getResultArray();
    }

    

    

}
