let current = null;
let offsetX = 0;
let offsetY = 0;
let racerCount = 6;
let groups = [];

const racerColors = [
  'white', 'black', 'red', 'blue', 'yellow',
  'green', 'orange', 'pink', 'purple'
];

document.getElementById('startBtn').addEventListener('click', () => {
  const playerCount = document.getElementById('playerCount').value;
  racerCount = parseInt(playerCount);

  const board = document.getElementById('board');
  board.innerHTML = '';

  for (let i = 1; i <= racerCount; i++) {
    const racer = document.createElement('div');
    racer.classList.add('racer');
    racer.style.position = 'absolute';
    racer.style.left = `${50 + 100 * (i - 1)}px`;
    racer.style.top = `100px`;
    racer.style.backgroundColor = racerColors[i - 1];
    const numberColor = (i === 2) ? 'white' : 'black';
    racer.innerHTML = `
    <span class="racer-number" style="color: ${numberColor};">${i}</span><br>
    <span class="name" contenteditable="true" style="outline: none;">未設定</span>
  `;
  

  
    


    board.appendChild(racer);
    setRacerListeners(racer);
  }

  alert(`${racerCount}人の選手が追加されました！`);
});



document.getElementById('groupBtn').addEventListener('click', () => {
  const selected = document.querySelectorAll('.racer.selected');
  if (selected.length === 0) return;

  const board = document.getElementById('board');
  const lineName = prompt("このラインの名前を入力してください", "ラインA");

  // ★ グループ全体の左上の位置を計算
  let minLeft = Infinity;
  let minTop = Infinity;
  selected.forEach(racer => {
    const left = parseInt(racer.style.left);
    const top = parseInt(racer.style.top);
    if (left < minLeft) minLeft = left;
    if (top < minTop) minTop = top;
  });

  // wrapper の作成（←位置を minLeft/minTop に設定）
  const wrapper = document.createElement('div');
  wrapper.classList.add('wrapper');
  wrapper.style.position = 'absolute';
  wrapper.style.left = `${minLeft}px`;
  wrapper.style.top = `${minTop}px`;
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'flex-start'; // ←重要（ラベル左寄せ）
  wrapper.style.border = 'none';

  // ラベル作成（そのままでOK）
  const label = document.createElement('div');
  label.contentEditable = true;
  label.textContent = lineName || "無名ライン";
  label.classList.add('group-label');
  label.style.fontSize = '12px';
  label.style.fontWeight = 'bold';
  label.style.marginBottom = '4px';
  label.style.padding = '2px 4px';
  label.style.backgroundColor = 'transparent'; // 背景を透明に
  label.style.border = 'none';                // 枠線をなくす
  label.style.userSelect = 'text';
  label.style.outline = 'none';
  

  // グループ div
  const group = document.createElement('div');
  group.classList.add('group');
  group.style.position = 'relative';
  group.style.padding = '10px';
  group.style.display = 'inline-block';
  group.style.border = 'none';

  wrapper.appendChild(label);
  wrapper.appendChild(group);
  board.appendChild(wrapper);

// 1. 選手を left 順に並び替え
const sorted = Array.from(selected).sort((a, b) => {
  return parseInt(a.style.left) - parseInt(b.style.left);
});

// 2. 間隔を詰めて配置（例：間隔50px）
sorted.forEach((racer, index) => {
  group.appendChild(racer);

  racer.style.left = `${index * 60}px`;
  racer.style.top = `0px`;

  racer.classList.remove('selected');
  racer.style.transform = 'scale(1)';
  racer.style.zIndex = 'auto';
  racer.style.border = '';
});
  

  setRacerListeners(wrapper);
  groups.push(wrapper);
});


