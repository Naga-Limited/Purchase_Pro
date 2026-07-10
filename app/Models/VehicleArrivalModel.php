<?php 
namespace App\Models;
use CodeIgniter\Model;
use App\Helpers\StatusConstant;
date_default_timezone_set("Asia/Calcutta");
class VehicleArrivalModel extends Model
{ 
   protected $table = 'purchase_info';
   protected $primaryKey = 'PI_REFID';
   protected $allowedFields = ["SecondWeightEntryDt","SecondWeightEntryBy","SecondWeightEntryByName","FirstWeightEntryDt","FirstWeightEntryBy","FirstWeightEntryByName","LastStatusChangedBy","LastStatusChangedOn","UnloadingRedirectGateoutDt","UnloadingRedirectGateoutBy","UnloadingRedirectDt","UnloadingRedirectBy","QualityDeductionRejectDt","QualityDeductionRejectBy","QualityDeductionSubmitDt","QualityDeductionSubmitBy","UnloadWHSubmitDt","UnloadWHSubmitBy","MIGOApprovalDt","MIGOApprovalBy","GateOutDt","GateOutByName","GateOutBy","QualityCheckSubmitDt","QualityCheckSubmitBy","GateInDt","GateInBy","WaitOutsideDt","WaitOutsideBy", "AddedBy","ModifiedBy", "WERKS","ZVA_NUMBER", "TRUCK_NO", "DRIVER_NO", "VECHICAL_STATUS",  "SCREEN_TYPE", "VEHICLE_TYPE", "QA_STATUS", "PICK_SLIP_NO", "EMPTY_VEHICLE_ARRIVAL_ID"];
  
   public function isPickSlipExist($pickSlipNo){
     $builder =  $this->db->table($this->table);
     $builder->selectCount('PI_REFID',"totalCount");
     $builder->where("PICK_SLIP_NO='$pickSlipNo' and (QA_STATUS is null or QA_STATUS<>'R') and VECHICAL_STATUS<>".StatusConstant::$COMPLETED);
     $total = $builder->get()->getFirstRow()->totalCount;
     return $total>0;   
    }

    public function isVehicleNoExist($vehicleNo){
      $builder =  $this->db->table($this->table);
      $builder->selectCount('PI_REFID',"totalCount");
      $builder->where("TRUCK_NO='$vehicleNo' and (QA_STATUS is null or QA_STATUS<>'R') and VECHICAL_STATUS<>".StatusConstant::$COMPLETED);
      $total = $builder->get()->getFirstRow()->totalCount;
      if ($total == 0){
        return true;   
      }else{
        return false;   
      }
      
     }

