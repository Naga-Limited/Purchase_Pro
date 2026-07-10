<?php

// Localhost Code for Run Without build
//header('Access-Control-Allow-Origin: *');
//header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
//header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

use Config\Database;
/* Database credentials. Assuming you are running MySQL
 server with default setting (user 'root' with no password) */

$dbConfig = (new Database())->default;

$uname =  $dbConfig["username"];
$pword = $dbConfig["password"];
$dbname = $dbConfig["database"];
$server = $dbConfig["hostname"];
define("DB_SERVER", $server);
define("DB_USERNAME",$dbConfig["username"]);
define("DB_PASSWORD", $dbConfig["password"]);
define("DB_NAME",$dbConfig["database"]);
?>

<?php
$connect = mysqli_connect($server, $uname, $pword, $dbname);
if ($connect == false) {
  die("ERROR: Could not connect. " . mysqli_connect_error());
}
?>