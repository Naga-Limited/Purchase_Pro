<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class FumigationModel extends Model
{

  public function updateSublot($sub_lot_id,$Data){
    //echo "test 003";
  //  var_dump($Data); exit();
    $this->db->table('ngw_sublot')->set($Data)->where('sub_lot_id',$sub_lot_id)->update();
    //echo $this->db->getLastQuery();
    $InsId=$sub_lot_id;
    return $InsId;
   }

   public function updatefumigation($FumigationId,$Data){
    // var_dump($Data); exit();
        $this->db->table('ngw_fumigation')->set($Data)->where('FumigationId',$FumigationId)->update();
        $InsId=$FumigationId;
        return $InsId;
       }
   public function  insertFumigation($Data){
   
     $this->db->table('ngw_fumigation')->set($Data)->insert();
     //echo $this->db->getLastQuery(); exit();
     $InsId=$this->insertID();
 
     return $InsId;
    }

   public function getStockDetails($locationid,$lotid,$warehouseid){
     //echo "test";exit();
    $fetchsql = "SELECT a.* ,c.WheatVariety,d.PLANT_NAME,b.WH_NAME,b.wh_code
    FROM `ngw_sublot` a 
    JOIN warehouse_master b ON a.warehouseid=b.wh_refid
    JOIN master_mrc_wheat_variety c ON a.wheatvarietyid=c.Id
    JOIN master_plant d ON a.plantid=d.ID
    where a.lotid='$lotid' and a.plantid='$locationid' and b.wh_code='$warehouseid' 
    and concat(a.lotid,'-',a.plantid,'-',a.warehouseid,'-',a.wheatvarietyid) 
    NOT IN(SELECT concat(lotid,'-',plantid,'-',warehouseid,'-',Wheat_Variety_Id) FROM `ngw_physical_stock` where Status='1')
    
    order by a.sub_lot_id";
    //echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
   }


   public function getfumigationlist($postData){
      // echo "test";exit();
   
//$Cnd=" and  a.approvestatus='1'";
   if(isset($postData->Screen)){
   
    if($postData->Screen=="FUMIGATIONQCTEAM"){
     $Cnd=" and a.SublotId='".$postData->sub_lot_id."' AND  a.Fumigation_Status='2'";
    }

    if($postData->Screen=="FUMIGATIONENTRYLIST"){
      $Cnd=" and  a.Status='1'";
     }
  }

  if(isset($postData->Data)){
    if(isset($postData->Data->FromDate)){
     $Cnd.=" and  date(a.InsDt)>='".$postData->Data->FromDate."'";
    }
    if(isset($postData->Data->ToDate)){
     $Cnd.=" and  date(a.InsDt)<='".$postData->Data->ToDate."'";
    }
    if(isset($postData->Data->warehouseid)){
     $Cnd.=" and  c.WH_CODE='".$postData->Data->warehouseid->value."'";
    }
    if(isset($postData->Data->locationid)){
     $Cnd.=" and  c.ID='".$postData->Data->locationid->value."'";
    }
    if(isset($postData->Data->lotid)){
     $Cnd.=" and  a.lotid='".$postData->Data->lotid->value."'";
    }
    if(isset($postData->Data->KeyWheatVariety)){
     $Cnd.=" and  a.wheatvarietyid='".$postData->Data->KeyWheatVariety->value."'";
    }
  }
  if(isset($postData->sub_lot_id)){
   $Cnd.=" and  a.SublotId='".$postData->sub_lot_id."'";
  }

     $fetchsql = "SELECT a.*,b.WH_NAME ,c.PLANT_NAME,d.WheatVariety,e.*,
     f.Fumigation_Type as Last_Fumi_Type, k.wheatqty,k.PP_to_SAP_Sync_Flag,
     date_format(a.Last_Fumigated_date,'%d-%m-%Y') as LastFumigatnDt,
     date_format(a.Last_Degassed_date,'%d-%m-%Y') as LastDegasDt,
     date_format(a.Next_Due_Date,'%d-%m-%Y') as NextFumigatnDt,
     TIMESTAMPDIFF(DAY,a.Next_Due_Date,CURRENT_TIMESTAMP) as FumigationLapsed,
     TIMESTAMPDIFF(DAY,a.Last_Degassed_date,CURRENT_TIMESTAMP) as DegasLapsed,g.ReasonDelayStatus,
     h.BAG_NAME,i.Fumigation_Type,j.Name,m.Fumigation_Status as fumigationstatus, n.FIRST_NAME as Fumigator_Name,
     (SELECT COUNT(1) FROM `ngw_fumigation`
      WHERE SublotId = k.sub_lot_id AND RecStatus = '1' AND Fumigation_Type IN(
          SELECT Fumigation_TypeId FROM `ngw_fumigation_type` WHERE Fumigation_Type = 'ALP')) AS ALPCount,l.STORAGE_LOCATION as StorageLocationName
     
      FROM `ngw_fumigation` a
     JOIN warehouse_master b ON a.warehouseid=b.wh_refid
     JOIN master_plant c ON a.plantid=c.ID
     JOIN master_storage l ON a.locationid=l.STORAGE_REFID
     JOIN master_mrc_wheat_variety d ON a.wheatvarietyid=d.Id
     JOIN ngw_lot e ON a.lotid=e.lotid
     LEFT JOIN ngw_fumigation_type f ON a.Last_Fumigation_Type=f.Fumigation_TypeId
     LEFT JOIN ngw_reason_for_delay g ON a.`Reason_for_Delay`=g.ReasonDelayId
     LEFT JOIN master_bag h ON a.`Bag_Type`=h.BAG_REFID
     LEFT JOIN ngw_fumigation_type i ON a.`Fumigation_Type`=i.Fumigation_TypeId
     LEFT JOIN master_vendor j ON a.Vendor_Name=j.Id
     LEFT JOIN ngw_fumigation_status m ON a.Fumigation_Status=m.Fumigation_StatusId
     LEFT JOIN user_info n ON a.Fumigator_Name=n.UI_ID
     JOIN ngw_sublot k ON a.FumigationId=k.last_fumigation_id

     where a.RecStatus='1'  ".$Cnd."";
   

 
//echo $fetchsql;
// exit();
  $builder =  $this->db->query($fetchsql);
  return  $builder->getResultArray();
   }
   public function UpdateNextDueDate_Degass($Id){
    // $fetchsql = "UPDATE  `ngw_sublot` a JOIN master_bag b ON a.bagtypeid=b.BAG_REFID 
    // SET a.nextfumigationdate = date(DATE_ADD(a.Lastdegassingdate, INTERVAL (b.FumigationValidity+b.DegassingDays) DAY))
    // where date(a.nextfumigationdate)<>date(DATE_ADD(a.Lastdegassingdate, INTERVAL (b.FumigationValidity+b.DegassingDays) DAY)) 
    // and a.CompletionStatus='1' and a.RecStatus='1' and a.sub_lot_id='$Id'";

$fetchsql = "UPDATE  `ngw_sublot` a JOIN master_bag b ON a.bagtypeid=b.BAG_REFID 
SET a.nextfumigationdate = date(DATE_ADD(a.Lastdegassingdate, INTERVAL (b.FumigationValidity) DAY))
where date(a.nextfumigationdate)<>date(DATE_ADD(a.Lastdegassingdate, INTERVAL (b.FumigationValidity+b.DegassingDays) DAY)) 
and a.CompletionStatus='1' and a.RecStatus='1' and a.sub_lot_id='$Id'";

    //echo $fetchsql;exit();
    $builder =  $this->db->query($fetchsql);

    $fetchsql = "UPDATE  `ngw_sublot` a JOIN master_bag b ON a.bagtypeid=b.BAG_REFID 
    SET a.degassingdate= date(DATE_ADD(a.nextfumigationdate, INTERVAL b.FumigationDays DAY))
    where date(a.degassingdate)<>date(DATE_ADD(a.nextfumigationdate, INTERVAL FumigationDays DAY)) 
    and a.CompletionStatus='1' and a.RecStatus='1'  and a.sub_lot_id='$Id'";
   $builder =  $this->db->query($fetchsql);
   }
   public function UpdateNextDueDate_Fumigation($Id,$Fumigation_TypeId){

    $fetchsql1 = "SELECT a.*
        FROM `ngw_fumigation_type` a 
        where a.Fumigation_TypeId='$Fumigation_TypeId'
        and a.RecStatus = 1 and a.degassing_days > 0";
    $builder1 =  $this->db->query($fetchsql1);
    $builder1 = $builder1->getResultArray();
    $decasting_days = $builder1[0]['degassing_days'];

    if ($decasting_days) {
      $intervalDays = $decasting_days; // Use the provided `$decasting_days` value
    } else {
        $intervalDays = 'b.FumigationDays'; // Use the column `b.FumigationDays`
    }

    $fetchsql = "UPDATE  `ngw_sublot` a JOIN master_bag b ON a.bagtypeid=b.BAG_REFID 
    SET a.nextfumigationdate = date(DATE_ADD(a.lastfumigationdate, INTERVAL (b.FumigationValidity+$intervalDays+b.DegassingDays) DAY))
    where date(a.nextfumigationdate)<>date(DATE_ADD(a.lastfumigationdate, INTERVAL (b.FumigationValidity+$intervalDays+b.DegassingDays) DAY)) 
    and a.CompletionStatus='1' and a.RecStatus='1' and a.sub_lot_id='$Id'";
        // echo $fetchsql;exit();

    $builder =  $this->db->query($fetchsql);

    $fetchsql = "UPDATE  `ngw_sublot` a JOIN master_bag b ON a.bagtypeid=b.BAG_REFID
    SET a.degassingdate= date(DATE_ADD(a.lastfumigationdate, INTERVAL $intervalDays DAY))
    where date(a.degassingdate)<>date(DATE_ADD(a.lastfumigationdate, INTERVAL $intervalDays DAY)) 
    and a.CompletionStatus='1' and a.RecStatus='1'  and a.sub_lot_id='$Id'";
   $builder =  $this->db->query($fetchsql);

  }

  public function updateSublotDet(){
    return;
    $fetchsql = "update `ngw_sublot` set fumigationstatus='4' where  
    TIMESTAMPDIFF(day,degassingdate,CURRENT_TIMESTAMP) BETWEEN -5 AND 0 AND 
    fumigationstatus<>'4' and RecStatus='1' and CompletionStatus='1'";
    $builder =  $this->db->query($fetchsql);

    $fetchsql = "UPDATE `ngw_sublot` a 
    JOIN master_bag b ON a.bagtypeid=b.BAG_REFID
    set a.fumigationstatus='9' where  
    TIMESTAMPDIFF(day,a.Lastdegassingdate,CURRENT_TIMESTAMP)>b.DegassingDays 
    and CompletionStatus='1' and a.RecStatus='1'  and fumigationstatus='5'";
    $builder =  $this->db->query($fetchsql);

    $fetchsql = "update `ngw_sublot` set fumigationstatus='6' where 
    TIMESTAMPDIFF(day,degassingdate,CURRENT_TIMESTAMP) > 0 AND
    fumigationstatus<>'6' and RecStatus='1' and CompletionStatus='1'";
    $builder =  $this->db->query($fetchsql);

    $fetchsql = "update `ngw_sublot` set fumigationstatus='3' where 
    TIMESTAMPDIFF(day,nextfumigationdate,CURRENT_TIMESTAMP) > 0 AND
    fumigationstatus<>'3' and RecStatus='1' and CompletionStatus='1'";
    $builder =  $this->db->query($fetchsql);

    $fetchsql = "update `ngw_sublot` set fumigationstatus='1' where  
    TIMESTAMPDIFF(day,nextfumigationdate,CURRENT_TIMESTAMP) BETWEEN -5 AND 0 AND 
    fumigationstatus<>'1' and RecStatus='1' and CompletionStatus='1'";
    $builder =  $this->db->query($fetchsql);

   

    /*$fetchsql = "UPDATE  `ngw_sublot` a JOIN master_bag b ON a.bagtypeid=b.BAG_REFID 
    SET a.nextfumigationdate= date(DATE_ADD(a.Lastdegassingdate, INTERVAL b.FumigationValidity DAY))
    where date(a.nextfumigationdate)<>date(DATE_ADD(a.Lastdegassingdate, INTERVAL FumigationValidity DAY)) 
    and a.CompletionStatus='1' and a.RecStatus='1'";
    $builder =  $this->db->query($fetchsql);

    $fetchsql = "UPDATE  `ngw_sublot` a JOIN master_bag b ON a.bagtypeid=b.BAG_REFID 
    SET a.degassingdate= date(DATE_ADD(a.lastfumigationdate, INTERVAL b.FumigationDays DAY))
    where date(a.degassingdate)<>date(DATE_ADD(a.lastfumigationdate, INTERVAL FumigationDays DAY)) 
    and a.CompletionStatus='1' and a.RecStatus='1'";
    $builder =  $this->db->query($fetchsql);*/
  }

  public function getSublotlist($postData){

    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionRole = $_SESSION['USERROLE'];

   if(isset($postData->Screen)){
     if($postData->Screen=="UNLOADINGCOMPLETION"){
      $Cnd=" AND  a.CompletionStatus IN('0','2')";
     }
     if($postData->Screen=="FUMIGATIONENTRYLIST"){
      $Cnd=" AND  a.CompletionStatus='1'";
     }
   }

    if(isset($postData->Data)){
     if(isset($postData->Data->FromDate)){
      $Cnd.=" AND  date(a.InsDt)>='".$postData->Data->FromDate."'";
     }
     if(isset($postData->Data->ToDate)){
      $Cnd.=" AND  date(a.InsDt)<='".$postData->Data->ToDate."'";
     }
     if(isset($postData->Data->warehouseid) && ($postData->Data->warehouseid->value !="") ){
      $Cnd.=" AND  b.WH_CODE='".$postData->Data->warehouseid->value."'";
     }
     if(isset($postData->Data->plantid) && ($postData->Data->plantid->value !="")){
      $Cnd.=" AND  c.ID='".$postData->Data->plantid->value."'";
     }
     if(isset($postData->Data->locationid) && $postData->Data->locationid->value !=""){
      $Cnd.=" AND  a.StorageLocationId='".$postData->Data->locationid->value."'";
     }
     if(isset($postData->Data->lotid) && $postData->Data->lotid->value != ""){
      $Cnd.=" AND  a.lotid='".$postData->Data->lotid->value."'";
     }
     if(isset($postData->Data->KeyWheatVariety) && $postData->Data->KeyWheatVariety->value != ""){
      $Cnd.=" AND  a.wheatvarietyid='".$postData->Data->KeyWheatVariety->value."'";
     }
     if(isset($postData->Data->FumigationStatus) && $postData->Data->FumigationStatus->value != ""){
      $Cnd.=" AND  a.fumigationstatus='".$postData->Data->FumigationStatus->value."'";
     }
     
   }
   //var_dump($postData['sub_lot_id']);
   if(isset($postData->sub_lot_id)){
    $Cnd.=" AND  a.sub_lot_id='".$postData->sub_lot_id."'";
   }

   if($SessionRole != "Admin"){
    $Cnd.=" AND a.plantid IN(SELECT PLANT_ID FROM master_user_plant WHERE USER_ID ='".$SessionUser."')";
   }

    // $fetchsql = "SELECT a.*,b.WH_NAME ,c.PLANT_NAME,d.WheatVariety,e.*,f.Fumigation_Type,
    //   date_format(a.lastfumigationdate,'%d-%m-%Y') as LastFumigatnDt,
    //   date_format(a.Lastdegassingdate,'%d-%m-%Y') as LastDegasDt,
    //   date_format(a.nextfumigationdate,'%d-%m-%Y') as NextFumigatnDt,CURRENT_DATE as CTime,
    //   TIMESTAMPDIFF(DAY,date(a.nextfumigationdate),CURRENT_DATE) as FumigationLapsed,
    //   TIMESTAMPDIFF(DAY,date(a.degassingdate),CURRENT_DATE) as DegasLapsed,
    //   TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE) as fumigationValidity,
    //   IF(TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE)>h.FumigationValidity,'1','0') 
    //   as inFumigationValidityPeriod,
    //   g.Fumigation_Status as FumigationStatusName,h.BAG_NAME,
    //   (SELECT count(1) FROM `ngw_fumigation` where SublotId=a.sub_lot_id and RecStatus='1' and 
    //   Fumigation_Type IN(SELECT Fumigation_TypeId FROM `ngw_fumigation_type`
    //   where Fumigation_Type='ALP')) as ALPCount,i.STORAGE_LOCATION as StorageLocationName
    //   FROM `ngw_sublot` a
    //   JOIN warehouse_master b ON a.warehouseid=b.wh_refid
    //   JOIN master_plant c ON a.plantid=c.ID
    //   LEFT JOIN master_storage i ON a.StorageLocationId=i.STORAGE_REFID
    //   JOIN master_mrc_wheat_variety d ON a.wheatvarietyid=d.Id
    //   JOIN ngw_lot e ON a.lotid=e.lotid
    //   JOIN ngw_fumigation_type f ON a.fumigationtypeid=f.Fumigation_TypeId
    //   LEFT JOIN ngw_fumigation_status g on a.fumigationstatus=g.Fumigation_StatusId
    //   LEFT JOIN master_bag h on a.bagtypeid=h.BAG_REFID
     
    //   where a.RecStatus='1' ".$Cnd."";
// echo "TEST";exit();
      $fetchsql = "SELECT
                    a.*,
                    b.WH_NAME,
                    b.WH_CODE,
                    c.PLANT_NAME,
                    c.WERKS,
                    d.WheatVariety,
                    d.Segment,
                    e.*,
                    f.Fumigation_Type,
                    f.Status AS Fumigation_Status,
                    DATE_FORMAT(a.lastfumigationdate, '%d-%m-%Y') AS LastFumigatnDt,
                    DATE_FORMAT(a.Lastdegassingdate, '%d-%m-%Y') AS LastDegasDt,
                    DATE_FORMAT(a.nextfumigationdate, '%d-%m-%Y') AS NextFumigatnDt,
                    CURRENT_DATE AS CTime,
                    @NoofDays:=TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.nextfumigationdate)) as NoofDays,
                    @FumigationLapsed:=TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.nextfumigationdate)) as FumigationLapsed,
                    @DegasLapsed:=(TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.lastfumigationdate))-h.FumigationDays) as DegasLapsed,
                    TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.Lastdegassingdate)) as fumigationValidity,
                    IF(TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.Lastdegassingdate))>h.FumigationValidity,'1','0') as inFumigationValidityPeriod,

                    if(g.Fumigation_StatusId=7 ,g.Fumigation_Status,
                      if(g.Fumigation_StatusId=1 ,'Fumigation Due',
                        if(g.Fumigation_StatusId = 9 ,( 
                            if(@NoofDays>0,'Fumigated',
                            if(@NoofDays=0,'Fumigation Due',
                            if(@NoofDays<0,'Fumigation Lapsed','--')))),
                    
                            if(g.Fumigation_StatusId=2,
                            if((@NoofDays-h.FumigationValidity)>(h.DegassingDays),'Under Fumigation',
                            if((@NoofDays-j.degassing_days)>0 and (@NoofDays-j.degassing_days)<= (h.DegassingDays),'Degasing Due',
                            if((@NoofDays-h.FumigationValidity)>=0 and (@NoofDays-h.FumigationValidity)<=(h.DegassingDays),'Degasing Due',
                            if((@NoofDays-h.FumigationValidity)<0,'Degasing Lapsed','-FL')))),'-')))
                      
                      ) AS FumigationStatusName,

                    h.BAG_NAME,

                    (SELECT COUNT(1) FROM `ngw_fumigation` WHERE SublotId = a.sub_lot_id 
                                AND RecStatus = '1' 
                                AND Fumigation_Type IN(SELECT Fumigation_TypeId FROM `ngw_fumigation_type` 
                                                       WHERE Status = '1')) AS ALPCount,

                    i.STORAGE_LOCATION AS StorageLocationName

                FROM `ngw_sublot` a
                JOIN warehouse_master b ON a.warehouseid = b.wh_refid
                JOIN master_plant c ON a.plantid = c.ID
                LEFT JOIN master_storage i ON a.StorageLocationId = i.STORAGE_REFID
                JOIN master_mrc_wheat_variety d ON a.wheatvarietyid = d.Id
                JOIN ngw_lot e ON a.lotid = e.lotid
                LEFT JOIN ngw_fumigation_type f ON a.fumigationtypeid = f.Fumigation_TypeId
                LEFT JOIN ngw_fumigation_status g ON a.fumigationstatus = g.Fumigation_StatusId
                LEFT JOIN master_bag h ON a.bagtypeid = h.BAG_REFID
                LEFT JOIN ngw_fumigation_type j ON a.fumigationtypeid = j.Fumigation_TypeId and j.degassing_days > 0
                WHERE c.plant_subdivision IN (0,1) AND a.RecStatus = '1' AND a.wheatqty > '0' ".$Cnd."";

      // echo $fetchsql;exit();
      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
  }

  public function getSublotlist_fumAdd($postData){
    // echo "test";exit();
    //var_dump($postData);
 //$Cnd=" and  a.approvestatus='1'";
    if(isset($postData->Screen)){
      if($postData->Screen=="UNLOADINGCOMPLETION"){
       $Cnd=" and  a.CompletionStatus='0'";
      }
      if($postData->Screen=="FUMIGATIONENTRYLIST"){
       $Cnd=" and  a.CompletionStatus='1'";
      }
    }
 
    if(isset($postData->Data)){
      if(isset($postData->Data->FromDate)){
       $Cnd.=" and  date(a.InsDt)>='".$postData->Data->FromDate."'";
      }
      if(isset($postData->Data->ToDate)){
       $Cnd.=" and  date(a.InsDt)<='".$postData->Data->ToDate."'";
      }
      if(isset($postData->Data->warehouseid)){
       $Cnd.=" and  c.WH_CODE='".$postData->Data->warehouseid->value."'";
      }
      if(isset($postData->Data->locationid)){
       $Cnd.=" and  c.ID='".$postData->Data->locationid->value."'";
      }
      if(isset($postData->Data->lotid)){
       $Cnd.=" and  a.lotid='".$postData->Data->lotid->value."'";
      }
      if(isset($postData->Data->KeyWheatVariety)){
       $Cnd.=" and  a.wheatvarietyid='".$postData->Data->KeyWheatVariety->value."'";
      }
      if(isset($postData->Data->FumigationStatus)){
       $Cnd.=" and  a.fumigationstatus='".$postData->Data->FumigationStatus->value."'";
      }
      
    }
    //var_dump($postData['sub_lot_id']);
    if(isset($postData['sub_lot_id'])){
     $Cnd.=" and  a.sub_lot_id='".$postData['sub_lot_id']."'";
    }
 
       $fetchsql = "SELECT a.*,b.WH_NAME ,c.PLANT_NAME,d.WheatVariety,e.*,f.Fumigation_Type,
       date_format(a.lastfumigationdate,'%d-%m-%Y') as LastFumigatnDt,
       date_format(a.Lastdegassingdate,'%d-%m-%Y') as LastDegasDt,
       date_format(a.nextfumigationdate,'%d-%m-%Y') as NextFumigatnDt,CURRENT_DATE as CTime,
       TIMESTAMPDIFF(DAY,date(a.nextfumigationdate),CURRENT_DATE) as FumigationLapsed,
       TIMESTAMPDIFF(DAY,date(a.degassingdate),CURRENT_DATE) as DegasLapsed,
       TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE) as fumigationValidity,
       IF(TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE)>h.FumigationValidity,'1','0') 
       as inFumigationValidityPeriod,
       g.Fumigation_Status as FumigationStatusName,h.BAG_NAME,
       (SELECT count(1) FROM `ngw_fumigation` where SublotId=a.sub_lot_id and RecStatus='1' and 
       Fumigation_Type IN(SELECT Fumigation_TypeId FROM `ngw_fumigation_type`
        where Fumigation_Type='ALP')) as ALPCount
 
       
       FROM `ngw_sublot` a
       JOIN warehouse_master b ON a.warehouseid=b.wh_refid
       JOIN master_plant c ON a.plantid=c.ID
       JOIN master_mrc_wheat_variety d ON a.wheatvarietyid=d.Id
       JOIN ngw_lot e ON a.lotid=e.lotid
       LEFT JOIN ngw_fumigation_type f ON a.fumigationtypeid=f.Fumigation_TypeId
       LEFT JOIN ngw_fumigation_status g on a.fumigationstatus=g.Fumigation_StatusId
       LEFT JOIN master_bag h on a.bagtypeid=h.BAG_REFID
       where c.plant_subdivision IN (0,1) AND a.RecStatus='1' ".$Cnd."";
 
   //echo $fetchsql;
 // exit();
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
   }
   public function getFumigationEditList($FumigationId){
    $fetchsql="SELECT a.*,b.ReasonDelayStatus,c.BAG_NAME,d.Fumigation_Type,d.Fumigation_TypeId as fumigationtypeid,e.FumigationAgency,f.FIRST_NAME,g.Name
    FROM `ngw_fumigation` a
    JOIN ngw_reason_for_delay b ON a.Reason_for_Delay=b.ReasonDelayId
    JOIN master_bag c ON a.Bag_Type=c.BAG_REFID
    JOIN ngw_fumigation_type d ON a.Fumigation_Type=d.Fumigation_TypeId
    JOIN ngw_fumigation_agency e ON a.Fumigation_Agency=e.FumigationAgencyId
    JOIN user_info f ON a.Fumigator_Name=f.UI_ID
    LEFT JOIN master_vendor g ON a.Vendor_Name=g.Code
    WHERE  a.FumigationId='$FumigationId'";
    // echo $fetchsql;
    // exit();
   // exit();
    $builder =  $this->db->query($fetchsql);
    return $builder->getResultArray();
  }

  
  public function getFumigationButtonRights($Role){
    //echo "ROLE ", $Role; 
    $res=array();
    if(strtoupper($Role) === "ADMIN"){
      $res["FumigationButton"]=1;
      $res["QCButton"]=1;
    }else{
      if(strtoupper($Role) === "FUMIGATE TEAM"){
        $res["FumigationButton"]=1;
      }else{
        $res["FumigationButton"]=0;
      }
      if(strtoupper($Role) === "QC TEAM"){
        $res["QCButton"]=1;
      }else{
        $res["QCButton"]=0;
      }
    }


    //echo $_SESSION["USERROLE"];
    //var_dump($res); 
    //exit();
    return $res;
  }

  public function getSublotFumgtn($Data){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionRole = $_SESSION['USERROLE'];
    $CurrentDateTime=date("Y-m-d H:i:s");

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
     
    if($Data->Screen=="FUMIGATIONSKIPREPORT"){
      $Cnd.=" AND FumigationSkipFlag='1'";
    }else if($Data->Screen=="FUMIGATIONSTATUS"){ 
      $Cnd.="  AND a.fumigationstatus != 9";
    }else{
      $Cnd.="  AND a.fumigationstatus=2";
    }

    if($SessionRole != "Admin"){
      $Cnd.=" AND a.plantid IN(SELECT PLANT_ID FROM master_user_plant WHERE USER_ID ='".$SessionUser."')";
     }
     //var_dump($Data);
    $fetchsql="SELECT a.*,
                      b.WH_NAME,
                      c.PLANT_NAME,
                      d.STORAGE_LOCATION,
                      e.WheatVariety,
                      f.Fumigation_Status as FumigationStatus,
                      a.last_fumigation_id as FumigationNo,
                      Date_Format(a.FumigationSkipDate,'%Y-%m-%d') AS FumigationSkipDate,
                      IF((a.FumigationSkipDate IS NULL),1,if(Date(a.FumigationSkipDate) < CURRENT_DATE,1,0)) as FumiSkipEnableFlag,
                      @countRow := @countRow + 1 AS rowId
                FROM `ngw_sublot` a
                JOIN (SELECT @countRow := -1) tmp
                JOIN warehouse_master b ON a.warehouseid=b.wh_refid
                JOIN master_plant c ON a.plantid=c.ID
                JOIN master_storage d ON a.StorageLocationId=d.STORAGE_REFID
                JOIN master_mrc_wheat_variety e ON a.wheatvarietyid=e.Id
                JOIN ngw_fumigation_status f ON a.fumigationstatus=f.Fumigation_StatusId
                WHERE  c.plant_subdivision IN (0,1) AND a.RecStatus='1' ".$Cnd."";
                
    
    // echo $fetchsql;exit();
   
    $builder =  $this->db->query($fetchsql);
    return $builder->getResultArray();
  }

  public function FumigationSkip($Data){
    $Dt_Sql ="SELECT DATE_ADD(CURDATE(), INTERVAL 7 DAY) AS SkipDt";
    $builder =  $this->db->query($Dt_Sql);
    $Dt = $builder->getResultArray();
    
    // echo $Data->Data->FumigationSkipDate;
    // $Data->Data->FumigationSkipDate=$Dt[0]['fumiDt'];
    //var_dump($Data->Data); exit();

    $sublot_details = $this->db->table('ngw_sublot')->where('sub_lot_id',$Data->id)->get();

    $sublot_data = $sublot_details->getResultArray();

    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    // print_r($sublot_data);exit();

    $fumigation = array(
      'sub_lot_id'=>$sublot_data[0]['sub_lot_id'],
      'warehouse_id'=>$sublot_data[0]['warehouseid'],
      'plant_id'=>$sublot_data[0]['plantid'],
      'storage_id'=>$sublot_data[0]['StorageLocationId'],
      'lot_id'=>$sublot_data[0]['lotid'],
      'wheat_variety_id'=>$sublot_data[0]['wheatvarietyid'],
      'skip_qty'=>$sublot_data[0]['wheatqty'],
      'skip_flag'=>'1',
      'skip_date'=>$Dt[0]['SkipDt'],
      'skip_status'=>'1',
      'created_by'=>$SessionUser,
      'created_at'=>$CurrentDateTime,
      'skip_remarks'=>$Data->Data->FumigationSkipRemarks
    );

    // print_r($fumigation);exit();

    $data = $this->db->table('view_fumigation_rnd_skip')->set($fumigation)->insert();

// print_r($data);exit();
    
    $sql = "UPDATE ngw_sublot SET FumigationSkipRemarks ='".$Data->Data->FumigationSkipRemarks."', 
                FumigationSkipFlag = '".$Data->Data->FumigationSkipFlag."', 
                FumigationSkipDate ='".$Dt[0]['SkipDt']."' WHERE sub_lot_id ='".$Data->id."'";

                // echo $sql;
    $builder =  $this->db->query($sql);
    $InsId=$Data->id;
    return $InsId;
  }
  
  public function  insertOtherFumigation($Data,$ID){

    if($ID == '') {
    $this->db->table('ngw_other_fumigation_charges')->set($Data)->insert();
    $InsId=$this->insertID();
   }else{
    $InsId=$this->db->table('ngw_other_fumigation_charges')->set($Data)->where('id', $ID)
    ->update();
   }

    return $InsId;
   }

  public function  OtherFumigationGet($formType){

   if($formType == 'Get_Approval') {
    $result=$this->db->table('ngw_other_fumigation_charges')->join('warehouse_master', 'warehouse_master.WH_CODE = ngw_other_fumigation_charges.wharehouse_id', 'inner')->join('ngw_fumigation_type', 'ngw_fumigation_type.Fumigation_TypeId = ngw_other_fumigation_charges.Fumigation_type', 'inner')->join('master_vendor', 'master_vendor.Code = ngw_other_fumigation_charges.vendor_id', 'inner')->select(['ngw_other_fumigation_charges.*','warehouse_master.WH_NAME','ngw_fumigation_type.Fumigation_Type','master_vendor.Name'])->where('ngw_other_fumigation_charges.status', 1)->orderBy('ngw_other_fumigation_charges.id')->get();
    }else{
      $result=$this->db->table('ngw_other_fumigation_charges')->join('warehouse_master', 'warehouse_master.WH_CODE = ngw_other_fumigation_charges.wharehouse_id', 'inner')->join('ngw_fumigation_type', 'ngw_fumigation_type.Fumigation_TypeId = ngw_other_fumigation_charges.Fumigation_type', 'inner')->join('master_vendor', 'master_vendor.Code = ngw_other_fumigation_charges.vendor_id', 'inner')->select(['ngw_other_fumigation_charges.*','warehouse_master.WH_NAME','ngw_fumigation_type.Fumigation_Type','master_vendor.Name'])->where('ngw_other_fumigation_charges.status>', 1)->orderBy('ngw_other_fumigation_charges.id')->get();
    }

    $res = $result->getResultArray();
    // print_r($res);exit();
    return $res;
  }

  public function  getOtherFumigationByID($ID){
    $result=$this->db->table('ngw_other_fumigation_charges')->where('ngw_other_fumigation_charges.id',$ID)->join('warehouse_master', 'warehouse_master.WH_CODE = ngw_other_fumigation_charges.wharehouse_id', 'inner')->join('ngw_fumigation_type', 'ngw_fumigation_type.Fumigation_TypeId = ngw_other_fumigation_charges.Fumigation_type', 'inner')->join('master_vendor', 'master_vendor.Code = ngw_other_fumigation_charges.vendor_id', 'inner')->select(['ngw_other_fumigation_charges.*','warehouse_master.WH_NAME','ngw_fumigation_type.Fumigation_Type','master_vendor.Name','warehouse_master.WH_REFID'])->get();
    $res = $result->getResultArray();
    // print_r($res);exit();
    return $res;
  }

  public function getSublotFumgtnSkipDetails($Data){
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionRole = $_SESSION['USERROLE'];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $Cnd="";
    if(isset($Data->Data->warehouseid->value)){
      $Cnd.=" and b.wh_code='".$Data->Data->warehouseid->value."' ";
    }
    if(isset($Data->Data->plantid->value)){
      $Cnd.=" and a.plant_id='".$Data->Data->plantid->value."'  ";
    }
    if(isset($Data->Data->lotid->value)){
      $Cnd.=" and a.lot_id='".$Data->Data->lotid->value."'  ";
    }
    if(isset($Data->Data->wheatvarietyid->value)){
      $Cnd.="  and a.wheat_variety_id='".$Data->Data->wheatvarietyid->value."' ";
    }
    if(isset($Data->Data->locationid->value)){
      $Cnd.=" and a.storage_id='".$Data->Data->locationid->value."' ";
    }
     
    // if($Data->Screen=="FUMIGATIONSKIPREPORT"){
    //   $Cnd.=" AND FumigationSkipFlag='1'";
    // }else if($Data->Screen=="FUMIGATIONSTATUS"){ 
    //   $Cnd.="  AND a.fumigationstatus != 9";
    // }else{
    //   $Cnd.="  AND a.fumigationstatus=2";
    // }

    if($SessionRole != "Admin"){
      $Cnd.=" AND a.plant_id IN(SELECT PLANT_ID FROM master_user_plant WHERE USER_ID ='".$SessionUser."')";
     }
    //  print_r($Cnd);exit();
    $fetchsql="SELECT a.*,
                      b.WH_NAME,
                      c.PLANT_NAME,
                      d.STORAGE_LOCATION,
                      e.WheatVariety,
                      f.lotno,
                      g.last_fumigation_id as FumigationNo,
                      h.Fumigation_Status as FumigationStatus,
                      Date_Format(a.skip_date,'%d-%m-%Y') AS skip_date,
                      Date_Format(a.created_at,'%d-%m-%Y') AS created_at,
                      @countRow := @countRow + 1 AS rowId
                FROM `view_fumigation_rnd_skip` a
                JOIN (SELECT @countRow := -1) tmp
                JOIN warehouse_master b ON a.warehouse_id=b.wh_refid
                JOIN master_plant c ON a.plant_id=c.ID
                JOIN master_storage d ON a.storage_id=d.STORAGE_REFID
                JOIN master_mrc_wheat_variety e ON a.wheat_variety_id=e.Id
                JOIN ngw_lot f ON a.lot_id=f.lotid
                JOIN ngw_sublot g ON a.sub_lot_id=g.sub_lot_id
                JOIN ngw_fumigation_status h ON g.fumigationstatus=h.Fumigation_StatusId

                WHERE a.skip_flag=".$Data->Status." ".$Cnd."";
                
    
    // echo $fetchsql;exit();
   
    $builder =  $this->db->query($fetchsql);
    return $builder->getResultArray();
  }


  public function getSublotApprovallist($fromdate,$todate,$Vendor_Code){

    $cnd="";

    if(isset($Vendor_Code) and !empty($Vendor_Code)){
      $cnd .= "and a.Vendor_Name in ($Vendor_Code)";
    }
    if(isset($fromdate) and !empty($fromdate))
    {
        $cnd .= " and a.InsDt >= '$fromdate'";
    }
    if(isset($todate) and !empty($todate))
    {
        $cnd .= " and a.InsDt <= date_add('$todate', INTERVAL 1 DAY)";
    }
    if(empty($Vendor_Code)){
			$cnd .= " and a.InsDt >= curdate() AND a.InsDt < curdate() + INTERVAL '1' DAY AND a.Vendor_Name = 000";
		}

      $fetchsql = "SELECT
                b.WH_NAME,
                a.SAPStatus_Flag,
                a.warehouseid,
                c.Status,
                IF(c.Status='1','ALP','MBR') as Fumigation_Type,
                b.WH_CODE,
                d.Code,
                d.Name,
                ROUND(SUM(a.Stock_MTS),3) as TotalStock,
                ROUND(SUM(a.Rate),2) as TotalRate,
                ROUND(SUM(a.Area),0) as TotalArea,
                ROUND(SUM(a.MBRCan),0) as TotalMBRCan,
                ROUND(SUM(a.WithoutTaxAmount),2) as TotalWithoutTaxAmount,
                ROUND(SUM(Gst), 2) as TotalGst,
                ROUND(SUM(a.Amount),2) as TotalAmount,
                COUNT(a.warehouseid) as count
                FROM `ngw_fumigation` a
                JOIN warehouse_master b ON a.warehouseid = b.wh_refid
                JOIN ngw_fumigation_type c ON a.Fumigation_Type = c.Fumigation_TypeId
                LEFT JOIN master_vendor d ON a.Vendor_Name = d.Code
                WHERE a.SAPStatus_Flag ='1' and a.Fumigation_Agency = '2' $cnd GROUP BY a.warehouseid,c.Status,d.Code";

      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
  }
  public function getSublotlistID($sub_lot_id){

    
      $fetchsql = "SELECT
                    a.*,
                    b.WH_NAME,
                    c.PLANT_NAME,
                    d.WheatVariety,
                    e.*,
                    f.Fumigation_Type,
                    f.Status AS Fumigation_Status,
                    DATE_FORMAT(a.lastfumigationdate, '%d-%m-%Y') AS LastFumigatnDt,
                    DATE_FORMAT(a.Lastdegassingdate, '%d-%m-%Y') AS LastDegasDt,
                    DATE_FORMAT(a.nextfumigationdate, '%d-%m-%Y') AS NextFumigatnDt,
                    CURRENT_DATE AS CTime,
                    @NoofDays:=TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.nextfumigationdate)) as NoofDays,
                    @FumigationLapsed:=TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.nextfumigationdate)) as FumigationLapsed,
                    @DegasLapsed:=(TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.lastfumigationdate))-h.FumigationDays) as DegasLapsed,
                    TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.Lastdegassingdate)) as fumigationValidity,
                    IF(TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.Lastdegassingdate))>h.FumigationValidity,'1','0') as inFumigationValidityPeriod,

                    if(g.Fumigation_StatusId=7 ,g.Fumigation_Status,
                      if(g.Fumigation_StatusId=1 ,'Fumigation Due',
                        if(g.Fumigation_StatusId = 9 ,( 
                            if(@NoofDays>0,'Fumigated',
                            if(@NoofDays=0,'Fumigation Due',
                            if(@NoofDays<0,'Fumigation Lapsed','--')))),
                    
                            if(g.Fumigation_StatusId=2,
                            if((@NoofDays-h.FumigationValidity)>(h.DegassingDays),'Under Fumigation',
                            if((@NoofDays-h.FumigationValidity)>=0 and (@NoofDays-h.FumigationValidity)<=(h.DegassingDays),'Degasing Due',
                            if((@NoofDays-h.FumigationValidity)<0,'Degasing Lapsed','-FL'))),'-')))
                      
                      ) AS FumigationStatusName,

                    h.BAG_NAME,

                    (SELECT COUNT(1) FROM `ngw_fumigation` WHERE SublotId = a.sub_lot_id 
                                AND RecStatus = '1' 
                                AND Fumigation_Type IN(SELECT Fumigation_TypeId FROM `ngw_fumigation_type` 
                                                       WHERE Fumigation_Type = 'ALP')) AS ALPCount,

                    i.STORAGE_LOCATION AS StorageLocationName

                FROM `ngw_sublot` a
                JOIN warehouse_master b ON a.warehouseid = b.wh_refid
                JOIN master_plant c ON a.plantid = c.ID
                LEFT JOIN master_storage i ON a.StorageLocationId = i.STORAGE_REFID
                JOIN master_mrc_wheat_variety d ON a.wheatvarietyid = d.Id
                JOIN ngw_lot e ON a.lotid = e.lotid
                LEFT JOIN ngw_fumigation_type f ON a.fumigationtypeid = f.Fumigation_TypeId
                LEFT JOIN ngw_fumigation_status g ON a.fumigationstatus = g.Fumigation_StatusId
                LEFT JOIN master_bag h ON a.bagtypeid = h.BAG_REFID
                WHERE a.sub_lot_id = $sub_lot_id ";

      // echo $fetchsql;exit();
      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
  }

  public function getWarehouseWiseDataget($warehouseid,$Fumigation_Type)
  {

      $splitnumber = $warehouseid;
      $splittedNumbers = explode(",", $splitnumber);
      $warehouseids = "'" . implode("', '", $splittedNumbers) ."'";

      $splitnumbers = $Fumigation_Type;
      $splittedNumbe = explode(",", $splitnumbers);
      $Fumigation_Types = "'" . implode("', '", $splittedNumbe) ."'";

    $fetchsql = "SELECT a.FumigationId
                FROM `ngw_fumigation` a
                JOIN warehouse_master b ON a.warehouseid = b.wh_refid
                JOIN master_plant c ON a.plantid = c.ID
                JOIN ngw_fumigation_type d ON a.Fumigation_Type = d.Fumigation_TypeId
                WHERE a.SAPStatus_Flag ='1' and a.warehouseid in ($warehouseids) and d.Status in($Fumigation_Types)  ORDER BY a.FumigationId";
      
      $builder =  $this->db->query($fetchsql);

      return  $builder->getResultArray();
  }

  public function Fumigation_Approval_View($warehouseid,$FumigationType,$Vendor_Code,$fromdate,$todate)
  {

    $cnd="";

    if(isset($Vendor_Code) and !empty($Vendor_Code)){
      $cnd .= "a.SAPStatus_Flag ='1' and a.warehouseid = '$warehouseid' and d.Status = '$FumigationType'and a.Vendor_Name in ($Vendor_Code)";
    }
    if(isset($fromdate) and !empty($fromdate))
    {
        $cnd .= " and a.InsDt >= '$fromdate'";
    }
    if(isset($todate) and !empty($todate))
    {
        $cnd .= " and a.InsDt <= date_add('$todate', INTERVAL 1 DAY)";
    }
    

    $fetchsql = "SELECT a.FumigationId,a.Stock_MTS,a.Rate,a.Area,a.MBRCan,   
                a.WithoutTaxAmount,a.Gst,a.lotno,a.Fumigation_date,a.Vendor_Name,a.Amount,c.werks,b.WH_CODE,b.WH_NAME,a.lotno,c.PLANT_NAME,IF(d.Status='1','ALP','MBR') as Fumigation_Type,DATE_FORMAT(a.InsDt,'%d-%m-%Y') AS created_at
                FROM `ngw_fumigation` a
                JOIN warehouse_master b ON a.warehouseid = b.wh_refid
                JOIN master_plant c ON a.plantid = c.ID
                JOIN ngw_fumigation_type d ON a.Fumigation_Type = d.Fumigation_TypeId
                WHERE $cnd";
      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
  }

  public function Update_Fumigation_SAP_Status($Id,$Data){

    $splitnumbers = $Id;
    $splittedNumbe = explode(",", $splitnumbers);
    $FumigationId = "'" . implode("', '", $splittedNumbe) ."'";
    $fetchsql = "UPDATE  `ngw_fumigation`
    SET SAPStatus_Flag = 2
    where FumigationId in ($FumigationId)";
    $this->db->query($fetchsql);
    $this->db->table('ngw_fumigation_pr_info')->set($Data)->insert();
    $InsId=$this->insertID();
    return $InsId;
  }

  public function  getFumigatiomPRData(){

     $result=$this->db->table('ngw_fumigation_pr_info')->select(['id','sap_pr_info','warehouse_name','status','total_amount','fumigation_id','reject_reason'])->where('status', 1)->orderBy('id')->get();
     $res = $result->getResultArray();
     return $res;
   }
  
   public function  getFumigatiomPRDetails($id){

    $result=$this->db->table('ngw_fumigation_pr_info')->select('sap_pr_info')->where('id', $id)->orderBy('id')->get();
    // $res = $result->getResultArray();
    //echo "<pre>";print_r($res[0]['sap_pr_info']);exit('a');
    $res = $result->getRow();
    return $res;
  }

  public function getFumigatiomPRUpdate($Id,$fumigation_id,$ngw_fumigation_pr_data,$ngw_fumigation_data){

    $SAPFlag = $ngw_fumigation_data['status'];
    $splitnumbers = $fumigation_id;
    $splittedNumbe = explode(",", $splitnumbers);
    $FumigationId = "'" . implode("', '", $splittedNumbe) ."'";
    $fetchsql = "UPDATE  `ngw_fumigation`
    SET SAPStatus_Flag = '$SAPFlag'
    where FumigationId in ($FumigationId)";
    $this->db->query($fetchsql);
    $InsId = $this->db->table('ngw_fumigation_pr_info')->set($ngw_fumigation_pr_data)->where('id',$Id)->update();
    return $InsId;
  }

  public function  FumigationPRReport($status,$fromdate,$todate){

    $cnd="";
    
      if(isset($status) and !empty($status)){
        $cnd .= "status in ($status)";
      }
      if(isset($fromdate) and !empty($fromdate))
      {
          $cnd .= " and created_at >= '$fromdate'";
      }
      if(isset($todate) and !empty($todate))
      {
          $cnd .= " and created_at <= date_add('$todate', INTERVAL 1 DAY)";
      }

    $fetchsql = "SELECT id,sap_pr_info,warehouse_name,total_amount,fumigation_id,reject_reason,sap_pr_no,
    IF(status=1,'Created',IF(status=2,'Approved','Rejected')) as StatusName,DATE_FORMAT(created_at, '%d-%m-%Y') AS created_at
    FROM `ngw_fumigation_pr_info`
    where $cnd ORDER BY id";
  //  echo $fetchsql;exit;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function  FumigationOtherPRReport($status,$fromdate,$todate){

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


    $fetchsql = "SELECT a.*,b.WH_NAME,c.Name,DATE_FORMAT(a.created_at, '%d-%m-%Y') AS created_at,d.Fumigation_Type
    FROM `ngw_other_fumigation_charges` a
    JOIN warehouse_master b ON a.wharehouse_id=b.WH_CODE
    JOIN master_vendor c ON a.vendor_id=c.Code
    JOIN ngw_fumigation_type d ON a.Fumigation_type=d.Fumigation_TypeId
    where $cnd ORDER BY a.id";
  //  echo $fetchsql;exit;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }
}
