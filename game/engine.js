const { REGIONS } = require('./map');
const { createFactions } = require('./factions');
const { resolveBattle } = require('./battle');
const { updateRelations, setEmotion } = require('./diplomacy');
const { getRandomEvent } = require('./events');
const { getDoctrineBonuses } = require('./doctrines');
const { NotificationSystem } = require('./notifications');
const { ChatSystem } = require('./chat');
const cfg = require('./config');

class GameEngine {
  constructor() {
    this.turn = 0;
    this.factions = createFactions();
    this.regions = JSON.parse(JSON.stringify(REGIONS)).map(r => ({ ...r, owner: r.country }));
    this.events = [];
    this.logs = [];
    this.eventLog = [];
    this.emotionLog = [];
    this.factionDestroyedLog = [];
    this.statsHistory = [];
    this.running = false;
    this.speed = cfg.GAME_SPEED_MS;
    this.notifications = new NotificationSystem();
    this.chat = new ChatSystem();
    this.initializeRegionTroops();
  }

  start() {
    this.running = true;
    this.turn = 0;
    this.eventLog = [];
    this.emotionLog = [];
    this.factionDestroyedLog = [];
    this.statsHistory = [];
    this.logs = [];
    this.events = [];
    this.notifications = new NotificationSystem();
    this.chat = new ChatSystem();
    this.initializeRelations();
    this.initializeRegionTroops();
  }

  refreshFactionRegions() {
    for (const faction of Object.values(this.factions)) {
      faction.regions = this.regions.filter(r => r.owner === faction.id).map(r => r.id);
    }
  }

  initializeRegionTroops() {
    this.refreshFactionRegions();
    for (const region of this.regions) {
      region.troops = 0;
      region.garrison = region.garrison || 0;
      region.fortification = region.fortification || 0;
    }

    for (const faction of Object.values(this.factions)) {
      const owned = this.regions.filter(r => r.owner === faction.id);
      if (owned.length === 0) continue;

      const total = Math.max(0, Math.floor(faction.military.army || 0));
      const base = Math.floor(total / owned.length);
      let remainder = total % owned.length;

      for (const region of owned) {
        region.troops = base + (remainder > 0 ? 1 : 0);
        remainder--;
      }
    }
  }

  reconcileRegionTroops() {
    this.refreshFactionRegions();
    for (const faction of Object.values(this.factions)) {
      if (!faction.alive) continue;
      const owned = this.regions.filter(r => r.owner === faction.id);
      if (owned.length === 0) continue;

      const regionalTotal = owned.reduce((sum, r) => sum + (r.troops || 0), 0);
      let diff = Math.floor((faction.military.army || 0) - regionalTotal);

      if (diff > 0) {
        const target = owned.slice().sort((a, b) => (b.resources || 0) - (a.resources || 0))[0];
        target.troops = (target.troops || 0) + diff;
      } else if (diff < 0) {
        diff = Math.abs(diff);
        for (const region of owned.slice().sort((a, b) => (b.troops || 0) - (a.troops || 0))) {
          if (diff <= 0) break;
          const removed = Math.min(region.troops || 0, diff);
          region.troops = (region.troops || 0) - removed;
          diff -= removed;
        }
      }
    }
  }

  addTroopsToRegion(factionId, count, preferredRegionId = null) {
    const faction = this.factions[factionId];
    if (!faction || count <= 0) return null;

    const owned = this.regions.filter(r => r.owner === factionId);
    if (owned.length === 0) return null;

    const region = preferredRegionId
      ? owned.find(r => r.id === preferredRegionId)
      : owned.slice().sort((a, b) => (b.resources || 0) - (a.resources || 0))[0];
    if (!region) return null;

    region.troops = (region.troops || 0) + count;
    faction.military.army = Math.max(0, (faction.military.army || 0) + count);
    return region;
  }

