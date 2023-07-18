/**
 * @fileOverview 日程表示画面
 * @desc 画面描画処理。
 * @author Fumihiko Kondo
 */

/**
 * 周期再描画処理
 */
function tickRedraw() {
  // ウィンドウからフォーカスが外れているなどの場合に、軽量化のためFPSを落とす
  // if (ws.gts.prodStaff.mouseMovedTimerCount >= 600 &&
  //   ws.gts.ship.mouseMovedTimerCount >= 600 &&
  //   ws.gts.proj.mouseMovedTimerCount >= 600 &&
  //   ws.gts.prodStaffSim.mouseMovedTimerCount >= 600 &&
  //   ws.gts.shipSim.mouseMovedTimerCount >= 600) {
  if (ws.gts.prodStaff.mouseMovedTimerCount >= 600 && ws.gts.ship.mouseMovedTimerCount >= 600 && ws.gts.proj.mouseMovedTimerCount >= 600) {
    setTimeout(tickRedraw, 1000.0 / 10.0); // 一定時間以上マウス移動なし
  } else if (ws.gts.prodStaff.hasFocus) {
    setTimeout(tickRedraw, 1000.0 / 60.0); // 通常の再描画速度
  // } else if (ws.gts.prodStaff.v.mouseOveredInfoLfId >= 0 ||
  //   ws.gts.ship.v.mouseOveredInfoLfId >= 0 ||
  //   ws.gts.proj.v.mouseOveredInfoLfId >= 0 ||
  //   ws.gts.prodStaffSim.v.mouseOveredInfoLfId >= 0 ||
  //   ws.gts.shipSim.v.mouseOveredInfoLfId >= 0) {
  //   setTimeout(tickRedraw, 1000.0 / 30.0); // ツールチップ表示中
  } else if (ws.gts.prodStaff.v.mouseOveredInfoLfId >= 0 || ws.gts.ship.v.mouseOveredInfoLfId >= 0 || ws.gts.proj.v.mouseOveredInfoLfId >= 0 ) {
    setTimeout(tickRedraw, 1000.0 / 30.0); // ツールチップ表示中
  } else {
    setTimeout(tickRedraw, 1000.0 / 8.0); // 画面フォーカス無し
  }
  // ウィンドウが表示されている間、定期的に再描画
  if (ws.gts.prodStaff.doc.hidden === false) {
    requestAnimationFrame(function () {
      // ws.draw.call(ws);
      ws.getActiveGantt().redrawCanvas.call(ws.getActiveGantt());
      // ws.gts.prodStaff.redrawCanvas.call(ws.gts.prodStaff);
      // ws.gts.ship.redrawCanvas.call(ws.gts.ship);
      // ws.gts.proj.redrawCanvas.call(ws.gts.proj); 
    });
  }
}

/**
 * タイマーカウント処理(再読み込みなど)
 */
function tickTimer() {
  setTimeout(tickTimer, 100);
  // 0から999の間でカウント
  if (timerCnt >= 999) {
    timerCnt = 0;
  } else {
    timerCnt++;
  }
  if (ws.gts.prodStaff.mouseMovedTimerCount < 600) {
    ws.gts.prodStaff.mouseMovedTimerCount++;
  }
  if (ws.gts.ship.mouseMovedTimerCount < 600) {
    ws.gts.ship.mouseMovedTimerCount++;
  }
  if (ws.gts.proj.mouseMovedTimerCount < 600) {
    ws.gts.proj.mouseMovedTimerCount++;
  }
  if (timerReload < ws.gts.prodStaff.v.fixval.PAGE_RELOAD_TIME) {
    timerReload++;
  } else {
    // 操作を行ってない場合、リーフの再読込処理を行う
    //ajaxReload();
  }
}
