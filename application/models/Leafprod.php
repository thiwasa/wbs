<?php

class Leafprod extends CI_Model
{

  // public $table = 'leaflist';
  public $table = 'leafprod';

  public function __construct()
  {
    parent::__construct();
  }

  /**
   * 操作対象のリーフテーブルをシミュレーション状態に応じて設定する
   */
  public function setTable($isSimMode)
  {
    if ($isSimMode === false) {
      $this->table = 'leafprod';
    } else {
      $this->table = 'leafprod_sim';
    }
  }

  /**
   * 計画情報を読込する
   */
  public function readPlan() 
  {
    $this->db->select('*');
    $this->db->from('members');
    $members_data = $this->db->get()->result();

    // prodleaf読込　l_start_plan:DateTime型、l_start_plan_date:String型(yyyymmddd)、l_start_plan_time:String型(hhmm)
    $this->db->select('
      *,
      FORMAT(l.l_pd_plan_interval, 0) AS l_required_time
      ');
      $this->db->from($this->table . ' AS l');
      $this->db->join('product', 'product.p_cd = l.l_p_cd', 'left');
      $this->db->join('process', 'process.pc_cd = l_process_cd', 'left');
      $this->db->join('members', 'members.id = l_equipment_member_id', 'left');
      $this->db->join('estimate', 'estimate.e_estimate_no = l_estimate_no_01 OR estimate.e_estimate_no = l_estimate_no_02 OR estimate.e_estimate_no = l_estimate_no_03', 'left');
      $this->db->join('customer', 'customer.C_CUSTOMER_CD = estimate.e_customer_cd', 'left');
    // $this->db->select('
    //   l.*, 
    //   l.l_leaf_no AS l_id,
    //   l.l_prod_plan_no AS l_ppd_prodplan_id,
    //   l.l_process_cd AS l_process_cd,
    //   0 AS l_ppd_row,
    //   l.l_remarks AS l_summary,
    //   l.l_p_cd AS l_p_id,
    //   prodplans.pd_ed_quantity AS l_amount,
    //   FORMAT(l.l_pd_plan_interval, 0) AS l_required_time,
    //   CONCAT(STR_TO_DATE(l.l_pd_start_plan_date, "%Y%m%d"), " ", STR_TO_DATE(l.l_pd_start_plan_time, "%H%i")) AS  l_start_plan,
    //   prodplans.pd_proj_cd AS l_projects_id,
    //   "" AS l_divide_id,
    //   "" AS l_parent_id,
    //   FORMAT(l.l_pd_real_interval, 0) AS l_result_time,
    //   CONCAT(STR_TO_DATE(l.l_pd_start_date, "%Y%m%d"), " ", STR_TO_DATE(l.l_pd_start_time, "%H%i")) AS l_start_date,
    //   CONCAT(STR_TO_DATE(l.l_pd_finish_date, "%Y%m%d"), " ", STR_TO_DATE(l.l_pd_finish_time, "%H%i")) AS l_finish_date,
    //   product.p_name AS p_name,
    //   estimate.e_title AS e_title,
    //   "" AS projects_name,
    //   estimatedetails.ed_remarks AS ppd_remarks,
    //   prodplans.pd_finish_plan_date AS ppd_finish_plan,
    //   prodplans.pd_e_customer_cd AS customer_cd    
     
    // ');
    // $this->db->from($this->table . ' AS l');
    // $this->db->join('prodplans', 'prodplans.pd_belong_cd = l.l_belong_cd AND prodplans.pd_prod_plan_no = l.l_prod_plan_no', 'left');
    // $this->db->join('estimatedetails', 'estimatedetails.ed_belong_cd = l.l_belong_cd AND estimatedetails.ed_estimate_no = l.l_estimate_no_01', 'left');
    // $this->db->join('estimate', 'estimate.e_belong_cd = l.l_belong_cd AND estimate.e_estimate_no = l.l_estimate_no_01', 'left');
    // $this->db->join('product', 'product.p_cd = l.l_p_cd', 'left');    
    // $this->db->group_by('l_leaf_no');
    $tasks_data = $this->db->get()->result();

    // $this->db->select('*');
    // $this->db->from('projects');
    // $projects_data = $this->db->get()->result();
    $projects_data = $this->db->query('WITH RECURSIVE cte AS
    (
      SELECT id, name, start_plan, finish_plan, parent_id
      ,0 AS depth, CAST(id AS CHAR) AS dir
      FROM projects
      UNION ALL
      SELECT p.id, p.name, p.start_plan, p.finish_plan, p.parent_id
      ,cte.depth + 1 AS depth, CONCAT(cte.dir,\'/\',p.id) AS dir
      FROM projects AS p
      INNER JOIN cte ON p.parent_id = cte.id
    )
    SELECT cte.* FROM cte WHERE cte.depth=(SELECT MAX(depth) FROM cte AS c2 WHERE c2.id=cte.id)
    ORDER BY dir')->result();

    $result = array(
      'tasks' => $tasks_data,
      'members' => $members_data,
      'projects' => $projects_data,
    );
    return $result;
  }

  /**
   * リーフの予定情報を更新する
   */
  public function updatePlan($data, $user_cd, $undoId)
  {
    // $this->db->query('REPLACE INTO '.$this->table.'_undo
    //   SELECT ? AS users_email, ? AS undo_id, ' . $this->table . '.* FROM ' . $this->table . '
    //   WHERE l_leaf_no = ?',
    //   array($users_email, $undoId, $data['l_leaf_no']));
    //   $dt = new DateTime($data['l_pd_start_plan_date']);
    //   $strDate = $dt->format('Ymd');
    //   $strTime = $dt->format('Hi');
    $this->db->query('REPLACE INTO '.$this->table.'_undo
      SELECT ? AS user_cd, ? AS undo_id, ' . $this->table . '.* FROM ' . $this->table . '
      WHERE l_leaf_no = ?',
      array($user_cd, $undoId, $data['l_leaf_no']));

    // 日付の文字列変換は,js側で行う
    $this->db->set('l_pd_start_plan_date', $data['l_pd_start_plan_date']);
    $this->db->set('l_pd_start_plan_time', sprintf('%04d', $data['l_pd_start_plan_time']));
    $this->db->set('l_worker_member_id', $data['l_worker_member_id']);
    $this->db->set('l_equipment_member_id', $data['l_equipment_member_id']);
    // $this->db->set('l_projects_id', $data['l_projects_id']);
    $this->db->where('l_leaf_no', $data['l_leaf_no']);
    $this->db->update($this->table);
  }

  /**
   * リーフの配置を直前の場所に戻す
   */
  public function undoPlace($user_cd)
  {
    $this->db->trans_start();

    $this->db->query('UPDATE ' . $this->table . ' AS l, ' . $this->table . '_undo AS lu SET 
      l.l_pd_start_plan_date = lu.l_pd_start_plan_date,
      l.l_pd_start_plan_time = lu.l_pd_start_plan_time,
      l.l_worker_member_id = lu.l_worker_member_id,
      l.l_equipment_member_id = lu.l_equipment_member_id,

      WHERE lu.user_cd = ? AND l.l_leaf_no = lu.l_leaf_no',
      array($user_cd));
      // l.l_projects_id = lu.l_projects_id
    $this->db->trans_complete();
  }

  /**
   * リーフの予定情報を更新する
   */
  public function clearUndo($user_cd)
  {
    $this->db->query('DELETE FROM ' . $this->table . '_undo WHERE user_cd = ?',
      array($user_cd));
  }

  /**
   * リーフに関する入出庫情報を取得する
   */
  public function getStorage($l_id)
  {
    // $query = $this->db->query('SELECT storages.*, product.p_name FROM leafprod_storages
    //   LEFT JOIN storage ON storages.sto_id = leafprod_storages.sto_id
    //   LEFT JOIN product ON product.p_cd = storage.sr_p_cd
    //   WHERE leafprod_storages.l_leaf_no = ?',
    $query = $this->db->query('SELECT storage.*, product.p_name FROM leafprod
    LEFT JOIN storage ON storage.sr_p_cd = leafprod.l_p_cd
    LEFT JOIN product ON product.p_cd = storage.sr_p_cd
    WHERE leafprod.l_leaf_no = ?',
      array($l_id));
    return $query->result();
  }

  /**
   * リーフの分割状況を取得する
   */
  public function getDivideInfo($l_id)
  {
    // $query = $this->db->query('SELECT l.*,
    //     IFNULL(COUNT(lps.l_leaf_no),0) AS result_num
    //   FROM '.$this->table.' AS l
    //   LEFT JOIN leafprod_storages AS lps
    //     ON lps.l_leaf_no = l.l_leaf_no
    //   WHERE l.l_prod_plan_sub_no = ?
    //   GROUP BY l.l_leaf_no',
    // リーフ番号から製造指示番号、工程CD取得
    $query = $this->db->query('
    SELECT l_prod_plan_no, l_process_cd, l_manufacture_cd  FROM ' . $this->table . ' 
    WHERE l_leaf_no = ?
    ;',
    array($l_id)); 
    $rslt = $query->result();
    
    // 製造指示番号から該当するリーフすべて取得  編集必要10/23
    // $query = $this->db->query('
    //   SELECT l_prod_plan_no,l_process_cd,l_manufacture_cd,COUNT(*) AS result_num 
    //   FROM leafprod
    //   GROUP BY l_belong_cd,l_prod_plan_no,l_process_cd,l_manufacture_cd
    //   WHERE l_prod_plan_no IN ? AND l_process_cd IN ? AND l_manufacture_cd IN ?
    //   ',
    //   $result['']);
    $query = $this->db->query('
    SELECT l_prod_plan_no,l_process_cd,l_manufacture_cd,COUNT(*) AS result_num 
    FROM leafprod
    GROUP BY l_belong_cd,l_prod_plan_no,l_process_cd,l_manufacture_cd
    WHERE l_prod_plan_no = ? AND l_process_cd = ? AND l_manufacture_cd = ?
    ',
    $rslt[0]['l_prod_plan_no'], $rslt[0]['l_process_cd'], $rslt[0]['l_manufacture_cd']);
    return $query->result();
  }

  /**
   * リーフを分割または結合する
   */
  public function divide($leafs)
  {
    $this->db->trans_start();

    $combineLeafs = array();
    $this->db->query('SET @day_st = (SELECT day_st_hour FROM wbsctrl LIMIT 1)');
    $this->db->query('SET @day_en = (SELECT day_en_hour FROM wbsctrl LIMIT 1)');
    foreach ($leafs as $row) {
      if ($row['do_divide'] === true) {
        // 製造リーフ分割実行
        // リーフNo取得
        $query = $this->db->query('SELECT MAX(l_leaf_no) FROM ' . $this->table . ' WHERE l_leaf_no LIKE ?', 'L' . $row['l_id'] . '%');
        $no = $query->result();
        // リーフ作成
        $sql = 'INSERT INTO ' . $this->table . 'SELECT 
              NULL AS l_leaf_no,
              l1.l_prod_plan_no AS l_prod_plan_no,
              l1.l_process_cd AS l_process_cd,
              l1.l_pd_fin_plan_date AS l_pd_fin_plan_date,
              l1.l_process_cd AS l_process_cd,
              l1.l_process_cd AS l_process_cd,
              l1.l_p_cd AS l_p_cd,
              l1.ed_sub_01 AS ed_sub_01,
              l1.ed_sub_12 AS ed_sub_12,
              l1.ed_sub_02 AS ed_sub_02,
              l1.ed_sub_13 AS ed_sub_13,
              l1.ed_sub_04 AS ed_sub_04,
              l1.ed_sub_05 AS ed_sub_05,
              l1.ed_sub_06 AS ed_sub_06,
              l1.l_product_sign AS l_product_sign,
              l1.l_pd_plan_interval - ? AS l_pd_plan_interval,
              --str_to_date(CONCAT(l1.l_pd_start_date,l1.l_pd_start_time), "%Y%m%d%k%i") AS l_start_plan,
              calcfinishdt(str_to_date(CONCAT(l1.l_pd_start_plan_date,l1.l_pd_start_plan_time), "%Y%m%d%k%i"), ?, @day_st, @day_en) AS l_start_plan,
              l1.l_pd_start_plan_date AS l_pd_start_plan_date,
              l1.l_pd_start_plan_time AS l_pd_start_plan_time,
              l1.l_worker_member_id AS l_worker_member_id,
              l1.l_equipment_member_id AS l_equipment_member_id,
              l1.l_pd_start_date AS l_pd_start_date,
              l1.l_pd_finish_date AS l_pd_finish_date,
              l1.l_remarks AS l_remarks FROM ' . $this->table . ' AS l1 WHERE l_id = ?';
              $this->db->query($sql, array(
                $row['divide_interval'],
                $row['divide_interval'],
                $row['l_leaf_no'],
              ));
        // $sql = 'INSERT INTO '.$this->table.' SELECT
        //     NULL AS l_leaf_no,
        //     l1.l_prod_plan_no AS l_prod_plan_no,
        //     l1.l_prod_plan_sub_no AS l_prod_plan_sub_no,
        //     -- l1.l_summary AS l_summary,
        //     l1.l_p_cd AS l_p_cd,
        //     ? AS l_amount,
        //     l1.l_required_time * (? / l1.l_amount) AS l_required_time,
        //     calcfinishdt(l1.l_start_plan, l1.l_required_time, @day_st, @day_en) AS l_start_plan,
        //     l1.l_worker_member_id AS l_worker_member_id,
        //     l1.l_equipment_member_id AS l_equipment_member_id,
        //     l1.l_projects_id AS l_projects_id,
        //     l1.l_divide_id AS l_divide_id,
        //     l1.l_parent_id AS l_parent_id,
        //     l1.l_result_time AS l_result_time,
        //     l1.l_start_date AS l_start_date,
        //     l1.l_finish_date AS l_finish_date
        //   FROM '.$this->table.' AS l1 WHERE l_id = ?';
        // $this->db->query($sql, array(
        //   $row['divide_amount'],
        //   $row['divide_amount'],
        //   $row['l_leaf_no'],
        // ));
        // 分割元の数量と所要時間を更新 時間分割になるためコメントアウト
        // $sql = 'UPDATE '.$this->table.' SET
        //     `l_pd_plan_interval `=l_pd_plan_interval  * ((l_estimate_quantity - ?) / l_estimate_quantity),
        //     `l_estimate_quantity`=l_estimate_quantity - ?
        //   WHERE `l_leaf_no`=?';
        // $this->db->query($sql, array(
        //   $row['divide_amount'],
        //   $row['divide_amount'],
        //   $row['l_id'],
        // ));
        continue;
      }
      if ($row['do_combine'] === true) {
        // 製造リーフ結合対象追加
        $combineLeafs[] = $row;
      }
    }
    // 結合指定されたリーフが2個以上ある場合、結合を実行する
    if (count($combineLeafs) >= 2) {
      // 分割元の数量と所要時間を加算して更新
      for ($i = 1; $i < count($combineLeafs); $i++) {
        $sql = 'UPDATE ' . $this->table . ' SET
            `l_pd_plan_interval` = l_pd_plan_interval + ?
          WHERE `l_leaf_no`=?';
        $this->db->query($sql, array(
          $combineLeafs[$i]['l_pd_plan_interval'],
          $combineLeafs[0]['l_leaf_no'],
        ));
      }
      // 結合するリーフを削除
      // 最初の結合対象リーフのみを残す(l_id===l_divide_idになるとは限らない)
      for ($i = 1; $i < count($combineLeafs); $i++) {
        $sql = 'DELETE FROM ' . $this->table . ' WHERE `l_leaf_no`=?';
        $this->db->query($sql, array(
          $combineLeafs[$i]['l_leaf_no'],
        ));
      }
    }

    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
    return;
  }

  /**
   * シミュレーションを開始する
   */
  public function startSimulation($simsdatefrom) {
    $this->db->query('INSERT INTO leafprod_sim SELECT * FROM leafprod
      WHERE leafprod.l_pd_start_plan_date >= ? OR leafprod.l_pd_start_plan_date IS NULL', $simsdatefrom);
  }

}
