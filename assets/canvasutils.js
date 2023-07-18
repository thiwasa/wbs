/**
 * @fileOverview 製番リーフオブジェクト
 * @desc リーフの情報を保持します。
 * @author Fumihiko Kondo
 * @version 1.0
 */

/**
 * キャンバスに描画するパターンを保管するオブジェクト
 * @constructor
 */
function CanvasImage() {
  /**
   * 描画先キャンバス。
   * @type {HTMLCanvasElement}
   * @instance
   */
  this.tempCanvas = document.createElement('canvas');
  /**
   * 描画先キャンバスのコンテキスト。
   * @type {CanvasRenderingContext2D}
   * @instance
   */
  this.tempCtx = null;
  /**
   * 初回描画フラグ。
   * @type {boolean}
   * @instance
   */
  this.firstTimeDraw = true;
}

/**
 * キャンバスに指定した関数が示すパターンを描画する。
 * @param {CanvasRenderingContext2D} ctxDraw 描画対象のコンテキスト。
 * @param {*} funcDraw 描画するパターンを示す関数。
 * @param {number} x 描画先X座標。
 * @param {number} y 描画先Y座標。
 * @param {number} w 描画幅。
 * @param {number} h 描画高さ。
 * @param {*} [opt] funcDrawに渡すオプション引数。
 * @alias CanvasImage.prototype.draw
 */
CanvasImage.prototype.draw = function (ctxDraw, funcDraw, x, y, w, h, opt) {
  // 初回呼び出し時に画像を作成
  if (this.firstTimeDraw) {
    this.tempCanvas.width = w;
    this.tempCanvas.height = h;
    if (!this.tempCtx) { this.tempCtx = this.tempCanvas.getContext('2d'); }
    this.tempCtx.fillStyle = '#000000';
    funcDraw(this.tempCtx, opt);
    this.firstTimeDraw = false;
  }
  // 指定された位置に描画
  ctxDraw.drawImage(this.tempCanvas, Math.floor(x), Math.floor(y));
};

/**
 * 表示するテキスト内容を保管するオブジェクト
 * @constructor
 */
function CanvasText() {
  /**
   * フォントサイズ。
   * @type {number}
   * @instance
   */
  this.fontsize = 12;
  /**
   * フォントを示す文字列。
   * @type {string}
   * @instance
   */
  this.font = this.fontsize + 'px sans-serif';
  /**
   * 描画の位置。初期値では中央揃え。
   * @type {string}
   * @instance
   */
  this.align = 'c';
  /**
   * 描画先キャンバス。
   * @type {HTMLCanvasElement}
   * @instance
   */
  this.tempCanvas = document.createElement('canvas');
  /**
   * 描画先キャンバスのコンテキスト。
   * @type {CanvasRenderingContext2D}
   * @instance
   */
  this.tempCtx = null;
  /**
   * 初回描画フラグ。
   * @type {boolean}
   * @instance
   */
  this.firstTimeDraw = true;
  /**
   * 描画時の幅。
   * @type {number}
   * @instance
   */
  this.drawWidth = 1;
}

/**
 * キャンバスに指定テキストを描画する。
 * @param {CanvasRenderingContext2D} ctxDraw 描画対象のコンテキスト。
 * @param {string} text 描画するテキスト。
 * @param {number} x 描画先X座標。
 * @param {number} y 描画先Y座標。
 * @param {number} opt 飾り指定。1で下線描画
 * @alias CanvasText.prototype.draw
 */
CanvasText.prototype.draw = function (ctxDraw, text, x, y, opt) {
  // 初回呼び出し時に画像を作成
  if (this.firstTimeDraw) {
    // IE対応
    if (isIE) {
      this.font = this.fontsize + 'px MS PGothic';
    }
    var adj = 4;
    this.tempCanvas.height = this.fontsize + adj;
    if (!this.tempCtx) { this.tempCtx = this.tempCanvas.getContext('2d'); }
    this.tempCtx.font = this.font;
    this.tempCanvas.width = this.tempCtx.measureText(text).width + adj;
    this.drawWidth = this.tempCanvas.width;
    this.tempCtx.font = this.font;
    this.tempCtx.fillStyle = ctxDraw.fillStyle;
    this.tempCtx.fillText(text, 0, this.fontsize);
    // this.tempCtx.fillText('test', 0, this.fontsize + 2);
    if (opt === 1) {
      this.tempCtx.lineWidth = 1;
      this.tempCtx.strokeStyle = ctxDraw.fillStyle;
      this.tempCtx.beginPath();
      this.tempCtx.moveTo(Math.round(this.tempCtx.measureText(text.slice(0, 5)).width) + 1, 13.5);
      this.tempCtx.lineTo(Math.round(this.tempCtx.measureText(text.slice(0, 5)).width) + 23, 13.5);
      this.tempCtx.stroke();
    }
    this.firstTimeDraw = false;
  }
  // 中央、右、左のいずれかの位置に揃えて描画
  if (this.align === 'c') {
    ctxDraw.drawImage(this.tempCanvas, Math.floor(x + 2 - this.tempCanvas.width / 2), Math.floor(y));
  } else if (this.align === 'r') {
    ctxDraw.drawImage(this.tempCanvas, Math.floor(x + 4 - this.tempCanvas.width), Math.floor(y));
  } else {
    ctxDraw.drawImage(this.tempCanvas, Math.floor(x), Math.floor(y));
  }
};
