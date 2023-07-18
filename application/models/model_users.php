<?php

class Model_users extends CI_Model{
	

	public function can_log_in(){	
		$this->db->where("USER_CD", $this->input->post('usercd'));
		$this->db->where("USER_ID", $this->input->post('usercd'));
		$this->db->where("USER_PASSWORD", $this->input->post("password"));
		// $this->db->where("USER_ADDRESS2", md5($this->input->post('password')));	
		$query = $this->db->get('user');
		if ($query->num_rows() === 1) {
			//ユーザーが存在した場合の処理

			// 自社CDをセッションに保存
			$this->db->order_by('H_COMPANY_CD', 'ASC');
			$companyList = $this->db->get('housecompany')->result();
			$_SESSION['companycd'] = $companyList[0]->H_COMPANY_CD;
			return true;
		} else {					
			//ユーザーが存在しなかった場合の処理
			return false;
		}
	}
}