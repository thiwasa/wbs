<?php
class Ajax extends CI_Controller
{

  public function __construct()
  {
    parent::__construct();
    $this->load->database();
  }

  public function index()
  {

  }

  // 在庫テーブル関連のソースはすべてコメントアウトした。2019/11/21@sono

  /**
   * 各テーブル内容読み込み処理
   */
  public function reload()
  {
    $this->load->helper('date');
    
    $this->db->select('*');
    $this->db->from('ctrltable');
    $ctrl_data = $this->db->get()->result();

    $this->db->select('*');
    $this->db->from('wbsctrl');
    $wbsctrl_data = $this->db->get()->result();

    $this->db->select('*');
    $this->db->from('members');
    $members_data = $this->db->get()->result();

    $this->db->select('*');
    $this->db->from('projects');
    $projects_data = $this->db->get()->result();
  // プロジェクトマスタと同様に変更　sono
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
    SELECT cte.* FROM cte WHERE cte.depth=(SELECT MAX(depth) FROM cte AS c2 WHERE c2.id=cte.id) ORDER BY dir')->result();

    $this->db->select('*');
    $this->db->from('leaf_details');
    $leaf_details_data = $this->db->get()->result();

    $this->db->select('*');
    $this->db->from('schedule_details');
    $schedule_details_data = $this->db->get()->result();

    $this->db->select('*');
    $this->db->from('leaf_assignable_to');
    $leaf_assignable_to_data = $this->db->get()->result();

    $this->db->select('*');
    $this->db->from('calbdt');
    $this->db->order_by('cbt_date', 'ASC');
    //$this->db->where('c>', now()); // Todo: 表示範囲に応じて可変
    $calbdt_data = $this->db->get()->result();

    $this->db->select('*');
    $this->db->from('bdtmembers');
    $this->db->order_by('bt_date', 'ASC');
    //$this->db->where('bt_date >', );
    $bdtmembers_data = $this->db->get()->result();

    $this->db->select('*');
    $this->db->from('bdtmembers1');
    $this->db->order_by('bt_date', 'ASC');
    //$this->db->where('bt_date >', );
    $bdtmembers1_data = $this->db->get()->result();
    // 編集必要あり　sono 1024
    /*l_ppd_rowとはl.l_prod_plan_sub_noのこと*/
    /*l.l_estimate_quantity = l_amount*/
    $this->db->select('
      l.*, 
      l.l_leaf_no AS l_id,
      l.l_prod_plan_no AS l_ppd_prodplan_id,
      l.l_process_cd AS l_process_cd,
      0 AS l_ppd_row,
      l.l_remarks AS l_summary,
      l.l_p_cd AS l_p_id,
      prodplans.pd_ed_quantity AS l_amount,
      FORMAT(l.l_pd_plan_interval, 0) AS l_required_time,
      CONCAT(STR_TO_DATE(l.l_pd_start_plan_date, "%Y%m%d"), " ", STR_TO_DATE(l.l_pd_start_plan_time, "%H%i")) AS  l_start_plan,
      prodplans.pd_proj_cd AS l_projects_id,
      "" AS l_divide_id,
      "" AS l_parent_id,
      FORMAT(l.l_pd_real_interval, 0) AS l_result_time,
      CONCAT(STR_TO_DATE(l.l_pd_start_date, "%Y%m%d"), " ", STR_TO_DATE(l.l_pd_start_time, "%H%i")) AS l_start_date,
      CONCAT(STR_TO_DATE(l.l_pd_finish_date, "%Y%m%d"), " ", STR_TO_DATE(l.l_pd_finish_time, "%H%i")) AS l_finish_date,
      product.p_name AS p_name,
      estimate.e_title AS e_title,
      "proj" AS projects_name,
      estimatedetails.ed_remarks AS ppd_remarks,
      prodplans.pd_finish_plan_date AS ppd_finish_plan
    ');
  /*
  l.*,
    l.l_leaf_no AS l_id,
    l.l_prod_plan_no AS l_ppd_prodplan_id,
    0 AS l_ppd_row, 
    estimatedetails.ed_remarks AS l_summary,
    l.l_p_cd AS l_p_id,
    10 AS l_amount,
    FORMAT(l.l_pd_plan_interval, 0) AS l_required_time,
    CONCAT(STR_TO_DATE(l.l_pd_start_plan_date, "%Y%m%d"), " ", STR_TO_DATE(l.l_pd_start_plan_time, "%H%i")) AS  l_start_plan,
    prodplans.pd_proj_cd AS l_projects_id,
    "" AS l_divide_id,
    "" AS l_parent_id,
    FORMAT(l.l_pd_real_interval, 0) AS l_result_time,
    CONCAT(STR_TO_DATE(l.l_pd_start_date, "%Y%m%d"), " ", STR_TO_DATE(l.l_pd_start_time, "%H%i")) AS l_start_date,
    CONCAT(STR_TO_DATE(l.l_pd_finish_date, "%Y%m%d"), " ", STR_TO_DATE(l.l_pd_finish_time, "%H%i")) AS l_finish_date,
    product.p_name AS p_name,
    estimate.e_title AS e_title,
    projects.name AS projects_name,
    projects.start_plan AS projects_start_plan,
    projects.finish_plan AS projects_finish_plan,
    estimatedetails.ed_remarks AS ppd_remarks,
    prodplans.pd_finish_plan_date AS ppd_finish_plan
    */
  $this->db->from('leafprod AS l');
  // $this->db->join('prodplans', 'prodplans.pd_belong_cd = l.l_belong_cd AND prodplans.pd_prod_plan_no = l.l_prod_plan_no AND prodplans.pd_prod_plan_sub_no = l.l_prod_plan_sub_no', 'left');
  $this->db->join('prodplans', 'prodplans.pd_belong_cd = l.l_belong_cd AND prodplans.pd_prod_plan_no = l.l_prod_plan_no', 'left');
  $this->db->join('estimatedetails', 'estimatedetails.ed_belong_cd = l.l_belong_cd AND estimatedetails.ed_estimate_no = l.l_estimate_no_01', 'left');
  //  AND estimatedetails.ed_estimate_sub_no = l.l_estimate_sub_no
  $this->db->join('estimate', 'estimate.e_belong_cd = l.l_belong_cd AND estimate.e_estimate_no = l.l_estimate_no_01', 'left');
  $this->db->join('product', 'product.p_cd = l.l_p_cd', 'left');
  // $this->db->join('projects', 'projects.id = prodplans.pd_proj_cd', 'left');
    // $this->db->select('
    //   l.*,
    //   projects.name AS projects_name,
    //   projects.start_plan AS projects_start_plan,
    //   projects.finish_plan AS projects_finish_plan,
    //   product.p_name AS p_name,
    //   estimatedetails.ed_remarks AS ppd_remarks,
    //   estimate.e_title AS pp_title,
    //   prodplans.pd_fin_plan_date AS ppd_finish_plan
    // ');

    // $this->db->from('leafprod AS l');
    // $this->db->join('prodplans', 'prodplans.pd_belong_cd = l.l_belong_cd AND prodplans.pd_prod_plan_no = l.l_prod_plan_no AND prodplans.pd_prod_plan_sub_no = l.l_prod_plan_sub_no', 'left');
    // $this->db->join('estimatedetails', 'estimatedetails.ed_belong_cd = l.l_belong_cd AND estimatedetails.ed_estimate_no = l.l_estimate_no AND estimatedetails.ed_estimate_sub_no = l.l_estimate_sub_no', 'left');
    // $this->db->join('estimate', 'estimate.e_belong_cd = l.l_belong_cd AND estimate.e_estimate_no = l.l_estimate_no', 'left');
    // $this->db->join('product', 'product.p_cd = l.l_p_cd', 'left');
    // $this->db->join('projects', 'projects.id = prodplans.pd_proj_cd', 'left');

    // $this->db->join('prodplans', 'prodplans.pd_prod_plan_no = l.l_prod_plan_no AND prodplans.pd_prod_plan_sub_no = l.l_prod_plan_sub_no AND prodplans.pd_process_cd = l.l_process_cd', 'left');
    // // $this->db->join('projects', 'projects.id = l.l_projects_id', 'left');
    // $this->db->join('projects', 'projects.id = prodplans.pd_proj_cd', 'left');
    // $this->db->join('product', 'product.p_cd = l.l_p_cd', 'left');
    // $this->db->join('estimatedetails AS ed', 'ed.ed_belong_cd = l.l_belong_cd AND ed.ed_estimate_no = l.l_estimate_no AND ed.ed_estimate_sub_no = l.l_estimate_sub_no', 'left');
    // $this->db->join('estimate AS e', 'e.e_belong_cd = l.l_belong_cd AND e.e_estimate_no = l.l_estimate_no', 'left');
    // $this->db->join('product', 'product.p_id = l.l_p_id', 'left');
    // $this->db->join('prodplan', 'prodplan.pp_id = l.l_ppd_prodplan_id', 'left');
    // $this->db->join('prodplans', 'prodplans.pp_id = l.l_ppd_prodplan_id', 'left');
    // $this->db->join('prodplandetails', 'prodplandetails.ppd_prodplan_id = l.l_ppd_prodplan_id
      // AND prodplandetails.ppd_row = l.l_ppd_row', 'left');
    $this->db->group_by('l_leaf_no');
    $tasks_data = $this->db->get()->result();
    // error_log($this->db->last_query());
    $result = array(
      'ctrl' => $ctrl_data,
      'wbsctrl' => $wbsctrl_data,
      'leaf_details' => $leaf_details_data,
      'schedule_details' => $schedule_details_data,
      'members' => $members_data,
      'projects' => $projects_data,
      'leaf_assignable_to' => $leaf_assignable_to_data,
      'calbdt' => $calbdt_data,
      'bdtmembers' => $bdtmembers_data,
      'bdtmembers1' => $bdtmembers1_data,
      'tasks' => $tasks_data,
    );
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode($result));
  }

