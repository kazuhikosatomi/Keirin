
console.log("✅ app.js 読み込まれた！");
document.body.addEventListener("touchstart", (e) => {
    console.log("✅ bodyでtouchstart検知！");
  }, { passive: false });
  

const board = document.getElementById("board");
const players = Array.from({ length: 9 }, (_, i) => i + 1);
let dragTarget = null;

function renderPlayers() {
  board.innerHTML = "";

  players.forEach((num, index) => {
    const div = document.createElement("div");
    div.className = `player player-${num}`;
    div.textContent = num;

    div.draggable = true;

    // PC用ドラッグ
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
      swapPlayers(dragTarget, index);
    });

    // タブレット用タッチ操作
    div.addEventListener("touchstart", (e) => {
        e.preventDefault(); // ← これ重要
        console.log("touchstart!", index); // ← ここに追加
        dragTarget = index;
        div.classList.add("dragging");
      }, { passive: false });
      

      div.addEventListener("touchend", (e) => {
        e.preventDefault();
        div.classList.remove("dragging");
      
        const touch = e.changedTouches[0];
        console.log("touchend座標:", touch.clientX, touch.clientY); // ← 追加
      
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        console.log("elementFromPoint:", target); // ← 追加
      
        const dropIndex = [...board.children].indexOf(target);
        console.log("dropIndex候補:", dropIndex); // ← 追加
      
        if (dropIndex >= 0) {
          console.log("✅ dropIndex!", dropIndex); // ← ここが出れば成功
          swapPlayers(dragTarget, dropIndex);
        }
      
        dragTarget = null;
      }, { passive: false });
      
      

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
