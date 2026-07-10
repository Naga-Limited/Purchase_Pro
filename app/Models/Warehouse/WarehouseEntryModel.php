<?php

namespace App\Models\Warehouse;

use CodeIgniter\Model;

class WarehouseEntryModel extends Model
{
  public function checkLotExist($LotNumber){
    
    $fetchsql="SELECT count(1) as Cnt FROM `ngw_lot` where lotno='$LotNumber' and RecStatus='1'";

    $builder =  $this->db->query($fetchsql);
    return  $builder->getResultArray();
  }
  public function updateMaster_new_warehouse($id,$Data){
    //var_dump($Data);
   //exit();
    $this->db->table('warehouse_master')->set($Data)->where('wh_refid',$id)->update();
    $InsId=$id;
    return $InsId;
   }
   public function  insertMaster_new_warehouse($Data){
  //var_dump($Data);

     $this->db->table('warehouse_master')->set($Data)->insert();
     $InsId=$this->insertID();
 
     return $InsId;
  }
  
  public function getwarehousedata($Id) {
    $fetchsql = "SELECT wh_refid,wh_code,WH_NAME,whaddress,whcity,street,whpincode,
    district,state,whlat,whlong,ownertype,ownername,owneraddress,
    ownerstreet,ownerpincode,ownercity,ownerdistrict,ownerstate,
    ownerfaxnumber,ownerlandlineno,ownermobileno,ownermailid,
    totalcapacityinmts,totalcapacityinsqft,pillarinfo,outsideareacapacitymts,
    outsideareacapacityinsqft,contractstartdate,contractenddate,
    advancevalueaftertds,rentpersqft,rentpermonth,rentduedate,
    lockingperiodinmonths,noticeperiodinmonths,contracttype,servicechargespwh,
    bankname,bankbranch,bankcity,bankdistrict,bankstate,bankpincode,
    bankaccountno,bankifsc,bankaccounttype,wb_count,wb_1_name,wb_2_name,
    wb1_capacity_in_mts,wb2_capacity_in_mts,wb1_stamping_start_date,wb2_stamping_start_date,wb1_stamping_expiry_date,wb2_stamping_expiry_date,wb1_stamping_certificate_attachment,wb2_stamping_certificate_attachment,separate_electric_meters,electric_plug_points_inside,electric_light_points_outside,electric_light_points_inside,electric_light_points_outside,drinking_water_facility,
    no_of_fire_extinguisher,borewell_facility,toilet_facility,water_connection,
    year_of_construction,warehouse_security,naga_security,boundary_wall,
    distance_railway_goods_shed,distance_mandi,distance_national_highways,
    distance_fci_procurement_point,distance_state_highways,distance_pucca,
    statutory_survey_type,statutory_type_attachment,license_no_1,license_copy_attachment1,license_no_2,license_copy_attachment2,license_no_3,
    license_copy_attachment3,independent_gate,wall_type,
    shutter_count,plinth,no_of_exits,roof_type,door_count,floor_height,
    wh_photograph_attachment,floor_type,window_count,height_from_adj_land,
    inside_road_type,inside_heavy_vehicle_mvmt,inside_no_of_truck_in_capacity,
    repair_work_remarks,latest_audit_date,next_audit_due_date,audit_type,
    name_of_collateral,name_of_bank,naga_pwh_insurance_no,naga_pwh_insurance_attachment,insurance_covered_amt,insurance_premium_amt,insurance_period,
    insurance_start_date,insurance_end_date,insurance_company,gst_registration,
    company_name,godown_type,contract_agreement_attachment,gst_type,
    effective_from,effective_to,cost_centre,gl_account,insby,insdt,modby,
    moddt, RecStatus, CM_fees, Security_salary from warehouse_master where RecStatus='1' and wh_refid='$Id'";
    $builder =  $this->db->query($fetchsql);

    return  $builder->getResultArray();
  }

  public function getWarehouseRentaldet($Month){
    $fetchsql = "SELECT cast(ifnull(b.approval_status,0) as unsigned) as rent_approve_status, a.wh_refid, WH_CODE, WH_NAME, rentpersqft, ROUND(rentpermonth/30,0) RentPerDay, totalcapacityinsqft, 
                @UsedDays:=day(last_day(concat('$Month','-01'))) UsedDays,
                ROUND((rentpersqft * totalcapacityinsqft)) RentPerMonth, rentduedate, cost_centre, gl_account 
                 
                FROM warehouse_master a left join ngw_warehouse_rental b on a.wh_refid = b.wh_refid 
                AND b.rentmonth = '".$Month."' where a.RecStatus='1' and a.approval_status>2";
    //echo $fetchsql;
    $builder =  $this->db->query($fetchsql);
    return $builder->getResultArray();
  }  

