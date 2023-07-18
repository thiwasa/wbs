/**
 * @fileOverview 日程表ページ用共通処理関数
 * @desc 全体で共通して使われる関数を定義します。
 * @author Fumihiko Kondo
 */

// Object.assign互換用コード
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

// Array.prototype.findIndexブラウザ互換用コード
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;
    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}
// Array.prototype.indexOfブラウザ互換用コード
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    "use strict";
    if (this == null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = 0;
    if (arguments.length > 0) {
      n = Number(arguments[1]);
      if (n != n) {
        n = 0;
      } else if (n != 0 && n != Infinity && n != -Infinity) {
         n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}


/**
 * 共通処理用オブジェクト。
 * @class
 * @static
 */
var WSUtils = {
  /**
   * MySQLの日付表記をDateオブジェクトに変換して返す
   * @param {string} timeStr 日時を示す文字列
   * @return {Date} 対応するDateオブジェクト
   */
  convertMysqlDatetime: function (timeStr) {
    if (timeStr === null) {
      return new Date(0);
    }
    var str = String(timeStr);
    var regex;
    var parts;
    if (str.length > 10) {
      regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
      parts = str.replace(regex, '$1 $2 $3 $4 $5 $6').split(' ');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]),
        Number(parts[3]), Number(parts[4]), Number(parts[5]));
    }
    regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9])?$/;
    parts = str.replace(regex, '$1 $2 $3').split(' ');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0);
  },
  /**
   * 四角形1と2が重なっているかを確認して返す
   * @param rx1 四角形1の座標X
   * @param ry1 四角形1の座標Y
   * @param rw1 四角形1の幅
   * @param rh1 四角形1の高さ
   * @param rx2 四角形2の座標X
   * @param ry2 四角形2の座標Y
   * @param rw2 四角形2の幅
   * @param rh2 四角形2の高さ
   * @return 点を含む場合true, 含まない場合false
   */
  checkCollisionRect: function (rx1, ry1, rw1, rh1, rx2, ry2, rw2, rh2) {
    // 四角形の重心を計算
    var rxc1 = rx1 + rw1 / 2;
    var ryc1 = ry1 + rh1 / 2;
    var rxc2 = rx2 + rw2 / 2;
    var ryc2 = ry2 + rh2 / 2;
    // 四角形同士が接触しているかを判定
    if (Math.abs(rxc1 - rxc2) < (rw1 + rw2) / 2) {
      if (Math.abs(ryc1 - ryc2) < (rh1 + rh2) / 2) {
        return true;
      }
    }
    return false;
  },
  /**
   * 点が四角形に含まれるかを確認して返す
   * @param {number} ptX 点の座標X
   * @param {number} ptY 点の座標Y
   * @param {number} rX 四角形の座標X
   * @param {number} rY 四角形の座標Y
   * @param {number} rW 四角形の幅
   * @param {number} rH 四角形の高さ
   * @return {boolean} 点を含む場合true, 含まない場合false
   */
  checkHitRectPt: function (ptX, ptY, rX, rY, rW, rH) {
    if (ptX >= rX && ptX <= rX + rW) {
      if (ptY >= rY && ptY <= rY + rH) {
        return true;
      }
    }
    return false;
  },
  /**
   * 引数についてゼロ埋めを行った文字列を返す。
   * @param {number} num ゼロ埋め対象の数値
   * @param {number} digit 桁数(1～3)
   * @return {string} ゼロ埋めした結果となる文字列。
   */
  zeroFillStr: function (num, digit) {
    if (digit === 2) {
      return ('00' + num).slice(-2);
    } else if (digit === 3) {
      return ('000' + num).slice(-3);
    }
    return ('0' + num).slice(-1);
  },
  /**
   * 0埋め 複数桁数
   * @param {*} num 
   * @param {*} digit 
   */
  zeroPadding: function (num, digit) {
    return ( Array(digit).join('0') + num ).slice( -digit );
  },
  /**
   * 2つの日付の差を求める
   * @param {Date} dt1 日付の年月日1
   * @param {Date} dt2 日付の年月日2
   * @return {number} 日数の差、dt2が大きい場合に正
   */
  compareDay: function (dt1, dt2) {
    var dtC1 = new Date(dt1.getFullYear(), dt1.getMonth(), dt1.getDate());
    var dtC2 = new Date(dt2.getFullYear(), dt2.getMonth(), dt2.getDate());
    var diff = dtC2.getTime() - dtC1.getTime();
    var diffDay = Math.floor(diff / 86400000);  // 1日は86400000ミリ秒
    return diffDay;
  },
  /**
   * 2つの時間の差を求める
   * @param {Date} dt1 日付の年月日時1
   * @param {Date} dt2 日付の年月日時2
   * @return {number} 時間の差[h]、dt2が大きい場合に正
   */
  compareHours: function (dt1, dt2) {
    var dtC1 = new Date(dt1.getFullYear(), dt1.getMonth(), dt1.getDate(), dt1.getHours());
    var dtC2 = new Date(dt2.getFullYear(), dt2.getMonth(), dt2.getDate(), dt2.getHours());
    var diff = dtC2.getTime() - dtC1.getTime();
    var diffHour = Math.floor(diff / 3600000);  // 1時間は3600000ミリ秒
    return diffHour;
  },
  /**
   * 2つの分の差を求める
   * @param {Date} dt1 日付の年月日時1
   * @param {Date} dt2 日付の年月日時2
   * @return {number} 時間の差[m]、dt2が大きい場合に正
   */
  compareMinutes: function (dt1, dt2) {
    var dtC1 = new Date(dt1.getFullYear(), dt1.getMonth(), dt1.getDate(), dt1.getHours(), dt1.getMinutes());
    var dtC2 = new Date(dt2.getFullYear(), dt2.getMonth(), dt2.getDate(), dt2.getHours(), dt2.getMinutes());
    var diff = dtC2.getTime() - dtC1.getTime();
    var diffHour = Math.floor(diff / 60000);  // 1時間は3600000ミリ秒
    return diffHour;
  },

  /***
   * 日付セルのデータを日付型で取得
   */
  convertStrToDate: function (strDate) {
    if (!strDate) {
      return '';
    } 
    if (strDate === '') {
      return '';
    }
    let reg = '^[0-9]{4}/(0[1-9]|[1-9]|1[0-2])/(0[1-9]|[1-9]|[12][0-9]|3[01])$'
    let dTemp = '';
    if (strDate.match(reg)) {
      let arr = [];
      arr = strDate.split('/');
      dTemp = new Date(arr[0], arr[1] - 1, arr[2] );
    } else {
      dTemp = new Date(strDate.substring(0, 4), Number(strDate.substring(4, 6)) - 1, strDate.substring(6, 8));
    }
    return dTemp;
  },
  /***
   * 日付セルのデータを取得し、YYYYMMDDの形で取得
   */
  getStrDate: function (strDate) {
    if (!strDate) {
      return '';
    } 
    if (strDate === '') {
      return '';
    }
    let reg = '^[0-9]{4}/(0[1-9]|[1-9]|1[0-2])/(0[1-9]|[1-9]|[12][0-9]|3[01])$'
    let strTemp = '';
    if (strDate.match(reg)) {
      let arr = [];
      arr = strDate.split('/');
      strTemp = arr[0] + ('00' + arr[1]).slice(-2) + ('00' + arr[2]).slice(-2);
    } else {
      strTemp = strDate;
    }
    return strTemp;
  },
  /**
   * 文字列を数値に変換して返す。
   * @param {string} strProcessNo 対象リーフのオブジェクト
   * @return {number} 変換結果の数値。変換できない場合には0を返す
   */
  strToInt: function (strProcessNo) {
    if ($.isNumeric(Number(strProcessNo))) {
      return Number(strProcessNo);
    } else {
      return 0;
    }
  },

  /**
   * 切り上げ
   * @param {*} decValue 切り上げ対象桁まで整数
   * @param {*} digit 切り上げ桁
   */
  decCeil: function (decValue, digit) {
    let bMinus = false;
    if (decValue < 0) {
      bMinus = true;
      decValue = (-1) * decValue;
    }
    let n = 10 ** digit;
    let value = Math.ceil(decValue * n);
    value = Math.floor(value) / n;
    if (bMinus) {
      value = (-1) * value;
    }
    return value;
  },

  /**
   * 小数最下位の桁を0で補填し、文字列で返す
   * @param {*} decValue 
   * @param {*} digit 
   */
  toPadDecStr: function (decValue, digit) {
    if (!isSet(decValue)) {
      return 0;
    }
    return decValue.toFixed(digit);
  },

  /**
   * 切り捨て
   * @param {*} decValue 
   * @param {*} digit 
   */
  decFloor: function (decValue, digit) {
    let bMinus = false;
    if (decValue < 0) {
      bMinus = true;
      decValue = (-1) * decValue;
    }
    let n = 10 ** digit;
    let value = Math.floor(decValue * n);
    value = Math.floor(value) / n;
    if (bMinus) {
      value = (-1) * value;
    }
    return value;
  },

  /**
   * 四捨五入
   * @param {*} decValue:対象桁まで整数
   * @param {*} digit 
   */
  decRound: function(decValue, digit) {
    let bMinus = false;
    if (decValue < 0) {
      bMinus = true;
      decValue = (-1) * decValue;
    }
    let n = 10 ** digit;
    let value = Math.round(decValue * n);
    value = Math.floor(value) / n;
    if (bMinus) {
      value = (-1) * value;
    }
    return value;
  },
  /**
   * 指定単位で切り上げ
   * @param {*} value ：数値
   * @param {*} num  ：単位の数値
   */
  numCeil: function (value, num) {
    let val = this.decCeil((value / num), 0) * num;
    return val;    
  },
  /**
   * 指定単位で切り捨て
   * @param {*} value ：数値
   * @param {*} num ：単位の数値
   */
  numFloor: function (value, num) {
    let val = this.decFloor((value / num), 0) * num;
    return val;    
  },
  /***
   * 数値かどうか エクセル読込用
   * valueは文字列で入ってくる
   */
  isNumberXls: function (value) {
    if (typeof(value - 0) === 'number') {
      // 数値
      return true;
    }
    return false;
  }, 
  /**
   * 文字列長
   * @param {*} value 
   * @param {*} strLen 
   */
  validateStringLength: function (value, strLen) {
    if (!value) {
      return true;
    }
    return value.length <= strLen;
  },
  getTodayString: () => {
    // YYYYMMDD取得
    let today = new Date();
    let strDate = today.getFullYear().toString() + (today.getMonth() + 1).toString().padStart(2, '0') + today.getDate().toString().padStart(2, '0');
    return strDate;
  },
  validateStringNumber: function (value) {
    if (value) {
      if (parseInt(value) > 0) {
        return true;
      }
    } 

    return false;
  }


};
