<?php

namespace App\Models\Warehouse;

use App\Controllers\Api\Warehouse\SubLot;
use App\Helpers\SessionHelper;
use CodeIgniter\Model;
use ValueError;

class IASSendingModel extends Model{

    public function getSegmentDet($PO_No , $PO_LineItem){
        // $strQuery = "SELECT b.Id, a.StockSegment, a.WheatVariety 
        //             FROM intrastate_sap_to_pp a
        //             JOIN master_mrc_wheat_variety b ON a.StockSegment = b.Segment
        //             WHERE PoNumber ='$PO_No' AND PoLineItem ='$PO_LineItem'";
  
        $strQuery = "SELECT a.*, b.Id as SEG_ID, b.WheatVariety as WheatVariety FROM intrastate_sap_to_pp a
        JOIN master_mrc_wheat_variety b ON a.Segment = b.Segment
        WHERE PoNumber ='$PO_No' AND PoLineItem ='$PO_LineItem'";
        
        // echo $strQuery; exit();
  
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }

    public function getLotBySegment($SegmentId, $PlantId){
      /* Mohan 08092022 changed for Planqty - ActualQty for movement 
      $strQuery = "SELECT DISTINCT lotid as value, lotno as label FROM ngw_sublot a
      JOIN master_mrc_wheat_variety b on b.Id = '".$SegmentId."'
            AND a.wheatvarietyid = b.Id
            AND a.plantid IN (SELECT ID FROM master_plant WHERE werks IN('$PlantId'))
      JOIN master_bag mb ON a.bagtypeid = mb.BAG_REFID
      JOIN ngw_weeklyplan c ON a.plantid = c.fromplantid AND a.lotid = c.fromlotid AND c.Division = 'NAGA' 
             AND ((c.Priority = '1' AND c.MovementType = 'MILL' AND c.STATUS = '3' AND c.plandate = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') 
                 AND (c.planqty <= IF(((TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.nextfumigationdate))) > 0 
                   and (TIMESTAMPDIFF(DAY,CURRENT_DATE, date(a.nextfumigationdate)))<=ifnull(mb.FumigationValidity,0)) 
                   OR (a.fumigationstatus = 9), a.wheatqty, IF(a.FumigationSkipFlag=1 and a.FumigationSkipDate>=current_date, a.wheatqty, 0)))
                 AND (c.planqty <= IF(a.nextrnddate>=current_date,a.wheatqty,IF(a.RndSkipFlag=1 and a.RndSkipDate>=current_date, a.wheatqty, 0)))
                 AND (c.planqty <= IF(IFNULL(a.Keyloan_Pledge_Status,'NO')='YES',a.Keyloan_Release_Qty,a.wheatqty))) 
                 OR (c.Status = 2 AND c.MovementType = 'GODOWN' AND c.plandate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)))";
        */
            $strQuery = "SELECT DISTINCT lotid as value, lotno as label, 
                @Actual_Movement_Qty :=(SELECT SUM(IF(MovementQty IS NULL,'0',MovementQty))
                 FROM ngw_weeklyplan_actual wpa
                 WHERE wpa.RecStatus =1 AND (wpa.WheatVarietyId,wpa.PlantId,wpa.StorageLocationId,wpa.LotId)=
                       (c.wheatvarityid,c.fromplantid,c.fromlocationid,c.fromlotid) 
                 AND wpa.MovementDate >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) AS Actual_Movement_Qty

            FROM ngw_sublot a
            JOIN master_mrc_wheat_variety b on b.Id = '".$SegmentId."'
            AND a.wheatvarietyid = b.Id
            AND a.plantid IN (SELECT ID FROM master_plant WHERE werks IN('$PlantId'))
            JOIN master_bag mb ON a.bagtypeid = mb.BAG_REFID
            JOIN ngw_weeklyplan c ON a.plantid = c.fromplantid AND a.lotid = c.fromlotid AND c.Division = 'NAGA' 
            AND ((c.Priority = '1' AND c.MovementType = 'MILL' AND c.STATUS = '3' AND c.plandate = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') 
            AND ((c.planqty - if(@Actual_Movement_Qty is null,0,@Actual_Movement_Qty)) <= IF(((TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.nextfumigationdate))) > 0 
            and (TIMESTAMPDIFF(DAY,CURRENT_DATE, date(a.nextfumigationdate)))<=ifnull(mb.FumigationValidity,0)) 
            OR (a.fumigationstatus = 9), a.wheatqty, IF(a.FumigationSkipFlag=1 and a.FumigationSkipDate>=current_date, a.wheatqty, 0)))
            AND ((c.planqty - if(@Actual_Movement_Qty is null,0,@Actual_Movement_Qty)) <= IF(a.nextrnddate>=current_date,a.wheatqty,IF(a.RndSkipFlag=1 and a.RndSkipDate>=current_date, a.wheatqty, 0)))
            AND ((c.planqty - if(@Actual_Movement_Qty is null,0,@Actual_Movement_Qty)) <= IF(IFNULL(a.Keyloan_Pledge_Status,'NO')='YES',a.Keyloan_Release_Qty,a.wheatqty))) 
            OR (c.Status = 2 AND c.MovementType = 'GODOWN' AND c.plandate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)))";
           
        //  echo $strQuery;exit();
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }


    public function getLotBySegment_1($postData){

      // var_dump($POLineItem[0]); exit();
      $sql_1 = "SELECT Segment, SendingPlant FROM intrastate_sap_to_pp WHERE PoNumber = '$postData->PONumber' 
              AND PoLineItem IN ('$postData->POLineItem1','$postData->POLineItem2','$postData->POLineItem3')";

      //echo $sql_1; exit();

      $builder2 = $this->db->query($sql_1);
      $ans = $builder2->getResultArray();

      $Seg1 =  $ans[0]['Segment']; 
      $Seg2 =  $ans[1]['Segment']; 
      $Seg3 =  $ans[2]['Segment']; 
      $Plant =  $ans[0]['SendingPlant']; 
      //var_dump($ans); exit();

      $strQuery = "SELECT DISTINCT lotid as value, lotno as label FROM ngw_sublot a
      JOIN master_mrc_wheat_variety b on Segment IN ('$Seg1','$Seg2','$Seg3') 
            AND a.wheatvarietyid = b.Id
            AND a.plantid IN (SELECT ID FROM master_plant WHERE werks IN('$Plant'))
      JOIN master_bag mb ON a.bagtypeid = mb.BAG_REFID
      JOIN ngw_weeklyplan c ON a.plantid = c.fromplantid AND a.lotid = c.fromlotid AND c.Division = 'NAGA' 
             AND ((c.Priority = '1' AND c.MovementType = 'MILL' AND c.STATUS = '3' AND c.plandate = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') 
                 AND (c.planqty <= IF(((TIMESTAMPDIFF(DAY,CURRENT_DATE,date(a.nextfumigationdate))) > 0 
                   and (TIMESTAMPDIFF(DAY,CURRENT_DATE, date(a.nextfumigationdate)))<=ifnull(mb.FumigationValidity,0)) 
                   OR (a.fumigationstatus = 9), a.wheatqty, IF(a.FumigationSkipFlag=1 and a.FumigationSkipDate>=current_date, a.wheatqty, 0)))
                 AND (c.planqty <= IF(a.nextrnddate>=current_date,a.wheatqty,IF(a.RndSkipFlag=1 and a.RndSkipDate>=current_date, a.wheatqty, 0)))
                 AND (c.planqty <= IF(IFNULL(a.Keyloan_Pledge_Status,'NO')='YES',a.Keyloan_Release_Qty,a.wheatqty))) 
                 OR (c.MovementType = 'GODOWN' AND c.plandate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)))";

      //echo $strQuery; exit();
      $builder = $this->db->query($strQuery);
      return  $builder->getResultArray();
  }

    public function getPlanninglotDet_1($LotId, $WheatId1, $WheatId2, $WheatId3 ){    
        
        $strQuery =   "SELECT a.lotid, a.lotno, a.SAP_Qty, b.planqty, b.ReceivingBin as BinId, c.BulksiloNo as BinName, 
                              (SELECT LGORT FROM master_storage WHERE STORAGE_REFID = a.StorageLocationId) as sl_LGORT
                        FROM ngw_sublot a
                        LEFT JOIN ngw_weeklyplan b ON a.lotid = b.fromlotid 
                            AND a.plantid = b.fromplantid 
                            AND a.wheatvarietyid = b.wheatvarityid 
                            AND b.plandate ='".date('Y-m-01')."'
                        LEFT JOIN pp_bulksilono c ON c.Id = b.ReceivingBin
                        WHERE a.RecStatus = '1' AND a.lotid = '$LotId' AND a.wheatvarietyid IN ('$WheatId1', '$WheatId2', '$WheatId3')";                
    
          //echo $strQuery; exit();
    
          $builder = $this->db->query($strQuery);
          return  $builder->getResultArray();
    }

    public function getPlanninglotDet($LotId, $WheatId ){    
        
      $strQuery =   "SELECT a.lotid, a.lotno, a.SAP_Qty, b.planqty, b.ReceivingBin as BinId, c.BulksiloNo as BinName,
                            (SELECT LGORT FROM master_storage WHERE STORAGE_REFID = a.StorageLocationId) as sl_LGORT
                      FROM ngw_sublot a
                      LEFT JOIN ngw_weeklyplan b ON a.lotid = b.fromlotid 
                          AND a.plantid = b.fromplantid 
                          AND a.wheatvarietyid = b.wheatvarityid 
                          AND IF(b.MovementType = 'MILL', b.plandate ='".date('Y-m-01')."', b.plandate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) 
                      LEFT JOIN pp_bulksilono c ON c.Id = b.ReceivingBin
                      WHERE a.RecStatus = '1' AND a.lotid = '$LotId' AND a.wheatvarietyid = '$WheatId'";                
  
                      //AND b.plandate ='".date('Y-m-01')."'
        // echo $strQuery; exit();
  
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
  }


    public function getVADetails($Id){
        $strQuery = "SELECT a.*, b.OwnWB as WbType FROM empty_vehicle_arrival a 
                      JOIN master_plant b ON a.PLANT_ID = b.werks
                      WHERE a.ID ='".$Id."'";
  
        //echo  $strQuery;
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }

    public function getPODetails($PO_No){
      
        // $strQuery = "SELECT a.*, b.id as Segmentid FROM intrastate_sap_to_pp a 
        // LEFT JOIN master_mrc_wheat_variety b ON a.StockSegment = b.Segment
        // WHERE PoNumber='".$PO_No."'";
        
        // $strQuery = "SELECT a.*, b.id as Segmentid, c.lotno, c.lotid FROM intrastate_sap_to_pp a 
        // LEFT JOIN master_mrc_wheat_variety b ON a.StockSegment = b.Segment
        // LEFT JOIN ngw_sublot c ON b.id = c.wheatvarietyid
        // WHERE PoNumber='".$PO_No."'";
  
        /*
  
        SELECT
        a.*,
        b.id AS Segmentid,
        c.lotno,
        c.lotid
        FROM intrastate_sap_to_pp a
        LEFT JOIN master_mrc_wheat_variety b ON a.StockSegment = b.Segment
        LEFT JOIN ngw_sublot c ON b.id = c.wheatvarietyid 
            AND c.StorageLocationId = (SELECT STORAGE_REFID FROM master_storage WHERE LGORT = a.SendingStorageLocation AND a.SisterConcernFrom = plantid)
          AND a.SisterConcernFrom = c.plantid
        WHERE PoNumber = '1700025502' ORDER BY id
  
        */
  
        $strQuery = "SELECT
        a.*,
        b.id AS Segmentid,
        c.lotno,
        c.lotid
        FROM intrastate_sap_to_pp a
        LEFT JOIN master_mrc_wheat_variety b ON a.Segment = b.Segment
        LEFT JOIN ngw_sublot c ON b.id = c.wheatvarietyid AND c.StorageLocationId = (SELECT STORAGE_REFID FROM master_storage WHERE LGORT = a.SendingStorageLocation AND a.SendingPlant = plantid)
        AND a.SendingPlant = c.plantid
        WHERE PoNumber = '$PO_No' ORDER BY id";
  
        //echo $strQuery; exit();
  
  
                    // $strQuery = "SELECT lotno AS label,  lotid AS value
                    //  FROM `ngw_sublot`   a
                    //  JOIN master_mrc_wheat_variety b ON b.id = a.wheatvarietyid
                    //  WHERE RecStatus = '1' AND b.Segment IN('".$Seg1."','".$Seg2.'","'.$Seg3."')";
  
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }

    public function getLotNumberBySegment($Seg1,$Seg2,$Seg3){
        $strQuery = "SELECT lotno AS label,  lotid AS value
                     FROM `ngw_sublot`   a
                     JOIN master_mrc_wheat_variety b ON b.id = a.wheatvarietyid
                     WHERE RecStatus = '1' AND b.Segment IN('".$Seg1."','".$Seg2.'","'.$Seg3."')";
  
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }

    public function getWeight($VA_Number){
        $strQuery = "SELECT * FROM pp_silotomillweights WHERE RecStatus = '1' AND VANumber ='".$VA_Number."'";
  
        //echo $strQuery;
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }

    public function SavePO_Submit($postData){
        $session = session();
        $SessionUser = $_SESSION["USERID"];
        $SessionUserName = $_SESSION["FIRSTNAME"];
        $CurrentDateTime = date("Y-m-d H:i:s");
  
        //$this->db->transStart(); 
      
        //var_dump($postData); exit();

        if (isset($postData->EditFlag)){
          //for Edit Reversal
           $this->IAS_Reversal($postData);
  
        }
        
        //var_dump($postData); exit(); //substring_index ("ABC| BGF| TYH ",'|',1)
        //**************************************************** */
        $VA_Id ="";
        $InsDt = "";
        $VA_sql = "SELECT ID, DateAdded, DateModified FROM `empty_vehicle_arrival` WHERE ZVA_NUMBER ='$postData->VANumber'";
        $builder = $this->db->query($VA_sql);
        $Res = $builder->getResultArray();
        $VA_Id = $Res[0]['ID'];
        $DateAdded  = $Res[0]['DateAdded'];
        $DateModified  = $Res[0]['DateModified'];
  
        //**************************************************** */
        $u_eva_sql = "UPDATE empty_vehicle_arrival SET 
                      UpdateLotDt='$CurrentDateTime',UpdateLotByName='$SessionUserName',UpdateLotBy='$SessionUser',
                      PONumber ='$postData->PO_No',
                      PODt='$CurrentDateTime',POByName='$SessionUserName', POBy='$SessionUser', 
                      VEHICLE_STATUS ='5'
                      WHERE ID = '".$VA_Id."'";
        $builder1 = $this->db->query($u_eva_sql);
  
        //**************************************************** */
        
        $u_sql1 = "UPDATE intrastate_sap_to_pp SET 
                  SendingStorageLocation ='".$postData->SendingStorageLocation."', 
  
                  BagType =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType1Lot1id)."'),
                  BagType2 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType2Lot1id)."'),
                  BagType3 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType3Lot1id)."'),
                  
                  no_bags ='".$postData->NoofBags1Lot1."',no_bags2 ='".$postData->NoofBags2Lot1."',no_bags3 ='".$postData->NoofBags3Lot1."',
                  
                  BagCuttingType1 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagCuttingType1Lot1id)."'),
                  BagCuttingType2 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagCuttingType2Lot1id)."'),
                  BagCuttingType3 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagCuttingType3Lot1id)."'),
                  
                  BagCuttingVendor1 ='".$postData->BagCuttingVendor1Lot1."',BagCuttingVendor2 ='".$postData->BagCuttingVendor2Lot1."',BagCuttingVendor3 ='".$postData->BagCuttingVendor3Lot1."',
                  CuttingCharges1 ='".$postData->Charges1Lot1."',CuttingCharges2 ='".$postData->Charges2Lot1."',CuttingCharges3 ='".$postData->Charges3Lot1."',
                  WbEmptyWt ='".$postData->FirstWeight."',WbLoadWt ='".$postData->SecondWeight."',WbNetWt ='".$postData->NetWeight."',
                  GunnyWt ='".$postData->GunnyWeight."',GunnyLessNetWt ='".$postData->GunnylessWeight."' 
                  WHERE PoNumber ='".$postData->PO_No."' AND PoLineItem ='".$postData->POLineItemName1."'";
  
        $builders1 = $this->db->query($u_sql1);
  
        $u_sql2 = "UPDATE intrastate_sap_to_pp SET 
                  SendingStorageLocation ='".$postData->SendingStorageLocation."',
  
                  BagType =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType1Lot2id)."'),
                  BagType2 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType2Lot2id)."'),
                  BagType3 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType3Lot2id)."'),
  
                  no_bags ='".$postData->NoofBags1Lot2."',no_bags2 ='".$postData->NoofBags2Lot2."',no_bags3 ='".$postData->NoofBags3Lot2."',
  
                  BagCuttingType1 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagCuttingType1Lot2id)."'),
                  BagCuttingType2 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagCuttingType2Lot2id)."'),
                  BagCuttingType3 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagCuttingType3Lot2id)."'),
  
                  BagCuttingVendor1 ='".$postData->BagCuttingVendor1Lot2."',BagCuttingVendor2 ='".$postData->BagCuttingVendor2Lot2."',BagCuttingVendor3 ='".$postData->BagCuttingVendor3Lot2."',
                  CuttingCharges1 ='".$postData->Charges1Lot2."',CuttingCharges2 ='".$postData->Charges2Lot2."',CuttingCharges3 ='".$postData->Charges3Lot2."',
                  WbEmptyWt ='".$postData->FirstWeight."',WbLoadWt ='".$postData->SecondWeight."',WbNetWt ='".$postData->NetWeight."',
                  GunnyWt ='".$postData->GunnyWeight."',GunnyLessNetWt ='".$postData->GunnylessWeight."' 
                  WHERE PoNumber ='".$postData->PO_No."' AND PoLineItem ='".$postData->POLineItemName2."'";
        $builders2 = $this->db->query($u_sql2);
  
        $u_sql3 = "UPDATE intrastate_sap_to_pp SET 
                  SendingStorageLocation ='".$postData->SendingStorageLocation."',
  
                  BagType =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType1Lot3id)."'),
                  BagType2 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType2Lot3id)."'),
                  BagType3 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType3Lot3id)."'),
  
                  no_bags ='".$postData->NoofBags1Lot3."',no_bags2 ='".$postData->NoofBags2Lot3."',no_bags3 ='".$postData->NoofBags3Lot3."',
                  
                  BagCuttingType1 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagCuttingType1Lot3id)."'),
                  BagCuttingType2 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagCuttingType2Lot3id)."'),
                  BagCuttingType3 =(SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagCuttingType3Lot3id)."'),
  
                  BagCuttingVendor1 ='".$postData->BagCuttingVendor1Lot3."',BagCuttingVendor2 ='".$postData->BagCuttingVendor2Lot3."',BagCuttingVendor3 ='".$postData->BagCuttingVendor3Lot3."',
                  CuttingCharges1 ='".$postData->Charges1Lot3."',CuttingCharges2 ='".$postData->Charges2Lot3."',CuttingCharges3 ='".$postData->Charges3Lot3."',
                  WbEmptyWt ='".$postData->FirstWeight."',WbLoadWt ='".$postData->SecondWeight."',WbNetWt ='".$postData->NetWeight."',
                  GunnyWt ='".$postData->GunnyWeight."',GunnyLessNetWt ='".$postData->GunnylessWeight."' 
                  WHERE PoNumber ='".$postData->PO_No."' AND PoLineItem ='".$postData->POLineItemName3."'";
        $builders3 = $this->db->query($u_sql3);
  
        //**************************************************** */
        $s_istp_sql = "SELECT SendingPlant, ReceivingPlant, SendingStorageLocation,
                              ReceivingStorageLoc, WheatVariety, WbNetWt , PO_Quantity
                       FROM `intrastate_sap_to_pp` WHERE PoNumber ='".$postData->PO_No."' AND PoLineItem ='".$postData->POLineItemName1."'";
        $builder2 = $this->db->query($s_istp_sql);
        $ans = $builder2->getResultArray();

        $SendingPlant = $ans[0]['SendingPlant'];
        $ReceivingPlant = $ans[0]['ReceivingPlant'];
        $SendingStorageLocation = $ans[0]['SendingStorageLocation'];
        $ReceivingStorageLoc = $ans[0]['ReceivingStorageLoc'];
        $WheatVariety = $ans[0]['WheatVariety'];
        $WbNetWt = $ans[0]['WbNetWt'];
        $PO_Qty=$ans[0]['PO_Quantity'];
        $PO_Qty2="0";
        $PO_Qty3="0";
          
            if ($postData->POLineItemName2 != "") {
              $lineItem_sql2 = "SELECT SendingPlant, ReceivingPlant, SendingStorageLocation,
              ReceivingStorageLoc, WheatVariety, WbNetWt , PO_Quantity
              FROM `intrastate_sap_to_pp` WHERE PoNumber ='" . $postData->PO_No . "' AND PoLineItem ='" . $postData->POLineItemName2. "'";

        // echo $lineItem_sql2;

              $LineItem_builder2 = $this->db->query($lineItem_sql2);
              
              // echo "Rows : ". $LineItem_builder2->num_rows. " X"; 

              if ($LineItem_builder2->num_rows> 0 ){
                $ans = $LineItem_builder2->getResultArray();
                $PO_Qty2 = $ans[0]['PO_Quantity'];
              }
            }
  
            if ($postData->POLineItemName3 != "") {
              $lineItem_sql3 = "SELECT SendingPlant, ReceivingPlant, SendingStorageLocation,
        ReceivingStorageLoc, WheatVariety, WbNetWt , PO_Quantity
        FROM `intrastate_sap_to_pp` WHERE PoNumber ='" . $postData->PO_No . "' AND PoLineItem ='" . $postData->POLineItemName3 . "'";
              $LineItem_builder3 = $this->db->query($lineItem_sql3);
              $ans = $LineItem_builder3->getResultArray();
  
              if ($LineItem_builder3->num_rows> 0 ){
                $ans = $LineItem_builder3->getResultArray();
                $PO_Qty3 = $ans[0]['PO_Quantity'];
              }
            }
        //**************************************************** */
        if (!empty($postData->MovementQty1)){
          $UpdateWeeklyPlan1 = "INSERT INTO `ngw_weeklyplan_actual`
            (`VANumber`,`WarehouseId`, `PlantId`, `StorageLocationId`,`WheatVarietyId`, `LotId`, `MovementDate`, `MovementQty`) 
            VALUES 
            ('".$postData->VANumber."',
            (SELECT IFNULL(b.wh_refid,0) FROM `master_plant` a, warehouse_master b where a.WH_CODE=b.wh_code and a.werks='$SendingPlant' limit 1),
            (SELECT IFNULL(ID,0) FROM `master_plant` where werks='$SendingPlant' limit 1),
            (SELECT IFNULL(STORAGE_REFID,0) FROM `master_storage` where LGORT='$postData->SendingStorageLocation' limit 1),
            '$postData->SegmentId1','$postData->LoadedLotNoid1','$CurrentDateTime','$postData->MovementQty1')";
          $builder3 = $this->db->query($UpdateWeeklyPlan1);   
        }
  
        if (!empty($postData->MovementQty2)){
          $UpdateWeeklyPlan2 = "INSERT INTO `ngw_weeklyplan_actual`
            (`VANumber`,`WarehouseId`, `PlantId`, `StorageLocationId`,`WheatVarietyId`, `LotId`, `MovementDate`, `MovementQty`) 
            VALUES 
            ('".$postData->VANumber."',
            (SELECT IFNULL(b.wh_refid,0) FROM `master_plant` a, warehouse_master b where a.WH_CODE=b.wh_code and a.werks='$SendingPlant' limit 1),
            (SELECT IFNULL(ID,0) FROM `master_plant` where werks='$SendingPlant' limit 1),
            (SELECT IFNULL(STORAGE_REFID,0) FROM `master_storage` where LGORT='$postData->SendingStorageLocation' limit 1),
            '$postData->SegmentId2','$postData->LoadedLotNoid2','$CurrentDateTime','$postData->MovementQty2')";
          $builder3 = $this->db->query($UpdateWeeklyPlan2);   
        }
        
        if (!empty($postData->MovementQty3)){
          $UpdateWeeklyPlan3 = "INSERT INTO `ngw_weeklyplan_actual`
            (`VANumber`,`WarehouseId`, `PlantId`, `StorageLocationId`,`WheatVarietyId`, `LotId`, `MovementDate`, `MovementQty`) 
            VALUES 
            ('".$postData->VANumber."',
            (SELECT IFNULL(b.wh_refid,0) FROM `master_plant` a, warehouse_master b where a.WH_CODE=b.wh_code and a.werks='$SendingPlant' limit 1),
            (SELECT IFNULL(ID,0) FROM `master_plant` where werks='$SendingPlant' limit 1),
            (SELECT IFNULL(STORAGE_REFID,0) FROM `master_storage` where LGORT='$postData->SendingStorageLocation' limit 1),
            '$postData->SegmentId3','$postData->LoadedLotNoid3','$CurrentDateTime','$postData->MovementQty3')";
          $builder3 = $this->db->query($UpdateWeeklyPlan3);   
        }
        
        //**************************************************** */
        $Qry = "SELECT * FROM `empty_vehicle_arrival` where ID='".$VA_Id."'";
        $builder4 = $this->db->query($Qry);
        $Result = $builder4->getResultArray();
          
        $ZVA_NUMBER =$Result[0]['ZVA_NUMBER'];
        $PLANT_ID = $Result[0]['PLANT_ID'];
  
        if ($postData->BagType1Lot1 != "" && $postData->BagType1Lot1 == strtoupper("Loose Wheat|0.00")) {
          $bag_sql1 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
          `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
          `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,`approvestatus`) 
          VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0',
          (SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType1Lot1id)."'),
          '".$postData->NoofBags1Lot1."',
          '$SendingPlant','$postData->SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
          '".$postData->BagCuttingVendor1Lot1."','".$postData->Charges1Lot1."','1')";
          
          $builder5 = $this->db->query($bag_sql1);
        }
  
        if ($postData->BagType2Lot1 != "" && $postData->BagType2Lot1 == strtoupper("Loose Wheat|0.00")) {
          $bag_sql2 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
          `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
          `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,`approvestatus`) 
          VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0',
          (SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType2Lot1id)."'),
          '".$postData->NoofBags2Lot1."',
          '$SendingPlant','$postData->SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
          '".$postData->BagCuttingVendor2Lot1."','".$postData->Charges2Lot1."','1')";
          
          $builder6 = $this->db->query($bag_sql2);
        }
  
        if ($postData->BagType3Lot1 != "" && $postData->BagType3Lot1 == strtoupper("Loose Wheat|0.00")) {
          $bag_sql3 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
          `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
          `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,`approvestatus`) 
          VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0',
          (SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType3Lot1id)."'),
          '".$postData->NoofBags3Lot1."',
          '$SendingPlant','$postData->SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
          '".$postData->BagCuttingVendor3Lot1."','".$postData->Charges3Lot1."','1')";
          
          $builder7 = $this->db->query($bag_sql3);
        }
        //************************************************** */
  
        if ($postData->BagType1Lot2 != "" && $postData->BagType1Lot2 == strtoupper("Loose Wheat|0.00")) {
          $bag_sql4 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
          `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
          `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,`approvestatus`) 
          VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0',
          (SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType1Lot2id)."'),
          '".$postData->NoofBags1Lot2."',
          '$SendingPlant','$postData->SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
          '".$postData->BagCuttingVendor1Lot2."','".$postData->Charges1Lot2."','1')";
          
          $builder8 = $this->db->query($bag_sql4);
        }
  
        if ($postData->BagType2Lot2 != "" && $postData->BagType2Lot2 == strtoupper("Loose Wheat|0.00")) {
          $bag_sql5 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
          `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
          `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,`approvestatus`) 
          VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0',
          (SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType2Lot2id)."'),
          '".$postData->NoofBags2Lot2."',
          '$SendingPlant','$postData->SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
          '".$postData->BagCuttingVendor2Lot2."','".$postData->Charges2Lot2."','1')";
          
          $builder9 = $this->db->query($bag_sql5);
        }
  
        if ($postData->BagType3Lot2 != "" && $postData->BagType3Lot2 == strtoupper("Loose Wheat|0.00")) {
          $bag_sql8 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
          `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
          `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,`approvestatus`) 
          VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0',
          (SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType3Lot2id)."'),
          '".$postData->NoofBags3Lot2."',
          '$SendingPlant','$postData->SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
          '".$postData->BagCuttingVendor3Lot2."','".$postData->Charges3Lot2."','1')";
          
          $builder12 = $this->db->query($bag_sql8);
        }
        /**************************************************** */
  
        if ($postData->BagType1Lot3 != "" && $postData->BagType1Lot3 == strtoupper("Loose Wheat|0.00")) {
          $bag_sql6 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
          `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
          `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,`approvestatus`) 
          VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0',
          (SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType1Lot3id)."'),
          '".$postData->NoofBags1Lot3."',
          '$SendingPlant','$postData->SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
          '".$postData->BagCuttingVendor1Lot3."','".$postData->Charges1Lot3."','1')";
          
          $builder10 = $this->db->query($bag_sql6);
        }
  
        if ($postData->BagType2Lot3 != "" && $postData->BagType2Lot3 == strtoupper("Loose Wheat|0.00")) {
          $bag_sql7 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
          `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
          `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,`approvestatus`) 
          VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0',
          (SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType2Lot3id)."'),
          '".$postData->NoofBags2Lot3."',
          '$SendingPlant','$postData->SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
          '".$postData->BagCuttingVendor2Lot3."','".$postData->Charges2Lot3."','1')";
          
          $builder11 = $this->db->query($bag_sql7);
        }
  
        if ($postData->BagType3Lot3 != "" && $postData->BagType3Lot3 == strtoupper("Loose Wheat|0.00")) {
          $bag_sql9 = "INSERT INTO `ngw_bag_cutting_approval`(`va_no`,  `delivery_date`, `delivery_qty`,
          `bag_type`, `no_of_bags`, `sending_plant`, `sending_stroage_location`, `receiving_plant`,
          `receiving_stroage_location`, `wheat_variety`, `bag_cutting_vendor`, `bag_cutting_charges`,`approvestatus`) 
          VALUES ('$ZVA_NUMBER',CURRENT_DATE,'0',
          (SELECT BAG_CODE FROM master_bag WHERE BAG_REFID ='".trim($postData->BagType3Lot3id)."'),
          '".$postData->NoofBags3Lot3."',
          '$SendingPlant','$postData->SendingStorageLocation','$ReceivingPlant','$ReceivingStorageLoc','$WheatVariety',
          '".$postData->BagCuttingVendor3Lot3."','".$postData->Charges3Lot3."','1')";
          
          $builder13 = $this->db->query($bag_sql9);
        }
        //**************************************************** */
        // Added 01-09-2022 For moving previous VA record to recstatus 0 and VehicleArrivalId as -(minusid)
        $Query15 = "update intrastate_warhouse_dispatch_info set recstatus = 0, VehicleArrivalId=-VehicleArrivalId where VehicleArrivalId = '$VA_Id'";
        $builder15 = $this->db->query($Query15);
        
        // for Edit we Reserved Already so insert Directly in intrastate_warhouse_dispatch_info
        $strQuery = "INSERT INTO intrastate_warhouse_dispatch_info 
                    (`VehicleArrivalId`, `DateAdded`, `DateModified`, 
                    `LoadedLotNo`, `LoadedLotNo2`, `LoadedLotNo3`,
                     `LastMileTransporterId`, `LastMileTransporter`, `LoadingVendorId`, `LoadingVendor`, `LoadingChargesPerTon`, 
                     `FreightChargesPerTon`, `StoPoNo`, `IsTruck`, `TruckNo`, `WbSlipCopy`, `WbSlipCopy2`,
                     `SendingPlant`,`WheatVariety`, `ReceivingPlant`,`ReceivingStorageLocation`,`SendingStorageLocation`,
                     `WbType`,
                     `PickslipNo`,
                     `PO_Number`,	
                     `PO_LineItem`,	`PO_LineItem2`,	`PO_LineItem3`,	
                     `Segment`,	`Segment2`,	`Segment3`,
  
                     `WheatVariety2`,	`WheatVariety3`,	
                     `MaterialNo2`,	`MaterialNo3`,	
                     `EwayBillNo`,	`DeliveryDate`,	
                     `DeliveryNo`,	
  
                     `WbEmptyWt`,	`WbNetWt`,	`WbLoadWt`,	`GunnyWt`,	`GunnyLessNetWt`,	
                     `BagType`,	`L1_BagType2`,	`L1_BagType3`,	
                     `L2_BagType`,	`L2_BagType2`,	`L2_BagType3`,	
                     `L3_BagType`,	`L3_BagType2`,	`L3_BagType3`,	
                     
                     `L1_NoofBags`,	`L1_NoofBags2`,	`L1_NoofBags3`,	
                     `L2_NoofBags`,	`L2_NoofBags2`,	`L2_NoofBags3`,	
                     `L3_NoofBags`,	`L3_NoofBags2`,	`L3_NoofBags3`,	
                     
                     `L1_CuttingBagType`,	`L1_CuttingBagType2`,	`L1_CuttingBagType3`,	
                     `L2_CuttingBagType`,	`L2_CuttingBagType2`,	`L2_CuttingBagType3`,	
                     `L3_CuttingBagType`,	`L3_CuttingBagType2`,	`L3_CuttingBagType3`,	
                     
                     `L1_CuttingVendor`,	`L1_CuttingVendor2`,	`L1_CuttingVendor3`,	
                     `L2_CuttingVendor`,	`L2_CuttingVendor2`,	`L2_CuttingVendor3`,	
                     `L3_CuttingVendor`,	`L3_CuttingVendor2`,	`L3_CuttingVendor3`,	
                     
                     `L1_CuttingCharges`,	`L1_CuttingCharges2`,	`L1_CuttingCharges3`,	
                     `L2_CuttingCharges`,	`L2_CuttingCharges2`,	`L2_CuttingCharges3`,	
                     `L3_CuttingCharges`,	`L3_CuttingCharges2`,	`L3_CuttingCharges3`,
                     `ReceivingBin_id`, `ReceivingBin_Name`,
                     
                     `LoadedLotNoid`, `LoadedLotNo2id`, `LoadedLotNo3id`,
  
                     `BagType1Lot1id`, `BagType2Lot1id`, `BagType3Lot1id`,
                     `BagCuttingType1Lot1id`, `BagCuttingType2Lot1id`, `BagCuttingType3Lot1id`,
                     `BagCuttingVendor1Lot1id`, `BagCuttingVendor2Lot1id`, `BagCuttingVendor3Lot1id`,
  
                     `BagType1Lot2id`, `BagType2Lot2id`, `BagType3Lot2id`,
                     `BagCuttingType1Lot2id`, `BagCuttingType2Lot2id`, `BagCuttingType3Lot2id`,
                     `BagCuttingVendor1Lot2id`, `BagCuttingVendor2Lot2id`, `BagCuttingVendor3Lot2id`,
  
                     `BagType1Lot3id`, `BagType2Lot3id`, `BagType3Lot3id`,
                     `BagCuttingType1Lot3id`, `BagCuttingType2Lot3id`, `BagCuttingType3Lot3id`,
                     `BagCuttingVendor1Lot3id`, `BagCuttingVendor2Lot3id`, `BagCuttingVendor3Lot3id`,
  
                     PO_Qty,  PO_Qty2, PO_Qty3
                     )
  
                    VALUES(
                     '$VA_Id','$DateAdded','$DateModified', 
                     '$postData->LoadedLotNo1','$postData->LoadedLotNo2','$postData->LoadedLotNo3',
                     '$postData->LastMileTransportid','$postData->LastMileTransport', '$postData->LoadingVendorid','$postData->LoadingVendor' ,'$postData->LoadingCharges',
                     '$postData->FreightCharges','$postData->PO_No','1','$postData->TruckNumber','$postData->first_weighment_attachment','$postData->second_weighment_attachment',
                     '$SendingPlant','$postData->WheatVariety1','$ReceivingPlant','$ReceivingStorageLoc', '$SendingStorageLocation',
                     (SELECT if(OwnWB = 1,'Own WB','Outside Wb') FROM master_plant WHERE werks ='".$SendingPlant."'),
                     '$postData->PO_No','$postData->PO_No',
                     '".$postData->POLineItemid1."','".$postData->POLineItemid2."','".$postData->POLineItemid3."',
                     '$postData->Segment1','$postData->Segment2','$postData->Segment3',
                     '$postData->WheatVariety2','$postData->WheatVariety3',
                     
                     '','','',null,'',
                     
                     '$postData->FirstWeight','$postData->NetWeight','$postData->SecondWeight','$postData->GunnyWeight','$postData->GunnylessWeight',
                     
                     '$postData->BagType1Lot1','$postData->BagType2Lot1','$postData->BagType3Lot1',
                     '$postData->BagType1Lot2','$postData->BagType2Lot2','$postData->BagType3Lot2',
                     '$postData->BagType1Lot3','$postData->BagType2Lot3','$postData->BagType3Lot3',
  
                     '$postData->NoofBags1Lot1','$postData->NoofBags2Lot1','$postData->NoofBags3Lot1',
                     '$postData->NoofBags1Lot2','$postData->NoofBags2Lot2','$postData->NoofBags3Lot2',
                     '$postData->NoofBags1Lot3','$postData->NoofBags2Lot3','$postData->NoofBags3Lot3',
  
                     '$postData->BagCuttingType1Lot1','$postData->BagCuttingType2Lot1','$postData->BagCuttingType3Lot1',
                     '$postData->BagCuttingType1Lot2','$postData->BagCuttingType2Lot2','$postData->BagCuttingType3Lot2',
                     '$postData->BagCuttingType1Lot3','$postData->BagCuttingType2Lot3','$postData->BagCuttingType3Lot3',
  
                     '$postData->BagCuttingVendor1Lot1','$postData->BagCuttingVendor2Lot1','$postData->BagCuttingVendor3Lot1',
                     '$postData->BagCuttingVendor1Lot2','$postData->BagCuttingVendor2Lot2','$postData->BagCuttingVendor3Lot2',
                     '$postData->BagCuttingVendor1Lot3','$postData->BagCuttingVendor2Lot3','$postData->BagCuttingVendor3Lot3',
  
                     '$postData->Charges1Lot1','$postData->Charges2Lot1','$postData->Charges3Lot1',
                     '$postData->Charges1Lot2','$postData->Charges2Lot2','$postData->Charges3Lot2',
                     '$postData->Charges1Lot3','$postData->Charges2Lot3','$postData->Charges3Lot3',
                     '$postData->ReceivingBinid','$postData->ReceivingBin',
  
                     '$postData->LoadedLotNoid1', '$postData->LoadedLotNoid2', '$postData->LoadedLotNoid3',
  
                     '$postData->BagType1Lot1id', '$postData->BagType2Lot1id', '$postData->BagType3Lot1id',
                     '$postData->BagCuttingType1Lot1id', '$postData->BagCuttingType2Lot1id', '$postData->BagCuttingType3Lot1id',
                     '$postData->BagCuttingVendor1Lot1id', '$postData->BagCuttingVendor2Lot1id', '$postData->BagCuttingVendor3Lot1id',
  
                     '$postData->BagType1Lot2id', '$postData->BagType2Lot2id', '$postData->BagType3Lot2id',
                     '$postData->BagCuttingType1Lot2id', '$postData->BagCuttingType2Lot2id', '$postData->BagCuttingType3Lot2id',
                     '$postData->BagCuttingVendor1Lot2id', '$postData->BagCuttingVendor2Lot2id', '$postData->BagCuttingVendor3Lot2id',
  
                     '$postData->BagType1Lot3id', '$postData->BagType2Lot3id', '$postData->BagType3Lot3id',
                     '$postData->BagCuttingType1Lot3id', '$postData->BagCuttingType2Lot3id', '$postData->BagCuttingType3Lot3id',
                     '$postData->BagCuttingVendor1Lot3id', '$postData->BagCuttingVendor2Lot3id', '$postData->BagCuttingVendor3Lot3id',
                     '$PO_Qty','$PO_Qty2','$PO_Qty3'
  
                     )";
                    
                     //echo $strQuery; exit();
        $builder14 = $this->db->query($strQuery);
        $IasDispatchId=$this->insertID();
        //**************************************************** */
        // if (isset($postData->EditFlag)){
          
          
          $user = '';
          // for Edit we Reserved Already so insert Directly in intrastate_gateout_info 
          $sql ="INSERT INTO  intrastate_gateout_info 
          (`DateAdded`, `DateModified`, `AddedBy`, `ModifiedBy`, `ReceivingArrivalId`, `EmptyVehicleArrivalId`, 
          `IasDispatchId`, `UnloadedLotNo`, `unloadingvendorid`, `UnLoadingVendor`, `UnloadingChargePerTon`, 
          `WbType`, `WbName`, `WbSerialNumber`, `WbTicketNumber`, `WbEmptyWt`, `WbNetWt`, `WbLoadWt`, `GunnyWt`, 
          `GunnyLessNetWt`, `BagType`, `NagaOutsideWBCopy`, `VehicleStatus`, `WBCopy`, `bagtype2`, `bagtype3`, 
          `no_bags`, `no_bags2`, `no_bags3`) 
          VALUES 
          ('$DateAdded', '$DateModified', '$user', '$user', 
          (SELECT PI_REFID FROM purchase_info WHERE ZVA_NUMBER ='$postData->VANumber' limit 1), '$VA_Id', 
           '$IasDispatchId', '$postData->Rec_UnloadLotNo1', '$postData->UnloadingVendor_Id', '$postData->UnloadingVendor','$postData->UnloadingCharges',
           (SELECT if(OwnWB = 1,'Own WB','Outside Wb') FROM master_plant WHERE werks ='".$postData->SendingPlant."' limit 1), 
           '', '', '', '$postData->emptyWt', '$postData->netWt', '$postData->loadWt', '$postData->gunnyWt',
           '$postData->gunnylessWt', '$postData->Rec_BagType1Lot1', '', '$postData->VehicleStatus', '', '$postData->Rec_BagType2Lot1','$postData->Rec_BagType3Lot1',
           '$postData->Rec_NoofBags1Lot1', '$postData->Rec_NoofBags2Lot1', '$postData->Rec_NoofBags3Lot1')";
  
           $builder = $this->db->query($sql);
  
  
          //************************************************* */
          //Purchase Info Table
          if (isset($postData->EditFlag)){
            $sql = "UPDATE purchase_info SET PO_LINE_ITEM = '$postData->POLineItemid1', WERKS ='$postData->ReceivingPlant', DateModified= current_timestamp , ZQTY ='$postData->TotalMovementQty', ZPO_NUMBER = '$postData->PO_No' WHERE ZVA_NUMBER ='$postData->VANumber'";
            $builder = $this->db->query($sql);
          }
  
        // }
  
        return  $builder->getResultArray();
    }

    public function SavePO_Reject($VA_No, $VehicleStatus, $Reason){
        $strQuery = "UPDATE empty_vehicle_arrival SET VEHICLE_STATUS = '$VehicleStatus', RejectionStatus ='$Reason' WHERE ZVA_NUMBER ='$VA_No'";
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }

    public function getPONumber_1(){
        $builder = $this->db->query("SELECT distinct PoNumber AS label, PoNumber AS value FROM intrastate_sap_to_pp");
        return  $builder->getResultArray();
    }

    public function getPONumber($werks){
      $strQuery = "SELECT DISTINCT PoNumber AS label, PoNumber AS value FROM intrastate_sap_to_pp WHERE SendingPlant ='".$werks."' AND PoNumber !=0";
      //echo $strQuery;exit();

      $builder = $this->db->query($strQuery);
      return  $builder->getResultArray();
  }
      
    public function getIASPOEditDet($PoNo, $VA_No){

        $cnd="";
        $query = "select 
        intrad.Id, intrad.VehicleArrivalId, intrad.IntraStateSapId, intrad.DateAdded, intrad.DateModified, intrad.AddedBy, 
        intrad.ModifiedBy, intrad.IsRedirected, intrad.IsSendingRedirected, 
    
        intrad.LoadedLotNo, intrad.LoadedLotNo2, intrad.LoadedLotNo3, 
        intrad.LoadedLotNoid, intrad.LoadedLotNo2id, intrad.LoadedLotNo3id,
    
        intrad.LastMileTransporterId, intrad.LastMileTransporter, intrad.LoadingVendorId, intrad.LoadingVendor, intrad.LoadingChargesPerTon, 
        intrad.FreightChargesPerTon, intrad.PickslipNo, intrad.SendingPlant, intrad.WheatVariety, intrad.MaterialNo, 
        intrad.ReceivingPlant, intrad.ReceivingStorageLocation, intrad.SendingStorageLocation, intrad.StoPoNo, 
        intrad.PO_Number, 
        intrad.PO_LineItem, intrad.PO_LineItem2, intrad.PO_LineItem3, 
        intrad.Segment, intrad.Segment2, intrad.Segment3, 
        
        (Select Id From master_mrc_wheat_variety Where Segment = intrad.Segment LIMIT 1) as WheatvarietyId1,
        (Select Id From master_mrc_wheat_variety Where Segment = intrad.Segment2 LIMIT 1) as WheatvarietyId2,
        (Select Id From master_mrc_wheat_variety Where Segment = intrad.Segment3 LIMIT 1) as WheatvarietyId3,
    
        intrad.WheatVariety2, intrad.WheatVariety3, 
        intrad.MaterialNo2, intrad.MaterialNo3, intrad.EwayBillNo, intrad.DeliveryDate, 
        intrad.PO_Qty, intrad.PO_Qty2, intrad.PO_Qty3, intrad.DeliveryNo, intrad.WbType, intrad.WbName, intrad.WbSerialNumber, 
        intrad.WbTicketNumber, intrad.WbEmptyWt, intrad.WbNetWt, intrad.WbLoadWt, intrad.GunnyWt, intrad.GunnyLessNetWt, 
    
        intrad.BagType1Lot1id, intrad.BagType2Lot1id, intrad.BagType3Lot1id, 
        intrad.BagType1Lot2id, intrad.BagType2Lot2id, intrad.BagType3Lot2id, 
        intrad.BagType1Lot3id, intrad.BagType2Lot3id, intrad.BagType3Lot3id, 
        intrad.BagType, intrad.L1_BagType2, intrad.L1_BagType3, 
        intrad.L2_BagType, intrad.L2_BagType2, intrad.L2_BagType3, 
        intrad.L3_BagType, intrad.L3_BagType2, intrad.L3_BagType3, 
        intrad.L1_NoofBags, intrad.L1_NoofBags2, intrad.L1_NoofBags3, 
        intrad.L2_NoofBags, intrad.L2_NoofBags2, intrad.L2_NoofBags3, 
        intrad.L3_NoofBags, intrad.L3_NoofBags2, intrad.L3_NoofBags3, 
        
        intrad.BagCuttingType1Lot1id, intrad.BagCuttingType2Lot1id, intrad.BagCuttingType3Lot1id, 
        intrad.BagCuttingType1Lot2id, intrad.BagCuttingType2Lot2id, intrad.BagCuttingType3Lot2id, 
        intrad.BagCuttingType1Lot3id, intrad.BagCuttingType2Lot3id, intrad.BagCuttingType3Lot3id, 
        intrad.L1_CuttingBagType, intrad.L1_CuttingBagType2, intrad.L1_CuttingBagType3, 
        intrad.L2_CuttingBagType, intrad.L2_CuttingBagType2, intrad.L2_CuttingBagType3, 
        intrad.L3_CuttingBagType, intrad.L3_CuttingBagType2, intrad.L3_CuttingBagType3, 
    
        intrad.BagCuttingVendor1Lot1id, intrad.BagCuttingVendor2Lot1id, intrad.BagCuttingVendor3Lot1id, 
        intrad.BagCuttingVendor1Lot2id, intrad.BagCuttingVendor2Lot2id, intrad.BagCuttingVendor3Lot2id, 
        intrad.BagCuttingVendor1Lot3id, intrad.BagCuttingVendor2Lot3id, intrad.BagCuttingVendor3Lot3id, 
        
        intrad.L1_CuttingVendor, intrad.L1_CuttingVendor2, intrad.L1_CuttingVendor3, 
        intrad.L2_CuttingVendor, intrad.L2_CuttingVendor2, intrad.L2_CuttingVendor3, 
        intrad.L3_CuttingVendor, intrad.L3_CuttingVendor2, intrad.L3_CuttingVendor3, 
        
        intrad.L1_CuttingCharges, intrad.L1_CuttingCharges2, intrad.L1_CuttingCharges3, 
        intrad.L2_CuttingCharges, intrad.L2_CuttingCharges2, intrad.L2_CuttingCharges3, 
        intrad.L3_CuttingCharges, intrad.L3_CuttingCharges2, intrad.L3_CuttingCharges3, 
        
        intrad.IsTruck, intrad.TrailerNo, intrad.TruckNo, intrad.ContainerNo, intrad.IrsContainerDetailsId, 
        intrad.PickslipQty, intrad.SalesInvoiceNo, intrad.SealNumber, intrad.PickSlipCopy, intrad.WbSlipCopy, 
        intrad.WbSlipCopy2, intrad.EwayBillCopy, intrad.IsUpdated, intrad.Rec_LotId, intrad.Rec_LotNo,
        eva.DateAdded, eva.DateModified, 
        eva.ZVA_NUMBER, eva.TRAILER_NO, eva.CONTAINER_NO, eva.CONTAINER_TYPE, eva.DRIVER_NO, eva.WB_NAME, 
        eva.WB_SERIAL_NO, eva.WB_EMPTY_WT, eva.TRUCK_NO, eva.WB_TICKET_NO, eva.WB_CHARGES, eva.SCREEN_TYPE, eva.VEHICLE_STATUS,
         eva.PLANT_ID, eva.PLANT_NAME, eva.GAT_IN_TM, eva.GATE_OUT_TM, eva.IsUpdated, eva.WaitOutsideDt, eva.WaitOutsideBy, 
         eva.WaitOutsideByName, eva.GateInDt, eva.GateInBy, eva.PortDispatchDt, eva.PortDispatchBy, eva.PortDispatchByName, 
         eva.PortReceiptDt, eva.PortReceiptBy, eva.PortReceiptByName, eva.YardDispatchDt, eva.YardDispatchBy, eva.YardDispatchByName, 
         eva.UpdateLotDt, eva.UpdateLotBy, eva.UpdateLotByName, eva.PickSlipDt, eva.PickSlipBy, eva.PickSlipByName, eva.RedirectDt, 
         eva.RedirectBy, eva.RedirectByName, eva.GateOutDt, eva.GateOutBy, eva.GateOutByName, eva.LastStatusChangedBy, eva.LastStatusChangedOn, 
         eva.stm_LoadDt, eva.stm_LoadBy, eva.stm_LoadByName, eva.stm_QCDt, eva.stm_QCBy, eva.stm_QCByName, eva.stm_QCRemarks, 
         eva.GateInByName, eva.First_WB_Attachment, eva.FirstWeightEntryDt, eva.FirstWeightEntryBy, eva.FirstWeightEntryByName, 
         eva.Second_WB_Attachment, eva.SecondWeightEntryDt, eva.SecondWeightEntryBy, eva.SecondWeightEntryByName, eva.RejectionStatus, 
         eva.PONumber, eva.PODt, eva.POBy, eva.POByName, 
    
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag where BAG_CODE=intrad.bagType LIMIT 1) as L1_bagType1Name,
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag where BAG_CODE=intrad.L1_BagType2 LIMIT 1) as L1_bagType2Name,
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag where BAG_CODE=intrad.L1_BagType3 LIMIT 1) as L1_bagType3Name,
    
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag where BAG_CODE=intrad.L2_BagType LIMIT 1) as L2_bagType1Name,
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag where BAG_CODE=intrad.L2_BagType2 LIMIT 1) as L2_bagType2Name,
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag where BAG_CODE=intrad.L2_BagType3 LIMIT 1) as L2_bagType3Name,
    
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag where BAG_CODE=intrad.L3_BagType LIMIT 1) as L3_bagType1Name,
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag where BAG_CODE=intrad.L3_BagType2 LIMIT 1) as L3_bagType2Name,
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag where BAG_CODE=intrad.L3_BagType3 LIMIT 1) as L3_bagType3Name,
    
         wpa1.MovementQty as MovementQty1, wpa2.MovementQty as MovementQty2, wpa3.MovementQty as MovementQty3,
         intrad.ReceivingBin_id,intrad.ReceivingBin_Name,
    
         RecDet.Id as RecDet_Id, 
         RecDet.DateAdded as RecDet_DataAdded, RecDet.DateModified as Rec_DateModified, RecDet.ReceivingArrivalId, 
         RecDet.EmptyVehicleArrivalId, RecDet.IasDispatchId, RecDet.unloadingvendorid, RecDet.UnLoadingVendor, 
         RecDet.UnloadingChargePerTon, RecDet.WbType as Rec_WbType, 
         RecDet.WbEmptyWt as Rec_WbEmptyWt, RecDet.WbNetWt as Rec_WbNetWt, RecDet.WbLoadWt as Rec_WbLoadWt, RecDet.GunnyWt As Rec_GunnyWt, RecDet.GunnyLessNetWt as Rec_GunnyLessNetWt, 
         RecDet.NagaOutsideWBCopy, RecDet.VehicleStatus as Rec_VehicleStatus, RecDet.WBCopy as Rec_WBCopy,
         
         (SELECT lotid FROM ngw_lot WHERE lotid = RecDet.UnloadedLotNo LIMIT 1) as UnloadLotid,
         (SELECT lotno FROM ngw_lot WHERE lotid = RecDet.UnloadedLotNo LIMIT 1) as UnloadLotName,
         
    
         (SELECT BAG_REFID FROM master_bag WHERE BAG_CODE = RecDet.BagType LIMIT 1) as Rec_BagTypeid,  
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag WHERE BAG_CODE = RecDet.BagType LIMIT 1) as Rec_BagType,  
    
         (SELECT BAG_REFID FROM master_bag WHERE BAG_CODE = RecDet.BagType2 LIMIT 1) as Rec_BagTypeid2, 
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag WHERE BAG_CODE = RecDet.BagType2 LIMIT 1) as Rec_BagType2, 
    
         (SELECT BAG_REFID FROM master_bag WHERE BAG_CODE = RecDet.BagType3 LIMIT 1) as Rec_BagTypeid3, 
         (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag WHERE BAG_CODE = RecDet.BagType3 LIMIT 1) as Rec_BagType3, 
         
         RecDet.no_bags as Rec_no_bags, 
         RecDet.no_bags2 as Rec_no_bags2, 
         RecDet.no_bags3 as Rev_no_bags3
            
         FROM
    
         intrastate_warhouse_dispatch_info intrad 
         JOIN empty_vehicle_arrival eva ON intrad.StoPoNo = eva.PONumber and intrad.VehicleArrivalId = eva.ID
         LEFT JOIN master_plant b ON intrad.SendingPlant=b.WERKS
         LEFT JOIN master_plant c ON intrad.ReceivingPlant=c.WERKS
         LEFT JOIN ngw_weeklyplan_actual wpa1 ON wpa1.VANumber = eva.ZVA_NUMBER and wpa1.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo  LIMIT 1)
         LEFT JOIN ngw_weeklyplan_actual wpa2 ON wpa2.VANumber = eva.ZVA_NUMBER and wpa2.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo2  LIMIT 1)
         LEFT JOIN ngw_weeklyplan_actual wpa3 ON wpa3.VANumber = eva.ZVA_NUMBER and wpa3.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo3  LIMIT 1)
    
         LEFT JOIN intrastate_gateout_info RecDet ON RecDet.EmptyVehicleArrivalId = intrad.VehicleArrivalId
    
         where intrad.StoPoNo = '".$PoNo."' and eva.ZVA_NUMBER = '".$VA_No."'";
         
        //echo $query;exit();
        $builder = $this->db->query($query);
        return  $builder->getResultArray();
    }

    public function getReportList(){
        $strQuery = "SELECT ID as EmptyVehicleArrivalID, PONumber, ZVA_NUMBER, TRUCK_NO, DRIVER_NO, VEHICLE_STATUS, DateAdded, DateModified, 
        (SELECT concat(werks, '-', PLANT_NAME) FROM master_plant WHERE werks = WERKS limit 1) as PLANT 
        FROM empty_vehicle_arrival Where recstatus ='1' AND Reversal_Flag ='YES'";
  
        //echo $strQuery;
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }

    public function getReportDetails($postData){
        $FilterData = $postData->Data;
        //var_dump($FilterData->FromDate); exit();
        
        $EndDate  = date('Y-m-d');
        $StartDate  = date('Y-m-d', strtotime('-15 day', strtotime($EndDate)));

        //date('Y-m-d', strtotime('-1 day', strtotime($date_raw))));
        // echo "St Dt :", $StartDate;
        // echo "Et Dt :", $EndDate;
        // exit();

        $cnd = "";
        if(isset($FilterData->VA_No) && ($FilterData->VA_No!="") ){
          $cnd .=" AND b.ZVA_NUMBER = '".$FilterData->VA_No."'";
        }
        if(isset($FilterData->SendingPlant) && ($FilterData->SendingPlant!="") ){
          $cnd .=" AND a.SendingPlant = '".$FilterData->SendingPlant."'";
        }
        if(isset($FilterData->ReceivingPlant) && ($FilterData->ReceivingPlant!="") ){
          $cnd .=" AND a.ReceivingPlant = '".$FilterData->ReceivingPlant."'";
        }
        if(isset($FilterData->Truck_No) && ($FilterData->Truck_No!="") ){
          $cnd .=" AND Truck_No = '".$FilterData->Truck_No."'";
        }
  
        if(isset($FilterData->FromDate) && ($FilterData->FromDate!="") ){
          $cnd .=" AND a.DateAdded >= '".$FilterData->FromDate."'";
        }else{
          $cnd .=" AND a.DateAdded >= '".$StartDate."'";
        }

        
        if(isset($FilterData->ToDate) && ($FilterData->ToDate!="") ){
          $cnd .=" AND a.DateAdded <= '".$FilterData->ToDate."'";
        }else{
          $cnd .=" AND a.DateAdded <= '".$EndDate."'";
        }

  
        $strQuery = "SELECT a.TruckNo, a.LoadedLotNo, a.LoadedLotNo2, a.LoadedLotNo3 , 
                            a.WheatVariety, a.WheatVariety2, a.WheatVariety3,
                            a.SendingPlant, a.SendingStorageLocation, a.ReceivingPlant, a.ReceivingStorageLocation,
                            a.DeliveryNo, a.EwayBillNo, 
                            a.WbEmptyWt as Send_WbEmptyWt , a.WbLoadWt as Send_WbLoadWt, a.WbNetWt as Send_WbNetWt, a.GunnyWt as Send_GunnyWt, a.GunnyLessNetWt as Send_GunnyLessNetWt,
                            a.PO_Qty, a.PO_Qty2, a.PO_Qty3,
  
                            b.ZVA_NUMBER, date_format(b.GateInDt, '%d-%m-%Y %H:%i') GateInDt, date_format(b.GATE_OUT_TM, '%d-%m-%Y %H:%i') GATE_OUT_TM,
  
                            c.UnloadedLotNo, 
                            c.WbEmptyWt as Rec_WbEmptyWt , c.WbLoadWt as Rec_WbLoadWt, c.WbNetWt as Rec_WbNetWt, c.GunnyWt as Rec_GunnyWt, c.GunnyLessNetWt as Rec_GunnyLessNetWt,
                            (a.GunnyLessNetWt - c.GunnyLessNetWt) as TotalMovementQty,
                            '".$StartDate."'  as start_Dt , '".$EndDate."'  as end_Dt,
                            date_format(pi.GateInDt, '%d-%m-%Y %H:%i') RecGateInDt, date_format(pi.GateOutDt, '%d-%m-%Y %H:%i') RecGateOutDt 

                      FROM intrastate_warhouse_dispatch_info a 
                      JOIN empty_vehicle_arrival b ON a.VehicleArrivalId = b.ID
                      LEFT JOIN intrastate_gateout_info c ON a.VehicleArrivalId = c.EmptyVehicleArrivalId  and c.ReceivingArrivalId is not null
                      LEFT JOIN purchase_info pi ON a.VehicleArrivalId = pi.EMPTY_VEHICLE_ARRIVAL_ID 
                      where 1 $cnd";
                      //Mohan 10092022 removed from above query ifnull((select SUM(d.MovementQty) from ngw_weeklyplan_actual d WHERE b.ZVA_NUMBER = d.VANumber AND d.RecStatus = '1'),0) AS TotalMovementQty,
                      //10092022  And added (a.GunnyLessNetWt - c.GunnyLessNetWt) TotalMovementQty
                      //VehicleStatus != 12
   //echo $strQuery;
          
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }

    public function getLotBySegmentCode( $PlantId, $Segment){
        $strQuery = "SELECT DISTINCT lotid as value, lotno as label FROM ngw_sublot 
        WHERE wheatvarietyid = (SELECT Id FROM master_mrc_wheat_variety WHERE Segment ='$Segment') 
        AND plantid=(SELECT ID FROM master_plant WHERE werks ='$PlantId' limit 1)";
        //echo $strQuery;
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
    }

    public function getLotByPlant( $PlantId){
        $strQuery = "SELECT DISTINCT lotid as value, lotno as label FROM ngw_lot 
        WHERE plantid=(SELECT ID FROM master_plant WHERE werks ='$PlantId' limit 1)";
        //echo $strQuery;
        $builder = $this->db->query($strQuery);
        return  $builder->getResultArray();
      }

      public function IAS_Reversal($postData){

        $sql = "UPDATE intrastate_warhouse_dispatch_info SET id = -id, recstatus = 0 WHERE PO_Number = '".$postData->PO_No."' 
                and VehicleArrivalId = (select id from empty_vehicle_arrival WHERE 
                PO_Number = '".$postData->PO_No."' and ZVA_NUMBER = '".$postData->VANumber."' limit 1)";
        $builder = $this->db->query($sql);
  
        $sql = "UPDATE intrastate_gateout_info SET id = -id, recstatus = 0 WHERE 
                EmptyVehicleArrivalId = (select id from
                empty_vehicle_arrival WHERE PONumber = '".$postData->PO_No."' and ZVA_NUMBER = '".$postData->VANumber."' limit 1)";
        $builder = $this->db->query($sql);
   
       
        $sql = "INSERT empty_vehicle_arrival (DateAdded, DateModified, 
        ZVA_NUMBER, TRAILER_NO, CONTAINER_NO, CONTAINER_TYPE, DRIVER_NO, WB_NAME, 
        WB_SERIAL_NO, WB_EMPTY_WT, TRUCK_NO, WB_TICKET_NO, WB_CHARGES, SCREEN_TYPE, VEHICLE_STATUS,
         PLANT_ID, PLANT_NAME, GAT_IN_TM, GATE_OUT_TM, IsUpdated, WaitOutsideDt, WaitOutsideBy, 
         WaitOutsideByName, GateInDt, GateInBy, PortDispatchDt, PortDispatchBy, PortDispatchByName, 
         PortReceiptDt, PortReceiptBy, PortReceiptByName, YardDispatchDt, YardDispatchBy, YardDispatchByName, 
         UpdateLotDt, UpdateLotBy, UpdateLotByName, PickSlipDt, PickSlipBy, PickSlipByName, RedirectDt, 
         RedirectBy, RedirectByName, GateOutDt, GateOutBy, GateOutByName, LastStatusChangedBy, LastStatusChangedOn, 
         stm_LoadDt, stm_LoadBy, stm_LoadByName, stm_QCDt, stm_QCBy, stm_QCByName, stm_QCRemarks, 
         GateInByName, First_WB_Attachment, FirstWeightEntryDt, FirstWeightEntryBy, FirstWeightEntryByName, 
         Second_WB_Attachment, SecondWeightEntryDt, SecondWeightEntryBy, SecondWeightEntryByName, RejectionStatus, 
         PONumber, PODt, POBy, POByName, recstatus
    ) (Select 
        eva.DateAdded, eva.DateModified, 
        concat('~', id,'~', ZVA_NUMBER), eva.TRAILER_NO, eva.CONTAINER_NO, eva.CONTAINER_TYPE, eva.DRIVER_NO, eva.WB_NAME, 
        eva.WB_SERIAL_NO, eva.WB_EMPTY_WT, eva.TRUCK_NO, eva.WB_TICKET_NO, eva.WB_CHARGES, eva.SCREEN_TYPE, eva.VEHICLE_STATUS,
        eva.PLANT_ID, eva.PLANT_NAME, eva.GAT_IN_TM, eva.GATE_OUT_TM, eva.IsUpdated, eva.WaitOutsideDt, eva.WaitOutsideBy, 
        eva.WaitOutsideByName, eva.GateInDt, eva.GateInBy, eva.PortDispatchDt, eva.PortDispatchBy, eva.PortDispatchByName, 
        eva.PortReceiptDt, eva.PortReceiptBy, eva.PortReceiptByName, eva.YardDispatchDt, eva.YardDispatchBy, eva.YardDispatchByName, 
        eva.UpdateLotDt, eva.UpdateLotBy, eva.UpdateLotByName, eva.PickSlipDt, eva.PickSlipBy, eva.PickSlipByName, eva.RedirectDt, 
        eva.RedirectBy, eva.RedirectByName, eva.GateOutDt, eva.GateOutBy, eva.GateOutByName, eva.LastStatusChangedBy, eva.LastStatusChangedOn, 
        eva.stm_LoadDt, eva.stm_LoadBy, eva.stm_LoadByName, eva.stm_QCDt, eva.stm_QCBy, eva.stm_QCByName, eva.stm_QCRemarks, 
        eva.GateInByName, eva.First_WB_Attachment, eva.FirstWeightEntryDt, eva.FirstWeightEntryBy, eva.FirstWeightEntryByName, 
        eva.Second_WB_Attachment, eva.SecondWeightEntryDt, eva.SecondWeightEntryBy, eva.SecondWeightEntryByName, eva.RejectionStatus, 
        eva.PONumber, eva.PODt, eva.POBy, eva.POByName,'0' 
  
        From empty_vehicle_arrival eva WHERE eva.PONumber = '".$postData->PO_No."' and eva.ZVA_NUMBER = '".$postData->VANumber."')";
        $builder = $this->db->query($sql);
        
        $InsId=$this->insertID();
  
        // // $sql = "UPDATE empty_vehicle_arrival SET id = -id, recstatus = 0, ZVA_NUMBER=concat('~', id,'~', ZVA_NUMBER) WHERE 
        // //             PO_Number = '".$postData->PO_No."' and ZVA_NUMBER = '".$postData->VANumber."'";
        
        $sql = "UPDATE empty_vehicle_arrival SET id = -id  WHERE id =$InsId";
        $builder = $this->db->query($sql);
  
        $sql ="INSERT INTO purchase_info( DateAdded, DateModified, ZVA_NUMBER, ZPO_NUMBER, ZVENDOR_CODE, 
        ZVENDOR_NAME, ZSUPPLIER_CODE, ZSUPPLIER_NAME, ZQTY, MEINS, IDNLF, MATNR, SGT_SCAT, NETPR, WERKS, LGORT, 
        TRUCK_NO, DRIVER_NO, VECHICAL_STATUS, WAIT_IN_TM, GAT_IN_TM, INCO1, DEVICE_TYPE, PO_BAG_TYPE, SCREEN_TYPE, 
        VEHICLE_TYPE, QA_STATUS, ZDATE, ZTIME, PO_LINE_ITEM, CONTAINER_NO, MIGO_NUM, PICK_SLIP_NO, 
        EMPTY_VEHICLE_ARRIVAL_ID, IsFromSDT, IsUpdated, PlantDescription, StorageLocation, WaitOutsideDt,
        WaitOutsideBy, WaitOutsideByName, GateInDt, GateInBy, GateInByName, GateOutDt, GateOutBy, GateOutByName, 
        QualityCheckSubmitDt, QualityCheckSubmitBy, QualityCheckSubmitByName, UnloadWHSubmitDt, UnloadWHSubmitBy, 
        UnloadWHSubmitByName, MIGOApprovalDt, MIGOApprovalBy, MIGOApprovalByName, QualityDeductionSubmitDt, 
        QualityDeductionSubmitBy, QualityDeductionSubmitByName, QualityDeductionRejectDt, QualityDeductionRejectBy, 
        QualityDeductionRejectByName, QualityDeductionApproveDt, QualityDeductionApproveBy, QualityDeductionApproveByName,
        UnloadingRedirectDt, UnloadingRedirectBy, UnloadingRedirectByName, UnloadingRedirectGateoutDt, UnloadingRedirectGateoutBy,
        UnloadingRedirectGateoutByName, LastStatusChangedBy, LastStatusChangedOn, AfterUnloadQCDt, AfterUnloadQCBy,
        AfterUnloadQCByName, FirstWeightEntryDt, FirstWeightEntryBy, FirstWeightEntryByName, SecondWeightEntryDt,
        SecondWeightEntryBy, SecondWeightEntryByName, InvoiceQty, InvoiceRate, InvoiceCopy, WBCopy, RakeNo)
        (SELECT DateAdded, DateModified, ZVA_NUMBER, ZPO_NUMBER, ZVENDOR_CODE, ZVENDOR_NAME, ZSUPPLIER_CODE, 
        ZSUPPLIER_NAME, ZQTY, MEINS, IDNLF, MATNR, SGT_SCAT, NETPR, WERKS, LGORT, TRUCK_NO, DRIVER_NO, VECHICAL_STATUS,
        WAIT_IN_TM, GAT_IN_TM, INCO1, DEVICE_TYPE, PO_BAG_TYPE, SCREEN_TYPE, VEHICLE_TYPE, QA_STATUS, ZDATE, ZTIME, 
        PO_LINE_ITEM, CONTAINER_NO, MIGO_NUM, PICK_SLIP_NO, EMPTY_VEHICLE_ARRIVAL_ID, IsFromSDT, IsUpdated,
        PlantDescription, StorageLocation, WaitOutsideDt, WaitOutsideBy, WaitOutsideByName, GateInDt, GateInBy, GateInByName, 
        GateOutDt, GateOutBy, GateOutByName, QualityCheckSubmitDt, QualityCheckSubmitBy, QualityCheckSubmitByName, 
        UnloadWHSubmitDt, UnloadWHSubmitBy, UnloadWHSubmitByName, MIGOApprovalDt, MIGOApprovalBy, MIGOApprovalByName,
        QualityDeductionSubmitDt, QualityDeductionSubmitBy, QualityDeductionSubmitByName, QualityDeductionRejectDt, 
        QualityDeductionRejectBy, QualityDeductionRejectByName, QualityDeductionApproveDt, QualityDeductionApproveBy,
        QualityDeductionApproveByName, UnloadingRedirectDt, UnloadingRedirectBy, UnloadingRedirectByName, 
        UnloadingRedirectGateoutDt, UnloadingRedirectGateoutBy, UnloadingRedirectGateoutByName, LastStatusChangedBy, 
        LastStatusChangedOn, AfterUnloadQCDt, AfterUnloadQCBy, AfterUnloadQCByName, FirstWeightEntryDt, FirstWeightEntryBy,
        FirstWeightEntryByName, SecondWeightEntryDt, SecondWeightEntryBy, SecondWeightEntryByName, InvoiceQty, InvoiceRate,
        InvoiceCopy, WBCopy, RakeNo FROM purchase_info WHERE ZVA_NUMBER = '".$postData->VANumber."')";
  
      $builder = $this->db->query($sql);
      // $PurchaseInfoInsId = $this->insertID();
  
  
      // $sql = "UPDATE purchase_info SET PI_REFID = -PI_REFID  WHERE PI_REFID =$PurchaseInfoInsId";
      // $builder = $this->db->query($sql);
  
        $sql = "Update ngw_weeklyplan_actual SET RecStatus = 0 WHERE VANumber = '".$postData->VANumber."'";
        $builder = $this->db->query($sql);
  
        
        $sql = "Update ngw_bag_cutting_approval SET RecStatus = 0 WHERE va_no = '".$postData->VANumber."'";
        $builder = $this->db->query($sql);
  
        $sql = "Update empty_vehicle_arrival SET Reversal_Flag = 'COMPLETED' WHERE ZVA_NUMBER = '".$postData->VANumber."'";
        $builder = $this->db->query($sql);
  
      }

      public function getGateOutInfo ($postData){

        $sql = "SELECT a.Id, a.TruckNo, a.PO_Number, concat(a.PO_LineItem,', ',a.PO_LineItem2,', ',a.PO_LineItem3) as PoLineItem,
                       a.SendingPlant, a.SendingStorageLocation, a.ReceivingPlant, a.ReceivingStorageLocation,
                       a.WbEmptyWt, a.WbLoadWt, a.WbNetWt, a.GunnyWt, a.GunnyLessNetWt, 
                       a.DeliveryNo, 'D-Status' as DeliveryStatus, a.EwayBillNo, b.ZVA_NUMBER,
                       c.ias_DeliveryNo_Bypass_Flag
                FROM intrastate_warhouse_dispatch_info a 
                JOIN empty_vehicle_arrival b ON a.VehicleArrivalId = b.ID
                JOIN pp_setting c ON c.Id ='1'
                WHERE a.VehicleArrivalId = '".$postData->VehicleArrivalId."' and a.recstatus = '1'";

        // echo $sql; exit();
        
        $builder = $this->db->query($sql);
        return  $builder->getResultArray();

      }

      public function saveGateOutInfo($postData){
        $todayDt = date("Y-m-d H:i:s");
        $session = session();
        $SessionUser=$_SESSION["USERID"];
        $SessionUserName=$_SESSION["FIRSTNAME"];
        $CurrentDateTime=date("Y-m-d H:i:s");
        
        $cnd = '';
        if(isset($postData->RejectReason) && $postData->RejectReason != ""){
          $cnd .= ", RejectionStatus ='".$postData->RejectReason."'";
        }
        
        

        $sql="UPDATE empty_vehicle_arrival SET VEHICLE_STATUS ='".$postData->Status."'$cnd
        , GATE_OUT_TM = '" . $todayDt . "',GateOutDt='$CurrentDateTime',GateOutByName='$SessionUserName',GateOutBy='$SessionUser'
         WHERE ID='".$postData->EVA_ID."'";
        //echo $sql; exit();

        $builder = $this->db->query($sql);

        $UpdateWeeklyPlan="INSERT INTO `ngw_weeklyplan_actual`( `VANumber`,`WarehouseId`, `PlantId`, `StorageLocationId`, 
        `WheatVarietyId`, `LotId`, `MovementDate`, `MovementQty`) 
        VALUES (
          (SELECT IFNULL(ZVA_NUMBER,0) FROM `empty_vehicle_arrival` a where a.ID='".$postData->EVA_ID."' limit 1),
          (SELECT IFNULL(b.wh_refid,0) FROM `master_plant` a, warehouse_master b, empty_vehicle_arrival c where a.WH_CODE=b.wh_code and a.WERKS= c.PLANT_ID and c.ID='".$postData->EVA_ID."'),
          (SELECT IFNULL(a.ID,0) FROM `master_plant` a, empty_vehicle_arrival b where a.werks=b.PLANT_ID AND b.ID='".$postData->EVA_ID."'),
          (SELECT IFNULL(a.STORAGE_REFID,0) FROM `master_storage` a  where a.plantid = (SELECT IFNULL(a.ID,0) FROM master_plant a, empty_vehicle_arrival b where a.werks=b.PLANT_ID AND b.ID='".$postData->EVA_ID."')LIMIT 1),
          (SELECT IFNULL(Id,0)  FROM `master_mrc_wheat_variety` where Id = (SELECT IFNULL(wheatvarietyid,0) FROM `ngw_sublot` where lotid =
          (SELECT IFNULL(lotid,0) FROM `ngw_lot` WHERE lotno IN(SELECT LoadedLotNo FROM `intrastate_warhouse_dispatch_info` 
          where VehicleArrivalId='".$postData->EVA_ID."')LIMIT 1)LIMIT 1)),
          (SELECT IFNULL(lotid,0) FROM `ngw_lot` WHERE lotno IN(SELECT LoadedLotNo FROM `intrastate_warhouse_dispatch_info` where VehicleArrivalId='".$postData->EVA_ID."')LIMIT 1), 
          '$CurrentDateTime',
          (SELECT IFNULL(NetWeight,0) FROM pp_silotomillweights where VANumber = (SELECT IFNULL(ZVA_NUMBER,0) FROM `empty_vehicle_arrival` a where a.ID='".$postData->EVA_ID."' limit 1)))";
          $builder1 = $this->db->query($UpdateWeeklyPlan);

        return  $builder->getResultArray();
      }

}