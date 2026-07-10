<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class ProjectHistroyController extends ResourceController
{
    // 🔹 Fetch All Project History
    public function getProjectHistory()
    {
        try {
            $db = \Config\Database::connect();

            $result = $db->table("project_history")
                ->select("*")
                ->orderBy("id", "ASC")
                ->get()
                ->getResultArray();

            foreach ($result as &$row) {
                $row['releaseDateFormat'] = date("d-M-Y", strtotime($row['releaseDate']));
            }

            return $this->respond(["data" => $result]);
        } catch (\Throwable $e) {
            return $this->respond(["error" => $e->getMessage()], 500);
        }
    }

    // 🔹 ADD / UPDATE in same API
    public function saveProjectHistory()
    {
        try {
            $data = $this->request->getJSON();
            //print_r($data);exit;

            if (!$data) {
                return $this->respond(["error" => "Invalid input"], 400);
            }

            $db = \Config\Database::connect();
            $builder = $db->table("project_history");

            // Mapping frontend fields → database fields
            $insertData = [
                "version"     => $data->version,
                "details"     => $data->details,
                "module"      => $data->module,
                "status"      => $data->status,
                "releaseDate" => $data->releaseDate,
            ];

            if (!empty($data->id)) {
                // 🔄 UPDATE
                $builder->where("id", $data->id);
                $builder->update($insertData);

                return $this->respond(["message" => "Project history updated successfully"]);
            } else {
                // ➕ INSERT
                $builder->insert($insertData);
                return $this->respond(["message" => "Project history added successfully"]);
            }
        } catch (\Throwable $e) {
            return $this->respond(["error" => $e->getMessage()], 500);
        }
    }
}
