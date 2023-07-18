'use strict';

var localStream;
var vid;
var strm;

const constraints = { audio: false, video: { facingMode: 'environment' } }; // front camera

var lastQR = {
  data: '',
  qrid: '',
  hdigit: '',
  timestamp: new Date()
};


/***
 * ビデオ開始
 */
async function getMedia() {
  const localVideo = document.getElementById('localVideo');
  try {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = localStream;
  } catch(err) {
    console.log(err);
  }
}

/**
 * カメラを停止する
 */
function stopVideo() {
  if (localStream) {
    localStream.getTracks().forEach(function (elem) {
      elem.stop();
    });
  }
  // キャプチャをクリア
  const cvsSnapshot = document.getElementById('snapshot');
  const context = cvsSnapshot.getContext('2d');
  context.clearRect(0, 0, cvsSnapshot.width, cvsSnapshot.height);
}

/***
 * QRを読み込んだか確認
 */
function checkQRData() {  
  return new Promise((resolve,reject) => {
    setTimeout(() => {
      let count = 0;
      const snapshot = document.getElementById('snapshot');
      const localVideo = document.getElementById('localVideo');
      const context = snapshot.getContext('2d');
      context.drawImage(localVideo, 0, 0, snapshot.width, snapshot.height);
      const img = context.getImageData(0, 0, snapshot.width, snapshot.height);
      let code = jsQR(img.data, img.width, img.height);
      if (code) {
        // lastQRにデータセット
        lastQR.data = code.data;
        lastQR.qrid = (code.data).slice(2);
        lastQR.hdigit = (code.data).slice(0,2);
        // alert(lastQR);
        resolve(lastQR);
      } else {
        resolve('');
      }
    }, POLL_INTERVAL);
  })
}

/**
 * グレーに変換
 * @param {*} ctx 
 */
function convertToGrayscale(ctx) {
  var imageData = ctx.getImageData(0, 0, snapshotCanvas.width, snapshotCanvas.height);
  for (var i = 0; i < imageData.data.length; i += 4) {
    var avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = avg; // red
    imageData.data[i + 1] = avg; // green
    imageData.data[i + 2] = avg; // blue
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * モノクロに変換
 * @param {*} ctx 
 */
function convertToMonochrome(ctx) {
  var imageData = ctx.getImageData(0, 0, snapshotCanvas.width, snapshotCanvas.height);
  for (var i = 0; i < imageData.data.length; i += 4) {
    var avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = (avg > 127 ? 255 : 0); // red
    imageData.data[i + 1] = (avg > 127 ? 255 : 0); // green
    imageData.data[i + 2] = (avg > 127 ? 255 : 0); // blue
  }
  ctx.putImageData(imageData, 0, 0);
}
