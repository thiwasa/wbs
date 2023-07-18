'use strict';

/**
 * @fileOverview 工程表ページ用共通処理関数
 * @desc 全体で共通して使われる関数を定義します。
 * @author Fumihiko Kondo
 */

// Array.prototype.findIndexブラウザ互換用コード
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function (predicate) {
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

/**
 * 共通処理用オブジェクト。
 * @class
 * @static
 */
var WSUtils = {
  /**
   * 引数がnull以外の場合文字列、nullの場合はnullを返す(DB向けJSON作成用)
   * @param {string} str 文字列
   * @return {string} nullまたは文字列
   */
  dbString: function (str) {
    if (str !== null) {
      return String(str);
    }
    return null;
  },
  /**
   * MySQLの日付表記をDateオブジェクトに変換して返す
   * @param {string} timeStr 日時を示す文字列
   * @return {Date} 対応するDateオブジェクト
   */
  convertMysqlDatetime: function (timeStr) {
    if (timeStr === null) {
      return new Date(0);
    }
    if (timeStr === '') {
      return new Date(0);
    }
    if (timeStr === '0' || timeStr === 0) {
      return new Date(0);
    }
    return new Date(timeStr.substr(0,4), timeStr.substr(4,2) - 1, timeStr.substr(6, 2));
  },
  convertDateToStr: function (dt) {
    // let dtData = new Date(dt);
    let y = dt.getFullYear();
    let m = ("00" + (dt.getMonth()+1)).slice(-2);
    let d = ("00" + dt.getDate()).slice(-2);
    let result = y + m + d;
    return result;
  },
  convertDateToStrTime: function (dt) {
    // let dtData = new Date(dt);
    let h = ("00" + dt.getHours()).slice(-2);
    let m = ("00" + (dt.getMinutes())).slice(-2);
    let result = h + m;
    return result;
  },
  /**
   * 文字列からDatetime型に変換　文字列はyyyymmddhhmm
   * @param {*} strDt 
   */
  convertStrToDate: function (strDt) {
    if (strDt === '') {
      return new Date(0);
    }
    if (strDt === null) {
      return new Date(0);
    }
    if (strDt === 0) {
      // null+nullの場合0になるので
      return new Date(0);
    }
    return new Date(strDt.substr(0, 4), strDt.substr(4,2) - 1, strDt.substr(6, 2), strDt.substr(8, 2), strDt.substr(10, 2));
  },
  /**
   * 四角形1と2が重なっているかを確認して返す
   * @param {number} rx1 四角形1の座標X
   * @param {number} ry1 四角形1の座標Y
   * @param {number} rw1 四角形1の幅
   * @param {number} rh1 四角形1の高さ
   * @param {number} rx2 四角形2の座標X
   * @param {number} ry2 四角形2の座標Y
   * @param {number} rw2 四角形2の幅
   * @param {number} rh2 四角形2の高さ
   * @return {boolean} 点を含む場合true, 含まない場合false
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
    var diffMinutes = Math.floor(diff / 60000);  // 1時間は3600000ミリ秒
    return diffMinutes;
  },
  /**
   * 日付の範囲を制限する
   * @param {Date} targetDate 制限対象の日付
   * @return {Date} 範囲制限後の日付。
   */
  limitDate: function (targetDate) {
    if (targetDate.getFullYear() < 1980) {
      return new Date(1980, 0, 1, 0, 0, 0, 0);
    } else if (targetDate.getFullYear() > 9999) {
      return new Date(9999, 11, 31, 0, 0, 0, 0);
    }
    return targetDate;
  },
  /**
   * 引数が整数であるかを判定して値を返す。整数以外の場合にはNaNを返す。
   * @param {*} value 判定対象の値
   * @return {number} 整数への変換結果
   */
  filterInt: function (value) {
    if (/^(\-|\+)?([0-9]+)$/.test(value)) {
      return Number(value);
    }
    return NaN;
  },
  /** 0埋め */
  zeroPadding: function(num,length){
    return ('0000000000' + num).slice(-length);
  },
  /**
   * 文字列についてタグのエスケープ処理を行う。
   * @param {string} string エスケープ対象の文字列
   */
  escapeHtml: function(string) {
    var entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
      return entityMap[s];
    });
  },
  /** データが空かどうか */
  isSet: function (value) {
    let bResult = true;
    if (String(value).trim() === '' ) {
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
  },
  /***
   * 画面表示用の日時取得
   * value: Date型
   */
  makeDateString: function (value) {
    let strY = value.getFullYear();
    let strM = ('00' + (value.getMonth() + 1)).slice(-2);
    let strD = ('00' + value.getDate()).slice(-2);
    let strH = ('00' + value.getHours()).slice(-2);
    let strMin = ('00' + value.getMinutes()).slice(-2);
    return strY + '/' + strM + '/' + strD + ' ' + strH + ":" + strMin;
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
   * ダイアログ表示用のyyyy/MM/dd HH:mmから、Date型に変換する
   */
  convertDlgStringToDate: function (value) {
    if (value === '') {
      return new Date(0);
    }
    return new Date(value.substr(0,4), value.substr(5,2) - 1, value.substr(8,2), value.substr(11,2), value.substr(14,2));
  }
};
