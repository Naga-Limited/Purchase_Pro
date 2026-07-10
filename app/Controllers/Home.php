<?php

namespace App\Controllers;

class Home extends BaseController
{
	public function index()
	{
		// echo var_dump($_SESSION);
		echo file_get_contents('../public/react/index.html') ;
		// return view('welcome_message');
	}
}
