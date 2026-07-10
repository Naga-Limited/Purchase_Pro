<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class PhysicalstocktakingModel extends Model
{
  

  public function updatephysicalstock($Physical_Stock_Id,$Data){
//var_dump($Data);
    $this->db->table('ngw_physical_stock')->set($Data)->where('Physical_Stock_Id',$Physical_Stock_Id)->update();
    $InsId=$Physical_Stock_Id;
    return $InsId;
  }

  public function getStockDetails($locationid,$lotid,$warehouseid,$StorageLocId){
     //echo "test";exit();
    $fetchsql = "SELECT a.* ,
                        c.WheatVariety,
                        d.PLANT_NAME,
                        b.WH_NAME,
                        b.wh_code,
                        e.STORAGE_LOCATION as StorageLocationName
                  FROM `ngw_sublot` a 
                  JOIN warehouse_master b ON a.warehouseid=b.wh_refid
                  JOIN master_mrc_wheat_variety c ON a.wheatvarietyid=c.Id
                  JOIN master_plant d ON a.plantid=d.ID
                  JOIN master_storage e ON a.StorageLocationId=e.STORAGE_REFID
                  WHERE a.lotid='$lotid' 
                    and a.plantid='$locationid' 
                    and b.wh_code='$warehouseid' 
                    and a.StorageLocationId='$StorageLocId'
                    and concat(a.lotid,'-',a.plantid,'-',a.warehouseid,'-',a.wheatvarietyid) 
                  NOT IN(SELECT concat(lotid,'-',plantid,'-',warehouseid,'-',Wheat_Variety_Id) FROM `ngw_physical_stock` where Status='1')
                  order by a.sub_lot_id";
                  
    //echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
   }

   public function getPhysicalStockDetails($postData){
    //echo "test";exit();
var_dump($postData);exit();
    $warehouseid= $postData->warehouseid;
    $locationid= $postData->locationid;
    $lotid= $postData->lotid;
    $Physical_Stock_date= $postData->Physical_Stock_date;
    $Maker= $postData->Maker;
    $Checker= $postData->Checker;
    $Status= $postData->Status;
    $ReportType= $postData->ReportType;

    $FromDate= $postData->FromDate;
    $ToDate= $postData->ToDate;

    $Cnd="";
    if($warehouseid!=""){
      $Cnd.=" and b.wh_code='$warehouseid'";
    }
    if($locationid!=""){
      $Cnd.=" and a.plantid='$locationid'";
    }
    if($lotid!=""){
      $Cnd.=" and a.lotid='$lotid'";
    }
    if($Physical_Stock_date!=""){
      $Cnd.=" and date(a.Physical_Stock_date)='$Physical_Stock_date'";
    }
    if($Maker!=""){
      $Cnd.=" and a.Maker='$Maker'";
    }
    if($Checker!=""){
      $Cnd.=" and a.Checker='$Checker'";
    }
    if($Status!=""){
      $Cnd.=" and a.Status='$Status'";
    }

    if($FromDate!=""){
      $Cnd.=" and date(a.Physical_Stock_date)>='$FromDate'";
    }
    if($ToDate!=""){
      $Cnd.=" and date(a.Physical_Stock_date) < date_add('" . $ToDate. "',INTERVAL 1 day)";
      
      
    }

    if(isset($postData->Search) && $postData->Search!=""){
      $Cnd.=" and (
        c.WheatVariety like '%".$postData->Search."%'
        OR d.PLANT_NAME like '%".$postData->Search."%'
        OR b.WH_NAME like '%".$postData->Search."%'
        OR b.wh_code like '%".$postData->Search."%'
        OR e.BAG_NAME like '%".$postData->Search."%'
        OR f.FIRST_NAME like '%".$postData->Search."%'
        OR g.FIRST_NAME like '%".$postData->Search."%'
        OR a.lotno like '%".$postData->Search."%'
      )";
    }
    
    if($ReportType=="2"){
      $fetchsql = "SELECT a.*,'' as Selected ,c.WheatVariety,d.PLANT_NAME,b.WH_NAME,b.wh_code,
      concat(e.BAG_NAME,',',IFNULL(h.BAG_NAME,'')) as BAG_NAME,
      date_format(a.InsDt,'%d-%m-%Y %h:%i %p') as auditTime,
      if(OutBox_Indicator='1','YES','NO') as OutboxInd,f.FIRST_NAME as MakerName,
      g.FIRST_NAME as CheckerName,
      sum(a.Phy_Qty_in_MTS) as Phy_Qty_in_MTSsum,

      sum(a.SAP_Qty_in_MTS) as SAP_Qty_in_MTSsum,
      sum(a.Diff_Qty_in_MTS) as Diff_Qty_in_MTSsum,
      concat(a.NoOfBag,',',a.NoOfBag1) as NoOfBag

   FROM `ngw_physical_stock` a 
   JOIN warehouse_master b ON a.warehouseid=b.wh_refid
   JOIN master_mrc_wheat_variety c ON a.Wheat_Variety_Id=c.Id
   JOIN master_plant d ON a.plantid=d.ID
   JOIN master_bag e  ON a.BagType=e.BAG_REFID
   LEFT JOIN master_bag h  ON a.BagType1=h.BAG_REFID
   JOIN user_info f ON a.Maker=f.UI_ID
   JOIN user_info g ON a.Checker=g.UI_ID
   where 1 $Cnd
  GROUP BY a.warehouseid,a.Wheat_Variety_Id   order by a.Physical_Stock_Id";

    }else{
      $fetchsql = "SELECT a.*,'' as Selected ,c.WheatVariety,d.PLANT_NAME,b.WH_NAME,b.wh_code,
      concat(e.BAG_NAME,',',IFNULL(h.BAG_NAME,'')) as BAG_NAME,
      date_format(a.InsDt,'%d-%m-%Y %h:%i %p') as auditTime,
      if(OutBox_Indicator='1','YES','NO') as OutboxInd,
      f.FIRST_NAME as MakerName,g.FIRST_NAME as CheckerName,
      concat(a.NoOfBag,',',a.NoOfBag1) as NoOfBag,
      
      @Net_Phy_Qty:= ROUND(((a.Qty_in_MTS + 
        ifnull(a.NoOfBag * (SELECT WEIGHT FROM master_bag mb WHERE mb.BAG_REFID = a.BagType),0) + 
        ifnull(a.NoOfBag1 * (SELECT WEIGHT FROM master_bag mb WHERE mb.BAG_REFID = a.BagType1),0)
        )),3) as Net_Phy_Qty
      
      FROM `ngw_physical_stock` a 
      JOIN warehouse_master b ON a.warehouseid=b.wh_refid
      JOIN master_mrc_wheat_variety c ON a.Wheat_Variety_Id=c.Id
      JOIN master_plant d ON a.plantid=d.ID
      JOIN master_bag e  ON a.BagType=e.BAG_REFID
      LEFT JOIN master_bag h  ON a.BagType1=h.BAG_REFID
      JOIN user_info f ON a.Maker=f.UI_ID
      JOIN user_info g ON a.Checker=g.UI_ID
      where 1 $Cnd
      order by a.Physical_Stock_Id";
    }
    echo $fetchsql; exit();
   $builder =  $this->db->query($fetchsql);
   return  $builder->getResultArray();
  }
  
}
