const board = document.getElementById("board");

// 初期表示（9人）
const players = Array.from({ length: 9 }, (_, i) => i + 1);
let dragTarget = null;

function renderPlayers() {
  board.innerHTML = "";
  players.forEach((num, index) => {
    const div = document.createElement("div");
    div.className = `player player-${num}`;
    div.textContent = num;
    div.draggable = true;

    // イベント（PC）
    div.addEventListener("dragstart", () => {
      dragTarget = index;
      div.classList.add("dragging");
    });
    div.addEventListener("dragend", () => {
      dragTarget = null;
      div.classList.remove("dragging");
    });

    div.addEventListener("dragover", (e) => e.preventDefault());
    div.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragTarget === null) return;
      const temp = players[dragTarget];
      players[dragTarget] = players[index];
      players[index] = temp;
      renderPlayers();
    });

    // イベント（タブレット用 touch）
    div.addEventListener("touchstart", (e) => {
      dragTarget = index;
      div.classList.add("dragging");
    });

    div.addEventListener("touchend", (e) => {
      div.classList.remove("dragging");
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropIndex = [...board.children].indexOf(target);
      if (dropIndex >= 0) {
        const temp = players[dragTarget];
        players[dragTarget] = players[dropIndex];
        players[dropIndex] = temp;
        renderPlayers();
      }
      dragTarget = null;
    });

    board.appendChild(div);
  });
}

renderPlayers();
