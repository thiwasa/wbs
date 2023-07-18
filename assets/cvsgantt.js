'use strict';

/**
 * @fileOverview 工程表画面ガントチャートオブジェクト
 * @author Fumihiko Kondo
 */

/**
 * 行データ明示用オブジェクト
 * @constructor
 */
function RowObject() {
  this.id = 0;
  this.title = '';
  this.start_plan = new Date(0);
  this.finish_plan = new Date(0);
  this.row = 0;
  this.indent = 0;
  this.textAlign = 'right';
  this.isDayOnlyPlaceable = false;
}

var showDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0);

function setShowDate(selectedDate) {
  this.showDate = selectedDate;
}

function getShowDate() {
  return this.showDate;
}

/**
 * 画面表示用オブジェクト。
 * 描画方法を格納する。
 * また、表示結果に対するユーザの操作内容を保持する。
 * @constructor
 */
function View() {
  var self = this;
  /** 画面の幅 */
  this.screenWidth = 1560;
  /** 画面の高さ */
  this.screenHeight = 720;
  /** 行への表示内容 */
  this.rowdata = [
    new RowObject()
  ];
  /** 表の左上X座標 */
  this.tableX = 150;
  /** 表の左上Y座標 */
  this.tableY = 100;
  /** 表の行数 */
  this.row = 10;
  /** 表の列数 */
  this.col = 14;
  /** 表の横幅 */
  this.tableWidth = 1400;
  /** 表の縦幅 */
  this.tableHeight = 500;
  /** セルの横幅 */
  this.cellWidth = 100;
  /** セルの縦幅 */
  this.cellHeight = 50;
  /** 軸種類、画面上メニューのdata-leftaxisで指定 */
  this.axistype = 1;
  /** 表示中日付(左端) */
  this.displayingDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0);
  /** 表示中行番号 */
  this.displayingRow = 0;
  /** 完了済みリーフの表示フラグ、trueで表示あり */
  this.displayFinishedLeaf = true;
  /** 実績入力時の自動配置機能有効フラグ */
  this.isEnabledAutoReassign = true;
  /** マウスカーソルを乗せているスケジュールのID。 */
  this.mouseOveredInfoLfId = -1;
  /** マウスカーソルを乗せている箇所の情報。 */
  this.mouseOveredInfos = ['', '', '', '', ''];
  /** ツールチップ用配列 */
  this.tooltipTextObjs = [new CanvasText(), new CanvasText(), new CanvasText(), new CanvasText(), new CanvasText()];
  /** 画面の見出しテキスト */
  this.title = '-';
  /** 直前のX座標オフセット値 */
  this.prevXOffset = 0;
  /** 直前の表示中日付 */
  this.prevDisplayingDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0);
  /** 直前の表示中行番号 */
  this.prevDisplayingRow = 0;
  /** 検索結果一覧から選択したリーフのId。強調表示に使用 */
  this.searchedId = 0;
  /** 定数 */
  this.fixval = {
    /** リーフ1マス時の横幅 */
    LEAF_DEF_WIDTH: 80,
    /** リーフ1マス時の縦幅 */
    LEAF_DEF_HEIGHT: 30,
    /** リーフ1マスの開始時刻 */
    DAY_ST_HOUR: 0,
    /** リーフ1マスの終了時刻 */
    DAY_EN_HOUR: 24,
    /** 再読み込み時間[100ms] */
    PAGE_RELOAD_TIME: 600,
    /** 横スクロールバーでのスクロール日数 */
    H_SCROLLBAR_MAX: 7,
    /** getDayに対応する曜日 */
    WEEK_DAY: ['日', '月', '火', '水', '木', '金', '土'],
    /** 画面初期化前の表示 */
    LOADING_MSG: '読込中...',
    /** 出荷日程表　縦軸のセル個数 */
    LIST_DEF_VERTICAL_NUM: 50,
  };
}

/**
 * マウス等の入力に関する情報
 * @constructor
 */
function Input() {
  /** 現在のマウスX座標 */
  this.mouseX = 0;
  /** 現在のマウスY座標 */
  this.mouseY = 0;
  /** 移動前のマウスX座標 */
  this.mousePrevX = 0;
  /** 移動前のマウスY座標 */
  this.mousePrevY = 0;
  /** ドラッグ開始X座標 */
  this.dragStartX = 0;
  /** ドラッグ開始Y座標 */
  this.dragStartY = 0;
  /** ドラッグ開始X座標 */
  this.dragX = 0;
  /** ドラッグ開始Y座標*/
  this.dragY = 0;
  /** ドラッグ横幅 */
  this.dragW = 0;
  /** ドラッグ縦幅 */
  this.dragH = 0;
  /** マウスがクリックされている場合true */
  this.mouseClicked = false;
  /** 横スクロールバードラッグ中フラグ */
  this.isHScrollBarDragging = false;
  /** 横スクロールバードラッグ時マウス位置補正 */
  this.hBarDragAdj = 0;
  /** 縦スクロールバードラッグ中フラグ */
  this.isVScrollBarDragging = false;
  /** 縦スクロールバードラッグ時マウス位置補正 */
  this.vBarDragAdj = 0;
  /** スクロール先の日付 */
  this.dateScroll = new Date();
  /** ドラッグ中リーフ */
  this.draggingLeaf = null;
  /** 直前のドラッグ操作で1つ以上選択した場合、true */
  this.validDragFlag = false;
  /** 直前の検索キーワード */
  this.prevSearchKeyword = false;
}

/**
 * 工程表画面ガントチャートオブジェクト
 * @param {*} id ガントチャート識別用ID
 * @constructor
 */
