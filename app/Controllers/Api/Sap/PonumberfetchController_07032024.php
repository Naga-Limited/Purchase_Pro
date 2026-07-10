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
         print_r($sapResult);exit;
        if($sizeoflen > 0) {
            foreach ($array as $po_create) {
                $data = array(
                    "EBELN"=>$po_create->EBELN,
                    "EBELP"=>$po_create->EBELP,
                    "BROCKER_CODE"=>$po_create->LIFNR,
                    "BROCKER_NAME"=>$po_create->NAME1,
                    "SUPPLIER_CODE"=>$po_create->LIFN2,
                    "SUPPLIER_NAME"=>$po_create->NAME2,
                    "MENGE"=>$po_create->ZQUANTITY,
                    "MEINS"=>$po_create->ZUOM,
                    "IDNLF"=>$po_create->IDNLF,
                    "MATNR"=>$po_create->MATNR,
                    "SGT_SCAT"=>$po_create->SGT_SCAT,
                    "NETPR"=>$po_create->NETPR,
                    "WERKS"=>$po_create->WERKS,
                    "LGORT"=>$po_create->LGORT,
                    "LOEKZ"=>$po_create->LOEKZ,
                    "ZUPDATE"=>$po_create->UPDATE,
                    "INCO1"=>$po_create->INCO1,
                    "BSART"=>$po_create->BSART,
                    "PO_LOADING_DATE"=>$po_create->ZLOADING_DATE,
                    "NUMBER_OF_VEHICLES"=>$po_create->ZCONTAINER,
                    "PURCHASE_ORG"=>$po_create->EKGRP,
                    "PURCHASE_ORG_DESC"=>$po_create->EKNAM,
                    "PO_BAG_TYPE"=>$po_create->EVERS,
                    "Loading_cost"=>$po_create->loading_cost,
                    "Unloading_cost"=>$po_create->unloading_cost,
                );
                $result = $model->SAP_PP_Insert($data,$po_create->UPDATE);
            }
        }
        return json_encode(["success" => 1, "results" => $result]);
    }
}
