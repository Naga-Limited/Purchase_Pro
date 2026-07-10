<?php 
namespace App\Models;
use CodeIgniter\Model;

class PortDispatchModel extends Model
{  
  public function getReceivedContainerList(){
    $builder =  $this->db->query("select distinct containerNo as label, cd.id as value, pdi.id as id  from 
    interstate_port_dispatch_info pdi
    join interstate_container_details cd on pdi.id = cd.portdispatchId
    join empty_vehicle_arrival va on va.id = cd.vehicleArrivalId   
    where not exists (select di.IrsContainerDetailsId from intrastate_warhouse_dispatch_info di WHERE di.IrsContainerDetailsId = cd.Id)
    and va.VEHICLE_STATUS in (9,10,12)
    ");
    return  $builder->getResultArray();
  }

  public function getContainersBySendingPort($portOfLoading){
    $fetchsql = "select distinct va.CONTAINER_NO as value, va.CONTAINER_NO as label from empty_vehicle_arrival va join interstate_warehouse_dispatch_info di on di.ArrivalId=va.id  where VEHICLE_STATUS=9 and di.PortOfLoading='$portOfLoading'";
  
    return $this->db->query($fetchsql )->getResultArray();
  }

  public function getContainerDetailById($id){
    $sql = "select di.arrivalId, di.truckNo, di.portOfLoading, di.portOfDischarge, di.eda,di. wbLoadWt,di. wbNetWt, di.gunnyLessNetWt, di.stuffingVendor, di.yarToPortFrtVendor, di.linerName, di.fumigation, di.fumigationVendorName, di.fumigationRatePerC, di.stuffingRate, di.yardToPortRate, di.linerOceanFrt, di.serialNo as sealNumber, di.customDocumentCopy, di.eWayBillCopy, di.nagaWbCopy, di.saleInvoiceCopy, di.loadingDate, di.supplierName, di.loadingType, di.totalBags, 
    va.PLANT_ID as plantId,  va.id as vehilceArraivalId, va.Container_no as containerNo, va.container_type as containerType , po.DeliveryQty as invoiceQuantity, cd.poNumber, cd.wheatVariety,cd.stodeliveryNo,cd.InterCoSaleInvNo as saleInvoiceNumber,  pdi.portOfLoading,  pdi.portOfDischarge, pdi. eda,
    po.sisterConcernFrom, po.sisterConcernTo,po.sendingStorageLocation, po.receivingStorageLocation,po.materialNo,po.lineItem,po.packedType,po.bagType,po.noOfBags,po.gunnyWt,po.sendingStorageLocation,po.salesInvoice as salesInvoiceNo, po.sisterConcernTo,linerName,
    cd.loadingDate,va.WB_EMPTY_WT as wbEmptyWt, va.DRIVER_NO as driverNo
    from empty_vehicle_arrival va
  join interstate_warehouse_dispatch_info di on di.arrivalid=va.id
  join interstate_warehouse_dispatch_lineitem po on di.id=po.DispatchInfoId 
  join interstate_container_details cd on cd.vehicleArrivalId = va.id
  join interstate_port_dispatch_info pdi on pdi.id = cd.portdispatchId
    where cd.id=$id ";
    // va.Container_no in ('". $id ."') 

    $builder =  $this->db->query($sql);
    return  $builder->getResultArray();
  }
  
}