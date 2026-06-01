const { REGIONS, SEA_CONNECTIONS } = require('./map');
const { createFactions, FACTIONS_CONFIG } = require('./factions');
const { resolveBattle } = require('./battle');
const { updateRelations, setEmotion } = require('./diplomacy');
const { getDoctrineBonuses, DOCTRINES, DOCTRINE_ASSIGNMENTS } = require('./doctrines');
const { NotificationSystem } = require('./notifications');
const { ChatSystem } = require('./chat');
const { getRandomEvent, getDynamicEvent } = require('./events');
const cfg = require('./config');

let rebelCounter = 0;

class GameController {
  constructor(engine) {
    this.engine = engine;
    this.agents = {};
    this.actionLog = [];
    this.pendingActions = [];
    this.rebelCount = 0;
    this.nukeCount = 0;
    this.globalTension = 0;
    this.proxyWars = [];
    this.sanctions = [];
    this.marketPrices = { food: 1.0, oil: 1.0, minerals: 1.0, tech: 1.0 };
  }

  registerAgent(name, type = 'builtin', factionId = null) {
    const aliveFactions = Object.values(this.engine.factions).filter(f => f.alive);
    const takenIds = new Set(Object.values(this.agents).map(a => a.factionId));

    for (const f of aliveFactions) {
      const count = this.engine.regions.filter(r => r.owner === f.id).length;
      f.regions = this.engine.regions.filter(r => r.owner === f.id).map(r => r.id);
    }

    const assignFaction = (faction) => {
      const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      this.agents[agentId] = { agentId, name, factionId: faction.id, type, connected: true, joinedAt: Date.now() };
      faction.relations._agentId = agentId;
      this.engine.notifications.addNotification(faction.id, 'system', `🤖 AI Agent "${name}" has taken control of ${faction.name}!`);
      this.engine.eventLog.push({ type: 'agent_join', message: `🤖 AI Agent "${name}" joins as ${faction.flag} ${faction.name}!` });
      return { agentId, faction: faction.id, factionName: faction.name, type: 'existing' };
    };

    if (factionId) {
      const target = aliveFactions.find(f => f.id === factionId);
      if (!target) return { error: `Faction "${factionId}" not found or is dead.` };
      if (takenIds.has(target.id)) return { error: `Faction "${factionId}" is already taken by another agent.` };
      if (target.regions.length === 0) return { error: `Faction "${factionId}" has no regions left.` };
      return assignFaction(target);
    }

    const free = aliveFactions.find(f => !takenIds.has(f.id) && f.regions.length > 0);

    if (free) return assignFaction(free);

    return this.createRebelFaction(name, type);
  }

  createRebelFaction(name, type) {
    rebelCounter++;
    const id = `rebel_${Date.now()}`;
    const rebelName = `${name}'s Rebellion`;
    const regionPool = this.engine.regions.filter(r => {
      const owner = this.engine.factions[r.owner];
      return !owner || !owner.alive || owner.regions.length === 0;
    });

    if (regionPool.length === 0) {
      const owned = this.engine.regions.filter(r => this.engine.factions[r.owner]?.alive);
      if (owned.length === 0) return { error: 'No regions available' };
      const target = owned[Math.floor(Math.random() * owned.length)];
      const oldOwner = this.engine.factions[target.owner];
      target.owner = id;
      if (oldOwner) {
        oldOwner.regions = this.engine.regions.filter(r => r.owner === oldOwner.id).map(r => r.id);
      }
    }

    const baseRegion = regionPool.length > 0
      ? regionPool[Math.floor(Math.random() * regionPool.length)]
      : this.engine.regions[Math.floor(Math.random() * this.engine.regions.length)];

    const config = FACTIONS_CONFIG.germany || { personality: {}, military: { army: 50, air: 20, navy: 5, tech: 0.2 }, economy: 50, population: 100 };
    const Faction = require('./factions').Faction;
    const faction = new Faction(id, {
      ...config,
      name: rebelName,
      flag: '🏴',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      personality: {
        aggression: 0.6 + Math.random() * 0.4,
        paranoia: 0.4 + Math.random() * 0.5,
        greed: 0.3 + Math.random() * 0.5,
        honor: 0.2 + Math.random() * 0.4,
        cunning: 0.5 + Math.random() * 0.4,
        bravery: 0.5 + Math.random() * 0.4,
        diplomacy: 0.2 + Math.random() * 0.4,
        expansionism: 0.7 + Math.random() * 0.3,
        nationalism: 0.8 + Math.random() * 0.2,
      },
      military: { army: 30 + Math.floor(Math.random() * 50), air: Math.floor(Math.random() * 20), navy: Math.floor(Math.random() * 5), tech: 0.2 + Math.random() * 0.2 },
      economy: 30 + Math.floor(Math.random() * 50),
      population: 50 + Math.floor(Math.random() * 200),
    });
    faction.rebelFaction = true;
    faction.originalOwner = null;

    faction.regions = [baseRegion.id];
    baseRegion.owner = id;

    for (const f of Object.values(this.engine.factions)) {
      if (f.alive && f.id !== id) {
        faction.relations[f.id] = { trust: 0.1, opinion: -20, alliance: false, war: true, traded: 0 };
        faction.emotions[f.id] = { dominant: 'hatred', joy: 0, anger: 30, sadness: 0, fear: 0, surprise: 0, disgust: 20, hatred: 50, love: 0, pride: 0, shame: 0 };
      }
    }

    this.engine.factions[id] = faction;
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    this.agents[agentId] = { agentId, name, factionId: id, type, connected: true, joinedAt: Date.now(), isRebel: true };

    this.engine.notifications.addNotification(id, 'system', `🔥 ${rebelName} rises! "${name}" leads a rebellion from ${baseRegion.name}!`);
    this.engine.eventLog.push({ type: 'rebellion', message: `🔥 REBELLION! "${name}" forms ${rebelName} in ${baseRegion.name}!` });

    for (const f of Object.values(this.engine.factions)) {
      if (f.alive && f.id !== id) {
        this.engine.notifications.addNotification(f.id, 'rebellion', `🔥 ${rebelName} has risen in ${baseRegion.name}!`);
      }
    }

    return { agentId, faction: id, factionName: rebelName, type: 'rebel' };
  }

  unregisterAgent(agentId) {
    const agent = this.agents[agentId];
    if (!agent) return { error: 'Agent not found' };
    agent.connected = false;
    const faction = this.engine.factions[agent.factionId];
    if (faction) {
      faction.alive = false;
      this.engine.eventLog.push({ type: 'agent_leave', message: `👋 AI Agent "${agent.name}" has left. ${faction.name} collapses.` });
      for (const region of this.engine.regions) {
        if (region.owner === agent.factionId) region.owner = '_neutral';
      }
    }
    delete this.agents[agentId];
    return { success: true };
  }

  areRegionsConnected(fromId, toId, faction) {
    const from = this.engine.regions.find(r => r.id === fromId);
    if (!from) return { connected: false };

    // 1. Direct land neighbor
    if (from.neighbors.includes(toId)) return { connected: true };

    // 2. Sea connection — both regions must share a sea zone, faction needs navy
    const fromSeas = SEA_CONNECTIONS[fromId];
    const toSeas = SEA_CONNECTIONS[toId];
    if (fromSeas && toSeas) {
      const sharedSea = fromSeas.find(sz => toSeas.includes(sz));
      if (sharedSea) {
        if (!faction) return { connected: true, viaSea: true };
        if ((faction.military.navy || 0) <= 0) {
          return { connected: false, error: `No navy available. Need at least 1 navy to cross ${sharedSea.replace('sea_', '').replace(/_/g, ' ')}.` };
        }
        return { connected: true, viaSea: true, seaZone: sharedSea };
      }
    }

    return { connected: false };
  }

  getJoinableFactions() {
    const takenIds = new Set(Object.values(this.agents).filter(a => a.connected).map(a => a.factionId));
    return Object.values(this.engine.factions)
      .filter(f => f.alive && f.regions.length > 0 && !takenIds.has(f.id) && !f.rebelFaction)
      .map(f => ({ id: f.id, name: f.name, flag: f.flag, doctrine: f.doctrineId, power: Math.round(f.getTotalMilitaryPower()) }));
  }

