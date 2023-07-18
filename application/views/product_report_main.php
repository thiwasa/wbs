<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?>
<!DOCTYPE html>
<html lang="jp">
<head>
  <meta charset="utf-8">
  <title>製造実績入力用ログインページ</title>
  <link type="text/css" rel="stylesheet" href="<?=base_url();?>assets/css/common.css">
</head>
<body>
  <header></header>
  <div id="container">
    <h1>製造実績報告</h1>
    <?php	echo form_open('schedule/login_validation_product'); ?>    
    <table id="loginitem">
      <tr>
        <td id="infomessage"><?php	echo validation_errors(); ?></td>
      </tr>
      <tr>
        <td id="usercd" placeholder="ユーザーコード">ユーザーコード：<?php	echo form_input('usercd'); ?></td>
      </tr>
      <tr>
        <td id="password" placeholder="パスワード">パスワード：<?php	echo form_password('password');	?></td>
      </tr>
      <tr>
        <td id="login"><?php	echo form_submit('login_submit', 'ログイン'); ?></td>
      </tr>
    </table>    
    <?php	echo form_close(); ?>
  </div>
  <hr>
  <div class="footer">
    Copyright (C) 2018 SysDevLink Corp. All Rights Reserved.
  </div>
</body>
</html>