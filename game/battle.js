const { getDoctrineBonuses } = require('./doctrines');

function resolveBattle(attacker, defender, attRegion, defRegion, factions) {
  const attDoctrine = getDoctrineBonuses(attacker);
  const defDoctrine = getDoctrineBonuses(defender);

  const attPower = factions[attacker].getTotalMilitaryPower() * (0.8 + Math.random() * 0.4);
  const defPower = factions[defender].getTotalMilitaryPower() * (0.9 + Math.random() * 0.5);

  const attBonus = factions[attacker].personality.bravery * 1.2;
  const defBonus = factions[defender].personality.bravery * 1.2 + 0.3;

  const attDoctrineMult = attDoctrine.bonuses.attackMultiplier;
  const defDoctrineMult = defDoctrine.bonuses.defenseMultiplier;

  const attScore = attPower * (1 + attBonus * 0.2) * attDoctrineMult;
  const defScore = defPower * (1 + defBonus * 0.2) * defDoctrineMult;

  const attLoss = Math.floor(attPower * (0.1 + Math.random() * 0.25) * (1 - attDoctrine.bonuses.unitCostReduction * 0.3));
  const defLoss = Math.floor(defPower * (0.15 + Math.random() * 0.35) * (1 - defDoctrine.bonuses.unitCostReduction * 0.3));

  factions[attacker].military.army = Math.max(0, factions[attacker].military.army - attLoss);
  factions[defender].military.army = Math.max(0, factions[defender].military.army - defLoss);

  if (attScore > defScore) {
    const survivorChance = Math.random();
    if (survivorChance < 0.15 && factions[defender].alive) {
      factions[defender].alive = false;
      return {
        winner: attacker,
        loser: defender,
        capturedRegion: defRegion,
        attLoss, defLoss,
        conquered: true,
        factionDestroyed: true,
        message: `💀 ${factions[attacker].name} has CONQUERED ${factions[defender].name}! ${factions[defender].name} is no more!`,
        attDoctrine: attDoctrine.doctrineId,
        defDoctrine: defDoctrine.doctrineId,
      };
    }
    return {
      winner: attacker,
      loser: defender,
      capturedRegion: defRegion,
      attLoss, defLoss,
      conquered: true,
      factionDestroyed: false,
      message: `⚔️ ${factions[attacker].name} captured ${defRegion} from ${factions[defender].name}! [${attDoctrine.doctrine.name} > ${defDoctrine.doctrine.name}]`,
      attDoctrine: attDoctrine.doctrineId,
      defDoctrine: defDoctrine.doctrineId,
    };
  } else {
    if (Math.random() < 0.05 && factions[attacker].alive) {
      factions[attacker].alive = false;
      return {
        winner: defender,
        loser: attacker,
        capturedRegion: attRegion,
        attLoss, defLoss,
        conquered: true,
        factionDestroyed: true,
        message: `💀 ${factions[defender].name} COUNTER-ATTACKED and DESTROYED ${factions[attacker].name}! ${factions[attacker].name} is no more!`,
        attDoctrine: attDoctrine.doctrineId,
        defDoctrine: defDoctrine.doctrineId,
      };
    }
    return {
      winner: defender,
      loser: attacker,
      capturedRegion: null,
      attLoss, defLoss,
      conquered: false,
      factionDestroyed: false,
      message: `🛡️ ${factions[defender].name} REPELLED ${factions[attacker].name}'s attack on ${defRegion}! [${defDoctrine.doctrine.name} > ${attDoctrine.doctrine.name}]`,
      attDoctrine: attDoctrine.doctrineId,
      defDoctrine: defDoctrine.doctrineId,
    };
  }
}

module.exports = { resolveBattle };