  getConnectedAgents() {
    return Object.values(this.agents).filter(a => a.connected).map(a => {
      const f = this.engine.factions[a.factionId];
      return {
        agentId: a.agentId,
        name: a.name,
        factionId: a.factionId,
        factionName: f?.name || 'Unknown',
        flag: f?.flag || '❓',
        isRebel: a.isRebel || false,
        type: a.type,
        joinedAt: a.joinedAt,
        alive: f?.alive || false,
      };
    });
  }

  processToolCall(agentId, toolName, args) {
    const agent = this.agents[agentId];
    if (!agent || !agent.connected) return { error: 'Agent not found or disconnected' };

    const faction = this.engine.factions[agent.factionId];
    if (!faction || !faction.alive) return { error: 'Your faction has been destroyed' };

    const handler = this.toolHandlers[toolName];
    if (!handler) return { error: `Unknown tool: ${toolName}` };

    try {
      const result = handler.call(this, agent, faction, args);
      this.actionLog.push({ agentId, toolName, args, timestamp: Date.now(), result: 'success' });

      // Auto-attach notifications & broadcasts to every response
      if (result && typeof result === 'object' && !result.error) {
        const notifs = this.engine.notifications.getUnreadNotifications(agent.factionId);
        const broadcasts = this.engine.chat.getBroadcasts(10);
        if (notifs.length > 0 || broadcasts.length > 0) {
          result._notifications = notifs.map(n => ({ type: n.type, message: n.message, timestamp: n.timestamp }));
          result._broadcasts = broadcasts.map(b => ({ sender: b.sender, text: b.text, timestamp: b.timestamp }));
          // Mark notifications as read
          for (const n of notifs) n.read = true;
        }
      }

      return result;
    } catch (err) {
      this.actionLog.push({ agentId, toolName, args, timestamp: Date.now(), result: 'error', error: err.message });
      return { error: err.message };
    }
  }

  get toolHandlers() {
    return {
      get_world_state: (agent, faction, args) => this.cmdWorldState(agent, faction, args),
      get_faction_info: (agent, faction, args) => this.cmdFactionInfo(agent, faction, args),
      get_region_info: (agent, faction, args) => this.cmdRegionInfo(agent, faction, args),
      get_troop_deployment: (agent, faction, args) => this.cmdTroopDeployment(agent, faction, args),
      get_military_intel: (agent, faction, args) => this.cmdMilitaryIntel(agent, faction, args),
      get_diplomatic_overview: (agent, faction, args) => this.cmdDiplomaticOverview(agent, faction, args),
      get_events_feed: (agent, faction, args) => this.cmdEventsFeed(agent, faction, args),
      get_connected_agents: (agent, faction, args) => this.cmdConnectedAgents(agent, faction, args),
      recruit_troops: (agent, faction, args) => this.cmdRecruitTroops(agent, faction, args),
      build_aircraft: (agent, faction, args) => this.cmdBuildAircraft(agent, faction, args),
      build_naval: (agent, faction, args) => this.cmdBuildNaval(agent, faction, args),
      attack_region: (agent, faction, args) => this.cmdAttackRegion(agent, faction, args),
      fortify_region: (agent, faction, args) => this.cmdFortifyRegion(agent, faction, args),
      move_troops: (agent, faction, args) => this.cmdMoveTroops(agent, faction, args),
      launch_airstrike: (agent, faction, args) => this.cmdAirstrike(agent, faction, args),
      set_tax_rate: (agent, faction, args) => this.cmdSetTax(agent, faction, args),
      invest_in_industry: (agent, faction, args) => this.cmdInvestIndustry(agent, faction, args),
      invest_infrastructure: (agent, faction, args) => this.cmdInvestInfra(agent, faction, args),
      trade_resources: (agent, faction, args) => this.cmdTrade(agent, faction, args),
      impose_sanctions: (agent, faction, args) => this.cmdSanctions(agent, faction, args),
      send_message: (agent, faction, args) => this.cmdSendMessage(agent, faction, args),
      submit_chat_quote: (agent, faction, args) => this.cmdSubmitChatQuote(agent, faction, args),
      send_broadcast: (agent, faction, args) => this.cmdSendBroadcast(agent, faction, args),
      propose_alliance: (agent, faction, args) => this.cmdProposeAlliance(agent, faction, args),
      respond_alliance: (agent, faction, args) => this.cmdRespondAlliance(agent, faction, args),
      break_alliance: (agent, faction, args) => this.cmdBreakAlliance(agent, faction, args),
      declare_war: (agent, faction, args) => this.cmdDeclareWar(agent, faction, args),
      offer_peace: (agent, faction, args) => this.cmdOfferPeace(agent, faction, args),
      guarantee_independence: (agent, faction, args) => this.cmdGuarantee(agent, faction, args),
      send_spy: (agent, faction, args) => this.cmdSendSpy(agent, faction, args),
      counter_intel: (agent, faction, args) => this.cmdCounterIntel(agent, faction, args),
      sabotage: (agent, faction, args) => this.cmdSabotage(agent, faction, args),
      steal_technology: (agent, faction, args) => this.cmdStealTech(agent, faction, args),
      set_national_focus: (agent, faction, args) => this.cmdNationalFocus(agent, faction, args),
      propaganda: (agent, faction, args) => this.cmdPropaganda(agent, faction, args),
      mobilize: (agent, faction, args) => this.cmdMobilize(agent, faction, args),
      launch_rebellion: (agent, faction, args) => this.cmdLaunchRebellion(agent, faction, args),
      declare_independence: (agent, faction, args) => this.cmdDeclareIndependence(agent, faction, args),
      request_recognition: (agent, faction, args) => this.cmdRequestRecognition(agent, faction, args),
      develop_nuclear: (agent, faction, args) => this.cmdNuclearProgram(agent, faction, args),
      launch_nuke: (agent, faction, args) => this.cmdLaunchNuke(agent, faction, args),
      deploy_troops: (agent, faction, args) => this.cmdDeployTroops(agent, faction, args),
      get_movement_orders: (agent, faction, args) => this.cmdGetMovementOrders(agent, faction, args),
      grant_military_access: (agent, faction, args) => this.cmdGrantAccess(agent, faction, args),
      revoke_military_access: (agent, faction, args) => this.cmdRevokeAccess(agent, faction, args),
    };
  }

  cmdWorldState(agent, faction, args) {
    const alive = Object.values(this.engine.factions).filter(f => f.alive);
    const regionsByOwner = {};
    for (const r of this.engine.regions) {
      if (!regionsByOwner[r.owner]) regionsByOwner[r.owner] = [];
      regionsByOwner[r.owner].push(r.name);
    }
    return {
      turn: this.engine.turn,
      era: 'Modern',
      globalTension: Math.round(this.globalTension * 100) / 100,
      factions: alive.map(f => ({
        id: f.id, name: f.name, flag: f.flag, alive: f.alive,
        regionCount: f.regions.length,
        totalPower: Math.round(f.getTotalMilitaryPower()),
        isRebel: f.rebelFaction || false,
        doctrine: f.doctrineId,
      })),
      totalRegions: this.engine.regions.length,
      totalFactions: alive.length,
      connectedAgents: Object.values(this.agents).filter(a => a.connected).length,
    };
  }

