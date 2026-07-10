<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class ReportsModel extends Model
{

  public function getBagCuttingReport($lotid, $wheatvarietyid, $WHId, $PantId)
  {

    $fetchsql = "SELECT * FROM `ngw_physicalinventory` 
    where warehouseid='$WHId' and  plantid='$PantId' and lotid='$lotid' 
    and Wheat_Variety_Id='$wheatvarietyid' limit 1";
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function getPlanVsTargetDetails($postData, $Dates)
  {

    //var_dump($Dates);exit();
    $chkDates = "";
    for ($i = 0; $i < sizeof($Dates); $i++) {
      // var_dump($Dates[$i]['MovementDate']);
      $chkDates .= "'" . $Dates[$i]['ValidationMovDate'] . "',";
    }
    $chkDates = rtrim($chkDates, ",");

    $Cnd = "";

    $Cnd .= " AND date(a.MovementDate) IN($chkDates)";

    if (isset($postData->PlantId) && $postData->PlantId != "") {
      $Cnd .= " AND a.PlantId='" . $postData->PlantId . "'";
    }
    if (isset($postData->WheatVarietyId) && $postData->WheatVarietyId != "") {
      $Cnd .= " AND a.WheatVarietyId='" . $postData->WheatVarietyId . "'";
    }
    if (isset($postData->warehouseId) && $postData->warehouseId != "") {
      $Cnd .= " AND a.WarehouseId='" . $postData->warehouseId . "'";
    }
    if (isset($postData->StorageLocationId) && $postData->StorageLocationId != "") {
      $Cnd .= " AND a.StorageLocationId='" . $postData->StorageLocationId . "'";
    }

    $fetchsql = "SELECT WarehouseId, PlantId, StorageLocationId, LotId, WheatVarietyId, sum(MovementQty) MovementQty, date_format(a.MovementDate, '%d-%m-%Y') as MDate
    FROM `ngw_weeklyplan_actual` a
    WHERE a.RecStatus='1' " . $Cnd . " GROUP BY WarehouseId, PlantId, StorageLocationId, LotId, WheatVarietyId, date(a.MovementDate) ORDER by a.MovementDate";
    // echo $fetchsql;exit();
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function getPlanVsTargetDates($postData)
  {
    $Cnd = "";
    if (isset($postData->FromDate) && $postData->FromDate != "") {
      $Cnd .= " AND a.MovementDate>='" . $postData->FromDate . "'";
    }
    if (isset($postData->ToDate) && $postData->ToDate != "") {
      $Cnd .= " AND a.MovementDate<date_add('" . $postData->ToDate . "',INTERVAL 1 day)";
    }
    if (isset($postData->PlantId) && $postData->PlantId != "") {
      $Cnd .= " AND a.PlantId='" . $postData->PlantId . "'";
    }
    if (isset($postData->WheatVarietyId) && $postData->WheatVarietyId != "") {
      $Cnd .= " AND a.WheatVarietyId='" . $postData->WheatVarietyId . "'";
    }
    if (isset($postData->warehouseId) && $postData->warehouseId != "") {
      $Cnd .= " AND a.WarehouseId='" . $postData->warehouseId . "'";
    }
    if (isset($postData->StorageLocationId) && $postData->StorageLocationId != "") {
      $Cnd .= " AND a.StorageLocationId='" . $postData->StorageLocationId . "'";
    }

    $fetchsql = "SELECT DISTINCT date(a.MovementDate) as ValidationMovDate, date_format(a.MovementDate,'%d-%m-%Y') as MovementDate
    FROM `ngw_weeklyplan_actual` a
    WHERE a.RecStatus='1' " . $Cnd . " ORDER by date(a.MovementDate) DESC limit 7 ";
   //  echo $fetchsql;exit();
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }


  public function getPlanVsTarget($postData)
  {
    $Cnd = "";
    $CndActual = "";
    if (isset($postData->FromDate) && $postData->FromDate != "") {
      $Cnd .= " AND a.plandate>='" . $postData->FromDate . "'";
      $CndActual .=" AND f.MovementDate>='" . $postData->FromDate . "'";
    }
    if (isset($postData->ToDate) && $postData->ToDate != "") {
      $Cnd .= " AND a.plandate<='" . $postData->ToDate . "'";
      $CndActual .=" AND f.MovementDate < date_add('" . $postData->ToDate . "', INTERVAL 1 day)";
    }
    if (isset($postData->PlantId) && $postData->PlantId != "") {
      $Cnd .= " AND a.fromplantid='" . $postData->PlantId . "'";
    }
    if (isset($postData->WheatVarietyId) && $postData->WheatVarietyId != "") {
      $Cnd .= " AND a.wheatvarityid='" . $postData->WheatVarietyId . "'";
    }
    if (isset($postData->warehouseId) && $postData->warehouseId != "") {
      $Cnd .= " AND a.fromwarehouseid='" . $postData->warehouseId . "'";
    }
    if (isset($postData->StorageLocationId) && $postData->StorageLocationId != "") {
      $Cnd .= " AND a.fromlocationid='" . $postData->StorageLocationId . "'";
    }

    if (isset($postData->Search) && $postData->Search != "") {
      $Cnd .= " AND (
        a.fromwarehouseid like '%" . $postData->Search . "%'
        OR b.WH_NAME like '%" . $postData->Search . "%'
        OR c.PLANT_NAME like '%" . $postData->Search . "%'
        OR a.fromlotno like '%" . $postData->Search . "%'
        OR d.WheatVariety like '%" . $postData->Search . "%'
       ) ";
    }

    $fetchsql = "SELECT a.*,
    a.fromwarehouseid as WareHouseCode,
    b.WH_NAME as WarehouseName,
    c.PLANT_NAME as PlantName,
    fromlotno as LotNo,
    d.WheatVariety as WheatVarietyName,
    e.STORAGE_LOCATION,

    a.planqty as PlanQty,
    
    @ActualQty:=sum(f.MovementQty) as ActualQty,
    round((sum(f.MovementQty)/sum(a.planqty))*100,3) as AchievedPercent,
    (sum(planqty)-sum(f.MovementQty)) as Balance
    FROM `ngw_weeklyplan` a 
    LEFT JOIN warehouse_master b ON (a.fromwarehouseid=b.wh_code or a.fromwarehouseid=b.wh_refid)
    LEFT JOIN master_plant c ON a.fromplantid=c.ID
    LEFT JOIN master_storage e ON a.fromlocationid=e.STORAGE_REFID
    LEFT JOIN master_mrc_wheat_variety d ON a.wheatvarityid=d.Id
    LEFT JOIN ngw_weeklyplan_actual f ON 
    (a.fromwarehouseid, a.fromplantid, a.fromlocationid, a.fromlotid, a.wheatvarityid) = 
    (f.WarehouseId, f.PlantId, f.StorageLocationId, f.LotId, f.WheatVarietyId) $CndActual
    where a.MovementType = 'MILL' and a.RecStatus='1' and a.Status > 2 " . $Cnd . "  GROUP BY 
    a.plandate,a.fromwarehouseid,a.fromplantid,a.fromlotid,a.wheatvarityid,
    f.WarehouseId, f.PlantId, f.StorageLocationId, f.LotId, f.WheatVarietyId";
//Mohan 08-09-2022 Added $CndActual condition and removed join condition date(f.MovementDate) between a.validfrom and a.validto and 
//Mohan 14-09-2022 Removed @PlanQty:=sum(planqty) as PlanQty, from select field list
     //echo $fetchsql; exit(); 

    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function getTotalRows($postData)
  {
    $Cnd = "";
    //var_dump($postData->Data->warehouseid);
    //exit();
    if (isset($postData->Data->warehouseid->value)) {
      $Cnd .= " and  warehouseid=(SELECT WH_REFID FROM warehouse_master WHERE WH_CODE = '" . $postData->Data->warehouseid->value . "')";
    }

    $fetchsql = "SELECT max(sRow) as TotalRow FROM `ngw_lot` WHERE  RecStatus='1' " . $Cnd;

    $builder =  $this->db->query($fetchsql);

    return  $builder->getResultArray();
  }


  public function getPictorialViewLot($postData)
  {
    $Cnd = "";
    //var_dump($postData->Data->warehouseid);
    //exit();
    if (isset($postData->Data->warehouseid->value)) {
      $Cnd .= " and  warehouseid=(SELECT WH_REFID FROM warehouse_master WHERE WH_CODE = '" . $postData->Data->warehouseid->value . "')";
    }

    $fetchsql = "SELECT * FROM `ngw_lot` WHERE  RecStatus='1' " . $Cnd;
    //echo $fetchsql;

    $builder =  $this->db->query($fetchsql);

    return  $builder->getResultArray();
  }

  public function getPictorialViewLot_Limit($postData, $Row)
  {
    $Cnd = "";
    //var_dump($postData->Data->warehouseid);
    //exit();
    if (isset($postData->Data->warehouseid->value)) {
      $Cnd .= " and  warehouseid=(SELECT WH_REFID FROM warehouse_master WHERE WH_CODE = '" . $postData->Data->warehouseid->value . "')";
    }

    $fetchsql = "SELECT a.*,(SELECT 
    concat_ws(',',GROUP_CONCAT(c.WheatVariety SEPARATOR ','),
    concat('Total Qty:',sum(wheatqty)),
    concat('Lot Capacity:',a.totalcapacity),
    concat('Utilization %:',(sum(wheatqty)/a.totalcapacity)*100),
    concat('Fumigation Release Qty:',sum(IF((b.fumigationstatus='1' OR b.fumigationstatus='9'),b.wheatqty,0))),
    concat('Fumigation Lock Qty:',sum(IF(b.fumigationstatus='2' ,b.wheatqty,0))),
    concat('Degassing Release Qty:',sum(IF((b.fumigationstatus='1' OR b.fumigationstatus='9'),b.wheatqty,0))),
    concat('Degassing Lock Qty:',sum(IF(b.fumigationstatus='5' ,b.wheatqty,0))),
    
    concat('Pledged Qty:',sum(IF(b.Keyloan_Pledge_Date>'0',(b.wheatqty-b.Keyloan_Release_Qty),0))),
    concat('UnPledged Qty:',sum(IF((b.Keyloan_Pledge_Date>0),(b.Keyloan_Release_Qty),b.wheatqty))),
    concat('Rnd Lock Qty:',sum(IF(TIMESTAMPDIFF(MONTH,date(rndlotconversiondate),CURRENT_DATE)<=3,b.wheatqty,0))),
    concat('Rnd Release Qty:',sum(IF(TIMESTAMPDIFF(MONTH,date(rndlotconversiondate),CURRENT_DATE)>3,b.wheatqty,0)))
    )
    
    FROM `ngw_sublot` b
    JOIN master_mrc_wheat_variety c ON b.wheatvarietyid=c.Id
    where b.RecStatus='1' and b.lotid=a.lotid) as SubLotSummary FROM `ngw_lot` a 
    WHERE  a.RecStatus='1'  AND a.sRow='$Row'  $Cnd ORDER BY a.sColumn ASC";



    //echo $fetchsql."<br>";exit();
    $builder =  $this->db->query($fetchsql);

    return  $builder->getResultArray();
  }
  public function getWarehouseDet($postData)
  {
    $Cnd = "";
    //var_dump($postData->Data->warehouseid);
    //exit();
    if (isset($postData->Data->warehouseid->value)) {
      $Cnd .= " and  wh_refid=(SELECT WH_REFID FROM warehouse_master WHERE WH_CODE = '" . $postData->Data->warehouseid->value . "')";
    }

    $fetchsql = "SELECT WalkwayAfterColumn FROM `warehouse_master` WHERE 1" . $Cnd;



    //echo $fetchsql."<br>";
    // exit();
    $builder =  $this->db->query($fetchsql);

    return  $builder->getResultArray();
  }
  public function getMaxColumn($postData, $Row)
  {
    $Cnd = "";
    //var_dump($postData->Data->warehouseid);
    //exit();
    if (isset($postData->Data->warehouseid->value)) {
      $Cnd .= " and  warehouseid=(SELECT WH_REFID FROM warehouse_master WHERE WH_CODE = '" . $postData->Data->warehouseid->value . "')";
    }

    $fetchsql = "SELECT max(sColumn) as MaxColumn FROM `ngw_lot` WHERE  RecStatus='1'  AND sRow='$Row' $Cnd ORDER BY sColumn ASC";



    //echo $fetchsql."<br>";exit();
    $builder =  $this->db->query($fetchsql);

    return  $builder->getResultArray();
  }
  public function getPictorialViewSubLot($postData)
  {
    $Cnd = "";
    //var_dump($postData->Data->warehouseid);
    //exit();
    if (isset($postData->Data->warehouseid->value)) {
      $Cnd .= " and  a.warehouseid=(SELECT WH_REFID FROM warehouse_master WHERE WH_CODE = '" . $postData->Data->warehouseid->value . "')";
    }

    $fetchsql = "SELECT a.lotid,a.wheatqty ,b.WheatVariety
    FROM `ngw_sublot` a 
    JOIN master_mrc_wheat_variety b ON a.wheatvarietyid=b.Id
    where a.RecStatus='1' " . $Cnd;



    // echo $fetchsql;
    // exit();
    $builder =  $this->db->query($fetchsql);

    return  $builder->getResultArray();
  }

  public function getSublotlist($postData)
  {
    // echo "test";exit();

    //$Cnd=" and  a.approvestatus='1'";
    if (isset($postData->Screen)) {
      if ($postData->Screen == "UNLOADINGCOMPLETION") {
        $Cnd = " and  a.CompletionStatus='0'";
      }
      if ($postData->Screen == "FUMIGATIONENTRYLIST") {
        $Cnd = " and  a.CompletionStatus='1'";
      }
    }

    if (isset($postData->Data)) {
      if (isset($postData->Data->FromDate)) {
        $Cnd .= " and  date(a.InsDt)>='" . $postData->Data->FromDate . "'";
      }
      if (isset($postData->Data->ToDate)) {
        $Cnd .= " and  date(a.InsDt) < date_add('" . $postData->Data->ToDate . "',INTERVAL 1 day)";
        
      }
      if (isset($postData->Data->warehouseid) && !empty($postData->Data->warehouseid)) {
        $Cnd .= " and  c.WH_CODE='" . $postData->Data->warehouseid->value . "'";
      }
      if (isset($postData->Data->locationid) && !empty($postData->Data->locationid)) {
        $Cnd .= " and  c.ID='" . $postData->Data->locationid->value . "'";
      }
      if (isset($postData->Data->storagelocationid) && !empty($postData->Data->storagelocationid) ) {
        $Cnd .= " and  a.StorageLocationId='" . $postData->Data->storagelocationid->value . "'";
      }

      if (isset($postData->Data->lotid)  && !empty($postData->Data->lotid)) {
        $Cnd .= " and  a.lotid='" . $postData->Data->lotid->value . "'";
      }
      if (isset($postData->Data->KeyWheatVariety) && !empty($postData->Data->KeyWheatVariety)) {
        $Cnd .= " and  a.wheatvarietyid='" . $postData->Data->KeyWheatVariety->value . "'";
      }
    }
    if (isset($postData->sub_lot_id) && !empty($postData->sub_lot_id)) {
      $Cnd .= " and  a.sub_lot_id='" . $postData->sub_lot_id . "'";
    }
    /* Mohan changed 27-09-2022 for channging Other Qty's like RND, Fumi, Keyloan
    $fetchsql = "SELECT a.*,b.WH_NAME ,c.PLANT_NAME,d.WheatVariety,e.*,f.Fumigation_Type,
       date_format(a.lastfumigationdate,'%d-%m-%Y') as LastFumigatnDt,
       date_format(a.Lastdegassingdate,'%d-%m-%Y') as LastDegasDt,
       date_format(a.nextfumigationdate,'%d-%m-%Y') as NextFumigatnDt,CURRENT_DATE as CTime,
       TIMESTAMPDIFF(DAY,date(a.nextfumigationdate),CURRENT_DATE) as FumigationLapsed,
       TIMESTAMPDIFF(DAY,date(a.degassingdate),CURRENT_DATE) as DegasLapsed,
       TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE) as fumigationValidity,
       
       IF(TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE)>h.FumigationValidity,'1','0') 
       as inFumigationValidityPeriod,b.company_name,
       ROUND(((a.wheatqty/e.totalcapacity)*100),3) as Utilization,
       
       g.Fumigation_Status as FumigationStatusName,h.BAG_NAME,
       IF((a.fumigationstatus='1' OR a.fumigationstatus='9'),a.wheatqty,0) as Fumigationreleaseqty,
       IF((a.fumigationstatus='2'),a.wheatqty,0) as Fumigationlockqty,
       IF((a.fumigationstatus='4'),a.wheatqty,0) as Degassingreleaseqty,
       IF((a.fumigationstatus='4'),a.wheatqty,0) as Degassinglockqty,
       IF((a.Keyloan_Pledge_Date>'0'),(a.wheatqty-a.Keyloan_Release_Qty),0) as Pledgeqty,
       IF((a.Keyloan_Pledge_Date>'0'),(a.Keyloan_Release_Qty),0) as Unpledgeqty,
       TIMESTAMPDIFF(MONTH,date(rndlotconversiondate),CURRENT_DATE) as RNDQty,
       IF(TIMESTAMPDIFF(MONTH,date(rndlotconversiondate),CURRENT_DATE)<=3,a.wheatqty,0) as Rndlockqty,
       IF(TIMESTAMPDIFF(MONTH,date(rndlotconversiondate),CURRENT_DATE)>3,a.wheatqty,0) as Rndreleasedqty
 
       
       FROM `ngw_sublot` a
       JOIN warehouse_master b ON a.warehouseid=b.wh_refid
       JOIN master_plant c ON a.plantid=c.ID
       JOIN master_mrc_wheat_variety d ON a.wheatvarietyid=d.Id
       JOIN ngw_lot e ON a.lotid=e.lotid
       JOIN ngw_fumigation_type f ON a.fumigationtypeid=f.Fumigation_TypeId
       LEFT JOIN ngw_fumigation_status g on a.fumigationstatus=g.Fumigation_StatusId
       LEFT JOIN master_bag h on a.bagtypeid=h.BAG_REFID
       
       where a.RecStatus='1' " . $Cnd . "";
      */
$fetchsql = "SELECT a.*,b.WH_NAME ,c.PLANT_NAME,d.WheatVariety,e.*,f.Fumigation_Type,
date_format(a.lastfumigationdate,'%d-%m-%Y') as LastFumigatnDt,
date_format(a.Lastdegassingdate,'%d-%m-%Y') as LastDegasDt,
date_format(a.nextfumigationdate,'%d-%m-%Y') as NextFumigatnDt,CURRENT_DATE as CTime,
TIMESTAMPDIFF(DAY,date(a.nextfumigationdate),CURRENT_DATE) as FumigationLapsed,
TIMESTAMPDIFF(DAY,date(a.degassingdate),CURRENT_DATE) as DegasLapsed,
TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE) as fumigationValidity,

IF(TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE)>h.FumigationValidity,'1','0') 
as inFumigationValidityPeriod,b.company_name,
ROUND(((a.wheatqty/e.totalcapacity)*100),3) as Utilization,

g.Fumigation_Status as FumigationStatusName,h.BAG_NAME,

0 as Fumigationlockqty,
0 as Degassingreleaseqty,
0 as Degassinglockqty,

0 as Unpledgeqty,
0 as RNDQty,
0 as Rndlockqty,


@FumigatedDaysCount:=(TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.nextfumigationdate))) as FumigatedDaysCount,
          
