<?php
class Upload extends CI_Controller {

  public function __construct()
  {
    parent::__construct();
    $this->load->helper(array('form', 'url'));
    $this->load->database();
  }

  public function index()
  {

  }
  
  /**
   * 書類ファイル等のアップロード処理を実行する(Windows向け)
   */
  public function do_upload()
  {
    $postobj = $this->input->post();
    $prevfilename = basename($_FILES['userfile']['name']);
    $encstr = uniqid() . '.' . pathinfo($prevfilename, PATHINFO_EXTENSION);
    $config['upload_path']          = './uploads/';
    $config['allowed_types']        = '*'; //'gif|jpg|png';
    $config['file_name']            = $encstr;
    $config['max_size']             = 20000;
    $config['max_width']            = 1024;
    $config['max_height']           = 768;
    $this->load->library('upload', $config); // application/libraries/MY_Upload.phpを読込する
    // ファイル名関連付けをattachmentsテーブルに保存
    $this->db->trans_start();
    $tbl = $this->getAttachmentTable($postobj['leaftype']);
    $this->db->query('INSERT INTO `' . $tbl . '` (`l_id`, `actual_filename`, `enc_filename`) VALUES (?, ?, ?)',
      array($postobj['leafsid'], $prevfilename, $encstr)
    );
    error_log($this->db->last_query());
    // ファイル本体のアップロード処理
    if (!$this->upload->do_upload('userfile')) {
      $this->output->set_output('アップロード中にエラーが発生しました:' . $this->upload->display_errors());
      $this->db->trans_rollback();
    } else {
      $data = array('upload_data' => $this->upload->data());
      error_log($this->db->last_query());
      // トランザクションをコミット、または取り消し
      if ($this->db->trans_status() === FALSE) {
        $this->db->trans_rollback();
        $this->output->set_output('アップロード中にエラーが発生しました:' . $this->upload->display_errors());
      } else {
        $this->db->trans_complete();
        $this->output->set_output('ファイルをアップロードしました');
      }
    }
  }

  /**
   * 指定attachments_idのファイルをダウンロードする
   * Todo: リーフ毎の表示制限が必要な場合、関連ファイルへのアクセスも制限する
   */
  public function dlfile($leaftype, $attachmentsid)
  {
    $this->db->select('*');
    $this->db->from($this->getAttachmentTable($leaftype));
    $this->db->where('id', $attachmentsid);
    $attachments_data = (array)($this->db->get()->result());
    $file = './uploads/' . basename($attachments_data[0]->enc_filename);
    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="'
          . mb_convert_encoding($attachments_data[0]->actual_filename, 'SJIS-win', 'UTF-8'). '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
  }

  private function getAttachmentTable($leaftype) {
    switch ($leaftype) {
      case 'PROD_STAFF':
      case 'PROD_EQUIPMENT':
      case 'PROJ':
      case 'PROD_STAFF_SIM':
      case 'PROD_EQUIPMENT_SIM':
      case 'PROJ_SIM':
        return 'attachments_prod';
      // case 'SHIP':
      // case 'SHIP_SIM':
      //   return 'attachments_ship';
      default:
        return null;
    }
  }

}