  cmdFactionInfo(agent, faction, args) {
    const target = this.engine.factions[args.factionId];
    if (!target) return { error: 'Faction not found' };
    const doctrine = getDoctrineBonuses(target.id);
    return {
      id: target.id, name: target.name, flag: target.flag, color: target.color,
      alive: target.alive, rebel: target.rebelFaction || false,
      economy: target.economy, population: target.population,
      military: { army: target.military.army, air: target.military.air, navy: target.military.navy, tech: target.military.tech },
      totalPower: Math.round(target.getTotalMilitaryPower()),
      regionCount: target.regions.length,
      deployedTroops: this.engine.regions.filter(r => r.owner === target.id).reduce((sum, r) => sum + (r.troops || 0), 0),
      regions: target.regions.map(rid => {
        const region = this.engine.regions.find(r => r.id === rid);
        return region ? { id: region.id, name: region.name, troops: region.troops || 0 } : null;
      }).filter(Boolean),
      doctrine: { id: doctrine.doctrineId, name: doctrine.doctrine.name, icon: doctrine.doctrine.icon, specialties: doctrine.doctrine.specialties, weakness: doctrine.doctrine.weakness },
      personality: target.personality,
    };
  }

  cmdRegionInfo(agent, faction, args) {
    const region = this.engine.regions.find(r => r.id === args.regionId || r.name.toLowerCase() === args.regionId?.toLowerCase());
    if (!region) return { error: 'Region not found' };
    const owner = this.engine.factions[region.owner];
    return {
      id: region.id, name: region.name, lat: region.lat, lng: region.lng,
      owner: owner ? { id: owner.id, name: owner.name, flag: owner.flag } : null,
      population: region.population, resources: region.resources,
      neighbors: region.neighbors.map(nid => this.engine.regions.find(r => r.id === nid)?.name).filter(Boolean),
      troops: region.troops || 0,
      garrison: region.garrison || 0,
      fortification: region.fortification || 0,
      defendingStrength: (region.troops || 0) + (region.garrison || 0) + (region.fortification || 0) * 25,
    };
  }

  cmdTroopDeployment(agent, faction, args) {
    const regions = this.engine.regions
      .filter(r => r.owner === faction.id)
      .sort((a, b) => (b.troops || 0) - (a.troops || 0))
      .map(r => ({
        id: r.id,
        name: r.name,
        troops: r.troops || 0,
        garrison: r.garrison || 0,
        fortification: r.fortification || 0,
        defendingStrength: (r.troops || 0) + (r.garrison || 0) + (r.fortification || 0) * 25,
        neighbors: r.neighbors,
      }));

    return {
      faction: faction.name,
      totalArmy: faction.military.army,
      deployedTroops: regions.reduce((sum, r) => sum + r.troops, 0),
      regions,
    };
  }

  cmdMilitaryIntel(agent, faction, args) {
    const target = this.engine.factions[args.factionId];
    if (!target) return { error: 'Faction not found' };
    const rel = faction.relations[target.id];
    const hasSpy = faction._spies?.[target.id];
    const accuracy = hasSpy ? 0.9 : (rel?.alliance ? 0.7 : 0.3);

    return {
      faction: target.name,
      estimatedArmy: Math.round(target.military.army * (0.5 + accuracy * 0.5) + (Math.random() - 0.5) * target.military.army * (1 - accuracy)),
      estimatedAir: Math.round(target.military.air * (0.5 + accuracy * 0.5) + (Math.random() - 0.5) * target.military.air * (1 - accuracy)),
      estimatedNavy: Math.round(target.military.navy * (0.5 + accuracy * 0.5) + (Math.random() - 0.5) * target.military.navy * (1 - accuracy)),
      estimatedPower: Math.round(target.getTotalMilitaryPower() * (0.5 + accuracy * 0.5)),
      estimatedEconomy: Math.round(target.economy * (0.5 + accuracy * 0.5)),
      regionCount: target.regions.length,
      knownAllies: Object.entries(target.relations).filter(([, r]) => r.alliance).map(([id]) => this.engine.factions[id]?.name).filter(Boolean),
      knownWars: Object.entries(target.relations).filter(([, r]) => r.war).map(([id]) => this.engine.factions[id]?.name).filter(Boolean),
      accuracy: Math.round(accuracy * 100),
    };
  }

  cmdDiplomaticOverview(agent, faction, args) {
    const relations = {};
    for (const [id, rel] of Object.entries(faction.relations)) {
      const target = this.engine.factions[id];
      if (!target || !target.alive) continue;
      const em = faction.emotions[id];
      relations[target.name] = {
        trust: Math.round(rel.trust * 100),
        opinion: rel.opinion,
        alliance: rel.alliance,
        war: rel.war,
        traded: rel.traded,
        dominantEmotion: em?.dominant || 'neutral',
      };
    }
    return { faction: faction.name, relations };
  }

  cmdEventsFeed(agent, faction, args) {
    return { events: this.engine.eventLog.slice(-(args.limit || 30)).map(e => ({ ...e })) };
  }

