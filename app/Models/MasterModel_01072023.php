<?php 
namespace App\Models;
use CodeIgniter\Model;

class MasterModel extends Model
{
  public function getLastMileTransporter(){
    $builder = $this->db->query("select distinct Name as label, Code as value from master_vendor pp where Category= 'Last Mile Transporter'");
    return  $builder->getResultArray();
  }

  public function getReceivingBin(){
    $builder = $this->db->query("select BulksiloNo as label, id as value from pp_bulksilono");
    return  $builder->getResultArray();
  }
 
  public function getReceivingBin_1(){
    $builder = $this->db->query("select ReceivingBin as label, Id as value from pp_receivingbin");
    return  $builder->getResultArray();
  }

  public function getBulkSiloNo(){
    $builder = $this->db->query("select BulksiloNo as label, BulksiloNo as value from pp_bulksilono");
    return  $builder->getResultArray();
  }
  public function getIntraLoadingVendor(){   
    $builder = $this->db->query("select distinct Name as label, Code as value from master_vendor pp where Category= 'Loading Vendor'");
    return  $builder->getResultArray();
  }
  public function getLoadingLotNo(){   
    $builder = $this->db->query("SELECT fromlotno as label,fromlotno as value FROM `ngw_weeklyplan` WHERE RecStatus='1'");
    return  $builder->getResultArray();
  }
  public function getIntraUnLoadingVendor(){   
    $builder = $this->db->query("select distinct Name as label, Code as value from master_vendor pp where Category= 'Unloading Vendor'");
    return  $builder->getResultArray();
  }
  public function getTicketNo() {
    $mdl = new SiloWbModel();
    return  $mdl->getTicketNo();
  }
  public function getWarehouse() {
     $fetchsql = "select WH_CODE as value, WH_NAME as label from warehouse_master order by WH_NAME";
    
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }  

 

