<?php

namespace App\Controllers\Api\Sap;

use App\Controllers\Api\BaseApiController;
use App\Helpers\SapUrlHelper;
use App\Models\RakeloadingModel;
use DateTime;

class SiloToMillController extends BaseApiController
{
    public function STMPOGet()
    {
        $urlPath ="zrake/zstm_po/stm_delivery_po?sap-client=900";
        $sapResult = SapUrlHelper::getWhDatas($urlPath);
        $array = json_decode($sapResult);
        $sizeoflen = sizeof($array);
        $model = new RakeloadingModel();
        $CurrentDateTime=date("Y-m-d H:i:s");
        // print_r($sapResult);exit;
        if($sizeoflen > 0) {
            foreach ($array as $po_create) {
                $data = array(
                    "PONumber"=>trim($po_create->PO_NUMBER),
                    "LineItem"=>trim($po_create->PO_LINE_ITEM),
                    "WheatVariety"=>trim($po_create->WHEAT_VARIETY),
                    "StorageLocation"=>trim($po_create->TO_STORAGE_LOCATION),
                    "ReceivingPlant"=>trim($po_create->TO_PLANT),
                    "SendingPlant"=>trim($po_create->SEND_PLANT),
                    "SendingLocation"=>trim($po_create->TO_STORAGE_LOCATION),
                    "Segment"=>trim($po_create->MATERIAL_CODE),
                    "po_qty"=>trim($po_create->PO_QUANTITY),
                    "created_at"=>$CurrentDateTime,
                );
              
                $PO_NUMBER = $po_create->PO_NUMBER;
                $FLAG = $po_create->FLAG;

                $result = $model->STMPOInsert($PO_NUMBER,$FLAG,$data);
            }
           
        }else {
           $result = false;
        }
        return json_encode(["success" => 1, "results" => $result]);
    }

    public function STMDelivery()
    {
            $json = $this->request->getJSON();
            $model = new RakeloadingModel();
            $res = $model->SAPPushDataSTM($json->id);
            $gateInDate = new DateTime($res[0]['GateInDt']);
            $formattedGateInDate = $gateInDate->format('Ymdh:iA');
            $sap_data = array (
                "va_no"=>$res[0]['ZVA_NUMBER'],
                "driver_no"=>$res[0]['DRIVER_NO'],
                "truck_no"=>$res[0]['TRUCK_NO'],
                "sending_plant"=>$res[0]['PLANT_ID'],
                "sending_sto_loc"=>$res[0]['BulkSiloNo'],
                "po_number"=>$res[0]['ZPO_NUMBER'],
                "po_line_item"=>$res[0]['PO_LINE_ITEM'],
                "wheatvariety"=>$res[0]['WheatVariety'],
                "receivingbin"=>$res[0]['ReceivingBin'],
                "bulksilono"=>$res[0]['BulkSiloNo'],
                "moisture"=>$res[0]['moisture_quality'],
                "hlweight"=>$res[0]['hl_quality'],
                "fm"=>$res[0]['foreign_matter_quality'],
                "dust"=>$res[0]['dust_quality'],
                "badsmell"=>$res[0]['Bad_smell'],
                "infestation"=>$res[0]['infestation_quality'],
                "seivesize"=>$res[0]['seive_size_quality'],
                "wetgluten"=>$res[0]['wet_gluten_quality'],
                "drygluten"=>$res[0]['dry_gluten_quality'],
                "protein"=>$res[0]['protein_quality'],
                "first_wt"=>$json->Data->FirstWeight,
                "second_wt"=>$json->Data->SecondWeight,
                "net_wt"=>$json->Data->NetWeight,
                // "gateindate"=>$res[0]['GateInDt'],
                "gateindate" => $formattedGateInDate,
                "gateoutdate"=>$res[0]['GATE_OUT_TM'],
                "tripsheet_no"=>$res[0]['tripsheet_no'],
                "driver_name"=>$res[0]['driver_name'],
                "reject_status"=>$res[0]['SecondWeightEntryBy'] == 0 ? '': 'U',
              );
              $urlPath ="zrake/zstm_po/stm_delivery_po?sap-client=900";
    
              $res1 = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
              $message = $res1[0]->MESSAGE;
              if($res1[0]->STATUS == 0){
                return $this->respond(["success" => false,"message"=>"$message ,Please Contact SAP Team"]);
              }else if(($res1[0]->STATUS) > 0){
                return  $this->respond(["success" => true]);  
         }
    }