  initializeRelations() {
    const historicalRivalries = [
      ['germany', 'france'], ['uk', 'germany'], ['russia', 'ukraine'],
      ['poland', 'russia'], ['serbia', 'croatia'], ['greece', 'turkey'],
      ['russia', 'poland'], ['hungary', 'romania'], ['serbia', 'bosnia'],
      ['uk', 'spain'], ['france', 'uk'], ['germany', 'russia'],
      ['italy', 'austria'], ['sweden', 'denmark'], ['norway', 'sweden'],
      ['bulgaria', 'serbia'], ['albania', 'serbia'], ['croatia', 'bosnia'],
    ];

    for (const [a, b] of historicalRivalries) {
      if (this.factions[a] && this.factions[b]) {
        this.factions[a].relations[b].trust = 0.1 + Math.random() * 0.15;
        this.factions[a].relations[b].opinion = -30 - Math.floor(Math.random() * 40);
        this.factions[b].relations[a].trust = 0.1 + Math.random() * 0.15;
        this.factions[b].relations[a].opinion = -30 - Math.floor(Math.random() * 40);
        setEmotion(this.factions[a], b, 'hatred', 30 + Math.floor(Math.random() * 40));
        setEmotion(this.factions[b], a, 'hatred', 30 + Math.floor(Math.random() * 40));
      }
    }

    const historicalAllies = [
      ['uk', 'france'], ['uk', 'portugal'], ['france', 'portugal'],
      ['germany', 'austria'], ['germany', 'italy'], ['poland', 'ukraine'],
      ['czech', 'slovakia'], ['serbia', 'montenegro'], ['russia', 'belarus'],
    ];

    for (const [a, b] of historicalAllies) {
      if (this.factions[a] && this.factions[b]) {
        this.factions[a].relations[b].trust = 0.6 + Math.random() * 0.3;
        this.factions[a].relations[b].opinion = 30 + Math.floor(Math.random() * 40);
        this.factions[a].relations[b].alliance = Math.random() < 0.3;
        this.factions[b].relations[a].trust = 0.6 + Math.random() * 0.3;
        this.factions[b].relations[a].opinion = 30 + Math.floor(Math.random() * 40);
        this.factions[b].relations[a].alliance = this.factions[a].relations[b].alliance;
        setEmotion(this.factions[a], b, 'love', 20 + Math.floor(Math.random() * 30));
        setEmotion(this.factions[b], a, 'love', 20 + Math.floor(Math.random() * 30));
      }
    }

    this.eventLog.push({ type: 'game_start', message: '🌍 EUROPA AI WARS has begun! The continent is divided...' });
  }

  tick() {
    if (!this.running) return;

    this.turn++;
    const turnEvents = [];

    this.processRandomEvents(turnEvents);
    this.processBattles(turnEvents);
    updateRelations(this.factions, turnEvents);
    this.processEconomy();
    this.processMilitaryProduction();
    this.reconcileRegionTroops();
    this.checkFactionDestruction(turnEvents);
    this.processNotifications(turnEvents);

    this.eventLog.push(...turnEvents);
    this.statsHistory.push(this.getStats());

    if (this.turn % 5 === 0) {
      this.cleanupLogs();
    }
  }

