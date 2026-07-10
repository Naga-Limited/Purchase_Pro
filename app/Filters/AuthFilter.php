<?php namespace App\Filters;
use CodeIgniter\Config\Services;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use CodeIgniter\HTTP\Message;

use App\Models\UserModel;

class AuthFilter implements FilterInterface {

    public function before(RequestInterface $request, $arguments = null) {
        // if (!$request->isCLI()) {
            $session = session();
            $user = $session->get('User');
            if (empty($user) ) { 
                $header =$request->getServer("HTTP_AUTHORIZATION");
                //var_dump($header);
                if(!$header){
                    //var_dump($header);
                    //Console.write(ENVIRONMENT);
                    if (1==1)//NEED TO REMOVE WHEN MAKE LIVE
                    {
                        $model = new UserModel();
                        $res = $model->canLogin('va','ppadmin@2');
                       // $session->set('User',"1");    
                       $session->set('User',$res);    
                    //return Services::response()->setStatusCode(401)->setJSON(["success" => 0, "result" => "Please provide the auth token".ENVIRONMENT."X" ]);
                    }
                    else
                    {
                    return Services::response()->setStatusCode(401)->setJSON(["success" => 0, "result" => "Session Expired" ]);
                    }
                }
                else{
                    //var_dump($header);
                    $privateKey = "mysec";
                    $decoded = JWT::decode($header, $privateKey, array('HS256'));
                    $session->set('User',$decoded);
                }
                
            }
        // }
    }
    // public function before(RequestInterface $request, $arguments = null) {
    //     $authHeader = $request->getServer("HTTP_AUTHORIZATION");
    //     if(!$authHeader){
    //         return Services::response()->setStatusCode(401)->setJSON(["success" => 0, "result" => "Please provide the auth token" ]);
    //     }
    // }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {
    }
} 