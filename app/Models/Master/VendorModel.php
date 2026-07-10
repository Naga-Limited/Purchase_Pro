<?php 
namespace App\Models\Master;
use CodeIgniter\Model;

class VendorModel extends Model
{
    protected $table = 'master_vendor';
    protected $primaryKey = 'id';
    protected $allowedFields = ['code', 'name', 'category'];

    public function getByCategory($category){
       $builder =  $this->db->table($this->table);
       $builder->select('code as value, name as label');
       $builder->where(['category' => $category]);
       $query = $builder->get();
       return   $query->getResultArray();
       //$query = $builder->getWhere(['id' => $id], $limit, $offset);
        // $q = "select * from categories";
        // $rs = $this->db->query($q);
        // return $rs->result();
     }
}