     public function isVehicleNoExistAllCloseStatus($vehicleNo){
      $builder =  $this->db->table($this->table);
      $builder->selectCount('PI_REFID',"totalCount");
      $builder->where("TRUCK_NO='$vehicleNo' 
      and VECHICAL_STATUS not in ( ".StatusConstant::$COMPLETED.",".StatusConstant::$MIGOCOMPLETED.",".StatusConstant::$REJECT_GATEOUT.",".StatusConstant::$REDIRECT.",".StatusConstant::$PROCESS_REJECT.",".StatusConstant::$MIGO_REVERSE_APPROVAL.",".StatusConstant::$MIGO_REVERSE_REJECT.",".StatusConstant::$MIGO_REJECT.",".StatusConstant::$PO_APPROVAL.",".StatusConstant::$WB_APPROVAL.",".StatusConstant::$PO_CHANGE.",".StatusConstant::$WB_CHANGE.",".StatusConstant::$PROCESS_REJECT.",".StatusConstant::$MIGOAPPROVAL.")");
      $total = $builder->get()->getFirstRow()->totalCount;
      if ($total == 0){
        return true;   
      }else{
        return false;   
      } 
     }

     public function isClearOldEntries($WERKS){
      $builder =  $this->db->table($this->table);
      $builder->selectCount('PI_REFID',"totalCount");

      $varCuurentDate = date('Y-m-d H:i:s'); 
      $EndDate = date('Y-m-d 23:59:59', strtotime($varCuurentDate));
      $ias = $this->db->query("select id,temp_extended_days FROM delivery_control_panel where status = 2 and delivery_control_id = 2 order by id");
      $res = $ias->getResultArray();
      $temp_extended_days = $res[0]["temp_extended_days"];
      $days_ias = -7 - $temp_extended_days ;
      $date_ias  = date('Y-m-d', strtotime("$days_ias day", strtotime($EndDate)));
      // print_r($date_ias);exit();
      $builder->where("WERKS='$WERKS' and DateAdded <= '$date_ias' and SCREEN_TYPE = 'IAS'
      and VECHICAL_STATUS not in ( ".StatusConstant::$COMPLETED.",".StatusConstant::$MIGOCOMPLETED.",".StatusConstant::$REJECT_GATEOUT.",".StatusConstant::$REDIRECT.",".StatusConstant::$PROCESS_REJECT.",".StatusConstant::$MIGO_REVERSE_APPROVAL.",".StatusConstant::$MIGO_REVERSE_REJECT.",".StatusConstant::$MIGO_REJECT.",".StatusConstant::$PO_APPROVAL.",".StatusConstant::$WB_APPROVAL.",".StatusConstant::$PO_CHANGE.",".StatusConstant::$WB_CHANGE.",".StatusConstant::$PROCESS_REJECT.",".StatusConstant::$MIGOAPPROVAL.")");
      $total = $builder->get()->getFirstRow()->totalCount;
      // print_r($total);exit();
      if ($total == 0){
        return true;   
      }else{
        return false;   
      } 
     }

   public function  add($postData){
      $res = $this->getNextZvaNumber("RMIAS",$postData->WERKS);
      //var_dump($postData) ;exit();
      $ret = $this->insert($postData);
      //echo $this->db->getLastQuery();
      return $ret;

   }

   public function UpdateWeight($id,$WeightEntry,$Status){
   
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    
    $upda =array();    
      
        if($WeightEntry==1){
          $upda['FirstWeightEntryDt']=$CurrentDateTime;
          $upda['VECHICAL_STATUS']=$Status;
          $upda['FirstWeightEntryBy']=$SessionUser;
          $upda['FirstWeightEntryByName']=$SessionUserName;
          
        }
        
        if($WeightEntry==2){
          $upda['SecondWeightEntryDt']=$CurrentDateTime;
          $upda['VECHICAL_STATUS']=5;
          $upda['SecondWeightEntryBy']=$SessionUser;
          $upda['SecondWeightEntryByName']=$SessionUserName;
          
        }
    return $this->update($id,$upda);   
   }

   public function updateStatus($id, $status){

    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $SessionUserName=$_SESSION["FIRSTNAME"];
    $CurrentDateTime=date("Y-m-d H:i:s");
    
    $upda =array("VECHICAL_STATUS"=>$status);    
      
        if($status==5){
          $upda['UnloadWHSubmitDt']=$CurrentDateTime;
          $upda['UnloadWHSubmitBy']=$SessionUser;
          $upda['UnloadWHSubmitByName']=$SessionUserName;
          
        }
        if($status==12){
          $upda['GateOutDt']=$CurrentDateTime;
          $upda['GateOutBy']=$SessionUser;
          $upda['GateOutByName']=$SessionUserName;
        }

        //var_dump($upda); exit();
    return $this->update($id,$upda);   
   }
   public function rejectAndGateOut($id){
    return $this->update($id,["VECHICAL_STATUS"=>StatusConstant::$GATEOUT, "QA_STATUS"=>'R']);   
   }

   public function getNextZvaNumber($moduleId, $plantId,$table="purchase_info",$orderBy="PI_REFID") {
      $sql = "select WH_CODE from master_plant where WERKS = '$plantId'";
      $qry = $this->db->query($sql);
      $whcode = "";
      $rs = $qry->getFirstRow();
      if(isset($rs))   {
        // echo "Enter", $rs->WH_CODE;
        $whcode = $rs->WH_CODE;   
      }
  
      $today = getdate(date("U"));
      $code = $moduleId . $whcode . substr($today["year"], 2, 2);
      $sql = "select ZVA_NUMBER from $table where ZVA_NUMBER like '" . $code . "%' ORDER BY $orderBy DESC LIMIT 1";
      //  echo  $sql ;
      $qry = $this->db->query($sql);
      $res = $qry->getFirstRow();
      if ($res) {
        $newzancode = str_replace($code, "", $res->ZVA_NUMBER);
        (int) $newzancode++;
        return $code . sprintf("%08d", $newzancode);
      } else {
        // echo $code;
        return $code . sprintf("%08d", 1);
      }
    }
    public function WeighmentCorrection($userId, $limit = 50, $offset = 0)
    {
        /* ================= USER PLANT FILTER ================= */
        $plantFilter = "";

        if ($userId != 1) {
            $plantFilter = "
                AND mp.WERKS IN (
                    SELECT mp2.WERKS
                    FROM master_user_plant mup
                    INNER JOIN master_plant mp2 ON mp2.ID = mup.PLANT_ID
                    WHERE mup.USER_ID = $userId
                )
            ";
            
        }

        /* ================= PURCHASE QUERY ================= */
        $purchaseSql = "
            SELECT 
                pi.ZVA_NUMBER,
                pi.WERKS AS PLANT,
                pi.TRUCK_NO,
                IF(pi.SCREEN_TYPE = 'SDI', 'RM PURCHASE', pi.SCREEN_TYPE) AS SCREEN_TYPE,
                pi.DateAdded,
                pi.VECHICAL_STATUS AS VEHICLE_STATUS,
                mp.PLANT_NAME,
                ps.FirstWeight,
                ps.SecondWeight,
                ps.NetWeight,
                pi.PI_REFID,
                psu.FirstWeight AS recievingFirstWt,
                psu.SecondWeight AS recievingSecondWt,
                psu.NetWeight AS recievingNetWt,
                pp.StatusName,
                '' AS VehicleArrivalId,
                '' AS SendingGunnyWt,
                ig.GunnyWt,
                gi.gunny_wt
            FROM purchase_info pi
            INNER JOIN master_plant mp ON mp.WERKS = pi.WERKS
            INNER JOIN pp_status pp ON pp.Id = pi.VECHICAL_STATUS
            INNER JOIN pp_silotomillweights_unload ps ON ps.VANumber = pi.ZVA_NUMBER
            LEFT JOIN pp_silotomillweights psu ON psu.VANumber = pi.ZVA_NUMBER
            LEFT JOIN intrastate_gateout_info ig ON ig.ReceivingArrivalId = pi.PI_REFID
            LEFT JOIN gateout_info gi ON gi.purchase_info_id = pi.PI_REFID
            WHERE pi.VECHICAL_STATUS IN (2,4,5,21,24,6)
            $plantFilter
            ORDER BY pi.DateAdded DESC
            LIMIT $limit OFFSET $offset
        ";

        /* ================= EMPTY VEHICLE QUERY ================= */
        $emptySql = "
            SELECT 
                ev.ZVA_NUMBER,
                ev.PLANT_ID AS PLANT,
                ev.TRUCK_NO,
                IF(ev.SCREEN_TYPE = 'EVADP', 'IAS', ev.SCREEN_TYPE) AS SCREEN_TYPE,
                ev.DateAdded,
                ev.VEHICLE_STATUS,
                mp.PLANT_NAME,
                ps.FirstWeight,
                ps.SecondWeight,
                ps.NetWeight,
                NULL AS PI_REFID,
                NULL AS recievingFirstWt,
                NULL AS recievingSecondWt,
                NULL AS recievingNetWt,
                pp.StatusName,
                ev.ID AS VehicleArrivalId,
                iw.GunnyWt AS SendingGunnyWt,
                '' AS GunnyWt,
                '' AS gunny_wt
            FROM empty_vehicle_arrival ev
            INNER JOIN master_plant mp ON mp.WERKS = ev.PLANT_ID
            INNER JOIN pp_status pp ON pp.Id = ev.VEHICLE_STATUS
            INNER JOIN pp_silotomillweights ps ON ps.VANumber = ev.ZVA_NUMBER
            LEFT JOIN intrastate_warhouse_dispatch_info iw ON iw.VehicleArrivalId = ev.ID
            WHERE ev.VEHICLE_STATUS IN (13,24,5)
            $plantFilter
            ORDER BY ev.DateAdded DESC
            LIMIT $limit OFFSET $offset
        ";

        $purchaseData = $this->db->query($purchaseSql)->getResultArray();
        $emptyData    = $this->db->query($emptySql)->getResultArray();

        return array_merge($purchaseData, $emptyData);
    }



    public function WeighmentCorrectionUpdate($postData)
    {
        $db = \Config\Database::connect();
        $currentDateTime = date("Y-m-d H:i:s");

        try {
            $db->transBegin();

            // ---------- COMMON INPUTS ----------
            $process    = $postData->process ?? 0;
            $remarks    = $postData->Remarks ?? null;
            $details    = $postData->Details ?? new \stdClass();

            $PI_REFID   = $details->PI_REFID ?? 0;
            $ZVA_NUMBER = $details->ZVA_NUMBER ?? null;
            $userInfoId = $postData->userInfoId ?? 0;

            // ---------- SAFE WEIGHT VALUES ----------
            $firstWt  = 0;
            $secondWt = 0;

            $netWeight = 0;

            // ---------- GUNNY ----------
            $gunnyWt = 0;

            $gunnyLessWt       = 0;
            $gunnyLessNetWt    = 0;

            /* ============================================================
              PROCESS 1 & 2 : REJECT
            ============================================================ */
            if (in_array($process, [1, 2])) {

                if ($PI_REFID > 0) {
                    $firstWt = isset($details->recievingFirstWt) ? $details->recievingFirstWt
                            : (isset($details->FirstWeight) ? $details->FirstWeight : 0);

                    $secondWt = isset($details->recievingSecondWt) ? $details->recievingSecondWt
                            : (isset($details->SecondWeight) ? $details->SecondWeight : 0);

                    $netWeight = $firstWt - $secondWt;

                    $gunnyWt = isset($details->gunny_wt) ? $details->gunny_wt
                            : (isset($details->GunnyWt) ? $details->GunnyWt
                            : (isset($details->SendingGunnyWt) ? $details->SendingGunnyWt : 0));

                    $gunnyLessWt = $netWeight - $gunnyWt;
                    // ---------- PURCHASE FLOW ----------
                    $db->table("purchase_info")
                        ->where('PI_REFID', $PI_REFID)
                        ->update([
                            'VECHICAL_STATUS'        => $details->VEHICLE_STATUS ?? null,
                            'weight_reject_remarks'  => $remarks,
                            'weight_reject_at'       => $currentDateTime,
                            'weight_reject_by'       => $userInfoId,
                        ]);

                    $db->table("pp_silotomillweights_unload")
                        ->where('VANumber', $ZVA_NUMBER)
                        ->update([
                            'FirstWeight'  => $firstWt,
                            'SecondWeight' => $secondWt,
                            'NetWeight'    => $netWeight,
                        ]);

                    $db->table("gateout_info")
                        ->where('purchase_info_id', $PI_REFID)
                        ->update([
                            'wb_net_wt'     => $netWeight,
                            'wb_empty_wt'   => $secondWt,
                            'wb_load_wt'    => $firstWt,
                            'gunny_wt'      => $gunnyWt,
                            'gunny_less_wt' => $gunnyLessWt,
                        ]);

                    $db->table("intrastate_gateout_info")
                        ->where('ReceivingArrivalId', $PI_REFID)
                        ->update([
                            'WbEmptyWt'        => $secondWt,
                            'WbLoadWt'         => $firstWt,
                            'WbNetWt'          => $netWeight,
                            'GunnyWt'          => $gunnyWt,
                            'GunnyLessNetWt'   => $gunnyLessWt,
                        ]);

                    $db->table("silotomill_gateout_info")
                        ->where('ReceivingArrivalId', $PI_REFID)
                        ->update([
                            'FirstWeight'  => $firstWt,
                            'SecondWeight' => $secondWt,
                            'NetWeight'    => $netWeight,
                        ]);

                } else {
                   
                     $firstWt  = $details->FirstWeight ?? 0;
                     $secondWt = $details->SecondWeight ?? 0;
                     $netWeight = $secondWt - $firstWt;
                      
                     $gunnyWt = !empty($details->gunny_wt) ? $details->gunny_wt :
                    (!empty($details->GunnyWt) ? $details->GunnyWt :
                    (!empty($details->SendingGunnyWt) ? $details->SendingGunnyWt : 0));
                    //   print_r($gunnyWt);exit();     
                     $gunnyLessWt = $netWeight - $gunnyWt;
                    // print_r('$db->getLastQuery()');exit();   
                    // ---------- EMPTY VEHICLE FLOW ----------
                    $db->table("empty_vehicle_arrival")
                        ->where('ZVA_NUMBER', $ZVA_NUMBER)
                        ->update([
                            'VEHICLE_STATUS'        => $details->VEHICLE_STATUS ?? null,
                            'weight_reject_remarks' => $remarks,
                            'weight_reject_at'      => $currentDateTime,
                            'weight_reject_by'      => $userInfoId,
                        ]);
                   
                    $db->table("pp_silotomillweights")
                        ->where('VANumber', $ZVA_NUMBER)
                        ->update([
                            'FirstWeight'  => $firstWt,
                            'SecondWeight' => $secondWt,
                            'NetWeight'    => $netWeight,
                        ]);

                    $db->table("intrastate_warhouse_dispatch_info")
                        ->where('VehicleArrivalId', $details->VehicleArrivalId ?? 0)
                        ->update([
                            'WbEmptyWt'       => $firstWt,
                            'WbLoadWt'        => $secondWt,
                            'WbNetWt'         => $netWeight,
                            'GunnyWt'         => $gunnyWt,
                            'GunnyLessNetWt'  => $gunnyLessNetWt,
                        ]);

                    $db->table("silotomill_dispatch_info")
                        ->where('VehicleArrivalId', $details->VehicleArrivalId ?? 0)
                        ->update([
                            'FirstWeight'  => $firstWt,
                            'SecondWeight' => $secondWt,
                            'NetWeight'    => $netWeight,
                        ]);
                }
            }

            /* ============================================================
              PROCESS 3 : WEIGHT CORRECTION
            ============================================================ */
            if ($process == 3) {

                $db->table("pp_silotomillweights_unload")
                    ->where('VANumber', $ZVA_NUMBER)
                    ->update([
                        'FirstWeight'           => $firstWt,
                        'ManualFirstWeight'     => $postData->recievingFirstWt ?? 0,
                        'NetWeight'             => $netWeight,
                        'weight_reject_remarks' => $remarks,
                        'weight_reject_at'      => $currentDateTime,
                        'weight_reject_by'      => $userInfoId,
                    ]);
            }

            // ---------- TRANSACTION CHECK ----------
            if (!$db->transStatus()) {
                throw new \Exception("Transaction Failed");
            }

            $db->transCommit();

            return [
                true,
                ($process == 3)
                    ? "First Weight Changed Successfully"
                    : "Weight Changed Successfully"
            ];

        } catch (\Throwable $e) {

            $db->transRollback();

            return [
                false,
                "Error during Weighment Correction: " . $e->getMessage()
            ];
        }
    }


}
