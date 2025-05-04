console.log("✅ app.js 読み込まれた！");

const ungroupedArea = document.getElementById("ungrouped");
const groupsContainer = document.getElementById("groups");

let players = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    selected: false,
    groupId: null,
    name: "" // ← 選手名（空欄スタート）
  }));

let groupNames = {}; // { groupId: "ラインA", ... }

function renderPlayers() {
  ungroupedArea.innerHTML = "";
  groupsContainer.innerHTML = "";

  // グループに所属していない選手
  const ungroupedRow = document.createElement("div");
  ungroupedRow.className = "player-row";

  players.filter(p => p.groupId === null).forEach(player => {
    const div = createPlayerElement(player);
    ungroupedRow.appendChild(div);
  });

  ungroupedArea.appendChild(ungroupedRow);

  // グループごとに分けて表示
  const groupedPlayers = players.filter(p => p.groupId !== null);
  const groupMap = {};

  groupedPlayers.forEach(p => {
    if (!groupMap[p.groupId]) {
      groupMap[p.groupId] = [];
    }
    groupMap[p.groupId].push(p);
  });

  Object.entries(groupMap).forEach(([groupId, groupPlayers]) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "group";

    const input = document.createElement("input");
    input.value = groupNames[groupId] || `グループ ${groupId}`;
    input.addEventListener("input", () => {
      groupNames[groupId] = input.value;
    });
    groupDiv.appendChild(input);

    const row = document.createElement("div");
    row.className = "player-row";

    groupPlayers.forEach(p => {
      const div = createPlayerElement(p);
      row.appendChild(div);
    });

    groupDiv.appendChild(row);
    groupsContainer.appendChild(groupDiv);
  });
}

function createPlayerElement(player) {
    const wrapper = document.createElement("div");
    wrapper.className = "player-wrapper";
  
    const div = document.createElement("div");
    div.className = `player player-${player.id}`;
    div.textContent = player.id;
  
    if (player.selected) div.classList.add("selected");
  
    // 選択処理（PC・タッチ共通）
    div.addEventListener("click", () => {
      player.selected = !player.selected;
      renderPlayers();
    });
    div.addEventListener("touchend", (e) => {
      e.preventDefault();
      player.selected = !player.selected;
      renderPlayers();
    }, { passive: false });
  
    // 選手名入力欄
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = player.name || "";
    nameInput.placeholder = "名前";
    nameInput.className = "name-input";
    nameInput.addEventListener("input", () => {
      player.name = nameInput.value;
    });
  
    wrapper.appendChild(div);
    wrapper.appendChild(nameInput);
  
    return wrapper;
  }
  

function groupSelectedPlayers() {
  const groupId = Date.now();
  groupNames[groupId] = `ライン`;

  players.forEach((p) => {
    if (p.selected) {
      p.groupId = groupId;
      p.selected = false;
    }
  });

  console.log("✅ グループを作成しました:", groupId);
  renderPlayers();
}

function ungroupSelectedPlayers() {
  players.forEach((p) => {
    if (p.selected) {
      p.groupId = null;
      p.selected = false;
    }
  });
  console.log("✅ バラしました");
  renderPlayers();
}

// ボタンイベント
document.getElementById("groupButton").addEventListener("click", groupSelectedPlayers);
document.getElementById("groupButton").addEventListener("touchend", (e) => {
  e.preventDefault();
  groupSelectedPlayers();
}, { passive: false });

document.getElementById("ungroupButton").addEventListener("click", ungroupSelectedPlayers);
document.getElementById("ungroupButton").addEventListener("touchend", (e) => {
  e.preventDefault();
  ungroupSelectedPlayers();
}, { passive: false });

renderPlayers();
