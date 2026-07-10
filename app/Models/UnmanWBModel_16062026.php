<?php

namespace App\Models;

use App\Helpers\SapUrlHelper;
use App\Helpers\VANumberHelper;
use CodeIgniter\Model;
use DateTime;

class UnmanWBModel extends Model
{	
 public function getVehicleDetails($data){
    // Basic validation
    if (empty($data->systemNo) || empty($data->vehicle) || $data->weight <= 0) {
        throw new \Exception("Missing required parameters: systemNo, vehicle, or weight");
    }
    if (!isset($data->weight) || $data->weight < 50) {
        throw new \Exception("Invalid weight. Please check vehicle: {$data->vehicle}");
    }
    $CurrentDateTime = date("Y-m-d H:i:s");
    $currentWeight = (float)$data->weight;

    // 1) Get master record
    $master = $this->db->table("unmanwb_master")
        ->select("unmanwb_master.*")
        ->where('systemNo', $data->systemNo)
        ->where('status', 1)
        ->get()
        ->getRowArray();

    if (!$master) {
        throw new \Exception("No master record found for systemNo: {$data->systemNo}");
    }

    // plantCodes (supports comma separated, e.g. "FM01,FM02")
    $plantCodes = array_filter(array_map('trim', explode(',', $master['plantCode'] ?? '')));
    // ===== 2) Try to fetch latest weighment_info for this vehicle (main flow) =====
    $wBuilder = $this->db->table("weighment_info")
        ->select("
            weighment_info.id,
            weighment_info.firstWeight,
            weighment_info.secondWeight,
            weighment_info.createdOn,
            gate_in_out_info.id as gateId,
            gate_in_out_info.vehicleNo,
            gate_in_out_info.moduleType,
            gate_in_out_info.vaNumber,
            gate_in_out_info.tripSheetNumber,
            gate_in_out_info.shipmentOrderNo,
            gate_in_out_info.stoPoNo,
            gate_in_out_info.subModuleTypeId,
            gate_in_out_info.gateInDateStamp,
            gate_in_out_info.remarks,
            gate_in_out_info.moduleStatusId,
            gate_in_out_info.vehicleType,
            gate_in_out_info.waitingAt,
            gate_in_out_info.movementType,
            gate_in_out_info.route,
            gate_in_out_info.driverMobileNumber,
            master_plant.WERKS as werks,
            bulker_vehicle.bulkerEmptyWeight,
            gate_in_out_info.userGateId,
        ")
        ->join('gate_in_out_info', 'weighment_info.gateInOutInfoId = gate_in_out_info.id', 'inner')
        ->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner')
         ->join('bulker_vehicle', 'bulker_vehicle.bulkerNo = gate_in_out_info.vehicleNo', 'left')
        ->where('gate_in_out_info.vehicleNo', $data->vehicle)
        ->whereIn('gate_in_out_info.waitingAt', [2,3,4,5,9])
        ->orderBy('weighment_info.id', 'DESC');

        if (!empty($plantCodes)) {
            $wBuilder->whereIn('master_plant.WERKS', $plantCodes);
        }

    $weightResult = $wBuilder->get()->getResultArray();

    // print_r($weightResult);exit;
    // If weighment_info exists -> main flow
    if (!empty($weightResult)) {
        $w = $weightResult[0];

        // safe extraction
        $firstWeight = (float)($w['firstWeight'] ?? 0);
        $secondWeight = (float)($w['secondWeight'] ?? 0);
        $movementType = isset($w['movementType']) ? (int)$w['movementType'] : null;
        $moduleType = isset($w['moduleType']) ? (int)$w['moduleType'] : null;
        $subModuleTypeId = isset($w['subModuleTypeId']) ? (int)$w['subModuleTypeId'] : 0;
        $gateId = $w['gateId'];
        $vaNumber = $w['vaNumber'] ?? '';
        $tripSheetNumber = $w['tripSheetNumber'] ?? '';
        $werks = $w['werks'] ?? ($w['plantWerks'] ?? '');
        $TYPE = ''; // will be set if needed by fgDetails loop later
        $SAP_DOCUMENT = '';
        // compute netWeight
        $netWeight = 0;
        if ($firstWeight > 0 && $currentWeight > 0) {
            if ($movementType === 1) {
                // 🔹 Loading — vehicle gets heavier
            if ($currentWeight <= $firstWeight) {
                    throw new \Exception("Loading: second weight must be greater than first weight: {$currentWeight}");
                }
                $netWeight = $currentWeight - $firstWeight;

            } elseif ($movementType === 2) {
                // 🔹 Unloading — vehicle gets lighter
                if ($currentWeight >= $firstWeight) {
                    throw new \Exception("UnLoading: second weight must be less than first weight: {$currentWeight}");
                }
                $netWeight = $firstWeight - $currentWeight;

            }
            if ($netWeight <= 0) {
                     throw new \Exception("Invalid net weight calculated. Please verify weighbridge readings: {$currentWeight}");
            }
        }
        // print_r($netWeight);exit;
        // SUBMODULE FG details fetch if needed
        if ($subModuleTypeId === 0 && in_array($moduleType, [1,2]) && $tripSheetNumber && $vaNumber) {
            $fgUrl = "zgatepro/zfg_shipment/zsap_gp_shipment?sap-client=900&Tripsheet_no={$tripSheetNumber}&Va_no={$vaNumber}";
            $fgDetails = SapUrlHelper::getWhDatas($fgUrl);
            $Landing_Data = new LandingDataModel();
            $fgDetailsData = json_decode($fgDetails);
            if (is_array($fgDetailsData) && count($fgDetailsData) > 0) {
                foreach ($fgDetailsData as $fg_details_data) {
                    $TYPE = $fg_details_data->TYPE ?? '';
                    $SAP_DOCUMENT = $fg_details_data->SAP_DOCUMENT ?? '';
                    if (!empty($fg_details_data->FROM_PLANT)) {
                        $sapDocumentField = ($fg_details_data->TYPE == 'FG-Sales') ? 'shipmentOrderNo' : 'stoPoNo';
                        $plant_id = $Landing_Data->PlantByID($fg_details_data->FROM_PLANT);
                        if (!empty($plant_id[0]['ID'])) {
                            $dataToUpdate = [
                                "moduleType" => ($fg_details_data->TYPE == 'FG-Sales') ? 1 : 2,
                                "masterPlantId" => $plant_id[0]['ID'],
                                $sapDocumentField => $fg_details_data->SAP_DOCUMENT
                            ];
                            $Landing_Data->Gate_info_Status_Change($gateId, $dataToUpdate);
                        }
                    }
                }
            }
        }
        if ($subModuleTypeId === 0 && in_array($moduleType, [43]) && $tripSheetNumber && $vaNumber) {
            $fgUrl = "zgatepro/zfg_shipment/zsap_gp_shipment?sap-client=900&Tripsheet_no={$tripSheetNumber}&Va_no={$vaNumber}";
            $fgDetails = SapUrlHelper::getWhDatas($fgUrl);
            $Landing_Data = new LandingDataModel();
            $fgDetailsData = json_decode($fgDetails);
            if (is_array($fgDetailsData) && count($fgDetailsData) > 0) {
                foreach ($fgDetailsData as $fg_details_data) {
                    $TYPE = $fg_details_data->TYPE ?? '';
                    $SAP_DOCUMENT = $fg_details_data->SAP_DOCUMENT ?? '';
                    if (!empty($fg_details_data->FROM_PLANT)) {
                        $sapDocumentField = ($fg_details_data->TYPE == 'FG-Sales') ? 'shipmentOrderNo' : 'stoPoNo';
                        $plant_id = $Landing_Data->PlantByID($fg_details_data->FROM_PLANT);
                        if (!empty($plant_id[0]['ID'])) {
                            $dataToUpdate = [
                                $sapDocumentField => $fg_details_data->SAP_DOCUMENT
                            ];
                            $Landing_Data->Gate_info_Status_Change($gateId, $dataToUpdate);
                        }
                    }
                }
            }
        }
        // CASE A: special modules or both first+second exist -> insert new weighment row (chain)
        if (($firstWeight && $secondWeight ) && in_array($moduleType, [5,7,13,21,33,19,29])) {
            $this->db->transStart();
             $netWeight1 = 0;
            if ($movementType === 1) {
             if ($currentWeight <= $secondWeight) {
                    throw new \Exception("Loading: second weight must be greater than first weight: {$currentWeight}");
                }
                $netWeight1 = $currentWeight - $secondWeight;
            } elseif ($movementType === 2) {
                // 🔹 Unloading — vehicle gets lighter
                if ($currentWeight >= $secondWeight) {
                    throw new \Exception("Unloading: second weight must be less than first weight: {$currentWeight}");
                }
                $netWeight1 = $secondWeight - $currentWeight;

            }
            if ($netWeight1 <= 0) {
                     throw new \Exception("Invalid net weight calculated. Please verify weighbridge readings: {$currentWeight}");
            }
           
            $ins = [
                'firstWeight' => $secondWeight,
                'secondWeight' => $currentWeight,
                'netWeight' => $netWeight1,
                'createdOn' => $CurrentDateTime,
                'createdBy' => $master['userId'] ?? 0,
                'secondWtSystemNo' => $data->systemNo,
                'gateInOutInfoId' => $gateId
            ];
            $this->db->table("weighment_info")->insert($ins);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) {
                throw new \Exception("DB insert failed for chain Weight (vehicle {$data->vehicle})");
            }
            return ['status'=>'success','message'=>'Chained Weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Chanined','NetWeight'=>$netWeight1 ,'vaNumber'=>$vaNumber];
        }
        // CASE A: special modules or both first+second exist -> insert new weighment row (chain)
        if (($firstWeight && $secondWeight ) && in_array($moduleType, [43])) {
            $this->db->transStart();
             $netWeight1 = 0;
            if ($movementType === 1) {
             if ($currentWeight <= $secondWeight) {
                    throw new \Exception("Loading: second weight must be greater than first weight: {$currentWeight}");
                }
                $netWeight1 = $currentWeight - $secondWeight;
            } elseif ($movementType === 2) {
                // 🔹 Unloading — vehicle gets lighter
                if ($currentWeight >= $secondWeight) {
                    throw new \Exception("Unloading: second weight must be less than first weight: {$currentWeight}");
                }
                $netWeight1 = $secondWeight - $currentWeight;

            }
            if ($netWeight1 <= 0) {
                     throw new \Exception("Invalid net weight calculated. Please verify weighbridge readings: {$currentWeight}");
            }
            $netWeight2 = $firstWeight - $currentWeight;
            $sap_data = [
                    "ZZTRANSATION_TYPE" =>  'FG-Sales',
                    "ZZTRUCK_NO" => $w['vehicleNo'] ?? $data->vehicle,
                    "ZZVA_NO" => $vaNumber,
                    "ZZDRIVER_PH" => $w['driverMobileNumber'] ?? '',
                    "ZZROUTE" => $w['route'] ?? '',
                    "ZZPLANT" => $w['werks'] ?? $werks,
                    "ZZCOLOR" => "Not Applicable",
                    "ZZREASON" => "",
                    "ZZREMARKS" => $w['remarks'] ?? '',
                    "ZZTRIPSHEET_NO" => $tripSheetNumber,
                    "ZZFirstWeight" => $firstWeight,
                    "ZZSecondWeight" => $currentWeight,
                    "ZZNetweight" => $netWeight2,
                    "NETWEIGHT"  => $netWeight2,
                    "DIFFWEIGHT" => 0,
                    "ZZSHIPMENT_NO" => $SAP_DOCUMENT ?: ($w['shipmentOrderNo'] ?? ''),
                    "ZZGATEIN_TIME" => $w['gateInDateStamp'] ?? '',
                    "veh_type" => $w['vehicleType'] ?? '',
                    "METHOD" => 'PUT',
                    "ZZLINE" => 1
                ];
                $urlPath1 = "zgatepro/zfgsales_weight/GP_SAP_FG?sap-client=900";
                // print_r($sap_data);exit;
                $res = SapUrlHelper::PushToSap($urlPath1, json_encode([$sap_data]));
                $message = $res[0]->MESSAGE ?? 'No message';
                $STATUS = $res[0]->STATUS ?? 0;

                // treat STATUS === 0 as failure (per your rule)
                if ($STATUS === 0) {
                    throw new \Exception($message . " (SAP Rejected)");
                }
            $ins = [
                'firstWeight' => $secondWeight,
                'secondWeight' => $currentWeight,
                'netWeight' => $netWeight1,
                'createdOn' => $CurrentDateTime,
                'createdBy' => $master['userId'] ?? 0,
                'secondWtSystemNo' => $data->systemNo,
                'gateInOutInfoId' => $gateId
            ];
            $this->db->table("weighment_info")->insert($ins);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) {
                throw new \Exception("DB insert failed for chain Weight (vehicle {$data->vehicle})");
            }
            return ['status'=>'success','message'=>'Chained Weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Chanined','NetWeight'=>$netWeight1 ,'vaNumber'=>$vaNumber];
        }
        // CASE B: firstWeight exists but second missing -> second weight flow
        if ($firstWeight && empty($secondWeight)) {
            // waitingAt==9 special check path
            if (($w['waitingAt'] ?? null) == 9) {
                $this->db->transStart();
                $this->db->table("weighment_info")
                    ->where('id', $w['id'])
                    ->update([
                        'secondWeightCheck' => $currentWeight,
                        'approvedOn' => $master['userId'] ?? 0,
                        'secondWtSystemNo' => $data->systemNo
                    ]);
                $this->db->table("gate_in_out_info")
                    ->where('id', $w['gateId'])
                    ->update(['moduleStatusId' => 2, 'waitingAt' => 3]);
                $this->db->transComplete();
                if ($this->db->transStatus() === false) throw new \Exception("DB update failed (secondWeightCheck)");
                return ['status'=>'success','message'=>'Second weight check added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Second Weight Check','vaNumber'=>$vaNumber];
            }

            // For moduleType 1 or 2 -> SAP FG-STO, then update if success
            if (in_array($moduleType, [1,2,43]) && $movementType === 1) {
                // Build SAP payload (use TYPE and SAP_DOCUMENT if filled earlier from fgDetails)
                $netWeight1 = null;
                $diffWeight = null;
                if($w['bulkerEmptyWeight']){
                    $netWeight1 = $currentWeight - $w['bulkerEmptyWeight'];
                    $diffWeight = $netWeight1 - $netWeight;
                }
                if($w['subModuleTypeId'] == 20 || $w['subModuleTypeId'] == 21 || $w['subModuleTypeId'] == 19){
                    $TYPE = 'Other-Sales';
                }else{
                    $TYPE = !empty($TYPE) ? $TYPE : 'FG-STO';
                }

                $sap_data = [
                    "ZZTRANSATION_TYPE" => $TYPE,
                    "ZZTRUCK_NO" => $w['vehicleNo'] ?? $data->vehicle,
                    "ZZVA_NO" => $vaNumber,
                    "ZZDRIVER_PH" => $w['driverMobileNumber'] ?? '',
                    "ZZROUTE" => $w['route'] ?? '',
                    "ZZPLANT" => $w['werks'] ?? $werks,
                    "ZZCOLOR" => "Not Applicable",
                    "ZZREASON" => "",
                    "ZZREMARKS" => $w['remarks'] ?? '',
                    "ZZTRIPSHEET_NO" => $tripSheetNumber,
                    "ZZFirstWeight" => $firstWeight,
                    "ZZSecondWeight" => $currentWeight,
                    "ZZNetweight" => $netWeight,
                    "NETWEIGHT"  => $netWeight1 !== null ? $netWeight1 : $netWeight,
                    "DIFFWEIGHT" => $diffWeight !== null ? $diffWeight : 0,
                    "ZZSHIPMENT_NO" => $SAP_DOCUMENT ?: ($w['shipmentOrderNo'] ?? ''),
                    "ZZGATEIN_TIME" => $w['gateInDateStamp'] ?? '',
                    "veh_type" => $w['vehicleType'] ?? '',
                    "METHOD" => 'PUT',
                    "ZZLINE" => 1
                ];
                $urlPath1 = "zgatepro/zfgsales_weight/GP_SAP_FG?sap-client=900";
                // print_r($sap_data);exit;
                $res = SapUrlHelper::PushToSap($urlPath1, json_encode([$sap_data]));
                $message = $res[0]->MESSAGE ?? 'No message';
                $STATUS = $res[0]->STATUS ?? 0;

                // treat STATUS === 0 as failure (per your rule)
                if ($STATUS === 0) {
                    throw new \Exception($message . " (SAP Rejected)");
                }

                // SAP success -> update DB
                $this->db->transStart();
                $this->db->table("weighment_info")
                    ->where('id', $w['id'])
                    ->update([
                        'secondWeight' => $currentWeight,
                        'netWeight' => $netWeight,
                        'modifiedBy' => $master['userId'] ?? 0,
                        'secondWtSystemNo' => $data->systemNo,
                        'documentNumber' => $SAP_DOCUMENT
                    ]);
                $this->db->table("gate_in_out_info")
                    ->where('id', $w['gateId'])
                    ->update(['moduleStatusId' => 3, 'waitingAt' => 4]);
                $this->db->transComplete();
                if ($this->db->transStatus() === false) throw new \Exception("DB update failed after SAP success (FG-STO)");

                return ['status'=>'success','message'=>'Second weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Second','NetWeight'=>$netWeight,'vaNumber'=>$vaNumber];
            }

            // moduleType 3 or 9 -> FG_Return
            if (in_array($moduleType, [3,9])) {
                $sap_data = [
                    "VA_NUMBER" => $w['vaNumber'] ?? '',
                    "SCREEN_TYPE" => ($moduleType == 3 ? "FG-RETURN" : "RM-Sales-Return"),
                    "RETURN_REFERENCE" => $w['returnRefNo'] ?? '',
                    "SALES_INVOICE" => $w['salesInvoiceNo'] ?? '',
                    "CUSTOMER_NAME" => $w['customerName'] ?? '',
                    "TRUCK_NUMBER" => $w['vehicleNo'] ?? $data->vehicle,
                    "PLANT" => $w['werks'] ?? $werks,
                    "DRIVER_PH" => $w['driverMobileNumber'] ?? '',
                    "WAIT_OUTSIDE" => $w['waitingStatus'] ?? '',
                    "GATE_IN" => $w['gateInDateStamp'] ?? '',
                    "REMARKS" => '',
                    "first_weight" => $firstWeight,
                    "Second_weight" => $currentWeight,
                    "net_weight" => $netWeight,
                    "GATE_OUT" => ""
                ];

                $urlPath = "ZGP_FG_RET/FG_Return?sap-client=900";
                $res = SapUrlHelper::PushToSap($urlPath, json_encode([$sap_data]));
                $message = $res[0]->MESSAGE ?? 'No message';
                $STATUS = $res[0]->STATUS ?? 0;
                if ($STATUS === 0){ 
                  throw new \Exception($message . " (SAP Rejected)");
                }
                // SAP success -> update db
                $this->db->transStart();
                $this->db->table("weighment_info")
                    ->where('id', $w['id'])
                    ->update([
                        'secondWeight' => $currentWeight,
                        'netWeight' => $netWeight,
                        'modifiedBy' => $master['userId'] ?? 0,
                        'secondWtSystemNo' => $data->systemNo
                    ]);
                $this->db->table("gate_in_out_info")
                    ->where('id', $w['gateId'])
                    ->update(['moduleStatusId' => in_array($w['userGateId'],[17,18,19]) ? 4 : 3, 'waitingAt' => in_array($w['userGateId'],[17,18,19]) ? 5 : 4]);
                $this->db->transComplete();
                if ($this->db->transStatus() === false) throw new \Exception("DB update failed after SAP success (FG_RETURN)");
                return ['status'=>'success','message'=>'Second weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Second','NetWeight'=>$netWeight,'vaNumber'=>$vaNumber];
            }

            // moduleType 8 -> RM Sales
            if ($moduleType == 8) {
                $sap_data = [
                    "va_number" => $w['vaNumber'] ?? '',
                    "screen_type" => "RM - Sales",
                    "truck_number" => $w['vehicleNo'] ?? $data->vehicle,
                    "plant" => $w['werks'] ?? $werks,
                    "driver_phone" => $w['driverMobileNumber'] ?? '',
                    "gate_in" => $w['gateInDateStamp'] ?? '',
                    "gate_out" => "",
                    "first_weight" => $firstWeight,
                    "Second_weight" => $currentWeight,
                    "net_weight" => $netWeight,
                ];
                $urlPath = "zgatepro/zgp_rm_wei_det/Gatepro?sap-client=900";
                $res = SapUrlHelper::PushToSap($urlPath, json_encode([$sap_data]));
                $message = $res[0]->MESSAGE ?? 'No message';
                $STATUS = $res[0]->STATUS ?? 0;
                if ($STATUS === 0){ 
                    throw new \Exception($message . " (SAP Rejected)");
                }
                // SAP success -> update db
                $this->db->transStart();
                $this->db->table("weighment_info")
                    ->where('id', $w['id'])
                    ->update([
                        'secondWeight' => $currentWeight,
                        'netWeight' => $netWeight,
                        'modifiedBy' => $master['userId'] ?? 0,
                        'secondWtSystemNo' => $data->systemNo
                    ]);
                $this->db->table("gate_in_out_info")
                    ->where('id', $w['gateId'])
                    ->update(['moduleStatusId' => 3, 'waitingAt' => 4]);
                $this->db->transComplete();
                if ($this->db->transStatus() === false) throw new \Exception("DB update failed after SAP success (RM Sales)");
                return ['status'=>'success','message'=>'Second weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Second','NetWeight'=>$netWeight,'vaNumber'=>$vaNumber];
            }
            if($movementType === 2 && in_array($moduleType, [5,19,6,13,2])){
                $this->db->transStart();
                $this->db->table("weighment_info")
                    ->where('id', $w['id'])
                    ->update([
                        'secondWeight' => $currentWeight,
                        'netWeight' => $netWeight,
                        'modifiedBy' => $master['userId'] ?? 0,
                        'secondWtSystemNo' => $data->systemNo
                    ]);
                $this->db->table("gate_in_out_info")
                    ->where('id', $w['gateId'])
                    ->update(['moduleStatusId' => 4, 'waitingAt' => 5]);
                $this->db->transComplete();
                if ($this->db->transStatus() === false) throw new \Exception("DB update failed (default second-weight path)");
                return ['status'=>'success','message'=>'Second weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Second','NetWeight'=>$netWeight,'vaNumber'=>$vaNumber];
            }
            // Default branch: no SAP required for these moduleTypes
            $this->db->transStart();
            $gate_data = in_array($moduleType, [4,5,6,7,13,19,20,22,38,44,26])
                ? ['moduleStatusId' => 3, 'waitingAt' => 4]
                : ['moduleStatusId' => 4, 'waitingAt' => 5];
            $this->db->table("weighment_info")->where('id', $w['id'])->update(['secondWeight' => $currentWeight, 'netWeight' => $netWeight , 'modifiedBy' => $master['userId'] ?? 0,'secondWtSystemNo' => $data->systemNo]);
            $this->db->table("gate_in_out_info")->where('id', $w['gateId'])->update($gate_data);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB update failed (default second-weight path)");
            return ['status'=>'success','message'=>'Second weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Second','NetWeight'=>$netWeight,'vaNumber'=>$vaNumber];
        }

        // If none of the above matched, fallthrough and try first-weight next
        } // end main weighment_info flow
    
