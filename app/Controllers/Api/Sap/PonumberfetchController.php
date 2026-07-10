<?php

namespace App\Controllers\Api\Sap;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;
use App\Models\RakeloadingModel;

class PonumberfetchController extends BaseController
{
    public function index()
    {
        // $urlPath ="zwh_stocks/stock?sap-client=900&Warehouse_code=W01";
        $urlPath ="zrake/zrake_sdtpo/sdtpo?sap-client=900";
        // print_r($urlPath);exit;
        $sapResult = SapUrlHelper::getWhDatas($urlPath);
        $array = json_decode($sapResult);
        $sizeoflen = sizeof($array);
        $model = new RakeloadingModel();
        //print_r($sapResult);exit;
        if($sizeoflen > 0) {
            foreach ($array as $po_create) {
                $data = array(
                    "EBELN"=>trim($po_create->PO_NUMBER),
                    "EBELP"=>trim($po_create->PO_LINE_ITEM),
                    "BROCKER_CODE"=>trim($po_create->VENDOR_CODE),
                    "BROCKER_NAME"=>trim($po_create->VENDOR_NAME),
                    "SUPPLIER_CODE"=>trim($po_create->SUPPLIER_CODE),
                    "SUPPLIER_NAME"=>trim($po_create->SUPPLIER_NAME),
                    "MENGE"=>trim($po_create->SUPPLIER_QUANTITY),
                    "MEINS"=>trim($po_create->UNIT_OF_MEASUREMENT),
                    "IDNLF"=>trim($po_create->WHEAT_VARIETY),
                    "MATNR"=>trim($po_create->MATERIAL_CODE),
                    "SGT_SCAT"=>trim($po_create->STOCK_SEGMENT),
                    "NETPR"=>trim($po_create->PO_RATE),
                    "WERKS"=>trim($po_create->PLANT),
                    "LGORT"=>trim($po_create->STORAGE_LOCATION),
                    "LOEKZ"=>trim($po_create->STATUS),
                    "ZUPDATE"=>trim($po_create->STATUS),
                    "INCO1"=>trim($po_create->INCO_TERMS),
                    "BSART"=>trim($po_create->PO_TYPE),
                    "PO_LOADING_DATE"=>trim($po_create->PO_LOADING_DATE),
                    "NUMBER_OF_VEHICLES"=>trim($po_create->NUMBER_OF_VEHICLES),
                    "PURCHASE_ORG"=>trim($po_create->PURCHASE_GROUP),
                    "PURCHASE_ORG_DESC"=>trim($po_create->PURCHASE_GROUP_DESCRIPTION),
                    "PO_BAG_TYPE"=>trim($po_create->PO_BAG_TYPE),
                    "Loading_cost"=>trim($po_create->LOADING_COST),
                    "Unloading_cost"=>trim($po_create->UNLOADING_COST),
                    "Freight_cost"=>trim($po_create->FREIGHT_COST),
                );
                
                $data1 = array(
                    "MENGE"=>trim($po_create->SUPPLIER_QUANTITY),
                    "MEINS"=>trim($po_create->UNIT_OF_MEASUREMENT),
                    "IDNLF"=>trim($po_create->WHEAT_VARIETY),
                    "MATNR"=>trim($po_create->MATERIAL_CODE),
                    "SGT_SCAT"=>trim($po_create->STOCK_SEGMENT),
                    "NETPR"=>trim($po_create->PO_RATE),
                    "LGORT"=>trim($po_create->STORAGE_LOCATION),
                    "LOEKZ"=>trim($po_create->STATUS),
                    "ZUPDATE"=>trim($po_create->STATUS),
                    "INCO1"=>trim($po_create->INCO_TERMS),
                    "BSART"=>trim($po_create->PO_TYPE),
                    "PO_LOADING_DATE"=>trim($po_create->PO_LOADING_DATE),
                    "NUMBER_OF_VEHICLES"=>trim($po_create->NUMBER_OF_VEHICLES),
                    "PURCHASE_ORG"=>trim($po_create->PURCHASE_GROUP),
                    "PURCHASE_ORG_DESC"=>trim($po_create->PURCHASE_GROUP_DESCRIPTION),
                    "PO_BAG_TYPE"=>trim($po_create->PO_BAG_TYPE),
                    "Loading_cost"=>trim($po_create->LOADING_COST),
                    "Unloading_cost"=>trim($po_create->UNLOADING_COST),
                    "Freight_cost"=>trim($po_create->FREIGHT_COST),
                );
                $supplier_code = substr(trim($po_create->SUPPLIER_CODE), 4);
                         //print_r($supplier_code);exit;
                $result = $model->SAP_PP_Insert($data,$data1,$po_create->STATUS,$supplier_code);
                
            }
             $poDetails = [];
		    foreach ($array as $detail) {
		    $po_number = $detail->PO_NUMBER;
		    $poDetails[$po_number][] = $detail;
		    }
		    $poDetail[]= '';
		    foreach ($poDetails as $details) {
		    $result1 = $model->SAP_PP_DELETE_FLAG($details);
		 }
        }else {
           $result = false;
        }
        return json_encode(["success" => 1, "results" => $result]);
    }
}
