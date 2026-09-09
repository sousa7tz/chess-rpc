const RPC = require('discord-rpc');
const { WebSocketServer } = require('ws');
require('dotenv').config();

// 1. Configura a conexão com seu Discord
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1547222429691019314';
const PORT = process.env.PORT || 3020;
const rpc = new RPC.Client({ transport: 'ipc' });

let isRpcReady = false;

rpc.on('ready', () => {
  console.log('Connected to Discord successfully!');
  isRpcReady = true;

  rpc.setActivity({
    details: 'Idle on Chess.com',
    state: 'Waiting for a match...',
    largeImageKey: 'logo',
    largeImageText: 'Chess.com',
    instance: false,
  });
});

rpc.login({ clientId: CLIENT_ID }).catch(console.error);

// 2. Servidor WebSocket
const wss = new WebSocketServer({ port: Number(PORT) });

console.log(`Server waiting for data on port ${PORT}...`);

wss.on('connection', (ws) => {
  console.log('Extension connected!');

  ws.on('message', (data) => {
    try {
      const game = JSON.parse(data);
      console.log('♟️ Game received:', game);

      if (!isRpcReady) return;

      let detailsText = '';
      let stateText = '';

      // Se a partida acabou, mostra o resultado no status!
      if (game.isGameOver) {
        detailsText = `Finished: ${game.opponent}`;
        stateText = game.gameResult || 'Game Over';
      } else {
        if (game.mode === 'vs Computer') {
          detailsText = `Playing vs Bot (${game.opponent})`;
        } else {
          detailsText = `${game.mode} vs ${game.opponent}`;
        }
        stateText = game.turn 
          ? `${game.turn} • Playing as ${game.color}`
          : `Playing as ${game.color}`;
      }

      const activity = {
        details: detailsText,
        state: stateText,
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
          { label: 'Watch Game', url: game.gameUrl }
        ];
      }

      rpc.setActivity(activity);
    } catch (err) {
      console.error('❌ Failed to parse data:', err.message);
    }
  });
});