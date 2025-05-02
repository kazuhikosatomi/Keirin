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

  let minLeft = Infinity, minTop = Infinity;
  selected.forEach(racer => {
    const left = parseInt(racer.style.left);
    const top = parseInt(racer.style.top);
    if (left < minLeft) minLeft = left;
    if (top < minTop) minTop = top;
  });

  const wrapper = document.createElement('div');
  wrapper.classList.add('wrapper');
  wrapper.style.position = 'absolute';
  wrapper.style.left = `${minLeft}px`;
  wrapper.style.top = `${minTop}px`;
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'flex-start';
  wrapper.style.border = 'none';

  const label = document.createElement('div');
  label.contentEditable = true;
  label.textContent = lineName || "無名ライン";
  label.classList.add('group-label');
  label.style.fontSize = '12px';
  label.style.fontWeight = 'bold';
  label.style.marginBottom = '4px';
  label.style.padding = '2px 4px';
  label.style.backgroundColor = 'transparent';
  label.style.border = 'none';
  label.style.userSelect = 'text';
  label.style.outline = 'none';

  const group = document.createElement('div');
  group.classList.add('group');
  group.style.position = 'relative';
  group.style.padding = '10px';
  group.style.display = 'inline-block';
  group.style.border = 'none';

  wrapper.appendChild(label);
  wrapper.appendChild(group);
  board.appendChild(wrapper);

  const sorted = Array.from(selected).sort((a, b) => parseInt(a.style.left) - parseInt(b.style.left));
  sorted.forEach((racer, index) => {
    const newRacer = racer.cloneNode(true); // イベントなし複製
    newRacer.style.position = 'absolute';
    newRacer.style.left = `${index * 60}px`;
    newRacer.style.top = `0px`;
    newRacer.style.transform = 'scale(1)';
    newRacer.style.zIndex = 'auto';
    newRacer.classList.remove('selected');
    newRacer.style.border = '';
    group.appendChild(newRacer);

    racer.remove(); // 元の選手を削除
  });

  setRacerListeners(wrapper); // グループをドラッグ可能に
  groups.push(wrapper);
});




let selectedDisabled = false; // 選択機能を無効化するフラグ

document.getElementById('unsortBtn').addEventListener('click', (event) => {
  selectedDisabled = true; // 「バラす」後は選択を無効化

  const allWrappers = document.querySelectorAll('.wrapper');
  allWrappers.forEach(wrapper => {
    const group = wrapper.querySelector('.group');
    if (!group) return;

    const racersInGroup = group.querySelectorAll('.racer');
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
      setRacerListeners(racer); // 個別の選手にリスナーをセット
      racer.style.border = '';
    });

    wrapper.remove();
  });

  const allRacers = document.querySelectorAll('.racer');
  allRacers.forEach(racer => {
    racer.classList.remove('selected');
    racer.style.transform = 'scale(1)';
    racer.style.zIndex = 'auto';
  });

  allWrappers.forEach(wrapper => wrapper.classList.remove('selected'));
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

    // スマホで長押しでのみドラッグ許可
    let longPressTimer = null;
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      longPressTimer = setTimeout(() => {
        startDrag(e); // 長押しされたら startDrag を実行
      }, 300);
    }, { passive: false });

    element.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    });
    element.addEventListener('touchmove', () => {
      clearTimeout(longPressTimer);
    });

    // 選手名の編集を可能にするため、タッチ時の処理を調整
    element.querySelectorAll('.name').forEach(name => {
      name.addEventListener('touchstart', (e) => {
        e.stopPropagation();  // ここでタッチイベントを無効化しないように調整
      });
    });
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

// ここではドラッグ関連の処理が依然として有効です



  





function startDrag(e) {
  e.preventDefault();

  const isTouch = e.type === 'touchstart';
  const clientX = isTouch ? e.touches[0].clientX : e.clientX;
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;

  current = e.currentTarget;
  offsetX = clientX - current.offsetLeft;
  offsetY = clientY - current.offsetTop;

  if (isTouch) {
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
  } else {
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
  }
}

function drag(e) {
  if (!current) return;
  e.preventDefault();

  const isTouch = e.type === 'touchmove';
  const clientX = isTouch ? e.touches[0].clientX : e.clientX;
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;

  current.style.left = `${clientX - offsetX}px`;
  current.style.top = `${clientY - offsetY}px`;
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
  board.innerHTML = '';

  const groupedNumbers = new Set();
  data.groups.forEach(group => {
    group.members.forEach(member => {
      groupedNumbers.add(member.number);
    });
  });

  data.racers.forEach(racer => {
    if (groupedNumbers.has(racer.number)) return;

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
    nameElement.style.display = (nameElement.style.display === 'none') ? 'block' : 'none';
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