document.getElementById('unsortBtn').addEventListener('click', (event) => {
  const allWrappers = document.querySelectorAll('.wrapper');

  allWrappers.forEach(wrapper => {
    const group = wrapper.querySelector('.group');
    if (!group) return;

    const racersInGroup = group.querySelectorAll('.racer');

    // Shiftキーが押されている場合は、selectedなグループだけ解除
    const shouldUnsort = !event.shiftKey || Array.from(racersInGroup).some(r => r.classList.contains('selected'));

    if (!shouldUnsort) return;

    const wrapperLeft = parseInt(wrapper.style.left);
    const wrapperTop = parseInt(wrapper.style.top);

    racersInGroup.forEach(racer => {
      const board = document.getElementById('board');
      board.appendChild(racer);

      const racerLeft = parseInt(racer.style.left) + wrapperLeft;
      const racerTop = parseInt(racer.style.top) + wrapperTop;
      racer.style.left = `${racerLeft}px`;
      racer.style.top = `${racerTop}px`;

      setRacerListeners(racer);
      racer.style.border = '';
    });

    wrapper.remove();
  });

  // すべての選手の選択を解除
  const allRacers = document.querySelectorAll('.racer');
  allRacers.forEach(racer => {
    racer.classList.remove('selected');
    racer.style.transform = 'scale(1)';
    racer.style.zIndex = 'auto';
  });

  // すべてのグループの選択も解除
  allWrappers.forEach(wrapper => {
    wrapper.classList.remove('selected');
  });
});




function setRacerListeners(element) {
  const isWrapper = element.classList.contains('wrapper');

  const toggleSelection = (e) => {
    e.stopPropagation();
    if (!isWrapper) {
      element.classList.toggle('selected');
      if (element.classList.contains('selected')) {
        element.style.transform = 'scale(1.2)';
        element.style.zIndex = '1000';
      } else {
        element.style.transform = 'scale(1)';
        element.style.zIndex = 'auto';
      }
    }
  };

  // イベントを一度だけ登録：モバイルは touchstart、PC は click
  if ('ontouchstart' in window) {
    element.addEventListener('touchstart', toggleSelection, { passive: false });
  } else {
    element.addEventListener('click', toggleSelection);
  }

  if (isWrapper) {
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, { passive: false });
  } else {
    element.addEventListener('touchstart', (e) => {
      const parent = element.closest('.wrapper');
      if (parent) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, { passive: false });

    element.addEventListener('mousedown', startDrag);
  }
}




function startDrag(e) {
  // タッチイベントの場合、タッチ位置を取得
  if (e.type === 'touchstart') {
    current = e.currentTarget;
    offsetX = e.touches[0].clientX - current.offsetLeft;
    offsetY = e.touches[0].clientY - current.offsetTop;
  } else {
    current = e.currentTarget;
    offsetX = e.clientX - current.offsetLeft;
    offsetY = e.clientY - current.offsetTop;
  }

  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', endDrag);
}

function drag(e) {
  if (current) {
    let clientX, clientY;

    // タッチイベントの場合、タッチ位置を取得
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    current.style.left = `${clientX - offsetX}px`;
    current.style.top = `${clientY - offsetY}px`;
  }
}

function endDrag() {
  current = null;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', drag);
  document.removeEventListener('touchend', endDrag);
}

document.getElementById('saveBtn').addEventListener('click', () => {
  const racers = Array.from(document.querySelectorAll('.racer')).map(racer => {
    const number = parseInt(racer.querySelector('.racer-number').textContent);
    const name = racer.querySelector('.name').textContent;
    const color = racer.style.backgroundColor;
    const left = parseInt(racer.style.left);
    const top = parseInt(racer.style.top);
    return { number, name, color, left, top };
  });

  const groups = Array.from(document.querySelectorAll('.wrapper')).map(wrapper => {
    const label = wrapper.querySelector('.group-label')?.textContent || '';
    const left = parseInt(wrapper.style.left);
    const top = parseInt(wrapper.style.top);
    const members = Array.from(wrapper.querySelectorAll('.racer')).map(racer => {
      const number = parseInt(racer.querySelector('.racer-number').textContent);
      const name = racer.querySelector('.name').textContent;
      const color = racer.style.backgroundColor;
      const left = parseInt(racer.style.left);
      const top = parseInt(racer.style.top);
      return { number, name, color, left, top };
    });
    return { label, left, top, members };
  });

  const data = { racers, groups };
  localStorage.setItem('racerBoardData', JSON.stringify(data));

  alert('保存しました！');
});


