<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Helpers\SapUrlHelper;
use App\Helpers\VANumberHelper;
use App\Models\Warehouse\STOPODeliveryPlanModel;
use App\Models\Warehouse\MasterModel;

class STOPODeliveryPlan extends BaseApiController
{

  public function getPlanGroupFromPlanId()
  {
    $postData = $this->request->getJSON();

    $model = new STOPODeliveryPlanModel();
    $res = $model->getPlanGroup($postData->id);
    return  $this->sendSuccessResult($res);
  }

  public function getGodowntoGodown()
  {
    $postData = $this->request->getJSON();
    $model = new STOPODeliveryPlanModel();
    $res = $model->getGodowntoGodown($postData);
    return  $this->sendSuccessResult($res);
  }

  public function getsublotDet()
  {
    $postData = $this->request->getJSON();
    $model = new STOPODeliveryPlanModel();
    $res = $model->getsublotDet($postData);
    return  $this->sendSuccessResult($res);
  }

  public function getWarehousePlanList()
  {
    $postData = $this->request->getJSON();
    // var_dump($postData); exit();
    // $model = new STOPODeliveryPlanModel();
    $model = new MasterModel();

    $res = $model->getWarehousePlanList1($postData);
    // var_dump($res); exit();
    return  $this->sendSuccessResult($res);
  }

  private function getPlanGroupByDate($date, $wheatvarityid, $lotid)
  {
    $model = new STOPODeliveryPlanModel();
    $res = $model->getPlanGroupByDate($date, $wheatvarityid, $lotid);
    return $res;
  }

  public function DeleteUpdateSTOPODeliveryPlan()
  {

    $postData = $this->request->getJSON();
    //var_dump($postData);exit();
    $PlanId = $postData->planid;
    $session = session();
    $SessionUser = $_SESSION["USERID"];
    $SessionUserName = $_SESSION["FIRSTNAME"];
    $ngw_weeklyplan = array('RecStatus' => 0);
    $model = new STOPODeliveryPlanModel();
    $res = $model->UpdateWeeklyPlan($PlanId, $ngw_weeklyplan);
    return  $this->respond(["success" => 1]);
  }