function CVSGantt(id) {
  var self = this;
  /** ガントチャート識別用ID */
  this.id = id;
  /** 表示用データ */
  this.items = [new TaskObject()];
  /** ドキュメント参照用オブジェクト */
  this.doc = document;
  /** キャンバス(グリッド線など) */
  this.canvasBG = null;
  /** キャンバス(リーフ着色など) */
  this.canvasLC = null;
  /** キャンバス(最前面) */
  this.canvas = null;
  /** コンテキスト(グリッド線など) */
  this.ctxBG = null;
  /** コンテキスト(リーフ着色など) */
  this.ctxLC = null;
  /** コンテキスト(最前面) */
  this.ctx = null;
  /** グリッド枠線描画用オブジェクト */
  this.gridImg = new CanvasImage();
  /** 休日セル描画用オブジェクト */
  this.holidayImg = new CanvasImage();
  /** 入力あり検出用タイマ */
  this.mouseMovedTimerCount = 0;
  /** ウィンドウにフォーカスがある場合にtrue */
  this.hasFocus = true;
  /**
   * 表示に関する情報
   * @type {View}
   * @instance
   */
  this.v = new View();
  /**
   * 入力操作に関する内容
   * @type {Input}
   * @instance
   */
  this.i = new Input();
  /**
   * リーフクリック時のコンテキストメニュー
   * @type {jQuery}
   * @instance
   */
  this.contextmenu = null;
  /**
   * 画面読み込み時の初期化が完了した場合にtrue
   * @type {boolean}
   * @instance
   */
  this.isInited = false;

  /**
   * キャンバス要素とコンテキストメニューを設定
   * @param {string} bg
   * @param {string} lc
   * @param {string} front
   * @return {boolean} 完了時true、失敗時false
   * @instance
   */
  this.initElems = function (bg, lc, front, menuId) {
    // キャンバス3枚の初期化処理
    self.canvasBG = document.getElementById(bg);
    self.ctxBG = self.canvasBG.getContext('2d');

    self.canvasLC = document.getElementById(lc);
    self.ctxLC = self.canvasLC.getContext('2d');

    self.canvas = document.getElementById(front);
    self.ctx = self.canvas.getContext('2d');

    self.contextmenu = $('#' + menuId);
    return true;
  };

  /**
   * 描画処理　※リーフドラッグ後、ここの処理を呼び出し予定
   * @desc 枠線、リーフ、実績図形その他をキャンバスに描画します。
   */
  this.redrawCanvas = function () {
    // 表示クリア
    self.ctxBG.clearRect(0, 0, self.v.screenWidth, self.v.screenHeight);
    self.ctxLC.clearRect(0, 0, self.v.screenWidth, self.v.screenHeight);
    self.ctx.clearRect(0, 0, self.v.screenWidth, self.v.screenHeight);
    self.ctx.font = '12px sans-serif';
    self.ctxLC.font = '12px sans-serif';
    // 初期化中表示
    if (!self.isInited) {
      self.ctxBG.font = '20px sans-serif';
      self.ctxBG.fillStyle = '#000000';
      self.ctxBG.textAlign = 'center';
      self.ctxBG.fillText(self.v.fixval.LOADING_MSG, self.v.screenWidth / 2, self.v.screenHeight / 2 - 30);
      return;
    }
    /** 横スクロールバードラッグ中の表示オフセット値 */
    var xOffset = 0;
    if (self.i.isHScrollBarDragging) {
      xOffset = -Math.floor(Math.round((getHScrollBarPos() - 0.5) * self.v.fixval.H_SCROLLBAR_MAX * 2) * self.v.cellWidth);
    }
    // 休日及び休み時間の着色部分描画
    if (self.v.prevXOffset !== xOffset ||
      self.v.prevDisplayingDate.getTime() !== self.v.displayingDate.getTime() ||
      self.v.prevDisplayingRow !== self.v.displayingRow) {
      self.holidayImg.firstTimeDraw = true;
    }
    self.v.prevXOffset = xOffset;
    self.v.prevDisplayingDate = new Date(self.v.displayingDate.getTime());
    self.v.prevDisplayingRow = self.v.displayingRow;
    self.holidayImg.draw(self.ctxBG, drawHolidayColumn, 0, 0, self.v.screenWidth, self.v.screenHeight, xOffset);
    // 枠線の描画
    if (self.id === 'SHIP') {
      self.gridImg.draw(self.ctxBG, drawGridLinesForDays, 0, 0, self.v.screenWidth, self.v.screenHeight);
    } else {
      self.gridImg.draw(self.ctxBG, drawGridLines, 0, 0, self.v.screenWidth, self.v.screenHeight);
    }
    // リーフ図形と残業表示の描画
    var draggingLeafNo = self.i.draggingLeaf ? self.i.draggingLeaf.leaf_no : '';
    self.items.forEach(function (elem) {
      // 該当するリーフの担当者が表示範囲外にある場合、描画しない
      var isOutsideCol = (elem.x + elem.width + xOffset < -20) ||
        (elem.x + xOffset > self.v.screenWidth + 20);
      if (elem.row != -1 &&
        (elem.row < self.v.displayingRow
          || elem.row >= self.v.displayingRow + self.v.row
          || isOutsideCol || elem.leaf_no === draggingLeafNo)) {
        self.ctx.save();
        self.ctxLC.save();
        self.ctx.translate(xOffset, 0);
        self.ctxLC.translate(xOffset, 0);
        drawParentLeafLine(elem, self.ctx);
        self.ctx.restore();
        self.ctxLC.restore();
        return;
      }
      if (elem.row >= 0) {
        // 配置済みリーフ
        self.ctx.save();
        self.ctxLC.save();
        self.ctx.translate(xOffset, 0);
        self.ctxLC.translate(xOffset, 0);
        drawLeaf(elem);
        drawParentLeafLine(elem, self.ctx);
        self.ctx.restore();
        self.ctxLC.restore();
      } else {
        // 未割当欄のリーフ
        drawLeaf(elem);
      }
    });
    // 休日行と外枠線の描画
    self.ctx.lineWidth = 1;
    self.ctx.clearRect(0, self.v.tableY + self.v.row * self.v.cellHeight + 1, self.v.screenWidth, self.v.screenHeight);
    self.ctx.clearRect(0, 0, self.v.screenWidth, self.v.tableY);
    //clearHolidayColumn(xOffset);
    self.ctxLC.clearRect(0, self.v.tableY, self.v.tableX - 1, self.v.screenHeight);
    self.ctxLC.clearRect(self.v.tableX + self.v.col * self.v.cellWidth + 1, self.v.tableY, self.v.screenWidth, self.v.screenHeight);
    self.ctx.clearRect(0, self.v.tableY, self.v.tableX - 1, self.v.screenHeight);
    self.ctx.clearRect(self.v.tableX + self.v.col * self.v.cellWidth + 1, self.v.tableY, self.v.screenWidth, self.v.screenHeight);
    drawOuterGrid();
    // 日付と担当者の描画
    drawWeekdayPerson(self.v.displayingRow, self.v.displayingDate, xOffset);
    // スクロールバーの描画
    drawVScrollBar();
    drawHScrollbar();
    // ドラッグ中リーフを半透明表示
    if (self.i.draggingLeaf) {
      self.ctx.globalAlpha = 0.75;
      self.ctxLC.globalAlpha = 0.75;
      drawLeaf(self.i.draggingLeaf);
    }
    self.ctx.globalAlpha = 1;
    self.ctxLC.globalAlpha = 1;
    // 選択中リーフの内容を表示
    //drawSelectedDescription();
    // 選択範囲の表示
    if (self.i.mouseClicked === true && Math.abs(self.i.dragW) + Math.abs(self.i.dragH) > 0) {
      self.ctx.beginPath();
      self.ctx.lineWidth = 1;
      self.ctx.strokeStyle = 'rgba(0, 102, 204, 1)';
      self.ctx.rect(Math.floor(self.i.dragX) + 0.5, Math.floor(self.i.dragY) + 0.5, Math.floor(self.i.dragW), Math.floor(self.i.dragH));
      self.ctx.stroke();
      self.ctx.strokeStyle = '#000000';
      self.ctx.fillStyle = 'rgba(27, 180, 255, 0.2)';
      self.ctx.fill();
    }
    // シミュレーション状態表示
    // drawSimState(false);
    // ツールチップ表示(未選択のリーフのみ)
    if (self.v.mouseOveredInfoLfId >= 0
      && self.v.mouseOveredInfos[0] !== ''
      && !self.i.isHScrollBarDragging
      && !self.i.isVScrollBarDragging) {
      drawToolTip();
    }
  };

  /**
   * 日付と担当者の文字列を描画する
   * @param {number} rowOffset 画面の行数オフセット値
   * @param {Date} dateDisp 表示日付(左端)
   * @param {number} xOffset 画面のX座標オフセット値
   */
  var drawWeekdayPerson = function (rowOffset, dateDisp, xOffset) {
    // フォント設定
    self.ctxBG.textAlign = 'center';
    self.ctxBG.font = '14px sans-serif';
    // 日付と曜日を表の上部に描画
    var cntStart = Math.floor(-xOffset / self.v.cellWidth + 0.5);
    var cntFinish = Math.floor(self.v.col - xOffset / self.v.cellWidth + 0.5);
    var currentDate = new Date();
    var cellDate = new Date(dateDisp.getFullYear(), dateDisp.getMonth(), dateDisp.getDate());
    cellDate.setTime(cellDate.getTime() + 86400000 * cntStart);
    for (var i = cntStart; i < cntFinish; i++) {
      // 現在日時の周囲を描画
      if (WSUtils.compareDay(currentDate, cellDate) === 0) {
        self.ctxBG.strokeStyle = '#cccccc';
        self.ctxBG.lineWidth = 1;
        self.ctxBG.strokeRect(Math.floor(self.v.tableX + i * self.v.cellWidth + xOffset) + 0.5,
          self.v.tableY - 30 + 0.5, Math.floor(self.v.cellWidth) - 1, 23 - 1);
      }
      // 曜日の色を設定
      switch (cellDate.getDay()) {
        case 0:
          self.ctxBG.fillStyle = '#cc2020'; // 日曜日
          break;
        case 6:
          self.ctxBG.fillStyle = '#2040cc'; // 土曜日
          break;
        default:
          self.ctxBG.fillStyle = '#000000'; // その他
          break;
      }
      // 表示列数に応じて日付の書式を変更
      if (self.v.cellWidth >= 80) {
        self.ctxBG.fillText((cellDate.getMonth() + 1) + '/' + cellDate.getDate()
          + ' (' + self.v.fixval.WEEK_DAY[cellDate.getDay()] + ')',
          self.v.tableX + (i + 0.5) * self.v.cellWidth + xOffset, self.v.tableY - 14);
      } else if (self.v.cellWidth >= 40) {
        self.ctxBG.fillText((cellDate.getMonth() + 1) + '/' + cellDate.getDate(),
          self.v.tableX + (i + 0.5) * self.v.cellWidth + xOffset, self.v.tableY - 14);
      } else {
        if (cellDate.getDate() === 1 || cellDate.getDate() === 15) {
          self.ctxBG.fillText((cellDate.getMonth() + 1) + '/' + cellDate.getDate(),
            self.v.tableX + (i + 0.5) * self.v.cellWidth + xOffset, self.v.tableY - 14);
        }
      }
      // 描画日付を進める
      cellDate.setDate(cellDate.getDate() + 1);
    }
    // 担当者一覧を描画
    cellDate = new Date(dateDisp.getFullYear(), dateDisp.getMonth(), dateDisp.getDate());
    //self.ctxBG.textAlign = 'right';
    var canAssignAny = false;
    if (self.i.draggingLeaf) {
      // canAssignAny = self.v.rowdata.filter(function (elem) {
      //   return isAssignableMember(elem.id, self.i.draggingLeaf);
      // }).length === 0;
      canAssignAny = true;
    }
    for (var j = Number(rowOffset); (j < rowOffset + self.v.row) && (j < self.v.rowdata.length); j++) {
      var textX = self.v.rowdata[j].textAlign === 'right' ? self.v.tableX - 11 : self.v.rowdata[j].indent;
      self.ctxBG.textAlign = self.v.rowdata[j].textAlign;
      // プロジェクト表示中以外かつリーフドラッグ中の場合、割当可能担当者の色を分けて表示する
      // 指定なしの場合、全員担当可能とする。
      if (self.i.draggingLeaf && !canAssignAny) {
        self.ctxBG.fillStyle = (self.i.draggingLeaf && self.v.axistype !== -1) ? isAssignableMember(self.v.rowdata[j].id, self.i.draggingLeaf) ? '#000000' : '#a0a0a0' : '#000000';
      } else {
        self.ctxBG.fillStyle = '#000000';
      }
      self.ctxBG.fillText(self.v.rowdata[j].title,
        textX, self.v.tableY + 31 + self.v.cellHeight * (j - rowOffset));
      // プロジェクト予定期間の線分表示
      var psx = self.v.tableX + WSUtils.compareDay(cellDate, self.v.rowdata[j].start_plan) * self.v.cellWidth + xOffset;
      var psy = self.v.tableY + self.v.cellHeight * (j - rowOffset + 0.5);
      var pfx = self.v.tableX + (WSUtils.compareDay(cellDate, self.v.rowdata[j].finish_plan) + 1) * self.v.cellWidth + xOffset;
      var pfy = self.v.tableY + self.v.cellHeight * (j - rowOffset + 0.5);
      if (self.v.rowdata[j].start_plan.getTime() > 0) {
        // 開始点
        if (self.v.tableX <= psx && psx <= self.v.tableX + (self.v.cellWidth * self.v.col)) {
          self.ctxBG.fillStyle = '#333333';
          self.ctxBG.beginPath();
          self.ctxBG.arc(psx, psy, 5, 0, Math.PI * 2);
          self.ctxBG.closePath();
          self.ctxBG.fill();
        }
      }
      if (self.v.rowdata[j].finish_plan.getTime() > 0) {
        // 完了点
        if (self.v.tableX <= pfx && pfx <= self.v.tableX + (self.v.cellWidth * self.v.col)) {
          self.ctxBG.fillStyle = '#333333';
          self.ctxBG.beginPath();
          self.ctxBG.arc(pfx, pfy, 5, 0, Math.PI * 2);
          self.ctxBG.closePath();
          self.ctxBG.fill();
        }
      }
      if (self.v.rowdata[j].start_plan.getTime() > 0 && self.v.rowdata[j].finish_plan.getTime() > 0 &&
        psx <= self.v.tableX + (self.v.cellWidth * self.v.col) && self.v.tableX <= pfx) {
        // 線分
        self.ctxBG.lineWidth = 2;
        self.ctxBG.strokeStyle = '#333333';
        self.ctxBG.beginPath();
        self.ctxBG.moveTo(Math.max(self.v.tableX, psx), psy);
        self.ctxBG.lineTo(Math.min(self.v.tableX + (self.v.cellWidth * self.v.col), pfx), pfy);
        self.ctxBG.stroke();
      }
    }
  };

  /**
   * 外枠を描画する
   */
  var drawOuterGrid = function () {
    self.ctxBG.lineWidth = 2;
    self.ctxBG.lineCap = 'butt';
    self.ctxBG.strokeStyle = '#000000';
    self.ctxBG.beginPath();
    self.ctxBG.rect(self.v.tableX, self.v.tableY, self.v.tableWidth, self.v.tableHeight);
    self.ctxBG.stroke();
  };

  /**
   * 縦スクロールバーの位置を0.0から1.0の範囲で取得する
   * @return {number} スクロールバーの位置。(0.0～1.0)
   */
  var getVScrollBarPos = function () {
    var bSizeMag = self.calcVScrollBarSize();
    var barPosition = ((self.i.mouseY + self.i.vBarDragAdj) - bSizeMag / 2.0 - self.v.tableY) / (self.v.tableHeight - bSizeMag);
    if (barPosition < 0.0) {
      barPosition = 0.0;
    }
    if (barPosition > 1.0) {
      barPosition = 1.0;
    }
    return barPosition;
  };

  /**
   * 現在の縦スクロールバー位置で最上部に表示される人物を取得する
   * @return {number} 表示されるユーザの配列上添え字。
   */
  this.getVScrollBarVal = function () {
    var barPos = getVScrollBarPos();
    return Math.round(barPos * (self.v.rowdata.length - self.v.row));
  };

  /**
   * 縦スクロールバーのサイズを取得する
   * @return {number} スクロールバーのサイズ。
   */
  this.calcVScrollBarSize = function () {
    return self.v.tableHeight * self.v.row / self.v.rowdata.length;
  };

  /**
   * 横スクロールバーの位置を0.0から1.0の範囲で取得する
   * @return {number} スクロールバーの位置。(0.0～1.0)
   */
  var getHScrollBarPos = function () {
    var bSizeMag = self.calcHScrollBarSize();
    var barPosition = ((self.i.mouseX + self.i.hBarDragAdj) - bSizeMag / 2 - self.v.tableX) / (self.v.cellWidth * self.v.col - bSizeMag);
    if (barPosition < 0.0) {
      barPosition = 0.0;
    }
    if (barPosition > 1.0) {
      barPosition = 1.0;
    }
    return barPosition;
  };

  /**
   * 現在の横スクロールバー位置で左端に表示される日付を取得する
   * @return {Date} 左端に表示される日付を示すDateオブジェクト
   */
  this.getHScrollBarVal = function () {
    var barPos = getHScrollBarPos();
    var barNum = Math.round((barPos * (self.v.fixval.H_SCROLLBAR_MAX * 2)) - self.v.fixval.H_SCROLLBAR_MAX);
    var dateRet = new Date(self.v.displayingDate.getTime() + barNum * 86400000);
    return dateRet;
  };

  /**
   * 横スクロールバーのサイズを取得する
   * @return {number} スクロールバーのサイズ。
   */
  this.calcHScrollBarSize = function () {
    return self.v.tableWidth * self.v.fixval.H_SCROLLBAR_MAX / (self.v.fixval.H_SCROLLBAR_MAX * 3);
  };

  /**
   * 枠線を描画する
   * @param {CanvasRenderingContext2D} ctxGrids 枠線のコンテキスト。
   */
  var drawGridLines = function (ctxGrids) {
    // 枠線を描画
    ctxGrids.lineWidth = 2;
    ctxGrids.lineCap = 'butt';
    var dayLength = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
    var divHours = 1;
    for (var i = 0; i <= self.v.col; i++) {
      // 縦線
      ctxGrids.strokeStyle = '#c0c0c0';
      ctxGrids.beginPath();
      ctxGrids.moveTo(Math.floor(self.v.tableX + i * self.v.cellWidth), self.v.tableY - 0.5);
      ctxGrids.lineTo(Math.floor(self.v.tableX + i * self.v.cellWidth), self.v.tableY + self.v.tableHeight - 1);
      ctxGrids.closePath();
      ctxGrids.stroke();
      // 縦線2
      if (i < self.v.col) {
        ctxGrids.strokeStyle = '#e8e8e8';
        ctxGrids.lineWidth = 1;
        for (var j = divHours; j < dayLength; j += divHours) {
          ctxGrids.beginPath();
          var tmpx = Math.floor(self.v.tableX + i * self.v.cellWidth + (j / dayLength * self.v.cellWidth)) + 0.5;
          ctxGrids.moveTo(tmpx, self.v.tableY + 1.5);
          ctxGrids.lineTo(tmpx, self.v.tableY + self.v.cellHeight * self.v.row - 1);
          ctxGrids.closePath();
          ctxGrids.stroke();
        }
        ctxGrids.lineWidth = 2;
      }
    }
    for (var rowCnt = 0; rowCnt <= self.v.row; rowCnt++) {
      // 横線1
      ctxGrids.strokeStyle = '#c0c0c0';
      ctxGrids.beginPath();
      ctxGrids.moveTo(self.v.tableX + 1.5, self.v.tableY + rowCnt * self.v.cellHeight);
      ctxGrids.lineTo(self.v.tableX + self.v.cellWidth * self.v.col - 1.0, self.v.tableY + rowCnt * self.v.cellHeight);
      ctxGrids.closePath();
      ctxGrids.stroke();
    }
    ctxGrids.lineWidth = 1;
    for (var rowCntB = 0; rowCntB <= self.v.row; rowCntB++) {
      // 横線2
      ctxGrids.strokeStyle = '#e8e8e8';
      ctxGrids.beginPath();
      ctxGrids.moveTo(5.5, self.v.tableY + rowCntB * self.v.cellHeight + 0.5);
      ctxGrids.lineTo(self.v.tableX - 1.0, self.v.tableY + rowCntB * self.v.cellHeight + 0.5);
      ctxGrids.closePath();
      ctxGrids.stroke();
    }
    // タイトル表示
    ctxGrids.textAlign = 'center';
    ctxGrids.font = '28px sans-serif';
    ctxGrids.fillStyle = '#000000';
    ctxGrids.fillText(self.v.title, self.v.tableX + (self.v.col * self.v.cellWidth) / 2, 34);
    // その他の文字を描画
    ctxGrids.textAlign = 'left';
    ctxGrids.font = '14px sans-serif';
    ctxGrids.fillStyle = '#000000';
    ctxGrids.fillText('未割当', 20, 25);
    ctxGrids.textAlign = 'right';
    var hoursText = '1日: ' + self.v.fixval.DAY_ST_HOUR + '時 - ' + self.v.fixval.DAY_EN_HOUR + '時';
    ctxGrids.fillText(hoursText, self.v.tableX + self.v.cellWidth * self.v.col - 1, self.v.tableY + 18 + self.v.cellHeight * self.v.row);
  };

  /**
   * 日単位表示用横軸
   * @param {*} ctxGrids 
   */
  var drawGridLinesForDays = function (ctxGrids) {
    // 枠線を描画
    ctxGrids.lineWidth = 2;
    ctxGrids.lineCap = 'butt';
    var dayLength = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
    var divHours = 1;
    for (var i = 0; i <= self.v.col; i++) {
      // 縦線
      ctxGrids.strokeStyle = '#c0c0c0';
      ctxGrids.beginPath();
      ctxGrids.moveTo(Math.floor(self.v.tableX + i * self.v.cellWidth), self.v.tableY - 0.5);
      ctxGrids.lineTo(Math.floor(self.v.tableX + i * self.v.cellWidth), self.v.tableY + self.v.tableHeight - 1);
      ctxGrids.closePath();
      ctxGrids.stroke();
      // 縦線2
      // if (i < self.v.col) {
      //   ctxGrids.strokeStyle = '#e8e8e8';
      //   ctxGrids.lineWidth = 1;
      //   for (var j = divHours; j < dayLength; j += divHours) {
      //     ctxGrids.beginPath();
      //     var tmpx = Math.floor(self.v.tableX + i * self.v.cellWidth + (j / dayLength * self.v.cellWidth)) + 0.5;
      //     ctxGrids.moveTo(tmpx, self.v.tableY + 1.5);
      //     ctxGrids.lineTo(tmpx, self.v.tableY + self.v.cellHeight * self.v.row - 1);
      //     ctxGrids.closePath();
      //     ctxGrids.stroke();
      //   }
      //   ctxGrids.lineWidth = 2;
      // }
    }
    for (var rowCnt = 0; rowCnt <= self.v.row; rowCnt++) {
      // 横線1
      ctxGrids.strokeStyle = '#c0c0c0';
      ctxGrids.beginPath();
      ctxGrids.moveTo(self.v.tableX + 1.5, self.v.tableY + rowCnt * self.v.cellHeight);
      ctxGrids.lineTo(self.v.tableX + self.v.cellWidth * self.v.col - 1.0, self.v.tableY + rowCnt * self.v.cellHeight);
      ctxGrids.closePath();
      ctxGrids.stroke();
    }
    ctxGrids.lineWidth = 1;
    for (var rowCntB = 0; rowCntB <= self.v.row; rowCntB++) {
      // 横線2
      ctxGrids.strokeStyle = '#e8e8e8';
      ctxGrids.beginPath();
      ctxGrids.moveTo(5.5, self.v.tableY + rowCntB * self.v.cellHeight + 0.5);
      ctxGrids.lineTo(self.v.tableX - 1.0, self.v.tableY + rowCntB * self.v.cellHeight + 0.5);
      ctxGrids.closePath();
      ctxGrids.stroke();
    }
    // タイトル表示
    ctxGrids.textAlign = 'center';
    ctxGrids.font = '28px sans-serif';
    ctxGrids.fillStyle = '#000000';
    ctxGrids.fillText(self.v.title, self.v.tableX + (self.v.col * self.v.cellWidth) / 2, 34);
    // その他の文字を描画
    ctxGrids.textAlign = 'left';
    ctxGrids.font = '14px sans-serif';
    ctxGrids.fillStyle = '#000000';
    ctxGrids.fillText('未割当', 20, 25);
    ctxGrids.textAlign = 'right';
    var hoursText = '1日: ' + self.v.fixval.DAY_ST_HOUR + '時 - ' + self.v.fixval.DAY_EN_HOUR + '時';
    ctxGrids.fillText(hoursText, self.v.tableX + self.v.cellWidth * self.v.col - 1, self.v.tableY + 18 + self.v.cellHeight * self.v.row);
  };

  /**
   * 休日列の背景を描画する
   * @param {CanvasRenderingContext2D} ctxHd 枠線のコンテキスト。
   * @param {number} xOffset 画面のX座標オフセット値
   */
  var drawHolidayColumn = function (ctxHd, xOffset) {
    var rowOffset = self.v.displayingRow;
    var cntStart = Math.floor(-xOffset / self.v.cellWidth + 0.5);
    // 休日を描画
    ctxHd.clearRect(0, 0, self.v.screenWidth, self.v.screenHeight);
    ctxHd.fillStyle = '#e0e0e0';
    var cellDiv = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
    var cellMinW = self.v.cellWidth / cellDiv;
    // 表示中の行数分実行
    for (var j = Number(rowOffset); (j < rowOffset + self.v.row) && (j < self.v.rowdata.length); j++) {
      var colX = self.v.tableY + self.v.cellHeight;
      // 描画範囲を計算
      var dt = new Date(self.v.displayingDate.getTime() + cntStart * 3600000 * 24);
      dt.setHours(self.v.fixval.DAY_ST_HOUR);
      for (var i = cntStart * cellDiv; i < self.v.col * cellDiv + cntStart * cellDiv; i++) {
        if (self.v.fixval.DAY_EN_HOUR <= dt.getHours()) {
          dt.setTime(dt.getTime() + 3600000 * 24);
          dt.setHours(self.v.fixval.DAY_ST_HOUR);
        } else if (dt.getHours() < self.v.fixval.DAY_ST_HOUR) {
          dt.setHours(self.v.fixval.DAY_ST_HOUR);
        }
        if (!self.checkWorkableHour(dt, self.v.rowdata[j])) {
          ctxHd.fillRect(
            Math.floor(self.v.tableX + cellMinW * i) + xOffset,
            Math.floor(self.v.tableY + (self.v.cellHeight) * (j - rowOffset)),
            Math.ceil(cellMinW),
            self.v.cellHeight);
        }
        dt.setTime(dt.getTime() + 3600000);
      }
    }
  };

  /**
   * 縦スクロールバーを描画する
   */
  var drawVScrollBar = function () {
    if (self.v.rowdata.length <= self.v.row) {
      return;
    }
    var barPos;
    var bSizeMag = self.calcVScrollBarSize();
    if (self.i.isVScrollBarDragging) {
      barPos = getVScrollBarPos();
      self.ctx.strokeStyle = 'rgb(16, 16, 16)';
    } else {
      barPos = self.v.displayingRow / (self.v.rowdata.length - self.v.row);
      self.ctx.strokeStyle = 'rgb(102, 102, 102)';
    }
    var pX = self.v.tableX + self.v.cellWidth * self.v.col + 5.5;
    var pY = Math.floor(self.v.tableY + barPos * (self.v.cellHeight * self.v.row - bSizeMag)) + 0.5;
    var pW = 15;
    var pH = Math.floor(bSizeMag);
    if (pY + pH > self.v.tableY + self.v.cellHeight * self.v.row) {
      pY = self.v.tableY + self.v.cellHeight * self.v.row - pH;
    }
    self.ctx.beginPath();
    self.ctx.lineWidth = 1;
    self.ctx.rect(pX, pY, pW, pH);
    self.ctx.stroke();
  };

  /**
   * 横スクロールバーを描画する
   */
  var drawHScrollbar = function () {
    var barPos;
    var bSizeMag = self.calcHScrollBarSize();
    if (self.i.isHScrollBarDragging) {
      barPos = getHScrollBarPos();
      self.ctx.strokeStyle = 'rgb(16, 16, 16)';
    } else {
      barPos = 0.5;
      self.ctx.strokeStyle = 'rgb(102, 102, 102)';
    }
    var pX = Math.floor(self.v.tableX + barPos * (self.v.cellWidth * self.v.col - bSizeMag)) + 0.5;
    var pY = self.v.tableY + self.v.cellHeight * self.v.row + 5.5;
    var pW = Math.floor(bSizeMag);
    var pH = 15;
    self.ctx.beginPath();
    self.ctx.lineWidth = 1;
    self.ctx.rect(pX, pY, pW, pH);
    self.ctx.stroke();
  };

  /**
   * 親リーフとの関連線表示
   * @param {TaskObject} lf 描画対象リーフのオブジェクト(tasks)
   * @param {CanvasRenderingContext2D} ctxTarget 描画コンテキスト
   */
  var drawParentLeafLine = function (lf, ctxTarget) {
    if (lf.parent_id > 0) {
      ctxTarget.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctxTarget.lineWidth = 1;
      self.getParents(lf).forEach(function (elem) {
        ctxTarget.beginPath();
        ctxTarget.moveTo(lf.x + lf.width /* / 2.0 */, lf.y + lf.height / 2.0 + 0.5);
        ctxTarget.lineTo(elem.x /* + elem.width / 2.0 */ + 0.5, elem.y + elem.height / 2.0 + 0.5);
        ctxTarget.stroke();
      });
    }
  };

  /** 
   * リーフを描画する
   * @param {TaskObject} lf 描画対象リーフのオブジェクト(tasks)
   */
  var drawLeaf = function (lf) {
    // 実績入力済みの場合、実績枠を描画　※2023/6/29：実績登録はしないため、以下コメントアウト
    // if (lf.finish_date === null || lf.finish_date === '') {
    //   // // sono
    //   // return;
    // } else if (lf.finish_date.getTime() > 0) {
    //   var cellDiv = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
    //   var cellMinW = self.v.cellWidth / cellDiv;
    //   var cnt = (lf.finish_date.getTime() - lf.start_date.getTime()) / 3600000;
    //   // リーフがあればリーフの開始時間から、表示日付の差異をとりx軸を計算する
    //   var tblDate = new Date(lf.start_date.getFullYear(), lf.start_date.getMonth(), lf.start_date.getDate(),
    //     Math.max(self.v.fixval.DAY_ST_HOUR, lf.start_date.getHours()));
    //   var posDatetime = WSUtils.compareHours(self.v.displayingDate, tblDate);
    //   var daycnt = Math.floor(posDatetime / 24);
    //   var resultX = Math.round(self.v.tableX + colPosConv(lf, posDatetime) * self.v.cellWidth / cellDiv + daycnt * self.v.cellWidth);

    //   self.ctxLC.globalAlpha = 1;
    //   self.ctxLC.beginPath();
    //   self.ctxLC.fillStyle = lf.bgcolor;
    //   self.ctxLC.fillRect(resultX, lf.y - 9, cnt * cellMinW + 1, lf.height + 18);
    // }
    // リーフ背景描画(背景レイヤ)
    self.ctxLC.fillStyle = lf.bgcolor;
    self.ctxLC.fillRect(lf.x, lf.y, lf.width, lf.height);
    /**
     * 線と内容を描画する
     * @param {CanvasRenderingContext2D} ctxTarget 描画コンテキスト
     */
    function drawTextAndLine(ctxTarget) {
      // 選択時の青色枠線表示
      if (lf.selected === true) {
        ctxTarget.lineWidth = 2;
        ctxTarget.beginPath();
        ctxTarget.strokeStyle = 'rgb(0, 153, 204)';
        ctxTarget.rect(lf.x - 2, lf.y - 2, lf.width + 4, lf.height + 4);
        ctxTarget.stroke();
      }
      // 検索対象表示
      // if (self.v.searchedId === lf.leafs_id) {
      if (self.v.searchedId === lf.leaf_no) {
        ctxTarget.lineWidth = 4;
        ctxTarget.beginPath();
        ctxTarget.strokeStyle = 'rgb(204, 51, 51)';
        ctxTarget.rect(lf.x - 3, lf.y - 3, lf.width + 6, lf.height + 6);
        ctxTarget.stroke();
      }
      // リーフ影部分表示
      ctxTarget.lineWidth = 1;
      ctxTarget.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctxTarget.beginPath();
      ctxTarget.moveTo(lf.x, lf.y + lf.height + 1.5);
      ctxTarget.lineTo(lf.x + lf.width + 1.5, lf.y + lf.height + 1.5);
      ctxTarget.lineTo(lf.x + lf.width + 1.5, lf.y);
      ctxTarget.stroke();
      // リーフ枠線細線
      ctxTarget.strokeStyle = lf.bordercolor;
      ctxTarget.strokeRect(Math.floor(lf.x) - 0.5, Math.floor(lf.y) - 0.5, lf.width + 1, lf.height + 1);
      // リーフテキスト
      ctxTarget.fillStyle = lf.textcolor;
      lf.canvasTextTitle.draw(ctxTarget, lf.titleText, lf.x + lf.width / 2, lf.y);
      lf.canvasTextSub.draw(ctxTarget, lf.subText, lf.x + lf.width / 2, lf.y + 14);
    }
    /**
     * 他の横軸状態で割当されたことがある場合にはその範囲を表示する
     * @param {CanvasRenderingContext2D} ctxTarget 描画コンテキスト
     */
    function drawScheduledLine(ctxTarget) {
      var cellDiv = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
      var posDatetime = WSUtils.compareHours(self.v.displayingDate, lf.start_plan);
      var daycnt = Math.floor(posDatetime / 24);
      var lx = Math.round(self.v.tableX +
        colPosConv(lf, posDatetime) * self.v.cellWidth / cellDiv +
        daycnt * self.v.cellWidth);
      var lw = Math.round(lf.width);
      if (lx <= self.v.tableX + (self.v.cellWidth * self.v.col) &&
        self.v.tableX <= lx + lw) {
        ctxTarget.lineWidth = 1;
        ctxTarget.fillStyle = 'rgba(51,255,51,0.1)';
        ctxTarget.fillRect(Math.max(self.v.tableX, lx), self.v.tableY + 1.5,
          lw - Math.max(self.v.tableX - lx, 0) + Math.min(self.v.tableX + self.v.tableWidth - lx - lw, 0), self.v.tableHeight - 3);
      }
    }
    // リーフ本文描画
    var isDragging = false;
    if (self.i.draggingLeaf) {
      isDragging = lf.schedules_id === self.i.draggingLeaf.schedules_id;
    }
    if (isDragging && lf.row < 0) {
      drawScheduledLine(self.ctxBG);
    }
    if (lf.row < 0 || isDragging) {
      drawTextAndLine(self.ctxLC);
    } else {
      drawTextAndLine(self.ctx);
    }
    // 透明度を戻す
    self.ctx.globalAlpha = 1;
    self.ctxLC.globalAlpha = 1;
    return;
  };

  /**
   * ツールチップを描画。
   * マウスカーソルの位置に、リーフ内容の説明を描画します。
   */
  var drawToolTip = function () {
    self.v.tooltipTextObjs.forEach(function (elem) {
      elem.align = 'l';
    });
    var ttx = Math.round(self.i.mouseX);
    var tty = Math.round(self.i.mouseY + 23);
    var ttwidth = 0;
    var ttheight = 15;
    var ttlen = self.v.tooltipTextObjs.length;
    var i = 1;
    // 縦幅を表示文字列の行数に合わせる
    for (i = 1; i < ttlen; i++) {
      if (self.v.mouseOveredInfos[i] !== '') {
        ttheight += 16;
      }
    }
    // 横幅を表示文字列のサイズに合わせる
    self.ctx.fillStyle = '#000000';
    var textWidths = self.v.tooltipTextObjs.map(function (elem) { return elem.drawWidth; });
    ttwidth = Math.round(Math.max.apply(null, textWidths) + 5);
    if (self.v.tooltipTextObjs[0].firstTimeDraw === true) {
      for (i = 0; i < ttlen; i++) {
        self.v.tooltipTextObjs[i].draw(self.ctx, self.v.mouseOveredInfos[i], ttx + 3, -99, 0);
      }
      textWidths = self.v.tooltipTextObjs.map(function (elem) { return elem.drawWidth; });
      ttwidth = Math.round(Math.max.apply(null, textWidths) + 5);
    }
    // 表示がキャンバス右端からはみ出す場合、左方向に表示する
    if (ttx + ttwidth >= self.v.screenWidth) {
      ttx -= ttwidth;
    }
    // 内容を描画
    self.ctx.fillStyle = '#fdfdca';
    self.ctx.fillRect(ttx, tty, ttwidth, ttheight);
    self.ctx.lineWidth = 1;
    self.ctx.strokeStyle = '#000000';
    self.ctx.strokeRect(ttx + 0.5, tty + 0.5, ttwidth, ttheight);
    self.ctx.fillStyle = '#000000';
    self.v.tooltipTextObjs[0].draw(self.ctx, self.v.mouseOveredInfos[0], ttx + 3, tty, 0);
    for (i = 1; i < ttlen; i++) {
      if (self.v.mouseOveredInfos[i] !== '') {
        self.v.tooltipTextObjs[i].draw(self.ctx, self.v.mouseOveredInfos[i], ttx + 3, tty - 1 + 16 * i, 0);
      }
    }
  };

  /**
   * リーフが対象メンバーに割当可能であるかを判定する。
   * @param {Number} membersId メンバーID
   * @param {TaskObject} placingLeaf リーフ
   */
  var isAssignableMember = function (membersId, placingLeaf) {
    if (placingLeaf.assignableTo.indexOf(membersId) >= 0) {
      return true;
    }
    return false;
  };

  /**
   * シミュレーションモード状態を画面右上に表示
   * @param {boolean} isSimMode シミュレーションモード有効時にtrue
   */
  var drawSimState = function (isSimMode) {
    if (isSimMode === true) {
      self.ctx.strokeStyle.lineWidth = 1;
      self.ctx.strokeStyle = '#20b070';
      self.ctx.strokeRect(self.v.screenWidth - 170.5, 1.5, 127, 19);
      self.ctx.fillStyle = '#60f7b0';
      self.ctx.fillRect(self.v.screenWidth - 170, 2, 126, 18);
      self.ctx.textAlign = 'left';
      self.ctx.fillStyle = '#000000';
      self.ctx.fillText('シミュレーションモード', self.v.screenWidth - 168, 15, 120);
    }
  };

  /**
   * スケジュール表の表示日数範囲を加算する
   * @param {number} day 加算する日数
   */
  this.scrollTableX = function (day) {
    // リーフの選択をリセット
    self.i.mouseClicked = false;
    self.i.draggingLeaf = null;
    self.v.displayingDate.setDate(self.v.displayingDate.getDate() + day);
    if (self.id === 'SHIP') {
      self.assignShipLeafPositions();
    } else {
      self.assignLeafPositions();
    }
    // 再読込
    //ajaxReload();
    //self.canvas.dispatchEvent(new CustomEvent('tableScrolledH'));
    $(self.canvas).trigger('tableScrolledH', []);
  };

  /**
   * スケジュール表のX軸日付指定移動処理を実行する
   * @param {Date} targetDate 移動先の日付(左端)
   */
  this.scrollTableXAbs = function (targetDate) {
    targetDate = WSUtils.limitDate(targetDate);
    // スクロールバードラッグ中の場合、ドラッグ処理をキャンセル
    if (self.i.isHScrollBarDragging === true) {
      self.i.isHScrollBarDragging = false;
    }
    // リーフの選択をリセット
    self.i.mouseClicked = false;
    self.i.draggingLeaf = null;
    self.v.displayingDate = new Date(targetDate.getFullYear(),
      targetDate.getMonth(), targetDate.getDate());
    if (self.id === 'SHIP') {
      self.assignShipLeafPositions();
    } else {
      self.assignLeafPositions();
    }
    // リーフをデータベースから読込
    //ajaxReload();
    //self.canvas.dispatchEvent(new CustomEvent('tableScrolledH'));
    $(self.canvas).trigger('tableScrolledH', []);
  };

  /**
   * スケジュール表のX軸の表示範囲移動を確定する
   */
  this.confirmTableX = function () {
    self.v.displayingDate = new Date(self.i.dateScroll.getFullYear(),
      self.i.dateScroll.getMonth(), self.i.dateScroll.getDate());
    if (self.id === 'SHIP') {
      self.assignShipLeafPositions();
    } else {
      self.assignLeafPositions();
    }
    //self.canvas.dispatchEvent(new CustomEvent('tableScrolledH'));
    $(self.canvas).trigger('tableScrolledH', []);
    //ajaxReload();
  };

  /**
   * スケジュール表の表示範囲を移動する
   * @param {number} scroll 移動する行数
   */
  this.scrollTableY = function (scroll) {
    // スクロール量を加算
    self.v.displayingRow += scroll;
    // 値の範囲を制限して表示
    if (self.v.displayingRow > self.v.rowdata.length - self.v.row) {
      scroll -= self.v.rowdata.length - self.v.row;
      self.v.displayingRow = self.v.rowdata.length - self.v.row;
    }
    if (self.v.displayingRow < 0) {
      scroll -= self.v.displayingRow;
      self.v.displayingRow = 0;
    }
    self.confirmTableY();
  };

  /**
   * スケジュール表の表示範囲を移動する(絶対値指定)
   * @param {number} userIdx 移動する行番号
   */
  this.scrollTableYAbs = function (userIdx) {
    // スクロールバードラッグ中の場合、ドラッグ処理をキャンセル
    if (self.i.isVScrollBarDragging === true) {
      self.i.isVScrollBarDragging = false;
    }
    self.v.displayingRow = userIdx;
    // 値の範囲を制限して表示
    if (self.v.displayingRow > self.v.rowdata.length - self.v.row) {
      self.v.displayingRow = self.v.rowdata.length - self.v.row;
    }
    if (self.v.displayingRow < 0) {
      self.v.displayingRow = 0;
    }
    self.confirmTableY();
  };

  /**
   * スケジュール表のY軸の表示範囲移動を確定する
   */
  this.confirmTableY = function () {
    if (self.id === 'SHIP') {
      self.assignShipLeafPositions();
    } else {
      self.assignLeafPositions();
    }
    $(self.canvas).trigger('tableScrolledV', []);
    //self.canvas.dispatchEvent(new CustomEvent('tableScrolledV'));
    //ajaxReload();
  };

  /**
   * テーブルのX軸ドラッグ移動処理を実行する
   */
  function doTableHDrag() {
    if (!self.i.isHScrollBarDragging) {
      return;
    }
    self.i.dateScroll = self.getHScrollBarVal();
    return;
  }

  /**
   * テーブルのY軸ドラッグ移動処理を実行する
   */
  function doTableVDrag() {
    if (!self.i.isVScrollBarDragging) {
      return;
    }
    self.v.displayingRow = self.getVScrollBarVal();
    self.confirmTableY();
    return;
  }

  /**
   * スケジュール情報を使用して全リーフの座標を設定する。
   */
  this.assignLeafPositions = function () {
    if (self.i.draggingLeaf) {
      self.items.forEach(function (elem) {
        elem.row = getLeafsRow(elem);
        if (elem.schedules_id !== self.i.draggingLeaf.schedules_id) {
          // 一致する列を取得
          setPosFromSchedule(elem, self.v.displayingRow);
        }
      });
    } else {
      self.items.forEach(function (elem) {
        elem.row = getLeafsRow(elem);
        // 一致する列を取得
        setPosFromSchedule(elem, self.v.displayingRow);
      });
    }
    self.setUnassignedLeafsPos();
  };

  /***
   * 出荷リーフ用　リーフの座標を設定する。
   */
  this.assignShipLeafPositions = function () {
    if (self.i.draggingLeaf) {
      self.items.forEach(function (elem) {
        // elem.row = elem.row_no;
        elem.row = getLeafsRow(elem);
        if (elem.schedules_id !== self.i.draggingLeaf.schedules_id) {
          // 一致する列を取得
          setPosFromSchedule(elem, self.v.displayingRow);
        }
      });
    } else {
      self.items.forEach(function (elem) {
        // elem.row = getLeafsRow(elem);
        elem.row = elem.row_no;
        // 一致する列を取得
        setPosFromSchedule(elem, self.v.displayingRow);
      });
    }
    self.setUnassignedLeafsPos();
    // if (self.i.draggingLeaf) {
    //   self.items.forEach(function (elem) {
    //     elem.row = getLeafsRow(elem);
    //     if (elem.schedules_id !== self.i.draggingLeaf.schedules_id) {
    //       // 一致する列を取得
    //       setPosFromSchedule(elem, self.v.displayingRow);
    //     }
    //   });
    // } else {
    //   self.items.forEach(function (elem) {
    //     elem.row = getLeafsRow(elem);
    //     // 一致する列を取得
    //     setPosFromSchedule(elem, self.v.displayingRow);
    //   });
    // }
    // self.setUnassignedLeafsPos();
  };

  /**
   * イベントリスナーを設定
   * (タッチまたはマウス操作を検出して各処理を実行する。)
   */
  this.initEventListener = function () {
    var canvas = self.canvas;
    // 最前面のCanvasに各イベントを設定
    canvas.ontouchstart = function (e) {
      var preventDefaultFlag = mouseDownListener(e.changedTouches[0]);
      if (preventDefaultFlag) {
        e.preventDefault();
      }
    };
    canvas.ontouchend = function (e) {
      mouseUpListener(e.changedTouches[0]);
    };
    canvas.ontouchcancel = function (e) {
      self.i.mouseClicked = false;
    };
    canvas.ontouchmove = function (e) {
      var preventDefaultFlag = mouseMoveListener(e.changedTouches[0]);
      if (preventDefaultFlag) {
        e.preventDefault();
      }
    };
    canvas.onmousedown = function (e) {
      mouseDownListener(e);
      e.preventDefault();
    };
    canvas.onmouseup = function (e) {
      mouseUpListener(e);
      e.preventDefault();
    };
    canvas.onmouseout = function (e) {
      mouseOutListener(e);
      e.preventDefault();
    };
    canvas.onmousemove = function (e) {
      mouseMoveListener(e);
      e.preventDefault();
    };
    // 工程表上での右クリック
    canvas.oncontextmenu = function (e) {
      e.preventDefault();
      contextmenuListener(e);
    };
    // 工程表上でのマウスホイール回転処理
    if (canvas.onwheel === undefined) {
      // IE
      canvas.onmousewheel = function (e) {
        wheelListener(e, -(e.wheelDelta));
        e.preventDefault();
      };
    } else {
      // その他のブラウザ
      canvas.onwheel = function (e) {
        wheelListener(e, e.deltaY);
        e.preventDefault();
      };
    }
    window.onfocus = function (e) { self.hasFocus = true; };
    window.onblur = function (e) { self.hasFocus = false; };
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame ||
      function (cbf) { window.setTimeout(cbf, 1000.0 / 60.0); };
    window.requestAnimationFrame = requestAnimationFrame;
    return;
  };

  /**
   * マウス座標をクライアント座標系へ変換する。
   * 関数実行前のマウス位置をmousePrevX, mousePrevYに、
   * 現在位置の変換結果をmouseX, mouseYに格納する
   * @param {MouseEvent} e マウスイベントの情報。
   */
  function adjustXY(e) {
    // 直前までのマウス座標を保管
    self.i.mousePrevX = self.i.mouseX;
    self.i.mousePrevY = self.i.mouseY;
    // 現在のマウス座標を変換
    var rect = e.target.getBoundingClientRect();
    self.i.mouseX = e.clientX - rect.left;
    self.i.mouseY = e.clientY - rect.top;
  }

  /** 
   * イベント：マウスダウン
   * @param {MouseEvent} e マウスイベントの情報。
   */
  function mouseDownListener(e) {
    // マウスダウンイベントの重複を防ぐ
    if (self.i.mouseClicked === true) {
      return;
    }
    // クリック開始時のマウス位置を取得
    self.i.mouseClicked = true;
    adjustXY(e);
    self.i.dragStartX = self.i.mouseX;
    self.i.dragStartY = self.i.mouseY;
    calcDragArea();
    // 縦スクロールバー操作
    if (self.i.mouseX > self.v.tableX + self.v.cellWidth * self.v.col
      && self.i.mouseY > self.v.tableY && self.i.mouseY < self.v.tableY + self.v.cellHeight * self.v.row) {
      if (self.v.rowdata.length > self.v.row) {
        var bYPos = self.v.displayingRow / (self.v.rowdata.length - self.v.row);
        var bYSizeMag = self.calcVScrollBarSize();
        var pY = Math.floor(self.v.tableY + bYPos * (self.v.cellHeight * self.v.row - bYSizeMag)) + 0.5;
        var pH = Math.floor(bYSizeMag);
        if (self.i.mouseY > pY && self.i.mouseY < pY + pH) {
          self.i.vBarDragAdj = pY - self.i.mouseY + pH / 2;
        } else {
          self.i.vBarDragAdj = 0;
        }
        self.i.isVScrollBarDragging = true;
        doTableVDrag();
      }
    }
    // 横スクロールバー操作
    if (self.i.mouseY > self.v.tableY + self.v.cellHeight * self.v.row) {
      if (self.i.mouseX > self.v.tableX && self.i.mouseX < self.v.tableX + self.v.cellWidth * self.v.col
        && self.i.mouseY < self.v.tableY + self.v.cellHeight * self.v.row + 50) {
        var bXPos = 0.5;
        var bXSizeMag = self.calcHScrollBarSize();
        var pX = Math.floor(self.v.tableX + bXPos * (self.v.cellWidth * self.v.col - bXSizeMag)) + 0.5;
        var pW = Math.floor(bXSizeMag);
        if (self.i.mouseX > pX && self.i.mouseX < pX + pW) {
          self.i.hBarDragAdj = pX - self.i.mouseX + pW / 2 + 1;
        } else {
          self.i.hBarDragAdj = 0;
        }
        self.i.isHScrollBarDragging = true;
        doTableHDrag();
      }
    }
    // 休日設定ダイアログ表示(全員対象)
    if (self.i.mouseY > self.v.tableY - 30 && self.i.mouseY <= self.v.tableY) {
      var dateClicked = new Date(self.v.displayingDate.getTime() + Math.floor((self.i.mouseX - self.v.tableX) / self.v.cellWidth) * 86400000);
      //self.i.mouseClicked = false;
      //calendarDlgOpen(null, dateClicked);
    }
    // リーフのドラッグ操作開始判定
    if ((self.i.mouseX > self.v.tableX || self.i.mouseY <= self.v.tableY)
      && !self.i.isHScrollBarDragging && !self.i.isVScrollBarDragging) {
      var clickedLf = checkClickedLeaf();
      var evt = $.Event('leafDragStart');
      $(self.canvas).trigger(evt, [clickedLf]);
      if (clickedLf && !evt.isDefaultPrevented()) {
        self.i.draggingLeaf = clickedLf;
        self.v.searchedId = 0;
        // 直前まで未選択だったリーフをドラッグ開始した場合、全選択を解除する
        if (!self.i.draggingLeaf.selected) {
          self.items.forEach(function (elem) {
            elem.selected = false;
          });
        }
        // リーフを選択して横幅を合わせる
        self.i.draggingLeaf.selected = true;
        if (self.i.draggingLeaf.row < 0) {
          if (self.i.draggingLeaf.width < self.v.fixval.LEAF_DEF_WIDTH) {
            self.i.draggingLeaf.x = Math.floor(self.i.mouseX - self.i.draggingLeaf.width / 2);
          }
        }
        self.i.draggingLeaf.width = getLeafWidth(self.i.draggingLeaf);
        if (self.i.draggingLeaf.row < 0) {
          self.i.draggingLeaf.x = Math.floor(self.i.mouseX - self.i.draggingLeaf.width / 2);
        }
      } else {
        self.items.forEach(function (elem) {
          elem.selected = false;
        });
      }
      self.toggleContextmenu(false);
    }
    // 担当者ハイライト
    if (self.i.mouseX < self.v.tableX && self.i.mouseY > self.v.tableY && self.i.mouseY < self.v.tableY + self.v.cellHeight * self.v.row) {
      var clickedRow = Math.floor((self.i.mouseY - self.v.tableY) / self.v.cellHeight) + self.v.displayingRow;
    }
    return;
  }

  /**
   * イベント：マウスアップ
   * @param {MouseEvent} e マウスイベントの情報。
   */
  function mouseUpListener(e) {
    // マウスアップイベントの重複を防ぐ
    if (self.i.mouseClicked === false) {
      return;
    }
    // クリック終了時のマウス位置を取得
    self.i.mouseClicked = false;
    self.i.isVScrollBarDragging = false;
    if (self.i.isHScrollBarDragging) {
      // 日付スクロール確定処理
      self.confirmTableX();
      showDate = self.v.displayingDate;
      self.i.isHScrollBarDragging = false;
    }
    // 範囲選択
    if (self.i.validDragFlag === false && !self.i.draggingLeaf) {
      self.items.forEach(function (elem, idx, array) {
        if (WSUtils.checkCollisionRect(self.i.dragX, self.i.dragY, self.i.dragW, self.i.dragH, elem.x, elem.y, elem.width, elem.height) === true) {
          self.i.validDragFlag = true;
          elem.selected = true;
        } else {
          elem.selected = false;
        }
      });
    } else {
      self.i.validDragFlag = false;
    }
    // リーフをドラッグ中であった場合、配置
    if (self.i.draggingLeaf) {
      var isPlaceCanceled = false;
      // 配置権限があり、正しい箇所に配置された場合
      if (!isPlaceCanceled) {
        // リーフが配置されたマスを、座標から判定する
        putLeafToCell(self.i.draggingLeaf);
        // DBを更新
        var placedLeaf = self.i.draggingLeaf;
        self.i.draggingLeaf = null;
        $(self.canvas).trigger('leafPlaced', [placedLeaf]);
        if (self.id === 'SHIP' ) {
          self.assignShipLeafPositions();
        } else {
          self.assignLeafPositions();
        }
      } else {
        // 配置キャンセル
        self.i.draggingLeaf = null;
      }
    }
    // リーフを整列して描画
    self.setUnassignedLeafsPos();
  }

  /**
   * リーフを表中のセルに配置する
   * @param {TaskObject} lf 配置するリーフ
   */
  function putLeafToCell(lf) {
    setScheduleFromPos(lf, self.v.displayingRow);
    setPosFromSchedule(lf, self.v.displayingRow);
    self.setUnassignedLeafsPos();
  }

  /**
   * イベント：マウス移動
   * @param {MouseEvent} e マウスイベントの情報。
   */
  function mouseMoveListener(e) {
    // マウス移動タイマをリセット
    self.mouseMovedTimerCount = 0;
    // マウス位置を取得
    adjustXY(e);
    // リーフのドラッグ移動
    if (self.i.draggingLeaf) {
      var evt = $.Event('leafDrag');
      $(self.canvas).trigger(evt, [self.i.draggingLeaf]);
      if (!evt.isDefaultPrevented()) {
        self.i.draggingLeaf.x += self.i.mouseX - self.i.mousePrevX;
        self.i.draggingLeaf.y += self.i.mouseY - self.i.mousePrevY;
      }
    } else {
      getMouseOveredLeafInfo();
    }
    // 範囲選択処理
    if (self.i.mouseClicked === true && !self.i.draggingLeaf
      && !self.i.isVScrollBarDragging && !self.i.isHScrollBarDragging) {
      calcDragArea();
      self.items.forEach(function (elem, idx, array) {
        if (WSUtils.checkCollisionRect(self.i.dragX, self.i.dragY, self.i.dragW, self.i.dragH, elem.x, elem.y, elem.width, elem.height) === true) {
          self.i.validDragFlag = true;
          elem.selected = true;
        } else {
          elem.selected = false;
        }
      });
    }
    // 縦スクロールバーをドラッグ中の場合に担当者表示範囲を変更
    if (self.i.isVScrollBarDragging) {
      doTableVDrag();
    }
    // 横スクロールバーをドラッグ中の場合に日付表示範囲を変更
    if (self.i.isHScrollBarDragging) {
      doTableHDrag();
    }
    return;
  }

  /**
   * イベント：マウスアウト
   * @param {MouseEvent} e マウスイベントの情報。
   */
  function mouseOutListener(e) {
    return;
  }

  /**
   * イベント：コンテキストメニュー(右クリック)
   * @param {MouseEvent} e マウスイベントの情報。
   */
  function contextmenuListener(e) {
    adjustXY(e);
    var clickedLeaf = checkHoverLeaf();
    if (clickedLeaf) {
      clickedLeaf.selected = true;
      if (clickedLeaf.row < 0) {
        if (clickedLeaf.width < self.v.fixval.LEAF_DEF_WIDTH) {
          clickedLeaf.x = Math.floor(self.i.mouseX - clickedLeaf.width / 2);
        }
      }
      placeContextMenu(e.offsetX, e.offsetY); //placeContextMenu(e.offsetX, e.offsetY);
      self.toggleContextmenu(true, clickedLeaf);
    } else {
      self.toggleContextmenu(false);
    }
    return;
  }

  /**
   * コンテキストメニューの表示位置を設定する
   * @param {number} cMenuX X座標
   * @param {number} cMenuY Y座標
   */
  function placeContextMenu(cMenuX, cMenuY) {
    self.contextmenu['css']({
      'left': cMenuX + 'px',
      'top': (cMenuY - 5) + 'px'
    });
  }

  /**
   * イベント：ホイール
   * @param {WheelEvent} e イベントの情報。
   * @param {number} wDelta 回転量。
   */
  function wheelListener(e, wDelta) {
    // 上スクロール処理
    if (wDelta < 0) {
      self.scrollTableY(-1);
    }
    // 下スクロール処理
    if (wDelta > 0) {
      self.scrollTableY(1);
    }
    return;
  }

  /**
   * コンテキストメニューの表示を切り替えする
   * @param {boolean} openMenu trueで表示、falseで非表示。
   * @param {TaskObject} clickedLeaf 表示する場合、対象リーフのオブジェクト。
   */
  this.toggleContextmenu = function (openMenu, clickedLeaf) {
    if (openMenu) {
      self.contextmenu.attr('data-leafsid', clickedLeaf.leafs_id).attr('data-schedulesid', clickedLeaf.schedules_id)['show']();
      // 出荷詳細画面表示用で「会社, リーフNo」を設定
      self.contextmenu.attr('data-leaf-no', clickedLeaf.leaf_no).data('leaf-no', clickedLeaf.leaf_no);
      $(self.canvas).trigger('menuOpen', [clickedLeaf]);
      //self.canvas.dispatchEvent(new CustomEvent('menuOpen', { 'detail' : clickedLeaf }));
    } else {
      self.contextmenu.attr('data-leafsid', -1).attr('data-schedulesid', -1)['hide']();
      $(self.canvas).trigger('menuClose', []);
      //self.canvas.dispatchEvent(new CustomEvent('menuClose', {}));
    }
  };

  /**
   * ドラッグ中の範囲を算出する。
   * 結果はself.i.dragX, self.i.dragY, self.i.dragW, self.i.DragHに代入する
   */
  function calcDragArea() {
    if (self.i.dragStartX > self.i.mouseX) {
      self.i.dragX = self.i.mouseX;
      self.i.dragW = self.i.dragStartX - self.i.mouseX;
    } else {
      self.i.dragX = self.i.dragStartX;
      self.i.dragW = self.i.mouseX - self.i.dragStartX;
    }
    if (self.i.dragStartY > self.i.mouseY) {
      self.i.dragY = self.i.mouseY;
      self.i.dragH = self.i.dragStartY - self.i.mouseY;
    } else {
      self.i.dragY = self.i.dragStartY;
      self.i.dragH = self.i.mouseY - self.i.dragStartY;
    }
  }

  /**
   * マウスが重なったリーフの情報をツールチップに取得する
   */
  function getMouseOveredLeafInfo() {
    var overedLeaf = checkHoverLeaf();
    if (overedLeaf) {
      // 説明文を代入
      if (self.v.mouseOveredInfoLfId !== overedLeaf.schedules_id) {
        self.v.mouseOveredInfoLfId = overedLeaf.schedules_id;
        $(self.canvas).trigger('mouseOveredLeaf', [overedLeaf]);
        //assignToolTipText(overedleaf);
      }
    } else {
      self.v.mouseOveredInfoLfId = -1;
    }
    return;
  }

  /**
   * 全リーフについてリーフ情報の取得処理を行う 2023/6/20
   * @return {TaskObject} クリックされたリーフのオブジェクト。クリックされていない場合にはnull。
   */
  function checkHoverLeaf() {
    var clickedLeaf = null;
    var mostForwardLeaf;
    // 最前面のリーフをドラッグする
    self.items.forEach(function (elem) {
      if (elem.visible === true) {
        var isHit = WSUtils.checkHitRectPt(self.i.mouseX, self.i.mouseY, elem.x, elem.y, elem.width, elem.height);
        if (isHit) {
          mostForwardLeaf = elem;
        }
      }
    });
    // リーフがクリックされた場合の処理
    if (mostForwardLeaf) {
      // 最前面のリーフを選択状態にしてドラッグ開始
      clickedLeaf = mostForwardLeaf;
    }
    return clickedLeaf;
  }

  /**
   * 全リーフについてクリック判定とドラッグ処理などを行う
   * @return {TaskObject} クリックされたリーフのオブジェクト。クリックされていない場合にはnull。
   */
  function checkClickedLeaf() {
    var clickedLeaf = null;
    var mostForwardLeaf;
    // 最前面のリーフをドラッグする
    self.items.forEach(function (elem) {
      if (elem.visible === true) {
        var isHit = WSUtils.checkHitRectPt(self.i.mouseX, self.i.mouseY, elem.x, elem.y, elem.width, elem.height);
        if (isHit) {
          mostForwardLeaf = elem;
        }
      }
    });
    // リーフがクリックされた場合の処理
    if (mostForwardLeaf) {
      // 2023/6/23 出荷済みリーフは移動できないように制限を設ける
      if (mostForwardLeaf['data']['ed_shipment_date'] == null || mostForwardLeaf['data']['ed_shipment_date'] == '') {
        // 最前面のリーフを選択状態にしてドラッグ開始
        clickedLeaf = mostForwardLeaf;
      }
      // 最前面のリーフを選択状態にしてドラッグ開始
      // clickedLeaf = mostForwardLeaf;
    }
    return clickedLeaf;
  }

  /**
   * 未割当リーフを整列する
   */
  this.setUnassignedLeafsPos = function () {
    var lfs = [];
    // 未割当リーフ一覧を検索して代入
    lfs = self.items.filter(function (elem, idx) {
      if (elem.row === -1) {
        return true;
      }
      return false;
    });
    // 配列をid順に整列
    // lfs.sort(function (a, b) {
    //   if (a.schedules_id > b.schedules_id) {
    //     return 1;
    //   } else {
    //     return -1;
    //   }
    // });
    // lfs.sort(function (a, b) {
    //   if (a.schedules_id > b.schedules_id) {
    //     return 1;
    //   } else {
    //     return -1;
    //   }
    // });
    // 納期順に未割当リーフを配置
    var idDragging = -1;
    var prevDraggingLeafX;
    var prevDraggingLeafY;
    var prevDraggingLeafW;
    // ドラッグ中のリーフがある場合、整列前の位置を変数に保管
    if (self.i.draggingLeaf) {
      idDragging = self.i.draggingLeaf.schedules_id;
      prevDraggingLeafX = self.i.draggingLeaf.x;
      prevDraggingLeafY = self.i.draggingLeaf.y;
      prevDraggingLeafW = self.i.draggingLeaf.width;
    }
    // 工程順番に応じてリーフ位置をずらしながら配置する
    var cntUnassigned = 0;
    var lfslen = lfs.length;
    for (var i = 0; i < lfslen; i++) {
      // 1工程のみのリーフを配置
      if (lfs[i].schedules_id != idDragging) {
        lfs[i].x = 50 + cntUnassigned * (self.v.fixval.LEAF_DEF_WIDTH + 10);
        lfs[i].y = 35;
        lfs[i].width = self.v.fixval.LEAF_DEF_WIDTH;
      }
      // 横位置をずらして配置
      lfs[i].x = 50 + cntUnassigned * (self.v.fixval.LEAF_DEF_WIDTH + 10);
      lfs[i].y = 35;
      lfs[i].width = self.v.fixval.LEAF_DEF_WIDTH;
      cntUnassigned += 1;
    }
    // 未割当リーフが多い場合に配置X座標を左に寄せる
    if (cntUnassigned > 15) {
      var magX = 15.0 / cntUnassigned;
      for (var k = 0; k < lfslen; k++) {
        lfs[k].x = Math.floor(lfs[k].x * magX);
      }
    }
    // ドラッグ中リーフの位置を整列前に戻す
    if (idDragging >= 0) {
      self.i.draggingLeaf.x = prevDraggingLeafX;
      self.i.draggingLeaf.y = prevDraggingLeafY;
      self.i.draggingLeaf.width = prevDraggingLeafW;
    }
  };

  /**
   * リーフ配置セルを判定して作業日時と担当者を設定する
   * @param {TaskObject} lf 判定対象のLeafオブジェクト
   * @param {number} rowOffset 行の表示オフセット(最上段表示中に0)
   */
  function setScheduleFromPos(lf, rowOffset) {
    // 担当者が画面外の場合などでリーフが非表示の場合、処理しない
    if (lf.visible === false) {
      return;
    }
    // 表に対応する位置を座標より計算
    var cellDiv = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
    var posDate = Math.floor((lf.x + self.v.cellWidth / (cellDiv * 2) - self.v.tableX) / self.v.cellWidth);
    var posTime = Math.floor((lf.x + self.v.cellWidth / (cellDiv * 2) - self.v.tableX - (posDate * self.v.cellWidth)) / (self.v.cellWidth / cellDiv));
    var rowTarget = rowOffset + Math.floor((lf.y + lf.height / 2 - self.v.tableY) / self.v.cellHeight);
    if (self.id === 'SHIP') {
      // 出荷リーフの場合はrowtarget置き換え
      let arr = self.items.filter( function (elem) {
        if (elem.start_plan.getTime() === lf.start_plan.getTime() && elem.leaf_no !== lf.leaf_no) {
          return true;
        }
        return false;
      });
      rowTarget = arr.length;
    } 
    // 表の外側にリーフが配置されていないかを確認
    var vaildRows = self.v.row;
    if (self.v.rowdata.length < vaildRows) {
      vaildRows = self.v.rowdata.length;
    }
    if (rowTarget < rowOffset || rowTarget >= rowOffset + vaildRows) {
      // 表の外にある場合、担当者IDを空文字として代入。予定日時の指定は解除しない
      //lf.start_plan.setTime(0);
      lf.row = -1;
      setWorkerInfoToLeaf(lf);
    } else {
      // 表の内側にある場合、作業開始日時をセル位置として担当者IDを代入
      lf.row = rowTarget;
      if (self.id === 'SHIP') {
        lf.start_plan.setTime(self.v.displayingDate.getTime() + (posDate * 86400000) +
          (self.v.fixval.DAY_ST_HOUR * 3600000));  //1日は86400000ミリ秒
        lf.start_plan_date = WSUtils.convertDateToStr(lf.start_plan);
        lf.start_plan_time = '0000';
      } else {
        lf.start_plan.setTime(self.v.displayingDate.getTime() + (posDate * 86400000) +
        ((posTime + self.v.fixval.DAY_ST_HOUR) * 3600000));  //1日は86400000ミリ秒
        lf.start_plan_date = WSUtils.convertDateToStr(lf.start_plan);
        lf.start_plan_time = ('00' + lf.start_plan.getHours()).slice(-2) + ('00' + lf.start_plan.getMinutes()).slice(-2);
      }
      setWorkerInfoToLeaf(lf);
    }
    return;
  }

  /**
   * リーフの画面座標と幅を作業日時と担当者番号に応じて設定する
   * @param {TaskObject} lf 判定対象のLeafオブジェクト
   * @param {number} rowOffset 行の表示オフセット(最上段表示中に0)
   */
  function setPosFromSchedule(lf, rowOffset) {
    var cellDiv = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
    /** リーフの左上座標をグリッドに合わせる */
    function setXY() {
      let tblDate = new Date(0);
      if (self.id === 'SHIP') {
        tblDate = new Date(lf.start_plan.getFullYear(), lf.start_plan.getMonth(), lf.start_plan.getDate(), self.v.fixval.DAY_ST_HOUR);
      } else {
        tblDate = new Date(lf.start_plan.getFullYear(), lf.start_plan.getMonth(), lf.start_plan.getDate(), Math.max(self.v.fixval.DAY_ST_HOUR, lf.start_plan.getHours()));
      }
      let posDatetime = WSUtils.compareHours(self.v.displayingDate, tblDate);
      let daycnt = Math.floor(posDatetime / 24);
      lf.x = Math.round(self.v.tableX + colPosConv(lf, posDatetime) * self.v.cellWidth / cellDiv + daycnt * self.v.cellWidth);
      lf.y = self.v.tableY + (lf.row - rowOffset) * self.v.cellHeight + (self.v.cellHeight - lf.height) / 2;
      // var tblDate = new Date(lf.start_plan.getFullYear(), lf.start_plan.getMonth(), lf.start_plan.getDate(),
      //   Math.max(self.v.fixval.DAY_ST_HOUR, lf.start_plan.getHours()));
      // var posDatetime = WSUtils.compareHours(self.v.displayingDate, tblDate);
      // var daycnt = Math.floor(posDatetime / 24);
      // lf.x = Math.round(self.v.tableX + colPosConv(lf, posDatetime) * self.v.cellWidth / cellDiv + daycnt * self.v.cellWidth);
      // lf.y = self.v.tableY + (lf.row - rowOffset) * self.v.cellHeight + (self.v.cellHeight - lf.height) / 2;
    }
    // 表の内部に配置されている場合、座標を計算する
    if (lf.row >= rowOffset && lf.row < rowOffset + self.v.row) {
      setXY();
      lf.width = getLeafWidth(lf);
      lf.visible = true;
    } else if (lf.row == -1) {
      // 表外部に配置された場合、横幅を固定サイズにする
      lf.width = self.v.fixval.LEAF_DEF_WIDTH;
      lf.visible = true;
    } else {
      // 担当者が決定しているが画面外の場合、非表示にする。座標は代入する
      setXY();
      lf.width = getLeafWidth(lf);
      lf.visible = false;
    }
    return;
  }

  // function setPositionForShip(lf, rowOffset) {
  //   var cellDiv = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
  //   /** リーフの左上座標をグリッドに合わせる */
  //   function setXY() {
  //     let tblDate = new Date(lf.start_plan_date.substr(0,4), lf.start_plan_date.substr(4,2) - 1, lf.start_plan_date.substr(6,2), '00');
  //     let posDatetime = WSUtils.compareHours(self.v.displayingDate, tblDate);
  //     let daycnt = Math.floor(posDatetime / 24);
  //     lf.x = Math.round(self.v.tableX + colPosConv(lf, posDatetime) * self.v.cellWidth / cellDiv + daycnt * self.v.cellWidth);
  //     lf.y = self.v.tableY + (lf.row - rowOffset) * self.v.cellHeight + (self.v.cellHeight - lf.height) / 2;
  //   }
  //   // 表の内部に配置されている場合、座標を計算する
  //   if (lf.row >= rowOffset && lf.row < rowOffset + self.v.row) {
  //     setXY();
  //     lf.width = getLeafWidth(lf);
  //     lf.visible = true;
  //   } else if (lf.row == -1) {
  //     // 表外部に配置された場合、横幅を固定サイズにする
  //     lf.width = self.v.fixval.LEAF_DEF_WIDTH;
  //     lf.visible = true;
  //   } else {
  //     // 担当者が決定しているが画面外の場合、非表示にする。座標は代入する
  //     setXY();
  //     lf.width = getLeafWidth(lf);
  //     lf.visible = false;
  //   }
  //   return;
  // }

  /**
   * 配置済みリーフの表示幅を求めて返す。
   * @param {TaskObject} lf リーフのオブジェクト。
   * @return {number} リーフの表示幅についての計算結果。
   */
  function getLeafWidth(lf) {
    // セル1マスの時間
    var cellDiv = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
    // セル1時間当たりの幅
    var cellMinW = self.v.cellWidth / cellDiv;
    if (self.id === 'SHIP') {
      cellMinW = self.v.cellWidth;
    } 
    // リーフの時間
    var cnt = Number(lf.interval);
    // リーフの開始日
    var dt = new Date(lf.start_plan_date.substr(0,4) + '/' + lf.start_plan_date.substr(4,2) + '/' + ('00' + lf.start_plan_date.substr(6,2)).slice(-2) );
    if (dt.getTime() <= 0 || !self.v.rowdata[lf.row]) {
      // 開始日が取得できないもしくは行データがない場合はリーフの時間当たりの幅を返す
      return Math.ceil(cnt / 60) * cellMinW;
    }
    var rowobj = self.v.rowdata.filter(function (elem) {
      // 行が一致したら行idを返す
      return lf.members_id === elem.id;
    });
    // これ以降は、列が時間軸の時用に、開始時間を取得＆配置可能な時間かどうかチェック
    var leaflength = 0;
    if (self.id === 'SHIP') {
      return leaflength = cellMinW;
    } else {
      // 間に休暇が入る場合
      while (cnt > 0) { //for (var i = 0; cnt >= 60; i++) {}
        if (self.v.fixval.DAY_EN_HOUR <= dt.getHours()) {
          dt.setTime(dt.getTime() + 3600000 * 24);
          dt.setHours(self.v.fixval.DAY_ST_HOUR);
        } else if (dt.getHours() < self.v.fixval.DAY_ST_HOUR) {
          dt.setHours(self.v.fixval.DAY_ST_HOUR);
        }
        if (self.checkWorkableHour(dt, rowobj.length > 0 ? rowobj[0] : null, lf)) {
          cnt -= 60;
        }
        leaflength += cellMinW;
        dt.setTime(dt.getTime() + 3600000);
      }
    }
    return leaflength;
    // var cellDiv = self.v.fixval.DAY_EN_HOUR - self.v.fixval.DAY_ST_HOUR;
    // var cellMinW = self.v.cellWidth / cellDiv;
    // var cnt = lf.schedules_required_time;
    // var dt = new Date(lf.start_plan.getTime());
    // if (dt.getTime() <= 0 || !self.v.rowdata[lf.row]) {
    //   return Math.ceil(cnt / 60) * cellMinW;
    // }
    // var rowobj = self.v.rowdata.filter(function (elem) {
    //   return lf.members_id === elem.id;
    // });
    // var leaflength = 0;
    // while (cnt > 0) { //for (var i = 0; cnt >= 60; i++) {}
    //   if (self.v.fixval.DAY_EN_HOUR <= dt.getHours()) {
    //     dt.setTime(dt.getTime() + 3600000 * 24);
    //     dt.setHours(self.v.fixval.DAY_ST_HOUR);
    //   } else if (dt.getHours() < self.v.fixval.DAY_ST_HOUR) {
    //     dt.setHours(self.v.fixval.DAY_ST_HOUR);
    //   }
    //   if (self.checkWorkableHour(dt, rowobj.length > 0 ? rowobj[0] : null, lf)) {
    //     cnt -= 60;
    //   }
    //   leaflength += cellMinW;
    //   dt.setTime(dt.getTime() + 3600000);
    // }
    // return leaflength;
  }

  /**
   * 指定した日時が勤務可能であるかを確認して返す。
   * (CVSGantt毎に関数を代入することにより指定して使用する)
   * @param {Date} dtSt 開始日時
   * @param {RowObject} rowdata 行データ
   * @param {TaskObject=} lf リーフ長さ計算時の場合、対象リーフ
   * @return {boolean} 勤務可能である場合、true
   */
  this.checkWorkableHour = function (dtSt, rowdata, lf) {
    return true;
  };

  /**
   * 表示行番号に応じた製造担当者の情報を代入する
   * @param {TaskObject} lf 代入先リーフ
   */
  function setWorkerInfoToLeaf(lf) {
    // 行番号について検索を実行
    var filtered = self.v.rowdata.filter(function (elem) {
      return (elem.row === lf.row);
    });
    // 担当者またはプロジェクトの情報が見つかった場合、idを代入。見つからなかった場合は、0とする
    if (filtered.length > 0) {
      if (self.v.axistype === 1) {
        lf.members_id = filtered[0].id;
      } else if (self.v.axistype === 2) {
        lf.equipments_id = filtered[0].id;
      } else {
        lf.projects_id = filtered[0].id;
      }
    } else {
      if (self.v.axistype === 1) {
        lf.members_id = null;
      } else if (self.v.axistype === 2) {
        lf.equipments_id = null;
      } else {
        lf.projects_id = null;
      }
    }
    return;
  }

  /**
   * リーフの配置列について、日付の境界部分を整数で連続させる
   * @param {TaskObject} lf 対象リーフ
   * @param {number} posHour 時間[h]
   * @return {number} 表示用の連続した整数値[h]
   */
  function colPosConv(lf, posHour) {
    var st = self.v.fixval.DAY_ST_HOUR;
    var en = self.v.fixval.DAY_EN_HOUR;
    var posTime = posHour;
    var stHour = 0;
    if (posTime >= 0) {
      posTime = (posTime % 24) - st + stHour;
    } else {
      posTime = (24 - st - (- posTime) % 24) + stHour;
    }
    if (posTime > en - st) {
      posTime = en - st;
    }
    if (posTime === 24) {
      return 0; // 24時間表示時での0:00配置時に0を返す
    }
    return posTime;
  }

  /**
   * 製造担当者に応じた表示行番号を返す
   * @param {TaskObject} lf 対象リーフ
   * @return {number} 行番号、見つからない場合は-1
   */
  function getLeafsRow(lf) {
    var id = 0;
    if (self.v.axistype === 1 || self.v.axistype === 0) {
      id = Number(lf.members_id ? lf.members_id : -1);
    } else if (self.v.axistype === 2) {
      id = Number(lf.equipments_id ? lf.equipments_id : -1);
    } else {
      id = Number(lf.projects_id ? lf.projects_id : -1);
    }
    // 検索を実行
    var filtered = self.v.rowdata.filter(function (element) {
      return (element.id === id);
    });
    if (filtered.length > 0) {
      return filtered[0].row;
    }
    return -1;
  }

  /**
   * ツールチップを設定する
   * @param {string[]} strs 文字列(配列で複数行を指定する)
   */
  this.setToolTip = function (strs) {
    for (var i = 0; i < self.v.mouseOveredInfos.length; i++) {
      self.v.mouseOveredInfos[i] = strs[i] ? strs[i] : '';
    }
    self.v.tooltipTextObjs.forEach(function (elem) {
      elem.firstTimeDraw = true;
    });
  };

  /**
   * リーフIDに対応する項目を取得する
   * @param {Number} leafsid リーフID
   */
  this.getItemByLeafsId = function (leafsid) {
    var items = self.items.filter(function (elem) {
      return elem.leafs_id === leafsid;
    });
    return items.length > 0 ? items[0] : null;
  };

  /**
   * メンバーの少なくとも片方が同じでかつ指定日時範囲に予定日時が含まれるリーフの配列を取得する
   * @param {TaskObject} lf 対象リーフ
   * @param {Date} dtSt 開始日時
   * @param {Date} dtEn 完了日時
   * @param {boolean=} useResultTime trueかつ実績時間が入力済みの場合、実績時間から完了日時を計算する
   * @return {TaskObject[]} リーフの配列
   */
  this.getDuplicatedLeafs = function (lf, dtSt, dtEn, useResultTime) {
    var b_start = dtSt.getTime();
    var b_end = dtEn.getTime();
    return self.items.filter(function (elem) {
      var a_start = elem.start_plan.getTime();
      var a_end = self.getFinishPlan(elem, useResultTime).getTime();
      // 自分以外で、設備か作業者、開始時間終了時間がかぶるリーフがある場合は配列に追加
      if (((lf.leafs_id !== elem.leafs_id) && 
          (lf.members_id === elem.members_id || lf.equipments_id === elem.equipments_id)) && 
          (a_start < b_end && a_end > b_start)) {
        return true;
      }
      return false;
    });
  };

  /**
   * 親リーフの配列を取得する(後日程へのリーフ移動時等に使用)
   * @param {TaskObject} lf リーフのオブジェクト
   * @return {TaskObject[]} リーフの配列
   */
  this.getParents = function (lf) {
    if (!lf.cachedParentTasks) {
      // 親リーフ検索
      lf.cachedParentTasks = self.items.filter(function (elem) {
        return elem.divide_id === lf.parent_id;
      });
    }
    return lf.cachedParentTasks;
  };

  /**
   * 子リーフの配列を取得する(前日程へのリーフ移動時等に使用)
   * @param {TaskObject} lf リーフのオブジェクト
   * @return {TaskObject[]} リーフの配列
   */
  this.getChilds = function (lf) {
    if (!lf.cachedChildTasks) {
      // 子リーフ検索
      lf.cachedChildTasks = self.items.filter(function (elem) {
        return elem.parent_id === lf.divide_id;
      });
    }
    return lf.cachedChildTasks;
  };

  /**
   * リーフの開始予定日時から完了予定日時を求める
   * @param {TaskObject} lf リーフのオブジェクト
   * @param {boolean=} useResultTime trueかつ実績時間が入力済みの場合、実績時間から完了日時を計算する
   * @return {Date} 完了予定日時。人員・設備とも未割当の場合、`new Date(0)`を返す
   */
  this.getFinishPlan = function (lf, useResultTime) {
    var cnt = lf.schedules_required_time;
    if (useResultTime && lf.data['l_result_time'] > 0) {
      cnt = Number(lf.data['l_result_time']);
    }
    var dt = new Date(lf.start_plan.getTime());
    if (dt.getTime() <= 0 || !self.v.rowdata[lf.row]) {
      return new Date(0);
    }
    var rowobj = self.v.rowdata.filter(function (elem) {
      return lf.members_id === elem.id;
    });
    while (cnt > 0) {
      if (self.v.fixval.DAY_EN_HOUR <= dt.getHours()) {
        dt.setTime(dt.getTime() + 3600000 * 24);
        dt.setHours(self.v.fixval.DAY_ST_HOUR);
      } else if (dt.getHours() < self.v.fixval.DAY_ST_HOUR) {
        dt.setHours(self.v.fixval.DAY_ST_HOUR);
      }
      if (self.checkWorkableHour(dt, rowobj.length > 0 ? rowobj[0] : null, lf)) {
        cnt -= 60;
      }
      dt.setTime(dt.getTime() + 3600000);
    }
    return dt;
  };

  /**
   * リーフの完了日時から(配置可能な時間帯にある)開始日時を求める
   * @param {TaskObject} lf リーフのオブジェクト
   * @param {Date} dtEn リーフの完了予定日時とする時刻
   * @return {Date} 開始予定日時。人員・設備とも未割当の場合、`new Date(0)`を返す
   */
  this.getStartPlan = function (lf, dtEn) {
    var cnt = lf.schedules_required_time;
    if (dtEn.getTime() <= 0 || !self.v.rowdata[lf.row]) {
      return new Date(0);
    }
    var rowobj = self.v.rowdata.filter(function (elem) {
      return lf.members_id === elem.id;
    });
    var dt = new Date(dtEn.getTime());
    while (cnt > 0) {
      dt.setTime(dt.getTime() - 3600000);
      if (self.v.fixval.DAY_EN_HOUR <= dt.getHours()) {
        dt.setHours(self.v.fixval.DAY_EN_HOUR - 1);
      } else if (dt.getHours() < self.v.fixval.DAY_ST_HOUR) {
        dt.setTime(dt.getTime() - 3600000 * 24);
        dt.setHours(self.v.fixval.DAY_EN_HOUR);
      }
      if (self.checkWorkableHour(dt, rowobj.length > 0 ? rowobj[0] : null, lf)) {
        cnt -= 60;
      }
    }
    return dt;
  };

  /**
   * リーフについて指定日時以降で配置可能な日時を求める
   * @param {TaskObject} lf リーフのオブジェクト
   * @param {Date} planDate リーフの完了予定日時とする時刻
   * @return {Date} 開始予定日時。人員・設備とも未割当の場合、`new Date(0)`を返す
   */
  this.getNextPlaceableDate = function (lf, planDate) {
    var dt = new Date(planDate.getTime());
    var cnt = lf.schedules_required_time;
    // var dt = new Date(lf.start_plan.getTime());
    if (dt.getTime() <= 0 || !self.v.rowdata[lf.row]) {
      // 未配置
      return new Date(0);
    }
    var rowobj = self.v.rowdata.filter(function (elem) {
      return lf.members_id === elem.id;
    });
    while (cnt > 0) {
      if (self.v.fixval.DAY_EN_HOUR <= dt.getHours()) {
        // 表示日より数日後
        dt.setTime(dt.getTime() + 3600000 * 24);
        dt.setHours(self.v.fixval.DAY_ST_HOUR);
      } else if (dt.getHours() < self.v.fixval.DAY_ST_HOUR) {
        // 表示開始日
        dt.setHours(self.v.fixval.DAY_ST_HOUR);
      }
      if (self.checkWorkableHour(dt, rowobj.length > 0 ? rowobj[0] : null, lf)) {
        break; //cnt -= 60;
      }
      dt.setTime(dt.getTime() + 3600000);
    }
    return dt;
  };

  /**
   * リーフについて指定日時以前で配置可能な日時を求める
   * @param {TaskObject} lf リーフのオブジェクト
   * @param {Date} planDate リーフの完了予定日時とする時刻
   * @return {Date} 開始予定日時。人員・設備とも未割当の場合、`new Date(0)`を返す
   */
  this.getPrevPlaceableDate = function (lf, planDate) {
    var dt = new Date(planDate.getTime());
    var cnt = lf.schedules_required_time;
    //var dt = new Date(self.getFinishPlan(lf.start_plan.getTime()));
    if (dt.getTime() <= 0 || !self.v.rowdata[lf.row]) {
      return new Date(0);
    }
    var rowobj = self.v.rowdata.filter(function (elem) {
      return lf.members_id === elem.id;
    });
    while (cnt > 0) {
      if (self.v.fixval.DAY_EN_HOUR <= dt.getHours()) {
        dt.setHours(self.v.fixval.DAY_EN_HOUR - 1);
      } else if (dt.getHours() < self.v.fixval.DAY_ST_HOUR) {
        dt.setTime(dt.getTime() - 3600000 * 24);
        dt.setHours(self.v.fixval.DAY_EN_HOUR);
      }
      if (self.checkWorkableHour(dt, rowobj.length > 0 ? rowobj[0] : null, lf)) {
        break; //cnt -= 60;
      }
      dt.setTime(dt.getTime() - 3600000);
    }
    return dt;
  };


}

