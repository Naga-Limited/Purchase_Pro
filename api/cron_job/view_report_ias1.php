<?php

include_once APIPATH . "/db_connection.php";
$delimiter = ',';
date_default_timezone_set("Asia/Calcutta");
$date = date("YmdHis");
//$enclosure = '"';
$output_csv = "SELECT * FROM view_report_ias WHERE IsUpdated = 0";

//echo $output_csv;
//exit();
$result = mysqli_query($connect, $output_csv);
if (mysqli_num_rows($result) > 0) {
 //$fp = fopen('/home/nlsdp73/SAP/PP/ias/pp_sap_ias/' . $date . 'view_report_ias.csv', 'w');
    $fp = fopen('E:\\Foresight\\PurchasePro\\api\\cron_job\\Foresight\\' . $date . '_view_report_ias.csv', 'w');
    //$fp = fopen('E:\\wamp64\\www\\nagapptest\\api\\cron_job\\Foresight\\' . $date . 'view_report_ias.csv', 'w');

    $output = array('PI_REFID',    'ReceiverGateInTime',    'ReceiverGateoutTime',    'PI_ZVA_NUMBER',    'PI_WERKS',    'PI_TRUCK_NO',    'PI_DRIVER_NO',    'PI_VECHICAL_STATUS',    'PI_VEHICLE_TYPE',    'PI_QA_STATUS',    'PI_CONTAINER_NO',    'DI_Id',    'DI_VehicleArrivalId',    'DI_IntraStateSapId',    'DI_AddedBy',    'DI_ModifiedBy',    'DI_LoadedLotNo',    'DI_LastMileTransporterId',    'DI_LastMileTransporter',    'DI_LoadingVendorId',    'DI_LoadingVendor',    'DI_LoadingChargesPerTon',    'DI_FreightChargesPerTon',    'DI_PickslipNo',    'GO_WbType',    'GO_WbName',    'GO_WbSerialNumber',    'GO_WbTicketNumber',    'GO_WbEmptyWt',    'GO_WbNetWt',    'GO_WbLoadWt',    'GO_GunnyWt',    'GO_GunnyLessNetWt',    'GO_BagType',    'GO_UnloadedLotNo',    'GO_UnLoadingVendorId',    'GO_UnLoadingVendor',    'GO_UnloadingChargePerTon',    'GO_NagaOutsideWBCopy',    'DI_IsTruck',    'DI_TrailerNo',    'DI_TruckNo',    'DI_ContainerNo',    'DI_IrsContainerDetailsId',    'DI_PickslipQty',    'DI_SalesInvoiceNo',    'DI_SealNumber',    'DI_PickSlipCopy',    'SAP_SendingPlant',    'SAP_SendingStorageLocation',    'SAP_PickslipQty',    'SAP_MaterialNo',    'SAP_Segment',    'SAP_WheatVariety',    'SAP_ReceivingPlant',    'SAP_ReceivingStorageLoc',    'SAP_StoPoNo',    'SAP_DeliveryNo',    'SAP_DeliveryDate',    'SenderGateOut',    'SenderGateIn',    'SendingWbLoadWt',    'SendingWbEmptyWt',    'SendingWbNetWt',    'SendingGunnyWt',    'SendingGunnyLessNetWt',    'SendingBagType',    'CON_sealNumber',    'CON_salesInvoiceNo',    'CON_eWayBillCopy',    'CON_nagaWbCopy',    'CON_saleInvoiceCopy',    'CON_StoPoNo',    'CON_DeliveryNo', 'GO_no_bags(1)',  'BagType(2)','GO_no_bags(2)', 'BagType(3)','GO_no_bags(3)','Total Duration');
    
    fputcsv($fp, $output);
    while ($row = mysqli_fetch_array($result)) {
$IasGateIn=$row['GateInDt'];
$StoGateOut=$row['GateOutDt'];

//$Difference="";
$Difference=TimeDiff($IasGateIn,$StoGateOut);
//exit();
       $test = array(trim($row['PI_REFID']),    trim($row['ReceiverGateInTime']),    trim($row['ReceiverGateoutTime']),    trim($row['PI_ZVA_NUMBER']),    trim($row['PI_WERKS']),    trim($row['PI_TRUCK_NO']),    trim($row['PI_DRIVER_NO']),    trim($row['PI_VECHICAL_STATUS']),    trim($row['PI_VEHICLE_TYPE']),    trim($row['PI_QA_STATUS']),    trim($row['PI_CONTAINER_NO']),    trim($row['DI_Id']),    trim($row['DI_VehicleArrivalId']),    trim($row['DI_IntraStateSapId']),    trim($row['DI_AddedBy']),    trim($row['DI_ModifiedBy']),    trim($row['DI_LoadedLotNo']),    trim($row['DI_LastMileTransporterId']),    trim($row['DI_LastMileTransporter']),    trim($row['DI_LoadingVendorId']),    trim($row['DI_LoadingVendor']),    trim($row['DI_LoadingChargesPerTon']),    trim($row['DI_FreightChargesPerTon']),    trim($row['DI_PickslipNo']),    trim($row['GO_WbType']),    trim($row['GO_WbName']),    trim($row['GO_WbSerialNumber']),    trim($row['GO_WbTicketNumber']),    trim($row['GO_WbEmptyWt']),    trim($row['GO_WbNetWt']),    trim($row['GO_WbLoadWt']),    trim($row['GO_GunnyWt']),    trim($row['GO_GunnyLessNetWt']),    trim($row['GO_BagType']),    trim($row['GO_UnloadedLotNo']),    trim($row['GO_UnLoadingVendorId']),    trim($row['GO_UnLoadingVendor']),    trim($row['GO_UnloadingChargePerTon']),    trim($row['GO_NagaOutsideWBCopy']),    trim($row['DI_IsTruck']),    trim($row['DI_TrailerNo']),    trim($row['DI_TruckNo']),    trim($row['DI_ContainerNo']),    trim($row['DI_IrsContainerDetailsId']),    trim($row['DI_PickslipQty']),    trim($row['DI_SalesInvoiceNo']),    trim($row['DI_SealNumber']),    trim($row['DI_PickSlipCopy']),    trim($row['SAP_SendingPlant']),    trim($row['SAP_SendingStorageLocation']),    trim($row['SAP_PickslipQty']),    trim($row['SAP_MaterialNo']),    trim($row['SAP_Segment']),    trim($row['SAP_WheatVariety']),    trim($row['SAP_ReceivingPlant']),    trim($row['SAP_ReceivingStorageLoc']),    trim($row['SAP_StoPoNo']),    trim($row['SAP_DeliveryNo']),    trim($row['SAP_DeliveryDate']),    trim($row['SenderGateOut']),    trim($row['SenderGateIn']),    trim($row['SendingWbLoadWt']),    trim($row['SendingWbEmptyWt']),    trim($row['SendingWbNetWt']),    trim($row['SendingGunnyWt']),    trim($row['SendingGunnyLessNetWt']),    trim($row['SendingBagType']),    trim($row['CON_sealNumber']),    trim($row['CON_salesInvoiceNo']),    trim($row['CON_eWayBillCopy']),    trim($row['CON_nagaWbCopy']),    trim($row['CON_saleInvoiceCopy']),    trim($row['CON_StoPoNo']),    trim($row['CON_DeliveryNo']), trim($row['no_bags']), trim($row['BagType_2']), trim($row['no_bags2']), trim($row['BagType_3']), trim($row['no_bags3']),$Difference);
       fputcsv($fp, $test, ",", " ");
        $REF_ID = $row['WareHouseDispatchId'];
        $update = "UPDATE intrastate_warhouse_dispatch_info SET IsUpdated = '1' WHERE Id = $REF_ID";
        
        //echo $update;
        ////Remove comment when make it live 
       // mysqli_query($connect, $update);
    
    }
    fclose($fp);
}
function TimeDiff($Date1,$Date2){
    $Time=" ";
   //echo "<br>test";
//var_dump($Date1);
//var_dump($Date2);
   
    if($Date1!=NULL && $Date2!=NULL){
        $Diff=strtotime($Date2)-strtotime($Date1);
       $Years=floor($Diff/31536000);
        $Days=floor($Diff/86400);
        $Months=floor($Days/30);
        $ExDays=fmod($Days,30);
        $EXHours=floor((fmod($Diff,86400))/3600);

         $EXMinutes=floor((fmod($Diff,3600))/60);
    if($Years>0){ $Time.=" ".$Years." Year(s)"; }
    if($Months>0){ $Time.=" ".$Months." Months(s)"; }
    if($ExDays>0){ $Time.=" ".$ExDays." Days(s)"; }
    if($EXHours>0){ $Time.=" ".$EXHours." Hours(s)"; }
    if($EXMinutes>0){ $Time.=" ".$EXMinutes." Minutes(s)"; }
    }
return $Time;



}