  processNotifications(turnEvents) {
    for (const event of turnEvents) {
      this.notifications.addGlobalNotification(event.type, event.message, event);

      switch (event.type) {
        case 'war_declaration': {
          const att = event.attacker;
          const def = event.defender;
          if (att && def) {
            this.notifications.addNotification(att, 'war', `⚔️ You declared war on ${this.factions[def]?.name || def}!`, event);
            this.notifications.addNotification(def, 'war', `⚔️ ${this.factions[att]?.name || att} declared war on you!`, event);
            this.triggerAIChat(att, def, 'threat');
            this.triggerAIChat(def, att, 'threat');
          }
          break;
        }
        case 'battle_result': {
          if (event.factionDestroyed) {
            this.notifications.addNotification(event.winner, 'victory', `🏆 ${event.message}`, event);
            if (event.loser && this.factions[event.loser]) {
              this.notifications.addNotification(event.loser, 'defeat', `💀 ${event.message}`, event);
            }
            this.triggerAIChat(event.winner, event.loser, 'victory_gloat');
          } else if (event.conquered) {
            this.notifications.addNotification(event.winner, 'battle', `✅ ${event.message}`, event);
            this.notifications.addNotification(event.loser, 'battle', `❌ ${event.message}`, event);
            this.triggerAIChat(event.winner, event.loser, 'victory_gloat');
            this.triggerRandomChat(event.loser, event.winner);
          }
          break;
        }
        case 'alliance': {
          const [a, b] = event.alliance || [];
          if (a && b) {
            this.notifications.addNotification(a, 'alliance', `🤝 You allied with ${this.factions[b]?.name || b}!`, event);
            this.notifications.addNotification(b, 'alliance', `🤝 You allied with ${this.factions[a]?.name || a}!`, event);
            this.triggerAIChat(a, b, 'alliance_offer');
            this.triggerRandomChat(b, a);
          }
          break;
        }
        case 'betrayal': {
          const traitor = event.traitor;
          const victim = event.victim;
          if (traitor && victim) {
            this.notifications.addNotification(traitor, 'betrayal', `🔪 You betrayed ${this.factions[victim]?.name || victim}!`, event);
            this.notifications.addNotification(victim, 'betrayal', `🔪 ${this.factions[traitor]?.name || traitor} BETRAYED you!`, event);
            this.triggerAIChat(traitor, victim, 'betrayal');
            this.triggerAIChat(victim, traitor, 'threat');
          }
          break;
        }
        case 'random_event': {
          const targetFaction = Object.values(this.factions).find(f =>
            f.alive && f.memory.some(m => m.turn === this.turn && m.event === event.eventId)
          );
          if (targetFaction) {
            this.notifications.addNotification(targetFaction.id, 'event', `📰 ${event.message}`, event);
          }
          break;
        }
        case 'faction_destroyed':
        case 'faction_surrendered':
        case 'faction_wiped': {
          for (const f of Object.values(this.factions)) {
            if (f.alive) {
              this.notifications.addNotification(f.id, 'global', `📢 ${event.message}`, event);
            }
          }
          break;
        }
        case 'diplomatic_incident':
        case 'economic_rivalry': {
          const involved = Object.values(this.factions).filter(f =>
            f.alive && event.message.includes(f.name)
          );
          for (const f of involved) {
            this.notifications.addNotification(f.id, event.type, `📰 ${event.message}`, event);
          }
          break;
        }
      }
    }
  }

  triggerAIChat(senderId, receiverId, templateKey) {
    const sender = this.factions[senderId];
    const receiver = this.factions[receiverId];
    if (!sender?.alive || !receiver?.alive) return;
    if (Math.random() > 0.6) return;

    const customQuote = sender._pendingChatQuote || null;
    if (sender._pendingChatQuote) sender._pendingChatQuote = null;

    const msg = this.chat.generateAIMessage(sender, receiver, sender.personality, templateKey, customQuote);
    this.chat.sendMessage(senderId, receiverId, msg, templateKey);
  }

  triggerRandomChat(senderId, receiverId) {
    const sender = this.factions[senderId];
    const receiver = this.factions[receiverId];
    if (!sender?.alive || !receiver?.alive) return;
    if (Math.random() > 0.5) return;

    const customQuote = sender._pendingChatQuote || null;
    if (sender._pendingChatQuote) sender._pendingChatQuote = null;

    const msg = this.chat.generateAIMessage(sender, receiver, sender.personality, null, customQuote);
    this.chat.sendMessage(senderId, receiverId, msg, 'chat');
  }

