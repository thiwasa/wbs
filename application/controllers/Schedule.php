<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Schedule extends CI_Controller {
  
  public function __construct()
  {
    parent::__construct();

    $this->load->helper('form');
    $this->load->library('form_validation');	
    $this->load->model('model_users');
  }
  /**
   * Index Page for this controller.
   */
  public function index()
  {
    // $this->load->library('ion_auth');
    // if (!$this->ion_auth->logged_in()) {
    //   redirect('auth/login');
    // }
    // $this->load->helper('form');
    $this->login();
    // $this->load->view('schedule_screen');
  }

  /**
   * ログインページオープン
   */
	public function login() {
    $this->load->view('login');    
  }

  /**
   * 生産管理ページオープン
   */
  public function schedule_pages() {
    if ($this->session->userdata('is_logged_in')) {
      // ログインできていたら、生産管理のページを開く
      $this->load->view('schedule_screen');
    } else {									
      redirect('schedule/restricted');
    }
  }

  /**
   * ログイン拒否
   */
  public function restricted() {
    $this->load->view('restricted');
  }
  
  /**
   * ログイン　バリデーション
   */
  public function login_validation() {  
    $this->form_validation->set_rules('usercd', 'ユーザー名', 'required');
    $this->form_validation->set_rules('password', 'パスワード', 'required|callback_validate_credentials');	
    if ($this->form_validation->run()) {
      // ログイン許可の場合、データを保持
      $data = array(
        'usercd' => $this->input->post('usercd'),
        'is_logged_in' => 1
      );
      $this->session->set_userdata($data);
      redirect('schedule/schedule_pages');
    } else {
      $this->load->view('login');
    }
  }

  /**
   * ログインデータのコールバック関数
   */
  public function validate_credentials() {		
    $this->load->model('model_users');
    if ($this->model_users->can_log_in()) {
      // ログインできた場合
      return true;
    } else {
      // ログイン不許可
      $this->form_validation->set_message('validate_credentials', 'ユーザー名かパスワードが異なります。');
      return false;
    }
  }

  /**
   * ログアウト
   */
  public function logout() {
    $this->session->sess_destroy();	
    redirect('schedule/login');		
  }

}
