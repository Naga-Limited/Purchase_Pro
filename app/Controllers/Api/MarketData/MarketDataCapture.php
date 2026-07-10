<?php

namespace App\Controllers\Api\MarketData;

use App\Controllers\Api\BaseApiController;
use App\Models\CourierModel;
use App\Models\MarketData\WheatPriceEntryModel;

class MarketDataCapture extends BaseApiController
{
    //api/marketdata/capture/getWheatPriceEntry
    public function getWheatPriceEntry()
    {
        $filter = $this->request->getJSON();
        $model = new CourierModel();
        return  $this->sendSuccessResult($model->updatemarketdetails($filter));
    }
    public function search()
    {
        $filter = $this->request->getJSON(true);
        $model = new CourierModel();
      	
        return  $this->respond($model->updatemarketdetailsFORREPORT($filter));
    }

    public function addOrUpdateWheatPriceEntry()
    {
        $json = $this->request->getJSON();
        $model = new WheatPriceEntryModel();
        return  $this->sendSuccessResult($model->add($json));
    }
}
