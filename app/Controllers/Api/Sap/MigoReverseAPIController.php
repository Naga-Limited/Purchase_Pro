<?php

namespace App\Controllers\Api\Sap;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;

class MigoReverseAPIController extends BaseController
{
	public function index()
	{
		include_once APIPATH . "/db_connection.php";
		$urlPath ="zrake/zrake_migorev/migorev?sap-client=900";
		$sapResult = SapUrlHelper::getWhDatas($urlPath);
		$array = json_decode($sapResult);
		print_r($array);exit;
		foreach ($array as $migo_reverse) {
			$VA_NUMBER=$migo_reverse->VA_NUMBER;
			$VECHICAL_STATUS=$migo_reverse->VEHICLE_STATUS;

				$usqls = "SELECT VECHICAL_STATUS FROM purchase_info WHERE ZVA_NUMBER = '$VA_NUMBER'";
				$result = mysqli_query($connect, $usqls);
				 $Fetch = mysqli_fetch_assoc($result);
					if($Fetch['VECHICAL_STATUS'] == 7) {
						$usql = "UPDATE purchase_info SET VECHICAL_STATUS='$VECHICAL_STATUS' WHERE ZVA_NUMBER = '$VA_NUMBER'";
					 $res = mysqli_query($connect, $usql);
					}else{
					 $res = false;
					}
		}
	return json_encode(["success" => 1, "results" =>  $res]);
	}
}
