// // js/main.js

// 1. 캔버스 요소와 2D 컨텍스트 가져오기
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 2. 게임의 내부 해상도 설정
// 이 크기를 기준으로 모든 게임 요소를 그립니다.
canvas.width = 960;
canvas.height = 540;

// 3. 모든 것이 잘 작동하는지 확인하기 위한 테스트 함수
function initialize() {
  // 화면을 검은색으로 칠합니다.
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 간단한 환영 메시지를 흰색으로 그립니다.
  ctx.fillStyle = "white";
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Project Start!", canvas.width / 2, canvas.height / 2);
}

// 함수 실행
initialize();