    public function STMMigoConfirmation($ID)
    {
            $json = $this->request->getJSON();
            $CurrentDateTime=date("Y-m-d H:i:s");
            $CurrentDate=date("Y-m-d");
            $CurrentTime=date("H:i:s");
            $model = new RakeloadingModel();
            $result = $model->STMMigoDataFetch($ID);
            $resu = $model->SAPTOPPLastID();

            if (empty($result)) {
              return $this->respond(["success" => false, "message" => "No records found for processing."]);
            }

            foreach ($result as $res) {
            $ReciveGateIn = new DateTime($res['ReciveGateIn']);
            $ReciveGateIn = $ReciveGateIn->format('Ymdh:iA');
            if($res['ReciveGateOut']){
              $ReciveGateOut = new DateTime($res['ReciveGateOut']);
              $ReciveGateOut = $ReciveGateOut->format('Ymdh:iA');
            }else{
              $ReciveGateOut = new DateTime($CurrentDateTime);
              $ReciveGateOut = $ReciveGateOut->format('Ymdh:iA');
            }
            $SendingGateIn = new DateTime($res['SendingGateIn']);
            $SendingGateIn = $SendingGateIn->format('Ymdh:iA');
            $SendingGateOut = new DateTime($res['SendingGateOut']);
            $SendingGateOut = $SendingGateOut->format('Ymdh:iA');
            $sap_data = array (
                "va_no"=>$res['ZVA_NUMBER'],
                "driver_no"=>$res['DRIVER_NO'],
                "truck_no"=>$res['TRUCK_NO'],
                "sending_plant"=>$res['PLANT_ID'],
                "sending_sto_loc"=>$res['SendingLocation'],
                "po_number"=>$res['ZPO_NUMBER'],
                "po_line_item"=>$res['PO_LINE_ITEM'],
                "wheatvariety"=>$res['WheatVariety'],
                "rec_storagelocation"=>$res['StorageLocation'],
                "rec_plant"=>$res['ReceivingPlant'],
                "rec_bin"=>$res['ReceivingBin'],
                "bulksilono"=>$res['BulkSiloNo'],
                "rec_first_wt"=>$res['RecivingFirstWt'],
                "rec_second_wt"=>$res['RecivingSecondWt'],
                "rec_net_wt"=>$res['RecivingNetWt'],
                "rec_plant_gatein"=>$ReciveGateIn,
                "rec_plant_gateout"=>$ReciveGateOut,
                "rec_plant_date"=>$ReciveGateOut,
                "send_plant_gateout"=>$SendingGateOut,
                "METHOD"=>'PUT'
              );
              $urlPath ="zrake/zstm_po/stm_delivery_po?sap-client=900";    
              $res1 = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
              $message = $res[0]->MESSAGE;
              if($res1[0]->STATUS == 0){
                return $this->sendErrorResult("$message Please Contact SAP Team");
              }else if(($res1[0]->STATUS) > 0){
                   $result = $model->STMMigoCompletionUpdate($res['PI_REFID'],$res['ID']);
                return  $this->respond(["success" => true ,"message"=> 'Gate Out Successfully']);  
              }
            }
    }

