<?php
require_once '../login.php';
?>
<!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link href="../lib/jquery-ui-1.11.4.custom/jquery-ui.min.css" rel="stylesheet">
    <link href="./qrscan.css" type="text/css" rel="stylesheet">
    <link href="../dist/css/tabulator.min.css" rel="stylesheet">
    <script src="../lib/jquery-2.2.4.min.js"></script>
    <script src="../lib/jquery-ui-1.11.4.custom/jquery-ui.min.js"></script>
    <script src="../lib/jquery-ui-1.11.4.custom/datepicker-ja.js"></script>
    <script src="../lib/jsqr/jsQR.js"></script><!-- Apache License 2.0 -->
    <script src="../dist/js/tabulator.min.js"></script>
    <title>QRScan</title>
  </head>
  <body>
    <?php if ($_GET['mode'] === 'storage' || $_GET['mode'] === 'accept') { ?>
    <!-- 在庫登録用QR -->
    <div id="contentarea">
      <label hidden id="mode"><?php echo $_GET['mode']; ?></label>
      <label hidden id="orderno"><?php echo $_GET['orderno']; ?></label>
      <div id="gridStock"></div>
      <div id="cameraarea">
        <video id="localVideo" autoplay playsinline></video>
      </div>
      <div>
        <canvas id="snapshot" style="display: none;"></canvas>
      </div>
      <div id="checkresult" style="font-size: small;"></div>
        <audio id="soundok" src="./ok.wav">ブラウザがAudio要素に対応していません</audio>
        <audio id="soundng" src="./ng.wav">ブラウザがAudio要素に対応していません</audio>
      </div>
      <button id="updatestock">データ登録</button>
      <button id="finread">読込終了</button>
    </div>
    <?php } else { ?>
    <!-- 検索用QR  ($_GET['mode'] === 'est' || $_GET['mode'] === 'moed' ) -->
    <div id="contentarea">
      <label hidden id="mode"><?php echo $_GET['mode']; ?></label>
      <div id="cameraarea">
        <video id="localVideo" autoplay playsinline></video>
      </div>
      <div>
        <canvas id="snapshot"></canvas>
      </div>
      <div id="checkresult" style="font-size: small;"></div>
        <audio id="soundok" src="./ok.wav">ブラウザがAudio要素に対応していません</audio>
        <audio id="soundng" src="./ng.wav">ブラウザがAudio要素に対応していません</audio>
      </div>
      <div>
        <button id="finread">読込終了</button>
      </div>
    </div>
    <?php } ?>
    <span>Copyright (C) 2018 SysDevLink Corp. All Rights Reserved.</span>
    <script src="./qsdb.js"></script>
    <script src="./qsmain.js"></script>
    <script src="./camera.js"></script>
  </body>
</html>