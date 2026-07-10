<?php

include_once APIPATH. "/db_connection.php";
include_once APIPATH. "/helper/queryHelper.php";
$entityBody = json_decode(file_get_contents("php://input"));
if (isset($entityBody->password) && isset($entityBody->user_name)) {
  $password = md5($entityBody->password);
  $username = mysqli_real_escape_string($connect, trim($entityBody->user_name));
  $fetchsql =
    "select UI_ID, FIRST_NAME, ROLE_NAME  FROM user_info, master_role  WHERE USER_ROLE_ID = RM_REFID and LOGIN_ID = '" .
    $username .
    "' and PASSWORD='" .
    $password .
    "'and USER_STATUS = '1' limit 1";
  $userData = mysqli_query($connect, $fetchsql);
  $records = [];
  $i = 0;
  $session = session();
  if (mysqli_num_rows($userData) > 0) {    
    while ($row = mysqli_fetch_assoc($userData)) {
      $records[$i]["USERID"] = $row["UI_ID"];
      $records[$i]["username"] = $row["FIRST_NAME"];
      $records[$i]["role"] = $row["ROLE_NAME"];      
      $session->set("USERID",$row["UI_ID"]); 
      $session->set("FIRSTNAME",$row["FIRST_NAME"]);
      $sfields = "SCREEN_NAME, SCREEN_DESC";
      $screenSql = "select " . $sfields . " from view_user_screen where USER_ID = " . $row["UI_ID"] . " order by PRIORITY, SCREEN_NAME";
      $records[$i]["screenids"] = getResultAsObjectArray($connect, $screenSql);

      /*$screenSql = "SELECT SectionId,SectionName FROM `master_screen_section`
       WHERE RecStatus='1' Order by SortOrder ASC";
      $records[$i]["Sections"] = getResultAsObjectArray($connect, $screenSql);
      */
      $plantSql = "select PLANT_CODE from view_user_plant where USER_ID = " . $row["UI_ID"];
      
      $records[$i]["plantids"] = getResultAsArray($connect, $plantSql);
      $i++;
    }    
    echo json_encode(["success" => 1, "user" => $records[0]]);
  } else {
    echo json_encode(["success" => 0, "msg" => "Invalid Login"]);
  }
} else {
  echo json_encode(["success" => 0, "msg" => "Please fill username and password"]);
}
$connect->close();
 ?>
