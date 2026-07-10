<?php

namespace App\Controllers\Api;

use App\Controllers\Api\BaseApiController;
use App\Models\RegisterModel;

class RegisterController extends BaseApiController {
    public function getDataTypes() {
        $registerModel = new RegisterModel();
        $result = $registerModel->getDataTypes();
        return $this->sendSuccessResult($result);
    }
    public function getDesignation() {
        $registerModel = new RegisterModel();
        $result = $registerModel->getDesignation();
        return $this->sendSuccessResult($result);
    }
    public function getDepartment() {
        $registerModel = new RegisterModel();
        $result = $registerModel->getDepartment();
        return $this->sendSuccessResult($result);
    } 
    
    public function insertRegister() {
        $json = $this->request->getJSON();
        $registerModel = new RegisterModel();  
        $registername= $json->register_name;
        $plantcode= $json->plant_ids;    
        $datacheck = $registerModel->checkRegister($registername,$plantcode);
        if($datacheck > 0){
            return $this->sendErrorResult("Register name already exists for the selected plant.");
        }   
        $result = $registerModel->insertRegister($json);
        return $this->sendSuccessResult($result);
    }
     public function getRegisterList() {
        $registerModel = new RegisterModel();
        $result = $registerModel->getRegisterList();
        return $this->sendSuccessResult($result);
    } 

     public function updateRegister() {
        $json = $this->request->getJSON();
        // print_r($json);exit;
        $registerModel = new RegisterModel();
        $result = $registerModel->updateRegister($json);
        // print_r($result);exit;
        return $this->sendSuccessResult($result);
    } 
    
    public function getRegisterListentry($plantcode=null) {
        // print_r($json);exit;
        $registerModel = new RegisterModel();
        $result = $registerModel->getRegisterListentry($plantcode);
        return $this->sendSuccessResult($result);
    }
    public function getRegisterDetails($reg_ID=null) {
        // print_r($json);exit;
        $registerModel = new RegisterModel();
        $result = $registerModel->getRegisterDetails($reg_ID);
        return $this->sendSuccessResult($result);
    }

    public function saveRegisterEntry()
    {
        $json = $this->request->getJSON();
        // print_r($json);exit; // For Debugging

        $registerModel = new RegisterModel();

        // ❗ NOTE: your payload does NOT have register_name / plant_ids
        $register_id = $json->register_id;
        $plantcode = $json->plant_code;

        // 🔍 Check duplicate
        $datacheck = $registerModel->checkRegisterentry($register_id, $plantcode);

        if ($datacheck > 0) {
            return $this->sendErrorResult("Register name already exists for the selected plant.");
        }

        // 💾 Insert
        $res = $registerModel->saveRegisterEntry($json);

        // ✅ Response like your requirement
        if ($res == true) {
            $response = [
                'success' => true,
                'message' => 'Data saved successfully'
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to save data'
            ];
        }

        return $this->response->setJSON($response);
    }

    public function getRegisterEntryList($plantcode=null,$date) {
        // print_r($date);
        // print_r($plantcode);exit; // For Debugging
        $registerModel = new RegisterModel();
        $result = $registerModel->getRegisterEntryList($plantcode,$date);
        return $this->sendSuccessResult($result);
    } 
    
    public function updateRegisterEntry() {
        $json = $this->request->getJSON();
        $registerModel = new RegisterModel();
        $result = $registerModel->updateRegisterEntry($json);
        if ($result == true) {
            return $this->sendSuccessResult(['message' => 'Register entries updated successfully']);
        } else {
            return $this->sendErrorResult('Failed to update register entries');
        }
    }

    public function getRegisterReport() {
        $json = $this->request->getJSON();
        // print_r($json);exit; // For Debugging
        $registerModel = new RegisterModel();
        $result = $registerModel->getRegisterReport($json);
        return $this->sendSuccessResult($result);
        
    }
}