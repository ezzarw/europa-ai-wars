const { getDominantEmotion, getEmotionDescription, setEmotion } = require('./diplomacy');

function processAI(factions, regions, events, logs) {
  const factionList = Object.values(factions).filter(f => f.alive);

  for (const faction of factionList) {
    if (!faction.alive) continue;

    const personality = faction.personality;
    const enemies = factionList.filter(f =>
      f.id !== faction.id && f.alive && faction.relations[f.id]?.war
    );
    const neutrals = factionList.filter(f =>
      f.id !== faction.id && f.alive && !faction.relations[f.id]?.war && !faction.relations[f.id]?.alliance
    );
    const allies = factionList.filter(f =>
      f.id !== faction.id && f.alive && faction.relations[f.id]?.alliance
    );

    const power = faction.getTotalMilitaryPower();

    evaluateDiplomacy(faction, enemies, neutrals, allies, factions, personality, events, logs);

    evaluateWar(faction, enemies, neutrals, factions, regions, personality, events, logs);

    evaluateEconomy(faction, factions, personality, events, logs);

    evaluateAlliances(faction, neutrals, enemies, factions, personality, events, logs);

    evaluateBetrayal(faction, allies, enemies, factions, personality, events, logs);
  }
}

function evaluateDiplomacy(faction, enemies, neutrals, allies, factions, personality, events, logs) {
  for (const neutral of neutrals) {
    if (!neutral.alive) continue;
    const rel = faction.relations[neutral.id];
    if (!rel) continue;

    if (rel.trust > 0.6 && rel.opinion > 40 && !rel.war && !rel.alliance && Math.random() < 0.08) {
      const sharedEnemy = enemies.some(e => neutral.relations[e.id]?.war);
      if (sharedEnemy || Math.random() < 0.5) {
        rel.alliance = true;
        neutral.relations[faction.id].alliance = true;
        setEmotion(faction, neutral.id, 'love', Math.min(100, (faction.emotions[neutral.id]?.love || 0) + 20));
        setEmotion(neutral, faction.id, 'love', Math.min(100, (neutral.emotions[faction.id]?.love || 0) + 20));
        const allianceName = `${faction.name}-${neutral.name} Alliance`;
        events.push({
          type: 'alliance',
          message: `🤝 ${allianceName} FORMED! ${faction.name} and ${neutral.name} are now allies!`,
          alliance: [faction.id, neutral.id],
        });
        logs.push(`[ALLIANCE] ${faction.name} allied with ${neutral.name}`);
      }
    }

    if (rel.trust < 0.2 && rel.opinion < -30 && !rel.war && Math.random() < 0.05 && faction.alive) {
      rel.war = true;
      neutral.relations[faction.id].war = true;
      setEmotion(faction, neutral.id, 'hatred', Math.min(100, (faction.emotions[neutral.id]?.hatred || 0) + 40));
      setEmotion(neutral, faction.id, 'hatred', Math.min(100, (neutral.emotions[faction.id]?.hatred || 0) + 40));
      events.push({
        type: 'war_declaration',
        message: `⚔️ WAR! ${faction.name} DECLARES WAR on ${neutral.name}!`,
        attacker: faction.id,
        defender: neutral.id,
      });
      logs.push(`[WAR] ${faction.name} declared war on ${neutral.name}`);
    }
  }
}

