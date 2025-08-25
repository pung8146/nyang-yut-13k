// // js/main.js

// --- [0단계] 기본 설정 ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 960;
canvas.height = 540;

// --- [1단계] 윷 던지기 로직 ---
let yutResult = { name: "Ready", value: 0 };
// (윷 던지기 함수는 변경사항 없습니다)
function throwYut() {
  let flipped = 0;
  for (let i = 0; i < 4; i++) {
    if (Math.random() < 0.5) flipped++;
  }
  if (flipped === 1 && Math.random() < 0.3) {
    yutResult = { name: "Back-do", value: -1 };
    return;
  }
  const results = [
    { name: "Mo", value: 5 },
    { name: "Do", value: 1 },
    { name: "Gae", value: 2 },
    { name: "Geol", value: 3 },
    { name: "Yut", value: 4 },
  ];
  yutResult = results[flipped === 0 ? 0 : flipped];
}

// --- [2단계] 윷놀이판 데이터 및 그리기 (완전히 새로 작성) ---

// 2-1. 윷놀이판 모든 '자리'의 좌표를 직접 정의 (가장 확실한 방법)
const stations = [
  // 바깥 경로 (0-19)
  { id: 0, x: 280, y: 70 },
  { id: 1, x: 380, y: 70 },
  { id: 2, x: 480, y: 70 },
  { id: 3, x: 580, y: 70 },
  { id: 4, x: 680, y: 70 },
  { id: 5, x: 680, y: 170 },
  { id: 6, x: 680, y: 270 },
  { id: 7, x: 680, y: 370 },
  { id: 8, x: 680, y: 470 },
  { id: 9, x: 580, y: 470 },
  { id: 10, x: 480, y: 470 },
  { id: 11, x: 380, y: 470 },
  { id: 12, x: 280, y: 470 },
  { id: 13, x: 280, y: 370 },
  { id: 14, x: 280, y: 270 },
  { id: 15, x: 280, y: 170 },
  // 안쪽 경로 (16-20)
  { id: 16, x: 380, y: 170 },
  { id: 17, x: 580, y: 170 },
  { id: 18, x: 580, y: 370 },
  { id: 19, x: 380, y: 370 },
  { id: 20, x: 480, y: 270 },
];

// 2-2. 각 경로가 어떤 '자리'들을 순서대로 연결하는지 정의
const paths = {
  outer: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
  shortcut1: [0, 16, 20, 8, 12],
  shortcut2: [4, 17, 20, 19, 12], // 윷놀이판 규칙상 실제로는 10번으로 갑니다.
};
// 윷놀이판 규칙에 따라 오른쪽 위에서 중앙을 거쳐 왼쪽 아래로 가는 지름길은 없습니다.
// 여기서는 시각적 표현을 위해 두 대각선을 모두 그립니다.
paths.shortcut2_visual = [4, 17, 20, 19, 12];

// 2-3. 윷놀이판 그리는 함수
function drawBoard() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  // 경로 그리기
  for (const pathName in paths) {
    const path = paths[pathName];
    for (let i = 0; i < path.length - 1; i++) {
      const startNode = stations[path[i]];
      const endNode = stations[path[i + 1]];
      ctx.beginPath();
      ctx.moveTo(startNode.x, startNode.y);
      ctx.lineTo(endNode.x, endNode.y);
      ctx.stroke();
    }
  }

  // 자리(원) 그리기
  stations.forEach((s) => {
    ctx.beginPath();
    const radius =
      s.id === 0 || s.id === 4 || s.id === 8 || s.id === 12 || s.id === 20
        ? 18
        : 12;
    ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = s.id === 0 ? "cyan" : "black";
    ctx.fill();
    ctx.stroke();

    // 자리 ID 텍스트 그리기
    ctx.fillStyle = "white";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // 텍스트를 원의 정중앙에 위치시킴
    ctx.fillText(s.id, s.x, s.y);
  });
}

// --- [3단계] 새로운 코드 시작 ---

// 3-1. 플레이어와 AI '말' 데이터 정의
const cat = {
  id: 0, // 현재 위치한 station의 id
  color: "white",
  pieceRadius: 10,
};

const rat = {
  id: 0,
  color: "red",
  pieceRadius: 10,
};

// 3-2. '말'을 이동시키는 함수
// (지금은 가장 바깥 경로만 따라 움직이는 간단한 버전)
function movePiece(piece, steps) {
  const currentPath = paths.outer; // 현재는 바깥 경로만 사용
  const currentIndex = currentPath.indexOf(piece.id);

  if (currentIndex === -1) return; // 경로에 없는 경우 움직이지 않음

  // 20칸이므로, 20으로 나눈 나머지로 순환시킴
  // -1 (도착) 처리를 위해 경로 길이보다 1 작은 19를 사용
  let nextIndex = (currentIndex + steps) % 20;

  // 빽도 처리
  if (steps === -1) {
    nextIndex = currentIndex === 0 ? 19 : currentIndex - 1;
  }

  piece.id = currentPath[nextIndex];
}

// 3-3. '말'을 그리는 함수
function drawPieces() {
  // 고양이 그리기
  const catStation = stations.find((s) => s.id === cat.id);
  if (catStation) {
    ctx.beginPath();
    ctx.arc(catStation.x, catStation.y, cat.pieceRadius, 0, Math.PI * 2);
    ctx.fillStyle = cat.color;
    ctx.fill();
    ctx.strokeStyle = "black"; // 눈에 잘 띄게 검은 테두리 추가
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 쥐 그리기
  const ratStation = stations.find((s) => s.id === rat.id);
  if (ratStation) {
    // 쥐는 고양이와 살짝 겹치지 않게 위치 조정
    const ratX = ratStation.x + 5;
    const ratY = ratStation.y + 5;
    ctx.beginPath();
    ctx.arc(ratX, ratY, rat.pieceRadius, 0, Math.PI * 2);
    ctx.fillStyle = rat.color;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// --- 화면을 그리는 메인 함수 (수정) ---
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBoard(); // 윷놀이판 먼저 그리고

  drawPieces(); // 그 위에 고양이와 쥐 말을 그림! (새로 추가)

  ctx.fillStyle = "white";
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  let resultText =
    yutResult.name === "Ready"
      ? "Click to Throw!"
      : `${yutResult.name} (${yutResult.value})`;
  ctx.fillText(resultText, canvas.width / 2, canvas.height - 30);
}

// --- 이벤트 처리 및 게임 시작 (수정) ---
canvas.addEventListener("click", () => {
  throwYut();
  movePiece(cat, yutResult.value); // 윷 결과만큼 고양이 이동!
  draw();
});

// 게임 시작
// (drawBoard() 함수는 draw() 내부에서 호출되므로 여기서 따로 호출할 필요 없음)
draw();