  /**
   * データベース内容を更新する。
   * トランザクション内で配列で受け取った順に処理を実行する。
   * 各レコードはidで指定する。
   */
  public function update()
  {
    $postobj = $this->input->post();
    $recordlists = json_decode($postobj['json'], true);
    $this->db->trans_start();
    for ($i = 0; $i < count($recordlists['query']); $i++) {
      $data = $recordlists['query'][$i];
      //error_log($data['tbl']);
      $tblname = '';
      $pks = array();
      switch ($data['tbl']) {
        case 'leafs':
        case 'members':
        case 'roles':
        case 'schedules':
        case 'projects':
          array_push($pks, 'id');
          break;
        case 'schedule_members':
          array_push($pks, 'id');
          break;
        case 'leaf_details':
        case 'schedule_details':
          array_push($pks, 'colkey');
          break;
        case 'assignLeafMember':
          $this->assignLeafMember($data['record']['schedules_id']);
          continue 2;
        default:
          exit();
          break;
      }
      $tblname = $data['tbl'];
      foreach ($data['record'] as $key => $value) {
        $this->db->set($key, $value);
        //error_log($key . '=>' . $value);
      }
      foreach ($pks as $pk) {
        $this->db->where($pk, $data['record'][$pk]);
        //error_log('pk:' . $key . '=>' . $value);
      }
      $this->db->update($tblname);
      //error_log($this->db->last_query());
    }
    $this->db->trans_complete();
  }

  /**
   * リーフ分割または結合を実行する
   */
  public function divide()
  {
    $postobj = $this->input->post();
    $data = json_decode($postobj['json'], true);
    $this->loadLeafModel($data['leaftype']);
    $this->leaf->divide($data['leafs']);
  }

  /**
   * 指定リーフについての添付ファイル一覧を返す
   */
  /* public function attachmentsinfo($leaftype, $id)
  {
    $this->db->select('id,actual_filename,uploaded');
    $tbl = '';
    switch ($leaftype) {
      case 'PROD_STAFF':
      case 'PROD_EQUIPMENT':
      case 'PROJ':
      case 'PROD_STAFF_SIM':
      case 'PROD_EQUIPMENT_SIM':
      case 'PROJ_SIM':
        $tbl = 'attachments_prod';
        break;
      case 'SHIP':
      case 'SHIP_SIM':
        $tbl = 'attachments_ship';
        break;
    }
    $this->db->from($tbl);
    $this->db->where('l_id', $id);
    $data = $this->db->get()->result();
    $result = array(
      'attachments' => $data,
    );
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode($result));
  }
  */

  /**
   * 新規リーフ追加
   */
  public function insertleaf()
  {
    $postobj = $this->input->post();
    $recordlists = json_decode($postobj['json'], true);
    $this->db->trans_start();
    // リーフ追加
    $jsonparam = $this->makeJsonParam($recordlists['leafdetails'], 'leafsid', false);
    $sql = 'INSERT INTO `leafs` (`detail`) VALUES (JSON_OBJECT(' . $jsonparam['querystr'] . '))';
    $this->db->query($sql, $jsonparam['queryparam']);
    $lfid = $this->db->insert_id();
    //error_log($this->db->last_query());
    // スケジュール追加
    $jsonparam = $this->makeJsonParam($recordlists['scheduledetails'], 'schedulesid', false);
    $sql = 'INSERT INTO `schedules` (`leafs_id`, `start_plan`, `required_time`, `detail`) VALUES (?, NULL, ?, JSON_OBJECT(' . $jsonparam['querystr'] . '))';
    $queryparams = array_merge(array($lfid, $recordlists['requiredtime']), $jsonparam['queryparam']);
    $this->db->query($sql, $queryparams);
    $schedulesid = $this->db->insert_id();
    //error_log($this->db->last_query());
    // スケジュール・メンバー関連追加(roles分)
    $queryroles = $this->db->get('roles');
    foreach ($queryroles->result() as $row) {
      $rolesid = $row->id;
      $sql = 'INSERT INTO `schedule_members` (`schedules_id`, `members_id`, `requied_roles_id`) VALUES (?, NULL, ?)';
      $this->db->query($sql, array($schedulesid, $rolesid));
      //error_log($this->db->last_query());
    }
    // 割当可能メンバー情報追加(members分)
    $querylats = $recordlists['leafassignableto'];
    foreach ($querylats as $latmembersid) {
      $sql = 'INSERT INTO `leaf_assignable_to` (`leafs_id`, `members_id`) VALUES (?, ?)';
      $this->db->query($sql, array($lfid, $latmembersid));
      //error_log($this->db->last_query());
    }
    // トランザクション完了処理
    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
  }

  /**
   * スケジュール情報編集
   */
  public function editleaf()
  {
    $postobj = $this->input->post();
    $recordlists = json_decode($postobj['json'], true);
    $this->db->trans_start();
    $jsonparam = $this->makeJsonParam($recordlists, 'schedulesid', true);
    $sql = 'UPDATE `schedules` SET `detail` = JSON_SET(`detail`, ' . $jsonparam['querystr'] . ') WHERE `id` = ?';
    $queryparams = array_merge($jsonparam['queryparam'], array($recordlists['schedulesid']));
    $this->db->query($sql, $queryparams);
    //error_log($this->db->last_query());
    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
  }

