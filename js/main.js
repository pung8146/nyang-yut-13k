// --- [0단계] 기본 설정 (기존 코드) ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 540;

// --- [1단계] 새로운 코드 시작 ---

// 1. 게임 상태를 관리할 변수들
let yutResult = {
  name: "Ready", // 결과 이름 (예: '개', '윷')
  value: 0, // 이동할 칸 수
  sticks: [0, 0, 0, 0], // 윷가락 상태 (0: 앞면, 1: 뒷면)
};

// 2. 윷 던지기 로직 함수
function throwYut() {
  let flipped = 0; // 뒤집힌(앞면-흰색) 윷의 개수
  let newSticks = [];

  for (let i = 0; i < 4; i++) {
    if (Math.random() < 0.5) {
      // 50% 확률로 뒤집힘
      flipped++;
      newSticks.push(0); // 0은 앞면(흰색)
    } else {
      newSticks.push(1); // 1은 뒷면(검은색)
    }
  }

  // 빽도 로직: 4개 중 1개만 뒤집혔을 때, 30% 확률로 빽도로 변경
  if (flipped === 1 && Math.random() < 0.3) {
    yutResult = { name: "Back-do", value: -1, sticks: [1, 1, 1, 2] }; // 2는 빽도
    return;
  }

  // 결과 매핑
  const results = [
    { name: "Mo", value: 5 }, // flipped = 0 (모두 뒷면)
    { name: "Do", value: 1 }, // flipped = 1
    { name: "Gae", value: 2 }, // flipped = 2
    { name: "Geol", value: 3 }, // flipped = 3
    { name: "Yut", value: 4 }, // flipped = 4
  ];

  yutResult = { ...results[flipped], sticks: newSticks };
}

// 3. 화면을 그리는 메인 함수
function draw() {
  // 3-1. 화면을 검은색으로 깨끗하게 지우기
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3-2. 윷가락 그리기
  const stickWidth = 30;
  const stickHeight = 150;
  const spacing = 50;
  const startX = (canvas.width - (stickWidth * 4 + spacing * 3)) / 2;
  const startY = 150;

  yutResult.sticks.forEach((stick, i) => {
    const x = startX + i * (stickWidth + spacing);

    if (stick === 0) {
      // 앞면 (흰색)
      ctx.fillStyle = "white";
      ctx.fillRect(x, startY, stickWidth, stickHeight);
    } else if (stick === 1) {
      // 뒷면 (검은색 + 흰색 테두리)
      ctx.fillStyle = "black";
      ctx.fillRect(x, startY, stickWidth, stickHeight);
      ctx.strokeStyle = "white";
      ctx.strokeRect(x, startY, stickWidth, stickHeight);
    } else {
      // 빽도 (빨간색 X)
      ctx.fillStyle = "white";
      ctx.fillRect(x, startY, stickWidth, stickHeight);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x + stickWidth, startY + stickHeight);
      ctx.moveTo(x + stickWidth, startY);
      ctx.lineTo(x, startY + stickHeight);
      ctx.stroke();
      ctx.lineWidth = 1; // 다른 그림을 위해 선 굵기 초기화
    }
  });

  // 3-3. 결과 텍스트 그리기
  ctx.fillStyle = "white";
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  let resultText = `${yutResult.name} (${yutResult.value})`;
  if (yutResult.name === "Ready") resultText = "Click to Throw!";
  ctx.fillText(resultText, canvas.width / 2, 400);
}

// 4. 클릭 이벤트 처리
canvas.addEventListener("click", () => {
  throwYut(); // 클릭할 때마다 윷 던지기 함수 호출
  draw(); // 결과를 화면에 다시 그리기
});

// 5. 게임 시작
draw(); // 페이지 로드 시 첫 화면 그리기