@Fumi_Cleared_Qty:= IFNULL(IF((@FumigatedDaysCount>0 and @FumigatedDaysCount<=ifnull(h.FumigationValidity,30)) OR (a.fumigationstatus = 9), a.wheatqty,
                    IF(a.FumigationSkipFlag=1 and a.FumigationSkipDate>=current_date, a.wheatqty, 0)),0) AS Fumigationreleaseqty, 
a.FumigationSkipFlag,
@QC_Cleared_Qty:= IFNULL(IF(a.nextrnddate>=current_date,a.wheatqty,
                  IF(a.RndSkipFlag=1 and a.RndSkipDate>=current_date, a.wheatqty, 0)),0) AS Rndreleasedqty, 


@Keyloan_Cleared_Qty:= IFNULL(IF(IFNULL(a.Keyloan_Pledge_Status,'NO')='YES',a.Keyloan_Release_Qty,a.wheatqty ),0)  AS Pledgeqty

FROM `ngw_sublot` a
JOIN warehouse_master b ON a.warehouseid=b.wh_refid
JOIN master_plant c ON a.plantid=c.ID
JOIN master_mrc_wheat_variety d ON a.wheatvarietyid=d.Id
JOIN ngw_lot e ON a.lotid=e.lotid
JOIN ngw_fumigation_type f ON a.fumigationtypeid=f.Fumigation_TypeId
LEFT JOIN ngw_fumigation_status g on a.fumigationstatus=g.Fumigation_StatusId
LEFT JOIN master_bag h on a.bagtypeid=h.BAG_REFID

