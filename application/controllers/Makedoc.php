<?php

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

class Makedoc extends CI_Controller {

  public function __construct()
  {
    parent::__construct();
    $this->load->database();
  }

  public function index()
  {

  }
  
  /**
   * 指定リーフについてのデータをExcelファイルに記入して出力する。
   */
  public function leaf()
  {
    $idsarray = $this->input->get('ids');
    $templatefilename = $this->input->get('template');
    date_default_timezone_set('Asia/Tokyo');
    if (count($idsarray) <= 0) {
      exit();
    }
    // leaf_detailsの内容一覧取得
    $this->db->select('*');
    $this->db->from('leaf_details');
    $leaf_details_data = (array)($this->db->get()->result());
    // schedule_detailsの内容一覧取得
    $this->db->select('*');
    $this->db->from('schedule_details');
    $schedule_details_data = (array)($this->db->get()->result());
    $sqldetail = '';
    foreach ($leaf_details_data as $key => $value) {
      switch ($value->coltype) {
        case 'DATE':
          $sqldetail .= 'FROM_UNIXTIME(JSON_EXTRACT(`leafs`.`detail`, \'$.' . $value->colkey . '\')/1000)';
          break;
        default:
          $sqldetail .= 'JSON_UNQUOTE(JSON_EXTRACT(`leafs`.`detail`, \'$.' . $value->colkey . '\'))';
          break;
      }
      $sqldetail .= ' AS leafs_detail_' . $value->colkey . ',';
    }
    foreach ($schedule_details_data as $key => $value) {
      switch ($value->coltype) {
        case 'DATE':
          $sqldetail .= 'FROM_UNIXTIME(JSON_EXTRACT(`schedules`.`detail`, \'$.' . $value->colkey . '\')/1000)';
          break;
        default:
          $sqldetail .= 'JSON_UNQUOTE(JSON_EXTRACT(`schedules`.`detail`, \'$.' . $value->colkey . '\'))';
          break;
      }
      $sqldetail .= ' AS schedules_detail_' . $value->colkey . ',';
    }
    // リーフ情報読み込み
    $this->db->select('
      leafs.id AS leafs_id,
      leafs.detail AS leafs_detail,
      projects.id AS projects_id,
      projects.name AS projects_name,
      projects.start_plan AS projects_start_plan,
      projects.finish_plan AS projects_finish_plan,
      GROUP_CONCAT(`schedules`.`id` ORDER BY `schedules`.`id` ASC) AS `schedules_id`,
      GROUP_CONCAT(`schedules`.`start_plan` ORDER BY `schedules`.`start_plan` ASC) AS `schedules_start_plan`,
      GROUP_CONCAT(`schedules`.`required_time` ORDER BY `schedules`.`required_time` ASC) AS `schedules_required_time`,
      GROUP_CONCAT(`schedules`.`detail` ORDER BY `schedules`.`detail` ASC) AS `schedules_detail`,
      GROUP_CONCAT(`schedule_members`.`id` ORDER BY `schedule_members`.`id` ASC) AS `schedule_members_id`,
      GROUP_CONCAT(`schedule_members`.`requied_roles_id` ORDER BY `schedule_members`.`requied_roles_id` ASC) AS `schedule_members_requied_roles_id`,
      GROUP_CONCAT(`members`.`id` ORDER BY `members`.`id` ASC) AS `members_id`,
      GROUP_CONCAT(`members`.`name` ORDER BY `members`.`name` ASC) AS `members_name`,
      GROUP_CONCAT(`roles`.`id` ORDER BY `roles`.`id` ASC) AS `roles_id`,
      GROUP_CONCAT(`roles`.`name` ORDER BY `roles`.`name` ASC) AS `roles_name`,
      CURDATE() AS file_issued_date, 
    ' . $sqldetail);
    $this->db->from('leafs');
    $this->db->join('schedules', 'schedules.leafs_id = leafs.id', 'left');
    $this->db->join('schedule_members', 'schedule_members.schedules_id = schedules.id', 'left');
    $this->db->join('members', 'members.id = schedule_members.members_id', 'left');
    $this->db->join('roles', 'roles.id = members.roles_id', 'left');
    $this->db->join('projects', 'projects.id = leafs.projects_id', 'left');
    foreach ($idsarray as $key => $value) {
      $this->db->or_where('leafs.id', $value);
    }
    $this->db->group_by('schedules.id');
    $this->db->order_by('schedule_members_requied_roles_id', 'ASC');
    // データを取得、結果がない場合には中断
    $leafs_data = (array)($this->db->get()->result());
    if (count($leafs_data) <= 0) {
      exit('データが見つかりません');
    }
    error_log($this->db->last_query());
    // テンプレートを読み込み
    require 'vendor/autoload.php';
    $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
    $spreadsheet = null;
    try {
      $spreadsheet = $reader->load($_SERVER['DOCUMENT_ROOT'] . '/wbs/assets/' . basename($templatefilename) . '.xlsx');
    } catch (Exception $e) {
      exit('テンプレートファイルの読み込み時にエラーが発生しました');
    }
    // 一時ファイルを作成して出力
    $spreadsheet->setActiveSheetIndexByName('Datasheet');
    $datasheet = $spreadsheet->getActiveSheet();
    $colnum = 2;
    foreach ($leafs_data as $idx => $dat) {
      $rownum = 1;
      foreach ($dat as $key => $value) {
        if ($idx === 0) {
          $datasheet->setcellvaluebycolumnandrow(1, $rownum, $key);
        }
        $datasheet->setcellvaluebycolumnandrow($colnum, $rownum, $value);
        $rownum++;
      }
      $colnum++;
    }
    $spreadsheet->setActiveSheetIndexByName('Sheet');
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="file_' . date('Ymd_His') . '.xlsx"');
    header('Cache-Control: max-age=0');  
    $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
    $writer->save('php://output');
  }
}