  /**
   * 製造リーフへの実績登録
   * 入出庫履歴テーブルにデータを追加する。
   */
  public function prodresult()
  {  
    // SQL用変数    
    $str = '';
    $startDate = '';
    $startTime = '';
    $finishDate = '';
    $finishTime = ''; 
    $dateT = '';
    $user = '';
    $bFin = false;

    $postobj = $this->input->post();
    $recordlists = json_decode($postobj['json'], true);
    $this->db->trans_start();

    // 製造リーフへの実績登録
    // もし開始日が既に登録されていたら、開始日はスルーする
    $sql = 'SELECT * FROM leafprod WHERE l_belong_cd = ? AND l_leaf_no = ?';
    $qParams = array(
      $recordlists['companycd'],
      $recordlists['leafno']
    );
    $result = $this->db->query($sql, $qParams)->result();

    // ユーザーデータ取得
    // $userdata = $this->checkLoggedIn();
    // $user = $userdata->usercd;   
    $user = $_SESSION['usercd'];   
    // print_r($user);

    // 完了区分
    if ($recordlists['finflg']) {
      // 完了
      $bFin = 2;
    } else if ($recordlists['interval'] > 0) {
      // 作業時間が入っていたら作業中
      $bFin = 1;
    }
    
    // jsonで渡されてくるのは、yyyy/mm/dd hh:mm のStringなので注意
    // String型に変換
    // $dateT = new Datetime($recordlists['startdate']);
    $startDate = substr($recordlists['startdate'], 0, 4) . substr($recordlists['startdate'], 5, 2) . substr($recordlists['startdate'], 8, 2);
    $startTime = substr($recordlists['startdate'], 11, 2) . substr($recordlists['startdate'], 14, 2);
    // $dateT = new Datetime($recordlists['finishdate']);
    $finishDate = substr($recordlists['finishdate'], 0, 4) . substr($recordlists['finishdate'], 5, 2) . substr($recordlists['finishdate'], 8, 2);
    $finishTime = substr($recordlists['finishdate'], 11, 2) . substr($recordlists['finishdate'], 14, 2);

    /**
     * 削除フラグが立っていれば、データ削除もしくはデータ更新
     * 立っていなければ、データ更新。データ更新時、完了ボタン押下ならば完了フラグ更新
     */
    if (count($result) === 0) {
      return;
    }
    if ($recordlists['delreport']) {
      if ($recordlists['interval'] > 0) {
        // 既存データリセットかつ、新規データ登録
        $sql = '
        UPDATE leafprod SET 
          `l_pd_real_interval` = ?, 
          `l_product_sign` = ?,
          `l_pd_start_date` = ?,
          `l_pd_start_time` = ?,
          `l_pd_finish_date` = ?,
          `l_pd_finish_time` = ?,
          `l_worker_member_id` = ?,
          `l_pd_abort_num` = ?
        WHERE l_belong_cd = ? AND l_leaf_no = ?;    
        ';
        // bindValueの値
        $queryparams = array(
          $recordlists['interval'],
          $bFin,
          $startDate,
          $startTime,
          $finishDate,
          $finishTime,
          $user,
          $recordlists['abortcnt'],
          $recordlists['companycd'],
          $recordlists['leafno']
        );
      } else {
        // 既存データリセット
        $sql = '
        UPDATE leafprod SET 
          `l_pd_real_interval` = ?, 
          `l_product_sign` = ?,
          `l_pd_start_date` = ?,
          `l_pd_start_time` = ?,
          `l_pd_finish_date` = ?,
          `l_pd_finish_time` = ?,
          `l_worker_member_id` = ?,
          `l_pd_abort_num` = ?
        WHERE l_belong_cd = ? AND l_leaf_no = ?;    
        ';
        // bindValueの値
        $queryparams = array(
          0,
          0,
          '',
          '',
          '',
          '',
          $user,
          0,
          $recordlists['companycd'],
          $recordlists['leafno']
        );
      }
    } else {
      // 通常のデータ更新
      if ($result['l_pd_start_date'] > 0 && $result['l_pd_start_time'] > 0) {
        // 開始日付データが既存
        $sql = '
        UPDATE leafprod SET 
          `l_pd_real_interval` = `l_pd_real_interval` + ?, 
          `l_product_sign` = ?,
          `l_pd_finish_date` = ?,
          `l_pd_finish_time` = ?,
          `l_worker_member_id` = ?,
          `l_pd_abort_num` = `l_pd_abort_num` + ?
        WHERE l_belong_cd = ? AND l_leaf_no = ?;   
        ';
        // bindValueの値
        $queryparams = array(
          $recordlists['interval'],
          $bFin,
          $finishDate,
          $finishTime,
          $user,
          $recordlists['abortcnt'],
          $recordlists['companycd'],
          $recordlists['leafno']
        );
      } else {
        $sql = '
        UPDATE leafprod SET 
          `l_pd_real_interval` = `l_pd_real_interval` + ?, 
          `l_product_sign` = ?,
          `l_pd_start_date` = ?,
          `l_pd_start_time` = ?,
          `l_pd_finish_date` = ?,
          `l_pd_finish_time` = ?,
          `l_worker_member_id` = ?,
          `l_pd_abort_num` = `l_pd_abort_num` + ?
        WHERE l_belong_cd = ? AND l_leaf_no = ?;    
        ';
        // bindValueの値
        $queryparams = array(
          $recordlists['interval'],
          $bFin,
          $startDate,
          $startTime,
          $finishDate,
          $finishTime,
          $user,
          $recordlists['abortcnt'],
          $recordlists['companycd'],
          $recordlists['leafno']
        );
      }
    }

    $this->db->query($sql, $queryparams);

    // // 製造リーフへの実績登録=
    // $sql = 'UPDATE leafprod SET
    // `l_pd_real_interval` = ?,
    // `l_pd_start_date` = ?,
    // `l_pd_start_time` = ?,
    // `l_pd_finish_date` = ?,
    // `l_pd_finish_time` = ?
    // WHERE l_belong_cd = ? AND l_leaf_no = ?';
    // // $sql = 'UPDATE leafprod SET
    // //   `l_result_time` = ?,
    // //   `l_start_date` = ?,
    // //   `l_finish_date` = ?
    // //   WHERE l_id = ?';
    // $dtStart = strtotime($recordlists['start_date']);
    // $dtFinish = strtotime($recordlists['finish_date']);
    // $queryparams = array(
    //   $recordlists['l_pd_real_interval'],
    //   date('Ymd', $dtStart),
    //   date('hm', $dtStart),
    //   date('Ymd', $dtFinish),
    //   date('hm', $dtFinish),
    //   $recordlists['l_belong_cd'],
    //   $recordlists['l_leaf_no'],
    //   // $recordlists['start_date'],
    //   // $recordlists['finish_date'],
    //   // $recordlists['leafs_id'],
    // );
    // $this->db->query($sql, $queryparams);
    // 製造製品の入出庫登録
    // 製品IDを取得
    // $leafprod_data = $this->db->query(
    //   'SELECT * FROM leafprod WHERE l_id = ?',
    //   array($recordlists['leafs_id']))->result();
    // // 製造品の増加分登録
    // $sql = 'INSERT INTO `storages`
    //   (`sto_warehouse_id`, `sto_product_id`, `sto_cause_id`, `sto_qty_good`, `sto_qty_bad`, `sto_qty_buy`)
    //   VALUES (1, ?, 5, ?, ?, ?)';
    // $queryparams = array(
    //   $leafprod_data[0]->l_p_id,
    //   $recordlists['qty_good'],
    //   $recordlists['qty_bad'],
    //   $recordlists['qty_good'],
    // );
    // $this->db->query($sql, $queryparams);
    // $stoid = $this->db->insert_id();
    // // リーフ入出庫履歴テーブル関連の登録
    // $sql = 'INSERT INTO `leafprod_storages` (`sto_id`, `l_id`) VALUES (?, ?)';
    // $queryparams = array(
    //   $stoid,
    //   $recordlists['leafs_id'],
    // );
    // $this->db->query($sql, $queryparams);

    // 使用材料の入出庫登録
    // 製造製品で使用した材料をBOMマスタから取得
  //   $bom_data = $this->db->query(
  //     'SELECT * FROM bom
  //       WHERE b_parent_id = ?
  //       AND b_child_id <> 0',
  //     array($leafprod_data[0]->l_p_id)
  //   )->result();
  //   foreach ($bom_data as $bom_key => $bom) {
  //     // 使用材料の減少分登録
  //     $usedqty = ($recordlists['qty_good'] + $recordlists['qty_bad']) * $bom->b_quantity * -1;
  //     $sql = 'INSERT INTO `storages`
  //       (`sto_warehouse_id`, `sto_product_id`, `sto_cause_id`, `sto_qty_good`, `sto_qty_bad`, `sto_qty_buy`)
  //       VALUES (1, ?, 5, ?, ?, ?)';
  //     $queryparams = array(
  //       $bom->b_child_id,
  //       $usedqty,
  //       0,
  //       $usedqty,
  //     );
  //     $this->db->query($sql, $queryparams);
  //     $stoid = $this->db->insert_id();
  //     // リーフ入出庫履歴テーブル関連の登録
  //     $sql = 'INSERT INTO `leaf_storages` (`leafs_id`, `sto_id`) VALUES (?, ?)';
  //     $queryparams = array(
  //       $recordlists['leafs_id'],
  //       $stoid,
  //     );
  //     $this->db->query($sql, $queryparams);
  //   }

    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
  }

