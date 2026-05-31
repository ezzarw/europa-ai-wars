const RANDOM_EVENTS = [
  {
    id: 'natural_disaster',
    name: 'Natural Disaster',
    description: 'A devastating earthquake has struck {region}!',
    chance: 0.03,
    effect: { economy: -30, population: -15 },
    message: '🌊 Natural Disaster! {faction} suffered from an earthquake in {region}!',
  },
  {
    id: 'economic_boom',
    name: 'Economic Boom',
    description: 'The economy of {region} is booming!',
    chance: 0.04,
    effect: { economy: 40 },
    message: '💰 Economic Boom! {faction}\'s {region} is experiencing rapid growth!',
  },
  {
    id: 'plague',
    name: 'Plague',
    description: 'A deadly plague spreads through {region}!',
    chance: 0.025,
    effect: { population: -25, economy: -20 },
    message: '☠️ Plague! Disease spreads through {faction}\'s {region}!',
  },
  {
    id: 'military_innovation',
    name: 'Military Innovation',
    description: 'New military technology discovered in {region}!',
    chance: 0.035,
    effect: { army: 30, air: 20, navy: 15 },
    message: '⚔️ Military Innovation! {faction} developed new weapons in {region}!',
  },
  {
    id: 'rebellion',
    name: 'Rebellion',
    description: 'Rebellion breaks out in {region}!',
    chance: 0.03,
    effect: { army: -20, economy: -15 },
    message: '🔥 Rebellion! {faction} faces uprising in {region}!',
  },
  {
    id: 'gold_rush',
    name: 'Gold Rush',
    description: 'Gold discovered in {region}!',
    chance: 0.02,
    effect: { economy: 60 },
    message: '⛏️ Gold Rush! Precious minerals found in {faction}\'s {region}!',
  },
  {
    id: 'cultural_renaissance',
    name: 'Cultural Renaissance',
    description: 'A cultural renaissance is blooming in {region}!',
    chance: 0.025,
    effect: { economy: 20, population: 10 },
    message: '🎭 Cultural Renaissance! Arts and culture flourish in {faction}\'s {region}!',
  },
  {
    id: 'foreign_volunteers',
    name: 'Foreign Volunteers',
    description: 'Foreign fighters flock to {faction}\'s banner in {region}!',
    chance: 0.02,
    effect: { army: 40 },
    message: '🏴 Foreign Volunteers! International fighters join {faction} in {region}!',
  },
  {
    id: 'trade_disruption',
    name: 'Trade Disruption',
    description: 'Trade routes through {region} have been disrupted!',
    chance: 0.03,
    effect: { economy: -25 },
    message: '🚢 Trade Disruption! {faction}\'s trade in {region} has been hindered!',
  },
  {
    id: 'assassination_attempt',
    name: 'Assassination Attempt',
    description: 'An assassination attempt on {faction}\'s leader!',
    chance: 0.015,
    effect: { army: -15, economy: -10 },
    message: '🗡️ Assassination Attempt! Someone tried to kill {faction}\'s leader!',
  },
  {
    id: 'great_famine',
    name: 'Great Famine',
    description: 'Crops fail across {region}, causing widespread famine!',
    chance: 0.02,
    effect: { population: -30, economy: -25 },
    message: '🌾 Great Famine! Starvation grips {faction}\'s {region}!',
  },
  {
    id: 'military_parade',
    name: 'Military Parade',
    description: '{faction} holds a massive military parade, boosting morale!',
    chance: 0.025,
    effect: { army: 20, economy: -5 },
    message: '🎪 Military Parade! {faction} shows off its military might!',
  },
  {
    id: 'spy_ring',
    name: 'Spy Ring Discovered',
    description: 'A spy ring has been uncovered in {region}!',
    chance: 0.02,
    effect: { army: -10, economy: -10 },
    message: '🕵️ Spy Ring! {faction} uncovered spies in {region}!',
  },
  {
    id: 'royal_marriage',
    name: 'Royal Marriage',
    description: 'A strategic marriage alliance strengthens {faction}!',
    chance: 0.015,
    effect: { economy: 15, population: 5 },
    message: '💍 Royal Marriage! {faction} forged a new alliance through marriage!',
  },
  {
    id: 'industrial_revolution',
    name: 'Industrial Breakthrough',
    description: 'Factories in {region} are running at full capacity!',
    chance: 0.02,
    effect: { economy: 50, army: 15 },
    message: '🏭 Industrial Breakthrough! Production soars in {faction}\'s {region}!',
  },
  {
    id: 'massive_flood',
    name: 'Massive Flood',
    description: 'Catastrophic floods devastate {region}!',
    chance: 0.02,
    effect: { population: -20, economy: -30, army: -10 },
    message: '🌊 Massive Flood! {faction}\'s {region} is underwater!',
  },
  {
    id: 'technological_leap',
    name: 'Technological Leap',
    description: '{faction} scientists make a groundbreaking discovery!',
    chance: 0.02,
    effect: { economy: 35, army: 25, air: 20 },
    message: '🔬 Technological Leap! {faction} advances in all fields!',
  },
  {
    id: 'terrorist_attack',
    name: 'Terrorist Attack',
    description: 'Terrorists strike {region}, causing chaos!',
    chance: 0.02,
    effect: { population: -10, economy: -15, army: -10 },
    message: '💥 Terrorist Attack! {faction}\'s {region} hit by terrorism!',
  },
  {
    id: 'olympic_games',
    name: 'Olympic Games',
    description: '{faction} hosts the Olympic Games in {region}!',
    chance: 0.01,
    effect: { economy: 25, population: 5 },
    message: '🏅 Olympic Games! {faction} hosts the games in {region}!',
  },
  {
    id: 'diplomatic_scandal',
    name: 'Diplomatic Scandal',
    description: 'A diplomatic scandal rocks {faction}\'s government!',
    chance: 0.02,
    effect: { economy: -15, army: -5 },
    message: '📰 Diplomatic Scandal! {faction}\'s government in turmoil!',
  },
  {
    id: 'refugee_crisis',
    name: 'Refugee Crisis',
    description: 'Refugees flood into {region} from war-torn areas!',
    chance: 0.025,
    effect: { population: 20, economy: -15 },
    message: '🚶 Refugee Crisis! Thousands flee to {faction}\'s {region}!',
  },
  {
    id: 'military_coup',
    name: 'Military Coup',
    description: 'The military seizes power in {faction}!',
    chance: 0.015,
    effect: { army: 30, economy: -20, population: -5 },
    message: '🎖️ Military Coup! The army takes control of {faction}!',
  },
  {
    id: 'volcanic_eruption',
    name: 'Volcanic Eruption',
    description: 'A volcano erupts near {region}!',
    chance: 0.01,
    effect: { population: -15, economy: -20 },
    message: '🌋 Volcanic Eruption! {faction}\'s {region} covered in ash!',
  },
  {
    id: 'baby_boom',
    name: 'Baby Boom',
    description: 'A baby boom brings new hope to {region}!',
    chance: 0.02,
    effect: { population: 25 },
    message: '👶 Baby Boom! Population surges in {faction}\'s {region}!',
  },
  {
    id: 'cyber_attack',
    name: 'Cyber Attack',
    description: '{faction}\'s infrastructure hit by massive cyber attack!',
    chance: 0.02,
    effect: { economy: -20, army: -10 },
    message: '💻 Cyber Attack! {faction}\'s networks compromised!',
  },
  {
    id: 'trade_agreement',
    name: 'Trade Agreement',
    description: '{faction} signs a lucrative trade agreement!',
    chance: 0.03,
    effect: { economy: 30 },
    message: '📝 Trade Agreement! {faction} secures new trade deals!',
  },
  {
    id: 'plague_rats',
    name: 'Plague of Rats',
    description: 'Rats infest {region}, spreading disease!',
    chance: 0.015,
    effect: { population: -10, economy: -10 },
    message: '🐀 Plague of Rats! {faction}\'s {region} infested!',
  },
  {
    id: 'heroic_general',
    name: 'Heroic General',
    description: 'A legendary general rises in {faction}!',
    chance: 0.02,
    effect: { army: 40, morale: 20 },
    message: '⭐ Heroic General! A military genius emerges in {faction}!',
  },
  {
    id: 'economic_sanctions',
    name: 'Economic Sanctions',
    description: 'International sanctions imposed on {faction}!',
    chance: 0.02,
    effect: { economy: -30 },
    message: '🚫 Economic Sanctions! {faction} cut off from world markets!',
  },
  {
    id: 'genius_inventor',
    name: 'Genius Inventor',
    description: 'A brilliant inventor emerges from {region}!',
    chance: 0.015,
    effect: { economy: 30, tech: 20 },
    message: '💡 Genius Inventor! A new invention changes everything for {faction}!',
  },
];

