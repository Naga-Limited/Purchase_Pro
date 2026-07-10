<?php

namespace App\Controllers\Api\MarketRateCD;
use App\Controllers\Api\BaseApiController;

use App\Models\MarketRateCD\MrtRateModel;

class MrtRateController extends BaseApiController
{

    public function InsertMrtRateMasterdetails()
    {
        $postData = $this->request->getJSON();
        $model = new MrtRateModel();
        $groceries_type = $postData->customGroceriesType;
        $existingEntry = $model->getcountGroceriesTypemaster($groceries_type);

        if ($existingEntry != '') {
            return $this->sendErrorResult("Rate for this Groceries already exists.");
        }
        //print_r($postData);exit;

        // Insert new record
        $res = $model->InsertMrtRateMasterdetails($postData);

        return $this->sendSuccessResult($res);
    } 
    public function saveGrocerydetails()
    {
        $postData = $this->request->getJSON();
        $model = new MrtRateModel();
        $groceries_type = $postData->customGroceriesItem;
        $existingEntry = $model->getcountGroceriesnamemaster($groceries_type);

        if ($existingEntry != '') {
            return $this->sendErrorResult("Rate for this Groceries already exists.");
        }
        //print_r($postData);exit;

        // Insert new record
        $res = $model->saveGrocerydetails($postData);

        return $this->sendSuccessResult($res);
    }
    public function getGroceriesCategory()
    {

        $model = new MrtRateModel();
        $res = $model->getGroceriesCategory();
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getStates()
    {

        $model = new MrtRateModel();
        $res = $model->getStates();
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getDistrictsByState($stateid = null)
    {

        // print_r($stateid);exit;
        $model = new MrtRateModel();
        $res = $model->getDistricts($stateid);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getCitiesByDistrict($districtid = null)
    {

        // print_r($districtid);exit;
        $model = new MrtRateModel();
        $res = $model->getCitiesByDistrict($districtid);
        // print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getGrocerieslist()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit;
        $movementtype = $postData->movement_type;
        $model = new MrtRateModel();
        $res = $model->getGrocerieslist($movementtype);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function InsertMrtRatedetails()
{
    $postData = $this->request->getJSON();

    $GroceriesType = $postData->groceries_type;
    $entryDate     = $postData->entry_date;

    // Take item_city from first non-empty row
    $itemCity = null;
    foreach ($postData->tableItems as $item) {
        if (!empty($item->item_city)) {
            $itemCity = $item->item_city;
            break;
        }
    }

    // Load model
    $model = new MrtRateModel();

    // Check if already exists
    $existingEntry = $model->getcountGroceriesType($GroceriesType, $entryDate, $itemCity);

    if ($existingEntry != '') {
        return $this->sendErrorResult("Rate for this Groceries already exists.");
    }

    // Filter only valid rows (item_rate should not be empty)
    $validItems = [];
    foreach ($postData->tableItems as $item) {
        if (!empty($item->item_rate)) {   // insert only rows with rate
            $validItems[] = $item;
        }
    }

    // If no valid items, return error
    if (empty($validItems)) {
        return $this->sendErrorResult("No valid items to insert.");
    }

    // Replace with filtered items
    $postData->tableItems = $validItems;

    // Insert new record
    $res = $model->InsertMrtRatedetails($postData);

    return $this->sendSuccessResult($res);
}


    public function getmarketratedetails($date = null)
    {
        $model = new MrtRateModel();
        $res = $model->getmarketratedetails($date);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getmarketratemasterdetails()
    {
        $model = new MrtRateModel();
        $res = $model->getmarketratemasterdetails();
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
     public function getmarketratemasteritems()
    {
        $postData = $this->request->getJSON();
        $model = new MrtRateModel();
        $res = $model->getmarketratemasteritems($postData->mr_id);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getmarketratedetailsforview()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit;
        $model = new MrtRateModel();
        $res = $model->getmarketratedetailsforview($postData);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    } 
    public function getmarketratedetailsbyid()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit;
        $model = new MrtRateModel();
        $res = $model->getmarketratedetailsbyid($postData->groceries_type);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function updateMrtRateMasterdetails()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit();  
        $model = new MrtRateModel();

        $res = $model->updateMrtRateMasterdetails($postData);

        return $this->sendSuccessResult($res);
    } 
public function updateMrtRateMasterdetailsbyid()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit();  
        $model = new MrtRateModel();

        $res = $model->updateMrtRateMasterdetailsbyid($postData);

        return $this->sendSuccessResult($res);
    } 
    public function updateMrtRateMasterGroceriesItem()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit();  
        $model = new MrtRateModel();

        $res = $model->updateMrtRateMasterGroceriesItem($postData);

        return $this->sendSuccessResult($res);
    }
    public function updateGroceryRates()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit();  
        $model = new MrtRateModel();
        $res = $model->updateGroceryRates($postData);
        return $this->sendSuccessResult($res);
    }

    public function getlistoftGroceries()
    {

        $model = new MrtRateModel();
        $res = $model->getlistoftGroceries();
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }

    public function getSubGroceriesById()
    {
        $postData = $this->request->getJSON();
        $Typeid = $postData->groceries_id;
        // print_r($postData);exit;

        $model = new MrtRateModel();
        $res = $model->getSubGroceriesById($Typeid);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getlistofsubcatogry()
    {

        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $subTypeid = $postData->subCategoryId;
        $todate = $postData->toDate;
        $fromdate = $postData->fromDate;
        $state = $postData->stateId;
        $district = $postData->districtId;


        $model = new MrtRateModel();
        $res = $model->getlistofsubcatogry($subTypeid, $todate, $fromdate, $state, $district);
        // print_r($res);
        // exit;

        return $this->sendSuccessResult($res);
        ;
    }
}