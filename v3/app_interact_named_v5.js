console.log("✅ app_interact_named_v5.js 読み込まれた！");

const board = document.getElementById("board");
const groupButton = document.getElementById("groupButton");
const ungroupButton = document.getElementById("ungroupButton");

let players = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  x: 80 + i * 70,
  y: 100,
  name: "",
  selected: false,
  groupId: null,
}));

let groupNames = {};

function renderPlayers() {
  board.innerHTML = "";

  const grouped = {};
  players.forEach(p => {
    if (p.groupId !== null) {
      if (!grouped[p.groupId]) grouped[p.groupId] = [];
      grouped[p.groupId].push(p);
    }
  });

  // グループ名の表示
  Object.entries(grouped).forEach(([groupId, groupPlayers]) => {
    const minX = Math.min(...groupPlayers.map(p => p.x));
    const minY = Math.min(...groupPlayers.map(p => p.y));

    const input = document.createElement("input");
    input.className = "group-name";
    input.value = groupNames[groupId] || `ライン`;
    input.style.left = `${minX}px`;
    input.style.top = `${minY - 28}px`;

    input.addEventListener("input", () => {
      groupNames[groupId] = input.value;
    });

    board.appendChild(input);
  });

  players.forEach(player => {
    const wrapper = document.createElement("div");
    wrapper.className = "player-wrapper";
    wrapper.style.transform = `translate(${player.x}px, ${player.y}px)`;
    wrapper.dataset.id = player.id;

    const circle = document.createElement("div");
    circle.className = `player player-${player.id}`;
    if (player.selected) circle.classList.add("selected");
    circle.textContent = player.id;

    circle.addEventListener("click", () => {
      player.selected = !player.selected;
      renderPlayers();
    });

    circle.addEventListener("touchend", (e) => {
      e.preventDefault();
      player.selected = !player.selected;
      renderPlayers();
    }, { passive: false });

    const nameInput = document.createElement("input");
    nameInput.className = "player-name";
    nameInput.value = player.name;
    nameInput.placeholder = "名前";
    nameInput.addEventListener("input", (e) => {
      player.name = e.target.value;
    });
    nameInput.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    wrapper.appendChild(circle);
    wrapper.appendChild(nameInput);
    board.appendChild(wrapper);
  });

  setupInteract();
}

function setupInteract() {
  interact(".player-wrapper").draggable({
    listeners: {
      move(event) {
        const id = Number(event.target.dataset.id);
        const player = players.find(p => p.id === id);
        if (!player) return;

        const dx = event.dx;
        const dy = event.dy;

        const group = player.groupId
          ? players.filter(p => p.groupId === player.groupId)
          : [player];

        group.forEach(p => {
          p.x += dx;
          p.y += dy;
        });

        renderPlayers();
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

// グループ化（ラインを作る）
groupButton.addEventListener("click", () => {
  const selected = players.filter(p => p.selected);

  selected.sort((a, b) => a.x - b.x); // ← 追加！

  if (selected.length === 0) return;

  const baseX = selected[0].x;
  const baseY = selected[0].y;
  const spacing = 70;
  const newGroupId = Date.now();

  selected.forEach((p, i) => {
    p.groupId = newGroupId;
    p.x = baseX + i * spacing;
    p.y = baseY;
    p.selected = false;
  });

  groupNames[newGroupId] = "ライン";
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