    public function STMDeliveryNoFetch($SCREEN){
		include_once APIPATH . "/db_connection.php";

    $model = new RakeloadingModel();
    $gateInData = $model->STMDeliveryNoFetch($SCREEN);
		foreach ($gateInData as $resultRow) {
			$vaNumber = $resultRow['ZVA_NUMBER'];
      if($SCREEN == 'SILOTOMILL'){
        $urlPath ="zrake/zstm_po/stm_delivery_details?sap-client=900&va_no=$vaNumber";
      }else if($SCREEN == 'EVADP'){
        $urlPath ="zwh_iasdelivery/wh_deliveryno?sap-client=900&va_no=$vaNumber";
      }
			$sapResult = SapUrlHelper::getWhDatas($urlPath);
            $array = json_decode($sapResult);
            $VA_NO = $array[0]->VA_NO;
            if($SCREEN == 'SILOTOMILL'){
              $DELIVERY = $array[0]->DELIVERY;
            }else if($SCREEN == 'EVADP'){
              $DELIVERY = $array[0]->DELIVERY_NO;
            }
            $EWAYBILL = $array[0]->EWAYBILL;
            
            if(isset($array[0]->VA_NO)){
            $usql2 = "SELECT ID,SCREEN_TYPE FROM empty_vehicle_arrival WHERE ZVA_NUMBER = '$VA_NO'";
            $res=mysqli_query($connect, $usql2);
            $res1 = mysqli_fetch_assoc($res);
            $VEHICLE_ID = $res1['ID'];
            if(isset($VEHICLE_ID)){
                if($SCREEN == 'SILOTOMILL'){
                  $usql3 = "UPDATE silotomill_dispatch_info SET DeliveryNo='$DELIVERY',EwayBillNo='$EWAYBILL' WHERE VehicleArrivalId = '$VEHICLE_ID'";
                }elseif($SCREEN == 'EVADP'){
                  $usql3 = "UPDATE intrastate_warhouse_dispatch_info SET DeliveryNo='$DELIVERY',EwayBillNo='$EWAYBILL' WHERE VehicleArrivalId = '$VEHICLE_ID'";
                }
                mysqli_query($connect, $usql3);
                $usql5 = "UPDATE empty_vehicle_arrival SET IsUpdated=1 WHERE ID = '$VEHICLE_ID'";
                mysqli_query($connect, $usql5);
            }
            }
		}
    return  $this->respond(["success" => 1,"results"=>$array]);  		
	}

