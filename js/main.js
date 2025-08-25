// // js/main.js

// --- [0단계] 기본 설정 ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 960;
canvas.height = 540;

// --- [1단계] 윷 던지기 로직 ---
let yutResult = { name: "Ready", value: 0 };
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

// --- [2단계] 윷놀이판 데이터 및 그리기 ---

// 2-1. 윷놀이판 모든 '자리'의 좌표를 직접 정의
const stations = [
  { id: 0, x: 680, y: 470 },
  { id: 1, x: 680, y: 370 },
  { id: 2, x: 680, y: 270 },
  { id: 3, x: 680, y: 170 },
  { id: 4, x: 680, y: 70 },
  { id: 5, x: 580, y: 70 },
  { id: 6, x: 480, y: 70 },
  { id: 7, x: 380, y: 70 },
  { id: 8, x: 280, y: 70 },
  { id: 9, x: 280, y: 170 },
  { id: 10, x: 280, y: 270 },
  { id: 11, x: 280, y: 370 },
  { id: 12, x: 280, y: 470 },
  { id: 13, x: 380, y: 470 },
  { id: 14, x: 480, y: 470 },
  { id: 15, x: 580, y: 470 },
  { id: 16, x: 580, y: 370 },
  { id: 17, x: 380, y: 370 },
  { id: 18, x: 380, y: 170 },
  { id: 19, x: 580, y: 170 },
  { id: 20, x: 480, y: 270 },
];

// 2-2. 각 경로가 어떤 '자리'들을 순서대로 연결하는지 정의 (ID 기준 최종 수정)
const paths = {
  // 0 -> 1 -> 2 ... 순서로 시계 반대 방향으로 도는 경로
  outer: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
  // 지름길도 새로운 ID 체계에 맞게 수정
  shortcut1: [4, 17, 20, 18, 8],
  shortcut2: [12, 19, 20, 16, 0],
};

function drawBoard() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  const allPaths = [paths.outer, paths.shortcut1, paths.shortcut2];
  allPaths.forEach((path) => {
    for (let i = 0; i < path.length - 1; i++) {
      const startNode = stations.find((s) => s.id === path[i]);
      const endNode = stations.find((s) => s.id === path[i + 1]);
      if (startNode && endNode) {
        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);
        ctx.lineTo(endNode.x, endNode.y);
        ctx.stroke();
      }
    }
  });

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
    ctx.fillStyle = "white";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.id, s.x, s.y);
  });
}

// --- [3단계] '말' 데이터 및 로직 (대규모 수정) ---

const cat = {
  currentStationId: 0,
  color: "white",
  pieceRadius: 10,
  currentPath: paths.outer, // 현재 이동 중인 경로
};

const rat = {
  currentStationId: 0,
  color: "red",
  pieceRadius: 10,
  currentPath: paths.outer,
};

// 턴 관리 변수
let isPlayerTurn = true;

// '말'을 이동시키는 함수 (지름길 로직 추가)
function movePiece(piece, steps) {
  // 1. 현재 위치가 코너인지 확인
  const isAtShortcutStart =
    piece.currentPath === paths.outer &&
    (piece.currentStationId === 4 || piece.currentStationId === 12);
  if (isAtShortcutStart) {
    // 지름길 우선 적용
    piece.currentPath =
      piece.currentStationId === 4 ? paths.shortcut1 : paths.shortcut2;
  }

  const currentPath = piece.currentPath;
  let currentIndexOnPath = currentPath.indexOf(piece.currentStationId);

  // 2. 이동할 다음 위치 계산
  if (steps === -1) {
    // 빽도
    currentIndexOnPath =
      currentIndexOnPath === 0
        ? currentPath.length - 2
        : currentIndexOnPath - 1;
  } else {
    // 일반 이동
    currentIndexOnPath += steps;
  }

  // 3. 완주 또는 경로 변경 체크
  if (currentIndexOnPath >= currentPath.length - 1) {
    // 완주!
    piece.currentStationId = 0;
    piece.currentPath = paths.outer; // 경로 초기화
    console.log(`${piece.color} 완주!`);
  } else {
    piece.currentStationId = currentPath[currentIndexOnPath];
    // 지름길이 끝나는 지점에 도달하면 다시 바깥 경로로 변경
    if (
      (piece.currentPath === paths.shortcut1 && piece.currentStationId === 8) ||
      (piece.currentPath === paths.shortcut2 && piece.currentStationId === 0)
    ) {
      piece.currentPath = paths.outer;
    }
  }
}

function drawPieces() {
  [cat, rat].forEach((piece, index) => {
    const station = stations.find((s) => s.id === piece.currentStationId);
    if (station) {
      // 말이 겹치지 않도록 살짝 옆으로 그림
      const offsetX = index === 0 ? -5 : 5;
      ctx.beginPath();
      ctx.arc(
        station.x + offsetX,
        station.y,
        piece.pieceRadius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = piece.color;
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

// --- 화면을 그리는 메인 함수 ---
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPieces();

  ctx.fillStyle = "white";
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  let resultText =
    yutResult.name === "Ready"
      ? "Click to Throw!"
      : `${yutResult.name} (${yutResult.value})`;
  ctx.fillText(resultText, canvas.width / 2, canvas.height - 30);
}

// --- [4단계] 게임 루프 및 AI 턴 처리 ---

// 쥐의 턴을 처리하는 함수
function handleRatTurn() {
  isPlayerTurn = false;
  draw(); // "Rat's Turn..." 메시지 표시

  // 쥐가 생각하는 것처럼 보이게 1초 지연
  setTimeout(() => {
    throwYut();
    movePiece(rat, yutResult.value);

    // 쥐가 윷이나 모를 던졌는지 체크
    if (yutResult.name === "Yut" || yutResult.name === "Mo") {
      handleRatTurn(); // 한 번 더!
    } else {
      isPlayerTurn = true; // 플레이어 턴으로 전환
      yutResult = { name: "Ready", value: 0 }; // 결과 초기화
      draw();
    }
  }, 1000); // 1초 (1000ms)
}

// --- 이벤트 처리 및 게임 시작 (수정) ---
canvas.addEventListener("click", () => {
  // 플레이어 턴일 때만 윷 던지기 가능
  if (!isPlayerTurn) return;

  throwYut();
  movePiece(cat, yutResult.value);
  draw();

  // 윷이나 모가 아니면 쥐의 턴으로 넘어감
  if (yutResult.name !== "Yut" && yutResult.name !== "Mo") {
    handleRatTurn();
  }
});

// 게임 시작
draw();
