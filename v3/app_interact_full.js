console.log("✅ app_interact_full.js 読み込まれた！");

const board = document.getElementById("board");
const groupButton = document.getElementById("groupButton");
const ungroupButton = document.getElementById("ungroupButton");

let players = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  x: 80 + i * 70,
  y: 100,
  selected: false,
  groupId: null,
}));

function renderPlayers() {
  board.innerHTML = "";

  players.forEach(player => {
    const div = document.createElement("div");
    div.className = `player player-${player.id}`;
    if (player.selected) div.classList.add("selected");
    div.textContent = player.id;
    div.style.transform = `translate(${player.x}px, ${player.y}px)`;

    div.dataset.id = player.id;
    div.dataset.x = player.x;
    div.dataset.y = player.y;

    // 選択：PC
    div.addEventListener("click", () => {
      player.selected = !player.selected;
      renderPlayers();
    });

    // 選択：タッチ
    div.addEventListener("touchend", (e) => {
      e.preventDefault();
      player.selected = !player.selected;
      renderPlayers();
    }, { passive: false });

    board.appendChild(div);
  });

  setupInteract();
}

function setupInteract() {
  interact(".player").draggable({
    listeners: {
      move(event) {
        const id = Number(event.target.dataset.id);
        const player = players.find(p => p.id === id);
        if (!player) return;

        const dx = event.dx;
        const dy = event.dy;

        const groupPlayers = player.groupId
          ? players.filter(p => p.groupId === player.groupId)
          : [player];

        groupPlayers.forEach(p => {
          p.x += dx;
          p.y += dy;

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

// ラインを作る
groupButton.addEventListener("click", () => {
  const newGroupId = Date.now();
  players.forEach(p => {
    if (p.selected) {
      p.groupId = newGroupId;
      p.selected = false;
    }
  });
  renderPlayers();
});

// バラす
ungroupButton.addEventListener("click", () => {
  players.forEach(p => {
    if (p.selected) {
      p.groupId = null;
      p.selected = false;
    }
  });
  renderPlayers();
});

renderPlayers();