  processRandomEvents(turnEvents) {
    const aliveFactions = Object.values(this.factions).filter(f => f.alive);
    const eventsThisTurn = [];

    for (const faction of aliveFactions) {
      if (faction.regions.length === 0) continue;
      const event = getRandomEvent(this.eventLog.filter(e => e.type === 'random_event').map(e => e.eventId));
      if (event) {
        const region = faction.regions[Math.floor(Math.random() * faction.regions.length)];
        const regionData = this.regions.find(r => r.id === region);
        const doctrine = getDoctrineBonuses(faction.id);

        if (event.effect.economy) faction.economy += Math.floor(event.effect.economy * (1 + doctrine.bonuses.economyBonus));
        if (event.effect.population) faction.population += event.effect.population;
        if (event.effect.army) faction.military.army = Math.max(0, faction.military.army + event.effect.army);
        if (event.effect.air) faction.military.air = Math.max(0, faction.military.air + event.effect.air);
        if (event.effect.navy) faction.military.navy = Math.max(0, faction.military.navy + event.effect.navy);

        const msg = event.message
          .replace(/{faction}/g, faction.name)
          .replace(/{region}/g, regionData ? regionData.name : 'Unknown');

        turnEvents.push({ type: 'random_event', eventId: event.id, message: msg, targetFaction: faction.id });
        faction.memory.push({ turn: this.turn, event: event.id, message: msg });
        eventsThisTurn.push(event.id);
      }
    }
  }

  processBattles(turnEvents) {
    const battles = turnEvents.filter(e => e.type === 'battle');
    for (const battle of battles) {
      const result = resolveBattle(battle.attacker, battle.defender, battle.attRegion, battle.defRegion, this.factions);

      const attFaction = this.factions[result.winner];
      const defFaction = this.factions[result.loser];

      if (result.conquered && result.capturedRegion) {
        const region = this.regions.find(r => r.id === result.capturedRegion);
        if (region) {
          const oldOwner = region.owner;
          region.owner = result.winner;
          attFaction.regions = this.regions.filter(r => r.owner === attFaction.id).map(r => r.id);
          if (this.factions[oldOwner]) {
            this.factions[oldOwner].regions = this.regions.filter(r => r.owner === oldOwner).map(r => r.id);
          }
        }
      }

      if (result.factionDestroyed) {
        const loser = this.factions[result.loser];
        if (loser) {
          const loserRegions = this.regions.filter(r => r.owner === loser.id);
          for (const region of loserRegions) {
            region.owner = result.winner;
          }
          attFaction.regions = this.regions.filter(r => r.owner === attFaction.id).map(r => r.id);

          for (const f of Object.values(this.factions)) {
            if (f.id !== loser.id && f.relations[loser.id]) {
              f.relations[loser.id].alliance = false;
              f.relations[loser.id].war = false;
            }
          }

          turnEvents.push({
            type: 'faction_destroyed',
            faction: result.loser,
            message: result.message,
          });
          this.factionDestroyedLog.push({
            turn: this.turn,
            faction: result.loser,
            eliminator: result.winner,
          });

          setEmotion(attFaction, result.loser, 'pride', 100);
          setEmotion(attFaction, result.loser, 'joy', 80);

          const survivors = Object.values(this.factions).filter(f => f.alive && f.id !== result.loser);
          for (const f of survivors) {
            if (f.id === result.winner) continue;
            if (Math.random() < 0.4) {
              setEmotion(f, result.winner, 'fear', Math.min(100, (f.emotions[result.winner]?.fear || 0) + 40));
            }
            if (Math.random() < 0.3) {
              setEmotion(f, result.loser, 'sadness', Math.min(100, (f.emotions[result.loser]?.sadness || 0) + 30));
            }
          }
        }
      }

      turnEvents.push({
        type: 'battle_result',
        message: result.message,
        winner: result.winner,
        loser: result.loser,
        conquered: result.conquered,
        factionDestroyed: result.factionDestroyed,
      });

      if (result.conquered && !result.factionDestroyed) {
        setEmotion(attFaction, result.loser, 'pride', Math.min(100, (attFaction.emotions[result.loser]?.pride || 0) + 15));
        setEmotion(defFaction, result.winner, 'fear', Math.min(100, (defFaction.emotions[result.winner]?.fear || 0) + 20));
        setEmotion(defFaction, result.winner, 'anger', Math.min(100, (defFaction.emotions[result.winner]?.anger || 0) + 15));
      }
    }
  }