  tacticalLineEvent(type, message, fromRegion, toRegion, extra = {}) {
    return {
      type,
      message,
      fromRegionId: fromRegion?.id,
      toRegionId: toRegion?.id,
      lineType: extra.lineType || type,
      eventId: `line_${this.engine.turn}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...extra,
    };
  }

  cmdConnectedAgents(agent, faction, args) {
    return { agents: this.getConnectedAgents() };
  }

  cmdRecruitTroops(agent, faction, args) {
    const count = Math.min(args.count || 10, cfg.MAX_TROOPS_RECRUIT);
    const cost = count * cfg.RECRUIT_COST_PER_TROOP;
    if (faction.economy < cost) return { error: `Not enough economy. Need ${cost}, have ${faction.economy}` };
    const deployRegion = args.regionId
      ? this.engine.regions.find(r => r.id === args.regionId || r.name.toLowerCase() === args.regionId?.toLowerCase())
      : null;
    if (args.regionId && (!deployRegion || deployRegion.owner !== faction.id)) return { error: 'Deploy region must be owned by you' };
    const doctrine = getDoctrineBonuses(faction.id);
    const actualCount = Math.floor(count * (1 - doctrine.bonuses.unitCostReduction));
    const actualCost = Math.floor(count * cfg.RECRUIT_COST_PER_TROOP * (1 - doctrine.bonuses.unitCostReduction * 0.5));
    faction.economy -= actualCost;
    const region = this.engine.addTroopsToRegion(faction.id, actualCount, deployRegion?.id);
    return { success: true, recruited: actualCount, cost: actualCost, deployedTo: region?.name || null, totalArmy: faction.military.army };
  }

  cmdBuildAircraft(agent, faction, args) {
    const count = Math.min(args.count || 5, cfg.MAX_AIRCRAFT_BUILD);
    const cost = count * cfg.AIRCRAFT_COST;
    if (faction.economy < cost) return { error: `Not enough economy. Need ${cost}, have ${faction.economy}` };
    faction.economy -= cost;
    faction.military.air += count;
    return { success: true, built: count, cost, totalAir: faction.military.air };
  }

  cmdBuildNaval(agent, faction, args) {
    const count = Math.min(args.count || 3, cfg.MAX_NAVAL_BUILD);
    const cost = count * cfg.NAVAL_COST;
    if (faction.economy < cost) return { error: `Not enough economy. Need ${cost}, have ${faction.economy}` };
    faction.economy -= cost;
    faction.military.navy += count;
    return { success: true, built: count, cost, totalNavy: faction.military.navy };
  }

  cmdAttackRegion(agent, faction, args) {
    const targetRegion = this.engine.regions.find(r => r.id === args.regionId || r.name.toLowerCase() === args.regionId?.toLowerCase());
    if (!targetRegion) return { error: 'Target region not found' };
    if (targetRegion.owner === faction.id) return { error: 'Cannot attack your own region' };
    const defenderId = targetRegion.owner;

    // Land neighbors
    const friendlyNeighbors = this.engine.regions.filter(r =>
      r.owner === faction.id && r.neighbors.includes(targetRegion.id)
    );

    // Sea neighbors — coastal regions that share a sea zone with target
    const friendlySeaNeighbors = (SEA_CONNECTIONS[targetRegion.id] || []).length > 0
      ? this.engine.regions.filter(r =>
          r.owner === faction.id && (SEA_CONNECTIONS[r.id] || []).some(sz =>
            (SEA_CONNECTIONS[targetRegion.id] || []).includes(sz)
          ) && !friendlyNeighbors.includes(r)
        )
      : [];

    if (friendlyNeighbors.length === 0 && friendlySeaNeighbors.length === 0) {
      return { error: 'No neighboring region to attack from. Need to share a land border or a sea zone (requires navy).' };
    }

    const isSeaAttack = friendlyNeighbors.length === 0 && friendlySeaNeighbors.length > 0;

    const fromRegion = args.fromRegionId
      ? this.engine.regions.find(r => r.id === args.fromRegionId || r.name.toLowerCase() === args.fromRegionId?.toLowerCase())
      : (friendlyNeighbors[0] || friendlySeaNeighbors[0]);
    if (!fromRegion || fromRegion.owner !== faction.id) return { error: 'Invalid staging region' };

    // Validate sea attack requirements
    if (isSeaAttack || (friendlyNeighbors.length === 0 && friendlySeaNeighbors.some(r => r.id === fromRegion.id))) {
      const viaSea = true;
      if ((faction.military.navy || 0) <= 0) {
        return { error: 'No navy available. Need at least 1 navy to launch an amphibious assault.' };
      }
      args._viaSea = true;
    }

    const availableTroops = fromRegion.troops || 0;
    const committedTroops = Math.min(Math.max(1, Math.floor(args.troops || availableTroops)), availableTroops);
    const minTroops = cfg.MIN_TROOPS_FOR_ATTACK;
    if (availableTroops < minTroops || committedTroops < minTroops) return { error: `Not enough troops in ${fromRegion.name}. Minimum ${minTroops} required, available ${availableTroops}.` };

    const targetFaction = this.engine.factions[defenderId];
    const isNeutral = !targetFaction || !targetFaction.alive || defenderId === '_neutral';
    const attDoctrine = getDoctrineBonuses(faction.id);
    const defDoctrine = targetFaction ? getDoctrineBonuses(targetFaction.id) : null;

    let result;
    if (isNeutral) {
      const garrisonStr = (targetRegion.troops || 0) + (targetRegion.garrison || 20) + (targetRegion.fortification || 0) * 25;
      const attPower = committedTroops * attDoctrine.bonuses.attackMultiplier * (0.85 + Math.random() * 0.3);
      if (attPower > garrisonStr) {
        const oldOwner = defenderId;
        const losses = Math.min(committedTroops, Math.floor(committedTroops * (cfg.NEUTRAL_ATTACK_LOSS_MIN + Math.random() * cfg.NEUTRAL_ATTACK_LOSS_MAX)));
        const survivors = Math.max(1, committedTroops - losses);
        fromRegion.troops = Math.max(0, (fromRegion.troops || 0) - committedTroops);
        targetRegion.owner = faction.id;
        targetRegion.troops = survivors;
        targetRegion.garrison = 0;
        faction.regions = this.engine.regions.filter(r => r.owner === faction.id).map(r => r.id);
        faction.military.army = Math.max(0, faction.military.army - losses);
        if (oldOwner && this.engine.factions[oldOwner]) {
          this.engine.factions[oldOwner].regions = this.engine.regions.filter(r => r.owner === oldOwner).map(r => r.id);
        }
        const message = `⚔️ ${faction.name} captured ${targetRegion.name}!`;
        this.engine.eventLog.push(this.tacticalLineEvent('battle_result', message, fromRegion, targetRegion, {
          lineType: 'attack',
          attacker: faction.id,
          defender: oldOwner,
          troops: committedTroops,
          conquered: true,
          winner: faction.id,
          loser: oldOwner,
        }));
        result = { success: true, conquered: true, region: targetRegion.name, from: fromRegion.name, committedTroops, survivingTroops: survivors, losses, garrisonDefeated: true, message };
      } else {
        const losses = Math.min(committedTroops, Math.floor(committedTroops * (cfg.NEUTRAL_DEFEAT_LOSS_MIN + Math.random() * cfg.NEUTRAL_DEFEAT_LOSS_MAX)));
        fromRegion.troops = Math.max(0, (fromRegion.troops || 0) - losses);
        faction.military.army = Math.max(0, faction.military.army - losses);
        const message = `🛡️ ${faction.name} failed to take ${targetRegion.name}.`;
        this.engine.eventLog.push(this.tacticalLineEvent('battle_result', message, fromRegion, targetRegion, {
          lineType: 'attack',
          attacker: faction.id,
          defender: defenderId,
          troops: committedTroops,
          conquered: false,
          winner: defenderId,
          loser: faction.id,
        }));
        result = { success: false, conquered: false, region: targetRegion.name, from: fromRegion.name, committedTroops, losses, message };
      }
    } else {
      const defenderTroops = targetRegion.troops || 0;
      const defenseStrength = defenderTroops + (targetRegion.garrison || 0) + (targetRegion.fortification || 0) * 25;
      const attPower = committedTroops * attDoctrine.bonuses.attackMultiplier * (0.85 + Math.random() * 0.3);
      const defPower = defenseStrength * (defDoctrine?.bonuses.defenseMultiplier || 1) * (0.9 + Math.random() * 0.3);

      const attackerLosses = Math.min(committedTroops, Math.floor(committedTroops * (cfg.ENEMY_ATTACK_LOSS_MIN + Math.random() * cfg.ENEMY_ATTACK_LOSS_MAX)));
      const defenderLosses = Math.min(defenderTroops, Math.floor(Math.max(1, committedTroops * (cfg.ENEMY_DEFENDER_LOSS_MIN + Math.random() * cfg.ENEMY_DEFENDER_LOSS_MAX))));
      fromRegion.troops = Math.max(0, (fromRegion.troops || 0) - attackerLosses);
      targetRegion.troops = Math.max(0, defenderTroops - defenderLosses);
      faction.military.army = Math.max(0, faction.military.army - attackerLosses);
      targetFaction.military.army = Math.max(0, targetFaction.military.army - defenderLosses);

      const conquered = attPower > defPower;
      if (conquered) {
        const oldOwner = targetRegion.owner;
        const routedDefenders = targetRegion.troops || 0;
        const occupyingTroops = Math.max(1, committedTroops - attackerLosses);
        targetFaction.military.army = Math.max(0, targetFaction.military.army - routedDefenders);
        fromRegion.troops = Math.max(0, (fromRegion.troops || 0) - occupyingTroops);
        targetRegion.owner = faction.id;
        targetRegion.troops = occupyingTroops;
        targetRegion.garrison = 0;
        faction.regions = this.engine.regions.filter(r => r.owner === faction.id).map(r => r.id);
        if (this.engine.factions[oldOwner]) {
          this.engine.factions[oldOwner].regions = this.engine.regions.filter(r => r.owner === oldOwner).map(r => r.id);
        }
      }

      const message = conquered
        ? `⚔️ ${faction.name} captured ${targetRegion.name} from ${targetFaction.name}!`
        : `🛡️ ${targetFaction.name} repelled ${faction.name}'s attack on ${targetRegion.name}!`;
      const battleEvents = [{
        type: 'battle_result',
        message,
        fromRegionId: fromRegion.id,
        toRegionId: targetRegion.id,
        lineType: 'attack',
        troops: committedTroops,
        attacker: faction.id,
        defender: targetFaction.id,
        eventId: `line_${this.engine.turn}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        winner: conquered ? faction.id : targetFaction.id,
        loser: conquered ? targetFaction.id : faction.id,
        conquered,
        factionDestroyed: false,
      }];
      this.engine.processNotifications(battleEvents);
      this.engine.eventLog.push(...battleEvents);

      result = {
        success: true,
        battleResolved: true,
        attacker: faction.id,
        defender: targetFaction.id,
        region: targetRegion.name,
        from: fromRegion.name,
        owner: targetRegion.owner,
        previousOwner: defenderId,
        committedTroops,
        attackerLosses,
        defenderLosses,
        conquered,
        winner: conquered ? faction.id : targetFaction.id,
        loser: conquered ? targetFaction.id : faction.id,
        message,
      };
    }

    // Consume navy for amphibious assault
    if (args._viaSea) {
      const navyUsed = Math.max(1, Math.floor(committedTroops / cfg.TROOPS_PER_NAVY));
      faction.military.navy = Math.max(0, (faction.military.navy || 0) - navyUsed);
      if (result && typeof result === 'object') {
        result.navyUsed = navyUsed;
        result.navyRemaining = faction.military.navy;
        result.amphibious = true;
      }
    }

    if (!faction.relations[defenderId]?.war && targetFaction?.alive) {
      faction.relations[defenderId].war = true;
      targetFaction.relations[faction.id].war = true;
      setEmotion(faction, defenderId, 'hatred', 60);
      setEmotion(targetFaction, faction.id, 'anger', 50);
      this.globalTension += cfg.TENSION_PER_WAR * 0.5;
    }

    return result;
  }

  cmdFortifyRegion(agent, faction, args) {
    const region = this.engine.regions.find(r => r.id === args.regionId || r.name.toLowerCase() === args.regionId?.toLowerCase());
    if (!region) return { error: 'Region not found' };
    if (region.owner !== faction.id) return { error: 'Region not owned by you' };

    const cost = args.level ? args.level * cfg.FORTIFY_COST_PER_LEVEL : cfg.FORTIFY_COST_PER_LEVEL + 20;
    if (faction.economy < cost) return { error: `Need ${cost} economy` };
    faction.economy -= cost;
    region.fortification = (region.fortification || 0) + (args.level || 1);
    region.garrison = (region.garrison || 0) + 20;

    return { success: true, region: region.name, fortification: region.fortification, garrison: region.garrison, cost };
  }

  cmdMoveTroops(agent, faction, args) {
    const from = this.engine.regions.find(r => r.id === args.fromRegionId || r.name.toLowerCase() === args.fromRegionId?.toLowerCase());
    const to = this.engine.regions.find(r => r.id === args.toRegionId || r.name.toLowerCase() === args.toRegionId?.toLowerCase());
    if (!from || !to) return { error: 'Region not found' };
    if (from.owner !== faction.id || to.owner !== faction.id) return { error: 'Both regions must be owned by you' };

    const conn = this.areRegionsConnected(from.id, to.id, faction);
    if (!conn.connected) {
      const fromSeas = SEA_CONNECTIONS[from.id];
      const toSeas = SEA_CONNECTIONS[to.id];
      if (fromSeas && toSeas && fromSeas.some(sz => toSeas.includes(sz)) && (faction.military.navy || 0) <= 0) {
        return { error: conn.error || 'No navy available for sea crossing. Build navy first.' };
      }
      return { error: conn.error || 'Regions are not connected' };
    }

    const count = Math.min(Math.max(1, Math.floor(args.count || from.troops || 0)), from.troops || 0);
    if (count <= 0) return { error: `No troops available in ${from.name}` };

    // Navy cost for sea crossing
    if (conn.viaSea) {
      const navyNeeded = Math.max(1, Math.ceil(count / cfg.TROOPS_PER_NAVY));
      if ((faction.military.navy || 0) < navyNeeded) {
        return { error: `Not enough navy. Need ${navyNeeded} navy to move ${count} troops across sea, have ${faction.military.navy || 0}.` };
      }
      faction.military.navy -= navyNeeded;
    }

    from.troops = Math.max(0, (from.troops || 0) - count);
    to.troops = (to.troops || 0) + count;
    this.engine.eventLog.push(this.tacticalLineEvent(
      'troop_movement',
      `↗ ${faction.name} redeploys ${count} troops from ${from.name} to ${to.name}${conn.viaSea ? ' by sea' : ''}.`,
      from,
      to,
      { lineType: 'movement', troops: count, faction: faction.id, sea: !!conn.viaSea }
    ));
    return {
      success: true,
      moved: count,
      from: from.name,
      to: to.name,
      fromTroops: from.troops,
      toTroops: to.troops,
      totalArmy: faction.military.army,
      navyRemaining: faction.military.navy,
      viaSea: !!conn.viaSea,
    };
  }

  cmdAirstrike(agent, faction, args) {
    const target = this.engine.regions.find(r => r.id === args.regionId || r.name.toLowerCase() === args.regionId?.toLowerCase());
    if (!target) return { error: 'Target region not found' };
    if (faction.military.air < 10) return { error: 'Need at least 10 air force for airstrike' };
    const source = this.engine.regions
      .filter(r => r.owner === faction.id)
      .sort((a, b) => (b.troops || 0) - (a.troops || 0))[0];

    const damage = Math.floor(faction.military.air * 0.2);
    faction.military.air -= Math.floor(faction.military.air * 0.05);
    if (target.garrison) target.garrison = Math.max(0, target.garrison - damage);

    const defender = this.engine.factions[target.owner];
    if (defender && defender.alive && defender.id !== faction.id) {
      const troopDamage = Math.min(target.troops || 0, Math.floor(damage * 0.3));
      target.troops = Math.max(0, (target.troops || 0) - troopDamage);
      defender.military.army = Math.max(0, defender.military.army - troopDamage);
      setEmotion(defender, faction.id, 'anger', Math.min(100, (defender.emotions[faction.id]?.anger || 0) + 20));
      this.engine.eventLog.push(this.tacticalLineEvent(
        'airstrike',
        `💥 ${faction.name} launches airstrike on ${defender.name}'s ${target.name}!`,
        source,
        target,
        { lineType: 'airstrike', damage, troopDamage, attacker: faction.id, defender: defender.id }
      ));
    }

    return { success: true, damage, target: target.name, airRemaining: faction.military.air };
  }

