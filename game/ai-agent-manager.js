const TOOL_WEIGHTS = {
  get_world_state: 20, get_faction_info: 15, get_region_info: 10,
  get_military_intel: 15, get_diplomatic_overview: 10, get_events_feed: 8,
  get_connected_agents: 5,
  recruit_troops: 20, build_aircraft: 12, build_naval: 5,
  attack_region: 25, fortify_region: 12, move_troops: 5, launch_airstrike: 8,
  set_tax_rate: 5, invest_in_industry: 10, invest_infrastructure: 8,
  trade_resources: 8, impose_sanctions: 10,
  send_message: 15, propose_alliance: 12, respond_alliance: 8,
  break_alliance: 5, declare_war: 15, offer_peace: 5, guarantee_independence: 5,
  send_spy: 10, counter_intel: 5, sabotage: 8, steal_technology: 8,
  set_national_focus: 10, propaganda: 10, mobilize: 5,
  launch_rebellion: 2, declare_independence: 3, request_recognition: 3,
  develop_nuclear: 5, launch_nuke: 1,
};

class AIAgentManager {
  constructor(gameController) {
    this.gc = gameController;
    this.tickInterval = null;
    this.agentStates = {};
    this.aiTimer = 0;
  }

  start(intervalMs = 500) {
    this.tickInterval = setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = null;
  }

  tick() {
    this.aiTimer++;
    const agents = Object.values(this.gc.agents).filter(a => a.connected && a.type === 'builtin');

    for (const agent of agents) {
      try {
        this.processAgent(agent);
      } catch (err) {
        console.error(`AI agent ${agent.name} error:`, err.message);
      }
    }
  }