  processEconomy() {
    for (const faction of Object.values(this.factions)) {
      if (!faction.alive) continue;
      const regionCount = faction.regions.length || 1;
      const doctrine = getDoctrineBonuses(faction.id);
      const income = Math.floor((regionCount * cfg.BASE_REGION_INCOME + Math.floor(Math.random() * cfg.ECONOMY_RANDOM_MAX)) * (1 + doctrine.bonuses.economyBonus));
      const expenses = Math.floor(faction.military.army * cfg.ARMY_UPKEEP_MULTIPLIER + faction.military.air * cfg.AIR_UPKEEP_MULTIPLIER + faction.military.navy * cfg.NAVY_UPKEEP_MULTIPLIER);
      faction.economy = Math.max(0, faction.economy + income - expenses);
    }
  }

  processMilitaryProduction() {
    for (const faction of Object.values(this.factions)) {
      if (!faction.alive) continue;
      const doctrine = getDoctrineBonuses(faction.id);
      const prodSpeed = doctrine.bonuses.productionSpeed;
      const costReduction = doctrine.bonuses.unitCostReduction;

      if (faction.economy > 100) {
        const prod = Math.floor((faction.economy * cfg.ECONOMY_PRODUCTION_RATIO * prodSpeed) + Math.random() * 10);
        faction.military.army += prod;
        faction.economy -= Math.floor(prod * cfg.PRODUCTION_COST_MULTIPLIER * (1 - costReduction));
      }
      if (faction.economy > 150 && Math.random() < 0.3 * prodSpeed) {
        const airBonus = doctrine.bonuses.airBonus;
        const prod = Math.floor(Math.random() * 5 * (1 + Math.max(0, airBonus)));
        faction.military.air += prod;
        faction.economy -= Math.floor(10 * (1 - costReduction));
      }
      if (faction.economy > 200 && Math.random() < 0.2 * prodSpeed) {
        const navalBonus = doctrine.bonuses.navalBonus;
        const prod = Math.floor(Math.random() * 3 * (1 + Math.max(0, navalBonus)));
        faction.military.navy += prod;
        faction.economy -= Math.floor(15 * (1 - costReduction));
      }
    }
  }

  checkFactionDestruction(turnEvents) {
    for (const faction of Object.values(this.factions)) {
      if (!faction.alive) continue;
      const regionCount = this.regions.filter(r => r.owner === faction.id).length;
      faction.regions = this.regions.filter(r => r.owner === faction.id).map(r => r.id);

      if (regionCount === 0 && faction.alive) {
        faction.alive = false;
        const msg = `🏳️ ${faction.name} has SURRENDERED! They have no territory left!`;
        turnEvents.push({ type: 'faction_surrendered', faction: faction.id, message: msg });
        this.factionDestroyedLog.push({ turn: this.turn, faction: faction.id, eliminator: 'none' });
      }

      if (faction.population <= 0 && faction.alive) {
        faction.alive = false;
        const msg = `💀 ${faction.name} has been WIPED OUT! No population remains!`;
        turnEvents.push({ type: 'faction_wiped', faction: faction.id, message: msg });
        this.factionDestroyedLog.push({ turn: this.turn, faction: faction.id, eliminator: 'extinction' });
      }
    }
  }

  getChatForFaction(factionId, limit = 30) {
    return this.chat.getAllMessagesForFaction(factionId, limit);
  }

