(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const CLIENT_ID = 8968988761;

  const ICONS = {
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    video: '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 9l4-2v10l-4-2"/>',
    audio: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    archive: '<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>'
  };

  const FILES = [
    {
      id: 'f1',
      name: 'Годовой_отчёт_2025.pdf',
      type: 'doc',
      label: 'PDF',
      size: '4.8 МБ',
      sizeBytes: 5033164,
      date: 'сегодня, 14:32',
      addedAt: Date.now() - 1000 * 60 * 30,
      starred: true,
      shared: false,
      deleted: false,
      description: 'Финансовый отчёт за 2025 год. Согласован с бухгалтерией.',
      views: 12
    },
    {
      id: 'f2',
      name: 'Договор_с_ООО_Ромашка.docx',
      type: 'doc',
      label: 'DOCX',
      size: '182 КБ',
      sizeBytes: 186368,
      date: 'вчера, 18:15',
      addedAt: Date.now() - 1000 * 60 * 60 * 22,
      starred: false,
      shared: true,
      deleted: false,
      description: 'Шаблон договора на оказание услуг. Отправлен клиенту.',
      views: 5
    },
    {
      id: 'f3',
      name: 'Team_photo_2025.jpg',
      type: 'image',
      label: 'JPG',
      size: '8.2 МБ',
      sizeBytes: 8598323,
      date: '12 сентября, 11:40',
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      starred: true,
      shared: false,
      deleted: false,
      description: 'Общая фотография команды на годовщину компании.',
      views: 34
    },
    {
      id: 'f4',
      name: 'Archive_backup_2025.zip',
      type: 'archive',
      label: 'ZIP',
      size: '1.2 ГБ',
      sizeBytes: 1288490188,
      date: '10 сентября, 09:05',
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      starred: false,
      shared: false,
      deleted: false,
      description: 'Полный бэкап проектов за 2025 год. Зашифрован.',
      views: 2
    }
  ];

  const LEVELS = {
    db: {
      title: 'База данных',
      text: 'Здесь только метаданные: имя файла, размер, дата, ID пользователя. <strong>Ключей шифрования здесь нет</strong>. Даже если злоумышленник получит полный доступ к базе, он не сможет расшифровать ни один файл.'
    },
    crypto: {
      title: '.fsecurity',
      text: 'Криптомодуль, который хранит ключи и выполняет шифрование. Если украсть только .fsecurity — <strong>файлов у злоумышленника всё равно нет</strong>. А без доступа к базе он не знает, какой ключ к какому файлу относится.'
    },
    storage: {
      title: 'Хранилище',
      text: 'Только зашифрованные данные. Файлы называются случайными идентификаторами вида <strong>9c7f2a81d04e…bin</strong>. Даже получив всё хранилище целиком, без ключей и базы восстановить исходные файлы невозможно.'
    }
  };

  const GAME = {
    db: 'Вы получили <strong>базу данных</strong>. Внутри — имена, размеры и даты. Ключей нет. <strong>Файлы недоступны.</strong>',
    crypto: 'Вы получили <strong>.fsecurity</strong>. Внутри — код модуля и ключи. Но самих файлов нет, а к каким записям относятся ключи — неизвестно. <strong>Файлы недоступны.</strong>',
    storage: 'Вы получили <strong>хранилище</strong>. Внутри — шифротекст с непонятными именами. Ключей нет. <strong>Файлы недоступны.</strong>'
  };

  const NOTIFICATIONS = [
    {
      id: 'n1',
      type: 'success',
      title: 'Файл загружен',
      text: 'Годовой_отчёт_2025.pdf успешно сохранён в защищённое хранилище.',
      time: '5 минут назад',
      unread: true
    },
    {
      id: 'n2',
      type: 'security',
      title: 'Защита активна',
      text: 'Ваши файлы зашифрованы .fsecurity. Проверка целостности пройдена.',
      time: '2 часа назад',
      unread: true
    },
    {
      id: 'n3',
      type: 'info',
      title: 'Добро пожаловать',
      text: 'Flaut Cloud готов к работе. Бесплатно 2 ГБ личного и 4 ГБ корпоративного хранилища.',
      time: 'сегодня',
      unread: false
    }
  ];

  const state = {
    files: FILES.slice(),
    notifications: NOTIFICATIONS.slice(),
    view: 'all',
    filter: 'all',
    search: '',
    slide: 0,
    gameAttempts: 0,
    maxAttempts: 3,
    user: null,
    currentViewerFile: null
  };

  const storageValue = $('#storageValue');
  const storageBar = $('#storageBar');
  const storageFill = $('#storageFill');
  const storageHint = $('#storageHint');
  const teamNavBadge = $('#teamNavBadge');
  const navAllCount = $('#navAllCount');
  const navStarredCount = $('#navStarredCount');
  const navTrashCount = $('#navTrashCount');
  const fileGrid = $('#fileGrid');
  const filesEmpty = $('#filesEmpty');
  const emptyTitle = $('#emptyTitle');
  const emptyText = $('#emptyText');
  const emptyLoginBtn = $('#emptyLoginBtn');
  const searchInput = $('#searchInput');
  const carouselTrack = $('#carouselTrack');
  const carouselDots = $$('.carousel-dot');
  const carouselPrev = $('#carouselPrev');
  const carouselNext = $('#carouselNext');
  const levelDetail = $('#levelDetail');
  const gameResult = $('#gameResult');
  const gameAttempts = $('#gameAttempts');
  const sidebar = $('#sidebar');
  const menuBtn = $('#menuBtn');
  const loginBtn = $('#loginBtn');
  const userBtn = $('#userBtn');
  const userName = $('#userName');
  const userTag = $('#userTag');
  const userAvatar = $('#userAvatar');
  const userStatus = $('#userStatus');
  const uploadBtn = $('#uploadBtn');
  const heroUpload = $('#heroUpload');
  const heroPricing = $('#heroPricing');
  const securityBtn = $('#securityBtn');
  const teamForm = $('#teamForm');
  const teamCompany = $('#teamCompany');
  const teamInn = $('#teamInn');
  const teamAgree = $('#teamAgree');
  const teamCompanyError = $('#teamCompanyError');
  const teamInnError = $('#teamInnError');
  const teamAgreeError = $('#teamAgreeError');
  const teamFormNote = $('#teamFormNote');
  const teamCreateView = $('#teamCreateView');
  const teamPanel = $('#teamPanel');
  const notifBtn = $('#notifBtn');
  const notifPanel = $('#notifPanel');
  const notifList = $('#notifList');
  const notifDot = $('#notifDot');
  const notifClear = $('#notifClear');
  const loginAgree = $('#loginAgree');
  const loginAgreeError = $('#loginAgreeError');
  const telegramContainer = $('#telegram-login-container');
  const viewerStar = $('#viewerStar');
  const viewerDownload = $('#viewerDownload');

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function iconSvg(type) {
    const path = ICONS[type] || ICONS.doc;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 Б';
    const units = ['Б', 'КБ', 'МБ', 'ГБ'];
    let v = bytes;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
    return v.toFixed(v < 10 ? 1 : 0) + ' ' + units[i];
  }

  function renderStorage() {
    if (!state.user) {
      storageValue.textContent = 'Войдите';
      storageBar.hidden = true;
      storageHint.textContent = 'Войдите, чтобы увидеть объём';
      return;
    }
    const used = state.files.filter(function (f) { return !f.deleted; }).reduce(function (sum, f) { return sum + f.sizeBytes; }, 0);
    const limit = 2 * 1024 ** 3;
    const pct = Math.min((used / limit) * 100, 100);
    storageValue.textContent = formatBytes(used) + ' из 2 ГБ';
    storageBar.hidden = false;
    storageFill.style.width = pct + '%';
    storageHint.innerHTML = 'Корпоративное: <strong>4 ГБ</strong>';
  }

  function renderCounts() {
    const active = state.files.filter(function (f) { return !f.deleted; });
    navAllCount.textContent = String(active.length);
    navStarredCount.textContent = String(active.filter(function (f) { return f.starred; }).length);
    navTrashCount.textContent = String(state.files.filter(function (f) { return f.deleted; }).length);
  }

  function filterByView(list) {
    if (state.view === 'recent') {
      return list.slice().sort(function (a, b) { return b.addedAt - a.addedAt; });
    }
    if (state.view === 'starred') {
      return list.filter(function (f) { return f.starred; });
    }
    if (state.view === 'shared') {
      return list.filter(function (f) { return f.shared; });
    }
    if (state.view === 'trash') {
      return state.files.filter(function (f) { return f.deleted; });
    }
    return list;
  }

  function filterByChip(list) {
    if (state.filter === 'all') return list;
    if (state.filter === 'media') return list.filter(function (f) { return f.type === 'image' || f.type === 'video' || f.type === 'audio'; });
    if (state.filter === 'doc') return list.filter(function (f) { return f.type === 'doc'; });
    if (state.filter === 'archive') return list.filter(function (f) { return f.type === 'archive'; });
    return list;
  }

  function filterBySearch(list) {
    if (!state.search) return list;
    const q = state.search.toLowerCase();
    return list.filter(function (f) {
      return f.name.toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q);
    });
  }

  function fileCardHtml(f) {
    const isTrash = state.view === 'trash';
    const starClass = f.starred ? 'file-star active' : 'file-star';
    const starSvg = '<svg viewBox="0 0 24 24" fill="' + (f.starred ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';

    return '' +
      '<article class="file-card" data-id="' + f.id + '" tabindex="0" role="button" aria-label="Файл ' + escapeHtml(f.name) + ', ' + f.size + '">' +
        '<button type="button" class="' + starClass + '" data-action="star" data-id="' + f.id + '" aria-label="' + (f.starred ? 'Убрать из избранного' : 'В избранное') + '">' + starSvg + '</button>' +
        '<div class="file-preview ' + f.type + '">' +
          iconSvg(f.type) +
          '<span class="file-badge">' + f.label + '</span>' +
        '</div>' +
        '<h3 class="file-name">' + escapeHtml(f.name) + '</h3>' +
        '<div class="file-meta">' +
          '<span class="size">' + f.size + '</span>' +
          '<span>' + f.date + '</span>' +
        '</div>' +
        '<div class="file-actions">' +
          (isTrash
            ? '<button type="button" class="file-action" data-action="restore" data-id="' + f.id + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>Восстановить</button>' +
              '<button type="button" class="file-action danger" data-action="purge" data-id="' + f.id + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Удалить</button>'
            : '<button type="button" class="file-action" data-action="download" data-id="' + f.id + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>Скачать</button>' +
              '<button type="button" class="file-action danger" data-action="delete" data-id="' + f.id + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Удалить</button>'
          ) +
        '</div>' +
      '</article>';
  }

  function setEmptyState(title, text, showButton) {
    emptyTitle.textContent = title;
    emptyText.textContent = text;
    emptyLoginBtn.hidden = !showButton;
  }

  function renderFiles() {
    if (!state.user) {
      fileGrid.innerHTML = '';
      fileGrid.hidden = true;
      filesEmpty.hidden = false;
      setEmptyState(
        'Войдите, чтобы увидеть файлы',
        'После входа через Telegram здесь появятся ваши документы, медиа и архивы. Всё защищено технологией .fsecurity.',
        true
      );
      return;
    }

    fileGrid.hidden = false;

    if (state.view === 'team') {
      fileGrid.innerHTML = '';
      filesEmpty.hidden = true;
      return;
    }

    let list = state.files.slice();
    if (state.view !== 'trash') {
      list = list.filter(function (f) { return !f.deleted; });
    }
    list = filterByView(list);
    if (state.view !== 'trash') {
      list = filterByChip(list);
    }
    list = filterBySearch(list);

    if (list.length === 0) {
      fileGrid.innerHTML = '';
      filesEmpty.hidden = false;
      if (state.view === 'starred') {
        setEmptyState('В избранном пусто', 'Отметьте файлы звёздочкой — они появятся здесь для быстрого доступа.', false);
      } else if (state.view === 'shared') {
        setEmptyState('Общих файлов нет', 'Поделитесь файлом с командой — он появится в этом разделе.', false);
      } else if (state.view === 'trash') {
        setEmptyState('Корзина пуста', 'Удалённые файлы будут храниться здесь 30 дней, затем удалятся навсегда.', false);
      } else if (state.search) {
        setEmptyState('Ничего не найдено', 'Попробуйте изменить запрос или проверьте раскладку клавиатуры.', false);
      } else {
        setEmptyState('Файлов пока нет', 'Загрузите первый файл — он появится здесь и будет защищён .fsecurity.', false);
      }
      return;
    }

    filesEmpty.hidden = true;
    fileGrid.innerHTML = list.map(fileCardHtml).join('');
  }

  function renderNotifications() {
    const unread = state.notifications.filter(function (n) { return n.unread; }).length;
    notifDot.hidden = unread === 0;

    if (state.notifications.length === 0) {
      notifList.innerHTML = '<div class="notif-empty">Уведомлений нет</div>';
      return;
    }

    notifList.innerHTML = state.notifications.map(function (n) {
      const cls = n.unread ? 'notif-item unread' : 'notif-item';
      const icon = n.type === 'success'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'
        : n.type === 'security'
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>';
      return '' +
        '<div class="' + cls + '" data-notif-id="' + n.id + '">' +
          '<span class="notif-item-icon">' + icon + '</span>' +
          '<div class="notif-item-body">' +
            '<div class="notif-item-title">' + escapeHtml(n.title) + '</div>' +
            '<div class="notif-item-text">' + escapeHtml(n.text) + '</div>' +
            '<div class="notif-item-time">' + escapeHtml(n.time) + '</div>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  function goToSlide(index) {
    const total = carouselDots.length;
    state.slide = (index + total) % total;
    carouselTrack.style.transform = 'translateX(-' + (state.slide * 100) + '%)';
    carouselDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === state.slide);
      dot.setAttribute('aria-selected', i === state.slide ? 'true' : 'false');
    });
  }

  function showLevel(key) {
    const data = LEVELS[key];
    if (!data) return;
    levelDetail.innerHTML = '<div><strong>' + data.title + '.</strong> ' + data.text + '</div>';
    $$('.level-card').forEach(function (card) {
      card.classList.toggle('active', card.dataset.level === key);
    });
  }

  function resetGame() {
    state.gameAttempts = 0;
    gameAttempts.textContent = 'Попытка 1 из ' + state.maxAttempts;
    gameResult.className = 'game-result';
    gameResult.innerHTML = '';
    $$('.game-choice').forEach(function (btn) { btn.disabled = false; });
  }

  function playGame(key) {
    if (state.gameAttempts >= state.maxAttempts) return;
    state.gameAttempts += 1;
    gameResult.classList.add('visible');
    gameResult.classList.remove('win');

    if (state.gameAttempts >= state.maxAttempts) {
      gameResult.innerHTML = 'Три попытки — три неудачи. Именно поэтому .fsecurity работает. <strong>Один компонент не даёт доступа к файлам.</strong> Зарегистрируйтесь и храните файлы под защитой.';
      gameResult.classList.add('win');
      gameAttempts.textContent = 'Попытки закончились';
      $$('.game-choice').forEach(function (btn) { btn.disabled = true; });
      return;
    }

    gameResult.innerHTML = GAME[key] + ' Осталось попыток: ' + (state.maxAttempts - state.gameAttempts) + '.';
    gameAttempts.textContent = 'Попытка ' + (state.gameAttempts + 1) + ' из ' + state.maxAttempts;
  }

  function openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add('active');
      const focusTarget = overlay.querySelector('.modal-close');
      if (focusTarget) focusTarget.focus();
    });
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlay) {
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; }, 350);
  }

  function openViewer(id) {
    const file = state.files.find(function (f) { return f.id === id; });
    if (!file) return;
    state.currentViewerFile = file;

    $('#viewerPreview').innerHTML = iconSvg(file.type);
    $('#viewerName').textContent = file.name;
    $('#viewerSub').textContent = file.description || (file.label + '-файл');
    $('#viewerSize').textContent = file.size;
    $('#viewerDate').textContent = file.date;
    $('#viewerType').textContent = file.label;

    viewerStar.innerHTML =
      '<svg viewBox="0 0 24 24" fill="' + (file.starred ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>' +
      (file.starred ? 'В избранном' : 'В избранное');

    openModal('viewerModal');
  }

  function toggleStar(id) {
    const file = state.files.find(function (f) { return f.id === id; });
    if (!file) return;
    file.starred = !file.starred;
    renderFiles();
    renderCounts();
  }

  function moveToTrash(id) {
    const file = state.files.find(function (f) { return f.id === id; });
    if (!file) return;
    file.deleted = true;
    renderFiles();
    renderCounts();
    renderStorage();
  }

  function restoreFromTrash(id) {
    const file = state.files.find(function (f) { return f.id === id; });
    if (!file) return;
    file.deleted = false;
    renderFiles();
    renderCounts();
    renderStorage();
  }

  function purgeFile(id) {
    state.files = state.files.filter(function (f) { return f.id !== id; });
    renderFiles();
    renderCounts();
  }

  function simulateUpload(names) {
    const uploadList = $('#uploadList');
    uploadList.innerHTML = '';
    names.forEach(function (name) {
      const item = document.createElement('div');
      item.className = 'upload-item';
      item.innerHTML =
        '<div class="upload-item-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>' +
        '</div>' +
        '<div class="upload-item-body">' +
          '<div class="upload-item-name">' + escapeHtml(name) + '</div>' +
          '<div class="upload-item-bar"><div class="upload-item-fill"></div></div>' +
        '</div>' +
        '<div class="upload-item-pct">0%</div>';
      uploadList.appendChild(item);

      const fill = item.querySelector('.upload-item-fill');
      const pct = item.querySelector('.upload-item-pct');
      let progress = 0;
      const speed = 2 + Math.random() * 4;
      const interval = setInterval(function () {
        progress += speed;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          pct.textContent = '✓';
          pct.style.color = 'var(--success)';
        } else {
          pct.textContent = Math.floor(progress) + '%';
        }
        fill.style.width = progress + '%';
      }, 80);
    });
    openModal('uploadModal');
  }

  function pickFiles() {
    if (!state.user) {
      openModal('loginModal');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = function () {
      const names = Array.from(input.files).map(function (f) { return f.name; });
      if (names.length) simulateUpload(names);
    };
    input.click();
  }

  function validateTeamForm() {
    let valid = true;

    const company = teamCompany.value.trim();
    if (company.length < 2) {
      teamCompanyError.textContent = 'Введите название компании (минимум 2 символа).';
      teamCompanyError.classList.add('visible');
      teamCompany.classList.add('invalid');
      valid = false;
    } else {
      teamCompanyError.textContent = '';
      teamCompanyError.classList.remove('visible');
      teamCompany.classList.remove('invalid');
    }

    const inn = teamInn.value.trim();
    if (!/^\d{10}$|^\d{12}$/.test(inn)) {
      teamInnError.textContent = 'ИНН должен содержать 10 или 12 цифр.';
      teamInnError.classList.add('visible');
      teamInn.classList.add('invalid');
      valid = false;
    } else {
      teamInnError.textContent = '';
      teamInnError.classList.remove('visible');
      teamInn.classList.remove('invalid');
    }

    if (!teamAgree.checked) {
      teamAgreeError.textContent = 'Необходимо принять условия оферты и политики.';
      teamAgreeError.classList.add('visible');
      valid = false;
    } else {
      teamAgreeError.textContent = '';
      teamAgreeError.classList.remove('visible');
    }

    return valid;
  }

  function showTeamNote(text, type) {
    teamFormNote.textContent = text;
    teamFormNote.className = 'team-form-note visible ' + (type || '');
  }

  function handleTeamSubmit(e) {
    e.preventDefault();
    if (!validateTeamForm()) {
      showTeamNote('Проверьте выделенные поля.', 'error');
      return;
    }
    if (!state.user) {
      showTeamNote('Войдите через Telegram, чтобы создать команду.', 'error');
      openModal('loginModal');
      return;
    }

    const company = teamCompany.value.trim();
    const inn = teamInn.value.trim();
    showTeamNote('Создаём корпоративное хранилище…', '');

    window.FlautAPI.createTeam({ company: company, inn: inn }).then(function (res) {
      if (res && res.ok) {
        showTeamNote('Команда создана.', 'success');
        renderTeamPanel({ company: company, inn: inn, limit: 4 * 1024 ** 3 });
        $('#successText').textContent = 'Корпоративное хранилище для «' + company + '» активировано. 4 ГБ доступно команде.';
        openModal('successModal');
      } else {
        showTeamNote((res && res.error) || 'Не удалось создать команду.', 'error');
      }
    }).catch(function () {
      showTeamNote('Сервис временно недоступен.', 'error');
    });
  }

  function renderTeamPanel(team) {
    teamCreateView.hidden = true;
    teamPanel.hidden = false;
    teamNavBadge.textContent = '4 ГБ';

    const members = [
      { name: state.user.first_name || 'Вы', username: state.user.username || '', role: 'Владелец', self: true }
    ];

    teamPanel.innerHTML =
      '<div class="team-panel-head">' +
        '<div>' +
          '<div class="team-panel-company">' + escapeHtml(team.company) + '</div>' +
          '<div class="team-panel-inn">ИНН: ' + escapeHtml(team.inn) + '</div>' +
        '</div>' +
        '<div class="team-panel-stats">' +
          '<div class="team-stat"><span class="team-stat-value">4 ГБ</span><span class="team-stat-label">Объём</span></div>' +
          '<div class="team-stat"><span class="team-stat-value">' + members.length + '</span><span class="team-stat-label">Участников</span></div>' +
          '<div class="team-stat"><span class="team-stat-value">0</span><span class="team-stat-label">Файлов</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="team-panel-actions">' +
        '<button class="btn btn-primary" type="button" id="teamUploadBtn">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Загрузить в команду' +
        '</button>' +
        '<button class="btn btn-ghost" type="button" id="teamAddMemberBtn">Добавить участника</button>' +
      '</div>' +
      '<div class="team-members-title">Участники</div>' +
      '<div class="team-members" id="teamMembers"></div>';

    renderTeamMembers(members);

    $('#teamUploadBtn').addEventListener('click', pickFiles);
    $('#teamAddMemberBtn').addEventListener('click', function () {
      const username = prompt('Введите @username участника:');
      if (username && username.trim()) {
        members.push({
          name: username.replace('@', ''),
          username: username.replace('@', ''),
          role: 'Участник',
          self: false
        });
        renderTeamMembers(members);
        $('#successText').textContent = 'Участник добавлен в команду.';
        openModal('successModal');
      }
    });
  }

  function renderTeamMembers(members) {
    const container = $('#teamMembers');
    if (!container) return;
    container.innerHTML = members.map(function (m) {
      const initial = (m.name || 'П').charAt(0).toUpperCase();
      return '' +
        '<div class="team-member" data-username="' + escapeHtml(m.username) + '">' +
          '<div class="team-member-avatar">' + initial + '</div>' +
          '<div class="team-member-info">' +
            '<div class="team-member-name">' + escapeHtml(m.name) + (m.username ? ' · @' + escapeHtml(m.username) : '') + '</div>' +
            '<div class="team-member-role">' + m.role + '</div>' +
          '</div>' +
          (m.self ? '' : '<button class="team-member-remove" type="button" data-remove="' + escapeHtml(m.username) + '">Удалить</button>') +
        '</div>';
    }).join('');
  }

  function setUser(user) {
    state.user = user;
    if (user) {
      userName.textContent = user.first_name || 'Пользователь';
      userTag.textContent = user.username ? '@' + user.username : 'Telegram';
      userAvatar.textContent = (user.first_name || 'П').charAt(0).toUpperCase();
      userStatus.classList.add('online');
      loginBtn.hidden = true;
    } else {
      userName.textContent = 'Гость';
      userTag.textContent = 'Войдите, чтобы хранить файлы';
      userAvatar.textContent = 'Г';
      userStatus.classList.remove('online');
      loginBtn.hidden = false;
    }
    renderStorage();
    renderFiles();
  }

  function initTelegramWidget() {
    if (!telegramContainer) return;
    telegramContainer.innerHTML = '';

    const onAuth = function (user) {
      if (!user) return;
      window.FlautAPI.authenticate(user).then(function (res) {
        if (res && res.ok) {
          setUser(user);
          closeModal($('#loginModal'));
        }
      }).catch(function () {});
    };

    if (window.Telegram && window.Telegram.Login) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      btn.style.width = '100%';
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3L3 10.5l5 2L10 19l3.5-4.5L19 19l2-16z"/></svg>Войти через Telegram';
      btn.addEventListener('click', function () {
        if (!loginAgree.checked) {
          loginAgreeError.textContent = 'Подтвердите согласие с документами.';
          loginAgreeError.classList.add('visible');
          return;
        }
        loginAgreeError.classList.remove('visible');
        if (window.Telegram.Login.open) {
          window.Telegram.Login.open(onAuth);
        } else if (window.Telegram.Login.auth) {
          window.Telegram.Login.auth({ client_id: CLIENT_ID, request_access: 'write' }, onAuth);
        }
      });
      telegramContainer.appendChild(btn);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary';
      btn.style.width = '100%';
      btn.disabled = true;
      btn.textContent = 'Вход через Telegram';
      telegramContainer.appendChild(btn);

      window.addEventListener('load', function () {
        setTimeout(initTelegramWidget, 300);
      }, { once: true });
    }
  }

  function bindModals() {
    $$('.modal-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal(overlay);
      });
      $$('[data-close]', overlay).forEach(function (btn) {
        btn.addEventListener('click', function () { closeModal(overlay); });
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        $$('.modal-overlay.active').forEach(closeModal);
        if (!notifPanel.hidden) notifPanel.hidden = true;
      }
    });
  }

  function bindCarousel() {
    carouselPrev.addEventListener('click', function () { goToSlide(state.slide - 1); });
    carouselNext.addEventListener('click', function () { goToSlide(state.slide + 1); });
    carouselDots.forEach(function (dot) {
      dot.addEventListener('click', function () { goToSlide(parseInt(dot.dataset.goto, 10)); });
    });

    document.addEventListener('keydown', function (e) {
      if ($('#securityModal').classList.contains('active')) {
        if (e.key === 'ArrowLeft') goToSlide(state.slide - 1);
        if (e.key === 'ArrowRight') goToSlide(state.slide + 1);
      }
    });

    let startX = 0;
    carouselTrack.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    carouselTrack.addEventListener('touchend', function (e) {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goToSlide(state.slide + (diff > 0 ? 1 : -1));
    }, { passive: true });
  }

  function bindSecurity() {
    $$('.level-card').forEach(function (card) {
      card.addEventListener('click', function () { showLevel(card.dataset.level); });
    });

    $$('.game-choice').forEach(function (btn) {
      btn.addEventListener('click', function () { playGame(btn.dataset.target); });
    });

    securityBtn.addEventListener('click', function () {
      resetGame();
      goToSlide(0);
      openModal('securityModal');
    });
  }

  function bindTeamForm() {
    teamForm.addEventListener('submit', handleTeamSubmit);
    [teamCompany, teamInn, teamAgree].forEach(function (el) {
      el.addEventListener('input', function () {
        if (el.classList.contains('invalid')) el.classList.remove('invalid');
      });
    });
  }

  function bindLogin() {
    loginAgree.addEventListener('change', function () {
      if (loginAgree.checked) loginAgreeError.classList.remove('visible');
    });

    loginBtn.addEventListener('click', function () { openModal('loginModal'); });
    emptyLoginBtn.addEventListener('click', function () { openModal('loginModal'); });

    userBtn.addEventListener('click', function () {
      if (!state.user) {
        openModal('loginModal');
        return;
      }
      const action = confirm('Выйти из аккаунта?');
      if (action) {
        window.FlautAPI.logout().then(function () {
          setUser(null);
        });
      }
    });

    initTelegramWidget();
  }

  function bindNotifications() {
    notifBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = !notifPanel.hidden;
      notifPanel.hidden = isOpen;
      notifBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    notifList.addEventListener('click', function (e) {
      const item = e.target.closest('.notif-item');
      if (!item) return;
      const n = state.notifications.find(function (x) { return x.id === item.dataset.notifId; });
      if (n) {
        n.unread = false;
        renderNotifications();
      }
    });

    notifClear.addEventListener('click', function (e) {
      e.stopPropagation();
      state.notifications.forEach(function (n) { n.unread = false; });
      renderNotifications();
    });

    document.addEventListener('click', function (e) {
      if (!notifPanel.hidden && !e.target.closest('.notif-wrap')) {
        notifPanel.hidden = true;
        notifBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function bindNav() {
    menuBtn.addEventListener('click', function () { sidebar.classList.toggle('open'); });

    $$('.nav-item[data-view]').forEach(function (item) {
      item.addEventListener('click', function () {
        $$('.nav-item').forEach(function (i) { i.classList.remove('active'); });
        item.classList.add('active');
        state.view = item.dataset.view;

        if (state.view === 'team') {
          fileGrid.hidden = true;
          filesEmpty.hidden = true;
          return;
        }

        if (state.view === 'trash') {
          state.filter = 'all';
          $$('.chip').forEach(function (c) {
            c.classList.toggle('active', c.dataset.filter === 'all');
            c.setAttribute('aria-pressed', c.dataset.filter === 'all' ? 'true' : 'false');
          });
        }

        renderFiles();
      });
    });

    $$('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.chip').forEach(function (c) {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        state.filter = chip.dataset.filter;
        renderFiles();
      });
    });

    searchInput.addEventListener('input', function () {
      state.search = searchInput.value.trim();
      renderFiles();
    });

    uploadBtn.addEventListener('click', pickFiles);
    heroUpload.addEventListener('click', pickFiles);

    heroPricing.addEventListener('click', function () {
      document.getElementById('pricing').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    fileGrid.addEventListener('click', function (e) {
      const action = e.target.closest('[data-action]');
      if (action) {
        e.stopPropagation();
        const id = action.dataset.id;
        const act = action.dataset.action;
        if (act === 'star') toggleStar(id);
        if (act === 'download') {
          $('#successText').textContent = 'Файл отправлен на скачивание.';
          openModal('successModal');
        }
        if (act === 'delete') {
          if (confirm('Переместить файл в корзину?')) moveToTrash(id);
        }
        if (act === 'restore') restoreFromTrash(id);
        if (act === 'purge') {
          if (confirm('Удалить файл навсегда?')) purgeFile(id);
        }
        return;
      }
      const card = e.target.closest('.file-card');
      if (card) openViewer(card.dataset.id);
    });

    fileGrid.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.file-card');
      if (!card) return;
      if (e.target.closest('button')) return;
      e.preventDefault();
      openViewer(card.dataset.id);
    });

    viewerStar.addEventListener('click', function () {
      if (!state.currentViewerFile) return;
      toggleStar(state.currentViewerFile.id);
      const file = state.files.find(function (f) { return f.id === state.currentViewerFile.id; });
      if (file) {
        viewerStar.innerHTML =
          '<svg viewBox="0 0 24 24" fill="' + (file.starred ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>' +
          (file.starred ? 'В избранном' : 'В избранное');
      }
    });

    viewerDownload.addEventListener('click', function () {
      closeModal($('#viewerModal'));
      $('#successText').textContent = 'Файл отправлен на скачивание. Проверьте загрузки.';
      openModal('successModal');
    });
  }

  function bindReveal() {
    const revealEls = $$('.reveal');
    if (!revealEls.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
            const idx = siblings.indexOf(entry.target);
            const delay = Math.min(Math.max(idx, 0) * 100, 400);
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, delay);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  function init() {
    renderStorage();
    renderCounts();
    renderFiles();
    renderNotifications();
    goToSlide(0);
    resetGame();
    bindModals();
    bindCarousel();
    bindSecurity();
    bindTeamForm();
    bindLogin();
    bindNotifications();
    bindNav();
    bindReveal();
    setUser(null);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();