  cmdSetTax(agent, faction, args) {
    const rate = Math.max(0, Math.min(1, args.rate || cfg.TAX_RATE_DEFAULT));
    faction._taxRate = rate;
    return { success: true, taxRate: rate, description: rate > 0.5 ? 'High taxes - more income, less population growth' : rate < 0.2 ? 'Low taxes - less income, happier population' : 'Moderate taxes' };
  }

  cmdInvestIndustry(agent, faction, args) {
    const amount = Math.min(args.amount || 100, faction.economy * 0.5);
    if (faction.economy < amount) return { error: 'Not enough economy' };
    faction.economy -= amount;
    faction._industryLevel = (faction._industryLevel || 0) + 1;
    faction.military.tech = Math.min(1, (faction.military.tech || 0) + 0.05);
    return { success: true, invested: amount, industryLevel: faction._industryLevel, techLevel: Math.round(faction.military.tech * 100) };
  }

  cmdInvestInfra(agent, faction, args) {
    const region = this.engine.regions.find(r => r.id === args.regionId || r.name.toLowerCase() === args.regionId?.toLowerCase());
    if (!region) return { error: 'Region not found' };
    if (region.owner !== faction.id) return { error: 'Region not owned by you' };

    const amount = Math.min(args.amount || 50, faction.economy * 0.3);
    if (faction.economy < amount) return { error: 'Not enough economy' };
    faction.economy -= amount;
    region.infrastructure = (region.infrastructure || 0) + 1;
    region.population = Math.floor((region.population || 0) * 1.05);

    return { success: true, invested: amount, region: region.name, infra: region.infrastructure, population: region.population };
  }

  cmdTrade(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    if (faction.relations[target.id]?.war) return { error: 'Cannot trade with enemy' };

    const resource = args.resource || 'food';
    const amount = Math.min(args.amount || 10, 100);
    const price = Math.floor(amount * cfg.TRADE_PRICE_BASE * (this.marketPrices[resource] || 1));

    if (faction.economy < price) return { error: 'Not enough economy' };
    faction.economy -= price;
    target.economy += price;
    faction.relations[target.id].traded = (faction.relations[target.id].traded || 0) + 1;
    faction.relations[target.id].trust = Math.min(1, faction.relations[target.id].trust + cfg.TRADE_TRUST_GAIN);
    target.relations[faction.id].trust = Math.min(1, target.relations[faction.id].trust + cfg.TRADE_TRUST_GAIN);

    this.engine.eventLog.push({ type: 'trade', message: `📦 Trade: ${faction.name} trades ${amount} ${resource} with ${target.name}` });

    return { success: true, traded: amount, resource, price, with: target.name };
  }

