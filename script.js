const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultTable = document.getElementById('resultTable').querySelector('tbody');

canvas.width = 600;
canvas.height = 400;

// Bật camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

// Vẽ grid + trục tọa độ
function drawGrid(ctx, width, height, size=50) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vẽ trục X/Y
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width/2, 0);
  ctx.lineTo(width/2, height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height/2);
  ctx.lineTo(width, height/2);
  ctx.stroke();
}

function processFrame() {
  drawGrid(ctx, canvas.width, canvas.height);

  // Vẽ frame từ video lên canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  let src = cv.imread(canvas);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  let edges = new cv.Mat();
  cv.Canny(gray, edges, 100, 200);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

  for (let i = 0; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    if (cnt.rows >= 5) {
      let ellipse = cv.fitEllipse(cnt);
      cv.ellipse(src, ellipse, [255, 0, 0, 255], 2);

      // Lấy thông số elip
      let x0 = ellipse.center.x.toFixed(1);
      let y0 = ellipse.center.y.toFixed(1);
      let a = (ellipse.size.width / 2).toFixed(1);
      let b = (ellipse.size.height / 2).toFixed(1);

      // Phương trình elip
      let equation = `(x - ${x0})²/${a}² + (y - ${y0})²/${b}² = 1`;

      // Hiển thị phương trình ngay trên canvas
      ctx.fillStyle = "blue";
      ctx.font = "16px Arial";
      ctx.fillText(equation, 20, 30);

      // Thêm vào bảng
      let row = resultTable.insertRow();
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);

      let miniCanvas = document.createElement('canvas');
      miniCanvas.width = 100;
      miniCanvas.height = 80;
      let miniCtx = miniCanvas.getContext('2d');
      miniCtx.strokeStyle = "blue";
      miniCtx.beginPath();
      miniCtx.ellipse(50, 40, a/4, b/4, 0, 0, 2 * Math.PI);
      miniCtx.stroke();

      cell1.appendChild(miniCanvas);
      cell2.textContent = equation;
    }
    cnt.delete();
  }

  cv.imshow(canvas, src);

  src.delete(); gray.delete(); edges.delete();
  contours.delete(); hierarchy.delete();

  requestAnimationFrame(processFrame);
}

function onOpenCvReady() {
  console.log("OpenCV.js đã sẵn sàng");
  processFrame();
}

