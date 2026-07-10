<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class BagcuttingModel extends Model
{
  

  public function updateBagcut($bagcuttingid,$Data){
//var_dump($Data);
    $this->db->table('ngw_bag_cutting_approval')->set($Data)->where('bagcuttingid',$bagcuttingid)->update();
    $InsId=$bagcuttingid;
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
   public function getbagcuttinglist($postData){
   // echo "test";exit();
    $Cnd=" and  a.approvestatus='1'";
    if(isset($postData->Screen)){
      if($postData->Screen=="CONFIRMATION"){
        $Cnd=" and a.approvestatus='2'";
      }

      if($postData->Screen=="REPORT"){
        $Cnd=" and a.approvestatus IN('1','2','3')";
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
     if(isset($postData->Data->storagelocationid)){
      $Cnd.=" and  e.STORAGE_REFID='".$postData->Data->storagelocationid->value."'";
     }
   }

      $fetchsql = "SELECT a.*,b.BAG_NAME,c.PLANT_NAME as SendingPlantName,
      d.PLANT_NAME as ReceivingPlantName,e.STORAGE_LOCATION as SendingStoragePlantName,
      f.STORAGE_LOCATION as ReceivingStoragePlantName,g.WheatVariety as WheatVariety1,h.Name,date_format(a.delivery_date,'%d-%m-%Y') as deliveryDt,
     IF(a.approvestatus='1','Pending',IF(a.approvestatus='2','Approved',IF(a.approvestatus='3','Confirmed','Rejected')))as approvestatusName ,
     date_format(a.wmApproveDate,'%d-%m-%Y %h:%i %p') as WMAppDt,
     date_format(a.ACApproveDate,'%d-%m-%Y %h:%i %p') as ACAppDt
     
      FROM `ngw_bag_cutting_approval` a
      JOIN master_bag b ON a.bag_type=b.BAG_CODE

      LEFT JOIN master_plant c ON a.sending_plant=c.WERKS
      LEFT  JOIN master_plant d ON a.receiving_plant=d.WERKS
      
      LEFT  JOIN master_storage e ON a.sending_stroage_location=e.LGORT AND e.plantid = c.ID
      LEFT  JOIN master_storage f ON a.receiving_stroage_location=f.LGORT AND f.plantid = d.ID
      
      LEFT JOIN master_mrc_wheat_variety g ON a.wheat_variety=g.Id
      LEFT JOIN master_vendor h ON a.bag_cutting_vendor=h.Id
      where 1 ".$Cnd."";
    

  
  //echo $fetchsql; exit();
   $builder =  $this->db->query($fetchsql);
   return  $builder->getResultArray();
  }
  
}