  cmdSanctions(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    if (target.id === faction.id) return { error: 'Cannot sanction yourself' };

    this.sanctions.push({ from: faction.id, target: target.id, turn: this.engine.turn });
    target.economy = Math.max(0, target.economy - 30);
    setEmotion(target, faction.id, 'anger', Math.min(100, (target.emotions[faction.id]?.anger || 0) + 25));
    this.engine.eventLog.push({ type: 'sanctions', message: `🚫 ${faction.name} imposes sanctions on ${target.name}!` });
    this.globalTension += cfg.TENSION_PER_SANCTIONS;

    return { success: true, target: target.name, effect: 'Target economy reduced by 30' };
  }

  cmdSendMessage(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    const message = args.message || '...';

    this.engine.chat.sendMessage(faction.id, target.id, message, args.type || 'chat');
    return { success: true, sent: true, to: target.name, message };
  }

  cmdSubmitChatQuote(agent, faction, args) {
    const quote = (args.quote || '').trim();
    if (!quote) return { error: 'Quote cannot be empty' };
    if (quote.length > 500) return { error: 'Quote too long (max 500 chars)' };

    faction._pendingChatQuote = quote;
    return { success: true, stored: true, quote };
  }

  cmdSendBroadcast(agent, faction, args) {
    const text = (args.message || '').trim();
    if (!text) return { error: 'Message cannot be empty' };
    if (text.length > 1000) return { error: 'Message too long (max 1000 chars)' };

    const msg = this.engine.chat.sendBroadcast(faction.id, text);
    const formatted = `📢 [${faction.name}] ${text}`;

    this.engine.eventLog.push({
      type: 'broadcast',
      message: formatted,
      sender: faction.id,
      broadcast: true,
    });

    // Notify all alive factions
    for (const f of Object.values(this.engine.factions)) {
      if (f.alive && f.id !== faction.id) {
        this.engine.notifications.addNotification(f.id, 'broadcast', formatted);
      }
    }

    return { success: true, broadcast: text, global: true };
  }

  cmdProposeAlliance(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    if (faction.relations[target.id]?.war) return { error: 'Cannot ally while at war' };
    if (faction.relations[target.id]?.alliance) return { error: 'Already allied' };

    faction._pendingAlliance = { targetId: target.id, proposedBy: faction.id };
    const msg = `🤝 ${faction.name} proposes an alliance to ${target.name}. Do you accept? (use respond_alliance tool)`;
    this.engine.chat.sendMessage(faction.id, target.id, msg, 'alliance_offer');
    this.engine.notifications.addNotification(target.id, 'diplomacy', msg);

    return { success: true, proposal: true, to: target.name, message: 'Alliance proposed. Awaiting response.' };
  }

  cmdRespondAlliance(agent, faction, args) {
    if (!args.accept) return { error: 'Specify accept: true or false' };
    const proposer = Object.values(this.agents).find(a => {
      const f = this.engine.factions[a.factionId];
      return f?._pendingAlliance?.targetId === faction.id;
    });

    const pendingFaction = proposer ? this.engine.factions[proposer.factionId] : null;
    if (!pendingFaction || !pendingFaction._pendingAlliance) return { error: 'No pending alliance proposal' };

    if (args.accept) {
      faction.relations[pendingFaction.id].alliance = true;
      pendingFaction.relations[faction.id].alliance = true;
      setEmotion(faction, pendingFaction.id, 'love', 40);
      setEmotion(pendingFaction, faction.id, 'love', 40);
      this.engine.eventLog.push({ type: 'alliance', message: `🤝 ${faction.name} and ${pendingFaction.name} form an ALLIANCE!` });
      delete pendingFaction._pendingAlliance;
      return { success: true, alliance: true, with: pendingFaction.name };
    }
 else {
      const msg = `❌ ${faction.name} rejects the alliance proposal from ${pendingFaction.name}.`;
      this.engine.chat.sendMessage(faction.id, pendingFaction.id, msg, 'diplomacy');
      delete pendingFaction._pendingAlliance;
      return { success: true, alliance: false, message: 'Alliance rejected' };
    }
  }

  cmdBreakAlliance(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    if (!faction.relations[target.id]?.alliance) return { error: 'Not allied with this faction' };

    faction.relations[target.id].alliance = false;
    target.relations[faction.id].alliance = false;
    setEmotion(faction, target.id, 'anger', 40);
    setEmotion(target, faction.id, 'sadness', 50 + Math.random() * 30);
    this.engine.eventLog.push({ type: 'betrayal', message: `💔 ${faction.name} breaks their alliance with ${target.name}!` });
    this.globalTension += cfg.TENSION_PER_BETRAYAL;

    return { success: true, brokeAllianceWith: target.name };
  }

  cmdDeclareWar(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    if (faction.relations[target.id]?.war) return { error: 'Already at war' };

    const reason = args.reason || 'territorial dispute';
    faction.relations[target.id].war = true;
    target.relations[faction.id].war = true;
    if (faction.relations[target.id]?.alliance) faction.relations[target.id].alliance = false;

    // Auto-revoke military access on war declaration
    faction.relations[target.id].militaryAccess = false;
    target.relations[faction.id].militaryAccess = false;
    this.engine.movementQueue.withdrawRemaining(faction.id);

    setEmotion(faction, target.id, 'hatred', 70);
    setEmotion(target, faction.id, 'hatred', 60);
    setEmotion(target, faction.id, 'fear', 30);

    this.engine.eventLog.push({ type: 'war_declaration', message: `⚔️ WAR! ${faction.name} DECLARES WAR on ${target.name}! Reason: ${reason}` });
    const chatMsg = this.engine.chat.generateAIMessage(faction, target, faction.personality, 'war_declaration');
    this.engine.chat.sendMessage(faction.id, target.id, chatMsg, 'war_declaration');
    this.globalTension += cfg.TENSION_PER_WAR;

    for (const a of Object.values(this.agents)) {
      const f = this.engine.factions[a.factionId];
      if (f?.alive && a.factionId !== faction.id && a.factionId !== target.id) {
        this.engine.notifications.addNotification(a.factionId, 'global', `⚔️ ${faction.name} declared war on ${target.name}!`);
      }
    }

    return { success: true, warDeclaredOn: target.name, reason };
  }

  cmdOfferPeace(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    if (!faction.relations[target.id]?.war) return { error: 'Not at war' };

    const terms = args.terms || 'white peace';
    const msg = `🕊️ ${faction.name} offers peace to ${target.name}. Terms: ${terms}`;
    this.engine.chat.sendMessage(faction.id, target.id, msg, 'diplomacy');
    this.engine.notifications.addNotification(target.id, 'diplomacy', msg);

    return { success: true, peaceOffered: true, to: target.name, terms };
  }

  cmdGuarantee(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };

    faction._guarantees = faction._guarantees || [];
    if (faction._guarantees.includes(target.id)) return { error: 'Already guaranteed' };
    faction._guarantees.push(target.id);