function evaluateWar(faction, enemies, neutrals, factions, regions, personality, events, logs) {
  if (enemies.length === 0) {
    if (personality.aggression > 0.6 && Math.random() < personality.aggression * 0.05 && neutrals.length > 0) {
      const target = neutrals.sort((a, b) => {
        const aRel = faction.relations[a.id]?.opinion || 0;
        const bRel = faction.relations[b.id]?.opinion || 0;
        return aRel - bRel;
      })[0];
      if (target && faction.getTotalMilitaryPower() > target.getTotalMilitaryPower() * 1.2) {
        faction.relations[target.id].war = true;
        target.relations[faction.id].war = true;
        setEmotion(faction, target.id, 'anger', Math.min(100, (faction.emotions[target.id]?.anger || 0) + 40));
        setEmotion(target, faction.id, 'fear', Math.min(100, (target.emotions[faction.id]?.fear || 0) + 50));
        events.push({
          type: 'war_declaration',
          message: `⚔️ ${faction.name} DECLARES WAR on ${target.name}!`,
          attacker: faction.id,
          defender: target.id,
        });
        logs.push(`[WAR] ${faction.name} declared war on ${target.name} (aggression)`);
        enemies.push(target);
      }
    }
  }

  if (enemies.length > 0 && Math.random() < 0.4) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const enemyRegions = regions.filter(r => r.owner === enemy.id);
      if (enemyRegions.length === 0) continue;

      const neighboringRegions = regions.filter(r =>
        r.owner === faction.id &&
        r.neighbors.some(n => enemyRegions.some(er => er.id === n))
      );

      if (neighboringRegions.length > 0) {
        const targetRegion = enemyRegions[Math.floor(Math.random() * enemyRegions.length)];
        const attRegion = neighboringRegions[Math.floor(Math.random() * neighboringRegions.length)];

        events.push({
          type: 'battle',
          attacker: faction.id,
          defender: enemy.id,
          attRegion: attRegion.id,
          defRegion: targetRegion.id,
          message: `⚡ BATTLE: ${faction.name} attacks ${enemy.name} in ${targetRegion.name}!`,
        });
        logs.push(`[BATTLE] ${faction.name} attacks ${enemy.name} at ${targetRegion.name}`);
      }
    }
  }
}

function evaluateEconomy(faction, factions, personality, events, logs) {
  if (faction.economy < 100 && Math.random() < 0.1) {
    const richFactions = Object.values(factions).filter(f =>
      f.alive && f.id !== faction.id && f.economy > 300 && !faction.relations[f.id]?.war
    );
    if (richFactions.length > 0 && personality.greed > 0.5) {
      const target = richFactions[Math.floor(Math.random() * richFactions.length)];
      events.push({
        type: 'economic_rivalry',
        message: `💰 ${faction.name} eyes ${target.name}'s wealth with ENVY!`,
      });
      logs.push(`[ECONOMY] ${faction.name} envies ${target.name}'s economy`);
      setEmotion(faction, target.id, 'greed', Math.min(100, (faction.emotions[target.id]?.greed || 0) + 10));
    }
  }
}

function evaluateAlliances(faction, neutrals, enemies, factions, personality, events, logs) {
  if (enemies.length > 0 && faction.getTotalMilitaryPower() < enemies.reduce((sum, e) => sum + e.getTotalMilitaryPower(), 0) * 0.8) {
    for (const neutral of neutrals) {
      if (!neutral.alive) continue;
      const rel = faction.relations[neutral.id];
      if (!rel) continue;

      if (!rel.alliance && !rel.war && rel.trust > 0.4 && Math.random() < 0.1) {
        rel.alliance = true;
        neutral.relations[faction.id].alliance = true;
        setEmotion(faction, neutral.id, 'pride', Math.min(100, (faction.emotions[neutral.id]?.pride || 0) + 15));
        events.push({
          type: 'alliance',
          message: `🤝 ${faction.name} and ${neutral.name} form a DEFENSIVE ALLIANCE!`,
          alliance: [faction.id, neutral.id],
        });
        logs.push(`[ALLIANCE] ${faction.name} allied with ${neutral.name} (defensive)`);
      }
    }
  }
}

function evaluateBetrayal(faction, allies, enemies, factions, personality, events, logs) {
  for (const ally of allies) {
    if (!ally.alive) continue;
    const rel = faction.relations[ally.id];
    if (!rel) continue;

    if (personality.cunning > 0.6 && personality.aggression > 0.5 && rel.trust < 0.3 && Math.random() < 0.03) {
      rel.alliance = false;
      ally.relations[faction.id].alliance = false;
      rel.war = true;
      ally.relations[faction.id].war = true;
      setEmotion(faction, ally.id, 'hatred', Math.min(100, (faction.emotions[ally.id]?.hatred || 0) + 60));
      setEmotion(ally, faction.id, 'disgust', Math.min(100, (ally.emotions[faction.id]?.disgust || 0) + 80));
      setEmotion(ally, faction.id, 'sadness', Math.min(100, (ally.emotions[faction.id]?.sadness || 0) + 50));
      events.push({
        type: 'betrayal',
        message: `🔪 ${faction.name} breaks alliance with ${ally.name}!`,
        traitor: faction.id,
        victim: ally.id,
      });
      logs.push(`[BETRAYAL] ${faction.name} betrayed ${ally.name}!`);
    }
  }
}

module.exports = { processAI };