  public function getWarehouseRentaldetByIdDate($wh_refid, $rentdate)
  {
  $fetchsql = "SELECT id FROM `ngw_warehouse_rental` 
  where wh_refid=".$wh_refid." and rentmonth='".$rentdate."' limit 1";
  
  $builder =  $this->db->query($fetchsql);

  return $Tmprow = $builder->getResultArray();
  }  

  public function InsertApproveRental($Data)
  {
    // echo "Insert";
    // print_r($Data);
   // exit();
    $this->db->table('ngw_warehouse_rental')->set($Data)->insert();
    $InsId=$this->insertID();

    $warehousedate = Array(
      "last_rent_approve_date"=>$Data['rentdate']
    );
    $this->db->table('warehouse_master')->set($warehousedate)->where('wh_refid',$Data['wh_refid'])->update();
    
    return $InsId;
  }

  public function UpdateApproveRental($id, $Data)
  {
    $this->db->table('ngw_warehouse_rental')->set($Data)->where('id',$id)->update();
    $InsId=$id;
    return $InsId;
  }

  public function UpdateApproveRentalPostDet($Data)
  {
  
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");
   //  var_dump($Data->formDBData[0]);
    $retval=0;
    foreach ($Data->WarehouseDatas as $row) 
    {

       $fetchsql = "SELECT id FROM `ngw_warehouse_rental` 
       where wh_refid=".$row->wh_refid." and rentmonth='".$Data->rentmonth."' and approval_status = 1
        limit 1";

       //echo $fetchsql;
       $builder =  $this->db->query($fetchsql);

       $Tmprow = $builder->getResultArray();
       //  var_dump($Tmprow);
       // echo "X".sizeof($Tmprow)."X";
       if($Tmprow[0] !==null and isset($Tmprow[0]))
       {
         $DataArr=Array(
           "ModBy"=>$SessionUser,
           "ModDt"=>$CurrentDateTime,
           "PostBy"=>$SessionUser,
           "postdate"=>$Data->PostDate,
           "postremarks"=>$Data->PostRemarks,
         );
//echo $Tmprow[0]['id'];
//print_r($DataArr);
        $retval=$this->UpdateApproveRental($Tmprow[0]['id'], $DataArr);
       }
       
    }
    return $retval;
  }

  public function WarhouseSummaryReport() {
    $fetchsql = "SELECT  
    b.WH_CODE,
    b.WH_NAME,
    CONCAT(c.WERKS, '-', c.PLANT_NAME) AS PLANT_NAME,
    COUNT(DISTINCT CASE WHEN c.plant_subdivision = 0 THEN a.lotid ELSE NULL END) AS lotnocount,
    -- SUM(CASE WHEN a.lotno THEN 1 ELSE 0 END) AS lotnocount,
    ROUND(SUM(CASE WHEN c.plant_subdivision = 0 THEN a.totalcapacity ELSE 0 END) / 1000, 3) AS totalcapacityinmts,
    COUNT(DISTINCT CASE WHEN d.SAP_Qty > 0 AND d.SAP_Qty <= 100000 AND c.plant_subdivision = 0 THEN d.lotid ELSE NULL END) AS partial_lot,
    COUNT(DISTINCT CASE WHEN d.SAP_Qty > 0 AND c.plant_subdivision = 0 THEN d.lotid ELSE NULL END) AS sap_lot,
    ROUND((SUM(CASE WHEN c.plant_subdivision = 0 THEN a.totalcapacity ELSE 0 END) 
          - SUM(CASE WHEN c.plant_subdivision = 0 THEN IFNULL(d.SAP_Qty, 0) ELSE 0 END)) / 1000, 3) AS free_space,
    ROUND(SUM(CASE WHEN c.plant_subdivision = 0 THEN d.SAP_Qty ELSE 0 END) / 1000, 3) AS SAP_Qty,
    COUNT(DISTINCT CASE WHEN c.plant_subdivision = 0 THEN a.lotid ELSE NULL END) - 
    COUNT(DISTINCT CASE WHEN d.SAP_Qty > 0 AND c.plant_subdivision = 0 THEN d.lotid ELSE NULL END) AS empty_lot 
    FROM ngw_lot a
    JOIN warehouse_master b ON a.warehouseid = b.WH_REFID
    JOIN master_plant c ON a.plantid = c.ID AND b.WH_CODE = c.WH_CODE AND c.plant_subdivision IN (0)
    LEFT JOIN ngw_sublot d ON a.lotid = d.lotid 
        AND a.plantid = d.plantid 
        AND a.locationid = d.StorageLocationId 
        AND c.plant_subdivision IN (0)
    WHERE a.RecStatus = '1' AND c.plant_subdivision IN (0)
    GROUP BY b.WH_REFID ORDER BY b.WH_REFID ASC";
    $builder =  $this->db->query($fetchsql);

    return  $builder->getResultArray();
  }
}
