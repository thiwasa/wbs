'use strict';

/**
 * @fileOverview QR読込処理メイン
 * @author Mayu Sonoda
 */

/** 音声再生用オブジェクト1 */
let audioObjOK = new Audio('./ok.wav?dt=' + new Date().getTime());// = document.getElementById('soundok');
/** 音声再生用オブジェクト2 */
let audioObjNG = new Audio('./ng.wav?dt=' + new Date().getTime());// = document.getElementById('soundng');

let isContinuousReadOn = false;   // 連続リードモード
const POLL_INTERVAL = 50;         // ポーリング間隔
let arQR = [];                    // 連続リード時の読込済みデータ。IDを保持
let gridStock = '';

/** Ajax通信の設定 */
function setupAjax() {
  $.ajaxSetup({
    'cache': false,
    trycnt: 0,
    // Ajax通信が失敗した場合
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      var self = this;
      // エラーメッセージの表示
      console.log('通信エラー。(' + self.trycnt + '/1)');
      console.log(self['data']);
      console.log(XMLHttpRequest);
      console.log(textStatus);
      console.log(errorThrown);
      self.trycnt++;
      if (self.trycnt <= 1) {
        $.ajax(self);
        return;
      } else {
        console.log('再送中断。');
        window.alert('通信エラー: ' + errorThrown);
      }
      return;
    }
  });
}

/**
 * エラー発生時の処理
 */
window.onerror = function (message, url, lineNumber) {
  // urlが空の場合、警告表示しない
  if (url === '') {
    return;
  }
  // エラー情報を代入
  var errortxt = 'ページでエラーが発生しました。\n\n';
  errortxt += 'Error: ' + message + '\n';
  errortxt += 'Url: ' + url + '\n';
  errortxt += 'Line: ' + lineNumber + '\n';
  // エラーダイアログを表示
  window.alert(errortxt);
  return;
};

/**
 * 開始時の処理。各種データの初回取得処理を行う。
 */
window.onload = function () {
  const mode = document.getElementById('mode').textContent;
  // mode = 'storage';
  if (mode === 'storage') {
    // 複数スキャンモードで起動
    const orderno = document.getElementById('orderno').textContent;
    const updateBtn = document.getElementById('updatestock');

    updateBtn.addEventListener('click', () => {
      // データ登録
      // グリッドからデータ取得して、DBに問い合わせ
      let items = gridStock.getData();
      if (isScanningData(items)) {
        // データ登録して、画面閉じる
        updateMOD(items).then(function (data, textStatus, jqXHR) {
          alert('登録完了しました');
          arQR = [];
          stopVideo();
          window.close();
        });
      } else {
        alert('登録するデータがありません。');
        // スキャンに戻る
        qrAnalysis();
      }
    });

    readMorderestimate(orderno);
    isContinuousReadOn = true;
    startCapture();
  } else if (mode === 'accept') {
    // 複数スキャンモードで起動
    const orderno = document.getElementById('orderno').textContent;
    const updateBtn = document.getElementById('updatestock');

    updateBtn.addEventListener('click', () => {
      // データ登録
      // グリッドからデータ取得して、DBに問い合わせ
      let items = gridStock.getData();
      if (isScanningData(items)) {
        // データ登録して、画面閉じる
        updateMODAccept(items).then(function (data, textStatus, jqXHR) {
          alert('登録完了しました');
          arQR = [];
          stopVideo();
          window.close();
        });
      } else {
        alert('登録するデータがありません。');
        // スキャンに戻る
        qrAnalysis();
      }
    });

    readMorderestimate(orderno);
    isContinuousReadOn = true;
    startCapture();
  } else {
    // mode === 'est'、mode === 'moed' mode === 'sd' も該当 
    // 値が渡らなかった場合シングルスキャンモードで起動
    isContinuousReadOn = false;
    startCapture();
  }
  audioObjOK = document.getElementById('soundok');
  audioObjNG = document.getElementById('soundng');

  // ボタン押下イベント付加  
  let closeBtn = document.getElementById('finread');
  closeBtn.addEventListener('click', () => {
    // 親画面に戻る
    arQR = [];
    stopVideo();
    window.close();
  });
};

/**
 * カメラを起動してキャプチャを開始する。
 */
function startCapture() {
  getMedia().then(() => {
    // カメラ正常起動
    qrAnalysis();
  }).catch(() => {
    alert('カメラが正常起動しませんでした。');
  });
}

/***
 * QRポーリング処理
 */
