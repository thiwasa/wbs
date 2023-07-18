/**
 * イベントリスナーを設定
 * (タッチまたはマウス操作を検出して各処理を実行する。)
 */
function initEventListener() {
  // 最前面のCanvasに各イベントを設定
  canvas.ontouchstart = function (event) {
    var preventDefaultFlag = mouseDownListener(event.changedTouches[0]);
    if (preventDefaultFlag) {
      event.preventDefault();
    }
  };
  canvas.ontouchend = function (event) {
    mouseUpListener(event.changedTouches[0]);
  };
  canvas.ontouchcancel = function (event) {
    ws.i.mouseClicked = false;
  };
  canvas.ontouchmove = function (event) {
    var preventDefaultFlag = mouseMoveListener(event.changedTouches[0]);
    if (preventDefaultFlag) {
      event.preventDefault();
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
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (cbf) { window.setTimeout(cbf, 1000.0 / 60.0); };
  window.requestAnimationFrame = requestAnimationFrame;
  return;
}

/**
 * マウス座標をクライアント座標系へ変換する。
 * 関数実行前のマウス位置をmousePrevX, mousePrevYに、
 * 現在位置の変換結果をmouseX, mouseYに格納する
 * @param {MouseEvent} e マウスイベントの情報。
 */
function adjustXY(e) {
  // 直前までのマウス座標を保管
  ws.i.mousePrevX = ws.i.mouseX;
  ws.i.mousePrevY = ws.i.mouseY;
  // 現在のマウス座標を変換
  var rect = e.target.getBoundingClientRect();
  ws.i.mouseX = e.clientX - rect.left;
  ws.i.mouseY = e.clientY - rect.top;
}

/** 
 * イベント：マウスダウン
 * @param {MouseEvent} e マウスイベントの情報。
 */
function mouseDownListener(e) {
  // マウスダウンイベントの重複を防ぐ
  if (ws.i.mouseClicked === true) {
    return;
  }
  // クリック開始時のマウス位置を取得
  ws.i.mouseClicked = true;
  adjustXY(e);
  ws.i.dragStartX = ws.i.mouseX;
  ws.i.dragStartY = ws.i.mouseY;
  calcDragArea();
  // 縦スクロールバー操作
  if (ws.i.mouseX > ws.v.tableX + ws.v.cellWidth * ws.v.col
    && ws.i.mouseY > ws.v.tableY && ws.i.mouseY < ws.v.tableY + ws.v.cellHeight * ws.v.row) {
    if (ws.v.rowdata.length > ws.v.row) {
      var bYPos = ws.v.displayingRow / (ws.v.rowdata.length - ws.v.row);
      var bYSizeMag = calcVScrollBarSize();
      var pY = Math.floor(ws.v.tableY + bYPos * (ws.v.cellHeight * ws.v.row - bYSizeMag)) + 0.5;
      var pH = Math.floor(bYSizeMag);
      if (ws.i.mouseY > pY && ws.i.mouseY < pY + pH) {
        ws.i.vBarDragAdj = pY - ws.i.mouseY + pH / 2;
      } else {
        ws.i.vBarDragAdj = 0;
      }
      ws.i.isVScrollBarDragging = true;
      doTableVDrag();
    }
  }
  // 横スクロールバー操作
  if (ws.i.mouseY > ws.v.tableY + ws.v.cellHeight * ws.v.row) {
    if (ws.i.mouseX > ws.v.tableX && ws.i.mouseX < ws.v.tableX + ws.v.cellWidth * ws.v.col
      && ws.i.mouseY < ws.v.tableY + ws.v.cellHeight * ws.v.row + 50) {
      var bXPos = 0.5;
      var bXSizeMag = calcHScrollBarSize();
      var pX = Math.floor(ws.v.tableX + bXPos * (ws.v.cellWidth * ws.v.col - bXSizeMag)) + 0.5;
      var pW = Math.floor(bXSizeMag);
      if (ws.i.mouseX > pX && ws.i.mouseX < pX + pW) {
        ws.i.hBarDragAdj = pX - ws.i.mouseX + pW / 2 + 1;
      } else {
        ws.i.hBarDragAdj = 0;
      }
      ws.i.isHScrollBarDragging = true;
      doTableHDrag();
    }
  }
  // 休日設定ダイアログ表示(全員対象)
  if (ws.i.mouseY > ws.v.tableY - 30 && ws.i.mouseY <= ws.v.tableY) {
    var dateClicked = new Date(ws.v.displayingDate.getTime() + Math.floor((ws.i.mouseX - ws.v.tableX) / ws.v.cellWidth) * 86400000);
    //ws.i.mouseClicked = false;
    //calendarDlgOpen(null, dateClicked);
  }
  // リーフのドラッグ操作開始判定
  if (ws.i.mouseX > ws.v.tableX || ws.i.mouseY <= ws.v.tableY) {
    ws.i.draggingLeaf = checkClickedLeaf();
    if (ws.i.draggingLeaf) {
      ws.i.draggingLeaf.width = getLeafWidth(ws.i.draggingLeaf);
      if (ws.i.draggingLeaf.row < 0) {
        ws.i.draggingLeaf.x = Math.floor(ws.i.mouseX - ws.i.draggingLeaf.width / 2);
      }
    }
    toggleContextmenu(false);
  }
  // 担当者ハイライト
  if (ws.i.mouseX < ws.v.tableX && ws.i.mouseY > ws.v.tableY && ws.i.mouseY < ws.v.tableY + ws.v.cellHeight * ws.v.row) {
    var clickedRow = Math.floor((ws.i.mouseY - ws.v.tableY) / ws.v.cellHeight) + ws.v.displayingRow;
  }
  return;
}

/**
 * イベント：マウスアップ
 * @param {MouseEvent} e マウスイベントの情報。
 */
function mouseUpListener(e) {
  // マウスアップイベントの重複を防ぐ
  if (ws.i.mouseClicked === false) {
    return;
  }
  // クリック終了時のマウス位置を取得
  ws.i.mouseClicked = false;
  ws.i.isVScrollBarDragging = false;
  if (ws.i.isHScrollBarDragging) {
    // 日付スクロール確定処理
    confirmTableX();
  }
  ws.i.isHScrollBarDragging = false;
  // リーフをドラッグ中であった場合、配置
  if (ws.i.draggingLeaf) {
    var isPlaceCanceled = false;
    // 配置権限があり、正しい箇所に配置された場合
    if (!isPlaceCanceled) {
      // リーフが配置されたマスを、座標から判定する
      putLeafToCell(ws.i.draggingLeaf);
      // DBを更新
      ajaxUpdateLeafPlan(ws.i.draggingLeaf);
      
    } else {
      // 配置キャンセル
    }
    ws.i.draggingLeaf = null;
  }
  // 範囲選択
  if (ws.i.validDragFlag === false && !ws.i.draggingLeaf) {
    ws.m.tasks.forEach(function (elem, idx, array) {
      if (WSUtils.checkCollisionRect(ws.i.dragX, ws.i.dragY, ws.i.dragW, ws.i.dragH, elem.x, elem.y, elem.width, elem.height) === true) {
        ws.i.validDragFlag = true;
        elem.selected = true;
      } else {
        elem.selected = false;
      }
    });
  } else {
    ws.i.validDragFlag = false;
  }
  // リーフを整列して描画
  setUnassignedLeafsPos();
}

/**
 * イベント：マウス移動
 * @param {MouseEvent} e マウスイベントの情報。
 */
function mouseMoveListener(e) {
  // マウス位置を取得
  adjustXY(e);
  // リーフのドラッグ移動
  if (ws.i.draggingLeaf) {
    ws.i.draggingLeaf.x += ws.i.mouseX - ws.i.mousePrevX;
    ws.i.draggingLeaf.y += ws.i.mouseY - ws.i.mousePrevY;
  } else {
    getMouseOveredLeafInfo();
  }
  // 範囲選択処理
  if (ws.i.mouseClicked === true && !ws.i.draggingLeaf
    && !ws.i.isVScrollBarDragging && !ws.i.isHScrollBarDragging) {
    calcDragArea();
    ws.m.tasks.forEach(function (elem, idx, array) {
      if (WSUtils.checkCollisionRect(ws.i.dragX, ws.i.dragY, ws.i.dragW, ws.i.dragH, elem.x, elem.y, elem.width, elem.height) === true) {
        ws.i.validDragFlag = true;
        elem.selected = true;
      } else {
        elem.selected = false;
      }
    });
  }
  // 縦スクロールバーをドラッグ中の場合に担当者表示範囲を変更
  if (ws.i.isVScrollBarDragging) {
    doTableVDrag();
  }
  // 横スクロールバーをドラッグ中の場合に日付表示範囲を変更
  if (ws.i.isHScrollBarDragging) {
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
  var clickedLeaf = checkClickedLeaf();
  if (clickedLeaf) {
    placeContextMenu(e.offsetX, e.offsetY);
    toggleContextmenu(true, clickedLeaf);
  } else {
    toggleContextmenu(false);
  }
  return;
}

/**
 * イベント：ホイール
 * @param {WheelEvent} e イベントの情報。
 * @param {number} wDelta 回転量。
 */
function wheelListener(e, wDelta) {
  // 上スクロール処理
  if (wDelta < 0) {
    scrollTableY(-1);
  }
  // 下スクロール処理
  if (wDelta > 0) {
    scrollTableY(1);
  }
  return;
}

/**
 * コンテキストメニューの表示を切り替えする
 * @param {boolean} openMenu trueで表示、falseで非表示。
 * @param {*} clickedLeaf 表示する場合、対象リーフのオブジェクト。
 */
function toggleContextmenu(openMenu, clickedLeaf) {
  if (openMenu) {
    $('#contextmenu-leaf').attr('data-leafsid', clickedLeaf.leafs_id).attr('data-schedulesid', clickedLeaf.schedules_id)['show']();
  } else {
    $('#contextmenu-leaf').attr('data-leafsid', -1).attr('data-schedulesid', -1)['hide']();
  }
}

/**
 * ドラッグ中の範囲を算出する。結果はdragX,dragY,dragW,DragHに代入する
 */
function calcDragArea() {
  if (ws.i.dragStartX > ws.i.mouseX) {
    ws.i.dragX = ws.i.mouseX;
    ws.i.dragW = ws.i.dragStartX - ws.i.mouseX;
  } else {
    ws.i.dragX = ws.i.dragStartX;
    ws.i.dragW = ws.i.mouseX - ws.i.dragStartX;
  }
  if (ws.i.dragStartY > ws.i.mouseY) {
    ws.i.dragY = ws.i.mouseY;
    ws.i.dragH = ws.i.dragStartY - ws.i.mouseY;
  } else {
    ws.i.dragY = ws.i.dragStartY;
    ws.i.dragH = ws.i.mouseY - ws.i.dragStartY;
  }
}


/**
 * マウスが重なったリーフの情報を取得する
 */
function getMouseOveredLeafInfo() {
  return;
}


/**
 * 全リーフについてクリック判定とドラッグ処理などを行う
 * @returns {Object} クリックされたリーフのオブジェクト。
 */
function checkClickedLeaf() {
  var clickedLeaf = null;
  var mostForwardLeaf;
  // 最前面のリーフをドラッグする
  ws.m.tasks.forEach(function (elem) {
    elem.selected = false;
    if (elem.visible === true) {
      var isHit = WSUtils.checkHitRectPt(ws.i.mouseX, ws.i.mouseY, elem.x, elem.y, elem.width, elem.height);
      if (isHit) {
        mostForwardLeaf = elem;
      }
    }
  });
  // リーフがクリックされた場合の処理
  if (mostForwardLeaf) {
    // 最前面のリーフを選択状態にしてドラッグ開始
    clickedLeaf = mostForwardLeaf;
    mostForwardLeaf.selected = true;
    if (mostForwardLeaf.row < 0) {
      if (mostForwardLeaf.width < ws.v.fixval.LEAF_DEF_WIDTH) {
        mostForwardLeaf.x = Math.floor(ws.i.mouseX - mostForwardLeaf.width / 2);
      }
    }
  }
  return clickedLeaf;
}

/**
 * 未割当リーフを整列する
 */
function setUnassignedLeafsPos() {
  var lfs = [];
  // 未割当リーフ一覧を検索して代入
  lfs = ws.m.tasks.filter(function (elem, idx) {
    if (elem.row === -1) {
      return true;
    }
    return false;
  });
  // 配列をid順に整列
  lfs.sort(function (a, b) {
    if (a.schedules_id > b.schedules_id) {
      return 1;
    } else {
      return -1;
    }
  });
  // 納期順に未割当リーフを配置
  var idDragging = -1;
  var prevDraggingLeafX;
  var prevDraggingLeafY;
  var prevDraggingLeafW;
  // ドラッグ中のリーフがある場合、整列前の位置を変数に保管
  if (ws.i.draggingLeaf) {
    idDragging = Number(ws.i.draggingLeaf.schedules_id);
    prevDraggingLeafX = ws.i.draggingLeaf.x;
    prevDraggingLeafY = ws.i.draggingLeaf.y;
    prevDraggingLeafW = ws.i.draggingLeaf.width;
  }
  // 工程順番に応じてリーフ位置をずらしながら配置する
  var cntUnassigned = 0;
  var lfslen = lfs.length;
  for (var i = 0; i < lfslen; i++) {
    // 1工程のみのリーフを配置
    if (Number(lfs[i].schedules_id) != idDragging) {
      lfs[i].x = 50 + cntUnassigned * (ws.v.fixval.LEAF_DEF_WIDTH + 10);
      lfs[i].y = 35;
      lfs[i].width = ws.v.fixval.LEAF_DEF_WIDTH;
    }
    // 横位置をずらして配置
    lfs[i].x = 50 + cntUnassigned * (ws.v.fixval.LEAF_DEF_WIDTH + 10);
    lfs[i].y = 35 ;
    lfs[i].width = ws.v.fixval.LEAF_DEF_WIDTH;
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
    ws.i.draggingLeaf.x = prevDraggingLeafX;
    ws.i.draggingLeaf.y = prevDraggingLeafY;
    ws.i.draggingLeaf.width = prevDraggingLeafW;
  }
}
