<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class STOPODeliveryPlanModel extends Model
{
  protected $table   = 'ngw_weeklyplan';  

  public function UpdateWeeklyPlan($id,$Data){
    //var_dump($Data); exit();
    $this->db->table('ngw_weeklyplan')->set($Data)->where('planid',$id)->update();
    $InsId=$id;
    return $InsId;
  }

  public function UpdateSeqNumber($Data){
    $this->db->table('ngw_weeklyplanseq')->set($Data)->insert();
    $InsId=$this->insertID();
    return $InsId;
  }
  
  public function  InsertWeeklyPlan($Data){
    //var_dump($Data); exit();
     $this->db->table('ngw_weeklyplan')->set($Data)->insert();
     //echo $this->db->getLastQuery();
     $InsId=$this->insertID();
     return $InsId;
  }

  public function getWharehouse_Id($PlanId, $LocationId, $LotId){
    $fetchsql = "SELECT warehouseid FROM ngw_lot 
    WHERE plantid = '".$PlanId."' AND locationid = '".$LocationId."' AND lotid ='".$LotId."'";
   // echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();

  }
  
  public function DeleteOtherPlan($PlanIds,$MGNNo){
    $Data=array("RecStatus=0");
    $fetchsql = "UPDATE `ngw_weeklyplan` set RecStatus='0' where planid NOT IN($PlanIds) and movementgroupno='$MGNNo'";
    $builder =  $this->db->query($fetchsql);

  /*  $this->db->table('ngw_weeklyplan')->set($Data)
    ->where_not_in('planid',$PlanIds)
    ->where('movementgroupno',$MGNNo)
    ->update();*/
   
    
   // $InsId=$id;
   // return $InsId;

  }

  public function getPlanGroup($Id) {
    $fetchsql = "SELECT planid,movementgroupno as MovementGroupNumber,d.WeekNo as WeekNoName,a.weekno as WeekNo,plandate as date,fromwarehouseid as WareHouse,b.WH_NAME as WareHouseName,a.wheatvarityid as WheatVariety,c.WheatVariety as WheatVarietyName,a.ActualStock,a.rndconfirmqty as RandDConfirmedQty,fromlotid as LotNumber,fromlotno as LotNumberName,fumigationclearedqty as FumigationClearedQty,Division,keyloandoqty as KeyLoanDOQty,planqty as MovementQty,actualmvtqty as ActualMovementQty,mixing_ratio as MixingRatio,validfrom as ValidFrom,
    validto as ValidTo,restrict_mode as RestrictMode,e.PLANT_NAME,a.fromplantid,f.STORAGE_LOCATION as StorageLocationName,
    g.ReceivingBin as ReceivingBinName,a.ReceivingBin,a.fromlocationid,RndSkipFlag,FumigationSkipFlag
    FROM `ngw_weeklyplan` a
    LEFT JOIN warehouse_master b ON a.fromwarehouseid=b.wh_code
    LEFT JOIN master_mrc_wheat_variety c ON a.wheatvarityid=c.Id
    LEFT JOIN master_plant e ON a.fromplantid=e.ID
    LEFT JOIN master_storage f ON a.fromlocationid=f.STORAGE_REFID
    LEFT JOIN ngw_weekno d ON a.weekno=d.Id
    LEFT JOIN pp_receivingbin g ON a.ReceivingBin=g.Id
    where a.RecStatus='1' AND  
    movementgroupno IN(SELECT movementgroupno FROM `ngw_weeklyplan` WHERE planid='$Id')";
   //// echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
   }


   public function getGodowntoGodown($postData) {
    $Cnd="";
    if ($postData->Screen =="GTG_EDIT"){
      $Cnd=" AND Status='-1' ";
    }else if($postData->Screen=="GTG_APPROVAL"){
      $Cnd=" AND Status='1' ";
    }else if($postData->Screen!="REPORT"){
      $Cnd=" AND Status='1' ";
    }

    $fetchsql = "SELECT a.planid,
                        a.movementgroupno as MovementGroupNumber,
                        d.WeekNo as WeekNoName,
                        a.weekno as WeekNo,
                        a.plandate as date,
                        a.fromwarehouseid as WareHouse,
                        b.WH_NAME as WareHouseName,
                        a.wheatvarityid as WheatVariety,
                        c.WheatVariety as WheatVarietyName,
                        a.ActualStock,
                        a.rndconfirmqty as RandDConfirmedQty,
                        a.fromlotid as LotNumber,
                        a.fromlotno as LotNumberName,
                        a.fumigationclearedqty as FumigationClearedQty,
                        a.Division,
                        a.keyloandoqty as KeyLoanDOQty,
                        a.planqty as MovementQty,
                        a.actualmvtqty as ActualMovementQty,
                        a.mixing_ratio as MixingRatio,
                        a.validfrom as ValidFrom,
                        a.validto as ValidTo,
                        a.restrict_mode as RestrictMode,
                        e.PLANT_NAME,
                        a.fromplantid,
                        f.STORAGE_LOCATION as StorageLocationName,
                        g.ReceivingBin as ReceivingBinName,
                        a.ReceivingBin,
                        a.fromlocationid,
                        h.PLANT_NAME as toPlantName,
                        i.STORAGE_LOCATION as toStorageLocationName,
                        a.tolotno,
                        a.tolotid,
                        a.toplantid,
                        a.tolocationid,
                        IF(a.Status=1,'PENDING',IF(a.Status=2,'APPROVED','REJECTED')) as StatusName
                  FROM `ngw_weeklyplan` a
                  LEFT JOIN warehouse_master b ON (a.fromwarehouseid=b.wh_code OR a.fromwarehouseid=b.WH_REFID)
                  LEFT JOIN master_mrc_wheat_variety c ON a.wheatvarityid=c.Id
                  LEFT JOIN master_plant e ON a.fromplantid=e.ID
                  LEFT JOIN master_storage f ON a.fromlocationid=f.STORAGE_REFID
                  LEFT JOIN ngw_weekno d ON a.weekno=d.Id
                  LEFT JOIN pp_receivingbin g ON a.ReceivingBin=g.Id
                  LEFT JOIN master_plant h ON a.toplantid=h.ID
                  LEFT JOIN master_storage i ON a.tolocationid=i.STORAGE_REFID
                  WHERE a.RecStatus='1' AND MovementType='GODOWN' ". $Cnd;

    // AND  
    //movementgroupno IN(SELECT movementgroupno FROM `ngw_weeklyplan` WHERE planid='$Id')
    
    //  echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
   }


  public function getsublotDet($postData){
    //var_dump($postData);exit();
    $Cnd="";
    if(isset($postData)){
      if(isset($postData->Data->FromDate)){
      $Cnd.=" and  date(a.InsDt)>='".$postData->Data->FromDate."'";
      }

      if(isset($postData->Data->ToDate)){
      $Cnd.=" and  date(a.InsDt)<='".$postData->Data->ToDate."'";
      }

      if(isset($postData->warehouseid)){
      $Cnd.=" and  c.WH_CODE='".$postData->warehouseid."'";
      }

      if(isset($postData->lotid)){
        //Commented on 01092022 remove Duplicate lotno $Cnd.=" and a.lotno in (select lotno from ngw_lot where lotid in ('".$postData->lotid."'))";
        $Cnd.=" and a.lotid in ('".$postData->lotid."')";
      }

      if(isset($postData->plantid)){
        $Cnd.=" and  c.ID='".$postData->plantid."'";
      }

      if(isset($postData->WheatVarietyId)){
      $Cnd.=" and  a.wheatvarietyid='".$postData->WheatVarietyId."'";
      }

      if(isset($postData->FumigationStatus)){
      $Cnd.=" and  a.fumigationstatus='".$postData->Data->FumigationStatus->value."'";
      }
    }

    if(isset($postData->sub_lot_id)){
    $Cnd.=" and  a.sub_lot_id='".$postData->sub_lot_id."'";
    }
    $ValidFrom=$postData->ValFrom;
    
    $fetchsql = "SELECT a.*, 
                        b.WH_NAME, 
                        c.PLANT_NAME, 
                        d.WheatVariety, 
                        e.*, 
                        f.Fumigation_Type, 
                        i.STORAGE_LOCATION,
                        date_format(a.lastfumigationdate,'%d-%m-%Y') as LastFumigatnDt,
                        date_format(a.Lastdegassingdate,'%d-%m-%Y') as LastDegasDt,
                        date_format(a.nextfumigationdate,'%d-%m-%Y') as NextFumigatnDt,
                        CURRENT_DATE as CTime,
                        TIMESTAMPDIFF(DAY,date(a.nextfumigationdate),CURRENT_DATE) as FumigationLapsed,
                        TIMESTAMPDIFF(DAY,date(a.degassingdate),CURRENT_DATE) as DegasLapsed,
                        TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE) as fumigationValidity,
                        IF(TIMESTAMPDIFF(DAY,date(a.Lastdegassingdate),CURRENT_DATE)>h.FumigationValidity,'1','0') AS inFumigationValidityPeriod,
                        g.Fumigation_Status as FumigationStatusName,
                        h.BAG_NAME,
                        (SELECT count(1) FROM `ngw_fumigation` WHERE SublotId=a.sub_lot_id 
                          AND RecStatus='1' AND Fumigation_Type IN
                          (SELECT Fumigation_TypeId FROM `ngw_fumigation_type` WHERE Fumigation_Type='ALP')
                        ) as ALPCount,

      IF((a.fumigationstatus='1' OR a.fumigationstatus='9'),a.wheatqty,0) as Fumigationreleaseqty,
      IF((a.fumigationstatus='9'),a.wheatqty,IF((a.FumigationSkipFlag='1'),a.wheatqty,0)) as FumigationClearedQty,
      IF((a.fumigationstatus='2'),a.wheatqty,0) as Fumigationlockqty,
      IF((a.fumigationstatus='4'),a.wheatqty,0) as Degassingreleaseqty,
      IF((a.fumigationstatus='4'),a.wheatqty,0) as Degassinglockqty,
      IF((a.Keyloan_Pledge_Date>'0'),(a.wheatqty-a.Keyloan_Release_Qty),0) as Pledgeqty,
      IF(IFNULL(a.Keyloan_Pledge_Status,'NO')='YES',a.Keyloan_Release_Qty,a.wheatqty ) as Unpledgeqty,
      
      TIMESTAMPDIFF(MONTH,date(rndlotconversiondate),'CURRENT_DATE') as RNDQty,
      IF(TIMESTAMPDIFF(MONTH,date(rndlotconversiondate),'$ValidFrom')<=3,a.wheatqty,
        IF(a.RndSkipFlag=1,a.wheatqty,0)) as Rndlockqty,

      @QC_Cleared_Qty:= IF(a.nextrnddate>=current_date, a.wheatqty,
                            IF(a.RndSkipFlag=1 and a.RndSkipDate>=current_date, a.wheatqty, 0)) AS Rndreleasedqty, 
        FumigationSkipFlag,
        RndSkipFlag, 

        @Reserved_Stock := ifnull ((
          SELECT sum(if(ifnull(ManualReleaseQty,0) > 0, 
            ifnull(ManualReleaseQty,0), ifnull(planqty,0)))
          FROM ngw_weeklyplan wp 
          WHERE wp.RecStatus = 1 AND (wp.wheatvarityid, wp.fromplantid, wp.fromlocationid, wp.fromlotid) = (a.wheatvarietyid, a.plantid, a.StorageLocationId, a.lotid)
          AND wp.plandate >= date_format(current_date,'%Y-%m-01')), 0) as Reserved_Stock

     FROM `ngw_sublot` a
     JOIN warehouse_master b ON a.warehouseid=b.wh_refid
     JOIN master_plant c ON a.plantid=c.ID
     JOIN master_mrc_wheat_variety d ON a.wheatvarietyid=d.Id
     JOIN ngw_lot e ON a.lotid=e.lotid
     LEFT JOIN ngw_fumigation_type f ON a.fumigationtypeid=f.Fumigation_TypeId
     LEFT JOIN ngw_fumigation_status g on a.fumigationstatus=g.Fumigation_StatusId
     LEFT JOIN master_bag h on a.bagtypeid=h.BAG_REFID
     JOIN master_storage i on a.StorageLocationId = i.STORAGE_REFID
     where a.RecStatus='1' ".$Cnd."";


/*
IF((a.Keyloan_Pledge_Date>'0'),(a.Keyloan_Release_Qty),a.wheatqty) as Unpledgeqty,
-- IF((a.fumigationstatus='1' OR a.fumigationstatus='9'),a.wheatqty,IF((a.FumigationSkipFlag='1'),a.wheatqty,0)) as FumigationClearedQty,
*/
      //echo $fetchsql;exit();
      $builder =  $this->db->query($fetchsql);
      return  $builder->getResultArray();
  }

  public function getPlanGroupByDate($date, $wheatvarityid, $lotid) {
    $fetchsql = "SELECT planid,movementgroupno as MovementGroupNumber,d.WeekNo as WeekNoName,a.weekno as WeekNo,plandate as date,fromwarehouseid as WareHouse,b.WH_NAME as WareHouseName,a.wheatvarityid as WheatVariety,c.WheatVariety as WheatVarietyName,a.ActualStock,a.rndconfirmqty as RandDConfirmedQty,fromlotid as LotNumber,fromlotno as LotNumberName,fumigationclearedqty as FumigationClearedQty,Division,keyloandoqty as KeyLoanDOQty,planqty as MovementQty,actualmvtqty as ActualMovementQty,mixing_ratio as MixingRatio,validfrom as ValidFrom,
    validto as ValidTo,restrict_mode as RestrictMode
    FROM `ngw_weeklyplan` a
    LEFT JOIN warehouse_master b ON a.fromwarehouseid=b.WH_REFID
    LEFT JOIN master_mrc_wheat_variety c ON a.wheatvarityid=c.Id
    LEFT JOIN ngw_weekno d ON a.weekno=d.Id
    where a.RecStatus='1' AND plandate = str_to_date('$date','%Y-%m-%d') and 
    a.wheatvarityid='$wheatvarityid' and a.fromlotid='$lotid' limit 1";
    // echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return $builder->getResultArray();
  }
   
  public function getPlanWheatvarietyList($lotid,$StorageLocation){
     
     //echo "TEST";exit();
     $cnd="";
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
     $Sql = "SELECT distinct a.id as value, CONCAT(LEFT(a.Segment, 1),'-', a.WheatVariety) as label
     FROM `master_mrc_wheat_variety` a, ngw_sublot b, ngw_lot c,master_plant d, warehouse_master e, master_storage f 
     where e.wh_code = d.WH_CODE and c.plantid=d.ID and b.wheatvarietyid=a.id 
     and c.lotid = b.lotid 
     and b.StorageLocationId = f.STORAGE_REFID 
     and b.Recstatus = 1 $cnd ORDER by a.WheatVariety";
     //echo $Sql;
     $builder = $this->db->query($Sql);
     return  $builder->getResultArray();
   }
      /* update Weekly Plan data # Arularasu A */
      public function Save_ConfirmationPlan_Status($postData) {
        //var_dump($postData) ; exit();

        $RejectReason = $postData->Reason;
        $Data = $postData->Data;
        $PlanDt= $postData->Data[0]->plandate;

        $InsId =false;
        /* Update Approval Status And Plan Qty Based On PlanID => R&D Approval  */
        if ($postData->screentype=="RND_APPROVAL"){
          /* Update Approval "Status" on PlanID  => R&D Approval  */

          for ($i=0;$i<count((array)$Data);$i++){      
            $updateSql = "UPDATE ngw_weeklyplan SET Status = '2' WHERE planid =".$Data[$i]->planid."";
            //echo $updateSql; exit();
            $this->db->query($updateSql);
            $InsId=true;
          }
    
        }else if ($postData->screentype=="RND_REJECT"){
          /* Update Reject "Status" & "Reject Reason" on PlanID and Status => R&D Reject  */

          for ($i=0;$i<count((array)$Data);$i++){      
            // $updateSql = "UPDATE ngw_weeklyplan 
            //               SET Status = '-2', RejectReason ='".$RejectReason."' 
            //               WHERE plandate ='".$Data[$i]->plandate."' AND Status ='1'";

            $updateSql = "UPDATE ngw_weeklyplan SET Status = '-2', RejectReason ='".$RejectReason."' WHERE planid =".$Data[$i]->planid." AND Status ='1'";
            //echo $updateSql, "<br>"; 
            $this->db->query($updateSql);
            $InsId=true;
          }
        
        }else if ($postData->screentype=="COMMERCIAL_APPROVAL"){
          /* Update "Status" & on PlanID => Commercial Approval */

          for ($i=0;$i<count((array)$Data);$i++){      
            $updateSql = "UPDATE ngw_weeklyplan SET Status = '3' WHERE planid =".$Data[$i]->planid."";
            //echo $updateSql; exit();
            $this->db->query($updateSql);
            $InsId=true;
          }
    
        }else if ($postData->screentype=="COMMERCIAL_REJECT"){
          /* Update Reject "Status" & "Reject Reason" on PlanID and Status => Commercial Approval */

          for ($i=0;$i<count((array)$Data);$i++){      
            // $updateSql = "UPDATE ngw_weeklyplan 
            //               SET Status = '-3', RejectReason ='".$RejectReason."' 
            //               WHERE plandate ='".$Data[$i]->plandate."' AND Status ='2'";
            $updateSql = "UPDATE ngw_weeklyplan SET Status = '-3', RejectReason ='".$RejectReason."' WHERE planid =".$Data[$i]->planid." AND Status ='2'";
            // echo $updateSql; 
            $this->db->query($updateSql);
            $InsId=true;
          }
        }
        return $InsId;
      }
    
      public function checkPlanLotDuplicate($PlanDate, $warehouseid, $plantid,$locationid, $LotId,$WheatVarietyId){
        
        // echo "TEST".$PlanMonth;exit();
      //echo "$PlanDate, $warehouseid, $plantid,$locationid, $LotId,$WheatVarietyId";
      //exit();
        $sql = "SELECT count(1) DuplicateRecord FROM `ngw_weeklyplan` WHERE RecStatus = 1 AND plandate = '$PlanDate' and 
        (fromwarehouseid, fromplantid,fromlocationid,fromlotid, wheatvarityid) = ('$warehouseid', '$plantid','$locationid', '$LotId','$WheatVarietyId')";
       //echo $sql;exit();   
        $builder = $this->db->query($sql);
        return  $builder->getResultArray();
      }

      public function checkPlanLotDuplicate1($PlanDate, $warehouseid, $plantid, $locationid, $LotId, $WheatVarietyId, $PlanID){
        
        // echo "TEST".$PlanMonth;exit();
      //echo "$PlanDate, $warehouseid, $plantid,$locationid, $LotId,$WheatVarietyId";
      //exit();
        $sql = "SELECT count(1) DuplicateRecord  FROM `ngw_weeklyplan` WHERE planid != '$PlanID' AND RecStatus = 1 AND plandate = '$PlanDate' and 
        (fromwarehouseid, fromplantid,fromlocationid,fromlotid, wheatvarityid) = ('$warehouseid', '$plantid','$locationid', '$LotId','$WheatVarietyId')";
        //echo $sql;exit();   
        $builder = $this->db->query($sql);
        return  $builder->getResultArray();
      }

      public function checkPlanLotDuplicate2($PlanID, $PlanDate){
        
        // echo "TEST".$PlanMonth;exit();
      //echo "$PlanDate, $warehouseid, $plantid,$locationid, $LotId,$WheatVarietyId";
      //exit();
        $sql = "SELECT count(1) DuplicateRecord  FROM 
        `ngw_weeklyplan` a WHERE planid != '$PlanID' AND RecStatus = 1 AND plandate = '$PlanDate' 
        AND RecStatus = 1 AND
        ( fromwarehouseid, fromplantid,fromlocationid,fromlotid, wheatvarityid) =
        (SELECT  fromwarehouseid, fromplantid,fromlocationid,fromlotid, wheatvarityid FROM 
        `ngw_weeklyplan` a WHERE planid = '$PlanID') 
        ";
        //echo $sql;exit();   
        $builder = $this->db->query($sql);
        return  $builder->getResultArray();
      }

      public function getWharehouseId($Name){
        $sql = "SELECT wh_refid FROM `warehouse_master` WHERE WH_NAME ='".$Name."'"; 
        //echo $sql; exit();
        $builder = $this->db->query($sql);
        //var_dump($builder->getResultArray()); exit();
        return  $builder->getResultArray();
      }

      public function getPlantId($Name){
        $sql = "SELECT ID FROM `master_plant` WHERE PLANT_NAME ='".$Name."'"; 
        $builder = $this->db->query($sql);
        return  $builder->getResultArray();
      }
      
      public function getSLId($Name){
        $sql = "SELECT STORAGE_REFID FROM `master_storage` WHERE STORAGE_LOCATION ='".$Name."'"; 
        $builder = $this->db->query($sql);
        return  $builder->getResultArray();
      }

      public function getLotId($Name){
        $sql = "SELECT lotid FROM `ngw_lot` WHERE lotno ='".$Name."'"; 
        $builder = $this->db->query($sql);
        return  $builder->getResultArray();
      }

      public function getWheatVarietyId($Name){
        $sql = "SELECT Id FROM `master_mrc_wheat_variety` WHERE WheatVariety ='".$Name."'"; 
        $builder = $this->db->query($sql);
        return  $builder->getResultArray();
      }

          /**** Mohan Added on 26072022 for inserting also when plan month change in Edit Popup */
    public function updatePlanListNew($Id , $Data, $Length ) {

      //var_dump($Data);exit();

      $resID =false;

      // Mohan 26072022 for checking any record duplicate exists with other plan id 
      // If exits sghould not update anyother records need to retur with update all records
      for ($i=0;$i<$Length;$i++){      
        $Priority = (isset($Data[$i]->Priority) && $Data[$i]->Priority!="")? $Data[$i]->Priority:"0";
        $MovementQty = (isset($Data[$i]->Movement_Qty) && $Data[$i]->Movement_Qty!="")? $Data[$i]->Movement_Qty:"0";
        $ReleaseQty = (isset($Data[$i]->Release_Qty) && $Data[$i]->Release_Qty!="")?$Data[$i]->Release_Qty:"0";
        $Status =1;
        $PlanId=$Data[$i]->planid;
        $Monthyear="01-".$Data[$i]->PlanMonth;
        
        $plandate = date('Y-m-d',strtotime($Monthyear));
// echo "PlanDate=>".$plandate;exit();
        //Check Duplicate record exists with other plan id or not
        $Planmodel = new STOPODeliveryPlanModel();
        //var_dump($Data);exit();
        $res = $Planmodel->checkPlanLotDuplicate2(
          $Data[$i]->planid,$plandate
        );//Mohan 26072022 Check whether Plan record existing for new $plandate with same warehouse, plant, loc, wheat
  
        //echo $res[0]["DuplicateRecord"];exit();
        $Duplicate = intval( $res[0]["DuplicateRecord"]);
          if ($Duplicate >0) {
            return -5;
          }
          //Mohan Added when edit planmonth Check whether to update or insert Record 
          // If not duplicate in Above checkPlanLotDuplicate2 function then current record or not checking
        $res = $Planmodel->checkPlanLotDuplicate(
            $plandate,
            $Data[$i]->warehouseid,
            $Data[$i]->plantid,
            $Data[$i]->locationid,
            $Data[$i]->lotid,
            $Data[$i]->wheatvarityid
          );
          $Data[$i]->PlanMonthNotChangedFlag = $res[0]["DuplicateRecord"];
  
        }
        
      //End Mohan 26072022 for checking any record duplicate exists with other plan id 
//var_dump($Data);exit();
      for ($i=0;$i<$Length;$i++){      
        $Priority = (isset($Data[$i]->Priority) && $Data[$i]->Priority!="")? $Data[$i]->Priority:"0";
        $MovementQty = (isset($Data[$i]->Movement_Qty) && $Data[$i]->Movement_Qty!="")? $Data[$i]->Movement_Qty:"0";
        $ReleaseQty = (isset($Data[$i]->Release_Qty) && $Data[$i]->Release_Qty!="")?$Data[$i]->Release_Qty:"0";
        $Status =1;
        $PlanId=$Data[$i]->planid;
        $Monthyear="01-".$Data[$i]->PlanMonth;
        $plandate = date('Y-m-d',strtotime($Monthyear));
        $ValidTo = date('Y-m-t',strtotime($Monthyear));
        $Data[$i]->ValidFrom =$plandate;
        $Data[$i]->ValidTo =$ValidTo;
        //var_dump($ngw_weeklyplan); exit();

            if (isset($Data[$i]->PlanMonthNotChangedFlag) && $Data[$i]->PlanMonthNotChangedFlag != "0") {//TO continue existing flow
          
              $updateSql = "UPDATE ngw_weeklyplan SET Priority ='".$Priority."', planqty ='".$MovementQty."', ManualReleaseQty ='".$ReleaseQty."', Status = '".$Status."' WHERE planid ='".$Data[$i]->planid."'";
              ////echo $updateSql; exit();
              $this->db->query($updateSql);
            } else {
              //Mohan 26072022 Added for insert new record if record not exists 
              $updateSql = "UPDATE ngw_weeklyplan SET recstatus =0 WHERE planid ='".$Data[$i]->planid."'";
              ////echo $updateSql; exit();
              $this->db->query($updateSql);

              $MovementType = "MILL";
              $Actual_Stock = ($Data[$i]->SAP_Qty) - ($Data[$i]->Reserved_Stock);
              $Diff_Stock = $Data[$i]->Movement_Qty - $Actual_Stock;
              $Purchase_Plan = $Diff_Stock - $Data[$i]->Movement_Qty;
        
              $ngw_weeklyplan = array(
                'plandate' => $plandate,
                'PlanMonth' => $Data[$i]->PlanMonth,
                'planqty' => $Data[$i]->Movement_Qty,
                'Expected_Arrival' => $Data[$i]->Expected_Arrival,
                'Division' => $Data[$i]->Division,
                'ReceivingBin' => $Data[$i]->ReceivingBinId,
                'MovementType' => $MovementType,
                'validfrom' => $Data[$i]->ValidFrom,
                'validto' => $Data[$i]->ValidTo,
                'ActualStock' => $Actual_Stock,
                'Status' => 0,  //IF NEW PLAN INSERT STATUS SHOULD BE ZERO
                'keyloandoqty' => $Data[$i]->Keyloan_Cleared_Qty,
                'rndconfirmqty' => $Data[$i]->QC_Cleared_Qty,
                'fumigationclearedqty' => $Data[$i]->Fumi_Cleared_Qty,
                'wheatvarityid' => $Data[$i]->wheatvarityid,
                'fromwarehouseid' => $Data[$i]->warehouseid,
                'fromplantid' => $Data[$i]->plantid,
                'fromlocationid' => $Data[$i]->locationid,
                'fromlotid' => $Data[$i]->lotid,
                'fromlotno' => $Data[$i]->lotno,
                'Purchase_Plan' => $Purchase_Plan,
              );
              $res = $Planmodel->InsertWeeklyPlan($ngw_weeklyplan);
            }
  
        $resID = true;
      }
      return $resID;
    }

    /* Delete Weekly Plan data # Arularasu A 28-05-2022 */
    public function deletePlanList( $Id, $Data, $Length ) {

      //var_dump($Data); exit();
      $resID = false;
      for ($i=0;$i<$Length;$i++){      
        $updateSql = "UPDATE ngw_weeklyplan SET RecStatus = 0 WHERE planid = ".$Data[$i]->planid;
        //echo $updateSql; //exit();
        $this->db->query($updateSql);
        $resID = true;
      }
      return $resID;
    }

}
