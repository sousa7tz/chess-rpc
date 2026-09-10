let socket = null;
let lastPayloadString = '';

function detectTimeMode(timeString) {
  if (!timeString) return 'Live Match';
  const parts = timeString.split(':');
  if (parts.length < 2) return 'Live Match';

  const minutes = parseInt(parts[0], 10);
  if (minutes < 3) return 'Bullet';
  if (minutes < 10) return 'Blitz';
  return 'Rapid';
}

function scrapeGameData() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  const board = document.querySelector('wc-chess-board');
  if (!board) return;

  const gameOverModal = document.querySelector('.game-over-modal-shell-container');
  let isGameOver = false;
  let gameResult = '';

  if (gameOverModal) {
    isGameOver = true;
    const titleEl = gameOverModal.querySelector('.game-over-modal-title-component');
    const subtitleEl = gameOverModal.querySelector('.game-over-modal-subtitle-component');

    const title = titleEl ? titleEl.innerText.trim() : '';
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
  let isMyTurn = false;

  if (myClock) {
    const timeEl = myClock.querySelector('.clock-time-monospace');
    if (timeEl) myTime = timeEl.innerText.trim();
    isMyTurn = myClock.classList.contains('clock-player-turn');
  }

  const isBot = window.location.pathname.includes('/computer');
  const mode = isBot ? 'vs Computer' : detectTimeMode(myTime);

  const payload = {
    isGameOver,
    gameResult,
    isBot,
    mode,
    opponent: opponentRating ? `${opponentName} ${opponentRating}` : opponentName,
    color: myColor,
    myTime,
    isMyTurn,
    opponentAvatar,
    gameUrl: window.location.href,
  };

  const currentPayloadString = JSON.stringify(payload);
  if (currentPayloadString !== lastPayloadString) {
    lastPayloadString = currentPayloadString;
    socket.send(currentPayloadString);
  }
}

function connect() {
  socket = new WebSocket('ws://localhost:3020');

  socket.onopen = () => {
    lastPayloadString = '';
  };

  socket.onclose = () => {
    setTimeout(connect, 3000);
  };

  socket.onerror = () => {
    socket.close();
  };
}

connect();
setInterval(scrapeGameData, 1000);