  public function AddPlanPlannedUnplanned()
  {
    $postData = $this->request->getJSON();

    //var_dump((array)$postData->PlanDatas); exit();

    $WeeklyPlanData = (array)$postData->PlanDatas;

    $session = session();
    $SessionUser = $_SESSION["USERID"];
    $SessionUserName = $_SESSION["FIRSTNAME"];

    $model = new STOPODeliveryPlanModel();
    //var_dump($WeeklyPlanData); exit();
    if (sizeof($WeeklyPlanData) <= 0) {
      return  $this->respond(["success" => 0]);
    }
    for ($i = 0; $i < sizeof($WeeklyPlanData); $i++) {
      
      $PlanId = $WeeklyPlanData[$i]->planid;

      $MovementType = "MILL";
      $Status = "0";

      // if (isset($WeeklyPlanData[$i]->wh_name)) {
      //   $res = $model->getWharehouseId($WeeklyPlanData[$i]->wh_name);
      //   $WeeklyPlanData[$i]->Warehouseid = $res[0]['wh_refid'];
      // }

      // if (isset($WeeklyPlanData[$i]->storage_location)) {
      //   $res = $model->getSLId($WeeklyPlanData[$i]->storage_location);
      //   $WeeklyPlanData[$i]->locationid = $res[0]['STORAGE_REFID'];
      // }

      // if (isset($WeeklyPlanData[$i]->plant_name)) {
      //   $res = $model->getPlantId($WeeklyPlanData[$i]->plant_name);
      //   $WeeklyPlanData[$i]->plantid = $res[0]['ID'];
      // }

      // if (isset($WeeklyPlanData[$i]->lotno)) {
      //   $res = $model->getLotId($WeeklyPlanData[$i]->lotno);
      //   $WeeklyPlanData[$i]->lotid = $res[0]['lotid'];
      // }

      // if (isset($WeeklyPlanData[$i]->WheatvarietyName)) {
      //   $res = $model->getWheatVarietyId($WeeklyPlanData[$i]->WheatvarietyName);
      //   $WeeklyPlanData[$i]->wheatvarityid = $res[0]['Id'];
      // }


      $res = $model->checkPlanLotDuplicate1(
        $WeeklyPlanData[$i]->plandate,
        $WeeklyPlanData[$i]->wh_nameID,
        $WeeklyPlanData[$i]->plant_nameID,
        $WeeklyPlanData[$i]->storage_locationID,
        $WeeklyPlanData[$i]->lotid,
        $WeeklyPlanData[$i]->WheatvarietyNameID,
        $WeeklyPlanData[$i]->planid
      );
      $Duplicate = $res[0]["DuplicateRecord"];
    
      $Purchase_Plan = "";
      $Actual_Stock = ($WeeklyPlanData[$i]->SAP_Qty) - ($WeeklyPlanData[$i]->Reserved_Stock);
      $Diff_Stock = $WeeklyPlanData[$i]->Movement_Qty - $Actual_Stock;
      $Purchase_Plan = $Diff_Stock - $WeeklyPlanData[$i]->Movement_Qty;

      if ($WeeklyPlanData[$i]->Expected_Arrival == null) {
        $WeeklyPlanData[$i]->Expected_Arrival = 0;
      }

      $ngw_weeklyplan = array(
        'plandate' => $WeeklyPlanData[$i]->plandate,
        'PlanMonth' => $WeeklyPlanData[$i]->PlanMonth,
        'planqty' => $WeeklyPlanData[$i]->Movement_Qty,
        'Expected_Arrival' => $WeeklyPlanData[$i]->Expected_Arrival,
        'Division' => $WeeklyPlanData[$i]->Division,
        'ReceivingBin' => $WeeklyPlanData[$i]->ReceivingBinId,
        'MovementType' => $MovementType,
        'validfrom' => $WeeklyPlanData[$i]->ValidFrom,
        'validto' => $WeeklyPlanData[$i]->ValidTo,
        'ActualStock' => $Actual_Stock,
        'Status' => $Status,
        'keyloandoqty' => $WeeklyPlanData[$i]->Keyloan_Cleared_Qty,
        'rndconfirmqty' => $WeeklyPlanData[$i]->QC_Cleared_Qty,
        'fumigationclearedqty' => $WeeklyPlanData[$i]->Fumi_Cleared_Qty,
        
        'wheatvarityid' => $WeeklyPlanData[$i]->WheatvarietyNameID,
        'fromwarehouseid' => $WeeklyPlanData[$i]->wh_nameID,
        'fromplantid' => $WeeklyPlanData[$i]->plant_nameID,
        'fromlocationid' => $WeeklyPlanData[$i]->storage_locationID,
        'fromlotid' => $WeeklyPlanData[$i]->lotid,
        'fromlotno' => $WeeklyPlanData[$i]->lotno,
        
        'Purchase_Plan' => $Purchase_Plan,
      );

      //var_dump($ngw_weeklyplan); exit();
      if ($WeeklyPlanData[$i]->chkSelect == true) {
        
        if ($Duplicate < 1) {
          if (isset($PlanId) && $PlanId != "") {
        
            $res = $model->UpdateWeeklyPlan($PlanId, $ngw_weeklyplan);
            //return  $this->respond(["success" => 1, "Update"]);
          } else {
            $res = $model->InsertWeeklyPlan($ngw_weeklyplan);
            //return  $this->respond(["success" => 1, "Insert"]);
          }
        }else{
          return  $this->respond(["success" => 0, "Duplicate"]);
        }
      }
    }
    if($i == sizeof($WeeklyPlanData)){
      return  $this->respond(["success" => 1, "Update"]);
    }else{
      return  $this->respond(["success" => 0, "no update"]);
    }
  }