  public function IASDeliveryUpdate($ID){
		include_once APIPATH . "/db_connection.php";

    $query = "select 
    intrad.Id , intrad.VehicleArrivalId, intrad.IntraStateSapId, intrad.DateAdded, intrad.DateModified, intrad.AddedBy, 
    intrad.ModifiedBy, intrad.IsRedirected, intrad.IsSendingRedirected , 

    intrad.LoadedLotNo, intrad.LoadedLotNo2, intrad.LoadedLotNo3, 
    (SELECT lotid FROM ngw_sublot WHERE lotno =intrad.LoadedLotNo limit 1) as LoadedLotId,
    (SELECT lotid FROM ngw_sublot WHERE lotno =intrad.LoadedLotNo2 limit 1) as LoadedLotId2,
    (SELECT lotid FROM ngw_sublot WHERE lotno =intrad.LoadedLotNo3 limit 1) as LoadedLotId3,

    intrad.LastMileTransporterId, intrad.LastMileTransporter, intrad.LoadingVendorId, intrad.LoadingVendor, intrad.LoadingChargesPerTon, 
    intrad.FreightChargesPerTon, intrad.PickslipNo, intrad.SendingPlant, intrad.WheatVariety, intrad.MaterialNo, 
    intrad.ReceivingPlant, intrad.ReceivingStorageLocation, intrad.SendingStorageLocation, intrad.StoPoNo, 
    intrad.PO_Number, 
    intrad.PO_LineItem, intrad.PO_LineItem2, intrad.PO_LineItem3, 
    intrad.Segment, intrad.Segment2, intrad.Segment3, 
    intrad.WheatVariety2, intrad.WheatVariety3, 
    intrad.MaterialNo2, intrad.MaterialNo3, intrad.EwayBillNo, intrad.DeliveryDate, 
    intrad.PO_Qty, intrad.PO_Qty2, intrad.PO_Qty3, intrad.DeliveryNo, intrad.WbType, intrad.WbName, intrad.WbSerialNumber, 
    intrad.WbTicketNumber, intrad.WbEmptyWt, intrad.WbNetWt, intrad.WbLoadWt, intrad.GunnyWt, intrad.GunnyLessNetWt, 

    intrad.BagType, intrad.L1_BagType2, intrad.L1_BagType3, 
    intrad.L2_BagType, intrad.L2_BagType2, intrad.L2_BagType3, 
    intrad.L3_BagType, intrad.L3_BagType2, intrad.L3_BagType3, 
    intrad.L1_NoofBags, intrad.L1_NoofBags2, intrad.L1_NoofBags3, 
    intrad.L2_NoofBags, intrad.L2_NoofBags2, intrad.L2_NoofBags3, 
    intrad.L3_NoofBags, intrad.L3_NoofBags2, intrad.L3_NoofBags3, 
    intrad.L1_CuttingBagType, intrad.L1_CuttingBagType2, intrad.L1_CuttingBagType3, 
    intrad.L2_CuttingBagType, intrad.L2_CuttingBagType2, intrad.L2_CuttingBagType3, 
    intrad.L3_CuttingBagType, intrad.L3_CuttingBagType2, intrad.L3_CuttingBagType3, 
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

     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.bagType LIMIT 1) as L1_bagType1Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L1_BagType2 LIMIT 1) as L1_bagType2Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L1_BagType3 LIMIT 1) as L1_bagType3Name,

     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L2_BagType LIMIT 1) as L2_bagType1Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L2_BagType2 LIMIT 1) as L2_bagType2Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L2_BagType3 LIMIT 1) as L2_bagType3Name,

     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L3_BagType LIMIT 1) as L3_bagType1Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L3_BagType2 LIMIT 1) as L3_bagType2Name,
     (SELECT BAG_NAME FROM master_bag where BAG_CODE=intrad.L3_BagType3 LIMIT 1) as L3_bagType3Name,

      (SELECT wpa1.MovementQty from ngw_weeklyplan_actual wpa1 WHERE wpa1.VANumber = eva.ZVA_NUMBER and wpa1.LotId = (SELECT lotid FROM ngw_lot n JOIN master_plant mp on mp.ID = n.plantid WHERE n.lotno =intrad.LoadedLotNo and mp.WERKS = intrad.SendingPlant limit 1) limit 1)as MovementQty1,
     (SELECT wpa2.MovementQty from ngw_weeklyplan_actual wpa2 WHERE wpa2.VANumber = eva.ZVA_NUMBER and wpa2.LotId = (SELECT lotid FROM ngw_lot n JOIN master_plant mp on mp.ID = n.plantid WHERE n.lotno =intrad.LoadedLotNo2 and mp.WERKS = intrad.SendingPlant limit 1) limit 1)as MovementQty2,
     (SELECT wpa3.MovementQty from ngw_weeklyplan_actual wpa3 WHERE wpa3.VANumber = eva.ZVA_NUMBER and wpa3.LotId = (SELECT lotid FROM ngw_lot n JOIN master_plant mp on mp.ID = n.plantid WHERE n.lotno =intrad.LoadedLotNo3 and mp.WERKS = intrad.SendingPlant limit 1) limit 1)as MovementQty3,

     intrad.ReceivingBin_id,intrad.ReceivingBin_Name, eva.tripsheet_no,eva.driver_name,CASE 
     WHEN eva.RejectionStatus IS NULL AND eva.VEHICLE_STATUS = 5 THEN '' 
     ELSE 'U' 
     END AS update_flag,
     intrad.L1_MachineType1,intrad.L1_MachineType2,intrad.L1_MachineType3,
     intrad.L2_MachineType1,intrad.L2_MachineType2,intrad.L2_MachineType3,
     intrad.L3_MachineType1,intrad.L3_MachineType2,intrad.L3_MachineType3
     
        
     FROM

     intrastate_warhouse_dispatch_info intrad 
     JOIN empty_vehicle_arrival eva ON intrad.VehicleArrivalId = eva.ID
     LEFT JOIN master_plant b ON intrad.SendingPlant=b.WERKS
     LEFT JOIN master_plant c ON intrad.ReceivingPlant=c.WERKS
     where eva.ID = '$ID'";
     $result = mysqli_query($connect, $query);
     $result = mysqli_fetch_assoc($result);
     $model = new RakeloadingModel();
     if($result['PO_Number']){
        $data=array(
          'VEHICLE_STATUS'=>13,
        );
      $result1 = $model->IASDeliveryCompletionUpdate($ID,$data);
     }
          // print_r($result);exit;

     $urlPath ="zwh_pp_sap/ias_data?sap-client=900";  
     $res = SapUrlHelper::PushToSap($urlPath,json_encode([$result]));
     $status  = $res[0]->STATUS ?? 0;
     $message = $res[0]->MESSAGE ?? 'No message received from SAP';

     if($status == 0){
      $data=array(
        'VEHICLE_STATUS'=>13,
      );
     $result = $model->IASDeliveryCompletionUpdate($ID,$data);
      return  $this->respond(["success" => false ,"message"=> "$message Please Contact SAP Team"]);
     }else if($res[0]->STATUS > 0){
        //  $model = new RakeloadingModel();
        //  $result = $model->IASDeliveryCompletionUpdate($ID,1);
         $data=array(
            'VEHICLE_STATUS'=>5,
          );
          $result = $model->IASDeliveryCompletionUpdate($ID,$data);
      return  $this->respond(["success" => true ,"message"=> 'Updated Sucessfully']);  
    }  
	}
  public function IASMigoUpdate($ID,$wbEmptyWt,$wbNetWt,$gunnyLessNetWt){
		include_once APIPATH . "/db_connection.php";

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

      (Select Id From master_mrc_wheat_variety Where Segment = intrad.Segment limit 1) as WheatvarietyId1,
      (Select Id From master_mrc_wheat_variety Where Segment = intrad.Segment2 limit 1) as WheatvarietyId2,
      (Select Id From master_mrc_wheat_variety Where Segment = intrad.Segment3 limit 1) as WheatvarietyId3,

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

      (SELECT wpa1.MovementQty from ngw_weeklyplan_actual wpa1 WHERE wpa1.VANumber = eva.ZVA_NUMBER 
            and wpa1.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo limit 1) limit 1)as MovementQty1,
            (SELECT wpa2.MovementQty from ngw_weeklyplan_actual wpa2 WHERE wpa2.VANumber = eva.ZVA_NUMBER 
            and wpa2.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo2 limit 1) limit 1)as MovementQty2,
            (SELECT wpa3.MovementQty from ngw_weeklyplan_actual wpa3 WHERE wpa3.VANumber = eva.ZVA_NUMBER 
            and wpa3.LotId = (SELECT lotid FROM ngw_lot WHERE lotno =intrad.LoadedLotNo3 limit 1) limit 1)as MovementQty3,

      intrad.ReceivingBin_id,intrad.ReceivingBin_Name,

      RecDet.Id as RecDet_Id, 
      RecDet.DateAdded as RecDet_DataAdded, RecDet.DateModified as Rec_DateModified, RecDet.ReceivingArrivalId, 
      RecDet.EmptyVehicleArrivalId, RecDet.IasDispatchId, RecDet.unloadingvendorid, RecDet.UnLoadingVendor, 
      RecDet.UnloadingChargePerTon, RecDet.WbType as Rec_WbType, 
      RecDet.WbEmptyWt as Rec_WbEmptyWt, RecDet.WbNetWt as Rec_WbNetWt, RecDet.WbLoadWt as Rec_WbLoadWt, RecDet.GunnyWt As Rec_GunnyWt, RecDet.GunnyLessNetWt as Rec_GunnyLessNetWt, 
      RecDet.NagaOutsideWBCopy, RecDet.VehicleStatus as Rec_VehicleStatus, RecDet.WBCopy as Rec_WBCopy,
      
      (SELECT lotid FROM ngw_lot WHERE lotid = RecDet.UnloadedLotNo limit 1) as UnloadLotid,
      (SELECT lotno FROM ngw_lot WHERE lotid = RecDet.UnloadedLotNo limit 1) as UnloadLotName,
      

      (SELECT BAG_REFID FROM master_bag WHERE BAG_CODE = RecDet.BagType limit 1) as Rec_BagTypeid,  
      (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag WHERE BAG_CODE = RecDet.BagType limit 1) as Rec_BagType,  

      (SELECT BAG_REFID FROM master_bag WHERE BAG_CODE = RecDet.BagType2 limit 1) as Rec_BagTypeid2, 
      (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag WHERE BAG_CODE = RecDet.BagType2 limit 1) as Rec_BagType2, 

      (SELECT BAG_REFID FROM master_bag WHERE BAG_CODE = RecDet.BagType3 limit 1) as Rec_BagTypeid3, 
      (SELECT concat(BAG_NAME,'|', WEIGHT) as BAG_NAME FROM master_bag WHERE BAG_CODE = RecDet.BagType3 limit 1) as Rec_BagType3, 
      
      RecDet.no_bags as Rec_no_bags, 
      RecDet.no_bags2 as Rec_no_bags2, 
      RecDet.no_bags3 as Rev_no_bags3,
      qi.moisture_quality as zmoisture_quality1,qi.hl_quality as zhl_quality1,qi.insect_damage_wheat_quality as zinsect_damage_wheat_quality1,
      CASE 
      WHEN eva.IsUpdated = 1 THEN 'PUT' 
      ELSE 'POST' 
      END AS METHOD
          
      FROM

      intrastate_warhouse_dispatch_info intrad 
      JOIN empty_vehicle_arrival eva ON intrad.VehicleArrivalId = eva.ID
      LEFT JOIN master_plant b ON intrad.SendingPlant=b.WERKS
      LEFT JOIN master_plant c ON intrad.ReceivingPlant=c.WERKS
      JOIN intrastate_gateout_info RecDet ON RecDet.EmptyVehicleArrivalId = intrad.VehicleArrivalId and RecDet.ReceivingArrivalId is not null
      JOIN purchase_info pi ON pi.EMPTY_VEHICLE_ARRIVAL_ID = intrad.VehicleArrivalId and pi.ZVA_NUMBER=eva.ZVA_NUMBER
      LEFT JOIN quality_info qi ON pi.PI_REFID=qi.purchase_info_id
      where eva.IsUpdated = '1' AND eva.ID = '$ID'";
      // print_r($query);exit;

     $result = mysqli_query($connect, $query);
     $result = mysqli_fetch_assoc($result);

     $result['Rec_WbEmptyWt'] = ($result['Rec_WbEmptyWt'] < 0) ? 0 :  $wbEmptyWt;
     $result['Rec_WbNetWt'] = ($result['Rec_WbNetWt'] < 0) ? 0 : $wbNetWt;
     $result['Rec_GunnyLessNetWt'] = ($result['Rec_GunnyLessNetWt'] < 0) ? '0.000' : number_format($gunnyLessNetWt, 3, '.', '');

     $urlPath ="zwh_pp_sap/ias_data?sap-client=900";    
     $res = SapUrlHelper::PushToSap($urlPath,json_encode([$result]));
     $message = $res[0]->MESSAGE;
     if($res[0]->STATUS == 0){
      // return $this->sendErrorResult("$message Plea se Contact SAP Team");
      return  $this->respond(["success" => false ,"message"=> "$message Please Contact SAP Team"]);
    }else if($res[0]->STATUS > 0){
         $model = new RakeloadingModel();
         $data = array(
          'IsUpdated'=> 2,
         );
         $result = $model->IASDeliveryCompletionUpdate($ID,$data);
      return  $this->respond(["success" => true ,"message"=> 'Updated Sucessfully']);  
    }  
	}
}
