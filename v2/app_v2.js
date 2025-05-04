console.log("✅ app_v2.js 読み込まれた！");

const board = document.getElementById("board");

let players = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  x: 80 + i * 70,
  y: 100,
}));

let dragTarget = null;
let offsetX = 0;
let offsetY = 0;

function renderPlayers() {
  board.innerHTML = "";

  players.forEach((player) => {
    const div = document.createElement("div");
    div.className = `player player-${player.id}`;
    div.textContent = player.id;

    div.style.left = `${player.x}px`;
    div.style.top = `${player.y}px`;

    // マウス操作
    div.addEventListener("mousedown", (e) => {
      dragTarget = player;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    });

    // タッチ操作
    div.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      dragTarget = player;

      const boardRect = board.getBoundingClientRect();
      offsetX = touch.clientX - boardRect.left - player.x;
      offsetY = touch.clientY - boardRect.top - player.y;

      e.preventDefault();
    }, { passive: false });

    board.appendChild(div);
  });
}

// PC: ドラッグ中の移動
document.addEventListener("mousemove", (e) => {
  if (dragTarget) {
    const boardRect = board.getBoundingClientRect();
    dragTarget.x = e.clientX - boardRect.left - offsetX;
    dragTarget.y = e.clientY - boardRect.top - offsetY;
    renderPlayers();
  }
});

document.addEventListener("mouseup", () => {
  dragTarget = null;
});

// iPad: ドラッグ中の移動
document.addEventListener("touchmove", (e) => {
  if (dragTarget) {
    const touch = e.touches[0];
    const boardRect = board.getBoundingClientRect();
    dragTarget.x = touch.clientX - boardRect.left - offsetX;
    dragTarget.y = touch.clientY - boardRect.top - offsetY;
    renderPlayers();
  }
}, { passive: false });

document.addEventListener("touchend", () => {
  dragTarget = null;
});

renderPlayers();