document.getElementById('loadBtn').addEventListener('click', () => {
  const dataStr = localStorage.getItem('racerBoardData');
  if (!dataStr) {
    alert('保存されたデータがありません');
    return;
  }

  const data = JSON.parse(dataStr);
  const board = document.getElementById('board');
  board.innerHTML = ''; // 既存をクリア

  // グループの選手番号を先に集める
  const groupedNumbers = new Set();
  data.groups.forEach(group => {
    group.members.forEach(member => {
      groupedNumbers.add(member.number);
    });
  });

  // グループ外の選手だけを表示
  data.racers.forEach(racer => {
    if (groupedNumbers.has(racer.number)) return; // グループに含まれる選手はスキップ

    const el = document.createElement('div');
    el.classList.add('racer');
    el.style.position = 'absolute';
    el.style.left = `${racer.left}px`;
    el.style.top = `${racer.top}px`;
    el.style.backgroundColor = racer.color;
    const numberColor = (racer.number === 2) ? 'white' : 'black';
    el.innerHTML = `
      <span class="racer-number" style="color: ${numberColor};">${racer.number}</span><br>
      <span class="name" contenteditable="true" style="outline: none;">${racer.name}</span>
    `;
    board.appendChild(el);
    setRacerListeners(el);
  });

  // グループの復元
  data.groups.forEach(group => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    wrapper.style.position = 'absolute';
    wrapper.style.left = `${group.left}px`;
    wrapper.style.top = `${group.top}px`;
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'flex-start';

    const label = document.createElement('div');
    label.contentEditable = true;
    label.textContent = group.label || '無名ライン';
    label.classList.add('group-label');
    label.style.fontSize = '12px';
    label.style.fontWeight = 'bold';
    label.style.marginBottom = '4px';
    label.style.padding = '2px 4px';
    label.style.backgroundColor = 'transparent';
    label.style.border = 'none';    
    label.style.userSelect = 'text';
    label.style.outline = 'none';

    const groupEl = document.createElement('div');
    groupEl.classList.add('group');
    groupEl.style.position = 'relative';
    groupEl.style.padding = '10px';
    groupEl.style.display = 'inline-block';

    wrapper.appendChild(label);
    wrapper.appendChild(groupEl);
    board.appendChild(wrapper);

    group.members.forEach(member => {
      const racer = document.createElement('div');
      racer.classList.add('racer');
      racer.style.position = 'absolute';
      racer.style.left = `${member.left}px`;
      racer.style.top = `${member.top}px`;
      racer.style.backgroundColor = member.color;
      const numberColor = (member.number === 2) ? 'white' : 'black';
      racer.innerHTML = `
        <span class="racer-number" style="color: ${numberColor};">${member.number}</span><br>
        <span class="name" contenteditable="true" style="outline: none;">${member.name}</span>
      `;
      groupEl.appendChild(racer);
      setRacerListeners(racer);
    });

    setRacerListeners(wrapper);
    groups.push(wrapper);
  });

  alert('復元しました！');
});
document.getElementById('toggleNamesBtn').addEventListener('click', () => {
  const allNames = document.querySelectorAll('.name');
  allNames.forEach(nameElement => {
    if (nameElement.style.display === 'none') {
      nameElement.style.display = 'block';
    } else {
      nameElement.style.display = 'none';
    }
  });
});
let groupNamesVisible = true;

document.getElementById('toggleGroupNamesBtn').addEventListener('click', () => {
  groupNamesVisible = !groupNamesVisible;

  const labels = document.querySelectorAll('.group-label');
  labels.forEach(label => {
    label.classList.toggle('hidden', !groupNamesVisible);
  });
});

