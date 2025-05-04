const board = document.getElementById("board");
const players = Array.from({ length: 9 }, (_, i) => i + 1);
let dragTarget = null;

function renderPlayers() {
  board.innerHTML = "";

  players.forEach((num, index) => {
    const div = document.createElement("div");
    div.className = `player player-${num}`;
    div.textContent = num;

    // ドラッグ開始（PC）
    div.draggable = true;
    div.addEventListener("dragstart", () => {
      dragTarget = index;
      div.classList.add("dragging");
    });
    div.addEventListener("dragend", () => {
      dragTarget = null;
      div.classList.remove("dragging");
    });

    // ドロップ（PC）
    div.addEventListener("dragover", (e) => e.preventDefault());
    div.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragTarget === null) return;
      swapPlayers(dragTarget, index);
    });

    // タッチデバイス向け（touchstart 〜 touchend）
    div.addEventListener("touchstart", (e) => {
      dragTarget = index;
      div.classList.add("dragging");
    }, { passive: true });

    div.addEventListener("touchend", (e) => {
      div.classList.remove("dragging");
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropIndex = [...board.children].indexOf(target);
      if (dropIndex >= 0) {
        swapPlayers(dragTarget, dropIndex);
      }
      dragTarget = null;
    }, { passive: true });

    board.appendChild(div);
  });
}

function swapPlayers(fromIndex, toIndex) {
  const temp = players[fromIndex];
  players[fromIndex] = players[toIndex];
  players[toIndex] = temp;
  renderPlayers();
}

renderPlayers();
