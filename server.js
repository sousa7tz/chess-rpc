const RPC = require('discord-rpc');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1547222429691019314';
const PORT = process.env.PORT || 3020;
const rpc = new RPC.Client({ transport: 'ipc' });

let isRpcReady = false;
let gameOverResetTimer = null;

// Função auxiliar para resetar pro estado Idle
function setIdleActivity() {
  if (!isRpcReady) return;
  rpc.setActivity({
    details: 'Idle on Chess.com',
    state: 'Waiting for a match...',
    largeImageKey: 'logo',
    largeImageText: 'Chess.com',
    instance: false,
  }).catch(() => {});
}

// 1. Ao iniciar: NÃO seta atividade antes de a extensão conectar
rpc.on('ready', () => {
  console.log('✅ Connected to Discord successfully!');
  isRpcReady = true;
});

rpc.login({ clientId: CLIENT_ID }).catch(console.error);

// 2. Servidor WebSocket
const wss = new WebSocketServer({ port: Number(PORT) });
console.log(`🚀 Server waiting for data on port ${PORT}...`);

wss.on('connection', (ws) => {
  console.log('🔌 Extension connected!');
  // Seta Idle assim que a aba do Chess.com abre
  setIdleActivity();

  ws.on('message', (data) => {
    try {
      const game = JSON.parse(data);

      if (!isRpcReady) return;

      // Se a partida acabou
      if (game.isGameOver) {
        rpc.setActivity({
          details: `Finished: ${game.opponent}`,
          state: game.gameResult || 'Game Over',
          largeImageKey: 'logo',
          largeImageText: 'Chess.com',
          smallImageKey: game.opponentAvatar && game.opponentAvatar.startsWith('http') ? game.opponentAvatar : undefined,
          smallImageText: `Opponent: ${game.opponent}`,
          instance: false,
        });

        // Cancela timer anterior se houver
        if (gameOverResetTimer) clearTimeout(gameOverResetTimer);

        // Após 15 segundos exibindo a tela de vitória/derrota, volta pro Idle
        gameOverResetTimer = setTimeout(() => {
          console.log('⏳ Match screen timeout: returning to Idle...');
          setIdleActivity();
        }, 15000);

        return;
      }

      // Se entrou em partida ativa, cancela qualquer reset pendente
      if (gameOverResetTimer) {
        clearTimeout(gameOverResetTimer);
        gameOverResetTimer = null;
      }

      // Monta textos da partida ativa
      let detailsText = '';
      if (game.mode === 'vs Computer') {
        detailsText = `Playing vs Bot (${game.opponent})`;
      } else {
        detailsText = `${game.mode} vs ${game.opponent}`;
      }

      const stateText = game.turn 
        ? `${game.turn} • Playing as ${game.color}`
        : `Playing as ${game.color}`;

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

  // Limpa completamente o Discord ao fechar a aba
  ws.on('close', () => {
    console.log('🔌 Extension disconnected. Clearing Discord RPC...');
    if (gameOverResetTimer) clearTimeout(gameOverResetTimer);
    if (isRpcReady) {
      rpc.clearActivity().catch(() => {});
    }
  });
});