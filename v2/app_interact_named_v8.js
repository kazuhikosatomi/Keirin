// app_interact_named_v8.js（スマホ spacing 調整あり：さらに狭く）
console.log("✅ app_interact_named_v8.js 読み込まれた！");

const board = document.getElementById("board");
const groupButton = document.getElementById("groupButton");
const ungroupButton = document.getElementById("ungroupButton");
const ungroupAllButton = document.getElementById("ungroupAllButton");
const toggleNamesButton = document.getElementById("toggleNamesButton");
const toggleGroupsButton = document.getElementById("toggleGroupsButton");
const playerCountSelector = document.getElementById("playerCount");

let showPlayerNames = false;
let showGroupNames = false;
let isDragging = false;
let dragPreventClick = false;

let players = [];
let groupNames = {};

function initializePlayers(count) {
  const isSmallScreen = window.innerWidth <= 800 && window.innerHeight <= 600;
  const spacing = isSmallScreen ? 40 : 70;

  players = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    x: 80 + i * 70,
    y: 100,
    name: "",
    selected: false,
    groupId: null,
  }));
  groupNames = {};
  renderPlayers();
}

function renderPlayers() {
  board.innerHTML = "";

  const grouped = {};
  players.forEach(p => {
    if (p.groupId !== null) {
      if (!grouped[p.groupId]) grouped[p.groupId] = [];
      grouped[p.groupId].push(p);
    }
  });

  if (showGroupNames) {
    Object.entries(grouped).forEach(([groupId, groupPlayers]) => {
      const minX = Math.min(...groupPlayers.map(p => p.x));
      const minY = Math.min(...groupPlayers.map(p => p.y));

      const input = document.createElement("input");
      input.className = "group-name";
      input.placeholder = "ライン";
      input.value = groupNames[groupId] || "";
      input.style.left = `${minX}px`;
      const isSmallScreen = window.innerWidth <= 800 && window.innerHeight <= 600;
      input.style.top = `${minY - (isSmallScreen ? 16 : 28)}px`;
      input.style.width = "100px";

      input.addEventListener("input", () => {
        groupNames[groupId] = input.value;
      });

      board.appendChild(input);
    });
  }

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
      if (dragPreventClick) return;
      player.selected = !player.selected;
      renderPlayers();
    });

    circle.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (dragPreventClick) return;
      player.selected = !player.selected;
      renderPlayers();
    }, { passive: false });

    wrapper.appendChild(circle);

    if (showPlayerNames) {
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
      wrapper.appendChild(nameInput);
    }

    board.appendChild(wrapper);
  });

  setupInteract();
}

function setupInteract() {
  interact(".player-wrapper").draggable({
    listeners: {
      start() {
        isDragging = true;
        dragPreventClick = true;
      },
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
      },
      end() {
        isDragging = false;
        setTimeout(() => { dragPreventClick = false; }, 100);
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

groupButton.addEventListener("click", () => {
  const selected = players.filter(p => p.selected);
  if (selected.length === 0) return;

  selected.sort((a, b) => a.x - b.x);

  const baseX = selected[0].x;
  const baseY = selected[0].y;

  const isSmallScreen = window.innerWidth <= 800 && window.innerHeight <= 600;
  const spacing = isSmallScreen ? 40 : 70;

  const newGroupId = Date.now();

  console.log("✅ spacing 値（group）:", spacing);

  let totalWidth = selected.length * 40;
  selected.forEach((p, i) => {
    p.groupId = newGroupId;
    p.x = baseX + i * 48; // Adjusted spacing
    p.y = baseY;
    p.selected = false;
    console.log(`📍 選手 ${p.id}: x = ${p.x}, y = ${p.y}`);
  });

  groupNames[newGroupId] = "";
  renderPlayers();
});

ungroupButton.addEventListener("click", () => {
  players.forEach(p => {
    if (p.selected) {
      p.groupId = null;
      p.selected = false;
    }
  });
  renderPlayers();
});

ungroupAllButton.addEventListener("click", () => {
  players.forEach(p => {
    p.groupId = null;
  });
  groupNames = {};
  renderPlayers();
});

toggleNamesButton.addEventListener("click", () => {
  showPlayerNames = !showPlayerNames;
  renderPlayers();
});

toggleGroupsButton.addEventListener("click", () => {
  showGroupNames = !showGroupNames;
  renderPlayers();
});

playerCountSelector.addEventListener("change", () => {
  const newCount = Number(playerCountSelector.value);
  initializePlayers(newCount);
});

initializePlayers(Number(playerCountSelector.value));
