const fs = require('fs');
const path = require('path');
const RPC = require('discord-rpc');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1547222429691019314';
const PORT = process.env.PORT || 3020;

// Load config and dictionaries in /locales path
function loadI18n() {
  let lang = 'en';
  try {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (cfg.language) lang = cfg.language;
    }
  } catch (err) {
    console.warn('⚠️ Could not parse config.json, defaulting to English.');
  }

  const localePath = path.join(__dirname, 'locales', `${lang}.json`);
  const fallbackPath = path.join(__dirname, 'locales', 'en.json');

  try {
    if (fs.existsSync(localePath)) {
      return JSON.parse(fs.readFileSync(localePath, 'utf-8'));
    }
    return JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
  } catch (err) {
    console.error('❌ Failed to load locale file:', err.message);
    return {
      idleTitle: 'Idle on Chess.com',
      idleState: 'Waiting for a match...',
      playingVsBot: 'Playing vs Bot',
      playingAs: 'Playing as',
      yourTurn: 'Your turn to move',
      opponentTurn: "Opponent's turn",
      finished: 'Finished',
      watchGame: 'Watch Game',
      liveMatch: 'Live Match',
      gameOver: 'Game Over',
      white: 'White',
      black: 'Black',
    };
  }
}

const i18n = loadI18n();

const rpc = new RPC.Client({ transport: 'ipc' });
let isRpcReady = false;
let gameOverResetTimer = null;
let matchStartTime = null;

function setIdleActivity() {
  if (!isRpcReady) return;
  matchStartTime = null; 
  rpc.setActivity({
    details: i18n.idleTitle,
    state: i18n.idleState,
    largeImageKey: 'logo',
    largeImageText: 'Chess.com',
    instance: false,
  }).catch(() => {});
}

rpc.on('ready', () => {
  console.log('✅ Connected to Discord RPC successfully.');
  isRpcReady = true;
});

rpc.login({ clientId: CLIENT_ID }).catch(console.error);

const wss = new WebSocketServer({ port: Number(PORT) });
console.log(`🚀 Daemon listening on port ${PORT}...`);

wss.on('connection', (ws) => {
  console.log('🔌 Extension connected.');
  setIdleActivity();

  ws.on('message', (data) => {
    try {
      const game = JSON.parse(data);
      if (!isRpcReady) return;

      if (game.isGameOver) {
        matchStartTime = null;

        rpc.setActivity({
          details: `${i18n.finished}: ${game.opponent}`,
          state: game.gameResult || i18n.gameOver,
          largeImageKey: 'logo',
          largeImageText: 'Chess.com',
          smallImageKey: game.opponentAvatar && game.opponentAvatar.startsWith('http') ? game.opponentAvatar : undefined,
          smallImageText: `Opponent: ${game.opponent}`,
          instance: false,
        });

        if (gameOverResetTimer) clearTimeout(gameOverResetTimer);
        gameOverResetTimer = setTimeout(() => {
          console.log('⏳ Match ended: resetting activity to idle...');
          setIdleActivity();
        }, 15000);

        return;
      }

      if (gameOverResetTimer) {
        clearTimeout(gameOverResetTimer);
        gameOverResetTimer = null;
      }

      // game timestamp init
      if (!matchStartTime) {
        matchStartTime = Date.now();
      }

      let detailsText = '';
      if (game.isBot) {
        detailsText = `${i18n.playingVsBot} (${game.opponent})`;
      } else {
        detailsText = `${game.mode} vs ${game.opponent}`;
      }

      const localizedColor = game.color === 'Black' 
        ? (i18n.black || 'Black') 
        : (i18n.white || 'White');

      const clockText = game.myTime ? ` [${game.myTime}]` : '';
      const turnText = game.isMyTurn ? i18n.yourTurn : i18n.opponentTurn;
      const stateText = `${turnText}${clockText} • ${i18n.playingAs} ${localizedColor}`;

      const activity = {
        details: detailsText,
        state: stateText,
        startTimestamp: matchStartTime, // Cronômetro nativo do Discord: "02:14 decorrido"
        largeImageKey: 'logo',
        largeImageText: 'Chess.com',
        instance: false,
      };

      if (game.opponentAvatar && game.opponentAvatar.startsWith('http')) {
        activity.smallImageKey = game.opponentAvatar;
        activity.smallImageText = `Opponent: ${game.opponent}`;
      }

      if (game.gameUrl && game.gameUrl.includes('/game/live/')) {
        activity.buttons = [
          { label: i18n.watchGame, url: game.gameUrl }
        ];
      }

      rpc.setActivity(activity);
    } catch (err) {
      console.error('❌ Error processing message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Extension disconnected. Clearing presence.');
    matchStartTime = null;
    if (gameOverResetTimer) clearTimeout(gameOverResetTimer);
    if (isRpcReady) {
      rpc.clearActivity().catch(() => {});
    }
  });
});