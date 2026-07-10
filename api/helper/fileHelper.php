<?php
date_default_timezone_set("Asia/Calcutta");
function upload_folder($file_from, $base_dir)
{
  $date = date("Y-m-d");
  $month_f = date("F", strtotime($date));
  $year_f = date("Y", strtotime($date));
  $date_f = date("d", strtotime($date));

  if (!is_dir($base_dir . "/" . $year_f)) {
    mkdir("$base_dir/$year_f", 007, true);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!is_dir($base_dir . "/" . $year_f . "/" . $month_f)) {
    mkdir($base_dir . "/" . $year_f . "/" . $month_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!is_dir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f)) {
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!is_dir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from)) {
    mkdir($base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  }
  $filepath = $base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from . "/";
  return $filepath;
}
function ftp_isdir($connection,$Dir){
  if(@ftp_chdir($connection,$dir)){
    return true;
  }else{
    return false;
  }
}
function upload_folder_NAS($file_from,$SubFolder, $base_dir,$connection)
{
  $date = date("Y-m-d");
  $month_f = date("F", strtotime($date));
  $year_f = date("Y", strtotime($date));
  $date_f = date("d", strtotime($date));
  //var_dump($connection);
 // echo "Y".ftp_pwd($connection)."Y";
  //var_dump(@ftp_chdir($connection,$base_dir . "/" . $year_f."/"));
  //echo $base_dir . "/" . $year_f;
  //ftp_mkdir($connection,"Digigate/Purchasepro/2021");
//  exit();

  if (!@ftp_chdir($connection,$base_dir . "/" . $year_f)) {
    ftp_mkdir($connection,"$base_dir/$year_f");//, 007, true);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!@ftp_chdir($connection,$base_dir . "/" . $year_f . "/" . $month_f)) {
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!@ftp_chdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f)) {
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f);
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  } elseif (!@ftp_chdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from)) {
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from);
  }
  elseif (!@ftp_chdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from."/".$SubFolder) && $SubFolder!="") {
    ftp_mkdir($connection,$base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from."/".$SubFolder);
  }
  $filepath = $base_dir . "/" . $year_f . "/" . $month_f . "/" . $date_f . "/" . $file_from . "/";
  if($SubFolder!=""){
    $filepath.=$SubFolder."/";
  }
  return $filepath;
}
?>
