const socket = io();
let lastState = null;
let gameRunning = true;

initMap();

socket.on('connect', () => {
  console.log('Connected to server - monitoring live AI war');
});

socket.on('game_state', (state) => {
  lastState = state;
  updateMap(state);
  updateUI(state);
  document.getElementById('statusBadge').textContent = `▶ T${state.turn}`;
});

socket.on('game_started', (data) => {
  gameRunning = true;
  showNotification('🌍 WW3 BEGINS! The AI war for Europe starts now!', 'alliance');
});

setInterval(() => {
  if (lastState) {
    socket.emit('request_state');
  }
}, 5000);

document.addEventListener('keydown', (e) => {
  if (e.key === 'n' || e.key === 'N') {
    toggleNotificationPanel();
  }
});

console.log('🌍 Europa AI Wars WW3 read-only monitor loaded');
