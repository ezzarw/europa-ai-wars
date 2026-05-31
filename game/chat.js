const CHAT_ACTS = {
  greetings: ['GREETS', 'ADDRESSES', 'CONTACTS'],
  threat: ['WARNS', 'THREATENS', 'DEMANDS'],
  alliance_offer: ['PROPOSES', 'OFFERS', 'INVITES'],
  war_declaration: ['DECLARES', 'ANNOUNCES', 'PROCLAIMS'],
  insult: ['INSULTS', 'DENOUNCES'],
  praise: ['PRAISES', 'COMMENDS'],
  desperate_plea: ['CONTACTS', 'WARNS'],
  victory_gloat: ['ANNOUNCES', 'REPORTS'],
  betrayal: ['SCHEMES', 'CONDemNS'.toUpperCase()],
  trade_offer: ['PROPOSES TRADE', 'OFFERS TRADE'],
};

const DOCTRINE_STYLE = {
  western: {
    weapon: ['precision strikes', 'rapid response forces', 'air superiority'],
    value: ['efficiency', 'initiative', 'technology'],
  },
  european: {
    weapon: ['defensive lines', 'combined brigades', 'fortified positions'],
    value: ['discipline', 'stability', 'coordination'],
  },
  eastern: {
    weapon: ['mass formations', 'heavy artillery', 'armored columns'],
    value: ['endurance', 'strategic depth', 'strength'],
  },
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function powerRatio(sender, receiver) {
  const receiverPower = Math.max(1, receiver.getTotalMilitaryPower());
  return sender.getTotalMilitaryPower() / receiverPower;
}

function stanceFromPersonality(personality) {
  const aggression = personality.aggression || 0.5;
  const diplomacy = personality.diplomacy || 0.5;
  if (aggression > 0.7) return 'hardline';
  if (diplomacy > 0.7) return 'diplomatic';
  return 'pragmatic';
}

function chooseAct(type, personality) {
  const acts = CHAT_ACTS[type] || CHAT_ACTS.greetings;
  return pick(acts);
}

function dynamicQuote(type, sender, receiver, personality) {
  const ratio = powerRatio(sender, receiver);
  const senderDoctrine = sender.doctrineId || 'european';
  const doctrine = DOCTRINE_STYLE[senderDoctrine] || DOCTRINE_STYLE.european;
  const weapon = pick(doctrine.weapon);
  const value = pick(doctrine.value);

  const lines = [];

  if (type === 'victory_gloat') {
    lines.push(`Military objectives in ${receiver.name} territory have been achieved.`);
    lines.push(`The front line has moved; our ${weapon} has proven effective.`);
  } else if (type === 'threat' || type === 'war_declaration') {
    lines.push(`Hostilities are commencing; our ${weapon} is being deployed.`);
    lines.push(`Strategic interests require immediate military action.`);
  } else if (type === 'alliance_offer') {
    lines.push(`A formal alliance between ${sender.name} and ${receiver.name} is proposed.`);
    lines.push(`Cooperation based on shared ${value} will benefit both nations.`);
  } else if (type === 'betrayal') {
    lines.push(`Previous agreements with ${receiver.name} are no longer valid.`);
    lines.push(`National interests dictate a change in our diplomatic stance.`);
  } else if (type === 'trade_offer') {
    lines.push(`We propose an exchange of resources to support our industries.`);
    lines.push(`Trade relations will strengthen our respective economies.`);
  } else {
    lines.push(`${sender.name} is monitoring the current situation.`);
    lines.push(`Diplomatic channels remain open for discussion.`);
  }

  return pick(lines);
}

class ChatSystem {
  constructor() {
    this.messages = [];
    this.conversations = {};
  }

  sendMessage(senderId, receiverId, text, type = 'chat') {
    const msg = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sender: senderId,
      receiver: receiverId,
      text,
      type,
      timestamp: Date.now(),
    };
    this.messages.push(msg);

    const convKey = [senderId, receiverId].sort().join('_');
    if (!this.conversations[convKey]) {
      this.conversations[convKey] = [];
    }
    this.conversations[convKey].push(msg);

    return msg;
  }

  generateAIMessage(sender, receiver, personality, forcedType = null, customQuote = null) {
    const aggression = personality.aggression || 0.5;
    const diplomacy = personality.diplomacy || 0.5;
    const relations = sender.relations[receiver.id];

    let type = forcedType;

    if (!type) {
      if (relations?.war) {
        type = sender.getTotalMilitaryPower() > receiver.getTotalMilitaryPower() * 1.5 ? 'victory_gloat' : 'threat';
      } else if (relations?.alliance) {
        type = 'greetings';
      } else if (aggression > 0.6 && Math.random() < 0.2) {
        type = 'threat';
      } else if (diplomacy > 0.6 && Math.random() < 0.3) {
        type = 'alliance_offer';
      } else {
        type = 'greetings';
      }
    }

    const act = chooseAct(type, personality);
    const quote = customQuote || dynamicQuote(type, sender, receiver, personality);
    
    return `${sender.name} ${act} ${receiver.name}: "${quote}"`;
  }

  getConversation(factionId1, factionId2, limit = 20) {
    const convKey = [factionId1, factionId2].sort().join('_');
    const msgs = this.conversations[convKey] || [];
    return msgs.slice(-limit);
  }

  getAllMessagesForFaction(factionId, limit = 30) {
    return this.messages
      .filter(m => m.sender === factionId || m.receiver === factionId)
      .slice(-limit);
  }

  cleanup() {
    if (this.messages.length > 500) {
      this.messages = this.messages.slice(-400);
    }
  }
}

module.exports = { ChatSystem };
