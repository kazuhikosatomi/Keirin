console.log("✅ app_interact_group.js 読み込まれた！");

const board = document.getElementById("board");

let players = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  x: 80 + i * 70,
  y: 100,
  groupId: null, // グループID（ライン形成時に設定）
}));

function renderPlayers() {
  board.innerHTML = "";

  players.forEach((player) => {
    const div = document.createElement("div");
    div.className = `player player-${player.id}`;
    div.textContent = player.id;

    // 座標を transform で適用
    div.style.transform = `translate(${player.x}px, ${player.y}px)`;

    // データ属性に情報を埋め込む
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

        const dx = event.dx;
        const dy = event.dy;

        // 同じgroupIdを持つ選手全員を対象にする（nullなら単独移動）
        const movingPlayers = player.groupId
          ? players.filter(p => p.groupId === player.groupId)
          : [player];

        movingPlayers.forEach(p => {
          p.x += dx;
          p.y += dy;

          // DOM更新
          const elem = document.querySelector(`.player[data-id='${p.id}']`);
          if (elem) {
            elem.dataset.x = p.x;
            elem.dataset.y = p.y;
            elem.style.transform = `translate(${p.x}px, ${p.y}px)`;
          }
        });
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