  // /**
  //  * 指定製造リーフに関する入出庫情報を取得する
  //  */
  // public function readleafstorage()
  // {
  //   $postobj = $this->input->post();
  //   $this->loadLeafModel($postobj['leaftype']);
  //   $result = $this->leaf->getStorage($postobj['l_id']);
  //   $this->output
  //     ->set_content_type('application/json')
  //     ->set_output(json_encode($result));
  // }

  /***
   * 製造詳細実績
   */
  public function proddetrilresult() {

  }

  /**
   * 製造詳細データ読込
   */
  public function readProdDetail() {
    $postobj = $this->input->post();
    $recordlists = json_decode($postobj['json'], true);
    // 現在の製造実績データを取得
    $sql = 'SELECT *, IF(pw_prod_finish_time="", "未", IF(pw_prod_finish_time="0","作業中", "済")) AS prodflg
             FROM prodplandetailsw 
            LEFT JOIN prodplansw ON pw_prod_plan_no = pp_prod_plan_no
            WHERE pw_prod_plan_no = ? AND pw_process_cd = ?;';
    $qParams = array(
      $recordlists['prodplanno'],
      $recordlists['processcd']
    );
    $result = $this->db->query($sql, $qParams)->result();
    $this->output
    ->set_content_type('application/json')
    ->set_output(json_encode($result));
  }

