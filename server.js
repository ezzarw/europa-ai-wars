const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cfg = require('./game/config');
const { GameEngine } = require('./game/engine');
const { GameController } = require('./game/game-controller');
const { AIAgentManager } = require('./game/ai-agent-manager');
const { handleMcpRequest, getAllTools } = require('./game/mcp-server');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: cfg.CORS_ORIGIN, methods: ['GET', 'POST'] },
  maxHttpBufferSize: 5e6,
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use(express.json());

const game = new GameEngine();
const gameController = new GameController(game);
const aiManager = new AIAgentManager(gameController);

const MCP_SERVER_NAME = 'europa-ai-wars';

app.post('/mcp', (req, res) => {
  const request = req.body;
  if (!request || !request.method) {
    return res.status(400).json({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid Request' } });
  }
  const result = handleMcpRequest(request, gameController);
  res.json(result);
});

app.get('/mcp', (req, res) => {
  res.json({
    serverInfo: { name: MCP_SERVER_NAME, version: '1.0.0' },
    tools: getAllTools().map(t => ({ name: t.name, description: t.description })),
  });
});

function autoStartGame() {
  game.start();
  gameController.cleanup();
  console.log(`  ⏸ Waiting for AI agents to join via MCP`);
  console.log(`  ⚡ Game running — Web UI is READ-ONLY monitoring\n`);
}

io.on('connection', (socket) => {
  console.log(`Monitor connected: ${socket.id}`);
  socket.emit('game_state', game.getFullState());
  socket.emit('mcp_info', { endpoint: '/mcp', server: MCP_SERVER_NAME, readOnly: true });
  socket.emit('game_started', { message: 'Game running — read-only monitoring' });

  socket.on('request_state', () => {
    socket.emit('game_state', game.getFullState());
  });

  socket.on('request_notifications', (factionId) => {
    if (factionId) {
      const notifs = game.getNotificationsForFaction(factionId);
      socket.emit('faction_notifications', { factionId, notifications: notifs });
    }
  });

  socket.on('mark_notification_read', (data) => {
    const { factionId, notifId } = data;
    if (factionId && notifId) {
      game.markNotificationRead(factionId, notifId);
    }
  });

  socket.on('request_chat', (factionId) => {
    if (factionId) {
      const msgs = game.getChatForFaction(factionId);
      socket.emit('faction_chat', { factionId, messages: msgs });
    }
  });

  socket.on('request_all_chat', () => {
    const allChat = game.chat.messages.slice(-50);
    socket.emit('all_chat', allChat);
  });

  socket.on('request_agents', () => {
    socket.emit('agents_list', { agents: gameController.getConnectedAgents() });
  });

  socket.on('disconnect', () => {
    console.log(`Monitor disconnected: ${socket.id}`);
  });
});

const gameLoop = () => {
  if (game.running) {
    game.tick();
    gameController.processPendingActions();
    gameController.processSuperEvents();
    gameController.processNuclearProgress();
    gameController.processEconomyBonuses();
    gameController.cleanup();
    io.emit('game_state', game.getFullState());
  }
  setTimeout(gameLoop, game.speed);
};

gameLoop();

server.listen(cfg.PORT, cfg.HOST, () => {
  console.log(`\n  🌍 EUROPA AI WARS server running!`);
  console.log(`  📍 http://localhost:${cfg.PORT}`);
  console.log(`  🤖 MCP endpoint: http://localhost:${cfg.PORT}/mcp`);
  console.log(`  🔧 Auto-starting game...`);
  autoStartGame();
});