  public function getBagType() {
    $fetchsql = "select BAG_REFID as value, BAG_CODE as bagCode, BAG_NAME as label, UOM as uom, WEIGHT as weight from master_bag order by BAG_NAME";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }
  //EAD Master
  public function updateEad($id,$Data){
   $this->db->table('ead')->set($Data)->where('id',$id)->update();
 return $id;
  }
  public function  insertEad($Data){
    // var_dump($this->db->table('ead')->insert($Data));
    $this->db->table('ead')->set($Data)->insert();
    $InsId=$this->insertID();
    return $InsId;
 }
 public function getEad($Id) {
  $fetchsql = "SELECT id, date, From_Location, To_Location, Mode_Of_Transport, EAD, InsBy, InsDt, ModBy, ModDt, RecStatus FROM ead WHERE id='$Id'";
  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
}
//Master BAG
public function updateMasterBag($id,$Data){
  $this->db->table('master_bag')->set($Data)->where('BAG_REFID',$id)->update();
return $id;
 }
 public function  insertMasterBag($Data){
   // var_dump($this->db->table('ead')->insert($Data));
   $this->db->table('master_bag')->set($Data)->insert();
   $InsId=$this->insertID();
   
   return $InsId;
}
public function getMasterBag($Id) {
 $fetchsql = "SELECT `BAG_REFID`, `BAG_CODE`, `BAG_NAME`, `UOM`, `WEIGHT`, `InsBy`, `InsDt`, `ModBy`, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM master_bag WHERE BAG_REFID='$Id'";
 $builder =  $this->db->query($fetchsql);
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
 
//Master From Location
public function updateMasterFromLocation($id,$Data){
  if($this->getMasterfromlocationDuplicateChk($Data->description, $id)=="0")
{
  $this->db->table('master_from_location')->set($Data)->where('id',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertMasterFromLocation($Data){
  if($this->getMasterfromlocationDuplicateChk($Data->description)=="0")
{
   $this->db->table('master_from_location')->set($Data)->insert();
   $InsId=$this->insertID();
}
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMasterFromLocation($Id) {
 $fetchsql = "SELECT `id`, `city`, `state`, `description`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM master_from_location WHERE id='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}
//Plant Master
 public function updatePlant($id,$Data){
  if($this->getMasterPlantDuplicateChk($Data->WERKS, $id)=="0")
{
  $this->db->table('master_plant')->set($Data)->where('ID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertPlant($Data){
  if($this->getMasterPlantDuplicateChk($Data->WERKS)=="0")
{
   $this->db->table('master_plant')->set($Data)->insert();
   $InsId=$this->insertID(); 
   }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getPlant($Id) {
 $fetchsql = "SELECT a.`ID`, `WERKS`, `PLANT_NAME`, concat(a.`WH_CODE`, '-', b.`WH_NAME`) as WH_NAME, a.`WH_CODE`, a.`InsBy`, a.`InsDt`, a.`ModBy`, a.`ModDt`, a.`RecStatus` FROM `master_plant` a, `warehouse_master` b WHERE a.WH_CODE=b.WH_CODE and a.RecStatus='1' and a.ID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_inco
public function updatemaster_inco($id,$Data){
  if($this->getMasterIncoDuplicateChk($Data->INCO_TERMS, $id)=="0")
{
  $this->db->table('master_inco')->set($Data)->where('INCO_REFID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_inco($Data){
  if($this->getMasterIncoDuplicateChk($Data->INCO_TERMS)=="0")
{
   $this->db->table('master_inco')->set($Data)->insert();
   $InsId=$this->insertID();
   }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getINCO_DetailsByRefId($Id) {
 $fetchsql = "SELECT `INCO_REFID`, `INCO_TERMS`, `INCO_DESC`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM `master_inco` WHERE RecStatus='1' and INCO_REFID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_port_of_discharge
 public function updateMaster_port_of_discharge($id,$Data){
  if($this->getMasterPortofdischargeDuplicateChk($Data->Name, $id)=="0")
{
  $this->db->table('master_port_of_discharge')->set($Data)->where('Id',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertMaster_port_of_discharge($Data){
  if($this->getMasterPortofdischargeDuplicateChk($Data->Name)=="0")
{
   $this->db->table('master_port_of_discharge')->set($Data)->insert();
   $InsId=$this->insertID();
   }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_port_of_dischargeDetailsById($Id) {
 $fetchsql = "SELECT `Id`, `Name`, `InsBy`, `InsDt`, `ModBy`, `ModDt`, `RecStatus` FROM `master_port_of_discharge` WHERE RecStatus='1' and Id='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_port_of_loading
 public function updatemaster_port_of_loading($id,$Data){
  if($this->getMasterPortofloadingDuplicateChk($Data->Name, $id)=="0")
{
  $this->db->table('master_port_of_loading')->set($Data)->where('Id',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_port_of_loading($Data){
  if($this->getMasterPortofloadingDuplicateChk($Data->Name)=="0")
{
   $this->db->table('master_port_of_loading')->set($Data)->insert();
   $InsId=$this->insertID();
   }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getmaster_port_of_loadingDetailsById($Id) {
 $fetchsql = "SELECT `Id`, `Name`, `InsBy`, `InsDt`, `ModBy`,if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM `master_port_of_loading` WHERE RecStatus='1' and Id='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_privilege
 public function updatemaster_privilege($id,$Data){
  if($this->getMasterPrivilegeDuplicateChk($Data->PRIVILEGE_NAME, $id)=="0")
{
  $this->db->table('master_privilege')->set($Data)->where('ID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_privilege($Data){
  if($this->getMasterPrivilegeDuplicateChk($Data->PRIVILEGE_NAME)=="0")
   {
   $this->db->table('master_privilege')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getmaster_privilegeDetailsById($Id) {
 $fetchsql = "SELECT `ID`, `PRIVILEGE_NAME`, `PRIVILEGE_DESC`, `InsBy`, `InsDt`, `ModBy`, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM `master_privilege` WHERE RecStatus='1' and ID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_quality_check
 public function updatemaster_quality_check_OLD($id,$Data){
  if($this->getMasterQualityCheckDuplicateChk($Data->MIC, $id)=="0")
{
  $this->db->table('master_quality_check')->set($Data)->where('QCM_REFID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function updatemaster_quality_check($id,$Data){
 
  $this->db->table('master_quality_check')->set($Data)->where('QCM_REFID',$id)->update();
  $InsId=$id;
  
 
  return $InsId;
 }
 public function  insertmaster_quality_check($Data){
  if($this->getMasterQualityCheckDuplicateChk($Data->MIC)=="0")
  {
   $this->db->table('master_quality_check')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_quality_checkById($Id) {
 $fetchsql = "SELECT `QCM_REFID`, `MIC`,`MIC_DESC`,`UOM`,`MIN_VALUE`,`MAX_VALUE`,`nir_yes`,`nir_no`,`nir_foss`,`surveyor`,`IDNLF`,`FIELD_MAP`,`input_type`, `InsBy`, `InsDt`, `ModBy`, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM `master_quality_check` WHERE RecStatus='1' and QCM_REFID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

public function getMaster_quality_check_Wheat_ById($Id) {
  $fetchsql = "SELECT WheatVariety,Id FROM `master_mrc_wheat_variety` where Id='$Id'";
  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
 }

 public function getMaster_quality_checkList_ByName($WheatVariety) {
  $fetchsql = "SELECT QCM_REFID,MIC,MIC_DESC,UOM,MIN_VALUE,MAX_VALUE,DeductionSpec FROM `master_quality_check`  where IDNLF='".$WheatVariety."'";
  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
 }

//master_quality_preferred
 public function updatemaster_quality_perferred($id,$Data){
  if($this->getMasterQualitypreferredDuplicateChk($Data->FieldMap, $id)=="0")
{
  $this->db->table('master_quality_preferred')->set($Data)->where('Id',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_quality_perferred($Data){
  if($this->getMasterQualitypreferredDuplicateChk($Data->FieldMap)=="0")
   {
   $this->db->table('master_quality_preferred')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getmaster_quality_perferredDetailsById($Id) {
 $fetchsql = "SELECT `Id`, `FieldMap`, `PreferredMin`, `PreferredMax`, `FieldOrder`, `InsBy`, `InsDt`, `ModBy`, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM `master_quality_preferred` WHERE RecStatus='1' and Id='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_role
 public function updatemaster_role($id,$Data){
  if($this->getMasterRoleDuplicateChk($Data->ROLE_NAME, $id)=="0")
{
  $this->db->table('master_role')->set($Data)->where('RM_REFID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_role($Data){
  if($this->getMasterRoleDuplicateChk($Data->ROLE_NAME)=="0")
  {
   $this->db->table('master_role')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_roleDetailsById($Id) {
 $fetchsql = "SELECT a.`RM_REFID`, a.`ROLE_NAME`, a.`ROLE_STATUS`,b.label as ACTIVELABEL, a.`InsBy`, a.`InsDt`, a.`ModBy`, 
 if(a.`ModDt` is null,'',a.ModDt) as ModDt, a.`RecStatus` FROM `master_role` a, activestatus b WHERE b.ListGroup='G1' and a.ROLE_STATUS=b.id and 
 a.RecStatus='1' and a.RM_REFID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_screen
 public function updatemaster_screen($id,$Data){
  if($this->getMasterScreenDuplicateChk($Data->SCREEN_NAME, $id)=="0")
{
  $this->db->table('master_screen')->set($Data)->where('ID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_screen($Data){
  if($this->getMasterScreenDuplicateChk($Data->SCREEN_NAME)=="0")
  {
   $this->db->table('master_screen')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_screenDetailsById($Id) {
 $fetchsql = "SELECT a.`ID`, a.`SCREEN_NAME`, a.`SCREEN_DESC`, a.`PRIORITY`, a.`DISABLED`, b.label ACTIVELABEL,b.id ACTIVE, a.`InsBy`, a.`InsDt`, a.`ModBy`, if(a.`ModDt` is null,'',a.ModDt) as ModDt, a.`RecStatus` FROM `master_screen` a, activestatus b WHERE b.ListGroup='G2' and a.DISABLED=b.id and a.RecStatus='1' and a.ID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_storage
 public function updatemaster_storage($id,$Data){
  if($this->getMasterStorageDuplicateChk($Data->LGORT, $id)=="0")
{
  $this->db->table('master_storage')->set($Data)->where('STORAGE_REFID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_storage($Data){
  if($this->getMasterStorageDuplicateChk($Data->LGORT)=="0")
  {
   $this->db->table('master_storage')->set($Data)->insert();
   $InsId=$this->insertID();
} 
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_storageDetailsById($Id) {
 $fetchsql = "SELECT `STORAGE_REFID`, `LGORT`, `STORAGE_LOCATION`, `InsBy`, `InsDt`, `ModBy`, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM `master_storage` WHERE RecStatus='1' and STORAGE_REFID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_to_location
 public function updatemaster_to_location($id,$Data){
  if($this->getMastertolocationDuplicateChk($Data->location, $id)=="0")
{
  $this->db->table('master_to_location')->set($Data)->where('id',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function insertmaster_to_location($Data){
  if($this->getMastertolocationDuplicateChk($Data->location)=="0")
 {
   $this->db->table('master_to_location')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_to_locationDetailsById($Id) {
 $fetchsql = "SELECT a.`id`, a.`location`, a.`plantId`, concat(a.plantId,'-', b.PLANT_NAME) PLANT_NAME, a.`InsBy`, a.`InsDt`, a.`ModBy`, if(a.`ModDt` is null,'',a.ModDt) as ModDt, 
 a.`RecStatus` FROM `master_to_location` a, master_plant b WHERE a.plantId=b.WERKS and a.RecStatus='1' and a.id='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_user_plant
 public function updatemaster_user_plant($id,$Data){
  if($this->getMasteruserplantDuplicateChk($Data->USER_ID, $Data->PLANT_ID, $id)=="0")
{
  $this->db->table('master_user_plant')->set($Data)->where('ID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_user_plant($Data){
  if($this->getMasteruserplantDuplicateChk($Data->USER_ID, $Data->PLANT_ID)=="0")
  {
   $this->db->table('master_user_plant')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_userplantDetailsById($Id) {
 $fetchsql = "SELECT a.`ID`, a.`USER_ID`, a.`PLANT_ID`,c.LOGIN_ID, concat(WERKS,'-',PLANT_NAME) as PLANT_NAME,  a.`InsBy`, a.`InsDt`, a.`ModBy`, if(a.`ModDt` is null,'',a.ModDt) as ModDt, a.`RecStatus` ".
 " FROM `master_user_plant` a, master_plant b, user_info c ".
 " WHERE a.USER_ID=c.UI_ID and a.PLANT_ID = b.ID and a.RecStatus='1' and a.ID='$Id'";
 $builder =  $this->db->query($fetchsql);
 //return  $fetchsql;
 return  $builder->getResultArray();
}

//master_user_privilege
 public function updatemaster_user_privilege($id,$Data){
  if($this->getMasteruserprivilegeDuplicateChk($Data->USER_ID, $Data->PRIVILEGE_ID, $id)=="0")
{
  $this->db->table('master_user_privilege')->set($Data)->where('ID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_user_privilege($Data){
  if($this->getMasteruserprivilegeDuplicateChk($Data->USER_ID, $Data->PRIVILEGE_ID)=="0")
  {
   $this->db->table('master_user_privilege')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_user_privilegeDetailsById($Id) {
 $fetchsql = "SELECT a.`ID`, a.`USER_ID`, a.`PRIVILEGE_ID`, c.LOGIN_ID, a.`ACTIVE`,e.label as ACTIVELABEL, a.`InsBy`, a.`InsDt`, a.`ModBy`, ".
 " if(a.`ModDt` is null,'',a.ModDt) as ModDt, a.`RecStatus`, b.PRIVILEGE_NAME FROM `master_user_privilege` a, master_privilege b, user_info c, activestatus e WHERE e.ListGroup = 'G1' and a.PRIVILEGE_ID = b.ID and a.ACTIVE=e.id and a.USER_ID=c.UI_ID and a.RecStatus='1' and a.ID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_user_screen
 public function updatemaster_user_screen($id,$Data){
  if($this->getMasteruserscreenDuplicateChk($Data->USER_ID, $Data->SCREEN_ID, $id)=="0")
{
  $this->db->table('master_user_screen')->set($Data)->where('ID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_user_screen($Data){
  if($this->getMasteruserscreenDuplicateChk($Data->USER_ID, $Data->SCREEN_ID)=="0")
  {
   $this->db->table('master_user_screen')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_user_screenDetailsById($Id) {
 $fetchsql = "SELECT a.`ID`, a.`USER_ID`, a.`SCREEN_ID`,  c.LOGIN_ID,  d.SCREEN_NAME, a.`InsBy`, a.`InsDt`, a.`ModBy`, ".
 " if(a.`ModDt` is null,'',a.ModDt) as ModDt, a.`RecStatus` FROM `master_user_screen` a, user_info c, master_screen d WHERE a.SCREEN_ID = d.ID and a.USER_ID=c.UI_ID and a.RecStatus='1' and a.ID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_vendor
 public function updatemaster_vendor($id,$Data){
  if($this->getMastervendorDuplicateChk($Data->Code, $id)=="0")
{
  $this->db->table('master_vendor')->set($Data)->where('Id',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_vendor($Data){
  if($this->getMastervendorDuplicateChk($Data->Code)=="0")
  {
   $this->db->table('master_vendor')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_vendorDetailsById($Id) {
 $fetchsql = "SELECT `Id`, `Code`, `Name`, `Category`, `InsBy`, `InsDt`, `ModBy`, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM `master_vendor` WHERE RecStatus='1' and Id='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_vessel
 public function updatemaster_vessel($id,$Data){
  if($this->getMastervesselDuplicateChk($Data->VESSEL_NAME, $id)=="0")
{
  $this->db->table('master_vessel')->set($Data)->where('VESSEL_REFID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_vessel($Data){
  if($this->getMastervesselDuplicateChk($Data->VESSEL_NAME)=="0")
  {
   $this->db->table('master_vessel')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_vesselDetailsById($Id) {
  //$fetchsql = "SELECT a.`ID`, a.`SCREEN_NAME`, a.`SCREEN_DESC`, a.`PRIORITY`, a.`DISABLED`, b.label ACTIVELABEL,b.id ACTIVE, a.`InsBy`, a.`InsDt`, a.`ModBy`, if(a.`ModDt` is null,'',a.ModDt) as ModDt, a.`RecStatus` FROM `master_screen` a, activestatus b WHERE b.ListGroup='G2' and a.DISABLED=b.id and a.RecStatus='1' and a.ID='$Id'";
 $fetchsql = "SELECT a.`VESSEL_REFID`, a.`VESSEL_NAME`, a.`VESSES_STATUS` as ACTIVE, b.label ACTIVELABEL, a.`InsBy`, a.`InsDt`, a.`ModBy`,
  if(a.`ModDt` is null,'',a.ModDt) as ModDt, a.`RecStatus` FROM `master_vessel` a, activestatus b WHERE b.ListGroup='G2' and a.VESSES_STATUS=b.id and
   a.RecStatus='1' and a.VESSEL_REFID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//master_wheat_variety
 public function updatemaster_wheat_variety($id,$Data){
  if($this->getMasterwheatvarietyDuplicateChk($Data->name, $id)=="0")
{
  $this->db->table('master_wheat_variety')->set($Data)->where('id',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmaster_wheat_variety($Data){
  if($this->getMasterwheatvarietyDuplicateChk($Data->name)=="0")
  {
   $this->db->table('master_wheat_variety')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getMaster_wheat_varietyDetailsById($Id) {
 $fetchsql = "SELECT `id`, `name`, `InsBy`, `InsDt`, `ModBy`, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM `master_wheat_variety` WHERE RecStatus='1' and id='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//module_master
 public function updatemodule_master($id,$Data){
  if($this->getMastermoduleDuplicateChk($Data->MODULE_ID, $id)=="0")
{
  $this->db->table('module_master')->set($Data)->where('MODULE_REFID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertmodule_master($Data){
  if($this->getMastermoduleDuplicateChk($Data->MODULE_ID)=="0")
  {
   $this->db->table('module_master')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getModule_masterDetailsById($Id) {
 $fetchsql = "SELECT `MODULE_REFID`, `MODULE_ID`, `SCREEN_NAME`,  `InsBy`, `InsDt`, `ModBy`, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM `module_master` WHERE RecStatus='1' and MODULE_REFID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}


//user_info
 public function updateuser_info($id,$Data){
  if($this->getMasteruserinfoDuplicateChk($Data->LOGIN_ID, $id)=="0")
{
  
  $this->db->table('user_info')->set($Data)->where('UI_ID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertuser_info($Data){
  if($this->getMasteruserinfoDuplicateChk($Data->LOGIN_ID)=="0")
  {
   $this->db->table('user_info')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getUser_infoDetailsById($Id) {
 $fetchsql = "SELECT a.`UI_ID`, a.`FIRST_NAME`, a.`LOGIN_ID`, a.`SI_NO`, a.`DESIGNATION`,c.ROLE_NAME, a.`DEPARTMENT`, a.`CITY`, a.`STATE`, 
 a.`USER_ROLE_ID`, a.`USER_STATUS`,b.label ACTIVELABEL, a.`InsBy`, a.`InsDt`, a.`ModBy`, if(a.`ModDt` is null,'',a.ModDt) as ModDt, a.`RecStatus` 
 FROM `user_info` a, master_role c, activestatus b WHERE c.RM_REFID=a.USER_ROLE_ID and b.ListGroup='G1' and a.USER_STATUS=b.id and a.RecStatus='1' and a.UI_ID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//warehouse_master
 public function updatewarehouse_master($id,$Data){
  if($this->getMasterwarehouseDuplicateChk($Data->WH_CODE, $id)=="0")
{
  $this->db->table('warehouse_master')->set($Data)->where('WH_REFID',$id)->update();$InsId=$id;
  }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
return $InsId;
 }
 public function  insertwarehouse_master($Data){
  if($this->getMasterwarehouseDuplicateChk($Data->WH_CODE)=="0")
  {
   $this->db->table('warehouse_master')->set($Data)->insert();
   $InsId=$this->insertID();
 }
 else{
   $InsId=-5; //-5 Means Duplicate record exists
 }
   return $InsId;
}
public function getWarehouse_masterDetailsById($Id) {
 $fetchsql = "SELECT `WH_REFID`, `WH_CODE`, `WH_NAME`, `InsBy`, `InsDt`, `ModBy`, if(`ModDt` is null,'',ModDt) as ModDt, `RecStatus` FROM `warehouse_master` WHERE RecStatus='1' and WH_REFID='$Id'";
 $builder =  $this->db->query($fetchsql);
 return  $builder->getResultArray();
}

//Master From Location
public function getMasterfromlocationDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and id <> '".$id."'";
  }
  $fetchsql = "SELECT `id` FROM master_from_location WHERE description='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//Plant Master
public function getMasterPlantDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and ID <> '".$id."'";
  }
  $fetchsql = "SELECT `ID` FROM master_plant WHERE WERKS='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_inco
public function getMasterIncoDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and INCO_REFID <> '".$id."'";
  }
  $fetchsql = "SELECT `INCO_REFID` FROM master_inco WHERE INCO_TERMS='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_port_of_discharge
public function getMasterPortofdischargeDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and Id <> '".$id."'";
  }
  $fetchsql = "SELECT `Id` FROM master_port_of_discharge WHERE Name='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_port_of_loading
public function getMasterPortofloadingDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and Id <> '".$id."'";
  }
  $fetchsql = "SELECT `Id` FROM master_port_of_loading WHERE Name='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_privilege
public function getMasterPrivilegeDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and ID <> '".$id."'";
  }
  $fetchsql = "SELECT `ID` FROM master_privilege WHERE PRIVILEGE_NAME='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_quality_check
public function getMasterQualityCheckDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and QCM_REFID <> '".$id."'";
  }
  $fetchsql = "SELECT `QCM_REFID` FROM master_quality_check WHERE MIC='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_quality_preferred
public function getMasterQualitypreferredDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and Id <> '".$id."'";
  }
  $fetchsql = "SELECT `Id` FROM master_quality_preferred WHERE FieldMap='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_role
public function getMasterRoleDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and RM_REFID <> '".$id."'";
  }
  $fetchsql = "SELECT `RM_REFID` FROM master_role WHERE ROLE_NAME='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_screen
public function getMasterScreenDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and ID <> '".$id."'";
  }
  $fetchsql = "SELECT `ID` FROM master_screen WHERE SCREEN_NAME='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_storage
public function getMasterStorageDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and STORAGE_REFID <> '".$id."'";
  }
  $fetchsql = "SELECT `STORAGE_REFID` FROM master_storage WHERE LGORT='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_to_location
public function getMastertolocationDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and id <> '".$id."'";
  }
  $fetchsql = "SELECT `id` FROM master_to_location WHERE location='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_user_plant
public function getMasteruserplantDuplicateChk($code,$code1="",$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and ID <> '".$id."'";
  }
  $fetchsql = "SELECT `ID` FROM master_user_plant WHERE USER_ID='$code' and PLANT_ID='$code1' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }


//master_user_privilege
public function getMasteruserprivilegeDuplicateChk($code,$code1="",$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and ID <> '".$id."'";
  }
  $fetchsql = "SELECT `ID` FROM master_user_privilege WHERE USER_ID='$code' and PRIVILEGE_ID='$code1' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_user_screen
public function getMasteruserscreenDuplicateChk($code,$code1="",$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and ID <> '".$id."'";
  }
  $fetchsql = "SELECT `ID` FROM master_user_screen WHERE USER_ID='$code' and SCREEN_ID='$code1' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_vendor
public function getMastervendorDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and Id <> '".$id."'";
  }
  $fetchsql = "SELECT `Id` FROM master_vendor WHERE Code='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_vessel
public function getMastervesselDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and VESSEL_REFID <> '".$id."'";
  }
  $fetchsql = "SELECT `VESSEL_REFID` FROM master_vessel WHERE VESSEL_NAME='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//master_wheat_variety
public function getMasterwheatvarietyDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and id <> '".$id."'";
  }
  $fetchsql = "SELECT `id` FROM master_wheat_variety WHERE name='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//module_master
public function getMastermoduleDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and MODULE_REFID <> '".$id."'";
  }
  $fetchsql = "SELECT `MODULE_REFID` FROM module_master WHERE MODULE_ID='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//user_info
public function getMasteruserinfoDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and UI_ID <> '".$id."'";
  }
  $fetchsql = "SELECT `UI_ID` FROM user_info WHERE LOGIN_ID='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }

//warehouse_master
public function getMasterwarehouseDuplicateChk($code,$id="") {
  //print_r($code);
  $cnd="";
  if($id!="")
  {
    $cnd.=" and WH_REFID <> '".$id."'";
  }
  $fetchsql = "SELECT `WH_REFID` FROM warehouse_master WHERE WH_CODE='$code' ".$cnd;
  //print_r($fetchsql);
  $builder =  $this->db->query($fetchsql);
    
  return count($builder->getResultArray());
 }
 //change VH Status
 public function ChangeVHStatus($id,$Data){
  $this->db->table('purchase_info')->set($Data)->where('PI_REFID',$id)->update();
  return $id;
 }
 public function ChangeVHStatusIAS_IRS($id,$Data){
//   var_dump($Data);
  $this->db->table('empty_vehicle_arrival')->set($Data)->where('ID',$id)->update();
  return $id;
 }

 //warehouse_master
 public function UpdateWeight($id,$Data,$Table){

  
  $this->db->table($Table)->set($Data)->where('Id',$id)->update();
  $InsId=$id;
 
return $InsId;
 }
 public function  InsertWeight($Data,$Table){
 
   $this->db->table($Table)->set($Data)->insert();
   $InsId=$this->insertID();

   return $InsId;
}
//
public function UpdateQualityCheck($id,$Data){
//var_dump($Data);
//exit();
  $this->db->table('master_quality_check')->set($Data)->where('QCM_REFID',$id)->update();
  $InsId=$id;
 
return $InsId;
 }
 public function  InsertQualityCheck($Data){
 //var_dump($Data);
 //exit();
   $this->db->table('master_quality_check')->set($Data)->insert();
   $InsId=$this->insertID();
 
   return $InsId;
}

}