<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class RndlotConversionModel extends Model
{
  

  public function updateSublot($sub_lot_id,$Data){
//var_dump($Data);
    $this->db->table('ngw_sublot')->set($Data)->where('sub_lot_id',$sub_lot_id)->update();
    $InsId=$sub_lot_id;
    return $InsId;
   }
   public function updatefumigation($FumigationId,$Data){
    //var_dump($Data);
        $this->db->table('ngw_fumigation')->set($Data)->where('FumigationId',$FumigationId)->update();
        $InsId=$FumigationId;
        return $InsId;
       }
   public function  insertFumigation($Data){
   
     $this->db->table('ngw_fumigation')->set($Data)->insert();
     $InsId=$this->insertID();
 
     return $InsId;
    }
   public function getParameters(){
    $fetchsql="SELECT rnd_lot_parametermasterid,parametername FROM `ngw_rnd_lot_parametermaster` where RecStatus='1'  
    ";
  
    //echo $fetchsql;exit();
  
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function getRndLotParameterDetails($Data){
    $Cnd="";
    if(isset($Data->FromDate) && $Data->FromDate!=""){
      $Cnd.=" AND date(rnddate)>=date('".$Data->FromDate."')";
    }
    if(isset($Data->ToDate)  && $Data->ToDate!=""){
      //$Cnd.=" AND date(rnddate)<='".$Data->ToDate."'";
      $Cnd.=" AND date(rnddate)<=DATE_ADD(date('".$Data->ToDate."'), INTERVAL 1 DAY)";
    }
    if(isset($Data->PlantId)  && $Data->PlantId!=""){
      $Cnd.=" AND plantid='".$Data->PlantId."'";
    }
    if(isset($Data->WheatVarietyId)  && $Data->WheatVarietyId!=""){
      $Cnd.=" AND Wheatvarietyid='".$Data->WheatVarietyId."'";
    }
    if(isset($Data->warehouseId)  && $Data->warehouseId!=""){
      $Cnd.=" AND warehouseid='".$Data->warehouseId."'";
    }
    if(isset($Data->StorageLocationId)  && $Data->StorageLocationId!=""){
      $Cnd.=" AND locationid='".$Data->StorageLocationId."'";
    }
    
    $fetchsql="SELECT a.*, b.parametertype
    FROM `ngw_rnd_lot_conversion_det` a
    JOIN ngw_rnd_lot_parametermaster b ON a.ParamId=b.rnd_lot_parametermasterid
    WHERE a.RecStatus='1' AND  rnd_lot_conversion_id 
    IN(SELECT rnd_lot_conversion_id FROM `ngw_rnd_lot_conversion` 
    WHERE RecStatus='1' ".$Cnd.") ";
  
    //echo $fetchsql;exit();
  
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
   }


  public function getRndLotParameterDet($Data){
    $Cnd="";
    if(isset($Data->FromDate) && $Data->FromDate!=""){
      $Cnd.=" AND date(a.rnddate)>=date('".$Data->FromDate."')";
    }
    if(isset($Data->ToDate)  && $Data->ToDate!=""){
      $Cnd.=" AND date(a.rnddate)<=DATE_ADD(date('".$Data->ToDate."'), INTERVAL 1 DAY)";
      
    }
    if(isset($Data->PlantId)  && $Data->PlantId!=""){
      $Cnd.=" AND a.plantid='".$Data->PlantId."'";
    }
    if(isset($Data->WheatVarietyId)  && $Data->WheatVarietyId!=""){
      $Cnd.=" AND a.Wheatvarietyid='".$Data->WheatVarietyId."'";
    }
    if(isset($Data->warehouseId)  && $Data->warehouseId!=""){
      $Cnd.=" AND a.warehouseid='".$Data->warehouseId."'";
    }
    if(isset($Data->StorageLocationId)  && $Data->StorageLocationId!=""){
      $Cnd.=" AND a.locationid='".$Data->StorageLocationId."'";
    }

    if(isset($Data->Search)  && $Data->Search!=""){
      $Cnd.=" AND (
        b.WH_NAME like '%".$Data->Search."%'
        OR c.PLANT_NAME like '%".$Data->Search."%'
        OR d.WheatVariety like '%".$Data->Search."%'
        OR a.lotno like '%".$Data->Search."%'
        OR CONCAT(e.LGORT,a.lotno,date_format(a.rnddate,'%d%m%Y'),'R',a.qano) like '%".$Data->Search."%'
        )";
    }

    $fetchsql="SELECT a.* ,b.WH_NAME,c.PLANT_NAME,d.WheatVariety,e.STORAGE_LOCATION as StorageLocationName,
                e.LGORT as LocName, date_format(a.rnddate,'%d-%m-%Y') as RNDDate,
                CONCAT(e.LGORT,a.lotno,date_format(a.rnddate,'%d%m%Y'),'R',a.qano) as rndQANo

    FROM `ngw_rnd_lot_conversion` a
    JOIN warehouse_master b ON a.warehouseid=b.wh_code
    JOIN master_plant c ON a.plantid=c.ID
    JOIN master_storage e ON a.locationid=e.STORAGE_REFID
    JOIN master_mrc_wheat_variety d ON a.Wheatvarietyid=d.Id
    WHERE a.RecStatus='1' ".$Cnd."   
    ";
    
      //echo $fetchsql;exit();
      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
  }
  
  public function getRndLotconversionDet($Data){
      $Cnd="";
      if(isset($Data->search) && $Data->search!=""){
        $Cnd=" and ( a.qano like '%".$Data->search."%'
        OR b.WH_NAME like '%".$Data->search."%'
        OR c.PLANT_NAME like '%".$Data->search."%'
        OR d.WheatVariety like '%".$Data->search."%'
OR a.lotno like '%".$Data->search."%'
OR a.rndconfirmqty like '%".$Data->search."%'
OR a.fumigationclearedqty like '%".$Data->search."%'
OR a.keyloandoqty like '%".$Data->search."%'
)        ";
      }
      $fetchsql="SELECT a.* ,b.WH_NAME,c.PLANT_NAME,d.WheatVariety,date_format(a.rnddate,'%d-%m-%y') as RNDDate
      FROM `ngw_rnd_lot_conversion` a
      JOIN warehouse_master b ON a.warehouseid=b.wh_code
      JOIN master_plant c ON a.plantid=c.ID
      JOIN master_mrc_wheat_variety d ON a.Wheatvarietyid=d.Id
      WHERE a.RecStatus='1' and a.SublotId='".$Data->id."' ".$Cnd."
     
      ";
    
      //echo $fetchsql;exit();
    
      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
    }


    public function RndSkip($Data){

      $Dt_Sql ="SELECT DATE_ADD(CURDATE(), INTERVAL 7 DAY) AS SkipDt";
      $builder =  $this->db->query($Dt_Sql);
      $Dt = $builder->getResultArray();
      
      // echo $Data->Data->FumigationSkipDate;
      // $Data->Data->FumigationSkipDate=$Dt[0]['fumiDt'];
      //var_dump($Data->Data); exit();
      // $this->db->table('ngw_sublot')->set($Data->Data)->where('sub_lot_id',$Data->id)->update();

      $sublot_details = $this->db->table('ngw_sublot')->where('sub_lot_id',$Data->id)->get();

    $sublot_data = $sublot_details->getResultArray();

    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");


    $fumigation = array(
      'sub_lot_id'=>$sublot_data[0]['sub_lot_id'],
      'warehouse_id'=>$sublot_data[0]['warehouseid'],
      'plant_id'=>$sublot_data[0]['plantid'],
      'storage_id'=>$sublot_data[0]['StorageLocationId'],
      'lot_id'=>$sublot_data[0]['lotid'],
      'wheat_variety_id'=>$sublot_data[0]['wheatvarietyid'],
      'skip_qty'=>$sublot_data[0]['wheatqty'],
      'skip_flag'=>'2',
      'skip_date'=>$Dt[0]['SkipDt'],
      'skip_status'=>'1',
      'created_by'=>$SessionUser,
      'created_at'=>$CurrentDateTime,
      'skip_remarks'=>$Data->Data->RndSkipRemarks
    );


    $data = $this->db->table('view_fumigation_rnd_skip')->set($fumigation)->insert();
  
      $sql = "UPDATE ngw_sublot SET RndSkipRemarks ='".$Data->Data->RndSkipRemarks."', 
                                    RndSkipFlag = '".$Data->Data->RndSkipFlag."', 
                                    RndSkipDate ='".$Dt[0]['SkipDt']."' WHERE sub_lot_id ='".$Data->id."'";
  
                  // echo $sql;
      $builder =  $this->db->query($sql);
      $InsId=$Data->id;
      return $InsId;
    }

    public function getLotConvertionDetails($Data){
      $Cnd="";
      if(isset($Data->Data->warehouseid->value)){
        $Cnd.="  AND  b.wh_code='".$Data->Data->warehouseid->value."'";
      }
      if(isset($Data->Data->locationid->value)){
        $Cnd.="  and a.plantid='".$Data->Data->locationid->value."' ";
      }
      if(isset($Data->Data->wheatvarietyid->value)){
        $Cnd.="   and a.wheatvarietyid='".$Data->Data->wheatvarietyid->value."' ";
      }
      if(isset($Data->Data->storagelocationid->value)){
        $Cnd.="   and a.locationid='".$Data->Data->storagelocationid->value."' ";
      }

      if(isset($Data->sSearch) && $Data->sSearch!=""){
        $Cnd.=" AND (c.WheatVariety like '%".$Data->sSearch."%' OR CONCAT(f.LGORT,e.lotno,DATE_FORMAT(a.rnddate, '%d%m%Y'),'R',a.qano) like '%".$Data->sSearch."%')";
      }

  /*$fetchsql="SELECT 
  a.rnd_lot_conversion_id, a.sublotid, a.qano,b.wh_refid as warehouseid, a.warehouseid as wh_code, a.plantid, a.locationid, 
  a.lotid, a.lotno, a.wheatvarietyid, a.rndconfirmqty, a.fumigationclearedqty, a.keyloandoqty, a.rnddate
   ,c.WheatVariety as WheatVarietyName,
  TIMESTAMPDIFF(Day,rndlotconversiondate,CURRENT_DATE) as RNDAgeing, 
  a.rndconfirmqty as wheatqty, e.sub_lot_id
  FROM 
  ngw_rnd_lot_conversion a 
  JOIN warehouse_master b ON a.warehouseid=b.wh_code
  JOIN master_mrc_wheat_variety c ON a.wheatvarietyid=c.Id
  JOIN master_plant d ON a.plantid=d.ID
  JOIN `ngw_sublot` e ON a.lotid = e.lotid
  WHERE a.RecStatus='1' ".$Cnd."";
  */

  $fetchsql ="SELECT
                a.rnd_lot_conversion_id,
                e.sub_lot_id,
                a.qano,
                b.wh_refid AS warehouseid,
                e.warehouseid AS wh_code,
                e.plantid,
                e.StorageLocationId,
                e.lotid,
                e.lotno,
                e.wheatvarietyid,
                a.rndconfirmqty,
                a.fumigationclearedqty,
                a.keyloandoqty,
                a.rnddate,
                c.WheatVariety AS WheatVarietyName,
                CONCAT(f.LGORT,e.lotno,DATE_FORMAT(a.rnddate, '%d%m%Y'),'R',a.qano) AS rndQANO,
                TIMESTAMPDIFF(DAY, a.rnddate, CURRENT_DATE) AS RNDAgeing,
                a.rndconfirmqty AS wheatqty,
                
                IF(a.rnd_lot_conversion_id IS NULL,'Pending',
                  IF(TIMESTAMPDIFF(DAY, a.rnddate, CURRENT_DATE) > 90,'Elapsed','Completed')
                ) AS rndStatus
              FROM
                (
                    `ngw_sublot` e
                JOIN warehouse_master b ON
                    e.warehouseid = b.wh_refid
                JOIN master_mrc_wheat_variety c ON
                    e.wheatvarietyid = c.Id
                JOIN master_plant d ON
                    e.plantid = d.ID
                JOIN master_storage f ON
                    e.StorageLocationId = f.STORAGE_REFID
                )
              LEFT JOIN ngw_rnd_lot_conversion a ON
                e.last_rnd_lot_conversion_id = a.rnd_lot_conversion_id
              WHERE
                e.RecStatus = '1'".$Cnd."";

  //echo $fetchsql;exit();

  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
}

