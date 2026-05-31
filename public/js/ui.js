let renderedEventCount = 0;
let renderedChatCount = 0;
let lastFactionHash = '';

function hashFactions(state) {
  const f = state.factions || [];
  return f.map(f => `${f.id}:${f.totalPower || 0}:${f.regionCount || 0}`).join('|');
}

function updateUI(state) {
  document.getElementById('turnCounter').textContent = `Turn: ${state.turn || 0}`;
  document.getElementById('factionCount').textContent = `Factions: ${state.factions?.length || 0} / ${(state.factions?.length || 0) + (state.destroyed?.length || 0)}`;

  const newHash = hashFactions(state);
  if (newHash !== lastFactionHash) {
    lastFactionHash = newHash;
    updateFactionList(state);
    updateLegend(state);
  }

  appendEvents(state);
  appendChats(state);
  updateNotificationBadge(state);

  if (selectedFaction) {
    selectFactionById(selectedFaction, state);
  }
}

function updateFactionList(state) {
  const list = document.getElementById('factionList');
  const filterVal = document.getElementById('doctrineFilter')?.value || 'all';
  let sorted = [...(state.factions || [])].sort((a, b) => (b.totalPower || 0) - (a.totalPower || 0));
  const destroyed = state.destroyed || [];

  if (filterVal !== 'all') {
    sorted = sorted.filter(f => f.doctrine?.id === filterVal);
  }

  let html = '';
  for (const f of sorted) {
    const isSelected = selectedFaction === f.id;
    const doctrineIcon = f.doctrine?.icon || '❓';
    html += `
      <div class="faction-item ${isSelected ? 'selected' : ''}" data-id="${f.id}" onclick="selectFactionById('${f.id}', lastState)">
        <span class="flag">${f.flag}</span>
        <span class="name">${f.name}</span>
        <span class="doctrine-badge doctrine-${f.doctrine?.id || 'european'}">${doctrineIcon}</span>
        <span class="power">⚡${(f.totalPower || 0).toLocaleString()}</span>
      </div>
    `;
  }

  if (destroyed.length > 0) {
    html += `<div style="font-size:10px;color:#666;padding:6px;border-top:1px solid #1a1a2e;margin-top:4px;">💀 DESTROYED:</div>`;
    for (const f of destroyed) {
      html += `
        <div class="faction-item dead">
          <span class="flag">${f.flag}</span>
          <span class="name">${f.name}</span>
          <span class="power">💀</span>
        </div>
      `;
    }
  }

  list.innerHTML = html;
}

function appendEvents(state) {
  const log = document.getElementById('eventLog');
  const events = state.events || [];

  if (events.length > renderedEventCount) {
    const newEvents = events.slice(renderedEventCount);
    for (const event of newEvents) {
      const type = event.type || 'info';
      const message = event.message || '';
      log.insertAdjacentHTML('beforeend', `<div class="event-entry ${type}">${message}</div>`);
    }
    renderedEventCount = events.length;
  }

  log.scrollTop = log.scrollHeight;
}

function appendChats(state) {
  const log = document.getElementById('chatLog');
  const msgs = state.recentChat || [];

  if (msgs.length > renderedChatCount) {
    const newMsgs = msgs.slice(renderedChatCount);
    for (const msg of newMsgs) {
      const senderName = lastState?.factions?.find(f => f.id === msg.sender)?.flag || msg.sender;
      const receiverName = lastState?.factions?.find(f => f.id === msg.receiver)?.flag || msg.receiver;
      log.insertAdjacentHTML('beforeend', `
        <div class="chat-entry chat-type-${msg.type || 'chat'}">
          <span class="chat-sender">${senderName}</span>
          <span style="color:#666;">→</span>
          <span>${receiverName}</span>
          <div style="color:#aaa;font-size:9px;padding-left:2px;">${escapeHtml(msg.text || '')}</div>
        </div>
      `);
    }
    renderedChatCount = msgs.length;
  }

  log.scrollTop = log.scrollHeight;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function updateLegend(state) {
  const list = document.getElementById('legendList');
  const sorted = [...(state.factions || [])].sort((a, b) => (b.totalPower || 0) - (a.totalPower || 0));
  let html = '';
  for (const f of sorted) {
    const doctrineIcon = f.doctrine?.icon || '❓';
    html += `<div class="legend-item"><span class="legend-flag">${f.flag}</span>${f.name} <span class="doctrine-badge doctrine-${f.doctrine?.id}">${doctrineIcon}</span></div>`;
  }
  list.innerHTML = html;
}

function updateNotificationBadge(state) {
  const totalAlive = state.factions?.length || 0;
  const totalNotifs = state.globalNotifications?.length || 0;
  const badge = document.getElementById('notifBadge');
  if (badge) {
    badge.textContent = Math.min(99, totalNotifs);
    badge.style.display = totalNotifs > 0 ? 'block' : 'none';
  }
}

function getEmotionIcon(emotion) {
  const icons = {
    hatred: '💢', anger: '😤', love: '❤️', joy: '😊',
    sadness: '😢', fear: '😨', disgust: '🤮', pride: '😏',
    shame: '😳', neutral: '😐', greed: '🤑',
  };
  return icons[emotion] || '😐';
}

let notificationTimeout = null;

function showNotification(message, type) {
  const el = document.getElementById('notification');
  el.textContent = message;
  el.className = `show ${type}`;
  clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => {
    el.classList.add('hidden');
  }, 4000);
}

function toggleNotificationPanel() {
  const panel = document.getElementById('notificationPanel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    renderNotificationPanel();
  }
}

function renderNotificationPanel() {
  const list = document.getElementById('notificationList');
  const notifs = lastState?.globalNotifications || [];
  let html = '';
  for (const n of notifs) {
    html += `<div class="event-entry ${n.type || 'info'}" style="margin:2px 0;">${n.message}</div>`;
  }
  if (!html) html = '<div class="info-placeholder">No notifications yet</div>';
  list.innerHTML = html;
}

function filterByDoctrine(val) {
  if (lastState) {
    lastFactionHash = '';
    updateUI(lastState);
  }
}

function updateDoctrineFilter() {
  const select = document.getElementById('doctrineFilter');
  if (!select) return;
  select.value = 'all';
}