  processAgent(agent) {
    const faction = this.gc.engine.factions[agent.factionId];
    if (!faction || !faction.alive) return;

    const state = this.agentStates[agent.agentId] || { cooldown: 0, focus: null, lastAction: 0 };
    this.agentStates[agent.agentId] = state;
    state.lastAction = this.gc.engine.turn;

    const personality = faction.personality;
    const allTools = Object.entries(TOOL_WEIGHTS);
    const roll = Math.random();

    const enemies = Object.entries(faction.relations).filter(([, r]) => r.war).map(([id]) => this.gc.engine.factions[id]).filter(Boolean);
    const neutrals = Object.entries(faction.relations).filter(([, r]) => !r.war && !r.alliance).map(([id]) => this.gc.engine.factions[id]).filter(Boolean);
    const allies = Object.entries(faction.relations).filter(([, r]) => r.alliance).map(([id]) => this.gc.engine.factions[id]).filter(Boolean);
    const aliveOthers = Object.values(this.gc.engine.factions).filter(f => f.alive && f.id !== agent.factionId);

    if (aliveOthers.length === 0) return;

    if (!state.focus || Math.random() < 0.05) {
      const foci = ['military', 'economy', 'expansion', 'diplomacy', 'tech', 'espionage'];
      const weights = [
        personality.aggression * 2,
        personality.greed,
        personality.expansionism * 2,
        personality.diplomacy * 1.5,
        (1 - personality.greed) + 0.5,
        personality.cunning * 1.5,
      ];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * totalWeight;
      for (let i = 0; i < foci.length; i++) {
        r -= weights[i];
        if (r <= 0) { state.focus = foci[i]; break; }
      }
    }

    if (enemies.length > 0) {
      const enemyRegions = this.gc.engine.regions.filter(r =>
        enemies.some(e => e.id === r.owner)
      );
      if (roll < 0.35) {
        const enemy = enemies[Math.floor(Math.random() * enemies.length)];
        const er = this.gc.engine.regions.filter(r => r.owner === enemy.id);
        const targets = this.gc.engine.regions.filter(r =>
          r.owner === faction.id &&
          r.neighbors.some(n => er.some(x => x.id === n))
        );
        if (targets.length > 0 && er.length > 0) {
          const from = targets[Math.floor(Math.random() * targets.length)];
          const to = er[Math.floor(Math.random() * er.length)];
          this.cmd(agent, 'attack_region', { regionId: to.id, fromRegionId: from.id });
          return;
        }
      }
      if (roll < 0.55 && faction.military.army < 500) {
        this.cmd(agent, 'recruit_troops', { count: 50 + Math.floor(Math.random() * 150) });
        return;
      }
      if (roll < 0.65 && faction.military.air < 100) {
        this.cmd(agent, 'build_aircraft', { count: 10 + Math.floor(Math.random() * 30) });
        return;
      }
      if (roll < 0.7) {
        this.cmd(agent, 'launch_airstrike', {
          regionId: enemyRegions[Math.floor(Math.random() * enemyRegions.length)]?.id,
        });
        return;
      }
    }

    if (enemies.length === 0 && personality.aggression > 0.5) {
      const power = faction.getTotalMilitaryPower();
      const potential = neutrals.filter(n => n.alive && power > n.getTotalMilitaryPower() * 1.3 && !faction.relations[n.id]?.alliance);
      if (potential.length > 0 && Math.random() < personality.aggression * 0.15) {
        const target = potential.reduce((a, b) => faction.relations[a.id]?.opinion < faction.relations[b.id]?.opinion ? a : b);
        this.cmd(agent, 'declare_war', { targetFactionId: target.id, reason: 'territorial dispute' });
        return;
      }
    }

    if (personality.cunning > 0.5 && Math.random() < 0.08) {
      const spyTargets = aliveOthers.filter(f => f.id !== agent.factionId && !faction._spies?.[f.id]);
      if (spyTargets.length > 0) {
        const target = spyTargets[Math.floor(Math.random() * spyTargets.length)];
        if (faction.economy > 50) {
          this.cmd(agent, 'send_spy', { targetFactionId: target.id });
          return;
        }
      }
    }

    if (allies.length > 0 && personality.cunning > 0.6 && Math.random() < 0.02) {
      const ally = allies[Math.floor(Math.random() * allies.length)];
      if (faction.relations[ally.id]?.trust < 0.3) {
        this.cmd(agent, 'break_alliance', { targetFactionId: ally.id });
        return;
      }
    }

    if (allies.length === 0 && neutrals.length > 0 && personality.diplomacy > 0.4 && Math.random() < 0.1) {
      const sharedEnemies = neutrals.filter(n =>
        enemies.some(e => n.relations[e.id]?.war)
      );
      const bestAlly = sharedEnemies.length > 0
        ? sharedEnemies[Math.floor(Math.random() * sharedEnemies.length)]
        : neutrals[Math.floor(Math.random() * neutrals.length)];
      if (bestAlly && !faction.relations[bestAlly.id]?.alliance && !faction.relations[bestAlly.id]?.war) {
        this.cmd(agent, 'propose_alliance', { targetFactionId: bestAlly.id });
        return;
      }
    }

    if (faction.economy < 100 && Math.random() < 0.3) {
      this.cmd(agent, 'set_tax_rate', { rate: 0.4 + Math.random() * 0.3 });
      return;
    }

    if (faction._nationalFocus !== state.focus && Math.random() < 0.2) {
      this.cmd(agent, 'set_national_focus', { focus: state.focus || 'balanced' });
      return;
    }

    if (Math.random() < 0.1 && faction.military.tech < 0.6 && faction.economy > 100) {
      this.cmd(agent, 'invest_in_industry', { amount: Math.min(100, Math.floor(faction.economy * 0.3)) });
      return;
    }

    if (Math.random() < 0.15 && !faction._nuclearProgram && faction.military.tech >= 0.6 && faction.economy > 300) {
      this.cmd(agent, 'develop_nuclear', {});
      return;
    }

    if (Math.random() < 0.02 && faction._nuclearProgram?.progress >= 100 && enemies.length > 0) {
      const enemy = enemies[Math.floor(Math.random() * enemies.length)];
      this.cmd(agent, 'launch_nuke', { targetFactionId: enemy.id });
      return;
    }

    if (personality.diplomacy > 0.5 && neutrals.length > 0 && Math.random() < 0.05) {
      const tradeTarget = neutrals.sort((a, b) =>
        (faction.relations[b.id]?.trust || 0) - (faction.relations[a.id]?.trust || 0)
      )[0];
      if (tradeTarget && faction.economy > 50) {
        this.cmd(agent, 'trade_resources', {
          targetFactionId: tradeTarget.id,
          resource: ['food', 'oil', 'minerals'][Math.floor(Math.random() * 3)],
          amount: 10 + Math.floor(Math.random() * 20),
        });
        return;
      }
    }

    if (faction.economy > 200 && enemies.length > 0 && Math.random() < 0.05) {
      const enemy = enemies[Math.floor(Math.random() * enemies.length)];
      this.cmd(agent, 'impose_sanctions', { targetFactionId: enemy.id });
      return;
    }

    if (personality.paranoia > 0.6 && Math.random() < 0.05) {
      this.cmd(agent, 'counter_intel', {});
      return;
    }

    if (faction.military.tech > 0.5 && enemies.length > 0 && faction._spies && Math.random() < 0.05) {
      const enemyWithSpy = enemies.find(e => faction._spies[e.id]);
      if (enemyWithSpy) {
        this.cmd(agent, 'sabotage', { targetFactionId: enemyWithSpy.id });
        return;
      }
    }

    if (aliveOthers.length > 0 && Math.random() < 0.01) {
      const target = aliveOthers[Math.floor(Math.random() * aliveOthers.length)];
      const msg = `The ${faction.name} government issues a statement regarding ${target.name}...`;
      this.cmd(agent, 'send_message', {
        targetFactionId: target.id, message: msg, type: 'chat',
      });
    }

    if (faction.regions.length > 0 && Math.random() < 0.05) {
      const region = this.gc.engine.regions.find(r => r.owner === faction.id && (!r.fortification || r.fortification < 3));
      if (region) {
        this.cmd(agent, 'fortify_region', { regionId: region.id, level: 1 });
        return;
      }
    }

    if (faction.economy > 50 && Math.random() < 0.1) {
      const region = faction.regions.length > 0
        ? this.gc.engine.regions.find(r => r.id === faction.regions[Math.floor(Math.random() * faction.regions.length)])
        : null;
      if (region) {
        this.cmd(agent, 'invest_infrastructure', { regionId: region.id, amount: Math.min(50, Math.floor(faction.economy * 0.2)) });
        return;
      }
    }

    if (enemies.length === 0 && Math.random() < 0.02) {
      const weakest = neutrals.filter(n => faction.getTotalMilitaryPower() > n.getTotalMilitaryPower() * 0.8);
      if (weakest.length > 0) {
        const target = weakest.sort((a, b) => a.getTotalMilitaryPower() - b.getTotalMilitaryPower())[0];
        this.cmd(agent, 'attack_region', {
          regionId: this.gc.engine.regions.find(r => r.owner === target.id)?.id,
        });
        return;
      }
    }
  }

  cmd(agent, toolName, args) {
    const result = this.gc.processToolCall(agent.agentId, toolName, args);
    return result;
  }

  cleanup() {
    this.agentStates = {};
  }
}

module.exports = { AIAgentManager };
