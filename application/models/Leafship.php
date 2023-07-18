<?php

class Leafship extends CI_Model
{
  // 出荷リーフデータ
  public $table = 'leafship';

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
      $this->table = 'leafship';
    } else {
      $this->table = 'leafship_sim';
    }
  }

  /**
   * 計画情報を読込する
   */
  public function readPlan()
  {
    // 出荷ビューの縦軸セル個数 変更時注意!！
    // 
    $cellNum = 50;
    $this->db->select('*, COALESCE(NULLIF(ed_shipment_date, ""), e_shipplan_date) AS l_start_plan_date, 
      ROW_NUMBER() OVER (PARTITION BY COALESCE(NULLIF(ed_shipment_date, ""), e_shipplan_date) 
      ORDER BY COALESCE(NULLIF(ed_shipment_date, ""), e_shipplan_date), l_estimate_no) - 1 AS row_num');
    $this->db->from($this->table);
    // $this->db->join(
    //   'statementdetails', 
    //   'statementdetails.sd_belong_cd = '.$this->table.'.l_belong_cd '.
    //   'AND statementdetails.sd_e_estimate_no = '.$this->table.'.l_estimate_no '.
    //   'AND statementdetails.sd_statement_sub_no = '.$this->table.'.l_statement_sub_no ', 
    //   'LEFT'
    // );
    // $this->db->join('statement', 'statement.s_estimate_no = '.$this->table.'.l_estimate_no', 'LEFT');
    $this->db->join('estimatedetails', 'estimatedetails.ed_estimate_no = '.$this->table.'.l_estimate_no', 'LEFT');
    $this->db->join('estimate', 'estimate.e_estimate_no = '.$this->table.'.l_estimate_no', 'LEFT');
    // $this->db->join('product', 'product.p_cd = estimatedetails.ed_p_cd AND product.p_type_continue = "0"', 'LEFT');
    $this->db->join('customer', 'customer.C_CUSTOMER_CD = '.$this->table.'.l_customer_cd', 'LEFT');
    // $this->db->where('e_shipplan_date', 'is not null');
    $this->db->group_by("l_leaf_no");
    $this->db->order_by('COALESCE(NULLIF(ed_shipment_date, ""), e_shipplan_date) ASC');
    $leafship_data = $this->db->get()->result();
    // 倉庫毎だとデータが詰まりすぎるので、ただ並べて配置 warehouse_dataには、ただ連番が入ってる
    $this->db->select('*');
    $this->db->from('warehouses');
    $warehouse_data = $this->db->get()->result();
    $result = array(
      'leafship' => $leafship_data,
      'warehouse' => $warehouse_data,
    );
    
    // 'warehouse' => $warehouse_data,
    // $this->db->select('*');
    // $this->db->from('warehouse');
    // $warehouse_data = $this->db->get()->result();
    // $leafship_data = $this->db->query('SELECT l.*, shipplandetails.*, shipplans.*, product.*,
    //   product.p_cd AS l_p_id
    //   FROM '.$this->table.' AS l
    //   LEFT JOIN shipplandetails
    //     ON l_spd_shipplan_id = spd_shipplan_id
    //     AND l_spd_row = spd_row
    //   LEFT JOIN shipplans
    //     ON l_spd_shipplan_id = sp_id
    //   LEFT JOIN product
    //     ON p_cd = spd_products_id')->result();
    // $result = array(
    //   'warehouse' => $warehouse_data,
    //   'leafship' => $leafship_data,
    // );
    return $result;
  }

  /**
   * リーフの予定情報を更新する
   */
  public function updatePlan($data, $user_cd, $undoId)
  {
    $this->db->query('REPLACE INTO ' . $this->table . '_undo
      SELECT ? AS user_cd, ? AS undo_id, ' . $this->table . '.* FROM ' . $this->table . '
      WHERE l_leaf_no = ?',
      array($user_cd, $undoId, $data['l_leaf_no']));

    $this->db->set('l_start_plan_date', $data['l_start_plan_date']);
    $this->db->set('l_start_plan_time', sprintf('%04d', $data['l_start_plan_time']));
    $this->db->set('l_warehouse_cd', $data['l_warehouse_cd']);
    $this->db->where('l_leaf_no', $data['l_leaf_no']);
    $this->db->update($this->table);
  }

  // リーフ移動時の出荷予定データの更新処理 2023/6/27 受注データの出荷予定日を更新する
  public function updateDeliveryDate($data) {
    // 受注データの更新
    $this->db->set('e_shipplan_date', $data['l_start_plan_date']);
    $this->db->where('e_estimate_no', $data['l_estimate_no']);
    $this->db->update('estimate');
    // 出荷予定データの更新
    // $this->db->query('UPDATE statement SET s_desired_delivery_date = ?, s_shipping_plan_date = ?;', array($data['l_start_plan_date'],$data['l_start_plan_date']));
    // $this->db->where('s_estimate_no', $data['l_estimate_no']);
    // $this->db->where('s_serial_no', $data['l_statement_sub_no']);

    // $this->db->query('UPDATE statementdetails SET sd_desired_delivery_date = ?;', array($data['l_start_plan_date']));
    // $this->db->where('s_estimate_no', $data['l_estimate_no']);
    // $this->db->where('s_serial_no', $data['l_statement_sub_no']);
  }
  /*
  public function updatePlan($data, $users_email, $undoId)
  {
    $this->db->query('REPLACE INTO ' . $this->table . '_undo
      SELECT ? AS users_email, ? AS undo_id, ' . $this->table . '.* FROM ' . $this->table . '
      WHERE l_id = ?',
      array($users_email, $undoId, $data['l_id']));

    $this->db->set('l_start_plan', $data['l_start_plan']);
    $this->db->set('l_warehouses_id', $data['l_warehouses_id']);
    $this->db->where('l_id', $data['l_id']);
    $this->db->update($this->table);
  }
  */

  /**
   * リーフの配置を直前の場所に戻す
   */
  public function undoPlace($user_cd)
  {
    $this->db->trans_start();

    $this->db->query('UPDATE ' . $this->table . ' AS l, ' . $this->table . '_undo AS lu SET 
      l.l_start_plan_date = lu.l_start_plan_date,
      l.l_start_plan_time = lu.l_start_plan_time,
      l.l_warehouse_cd = lu.l_warehouse_cd
      WHERE lu.users_cd = ? AND l.l_leaf_no = lu.l_leaf_no',
      array($user_cd));
  
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
    $query = $this->db->query('SELECT storages.*, product.p_name FROM leafship_storages
      LEFT JOIN storages ON storages.sto_id = leafship_storages.sto_id
      LEFT JOIN product ON product.p_cd = storages.sto_product_id
      WHERE leafship_storages.l_id = ?',
      array($l_id));
    return $query->result();
  }

  /**
   * リーフの分割状況を取得する
   */
  public function getDivideInfo($l_id)
  {
    // 竹中仕様では出荷リーフの分割は考慮しない
    $query = $this->db->query('SELECT l.*,
        IFNULL(COUNT(lps.l_id),0) AS result_num
      FROM '.$this->table.' AS l
      LEFT JOIN leafship_storages AS lps
        ON lps.l_id = l.l_id
      WHERE l.l_divide_id = ?
      GROUP BY l.l_id',
      array($l_id));
    return $query->result();
  }

  /**
   * リーフを分割または結合する
   */
  public function divide($leafs)
  {
    // 竹中仕様では出荷リーフの分割は考慮しない
    $this->db->trans_start();

    $combineLeafs = array();
    $this->db->query('SET @day_st = (SELECT day_st_hour FROM wbsctrl LIMIT 1)');
    $this->db->query('SET @day_en = (SELECT day_en_hour FROM wbsctrl LIMIT 1)');
    foreach ($leafs as $row) {
      if ($row['do_divide'] === true) {
        // 出荷リーフ分割実行
        $sql = 'INSERT INTO '.$this->table.' SELECT
            NULL AS l_id,
            l1.l_spd_shipplan_id AS l_spd_shipplan_id,
            l1.l_spd_row AS l_spd_row,
            l1.l_summary AS l_summary,
            l1.l_required_time AS l_required_time,
            calcfinishdt(l1.l_start_plan, l1.l_required_time, @day_st, @day_en) AS l_start_plan,
            ? AS l_amount,
            l1.l_warehouses_id AS l_warehouses_id,
            l1.l_divide_id AS l_divide_id,
            l1.l_start_date AS l_start_date,
            l1.l_finish_date AS l_finish_date
          FROM '.$this->table.' AS l1 WHERE l_id = ?';
        $this->db->query($sql, array(
          $row['divide_amount'],
          $row['l_id'],
        ));
        // 分割元の数量と所要時間を更新
        $sql = 'UPDATE '.$this->table.' SET
            `l_required_time`=l_required_time,
            `l_amount`=l_amount - ?
          WHERE `l_id`=?';
        $this->db->query($sql, array(
          $row['divide_amount'],
          $row['l_id'],
        ));
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
        $sql = 'UPDATE '.$this->table.' SET
            `l_required_time`=l_required_time,
            `l_amount`=l_amount+?
          WHERE `l_id`=?';
        $this->db->query($sql, array(
          $combineLeafs[$i]['l_amount'],
          $combineLeafs[0]['l_id'],
        ));
      }
      // 結合するリーフを削除
      // 最初の結合対象リーフのみを残す(l_id===l_divide_idになるとは限らない)
      for ($i = 1; $i < count($combineLeafs); $i++) {
        $sql = 'DELETE FROM '.$this->table.' WHERE `l_id`=?';
        $this->db->query($sql, array(
          $combineLeafs[$i]['l_id'],
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
    $this->db->query('INSERT INTO leafship_sim SELECT * FROM leafship
      WHERE leafship.l_start_plan >= ? OR leafship.l_start_plan IS NULL', $simsdatefrom);
  }

  /**
	 * 出荷詳細情報を取得する
	 * @param string $belong_cd 自社コード
	 * @param string $leaf_no リーフNo
	 */
  public function getShipDetails($belong_no, $leaf_no)
  {
    // 該当の出荷リーフを取得
    $leafship = 'WITH leafship_with AS ( '
      .'SELECT '
        .'* '
      .'FROM '
        .'leafship '
      .'WHERE '
        .'l_belong_cd = ? '
      .'AND '
        .'l_leaf_no = ? '
    .')';

    // 該当する製品CD、品名補足印字内容、受注数を含むテーブルを取得
    $estimatedetails = 'estimatedetails_with AS ('
      . 'SELECT '
        . '* '
      . 'FROM '
        . 'estimatedetails '
      . 'INNER JOIN '
        . 'leafship_with '
      . 'ON '
        . 'estimatedetails.ed_estimate_no = leafship_with.l_estimate_no '
      // . ' AND '
      //   . 'estimatedetails.sd_statement_sub_no = leafship_with.l_statement_sub_no '
    .')';

    // 「受注先名」取得用クエリ
    $sql_customer_name = 'SELECT '
      .'customer.C_CUSTOMER_NAME '
    .'FROM '
      .'leafship_with '
    .'INNER JOIN '
      .'customer '
    .'ON '
      .'leafship_with.l_customer_cd = customer.C_CUSTOMER_ID '
    .'AND '
      .'leafship_with.l_customer_cd = customer.C_CUSTOMER_CD';

    // 「受注客先番号(客先No/社内No)」取得用クエリ
    $sql_order_number = 'SELECT '
      .'leafship_with.l_estimate_no, '
      .'leafship_with.l_order_no, '
      .'leafship_with.l_remarks '
    .'FROM '
      .'leafship_with;';

    // 「出荷主」取得用クエリ
    $sql_shipper_name = 'SELECT '
      .'customerpost.CP_POST_NAME '
    .'FROM '
      .'leafship_with '
    .'INNER JOIN '
      .'customerpost '
    .'ON '
      .'leafship_with.l_customer_cd = customerpost.CP_CUSTOMER_CD '
    .'AND '
      .'leafship_with.l_shipper_cd = customerpost.CP_POST_CD';

    // 「納入先」取得用クエリ
    $sql_delivery_name = 'SELECT '
      .'customerpost.CP_POST_NAME '
    .'FROM '
      .'leafship_with '
    .'INNER JOIN '
      .'customerpost '
    .'ON '
      .'leafship_with.l_customer_cd = customerpost.CP_CUSTOMER_CD '
    .'AND '
      .'leafship_with.l_delivery_cd = customerpost.CP_POST_CD;';

    // 「止め先」取得用クエリ
    $sql_stay_name = 'SELECT '
      .'customerpost.CP_POST_NAME '
    .'FROM '
      .'leafship_with '
    .'INNER JOIN '
      .'customerpost '
    .'ON '
      .'leafship_with.l_customer_cd = customerpost.CP_CUSTOMER_CD '
    .'AND '
      .'leafship_with.l_stay_cd = customerpost.CP_POST_CD';

    // 「製品名、規格、出荷予定数量」取得用クエリ
    $sql_productList = 'SELECT '
      .'product.p_name AS product_name, '
      .'arrangement.ar_name AS arrangement_name, '
      // .'estimatedetails_with.sd_p_name_supple AS product_name_supple, '
      // .'estimatedetails_with.ed_quantity AS estimate_quantity '
      .'estimatedetails_with.* '
    .'FROM '
      .'estimatedetails_with '
    .'INNER JOIN '
      .'arrangement '
    .'ON '
      .'estimatedetails_with.ed_parrangement_cd = arrangement.ar_sub_cd '
    .'INNER JOIN '
      .'product '
    .'ON '
      .'estimatedetails_with.ed_belong_cd = product.p_belong_cd '
    .'AND '
      .'estimatedetails_with.ed_p_cd = product.p_cd;';
    
    // 「受注先名」取得
    $result1 = $this->db->query($leafship.$sql_customer_name, array($belong_no, $leaf_no))->result();
    // 「受注客先番号」取得
    $result2 = $this->db->query($leafship.$sql_order_number, array($belong_no, $leaf_no))->result();
    // 「出荷主」取得
    $result3 = $this->db->query($leafship.$sql_shipper_name, array($belong_no, $leaf_no))->result();
    // 「納入先」取得
    $result4 = $this->db->query($leafship.$sql_delivery_name, array($belong_no, $leaf_no))->result();
    // 「止め先」取得
    $result5 = $this->db->query($leafship.$sql_stay_name, array($belong_no, $leaf_no))->result();
    // 「製品名、規格、出荷予定数量」取得
    $result6 = $this->db->query($leafship.','.$estimatedetails.$sql_productList, array($belong_no, $leaf_no))->result();
    return array(
      'customer_name' => !empty($result1) ? $result1[0]->C_CUSTOMER_NAME : '',
      'estimate_number' => !empty($result2) ? $result2[0]->l_estimate_no : '',
      'order_number' => !empty($result2) ? $result2[0]->l_order_no : '',
      'shipper_name' => !empty($result3) ? $result3[0]->CP_POST_NAME : '',
      'delivery_name' => !empty($result4) ? $result4[0]->CP_POST_NAME : '',
      'stay_name' => !empty($result5) ? $result5[0]->CP_POST_NAME : '',
      'remarks' => !empty($result2) ? $result2[0]->l_remarks : '',
      'product_list' =>  $result6,
    );
  }

  /**
	 * 出荷リーフの出荷詳細を登録　※更新内容を受注データに変更予定
	 * @param string $belong_cd 自社コード
	 * @param string $leaf_no リーフNo
   * @param string $remarks 備考
	 */
  public function updateShipDetail($belong_cd, $leaf_no, $remarks)
  {
    $this->db->trans_start();
    // 該当の出荷リーフを取得
    $leafship = 'WITH leafship_with AS ( '
    .'SELECT '
      .'* '
    .'FROM '
      .'leafship '
    .'WHERE '
      .'l_belong_cd = ? '
    .'AND '
      .'l_leaf_no = ? '
    .')';

    // 該当の納品明細を取得
    $statementdetails = 'statementdetails_with AS ('
      .'SELECT '
        .'* '
      .'FROM '
        .'statementdetails '
      .'INNER JOIN '
        .'leafship_with '
      .'ON '
        .'statementdetails.sd_e_estimate_no = leafship_with.l_estimate_no '
      .'AND '
        .'statementdetails.sd_statement_sub_no = leafship_with.l_statement_sub_no '
    .')';

    // 出荷リーフの「実績開始日時、実績完了日時、備考」更新用クエリ
    $update_leafship = 'UPDATE '
      .'leafship '
    .'SET '
      .'l_start_date = ?, '
      .'l_finish_date = ?, '
      .'l_start_time = ?, '
      .'l_finish_time = ?, '
      .'l_remarks = ? '
    .'WHERE '
      .'l_belong_cd = ? '
    .'AND '
      .'l_leaf_no = ?;';

    // 納品明細の「出荷日」更新用クエリ
    $update_statementdetails = 'UPDATE '
      .'statementdetails, '
      .'leafship_with '
    .'SET '
      .'statementdetails.sd_shipment_date = leafship_with.l_start_plan_date '
    .'WHERE '
      .'statementdetails.sd_e_estimate_no = leafship_with.l_estimate_no '
    .'AND '
      .'statementdetails.sd_statement_sub_no = leafship_with.l_statement_sub_no;';

    // 受注明細の「出荷日、出荷進捗区分」更新用クエリ
    $update_estimatedetails = 'UPDATE '
      .'estimatedetails, '
      .'statementdetails_with '
    .'SET '
      .'estimatedetails.ed_shipment_date = statementdetails_with.l_start_plan_date, '
      .'estimatedetails.ed_ship_status_sign = ? '
    .'WHERE '
      .'estimatedetails.ed_belong_cd = statementdetails_with.sd_belong_cd '
    .'AND '
      .'estimatedetails.ed_estimate_no = statementdetails_with.sd_e_estimate_no '
    .'AND '
      .'estimatedetails.ed_estimate_sub_no = statementdetails_with.sd_estimate_sub_no '
    .'AND '
      .'estimatedetails.ed_shipment_sub_no = statementdetails_with.sd_shipment_sub_no;';

    // 納品明細の「出荷日」更新用クエリ
    $update_statement = 'UPDATE '
    .'statement, '
    .'leafship_with '
    . 'SET '
      .'statement.s_shipping_date = leafship_with.l_start_plan_date '
    . 'WHERE '
      .'statement.s_estimate_no = leafship_with.l_estimate_no '
    . 'AND '
      .'statement.s_serial_no = leafship_with.l_statement_sub_no;';
    
    // 出荷リーフの「実績開始日時、実績完了日時、備考」を更新
    $today = date('Ymd');
    $this->db->query($update_leafship, array($today, $today, '0000', '0000', $remarks, $belong_cd, $leaf_no));

    // 納品明細の「出荷日」を更新
    $this->db->query($leafship . $update_statementdetails, array($belong_cd, $leaf_no));

    // 受注明細の「出荷日、出荷進捗区分」を更新
    $this->db->query($leafship . ',' . $statementdetails . $update_estimatedetails, array($belong_cd, $leaf_no, '2'));

    // 納品ヘッダの出荷日更新
    $this->db->query($leafship . $update_statement, array($belong_cd, $leaf_no));
    $this->db->trans_complete();
  }
}
