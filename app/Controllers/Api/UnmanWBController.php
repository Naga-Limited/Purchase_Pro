<?php

namespace App\Controllers\Api;

use App\Models\UnmanWBModel;
use CodeIgniter\RESTful\ResourceController;

class UnmanWBController extends ResourceController
{
    // protected $format = 'json';
    // protected $db;

    // public function __construct() {
    //     $this->db = \Config\Database::connect();
    // }
    public function saveWeight()
    {
        
        try {
            $data = $this->request->getJSON();

            // ✅ Validate required fields
            if (empty($data->systemNo) || empty($data->vehicle) || $data->weight <= 0) {
                return $this->respond([
                    'success' => false,
                    'message' => 'Missing required parameters: systemNo, vehicle, or weight.'
                ], 400);
            }

            // ✅ Model call
            $gateService = new UnmanWBModel();
            $result = $gateService->getVehicleDetails($data);
            // ✅ Handle model response
            $status = strtolower($result['status'] ?? '');
            $message = $result['message'] ?? 'No message returned from model';
            $type = $result['Type'] ?? '';
            $netWeight = $result['NetWeight'] ?? '';


            return $this->respond([
                'success' => ($status === 'success'),
                'message' => $message,
                'result'  => $result,
                'type'    => $type,
                'netWeight' => $netWeight
            ]);

        } catch (\Exception $e) {
            // print_r($e->getMessage());exit;
            return $this->respond([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
   public function getWBConfig(){
    try {

        $data = $this->request->getJSON();
        if (empty($data->systemNo)) {

            return $this->response->setJSON(['error' => 'Missing systemNo']);
        }


        $db = \Config\Database::connect(); // manual connect (safe)
        $master = $db->table("unmanwb_master")
            ->select("*")
            ->where("systemNo", $data->systemNo)
            ->where("status", 1)
            ->get()
            ->getRowArray();
        if ($master) {

            return $this->response->setJSON([
                "port" => $master['portName'],
                "baudRate" => $master['baudRate'],
                "printerName" => $master['printerName'],
                "weighbridgeName" => $master['weighbridgeName']
            ]);
        } else {
            return $this->response->setJSON([
                "error" => "No COM port configuration found for systemNo " . $data->systemNo
            ]);
        }
    } catch (\Throwable $e) {

        return $this->response->setJSON(['error' => 'Internal server error']);
    }
}



}