const DYNAMIC_EVENTS = [
  {
    id: 'proxy_war',
    name: 'Proxy War',
    description: '{faction1} and {faction2} begin fighting a proxy war in {region}!',
    condition: (factions, regions) => {
      const alive = Object.values(factions).filter(f => f.alive);
      const atWar = alive.filter(f => Object.values(f.relations).some(r => r.war));
      if (atWar.length < 2) return false;
      const f1 = atWar[Math.floor(Math.random() * atWar.length)];
      const enemies = Object.entries(f1.relations).filter(([, r]) => r.war).map(([id]) => factions[id]).filter(Boolean);
      if (enemies.length === 0) return false;
      const f2 = enemies[Math.floor(Math.random() * enemies.length)];
      const neutral = alive.find(f => f.id !== f1.id && f.id !== f2.id && !f1.relations[f.id]?.war && !f2.relations[f.id]?.war && f.regions.length > 0);
      if (!neutral) return false;
      const region = regions.find(r => r.owner === neutral.id);
      if (!region) return false;
      return { faction1: f1.id, faction2: f2.id, region: region.id, neutral: neutral.id };
    },
    execute: (engine, { faction1, faction2, region, neutral }) => {
      const f1 = engine.factions[faction1], f2 = engine.factions[faction2], n = engine.factions[neutral];
      f1.economy -= 20; f2.economy -= 20;
      if (n) n.economy -= 15; n.population -= 10;
      const r = engine.regions.find(x => x.id === region);
      return `🔥 PROXY WAR! ${f1?.name || 'Unknown'} and ${f2?.name || 'Unknown'} are fighting a proxy war in ${r?.name || 'Unknown'}! ${n?.name || 'Unknown'} is caught in the middle!`;
    },
  },
  {
    id: 'nuclear_escalation',
    name: 'Nuclear Escalation',
    description: 'Nuclear tensions between {faction1} and {faction2} reach a fever pitch!',
    condition: (factions) => {
      const nuclear = Object.values(factions).filter(f => f.alive && f._nuclearProgram?.progress >= 100);
      if (nuclear.length < 2) return false;
      const f1 = nuclear[Math.floor(Math.random() * nuclear.length)];
      const enemies = Object.values(factions).filter(f => f.alive && f._nuclearProgram?.progress >= 100 && f.id !== f1.id);
      if (enemies.length === 0) return false;
      const f2 = enemies[Math.floor(Math.random() * enemies.length)];
      return { faction1: f1.id, faction2: f2.id };
    },
    execute: (engine, { faction1, faction2 }) => {
      const f1 = engine.factions[faction1], f2 = engine.factions[faction2];
      if (f1) f1.economy -= 50;
      if (f2) f2.economy -= 50;
      for (const f of Object.values(engine.factions)) {
        if (f.alive && f.id !== faction1 && f.id !== faction2) {
          f.economy -= 20;
          f.population -= 5;
        }
      }
      return `☢️ NUCLEAR ESCALATION! ${f1?.name || 'Unknown'} and ${f2?.name || 'Unknown'} are on the brink! Global panic ensues!`;
    },
  },
  {
    id: 'assassination',
    name: 'Political Assassination',
    description: 'The leader of {faction} has been assassinated!',
    condition: (factions) => {
      const alive = Object.values(factions).filter(f => f.alive && f.regions.length > 0);
      if (alive.length === 0) return false;
      const target = alive[Math.floor(Math.random() * alive.length)];
      return { faction: target.id };
    },
    execute: (engine, { faction }) => {
      const f = engine.factions[faction];
      if (!f || !f.alive) return null;
      f.economy = Math.max(0, f.economy - 40);
      f.military.army = Math.max(0, f.military.army - 20);
      f.military.air = Math.max(0, f.military.air - 10);
      f.population = Math.max(0, f.population - 15);
      return `🗡️ ASSASSINATION! The leader of ${f.name} has been assassinated! The nation is in chaos!`;
    },
  },
  {
    id: 'refugee_crisis',
    name: 'Massive Refugee Crisis',
    description: 'Refugees from war-torn regions flood into {faction}!',
    condition: (factions, regions) => {
      const atWars = Object.values(factions).filter(f => f.alive && Object.values(f.relations).some(r => r.war));
      if (atWars.length === 0) return false;
      const closestNeutral = Object.values(factions).find(f =>
        f.alive && !Object.values(f.relations).some(r => r.war) && f.regions.length > 0
      );
      if (!closestNeutral) return false;
      return { faction: closestNeutral.id, source: atWars[0].id };
    },
    execute: (engine, { faction, source }) => {
      const f = engine.factions[faction], s = engine.factions[source];
      if (!f) return null;
      f.population += 30;
      f.economy = Math.max(0, f.economy - 25);
      return `🚶 REFUGEE CRISIS! Millions flee the war in ${s?.name || 'Unknown'}, flooding into ${f.name}!`;
    },
  },
  {
    id: 'ethnic_conflict',
    name: 'Ethnic Conflict',
    description: 'Ethnic tensions explode into violence in {region}!',
    condition: (factions, regions) => {
      const alive = Object.values(factions).filter(f => f.alive && f.regions.length > 0);
      if (alive.length < 2) return false;
      const multi = alive.filter(f => f.regions.length >= 2);
      if (multi.length === 0) return false;
      const f = multi[Math.floor(Math.random() * multi.length)];
      const region = regions.find(r => r.owner === f.id);
      if (!region) return false;
      return { faction: f.id, region: region.id };
    },
    execute: (engine, { faction, region }) => {
      const f = engine.factions[faction];
      const r = engine.regions.find(x => x.id === region);
      if (!f) return null;
      f.population = Math.max(0, f.population - 20);
      f.economy = Math.max(0, f.economy - 20);
      f.military.army = Math.max(0, f.military.army - 15);
      return `💥 ETHNIC CONFLICT! Violence erupts in ${r?.name || 'Unknown'}! ${f.name} is torn apart!`;
    },
  },
  {
    id: 'oil_crisis',
    name: 'Global Oil Crisis',
    description: 'Oil prices skyrocket worldwide!',
    condition: (factions, regions) => {
      const alive = Object.values(factions).filter(f => f.alive);
      if (alive.length < 3) return false;
      return true;
    },
    execute: (engine) => {
      for (const f of Object.values(engine.factions)) {
        if (!f.alive) continue;
        f.economy = Math.max(0, f.economy - 30);
      }
      return '⛽ GLOBAL OIL CRISIS! Oil prices have skyrocketed! Every nation\'s economy suffers!';
    },
  },
  {
    id: 'peace_treaty',
    name: 'Grand Peace Treaty',
    description: '{faction1} and {faction2} sign a historic peace treaty!',
    condition: (factions) => {
      const alive = Object.values(factions).filter(f => f.alive);
      const atWar = alive.filter(f => Object.values(f.relations).some(r => r.war));
      if (atWar.length < 2) return false;
      const f1 = atWar[Math.floor(Math.random() * atWar.length)];
      const enemies = Object.entries(f1.relations).filter(([, r]) => r.war).map(([id]) => factions[id]).filter(Boolean);
      if (enemies.length === 0) return false;
      const f2 = enemies[Math.floor(Math.random() * enemies.length)];
      if (Math.random() > 0.2) return false;
      return { faction1: f1.id, faction2: f2.id };
    },
    execute: (engine, { faction1, faction2 }) => {
      const f1 = engine.factions[faction1], f2 = engine.factions[faction2];
      if (f1 && f1.relations[faction2]) f1.relations[faction2].war = false;
      if (f2 && f2.relations[faction1]) f2.relations[faction1].war = false;
      for (const f of Object.values(engine.factions)) {
        if (f.alive && f.relations[faction1]?.alliance && f.relations[faction2]?.war) {
          f.relations[faction2].war = false;
        }
        if (f.alive && f.relations[faction2]?.alliance && f.relations[faction1]?.war) {
          f.relations[faction1].war = false;
        }
      }
      return `🕊️ PEACE TREATY! ${f1?.name || 'Unknown'} and ${f2?.name || 'Unknown'} sign a historic peace treaty! The world celebrates!`;
    },
  },
  {
    id: 'espionage_scandal',
    name: 'Massive Espionage Scandal',
    description: 'Massive spy ring uncovered in {faction}!',
    condition: (factions) => {
      const alive = Object.values(factions).filter(f => f.alive);
      const withSpies = alive.filter(f => f._spies && Object.keys(f._spies).length > 0);
      if (withSpies.length === 0) return false;
      const target = withSpies[Math.floor(Math.random() * withSpies.length)];
      const spyVictims = Object.keys(target._spies);
      if (spyVictims.length === 0) return false;
      return { faction: target.id, victim: spyVictims[Math.floor(Math.random() * spyVictims.length)] };
    },
    execute: (engine, { faction, victim }) => {
      const f = engine.factions[faction], v = engine.factions[victim];
      if (!f || !v) return null;
      if (f.relations[victim]) f.relations[victim].trust = Math.max(0, f.relations[victim].trust - 0.5);
      if (v.relations[faction]) v.relations[faction].trust = Math.max(0, v.relations[faction].trust - 0.3);
      if (f._spies) delete f._spies[victim];
      f.economy = Math.max(0, f.economy - 20);
      return `🕵️ ESPIONAGE SCANDAL! ${f.name} caught running spy networks against ${v.name}! Diplomatic crisis!`;
    },
  },
  {
    id: 'military_coup',
    name: 'Military Coup',
    description: 'The military has seized power in {faction}!',
    condition: (factions) => {
      const alive = Object.values(factions).filter(f => f.alive && f.regions.length > 0);
      if (alive.length === 0) return false;
      const largeArmies = alive.filter(f => f.military.army > 300);
      if (largeArmies.length === 0) return false;
      const target = largeArmies[Math.floor(Math.random() * largeArmies.length)];
      return { faction: target.id };
    },
    execute: (engine, { faction }) => {
      const f = engine.factions[faction];
      if (!f || !f.alive) return null;
      f.military.army += 50;
      f.military.air += 20;
      f.economy = Math.max(0, f.economy - 60);
      f.population = Math.max(0, f.population - 20);
      for (const f2 of Object.values(engine.factions)) {
        if (f2.alive && f2.id !== faction) {
          if (f2.relations[faction]) f2.relations[faction].trust = Math.max(0, f2.relations[faction].trust - 0.3);
        }
      }
      return `🎖️ MILITARY COUP! The army has seized control of ${f.name}! The world watches nervously!`;
    },
  },
  {
    id: 'coalition_formation',
    name: 'Grand Coalition Formed',
    description: '{faction1} and {faction2} form a powerful coalition!',
    condition: (factions) => {
      const alive = Object.values(factions).filter(f => f.alive);
      const friendly = alive.filter(f =>
        f.alive && Object.values(f.relations).some(r => r.alliance) && f.regions.length > 0
      );
      if (friendly.length < 2) return false;
      const f1 = friendly[Math.floor(Math.random() * friendly.length)];
      const allies = Object.entries(f1.relations).filter(([, r]) => r.alliance).map(([id]) => factions[id]).filter(Boolean);
      if (allies.length === 0) return false;
      const f2 = allies[Math.floor(Math.random() * allies.length)];
      return { faction1: f1.id, faction2: f2.id };
    },
    execute: (engine, { faction1, faction2 }) => {
      const f1 = engine.factions[faction1], f2 = engine.factions[faction2];
      if (!f1 || !f2) return null;
      f1.military.army += 30;
      f2.military.army += 30;
      f1.economy += 20;
      f2.economy += 20;
      return `🤝 GRAND COALITION! ${f1.name} and ${f2.name} announce a powerful military coalition!`;
    },
  },
  {
    id: 'pandemic',
    name: 'Deadly Pandemic',
    description: 'A deadly virus spreads across the continent!',
    condition: (factions) => {
      const alive = Object.values(factions).filter(f => f.alive);
      return alive.length >= 3;
    },
    execute: (engine) => {
      let count = 0;
      for (const f of Object.values(engine.factions)) {
        if (!f.alive) continue;
        f.population = Math.max(0, f.population - 30);
        f.economy = Math.max(0, f.economy - 35);
        f.military.army = Math.max(0, f.military.army - 20);
        count++;
      }
      return `🦠 PANDEMIC! A deadly virus sweeps across Europe! ${count} nations affected!`;
    },
  },
  {
    id: 'arms_race',
    name: 'Massive Arms Race',
    description: '{faction1} and {faction2} begin an intense arms race!',
    condition: (factions) => {
      const alive = Object.values(factions).filter(f => f.alive && f.regions.length > 0 && f.military.army > 100);
      if (alive.length < 2) return false;
      const rivals = [];
      for (const f of alive) {
        for (const [id, rel] of Object.entries(f.relations)) {
          if (rel.opinion < -20 && rel.trust < 0.3 && alive.some(a => a.id === id)) {
            rivals.push({ f1: f.id, f2: id });
          }
        }
      }
      if (rivals.length === 0) return false;
      const pair = rivals[Math.floor(Math.random() * rivals.length)];
      return { faction1: pair.f1, faction2: pair.f2 };
    },
    execute: (engine, { faction1, faction2 }) => {
      const f1 = engine.factions[faction1], f2 = engine.factions[faction2];
      if (!f1 || !f2) return null;
      f1.military.army += Math.floor(30 + Math.random() * 50);
      f1.economy = Math.max(0, f1.economy - 40);
      f2.military.army += Math.floor(30 + Math.random() * 50);
      f2.economy = Math.max(0, f2.economy - 40);
      for (const f of Object.values(engine.factions)) {
        if (f.alive && f.id !== faction1 && f.id !== faction2) {
          f.military.army += 10;
        }
      }
      return `🏭 ARMS RACE! ${f1.name} and ${f2.name} begin a massive military buildup! The continent arms itself!`;
    },
  },
  {
    id: 'border_skirmish',
    name: 'Border Skirmish',
    description: 'Border clash between {faction1} and {faction2}!',
    condition: (factions, regions) => {
      const alive = Object.values(factions).filter(f => f.alive && f.regions.length > 0);
      const neighbors = [];
      for (const f of alive) {
        const fRegions = regions.filter(r => r.owner === f.id);
        for (const r of fRegions) {
          const neighborOwners = new Set(r.neighbors.map(n => regions.find(rr => rr.id === n)?.owner).filter(Boolean));
          for (const nId of neighborOwners) {
            if (nId !== f.id && alive.some(a => a.id === nId)) {
              neighbors.push({ f1: f.id, f2: nId });
            }
          }
        }
      }
      if (neighbors.length === 0) return false;
      const pair = neighbors[Math.floor(Math.random() * neighbors.length)];
      if (factions[pair.f1]?.relations[pair.f2]?.war) return false;
      return { faction1: pair.f1, faction2: pair.f2 };
    },
    execute: (engine, { faction1, faction2 }) => {
      const f1 = engine.factions[faction1], f2 = engine.factions[faction2];
      if (!f1 || !f2) return null;
      f1.military.army = Math.max(0, f1.military.army - 15);
      f2.military.army = Math.max(0, f2.military.army - 15);
      if (f1.relations[faction2]) f1.relations[faction2].opinion -= 20;
      if (f2.relations[faction1]) f2.relations[faction1].opinion -= 20;
      return `💢 BORDER SKIRMISH! Troops clash on the ${f1.name}-${f2.name} border! Tensions rise!`;
    },
  },
  {
    id: 'humanitarian_crisis',
    name: 'Humanitarian Crisis',
    description: 'A humanitarian catastrophe unfolds in {faction}!',
    condition: (factions) => {
      const lowPop = Object.values(factions).filter(f => f.alive && f.population < 50 && f.regions.length > 0);
      if (lowPop.length === 0) return false;
      const f = lowPop[Math.floor(Math.random() * lowPop.length)];
      return { faction: f.id };
    },
    execute: (engine, { faction }) => {
      const f = engine.factions[faction];
      if (!f) return null;
      f.population = Math.max(0, f.population - 20);
      f.economy = Math.max(0, f.economy - 20);
      return `🚨 HUMANITARIAN CRISIS! ${f.name} faces a catastrophic humanitarian situation! International aid urgently needed!`;
    },
  },
  {
    id: 'terrorist_network',
    name: 'Terrorist Network',
    description: 'A powerful terrorist network emerges in {faction}!',
    condition: (factions, regions) => {
      const alive = Object.values(factions).filter(f => f.alive && f.regions.length > 0);
      const unstable = alive.filter(f => f.regions.length <= 2);
      if (unstable.length === 0) return false;
      const f = unstable[Math.floor(Math.random() * unstable.length)];
      return { faction: f.id };
    },
    execute: (engine, { faction }) => {
      const f = engine.factions[faction];
      if (!f || !f.alive) return null;
      f.population = Math.max(0, f.population - 15);
      f.economy = Math.max(0, f.economy - 25);
      for (const f2 of Object.values(engine.factions)) {
        if (f2.alive && f2.id !== faction) {
          f2.economy = Math.max(0, f2.economy - 10);
        }
      }
      return `💣 TERRORIST NETWORK! A shadowy terrorist organization establishes itself in ${f?.name || 'Unknown'}! Global security threat!`;
    },
  },
  {
    id: 'golden_age',
    name: 'Golden Age',
    description: 'An era of unprecedented peace and prosperity dawns in {faction}!',
    condition: (factions, regions) => {
      const atPeace = Object.values(factions).filter(f =>
        f.alive && !Object.values(f.relations).some(r => r.war) && f.regions.length > 0
      );
      if (atPeace.length === 0) return false;
      const f = atPeace[Math.floor(Math.random() * atPeace.length)];
      return { faction: f.id };
    },
    execute: (engine, { faction }) => {
      const f = engine.factions[faction];
      if (!f) return null;
      f.economy += 80;
      f.population += 30;
      f.military.tech = Math.min(1, (f.military.tech || 0) + 0.1);
      return `🌟 GOLDEN AGE! ${f.name} enters an era of unprecedented prosperity and cultural flowering!`;
    },
  },
];

function getRandomEvent(log) {
  if (Math.random() > 0.15) return null;
  const available = RANDOM_EVENTS.filter(e => !log.includes(e.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function getDynamicEvent(factions, regions) {
  const candidates = DYNAMIC_EVENTS.filter(e => {
    try {
      return e.condition(factions, regions) !== false;
    } catch { return false; }
  });
  if (candidates.length === 0) return null;
  const event = candidates[Math.floor(Math.random() * candidates.length)];
  const data = event.condition(factions, regions);
  return { event, data };
}

module.exports = { RANDOM_EVENTS, getRandomEvent, DYNAMIC_EVENTS, getDynamicEvent };