public function getPvsRndId($Data){
  
$Cnd="";
if(isset($Data->sub_lot_id) && $Data->sub_lot_id!=""){
$Cnd.=" and a.sub_lot_id='".$Data->sub_lot_id."' ";
}
if(isset($Data->Data->QaNo) && $Data->Data->QaNo!=""){
  $Cnd.=" and a.qano='".$Data->Data->QaNo."' ";
  }
  $fetchsql="SELECT rnd_lot_conversion_id,date_format(rnddate,'%d-%m-%Y') as RndDt, keyloandoqty,
  warehousename, plant_name, lotno, storage_location, wheatvariety, qano, LGORT,
  CONCAT(LGORT,lotno,date_format(rnddate,'%d%m%Y'),'R',qano) as rndQANo, rndconfirmqty
  from view_rnd_lot_conversion a
  WHERE (a.warehouseid='".$Data->Data->warehouseid->value."' or a.warehouse_autoid='".$Data->Data->warehouseid->value."') 
  and a.plantid='".$Data->Data->plantid->value."' 
  and a.lotid='".$Data->Data->lotid->value."'
  and a.Wheatvarietyid='".$Data->Data->wheatvarietyid->value."' 
   
  
  and a.RecStatus='1' ".$Cnd."
  Order by rnddate DESC,InsDt DESC LIMIT 5 ";

  //echo $fetchsql;exit();

  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
}
public function getPvsRndDet($Data){
  $Ids="";
  for($i=0;$i<sizeof($Data);$i++){
    $Ids.="'".$Data[$i]['rnd_lot_conversion_id']."',";
  }
  $Ids=rtrim($Ids,",");
  //echo $Ids;

  $fetchsql="SELECT a.*,b.parametertype 
  FROM `ngw_rnd_lot_conversion_det` a
  JOIN ngw_rnd_lot_parametermaster b ON a.ParamId=b.rnd_lot_parametermasterid
  where rnd_lot_conversion_id IN($Ids) ORDER by ParamId ASC";
//echo $fetchsql;exit();
  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();

}
   public function getRndDetail($QaNo){
    // echo "test";exit();
//var_dump($postData);exit();

$fetchsql="SELECT rnd_lot_conversion_id,date_format(rnddate,'%d-%m-%Y') as RndDt FROM 
`ngw_rnd_lot_conversion` 
WHERE RecStatus='1' ";
$builder =  $this->db->query($fetchsql);
  $List=$builder->getResultArray();
  $Count=count($List);
  if($QaNo==""){
    $fetchsql="SELECT max(rnd_lot_conversion_id) as No FROM 
    `ngw_rnd_lot_conversion` 
    WHERE RecStatus='1' ";
    $builder =  $this->db->query($fetchsql);
      $List1=$builder->getResultArray();
     // var_dump($List1);exit();
      $QaNo=$List1[0]['No']+1;
  }
  
   $fetchsql="SELECT *,'$QaNo' as QaNo,'' as Param_Attach,'' as Param_Attach_attach,'' as Attachment,
   '' as ParamValue FROM `ngw_rnd_lot_parametermaster` where RecStatus='1' order by sortorderno";

  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
   }
   
  
   public function saverndConversion($Data){
    $this->db->table('ngw_rnd_lot_conversion')->set($Data)->insert();
    $InsId=$this->insertID();
    return $InsId;
   }

  public function saverndConversion_det($Data){
    // echo(sizeof($Data));
    //var_dump($Data);
    $InsId =0;
    if (sizeof($Data)>0){
      $this->db->table('ngw_rnd_lot_conversion_det')->set($Data)->insert();
      $InsId=$this->insertID();
      $InsId =1;
    }
    return $InsId;
  }

  public function getSublotlist_withPlant($Data,$WheatID){
    $fetchsql="SELECT a.*,
     IF((a.Keyloan_Pledge_Date>0),(a.Keyloan_Release_Qty),a.wheatqty) as Unpledgeqty,
     IF((a.fumigationstatus='2'),a.wheatqty,0) as Fumigationlockqty,
     IF(TIMESTAMPDIFF(MONTH,date(rndlotconversiondate),CURRENT_DATE)>3,a.wheatqty,0) as Rndreleasedqty 
    FROM `ngw_sublot` a
    JOIN  warehouse_master b ON a.warehouseid=b.wh_refid
    where a.RecStatus='1' 
    and b.wh_code='".$Data->CheckList->warehouseid->value."' 
    and plantid='".$Data->CheckList->plantid->value."' 
    
    and lotid='".$Data->CheckList->lotid->value."' 
    and wheatvarietyid='".$WheatID."'";

$builder =  $this->db->query($fetchsql);
return $builder->getResultArray();
   }

   public function master_mrc_wheat_varietyID($Data){
    $fetchsql="SELECT Id
    FROM `master_mrc_wheat_variety` 
    where Segment='".$Data."'";
    // $fetchsql = "SELECT Id FROM `master_mrc_wheat_variety` WHERE `Segment` LIKE '$Data'";
    $builder =  $this->db->query($fetchsql);
    return $builder->getResultArray();
   }

   public function getSublotlist($Data){
    $fetchsql="SELECT a.*,
     IF((a.Keyloan_Pledge_Date>0),(a.Keyloan_Release_Qty),a.wheatqty) as Unpledgeqty,
     IF((a.fumigationstatus='2'),a.wheatqty,0) as Fumigationlockqty,
     IF(TIMESTAMPDIFF(MONTH,date(rndlotconversiondate),CURRENT_DATE)>3,a.wheatqty,0) as Rndreleasedqty 
    FROM `ngw_sublot` a
    JOIN  warehouse_master b ON a.warehouseid=b.wh_refid
    where a.RecStatus='1' 
    and b.wh_code='".$Data->CheckList->warehouseid->value."' 
    and plantid='".$Data->CheckList->locationid->value."' 
    and lotid='".$Data->CheckList->lotid->value."' 
    and wheatvarietyid='".$Data->CheckList->wheatvarietyid->value."'";
$builder =  $this->db->query($fetchsql);
return $builder->getResultArray();
  }

  public function getSublotRnd($Data){

    //echo $Data->Screen; exit();

    $Cnd="";
    if(isset($Data->Data->warehouseid->value)){
      $Cnd.=" and b.wh_code='".$Data->Data->warehouseid->value."' ";
    }
    if(isset($Data->Data->plantid->value)){
      $Cnd.=" and a.plantid='".$Data->Data->plantid->value."'  ";
    }
    if(isset($Data->Data->lotid->value)){
      $Cnd.=" and a.lotid='".$Data->Data->lotid->value."'  ";
    }
    if(isset($Data->Data->wheatvarietyid->value)){
      $Cnd.="  and a.wheatvarietyid='".$Data->Data->wheatvarietyid->value."' ";
    }
    if(isset($Data->Data->locationid->value)){
      $Cnd.=" and a.StorageLocationId='".$Data->Data->locationid->value."' ";
    }
    
    if($Data->Screen=="RNDSKIPREPORT"){
      $Cnd.=" AND RndSkipFlag='1'";
    }else if($Data->Screen=="RNDSKIPSCREEN"){
      $Cnd.=" AND a.fumigationstatus !=9";
    }else{
      $Cnd.=" AND TIMESTAMPDIFF(MONTH,date(a.rndlotconversiondate),CURRENT_DATE)<3";
    }
    $fetchsql="SELECT a.*,
                      b.WH_NAME,
                      c.PLANT_NAME,
                      d.STORAGE_LOCATION,
                      e.WheatVariety,
                      Date_Format(a.RndSkipDate,'%Y-%m-%d') AS RndSkipDate,
                      IF((a.RndSkipDate IS NULL),1,if(Date(a.RndSkipDate) < CURRENT_DATE,1,0)) as RnDSkipEnableFlag,
                      @countRow := @countRow + 1 AS rowId
                FROM `ngw_sublot` a
                JOIN (SELECT @countRow := -1) tmp
                JOIN warehouse_master b ON a.warehouseid=b.wh_refid
                JOIN master_plant c ON a.plantid=c.ID
                JOIN master_storage d ON a.StorageLocationId=d.STORAGE_REFID
                JOIN master_mrc_wheat_variety e ON a.wheatvarietyid=e.Id
                WHERE a.RecStatus='1 '$Cnd";
                
    //echo $fetchsql;exit();
    $builder =  $this->db->query($fetchsql);
    return $builder->getResultArray();
  }

  
   public function getCurrentStockRnd($Data){

    $Cnd="";
    if(isset($Data->warehouseid->value)){
      $Cnd.=" and (b.wh_refid='".$Data->warehouseid->value."' or b.wh_code='".$Data->warehouseid->value."')";
    }
    if(isset($Data->plantid->value)){
      $Cnd.=" and a.plantid='".$Data->plantid->value."'  ";
    }
    if(isset($Data->lotid->value)){
      $Cnd.=" and a.lotid='".$Data->lotid->value."'  ";
    }
    if(isset($Data->wheatvarietyid->value)){
      $Cnd.="  and a.wheatvarietyid='".$Data->wheatvarietyid->value."' ";
    }
    if(isset($Data->locationid->value)){
      $Cnd.=" and a.StorageLocationId='".$Data->locationid->value."' ";
    }
    
    if($Data->Screen=="RNDSKIPREPORT"){
      $Cnd.=" AND RndSkipFlag='1'";
    }else{
      //$Cnd.="  AND TIMESTAMPDIFF(MONTH,date(a.rndlotconversiondate),CURRENT_DATE)<3";
    }
     //var_dump($Data);
    //$fetchsql="SELECT a.*,b.WH_NAME,c.PLANT_NAME,d.STORAGE_LOCATION,e.WheatVariety
    $fetchsql="SELECT a.wheatqty, a.SAP_Qty,b.WH_NAME,c.PLANT_NAME,d.STORAGE_LOCATION,e.WheatVariety
    FROM `ngw_sublot` a
    JOIN warehouse_master b ON a.warehouseid=b.wh_refid
    JOIN master_plant c ON a.plantid=c.ID
    JOIN master_storage d ON a.StorageLocationId=d.STORAGE_REFID
    JOIN master_mrc_wheat_variety e ON a.wheatvarietyid=e.Id
    WHERE a.RecStatus='1' $Cnd";
    // echo $fetchsql;exit();
    $builder =  $this->db->query($fetchsql);
    return $builder->getResultArray();
   }
   
  
}
