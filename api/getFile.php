<?php
date_default_timezone_set('Asia/Calcutta');
include_once(APIPATH.'/helper/fileHelper.php');

$url = $_REQUEST['url'];



//Added 25092021 for save the file in NAS SERVER
$server = '192.168.1.104' ;//Address of ftp server
$user_name = 'Digi'; // Username
$password = 'Digi@2021'; // Password
$location = "/Digigate/Digi/NLFD/";
$extension = pathinfo($name_array[$i], PATHINFO_EXTENSION);
$connection = ftp_connect($server,21); 
//echo $server.$url;


ftp_login($connection, $user_name, $password);
header('Content-type:application/pdf');
//header('Content-Disposition:inline;filename:"'.$url.'"');
//header('Content-Transfer-Encoding:binary');
//header('Accept-Ranges:bytes');

//@readfile($server.$url);
ftp_close($connection); 

?>