where a.RecStatus='1' " . $Cnd . "";



    //  echo $fetchsql;
    //  exit();
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }

  public function getfumigationlist($postData)
  {
    // echo "test";exit();
    //$Cnd=" and  a.approvestatus='1'";
    if (isset($postData->Screen)) {
      if ($postData->Screen == "FUMIGATIONQCTEAM") {
        $Cnd = " and a.SublotId='" . $postData->sub_lot_id . "' AND  a.Fumigation_Status='2'";
      }

      if ($postData->Screen == "FUMIGATIONENTRYLIST") {
        $Cnd = " and  a.Status='1'";
      }
    }

    if (isset($postData->Data)) {
      if (!empty($postData->Data->FromDate)) {
        $fromDate = date('Y-m-d', strtotime($postData->Data->FromDate));
        $Cnd .= " AND a.InsDt >= '" . $fromDate . " 00:00:00'";
      }

      if (!empty($postData->Data->ToDate)) {
        $toDate = date('Y-m-d', strtotime($postData->Data->ToDate));
        $Cnd .= " AND a.InsDt <= '" . $toDate . " 23:59:59'";
      }
      if (isset($postData->Data->warehouseid)) {
        $Cnd .= " and  c.WH_CODE='" . $postData->Data->warehouseid->value . "'";
      }
      if (isset($postData->Data->locationid)) {
        $Cnd .= " and  c.ID='" . $postData->Data->locationid->value . "'";
      }
      if (isset($postData->Data->storagelocationid)) {
        $Cnd .= " and  a.locationid='" . $postData->Data->storagelocationid->value . "'";
      }
      if (isset($postData->Data->lotid)) {
        $Cnd .= " and  a.lotid='" . $postData->Data->lotid->value . "'";
      }
      if (isset($postData->Data->KeyWheatVariety)) {
        $Cnd .= " and  a.wheatvarietyid='" . $postData->Data->KeyWheatVariety->value . "'";
      }
      $searchtext = "";
      $searchtext = @$postData->searchtext;
      //echo "<Br>".$searchtext;
      if (empty($searchtext)) {
        $searchtext = $postData->Data->searchtext;
      }
      //echo "<Br>".$searchtext;
      if (!empty($searchtext)) {
        $Cnd .= " And (b.WH_NAME like '" . $searchtext . "%'";
        $Cnd .= " Or c.PLANT_NAME like '" . $searchtext . "%'";
        $Cnd .= " Or d.WheatVariety like '" . $searchtext . "%' ";
        $Cnd .= " Or f.Fumigation_Type like '" . $searchtext . "%' ";
        $Cnd .= " Or e.lotno like '" . $searchtext . "%' ";
        $Cnd .= " Or k.wheatqty like '" . $searchtext . "%' ";
        $Cnd .= " Or a.Fumigation_Type like '" . $searchtext . "%' ";
        // $Cnd.=" Or e.fumigationDays like '".$searchtext."%' ";
        // $Cnd.=" Or a.fumigationResult like '".$searchtext."%' ";
        $Cnd .= " Or h.BAG_NAME like '" . $searchtext . "%' ";
        $Cnd .= " Or a.Fumigation_Agency like '" . $searchtext . "%' ";
        $Cnd .= " Or a.Fumigator_Name like '" . $searchtext . "%' ";
        $Cnd .= " Or a.Vendor_Name like '" . $searchtext . "%' ";
        $Cnd .= " Or a.Amount like '" . $searchtext . "%' ";
        $Cnd .= " Or a.ALP_Count like '" . $searchtext . "%' ";
        $Cnd .= " ) ";
      }
    }

    if (isset($postData->sub_lot_id)) {
      // $Cnd.=" and  a.sub_lot_id='".$postData->sub_lot_id."'";
    }

    /*
    $fetchsql = "SELECT
                    b.WH_NAME,
                    c.PLANT_NAME,
                    d.WheatVariety,
                    e.*,
                    f.Fumigation_Type,
                    DATE_FORMAT(a.Last_Fumigated_date, '%d-%m-%Y') AS LastFumigatnDt,
                    DATE_FORMAT(a.Last_Degassed_date, '%d-%m-%Y') AS LastDegasDt,
                    DATE_FORMAT(a.Next_Due_Date, '%d-%m-%Y') AS NextFumigatnDt,
                    TIMESTAMPDIFF(DAY,a.Next_Due_Date,CURRENT_TIMESTAMP) AS FumigationLapsed,
                    TIMESTAMPDIFF(DAY,a.Last_Degassed_date,CURRENT_TIMESTAMP) AS DegasLapsed,
                    g.ReasonDelayStatus,
                    h.BAG_NAME,
                    i.Fumigation_Type,
                    j.Name,
                    k.wheatqty,
                    TIMESTAMPDIFF(DAY,DATE(Fumigation_date),CURRENT_DATE) AS fumigationDays,
                    DATE_FORMAT(Fumigation_date, '%d-%m-%Y') dFumigation_date,
                    TIMESTAMPDIFF(DAY,DATE(Last_Degassed_date),CURRENT_DATE) AS DegassDays

                FROM `ngw_fumigation` a
                JOIN warehouse_master b ON a.warehouseid = b.wh_refid
                JOIN master_plant c ON a.plantid = c.ID
                JOIN master_mrc_wheat_variety d ON a.wheatvarietyid = d.Id
                JOIN ngw_lot e ON a.lotid = e.lotid
                JOIN ngw_sublot k ON a.SublotId = k.sub_lot_id
                JOIN ngw_fumigation_type f ON a.Last_Fumigation_Type = f.Fumigation_TypeId

                LEFT JOIN ngw_reason_for_delay g ON a.`Reason_for_Delay` = g.ReasonDelayId
                LEFT JOIN master_bag h ON a.`Bag_Type` = h.BAG_REFID
                LEFT JOIN ngw_fumigation_type i ON a.`Fumigation_Type` = i.Fumigation_TypeId
                LEFT JOIN master_vendor j ON a.Vendor_Name = j.Id
                WHERE a.RecStatus = '1'".$Cnd."";
      */
    $fetchsql = "SELECT
                ROW_NUMBER() OVER (ORDER BY a.FumigationId) AS FumigationNo,

                u.FIRST_NAME AS Fumigator_Name,

                a.Fumigation_Agency,
                a.Vendor_Name,
                a.Amount,

                CASE
                    WHEN i.Status = 1
                        THEN ROUND(((a.Stock_MTS / 1000) * i.quick_gas_grm), 3)

                    WHEN i.Status = 2
                        THEN ROUND((a.MBRCan * i.quick_gas_grm), 3)

                    ELSE 0.000
                END AS ALP_Count,

                a.Stock_MTS,
                a.MBRCan,
                a.Status,
                a.DegassedOn,
                a.WithoutTaxAmount,
                a.Gst,
                a.Amount,

                b.WH_NAME,
                c.PLANT_NAME,
                d.WheatVariety,
                e.*,
                f.Fumigation_Type,

                DATE_FORMAT(a.Last_Fumigated_date,'%d-%m-%Y') AS LastFumigatnDt,
                DATE_FORMAT(a.Last_Degassed_date,'%d-%m-%Y') AS LastDegasDt,
                DATE_FORMAT(a.Next_Due_Date,'%d-%m-%Y') AS NextFumigatnDt,

                TIMESTAMPDIFF(DAY,a.Next_Due_Date,CURRENT_TIMESTAMP) AS FumigationLapsed,
                TIMESTAMPDIFF(DAY,a.Last_Degassed_date,CURRENT_TIMESTAMP) AS DegasLapsed,

                g.ReasonDelayStatus,
                h.BAG_NAME,
                i.Fumigation_Type,
                i.quick_gas_grm,

                CASE
                    WHEN a.Fumigation_Agency = 2
                    THEN j.Name
                    ELSE j1.Name
                END AS Name,

                CASE
                    WHEN i.Status = 1 THEN 'ALP'
                    WHEN i.Status = 2 THEN 'Quick Fumigation'
                    WHEN i.Status = 3 THEN 'OTHERS'
                    ELSE ''
                END AS FumigationTypeName,

                k.wheatqty,
                l.FumigationAgency,
                m.Fumigation_Status,
                n.STORAGE_LOCATION,

                TIMESTAMPDIFF(
                    DAY,
                    DATE(a.Fumigation_date),
                    CURRENT_DATE
                ) AS fumigationDays,

                DATE_FORMAT(
                    a.Fumigation_date,
                    '%d-%m-%Y'
                ) AS dFumigation_date,

                TIMESTAMPDIFF(
                    DAY,
                    DATE(a.Last_Degassed_date),
                    CURRENT_DATE
                ) AS DegassDays

            FROM ngw_fumigation a

            JOIN warehouse_master b
                ON a.warehouseid = b.wh_refid

            JOIN master_plant c
                ON a.plantid = c.ID

            JOIN master_mrc_wheat_variety d
                ON a.wheatvarietyid = d.Id

            JOIN ngw_lot e
                ON a.lotid = e.lotid

            JOIN ngw_sublot k
                ON a.SublotId = k.sub_lot_id

            JOIN ngw_fumigation_type f
                ON a.Fumigation_Type = f.Fumigation_TypeId

            LEFT JOIN ngw_reason_for_delay g
                ON a.Reason_for_Delay = g.ReasonDelayId

            LEFT JOIN master_bag h
                ON a.Bag_Type = h.BAG_REFID

            LEFT JOIN ngw_fumigation_type i
                ON a.Fumigation_Type = i.Fumigation_TypeId

            LEFT JOIN master_vendor j1
                ON a.Vendor_Name = j1.Id

            LEFT JOIN master_vendor j
                ON a.Vendor_Name = j.Code
                AND j.Category = 'Fumigation Vendor'

            JOIN ngw_fumigation_agency l
                ON a.Fumigation_Agency = l.FumigationAgencyId

            JOIN ngw_fumigation_status m
                ON a.Status = m.Fumigation_StatusId

            JOIN master_storage n
                ON a.locationid = n.STORAGE_REFID

            LEFT JOIN user_info u
                ON u.UI_ID = a.Fumigator_Name

            WHERE c.plant_subdivision IN (0,1)
            AND a.RecStatus = '1'
            " . $Cnd;
    // echo $fetchsql;exit();
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }
}