  getNotificationsForFaction(factionId) {
    return this.notifications.getNotifications(factionId);
  }

  getUnreadNotificationsForFaction(factionId) {
    return this.notifications.getUnreadNotifications(factionId);
  }

  markNotificationRead(factionId, notifId) {
    this.notifications.markRead(factionId, notifId);
  }

  cleanupLogs() {
    if (this.eventLog.length > 200) {
      this.eventLog = this.eventLog.slice(-150);
    }
    this.notifications.cleanup();
    this.chat.cleanup();
  }

  getStats() {
    const alive = Object.values(this.factions).filter(f => f.alive);
    return {
      turn: this.turn,
      factions: alive.map(f => ({
        id: f.id,
        name: f.name,
        flag: f.flag,
        color: f.color,
        totalPower: Math.round(f.getTotalMilitaryPower()),
        army: f.military.army,
        air: f.military.air,
        navy: f.military.navy,
        economy: f.economy,
        population: f.population,
        regionCount: f.regions.length,
        personality: { ...f.personality },
      })),
      destroyed: this.factionDestroyedLog.filter(d => d.turn === this.turn).map(d => ({
        faction: d.faction,
        eliminator: d.eliminator,
      })),
    };
  }

  getFullState() {
    return {
      turn: this.turn,
      regions: this.regions.map(r => ({
        id: r.id,
        name: r.name,
        lat: r.lat,
        lng: r.lng,
        owner: r.owner,
        resources: r.resources,
        population: r.population,
        troops: r.troops || 0,
        garrison: r.garrison || 0,
        fortification: r.fortification || 0,
        neighbors: r.neighbors,
      })),
      factions: Object.values(this.factions).filter(f => f.alive).map(f => ({
        ...f.getDisplayStatus(),
        doctrine: {
          id: f.doctrineId,
          name: this.getDoctrineName(f.doctrineId),
          icon: this.getDoctrineIcon(f.doctrineId),
          specialties: this.getDoctrineSpecialties(f.doctrineId),
          weakness: this.getDoctrineWeakness(f.doctrineId),
        },
        relations: Object.fromEntries(
          Object.entries(f.relations)
            .filter(([id]) => this.factions[id]?.alive)
            .map(([id, rel]) => [id, { trust: Math.round(rel.trust * 100) / 100, opinion: Math.round(rel.opinion), alliance: rel.alliance, war: rel.war }])
        ),
        emotions: Object.fromEntries(
          Object.entries(f.emotions)
            .filter(([id]) => this.factions[id]?.alive)
            .map(([id, em]) => [id, { dominant: em.dominant, intensity: Math.max(...Object.entries(em).filter(([k]) => k !== 'dominant').map(([, v]) => v)) }])
        ),
      })),
      destroyed: Object.values(this.factions).filter(f => !f.alive).map(f => ({
        id: f.id, name: f.name, flag: f.flag,
      })),
      events: this.eventLog.slice(-50),
      statsHistory: this.statsHistory.slice(-100),
      factionDestroyedLog: this.factionDestroyedLog,
      recentChat: this.chat.messages.slice(-20),
      globalNotifications: this.notifications.getRecentGlobal().slice(-20),
    };
  }

  getDoctrineName(doctrineId) {
    const { DOCTRINES } = require('./doctrines');
    return DOCTRINES[doctrineId]?.name || 'Unknown';
  }

  getDoctrineIcon(doctrineId) {
    const { DOCTRINES } = require('./doctrines');
    return DOCTRINES[doctrineId]?.icon || '❓';
  }

  getDoctrineSpecialties(doctrineId) {
    const { DOCTRINES } = require('./doctrines');
    return DOCTRINES[doctrineId]?.specialties || [];
  }

  getDoctrineWeakness(doctrineId) {
    const { DOCTRINES } = require('./doctrines');
    return DOCTRINES[doctrineId]?.weakness || '';
  }
}

module.exports = { GameEngine };