  public function AddUpdateSTOPODeliveryPlan()
  {
    $postData = $this->request->getJSON();
    //print_r($postData);exit();

    $model = new STOPODeliveryPlanModel();

    $session = session();
    $SessionUser = $_SESSION["USERID"];
    $SessionUserName = $_SESSION["FIRSTNAME"];

    $MovementType = "MILL";
    if (isset($postData->MovementType)) {
      $MovementType = $postData->MovementType;
    }

    //echo $postData->Screen;exit();

    $PlanDatas = $postData->PlanDatas;
    //print_r($PlanDatas); exit();

    $Appplanid = "";
    if (isset($postData->planid)) {
      $Appplanid = $postData->planid;
    }

    if ($postData->Screen == "GTG_ENTRY") {
      $Status = "1"; //When we make new entry at the time the Status will be "1" for Godown to Godown
    } else {
      $Status = "0"; // When we make new entry at the time the Status will be "0"
    }

    //echo $postData->ApproveStatus; exit();
    if (isset($postData->Screen) && ($postData->Screen == "APPROVAL" || $postData->Screen == "GTG_APPROVAL" || $postData->Screen == "GTG_EDIT")) {
      $Status = $postData->ApproveStatus;
    }

    $RejectReason = "";
    if (isset($postData->RejectReason)) {
      $RejectReason = $postData->RejectReason;
    }

    $ScreenType = "";
    if (isset($postData->Screen)) {
      $ScreenType = $postData->Screen;
    }

    //echo sizeof((array)$PlanDatas); exit();

    $sizeoflen = sizeof((array)$PlanDatas);
    if ($sizeoflen > 0) {

      $InsertSeq = 1;
      $PlanIds = "";

      for ($i = 0; $i < $sizeoflen; $i++) {

        //echo $PlanDatas[$i]->date; exit();

        if ($PlanDatas[$i]->date) {
          $PlanDateData = $this->getPlanGroupByDate(
            $PlanDatas[$i]->date,
            $PlanDatas[$i]->WheatVariety,
            $PlanDatas[$i]->LotNumber
          );
        }

        $TmpPlanId = $PlanDateData[0]['planid'];
        $ActPlanId = $PlanDatas[$i]->planid;

        if ((!isset($PlanDatas[$i]->planid)) || (isset($PlanDatas[$i]->planid) && $PlanDatas[$i]->planid != "")) {
          $PlanDatas[$i]->planid = $TmpPlanId;
        }

        if ($ScreenType == "GTG_APPROVAL" || $ScreenType == 'GTG_EDIT') {
          //echo "'Status'=>",$Status; exit();

          if ($ScreenType == "GTG_APPROVAL") {
            $ngw_weeklyplan = array(
              'Status' => $Status,
              'RejectReason' => $RejectReason
            );
            if ($ActPlanId != $Appplanid) {
              continue;
            }
          }

          if ($ScreenType == "GTG_EDIT") {
            $ngw_weeklyplan = array(
              'Status' => $Status,
              'planqty' => $PlanDatas[$i]->MovementQty
            );
            if ($ActPlanId != $Appplanid) {
              continue;
            }
          }
          
        } else {
          if ($ScreenType == "APPROVAL") {
            $ngw_weeklyplan = array(
              'Status' => $Status,
              'RejectReason' => $RejectReason
            );
          } else {
            $plant=$PlanDatas[$i]->Plant;
            $plantname=$PlanDatas[$i]->PlantName;
            $fromlotnum=$PlanDatas[$i]->LotNumberName;
            $wheatvariety=$PlanDatas[$i]->WheatVariety;
            // print_r($plant);exit;
            $data = $model->getLastTicNo($plant);
            $transcation_unique_no = $data[0]['transcation_unique_no'];
            

            $res = VANumberHelper::VANumberHelper('WM',  $plantname,$transcation_unique_no);
            //print_r($res);exit;

            $ngw_weeklyplan = array(
              'MovementType' => $MovementType,
              'transcation_unique_no' => $res,
              'weekno' => $PlanDatas[$i]->WeekNo,
              'movementgroupno' => $postData->PlanDatas[0]->MovementGroupNumber,
              'wheatvarityid' => $PlanDatas[$i]->WheatVariety,
              'plandate' => $PlanDatas[$i]->ValidFrom,
              'PlanMonth' => $PlanDatas[$i]->PlanMonth,
              'planqty' => $PlanDatas[$i]->MovementQty,
              'fromwarehouseid' => $PlanDatas[$i]->WareHouse,
              'fromplantid' => $PlanDatas[$i]->Plant,
              'fromlocationid' => $PlanDatas[$i]->StorageLocation,
              'fromlotid' => $PlanDatas[$i]->LotNumber,
              'fromlotno' => $PlanDatas[$i]->LotNumberName,
              'keyloandoqty' => $PlanDatas[$i]->KeyLoanDOQty,
              'validfrom' => $PlanDatas[$i]->ValidFrom,
              'ActualStock' => $PlanDatas[$i]->ActualStock,
              'Division' => $PlanDatas[$i]->Division,
              'Status' => $Status,
              'RejectReason' => $RejectReason,
              'RndSkipFlag' => $PlanDatas[$i]->RndSkipFlag,
              'FumigationSkipFlag' => $PlanDatas[$i]->FumigationSkipFlag,
              'Priority' => $PlanDatas[$i]->Priority,
              'Expected_Arrival' => $PlanDatas[$i]->ExpectedArrival,
              'Purchase_Plan' => $PlanDatas[$i]->PurchasePlan
            );
          }

          if ($MovementType == "GODOWN") {

            $ngw_weeklyplan['towarehouseid'] = $PlanDatas[$i]->WareHouse;
            $ngw_weeklyplan['toplantid'] = $PlanDatas[$i]->toPlant;
            $ngw_weeklyplan['tolocationid'] = $PlanDatas[$i]->toStorageLocation;
            $ngw_weeklyplan['tolotid'] = $PlanDatas[$i]->toLotNumber;
            $ngw_weeklyplan['tolotno'] = $PlanDatas[$i]->toLotNumberName;

          } else {

            $ngw_weeklyplan['weekno'] = $PlanDatas[$i]->WeekNo;
            $ngw_weeklyplan['rndconfirmqty'] = $PlanDatas[$i]->RandDConfirmedQty;
            $ngw_weeklyplan['fumigationclearedqty'] = $PlanDatas[$i]->FumigationClearedQty;
            $ngw_weeklyplan['mixing_ratio'] = $PlanDatas[$i]->MixingRatio;
            $ngw_weeklyplan['actualmvtqty'] = $PlanDatas[$i]->ActualMovementQty;
            $ngw_weeklyplan['validto'] = $PlanDatas[$i]->ValidTo;
            $ngw_weeklyplan['restrict_mode'] = $PlanDatas[$i]->RestrictMode;
            $ngw_weeklyplan['ReceivingBin'] = $PlanDatas[$i]->ReceivingBin;
          }
        }

       

        //get Sender & Receiver Wharehouse ID
        if ($MovementType == "GODOWN" && $ScreenType == "GTG_ENTRY") {
          $FromWarehouseId = $model->getWharehouse_Id($PlanDatas[$i]->Plant,$PlanDatas[$i]->StorageLocation, $PlanDatas[$i]->LotNumber);
          $ngw_weeklyplan['fromwarehouseid'] = $FromWarehouseId[0]['warehouseid'];

          $ToWarehouseId = $model->getWharehouse_Id($PlanDatas[$i]->toPlant,$PlanDatas[$i]->toStorageLocation, $PlanDatas[$i]->toLotNumber);
          $ngw_weeklyplan['towarehouseid'] = $ToWarehouseId[0]['warehouseid'];
          //var_dump($WarehouseId[0]['warehouseid']);
        }

        //var_dump($ngw_weeklyplan);exit();

        if (isset($ActPlanId) && $ActPlanId != "") {
          $InsertSeq = 0;
          $res = $model->UpdateWeeklyPlan($ActPlanId, $ngw_weeklyplan);
          //$PlanIds.=$PlanDatas[$i]->planMonth.",";

          $PlanIds .= $ActPlanId . ",";
          if ($ScreenType == "GTG_APPROVAL") {
            break;
          }
        } else {
          //var_dump($ngw_weeklyplan); exit();
          switch ($MovementType) {
            case 'GODOWN':
                $result1 = $model->getcountstatus($plant);
                $result2 = $model->getcountduplicate($fromlotnum,$wheatvariety);
                
                if ($result2 > 0 && $result1 > 0) {
                    return $this->respond(["success" => false, "message" => 'Lot Number is Already Added & Clear Old Entries Also']);
                } elseif ($result2 > 0) {
                    return $this->respond(["success" => false, "message" => 'Lot Number is Already Added']);
                } elseif ($result1 > 0) {
                    return $this->respond(["success" => false, "message" => 'Clear Old Entries']);
                } else {
                    $res = $model->InsertWeeklyPlan($ngw_weeklyplan);
                }
                break;
            
            default:
                $res = $model->InsertWeeklyPlan($ngw_weeklyplan);
                break;
        }   
          $PlanIds .= $res . ",";
        }
        //echo $PlanIds; exit();
      }

      if ($InsertSeq == 1) {
        $MGN = explode("-", $PlanDatas[0]->MovementGroupNumber);
        $LastNumber = $MGN[1];
        $ngw_weeklyplanseq = array('SeqNumber' => $LastNumber);
        $res = $model->UpdateSeqNumber($ngw_weeklyplanseq);
      } else {
        $MGNNo = $PlanDatas[0]->MovementGroupNumber;
        $PlanIds = rtrim($PlanIds, ",");
        //$res = $model->DeleteOtherPlan($PlanIds,$MGNNo);
      }
      return  $this->respond(["success" => 1]);
    } else {
      return  $this->respond(["success" => 0]);
    }
  }