    // ===== 3) FIRST WEIGHT path (no weighment_info found or not eligible for second) =====
    // Build first-weight gate query (complex OR conditions)

    $firstWt = $this->db->table("gate_in_out_info")
        ->select("
            gate_in_out_info.id as gateId,
            gate_in_out_info.vehicleNo,
            gate_in_out_info.moduleType,
            gate_in_out_info.vaNumber,
            gate_in_out_info.tripSheetNumber,
            gate_in_out_info.shipmentOrderNo,
            gate_in_out_info.stoPoNo,
            gate_in_out_info.subModuleTypeId,
            gate_in_out_info.gateInDateStamp,
            gate_in_out_info.remarks,
            gate_in_out_info.moduleStatusId,
            gate_in_out_info.waitingAt,
            gate_in_out_info.vehicleType,
            gate_in_out_info.route,
            gate_in_out_info.driverMobileNumber,
            master_plant.WERKS as werks,
            gate_in_out_info.loadingUnloadingInfoId,
            gate_in_out_info.movementType
        ")
        ->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner')
        ->where('gate_in_out_info.vehicleNo', $data->vehicle)
        ->groupStart()
            ->where('gate_in_out_info.moduleStatusId', 1)
            ->orGroupStart()
                ->where('gate_in_out_info.moduleStatusId', 3)
                ->whereIn('gate_in_out_info.moduleType', [5,22,6])
            ->groupEnd()
            ->orGroupStart()
                ->where('gate_in_out_info.movementType', 2)
                ->where('gate_in_out_info.moduleStatusId', 4)
                ->whereIn('gate_in_out_info.moduleType', [12,34,5,6,45])
            ->groupEnd()
        ->groupEnd()
        ->orderBy('gate_in_out_info.id', 'DESC');

    if (!empty($plantCodes)) {
        $firstWt->whereIn('master_plant.WERKS', $plantCodes);
    }

    $firstWtResult = $firstWt->get()->getResultArray();
    if (!empty($firstWtResult)) {
    $Landing_Data = new LandingDataModel();
        $f = $firstWtResult[0];
        $gateId = $f['gateId'];
        $waitingAt = $f['waitingAt'] ?? null;
        $moduleType = (int)($f['moduleType'] ?? 0);
        $vaNumber = $f['vaNumber'];
        $vehicleNo = $f['vehicleNo'];
        $loadingUnloadingInfoId = $f['loadingUnloadingInfoId'] ?? 0;
        if($f['moduleStatusId'] == 1 && $f['movementType'] == 1 && ($moduleType == 2 || $moduleType == 1)){
        $fgUrl = "zgatepro/zfg_tripsheet/FG?sap-client=900&Vehicle_No=$vehicleNo";
        $fgDetails = SapUrlHelper::getWhDatas($fgUrl);
        $fgDetailsData = json_decode($fgDetails);
            if($fgDetailsData[0]->SAP_LINE[0]->SHIPMENTORDERNO && ($moduleType == 2 || $moduleType == 1)) {
                  $sapDocument = 'shipmentOrderNo';
                  $data = array(
                      $sapDocument => $fgDetailsData[0]->SAP_LINE[0]->SHIPMENTORDERNO,
                      'tripSheetNumber' => $fgDetailsData[0]->TRIPSHEET_NO,
                      'moduleType' => 1
                  );
                $Landing_Data->Gate_info_Status_Change($gateId, $data);			
            
            }
        }
        // if waitingAt == 2 and moduleType 1 or 2 => call SAP (POST) then insert firstWeight
        if ($waitingAt == 2 && in_array($moduleType, [1,2,43])) {
            $TYPE1 = 'FG-STO';
            if($w['subModuleTypeId'] == 20 || $w['subModuleTypeId'] == 21 || $w['subModuleTypeId'] == 19){
                $TYPE1 = 'Other-Sales';
                $tripSheetNumber = $f['tripSheetNumber'] ?? 'No Tripsheet';
            }else{
                $TYPE1 = 'FG-STO';
                $tripSheetNumber = $f['tripSheetNumber'] ?? '';
            }
            $sap_data = [
                "ZZTRANSATION_TYPE" => $moduleType == 43 ? 'FG-Sales' : $TYPE1,
                "ZZTRUCK_NO" => $f['vehicleNo'] ?? $data->vehicle,
                "ZZVA_NO" => $f['vaNumber'] ?? '',
                "ZZDRIVER_PH" => $tripSheetNumber ?? '',
                "ZZROUTE" => $f['route'] ?? '',
                "ZZPLANT" => $f['werks'] ?? ($f['plantWerks'] ?? ''),
                "ZZCOLOR" => "Not Applicable",
                "ZZREASON" => "",
                "ZZREMARKS" => $f['remarks'] ?? '',
                "ZZTRIPSHEET_NO" => $f['tripSheetNumber'] ?? '',
                "ZZFirstWeight" => $currentWeight,
                "ZZSecondWeight" => '',
                "ZZNetweight" => '',
                "ZZSHIPMENT_NO" => $f['shipmentOrderNo'] ?? '',
                "ZZGATEIN_TIME" => $f['gateInDateStamp'] ?? '',
                "METHOD" => 'POST',
                "ZZLINE" => 1
            ];
            $urlPath1 = "zgatepro/zfgsales_weight/GP_SAP_FG?sap-client=900";

            $res = SapUrlHelper::PushToSap($urlPath1, json_encode([$sap_data]));
            // print_r($res);exit;
            $message = $res[0]->MESSAGE ?? 'No message';
            $STATUS = $res[0]->STATUS ?? 0;
            if ($STATUS === 0) {
                throw new \Exception($message . " (SAP Rejected)");
            }

            // SAP success -> insert firstWeight and update gate
            $this->db->transStart();
            $this->db->table("weighment_info")->insert([
                'firstWeight' => $currentWeight,
                // 'secondWeight' => '',
                // 'netWeight' => '',
                'createdOn' => $CurrentDateTime,
                'firstWtSystemNo' => $data->systemNo,
                'createdBy' => $master['userId'] ?? 0,
                'gateInOutInfoId' => $gateId
            ]);
            $this->db->table("gate_in_out_info")
                ->where('id', $f['gateId'])
                ->update(['moduleStatusId' => 2, 'waitingAt' => ($f['vehicleType'] ?? '') === 'BULKER' ? 9 : 3]);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB insert failed after SAP success (first weight)");

            return ['status'=>'success','message' => 'First weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'First','vaNumber'=>$vaNumber];
        }
        if($loadingUnloadingInfoId && in_array($moduleType, [12,15,21,33,34])){
            $query = $this->db->table("purchase_order")
				->where('loadingUnloadingInfoId',$loadingUnloadingInfoId);
				$count = $query->countAllResults();
            if($count == 0){
                throw new \Exception("Check The PO Details: {$data->vehicle}");
            }
        }
        // if waitingAt truthy -> insert first weight without SAP
        if ($waitingAt == 2 || empty($weightResult)) {
            $this->db->transStart();
            $this->db->table("weighment_info")->insert([
                'firstWeight' => $currentWeight,
                // 'secondWeight' => '',
                // 'netWeight' => '',
                'createdOn' => $CurrentDateTime,
                'firstWtSystemNo' => $data->systemNo,
                'createdBy' => $master['userId'] ?? 0,
                'gateInOutInfoId' => $gateId
            ]);
            $this->db->table("gate_in_out_info")->where('id', $f['gateId'])->update(['moduleStatusId' => $moduleType == '38' ? 3 : 2, 'waitingAt' => $moduleType == '38' ? 4 : 3]);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB insert failed (first weight no SAP)");
            return ['status'=>'success','message' => 'First weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'First','vaNumber'=>$vaNumber];
        }
    }

    // ===== 4) TEST WEIGHBRIDGE FLOW =====
$testBuilder = $this->db->table("test_weighbridge")
    ->select("test_weighbridge.*, test_weighment_info.*, test_weighbridge.id as testId, test_weighment_info.id as weighmentId")
    ->join('test_weighment_info', 'test_weighment_info.testWeighbridgeId = test_weighbridge.id', 'left')
    ->join('master_plant', 'master_plant.ID = test_weighbridge.masterPlantId', 'inner')
    ->where('test_weighbridge.vehicleNo', $data->vehicle)
    ->whereIn('test_weighbridge.moduleStatusId', [1, 2, 3])
    ->orderBy('test_weighbridge.id', 'DESC');

    if (!empty($plantCodes)) {
        $testBuilder->whereIn('master_plant.WERKS', $plantCodes);
    }

$testResult = $testBuilder->get()->getResultArray();

if (!empty($testResult)) {

    $current = $testResult[0]; // Latest record

    // Fetch latest weighment entry only
    $infoBuilder = $this->db->table("test_weighment_info")
        ->select("test_weighment_info.*, test_weighbridge.id as testId")
        ->join('test_weighbridge', 'test_weighment_info.testWeighbridgeId = test_weighbridge.id', 'inner')
        ->join('master_plant', 'master_plant.ID = test_weighbridge.masterPlantId', 'inner')
        ->where('test_weighbridge.vehicleNo', $data->vehicle)
        ->whereIn('test_weighbridge.moduleStatusId', [1, 2, 3])
        ->orderBy('test_weighment_info.id', 'DESC');

    if (!empty($plantCodes)) {
        $infoBuilder->whereIn('master_plant.WERKS', $plantCodes);
    }

    $weighInfo = $infoBuilder->get()->getResultArray();
    $info = $weighInfo[0] ?? null;

    // =====================================
    // 1) FIRST WEIGHT REQUIRED
    // =====================================
    if (!$info || $info['netWeight'] !== null) {

        $this->db->transStart();

        $this->db->table("test_weighment_info")->insert([
            'firstWeight'          => $currentWeight,
            'firstWeightDateStamp' => $CurrentDateTime,
            'firstWtSystemNo'      => $data->systemNo,
            'firstWeightBy'        => $master['userId'] ?? 0,
            'testWeighbridgeId'    => $current['testId']
        ]);

        $this->db->table("test_weighbridge")
            ->where('id', $current['testId'])
            ->update([
                'moduleStatusId' => 2,
                'waitingAt'      => 3
            ]);

        $this->db->transComplete();

        if (!$this->db->transStatus()) {
            throw new \Exception("DB failed for first weight");
        }

        return [
            'status'   => 'success',
            'message'  => "First weight added for vehicle {$data->vehicle} (Weight: {$currentWeight} kg)",
            'Type'     => 'First',
            'vaNumber' => $current['vaNumber'] ?? ''
        ];
    }

    // =====================================
    // 2) SECOND WEIGHT REQUIRED
    // =====================================
    if ($info['netWeight'] === null) {

            $firstW = (float)$info['firstWeight'];
            $net    = $currentWeight - $firstW;

            if ($net == 0) {
                throw new \Exception(
                    "Second weight cannot be equal to first weight. Check system reading: {$currentWeight}"
                );
            }

            $this->db->transStart();

            $this->db->table("test_weighment_info")
                ->where('id', $info['id'])
                ->where('secondWeight', null)
                ->update([
                    'secondWeight'          => $currentWeight,
                    'netWeight'             => $net,
                    'secondWtSystemNo'      => $data->systemNo,
                    'secondWeightBy'        => $master['userId'] ?? 0,
                    'secondWeightDateStamp' => $CurrentDateTime
                ]);

            $this->db->table("test_weighbridge")
                ->where('id', $info['testId'])
                ->update([
                    'moduleStatusId' => 3,
                    'waitingAt'      => 14
                ]);

            $this->db->transComplete();

            if (!$this->db->transStatus()) {
                $weighbridgeName = $master ['weighbridgeName'];
                throw new \Exception("DB failed for second weight {$data->systemNo} -( {$weighbridgeName} )");
            }

            return [
                'status'    => 'success',
                'message'   => "Second weight added for vehicle {$data->vehicle} (Weight: {$currentWeight} kg)",
                'Type'      => 'Second',
                'NetWeight' => $net,
                'vaNumber'  => $current['vaNumber'] ?? ''
            ];
        }
    }

    // ===== 5) EMPTY VEHICLE ARRIVAL FLOW (no SAP calls) =====
    $evBuilder = $this->db->table("empty_vehicle_arrival")
        ->select("
            empty_vehicle_arrival.ZVA_NUMBER,
            empty_vehicle_arrival.VEHICLE_STATUS,
            pp_silotomillweights.FirstWeight,
            empty_vehicle_arrival.SCREEN_TYPE,
            empty_vehicle_arrival.ID as arrivalId
        ")
        ->join('pp_silotomillweights', 'pp_silotomillweights.VANumber = empty_vehicle_arrival.ZVA_NUMBER', 'left')
        ->where('empty_vehicle_arrival.TRUCK_NO', $data->vehicle)
        ->whereIn('empty_vehicle_arrival.VEHICLE_STATUS', [23,24])
        ->orderBy('empty_vehicle_arrival.ID', 'DESC');

    if (!empty($plantCodes)) $evBuilder->whereIn('empty_vehicle_arrival.PLANT_ID', $plantCodes);

    $evRes = $evBuilder->get()->getResultArray();
    if (!empty($evRes)) {
        $ev = $evRes[0];
        $arrivalId = $ev['arrivalId'];
        $vaNumber = $ev['ZVA_NUMBER'];
        $vehicleStatus = (int)($ev['VEHICLE_STATUS'] ?? 0);
        $firstW = (float)($ev['FirstWeight'] ?? 0);

        // FIRST WEIGHT (status 23)
        if ($vehicleStatus === 23 && $firstW == 0) {
            $this->db->transStart();
            $this->db->table("pp_silotomillweights")->insert([
                'VANumber' => $vaNumber,
                'FirstWeight' => $currentWeight,
                'FirstWtSystemNo' => $data->systemNo,
                'InsDt' => $CurrentDateTime,
                'InsBy' => $master['userId'] ?? 0,
            ]);
            $this->db->table("empty_vehicle_arrival")->where('ID', $arrivalId)->update([
                'VEHICLE_STATUS' => $ev['SCREEN_TYPE'] == 'EVADP' ? 24 : 13,
                'FirstWeightEntryDt' => $CurrentDateTime,
                'FirstWeightEntryBy' => $master['userId'] ?? 0,
                'FirstWeightEntryByName' => $data->systemNo
            ]);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB failed for empty arrival first weight");
            return ['status'=>'success','message' => 'First weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'First','vaNumber'=>$vaNumber];
        }
        if ($vehicleStatus === 23 && $firstW > 0) {
            $this->db->transStart();
            $this->db->table("pp_silotomillweights")->where('VANumber', $vaNumber)->update([
                'VANumber' => $vaNumber,
                'FirstWeight' => $currentWeight,
                'FirstWtSystemNo' => $data->systemNo,
                'InsDt' => $CurrentDateTime,
                'InsBy' => $master['userId'] ?? 0,
            ]);
            $this->db->table("empty_vehicle_arrival")->where('ID', $arrivalId)->update([
                'VEHICLE_STATUS' => $ev['SCREEN_TYPE'] == 'EVADP' ? 24 : 13,
                'FirstWeightEntryDt' => $CurrentDateTime,
                'FirstWeightEntryBy' => $master['userId'] ?? 0,
                'FirstWeightEntryByName' => $data->systemNo
            ]);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB failed for empty arrival first weight");
            return ['status'=>'success','message' => 'First weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'First','vaNumber'=>$vaNumber];
        }
        // SECOND WEIGHT (status 24)
        if ($vehicleStatus === 24 && $firstW > 0) {
            $net = $currentWeight - $firstW;
             // ❌ Error: first weight greater than second
            if ($net < 0) {
                // return $this->respond([
                //     'success' => false,
                //     'message' => "Invalid weighment: first weight is greater than second weight.",
                // ]);
                throw new \Exception("Invalid weighment: first weight is greater than second weight: {$currentWeight}");

            }
            $min = 1000 ;
            // ❌ Error: net weight difference exceeds 1000 kg
            if ($net < $min) {
                // return $this->respond([
                //     'success' => false,
                //     'message' => "Invalid weighment: difference between first and second weight exceeds 1000 kg.",
                // ]);
                throw new \Exception("Invalid weighment: difference between first and second weight exceeds 1000 kg: {$currentWeight}");

            }

            $this->db->transStart();
            if($ev['SCREEN_TYPE'] == 'EVADP'){
            $this->db->table("pp_silotomillweights")->where('VANumber', $vaNumber)->update([
                'SecondWeight' => $currentWeight,
                'NetWeight' => $net,
                'SecondWtSystemNo' => $data->systemNo,
                'ModBy' => $master['userId'] ?? 0,
            ]);
            $this->db->table("empty_vehicle_arrival")->where('ID', $arrivalId)->update([
                'VEHICLE_STATUS' => 13,
                'SecondWeightEntryDt' => $CurrentDateTime,
                'SecondWeightEntryBy' => $master['userId'] ?? 0,
                'SecondWeightEntryByName' => $data->systemNo
            ]);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB failed for empty arrival second weight");
            return ['status'=>'success','message'=>'Second weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Second','NetWeight'=>$net,'vaNumber'=>$vaNumber];
            }else if($ev['SCREEN_TYPE'] == 'SILOTOMILL'){

            $model = new RakeloadingModel();
            $res = $model->SAPPushDataSTM( $arrivalId);
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
                "first_wt"=>$firstW,
                "second_wt"=>$currentWeight,
                "net_wt"=>$net,
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
              $STATUS = $res1[0]->STATUS ?? 0;
              if ($STATUS === 0) {
                    throw new \Exception($message . " (SAP Rejected)");
              }

              $this->db->table("pp_silotomillweights")->where('VANumber', $vaNumber)->update([
                'SecondWeight' => $currentWeight,
                'NetWeight' => $net,
                'SecondWtSystemNo' => $data->systemNo,
                'ModBy' => $master['userId'] ?? 0,
                ]);
             $this->db->table("empty_vehicle_arrival")->where('ID', $arrivalId)->update([
                    'VEHICLE_STATUS' => 5,
                    'SecondWeightEntryDt' => $CurrentDateTime,
                    'SecondWeightEntryBy' => $master['userId'] ?? 0,
                    'SecondWeightEntryByName' => $data->systemNo
                ]);
             }
             $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB failed for empty_vehicle_arrival second weight");
            return ['status'=>'success','message'=>'Second weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Second','NetWeight'=>$net,'vaNumber'=>$vaNumber];
        }
    }

    // ===== 6) PURCHASE_INFO unload flow (similar to empty arrival) =====
    $pBuilder = $this->db->table("purchase_info")
        ->select("
            purchase_info.ZVA_NUMBER,
            purchase_info.VECHICAL_STATUS,
            pp_silotomillweights_unload.FirstWeight,
            purchase_info.SCREEN_TYPE,
            purchase_info.PI_REFID as arrivalId,
            purchase_info.VEHICLE_TYPE
        ")
        ->join('pp_silotomillweights_unload', 'pp_silotomillweights_unload.VANumber = purchase_info.ZVA_NUMBER', 'left')
        ->where('purchase_info.TRUCK_NO', $data->vehicle)
        ->whereIn('purchase_info.VECHICAL_STATUS', [23,24])
        ->orderBy('purchase_info.PI_REFID', 'DESC');

    if (!empty($plantCodes)) $pBuilder->whereIn('purchase_info.WERKS', $plantCodes);

    $pRes = $pBuilder->get()->getResultArray();
    // print_r($pRes);exit;
    if (!empty($pRes)) {

        $p = $pRes[0];
        $arrivalId = $p['arrivalId'];
        $vaNumber = $p['ZVA_NUMBER'];
        $vehicleStatus = (int)($p['VECHICAL_STATUS'] ?? 0);
        $firstW = (float)($p['FirstWeight'] ?? 0);
        $screenType = $p['SCREEN_TYPE'] ?? '';
        $vehicleType = $p['VEHICLE_TYPE'] ?? '';

        if ($vehicleStatus === 23 && $firstW == 0) {
            // first weight
            $this->db->transStart();
            $this->db->table("pp_silotomillweights_unload")->insert([
                'VANumber' => $vaNumber,
                'FirstWeight' => $currentWeight,
                'FirstWtSystemNo' => $data->systemNo,
                'InsDt' => $CurrentDateTime,
                'InsBy' => $master['userId'] ?? 0
            ]);
            // determine status value logic kept from your original code
            if ($screenType == 'SILOTOMILL') $STATUS = 4;
            elseif ($screenType == 'IAS') $STATUS = 2;
            elseif (strtolower($vehicleType) == 'rake') $STATUS = 4;
            else $STATUS = 2;

            $this->db->table("purchase_info")->where('PI_REFID', $arrivalId)->update([
                'VECHICAL_STATUS' => $STATUS,
                'FirstWeightEntryDt' => $CurrentDateTime,
                'FirstWeightEntryBy' => $master['userId'] ?? 0,
                'FirstWeightEntryByName' => $data->systemNo
            ]);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB failed for purchase_info first weight");
            return ['status'=>'success','message' => 'First weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'First','vaNumber'=>$vaNumber];
        }
        if ($vehicleStatus === 23 && $firstW > 0) {
            // first weight
            $this->db->transStart();
            $this->db->table("pp_silotomillweights_unload")->where('VANumber', $vaNumber)->update([
                'VANumber' => $vaNumber,
                'FirstWeight' => $currentWeight,
                'FirstWtSystemNo' => $data->systemNo,
                'InsDt' => $CurrentDateTime,
                'InsBy' => $master['userId'] ?? 0
            ]);
            // determine status value logic kept from your original code
            if ($screenType == 'SILOTOMILL') $STATUS = 4;
            elseif ($screenType == 'IAS') $STATUS = 2;
            elseif (strtolower($vehicleType) == 'rake') $STATUS = 4;
            else $STATUS = 2;

            $this->db->table("purchase_info")->where('PI_REFID', $arrivalId)->update([
                'VECHICAL_STATUS' => $STATUS,
                'FirstWeightEntryDt' => $CurrentDateTime,
                'FirstWeightEntryBy' => $master['userId'] ?? 0,
                'FirstWeightEntryByName' => $data->systemNo
            ]);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB failed for purchase_info first weight");
            return ['status'=>'success','message' => 'First weight added for vehicle ' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'First','vaNumber'=>$vaNumber];
        }
        if ($vehicleStatus === 24 && $firstW > 0) {
            $net = $firstW - $currentWeight;

             // ❌ Error: first weight greater than second
            if ($net < 0) {
                // return $this->respond([
                //     'success' => false,
                //     'message' => "Invalid weighment: first weight is less than second weight.",
                // ]);
                throw new \Exception("Invalid weighment: first weight is less than second weight: {$currentWeight}");
            }

            // ❌ Error: net weight difference exceeds 1000 kg
            if ($net < 1000) {
                // return $this->respond([
                //     'success' => false,
                //     'message' => "Invalid weighment: difference between first and second weight less 1000 kg.",
                // ]);
                throw new \Exception("Invalid weighment: difference between first and second weight less 1000 kg: {$net}");

            }

            $this->db->transStart();
            $this->db->table("pp_silotomillweights_unload")->where('VANumber', $vaNumber)->update([
                'SecondWeight' => $currentWeight,
                'NetWeight' => $net,
                'SecondWtSystemNo' => $data->systemNo,
                'ModBy' => $master['userId'] ?? 0,
            ]);

            $this->db->table("purchase_info")->where('PI_REFID', $arrivalId)->update([
                'VECHICAL_STATUS' => 5,
                'SecondWeightEntryDt' => $CurrentDateTime,
                'SecondWeightEntryBy' => $master['userId'] ?? 0,
                'SecondWeightEntryByName' => $data->systemNo
            ]);
            $this->db->transComplete();
            if ($this->db->transStatus() === false) throw new \Exception("DB failed for purchase_info second weight");
            return ['status'=>'success','message'=>'Second weight added for vehicle' . $data->vehicle . 
                 ' (Weight: ' . $currentWeight . ' kg)','Type'=>'Second','NetWeight'=>$net,'vaNumber'=>$vaNumber];
        }
    }

    // If we reach here, no path matched
    throw new \Exception("Vehicle {$data->vehicle} not eligible for weight.please check vehicle gate in");
    }
}
