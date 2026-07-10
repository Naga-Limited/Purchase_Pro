<?php

$username = "root";
$password = "CGH123";
$hostname = "117.247.190.27:3310"; 
$dbname = 'cghsql';





$con = mysqli_connect($hostname, $username, $password, $dbname) 
  or die("Unable to connect to Database");

echo "DB Connected Successfully...";
?>