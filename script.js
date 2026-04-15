/* script.js */

  createGrid(centerX, centerY, a, b);
}

function drawEllipse(cx, cy, a, b) {
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.ellipse(cx, cy, a, b, 0, 0, 2 * Math.PI);
  ctx.stroke();
}

function createGrid(cx, cy, a, b) {
  grid.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let x = cx + (i - 5) * 10;
      let y = cy + (j - 5) * 10;

      let cell = document.createElement("div");
      cell.className = "cell";
      cell.innerText = `(${x.toFixed(0)}, ${y.toFixed(0)})`;

      grid.appendChild(cell);
    }
  }
}

# app.py (Python - Flask backend)
from flask import Flask, request, jsonify
import cv2
import numpy as np

app = Flask(__name__)

@app.route('/detect', methods=['POST'])
def detect():
    file = request.files['image']
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)

    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    for cnt in contours:
        if len(cnt) >= 5:
            ellipse = cv2.fitEllipse(cnt)
            (x, y), (MA, ma), angle = ellipse

            return jsonify({
                "center": [float(x), float(y)],
                "a": float(MA/2),
                "b": float(ma/2)
            })

    return jsonify({"error": "Không tìm thấy elip"})

if __name__ == '__main__':
    app.run(debug=True)
