console.log("✅ app_interact.js 読み込まれた！");

const board = document.getElementById("board");

let players = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  x: 80 + i * 70,
  y: 100,
}));

function renderPlayers() {
  board.innerHTML = "";

  players.forEach((player) => {
    const div = document.createElement("div");
    div.className = `player player-${player.id}`;
    div.textContent = player.id;

    // 初期位置
    div.style.transform = `translate(${player.x}px, ${player.y}px)`;

    // ドラッグ時に使うデータを埋め込む
    div.dataset.id = player.id;
    div.dataset.x = player.x;
    div.dataset.y = player.y;

    board.appendChild(div);
  });

  setupInteract();
}

function setupInteract() {
  interact(".player").draggable({
    listeners: {
      move(event) {
        const target = event.target;
        const id = Number(target.dataset.id);
        const player = players.find(p => p.id === id);

        if (!player) return;

        player.x += event.dx;
        player.y += event.dy;

        target.dataset.x = player.x;
        target.dataset.y = player.y;

        target.style.transform = `translate(${player.x}px, ${player.y}px)`;
      }
    },
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: "parent",
        endOnly: true
      })
    ]
  });
}

renderPlayers();
