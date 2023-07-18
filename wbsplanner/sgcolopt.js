'use strict';

/**
 * @fileOverview SlickGrid用各種列オプション
 * @author Fumihiko Kondo
 */

let gCalcArea = 0;
let gSumSheet = 0;
let gLossWeight = 0;
let gMaterialCost = 0;
let gSumWage = 0;
let gPerCutCost = 0;
let gFactor = 0;
let gDigit = 0;
let gMold1Pitch = 0;
let gMold1Gear = 0;
let gMold1Ctrl = 0;
let gMold2Pitch = 0;
let gMold2Gear = 0;
let gMold2Ctrl = 0;
let gMoldDia1 = 0;
let gMoldOpen1 = 0;
// let gWeaveCD = ''; 
let gWeaveRate = 0;
let gBumpNum = 0;
let gMoldDimension = 0;
let gCustRound = '1';     // 納品書端数処理区分 初期値は四捨五
let bButtonStr = '';


/**
 * 編集不可の入力セル用エディタ
 * @param {*} args 
 */
function DisabledTextEditor(args) {
  var $input;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    $input = $("<INPUT type=text class='editor-text' disabled='disabled' />")
      .appendTo(args['container'])
      .on("keydown.nav", function (e) {
        if (e.keyCode === $['ui']['keyCode']['LEFT'] || e.keyCode === $['ui']['keyCode']['RIGHT']) {
          e.stopImmediatePropagation();
        }
      })
      .focus()
      .select();
  };
  scope['destroy'] = function () {
    $input.remove();
  };
  scope['focus'] = function () {
    $input.focus();
  };
  scope['getValue'] = function () {
    return $input.val();
  };
  scope['setValue'] = function (val) {
    $input.val(val);
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']] || "";
    $input.val(defaultValue);
    $input[0].defaultValue = defaultValue;
    $input.select();
  };
  scope['serializeValue'] = function () {
    return $input.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] = state;
  };
  scope['isValueChanged'] = function () {
    return (!($input.val() === "" && !defaultValue)) && ($input.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($input.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}

/**
 * マスタID/CD入力セル用エディタ(バリデーション処理修正)
 * @param {*} args 
 */
function IdEditor(args) {
  var $input;
  var defaultValue;
  var scope = this;
  scope['init'] = function () {
    $input = $("<INPUT type=text class='editor-text' />")
      .appendTo(args['container'])
      .on("keydown.nav", function (e) {
        if (e.keyCode === $['ui']['keyCode']['LEFT'] || e.keyCode === $['ui']['keyCode']['RIGHT']) {
          e.stopImmediatePropagation();
        }
      })
      .focus()
      .select();
  };
  scope['destroy'] = function () {
    $input.remove();
  };
  scope['focus'] = function () {
    $input.focus();
  };
  scope['getValue'] = function () {
    return $input.val();
  };
  scope['setValue'] = function (val) {
    $input.val(val);
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']] || "";
    $input.val(defaultValue);
    $input[0].defaultValue = defaultValue;
    $input.select();
  };
  scope['serializeValue'] = function () {
    return $input.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] = state;
  };
  scope['isValueChanged'] = function () {
    return (!($input.val() === "" && !defaultValue)) && ($input.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($input.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}


function IdEditorStock(args) {
  let $input;
  let defaultValue;
  let scope = this;
  scope['init'] = function () {
    $input = $("<INPUT type=text class='editor-text' />")
      .appendTo(args['container'])
      .on("keydown.nav", function (e) {
        if (e.keyCode === $['ui']['keyCode']['LEFT'] || e.keyCode === $['ui']['keyCode']['RIGHT']) {
          e.stopImmediatePropagation();
        }
      })
      .focus()
      .select();
  };
  scope['destroy'] = function () {
    $input.remove();
  };
  scope['focus'] = function () {
    $input.focus();
  };
  scope['getValue'] = function () {
    return $input.val();
  };
  scope['setValue'] = function (val) {
    $input.val(val);
  };
  scope['loadValue'] = function (item) {
    defaultValue = item[args['column']['field']] || "";
    $input.val(defaultValue);
    $input[0].defaultValue = defaultValue;
    $input.select();
  };
  scope['serializeValue'] = function () {
    return $input.val();
  };
  scope['applyValue'] = function (item, state) {
    item[args['column']['field']] = state;
  };
  scope['isValueChanged'] = function () {
    return (!($input.val() === "" && !defaultValue)) && ($input.val() != defaultValue);
  };
  scope['validate'] = function () {
    if (args['column']['validator']) {
      var validationResults = args['column']['validator']($input.val(), args['item'], args['column']);
      if (!validationResults['valid']) {
        return validationResults;
      }
    }
    return {
      'valid': true,
      'msg': null
    };
  };
  scope['init']();
}

/**
 * 入力必須項目を確認する
 */
function requiredFieldValidator(value) {
  if (value === null || value === undefined || value === '') {
    return { 'valid': false, 'msg': '入力必須です' };
  } else {
    return { 'valid': true, 'msg': null };
  }
}

/**
 * 整数チェック用バリデーター
 */
function integerValidator(value) {
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*[0-9]+$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '整数を入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}

/**
 * 整数(必須項目)チェック用バリデーター
 */
function integerNNValidator(value) {
  if (value === null || value === undefined || value === '') {
    return { 'valid': false, 'msg': '入力必須です' };
  } else if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*[0-9]+$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '整数を入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}

/**
 * 小数チェック用バリデーター
 */
function decimalValidator(value) {
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*\d+(\.\d{0,1})*$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '小数を入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}


/**
 * 小数チェック用バリデーター
 */
function decimal2Validator(value) {
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*\d+(\.\d{0,2})*$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '小数2桁までの数値を入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}

/**
 * 小数チェック用バリデーター
 */
function decimal3Validator(value) {
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*\d+(\.\d{0,3})*$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '小数3桁までの数値を入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}

/**
 * 小数4桁チェック用バリデーター
 */
function decimal4Validator(value) {
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*\d+(\.\d{0,4})*$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '小数4桁までの数値を入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}

/**
 * 小数2桁(必須項目)チェック用バリデーター
 */
function decimal2NNValidator(value) {
  if (value === null || value === undefined || value === '') {
    return { 'valid': false, 'msg': '入力必須です' };
  } else {
    var regex = /^-*\d+(\.\d{0,2})*$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '小数を入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}



/**
 * 小数4桁(必須項目)チェック用バリデーター
 */
function decimal4NNValidator(value) {
  if (value === null || value === undefined || value === '') {
    return { 'valid': false, 'msg': '入力必須です' };
  } else {
    var regex = /^-*\d+(\.\d{0,4})*$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '小数4桁までの数値を入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}


function decimal41Validator(value) {
  if (!checkDecimalDigit(value, 3, 1)) {
    return { 'valid': false, 'msg': '小数点以下1桁までの数値を入力してください' };
  }
  return { 'valid': true, 'msg': null };
}


function decimal52Validator(value) {
  if (!checkDecimalDigit(value, 3, 2)) {
    return { 'valid': false, 'msg': '小数点以下2桁までの数値を入力してください' };
  }
  return { 'valid': true, 'msg': null };
}

/**
 * 日付チェック用フォーマッター
 */
function dateValidator(value) {
  // YYYY/mm/ddの場合を先に確認
  try {
    if (value == null || value == undefined || value == '') {
      return { 'valid': true, 'msg': null };
    }
    if (String(value).indexOf('/') >= 0) {
      let arr = value.split('/');
      let str = new Date(arr[0], arr[1] - 1, arr[2]);
      if (!str) {
        return { 'valid': false, 'msg': '年月日を入力してください' };
      } else {
        return { 'valid': true, 'msg': null };
      }
    } else {
      //null or 8文字でない or 数値でない場合はfalse
      if (value == null || String(value).length != 8 || isNaN(value)) {
        return { 'valid': false, 'msg': '年月日を入力してください' };
      }
      //年,月,日を取得する
      let y = parseInt(String(value).substr(0, 4));
      let m = parseInt(String(value).substr(4, 2)) - 1;  //月は0～11で指定するため-1しています。
      let d = parseInt(String(value).substr(6, 2));
      let dt = new Date(y, m, d);
      if (y == dt.getFullYear() && m == dt.getMonth() && d == dt.getDate()) {
        return { 'valid': true, 'msg': null };
      } else {
        return { 'valid': false, 'msg': '年月日を入力してください' };
      }
    }
  } catch {
    return { 'valid': false, 'msg': '年月日を入力してください' };
  }
}

/**
 * 日付チェック用フォーマッター 必須入力
 */
function dateNNValidator(value) {
  try {
    if (value === null || value === undefined) {
      return { 'valid': false, 'msg': '必須入力です' };
    }
    if (String(value).indexOf('/') >= 0) {
      let arr = value.split('/');
      let str = new Date(value);
      if (!str) {
        return { 'valid': false, 'msg': '年月日を入力してください' };
      } else {
        return { 'valid': true, 'msg': null };
      }
    } else {
      //null or 8文字でない or 数値でない場合はfalse
      if (value == null || String(value).length != 8 || isNaN(value)) {
        return { 'valid': false, 'msg': '年月日を入力してください' };
      }
      //年,月,日を取得する
      let y = parseInt(String(value).substr(0, 4));
      let m = parseInt(String((value).substr(4, 2) - 1));
      let d = parseInt(String(value).substr(6, 2));
      let dt = new Date(y, m, d);
      if (y == dt.getFullYear() && m == dt.getMonth() && d == dt.getDate()) {
        return { 'valid': true, 'msg': null };
      } else {
        return { 'valid': false, 'msg': '年月日を入力してください' };
      }
    }
  } catch {
    return { 'valid': false, 'msg': '年月日を入力してください' };
  }
}

/**
 * 桁数チェック
 * true:OK
 */
function checkDecimalDigit(value, digitInt, digitDec) {
  if (value == null) {
    return false;
  }
  if (isNaN(value)) {
    return false;
  }
  let regex = /^[0-9]+{1,digitInt}(\.[0-9]+{digitDec})?$ /;
  if (!regex.test(value)) {
    return false;
  }
  return true;

  // if (value !== null && value !== undefined && value !== '') {
  //   var regex = /^-*\d+(\.\d{0,digitDec})*$/;
  //   if (!regex.test(value)) {
  //     return false;
  //   }
  // }
  // return true;
}


/**
 * 単価(必須項目)チェック用バリデーター
 */
function unitPriceValidator(value) {
  if (value === null || value === undefined || value === '' || value === 0) {
    return { 'valid': false, 'msg': '入力必須です' };
  } else {
    var regex = /^-*\d+(\.\d{0,2})*$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '小数2桁までの数値を入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}

/**
 * 百分率チェック 現状100以上があるので使用してない
 * @param {*} value 
 */
function percentValidator(value) {
  if (isSet(value)) {
    var regex = /^-*[0-9]+$/;
    if (!regex.test(value)) {
      return { 'valid': false, 'msg': '整数を入力してください' };
    }
    if (value > 100) {
      return { 'valid': false, 'msg': '100以下で入力してください' }
    }
  }
}

/**
 * ツリー表示用フォーマッタ―
 */
function treeNodeFormatter(row, cell, value, columnDef, dataContext, grid) {
  if (value === null || value === undefined || dataContext === undefined || !grid) { return { 'text': '', 'value': value }; }
  value = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  var spacer = '<span style="display:inline-block;height:1px;width:' + (15 * dataContext['depth']) + 'px"></span>';
  var data = grid.getData().getItems();
  var idx = grid.getData().getIdxById(dataContext.id);
  if (data[idx + 1] && data[idx + 1]['depth'] > data[idx]['depth']) {
    if (dataContext['_collapsed']) {
      //return spacer + ' <span class="toggle expand"></span>&nbsp;' + value;
      return { 'text': spacer + ' <span class="nodeiconbig"></span>&nbsp;' + value, 'value': value };
    } else {
      //return spacer + ' <span class="nodeicon collapse"></span>&nbsp;' + value;
      return { 'text': spacer + ' <span class="nodeiconbig"></span>&nbsp;' + value, 'value': value };
    }
  } else {
    return { 'text': spacer + ' <span class="nodeicon"></span>&nbsp;' + value, 'value': value };
  }
}

/**
 * 整数チェック用フォーマッター
 */
function integerFormatter(row, cell, value, columnDef, dataContext) {
  //var rtn = { 'text': value, 'value': value, 'removeClasses': 'invalid' };
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*[0-9]+$/;
    if (!regex.test(value)) {
      return { 'text': value, 'value': value, 'addClasses': 'invalid' };
    }
  } else {
    return { 'text': '', 'value': '', 'removeClasses': 'invalid' };
  }
  return { 'text': Number(value), 'value': Number(value), 'removeClasses': 'invalid' };
}

/**
 * 小数桁切用フォーマッター
 */
function decimal0Formatter(row, cell, value, columnDef, dataContext) {
  //var rtn = { 'text': value, 'value': value, 'removeClasses': 'invalid' };
  let data = value;
  data = Math.round(value);
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*[0-9]+$/;
    if (!regex.test(value)) {
      return { 'text': data, 'value': data };
    }
  } else {
    return { 'text': '', 'value': '' };
  }
  return { 'text': data, 'value': data };
}

function decimal1Formatter(row, cell, value, columnDef, dataContext) {
  //var rtn = { 'text': value, 'value': value, 'removeClasses': 'invalid' };
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*\d+(\.\d{0,1})*$/;
    if (!regex.test(value)) {
      return { 'text': value, 'value': value, 'addClasses': 'invalid' };
    }
  } else {
    return { 'text': '', 'value': '', 'removeClasses': 'invalid' };
  }
  return { 'text': Number(value).toFixed(1), 'value': Number(value).toFixed(1), 'removeClasses': 'invalid' };
}


/**
 * 指定桁数に小数をキャストして表示用に加工
 * @param {*} dC 
 * @param {*} columnName 
 * @param {*} digit 
 */
function viewDecimal(dC, columnName, digit) {
  if (isSet(dC[columnName])) {
    // データが入っていたら切り上げ＆指定された小数点以下桁数に加工
    let val = WSUtils.decCeil(parseFloat(dC[columnName]), digit);
    val = WSUtils.toPadDecStr(val, digit);
    return {
      'text': val,
      'value': val
    }
  } else {
    return {
      'text': '',
      'value': ''
    }
  }
}

/**
 * 画面用小数データから、整数データ変換
 * @param {*} dC 
 * @param {*} columnName 
 */
function viewInteger(dC, columnName) {
  if (isSet(dC[columnName])) {
    // データが入っていたら小数点以下切り捨て
    let val = WSUtils.decFloor(parseFloat(dC[columnName]), 0);
    if (val === 0) {
      val = '';
    }
    return {
      'text': val,
      'value': val
    };
  } else {
    return {
      'text': '',
      'value': ''
    };
  }
}


/**
 * 小数2桁チェック用フォーマッター
 */
function decimalFormatter(row, cell, value, columnDef, dataContext) {
  //var rtn = { 'text': value, 'value': value, 'removeClasses': 'invalid' };
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*\d+(\.\d{0,2})*$/;
    if (!regex.test(value)) {
      return { 'text': value, 'value': value, 'addClasses': 'invalid' };
    }
  } else {
    return { 'text': '', 'value': '', 'removeClasses': 'invalid' };
  }
  return { 'text': Number(value).toFixed(2), 'value': Number(value).toFixed(2), 'removeClasses': 'invalid' };
}



/**
 * 小数3桁チェック用フォーマッター
 */
function decimal3Formatter(row, cell, value, columnDef, dataContext) {
  //var rtn = { 'text': value, 'value': value, 'removeClasses': 'invalid' };
  if (value !== null && value !== undefined && value !== '') {
    var regex = /^-*\d+(\.\d{0,3})*$/;
    if (!regex.test(value)) {
      return { 'text': value, 'value': value /*, 'addClasses': 'invalid' */ };
    }
  } else {
    return { 'text': '', 'value': '' /*, 'removeClasses': 'invalid'*/ };
  }
  return { 'text': Number(value).toFixed(3), 'value': Number(value).toFixed(3) /*, 'removeClasses': 'invalid'*/ };
}

// function dateFormatter(value, dataContext) {
//   if (value !== null && value !== undefined && value !== '') {
//     if (String(value).indexOf('/') >= 0) {
//       return { 'text': value, 'value': value,};
//     } else {
//       //8文字でない or 数値でない場合はそのまま返す
//       if (String(value).length != 8 || isNaN(value)) {
//         return { 'text': value, 'value': value,};
//       }
//       //年,月,日を取得する
//       let y = parseInt(String(value).substr(0, 4));
//       let m = parseInt(String(value).substr(4, 2)) - 1;  //月は0～11で指定するため-1しています。
//       let d = parseInt(String(value).substr(6, 2));
//       let dt = new Date(y, m, d);
//       if (y == dt.getFullYear() && m == dt.getMonth() && d == dt.getDate()) {
//         let str = String(value).substr(0, 4) + '/' + String((value).substr(4, 2) - 1) + '/' + String(value).substr(6, 2);
//         return { 'text': str, 'value': str, };
//       } else {
//         return { 'text': value, 'value': value, };
//       }
//     }
//   } else {
//     return { 'text': '', 'value': '',};
//   }
// }


// /**
//  * 入荷予定日入力テスト
//  * @param {*} row 
//  * @param {*} cell 
//  * @param {*} value 
//  * @param {*} columnDef 
//  * @param {*} dataContext 
//  */
// function changeDeliveryDate(row, cell, value, columnDef, dataContext) {
//   const data = editPGs.pgMOD.d.dataView.getItems();
//   const hdDate = dateFormatter(value, dataContext);
//   data.forEach((elem, i) => {
//     elem['moed_arrival_plan_date'] = value;
//     editPGs.pgMOD.d.grid.invalidateRow(i);
//   })
//   editPGs.pgMOD.d.grid.render();
//   return hdDate;
// }


function dateFormatter(value, dataContext) {
  if (value !== null && value !== undefined && value !== '') {
    if (String(value).indexOf('/') >= 0) {
      return { 'text': value, 'value': value, };
    } else {
      //8文字でない or 数値でない場合はそのまま返す
      if (String(value).length != 8 || isNaN(value)) {
        return { 'text': value, 'value': value, };
      }
      //年,月,日を取得する
      let y = parseInt(String(value).substring(0, 4));
      let m = parseInt(String(value).substring(4, 6)) - 1;  //月は0～11で指定するため-1しています。
      let d = parseInt(String(value).substring(6, 8));
      let dt = new Date(y, m, d);
      if (y == dt.getFullYear() && m == dt.getMonth() && d == dt.getDate()) {
        let str = String(value).substring(0, 4) + '/' + String(value).substring(4, 6) + '/' + String(value).substring(6, 8);
        return { 'text': str, 'value': str, };
      } else {
        return { 'text': value, 'value': value, };
      }
    }
  } else {
    return { 'text': '', 'value': '', };
  }
}

/**
 * 整理年月に年を追加
 * @param {*} value 
 * @param {*} dataContext 
 */
function monthFormatter(value, dataContext) {
  if (!isSet(value)) {
    // 現在の年を取得
    let dDate = new Date();
    var year = dDate.getFullYear();
    let str = String(year).substr(0, 2) + value;
    return { 'text': str, 'value': str, }
  } else {
    return { 'text': '', 'value': '', };
  }
}


/**
 * 文字列を時刻表示にフォーマット
 * @param {*} value 
 * @param {*} dataContext 
 */
function timeFormatter(value, dataContext) {
  if (isSet(value)) {
    // 基本的にはDB読込が対象なので、このエラーにひっかかることはない
    if (String(value).length != 4 || isNaN(value)) {
      return { 'text': value, 'value': value, };
    }
    // 時間を取得
    let h = String(value).substring(0, 2);
    let m = String(value).substring(2, 4);
    let strTime = h + ':' + m;
    return { 'text': strTime, 'value': strTime, };
  } else {
    return { 'text': '', 'value': '', };
  }
}

// /**
//  * 金網指図用の面積計算
//  * @param {*} dC 
//  * @param {*} columnName 
//  */
// function calcPWDimension(dC, columnName) {
//   let val = dC[columnName];
//   if (!isSet(dC['pw_ed_sub_08']) || !isSet(dC['pw_ed_sub_09']) || !isSet(dC['pw_quantity'])) {
//     dC[columnName] = 0;
//     return {
//       'text': 0,
//       'value': 0,
//     };
//   }
//   val = (Number(dC['pw_ed_sub_08']) * 10) * (Number(dC['pw_ed_sub_09']) * 10) * dC['pw_quantity'];
//   val = val / (10 ** 6);
//   val = WSUtils.decRound(val, 2) / (10 ** 2);
//   val = WSUtils.toPadDecStr(val, 2);
//   dC[columnName] = val;
//   return {
//     'text': val,
//     'value': val,
//   };
//   // let num = (Number(dC['pw_ed_sub_08']) * 10) * (Number(dC['pw_ed_sub_09']) * 10) * dC['pw_quantity'] / 100000000;
//   // return { 'text': String(num.toFixed(2)), 'value': num.toFixed(2), };
// }

/**
 * 出荷引当数表示
 * gridロードの方が早くgridの表示コントロールがデータセット側では難しいので一旦DB取得をコードから外すが、可能な方法が分かれば生かす。
 * データ自体は、こちらの関数で取得できることを確認済み
 * 
 * @param {*} row 
 * @param {*} cell 
 * @param {*} value 
 * @param {*} columnDef 
 * @param {*} dataContext 
 */
function checkStockFormatter(row, cell, value, columnDef, dataContext) {
  let data = value;
  let dbData = 0;
  if (isSet(value) || value > 0) {
    data = Math.round(value);
  } else {
    data = 0;
    return { 'text': dbData, 'value': dbData, 'removeClasses': 'invalid' };
  }
  if (data >= Number(dataContext['sd_estimate_quantity'])) {
    return { 'text': data, 'value': data, 'removeClasses': 'invalid' };
  } else {
    return { 'text': data, 'value': data, 'addClasses': 'invalid' };
  }
  // DBに最新データ問い合わせ
  // ajaxCheckShippingAssign(dataContext).done( function (ajaxData, textStatus, jqXHR) {
  //   if (ajaxData > 0 && isSet(ajaxData) & isNaN(ajaxData)) {
  //     // データがあったら表示
  //     dbData = Number(ajaxData);
  //     if (dbData >= Number(dataContext['sd_estimate_quantity']) ) {
  //       // 出荷可能
  //       return { 'text': dbData, 'value': dbData, 'removeClasses': 'invalid' };
  //     } else {
  //       // 引当不足
  //       return { 'text': dbData, 'value': dbData, 'addClasses': 'invalid' };
  //     }
  //   } else {
  //     if (data >= Number(dataContext['sd_estimate_quantity'])) {
  //       // 引当済み
  //       return { 'text': data, 'value': data, 'removeClasses': 'invalid' };
  //     } else {
  //       // 未引当
  //       return { 'text': data, 'value': data, 'addClasses': 'invalid' };
  //     }
  //   }
  // }).fail( function (ajaxData, textStatus, jqXHR) {
  //   return { 'text': data, 'value': data, 'removeClasses': 'invalid' };
  // });
}

/**
 * 合計値表示フッター用関数
 */
function sumJPYFooter(columnId, grid, dataView) {
  var c = grid.getColumns()[grid.getColumnIndex(columnId)];
  var data = dataView.getItems();
  var total = 0;
  var i = data.length;
  while (i--) {
    total += parseFloat(data[i][columnId]) || 0;//(parseInt(data[i][columnId], 10) || 0);
  }
  return '合計:' + toJPY(total);
}

/**
 * 合計値表示フッター用関数(小数2桁)
 */
function sumDecimalJPYFooter(columnId, grid, dataView) {
  var c = grid.getColumns()[grid.getColumnIndex(columnId)];
  var data = dataView.getItems();
  var total = 0;
  var i = data.length;
  while (i--) {
    total += parseFloat(data[i][columnId]) || 0;//(parseInt(data[i][columnId], 10) || 0);
  }
  return '合計:' + toDecimalJPY(total);
}

/**
 * 合計値表示フッター用関数 面積(小数2桁)
 */
function sumDecimalFooter(columnId, grid, dataView) {
  var c = grid.getColumns()[grid.getColumnIndex(columnId)];
  var data = dataView.getItems();
  var total = 0;
  var i = data.length;
  var nArea = 0;
  while (i--) {
    // 見積明細の面積のみが計算対象のため、固定カラム名でセット
    if (isSet(data[i]['ed_sub_08']) && isSet(data[i]['ed_sub_09'] && isSet(data[i]['ed_quantity']))) {
      nArea = data[i]['ed_sub_08']  * data[i]['ed_sub_09'] * data[i]['ed_quantity'];
      nArea = nArea / 1000000;
      nArea = Math.round(nArea * 100) / 100;
      total += nArea;
    } 
  }
  return '合計:' + total.toFixed(2);
}

/***
 * 合計値　受注数量
*/
function sumIntFooter(columnId, grid, dataView) {
  var c = grid.getColumns()[grid.getColumnIndex(columnId)];
  var data = dataView.getItems();
  var total = 0;
  var i = data.length;
  while (i--) {
    total = (total * 100 + parseFloat(data[i][columnId]) * 100) / 100 || 0;//(parseInt(data[i][columnId], 10) || 0);
  }
  return '合計:' + total;
}

/**
 * 製造指示　検査数セット
 */
function inspectionNum() {
  let datHeader = editPGs.pgProdplans.h.dataView.getItems();
  let datDetail = editPGs.pgProdplans.d.dataView.getItems();
  // 検査基準はdefault：1
  let insNumber = 1;
  if (isSet(datHeader[0]['pp_ins_level'])) {
    // 検査基準があればセット
    insNumber = datHeader[0]['pp_ins_level'];
  }
  let str = 'ins_level_' + ('00' + Number(insNumber)).slice(-2);
  if (datDetail.length === 0) {
    return;
  }
  for (let i = 0; i < datDetail.length; i++) {
    let value = getMasterValue(str, 'inspection', '000-' + WSUtils.decCeil(datDetail[i]['pd_ed_quantity'], 0));
    datDetail[i]['pd_ins_num'] = value;
    // 明細更新
    editPGs.pgProdplans.d.grid.invalidateRow(i);
  }
  editPGs.pgProdplans.d.grid.render();
}

function setDeliveryQty(r, c, v, cD, dC) {
  let estQty = dC['sd_estimate_quantity'];
  if (!isSet(dC['sd_qty_delivery'])) {
    dC['sd_qty_delivery'] = estQty;
    return {
      text: dC['sd_estimate_quantity'], 
      value: dC['sd_estimate_quantity'],
    };
  }
  if (dC['sd_estimate_quantity'] != v) {
    dC['sd_qty_delivery'] = v;
    return {
      text: v,
      value: v,
    };
  } else {
    dC['sd_qty_delivery'] = estQty;
    return {
      text: dC['sd_estimate_quantity'], 
      value: dC['sd_estimate_quantity'],
    };
  }
}

/**
 * 日本円表示に変換する
 * @param {*} value 金額
 */
function toJPY(value) {
  return OSREC.CurrencyFormatter.format(value, { 'currency': 'JPY', 'symbol': '', 'valueOnError': '-' });
}

/**
 * 日本円表示フォーマッター
 * @param {*} value 金額
 */
function toJPYFormatter(row, cell, value, columnDef, dataContext) {
  return {
    'text': OSREC.CurrencyFormatter.format(value, { 'currency': 'JPY', 'symbol': '', 'valueOnError': '-' }),
    'value': Number(value)
  };
}

// 金額と面積の合計を求めてヘッダに表示
function setHeaderSUM(columnId, grid, dataView, digit) {
  var data = dataView.getItems();
  var total = 0;
  var i = data.length;
  var nArea = 0;
  var nPrice = 0;
  while (i--) {
    if (columnId === 'ed_sub_num_01') {
      if (isSet(data[i]['ed_sub_08']) && isSet(data[i]['ed_sub_09']) && isSet(data[i]['ed_quantity'])) {
        nArea = (data[i]['ed_sub_08'] / 1000) * (data[i]['ed_sub_09'] / 1000) * data[i]['ed_quantity'];
        total += nArea;
      }
    } else {
      nPrice = (isSet(data[i][columnId]) && !isNaN(data[i][columnId])) ? data[i][columnId] : 0;
      total += parseFloat(nPrice) * 100 / 100;
    }
    // total = (total * 100 + parseFloat(data[i][columnId]) * 100) / 100 || 0;
    // total += parseFloat(data[i][columnId]);
  }
  return total.toFixed(digit);
}

/**
 * 正味㎡と合計枚数計算 レコード変更イベントで発生
 * @param {*} dataView 
 */
function calcSUMArea(dataView) {
  // 受注数→正味㎡、合計枚数、ロス含む㎡
  // 数量入力イベントなので、数量は必ず何らかの値が入っている
  let arData = [];
  let totalArea = 0;
  let totalSheet = 0;
  let totalAreaIncLoss = 0;
  let items = dataView.getItems();

  for (let i = 0; i < items.length; i++) {
    // 単位は0.1mmのみ考慮。m単位に換算 
    // ※正味㎡は、修正の時はレコードデータも修正が必要
    // 正味㎡@1レコード
    let value = (items[i]['ecd_ed_sub_08'] * items[i]['ecd_ed_sub_09']) * (10 ** (-6)) * items[i]['ecd_quantity'];
    totalArea += WSUtils.decCeil(value, 2);
    // ロス含む㎡
    value = 0;
    value = items[i]['ecd_loss_area'];
    totalAreaIncLoss += WSUtils.decCeil(value, 2);
    totalSheet += Number.parseFloat(items[i]['ecd_quantity']);
  }
  arData[0] = WSUtils.toPadDecStr(totalArea, 2);
  arData[1] = WSUtils.toPadDecStr(totalSheet, 0);
  arData[2] = WSUtils.toPadDecStr(totalAreaIncLoss, 2);
  return arData;
}


/**
 * ロス含む重量計算
 * @param {*} dC 
 * @param {*} columnName 
 */
function calcLossWeight(dC, columnName) {
  if (!isSet(dC['ec_loss_area']) || !isSet(dC['ec_area_weight'])) {
    // ロス含む㎡と㎡重量が算出されてなければ戻る
    dC[columnName] = 0;
    return {
      'text': 0,
      'value': 0
    };
  }
  // 負の数が入る場合があるので、あえて有効桁数はパースしない
  let num = Number.parseFloat(dC['ec_loss_area']) * Number.parseFloat(dC['ec_area_weight']) * (dC['ec_loss_rate'] / 100);
  let val = WSUtils.decCeil(num, dC['ec_w_digits']);

  // 材料費と工賃費が変わる
  dC['ec_material_cost'] = dC['ec_material_unit_cost'] * val;
  dC['ec_calc_wage'] = dC['ec_wage'] * val;
  dC[columnName] = WSUtils.toPadDecStr(val, 1);
  return {
    'text': dC[columnName],
    'value': dC[columnName]
  };

}


/**
 * 切断合計金額計算
 * @param {*} dataView 
 */
function calcSUMCutCost(dataView) {
  let items = dataView.getItems();
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += Number.parseInt(items[i]['ecd_cut_cost']);
  }
  return toJPY(total);
}

/**
 * 単価金額合計　レコード編集イベントで発生
 * @param {*} dataView 
 */
function setECDPriceSUM(dataView) {
  let items = dataView.getItems();
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    let value = 0;
    if (Number(items[i]['ecd_fix_unit_cost']) > 0) {
      // 修正単価が優先
      value = Number.parseInt(items[i]['ecd_fix_unit_cost']) * Number.parseInt(items[i]['ecd_quantity']);
    } else {
      if (Number.parseInt(items[i]['ecd_proc_cost']) > 0) {
        value = Number.parseInt(items[i]['ecd_proc_cost']) * Number.parseInt(items[i]['ecd_quantity']);
      }
    }
    total += value;
  }
  return toJPY(total);
}

function setFactor(dataView) {

}

/**
 * 日本円表示フォーマッター
 * @param {*} value 金額
 */
function toJPYDec0Formatter(row, cell, value, columnDef, dataContext) {
  value = Math.round(value);
  return {
    'text': OSREC.CurrencyFormatter.format(value, { 'currency': 'JPY', 'symbol': '', 'valueOnError': '-' }),
    // 'value': Number(value)
    'value': Math.round(value)
  };
}
/**
 * 日本円表示に変換する
 * @param {*} value 金額
 */
function toDecimalJPY(value) {
  return OSREC.CurrencyFormatter.format(value, { 'currency': 'JPY', 'symbol': '', 'pattern': '#,##0.00', 'valueOnError': '-' });
}

/**
 * 日本円表示フォーマッター(小数2桁)
 * @param {*} value 金額
 */
function toDecimalJPYFormatter(row, cell, value, columnDef, dataContext) {
  if (!isSet(value)) {

    return {
      'text': 0,
      'value': 0,
    };
  }
  return {
    'text': OSREC.CurrencyFormatter.format(value, { 'currency': 'JPY', 'symbol': '', 'pattern': '#,##0.00', 'valueOnError': '-' }),
    'value': Number(value)
  };
}

/**
 * 日本円表示フォーマッター(小数2桁)
 * @param {*} value 金額
 */
function toDecimal3JPYFormatter(row, cell, value, columnDef, dataContext) {
  return {
    'text': OSREC.CurrencyFormatter.format(value, { 'currency': 'JPY', 'symbol': '', 'pattern': '#,##0.000', 'valueOnError': '0' }),
    'value': Number(value)
  };
}

/**
 * 受注区分を自動設定
 */
function setAcceptED(dC, columnName) {
  if (isSet(dC['e_estimate_date'])) {
    dC[columnName] = '済';
    return {
      'text': dC[columnName],
      'value': dC[columnName]
    };
  } else {
    dC[columnName] = '未';
    return {
      'text': dC[columnName],
      'value': dC[columnName]
    };
  }
}

// /**
//  * 見積書番号フォーマッター
//  * @param {*} row 
//  * @param {*} cell 
//  * @param {*} value 
//  * @param {*} columnDef 
//  * @param {*} dataContext 
//  */
// function setEstimateNoFormatter(row, cell, value, columnDef, dataContext) {
//   if (dC['e_customer_cd'] == null || dC['e_estimate_date'] == null) {
//     // 受注日か客先CDが入っていない
//     return '';
//   }
//   // 受注日
//   let strDate = getSerialToStrDate(dC['e_estimate_date']);
//   strDate = strDate + dC['e_customer_cd'];
//   if (!String(value).indexOf(strDate)) {
//     // 見積日の変更以外は更新しない
//     return value;
//   }
//   // 採番済みの最大値取得
//   getEstimateNo(strDate).done(function(data, textStatus, jqXHR) {
//     let serialNo = '01';
//     // 現在の番号
//     if (!data.length) {
//       serialNo = '01';
//     } else {
//       let num = data[0]['maxno'].slice(9);
//       serialNo = ('00' + (Number(num) + 1)).slice(-2);
//     }
//     dC['e_estimate_no'] = strDate + serialNo;
//     return {
//       'text': strDate + serialNo,
//       'value': strDate + serialNo
//     }
//   });
// }

/**
 * 計算結果表示用フォーマッター
 */
function calcFormatter(dC, colField, mval) {
  // 2023/6/29不具合：以下コメントを外した状態で「2.3×5600=12,880」となるはずが、「2.3×5600=12,879」となってしまう。
  // 2023/5/26修正：小数点以下切り捨て
  // if (isSet(mval)) {
  //   mval = Math.floor(mval);
  // }
  dC[colField] = mval;
  return { 'text': mval, 'value': mval };
}

/**
 * 受注用単位面積計算
 * @param {*} dC 
 * @param {*} columnName 
 */
function calcEstAreaFormatter(dC, columnName) {
  let vData = 0;
  let area = 0;
  // 面積@1つ
  let val = dC['ed_sub_08'] * dC['ed_sub_09'];
  if (isSet(dC['ed_quantity'])) {
    vData = val / 1000000 * dC['ed_quantity'];
    area = WSUtils.decRound(vData, 2);
    area = WSUtils.toPadDecStr(area, 2);
  }
  if (!isSet(dC['ed_sub_08']) || !isSet(dC['ed_sub_09']) || !isSet(dC['ed_quantity'])) {
    // 寸法もしくは受注数が入ってない場合
    dC[columnName] = '';
    return { 'text': '', 'value': '' };
  }
  dC[columnName] = area;
  return { 'text': area, 'value': area };
}


/***
 * 金網指示画面用面積計算
 * mode: 0:数量の考慮無し、1:数量の考慮有り
 */
function calcPwAreaFormatter(dC, columnName, mode) {
  let tempDimension = 0;
  let dimension = 0;
  let roundData = 0;
  let sub08 = 0;
  let sub09 = 0;
  let qty = 0;

  sub08 = dC['pw_ed_sub_08'] ? dC['pw_ed_sub_08'] : 0;
  sub09 = dC['pw_ed_sub_09'] ? dC['pw_ed_sub_09'] : 0;
  qty = dC['pw_quantity'] ? dC['pw_quantity'] : 0;

  tempDimension = sub08 * sub09;

  if (mode) {
    // 数量を計算に入れる
    dimension = tempDimension * qty / 1000000;
  } else {

    dimension = tempDimension / 1000000;
  }

  roundData = decRound(dimension, 2);

  // ヘッダの合計値を変更

  dC[columnName] = roundData;
  return { 'text': roundData, 'value': roundData };
}


/***
 * 小数データの値を丸める。
 * lengthは、小数点以下何桁かを指定。
 */
function decRound(num, length) {
  if (!num) {
    return 0;
  }

  let roundData = WSUtils.decRound(num, length);
  let result = WSUtils.toPadDecStr(roundData, length);
  return result;
}


/**
 * ロス含む㎡
 * @param {*} v 
 * @param {*} dC 
 */
function calcPlusLossAreaFormatter(v, dC) {
  if (!isSet(dC['ec_loss_rate'])) {
    return { 'text': '', 'value': '' };
  }
  let num = (Number(dC['ec_calc_area']) * (1 + Number(dC['ec_loss_rate']) / 100)) * 100;
  num = (Math.ceil(num) / 100).toFixed(2);
  return { 'text': num, 'value': num };
}

/**
 * チェックマーク表示用フォーマッター
 */
function checkmarkFormatter(row, cell, value, columnDef, dataContext) {
  
  if (value) {
    return '<input type="checkbox" name="" value="' + value + '" checked />';
  } else {
    return '<input type="checkbox" name="" value="' + value + '" />';
  }
}

// function checkboxFormatter (row, cell, value, columnDef, dataContext)
// {
//   if (value) {
//     return '<input type="checkbox" name="" value="'+ value +'" checked />';
//   } else {
//     return '<input type="checkbox" name="" value="' + value + '" />';
//   }
// }

/**
 * ドロップリストセル用フォーマッター
 */
function SelectCellFormatter(row, cell, value, columnDef, dataContext) {
  var descriptionIdx = -1;
  if (columnDef) {
    descriptionIdx = columnDef['options'].findIndex(function (elem) {
      return elem['key'] === value;
    });
  }
  return {
    'text': descriptionIdx >= 0 ? value + ':' + columnDef['options'][descriptionIdx]['val'] : (value ? value : ''),
    'value': value
  };
}

function SelectCellFormatterValue(row, cell, value, columnDef, dataContext) {
  var descriptionIdx = -1;
  if (columnDef) {
    descriptionIdx = columnDef['options'].findIndex(function (elem) {
      return elem['key'] === value;
    });
  }
  return {
    'text': descriptionIdx >= 0 ? columnDef['options'][descriptionIdx]['val'] : '',
    'value': value
  };
}


function AutoCompleteEditor(args) {
  var $input;
  var defaultValue;
  var scope = this;
  var calendarOpen = false;

  this.keyCaptureList = [Slick.keyCode.UP, Slick.keyCode.DOWN, Slick.keyCode.ENTER];

  this.init = function () {
    $input = $("<INPUT id='tags' class='editor-text' />");
    $input.appendTo(args.container);
    $input.focus().select();

    $input.autocomplete({
      source: args.column.dataSource
    });
  };

  this.destroy = function () {
    $input.autocomplete("destroy");
    $input.remove();
  };

  this.focus = function () {
    $input.focus();
  };

  this.loadValue = function (item) {
    defaultValue = item[args.column.field];
    $input.val(defaultValue);
    $input[0].defaultValue = defaultValue;
    $input.select();
  };

  this.serializeValue = function () {
    return $input.val();
  };

  this.applyValue = function (item, state) {
    item[args.column.field] = state;
  };

  this.isValueChanged = function () {
    return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
  };

  this.validate = function () {
    return {
      valid: true,
      msg: null
    };
  };

  this.init();
}


/**
 * データ初期値をセット default:0
 * @param {*} row 
 * @param {*} cell 
 * @param {*} value 
 * @param {*} columnDef 
 * @param {*} dataContext 
 */
function SelectCellFormatterStart(row, cell, value, columnDef, dataContext) {
  var descriptionIdx = -1;
  console.log('SelectCellFormatterStart : ' + columnDef);
  console.log('SelectCellFormatterStart : ' + value);
  if (columnDef) {
    descriptionIdx = columnDef['options'].findIndex(function (elem) {
      return elem['key'] === value;
    });
  }
  return {
    'text': descriptionIdx >= 0 ? columnDef['options'][descriptionIdx]['val'] : columnDef['options']['0']['val'],
    'value': value
  };
}


/***
 * 単位マスタから単位データを取得してドロップダウンボックスにセット
 */
function selectCellUnitFormatter(row, cell, value, columnDef, dataContext) {
  var descriptionIdx = '';
  if (value === null || value === '') {
    value = '';
    return value;
  }
  if (columnDef) {
    Object.keys(master['unit']).forEach(function (key) {
      if (this[key]['u_cd'] === value) {
        descriptionIdx = key;
      }
    }, master['unit']);
  }
  return {
    'text': descriptionIdx != '' ? master['unit'][descriptionIdx]['u_name'] : (value ? value : ''),
    'value': value
  };
}

function selectCellArrangeFormatter(row, cell, value, columnDef, dataContext) {
  var descriptionIdx = -1;
  var nIndex = -1;
  if (columnDef) {
    Object.keys(master['arrangement']).forEach(function (key) {
      if (this[key]['ar_sub_cd'] === value) {
        nIndex = key.substring(4);
        descriptionIdx = key;
      }
    }, master['arrangement']);
  }
  // このタイミングで初回描画完了とする
  estimateArrangement.isFirstRenderFinished = true; // 見積書画面の加工内容
  morderestimateArrangement.isFirstRenderFinished = true // 発注書画面の加工内容
  return {
    'text': nIndex >= 0 ? master['arrangement'][descriptionIdx]['ar_name'] : (value ? value : ''),
    'value': value
  };
}

function selectCellParrangeFormatter(row, cell, value, columnDef, dataContext) {
  let descriptionIdx = -1;
  let nIndex = -1;
  if (columnDef) {
    Object.keys(master['parrangement']).forEach(function (key) {
      if (this[key]['par_cd'] === value) {
        nIndex = key.substring(4);
        descriptionIdx = key;
      }
    }, master['parrangement']);
  }
  // このタイミングで初回描画完了とする
  estimateParrangement.isFirstRenderFinished = true; // 見積書画面の製品手配方法
  return {
    'text': nIndex >= 0 ? master['parrangement'][descriptionIdx]['par_name'] : (value ? value : ''),
    'value': value
  };
}

function selectCellManufactureFormatter(row, cell, value, columnDef, dataContext) {
  var descriptionIdx = -1;
  if (columnDef) {
    if (master['manufacture'] !== undefined) {
      Object.keys(master['manufacture']).forEach(function (key) {
        if (this[key]['mn_cd'] === value) {
          descriptionIdx = key;
        }
      }, master['manufacture']);
    }
  }
  return {
    'text': descriptionIdx >= 0 ? value + ':' + master['manufacture'][descriptionIdx]['mn_name'] : (value ? value : ''),
    'value': value
  };
}


function selectCellTransportCompanyFormatter(row, cell, value, columnDef, dataContext) {
  var descriptionIdx = -1;
  if (columnDef) {
    if (master['transportcompany'] !== undefined) {
      Object.keys(master['transportcompany']).forEach(function (key) {
        if (this[key]['tc_short_name'] === value) {
          descriptionIdx = key;
        }
      }, master['transportcompany']);
    }
  }
  return {
    'text': descriptionIdx >= 0 ? value + ':' + master['transportcompany'][descriptionIdx]['tc_short_name'] : (value ? value : ''),
    'value': value
  };
}

/**
 * 勤務形態マスタのフォーマッタ
 * @param {*} row 
 * @param {*} cell 
 * @param {*} value 
 * @param {*} columnDef 
 * @param {*} dataContext 
 */
function selectCellIgnoreFormatter(row, cell, value, columnDef, dataContext) {
  var descriptionIdx = -1;
  if (columnDef) {
    Object.keys(master['wbsctrl']).forEach(function (key) {
      if (this[key]['id'] === value) {
        descriptionIdx = key;
      }
    }, master['wbsctrl']);
  }
  return {
    'text': descriptionIdx >= 0 ? value + ':' + master['wbsctrl'][descriptionIdx]['name'] : (value ? value : ''),
    'value': value
  };
}

function selectCellWarehouseFormatter(row, cell, value, columnDef, dC) {
  let descriptionIdx = '';
  if (columnDef) {
    Object.keys(master['warehouse']).forEach(function (key) {
      if (this[key]['w_cd'] === value) {
        descriptionIdx = key;
      }
    }, master['warehouse']);
  }
  return {
    'text': descriptionIdx ? (master['warehouse'][descriptionIdx]['w_name']) : (value ? value : ''),
    'value': value
  };
}


/***
 * 品名分類①用
 */
function selectCellPRC01Formatter(row, cell, value, columnDef, dataContext) {
  var descriptionIdx = '';
  if (value === null || value === '') {
    value = '';
    return value;
  }
  if (columnDef) {
    Object.keys(master['productcategory']['prc_cd']).forEach(function (key) {
      if (this[key]['prc_cat_01_cd'] === value) {
        descriptionIdx = key;
      }
    }, master['productcategory']);
  }
  return {
    'text': descriptionIdx != '' ? master['productcategory'][descriptionIdx]['prc_name'] : (value ? value : ''),
    'value': value
  };
}

/**
 * 色表示用フォーマッター
 */
function colorFormatter(row, cell, value, columnDef, dataContext) {
  return {
    'text': value ? '<div style="width:100%;height:100%;background-color:' + value.slice(0, 7) + '"></div>' : '',
    'value': value
  };
}

function decimalGridFormatter(v, colField, dC,) {
  if (!dC[colField]) {
    return { 'text': '', 'value': '', 'removeClasses': 'invalid' };
  }
  if ((dC[colField].length === 5) && (dC[colField].indexOf('.') === -1)) {
    // DBデータ表示
    dC[colField] = (Number(dC[colField]) / 10).toFixed(1);
    return { 'text': dC[colField], 'value': dC[colField] };
  } else {
    var regex = /^-*\d+(\.\d{0,1})*$/;
    if (!regex.test(dC[colField])) {
      return { 'text': dC[colField], 'value': dC[colField], 'addClasses': 'invalid' };
    }
    return { 'text': Number(dC[colField]).toFixed(1), 'value': Number(dC[colField]).toFixed(1), 'removeClasses': 'invalid' };
  }
}


/**
 * 未登録のdecimalデータを0から空文字に変更
 * @param {*} dC 
 * @param {*} columnName 
 */
function set0ToEmpty(dC, columnName) {
  let val = '';
  if (dC[columnName] > 0) {
    val = WSUtils.decFloor(dC[columnName], 0);
  }
  dC[columnName] = '';
  return {
    'text': '', 'value': 0,
  };
}

/**
 * 受注番号作成　※2024/4/24　新規登録時、必須項目入力後に初期セットしないため、以下コメントアウト
 * @param {} value 
 * @param {*} dC 
 */
// function setEstimateNo(value, dC) {
//   if (isSet(dC['e_customer_cd_BEFORE'])) {
//     // 既存値
//     if (dC['e_customer_cd'] !== dC['e_customer_cd_BEFORE']) {
//       // 異なるデータがセットされた場合
//       alert('登録済みのデータの客先CD変更はできません');
//       return { 'text': dC['e_estimate_no'], 'value': dC['e_estimate_no'] };
//     }
//     return { 'text': dC['e_estimate_no'], 'value': dC['e_estimate_no'] };
//   }
//   // if (isSet(dC['e_estimate_no'])) {
//   //   // 編集時は、登録されているデータをセット
//   //   return { 'text': dC['e_estimate_no'], 'value': dC['e_estimate_no'] };
//   // }
//   let str = dC['e_estimate_date'];
//   if (!isSet(dC['e_customer_cd'])) {
//     // 客先CDが入っていない
//     dC['e_estimate_no'] = '';
//     return { 'text': '', 'value': '' };
//   }
//   if (!isSet(str)) {
//     // 受注日が入っていない場合は、当日の日付をセット dC['e_estimate_date']
//     let today = new Date();
//     let y = today.getFullYear();
//     let m = ("00" + (today.getMonth() + 1)).slice(-2);
//     let d = ("00" + today.getDate()).slice(-2);
//     str = y + m + d;
//   }
//   // 受注日
//   let strDate = getSerialToStrDate(str);
//   strDate = strDate + dC['e_customer_cd'];
//   if (!String(value).indexOf(strDate)) {
//     // 見積日の変更以外は更新しない
//     dC['e_estimate_no'] = value;
//     return { 'text': value, 'value': value };
//   }
//   // 採番済みの最大値取得
//   // gridのredraw処理の方が早いため、ヘッダが他データでredrawされないとデータ更新されない。
//   // 正常に更新させるためには、gridにajax対応させるようにする。dataviewをセットしているため、処理の変更が必要になるのでとりあえず放置。
//   getEstimateNo(strDate).done(function (data, textStatus, jqXHR) {
//     let serialNo = '01';
//     // 現在の番号
//     if (!data[0]['maxno']) {
//       serialNo = '01';
//     } else {
//       let num = data[0]['maxno'].slice(9);
//       serialNo = ('00' + (Number(num) + 1)).slice(-2);
//     }
//     dC['e_estimate_no'] = strDate + serialNo;    
//     editPGs.pgED.h.grid.invalidateRow(0);
//     editPGs.pgED.h.grid.render();
//   });
// }

function checkTimeCount() {
  console.log('timer');
}

/**
 * 行追加時の枝番記載
 * @param {*} colField 
 * @param {*} dC 
 */
function setSubNo(colField, dC) {
  let val = dC[colField];
  if (!dC[colField]) {
    dC['ed_estimate_sub_no'] = (('000') + dC['id']).slice(-3);
    return { 'text': (('000') + dC['id']).slice(-3), 'value': (('000') + dC['id']).slice(-3) };
  } else {
    dC['ed_estimate_sub_no'] = val;
    return { 'text': val, 'value': val };
  }
}

function setFactor(v, dC) {
  gFactor = dC['ec_factor'];
  return gFactor;
}

function setCostDigit(v, dC) {
  gDigit = dC['ec_area_cost_digit'];
  return gDigit;
}

/**
 * 指示番号から日付を切り出す(yymmdd) 
 * @param {*} strDate 
 */
function getSerialToStrDate(strDate) {
  let str;
  let result;
  if (String(strDate).indexOf('/') != -1) {
    str = strDate.split('/');
    result = str[0].substring(2, 4) + ('00' + str[1]).slice(-2) + ('00' + str[2]).slice(-2);
  } else {
    result = strDate.substring(2, 8);
  }
  return result;
}

/**
 * クライアント側マスタ一覧項目
 */
var master = {};
var productCdList = [];
let stockView = {};

/**
 * マスタの値を取得する
 * @param {*} nameCol 列名
 * @param {*} tableName テーブル名
 * @param {*} keyId 行ID
 * @return {string} 対応するマスタの値
 */
function getMasterValue(nameCol, tableName, keyId) {
  // if (tableName === 'product') {
  //   // サジェスト用にデータ取得
  //   productCdList = [];
  // 配列用にデータ
  // }
  switch (tableName) {
    case 'user':
      break;
    case 'customer':
    case 'CUSTOMER':
      break;
    case 'customerpost':
    case 'CUSTOMERPOST':
      break;
    case 'customercharge':
    case 'CUSTOMERCHARGE':
      break;
    case 'bom':
      break;
    case 'bomassignable':
      break;
    case 'housecompany':
      break;
    case 'project':
      break;
    case 'member':
      break;
    case 'storeresons':
      break;
    case 'permission':
      break;
    case 'projects':
      break;
    default:
      let str;
      let id = document.getElementById('company-cd');
      if (id != null) {
        str = id.textContent;
      }
      keyId = str + '-' + keyId;
      break;

  }

  return master[tableName][keyId] ? master[tableName][keyId][nameCol] : '';
}

/**
 * マスタ内容表示用フォーマッター
 * @param {*} dC データコンテキスト
 * @param {*} colField 参照元の列名
 * @param {*} nameColumn 参照先の列名
 * @param {*} tableName テーブル名
 * @param {*} keyId 
 */
function masterFormatter(dC, colField, nameColumn, tableName, keyId) {
  if (keyId == null || keyId == undefined) {
    return '';
  }
  var mval = getMasterValue(nameColumn, tableName, keyId);
  dC[colField] = mval;
  return { 'text': mval, 'value': mval };
}


// 合計値
function sumTotalsFormatter(totals, columnDef) {
  var val = totals.sum && totals.sum[columnDef.field];
  if (val != null) {
    return "total: " + ((Math.round(parseFloat(val)*100)/100));
  }
  return "";
}


// 発注引継ぎ画面か判定するフラグ
const orderTakeover = {
  customerCd: '',
};

/**
 * 発注画面用のマスタ表示用フォーマッター
 * @param {*} dC データコンテキスト
 * @param {*} colField 参照元の列名
 * @param {*} nameColumn 参照先の列名
 * @param {*} tableName テーブル名
 * @param {*} keyId 
 */
function moedMasterFormatter(dC, colField, nameColumn, tableName, keyId) {
  if (keyId == null || keyId == undefined) {
    return '';
  }

  // 発注引継ぎ用のkeyId
  let orderTakeoverKeyId = '';
  let mval = '';
  if (orderTakeover.customerCd) {
    if (colField === 'moed_shipper_name') {
      orderTakeoverKeyId = orderTakeover.customerCd + '-' + dC['moed_shipper_cd_ed'];
    }

    if (colField === 'moed_delivery_name') {
      orderTakeoverKeyId = orderTakeover.customerCd + '-' + dC['moed_delivery_cd_ed'];
    }
  }

  // 出荷元コードもしくは、納入先CDが変更になった場合 引継したコードはxxxxで表示とする
  if (colField === 'moed_delivery_name' && dC['moed_delivery_cd'] !== 'xxxx') {
    mval = getMasterValue(nameColumn, tableName, keyId);
    dC[colField] = mval;
    return { 'text': mval, 'value': mval };
  }
  if (colField === 'moed_shipper_name' && dC['moed_shipper_cd'] !== 'xxxx') {
    mval = getMasterValue(nameColumn, tableName, keyId);
    dC[colField] = mval;
    return { 'text': mval, 'value': mval };
  }

  // 発注引継ぎ画面とそれ以外の画面で使用するkeyIdを切り替える
  mval = getMasterValue(nameColumn, tableName, orderTakeoverKeyId ? orderTakeoverKeyId : keyId);
  // 見積書から引き継いだ出荷主を設定
  if (colField === 'moed_shipper_name' && !mval) {
    mval = dC['moed_shipper_name'];
  }
  // 見積書から引き継いだ納品先を設定
  if (colField === 'moed_delivery_name' && !mval) {
    mval = dC['moed_delivery_name'];
  }
  dC[colField] = mval;
  return { 'text': mval, 'value': mval };
}

/****
 * マスタダイアログ用 品名マスタのデータ表示専用
 * 品名分類1の場合のみが、品名分類の大分類固定
 * 品名分類2、品名分類3の場合は、分類名を編集可能とする
 */
function masterProdCategoryFormatter(dC, value, colField, nameColumn, keyId, categoryType) {
  let val = '';
  let exValue = value;

  if (!isSet(keyId)) {
    return { 'text': '', 'value': '' };
  }
  if (categoryType) {
    if (!isSet(dC['prc_cat_0' + categoryType + '_cd'])) {
      return { 'text': '', 'value': '' };
    } 
    if (categoryType === '3') {
      if (!isSet(dC['prc_cat_02_cd'])) {
        return { 'text': '', 'value': '' };
      } 
    }
  }

  val = getMasterValue(nameColumn, 'productcategory', keyId);
  if (isSet(val)) {
  } else if (!isSet(val) && isSet(value)) {
    val = value;
  } else {
    val = '';
  }
  dC[colField] = val;
  return { 'text': val, 'value': val };

}

/***
 * 客先部署マスタ登録用の部署名表示
 */
function getMasterDataCustomerPost(dC, colField, value, customerCD, postCD) {
  // 客先部署コードが新規の場合は、データを上書きしない
  const strCustomerCd = getMasterValue('C_CUSTOMER_CD', 'customer', customerCD);
  const strCPName = getMasterValue('CP_POST_NAME', 'customerpost', customerCD + '-' + postCD);

  // 前回値とコード違う場合
  if (dC['CP_POST_CD_BEFORE'] && dC['CP_POST_CD_BEFORE'] !== postCD) {
    // 前回値と異なる
    if (strCPName) {
      // マスタに登録されている値がある場合はそちらを表示
      dC['CP_POST_CD_BEFORE'] = dC['CP_POST_CD_BEFORE'] !== postCD ? postCD : dC['CP_POST_CD_BEFORE'];
      dC[colField] = strCPName;
      return {
        'text': strCPName,
        'value': strCPName,
      }
    }
    let strCPNameBefore = getMasterValue('CP_POST_NAME', 'customerpost', customerCD + '-' + dC['CP_POST_CD_BEFORE']);
    if (strCPNameBefore === value) {
      dC['CP_POST_CD_BEFORE'] = dC['CP_POST_CD_BEFORE'] !== postCD ? postCD : dC['CP_POST_CD_BEFORE'];
      dC[colField] = '';
      return {
        'text': '',
        'value': '',
      }
    }
  }

  if (strCustomerCd && !strCPName) {
    // 客先部署データが新規追加の場合は今の名称そのまま
    dC['CP_POST_CD_BEFORE'] = dC['CP_POST_CD_BEFORE'] !== postCD ? postCD : dC['CP_POST_CD_BEFORE'];
    dC[colField] = value;
    return {
      'text': value,
      'value': value,
    }
  } else if (strCustomerCd && strCPName) {
    dC['CP_POST_CD_BEFORE'] = dC['CP_POST_CD_BEFORE'] !== postCD ? postCD : dC['CP_POST_CD_BEFORE'];
    dC[colField] = strCPName;
    return { 
      'text': strCPName,
      'value': strCPName,
    }
  } else {
    return '';
  }
}

// 詳細情報の一時保存場所
let estimateDetailDatas = [];
/**
 * 見積書登録、編集画面の品名
 * @param {*} dC データコンテキスト
 * @param {*} colField 参照元の列名
 * @param {*} nameColumn 参照先の列名
 * @param {*} tableName テーブル名
 * @param {*} keyId 行ID
 */
 function edProductNameFormatter(dC, colField, nameColumn, tableName, keyId) {
  if (keyId == null || keyId == undefined) {
    return '';
  }
  // 品名
  const productName = getMasterValue(nameColumn, tableName, keyId);
  // 取引単位
  const unitTran = getMasterValue('p_unit_tran', tableName, keyId);
  // 標準単価
  const standardCost = getMasterValue('p_standard_cost', tableName, keyId) || 0;
  // 科目区分
  const typeSubject = getMasterValue('p_type_subject', tableName, keyId);
  // 表示用の科目区分　
  // 製品のみ1。リセール品、半製品、原材料品、梱包資材、リセール加工品、経費はすべてリセール品の2とする。
  const showTypeSubject = typeSubject === '1' ? '1' : '2';

  // 特定の受注No、枝番のデータを取得
  const obj = estimateDetailDatas.find(function (element) {
    return element['ed_estimate_no'] == dC['ed_estimate_no'] && element['ed_estimate_sub_no'] == dC['ed_estimate_sub_no'];
  });

  // 初回表示、品名のみ編集した場合、DBの値を表示
  if (!obj) {
    // 発注委託の場合、単位を引き継ぐ
    dC[colField] = productName;
    dC['ed_unit_tran'] = isSet(dC['ed_unit_tran']) ? dC['ed_unit_tran'] : unitTran;
    dC['ed_unit_price'] = isSet(dC['ed_unit_price']) ? dC['ed_unit_price'] : standardCost;
    dC['ed_type_subject'] = isSet(dC['ed_type_subject']) ? dC['ed_type_subject'] : showTypeSubject;
    estimateDetailDatas.push({...dC});
  } else if (obj['ed_p_cd'] != dC['ed_p_cd']) { // 品名CDを変更した場合
    // 品名マスタの内容を表示
    dC[colField] = productName;
    dC['ed_unit_tran'] = unitTran;
    dC['ed_unit_price'] = standardCost !== null ? standardCost : 0;    
    dC['ed_type_subject'] = showTypeSubject; 
    
    // 一時的に保持している値を更新
    estimateDetailDatas.forEach(function (element) {
      if (element['ed_estimate_no'] == dC['ed_estimate_no'] && element['ed_estimate_sub_no'] == dC['ed_estimate_sub_no']) {
        element['ed_p_cd'] = dC['ed_p_cd'];
      }
    });
  }
  return { 'text': dC[colField], 'value': dC[colField] };
}

// 詳細情報の一時保存場所
let morderestimateDatas = [];
/**
 * 発注一覧登録、編集画面の品名
 * @param {*} dC データコンテキスト
 * @param {*} colField 参照元の列名
 * @param {*} nameColumn 参照先の列名
 * @param {*} tableName テーブル名
 * @param {*} keyId 行ID
 */
 function moedProductNameFormatter(dC, colField, nameColumn, tableName, keyId) {
  if (keyId == null || keyId == undefined) {
    return '';
  }
  // 品名CDに対応する品名をマスタから取得
  const mval = getMasterValue(nameColumn, tableName, keyId);
  // 単位（取引数量）
  const unitTran = getMasterValue('p_unit_tran', tableName, keyId);
  // 単位（単価数量）
  const unitEval = getMasterValue('p_unit_eval', tableName, keyId);
  // 単価　仕入標準単価が1の場合のみ参照
  const typeCost = getMasterValue('p_type_cost', tableName, keyId);
  // 科目区分
  const typeSubject = getMasterValue('p_type_subject', tableName, keyId);
  let standardCost = 0;
  if (typeCost !== null && (typeCost === '1')) {
    standardCost = getMasterValue('p_standard_cost', tableName, keyId);
  } 
  // 在庫区分
  const TypeStorage = getMasterValue('p_type_01', tableName, keyId);

  // 特定の発注No、枝番のデータを取得
  const obj = morderestimateDatas.find(function (element) {
    if (dC['moed_order_no'] !== undefined) {
      return element['moed_order_no'] == dC['moed_order_no'] && element['moed_sub_no'] == dC['moed_sub_no'] && element['moed_accept_sub_no'] == dC['moed_accept_sub_no'];
    } 
  });

  // 初回表示、品名のみ編集した場合、DBの値を表示
  if (isSet(dC['moed_refer_no']) && !obj) {
    // 発注委託の場合、単位を引き継ぐ
    dC[colField] = mval;
    dC['moed_unit_tran'] = isSet(dC['moed_unit_tran']) ? dC['moed_unit_tran'] : unitTran;
    dC['moed_unit_eval'] = isSet(dC['moed_unit_eval']) ? dC['moed_unit_eval'] : unitEval;
    dC['moed_unit_price'] = isSet(dC['moed_unit_price']) ? dC['moed_unit_price'] : standardCost;
    dC['moed_inventory_type'] = isSet(dC['moed_inventory_type']) ? dC['moed_inventory_type'] : TypeStorage;
    morderestimateDatas.push({...dC});
  } else if (!obj) {
    if (dC[colField] === undefined) {
      // 新規追加　objがサラの場合
      dC[colField] = mval;
      dC['moed_unit_tran'] = unitTran;
      dC['moed_unit_eval'] = unitEval;
      dC['moed_type_subject'] = typeSubject;
      dC['moed_unit_price'] = standardCost !== null ? standardCost : 0;
      dC['moed_inventory_type'] = isSet(dC['moed_inventory_type']) ? dC['moed_inventory_type'] : TypeStorage;
    }
    morderestimateDatas.push({...dC});
  } else if (obj['moed_product_cd'] != dC['moed_product_cd']) { // 品名CDを変更した場合
    // 品名マスタの内容を表示
    dC[colField] = mval;
    dC['moed_unit_tran'] = unitTran;
    dC['moed_unit_eval'] = unitEval;
    dC['moed_type_subject'] = typeSubject;
    dC['moed_unit_price'] = standardCost !== null ? standardCost : 0;
    dC['moed_inventory_type'] = isSet(dC['moed_inventory_type']) ? dC['moed_inventory_type'] : TypeStorage;
    
    // 品名CD変更時にデータクリア
    dC['moed_sub_01'] = '';
    dC['moed_sub_02'] = '';
    dC['moed_sub_03'] = '';
    dC['moed_sub_04'] = '';
    dC['moed_sub_05'] = '';
    dC['moed_sub_06'] = '';
    dC['moed_sub_07'] = '';
    dC['moed_sub_08'] = '';
    dC['moed_sub_09'] = '';
    dC['moed_sub_10'] = '';
    dC['moed_sub_11'] = '';
    dC['moed_sub_12'] = '';
    dC['moed_sub_13'] = '';
    dC['moed_parrangement_cd'] = '';
  
    // 一時的に保持している値を更新
    morderestimateDatas.forEach(function (element) {
      if (dC['moed_order_no'] !== undefined && element['moed_order_no'] == dC['moed_order_no'] && element['moed_sub_no'] == dC['moed_sub_no'] && element['moed_accept_sub_no'] == dC['moed_accept_sub_no']) {
        element['moed_product_cd'] = dC['moed_product_cd'];
      }
    });
  }
  
  // // 品名CD変更時にデータクリア
  // if (obj && obj['moed_product_cd'] != dC['moed_product_cd']) {
  //   dC['moed_sub_01'] = '';
  //   dC['moed_sub_02'] = '';
  //   dC['moed_sub_03'] = '';
  //   dC['moed_sub_04'] = '';
  //   dC['moed_sub_05'] = '';
  //   dC['moed_sub_06'] = '';
  //   dC['moed_sub_07'] = '';
  //   dC['moed_sub_08'] = '';
  //   dC['moed_sub_09'] = '';
  //   dC['moed_sub_10'] = '';
  //   dC['moed_sub_11'] = '';
  //   dC['moed_sub_12'] = '';
  //   dC['moed_sub_13'] = '';
  // }
  return { 'text': dC[colField], 'value': dC[colField] };
}

// ダイアログが閉じたときに一時保存していた詳細情報を初期化する。
$('#dialog-insert').on('dialogclose', function() {
  estimateDetailDatas = [];
  morderestimateDatas = [];  
  // 発注引継画面を閉じた時に保持していた客先CDはリセット
  orderTakeover.customerCd = '';
});

/**
 * 発注一覧の品名
 * @param {*} dC データコンテキスト
 * @param {*} colField 参照元の列名
 * @param {*} nameColumn 参照先の列名
 * @param {*} tableName テーブル名
 * @param {*} keyId 行ID
 */
 function moedProductNameFormatter2(dC, colField, nameColumn, tableName, keyId) {
  if (keyId == null || keyId == undefined) {
    return '';
  }
  var mval = getMasterValue(nameColumn, tableName, keyId);
  dC[colField] = dC[colField] ? dC[colField] : mval;
  return { 'text': dC[colField], 'value': dC[colField] };
}
// 編集前の受注情報
// var _beforeEstimateInfo = [];
// 客先CD変更前の受注No
// var _beforeEstimateNo = '';

/***
 * 客先CD明細保持用
 */
function setGridCustomerCD(value, dC, colField) {
  // 新規追加時、顧客CDを明細の為に保持させる。
  let mval = '';
  let changeFlg = false;
  if (!isSet(value)) {
    dC['e_customer_cd'] = mval;
    return { 'text': mval, 'value': mval };
  }
  if (colField === 'e_customer_cd') {
    if ($("#customer-cd").val !== dC['e_customer_cd']) {
      changeFlg = true;
    }
    $("#customer-cd").val(dC['e_customer_cd']);
  } else if (colField === 's_customer_cd') {
    $("#customer-cd").val(dC['s_customer_cd']);
  } else if (colField === 'moed_customer_cd') {
    if (dC['moed_customer_cd'] === undefined) {
      bCustomerCd = '';
      gCustRound = '1';
    } else {
      bCustomerCd = dC['moed_customer_cd'];
      gCustRound = getMasterValue('C_STATEMENT_FRACTION_SIGN', 'customer', dC['moed_customer_cd']);
    }
    $("#customer-cd").val(bCustomerCd);
    value = bCustomerCd;
  } else {
    $("#customer-cd").val('');
  }
  if (changeFlg) {
    if (colField === 'e_customer_cd') {
      let ar = editPGs.pgED.d.dataView.getItems();
      for (let i = 0; i < ar.length; i++) {
        editPGs.pgED.d.grid.invalidateRow(i);
        editPGs.pgED.d.grid.render();
      }
    }
  }
  mval = value;
  dC[colField] = mval;
  return { 'text': mval, 'value': mval };
}


/***
 * 製品の原価単価を取得する。戻り値は日本円表示関数を通すこと。
 */
function getProductCost(pCD, dC, columnName) {
  // 製品の原価単価を取得する。　見積計算対象外:0ならば原価単価をセット
  let str = '';
  let id = '';
  let ar = [];
  let val = 0;

  if (!isSet(pCD)) {
    // 品名コード未セットの場合0をセット
    dC[columnName] = val;
    return {
      'text': toJPY(val),
      'value': val,
    };
  }
  // 品名マスタデータ取得
  id = document.getElementById('company-cd');
  if (isSet(id)) {
    str = id.textContent;
  }
  ar = master['product'][str + '-' + pCD];
  if (!isSet(ar)) {
    // 品名マスタにない
    dC[columnName] = val;
    return {
      'text': toJPY(val),
      'value': val,
    };
  }
  if (String(ar['p_type']).substr(0, 1) === '0') {
    // 品種区分が000　製造品ではないものの場合
    if (parseInt(dC[columnName]) > 0) {
      // 入力がある場合
      val = parseInt(dC[columnName]);
    } else if (isSet(ar['p_standard_cost'])) {
      // マスタ値がある
      val = parseInt(ar['p_standard_cost']);
    } 
    // どの値も設定されていない=0
    dC[columnName] = val;
    return {
      'text': toJPY(val),
      'value': val,
    };
  } else {
    // 金網なので、見積計算で算出。既に算出されていればそのデータを表示
    // 見積再計算の場合は、見積計算登録時にデータアップデートしている
    if (parseInt(dC[columnName]) > 0) {
      val = parseInt(dC[columnName]);
      dC[columnName] = val;
      return {
        'text': toJPY(val),
        'value': val,
      };
    } else {
      dC[columnName] = val;
      return {
        'text': toJPY(val),
        'value': val,
      };
    }
  }
}


/**
 * ヘッダー合計値用
 * @param {*} v 値
 * @param {*} colField 合計するカラム名
 * @param {*} inputColumn 表示するカラム名
 * @param {*} dC データコンテキスト
 */
function getSUM(v, colField, inputColumn, dC) {
  let arItem = editPGs.pgED.d.dataView.getItems();
  let sum = 0;
  if (arItem.length === 0) {
    return '';
  }
  for (var i = 0; i < arItem.length; i++) {
    sum += arItem[i][colField];
  }
  dC[inputColumn] = sum;
  return { 'text': sum, 'value': sum };
}


/**
 * マスタ表示用　図番から品名を取得
 * @param {*} dC データコンテキスト
 * @param {*} colField Gridカラム名
 * @param {*} keyNo 図番
 */
function masterFormatterProdName(dC, gridField, keyNo) {
  if (keyNo == '' || keyNo == undefined || keyNo == null) {
    return dC[gridField] = '';
  }
  if (dC[gridField] != null) {
    return dC[gridField];
  }
  for (let rec in master['product']) {
    if (master['product'][rec]['p_cd'] === keyNo) {
      return master['product'][rec]['p_name'];
    }
  }
  return '';
}

/**
 * 評価単位と取引単位取得
 * @param {*} dC 
 * @param {*} colField 
 * @param {*} keyId 
 */
function masterFormatterProdUnit(dC, colField, keyId) {
  let fieldName = String(colField);
  let mval = '';
  let strName = '';
  if (fieldName.indexOf('eval') != -1) {
    mval = getMasterValue('p_unit_eval', 'product', keyId);
    strName = getMasterValue('u_name', 'unit', mval);
  } else {
    mval = getMasterValue('p_unit_tran', 'product', keyId);
    strName = getMasterValue('u_name', 'unit', mval);
  }
  if (!colField) {
    return strName;
  } else {
    dC[colField] = strName;
    return { 'text': strName, 'value': mval };
  }
  // return strName;
}

/***
 * 集金有無を表示
 */
function masterFormatterPayment2(dC, colField, keyId) {
  let mval = '';
  let strName = '';
  mval = getMasterValue('C_PAYMENT_WAY2', 'customer', keyId);
  if (mval === '0' || mval === null) {
    // 集金なし
    strName = '無';
  } else {
    strName = '有';
  }

  if (!colField) {
    return strName;
  } else {
    dC[colField] = strName;
    return { 'text': strName, 'value': mval };
  }
}


/***
 * 仕入単価をマスタから取得表示
 */
function masterFormatterOrderCost(dC, colField, keyId) {
  let fieldName = String(colField);
  let strType = '';
  let nUPrice = 0;

  nUPrice = dC[colField] === undefined ? 0 : dC[colField];
  if (!isSet(keyId)) {
    dC[colField] = 0;
    return { 'text': '0', 'value': 0 };
  }
  // 品名マスタデータ取得
  // 標準単価ありなし
  strType = getMasterValue('p_type_cost', 'product', keyId);

  if (!isSet(strType)) {
    dC[colField] = WSUtils.decFloor(nUPrice, 0);
    return { 'text': String(nUPrice), 'value': nUPrice };
  }

  if (strType === '1') {
    // マスタ標準原価無し 
    dC[colField] = nUPrice;
    return { 'text': String(nUPrice), 'value': nUPrice };
  } else {
    if (nUPrice === getMasterValue('p_standard_cost', 'product', keyId) || nUPrice == 0) {
      nUPrice = getMasterValue('p_standard_cost', 'product', keyId);
    }
    dC[colField] = nUPrice;
    return { 'text': String(nUPrice), 'value': nUPrice }
  }

}

function masterFormatterCuspost(dC, colField, nameColumn,) {
  if ((dC['e_customer_cd'] == undefined && dC['e_customer_post_cd'] == undefined) || (dC['e_customer_cd'] == null && dC['e_customer_post_cd'] == null)) {
    return '';
  }
  if (dC[colField] != null) {
    return dC[colField];
  }
  for (let rec in master['customerpost']) {
    if (master['customerpost'][rec]['e_customer_cd'] === dC['e_customer_cd']) {
      if (master['customerpost'][rec]['e_customer_post_cd'] === dC['e_customer_cd']) {
        return master['customerpost'][rec][nameColumn];
      }
    }
  }
  return '';
}

function masterFormatterCusCharge(dC, colField, nameColumn,) {
  if ((dC['e_customer_cd'] == undefined && dC['e_customer_post_cd'] == undefined && dC['e_customer_charge_cd'] == undefined) || (dC['e_customer_cd'] == null && dC['e_customer_post_cd'] == null && dC['e_customer_charge_cd'] == null)) {
    return '';
  }
  if (dC[colField] != null) {
    return dC[colField];
  }
  for (let rec in master['customercharge']) {
    if (master['customercharge'][rec]['e_customer_cd'] === dC['e_customer_cd']) {
      if (master['customercharge'][rec]['e_customer_post_cd'] === dC['e_customer_cd']) {
        if (master['customercharge'][rec]['e_customer_charge_cd'] === dC['e_customer_charge_cd']) {
          return master['customercharge'][rec][nameColumn];
        }
      }
    }
  }
  return '';
}

function getEDDeliveryName(val, col, dC) {
  let ar = editPGs.pgED.h.dataView.getItems();
  let value = '';
  if (isSet(ar['e_customer_cd'])) {
    value = getMasterValue('CP_POST_NAME', 'customerpost', ar['e_customer_cd'] + '-' + val);
  }
  dC[col] = value;
  return { 'text': value, 'value': value };
}


/**
 * 製品CDからデータ取得
 * @param {*} colField 
 * @param {*} value 
 * @param {*} dC 
 * @param {*} pgProc 画面
 */
// function getProductData(colField, value, dC) {
//   // 製品CDから製品データ取得
//   if (dC[colField] !== '' || dC[colField] !== undefined) {
//     // 原価区分　0：マスタ標準単価有り、１：標準単価なし
//     let strCostType = getMasterValue('p_type_cost', 'product', dC['p_cd']);
//     // 0の時は価格は標準原価
//     let strStandardCost = getMasterValue('p_standard_cost', 'product', dC['p_cd']);
//     // 取引単位
//     let strUnitTran = getMasterValue('p_unit_tran', 'product', dC['p_cd']);
//     // 税率
//     let str = getMasterValue('p_tax_rate_cd', 'product', dC['p_cd']);
//     let nTax = parseFloat(getMasterValue('t_rate', 'tax', str));

//     // データを各カラムに設定
//     let dat = editPGs.pgMOD.d.dataView.getItems();
//     for (let i = 0; i < dat.length; i++) {
//       if (strCostType === '0') {
//         dC['moed_unit_price'] = strStandardCost;
//       } else {
//         dC['moed_unit_price'] = 0;
//       } 
//       dC['moed_money'] = dC['moed_quantity'] *  dC['moed_unit_price'];
//       dC['moed_money_tax'] = dC['moed_quantity'] *  dC['moed_unit_price'] * (nTax / 100);
//       dC['moed_money_inc_tax'] = dC['moed_quantity'] *  dC['moed_unit_price'] * (1 + nTax / 100);

//       // 画面リロード
//       editPGs.pgMOD.d.grid.invalidateRow(i);
//     }
//     editPGs.pgMOD.d.grid.render();
//   }
// }




// /**
//  * 金網画面の値設定
//  * @param {*} colField 
//  * @param {*} value 
//  * @param {*} dC 
//  */
// function setValueWire(colField, value, dC) { 
//   if (dC[colField] == null) {
//     return '';
//   }
//   if ('pp_ed_sub_01' === colField) {
//     // 線径①
//     gMoldDia1 = Number(dC[colField]);
//   }
//   if ('pp_ed_sub_04' === colField) {
//     // 目合
//     gMoldOpen1 = Number(dC[colField]);
//   }
//   if ('pp_weave_cd' === colField) {
//     // 織機比率
//     if (getMasterValue('wv_rate', 'weave', dC[colField]) !== '') {
//       gWeaveRate = Number(getMasterValue('wv_rate', 'weave', dC[colField])); 
//     } else {
//       gWeaveRate = ''; 
//     }
//   }
//   if ('pp_dimension' === colField) {
//     gMoldDimension = Number(dC[colField]);
//   }
//   return dC[colField];
// }


/**
 * マスタの登録有無を確認する
 * @param {*} tableName テーブル名
 * @param {*} keyId 行ID
 * @return {boolean} バリデーション結果
 */
function checkMasterAvailable(tableName, keyId) {
  switch (tableName) {
    // case 'user':
    //   break;
    case 'customer':
      break;
    case 'customerpost':
      break;
    case 'customercharge':
      break;
    case 'bom':
      break;
    case 'bomassignable':
      break;
    case 'housecompany':
      break;
    case 'project':
      break;
    case 'member':
      break;
    case 'storeresons':
      break;
    case 'permission':
      break;
    case 'projects':
      break;
    case 'user':
      break;
    case 'customership':
      // 部署マスタに置き換え
      tableName = 'customerpost';
      break;
    case 'customermaker':
      // 部署マスタに置き換え
      tableName = 'customerpost';
      break;
    default:
      let str;
      let id = document.getElementById('company-cd');
      if (id != null) {
        str = id.textContent;
      }
      keyId = str + '-' + keyId;
      break;
  }

  return master[tableName][keyId] ? true : false;
  // return master[tableName][keyId] ? true : false;
}

/**
 * マスタ指定先有無チェック用バリデーター
 */
function masterValidator(value, item, col) {
  var noHyphen = String(value).replace('-', '');
  if (String(value).indexOf('undefined') !== -1) {
    return { 'valid': true, 'msg': null };
  }
  if (String(value).indexOf('null') !== -1) {
    return { 'valid': true, 'msg': null };
  }
  if (value === null || value === undefined || noHyphen === '') {
    return { 'valid': true, 'msg': null };
  } else if (!checkMasterAvailable(col['ref'], value)) {
    // マスタにない場合データ確認してリターン
    var sep = String(value).split('-');
    if (sep.length > 0 && sep.filter(function (elem) {
      return (!isSet(elem));
    }).length > 0) {
      return { 'valid': true, 'msg': null };
    }
    return { 'valid': false, 'msg': '入力内容に対応するマスタがありません' };
  } else {
    return { 'valid': true, 'msg': null };
  }
}


/**
 * マスタ指定先(必須項目)有無チェック用バリデーター
 */
function masterNNValidator(value, item, col) {
  var noHyphen = String(value).replace('-', '');
  if (value === null || value === undefined || noHyphen === '') {
    return { 'valid': false, 'msg': '入力必須です' };
  } else if (!checkMasterAvailable(col['ref'], value)) {
    return { 'valid': false, 'msg': '入力内容に対応するマスタがありません' };
  } else {
    return { 'valid': true, 'msg': null };
  }
}

/**
 * 見積明細請求区分チェック用バリデーター
 */
function edBillSignValidator(value, item, col) {
  if (value === null || value === undefined || value === '') {
    return { 'valid': false, 'msg': '入力必須です' };
  }
  if (item[col['field']] && item[col['field']] === '1') {
    return { 'valid': false, 'msg': '請求済みのため、変更できません' };
  }
  if (item[col['field']] !== '1' && value === '1') {
    return { 'valid': false, 'msg': '見積明細請求区分には[0:未]または[2:不必要]のみ指定可能です' };
  }
  return { 'valid': true, 'msg': null };
}

/**
 * テキストチェック用バリデーター
 */
function textValidator(value, item, col) {
  if (value !== null && value !== undefined && value !== '') {
    if (String(value).length > col['maxlength']) {
      return { 'valid': false, 'msg': col['maxlength'] + '文字以内で入力してください' };
    }
  }
  return { 'valid': true, 'msg': null };
}

/**
 * テキスト(必須項目)チェック用バリデーター
 */
function textNNValidator(value, item, col) {
  if (value === null || value === undefined || value === '') {
    return { 'valid': false, 'msg': '入力必須です' };
  } else if (String(value).length > col['maxlength']) {
    return { 'valid': false, 'msg': col['maxlength'] + '文字以内で入力してください' };
  }
  return { 'valid': true, 'msg': null };
}

/**
 * 前回の値からの変更を禁止するバリデーター
 */
function preventModifyValidator(value, item, col) {
  if (item[col['field'] + '_PREVVAL'] && value !== item[col['field'] + '_PREVVAL']) {
    return { 'valid': false, 'msg': '登録済みのため、変更できません' };
  }
  return { 'valid': true, 'msg': null };
}

/**
 * バリデ―ションを複数実行する
 */
function twoValidator(value, item, col, funcA, funcB) {
  var resultA = funcA(value, item, col);
  if (resultA['valid'] === true) {
    var resultB = funcB(value, item, col);
    if (resultB['valid'] === true) {
      return { 'valid': true, 'msg': null };
    }
    return resultB;
  }
  return resultA;
}

/**
 * BOM工程名と子製品IDの相互関係チェック
 */
function BOMProcValidator(value, item, col) {
  if (value !== null || value !== undefined) {
    let ar = masterPGs.pgBom.getActiveRow();
    // let ad = 
    if (ar['b_child_id'] > 0) {
      return { 'valid': false, 'msg': '工程名入力時は、子製品IDは０にしてください' };
    }
  }
  return { 'valid': true, 'msg': null };

}

/**
 * 見積計算G指定
 * @param {*} value 
 * @param {*} item 
 * @param {*} col 
 */
function calcTypeValidator(value, item, col) {
  if (!isSet(item['ed_p_cd'])) {
    return { 'valid': true, 'msg': null };
  }
  let mval = getMasterValue('p_type', 'product', item['ed_p_cd']);
  if (isSet(mval) && mval.substr(0, 1) === '1') {
    // 見積計算対象製品
    if (isSet(value)) {
      return { 'valid': true, 'msg': null };
    }
  } else {
    if (isSet(value)) {
      return { 'valid': false, 'msg': '見積計算対象の製品ではありません。' };
    } else {
      return { 'valid': true, 'msg': null };
    }
  }
  // if (value !== null || value !== undefined) {
  //   let mval = getMasterValue('p_type', 'product', item['ed_p_cd']);
  //   if (mval !== '1') {
  //     return { 'valid': false, 'msg': '見積計算対象の製品ではありません。'};
  //   }
  // }
  return { 'valid': true, 'msg': null };
}

/**
 * 発注画面で、社内番号ではない受注番号は不可
 */
function referNoValidator(value, item, col) {
  if (!isSet(value)) {
    return { 'valid': true, 'msg': null };
  }
  let items = mainPGs.pgED.dataView.getItems();
  if (items) {

  } else {
    return { 'valid': true, 'msg': null };
  }
  return { 'valid': true, 'msg': null };

}


/**
//  * 現品票ロゴ
//  * @param {*} dC 
//  * @param {*} columnName : セット先セル名
//  * @param {*} getColumnName : 参照セル名
//  */
// function setLogo(dC, columnName, getColumnName) {
//   let val = '';
//   if (isSet(dC[getColumnName])) {
//     val = dC[columnName];
//     if (!isSet(dC[columnName])) {
//       val = 'STONE';
//     } else if (dC[columnName] !== 'STONE') {
//       // STONE以外はそのまま保持
//     } 
//   } else {
//     if (!isSet(dC[columnName])) {
//       val = 'STONE';
//     } else if (dC[columnName] !== 'STONE') {
//       // STONE以外はそのまま保持
//     } 
//   }
//   dC[columnName] = val;
//   return {
//     'text': val,
//     'value': val
//   };
// }


/**
 * リーフ発行有無チェック用バリデーター
 */
function CheckLeafIssued(leafissued) {
  if (leafissued) {
    return { 'valid': false, 'msg': 'リーフ発行済みのため削除できません' };
  }
  return { 'valid': true, 'msg': null };
}


// /**
//  * 納品数の在庫チェック　在庫もしくは発注品の場合、在庫がなければ赤文字で表示
//  */
// function checkStockValidator(row, cell, value, columnDef, dataContext) {
//   if (value > 1) {
//     return { 'valid': false, 'msg': null };
//   } else {
//     return { 'valid': true, 'msg': null };

//   }
//   // let strData = 0;
//   // if (isSet(value)) {
//   //   strData = Math.round(value);
//   //   let regex = /^-*[0-9]+$/;
//   //   if (!regex.test(value)) {
//   //     ajaxCheckStock(dataContext).done( function (data, textStatus, jqXHR) {
//   //       if (data.length > 0) {
//   //         dataContext[columnDef.id] = strData;
//   //         return { 'text': strData, 'value': strData, 'addClasses': 'invalid' };
//   //       } else {
//   //         dataContext[columnDef.id] = strData;
//   //         return { 'text': strData, 'value': strData, 'removeClasses': 'invalid'  };
//   //       }
//   //     }).fail( function (data, textStatus, jqXHR) {
//   //       dataContext[columnDef.id] = '';
//   //       return { 'text': strData, 'value': strData, 'removeClasses': 'invalid'  };
//   //     }) 

//   //   }
//   // } else {
//   //   dC[columnDef] = '';
//   //   return { 'text': '', 'value': '', 'removeClasses': 'invalid' };
//   // }
// }



/***
 * 所要時間を算出
 */
function getReqTime(dC) {
  if (dC['l_amount'] == null || dC['l_amount'] == undefined) {
    return '';
  }
  let amount = dC['l_amount'];
  let fixVal = getMasterValue('b_time_fix', 'bom', dC['l_p_id'] + '-0');
  let amoVal = getMasterValue('b_time_amount', 'bom', dC['l_p_id'] + '-0');

  let time = parseInt(fixVal) + parseInt(amount) * parseInt(amoVal);
  return time;
}


/**
 * 縦横など、Defaultが同じデータをセット
 * @param {*} dC データコンテキスト
 * @param {*} colField セットするカラム
 * @param {*} value セットする値
 */
function inputSameValueN(dC, colField, value) {
  let strData = dC[colField];
  if (!value) {
    dC[colField] = '';
    return { 'text': '', 'value': '' };
  } else {
    if (!isSet(dC[colField])) {
      dC[colField] = value;
      return { 'text': value, 'value': value };
    } else {
      // // 小数点以下何桁か判定
      // if (String(dC[colField]).indexOf('.') < 0) {
      //   return { 'text': dC[colField], 'value': dC[colField] };
      // } 
      // // 小数点第2位まで表示対応。ただし、2022/5/12現在、在庫管理上、小数点第二位の数値は対応していないため注意。
      // let strPoint = String(dC[colField]).split('.')[1];
      // if (strPoint.length >= 2) {
      //   dC[colField] = Math.ceil(dC[colField] * 100) / 100;
      //   return { 'text': dC[colField], 'value': dC[colField] };
      // } else if (strPoint.length <= 1) {
      //   return { 'text': dC[colField], 'value': dC[colField] };
      // }

      // 2023/5/10　先方の要望により小数点以下の丸め処理を行わないようにするため上記コメントアウト
      return { 'text': dC[colField], 'value': dC[colField] };
    }
  }
}

/**
 * 線番データがマスタ値から外れていた場合、チェックメッセージを表示。
 * 外れているのが正の場合もあるので、チェックのみ 
 * OKだったらtrue
 */
function checkWireDiameter() {
  let arData = editPGs.pgED.d.dataView.getItems();
  let nUpper = 0;
  let nLower = 0;
  let nFlg = false;
  if (arData.length > 0) {
    for (let i = 0; i < arData.length; i++) {
      if (Number(arData[i]['ed_sub_num_03']) > 0) {
        nUpper = getMasterValue('wi_upper', 'wire', arData[i]['ed_sub_num_03']);
        nLower = getMasterValue('wi_lower', 'wire', arData[i]['ed_sub_num_03']);
        if (arData[i]['ed_sub_01'] < nUpper && nLower < arData[i]['ed_sub_01']) {
          nFlg = false;
        } else {
          nFlg = true;
        }
        if (arData[i]['ed_sub_02'] < nUpper && nLower < arData[i]['ed_sub_02']) {
          nFlg = false;
        } else {
          nFlg = true;
        }
      }
    }
  }
  return nFlg;
}

/**
 * 金網計算　金型②セット
 * @param {*} dC 
 * @param {*} setColumn 
 * @param {*} getColumn 
 * @param {*} v 
 */
function setSameValue(dC, setColumn, getColumn, v) {
  if (!isSet(dC[getColumn])) {
    dC[setColumn] = '';
    return {
      'text': '',
      'value': '',
    };
  }
  if (dC[getColumn] !== v && isSet(dC[setColumn])) {
    // 手入力
    dC[setColumn] = v;
    return {
      'text': v,
      'value': v,
    };
  } else {
    // 自動セット
    dC[setColumn] = dC[getColumn];
    return {
      'text': dC[getColumn],
      'value': dC[getColumn],
    };
  }
}

/**
 * 同じ行の他のカラムと同じ値にセット
 * @param {*} setField セットされるカラムの名前
 * @param {*} colField データを取得するカラムの名前
 * @param {*} dC データコンテキスト
 */
function inputResultValue(setField, getField, dC, v) {
  // 縦、横で異なるデータが入っていたらそのままの値をセットして戻る
  let resultVal = 0;
  if (!isSet(dC[getField])) {
    // 通ることはないはず。
    dC[setField] = '';
    return {
      'text': '',
      'value': '',
    };
  }
  // 手入力の場合
  if (dC[setField] !== dC['pw_ed_sub_08'] && dC[setField] !== dC['pw_ed_sub_09']) {
    dC[setField] = dC[setField];
    resultVal = dC[setField];
  } else {
    dC[setField] = dC[getField];
    resultVal = dC[getField];
  }
  // if (bButtonStr === '〇') {
  //   // ボタンまでリロードされるので再セット
  //   $("#" + dC['id']).attr("value","〇");
  // } else {
  //   $("#" + dC['id']).attr("value","-");
  // }
  // // 手入力か自動セット値か判断し、データセット
  // if (dC[setField] === dC[getField]) {
  // //   // 手入力データ
  // //   dC[setField] = v;
  // //   resultVal = v;
  // // } else {
  //   // データ入れ替えしていなかったら更新する必要はないので戻る
  //   dC[setField] = dC[getField];
  //   resultVal = dC[getField];
  //   return {
  //     'text': resultVal,
  //     'value': resultVal,
  //   };
  // }
  // 関与する値を更新
  if (setField === 'pw_vertical_size') {
    // 縦サイズ    
    let num1 = calcPGs.pgProdMold.h1.dataView.getItems()[0]['pp_ed_sub_01'];
    let num2 = calcPGs.pgProdMold.h1.dataView.getItems()[0]['pp_ed_sub_04'];
    if (!isSet(num1) || !isSet(num2)) {
      // セットされてなかったらデフォルトの値をセット
      dC[setField] = v;
      return {
        'text': v,
        'value': v,
      };
    }
    // 本数計算、本数決定、突き出し、線外々、突き出しは更新対象
    let val = WSUtils.decFloor(Number(dC[setField]) / (Number(num1) + Number(num2)), 2);
    val = WSUtils.toPadDecStr(val, 2);
    // 本数決定も更新
    dC['pw_vert_num'] = val;
    dC['pp_result_num'] = WSUtils.decFloor(val, 0);
    dC['pw_side_count'] = dC['pp_result_num'];
    val = WSUtils.decFloor(val, 0) * (Number(num1) + Number(num2)) + Number(num1);
    dC['pp_out_dia'] = WSUtils.decFloor(val, 2);
    val = (Number(dC[setField]) - WSUtils.decFloor(val, 2)) / 2;
    val = WSUtils.decFloor(val, 1);
    dC['pp_push_side'] = WSUtils.toPadDecStr(val, 1);
    dC['pp_push_vertical'] = WSUtils.toPadDecStr(val, 1);
  } // 横サイズは横枚数の入力によって更新

  if (dC['isExchanged'] === 1) {
    dC['isExchanged'] = 1;
  } else {
    dC['isExchanged'] = 0;
  }
  // 横でも縦でもデータが入れ替えされたらセットする
  return {
    'text': resultVal,
    'value': resultVal,
  };
}

/**
 * 横サイズを計算
 * @param {*} v 
 * @param {*} dC 
 */
function calcSizeFormatter(v, dC) {
  let arHeader = calcPGs.pgProdMold.h1.dataView.getItems();
  if (dC['pw_side_num'] === null || dC['pw_side_num'] === undefined || dC['pw_side_num'] === '') {
    return '';
  }
  gMold1Pitch = getMasterValue('ml_pitch', 'mold', arHeader[0]['pp_mold_01']);
  gMold1Gear = getMasterValue('ml_gear_num', 'mold', arHeader[0]['pp_mold_01']);
  if (gMold1Pitch === '') {
    return '';
  }
  let num = Number(dC['pw_ed_sub_08']) * 10 * Number(dC['pw_side_num']) / 10;
  // 横サイズ
  dC['pw_width_size'] = num.toFixed(1);
  // ch計算
  let num2 = Number(dC['pw_side_num']) * Number(dC['pw_ed_sub_08']) / gMold1Gear / (gMold1Pitch) * 30 * 100;
  dC['pp_ch_calc'] = Math.ceil(num2) / 100;
  return { 'text': num.toFixed(1), 'value': num.toFixed(1) };
}

/**
 * 金網指図　枚数を計算
 * @param {*} v 
 * @param {*} dC 
 */
function calcSheetsFormatter(dC, columnName) {
  let val = dC[columnName];
  if (!isSet(dC['pw_side_num'])) {
    // 横枚数がはいってなかったら0
    dC[columnName] = 0;
    return {
      'text': 0,
      'value': 0,
    };
  }
  if (dC['pw_side_num'] <= 0) {
    dC[columnName] = 0;
    return {
      'text': 0,
      'value': 0,
    };
  }
  val = Number(dC['pw_quantity']) / Number(dC['pw_side_num']);
  val = WSUtils.decCeil(val, 0);
  dC[columnName] = val;
  return {
    'text': val,
    'value': val,
  };
  // if (dC['pw_side_num'] === null || dC['pw_side_num'] === undefined || dC['pw_side_num'] === '') {
  //   return '';
  // }
  // let num = Math.ceil(Number(dC['pw_quantity']) / Number(dC['pw_side_num'])); 
  // dC['pw_sheets_num'] = num;
  // return { 'text': num, 'value': num };
}

/**
 * チェーン数を計算
 * @param {*} v 
 * @param {*} getField 
 * @param {*} dC 
 */
function chNumFormatter(v, getField, dC) {
  let num = calcPGs.pgProdMold.h1.dataView.getItems()[0]['ml_apply_01'];
  if (dC[getField] === null || dC[getField] === undefined || dC[getField] === '') {
    return '';
  }
  return Math.ceil(Number(dC[getField]) / Number(num)) * Number(num);
}

/**
 * 金網指図 チェーン計算
 * @param {*} v 
 * @param {*} dC 
 */
function calcPChain(dC, columnName, v) {
  let val = 0;
  let pgHeader = calcPGs.pgProdMold.h1.dataView.getItems();
  let pgDetail = calcPGs.pgProdMold.d1.dataView.getItems();
  let pitch = getMasterValue('ml_pitch', 'mold', pgHeader[0]['pp_mold_01']);
  let gear = getMasterValue('ml_gear_num', 'mold', pgHeader[0]['pp_mold_01']);
  let ctl = getMasterValue('ml_control_num', 'mold', pgHeader[0]['pp_mold_01']);
  if (!isSet(v)) {
    // undefinedの時は空文字にする
    v = '';
  }

  dC[columnName] = v;
  if (!isSet(gear) || !isSet(pitch)) {
    // 金型がセットされていなければ戻る
    dC[columnName] = v;
    return {
      'text': v,
      'value': v,
    };
  }
  if (columnName === 'pw_side_num') {
    if (!isSet(v)) {
      // 横枚数がセットされてなかったら戻る
      dC[columnName] = '';
      return {
        'text': '',
        'value': '',
      };
    }

    val = Number(dC['pw_width_size']) * Number(dC['pw_side_num']) / gear / pitch * 30;
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    dC['pp_ch_calc'] = val;
    dC['pp_ch_cut'] = WSUtils.decCeil(val, 0);
    // ch決定
    dC['pp_ch_result'] = WSUtils.numCeil(dC['pp_ch_cut'], ctl);
    // チェン数
    dC['pw_chain_num'] = WSUtils.numCeil(dC['pp_ch_result'], ctl);
    // 寸法切り上げ
    val = dC['pp_ch_cut'] * gear * pitch / 30;
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    dC['pp_size_cut'] = val;
    // 寸法決定
    val = dC['pp_ch_result'] * gear * pitch / 30;
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    dC['pp_size_result'] = val;
    // ロス切り上げ
    val = dC['pp_size_cut'] - Number(dC['pw_width_size']) * Number(dC['pw_side_num']);
    val = WSUtils.decFloor(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    dC['pp_loss_cut'] = val;
    // ロス決定
    val = dC['pp_size_result'] - Number(dC['pw_width_size']) * Number(dC['pw_side_num']);
    val = WSUtils.decFloor(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    dC['pp_loss_result'] = val;

    // 明細2にも反映
    // let val = 0;
    // let group = 0;
    // for (let i = 0; i < pgDetail.length; i++) {
    //   if (pgDetail[i]['pw_group_sign'] !== group || group === 0) {
    //     val = pgDetail[i]['pw_vertical_size'] * pgDetail[i]['pw_sheets_num'];
    //   } else {
    //     val += pgDetail[i]['pw_vertical_size'] * pgDetail[i]['pw_sheets_num'];
    //   }
    // }
    // dC['pw_g_size'] = val;
    // dC['pw_g_loss'] = dC['pw_g_sum_size'] - dC['pw_g_size'];
  } else {
    // pw_g_ch_calc pw_g_vert pw_g_cheets_num
    if (!isSet(v)) {
      // 一回長がセットされてなかったら戻る
      dC[columnName] = '';
      return {
        'text': '',
        'value': '',
      };
    }
    dC[columnName] = v;
    val = Number(dC['pw_g_vert']) / gear / pitch * 30;
    val = WSUtils.decCeil(val, 0);
    // val = WSUtils.toPadDecStr(val, 2);
    dC['pw_g_ch_calc'] = val;
    dC['pw_g_ch_cut'] = WSUtils.decCeil(val, 0);
    dC['pw_g_ch_result'] = WSUtils.numCeil(dC['pw_g_ch_cut'], ctl);
    val = dC['pw_g_ch_cut'] * gear * pitch / 30;
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    dC['pw_g_size_cut'] = val;
    val = dC['pw_g_ch_result'] * gear * pitch / 30;
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    dC['pw_g_size_result'] = val;
    val = dC['pw_g_size_cut'] - Number(dC[columnName]);
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    dC['pw_g_loss_cut'] = val;
    val = dC['pw_g_size_result'] - Number(dC[columnName]);
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    dC['pw_g_loss_result'] = val;
  }
  dC[columnName] = v;
  return {
    'text': v,
    'value': v,
  };
}

/**
 * チェーン切上を計算
 * @param {*} v 
 * @param {*} dC 
 */
function chCutFormatter(v, dC) {
  if (dC['pp_ch_calc'] === null || dC['pp_ch_calc'] === undefined || dC['pp_ch_calc'] === '') {
    return '';
  }
  return Math.ceil(dC['pp_ch_calc']);
}

/**
 * 寸法切上を計算
 * @param {*} colField 
 * @param {*} v 
 * @param {*} dC 
 */
function sizeCutFormatter(colField, v, dC) {
  let arH1 = calcPGs.pgProdMold.h1.dataView.getItems();
  let value = arH1[0]['pp_mold_01'];
  let num1 = getMasterValue('ml_gear_num', 'mold', value);
  let num2 = getMasterValue('ml_pitch', 'mold', value);
  if (dC[colField] === null || dC[colField] === undefined || dC[colField] === '') {
    return '';
  } else {
    let nCeil = Math.ceil(Number(dC[colField]) * Number(num1) * Number(num2) * 100) / 100;
    return nCeil.toFixed(2);
  }
}

/**
 * ロス計算
 * @param {*} sideField 
 * @param {*} colField1 
 * @param {*} colField2 
 * @param {*} dC 
 */
function lossFormatter(sideField, colField1, colField2, dC) {
  if (dC[sideField] === null || dC[sideField] === undefined || dC[sideField] === '') {
    return '';
  }
  if (dC[colField1] === null || colField1 === undefined || colField1 === '') {
    return '';
  }
  return (Number(dC[colField2] - Number(dC[colField1]))).toFixed(2);
}


/**
 * 本数決定の計算
 * @param {*} v 
 * @param {*} dC 
 */
function resultNumFormatter(dC, columnName) {
  let val = '';
  if (columnName === 'pp_result_num') {
    if (!isSet(dC['pw_vert_num'])) {
      // 本数計算が入っていなかったら戻る
      dC[columnName] = '';
      return {
        'text': '',
        'value': '',
      };
    }
    // ヘッダ値取得
    let num1 = calcPGs.pgProdMold.h1.dataView.getItems()[0]['pp_ed_sub_01'];
    let num2 = calcPGs.pgProdMold.h1.dataView.getItems()[0]['pp_ed_sub_04'];
    // 手入力か自動入力か判断
    if (dC['pp_result_num'] !== WSUtils.decFloor(dC['pw_vert_num'], 0)) {
      // 手入力
      // dC['pp_result_num'] = v;
      // 突き出しと線外々も更新
      val = dC['pp_result_num'] * (Number(num1) + Number(num2)) + Number(num1);
      val = WSUtils.decFloor(val, 2);
      dC['pp_out_dia'] = val;
      val = (dC['pw_vertical_size'] - dC['pp_out_dia']) / 2;
      val = WSUtils.decFloor(val, 1);
      dC['pp_push_side'] = val;
      dC['pp_push_vertical'] = val;
      dC['pw_side_count'] = dC['pp_result_num'];
      return {
        'text': dC['pp_result_num'],
        'value': dC['pp_result_num'],
      };
    } else {
      // 手入力で元の値に戻した時、再度値を更新する必要あり
      // dC['pp_result_num'] = v;
      val = dC['pp_result_num'] * (Number(num1) + Number(num2)) + Number(num1);
      val = WSUtils.decFloor(val, 2);
      if (dC['pp_out_dia'] !== val) {
        // 突き出しと線外々も更新
        val = dC['pp_result_num'] * (Number(num1) + Number(num2)) + Number(num1);
        val = WSUtils.decFloor(val, 2);
        dC['pp_out_dia'] = val;
        val = (dC['pw_vertical_size'] - dC['pp_out_dia']) / 2;
        val = WSUtils.decFloor(val, 1);
        dC['pp_push_side'] = val;
        dC['pp_push_vertical'] = val;
        return {
          'text': dC['pp_result_num'],
          'value': dC['pp_result_num'],
        };
      } else {
        // 自動値の場合は、元々の値でよいので戻る
        dC['pp_result_num'] = WSUtils.decFloor(dC['pw_vert_num'], 0);
        return {
          'text': dC['pp_result_num'],
          'value': dC['pp_result_num'],
        };
      }
    }
  } else {
    if (!isSet(dC['pw_g_sheets_calc'])) {
      // 本数計算が入っていなかったら戻る
      dC[columnName] = '';
      return {
        'text': '',
        'value': '',
      };
    }
    // ヘッダ値取得
    let num1 = calcPGs.pgProdMold.h1.dataView.getItems()[0]['pp_ed_sub_01'];
    let num2 = calcPGs.pgProdMold.h1.dataView.getItems()[0]['pp_ed_sub_04'];
    // 手入力か自動入力か判断
    if (dC[columnName] !== WSUtils.decFloor(dC['pw_g_sheets_calc'], 0)) {
      // // 手入力
      // dC[columnName] = v;
      // 突き出しと線外々も更新
      val = dC[columnName] * (Number(num1) + Number(num2)) + Number(num1);
      val = WSUtils.decFloor(val, 2);
      dC['pw_g_out_dia'] = val;
      val = (dC['pw_g_size_side'] - dC['pw_g_out_dia']) / 2;
      val = WSUtils.decFloor(val, 1);
      dC['pw_g_push_side'] = val;
      dC['pw_g_push_vertical'] = val;
      return {
        'text': dC[columnName],
        'value': dC[columnName],
      };
    } else {
      // 手入力で元の値に戻した時、再度値を更新する必要あり
      // dC[columnName] = v;
      val = dC[columnName] * (Number(num1) + Number(num2)) + Number(num1);
      val = WSUtils.decFloor(val, 2);
      if (dC['pw_g_out_dia'] !== val) {
        // 突き出しと線外々も更新
        val = dC[columnName] * (Number(num1) + Number(num2)) + Number(num1);
        val = WSUtils.decFloor(val, 2);
        dC['pw_g_out_dia'] = val;
        val = (dC['pw_g_size_side'] - dC['pw_g_out_dia']) / 2;
        val = WSUtils.decFloor(val, 1);
        dC['pw_g_push_side'] = val;
        dC['pw_g_push_vertical'] = val;
        return {
          'text': dC[columnName],
          'value': dC[columnName],
        };
      } else {
        // 自動値の場合は、元々の値でよいので戻る
        dC[columnName] = WSUtils.decFloor(dC['pw_g_sheets_calc'], 0);
        return {
          'text': dC[columnName],
          'value': dC[columnName],
        };
      }
    }
  }
}

/**
 * ①②の金型データをグローバル変数に保存
 * @param {*} colField 
 * @param {*} dC 
 */
function setMoldData(colField, dC) {
  let arDetail = calcPGs.pgProdMold.d1.dataView.getItems();
  if (!dC[colField]) {
    return '';
  }
  if (colField.slice(-1) === '1') {
    gMold1Pitch = getMasterValue('ml_pitch', 'mold', dC[colField]);
    gMold1Gear = getMasterValue('ml_gear_num', 'mold', dC[colField]);
    gMold1Ctrl = getMasterValue('ml_control_num', 'mold', dC[colField]);
  } else {
    gMold2Pitch = getMasterValue('ml_pitch', 'mold', dC[colField]);
    gMold2Gear = getMasterValue('ml_gear_num', 'mold', dC[colField]);
    gMold2Ctrl = getMasterValue('ml_control_num', 'mold', dC[colField]);
  }
  return dC[colField];
}

/**
 * 全寸法
 * @param {*} v 
 * @param {*} dC 
 */
function calcGrSumSize(v, dC) {
  if (!isSet(dC['pw_g_vert']) || !isSet(dC['pw_g_num'])) {
    dC['pw_g_sum_size'] = '';
    return {
      'text': '',
      'value': '',
    }
  }
  // 全寸法が変更された場合ロスも変更される
  dC['pw_g_sum_size'] = Number(dC['pw_g_vert']) * Number(dC['pw_g_num']);
  dC['pw_g_loss'] = Number(dC['pw_g_sum_size']) - Number(dC['pw_g_size']);
  return {
    'text': dC['pw_g_sum_size'],
    'value': dC['pw_g_sum_size'],
  }
}


// function diaOutFormatter(v, dC) {
//   let arHeader1 = calcPGs.pgProdMold.h1.dataView.getItems();
//   if (!isSet(dC['pw_vert_num'])) {
//     return '';
//   }
//   let nFloor = (Number(dC['pp_result_num']) * (Number(arHeader1[0]['pp_ed_sub_01']) + Number(arHeader1[0]['pp_ed_sub_04']) ) * 10 + Number(arHeader1[0]['pp_ed_sub_01']) * 10 ) * 10;

//   // 突き出しも連鎖させる
//   dC['pp_push_side'] = Math.round((Number(dC['pw_vertical_size']) - Math.floor(nFloor) / 100) / 2 * 10) / 10;
//   dC['pp_push_vertical'] = Math.round((Number(dC['pw_vertical_size']) - Math.floor(nFloor) / 100) / 2 * 10) / 10;
//   return Math.floor(nFloor) / 100;

// }


/**
 * 金型が変更した場合の関連値更新
 * @param {*} dC 
 * @param {*} columnName 
 */
function calcAtMold(dC, columnName) {
  // 金型変更で再計算
  let arDetail1 = calcPGs.pgProdMold.d1.dataView.getItems();
  let arDetail2 = calcPGs.pgProdMold.d2.dataView.getItems();
  let arHeader2 = calcPGs.pgProdMold.h2.dataView.getItems();
  let val = '';

  // 金型データの更新があった場合は関連データを更新させる
  let pitch = getMasterValue('ml_pitch', 'mold', dC['pp_mold_01']);
  let gear = getMasterValue('ml_gear_num', 'mold', dC['pp_mold_01']);
  let ctl = getMasterValue('ml_control_num', 'mold', dC['pp_mold_01']);
  if (!isSet(gear)) {
    // データ未入力もしくは、データ取得できなかった場合
    dC[columnName] = '';
    return {
      'text': '',
      'value': '',
    };
  }
  if (gear === dC['ml_gear_num_01']) {
    // 変更なし
    dC[columnName] = dC[columnName];
    return {
      'text': dC[columnName],
      'value': dC[columnName],
    };
  }
  // 序列を更新 山数と織機がセットされているときのみ更新
  if (isSet(dC['pp_bump_num']) && isSet(dC['pp_weave_cd'])) {
    let str = calcSequence(dC['pp_bump_num'], pitch, dC['pp_weave_cd']);
    arHeader2[0]['pp_rate'] = str;
    calcPGs.pgProdMold.h2.grid.invalidateRow(0);
    calcPGs.pgProdMold.h2.grid.render();
  }
  // 明細データの関連箇所も更新
  for (let i = 0; i < arDetail1.length; i++) {
    if (!isSet(arDetail1[i]['pw_side_num'])) {
      // 横枚数が入力されてない時はスルー
      continue;
    }
    val = Number(arDetail1[i]['pw_width_size']) * Number(arDetail1[i]['pw_side_num']) / gear / pitch * 30;
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    arDetail1[i]['pp_ch_calc'] = val;
    arDetail1[i]['pp_ch_cut'] = WSUtils.decCeil(val, 0);
    // ch決定
    arDetail1[i]['pp_ch_result'] = WSUtils.numCeil(arDetail1[i]['pp_ch_cut'], ctl);
    // 寸法切り上げ
    val = arDetail1[i]['pp_ch_cut'] * gear * pitch / 30;
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    arDetail1[i]['pp_size_cut'] = val;
    // 寸法決定
    val = arDetail1[i]['pp_ch_result'] * gear * pitch / 30;
    val = WSUtils.decCeil(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    arDetail1[i]['pp_size_result'] = val;
    // ロス切り上げ
    val = arDetail1[i]['pp_size_cut'] - Number(dC['pw_width_size']) * Number(arDetail1[i]['pw_side_num']);
    val = WSUtils.decFloor(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    arDetail1[i]['pp_loss_cut'] = val;
    // ロス決定
    val = arDetail1[i]['pp_size_result'] - Number(arDetail1[i]['pw_width_size']) * Number(arDetail1[i]['pw_side_num']);
    val = WSUtils.decFloor(val, 2);
    val = WSUtils.toPadDecStr(val, 2);
    arDetail1[i]['pp_loss_result'] = val;
    calcPGs.pgProdMold.d1.grid.invalidateRow(i);
  }
  calcPGs.pgProdMold.d1.grid.render();
  // Detail2も再描画
  //ch決定　pw_g_ch_result　ch切り上げデータがセットされていたらデータ取得
  for (let j = 0; j < arDetail2.length; j++) {
    if (!isSet(arDetail2[j]['pw_g_ch_cut'])) {
      // ch切り上げがセットされてなかったら戻る
      continue;
    }
    val = '';
    val = WSUtils.numCeil(Number(arDetail2[j]['pw_g_ch_cut']), ctl);
    arDetail2[j]['pw_g_ch_result'] = val;
    val = Number(arDetail2[j]['pw_g_ch_cut']) * pitch * gear / 30;
    val = WSUtils.decCeil(val, 2);
    arDetail2[j]['pw_g_size_cut'] = val;
    val = Number(arDetail2[j]['pw_g_ch_result']) * pitch * gear / 30;
    val = WSUtils.decCeil(val, 2);
    arDetail2[j]['pw_g_size_result'] = val;
    calcPGs.pgProdMold.d2.grid.invalidateRow(0);
    calcPGs.pgProdMold.d2.grid.render();
  }

  // 本人のデータをセットしてやる
  dC[columnName] = dC[columnName];
  return {
    'text': dC[columnName],
    'value': dC[columnName],
  };
}

/***
 * リピート品かどうか
 */
function isRepeat(dC, colField, value) {
  if (value == '' || value == null || value == undefined) {
    dC[colField] = '新規';
    return { 'text': '新規', 'value': '新規' };
  } else if (value === ' ') {
    dC[colField] = '新規';
    return { 'text': '新規', 'value': '新規' };
  } else {
    dC[colField] = 'リピート';
    return { 'text': 'リピート', 'value': 'リピート' };
  }
}


/**
 * 小数桁数指定　指定桁数に四捨五入します
 * @param {} row 
 * @param {*} cell 
 * @param {*} value 
 * @param {*} columnDef 
 * @param {*} dataContext 
 * @param {*} places 小数点以下桁数
 */
function FloatFormatter(row, cell, value, columnDef, dataContext, places) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  var nDecimals = places;

  if (typeof columnDef.editorFixedDecimalPlaces == 'number') {
    var nDecimals = columnDef.editorFixedDecimalPlaces;
  }

  return Number(value).toFixed(nDecimals);
}

/**
 * 製品マスタ　品名CD連結
 * @param {*} colField 
 * @param {*} value 
 * @param {*} dC 
 */
function makeCombineStr(colField, value, dC) {
  // どこまでセットされているか確認

  let nLayer = 0;
  let str = '';
  if (isSet(dC['prc_cat_04_cd'])) {
    nLayer = 4;
  } else if (isSet(dC['prc_cat_03_cd'])) {
    nLayer = 3;
  } else if (isSet(dC['prc_cat_02_cd'])) {
    nLayer = 2;
  } else if (isSet(dC['prc_cat_01_cd'])) {
    nLayer = 1;
  }

  if (nLayer <= 0) {
    dC[colField] = '';
    return { 'text': '', 'value': '' };
  }

  // コード連結
  if (nLayer === 4) {
    str = dC['prc_cat_01_cd'] + dC['prc_cat_02_cd'] + dC['prc_cat_03_cd'] + dC['prc_cat_04_cd'];
  } else if (nLayer === 3) {
    str = dC['prc_cat_01_cd'] + dC['prc_cat_02_cd'] + dC['prc_cat_03_cd'];
  } else if (nLayer === 2) {
    str = dC['prc_cat_01_cd'] + dC['prc_cat_02_cd'];
  } else if (nLayer === 1) {
    str = dC['prc_cat_01_cd'];
  }
  dC[colField] = str;
  return { 'text': str, 'value': str };
}



/**
 * 
 * @param {*} colField 
 * @param {*} value 
 * @param {*} dC 
 * @returns 
 */
function makeEstPrdNameFormatter(colField, value, dC) {
  let str = '';
  let str1 = '';
  let str2 = '';
  let str3 = '';
  // 品名マスタにデータがあったらそのデータを表示
  let strCD = '';
  let strCatName = '';
  let strProdName = '';

  if (!isSet(dC['prc_cat_01_cd'])) {
    dC[colField] = '';
    return { 'text': '', 'value': '' };
  } 

  // 品名マスタにまず検索に行く 但し正常系でない場合には、空で戻す
  if (isSet(dC['prc_cat_04_cd'])) {
    if (!isSet(dC['prc_cat_02_cd']) || !isSet(dC['prc_cat_03_cd'])) {
      dC[colField] = '';
      return { 'text': '', 'value': '' };
    }
    strCD = dC['prc_cat_01_cd'] + dC['prc_cat_02_cd'] + dC['prc_cat_03_cd'] + dC['prc_cat_04_cd'];
  } else if (isSet(dC['prc_cat_03_cd'])) {
    if (!isSet(dC['prc_cat_02_cd'])) {
      dC[colField] = '';
      return { 'text': '', 'value': '' };
    }
    strCD = dC['prc_cat_01_cd'] + dC['prc_cat_02_cd'] + dC['prc_cat_03_cd'];
  } else if (isSet(dC['prc_cat_02_cd'])) {    
    strCD = dC['prc_cat_01_cd'] + dC['prc_cat_02_cd'];
  } else if (isSet(dC['prc_cat_01_cd'])) {
    
  } else {
    // DB定義的には可能だが、マスタモジュールで登録できないようになっているので、品名判定せず元に戻す
    dC[colField] = '';
    return { 'text': '', 'value': '' };
  }
  // 品名マスタにあれば、品名表示。なければ、新規登録のケースなので、品名分類マスタ参照
  strProdName = getMasterValue('p_name', 'product', strCD);
  if (isSet(strProdName)) {
    dC[colField] = strProdName;
    return { 'text': strProdName, 'value': strProdName };
  }

  // 品名分類①の省略名取得
  str1 = getMasterValue('prc_short_name', 'productcategory', '1-' + dC['prc_cat_01_cd'] + '-000-000').trim();
  // if (str1 === ' ') {
  //   str1 = '';
  // }

  // 品名分類で新規作成の分類がどこからかを判定
  if (isSet(dC['prc_cat_02_cd'])) {
    str2 = getMasterValue('prc_short_name', 'productcategory', '2-' + dC['prc_cat_01_cd'] + '-' + dC['prc_cat_02_cd'] + '-000');
    str = getMasterValue('p_name', 'product', dC['prc_cat_01_cd'] + dC['prc_cat_02_cd']);
  }
  if (!isSet(str2)) {
    // 中分類以降が新規
    strProdName = str1;
    if (isSet(dC['prc_cat_02_name'])) {
      strProdName += ' ' + dC['prc_cat_02_name'];
    }
    if (isSet(dC['prc_cat_03_name'])) {
      strProdName += ' ' + dC['prc_cat_03_name']; 
    }
    if (isSet(dC['prc_cat_04_name'])) {
      strProdName += ' ' + dC['prc_cat_04_name']; 
    }
    dC[colField] = strProdName;
    return { 'text': strProdName, 'value': strProdName };
  }
  
  if (isSet(dC['prc_cat_03_cd'])) {
    str3 = getMasterValue('prc_short_name', 'productcategory', '3-' + dC['prc_cat_01_cd'] + '-' + dC['prc_cat_02_cd'] + '-' + dC['prc_cat_03_cd']);
    str = getMasterValue('p_name', 'product', dC['prc_cat_01_cd'] + dC['prc_cat_02_cd'] + dC['prc_cat_03_cd']);
  }
  if (!isSet(str3)) {
    strProdName = str2;
    // 小分類以降が新規
    if (isSet(dC['prc_cat_03_name'])) {
      strProdName += ' ' + dC['prc_cat_03_name'];
    }
    if (isSet(dC['prc_cat_04_name'])) {
      strProdName += ' ' + dC['prc_cat_04_name']; 
    }
    dC[colField] = strProdName;
    return { 'text': strProdName, 'value': strProdName };
  } 

  // 上記以外は、分類4が新規登録の場合のみ
  if (isSet(dC['prc_cat_04_cd'])) {
    strProdName = str3;
    if (isSet(dC['prc_cat_04_name'])) {
      strProdName += ' ' + dC['prc_cat_04_name'];
    } 
    dC[colField] = strProdName;
    return { 'text': strProdName, 'value': strProdName };
  } else if (isSet(dC['prc_cat_03_cd'])) {
    dC[colField] = str3;
    return { 'text': str3, 'value': str3 };
  }

  // データの参照がうまく行かなかった場合のみここまでくる
  dC[colField] = '';
  return { 'text': '', 'value': '' }; 

}


/***
 * 製品マスタ　材質名取得
 */
function makeEstMaterialFormatter(colField, value, dC) {
  if (!isSet(dC['p_cd'])) {
    return { 'text': '', 'value': '' };
  }
  // 金網か
  let strType = getMasterValue('p_type', 'product', String(dC['p_cd']).substr(2, 3));
  if (strType === '100') {
    // 金網以外は、材質表示なし

  }

  // var mval = getMasterValue('m_name', 'material', String(dC['p_cd']).substr(0, 3));
  // if (mval === '' && dC['p_type'] === 1) {
  //   window.alert('該当の材料は登録されていません。');
  //   dC[colField] = '';
  //   return { 'text': '', 'value': '' };
  // }

  // if (dC['p_type'] == 1) {
  //   dC[colField] = mval;
  //   return { 'text': mval, 'value': mval };
  // } else if (dC['p_type'] == 0) {
  //   dC[colField] = '';
  //   return '';
  // } else {
  //   // データ未入力
  //   if (dC['p_cd'] === null || dC['p_cd'] === undefined || dC['p_cd'] === '') { 
  //     dC[colField] = '';
  //     return '';
  //   }
  //   dC[colField] = mval;
  //   return { 'text': mval, 'value': mval };
  // }
}

/**
 * 製品マスタ　織方名セット
 * @param {*} dC データコンテキスト
 */
function makeEstWeaveFormatter(colField, value, dC) {
  let isNothing = false;

  if (value === null || value === undefined || value === '') {
    isNothing = true;
    if (dC['p_cd'] === null || dC['p_cd'] === undefined) {
      return '';
    }
    if (dC['p_cd'].length > 4 && dC['p_name'] != undefined) {
      let data = dC['p_name'].split(' ', 2);
      if (data[1] === undefined) {
        data[1] = '';
      }
      return data[1];
    }
  }

  if (dC['p_type'] == 1) {
    if (isNothing) {
      dC[colField] = '';
      return '';
    } else {
      // dC['p_name'] = dC['p_name01'] + ' ' + val;
      return value;
    }
  } else if (dC['p_type'] == 0) {
    dC[colField] = '';
    return '';
  } else {
    // データ未入力
    if (isNothing) {
      dC[colField] = '';
      return '';
    }
    return value;
  }
}

/**
 * ロス率 金網
 * @param {*} v 
 * @param {*} dC 
 */
function calcLossRate(dC, columnName, v) {
  let num = ((1 + Number(dC['pp_ed_sub_04']) / 500) * (Number(dC['pp_dimension']) / Number(dC['pp_sum_sheets']) + (Number(dC['pp_ed_sub_05']) / 500))) / Number(dC['pp_dimension']) * Number(dC['pp_sum_sheets']);
  num = WSUtils.decCeil(num, 2);
  if (dC[columnName] !== num) {
    dC[columnName] = v;
    num = v;
  }
  dC[columnName] = num;
  return {
    'text': num,
    'value': num,
  };
}

/**
 * 重量　金網
 * @param {*} dC 
 * @param {*} columnName 
 */
function calcWeight(dC, columnName) {
  if (!isSet(dC['pp_loss_rate'])) {
    dC[columnName] = '';
    return {
      'text': '',
      'value': '',
    };
  }
  if (!isSet(dC['pp_unit_weight'])) {
    dC['pp_unit_weight'] = 0;
  }
  let num = Number(dC['pp_dimension']) * Number(dC['pp_unit_weight']) * Number(dC['pp_loss_rate']);
  num = WSUtils.decCeil(num, 0);
  dC[columnName] = num;
  return {
    'text': num,
    'value': num,
  };
}

/**
 * 0うめ
 * @param {*} r 
 * @param {*} c 
 * @param {*} v 
 * @param {*} cD 
 * @param {*} dC 
 */
function paddingFormatter(r, c, v, cD, dC) {
  let str = '';
  if (v === undefined || v === null || v === '') {
    return '';
  }
  if (v > 0) {
    switch (cD['field']) {
      case 'wv_cd':
        str = ('00' + Number(dC['wv_cd'])).slice(-2);
        break;
      case 'g_cd':
        str = ('00' + Number(dC['g_cd'])).slice(-2);
        break;
      case 'ml_cd':
        str = ('00000' + Number(dC['ml_cd'])).slice(-5);
        break;
      default:
        str = ('000' + (String(v) + 1)).slice(-3);
        break;
    }
    dC[cD['field']] = str;
    return str;
  } else {
    return '';
  }
}

/**
 * 金網計算　㎡単価算出
 * @param {*} dC 
 * @param {*} columnName 
 */
function calcAreaUnitPrice(dC, columnName) {
  let arHeader1 = calcPGs.pgProdMold.h1.dataView.getItems();
  if (!isSet(arHeader1[0]['pp_dimension']) && (!isSet(dC['pp_sum_plan_cost']) || dC['pp_sum_plan_cost'] <= 0)) {
    // 予定原価合計、総面積がなかった場合
    dC[columnName] = 0;
    return {
      'text': 0,
      'value': 0,
    };
  }
  let val = Number(dC['pp_sum_plan_cost']) / Number(arHeader1[0]['pp_dimension']);
  val = WSUtils.decRound(val, 2);
  val = WSUtils.toPadDecStr(val, 2);
  dC[columnName] = val;
  return {
    'text': val,
    'value': val,
  };
}


/**
 * 正味㎡ 
 * @param {*} v 
 * @param {*} dC 
 */
function calcRealArea(dC, columnName) {
  let rslt = dC[columnName];
  if (!isSet(dC['ecd_ed_sub_08']) && !isSet(dC['ecd_ed_sub_09'])) {
    // 寸法がセットされていない = データがない
    dC[columnName] = '';
    rslt = dC[columnName];
  } else {
    // 単位は0.1mmのみ考慮。m単位に換算 
    // ※正味㎡は、合計値がヘッダに指定されているため、修正の時はそちらも修正が必要
    let value = (dC['ecd_ed_sub_08'] * dC['ecd_ed_sub_09']) * (10 ** (-6)) * dC['ecd_quantity'];
    dC[columnName] = WSUtils.decCeil(value, 2);
    rslt = dC[columnName];
  }

  return {
    text: WSUtils.toPadDecStr(rslt, 2),
    value: rslt
  }
}


/**
 * ロス含む㎡　明細行
 * @param {*} dC 
 * @param {*} columnName 
 */
function calcAreaIncludeLoss(dC, columnName) {
  let rslt = dC[columnName];
  if (!isSet(dC['ecd_ed_sub_08']) && !isSet(dC['ecd_ed_sub_09'])) {
    // 寸法がセットされていない = データがない
    dC[columnName] = '';
    rslt = dC[columnName];
  } else {
    // 補足値は入力されていない場合0とみなす
    let value1 = 0;
    let value2 = 0;
    if (isSet(dC['ecd_ed_sub_10'])) {
      value1 = Number.parseFloat(dC['ecd_ed_sub_10']);
    }
    if (isSet(dC['ecd_ed_sub_11'])) {
      value2 = Number.parseFloat(dC['ecd_ed_sub_11']);
    }

    // 単位は0.1mmのみ考慮。m単位に換算 
    // ※ロス含む㎡は、合計値がヘッダに指定されているため、修正の時はそちらも修正が必要
    let value = ((Number.parseFloat(dC['ecd_ed_sub_08']) + value1) *
      (Number.parseFloat(dC['ecd_ed_sub_09']) + value2) *
      (10 ** (-6)) * dC['ecd_quantity']) +
      ((Number.parseFloat(dC['ecd_ed_sub_08']) + value1) *
        (10 ** (-6)) * value2 / 2);
    dC[columnName] = WSUtils.decCeil(value, 2);
    rslt = dC[columnName];
  }

  return {
    text: WSUtils.toPadDecStr(rslt, 2),
    value: rslt
  }
}

/**
 * 工数の合計金額計算
 * @param {*} dC 
 * @param {*} columnnName 
 * 
 * 材料費、工賃費、梱包費、運送費、作図経費が動くと同時に変動する
 */
function calcSumProcPrice(dC, columnName) {
  let weightLoss = 0;   // ロス含有重量
  let materialCost = 0; // 材料費@
  let processCost = 0;  // 工賃費@
  let nPCost = 0;       // 梱包費
  let nTCost = 0;       // 輸送費
  let nDCost = 0;       // 作図経費
  let value = 0;
  
  // 材料費、工賃費は、従来計算か、新計算で参照値が変わるため。
  if (dC['ec_reserve_01'] === '0' || !isSet(dC['ec_reserve_01'])) {
    // 従来ならば、従来計算版のロス含有重量 Defaultも従来
    weightLoss = Number.parseInt(dC['ec_loss_weight']);
  } else {
    weightLoss = Number.parseInt(dC['ec_loss_weight_02']);
  }

  if (isSet(dC['ec_material_unit_cost'])) {   
    materialCost = WSUtils.decCeil(Number.parseInt(dC['ec_material_unit_cost']) * weightLoss, 0);
  }

  if (isSet(dC['ec_wage'])) {
    processCost = WSUtils.decCeil(Number.parseInt(dC['ec_wage']) * weightLoss, 0);
  }
  if (isSet(dC['ec_packing_cost'])) {
    nPCost = Number.parseInt(dC['ec_packing_cost']);
  }
  if (isSet(dC['ec_transport_cost'])) {
    nTCost = Number.parseInt(dC['ec_transport_cost']);
  }
  if (isSet(dC['ec_drawing_cost'])) {
    nDCost = Number.parseInt(dC['ec_drawing_cost']);
  }

  value = materialCost + processCost + nPCost + nTCost + nDCost;
  dC[columnName] = value;
  return {
    'text': toJPY(dC[columnName]),
    'value': dC[columnName]
  };
}

/**
 * 平方面積当たりの金額 基本㎡@
 * @param {*} dC 
 * @param {*} columnName 
 * 合計金額変動に伴い、基本平方も変動する
 */
function calcCostPerArea(dC, columnName) {
  let rslt = 0;
  let items = calcPGs.pgEDCalc.h1.dataView.getItems();
  let area = items[0]['ec_calc_area'];

  if (!isSet(area)) {
    dC[columnName] = '';
    return {
      'text': '',
      'value': ''
    }
  }
  if (!isSet(dC['ec_sum_proc_price']) || dC['ec_sum_proc_price'] === '0') {
    dC[columnName] = 0;
    return {
      'text': 0,
      'value': 0
    }
  }
  rslt = Number.parseInt(dC['ec_sum_proc_price']) / area;
  rslt = WSUtils.decCeil(rslt, -1);
  dC[columnName] = rslt;
  return {
    'text': toJPY(rslt),
    'value': rslt,
  }
}


/**
 * 重量を算出 四捨五入 
 * @param {*} array 
 */
function calcWeightPerAreaFormatter(dC) {
  // 重量マスタと材質マスタから材質の重量を出して予定重量を算出 wm_weight
  let sg = getMasterValue('m_s_gravity', 'material', dC['m_cd']);   // 材質比重
  let wmCD = '';
  let wmDia = 0;
  let wmType = '';
  let wmMesh = 0;
  let wmUnit = 'mm';
  let wmWeight1 = 0;
  let wmWeight2 = 0;
  let nData = 0;

  wmCD = dC['m_cd'];
  wmDia = ('00000' + (dC['ec_ed_sub_01'] * 10)).slice(-5);
  wmType = dC['ec_ed_sub_03'];
  wmMesh = ('00000' + dC['ec_ed_sub_04']).slice(-5);
  wmUnit = dC['ec_ed_sub_06'];
  wmWeight1 = getMasterValue('wm_weight', 'weight', wmCD + '-' + wmDia + '-' + wmType + '-' + wmMesh + '-' + wmUnit);
  wmWeight1 = Number.parseFloat(wmWeight1).toFixed(2);
  if (dC['ec_ed_sub_01'] !== dC['ec_ed_sub_02']) {
    // 鋼線が縦横違うときは、他方も計算 異なるデータのみリセット＆再取得
    wmDia = '';
    wmMesh = '';

    wmDia = ('00000' + (dC['ec_ed_sub_02'] * 10)).slice(-5);
    wmMesh = ('00000' + dC['ec_ed_sub_05']).slice(-5);
    wmWeight2 = getMasterValue('wm_weight', 'weight', wmCD + '-' + wmDia + '-' + wmType + '-' + wmMesh + '-' + wmUnit);
    wmWeight2 = Number.parseFloat(wmWeight2).toFixed(2);

    wmWeight1 = Number.parseFloat((wmWeight1 + wmWeight2) / 2).toFixed(2);
  }

  nData = Number.parseFloat(sg).toFixed(3) * wmWeight1;
  nData = nData.toFixed(2);

  return { 'text': nData, 'value': nData };
}

/**
 * 材料費計算
 * @param {*} dC 
 * @param {*} columnName 
 */
function calcMaterialCost(dC, columnName) {
  let weightLoss = 0;
  if (dC['ec_reserve_01'] === '0' || !isSet(dC['ec_reserve_01'])) {
    // 従来ならば、従来計算版のロス含有重量 Defaultも従来
    weightLoss = Number.parseInt(dC['ec_loss_weight']);
  } else {
    weightLoss = Number.parseInt(dC['ec_loss_weight_02']);
  }
  if (!isSet(dC['ec_material_unit_cost']) || dC['ec_material_unit_cost'] === '0') {
    dC[columnName] = 0;
    return {
      'text': 0,
      'value': 0
    };
  }
  let value = Number.parseInt(dC['ec_material_unit_cost']) * weightLoss;
  value = WSUtils.decCeil(value, 0);
  dC[columnName] = value;
  return {
    'text': toJPY(dC[columnName]),
    'value': dC[columnName]
  };
}

/**
 * ロス含有重量
 * @param {*} v 
 * @param {*} dC 
 */
function calcWeightPlusLossFormatter(dC) {
  let num = 0;
  let num1 = 0;
  if (Number(dC['ec_digit']) > 0) {
    num1 = Math.ceil(Number(dC['ec_loss_area']) * Number(dC['ec_area_weight']) * 10 ^ Number(dC['ec_digit'])) / (10 * Number(dC['ec_digit']));
  } else {
    num1 = Math.ceil(Number(dC['ec_loss_area']) * Number(dC['ec_area_weight']));
  }
  return num;
}


/**
 * 工賃費計算
 * @param {*} dC 
 * @param {*} columnName 
 */
function calcWage(dC, columnName) {
  let weightLoss = 0;
  if (dC['ec_reserve_01'] === '0' || !isSet(dC['ec_reserve_01'])) {
    // 従来ならば、従来計算版のロス含有重量 Defaultも従来
    weightLoss = Number.parseInt(dC['ec_loss_weight']);
  } else {
    weightLoss = Number.parseInt(dC['ec_loss_weight_02']);
  }
  if (!isSet(dC['ec_wage']) || dC['ec_wage'] === '0') {
    dC[columnName] = 0;
    return {
      'text': 0,
      'value': 0
    };
  }
  let value = Number.parseInt(dC['ec_wage']) * weightLoss;
  value = WSUtils.decCeil(value, 0);
  dC[columnName] = value;
  return {
    'text': toJPY(dC[columnName]),
    'value': dC[columnName]
  };
  // let sheets = calcPGs.pgEDCalc.h1.dataView.getItems();
  // if (gSumSheet > 0 ) {
  //   let num = Number(dC['ec_wage']) * gSumSheet;
  //   gSumWage = num;
  //   return num;
  // } else {
  //   return 0;
  // }
}

/**
 * 金網指図計算　カム計算
 * @param {*} dC 
 * @param {*} columnName 
 */
function calcCam(dC, columnName) {
  if (!isSet(dC[columnName])) {
    dC[columnName] = '';
    return {
      'text': '',
      'value': '',
    };
  }
  let weaveCd = String(dC['pp_p_cd']).substring(5, 8);
  // let arHeader1 = calcPGs.pgProdMold.h1.dataView.getItems();
  let str = '';
  if (weaveCd === '001') {
    // クリンプ
    str = weaveCd + '-' + WSUtils.toPadDecStr(Number(dC['pp_bump_num']), 2);
    // arHeader1[0]['pp_cam'] = getMasterValue('cam_control', 'cam', str);
    dC['pp_cam'] = getMasterValue('cam_control', 'cam', str);
  } else if (weaveCd === '002') {
    // 平織
    let val = WSUtils.decRound(Number(dC['pp_ed_sub_04']) / Number(dC['pp_ed_sub_01']), 2);
    val = WSUtils.toPadDecStr(val, 2);
    str = weaveCd + '-' + val;
    // arHeader1[0]['pp_cam'] = getMasterValue('cam_control', 'cam', str);
    dC['pp_cam'] = getMasterValue('cam_control', 'cam', str);
  } else if (weaveCd === '003') {
    // フラットトップ
    let val = WSUtils.decRound(Number(dC['pp_ed_sub_04']) / Number(dC['pp_ed_sub_01']), 0);
    val = WSUtils.toPadDecStr(val, 2);
    str = weaveCd + '-' + val;
    // arHeader1[0]['pp_cam'] = getMasterValue('cam_control', 'cam', str);    
    dC['pp_cam'] = getMasterValue('cam_control', 'cam', str);
  } else {
    // 当てはまるコードがなかったら空を返す
    // arHeader1[0]['pp_cam'] = '';    
    dC['pp_cam'] = '';
  }
  // 序列計算 関連データセルが全てH1列にあるので、読込時に同時に更新させる
  let pitch = getMasterValue('ml_pitch', 'mold', dC['pp_mold_01']);
  if (isSet(pitch) && isSet(dC['pp_weave_cd'])) {
    // ピッチと織機が設定されていたら序列も計算
    let strRslt = calcSequence(dC['pp_bump_num'], pitch, dC['pp_weave_cd']);
    if (!isSet(strRslt)) {
      // arHeader1[0]['pp_rate'] = '';
      dC['pp_rate'] = '';
    } else {
      // arHeader1[0]['pp_rate'] = strRslt;
      dC['pp_rate'] = strRslt;
    }
  }

  // calcPGs.pgProdMold.h1.grid.invalidateRow(0);
  // calcPGs.pgProdMold.h1.grid.render();
  dC[columnName] = dC[columnName];
  return {
    'text': dC[columnName],
    'value': dC[columnName],
  };
}

/**
 * 織機変更時、序列更新
 * @param {*} dC 
 * @param {*} columnName 
 */
function setRate(dC, columnName) {
  let val = '';
  let valPitch = '';
  // let arHeader1 = calcPGs.pgProdMold.h1.dataView.getItems();
  if (!isSet(dC[columnName])) {
    dC[columnName] = '';
    return {
      'text': '',
      'value': '',
    };
  }
  // 織機CDが更新されたら、序列データ更新
  if (!isSet(dC['pp_bump_num']) && !isSet(dC['pp_mold_01'])) {
    dC[columnName] = dC[columnName];
    return {
      'text': dC[columnName],
      'value': dC[columnName],
    };
  }
  valPitch = getMasterValue('ml_pitch', 'mold', dC['pp_mold_01']);
  val = getMasterValue('wv_name', 'weave', dC[columnName]);
  if (dC['pp_weave_name'] !== val || dC['pp_weave_name'] === '') {
    // データが変更された
    // arHeader1[0]['pp_rate'] = calcSequence(dC['pp_bump_num'], valPitch, dC[columnName]);
    dC['pp_rate'] = calcSequence(dC['pp_bump_num'], valPitch, dC[columnName]);
    // calcPGs.pgProdMold.h1.grid.invalidateRow(0);
    // calcPGs.pgProdMold.h1.grid.render();
  }
  dC[columnName] = dC[columnName];
  return {
    'text': dC[columnName],
    'value': dC[columnName],
  };
}

/**
 * 序列計算 呼び出し先でredrawかけること
 */
function calcSequence(bumpNum, pitch, weaveCd) {
  let numRate = 0;    // 序列ベース
  let wRate = 0;    // 織機比率
  let str = '';
  let strResult = '';
  let num1 = 0;
  let arHeader1 = calcPGs.pgProdMold.h1.dataView.getItems();
  if (!isSet(bumpNum) || !isSet(pitch) || !isSet(weaveCd)) {
    // いずれのコードが欠けても算出不可
    return '';
  }
  if (Number(bumpNum) <= 0 || Number(pitch) <= 0 || Number(weaveCd) <= 0) {
    // 値が0だったら戻る
    return '';
  }
  wRate = getMasterValue('wv_rate', 'weave', weaveCd);
  wRate = wRate;
  numRate = wRate / (Number(pitch) * Number(bumpNum));
  numRate = WSUtils.decRound(numRate, 2);   // 小数第2位で四捨五入
  str = WSUtils.toPadDecStr(numRate, 1);
  switch (str.split('.')[1]) {
    case '0':
      strResult = str.split('.')[0] + 'N';
      break;
    case '1':
      num1 = Number(str.split('.')[0]) + 1;
      strResult = str.split('.')[0] + '×' + String(num1) + ',' + String(num1);
      break;
    case '2':
      num1 = Number(str.split('.')[0]) + 1;
      strResult = str.split('.')[0] + ',' + str.split('.')[0] + ',' + str.split('.')[0] + ',' + str.split('.')[0] + ',' + String(num1);
      break;
    case '3':
      num1 = Number(str.split('.')[0]) + 1;
      strResult = str.split('.')[0] + ',' + str.split('.')[0] + ',' + String(num1);
      break;
    case '4':
      num1 = Number(str.split('.')[0]) + 1;
      strResult = str.split('.')[0] + ',' + String(num1) + ',' + str.split('.')[0] + ',' + str.split('.')[0] + ',' + String(num1);
      break;
    case '5':
      num1 = Number(str.split('.')[0]) + 1;
      strResult = String(num1) + ',' + str.split('.')[0];
      break;
    case '6':
      num1 = Number(str.split('.')[0]) + 1;
      strResult = String(num1) + ',' + str.split('.')[0] + ',' + String(num1) + ',' + String(num1) + ',' + str.substr(0, 1);
      break;
    case '7':
      num1 = Number(str.split('.')[0]) + 1;
      strResult = String(num1) + ',' & String(num1) + ',' + str.split('.')[0];
      break;
    case '8':
      num1 = Number(str.split('.')[0]) + 1;
      strResult = String(num1) + ',' + String(num1) + ',' + String(num1) + ',' + str.split('.')[0];
      break;
    case '9':
      num1 = Number(str.split('.')[0]) + 1;
      strResult = String(num1) + '×' + String(num1) + ',' + str.split('.')[0];
      break;
    default:
      strResult = '';
  }
  return strResult;
}


/***
 * ヘッダから明細に　切断＠をデータコピー
 */
function setCutCost(value) {
  let details = calcPGs.pgEDCalc.d1.dataView.getItems();
  let nCost = 0;
  let bRslt = true;
  // 明細データが全て同じ値だった場合はデータ更新
  for (let j = 0; j < details.length; j++){
    if (details[j]['ecd_cut_cost'] !== String(nCost)) {
      bRslt = false;
    }
  }
  if (!bRslt) {
    return;
  }
  for (let i = 0; i < details.length; i++) {
    details[i]['ecd_cut_cost'] = value;
    calcPGs.pgEDCalc.d1.grid.invalidateRow(i);
  }
  calcPGs.pgEDCalc.d1.grid.render();
}



/***
 * 明細単価計算
 * ヘッダデータ更新により明細データ更新が走る
 */
function calcSUMUnitPrice(factor, digit) {
  // if (!gFactor) {
  //   return;
  // }
  // if (!gDigit) {
  //   gDigit = 0;
  // }
  // let nFactor = 0;  // 係数
  let nPrice = 0;   // 合計金額
  let nLoss = 0;    // ロス率　単価①のみに関与
  let weightLoss = 0;   // ロス含有重量
  let materialCost = 0;
  let processCost = 0;
  let nPCost = 0;
  let nTCost = 0;
  let nDCost = 0;
  let nArea = 0;
  let nCutCost = 0;
  let h1Data = calcPGs.pgEDCalc.h1.dataView.getItems();
  let details = calcPGs.pgEDCalc.d1.dataView.getItems();

  if (!details.length) {
    return 0;
  }

  // 単価①計算用のデータをチェック
  // ロス率
  nLoss = isSet(h1Data[0]['ec_loss_rate']) ? h1Data[0]['ec_loss_rate'] : 0;

  // 材料費、工賃費は、従来計算か、新計算で参照値が変わるため。
  if (h1Data[0]['ec_reserve_01'] === '0' || !isSet(h1Data[0]['ec_reserve_01'])) {
    // 従来ならば、従来計算版のロス含有重量 Defaultも従来
    if (!isSet(h1Data[0]['ec_loss_area']) || !isSet(h1Data[0]['ec_area_weight'])) {
      // ロス含む㎡と㎡重量が算出されてなければ
      weightLoss = 0;
    }
    // 負の数が入る場合があるので、あえて有効桁数はパースしない
    weightLoss = Number.parseFloat(h1Data[0]['ec_loss_area']) * Number.parseFloat(h1Data[0]['ec_area_weight']) * (h1Data[0]['ec_loss_rate'] / 100);
    weightLoss = WSUtils.decCeil(weightLoss, h1Data[0]['ec_w_digits']);
    // weightLoss = Number.parseInt(h1Data[0]['ec_loss_weight']);
  } else {
    weightLoss = Number.parseInt(h1Data[0]['ec_loss_weight_02']);
  }
  
  // 材料費
  if (isSet(h1Data[0]['ec_material_unit_cost'])) {   
    materialCost = WSUtils.decCeil(Number.parseInt(h1Data[0]['ec_material_unit_cost']) * weightLoss, 0);
  }
  // 工賃費
  if (isSet(h1Data[0]['ec_wage'])) {
    processCost = WSUtils.decCeil(Number.parseInt(h1Data[0]['ec_wage']) * weightLoss, 0);
  }
  if (isSet(h1Data[0]['ec_packing_cost'])) {
    nPCost = Number.parseInt(h1Data[0]['ec_packing_cost']);
  }
  if (isSet(h1Data[0]['ec_transport_cost'])) {
    nTCost = Number.parseInt(h1Data[0]['ec_transport_cost']);
  }
  if (isSet(h1Data[0]['ec_drawing_cost'])) {
    nDCost = Number.parseInt(h1Data[0]['ec_drawing_cost']);
  }
  // 合計金額
  nPrice = materialCost + processCost + nPCost + nTCost + nDCost;

  // 基本㎡＠
  nArea = Number.parseInt(nPrice) / h1Data[0]['ec_calc_area'];
  nArea = WSUtils.decCeil(nArea, -1);

  for (let i = 0; i < details.length; i++) {
    // 単価①
    details[i]['ec_unit_price'] = Math.ceil(details[i]['ecd_ed_sub_08'] * details[i]['ecd_ed_sub_09'] / Math.pow(10, 6) * nArea, h1Data[0]['ec_area_cost_digit']);

    if (!isSet(details[i]['ecd_cut_cost'])) {
      // 切断＠
      details[i]['ecd_cut_cost'] = 0;
    }
    for (let j = 0; j < 5; j++) {
      let name = 'ecd_process_' + ('00' + j + 1).slice(-2);
      if (details[i][name] === undefined || details[i][name] === '') {
        details[i][name] = 0;
      }
    }

    let num = Number(details[i]['ec_unit_price']) + Number(details[i]['ecd_cut_cost']) + Number(details[i]['ecd_process_01']) + Number(details[i]['ecd_process_02']) + Number(details[i]['ecd_process_03']) + Number(details[i]['ecd_process_04']) + Number(details[i]['ecd_process_05']);
    let sum = Math.ceil((num * h1Data[0]['ec_factor']) * Math.pow(10, h1Data[0]['ec_area_cost_digit'])) / Math.pow(10, h1Data[0]['ec_area_cost_digit']);

    details[i]['ecd_proc_cost'] = sum;
    calcPGs.pgEDCalc.d1.grid.invalidateRow(i);
  }
  calcPGs.pgEDCalc.d1.grid.render();
}

/**
 * 見積計算画面の金額を算出
 * @param {*} dC 
 */
function calcECDPrice(dC, columnName) {
  let num = 0;
  if (!isSet(dC['ecd_ed_sub_08'])) {
    dC[columnName] = '';
    return { 'text': '', 'value': '' };
  }
  // 修正単価が入力されていれば修正単価を採用する
  // 合計値をヘッダに持っているので修正するときはそちらも修正すること
  if (Number(dC['ecd_fix_unit_cost']) > 0) {
    num = Number(dC['ecd_fix_unit_cost']) * Number(dC['ecd_quantity']);
  } else {
    if (Number(dC['ecd_proc_cost']) > 0) {
      num = Number(dC['ecd_proc_cost']) * Number(dC['ecd_quantity']);
    }
  }
  dC[columnName] = toJPY(num);
  return { 'text': toJPY(num), 'value': num };
}

/**
 * 見積計算画面の合計単価 
 * @param {*} dC 
 * @param {*} colulmnName 
 * @param {*} type:0は原価、1は係数含む 
 */
function calcProcCost(dC, columnName, type) {
  let value = 0;
  // factor取得
  let items = calcPGs.pgEDCalc.h1.dataView.getItems();
  let factor = items[0]['ec_factor'];
  let digit = items[0]['ec_area_cost_digit'];
  if (!isSet(factor) && factor === '0') {
    // 係数未指定は計算不可
    dC[columnName] = '';
    return {
      'text': '',
      'value': ''
    }
  }
  if (!isSet(dC['ecd_ed_sub_08'])) {
    dC[columnName] = '';
    return {
      'text': '',
      'value': ''
    }
  }
  value = Number.parseInt(dC['ec_unit_price']) + Number.parseInt(dC['ecd_cut_cost']) + Number.parseInt(dC['ecd_process_01']) + Number.parseInt(dC['ecd_process_02']) + Number.parseInt(dC['ecd_process_03']) + Number.parseInt(dC['ecd_process_04']) + Number.parseInt(dC['ecd_process_05']);
  if (type === 1) { // 合計単価　その他は原価単価
    value = value * factor;
  }
  value = WSUtils.decCeil(value, digit);
  dC[columnName] = value;
  return {
    'text': toJPY(value),
    'value': dC[columnName]
  }
}


/**
 * 原価単価計算
 * @param {}} v 
 * @param {*} dC 
 */
function calcCostPrice(v, dC, colField) {
  let arH1 = calcPGs.pgEDCalc.h1.dataView.getItems();
  let arH2 = calcPGs.pgEDCalc.h2.dataView.getItems();
  let nFactor = arH1['ec_factor'];
  let nDigit = arH2['ec_area_cost_digit'];

  if (gFactor === 0) {
    // if (!isSet(nFactor) || nFactor === 0) {
    dC[colField] = 0;
    return { 'text': 0, 'value': 0 };
  }
  if (!isSet(dC['ecd_ed_sub_08'])) {
    dC[colField] = 0;
    return { 'text': 0, 'value': 0 };
  }
  let num = 0;

  num = (Number(dC['ed_unit_price']) + Number(dC['ecd_cut_cost']) + Number(dC['ecd_process_01']) + Number(dC['ecd_process_02']) + Number(dC['ecd_process_03']) + Number(dC['ecd_process_04']) + Number(dC['ecd_process_05'])) * Math.pow(10, gDigit);
  num = Math.round(num) / Math.pow(10, gDigit);
  dC[colField] = num;
  return { 'text': num, 'value': num };
}


function calcCutCost(v, dC) {
  let num = 0;
  gPerCutCost = Number(dC['ec_cut_cost']);
  let arH2 = calcPGs.pgEDCalc.d1.dataView.getItems();
  num = gPerCutCost * arH2.length;
  return num;
}


function getPerCutCost(v, dC) {
  if (!dC['ec_cut_cost']) {
    return 0;
  } else {
    gPerCutCost = Number(dC['ec_cut_cost']);
    return gPerCutCost;
  }
}

function toggleButtonFormatter(r, c, v, cD, dC) {
  if (dC['isExchanged'] === 0 || !isSet(dC['isExchanged'])) {
    return "<center><input class='toggle' type='button' id='" + dC['pw_prod_plan_sub_no'] + "' value='-'></center>";
  } else {
    return "<center><input class='toggle' type='button' id='" + dC['pw_prod_plan_sub_no'] + "' value='〇'></center>";
  }
}

$('body').on('click', '.toggle', function () {
  // 値の入れ替え
  let arItems = calcPGs.pgProdMold.d1.dataView.getItems();
  let num;
  for (let i = 0; i < arItems.length; i++) {
    if (arItems[i]['pw_prod_plan_sub_no'] === this.id) {
      num = i;
    }
  }
  let valueA = arItems[num]['pw_ed_sub_08'];
  let valueB = arItems[num]['pw_ed_sub_09'];
  arItems[num]['pw_ed_sub_09'] = valueA;
  arItems[num]['pw_ed_sub_08'] = valueB;
  // redraw前のデータを取得
  let x = $("#" + this.id).attr("value");
  calcPGs.pgProdMold.d1.grid.invalidateRow(num);
  calcPGs.pgProdMold.d1.grid.render();

  if (x === '-') {
    arItems[num]['isExchanged'] = 1;
    $("#" + this.id).attr("value", "〇");
  } else {
    arItems[num]['isExchanged'] = 0;
    $("#" + this.id).attr("value", "-");
  }

  recalcProdMoldDetails(arItems); 
});

/***
 * 金網製造指示　選択ボタン押下時のイベント処理
 */
function recalcProdMoldDetails(arDetail01) {
  let arHeader01 =  calcPGs.pgProdMold.h1.dataView.getItems();
  let arDetail02 = calcPGs.pgProdMold.d2.dataView.getItems();
  let recordData = [];
  let groupNo = '';
  let maxSub08 = 0;

  // 同じグループの中の最大値を取得
  for (let i = 0; i < arDetail02.length; i++) {
    maxSub08 = 0;
    for (let j = 0; j < arDetail01.length; j++) {
      if (arDetail02[i]['pw_group_sign'] === arDetail01[j]['pw_group_sign'] ) {
        if (maxSub08 < arDetail01[j]['pw_ed_sub_08']) {
          maxSub08 = arDetail01[j]['pw_ed_sub_08'];
        }
      }
    }

    arDetail02[i]['pw_g_size_side'] = maxSub08;
    arDetail02[i]['pw_g_sheets_calc'] = WSUtils.decFloor(maxSub08 / (arHeader01[0]['pp_ed_sub_01'] + arHeader01[0]['pp_ed_sub_04']), 2);
    arDetail02[i]['']
    calcPGs.pgProdMold.d2.grid.invalidateRow(0);
    calcPGs.pgProdMold.d2.grid.render();
  }
}


function setMoedNo(value, dC, colField) {
  if (value !== null) {
    return value;
  }
  let today = new Date();
  let y = ("00" + today.getFullYear()).slice(-2);
  let m = ("00" + (today.getMonth() + 1)).slice(-2);
  let d = ("00" + today.getDate()).slice(-2);
  let strDate = y + m + d;
  let strOrderNo = strDate + '0001';

  getMoedSerialNo().then(function (data, textStatus, jqXHR) {
    let resp = JSON.parse(data);
    if (resp[0]['maxno'] !== null) {
      strOrderNo = strDate + ('0000' + (Number(resp[0]['maxno']) + 1)).slice(-4);
    } else {
      strOrderNo = strDate + '0001';
    }
    let gdat = editPGs.pgMOD.h.dataView.getItems();
    dC[colField] = strOrderNo;
    return { 'text': strOrderNo, 'value': strOrderNo };
  });
}


/***
 * データの空チェック
 */
function isSet(value) {
  let bResult = true;
  if (String(value).trim() === '') {
    bResult = false;
  }
  if (value === '') {
    bResult = false;
  }
  if (value === undefined) {
    bResult = false;
  }
  if (value === null) {
    bResult = false;
  }
  return bResult;
}



/**
 * 発注金額計算
 * @param {*} value 
 * @param {*} dC 
 * @param {*} colField 
 * @param {*} mode 0:発注、1:検収
 */
function calcPrice(value, dC, colField, mode = 0) {
  // 金額＝取引数量*単価 ただし、単価数量が入っていた場合は、単価単位から金額を逆算する必要あり
  // よって、単価単位数量が入っていた場合は、金額計算をしない。入力値もしくは、既存値を表示
  // イベント発生順によっては、旧データを参照しに行くことがあるので、その都度計算させること
  // ↑修正
  // 単価数量=発注数量が入っていた場合は、単価単位×発注数量を求める
  // 2023/4/12修正：小数点以下切り捨て
  let mval = value;
  if (!isSet(dC['moed_unit_price'])) {
    // 単価入力なし
    dC[colField] = '';
    return '';
  }
  if (!isSet(dC['moed_unit_qty']) || Math.abs(dC['moed_unit_qty']) === 0.000) {
    // 単価数量の入力がない場合
    if (!isSet(dC['moed_quantity'])) {
      // 数量入力なしは戻る
      dC[colField] = '';
      return '';
    }
    mval = dC['moed_quantity'] * dC['moed_unit_price'];
    // 切り捨てのみ
    mval = Math.floor(mval);
    // if (gCustRound === '0') {
    //   // 切り捨て
    //   mval = Math.floor(mval);
    // } else if (gCustRound === '1') {
    //   // 四捨五入
    //   mval = Math.round(mval);
    // } else if (gCustRound === '2') {
    //   // 切り上げ
    //   mval = Math.ceil(mval);
    // } else {
    //   // 何も設定されてなかったら四捨五入。
    //   mval = Math.round(mval);
    // }

    dC[colField] = mval;
    
    // 合計額計算
    calcPriceSUM(mode);

    return { 'text': mval, 'value': mval };
  } else {
    // 単価単位数量が入っている場合は、購入数量が不明のため
    
    mval = dC['moed_unit_qty'] * dC['moed_unit_price'];
    // 切り捨てのみ
    mval = Math.floor(mval);
    // if (gCustRound === '0') {
    //   // 切り捨て
    //   mval = Math.floor(mval);
    // } else if (gCustRound === '1') {
    //   // 四捨五入
    //   mval = Math.round(mval);
    // } else if (gCustRound === '2') {
    //   // 切り上げ
    //   mval = Math.ceil(mval);
    // } else {
    //   // 何も設定されてなかったら四捨五入。
    //   mval = Math.round(mval);
    // }
  }

  dC[colField] = mval;

  // 単価単位の場合の合計額計算
  calcPriceSUM(mode);
  
  return { 'text': mval, 'value': mval };
}

/***
 * 消費税合計　仕入
 * moede 0:発注、1:検収
 */
function calcPriceSUM(mode) {
  let arHeader = [];
  let arDetailTemp = [];

  if (mode) {
    arHeader = editPGs.pgAT.h.dataView.getItems();
    arDetailTemp = editPGs.pgAT.d.dataView.getItems();
  } else {
    arHeader = editPGs.pgMOD.h.dataView.getItems();
    arDetailTemp = editPGs.pgMOD.d.dataView.getItems();  
  }

  // 不要なデータ削除
  let arDetail = arDetailTemp.filter((item) => {
    if (isSet(item['moed_product_cd'])) {
      return item;
    }
  });

  let tempPrice = 0;
  let nTax = 0;
  let ar = [];

  ar = Object.values( master['tax'] ).reduce((prev, recently) => prev['t_rate_change_date'] > recently['t_rate_change_date'] ? prev : recently )
  nTax = ar['t_rate'];

  for (let i = 0; i < arDetail.length; i++) {
    tempPrice += isSet(arDetail[i]['moed_money']) ? parseFloat(arDetail[i]['moed_money']) : 0;
  }

  // ヘッダ側にも、明細全行を更新させる処理があるため、無限ループを避けるために、合計値が同じ場合は、以降の処理を行わないようにする。
  if (tempPrice === parseInt(arHeader[0]['moed_sales_price'])) {
    return;
  }

  if (tempPrice === parseInt(arHeader[0]['moed_sales_price_BEFORE']) && isSet(arHeader[0]['moed_tax_sum_BEFORE'])) {
    return;
  }
  
  // 既存データがあり、現データと変わりない場合は戻る。消費税表記が手入力値と置き換えられるのを妨げるため
  if (tempPrice === arHeader[0]['moed_sales_price_BEFORE'] && arHeader[0]['moed_tax_sum_BEFORE'] === arHeader[0]['moed_tax_sum']) {
    return;
  }
  

  arHeader[0]['moed_sales_price'] = tempPrice;
  arHeader[0]['moed_tax_sum'] = tempPrice * (nTax / 100);

  if (mode) {
    editPGs.pgAT.h.grid.invalidate(0);
  } else {
    editPGs.pgMOD.h.grid.invalidate(0);
  }

}


/**
 * 発注画面専用
 * @param {}} value 
 * @param {*} dC 
 * @param {*} colField 
 */
function calcTaxPrice(value, dC, colField) {
  // 金額＝単価数量*単価　単価数量がない場合は、取引数量*単価で金額
  let mval = '';
  let nUnitPrice = 0;
  let nTax = 0;
  let ar = [];
  // 製品CDから税率取得
  let strTaxCd = getMasterValue('p_tax_rate_cd', 'product', dC['moed_product_cd']);
  if (isSet(strTaxCd)) {
    nTax = getMasterValue('t_rate', 'tax', strTaxCd);
  } else {
    ar = Object.values( master['tax'] ).reduce((prev, recently) => prev['t_rate_change_date'] > recently['t_rate_change_date'] ? prev : recently )
    nTax = ar['t_rate'];
  }

  if (!isSet(dC['moed_unit_price'])) {
    // 単価が設定されていない場合は空で戻す
    dC[colField] = '';
    return '';
  }

  if (isSet(dC['moed_unit_qty']) && Math.abs(dC['moed_unit_qty']) > 0) {
    // 単価数量がある場合
    // 単価数量がある場合は、入力された金額から消費税額を算出する
    mval = dC['moed_money'] * (nTax / 100);
    // mval = dC['moed_unit_qty'] * dC['moed_unit_price'] * (nTax / 100);
    if (gCustRound === '0') {
      // 切り捨て
      mval = Math.floor(mval);
    } else if (gCustRound === '1') {
      // 四捨五入
      mval = Math.round(mval);
    } else if (gCustRound === '2') {
      // 切り上げ
      mval = Math.ceil(mval);
    } else {
      // 何も設定されてなかったら四捨五入。
      mval = Math.round(mval);
    }
    dC[colField] = mval;
    return { 'text': mval, 'value': mval };
  } else {
    // 単価数量なし。通常の取引数量で計算
    if (isSet(dC['moed_quantity'])) {
      mval = dC['moed_quantity'] * dC['moed_unit_price'] * (nTax / 100);
      if (gCustRound === '0') {
        // 切り捨て
        mval = Math.floor(mval);
      } else if (gCustRound === '1') {
        // 四捨五入
        mval = Math.round(mval);
      } else if (gCustRound === '2') {
        // 切り上げ
        mval = Math.ceil(mval);
      } else {
        // 何も設定されてなかったら四捨五入。
        mval = Math.round(mval);
      }
      dC[colField] = mval;
      return { 'text': mval, 'value': mval };
    }
    dC[colField] = '';
    return '';
  }
}

function getHouseLotNo(dC, columnName) {
  // 入庫画面に自社ロット番号を表示
  if (!isSet(dC['moed_product_cd'])) {
    // 品番がセットされてなかったら無視
    dC[columnName] = '';
    return {
      'text': '',
      'value': '',
    };
  }
  let str = String(dC['moed_order_no']).substr(1) + dC['moed_sub_no'] + dC['moed_accept_sub_no'];
  dC[columnName] = str;
  return {
    'text': str,
    'value': str,
  };
}


/**
 * 納品データヘッダ用請求締日取得
 * @param {*} value 
 * @param {*} dC 
 */
function setCloseDate(value, dC, colField) {
  let tempValue = dateFormatter(value, dC);
  let mstCloseDay = '';
  let mstPaymentDay = '';
  if (!isSet(dC['s_customer_cd'])) {
    // 客先コードがセットされてなかった場合
    dC[colField] = '';
    dC['s_bill_close_date'] = '';
    dC['s_payment_plan_date'] = '';
    return {
      'text': '',
      'value': '',
    };
  }
  if (!isSet(dC['s_shipping_plan_date'])) {
    // 出荷予定日すらセットされてなかった場合
    dC[colField] = tempValue.value;
    dC['s_bill_close_date'] = '';
    dC['s_payment_plan_date'] = '';
    return {
      'text': tempValue.text,
      'value': tempValue.value,
    };
  }

  if (isSet(dC['s_shipping_date_BEFORE'])) {
    // 前回登録済みの場合で、変更がない場合
    if (dC['s_shipping_date'] === dC['s_shipping_date_BEFORE']) {
      dC[colField] = tempValue.value;
      return {
        'text': tempValue.text,     
        'value': tempValue.value,    
      }
    }
  }

  if (!isSet(dC['s_shipping_date']) && dC['s_shipping_plan_date_BEFORE'] === dC['s_shipping_plan_date']) {
    // 出荷日、出荷予定日に関して何も変更がない場合
    return {
      'text': tempValue.text,     
      'value': tempValue.value,    
    }
  }

  if (!isSet(dC['s_shipping_date'])) {
    dC[colField] = '';
  }
  
  // 請求締日
  // 空の時は通常と同様1か月ごとの請求とする
  let mstCloseMonth = isSet(getMasterValue('C_INVOICE_SIGN', 'customer', dC['s_customer_cd'])) ? 
  getMasterValue('C_INVOICE_SIGN', 'customer', dC['s_customer_cd']) : '1';

  // 都度請求の場合は、日付については空。
  if (parseInt(mstCloseMonth) > 0) {
    // 通常
    mstCloseDay = isSet(getMasterValue('C_FINALDAY', 'customer', dC['s_customer_cd'])) ? 
    getMasterValue('C_FINALDAY', 'customer', dC['s_customer_cd']) : '31'; 
  }

  if (Number(mstCloseMonth) > 0) {
    // 1以上の場合は、マイナス1した値
    mstCloseMonth = String(Number(mstCloseMonth) - 1);
  } 

  // 入金予定日
  // 空の時は翌月 
  const mstPaymentMonth = isSet(getMasterValue('C_RECEPTION_PAYMENT_SIGN', 'customer', dC['s_customer_cd'])) ? 
    getMasterValue('C_RECEPTION_PAYMENT_SIGN', 'customer', dC['s_customer_cd']) : '1';
    mstPaymentDay = isSet(getMasterValue('C_RECEPTION_PAYMENT_DAY', 'customer', dC['s_customer_cd'])) ? 
    getMasterValue('C_RECEPTION_PAYMENT_DAY', 'customer', dC['s_customer_cd']) : '0';
  if ((parseInt(mstPaymentMonth) <= 0) && mstPaymentDay === '0') {
    // 都度請求の場合
    mstPaymentDay = '';   // 後で、請求締日と同日をセットする。
  } 
  else {
    // 通常
    mstPaymentDay = isSet(getMasterValue('C_RECEPTION_PAYMENT_DAY', 'customer', dC['s_customer_cd'])) ? 
    getMasterValue('C_RECEPTION_PAYMENT_DAY', 'customer', dC['s_customer_cd']) : '31';
  }

  let lastDate = 31;
  let thisMonthDate = '';   // 出荷日が今月の締日より後か前かの判断用
  let shippingDate = '';    // 出荷日
  let shippingDateBefore = '';  
  let tempShippingDate = '';    // 日付算出用出荷日
  let closeDate = '';       // 締日
  let paymentDate = '';     // 入金予定日
  let offset = 0;           // 出荷日が締日後だった場合の翌月締日取得用
  let tempDate = '';        // 画面表示用テンポラリ

  if (isSet(dC['s_shipping_date'])) {
    shippingDate = WSUtils.convertStrToDate(dC['s_shipping_date']);
    tempShippingDate = WSUtils.convertStrToDate(dC['s_shipping_date']);
    shippingDateBefore = isSet(dC['s_shipping_date_BEFORE']) ? WSUtils.getStrDate(dC['s_shipping_date_BEFORE']) : '';
  } else {
    shippingDate = WSUtils.convertStrToDate(dC['s_shipping_plan_date']);
    tempShippingDate = WSUtils.convertStrToDate(dC['s_shipping_plan_date']);
    shippingDateBefore = isSet(dC['s_shipping_plan_date_BEFORE']) ? WSUtils.getStrDate(dC['s_shipping_plan_date_BEFORE']) : '';
  }
  // 出荷月の締日が何日になるか。
  thisMonthDate = new Date(shippingDate.getFullYear(), shippingDate.getMonth() + 1, 0);
  thisMonthDate = mstCloseDay === '31' ? thisMonthDate.getDate() : mstCloseDay;

  if (thisMonthDate === '') {
    // 都度請求
    closeDate = tempShippingDate.getFullYear() + '/' + ('00' + (tempShippingDate.getMonth() + 1)).slice(-2) + '/' + ('0' + tempShippingDate.getDate()).slice(-2);
    tempDate = closeDate;
  } else {
    // 通常請求
    if (thisMonthDate < shippingDate.getDate()) {
      // 締日より後
      offset = 1;
    }
    // setMonthの場合、該当月にその日がない場合は、翌月まで飛ぶので1日に置き換える
    tempShippingDate = new Date(tempShippingDate.setDate(1));
    // 請求月 
    closeDate = new Date(tempShippingDate.setMonth(tempShippingDate.getMonth() + Number(mstCloseMonth) + offset));
    // 月末取得
    lastDate = new Date(closeDate.getFullYear(), closeDate.getMonth() + 1, 0);
    // 請求日
    closeDate = mstCloseDay === '31' ? new Date(closeDate.setDate(Number(lastDate.getDate()))) :  new Date(closeDate.setDate(Number(mstCloseDay)));

    tempDate = closeDate.getFullYear() + '/' + ('00' + (closeDate.getMonth() + 1)).slice(-2) + '/' + ('0' + closeDate.getDate()).slice(-2);
  }
  // YYYYMMDD取得
  shippingDate = shippingDate.getFullYear() + ('00' + (shippingDate.getMonth() + 1)).slice(-2) + ('0' + shippingDate.getDate()).slice(-2);

  if (shippingDate !== shippingDateBefore) {
    // 日付変更された場合 算出した請求締日を取得
    dC['s_bill_close_date'] = tempDate;
    dC['s_bill_close_date_BEFORE'] = tempDate;
  } else {
    // 出荷日変更なしなのに、データが変更されたら、手入力の変更の方を優先する
    dC['s_bill_close_date'] = tempDate.replace('/', '') !== WSUtils.getStrDate(dC['s_bill_close_date']) ? dC['s_bill_close_date'] : tempDate;
    dC['s_bill_close_date_BEFORE'] = dC['s_bill_close_date'];
  }

  if (mstPaymentDay === '') {
    // 都度請求
    paymentDate = closeDate;
    tempDate = tempDate;
  } else {
    tempDate = '';
    // 上記同様に日付を1日にしておく。
    closeDate = new Date(closeDate.setDate(1));
    // 入金予定月
    paymentDate = new Date(closeDate.setMonth(closeDate.getMonth() + Number(mstPaymentMonth)));
    // 月末 
    lastDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0);
    // 入金予定日
    paymentDate = mstPaymentDay === '31' ? new Date(paymentDate.setDate(Number(lastDate.getDate()))) :  new Date(paymentDate.setDate(Number(mstPaymentDay)));

    tempDate = paymentDate.getFullYear() + '/' + ('00' + (paymentDate.getMonth() + 1)).slice(-2) + '/' + ('00' + paymentDate.getDate()).slice(-2);
  }

  if (shippingDate !== shippingDateBefore) {
    // 日付変更された場合 算出した入金予定日をセット
    dC['s_payment_plan_date'] = tempDate;
    dC['s_payment_plan_date_BEFORE'] = tempDate;
  } else {
    // 出荷日変更なしなのに、データが変更されたら、手入力の変更の方を優先する
    dC['s_payment_plan_date'] = tempDate.replace('/', '') !== WSUtils.getStrDate(dC['s_payment_plan_date']) ? dC['s_payment_plan_date'] : tempDate;
    dC['s_payment_plan_date_BEFORE'] = dC['s_payment_plan_date'];
  }
  dC['s_shipping_plan_date_BEFORE'] = dC['s_shipping_plan_date'];
  dC['s_shipping_date_BEFORE'] = tempValue.text;
  dC[colField] = tempValue.text;  
  return {
    'text': tempValue.text,     
    'value': tempValue.value,    
  }
}

function calcIncTaxPrice(value, dC, colField) {
  // 単価数量がない場合は、通常の単価×数量=金額　金額+消費税額
  // 単価数量がある場合は、入力された金額から消費税合計額を算出
  let mval = '';
  // 製品CDから税率取得
  let strTaxCd = getMasterValue('p_tax_rate_cd', 'product', dC['moed_product_cd']);
  let nTax = getMasterValue('t_rate', 'tax', strTaxCd);

  // 税設定がされていない場合は、消費税の最大値を取得する
  if (nTax === '') {
    var num = 0;
    // キーが文字列なので注意
    Object.keys(master['tax']).forEach(elm => {
      if (num < parseFloat(master['tax'][elm].t_rate)) {        
        num = parseFloat(master['tax'][elm].t_rate);
      }
    });
    nTax = num;
  }
  

  if (!isSet(dC['moed_unit_price'])) {
    // 単価がない
    dC[colField] = '';
    return '';
  }
  if (isSet(dC['moed_unit_qty']) && Math.abs(dC['moed_unit_qty']) > 0) {
    // 単価数量が入っている場合
    // mval = Math.round(dC['moed_unit_qty'] * dC['moed_unit_price'] * (1 + nTax / 100));
    // mval = dC['moed_unit_qty'] * dC['moed_unit_price'];
    mval = dC['moed_money'];
    if (gCustRound === '0') {
      // 切り捨て
      mval = Math.floor(mval);
      mval = Math.floor(mval * (1 + nTax / 100));
    } else if (gCustRound === '1') {
      // 四捨五入
      mval = Math.round(mval);
      mval = Math.round(mval * (1 + nTax / 100));
    } else if (gCustRound === '2') {
      // 切り上げ
      mval = Math.ceil(mval);
      mval = Math.ceil(mval * (1 + nTax / 100));
    } else {
      // 何も設定されてなかったら四捨五入。
      mval = Math.round(mval);
      mval = Math.round(mval * (1 + nTax / 100));
    }
    dC[colField] = mval;
    return { 'text': mval, 'value': mval };
  } else {
    if (isSet(dC['moed_quantity'])) {
      // 単価×数量の税込み額を計算
      // mval = Math.round(dC['moed_quantity'] * dC['moed_unit_price'] * (1 + nTax / 100));
      mval = dC['moed_quantity'] * dC['moed_unit_price'];
      if (gCustRound === '0') {
        // 切り捨て
        mval = Math.floor(mval);
        mval = Math.floor(mval * (1 + nTax / 100));
      } else if (gCustRound === '1') {
        // 四捨五入
        mval = Math.round(mval);
        mval = Math.round(mval * (1 + nTax / 100));
      } else if (gCustRound === '2') {
        // 切り上げ
        mval = Math.ceil(mval);
        mval = Math.ceil(mval * (1 + nTax / 100));
      } else {
        // 何も設定されてなかったら四捨五入。
        mval = Math.round(mval);
        mval = Math.round(mval * (1 + nTax / 100));
      }
      dC[colField] = mval;
      return { 'text': mval, 'value': mval };
    }
    dC[colField] = '';
    return '';
  }
}


// 見積書の製品手配方法
const estimateParrangement = {
  text: '',
  value: '',
  isFirstRenderFinished: false, // 表の初回描画が完了したかどうか
}
/**
 * 見積書画面の一括設定（製品手配方法）
 */
function SelectAllEstimateParrangement(row, cell, value, columnDef, dataContext) {
  // 一括設定と個別で明細行への設定を反映させるため、初回の描画時のみ設定する。
  if (!estimateParrangement.isFirstRenderFinished) {
    // 明細行
    const detailRows = editPGs.pgED.d.dataView.getItems();
    let descriptionIdx = -1;
    let nIndex = -1;
    if (columnDef) {
      Object.keys(master['parrangement']).forEach(function (key) {
        if (this[key]['par_cd'] === value) {
          nIndex = key.substring(4);
          descriptionIdx = key;

          // 明細行の製品手配方法を一括で設定
          detailRows.forEach(function (elem, i) {
            elem['ed_ar_cd'] = String(value);
            editPGs.pgED.d.grid.invalidateRow(i);
          });
          editPGs.pgED.d.redraw();
        }
      }, master['parrangement']);

      // 表示内容を保持
      estimateParrangement.text = nIndex >= 0 ? master['parrangement'][descriptionIdx]['par_name'] : (value ? value : '');
      estimateParrangement.value = value;
    }

    // このタイミングで初回描画完了とする
    estimateParrangement.isFirstRenderFinished = true; // 見積書の製品手配方法
  }
  
  return {
    'text': estimateParrangement.text,
    'value': estimateParrangement.value
  };
}

// 見積書の加工内容
const estimateArrangement = {
  text: '',
  value: '',
  isFirstRenderFinished: false, // 表の初回描画が完了したかどうか
}
/**
 * 見積書画面の一括設定（加工内容）
 */
function SelectAllEstimateArrangement(row, cell, value, columnDef, dataContext) {
  // 一括設定と個別で明細行への設定を反映させるため、初回の描画時のみ設定する。
  if (!estimateArrangement.isFirstRenderFinished) {
    // 明細行
    const detailRows = editPGs.pgED.d.dataView.getItems();
    let descriptionIdx = -1;
    let nIndex = -1;
    if (columnDef) {
      Object.keys(master['arrangement']).forEach(function (key) {
        if (this[key]['ar_sub_cd'] === value) {
          nIndex = key.substring(4);
          descriptionIdx = key;

          // 明細行の加工内容を一括で設定
          detailRows.forEach(function (elem, i) {
            elem['ed_parrangement_cd'] = String(value);
            editPGs.pgED.d.grid.invalidateRow(i);
          });
          editPGs.pgED.d.redraw();
        }
      }, master['arrangement']);

      // 表示内容を保持
      estimateArrangement.text = nIndex >= 0 ? master['arrangement'][descriptionIdx]['ar_name'] : (value ? value : '');
      estimateArrangement.value = value;
    }

    // このタイミングで初回描画完了とする
    estimateArrangement.isFirstRenderFinished = true; // 見積書の加工内容
  }
  
  return {
    'text': estimateArrangement.text,
    'value': estimateArrangement.value
  };
}

// 発注書の科目区分
const morderestimateTypeSubject = {
  text: '',
  value: '',
  isFirstRenderFinished: false, // 表の初回描画が完了したかどうか
}
/**
 * 発注書画面 科目区分の一括設定用フォーマッター
 */
function SelectAllMorderestimateTypeSubject(row, cell, value, columnDef, dataContext) {
  // 一括設定と個別で明細行への設定を反映させるため、初回の描画時のみ設定する。
  if (!morderestimateTypeSubject.isFirstRenderFinished) {
    if (!value) {
      // 意図しない明細データ変更を排除する。
      return {
        'text': '',
        'value': ''
      };
    }
    // 明細行
    const detailRows = editPGs.pgMOD.d.dataView.getItems();
    let descriptionIdx = -1;
    if (columnDef) {
      descriptionIdx = columnDef['options'].findIndex(function (elem) {
        return elem['key'] === value;
      });
    }

    // 表示内容を保持
    morderestimateTypeSubject.text = descriptionIdx >= 0 ? columnDef['options'][descriptionIdx]['val'] : '';
    morderestimateTypeSubject.value = value;

    // 明細行の科目区分を一括で設定
    detailRows.forEach(function (elem, i) {
      elem['moed_type_subject'] = String(value);
      editPGs.pgMOD.d.grid.invalidateRow(i);
    });
    editPGs.pgMOD.d.redraw();
  }
  return {
    'text': morderestimateTypeSubject.text,
    'value': morderestimateTypeSubject.value
  };
}

/**
 * 発注書画面 科目区分用フォーマッター
 * @returns 
 */
function SelectCellMorderestimateTypeSubject(row, cell, value, columnDef, dataContext) {
  let descriptionIdx = -1;
  if (columnDef) {
    descriptionIdx = columnDef['options'].findIndex(function (elem) {
      return elem['key'] === value;
    });
  }
  
  // このタイミングで初回描画完了とする
  morderestimateTypeSubject.isFirstRenderFinished = true; // 発注書の科目区分
  return {
    'text': descriptionIdx >= 0 ? columnDef['options'][descriptionIdx]['val'] : '',
    'value': value
  };
}

// 発注書の在庫区分
const morderestimateInventoryType = {
  text: '',
  value: '',
  isFirstRenderFinished: false, // 表の初回描画が完了したかどうか
}
/**
 * 発注書画面 在庫区分の一括設定用フォーマッター
 */
function SelectAllMorderestimateInventoryType(row, cell, value, columnDef, dataContext) {
  // 一括設定と個別で明細行への設定を反映させるため、初回の描画時のみ設定する。
  if (!morderestimateInventoryType.isFirstRenderFinished) {
    if (!value) {
      // 意図しない明細データ変更を排除する。
      return {
        'text': '',
        'value': ''
      };
    }
    // 明細行
    const detailRows = editPGs.pgMOD.d.dataView.getItems();
    let descriptionIdx = -1;
    if (columnDef) {
      descriptionIdx = columnDef['options'].findIndex(function (elem) {
        return elem['key'] === value;
      });
    }

    // 表示内容を保持
    morderestimateInventoryType.text = descriptionIdx >= 0 ? columnDef['options'][descriptionIdx]['val'] : '';
    morderestimateInventoryType.value = value;

    // 明細行の在庫区分を一括で設定
    detailRows.forEach(function (elem, i) {
      elem['moed_inventory_type'] = String(value);
      editPGs.pgMOD.d.grid.invalidateRow(i);
    });
    editPGs.pgMOD.d.redraw();
  }
  return {
    'text': morderestimateInventoryType.text,
    'value': morderestimateInventoryType.value
  };
}

/**
 * 発注書画面 在庫区分用フォーマッター
 * @returns 
 */
 function SelectCellMorderestimateInventoryType(row, cell, value, columnDef, dataContext) {
  let descriptionIdx = -1;
  if (columnDef) {
    descriptionIdx = columnDef['options'].findIndex(function (elem) {
      return elem['key'] === value;
    });
  }
  
  // このタイミングで初回描画完了とする
  morderestimateInventoryType.isFirstRenderFinished = true; // 発注書の在庫区分
  return {
    'text': descriptionIdx >= 0 ? columnDef['options'][descriptionIdx]['val'] : '',
    'value': value
  };
}

// 発注書の加工内容
const morderestimateArrangement = {
  text: '',
  value: '',
  isFirstRenderFinished: false, // 表の初回描画が完了したかどうか
}
/**
 * 発注書画面の一括設定（加工内容）
 */
function SelectAllMorderestimateArrangement(row, cell, value, columnDef, dataContext) {
  // 一括設定と個別で明細行への設定を反映させるため、初回の描画時のみ設定する。
    // 明細行
    const detailRows = editPGs.pgMOD.d.dataView.getItems();
    let descriptionIdx = -1;
    let nIndex = -1;
    if (columnDef) {
      Object.keys(master['arrangement']).forEach(function (key) {
        if (this[key]['ar_sub_cd'] === value) {
          nIndex = key.substring(4);
          descriptionIdx = key;

          // 明細行の加工内容を一括で設定
          detailRows.forEach(function (elem, i) {
            elem['moed_parrangement_cd'] = String(value);
            editPGs.pgMOD.d.grid.invalidateRow(i);
          });
          editPGs.pgMOD.d.redraw();
        }
      }, master['arrangement']);

      // 表示内容を保持
      morderestimateArrangement.text = nIndex >= 0 ? master['arrangement'][descriptionIdx]['ar_name'] : (value ? value : '');
      morderestimateArrangement.value = value;

    // このタイミングで初回描画完了とする
    morderestimateArrangement.isFirstRenderFinished = true; // 発注書の加工内容
  }
  
  return {
    'text': morderestimateArrangement.text,
    'value': morderestimateArrangement.value
  };
}

/***
 * 使用予定数、引当数を表示
 */
function setGridToPlanNum(pg) {
  const activeDetailStockPage = pg.divId;
  const activeRow = pg.getActiveRow();
  
  if (activeRow === null) {
    alert('行を選択してください。');
    return;
  }

  getActiveRowReserveNum(pg, activeDetailStockPage, activeRow);
}


