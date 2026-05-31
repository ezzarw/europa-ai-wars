class NotificationSystem {
  constructor() {
    this.notifications = {};
    this.allNotifications = [];
  }

  addNotification(factionId, type, message, data = {}) {
    if (!this.notifications[factionId]) {
      this.notifications[factionId] = [];
    }
    const notif = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      message,
      data,
      timestamp: Date.now(),
      read: false,
      processed: false,
    };
    this.notifications[factionId].push(notif);
    this.allNotifications.push({ ...notif, targetId: factionId });
    return notif;
  }

  addGlobalNotification(type, message, data = {}) {
    return this.addNotification('_global', type, message, data);
  }

  getNotifications(factionId, limit = 20) {
    const list = this.notifications[factionId] || [];
    return list.slice(-limit);
  }

  getUnreadNotifications(factionId) {
    return (this.notifications[factionId] || []).filter(n => !n.read);
  }

  getUnprocessedNotifications(factionId) {
    return (this.notifications[factionId] || []).filter(n => !n.processed);
  }

  markProcessed(factionId, notifId) {
    const list = this.notifications[factionId] || [];
    const notif = list.find(n => n.id === notifId);
    if (notif) notif.processed = true;
  }

  markRead(factionId, notifId) {
    const list = this.notifications[factionId] || [];
    const notif = list.find(n => n.id === notifId);
    if (notif) notif.read = true;
  }

  markAllRead(factionId) {
    const list = this.notifications[factionId] || [];
    list.forEach(n => n.read = true);
  }

  getRecentGlobal() {
    return this.allNotifications.slice(-30);
  }

  cleanup() {
    if (this.allNotifications.length > 500) {
      this.allNotifications = this.allNotifications.slice(-400);
    }
    for (const factionId of Object.keys(this.notifications)) {
      if (this.notifications[factionId].length > 100) {
        this.notifications[factionId] = this.notifications[factionId].slice(-80);
      }
    }
  }
}

module.exports = { NotificationSystem };
