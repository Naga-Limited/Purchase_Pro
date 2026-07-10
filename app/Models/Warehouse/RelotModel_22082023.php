<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class RelotModel extends Model
{
  public function updateRelot($RelotId , $Data){
    //var_dump($Data);
    $this->db->table('ngw_relot')->set($Data)->where('RelotId',$RelotId)->update();
    $InsId = $RelotId;
    return $InsId;
  }

  public function getRelotDetails($RelotId){
    /*
    $fetchsql = "SELECT a.*,if(Vehicle=1,'With Vehicle','Without Vehicle') as VehicleName,b.WH_NAME,c.PLANT_NAME,d.WH_NAME as Towarehouse,e.PLANT_NAME as toPlant,
    f.WheatVariety as WheatvarietyName,sec_to_time(TIMESTAMPDIFF(second,a.InsDt,CURRENT_TIMESTAMP)) as duration,
    if(a.RelotStatus='1','QC Approval','') as StatusName,g.BAG_NAME,g.WEIGHT GunnyWeight,h.Relotreason,i.Name, a.WheatVarietyId,
    j.STORAGE_LOCATION as FromLocationName,
    l.BAG_NAME as BAG_NAME2,l.WEIGHT GunnyWeight2,
    m.BAG_NAME as BAG_NAME3,m.WEIGHT GunnyWeight3,
    n.Name as FreightVendorName
    FROM `ngw_relot` a
    JOIN warehouse_master b ON a.fromwarehouseid=b.wh_code
    JOIN master_plant c ON a.fromplantid=c.ID
    JOIN master_storage j ON a.fromlocationid=j.STORAGE_REFID

    JOIN warehouse_master d ON a.fromwarehouseid=d.wh_code
    JOIN master_plant e ON a.fromplantid=e.ID
    JOIN master_storage k ON a.tolocationid=k.STORAGE_REFID
    
    JOIN master_bag g ON a.BagType=g.BAG_REFID
    LEFT JOIN master_bag l ON a.BagType2=l.BAG_REFID
    LEFT JOIN master_bag m ON a.BagType3=m.BAG_REFID

    LEFT JOIN 	ngw_relotreason h ON a.RelottingReasonId=h.Relotreasonid
    JOIN master_mrc_wheat_variety f ON a.WheatVarietyId=f.Id
    JOIN master_vendor i ON a.RelottingVendorId=i.Id
    LEFT JOIN master_vendor n ON a.FreightVendor=n.Id
    
    where   a.RelotId='$RelotId' order by RelotId"; 
    */

    $fetchsql = "SELECT
                    a.*,
                    IF(Vehicle = 1,'With Vehicle','Without Vehicle') AS VehicleName,
                    b.WH_NAME,
                    c.PLANT_NAME,
                    d.WH_NAME AS Towarehouse,
                    e.PLANT_NAME AS toPlant,
                    f.WheatVariety AS WheatvarietyName,
                    SEC_TO_TIME(TIMESTAMPDIFF(SECOND, a.InsDt, CURRENT_TIMESTAMP)) AS duration,
                    IF(a.RelotStatus = '1', 'QC Approval', '') AS StatusName,
                    g.BAG_NAME,
                    g.WEIGHT GunnyWeight,
                    h.Relotreason,
                    i.Name,
                    a.WheatVarietyId,
                    j.STORAGE_LOCATION AS FromLocationName,
                    l.BAG_NAME AS BAG_NAME2,
                    l.WEIGHT GunnyWeight2,
                    m.BAG_NAME AS BAG_NAME3,
                    m.WEIGHT GunnyWeight3,
                    n.Name AS FreightVendorName,
                    subl.wheatqty SAP_Qty
                FROM
                    `ngw_relot` a
                JOIN warehouse_master b ON a.fromwarehouseid = b.wh_code
                JOIN master_plant c ON a.fromplantid = c.ID
                JOIN master_storage j ON a.fromlocationid = j.STORAGE_REFID
                JOIN warehouse_master d ON a.fromwarehouseid = d.wh_code
                JOIN master_plant e ON a.fromplantid = e.ID
                JOIN master_storage k ON a.tolocationid = k.STORAGE_REFID
                JOIN master_bag g ON a.BagType = g.BAG_REFID
                LEFT JOIN master_bag l ON a.BagType2 = l.BAG_REFID
                LEFT JOIN master_bag m ON a.BagType3 = m.BAG_REFID
                LEFT JOIN ngw_relotreason h ON a.RelottingReasonId = h.Relotreasonid
                JOIN master_mrc_wheat_variety f ON a.WheatVarietyId = f.Id
                JOIN master_vendor i ON a.RelottingVendorId = i.Id
                LEFT JOIN master_vendor n ON a.FreightVendor = n.Id
                LEFT JOIN ngw_sublot subl ON
                    (a.fromwarehouseid,
                    a.fromplantid,
                    a.fromlocationid,
                    a.fromlotid, 
                    a.WheatVarietyId) = (subl.warehouseid,
                                        subl.plantid,
                                        subl.StorageLocationId,
                                        subl.lotid,
                                        subl.wheatVarietyid) 
                WHERE
                    a.RelotId = '$RelotId'
                ORDER BY
                    RelotId";

                    //echo $fetchsql; exit();

    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

   
    public function updateSublot($SubLotId,$WheatVarietyId,$Qty){
        //var_dump($Data);
        
        $obj=$this->db->table('ngw_sublot');
        $obj->where('lotid',$SubLotId); 
        $obj->where('WheatVarietyId',$WheatVarietyId); 
        $obj->set("wheatqty","wheatqty + (".$Qty.")",false);
        $obj->update();
        //echo $this->db->getLastQuery();
            //$this->db->table('ngw_sublot')->set("wheatqty","`wheatqty + (".$Qty.")`", false)->where('sub_lot_id',$SubLotId)->update();
            //$builder=$this->db->query($Sql);
            $InsId=$SubLotId;
            return $InsId;
    }

    public function getRelotReportlist($warehouseid, $plantid, $lotid, $fromdate, $todate){
        $cnd="";
        //echo "X".$warehouseid."X";
        if(isset($warehouseid) and !empty($warehouseid))
        {
            $cnd .= " and fromwarehouseid = '$warehouseid'";
        }
        if(isset($plantid) and !empty($plantid))
        {
            $cnd .= " and fromplantid = '$plantid'";
        }
        if(isset($lotid) and !empty($lotid))
        {
            $cnd .= " and fromlotid = '$lotid'";
        }
        if(isset($fromdate) and !empty($fromdate))
        {
            $cnd .= " and RelotDate >= '$fromdate'";
        }
        if(isset($todate) and !empty($todate))
        {
            $cnd .= " and RelotDate <= date_add('$todate', INTERVAL 1 DAY)";
        }

        $fetchsql = "SELECT date_format(a.RelotDate,'%d-%m-%Y') as Dt, a.* FROM `view_ngw_relot` a where 1 $cnd ORDER BY RelotId";
        //echo $fetchsql;exit();
        $builder =  $this->db->query($fetchsql);
        return  $builder->getResultArray();
      }
           
}