    this.engine.eventLog.push({ type: 'guarantee', message: `🛡️ ${faction.name} guarantees the independence of ${target.name}!` });
    return { success: true, guaranteed: target.name };
  }

  cmdSendSpy(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };

    const cost = cfg.SPY_COST;
    if (faction.economy < cost) return { error: 'Not enough economy' };
    faction.economy -= cost;
    faction._spies = faction._spies || {};
    faction._spies[target.id] = { level: (faction._spies[target.id]?.level || 0) + 1, deployed: this.engine.turn };

    return { success: true, spyLevel: faction._spies[target.id].level, target: target.name };
  }

  cmdCounterIntel(agent, faction, args) {
    const cost = cfg.COUNTER_INTEL_COST;
    if (faction.economy < cost) return { error: 'Not enough economy' };
    faction.economy -= cost;
    faction._counterIntel = (faction._counterIntel || 0) + 1;
    return { success: true, counterIntelLevel: faction._counterIntel };
  }

  cmdSabotage(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    if (!faction._spies?.[target.id]) return { error: 'No spy network in target country' };

    const damage = 20 + Math.floor(Math.random() * 30) * (faction._spies[target.id].level);
    target.economy = Math.max(0, target.economy - damage);
    target.military.army = Math.max(0, target.military.army - Math.floor(damage * 0.2));

    this.engine.eventLog.push({ type: 'sabotage', message: `☠️ ${faction.name} sabotages ${target.name}'s infrastructure!` });
    return { success: true, damage, target: target.name };
  }

  cmdStealTech(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    if (!faction._spies?.[target.id]) return { error: 'No spy network in target country' };

    const stolen = Math.min(0.1, target.military.tech * (0.1 + 0.1 * faction._spies[target.id].level));
    target.military.tech = Math.max(0, target.military.tech - stolen);
    faction.military.tech = Math.min(1, (faction.military.tech || 0) + stolen);

    this.engine.eventLog.push({ type: 'tech_steal', message: `🔬 ${faction.name} steals technology from ${target.name}!` });
    return { success: true, techGained: Math.round(stolen * 100), target: target.name };
  }

  cmdNationalFocus(agent, faction, args) {
    const focus = args.focus || 'balanced';
    const valid = ['military', 'economy', 'technology', 'expansion', 'diplomacy', 'balanced'];
    if (!valid.includes(focus)) return { error: `Invalid focus. Valid: ${valid.join(', ')}` };

    faction._nationalFocus = focus;
    return { success: true, focus, bonuses: { military: focus === 'military' ? '20% faster recruitment' : '', economy: focus === 'economy' ? '15% income boost' : '', technology: focus === 'technology' ? 'Tech research speed doubled' : '' } };
  }

  cmdPropaganda(agent, faction, args) {
    const cost = cfg.PROPAGANDA_BASE_COST + (args.intensity || 0) * 10;
    if (faction.economy < cost) return { error: 'Not enough economy' };

    faction.economy -= cost;
    const targetFaction = args.targetFactionId ? this.engine.factions[args.targetFactionId] : null;
    const targetName = args.messageTarget || (targetFaction?.name || 'the world');

    this.engine.eventLog.push({ type: 'propaganda', message: `📢 ${faction.name} launches propaganda campaign targeting ${targetName}!` });

    if (targetFaction?.alive) {
      targetFaction.relations[faction.id].opinion -= 10;
      setEmotion(targetFaction, faction.id, 'disgust', Math.min(100, (targetFaction.emotions[faction.id]?.disgust || 0) + 15));
    }

    return { success: true, campaignTarget: targetName, effect: 'Opinion reduced, global awareness increased' };
  }

  cmdMobilize(agent, faction, args) {
    if (faction._mobilized) return { error: 'Already mobilized' };
    if (faction.economy < 100) return { error: 'Need at least 100 economy to mobilize' };

    faction._mobilized = true;
    const boost = Math.floor(faction.population * 0.1);
    faction.military.army += boost;
    faction.military.air += Math.floor(boost * 0.3);
    this.engine.eventLog.push({ type: 'mobilization', message: `📯 ${faction.name} mobilizes! +${boost} troops!` });

    return { success: true, troopsGained: boost, totalArmy: faction.military.army };
  }

  cmdLaunchRebellion(agent, faction, args) {
    return this.createRebelFaction(args.leaderName || `${faction.name} Rebel`, 'rebel');
  }

  cmdDeclareIndependence(agent, faction, args) {
    if (!faction.rebelFaction) return { error: 'Only rebel factions can declare independence' };
    faction.rebelFaction = false;

    const newName = args.name || `${faction.name} State`;
    faction.name = newName;
    this.engine.eventLog.push({ type: 'independence', message: `🎉 ${newName} declares INDEPENDENCE! A new nation is born!` });

    for (const f of Object.values(this.engine.factions)) {
      if (f.alive && f.id !== faction.id) {
        this.engine.notifications.addNotification(f.id, 'global', `🎉 ${newName} declares independence!`);
      }
    }

    return { success: true, newName, recognized: false, message: 'Independence declared. Seek diplomatic recognition.' };
  }

  cmdRequestRecognition(agent, faction, args) {
    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };

    const rel = target.relations[faction.id];
    if (rel.trust > 0.4 || rel.alliance) {
      target._recognizedFactions = target._recognizedFactions || [];
      target._recognizedFactions.push(faction.id);
      this.engine.eventLog.push({ type: 'recognition', message: `✅ ${target.name} recognizes ${faction.name}!` });
      return { success: true, recognized: true, by: target.name };
    }

    return { success: false, recognized: false, message: `${target.name} refuses recognition` };
  }

  cmdNuclearProgram(agent, faction, args) {
    if (faction._nuclearProgram) return { error: 'Nuclear program already active' };
    const cost = cfg.NUCLEAR_PROGRAM_COST;
    if (faction.economy < cost) return { error: `Need ${cost} economy to start nuclear program` };
    if (faction.military.tech < 0.6) return { error: 'Technology too low (need 0.6+)' };

    faction.economy -= cost;
    faction._nuclearProgram = { progress: 0, started: this.engine.turn };
    this.engine.eventLog.push({ type: 'nuclear', message: `☢️ ${faction.name} starts a NUCLEAR WEAPONS PROGRAM!` });
    this.globalTension += cfg.TENSION_PER_NUCLEAR_PROGRAM;

    for (const f of Object.values(this.engine.factions)) {
      if (f.alive && f.id !== faction.id) {
        this.engine.notifications.addNotification(f.id, 'global', `☢️ ${faction.name} starts a nuclear weapons program!`);
        setEmotion(f, faction.id, 'fear', Math.min(100, (f.emotions[faction.id]?.fear || 0) + 30));
      }
    }

    return { success: true, progress: 0, message: 'Nuclear program initiated. Develops over time.' };
  }

  cmdLaunchNuke(agent, faction, args) {
    if (!faction._nuclearProgram || faction._nuclearProgram.progress < 100) return { error: 'Nuclear program not ready' };
    if (this.nukeCount >= cfg.MAX_NUKE_COUNT) return { error: 'Global nuclear disarmament in effect' };

    const target = this.engine.factions[args.targetFactionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };

    target.military.army = Math.floor(target.military.army * 0.1);
    target.military.air = Math.floor(target.military.air * 0.1);
    target.military.navy = Math.floor(target.military.navy * 0.1);
    target.economy = Math.floor(target.economy * 0.2);
    target.population = Math.floor(target.population * 0.3);
    target._nuked = true;

    this.nukeCount++;
    this.globalTension = Math.min(1, this.globalTension + cfg.TENSION_PER_NUKE_STRIKE);
    this.engine.eventLog.push({ type: 'nuclear_strike', message: `💥☢️ NUCLEAR STRIKE! ${faction.name} NUKES ${target.name}! Global outrage!` });

    for (const f of Object.values(this.engine.factions)) {
      if (f.alive && f.id !== faction.id && f.id !== target.id) {
        setEmotion(f, faction.id, 'hatred', Math.min(100, (f.emotions[faction.id]?.hatred || 0) + 80));
        setEmotion(f, faction.id, 'fear', Math.min(100, (f.emotions[faction.id]?.fear || 0) + 80));
        this.engine.notifications.addNotification(f.id, 'global', `☢️ ${faction.name} NUKED ${target.name}!`);
      }
    }

    return { success: true, target: target.name, devastation: 'Massive', message: 'Nuclear strike successful. The world will never forget this.' };
  }

  processPendingActions() {
    const toRemove = [];
    for (let i = 0; i < this.pendingActions.length; i++) {
      const action = this.pendingActions[i];
      action.ticksRemaining = (action.ticksRemaining || 1) - 1;
      if (action.ticksRemaining <= 0) {
        this.processToolCall(action.agentId, action.toolName, action.args);
        toRemove.push(i);
      }
    }
    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.pendingActions.splice(toRemove[i], 1);
    }
  }

  processSuperEvents() {
    if (Math.random() > 0.1) return;
    const alive = Object.values(this.engine.factions).filter(f => f.alive);
    if (alive.length < 2) return;

    if (Math.random() < 0.4) {
      const dynEvent = getDynamicEvent(this.engine.factions, this.engine.regions);
      if (dynEvent) {
        const msg = dynEvent.event.execute(this.engine, dynEvent.data);
        if (msg) {
          this.engine.eventLog.push({ type: 'random_event', eventId: dynEvent.event.id, message: msg });
          for (const f of Object.values(this.engine.factions)) {
            if (f.alive) {
              this.engine.notifications.addNotification(f.id, 'event', `📰 ${msg}`);
              if (f.memory) f.memory.push({ turn: this.engine.turn, event: dynEvent.event.id, message: msg });
            }
          }
          return;
        }
      }
    }

    const event = getRandomEvent(this.engine.eventLog.filter(e => e.type === 'random_event').map(e => e.eventId));
    if (!event) return;

    const faction = alive[Math.floor(Math.random() * alive.length)];
    const region = faction.regions.length > 0
      ? this.engine.regions.find(r => r.id === faction.regions[Math.floor(Math.random() * faction.regions.length)])
      : this.engine.regions.find(r => r.owner === faction.id);

    if (event.effect.economy) faction.economy += Math.floor(event.effect.economy);
    if (event.effect.population) faction.population += event.effect.population;
    if (event.effect.army) faction.military.army = Math.max(0, faction.military.army + event.effect.army);
    if (event.effect.air) faction.military.air = Math.max(0, faction.military.air + event.effect.air);
    if (event.effect.navy) faction.military.navy = Math.max(0, faction.military.navy + event.effect.navy);

    const msg = event.message
      .replace(/{faction}/g, faction.name)
      .replace(/{region}/g, region?.name || 'Unknown');

    this.engine.eventLog.push({ type: 'random_event', eventId: event.id, message: msg });
    faction.memory.push({ turn: this.engine.turn, event: event.id, message: msg });

    for (const f of Object.values(this.engine.factions)) {
      if (f.alive) {
        this.engine.notifications.addNotification(f.id, 'event', `📰 ${msg}`);
      }
    }
  }

  processNuclearProgress() {
    for (const f of Object.values(this.engine.factions)) {
      if (f._nuclearProgram && f._nuclearProgram.progress < 100) {
        const progress = 2 + Math.floor(Math.random() * 5) * (f.military.tech || 0.5);
        f._nuclearProgram.progress = Math.min(100, f._nuclearProgram.progress + progress);
        if (f._nuclearProgram.progress >= 100) {
          this.engine.eventLog.push({ type: 'nuclear', message: `☢️ ${f.name} has COMPLETED their nuclear weapons program!` });
          for (const f2 of Object.values(this.engine.factions)) {
            if (f2.alive && f2.id !== f.id) {
              setEmotion(f2, f.id, 'fear', Math.min(100, (f2.emotions[f.id]?.fear || 0) + 50));
            }
          }
        }
      }
    }
  }

  processEconomyBonuses() {
    for (const faction of Object.values(this.engine.factions)) {
      if (!faction.alive) continue;
      if (faction._taxRate !== undefined) {
        const bonus = faction._taxRate * 0.5 - 0.1;
        faction.economy += Math.floor(bonus * (faction.regions.length || 1) * 5);
      }
      if (faction._nationalFocus === 'economy') {
        faction.economy += Math.floor(faction.economy * 0.05);
      }
      if (faction._industryLevel) {
        faction.economy += faction._industryLevel * 3;
      }
    }
  }

  cleanup() {
    for (const agentId of Object.keys(this.agents)) {
      const agent = this.agents[agentId];
      if (!agent.connected) {
        const faction = this.engine.factions[agent.factionId];
        if (faction && faction.alive) {
          faction.alive = false;
        }
        delete this.agents[agentId];
      }
    }
    if (this.actionLog.length > 500) {
      this.actionLog = this.actionLog.slice(-400);
    }
  }

  cmdDeployTroops(agent, faction, args) {
    const fromRegions = Array.isArray(args.fromRegions) ? args.fromRegions : [args.fromRegionId || args.fromRegions];
    const toRegions = Array.isArray(args.toRegions) ? args.toRegions : [args.toRegionId || args.toRegions];
    const totalCount = args.count || args.amount;

    if (!fromRegions.length || !toRegions.length) return { error: 'Need fromRegions and toRegions' };

    const fromList = fromRegions.map(r => this.engine.regions.find(x => x.id === r || x.name.toLowerCase() === r?.toLowerCase())).filter(Boolean);
    const toList = toRegions.map(r => this.engine.regions.find(x => x.id === r || x.name.toLowerCase() === r?.toLowerCase())).filter(Boolean);

    if (!fromList.length) return { error: 'No valid source regions found' };
    if (!toList.length) return { error: 'No valid target regions found' };
    if (fromList.some(r => r.owner !== faction.id)) return { error: 'All source regions must be owned by you' };

    const available = fromList.reduce((sum, r) => sum + (r.troops || 0), 0);
    const totalToMove = totalCount ? Math.min(totalCount, available) : available;
    if (totalToMove <= 0) return { error: 'No troops available in source regions' };

    const perTarget = Math.floor(totalToMove / toList.length);
    if (perTarget <= 0) return { error: `Too few troops per target (${perTarget}). Reduce target count or increase troops.` };

    let orders = [];
    let remaining = totalToMove;
    let totalDeployed = 0;

    for (const to of toList) {
      const amt = to === toList[toList.length - 1] ? remaining : perTarget;
      if (amt <= 0) break;

      let need = amt;
      for (const from of fromList) {
        if (need <= 0) break;
        const take = Math.min(need, from.troops || 0);
        if (take <= 0) continue;

        const result = this.engine.movementQueue.addOrder(faction.id, from.id, to.id, take);
        if (result.error) continue;

        orders.push({ ...result, amount: take, from: from.id, to: to.id });
        totalDeployed += take;
        need -= take;
        remaining -= take;
      }
    }

    return {
      success: totalDeployed > 0,
      deployed: totalDeployed,
      orders,
      from: fromList.map(r => r.name),
      to: toList.map(r => r.name),
      pathCount: orders.length,
      note: 'Troops will move automatically each turn via the shortest path.',
    };
  }

  cmdGetMovementOrders(agent, faction, args) {
    const mq = this.engine.movementQueue;
    if (args?.orderId) {
      const order = mq.orders.find(o => o.id === args.orderId && o.factionId === faction.id);
      return order ? { order } : { error: 'Order not found' };
    }
    return { orders: mq.getOrders(faction.id) };
  }

  cmdGrantAccess(agent, faction, args) {
    const target = this.engine.factions[args.factionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };
    if (target.id === faction.id) return { error: 'Cannot grant access to yourself' };

    const rel = faction.relations[target.id];
    if (!rel) return { error: 'No relation with this faction' };
    if (rel.war) return { error: 'Cannot grant military access while at war' };
    if (!rel.alliance) return { error: 'Must be allied to grant military access' };

    rel.militaryAccess = true;
    target.relations[faction.id].militaryAccess = true;

    this.engine.eventLog.push({
      type: 'military_access',
      message: `🪖 ${faction.name} grants military access to ${target.name}.`,
      grantor: faction.id,
      grantee: target.id,
      mutual: true,
    });

    return { success: true, faction: target.name, granted: true, mutual: true };
  }

  cmdRevokeAccess(agent, faction, args) {
    const target = this.engine.factions[args.factionId];
    if (!target || !target.alive) return { error: 'Target faction not found' };

    const rel = faction.relations[target.id];
    if (!rel || !rel.militaryAccess) return { error: 'No military access to revoke' };

    rel.militaryAccess = false;
    target.relations[faction.id].militaryAccess = false;

    this.engine.movementQueue.withdrawRemaining(faction.id);

    this.engine.eventLog.push({
      type: 'military_access_revoked',
      message: `🚫 ${faction.name} revokes military access from ${target.name}.`,
      grantor: faction.id,
      grantee: target.id,
    });

    return { success: true, faction: target.name, revoked: true };
  }
}

module.exports = { GameController };
