const { SEA_CONNECTIONS } = require('./map');
const cfg = require('./config');

class MovementQueue {
  constructor(engine) {
    this.engine = engine;
    this.orders = [];
    this.nextId = 1;
  }

  addOrder(factionId, fromRegionId, toRegionId, amount) {
    const path = this.findPath(fromRegionId, toRegionId, factionId);
    if (!path || path.length < 2) {
      return { error: 'No path found between regions' };
    }
    const id = `mq_${Date.now()}_${this.nextId++}`;
    const order = { id, factionId, fromRegionId, toRegionId, amount, path, step: 0, done: 0 };
    this.orders.push(order);
    return { success: true, orderId: id, path, steps: path.length - 1 };
  }

  getOrders(factionId) {
    return this.orders.filter(o => o.factionId === factionId).map(o => ({
      id: o.id,
      from: o.fromRegionId,
      to: o.toRegionId,
      total: o.amount,
      done: o.done,
      remaining: o.amount - o.done,
      progress: `${o.step}/${o.path.length - 1}`,
    }));
  }

  processTick() {
    const speed = cfg.TROOP_TRANSFER_SPEED || 50;
    const completed = [];

    for (let i = this.orders.length - 1; i >= 0; i--) {
      const order = this.orders[i];
      const faction = this.engine.factions[order.factionId];
      if (!faction || !faction.alive) {
        completed.push({ ...order, reason: 'faction_destroyed' });
        this.orders.splice(i, 1);
        continue;
      }

      const remaining = order.amount - order.done;
      if (remaining <= 0) {
        completed.push({ ...order, reason: 'completed' });
        this.orders.splice(i, 1);
        continue;
      }

      if (order.step >= order.path.length - 1) {
        completed.push({ ...order, reason: 'completed' });
        this.orders.splice(i, 1);
        continue;
      }

      const moveAmt = Math.min(speed, remaining);
      const result = this.moveStep(order, moveAmt, faction);
      if (result.error) {
        completed.push({ ...order, reason: result.error });
        this.orders.splice(i, 1);
        continue;
      }
      order.done += result.moved;
    }

    return completed;
  }

  moveStep(order, amount, faction) {
    const currentId = order.path[order.step];
    const nextId = order.path[order.step + 1];
    const current = this.engine.regions.find(r => r.id === currentId);
    const next = this.engine.regions.find(r => r.id === nextId);

    if (!current || !next) return { moved: 0, error: 'path region not found' };
    if (current.owner !== faction.id) return { moved: 0, error: `lost control of ${current.name}` };

    const available = current.troops || 0;
    const moveCount = Math.min(amount, available);
    if (moveCount <= 0) return { moved: 0, error: `no troops left in ${current.name}` };

    if (next.owner !== faction.id) {
      const rel = faction.relations[next.owner];
      if (!rel || !rel.alliance || !rel.militaryAccess) {
        return { moved: 0, error: `military access denied through ${next.name}` };
      }
      if (rel.war) return { moved: 0, error: `at war with ${next.owner}, access revoked` };
    }

    if (this.isSeaStep(currentId, nextId)) {
      const navyNeeded = Math.max(1, Math.ceil(moveCount / (cfg.TROOPS_PER_NAVY || 100)));
      if ((faction.military.navy || 0) < navyNeeded) {
        return { moved: 0, error: `need ${navyNeeded} navy for sea crossing, have ${faction.military.navy || 0}` };
      }
      faction.military.navy -= navyNeeded;
    }

    current.troops = Math.max(0, (current.troops || 0) - moveCount);
    next.troops = (next.troops || 0) + moveCount;
    order.step++;

    return { moved: moveCount };
  }

  isSeaStep(fromId, toId) {
    const fSeas = SEA_CONNECTIONS[fromId];
    const tSeas = SEA_CONNECTIONS[toId];
    return fSeas && tSeas && fSeas.some(sz => tSeas.includes(sz));
  }

  getAdjacentRegions(regionId, factionId) {
    const results = [];
    const region = this.engine.regions.find(r => r.id === regionId);
    if (!region) return results;

    // Land neighbors
    for (const nId of region.neighbors) {
      if (this.canEnter(nId, factionId)) results.push(nId);
    }

    // Sea-connected (share a sea zone)
    const faction = this.engine.factions[factionId];
    const mySeas = SEA_CONNECTIONS[regionId];
    if (faction && mySeas && (faction.military.navy || 0) > 0) {
      for (const [rId, seaZones] of Object.entries(SEA_CONNECTIONS)) {
        if (rId === regionId || results.includes(rId)) continue;
        if (seaZones.some(sz => mySeas.includes(sz)) && this.canEnter(rId, factionId)) {
          results.push(rId);
        }
      }
    }

    return results;
  }

  canEnter(regionId, factionId) {
    const region = this.engine.regions.find(r => r.id === regionId);
    if (!region) return false;
    const faction = this.engine.factions[factionId];
    if (!faction) return false;
    if (region.owner === factionId) return true;
    const rel = faction.relations[region.owner];
    return rel && rel.alliance && rel.militaryAccess && !rel.war;
  }

  findPath(fromId, toId, factionId) {
    if (fromId === toId) return [fromId];
    const visited = new Set([fromId]);
    const queue = [[fromId]];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      if (current === toId) return path;

      for (const nId of this.getAdjacentRegions(current, factionId)) {
        if (!visited.has(nId)) {
          visited.add(nId);
          queue.push([...path, nId]);
        }
      }
    }

    return null;
  }

  withdrawRemaining(factionId) {
    const pending = [];
    for (let i = this.orders.length - 1; i >= 0; i--) {
      if (this.orders[i].factionId === factionId) {
        pending.push(this.orders.splice(i, 1)[0]);
      }
    }
    return pending;
  }
}

module.exports = { MovementQueue };
