'use strict';

// /**
//  * エラー発生時の処理
//  */
// window.onerror = function (message, url, lineNumber, columnNo, error) {
//   // urlが空の場合、警告表示しない
//   if (url === '') {
//     return;
//   }
//   var errortxt = 'ページでエラーが発生しました。\n\n';
//   errortxt += 'Error: ' + message + '\n';
//   errortxt += 'Url: ' + url + '\n';
//   errortxt += 'Line: ' + lineNumber + '\n';
//   reportMsg(error['stack'] ? error['stack'] : errortxt);
//   window.alert(errortxt);
//   return;
// };

/**
 * 初期化処理
 */
function initReport(ppNo) {
  // 製造指示データ取得
  $data = {
    'postdata': 'getProdplans',
    'sdat': ppNo,
  };
  $.ajax({
    'timeout': 30000,
    'type': 'POST',
    'url': 'dbreport.php',
    'data': $_SESSION['ppNo'],
  }).done(function (data) {
    let obj = JSON.parse(data);
    if (data.length <= 0) {
      alert('データが取得できませんでした。');
      return;
    }
    // リスト表示
    setArrayToGrid(obj,'tblProcessStatus2');
  }).fail(function () {
    alert('データ取得に失敗しました。');
    return;
  });
}


function setArrayToGrid(ar, gridId) {
  let rows = [];
  let table = document.createElement('table');

  for (let i = 0; i < ar.length; i++) {
    let rec = ar[i];
    for (let j = 0; j < rec.length; j++) {
      rows.push(table.insertRow(-1));  // 行の追加
      for (let k = 0; k < rec[0].length; k++) {
        cell = rows[j].insertCell(-1);
        cell.appendChild(document.createTextNode(rec[j][k]));
        // // 背景色の設定
        // cell.style.backgroundColor = "#ddd"; // ヘッダ行以外
      }
    }
  }

  // 指定したdiv要素に表を加える
  document.getElementById(gridId).appendChild(table);
}

window.onload = function () {
  let value = document.getElementById('productPlanNo');
  initReport(value);
}
/***
 * processStatus情報取得
 */
// function getProcessStatus() {
//   let table = document.getElementById('tblProcessStatus');
  
  

// }