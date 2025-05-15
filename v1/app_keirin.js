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
  console.log("🟡 initializePlayers called with count:", count);
  const isSmallScreen = window.innerWidth <= 800 && window.innerHeight <= 600;
  const spacing = isSmallScreen ? 40 : 70;

  // Use a fixed 3-column grid for 7–9 players (restores original working layout)
  players = Array.from({ length: count }, (_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    console.log(`🔹 Player ${i + 1} -> col: ${col}, row: ${row}, x: ${60 + col * 100}, y: ${120 + row * 100}`);
    return {
      id: i + 1,
      x: 60 + col * 80,
      y: 60 + row * 80,
      name: "",
      selected: false,
      selectedOrder: undefined,
      groupId: null,
      dragging: false,
    };
  });
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
    const scale = player.dragging ? 1.2 : 1;
    wrapper.style.transform = `translate(${player.x}px, ${player.y}px) scale(${scale})`;
    wrapper.dataset.id = player.id;

    const circle = document.createElement("div");
    circle.className = `player player-${player.id}`;
    if (player.selected) circle.classList.add("selected");
    circle.textContent = player.id;

    if (player.selectedOrder !== undefined) {
      const orderBadge = document.createElement("div");
      orderBadge.className = "selection-order";
      orderBadge.textContent = player.selectedOrder + 1;
      circle.appendChild(orderBadge);
    }

    circle.addEventListener("click", () => {
      if (dragPreventClick) return;
      if (!player.selected) {
        player.selected = true;
        player.selectedOrder = players.filter(p => p.selected).length - 1;
      } else {
        const removedOrder = player.selectedOrder;
        player.selected = false;
        player.selectedOrder = undefined;
        players.forEach(p => {
          if (p.selected && p.selectedOrder > removedOrder) {
            p.selectedOrder -= 1;
          }
        });
      }
      renderPlayers();
    });

    circle.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (dragPreventClick) return;
      if (!player.selected) {
        player.selected = true;
        player.selectedOrder = players.filter(p => p.selected).length - 1;
      } else {
        const removedOrder = player.selectedOrder;
        player.selected = false;
        player.selectedOrder = undefined;
        players.forEach(p => {
          if (p.selected && p.selectedOrder > removedOrder) {
            p.selectedOrder -= 1;
          }
        });
      }
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

  // Move dragging reset to the very end, after DOM rendering and interact setup
  if (!isDragging) {
    players.forEach(p => p.dragging = false);
  }
}

function setupInteract() {
  interact(".player-wrapper").draggable({
    listeners: {
      start(event) {
        console.log("🟢 Drag start:", event.target);
        isDragging = true;
        dragPreventClick = true;
        const playerCircle = event.target.querySelector('.player');
        if (playerCircle) {
          playerCircle.classList.add("dragging");
        }
        const id = Number(event.target.dataset.id);
        const player = players.find(p => p.id === id);
        const group = player?.groupId ? players.filter(p => p.groupId === player.groupId) : [player];
        group.forEach(p => p.dragging = true);
      },
      move(event) {
        console.log("🟡 Drag move:", event.dx, event.dy);
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
      end(event) {
        console.log("🔴 Drag end");
        isDragging = false;
        setTimeout(() => { dragPreventClick = false; }, 100);
        const playerCircle = event.target.querySelector('.player');
        if (playerCircle) {
          playerCircle.classList.remove("dragging");
        }
        const id = Number(event.target.dataset.id);
        const player = players.find(p => p.id === id);
        const group = player?.groupId ? players.filter(p => p.groupId === player.groupId) : [player];
        group.forEach(p => p.dragging = false);
        // Ensure dragging state visually updates immediately after drag ends
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

groupButton.addEventListener("click", () => {
  const selected = players.filter(p => p.selected);
  if (selected.length === 0) return;

  selected.sort((a, b) => a.selectedOrder - b.selectedOrder || a.x - b.x);

  const baseX = selected[0].x;
  const baseY = selected[0].y;

  const isSmallScreen = window.innerWidth <= 800 && window.innerHeight <= 600;
  const spacing = isSmallScreen ? 40 : 70;

  const newGroupId = Date.now();

  console.log("✅ spacing 値（group）:", spacing);

  let totalWidth = selected.length * 40;
  selected.forEach((p, i) => {
    p.groupId = newGroupId;
    p.x = baseX + i * 60; // Adjusted spacing
    p.y = baseY;
    p.selected = false;
    p.selectedOrder = undefined;
    console.log(`📍 選手 ${p.id}: x = ${p.x}, y = ${p.y}`);
  });

  groupNames[newGroupId] = "";
  renderPlayers();
  showToast("選択選手のラインを形成しました");
});

ungroupButton.addEventListener("click", () => {
  players.forEach(p => {
    if (p.selected) {
      p.groupId = null;
      p.selected = false;
      p.selectedOrder = undefined;
    }
  });
  showToast("選択選手のラインを解除しました");
  renderPlayers();
});

ungroupAllButton.addEventListener("click", () => {
  players.forEach(p => {
    p.groupId = null;
    p.selected = false;
    p.selectedOrder = undefined;
  });
  groupNames = {};
  renderPlayers();
  showToast("全てのラインが解除されました");
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

// 保存・復元ボタンの処理
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");

saveButton.addEventListener("click", () => {
  const state = {
    players,
    groupNames,
    showPlayerNames,
    showGroupNames
  };
  localStorage.setItem("keirinState", JSON.stringify(state));
  showToast("保存しました");
});

loadButton.addEventListener("click", () => {
  const stateStr = localStorage.getItem("keirinState");
  if (!stateStr) return;
  try {
    const state = JSON.parse(stateStr);
    players = state.players || [];
    groupNames = state.groupNames || {};
    showPlayerNames = state.showPlayerNames || false;
    showGroupNames = state.showGroupNames || false;
    renderPlayers();
    showToast("復元しました");
  } catch (e) {
    console.error("復元エラー:", e);
  }
});

// トーストメッセージ表示用関数
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

initializePlayers(Number(playerCountSelector.value));

/* Add CSS styles for selected and selection order */
const style = document.createElement('style');
style.textContent = `
.player.selected {
  transform: scale(1.2);
  z-index: 10;
  position: relative;
}

.selection-order {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  text-align: center;
  line-height: 20px;
  pointer-events: none;
}

.player-wrapper.dragging {
  z-index: 1000;
}

.player.dragging {
  transform: scale(1.4);
  transition: transform 0.2s ease;
  z-index: 1000;
}
`;
document.head.appendChild(style);