  /**
   * リーフの分割状態を取得する
   */
  public function readdivideleaf()
  {
    $postobj = $this->input->post();
    $this->loadLeafModel($postobj['leaftype']);
    $result = $this->leaf->getDivideInfo($postobj['lf']['l_divide_id']);
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode($result));
  }

  /**
   * 出荷リーフへの実績登録
   * 入出庫履歴テーブルにデータを追加する。
   */
  public function shipresult()
  {
    $postobj = $this->input->post();
    $recordlists = json_decode($postobj['json'], true);
    $this->db->trans_start();

    // 出荷リーフへの実績登録
    $sql = 'UPDATE leafship SET
      `l_start_date` = ?,
      `l_finish_date` = ?
      WHERE l_leaf_no = ?';
    $queryparams = array(
      $recordlists['start_date'],
      $recordlists['finish_date'],
      $recordlists['leaf_no'],
    );
    // $sql = 'UPDATE leafship SET
    //   `l_start_date` = ?,
    //   `l_finish_date` = ?
    //   WHERE l_id = ?';
    // $queryparams = array(
    //   $recordlists['start_date'],
    //   $recordlists['finish_date'],
    //   $recordlists['leafs_id'],
    // );
    $this->db->query($sql, $queryparams);
    // 出荷製品の入出庫登録
    // 製品IDを取得
    // $shipplandetails_data = $this->db->query(
    //   'SELECT spd.* FROM leafship AS l
    //     LEFT JOIN shipplandetails AS spd
    //       ON spd.spd_shipplan_id = l.l_spd_shipplan_id
    //       AND spd.spd_row = l.l_spd_row
    //     WHERE l.l_id = ?',
    //   array($recordlists['leafs_id']))->result();
    // if (count($shipplandetails_data) <= 0) {return;}
    // // 出荷品の減少分登録
    // $sql = 'INSERT INTO `storages`
    //   (`sto_warehouse_id`, `sto_product_id`, `sto_cause_id`,
    //   `sto_qty_good`, `sto_qty_bad`, `sto_qty_buy`)
    //   VALUES (1, ?, 1, ?, ?, ?)';
    // $queryparams = array(
    //   $shipplandetails_data[0]->spd_products_id,
    //   -$recordlists['qty_good'],
    //   -$recordlists['qty_bad'],
    //   -$recordlists['qty_good'],
    // );
    // $this->db->query($sql, $queryparams);
    // $stoid = $this->db->insert_id();
    // 出荷リーフ入出庫履歴テーブル関連の登録
    // $sql = 'INSERT INTO `leafship_storages` (`sto_id`, `l_id`) VALUES (?, ?)';
    // $queryparams = array(
    //   $stoid,
    //   $recordlists['leafs_id'],
    // );
    // $this->db->query($sql, $queryparams);

    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
  }


  /**
   * 出荷詳細取得
   */
  public function readshipdetails()
  {
    // 自社コード、リーフNo取得
    $belong_cd = $_SESSION['companycd'];
    $leaf_no = $this->input->get('leaf_no');

    // Leafshipモデル取得
    $this->loadLeafModel('SHIP');

    $this->db->trans_start();
    // 出荷詳細を取得
    $result = $this->leaf->getShipDetails($belong_cd, $leaf_no);
    $this->db->trans_complete();
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode($result));
  }

  /**
   * 出荷詳細登録ボタン押下時 ※実績登録は行わないため、コメントアウト予定
   */
  public function updateshipdetail()
  {
    // 自社コード、postパラメータ取得
    $belong_cd = $_SESSION['companycd'];
    $params = $this->input->post();

    // Leafshipモデル取得
    $this->loadLeafModel('SHIP');

    // 出荷詳細の情報を更新
    $this->leaf->updateShipDetail($belong_cd, $params['leaf_no'], $params['remarks']);
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode(array(
        'belong_cd' => $belong_cd, 
        'leaf_no' => $params['leaf_no']
      )));
  }

  /**
   * 稼働率(日別のリーフ配置数)取得
   */
  public function countleaf()
  {
    $this->load->model('leafprod', '', true);
    $postobj = $this->input->post();
    $this->db->trans_start();
    $this->db->query('CREATE TEMPORARY TABLE tempdt
      (dts DATETIME NOT NULL,
      dte DATETIME NOT NULL,
      cnt INT)');
    $this->setDayHourVariable();
    $daylength = $this->db->query('SELECT @day_en - @day_st AS daylength')->result();
    $this->db->query('SET @span = @day_st');
    for ($i = 0; $i < $postobj['num'] + 0; $i++) {
      $this->db->query('SET @st = DATE_ADD(STR_TO_DATE(?, \'%Y-%m-%d %H:%i:%s\'), INTERVAL @span HOUR)',
        array($postobj['checkdate']));
      $this->db->query('SET @en = DATE_ADD(@st, INTERVAL 1 HOUR)');
      $this->db->query('SET @span = @span + 24');
      $this->db->query('SET @cnt = -1');
      $this->db->query('INSERT INTO tempdt
      SELECT DATE_FORMAT(DATE_ADD(@st, INTERVAL temptbl.i HOUR), \'%Y-%m-%d %H:%i:%s\') AS dts,
        DATE_FORMAT(DATE_ADD(@st, INTERVAL temptbl.i + 1 HOUR), \'%Y-%m-%d %H:%i:%s\') AS dte,
        NULL AS cnt
      FROM (SELECT @cnt:=@cnt+1 AS i FROM `information_schema`.COLUMNS LIMIT ?) as temptbl', array($daylength[0]->daylength + 0));
    }
    $result = $this->db->query('SELECT t1.dts, CASE WHEN l1.l_id IS NOT NULL THEN COUNT(*) ELSE 0 END AS num FROM tempdt AS t1
      LEFT JOIN ' . $this->leafprod->table . ' AS l1 ON
        (l1.l_start_plan < t1.dte AND l1.l_start_plan >= t1.dts)
        OR (t1.dts < calcfinishdt_prod(l1.l_start_plan, l1.l_required_time, @day_st, @day_en, l1.l_worker_member_id, l1.l_equipment_member_id) AND t1.dts >= l1.l_start_plan)
        OR (calcfinishdt_prod(l1.l_start_plan, l1.l_required_time, @day_st, @day_en, l1.l_worker_member_id, l1.l_equipment_member_id) < t1.dte
          AND calcfinishdt_prod(l1.l_start_plan, l1.l_required_time, @day_st, @day_en, l1.l_worker_member_id, l1.l_equipment_member_id) > t1.dts)
        OR (t1.dte < calcfinishdt_prod(l1.l_start_plan, l1.l_required_time, @day_st, @day_en, l1.l_worker_member_id, l1.l_equipment_member_id) AND t1.dte > l1.l_start_plan)
      GROUP BY dts ORDER BY dts ASC')->result();
    $this->db->query('DROP TABLE tempdt');
    error_log($this->db->last_query());
    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode($result));
  }

  /**
   * 現在在庫を確認する
   */
  public function countcurrentstock()
  {
    $this->load->model('storage', '', true);
    $result = $this->storage->getCurrentStock(null);
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode($result));
  }

  /**
   * 完了予定日時を計算して返す
   */
  public function estimatefinishdt($startdt, $proctime)
  {
    $this->db->query('SELECT UNIX_TIMESTAMP(cbt.cbt_date) AS cbt_date FROM calbdt AS cbt
      WHERE cbt.cbt_date > ? AND cbt.cbt_holiday = 0
      AND HOUR(cbt.cbt_date) >= 8 AND HOUR(cbt.cbt_date) < 17 AND HOUR(cbt.cbt_date) <> 12
      ORDER BY cbt.cbt_date ASC LIMIT 0, ?',
      array($startdt, $proctime));
    $data = $this->db->get()->result();
    $result = $data;
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode($result));
  }

  /**
   * リーフの自動配置を実行する
   */
  public function autoplaceleaf()
  {
    $postobj = $this->input->post();
    // $this->sortLeaf($postobj['schedulesid']);
  }

  /**
   * リーフの自動配置を実行する(未使用)
   */
  /*
  private function sortLeaf($schedulesid)
  {
    $this->db->trans_start();
    // 自動配置開始対象となるリーフの情報を取得
    // 人員及び設備の行が取得される
    $this->db->query('SET @day_st = (SELECT day_st_hour FROM wbsctrl LIMIT 1)');
    $this->db->query('SET @day_en = (SELECT day_en_hour FROM wbsctrl LIMIT 1)');
    $sql = 'SELECT
        leafs.id AS leafs_id,
        schedules.id AS schedules_id,
        schedules.start_plan AS schedules_start_plan,
        schedules.required_time AS schedules_required_time,
        schedule_members.id AS schedule_members_id,
        schedule_members.requied_roles_id AS schedule_members_requied_roles_id,
        members.id AS members_id,
        roles.id AS roles_id,
        leafs.detail->\'$.deadline\'AS deadline,
        schedules.detail->\'$.fixed\'AS fixed,
        calcfinishdt(schedules.start_plan, schedules.required_time, @day_st, @day_en) AS finishdt
      FROM leafs
      LEFT JOIN schedules ON schedules.leafs_id = leafs.id
      LEFT JOIN schedule_members ON schedule_members.schedules_id = schedules.id
      LEFT JOIN members ON members.id = schedule_members.members_id
      LEFT JOIN roles ON roles.id = members.roles_id
      WHERE schedules.id = ?';
    $tasks_data = $this->db->query($sql, array($schedulesid))->result();
    //error_log($this->db->last_query());
    $result = array(
      'tasks' => $tasks_data,
    );
    // 後方で重なっているリーフについて、対象となるリーフを更新する
    // 担当者または担当設備が未定の場合には省略する
    foreach ($result['tasks'] as $key => $task) {
      if ($task->members_id !== null) {
        $this->moveLeaf($task->schedules_id, $task->finishdt);
        // 後に続くリーフを取得(自リーフを含む。整列順は納期順とすることを検討する)
        $sql = 'SELECT s2.* FROM schedules AS s1
          LEFT JOIN schedules AS s2 ON s1.start_plan <= s2.start_plan
          LEFT JOIN schedule_members AS sm1 ON sm1.schedules_id = s1.id
          LEFT JOIN schedule_members AS sm2 ON sm2.schedules_id = s2.id
          WHERE s1.id = ? AND sm1.members_id = sm2.members_id
          ORDER BY s2.start_plan ASC';
        $move_data = $this->db->query($sql, array($task->schedules_id))->result();
        foreach ($move_data as $key => $md) {
          // ずらした後にあるリーフの終了日時を取得
          $sql = 'SELECT calcfinishdt(s1.start_plan, s1.required_time, @day_st, @day_en) AS finishdt,
            calcstartdt(DATE_ADD(STR_TO_DATE(FROM_UNIXTIME(l1.detail->\'$.deadline\'/1000,\'%Y-%m-%d\'),
              \'%Y-%m-%d %H:%i:%s\'), INTERVAL 1 DAY), s1.required_time, @day_st, @day_en) AS deadline_work_start,
              DATE_ADD(STR_TO_DATE(FROM_UNIXTIME(l1.detail->\'$.deadline\'/1000,\'%Y-%m-%d\'), \'%Y-%m-%d %H:%i:%s\'), INTERVAL 1 DAY) AS deadline
            FROM schedules AS s1
            LEFT JOIN leafs AS l1 ON l1.id = s1.leafs_id
            WHERE s1.id = ?';
          $moved = $this->db->query($sql, array($md->id))->result();
          $deadline_en = $moved[0]->deadline;
          $deadline_st = $moved[0]->deadline_work_start;
          // ずらしたリーフがその納期を超過する場合、他の担当者行に移動する
          if ($moved[0]->finishdt > $deadline_en) {
            // スケジュールの全ロールについてメンバー変更処理を実行
            $sql = 'SELECT
                schedules.id AS schedules_id,
                schedule_members.id AS schedule_members_id,
                schedule_members.requied_roles_id AS schedule_members_requied_roles_id,
                members.id AS members_id,
                roles.id AS roles_id
              FROM schedules
              LEFT JOIN schedule_members ON schedule_members.schedules_id = schedules.id
              LEFT JOIN members ON members.id = schedule_members.members_id
              LEFT JOIN roles ON roles.id = members.roles_id
              WHERE schedules.id = ?
            ';
            $schmem = $this->db->query($sql, array($md->id))->result();
            foreach ($schmem as $sm) {
              // 他行に移動(移動先が残っていない場合は、担当者行間の移動は行わない)
              $sql = 'SELECT m3.* FROM members AS m3
                LEFT JOIN schedules AS s1 ON s1.id = ?
                LEFT JOIN schedule_members AS sm1 ON sm1.id = ?
                LEFT JOIN members AS m1 ON m1.id = sm1.members_id
                WHERE m1.roles_id = m3.roles_id AND m3.id NOT IN (
                  SELECT m2.id FROM members AS m2
                  LEFT JOIN schedules AS s1 ON s1.id = ?
                  LEFT JOIN schedule_members AS sm1 ON sm1.id = ?
                  LEFT JOIN members AS m1 ON m1.id = sm1.members_id
                  JOIN schedule_members AS sm2 ON sm2.members_id = m2.id
                  JOIN schedules AS s2 ON s2.id = sm2.schedules_id
                    AND (
                      (s2.start_plan <= ? AND s2.start_plan >= ?)
                      OR (? <= calcfinishdt(s2.start_plan, s2.required_time, @day_st, @day_en) AND ? >= s2.start_plan)
                      OR (calcfinishdt(s2.start_plan, s2.required_time, @day_st, @day_en) <= ? AND calcfinishdt(s2.start_plan, s2.required_time, @day_st, @day_en) >= ?)
                      OR (? <= calcfinishdt(s2.start_plan, s2.required_time, @day_st, @day_en) AND ? >= s2.start_plan)
                    )
                  WHERE m2.roles_id = m1.roles_id
                ) ORDER BY m3.id ASC LIMIT 1';
              $moverow = $this->db->query($sql, array(
                $sm->schedules_id, $sm->schedule_members_id, $sm->schedules_id, $sm->schedule_members_id,
                $deadline_en, $deadline_st, $deadline_st, $deadline_st,
                $deadline_en, $deadline_st, $deadline_en, $deadline_en)
              )->result();
              if (count($moverow) > 0) {
                // 担当メンバー変更
                // 人員割当を変更する場合でも設備の利用状況を参照して、重複しないように配置する
                $sql = 'UPDATE `schedule_members` SET `members_id` = ? WHERE `schedules_id` = ? AND `requied_roles_id` = ?';
                $this->db->query($sql, array($moverow[0]->id, $sm->schedules_id, $moverow[0]->roles_id));
                // 納期を超過しないように配置
                $sql = 'UPDATE `schedules` SET `start_plan` = ? WHERE `id` = ?';
                $this->db->query($sql, array($deadline_st, $sm->schedules_id));
              } else {
                error_log('cannot replace:' . $sm->schedules_id);
              }
            }
          }
        }
      }
    }
    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
  }
*/
  /**
   * リーフずらしを連続で行う
   */
  private function moveLeaf($sid, $finishdt)
  {
    // 後に続くリーフを取得してずらす(整列順は納期順とすることを検討する)
    $this->db->query('SET @day_st = (SELECT day_st_hour FROM wbsctrl LIMIT 1)');
    $this->db->query('SET @day_en = (SELECT day_en_hour FROM wbsctrl LIMIT 1)');
    $sql = 'SELECT s2.* FROM schedules AS s1
      LEFT JOIN schedules AS s2 ON s2.start_plan < calcfinishdt(s1.start_plan, s1.required_time, @day_st, @day_en)
        AND s1.start_plan <= s2.start_plan AND s2.id <> s1.id
      LEFT JOIN schedule_members AS sm1 ON sm1.schedules_id = s1.id
      LEFT JOIN schedule_members AS sm2 ON sm2.schedules_id = s2.id
      WHERE s1.id = ? AND sm1.members_id = sm2.members_id
      ORDER BY s2.start_plan ASC';
    $move_data = $this->db->query($sql, array($sid))->result();
    $finishdate = $finishdt;
    foreach ($move_data as $key => $md) {
      // ずらしを実行
      $sql = 'UPDATE `schedules` SET `start_plan` = ? WHERE `id` = ?';
      $this->db->query($sql, array($finishdate, $md->id));
    }
    foreach ($move_data as $key => $md) {
      // 連続でリーフをずらす
      $sql = 'SELECT calcfinishdt(s1.start_plan, s1.required_time, @day_st, @day_en) AS finishdt
        FROM schedules AS s1
        WHERE s1.id = ?';
      $moved = $this->db->query($sql, array($md->id))->result();
      $this->moveLeaf($md->id, $moved[0]->finishdt);
    }
  }

  /**
   * リーフの担当可能者情報を使用してメンバーを割当する
   * 割当担当者の配置予定日時が全て埋まっている場合は配置失敗とする
   */
  private function assignLeafMember($schedulesid)
  {
    $this->db->query('SET @day_st = (SELECT day_st_hour FROM wbsctrl LIMIT 1)');
    $this->db->query('SET @day_en = (SELECT day_en_hour FROM wbsctrl LIMIT 1)');
    // メンバー未割当のスケジュールを取得(9->18)
    $unassigned_sms = $this->db->query('SELECT sm1.* FROM schedules AS s1
      LEFT JOIN schedule_members AS sm1 ON sm1.schedules_id = s1.id
      WHERE s1.id = ? AND sm1.members_id IS NULL', array($schedulesid))->result();
    foreach ($unassigned_sms as $sm) {
      // 割当候補メンバーを取得(->6,7)
      $lats_data = $this->db->query('SELECT lat.* FROM leaf_assignable_to AS lat
        LEFT JOIN schedule_members AS sm1 ON sm1.id = ?
        LEFT JOIN schedules AS s1 ON s1.id = sm1.schedules_id
        LEFT JOIN leafs AS l1 ON l1.id = s1.leafs_id
        LEFT JOIN members AS m1 ON m1.id = lat.members_id
        WHERE lat.leafs_id = l1.id AND m1.roles_id = sm1.requied_roles_id', array($sm->id))->result();
      foreach ($lats_data as $lat) {
        // 取得したメンバーID順に割当を試行する
        // 既に割り当て済みのリーフがある場合、そのスケジュール情報を返す。
        // 行数1以上の場合には、そのメンバーへの割当を行わない
        $schedules_data = $this->db->query('SELECT s2.* FROM schedules AS s2
          LEFT JOIN schedules AS s1 ON s1.id = ?
          LEFT JOIN schedule_members AS sm1 ON sm1.members_id = ?
          WHERE s2.id = sm1.schedules_id
            AND isdateduplicated(s1.start_plan, calcfinishdt(s1.start_plan, s1.required_time, @day_st, @day_en),
              s2.start_plan, calcfinishdt(s2.start_plan, s2.required_time, @day_st, @day_en))', array($schedulesid, $lat->members_id))->result();
        if (count($schedules_data) === 0) {
          // 空いていた場合に割当を実行
          $this->db->query('UPDATE `schedule_members` SET `members_id` = ? WHERE `id` = ?', array($lat->members_id, $sm->id));
          break;
        }
      }
    }
  }

  /**
   * JSONに関するクエリパラメータを返す
   */
  private function makeJsonParam($paramlists, $pkstr, $addDollar)
  {
    $querystr = '';
    $queryparams = [];
    $cnt = 0;
    foreach ($paramlists as $key => $value) {
      if ($key !== $pkstr) {
        if ($cnt > 0) {
          $querystr .= ',';
        }
        $querystr .= '?, ?';
        if ($addDollar) {
          $queryparams = array_merge($queryparams, array('$.' . $key, $paramlists[$key]));
        } else {
          $queryparams = array_merge($queryparams, array($key, $paramlists[$key]));
        }
        $cnt++;
      }
    }
    return array(
      'queryparam' => $queryparams,
      'querystr' => $querystr,
    );
  }

  // /**
  //  * 出荷計画読込処理(旧)
  //  */
  // public function readshipplan()
  // {
  //   $this->load->model('leafship', '', true);
  //   $this->db->select('*');
  //   $this->db->from('warehouse');
  //   $warehouse_data = $this->db->get()->result();
  //   $leafship_data = $this->db->query('SELECT l.*, shipplandetails.*, shipplans.*, product.*,
  //     product.p_cd AS l_p_id
  //     FROM ' . $this->leafship->table . ' AS l
  //     LEFT JOIN shipplandetails
  //       ON l_spd_shipplan_id = spd_shipplan_id
  //       AND l_spd_row = spd_row
  //     LEFT JOIN shipplans
  //       ON l_spd_shipplan_id = sp_id
  //     LEFT JOIN product
  //       ON p_cd = spd_products_id')->result();
  //   $result = array(
  //     'warehouse' => $warehouse_data,
  //     'leafship' => $leafship_data,
  //   );
  //   $this->output
  //     ->set_content_type('application/json')
  //     ->set_output(json_encode($result));
  // }

  /**
   * リーフ読込処理
   */
  public function readleafplan()
  {
    $postobj = $this->input->post();
    $this->loadLeafModel($postobj['leaftype']);
    $result = $this->leaf->readPlan();
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode($result));
  }

  /**
   * 予定情報を更新する
   */
  public function updateleafplan()
  {
    $user = $this->checkLoggedIn();
    $postobj = $this->input->post();
    $data = json_decode($postobj['json'], true);
    $this->loadLeafModel($data['leaftype']);
    $this->db->trans_start();
    $this->leaf->clearUndo($user->usercd);  //emailから変更
    $this->leaf->updatePlan($data, $user->usercd, 1); //emailから変更
    $this->leaf->updateDeliveryDate($data); 
    $this->db->trans_complete();
  }

  /**
   * 複数リーフの予定情報を更新する
   */
  public function updatemultipleleafplan()
  {
    $user = $this->checkLoggedIn();
    $postobj = $this->input->post();
    $data = json_decode($postobj['json'], true);
    $this->loadLeafModel($data['leaftype']);
    $this->db->trans_start();
    $this->leaf->clearUndo($user->usercd);
    // $this->leaf->clearUndo($user->email);
    $i = 1;
    foreach ($data['lfs'] as $lf) {
      // $this->leaf->updatePlan($lf, $user->email, $i);
      $this->leaf->updatePlan($lf, $user->usercd, $i);
      $i++;
    }
    $this->db->trans_complete();
  }

  /**
   * 指定製品について在庫変動予想を行う。
   */
  public function countestimatestock()
  {
    $this->load->model('storage', '', true);
    //$postobj = $this->input->post();
    //$data = json_decode($postobj['json'], true);
    $p_id = $this->input->post()['p_id'];
    $isSimMode = $this->input->post()['sim'] === 'true' ? true : false;
    //$this->db->trans_start();
    $result = array(
      'current' => $this->storage->checkAllCurrentStock($p_id),
      'prod' => $this->storage->checkProdPlan($p_id, $isSimMode),
      'ship' => $this->storage->checkShipPlan($p_id, $isSimMode),
      'mat' => $this->storage->checkMaterialPlan($p_id, $isSimMode),
      'info' => $this->db->query(
        'SELECT * FROM product WHERE p_cd = ?',
        array($p_id))->result(),
    );
    //$this->db->trans_complete();
    $this->output
      ->set_content_type('application/json')
      ->set_output(json_encode($result));
  }

  /**
   * シミュレーションテーブルを初期化する
   */
  public function startsim()
  {
    $this->load->model('leafprod', '', true);
    $this->load->model('leafship', '', true);
    $postobj = $this->input->post();
    $data = json_decode($postobj['json'], true);
    // テーブルを初期化
    $this->db->query('TRUNCATE leafprod_sim');
    $this->db->query('TRUNCATE leafprod_sim_undo');
    $this->db->query('TRUNCATE leafship_sim');
    $this->db->query('TRUNCATE leafship_sim_undo');
    // シミュレーション用データを追加
    $this->db->trans_start();
    $this->leafprod->startSimulation($data['simsdatefrom']);
    $this->leafship->startSimulation($data['simsdatefrom']);
    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
  }

  /**
   * 直前のリーフ配置を取消する
   */
  public function undoplacing()
  {
    $user = $this->checkLoggedIn();
    $postobj = $this->input->post();
    $data = json_decode($postobj['json'], true);
    $this->loadLeafModel($data['leaftype']);
    $this->leaf->undoPlace($user->email);
  }

  /**
   * カレンダーテーブルを更新する
   * $data['delete']が1であれば、個人別カレンダーからデータを削除する(会社カレンダーの行は削除不可とする)
   */
  public function updatecalendar()
  {
    $postobj = $this->input->post();
    $data = json_decode($postobj['json'], true);

    $this->db->trans_start();
    if ((int)$data['bt_members_id'] > 0) {
      if ((int)$data['bt_holiday'] === 1) {
        $this->db->query('INSERT INTO bdtmembers (bt_date, bt_members_id, bt_holiday)
          SELECT cbt_date AS bt_date, ? AS bt_members_id, ? AS bt_holiday
          FROM calbdt WHERE ? <= cbt_date AND cbt_date < ?
          ON DUPLICATE KEY UPDATE bt_holiday = ?',
          array($data['bt_members_id'], $data['bt_holiday'], $data['bt_date_start'], $data['bt_date_end'], $data['bt_holiday']));
        /* UPDATE bdtmembers
          SET bt_holiday = ?
          WHERE bt_members_id = ?
            AND ? <= bt_date AND bt_date < ?',
          array($data['bt_holiday'], $data['bt_members_id'], $data['bt_date_start'], $data['bt_date_end'])); */
      } else {
        // $this->db->query('DELETE FROM bdtmembers
        //   WHERE ? <= bt_date AND bt_date < ? AND bt_members_id = ?',
        //   array($data['bt_date_start'], $data['bt_date_end'], $data['bt_members_id']));
        $this->db->query('SELECT @st := day_st_hour FROM wbsctrl;
                SELECT @en := day_en_hour FROM wbsctrl;        
                DELETE FROM bdtmembers
                  WHERE bt_members_id = ? AND CASE (SELECT ignore_cal FROM members WHERE id=?) WHEN 1 THEN  (
                  CASE WHEN (HOUR(?) <= @st && HOUR(?) < @en) THEN (CONCAT(DATE(?), CONCAT(@st, ":00:00")) <= bt_date AND bt_date < ?)
                    WHEN (HOUR(?) >= @st && HOUR(?) < @en) THEN (? <= bt_date AND bt_date < ?)
                    WHEN (HOUR(?) <= @st && HOUR(?) < @en) THEN (? <= bt_date AND bt_date < CONCAT(?, CONCAT(@en, ":00:00")))
                    ELSE (bt_date = ?)
                  END
                  )
                ELSE (? <= bt_date AND bt_date < ? AND bt_members_id = ?) END;', 
                array($data['bt_members_id'], $data['bt_members_id'], $data['bt_date_start'], $data['bt_date_end'], $data['bt_date_start'], $data['bt_date_end'], 
                $data['bt_date_start'], $data['bt_date_end'], $data['bt_date_start'], $data['bt_date_end'], 
                $data['bt_date_start'], $data['bt_date_end'], $data['bt_date_start'], $data['bt_date_end'], 
                $data['bt_date_start'], $data['bt_date_start'], $data['bt_date_end'], $data['bt_members_id']));
      }
    } else {
      $this->db->query('UPDATE calbdt
        SET cbt_holiday = ?
        WHERE ? <= cbt_date AND cbt_date < ?',
        array($data['bt_holiday'], $data['bt_date_start'], $data['bt_date_end']));
    }
    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
  
  }

  /**
   * カレンダー登録　新バージョン 2019/09/13 sono modify 
   */
  public function updatecalendar1()
  {
    $postobj = $this->input->post();
    $data = json_decode($postobj['json'], true);

    $this->db->trans_start();
    if ((int)$data['bt_members_id'] > 0) {
      if ((int)$data['bt_holiday'] === 1) {
        // メンバのカレンダーに休日登録。
        $this->db->query('INSERT INTO bdtmembers (bt_members_id,
        bt_date,
        bt_holiday,
        bt_memo,
        bt_start_hour,
        bt_finish_hour) VALUES(?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE bt_holiday = ?;', 
        array($data['bt_members_id'], $data['bt_date_end'], $data['bt_holiday'], "", $data['bt_start_hour'], $data['bt_finish_hour'], $data['bt_holiday']));

        // $this->db->query('INSERT INTO bdtmembers (bt_date, bt_members_id, bt_date_finish, bt_holiday)
        //   SELECT cbt_date AS bt_date, ? AS bt_members_id, ? AS bt_date_finish, ? AS bt_holiday
        //   FROM calbdt WHERE ? <= cbt_date AND cbt_date < ?
        //   ON DUPLICATE KEY UPDATE bt_holiday = ?',
        //   array($data['bt_members_id'], $data['bt_date_end'], $data['bt_holiday'], $data['bt_datetime_start'], $data['bt_datetime_end'], $data['bt_holiday'] ));
      } else {
        // メンバの休日解除 定時をコントロールから取得
        
        // $this->db->query('SELECT @st := DAY_START FROM ctrltable;
        //         SELECT @en := DAY_FINISH FROM ctrltable;        
        //         DELETE FROM bdtmembers1
        //           WHERE bt_members_id = ? AND CASE (SELECT ignore_cal FROM members WHERE id = ?) WHEN 1 THEN  (
        //           CASE WHEN (HOUR(?) <= @st && HOUR(?) < @en) THEN (CONCAT(DATE(?), CONCAT(@st, ":00:00")) <= bt_date AND bt_date < ?)
        //             WHEN (HOUR(?) >= @st && HOUR(?) < @en) THEN (? <= bt_date AND bt_date < ?)
        //             WHEN (HOUR(?) <= @st && HOUR(?) < @en) THEN (? <= bt_date AND bt_date < CONCAT(?, CONCAT(@en, ":00:00")))
        //             ELSE (bt_date = ?)
        //           END
        //           )
        //         ELSE (? <= bt_date AND bt_date < ? AND bt_members_id = ?) END;', 
        //         array($data['bt_members_id'], $data['bt_members_id'], $data['bt_datetime_start'], $data['bt_datetime_end'], $data['bt_datetime_start'], $data['bt_datetime_end'], 
        //         $data['bt_datetime_start'], $data['bt_datetime_end'], $data['bt_date_start'], $data['bt_datetime_end'], 
        //         $data['bt_datetime_start'], $data['bt_datetime_end'], $data['bt_date_start'], $data['bt_datetime_end'], 
        //         $data['bt_datetime_start'], $data['bt_datetime_start'], $data['bt_datetime_end'], $data['bt_members_id']));
      }
    } else {
      // 社内全体
      $this->db->query('UPDATE calbdt
        SET cbt_holiday = ?
        WHERE ? <= cbt_date AND cbt_date < ?',
        array($data['bt_holiday'], $data['bt_date_start'], $data['bt_date_end']));
    }
    if ($this->db->trans_status() === false) {
      $this->db->trans_rollback();
    } else {
      $this->db->trans_complete();
    }
  
  }

  /**
   * 引数の種類に対応するリーフのモデルを読み込みする
   * 読込モデルは$this->leafより呼び出す
   */
  private function loadLeafModel($leaftype, $dbconn = true)
  {
    switch ($leaftype) {
      case 'PROD_STAFF':
      case 'PROD_EQUIPMENT':
      case 'PROJ':
        $this->load->model('leafprod', 'leaf', $dbconn);
        break;
      case 'SHIP':
        // leafオブジェクトに出荷リーフ情報を与える
        $this->load->model('leafship', 'leaf', $dbconn);
        break;
      // case 'PROD_STAFF_SIM':
      // case 'PROD_EQUIPMENT_SIM':
      // case 'PROJ_SIM':
      //   $this->load->model('leafprod', 'leaf', $dbconn);
      //   $this->leaf->setTable(true);
      //   break;
      // case 'SHIP_SIM':
      //   $this->load->model('leafship', 'leaf', $dbconn);
      //   $this->leaf->setTable(true);
      //   break;
    }
  }

  /**
   * 定時時間設定を@day_st,@day_enについて行う。
   * メンバー指定時には、24時間勤務かどうかを確認して@day_st_member,@day_en_memberに設定する
   */
  private function setDayHourVariable($membersid = null)
  {
    if (isset($membersid)) {
      $this->db->query('SET @day_st_member = (SELECT CASE WHEN members.ignore_cal = 1 THEN -1 ELSE wbsctrl.day_st_hour END AS day_st_hour
        FROM wbsctrl
        LEFT JOIN members ON members.id = ?
        LIMIT 1)', $membersid);
      $this->db->query('SET @day_en_member = (SELECT CASE WHEN members.ignore_cal = 24 THEN -1 ELSE wbsctrl.day_en_hour END AS day_en_hour
        FROM wbsctrl
        LEFT JOIN members ON members.id = ?
        LIMIT 1)', $membersid);
    } else {
      $this->db->query('SET @day_st = (SELECT day_st_hour FROM wbsctrl LIMIT 1)');
      $this->db->query('SET @day_en = (SELECT day_en_hour FROM wbsctrl LIMIT 1)');
    }
  }

  /**
   * ログイン済みの場合、ユーザ情報を返す。
   * ログインしていない場合、処理を強制終了する
   */
  private function checkLoggedIn()
  {
    // $this->load->library('ion_auth');
    // if (!$this->ion_auth->logged_in()) {
    //   exit();
    // }
    // return $this->ion_auth->user()->row();
    $this->load->model('model_users');
    if ($this->session->userdata('is_logged_in') !== 1 || $this->session->userdata('is_logged_in') == null ) {
      // if (!$this->session->userdata('is_logged_in')) {
      exit();
    }
    return $this->session->userdata('usercd');
  }

}