  public function getPlanWheatvarityList()
  {
    $master = new STOPODeliveryPlanModel();
    $postData = $this->request->getJSON();
    if (isset($postData->lotid) && isset($postData->StorageLocation)) {
      //Fetch only selected wheat variety to dropdown 
      return  $this->sendSuccessResult($master->getPlanWheatvarietyList($postData->lotid, $postData->StorageLocation));
    } else {
      //Fetch all wheat variety to dropdown used in Weeklyplan page
      //echo "ELSE";exit();

      $res = $master->getPlanWheatvarietyList("", "");
      return  $this->sendSuccessResult($res);
    }
  }

  /*** Save R & D Confirmation Plan (Update Approval Status) ***/
  public function Save_ConfirmationPlan_Status()
  {
    $postData = $this->request->getJSON();

    //var_dump($postData); exit();

    $model = new STOPODeliveryPlanModel();
    $res = $model->Save_ConfirmationPlan_Status($postData);
    return  $this->respond(["success" => $res]);
  }

  public function checkPlanLotDuplicate()
  {
    $postData = $this->request->getJSON();

    //var_dump($postData); exit();

    $model = new STOPODeliveryPlanModel();
    $res = $model->checkPlanLotDuplicate($postData->PlanMonth, $postData->warehouseid, $postData->plantid, $postData->storagelocationid, $postData->lotid, $postData->wheatvarietyid);
    return  $this->respond(["success" => 1, "DuplicateRecord" => $res[0]["DuplicateRecord"]]);
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

    public function SavePlanListUpdate(){
      /*** Save Weekly Planlist ***/ 

      $postData = $this->request->getJSON();
      //var_dump($postData); exit();
      $model = new STOPODeliveryPlanModel();
      ////Mohan commented on 26072022 for Edit with month $res = $model->updatePlanList($postData->planid, $postData->Data, $postData->DataLength);
      $res = $model->updatePlanListNew($postData->planid, $postData->Data, $postData->DataLength);
      
      return  $this->respond(["success" => $res]);
    }

    public function DeletePlanListUpdate(){
      /*** Delete Weekly Planlist ***/ 

      $postData = $this->request->getJSON();
      //var_dump($postData); exit();
      $model = new STOPODeliveryPlanModel();
      $res = $model->deletePlanList($postData->planid, $postData->Data, $postData->DataLength);
      return  $this->respond(["success" => $res]);
    }
    public function getWarehouse()
    {
      $postData = $this->request->getJSON();
      $master = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($master->getWarehouse($postData->search_Id));
    }

    public function getPlant()
    {
      $postData = $this->request->getJSON();
      $master = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($master->getPlant($postData->MONTH,$postData->WAREHOUSE_ID));
    }

    public function getWheat()
    {
      $postData = $this->request->getJSON();
      $master = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($master->getWheat($postData->MONTH,$postData->WAREHOUSE_ID,$postData->PLANT_ID));
    }
    public function getPlanSTODetails()
    {
      $postData = $this->request->getJSON();
      $master = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($master->getPlanDetails($postData->MONTH,$postData->WAREHOUSE_ID,$postData->PLANT_ID,$postData->WHEAT_ID));
    }
    public function getVendorDetails()
    {
      $master = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($master->getVendorDetails());
    }
    public function getVendorDetailsLoading()
    {
      $master = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($master->getVendorDetailsLoading());
    }
    public function getVendorDetailsUnloading()
    {
      $master = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($master->getVendorDetailsUnloading());
    }
    public function getVendorByID()
    {
      $postData = $this->request->getJSON();
      $master = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($master->getVendorByID($postData->Vendor_ID));
    }
    public function getStorageLocationListToPlant(){
      $postData = $this->request->getJSON();
     
       $model = new STOPODeliveryPlanModel();
       $res = $model->getStorageLocationListToPlant($postData->PlantId);
       return  $this->sendSuccessResult($res);
    }
    public function PostStoPO()
    {
      $postData = $this->request->getJSON();
      $master = new STOPODeliveryPlanModel();

      $session = session();
      $SessionUser = $_SESSION["USERID"];
			$format = date('Y-m-d H:i:s');

      $data = array(
        'plan_id'=>$postData->fdata->plan_id,
        'plan_month'=>$postData->fdata->plan_month,
        'from_warehouse_id'=>$postData->fdata->from_warehouse_id,
        'from_plant_id'=>$postData->fdata->from_plant_id,
        'wheat_variety_id'=>$postData->fdata->wheat_variety_id,
        'to_warehouse_id'=>$postData->fdata->to_warehouse_id,
        'to_plant_id'=>$postData->fdata->to_plant_id,
        'to_storage_id'=>$postData->fdata->to_storage_id,
        'moving_qty'=>$postData->fdata->moving_qty,
        'loading_cost'=>$postData->fdata->loading_cost,
        'unloading_cost'=>$postData->fdata->unloading_cost,
        'freight_cost'=>$postData->fdata->freight_cost,
        'freight_vendor_id'=>$postData->fdata->freight_vendor_id,
        'loading_vendor_id'=>$postData->fdata->loading_vendor_id,
        'unloading_vendor_id'=>$postData->fdata->unloading_vendor_id,
        'status'=>1,
        'created_at'=>$format,
        'created_by'=>$SessionUser,
      );
      $ngw_weeklyplan_update=$master->ngw_weeklyplan_update($postData->ngw_weeklyplan,$postData->plan_id,$postData->fdata->to_warehouse_id);
      $insert_sto=$master->Insert_sto_po($data);
      return  $this->sendSuccessResult(["success" => 1,"insert_sto"=>$insert_sto,"plan_update"=>$ngw_weeklyplan_update]);
    }

    public function PlanSTOPODataGet(){
      $postData = $this->request->getJSON();
      $model = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($model->PlanSTOPODataGet($postData->formType)); 
    }

    public function PlanSTOPODataReport(){
      $postData = $this->request->getJSON();
      $model = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($model->PlanSTOPODataReport($postData->formType,$postData->Data->fromdate,$postData->Data->todate)); 
    }

    public function STOPODeliveryPlanByID(){
      $postData = $this->request->getJSON();
      $model = new STOPODeliveryPlanModel();
      return  $this->sendSuccessResult($model->STOPODeliveryPlanByID($postData->id)); 
    }

    public function UpdateStoPO()
    {

      $postData = $this->request->getJSON();
      $master = new STOPODeliveryPlanModel();
      // print_r($postData);exit;
      $session = session();
      $SessionUser = $_SESSION["USERID"];
			$format = date('Y-m-d H:i:s');
      $format1 = date('Y-m-d');

      // print_r($postData->status);exit();

      if($postData->status == '0') {
          $data = array(
            'status'=>0,
            'rejected_at'=>$format,
            'rejected_by'=>$SessionUser,
            'reject_reason'=>$postData->reject_reason
          );
          $ngw_weeklyplan_update=$master->ngw_weeklyplan_reject($postData->plan_id);
          $insert_sto=$master->Update_sto_po($data, $postData->ID);
       return  $this->sendSuccessResult(["success" => 1,"update_sto"=>$insert_sto,"plan_update"=>$ngw_weeklyplan_update]);
      }else if($postData->status == '2') {
        $data = array(
          'status'=>2,
          'purchase_approved_at'=>$format,
          'purchase_approved_by'=>$SessionUser,
        );
        $insert_sto=$master->Update_sto_po($data, $postData->ID);
        return  $this->sendSuccessResult(["success" => 1,"update_sto"=>$insert_sto]);
      }else if($postData->status == '3') {

        $get_data_sto_po=$master->STOPODeliveryPlanByID($postData->ID);
        // echo "<pre>";print_r($get_data_sto_po);exit;
        $request  =[ 
          "plan_month"=>$get_data_sto_po[0]['plan_month'],
          "from_wharehouse"=>$get_data_sto_po[0]['fromwarehousecode'],
          "from_plant"=>$get_data_sto_po[0]['fromplantcode'],
          "wheat_variety"=>$get_data_sto_po[0]['WheatVariety'],
          "segment"=>$get_data_sto_po[0]['Segment'],
          "material"=>$get_data_sto_po[0]['MaterialCode'],
          "to_wharehouse"=>$get_data_sto_po[0]['towarehousecode'],
          "to_plant"=>$get_data_sto_po[0]['toplantcode'],
          "to_storagelocation"=>$get_data_sto_po[0]['LGORT'],
          "Movement_qty"=>$get_data_sto_po[0]['moving_qty'],
          "frieght_vendor"=>$get_data_sto_po[0]['freightvendorcode'],
          "frieght_vendor_name"=>$get_data_sto_po[0]['freightvendor'],
          "frieght_cost"=>$get_data_sto_po[0]['freight_cost'],
          "loading_vendor"=>$get_data_sto_po[0]['loadingvendorcode'],
          "loading_vendor_name"=>$get_data_sto_po[0]['loadingvendor'],
          "loading_cost"=>$get_data_sto_po[0]['loading_cost'],
          "unloading_vendor"=>$get_data_sto_po[0]['unloadingvendorcode'],
          "unloading_vendor_name"=>$get_data_sto_po[0]['unloadingvendor'],
          "unloading_cost"=>$get_data_sto_po[0]['unloading_cost'],
          "id"=>$postData->ID,
          "qa_approved_at"=>$format1,
          "purchase_approved_at"=>$get_data_sto_po[0]['purchase_approved_date'],
      ];
      // print_r($request);exit;

        $urlPath ="zwh_sto/stopo?sap-client=900";
        $res = SapUrlHelper::PushToSap($urlPath,json_encode([$request]));

        $message = $res[0]->MESSAGE;
  
        if(strlen($res[0]->PO_NO) == 0){
          return $this->sendErrorResult("$message,Please Contact SAP Team");
        }else if(strlen($res[0]->PO_NO) > 0) {
            $data = array(
              'status'=>3,
              'qa_approved_at'=>$format,
              'qa_approved_by'=>$SessionUser,
              'sap_sto_po_number'=>$res[0]->PO_NO
            );
            $insert_sto=$master->Update_sto_po($data, $postData->ID);
            return  $this->sendSuccessResult(["success" => 1,"update_sto"=>$insert_sto,"PO_Number"=>$res[0]->PO_NO]);
        }
      }
     
    }

    public function SAP_Vendor_Cost()
    {
      $postData = $this->request->getJSON(); 
      $from_plant = $postData->from_plant;    
      $to_plant = $postData->to_plant;
     
      $urlPath ="zwh_sto/stopo?sap-client=900&from_plant=$from_plant&to_plant=$to_plant";
      $sapResult = SapUrlHelper::getWhDatas($urlPath);
      return json_encode(["success" => 1, "results" => json_decode($sapResult)]);
    } 

    public function sapPostSTOPO(){
      $json = $this->request->getJSON();
      
      $request  =[ 
          "plan_month"=>"JUNE-2023",
          "from_wharehouse"=>"WH01",
          "from_plant"=>"FR02",
          "wheat_variety"=>"GUJARAT-JUNAGADH-496",
          "segment"=>"LP",
          "material"=>"WH-E3",
          "to_wharehouse"=>"R21",
          "to_plant"=>"FR01",
          "to_storagelocation"=>"FH01",
          "Movement_qty"=>"20",
          "frieght_vendor"=>"211764",
          "frieght_vendor_name"=>"THILIPAN TRANSPORT (211764)",
          "frieght_cost"=>"33",
          "loading_vendor"=>"210597",
          "loading_vendor_name"=>"SASIKUMAR CONTRACTOR 210597",
          "loading_cost"=>"30",
          "unloading_vendor"=>"223183",
          "unloading_vendor_name"=>"BALAJI CONTRACTOR - 223183",
          "unloading_cost"=>"10",
          "id"=>"102",
      ];
     
        $data = json_encode([$request]);
  
      $urlPath ="zwh_sto/stopo?sap-client=900";


      $res = SapUrlHelper::PushToSap($urlPath,$request);
  
      // print_r($res);exit();
      return $this->sendSuccessResult($res);
     }

     public function getWHplantList()
     {
       $postData = $this->request->getJSON();
       $master = new STOPODeliveryPlanModel();
       return  $this->sendSuccessResult($master->getWHplantList($postData->WH_CODE,$postData->plant_id));
     }
}
