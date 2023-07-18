'use strict';

/**
 * @fileOverview 入庫登録データベース通信処理
 * @author Mayu Sonoda
 */


function readMOD(orderno) {
  var dat = {
    'postdata': 'readMOD',
    'orderno': orderno,
  }; 
  return $.ajax({
    timeout: 10000,
    url: 'dbconn.php',
    type: 'POST',
    dataType: 'json',
    data: dat,
  });
}

/***
 * 入庫用　QRデータ取得
 */
function readItemData(qrid) {
  var dat = {
    'postdata': 'readItems',
    'qrid': qrid,
  }; 
  return $.ajax({
    timeout: 10000,
    url: 'dbconn.php',
    type: 'POST',
    dataType: 'json',
    data: dat,
  });
}


function updateMOD(data) {
  var dat = {
    'postdata': 'updateMOD',
    'items': JSON.stringify(data),
  }; 
  return $.ajax({
    timeout: 10000,
    url: 'dbconn.php',
    type: 'POST',
    dataType: 'json',
    data: dat,
  });
}




// /**
//  * 出荷実績をデータベースに登録する
//  * @param {*} lfid 出荷実績テーブルに対応する登録用オブジェクト
//  */
// function askShipLeafInfo(lfid, func) {
//   // DBに登録
//   var dat = {
//     'postdata': 'readWorkQR',
//     'lfid': lfid
//   };
//   isAjaxing = true;
//   $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'qrscandb.php',
//     'data': dat,
//     'success': function (data, dataType) {
//       func(data);
//       isAjaxing = false;
//     },
//     'error': function (XMLHttpRequest, textStatus, errorThrown) {
//       window.alert('通信エラーが発生しました。：' + errorThrown);
//       $('#btn-confirm-all').prop('disabled', false);
//       isAjaxing = false;
//       return;
//     }
//   });
//   return;
// }
// //商品情報を取得
// function askProductsInfo(pcd,lot, func) {
//   // DBに登録
//   var dat = {
//     'postdata': 'readProducts',
//     'pcd': pcd,
//     'lot': lot
//   };
//   isAjaxing = true;
//   $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'qrscandb.php',
//     'data': dat,
//     'success': function (data, dataType) {
//       func(data);
//       isAjaxing = false;
//     },
//     'error': function (XMLHttpRequest, textStatus, errorThrown) {
//       window.alert('通信エラーが発生しました。：' + errorThrown);
//       $('#btn-confirm-all').prop('disabled', false);
//       isAjaxing = false;
//       return;
//     }
//   });
//   return;
// }
// /**
//  * 出荷実績をデータベースに登録する
//  * @param {*} qrs 出荷実績テーブルに対応する登録用オブジェクト
//  */
// function registerWorkResult(qrs) {
//   // DBに登録
//   var dat = {
//     'postdata': 'updateShipWorkResult',
//     'sdatjson': JSON.stringify(qrs),
//     'stfrom': String($('#cbo-from').val()),
//     'stto': String($('#cbo-to').val())
//   };
//   isAjaxing = true;
//   $.ajax({
//     'timeout': 30000,
//     'type': 'POST',
//     'url': 'qrscandb.php',
//     'data': dat,
//     'success': function (data, dataType) {
//       window.alert('登録が完了しました。');
//       $('#btn-confirm-all,#btn-cancel-all').prop('disabled', false);
//       lastResultQRs = [];
//       gridQR.jsGrid('option', 'data', lastResultQRs);
//       gridQR.jsGrid('refresh');
//       $('#txt-result-worker').val('');
//       showDiv('page-title'); // 起動画面
//       isAjaxing = false;
//     },
//     'error': function (XMLHttpRequest, textStatus, errorThrown) {
//       window.alert('通信エラーが発生しました。：' + errorThrown);
//       $('#btn-confirm-all').prop('disabled', false);
//       isAjaxing = false;
//       return;
//     }
//   });
//   return;
// }