console.log("✅ app.js 読み込まれた！");

const board = document.getElementById("board");

let players = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  selected: false,
  groupId: null,
}));

function renderPlayers() {
  board.innerHTML = "";

  players.forEach((player, index) => {
    const div = document.createElement("div");
    div.className = `player player-${player.id}`;
    div.textContent = player.id;

    if (player.selected) div.classList.add("selected");
    if (player.groupId !== null) div.classList.add("grouped");

// 選手のタップ選択を両対応（PCとタブレット）にする
div.addEventListener("click", () => {
    player.selected = !player.selected;
    renderPlayers();
  });
  
  // 追加：タッチ対応（iPad, iPhone）
  div.addEventListener("touchend", (e) => {
    e.preventDefault();
    player.selected = !player.selected;
    renderPlayers();
  }, { passive: false });
  

    board.appendChild(div);
  });
}

// グループ化ボタン
document.getElementById("groupButton").addEventListener("click", () => {
  const groupId = Date.now();
  players.forEach((p) => {
    if (p.selected) {
      p.groupId = groupId;
      p.selected = false;
    }
  });
  renderPlayers();
});

// 「バラす」ボタンの処理
document.getElementById("ungroupButton").addEventListener("click", () => {
    players.forEach((p) => {
      if (p.selected) {
        p.groupId = null;
        p.selected = false;
      }
    });
    console.log("✅ バラした選手のgroupIdを解除しました");
    renderPlayers();
  });
  

renderPlayers();
