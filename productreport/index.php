<?php
require_once './login.php';
?>
<!DOCTYPE html>
<html lang="jp">
<head>
  <meta charset="utf-8">
  <title>製造実績詳細登録</title>
  <link rel="stylesheet" href="./css/productreport.css ?>" type="text/css"/>
</head>
<body>
  <header></header>
  <div>
    <h1>製造実績詳細</h1>
    <div id="productPlanNo">製造指示No</div><?php echo h($_SESSION['ppNo']); ?><input id="ppNo" type="text">
    <div>品名</div><input id="pName" type="text">
    <caption>確認項目</caption>
    <div id="tblProcessStatus2"></div>   
      <tr>
        <th>☑</th>
        <th>工程No</th>
        <th>工程名</th>
        <th>G</th>
        <th>分割</th>
        <th>開始予定日</th>
        <th>数量</th>
        <th>予定時間</th>
        <th>実績時間</th>
        <th>作業状態</th>
        <th>詳細報告</th>
      <tr>

    <table id="tblProcessStatus">
      <tr>

      </tr>  
      <!-- <tr>
        <th>Firstname</th>
        <th>Lastname</th> 
        <th>Age</th>
      </tr>
      <tr>
        <td>Jill</td>
        <td>Smith</td>
        <td>50</td>
      </tr>
      <tr>
        <td>Eve</td>
        <td>Jackson</td>
        <td>94</td>
      </tr>
      <tr>
        <td>John</td>
        <td>Doe</td>
        <td>80</td>
      </tr> -->
    </table>
  </div>
  <!-- <div class="footer">
    Copyright (C) 2018 SysDevLink Corp. All Rights Reserved.
  </div> -->
  
  <script src="../../wbsplanner/lib/jquery-2.2.4.min.js"></script>
  <script src="main.js"></script>
  <!-- <script src="main.js ?>"></script> -->
</body>
</html>