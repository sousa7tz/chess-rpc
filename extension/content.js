let socket = null;
let reconnectTimer = null;
let lastPayloadString = '';

function connectWebSocket() {
  socket = new WebSocket('ws://localhost:3020');

  socket.onopen = () => {
    console.log('[Chess-RPC] ✅ Conectado ao servidor local!');
  };

  socket.onclose = () => {
    scheduleReconnect();
  };

  socket.onerror = () => {
    socket.close();
  };
}

function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connectWebSocket, 5000);
}

connectWebSocket();

function detectTimeMode(initialTimeStr) {
  if (!initialTimeStr) return 'Live Match';
  if (initialTimeStr.startsWith('10:')) return 'Rapid (10 min)';
  if (initialTimeStr.startsWith('15:')) return 'Rapid (15 min)';
  if (initialTimeStr.startsWith('3:')) return 'Blitz (3 min)';
  if (initialTimeStr.startsWith('5:')) return 'Blitz (5 min)';
  if (initialTimeStr.startsWith('1:')) return 'Bullet (1 min)';
  if (initialTimeStr.startsWith('0:')) return 'Bullet (1 min)';
  return `Live (${initialTimeStr})`;
}

function scrapeGameData() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  const board = document.querySelector('wc-chess-board');
  
  // Se não há tabuleiro na tela (ex: navegando pelo menu/home), não manda jogo ativo
  if (!board) return;

  const gameOverModal = document.querySelector('.game-over-modal-shell-container');
  let isGameOver = false;
  let gameResult = '';

  if (gameOverModal) {
    isGameOver = true;
    const titleEl = gameOverModal.querySelector('.game-over-modal-title-component');
    const subtitleEl = gameOverModal.querySelector('.game-over-modal-subtitle-component');

    const title = titleEl ? titleEl.innerText.trim() : 'Game Over';
    const subtitle = subtitleEl ? subtitleEl.innerText.trim() : '';
    gameResult = subtitle ? `${title} (${subtitle})` : title;
  }

  const topPlayer = 
    document.querySelector('.board-layout-top') || 
    document.querySelector('#board-layout-player-top');

  let opponentName = 'Opponent';
  let opponentRating = '';
  let opponentAvatar = '';

  if (topPlayer) {
    const nameEl = topPlayer.querySelector('[data-test-element="user-tagline-username"]');
    const ratingEl = topPlayer.querySelector('[class*="cc-user-rating"]');
    const avatarEl = topPlayer.querySelector('.cc-avatar-img');

    if (nameEl) opponentName = nameEl.innerText.trim();
    if (ratingEl) opponentRating = ratingEl.innerText.trim();
    if (avatarEl && avatarEl.src) opponentAvatar = avatarEl.src;
  }

  const isBlack = board.classList.contains('flipped');
  const myColor = isBlack ? 'Black' : 'White';

  const myClock = document.querySelector('.clock-bottom');
  let myTime = '';
  let turnText = '';

  if (myClock) {
    const timeEl = myClock.querySelector('.clock-time-monospace');
    if (timeEl) myTime = timeEl.innerText.trim();
    const isMyTurn = myClock.classList.contains('clock-player-turn');
    turnText = isMyTurn ? 'Your turn to move' : "Opponent's turn";
  }

  let gameMode = 'Live Match';
  if (window.location.pathname.includes('/computer')) {
    gameMode = 'vs Computer';
  } else {
    gameMode = detectTimeMode(myTime);
  }

  const payload = {
    isGameOver: isGameOver,
    gameResult: gameResult,
    mode: gameMode,
    opponent: opponentRating ? `${opponentName} ${opponentRating}` : opponentName,
    color: myColor,
    turn: turnText,
    opponentAvatar: opponentAvatar,
    gameUrl: window.location.href
  };

  const currentPayloadString = JSON.stringify(payload);
  if (currentPayloadString !== lastPayloadString) {
    lastPayloadString = currentPayloadString;
    socket.send(currentPayloadString);
  }
}

setInterval(scrapeGameData, 1500);