async function poll() {
  while (true) {
    let qrData = await checkQRData();
    if (qrData !== '') {
      document.getElementById('checkresult').innerHTML = 'QR code:' + qrData.data; 
      return qrData;
    } 
  }
}

/***
 * QR読込後の分析処理
 */
async function qrAnalysis() {
  let qrPoll = await poll();
  if (qrPoll) {
    processQR(qrPoll);
  } else {
    stopVideo();
    alert('データ読込に失敗しました。');
  }
}

/**
 * QRコード読込成功時の処理
 * 同じIDを読み込んだ場合は
 */
function processQR(qrdata) {
  // 親画面の種類で分岐(業務ロジック含むため)
  const mode = document.getElementById('mode').textContent;
  // let mode = 'storage';
  if (mode === 'storage' || mode === 'accept') {
    // 既読かどうか
    // alert(qrdata);
    if (arQR.indexOf(qrdata.qrid) !== -1) {
      qrAnalysis();
      return;
    } else {
      arQR.push(qrdata.qrid);
    }
    // DBに問い合わせ
    readItemData(qrdata.qrid).then(function(data, textStatus, jqXHR) {
      if (data) {
        if (data[0]['MFLG'] === '0') {
          alert('対象ではないQRを読み込みました。');
        } else {
          setQRScanData(data); 
        }
        // スキャンに戻る
        qrAnalysis();
      }
    }).fail(() => {
      alert('データ取得に失敗しました');
      // スキャンに戻る
      qrAnalysis();
    });
  } else if (mode === 'est' || mode === 'moed' || mode === 'sd' || mode === 'ood') {
    // 親画面に戻る
    window.opener.setQRData(lastQR.qrid, mode);
    // 自分を閉じる。
    stopVideo();
    window.close();
  } else {
    alert('画面読込エラーが発生しました');
    stopVideo();
    window.close();
  }
}

/**
 * JSON文字列をオブジェクトに変換する(エラー確認あり)
 * @param {string} str JSON要素として解析する文字列。
 * @return {Object} 成功した場合に内容のオブジェクト、解析できなかった場合にnull
 */
function convertJson(str) {
  let json = null;
  try {
    json = JSON.parse(str)[0];
    return json;
  } catch (error) {
    return null;
  }
}


/***
 * 対象データGrid設定
 */
function defGridStock(data) {
  let listData = [];
  if (data !== '') {
    listData = data;
  }

  gridStock = new Tabulator('#gridStock', {
    data: listData,
    rowFormatter: function(row) {
      var data = row.getData()
      if(data.qr_id !== '') {
        row.getElement().style.backgroundColor = 'blue';
      }
    },
    index: 'qr_lot_no', 
    columns: [
      { field: 'qr_id', title: 'QRID', visible: true,},
      { field: 'qr_p_cd', title: '品名CD', },
      { field: 'p_name', title: '品名', },
      { field: 'qr_sub_01', title: '線径①', hozAlign: 'right', },
      { field: 'qr_sub_12', title: '厚み①', hozAlign: 'right', },
      { field: 'qr_sub_02', title: '線径②', hozAlign: 'right', },
      { field: 'qr_sub_13', title: '厚み②', hozAlign: 'right', },
      { field: 'qr_sub_03', title: '目合区分', },
      { field: 'qr_sub_04', title: 'サイズ①', hozAlign: 'right', },
      { field: 'qr_sub_05', title: 'サイズ②', hozAlign: 'right', },
      { field: 'qr_report_no', title: '発注番号', },
      { field: 'qr_lot_no', title: '社内ロットNo', },
      { field: 'moedqty', title: '数量', hozAlign: 'right', },
      { field: 'qr_unit_eval', title: '単位',  },
      { field: 'qr_remarks', title: '備考',  },
    ],
  });
}

/***
 * スキャン対象のデータ表示
 */
function readMorderestimate(orderno) {
  readMOD(orderno).then(function(data, textStatus, jqXHR) {
    if (data) {
      defGridStock(data);
    }
  });
}

/***
 * スキャンしたQRデータでGridデータを更新
 */
function setQRScanData(qrData) {
  gridStock.updateData([ { qr_id: qrData[0]['qr_id'], qr_lot_no: qrData[0]['qr_lot_no'] }]);
}

/***
 * 入荷検品対象品のうち、確認できた仕入品があるか確認
 */
function isScanningData(data) {
  let cnt = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i]['qr_id'] !== '') {
      ++cnt;
    }
  }
  return cnt ? cnt : 0;
}